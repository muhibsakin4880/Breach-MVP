import { expect, test, type Page } from '@playwright/test'

const authStorageKeys = {
    accessStatus: 'Redoubt:accessStatus',
    isAuthenticated: 'Redoubt:isAuthenticated',
    onboardingInitiated: 'Redoubt:onboardingInitiated',
    applicantEmail: 'Redoubt:applicantEmail',
    isAdmin: 'Redoubt:isAdmin',
    workspaceRole: 'Redoubt:workspaceRole'
} as const

const guidedTourStorageKeys = {
    completedSteps: 'Redoubt:guidedTour:completedSteps',
    personaOverride: 'Redoubt:guidedTour:personaOverride'
} as const

async function seedParticipantSession(page: Page, workspaceRole: 'buyer' | 'provider' | 'hybrid') {
    await page.goto('/')
    await page.evaluate(({ auth, role }) => {
        window.localStorage.clear()
        window.localStorage.setItem(auth.accessStatus, 'approved')
        window.localStorage.setItem(auth.isAuthenticated, 'true')
        window.localStorage.setItem(auth.onboardingInitiated, 'false')
        window.localStorage.setItem(auth.applicantEmail, 'ops@northwindresearch.com')
        window.localStorage.setItem(auth.isAdmin, 'false')
        window.localStorage.setItem(auth.workspaceRole, role)
        window.localStorage.removeItem('Redoubt:guidedTour:completedSteps')
        window.localStorage.removeItem('Redoubt:guidedTour:personaOverride')
    }, {
        auth: authStorageKeys,
        role: workspaceRole
    })
    await page.reload()
}

test.describe('participant guided tour', () => {
    test('uses workspace role by default and persists manual override plus completion state', async ({ page }) => {
        await seedParticipantSession(page, 'buyer')

        await page.goto('/guided-tour')

        await expect(page).toHaveURL(/\/guided-tour$/)
        await expect(page.getByRole('heading', { name: 'Guided workspace workflow' })).toBeVisible()
        await expect(page.getByRole('button', { name: 'Use workspace default (Buyer workspace)' })).toHaveAttribute('aria-pressed', 'true')
        await expect(page.getByRole('heading', { name: 'Buyer workflow' })).toBeVisible()

        await page.getByRole('button', { name: 'Provider view' }).click()
        await expect(page.getByRole('button', { name: 'Provider view' })).toHaveAttribute('aria-pressed', 'true')

        await expect.poll(async () => {
            return await page.evaluate((key) => window.localStorage.getItem(key), guidedTourStorageKeys.personaOverride)
        }).toBe('provider')

        await page.reload()
        await expect(page.getByRole('button', { name: 'Provider view' })).toHaveAttribute('aria-pressed', 'true')
        await expect(page.getByRole('heading', { name: 'Provider workflow' })).toBeVisible()

        await page.getByRole('button', { name: 'Mark Confirm participant profile and alert routing complete' }).click()
        await expect(page.getByRole('button', { name: 'Mark Confirm participant profile and alert routing incomplete' })).toBeVisible()

        await expect.poll(async () => {
            return await page.evaluate((key) => window.localStorage.getItem(key), guidedTourStorageKeys.completedSteps)
        }).toContain('shared-profile')

        await page.reload()
        await expect(page.getByRole('button', { name: 'Mark Confirm participant profile and alert routing incomplete' })).toBeVisible()

        await page.getByRole('link', { name: 'Profile & Settings' }).click()
        await expect(page).toHaveURL(/\/profile$/)
        await expect(page.getByRole('heading', { name: 'Profile & Settings' })).toBeVisible()

        await page.goto('/guided-tour')
        await page.getByRole('link', { name: 'Open trust glossary' }).click()
        await expect(page).toHaveURL(/\/trust-glossary$/)
    })

    test('defaults hybrid participants to the merged workflow', async ({ page }) => {
        await seedParticipantSession(page, 'hybrid')

        await page.goto('/guided-tour')

        await expect(page.getByRole('button', { name: 'Use workspace default (Hybrid workspace)' })).toHaveAttribute('aria-pressed', 'true')
        await expect(page.getByText('Hybrid workspace active')).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Buyer workflow' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Provider workflow' })).toBeVisible()
    })
})
