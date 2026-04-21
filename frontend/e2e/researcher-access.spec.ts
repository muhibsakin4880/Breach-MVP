import { expect, test, type Page } from '@playwright/test'

const authStorageKeys = {
    accessStatus: 'Redoubt:accessStatus',
    isAuthenticated: 'Redoubt:isAuthenticated',
    onboardingInitiated: 'Redoubt:onboardingInitiated',
    applicantEmail: 'Redoubt:applicantEmail',
    isAdmin: 'Redoubt:isAdmin',
    workspaceRole: 'Redoubt:workspaceRole'
} as const

const researcherAccessStorageKey = 'Redoubt:researcherAccessDraft:v1'

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

test.describe('researcher access application', () => {
    test('renders the governed analyst application and connected review surfaces', async ({ page }) => {
        await seedParticipantSession(page)

        await page.goto('/researcher-access')

        await expect(page).toHaveURL(/\/researcher-access$/)
        await expect(page.getByRole('heading', { name: 'Researcher Access' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Named analyst request' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'What the reviewers will see' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'What access would actually look like' })).toBeVisible()
        const quickLinksPanel = page.locator('section').filter({
            has: page.getByRole('heading', { name: 'Open the connected surfaces' })
        }).first()
        await expect(quickLinksPanel.getByRole('link', { name: 'Evaluation dossier', exact: true })).toBeVisible()
        await expect(quickLinksPanel.getByRole('link', { name: 'Provider packet', exact: true })).toBeVisible()
    })

    test('persists the local access draft across reloads', async ({ page }) => {
        await seedParticipantSession(page)

        await page.goto('/researcher-access')

        const namedResearcherInput = page.locator('input[placeholder="A named analyst must be accountable for the session"]')
        const reviewerNoteInput = page.locator('textarea[placeholder="Optional context for privacy, legal, or governance reviewers."]')
        const jitWindowSelect = page.locator('select').nth(2)

        await namedResearcherInput.fill('Dr. Leena Park')
        await reviewerNoteInput.fill('Need aggregate-only export after reviewer signoff for resilience scoring.')
        await jitWindowSelect.selectOption({ label: '8 hours' })

        await expect.poll(async () => {
            return await page.evaluate((key) => window.localStorage.getItem(key), researcherAccessStorageKey)
        }).toContain('Dr. Leena Park')

        await page.reload()

        await expect(namedResearcherInput).toHaveValue('Dr. Leena Park')
        await expect(reviewerNoteInput).toHaveValue('Need aggregate-only export after reviewer signoff for resilience scoring.')
        await expect(jitWindowSelect).toHaveValue('8 hours')
    })
})
