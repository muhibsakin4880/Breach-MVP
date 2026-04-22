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

async function seedAdminSession(page: Page) {
    await page.goto('/')
    await page.evaluate((keys) => {
        window.localStorage.clear()
        window.localStorage.setItem(keys.accessStatus, 'approved')
        window.localStorage.setItem(keys.isAuthenticated, 'true')
        window.localStorage.setItem(keys.onboardingInitiated, 'false')
        window.localStorage.setItem(keys.applicantEmail, 'admin@redoubt.io')
        window.localStorage.setItem(keys.isAdmin, 'true')
        window.localStorage.setItem(keys.workspaceRole, 'buyer')
    }, authStorageKeys)
    await page.reload()
}

test.describe('unified approval artifact', () => {
    test('evaluation dossier links into the shared approval artifact', async ({ page }) => {
        await seedParticipantSession(page)

        await page.goto('/deals/DL-1002')
        await page.getByRole('link', { name: 'Open approval artifact' }).click()

        await expect(page).toHaveURL(/\/deals\/DL-1002\/approval$/)
        await expect(page.locator('h1', { hasText: 'Unified Approval & Signoff' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Named signoff lanes' })).toBeVisible()
        await expect(page.getByText('Privacy signoff', { exact: true })).toBeVisible()
        await expect(page.getByText('Legal signoff', { exact: true })).toBeVisible()
        await expect(page.getByText('Governance signoff', { exact: true })).toBeVisible()
        await expect(page.getByText('Provider signoff', { exact: true })).toBeVisible()
        await expect(page.getByText('Commercial signoff', { exact: true })).toBeVisible()
    })

    test('application review links into the admin-console approval view', async ({ page }) => {
        await seedAdminSession(page)

        await page.goto('/admin/application-review/APP-3390')
        await page.getByRole('link', { name: 'Open shared approval artifact' }).click()

        await expect(page).toHaveURL(/\/admin\/application-review\/APP-3390\/approval$/)
        await expect(page.locator('h1', { hasText: 'Unified Approval & Signoff' })).toBeVisible()
        await expect(page.getByText('Meridian Systems', { exact: true })).toBeVisible()
        await expect(page.getByText('Review APP-3390', { exact: true })).toBeVisible()
    })
})
