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
    internalReview: 'Redoubt:datasets:internalReview'
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

test.describe('discovery shortlist review states', () => {
    test('persists internal review state and routes clarification into negotiation history', async ({ page }) => {
        await seedParticipantSession(page)
        await page.goto('/datasets')

        const climateCard = page.getByRole('article', { name: 'Dataset card for Global Climate Observations 2020-2024' })
        const shortlistRegion = page.getByRole('region', { name: 'Review priority set' })
        const compareRegion = page.getByRole('region', { name: 'Review opportunities side by side' })

        await climateCard
            .getByRole('button', { name: 'Add Global Climate Observations 2020-2024 to shortlist' })
            .evaluate((node: HTMLElement) => node.click())

        const stateSelect = shortlistRegion.getByLabel(
            'Set internal review state for Global Climate Observations 2020-2024'
        )

        await expect(stateSelect).toHaveValue('shortlisted')
        await stateSelect.selectOption('awaiting_provider_clarification')

        await expect(
            shortlistRegion.locator('span').filter({ hasText: 'Awaiting provider clarification' }).first()
        ).toBeVisible()
        await expect(
            shortlistRegion.getByRole('link', { name: 'Open clarification history' })
        ).toHaveAttribute('href', /\/deals\/DL-1001\/negotiation$/)

        await shortlistRegion
            .getByRole('button', { name: 'Add Global Climate Observations 2020-2024 to compare' })
            .click()

        await expect(compareRegion.getByText('Awaiting clarification')).toBeVisible()
        await expect(
            compareRegion.getByRole('link', { name: 'Open clarification history' })
        ).toHaveAttribute('href', /\/deals\/DL-1001\/negotiation$/)

        await expect.poll(async () => {
            return await page.evaluate(({ shortlist, internalReview }) => ({
                shortlist: window.localStorage.getItem(shortlist),
                internalReview: window.localStorage.getItem(internalReview)
            }), datasetStorageKeys)
        }).toEqual({
            shortlist: '[1]',
            internalReview: '{"1":"awaiting_provider_clarification"}'
        })

        await page.reload()

        const reloadedShortlistRegion = page.getByRole('region', { name: 'Review priority set' })
        await expect(
            reloadedShortlistRegion.locator('span').filter({ hasText: 'Awaiting provider clarification' }).first()
        ).toBeVisible()

        await reloadedShortlistRegion.getByRole('link', { name: 'Open clarification history' }).click()
        await expect(page).toHaveURL(/\/deals\/DL-1001\/negotiation$/)
        await expect(page.getByRole('heading', { name: 'Clarification & Negotiation History' })).toBeVisible()
    })
})
