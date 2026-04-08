import { expect, test, type Page } from '@playwright/test'

const authStorageKeys = {
    accessStatus: 'Redoubt:accessStatus',
    isAuthenticated: 'Redoubt:isAuthenticated',
    onboardingInitiated: 'Redoubt:onboardingInitiated',
    applicantEmail: 'Redoubt:applicantEmail',
    isAdmin: 'Redoubt:isAdmin'
} as const

const profileStorageKeys = {
    notifications: 'Redoubt:profile:notificationSettings',
    consoleLanding: 'Redoubt:profile:defaultConsoleLanding'
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
    }, authStorageKeys)
    await page.reload()
}

test.describe('participant profile page', () => {
    test('renders dense profile modules and preserves workspace preferences', async ({ page }) => {
        await seedParticipantSession(page)

        await page.goto('/profile')

        await expect(page).toHaveURL(/\/profile$/)
        await expect(page.getByRole('heading', { name: 'Profile & Settings' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Account snapshot' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Trust snapshot' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Security center' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Access & integrations' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Workspace preferences' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Recent account activity' })).toBeVisible()

        const governanceToggle = page.getByRole('button', { name: 'Toggle Governance and status alerts' })
        await governanceToggle.click()
        await expect(governanceToggle).toHaveAttribute('aria-pressed', 'true')

        await expect.poll(async () => {
            return await page.evaluate((key) => {
                const stored = window.localStorage.getItem(key)
                if (!stored) return null
                const parsed = JSON.parse(stored) as Record<string, boolean>
                return parsed['governance-status']
            }, profileStorageKeys.notifications)
        }).toBe(true)

        await page.getByLabel('Default console landing page').selectOption('Platform Status')
        await expect.poll(async () => {
            return await page.evaluate((key) => window.localStorage.getItem(key), profileStorageKeys.consoleLanding)
        }).toBe('Platform Status')

        await page.reload()
        await expect(page.getByRole('button', { name: 'Toggle Governance and status alerts' })).toHaveAttribute('aria-pressed', 'true')
        await expect(page.getByLabel('Default console landing page')).toHaveValue('Platform Status')

        await page.getByRole('link', { name: 'Open trust profile' }).click()
        await expect(page).toHaveURL(/\/trust-profile$/)
        await expect(page.getByRole('heading', { name: 'Trust Profile' })).toBeVisible()

        await page.goto('/profile')
        await page.getByRole('link', { name: 'Open compliance passport' }).click()
        await expect(page).toHaveURL(/\/compliance-passport$/)
        await expect(page.getByRole('heading', { name: 'Compliance Passport' })).toBeVisible()

        await page.goto('/profile')
        await expect(page.getByRole('button', { name: 'Generate invite code' })).toBeVisible()
        await page.getByRole('button', { name: 'Generate invite code' }).click()
        await expect(page.getByText(/REDO-[A-Z0-9]{6}/)).toBeVisible()

        await expect(page.getByRole('button', { name: 'Rotate production key' })).toBeVisible()
        await page.getByRole('button', { name: 'Reveal credential details' }).click()
        await expect(page.getByText('datasets:read', { exact: true })).toBeVisible()
    })
})
