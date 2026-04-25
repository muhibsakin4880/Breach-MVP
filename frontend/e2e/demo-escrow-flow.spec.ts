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

test.describe('demo escrow buyer flow', () => {
    test('demo token route shows the complete empty educational state before issuance', async ({ page }) => {
        await seedParticipantSession(page)

        await page.goto('/demo/ephemeral-token')

        await expect(page).toHaveURL(/\/demo\/ephemeral-token$/)
        await expect(page.getByRole('heading', { name: 'Ephemeral Token', exact: true })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'No active Ephemeral Token' })).toBeVisible()
        await expect(page.getByRole('link', { name: 'Browse Datasets' })).toBeVisible()
        await expect(page.getByRole('link', { name: 'Open Escrow Center' })).toBeVisible()
        await expect(page.getByText('How Ephemeral Tokens Work')).toBeVisible()
        await expect(page.getByText('Security Controls')).toBeVisible()
        await expect(page.getByText('Access Modes')).toBeVisible()
        await expect(page.getByText('What the buyer workflow looks like')).toBeVisible()
    })

    test('demo checkout keeps token, workspace, output review, and escrow center on the same canonical case', async ({ page }) => {
        await seedParticipantSession(page)

        await page.goto('/demo/datasets/1/escrow-checkout')

        await expect(page.getByLabel('Demo controls')).toBeVisible()
        await page.getByRole('button', { name: /Jump to Token Issued/i }).click()

        await expect(page.getByText('Access is now live')).toBeVisible()
        await expect(page.getByRole('link', { name: 'View Ephemeral Token' })).toBeVisible()

        await page.getByRole('link', { name: 'View Ephemeral Token' }).click()
        await expect(page).toHaveURL(/\/demo\/ephemeral-token$/)
        await expect(page.getByText('Token reference ID')).toBeVisible()
        await expect(page.getByText('TOK-DEMO-1001')).toBeVisible()

        await page.getByRole('link', { name: 'Open Secure Workspace' }).click()
        await expect(page).toHaveURL(/\/demo\/secure-enclave$/)
        await expect(page.getByRole('heading', { name: 'Secure Enclave & Clean Room' })).toBeVisible()
        await expect(page.getByText('Evaluation access active').first()).toBeVisible()

        await page.getByRole('link', { name: 'Review Output' }).click()
        await expect(page).toHaveURL(/\/demo\/deals\/DL-1001\/output-review$/)
        await expect(page.getByText('Output pending review').first()).toBeVisible()
        await expect(page.getByText('Raw dataset material does not leave the workspace')).toBeVisible()

        await page.getByRole('link', { name: 'Open Escrow Center' }).click()
        await expect(page).toHaveURL(/\/demo\/escrow-center$/)
        await expect(page.getByRole('heading', { name: 'Escrow Center' })).toBeVisible()
        await expect(page.getByText('Active demo case')).toBeVisible()
        await expect(page.getByText('Live demo case')).toBeVisible()
        await expect(page.getByText('Token state')).toBeVisible()
    })

    test('released demo stage persists across reloads and surfaces terminal token access', async ({ page }) => {
        await seedParticipantSession(page)

        await page.goto('/demo/escrow-center')

        await expect(page.getByLabel('Demo controls')).toBeVisible()
        await page.getByRole('button', { name: /Jump to Released/i }).click()

        await expect(
            page.getByLabel('Demo controls').locator('p', {
                hasText: 'Escrow has been released to provider and token access is closed.'
            })
        ).toBeVisible()
        await expect(page.getByText('Active demo case')).toBeVisible()

        await page.reload()

        await expect(
            page.getByLabel('Demo controls').locator('p', {
                hasText: 'Escrow has been released to provider and token access is closed.'
            })
        ).toBeVisible()
        await expect(page.getByText('Active demo case')).toBeVisible()

        await page.getByLabel('Selected case').getByRole('link', { name: 'Ephemeral Token' }).click()
        await expect(page).toHaveURL(/\/demo\/ephemeral-token$/)
        await expect(page.getByText('TOK-DEMO-1001')).toBeVisible()
        await expect(
            page.getByText(
                'This token is no longer usable. Access was restricted because the deal, policy, or evaluation'
            )
        ).toBeVisible()
    })
})
