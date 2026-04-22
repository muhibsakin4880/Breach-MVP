import { expect, test, type Page } from '@playwright/test'

const authStorageKeys = {
    accessStatus: 'Redoubt:accessStatus',
    isAuthenticated: 'Redoubt:isAuthenticated',
    onboardingInitiated: 'Redoubt:onboardingInitiated',
    applicantEmail: 'Redoubt:applicantEmail',
    isAdmin: 'Redoubt:isAdmin',
    workspaceRole: 'Redoubt:workspaceRole'
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

test.describe('advanced output review states', () => {
    test('seeded deals expose extension, revocation, and dispute freeze states', async ({ page }) => {
        await seedParticipantSession(page)

        await page.goto('/deals/DL-1001/output-review')
        await expect(page.getByRole('heading', { name: 'Clean Room Output Review' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Extension request', exact: true })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Reviewer action summary' })).toBeVisible()
        await expect(page.getByText('Export review note', { exact: true })).toBeVisible()
        await expect(page.getByText('Extension request note', { exact: true })).toBeVisible()

        await page.goto('/deals/DL-1002/output-review')
        await expect(page.getByRole('heading', { name: 'Revoked session', exact: true })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Session intervention' })).toBeVisible()
        await expect(page.getByText('Revocation summary', { exact: true })).toBeVisible()

        await page.goto('/deals/DL-1003/output-review')
        await expect(page.getByRole('heading', { name: 'Dispute-triggered freeze', exact: true })).toBeVisible()
        await expect(page.getByText('Freeze summary', { exact: true })).toBeVisible()
    })

    test('checkout and enclave surfaces expose the enriched output-review handoff', async ({ page }) => {
        await seedParticipantSession(page)

        await page.goto('/datasets/1/escrow-checkout')

        await page.getByLabel(/I accept this DUA/i).check()
        await page.getByRole('button', { name: '1. Fund Escrow' }).click()
        await page.getByRole('button', { name: '2. Provision Workspace' }).click()
        await page.getByRole('button', { name: '3. Issue Scoped Credentials' }).click()

        await expect(page.getByText('Access is now live')).toBeVisible()
        await expect(page.getByText('Output review status')).toBeVisible()
        await expect(page.getByText('Export review note', { exact: true })).toBeVisible()
        await expect(page.getByRole('link', { name: 'Open Output Review' })).toBeVisible()

        await page.goto('/secure-enclave')

        await expect(page.getByRole('heading', { name: 'Linked output review' })).toBeVisible()
        await expect(page.getByRole('link', { name: 'Open active output review' })).toBeVisible()

        await page.getByRole('link', { name: 'Open active output review' }).click()

        await expect(page).toHaveURL(/\/deals\/DL-1001\/output-review$/)
    })
})
