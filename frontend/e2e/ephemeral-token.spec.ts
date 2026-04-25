import { expect, test, type Page } from '@playwright/test'

const storageKeys = {
    accessStatus: 'Redoubt:accessStatus',
    isAuthenticated: 'Redoubt:isAuthenticated',
    onboardingInitiated: 'Redoubt:onboardingInitiated',
    applicantEmail: 'Redoubt:applicantEmail',
    isAdmin: 'Redoubt:isAdmin',
    workspaceRole: 'Redoubt:workspaceRole',
    escrowCheckouts: 'Redoubt:escrowCheckouts'
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

async function seedTerminalCheckouts(
    page: Page,
    mode: 'frozen-and-revoked' | 'revoked-only'
) {
    await page.evaluate(({ keys, mode }) => {
        const iso = (minutesFromNow: number) =>
            new Date(Date.now() + minutesFromNow * 60 * 1000).toISOString()

        const frozenRecord = {
            id: 'CHK-TEST-FROZEN',
            escrowId: 'ESC-TEST-FROZEN',
            contractId: 'CTR-TEST-FROZEN',
            datasetId: '1',
            datasetTitle: 'Global Climate Observations 2020-2024',
            quoteId: 'Q-TEST-FROZEN',
            passportId: 'PASS-TEST-FROZEN',
            createdAt: iso(-180),
            updatedAt: iso(-10),
            lifecycleState: 'DISPUTE_OPEN',
            buyerLabel: 'part_demo_buyer',
            providerLabel: 'anon_provider_demo',
            funding: {
                amountUsd: 3200,
                escrowHoldUsd: 800,
                fundedAt: iso(-175),
                paymentMethod: 'wire'
            },
            configuration: {
                accessMode: 'clean_room',
                reviewWindowHours: 48,
                paymentMethod: 'wire'
            },
            dua: {
                version: 'DUA-2026.04',
                checksum: 'CHKSMFROZEN',
                generatedAt: iso(-176),
                summary: 'Governed clean-room evaluation with escrow hold.',
                clauses: ['No redistribution.', 'No re-identification.'],
                accepted: true,
                acceptedAt: iso(-174)
            },
            workspace: {
                status: 'ready',
                workspaceId: 'ws_test_frozen',
                workspaceName: 'Climate clean room',
                launchPath: '/secure-enclave',
                provisionedAt: iso(-170)
            },
            credentials: {
                status: 'issued',
                credentialId: 'TOK-TESTFROZEN',
                issuedAt: iso(-165),
                expiresAt: iso(30),
                scopes: [
                    'dataset:1:read',
                    'audit:write',
                    'policy:enforced',
                    'query:clean-room',
                    'export:none',
                    'egress:blocked'
                ],
                tokenTtlMinutes: 180
            },
            outcomeProtection: {
                metadataPreviewIncluded: true,
                evaluationFeeUsd: 900,
                stage: 'credit_issued',
                commitments: {
                    schemaVersion: 'schema-frozen',
                    expectedFieldCount: 5,
                    freshnessCommitment: 'Daily',
                    confidenceFloor: 88
                },
                engine: {
                    status: 'failed',
                    summary: 'Outcome engine detected a schema commitment miss during protected evaluation.',
                    findings: ['Expected 5 contracted fields, surfaced 4.'],
                    actualFieldCount: 4,
                    actualFreshnessScore: 84,
                    lastRunAt: iso(-18)
                },
                validation: {
                    status: 'issue_reported',
                    issueTypes: ['schema_mismatch'],
                    note: 'Protection engine automatically opened review because schema commitment missed.',
                    updatedAt: iso(-16)
                },
                credits: {
                    status: 'issued',
                    amountUsd: 700,
                    reason: 'Automatic credit issued because schema commitment missed.',
                    issuedAt: iso(-16)
                }
            }
        }

        const revokedRecord = {
            id: 'CHK-TEST-REVOKED',
            escrowId: 'ESC-TEST-REVOKED',
            contractId: 'CTR-TEST-REVOKED',
            datasetId: '3',
            datasetTitle: 'Financial Market Tick Data',
            quoteId: 'Q-TEST-REVOKED',
            passportId: 'PASS-TEST-REVOKED',
            createdAt: iso(-220),
            updatedAt: iso(-2),
            lifecycleState: 'RELEASED_TO_PROVIDER',
            buyerLabel: 'part_demo_buyer',
            providerLabel: 'anon_provider_demo',
            funding: {
                amountUsd: 4100,
                escrowHoldUsd: 1200,
                fundedAt: iso(-210),
                paymentMethod: 'wire'
            },
            configuration: {
                accessMode: 'aggregated_export',
                reviewWindowHours: 24,
                paymentMethod: 'wire'
            },
            dua: {
                version: 'DUA-2026.03',
                checksum: 'CHKSMREVOKED',
                generatedAt: iso(-212),
                summary: 'Governed aggregated evaluation with release-ready controls.',
                clauses: ['No redistribution.', 'Reviewed aggregate outputs only.'],
                accepted: true,
                acceptedAt: iso(-210)
            },
            workspace: {
                status: 'ready',
                workspaceId: 'ws_test_revoked',
                workspaceName: 'Markets governed analytics workspace',
                launchPath: '/pipelines',
                provisionedAt: iso(-205)
            },
            credentials: {
                status: 'issued',
                credentialId: 'TOK-TESTREVOKED',
                issuedAt: iso(-200),
                expiresAt: iso(15),
                scopes: [
                    'dataset:3:read',
                    'audit:write',
                    'policy:enforced',
                    'query:aggregated',
                    'export:aggregated',
                    'egress:reviewed'
                ],
                tokenTtlMinutes: 180
            },
            outcomeProtection: {
                metadataPreviewIncluded: true,
                evaluationFeeUsd: 1000,
                stage: 'released',
                commitments: {
                    schemaVersion: 'schema-revoked',
                    expectedFieldCount: 6,
                    freshnessCommitment: 'Hourly',
                    confidenceFloor: 90
                },
                engine: {
                    status: 'passed',
                    summary: 'Outcome engine verified the governed evaluation outcome.',
                    findings: ['Committed schema and freshness checks passed.'],
                    actualFieldCount: 6,
                    actualFreshnessScore: 91,
                    lastRunAt: iso(-40)
                },
                validation: {
                    status: 'confirmed',
                    issueTypes: [],
                    note: 'Buyer confirmed the governed evaluation outcome.',
                    updatedAt: iso(-35)
                },
                credits: {
                    status: 'none',
                    amountUsd: 0
                },
                release: {
                    releasedAt: iso(-5)
                }
            }
        }

        const records = mode === 'revoked-only' ? [revokedRecord] : [revokedRecord, frozenRecord]
        window.localStorage.setItem(keys.escrowCheckouts, JSON.stringify(records))
    }, { keys: storageKeys, mode })
}

test.describe('ephemeral token buyer control center', () => {
    test('shows the complete empty state plus educational sections', async ({ page }) => {
        await seedParticipantSession(page)

        await page.goto('/ephemeral-token')

        await expect(page.getByRole('heading', { name: 'Ephemeral Token', exact: true })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'No active Ephemeral Token' })).toBeVisible()
        await expect(page.getByRole('link', { name: 'Browse Datasets' })).toBeVisible()
        await expect(page.getByRole('link', { name: 'Open Escrow Center' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'How Ephemeral Tokens Work' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Security Controls' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Access Modes' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'What the buyer workflow looks like' })).toBeVisible()
    })

    test('links live checkout state into the token page and shows safe scoped metadata', async ({ page }) => {
        await seedParticipantSession(page)

        await page.goto('/datasets/1/escrow-checkout')

        await page.getByLabel(/I accept this DUA/i).check()
        await page.getByRole('button', { name: '1. Fund Escrow' }).click()
        await page.getByRole('button', { name: '2. Provision Workspace' }).click()
        await page.getByRole('button', { name: '3. Issue Scoped Credentials' }).click()

        await expect(page.getByText('Access is now live')).toBeVisible()
        await expect(page.getByRole('link', { name: 'Open Ephemeral Token' })).toBeVisible()

        await page.getByRole('link', { name: 'Open Ephemeral Token' }).click()

        await expect(page).toHaveURL(/\/ephemeral-token$/)
        await expect(page.getByText(/^TOK-/)).toBeVisible()
        await expect(page.getByText('Credential status')).toBeVisible()
        await expect(page.getByText('Issued', { exact: true })).toBeVisible()
        await expect(page.getByText('Global Climate Observations 2020-2024').first()).toBeVisible()
        await expect(page.getByText('Secure clean room').first()).toBeVisible()
        await expect(page.getByText('/secure-enclave')).toBeVisible()
        await expect(page.getByText('dataset read', { exact: true })).toBeVisible()
        await expect(page.getByText('audit write', { exact: true })).toBeVisible()
        await expect(page.getByText('query clean-room', { exact: true })).toBeVisible()
        await expect(page.getByText('dataset:1:read')).toHaveCount(0)
    })

    test('prioritizes a frozen token over a newer revoked token and blocks workspace access', async ({ page }) => {
        await seedParticipantSession(page)
        await seedTerminalCheckouts(page, 'frozen-and-revoked')

        await page.goto('/ephemeral-token')

        await expect(page.getByText('TOK-TESTFROZEN')).toBeVisible()
        await expect(page.getByText('Climate clean room', { exact: true }).first()).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Token access is frozen' })).toBeVisible()
        await expect(page.getByText('Outcome engine', { exact: true })).toBeVisible()
        await expect(page.getByText('Automatic credit issued because schema commitment missed.')).toBeVisible()
        await expect(page.getByText('Workspace access unavailable')).toBeVisible()
        await expect(page.getByRole('link', { name: 'Open Secure Workspace' })).toHaveCount(0)
    })

    test('renders the revoked warning state and release linkage when only a revoked token remains', async ({ page }) => {
        await seedParticipantSession(page)
        await seedTerminalCheckouts(page, 'revoked-only')

        await page.goto('/ephemeral-token')

        await expect(page.getByText('TOK-TESTREVOKED')).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Token access is revoked' })).toBeVisible()
        await expect(page.getByText('System')).toBeVisible()
        await expect(page.getByText('Released to provider', { exact: true })).toBeVisible()
        await expect(page.getByText('Workspace access unavailable')).toBeVisible()
        await expect(page.getByRole('link', { name: 'Open Secure Workspace' })).toHaveCount(0)
        await expect(page.getByRole('link', { name: 'Open Deal Dossier' })).toBeVisible()
    })

    test('stays usable on a narrow mobile viewport', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 })
        await seedParticipantSession(page)

        await page.goto('/ephemeral-token')

        await expect(page.getByText('PARTICIPANT CONSOLE')).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Ephemeral Token', exact: true })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'No active Ephemeral Token' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'What the buyer workflow looks like' })).toBeVisible()
    })
})
