import { expect, test, type Page } from '@playwright/test'

const storageKeys = {
    accessStatus: 'Redoubt:accessStatus',
    isAuthenticated: 'Redoubt:isAuthenticated',
    onboardingInitiated: 'Redoubt:onboardingInitiated',
    applicantEmail: 'Redoubt:applicantEmail',
    isAdmin: 'Redoubt:isAdmin',
    workspaceRole: 'Redoubt:workspaceRole'
} as const

async function seedParticipantSession(page: Page) {
    await page.goto('/')
    await page.evaluate(keys => {
        window.localStorage.clear()
        window.localStorage.setItem(keys.accessStatus, 'approved')
        window.localStorage.setItem(keys.isAuthenticated, 'true')
        window.localStorage.setItem(keys.onboardingInitiated, 'false')
        window.localStorage.setItem(keys.applicantEmail, 'ops@northwindresearch.com')
        window.localStorage.setItem(keys.isAdmin, 'false')
        window.localStorage.setItem(keys.workspaceRole, 'buyer')
    }, storageKeys)
    await page.reload()
}

test.describe('buyer demo on normal routes', () => {
    test('normal checkout stays production-clean while the demo-route checkout keeps its controls', async ({ page }) => {
        await seedParticipantSession(page)

        await page.goto('/datasets/1/escrow-checkout')
        await expect(page.getByRole('button', { name: 'Load buyer demo' })).toHaveCount(0)
        await expect(page.getByLabel('Buyer demo controls')).toHaveCount(0)
        await expect(page.getByLabel('Demo controls')).toHaveCount(0)
        await expect(page.getByRole('link', { name: 'Open Output Review' })).toHaveCount(0)
        await expect(page.getByText('Output review status')).toHaveCount(0)

        await page.goto('/demo/datasets/1/escrow-checkout')
        await expect(page.getByLabel('Demo controls')).toBeVisible()
        await expect(page.getByRole('button', { name: /Jump to Quote Ready/i })).toBeVisible()
    })

    test('demo-route checkout still drives the canonical buyer demo progression', async ({ page }) => {
        await seedParticipantSession(page)

        await page.goto('/demo/datasets/1/escrow-checkout')

        await expect(page.getByLabel('Demo controls')).toBeVisible()
        await page.getByRole('button', { name: /Jump to Quote Ready/i }).click()

        await expect(page.getByRole('button', { name: '1. Fund Escrow' })).toBeVisible()
        await page.getByRole('button', { name: '1. Fund Escrow' }).click()
        await page.getByRole('button', { name: '2. Provision Workspace' }).click()
        await page.getByRole('button', { name: '3. Issue Ephemeral Token' }).click()

        await expect(page.getByText('Access is now live')).toBeVisible()
        await expect(page.getByText('Output review status')).toBeVisible()
        await expect(page.getByRole('link', { name: 'Open Output Review' })).toBeVisible()
        await expect(page.getByRole('button', { name: '4. Validate Buyer Outcome' })).toBeVisible()
        await page.getByRole('button', { name: '4. Validate Buyer Outcome' }).click()
        await page.getByRole('button', { name: '5. Release Escrow' }).click()

        await expect(page.getByRole('button', { name: 'Escrow Released' })).toBeVisible()
    })

    test('normal-route checkout ignores demo state activated elsewhere', async ({ page }) => {
        await seedParticipantSession(page)

        await page.goto('/demo/datasets/1/escrow-checkout')
        await page.getByRole('button', { name: 'Load happy path' }).click()
        await expect(page.getByText('TOK-DEMO-1001', { exact: true })).toBeVisible()

        await page.goto('/datasets/1/escrow-checkout')

        await expect(page.getByRole('button', { name: 'Load buyer demo' })).toHaveCount(0)
        await expect(page.getByLabel('Buyer demo controls')).toHaveCount(0)
        await expect(page.getByText('Load the canonical buyer walkthrough')).toHaveCount(0)
        await expect(page.getByText('QT-DEMO-1001')).toHaveCount(0)
        await expect(page.getByText('ESC-DEMO-1001')).toHaveCount(0)
        await expect(page.getByText('TOK-DEMO-1001')).toHaveCount(0)
        await expect(page.getByRole('link', { name: 'Open Output Review' })).toHaveCount(0)
        await expect(page.getByText('Output review status')).toHaveCount(0)
        await expect(page.getByRole('button', { name: '1. Fund Escrow' })).toBeVisible()
        await expect(page.getByLabel(/I accept this DUA/i)).toBeVisible()
    })

    test('demo storage does not leak canonical demo quote or escrow ids into normal dataset browsing', async ({ page }) => {
        await seedParticipantSession(page)

        await page.goto('/demo/datasets/1/escrow-checkout')
        await page.getByRole('button', { name: /Jump to Token Issued/i }).click()

        await page.goto('/datasets/1')
        await expect(page.getByText('QT-DEMO-1001')).toHaveCount(0)
        await expect(page.getByText('ESC-DEMO-1001')).toHaveCount(0)

        await page.goto('/datasets/1/rights-quote')
        await expect(page.getByText('QT-DEMO-1001')).toHaveCount(0)

        await page.goto('/datasets/1/escrow-checkout')
        await expect(page.getByText('ESC-DEMO-1001')).toHaveCount(0)
        await expect(page.getByText('TOK-DEMO-1001')).toHaveCount(0)
        await expect(page.getByRole('link', { name: 'Open Output Review' })).toHaveCount(0)
    })
})
