import { expect, test } from '@playwright/test'

test('landing Sign In opens login form instead of dashboard', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('link', { name: 'Sign In →' }).first().click()

    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByRole('heading', { name: 'Participant Sign In' })).toBeVisible()
    await expect(page.getByLabel('Work Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page).not.toHaveURL(/\/dashboard$/)
})

test('landing Sign In still opens login form after onboarding reset in mock mode', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
        localStorage.setItem('breach:accessStatus', 'not_started')
        localStorage.setItem('breach:isAuthenticated', 'false')
    })
    await page.reload()

    await page.getByRole('link', { name: 'Sign In →' }).first().click()

    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByRole('heading', { name: 'Participant Sign In' })).toBeVisible()
    await expect(page.getByLabel('Work Email')).toBeVisible()
})
