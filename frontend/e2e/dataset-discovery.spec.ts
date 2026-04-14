import { expect, test, type Page } from '@playwright/test'

const authStorageKeys = {
    accessStatus: 'Redoubt:accessStatus',
    isAuthenticated: 'Redoubt:isAuthenticated',
    onboardingInitiated: 'Redoubt:onboardingInitiated',
    applicantEmail: 'Redoubt:applicantEmail',
    isAdmin: 'Redoubt:isAdmin',
    workspaceRole: 'Redoubt:workspaceRole'
} as const

const datasetStorageKeys = {
    shortlist: 'Redoubt:datasets:shortlist',
    compare: 'Redoubt:datasets:compare'
} as const

async function seedParticipantSession(page: Page) {
    await page.goto('/')
    await page.evaluate((keys) => {
        window.localStorage.clear()
        window.localStorage.setItem(keys.accessStatus, 'approved')
        window.localStorage.setItem(keys.isAuthenticated, 'true')
        window.localStorage.setItem(keys.onboardingInitiated, 'false')
        window.localStorage.setItem(keys.applicantEmail, 'ops@northwindresearch.com')
        window.localStorage.setItem(keys.isAdmin, 'false')
        window.localStorage.setItem(keys.workspaceRole, 'buyer')
    }, authStorageKeys)
    await page.reload()
}

async function expectDatasetDiscoveryShell(page: Page, viewportWidth: number) {
    const resultsRegion = page.getByRole('region', { name: 'Decision-ready results' })
    const shortlistRegion = page.getByRole('region', { name: 'Review priority set' })
    const firstDatasetCard = resultsRegion.getByRole('article').first()
    const secondDatasetCard = resultsRegion.getByRole('article').nth(1)

    await expect(resultsRegion).toBeVisible()
    await expect(shortlistRegion).toBeVisible()
    await expect(firstDatasetCard).toBeVisible()
    await expect(secondDatasetCard).toBeVisible()

    const resultsBox = await resultsRegion.boundingBox()
    const shortlistBox = await shortlistRegion.boundingBox()
    const firstCardBox = await firstDatasetCard.boundingBox()
    const secondCardBox = await secondDatasetCard.boundingBox()

    expect(resultsBox).not.toBeNull()
    expect(shortlistBox).not.toBeNull()
    expect(firstCardBox).not.toBeNull()
    expect(secondCardBox).not.toBeNull()

    if (!resultsBox || !shortlistBox || !firstCardBox || !secondCardBox) {
        throw new Error('Expected dataset discovery regions and cards to expose bounding boxes.')
    }

    expect(firstCardBox.width).toBeGreaterThanOrEqual(340)
    expect(shortlistBox.y).toBeGreaterThan(resultsBox.y + resultsBox.height)

    if (viewportWidth >= 1280) {
        expect(Math.abs(firstCardBox.y - secondCardBox.y)).toBeLessThanOrEqual(8)
        return
    }

    expect(secondCardBox.y).toBeGreaterThan(firstCardBox.y + firstCardBox.height)
}

test.describe('participant dataset discovery', () => {
    test('supports buyer filtering, sorting, empty-state reset, and detail routing', async ({ page }) => {
        await seedParticipantSession(page)
        const resultsRegion = page.getByRole('region', { name: 'Decision-ready results' })

        await page.goto('/datasets')

        await expect(page.getByRole('heading', { name: 'Curated Evaluation Opportunities' })).toBeVisible()
        await expect(page.getByText('Showing 8 of 8 datasets')).toBeVisible()

        await page.getByRole('button', { name: 'Filter domain Healthcare' }).click()
        await expect(page.getByRole('button', { name: 'Filter domain Healthcare' })).toHaveAttribute('aria-pressed', 'true')
        await expect(page.getByText('Showing 2 of 8 datasets')).toBeVisible()

        await page.getByLabel('Sort datasets').selectOption('most-recent')
        await expect(resultsRegion.locator('article[aria-label^="Dataset card for"]').first()).toContainText('Clinical Outcomes (De-identified)')

        await page.getByLabel('Sort datasets').selectOption('highest-confidence')
        await expect(resultsRegion.locator('article[aria-label^="Dataset card for"]').first()).toContainText('Genomics Research Dataset v2')

        await page.getByPlaceholder('Search by title, use case, domain, or confidence summary').fill('zzzz-no-match')
        await expect(page.getByText('No datasets match these filters')).toBeVisible()

        await page.getByRole('button', { name: 'Reset filters' }).first().click()
        await expect(page.getByText('Showing 8 of 8 datasets')).toBeVisible()

        await page.getByRole('link', { name: 'View details for Global Climate Observations 2020-2024' }).click()
        await expect(page).toHaveURL(/\/datasets\/1$/)
        await expect(page.getByRole('heading', { name: 'Global Climate Observations 2020-2024' })).toBeVisible()
    })

    test('persists shortlist and compare state across reloads and enforces the compare cap', async ({ page }) => {
        await seedParticipantSession(page)
        const globalClimateCard = page.getByRole('article', { name: 'Dataset card for Global Climate Observations 2020-2024' })
        const marketTickCard = page.getByRole('article', { name: 'Dataset card for Financial Market Tick Data' })
        const genomicsCard = page.getByRole('article', { name: 'Dataset card for Genomics Research Dataset v2' })
        const smartGridCard = page.getByRole('article', { name: 'Dataset card for Smart Grid Energy Patterns' })
        const shortlistRegion = page.getByRole('region', { name: 'Review priority set' })
        const compareRegion = page.getByRole('region', { name: 'Review opportunities side by side' })

        await page.goto('/datasets')
        await expect(page.getByText('Showing 8 of 8 datasets')).toBeVisible()

        await globalClimateCard.getByRole('button', { name: 'Add Global Climate Observations 2020-2024 to shortlist' }).evaluate((node: HTMLElement) => node.click())
        await globalClimateCard.getByRole('button', { name: 'Add Global Climate Observations 2020-2024 to compare' }).evaluate((node: HTMLElement) => node.click())
        await marketTickCard.getByRole('button', { name: 'Add Financial Market Tick Data to compare' }).evaluate((node: HTMLElement) => node.click())
        await genomicsCard.getByRole('button', { name: 'Add Genomics Research Dataset v2 to compare' }).evaluate((node: HTMLElement) => node.click())

        await expect(compareRegion.getByText('3 of 3 selected')).toBeVisible()
        await expect(smartGridCard.getByRole('button', { name: 'Add Smart Grid Energy Patterns to compare' })).toBeDisabled()
        await expect(shortlistRegion.getByText('Global Climate Observations 2020-2024')).toBeVisible()

        await expect.poll(async () => {
            return await page.evaluate(({ shortlist, compare }) => {
                return {
                    shortlist: window.localStorage.getItem(shortlist),
                    compare: window.localStorage.getItem(compare)
                }
            }, datasetStorageKeys)
        }).toEqual({
            shortlist: '[1]',
            compare: '[1,3,7]'
        })

        await page.reload()
        await expect(shortlistRegion.getByText('Global Climate Observations 2020-2024')).toBeVisible()
        await expect(compareRegion.getByText('Financial Market Tick Data').first()).toBeVisible()
        await expect(compareRegion.getByText('Genomics Research Dataset v2').first()).toBeVisible()
    })

    test('keeps the guidance workspace below results at 1280px without crushing dataset cards', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 1200 })
        await seedParticipantSession(page)

        await page.goto('/datasets')

        await expectDatasetDiscoveryShell(page, 1280)
    })

    test('keeps guidance below results and caps cards to two columns at 1536px', async ({ page }) => {
        await page.setViewportSize({ width: 1536, height: 1200 })
        await seedParticipantSession(page)

        await page.goto('/datasets')

        await expectDatasetDiscoveryShell(page, 1536)
    })

    test('keeps guidance below results and caps cards to two columns at 1920px', async ({ page }) => {
        await page.setViewportSize({ width: 1920, height: 1200 })
        await seedParticipantSession(page)

        await page.goto('/datasets')

        await expectDatasetDiscoveryShell(page, 1920)
    })

    test('keeps in-page anchors working after moving guidance panels below results', async ({ page }) => {
        await page.setViewportSize({ width: 1536, height: 1200 })
        await seedParticipantSession(page)

        await page.goto('/datasets')

        const shortlistRegion = page.getByRole('region', { name: 'Review priority set' })
        const compareRegion = page.getByRole('region', { name: 'Review opportunities side by side' })

        await page.getByRole('link', { name: 'Review priority set' }).first().click()
        await expect(shortlistRegion).toBeInViewport()

        await page.getByRole('link', { name: 'Open side-by-side review' }).click()
        await expect(compareRegion).toBeInViewport()
    })
})
