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

test.describe('buyer evaluation route completeness', () => {
    test('every primary deal evaluation surface lands on a real page (DL-1001)', async ({ page }) => {
        await seedParticipantSession(page)

        await page.goto('/deals/DL-1001/provider-packet')
        await expect(page).toHaveURL(/\/deals\/DL-1001\/provider-packet$/)
        await expect(page.getByRole('heading').first()).toBeVisible()

        await page.goto('/deals/DL-1001/negotiation')
        await expect(page).toHaveURL(/\/deals\/DL-1001\/negotiation$/)
        await expect(page.getByRole('heading').first()).toBeVisible()

        await page.goto('/deals/DL-1001/approval')
        await expect(page).toHaveURL(/\/deals\/DL-1001\/approval$/)
        await expect(page.getByRole('heading').first()).toBeVisible()

        await page.goto('/deals/DL-1001/residency-memo')
        await expect(page).toHaveURL(/\/deals\/DL-1001\/residency-memo$/)
        await expect(page.getByRole('heading').first()).toBeVisible()

        await page.goto('/deals/DL-1001/go-live')
        await expect(page).toHaveURL(/\/deals\/DL-1001\/go-live$/)
        await expect(page.getByRole('heading').first()).toBeVisible()

        await page.goto('/deals/DL-1001/output-review')
        await expect(page).toHaveURL(/\/deals\/DL-1001\/output-review$/)
        await expect(page.getByRole('heading').first()).toBeVisible()
    })

    test('demo evaluation surfaces resolve for the canonical demo deal', async ({ page }) => {
        await seedParticipantSession(page)

        await page.goto('/demo/deals/DL-1001/provider-packet')
        await expect(page).toHaveURL(/\/demo\/deals\/DL-1001\/provider-packet$/)
        await expect(page.getByRole('heading').first()).toBeVisible()

        await page.goto('/demo/deals/DL-1001/output-review')
        await expect(page).toHaveURL(/\/demo\/deals\/DL-1001\/output-review$/)
        await expect(page.getByRole('heading').first()).toBeVisible()

        await page.goto('/demo/ephemeral-token')
        await expect(page).toHaveURL(/\/demo\/ephemeral-token$/)
        await expect(page.getByRole('heading', { name: 'Ephemeral Token', exact: true })).toBeVisible()
    })

    test('legacy workspace path redirects to secure-enclave', async ({ page }) => {
        await seedParticipantSession(page)

        await page.goto('/workspace')
        await expect(page).toHaveURL(/\/secure-enclave$/)
        await expect(page.getByRole('heading', { name: 'Secure Enclave & Clean Room' })).toBeVisible()
    })

    test('legacy demo workspace path redirects to demo secure-enclave', async ({ page }) => {
        await seedParticipantSession(page)

        await page.goto('/demo/workspace')
        await expect(page).toHaveURL(/\/demo\/secure-enclave$/)
        await expect(page.getByRole('heading', { name: 'Secure Enclave & Clean Room' })).toBeVisible()
    })
})

test.describe('compliance passport read-only surface', () => {
    test('compliance passport renders identity, usage, and completion sections', async ({ page }) => {
        await seedParticipantSession(page)

        await page.goto('/compliance-passport')

        await expect(page.getByRole('heading', { name: 'Compliance Passport' })).toBeVisible()
        await expect(page.getByText('Reusable Trust · Read-only Snapshot')).toBeVisible()
        await expect(page.getByText('Organization Identity')).toBeVisible()
        await expect(page.getByText('Declared Usage')).toBeVisible()
        await expect(page.getByText('Completion Checklist')).toBeVisible()
        await expect(page.getByText('Verification Evidence')).toBeVisible()
        await expect(page.getByText('Legal Acknowledgment')).toBeVisible()
        await expect(page.getByText('Compliance Commitments')).toBeVisible()
        await expect(page.getByText('Reuse Benefits')).toBeVisible()
        await expect(page.getByRole('link', { name: 'View Trust Profile' })).toBeVisible()
    })

    test('demo compliance passport route uses the same read-only surface', async ({ page }) => {
        await seedParticipantSession(page)

        await page.goto('/demo/compliance-passport')

        await expect(page.getByRole('heading', { name: 'Compliance Passport' })).toBeVisible()
        await expect(page.getByText('Organization Identity')).toBeVisible()
    })
})
