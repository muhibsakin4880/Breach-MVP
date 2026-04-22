import { expect, test, type Page } from '@playwright/test'

const authStorageKeys = {
    accessStatus: 'Redoubt:accessStatus',
    isAuthenticated: 'Redoubt:isAuthenticated',
    onboardingInitiated: 'Redoubt:onboardingInitiated',
    applicantEmail: 'Redoubt:applicantEmail',
    isAdmin: 'Redoubt:isAdmin',
    workspaceRole: 'Redoubt:workspaceRole'
} as const

async function seedProviderSession(page: Page) {
    await page.goto('/')
    await page.evaluate((keys) => {
        window.localStorage.clear()
        window.localStorage.setItem(keys.accessStatus, 'approved')
        window.localStorage.setItem(keys.isAuthenticated, 'true')
        window.localStorage.setItem(keys.onboardingInitiated, 'false')
        window.localStorage.setItem(keys.applicantEmail, 'provider@northwind.exchange')
        window.localStorage.setItem(keys.isAdmin, 'false')
        window.localStorage.setItem(keys.workspaceRole, 'provider')
    }, authStorageKeys)
    await page.reload()
}

test.describe('provider institution review', () => {
    test('provider dashboard links into the institution review surface', async ({ page }) => {
        await seedProviderSession(page)

        await page.goto('/provider/dashboard')

        await page.getByRole('link', { name: 'Institution review' }).first().click()

        await expect(page).toHaveURL(/\/provider\/institution-review$/)
        await expect(page.getByRole('heading', { name: 'Provider Institution Review' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Publishing readiness' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Rights verification checklist' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Dataset submission map' })).toBeVisible()
        await expect(page.getByRole('link', { name: 'Open upload flow' })).toBeVisible()
        await expect(page.getByRole('link', { name: 'Open provider packet' }).first()).toBeVisible()
    })

    test('provider dataset routes expose institution review handoff links', async ({ page }) => {
        await seedProviderSession(page)

        await page.goto('/provider/datasets/cn-1003')
        await expect(page.getByRole('link', { name: 'Open Institution Review' })).toBeVisible()

        await page.goto('/provider/datasets/cn-1003/status')
        await expect(page.getByRole('link', { name: 'Institution review', exact: true })).toBeVisible()
    })
})
