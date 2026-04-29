import type { DatasetDetail } from '../data/datasetDetailData'
import type { CompliancePassport } from './compliancePassport'
import { formatUsd, type RightsQuote } from './rightsQuoteBuilder'
import type {
    EscrowCheckoutAccessMode,
    EscrowCheckoutConfig,
    EscrowCheckoutRecord,
    EscrowDueUseAgreement,
    EscrowReviewWindowHours,
    OutcomeEngineStatus,
    OutcomeIssueType,
    OutcomeStage,
    OutcomeValidationStatus
} from './escrowCheckout'

export type {
    EscrowCheckoutAccessMode,
    EscrowDueUseAgreement,
    EscrowReviewWindowHours,
    OutcomeEngineStatus,
    OutcomeIssueType,
    OutcomeStage,
    OutcomeValidationStatus
}

const nowIso = () => new Date().toISOString()
const roundToNearest25 = (value: number) => Math.round(value / 25) * 25

const buildStableHash = (input: string) => {
    let hash = 0
    for (let index = 0; index < input.length; index += 1) {
        hash = (hash * 31 + input.charCodeAt(index)) >>> 0
    }
    return hash.toString(16).toUpperCase().padStart(8, '0').slice(0, 8)
}

const buildId = (prefix: string, seed: string) => `${prefix}-${buildStableHash(`${seed}:${Date.now()}`)}`

const quoteDurationLabel = (quote: RightsQuote) => {
    if (quote.input.duration === '30_days') return '30 days'
    if (quote.input.duration === '90_days') return '90 days'
    if (quote.input.duration === '12_months') return '12 months'
    return '24 months'
}

const launchPathFromAccessMode = (accessMode: EscrowCheckoutAccessMode) =>
    accessMode === 'clean_room' ? '/secure-enclave' : '/pipelines'

const workspaceNameFromAccessMode = (dataset: DatasetDetail, accessMode: EscrowCheckoutAccessMode) => {
    if (accessMode === 'encrypted_download') return `${dataset.category} delivery workspace`
    if (accessMode === 'aggregated_export') return `${dataset.category} governed analytics workspace`
    return `${dataset.category} clean room`
}

const buildSchemaVersion = (dataset: DatasetDetail) =>
    buildStableHash(dataset.preview.sampleSchema.map(field => `${field.field}:${field.type}`).join('|'))

const buildEvaluationFee = (quote: RightsQuote) => roundToNearest25(Math.max(quote.totalUsd * 0.1, 750))

const expectedFieldCountFromQuote = (quote: RightsQuote, dataset: DatasetDetail) => {
    const totalFields = dataset.preview.sampleSchema.length
    if (quote.input.fieldPack === 'core') return Math.max(3, totalFields - 2)
    if (quote.input.fieldPack === 'analytics') return Math.max(4, totalFields - 1)
    return totalFields
}

const creditRateForIssues = (issueTypes: OutcomeIssueType[]) => {
    const normalized = Array.from(new Set(issueTypes))
    if (normalized.includes('schema_mismatch') && normalized.includes('freshness_miss')) return 0.35
    if (normalized.includes('schema_mismatch')) return 0.2
    return 0.15
}

const issueSummary = (issueTypes: OutcomeIssueType[]) => {
    if (issueTypes.includes('schema_mismatch') && issueTypes.includes('freshness_miss')) {
        return 'schema and freshness commitments missed'
    }
    if (issueTypes.includes('schema_mismatch')) return 'schema commitment missed'
    return 'freshness commitment missed'
}

const scopesFromQuote = (quote: RightsQuote, accessMode: EscrowCheckoutAccessMode) => {
    const commonScopes = [`dataset:${quote.datasetId}:read`, 'audit:write', 'policy:enforced']
    if (accessMode === 'encrypted_download') {
        return [...commonScopes, 'download:encrypted', 'watermark:required', 'keys:ephemeral']
    }
    if (accessMode === 'aggregated_export') {
        return [...commonScopes, 'query:aggregated', 'export:aggregated', 'egress:reviewed']
    }
    return [...commonScopes, 'query:clean-room', 'export:none', 'egress:blocked']
}

export const checkoutAccessModeMeta: Record<
    EscrowCheckoutAccessMode,
    { label: string; detail: string }
> = {
    clean_room: {
        label: 'Secure clean room',
        detail: 'Analysis happens in an isolated workspace with no raw export path.'
    },
    aggregated_export: {
        label: 'Aggregated export',
        detail: 'Analysis stays governed, but approved aggregate outputs can leave after review.'
    },
    encrypted_download: {
        label: 'Encrypted download',
        detail: 'An audited workspace provisions time-boxed, watermarked, encrypted package access.'
    }
}

export const reviewWindowOptions: EscrowReviewWindowHours[] = [24, 48, 72]

export const outcomeIssueMeta: Record<OutcomeIssueType, { label: string; detail: string }> = {
    schema_mismatch: {
        label: 'Schema mismatch',
        detail: 'Delivered fields or required schema shape diverged from the contracted rights package.'
    },
    freshness_miss: {
        label: 'Freshness miss',
        detail: 'The delivered data did not meet the freshness commitment captured at checkout.'
    }
}

export const outcomeStageMeta: Record<OutcomeStage, { label: string; detail: string }> = {
    evaluation_pending: {
        label: 'Evaluation pending',
        detail: 'Metadata preview is live, and the paid clean-room evaluation starts after workspace activation.'
    },
    evaluation_active: {
        label: 'Evaluation active',
        detail: 'Buyer is validating schema, freshness, and access commitments inside the governed workspace.'
    },
    validated: {
        label: 'Validated',
        detail: 'Buyer confirmed the committed outcome and escrow can move into release.'
    },
    credit_issued: {
        label: 'Credit issued',
        detail: 'A protected commitment missed and an automatic credit was applied before payout.'
    },
    released: {
        label: 'Released',
        detail: 'Buyer validated the deal outcome and escrow was released to the provider.'
    }
}

export const describeCheckoutAccessMode = (accessMode: EscrowCheckoutAccessMode) =>
    checkoutAccessModeMeta[accessMode].label

export const getPlannedWorkspaceName = (dataset: DatasetDetail, accessMode: EscrowCheckoutAccessMode) =>
    workspaceNameFromAccessMode(dataset, accessMode)

export const getPlannedWorkspaceLaunchPath = (accessMode: EscrowCheckoutAccessMode) =>
    launchPathFromAccessMode(accessMode)

export const getPlannedCredentialScopes = (quote: RightsQuote, accessMode: EscrowCheckoutAccessMode) =>
    scopesFromQuote(quote, accessMode)

export const getOutcomeEvaluationFee = (quote: RightsQuote) => buildEvaluationFee(quote)

export const buildEscrowDueUseAgreement = (
    dataset: DatasetDetail,
    quote: RightsQuote,
    passport: CompliancePassport,
    config: EscrowCheckoutConfig
): EscrowDueUseAgreement => {
    const generatedAt = nowIso()
    const clauses = [
        `Permitted use is limited to ${quote.rightsSummary[2].toLowerCase()} for ${quoteDurationLabel(quote)} under ${quote.rightsSummary[4].toLowerCase()}.`,
        `Access will be delivered via ${checkoutAccessModeMeta[config.accessMode].label.toLowerCase()} with reviewer-controlled egress and provider anonymity preserved.`,
        `Redoubt will hold ${formatUsd(quote.escrowHoldUsd)} in escrow for a ${config.reviewWindowHours}-hour buyer validation window before provider release.`,
        `Workspace credentials are scoped to ${workspaceNameFromAccessMode(dataset, config.accessMode)} and expire automatically after the configured TTL.`,
        `Redistribution, identity re-identification, and policy-breaching exports remain prohibited under passport ${passport.passportId}.`,
        `If schema, freshness, or access commitments materially diverge from the agreed rights package, the buyer may open dispute before escrow release.`
    ]
    const checksum = buildStableHash(
        `${dataset.id}:${quote.id}:${passport.passportId}:${config.accessMode}:${config.reviewWindowHours}:${clauses.join('|')}`
    )

    return {
        version: `DUA-2026.${String((config.reviewWindowHours / 24) + 2).padStart(2, '0')}`,
        checksum,
        generatedAt,
        summary: `${dataset.title} · ${quote.id} · ${checkoutAccessModeMeta[config.accessMode].label} · ${config.reviewWindowHours}-hour review window`,
        clauses,
        accepted: false
    }
}

export const initializeEvaluationState = (
    dataset: DatasetDetail,
    quote: RightsQuote,
    passport: CompliancePassport,
    config: EscrowCheckoutConfig,
    createdAt: string
): Pick<EscrowCheckoutRecord, 'dua' | 'workspace' | 'credentials' | 'outcomeProtection'> => {
    const duaPreview = buildEscrowDueUseAgreement(dataset, quote, passport, config)
    const workspaceId = `ws_${dataset.id}_${buildStableHash(`${quote.id}:${config.accessMode}`).toLowerCase()}`

    return {
        dua: {
            ...duaPreview,
            accepted: true,
            acceptedAt: createdAt
        },
        workspace: {
            status: 'planned',
            workspaceId,
            workspaceName: workspaceNameFromAccessMode(dataset, config.accessMode),
            launchPath: launchPathFromAccessMode(config.accessMode)
        },
        credentials: {
            status: 'planned',
            scopes: scopesFromQuote(quote, config.accessMode),
            tokenTtlMinutes: config.accessMode === 'encrypted_download' ? 90 : 180
        },
        outcomeProtection: {
            metadataPreviewIncluded: true,
            evaluationFeeUsd: buildEvaluationFee(quote),
            stage: 'evaluation_pending',
            commitments: {
                schemaVersion: buildSchemaVersion(dataset),
                expectedFieldCount: expectedFieldCountFromQuote(quote, dataset),
                freshnessCommitment: dataset.preview.freshnessLabel,
                confidenceFloor: Math.max(75, dataset.quality.freshnessScore - 3)
            },
            engine: {
                status: 'not_started',
                summary: 'Outcome engine will run automatically once the governed evaluation workspace is live.',
                findings: []
            },
            validation: {
                status: 'pending',
                issueTypes: []
            },
            credits: {
                status: 'none',
                amountUsd: 0
            }
        }
    }
}

export const provisionEscrowWorkspace = (record: EscrowCheckoutRecord): EscrowCheckoutRecord => ({
    ...record,
    updatedAt: nowIso(),
    workspace: {
        ...record.workspace,
        status: 'ready',
        provisionedAt: nowIso()
    }
})

export const issueEscrowScopedCredentials = (record: EscrowCheckoutRecord): EscrowCheckoutRecord => {
    const issuedAt = new Date()
    const expiresAt = new Date(issuedAt.getTime() + record.credentials.tokenTtlMinutes * 60 * 1000).toISOString()

    return {
        ...record,
        updatedAt: nowIso(),
        lifecycleState: 'ACCESS_ACTIVE',
        credentials: {
            ...record.credentials,
            status: 'issued',
            credentialId: buildId('TOK', `${record.quoteId}:${record.workspace.workspaceId}`),
            issuedAt: issuedAt.toISOString(),
            expiresAt
        },
        outcomeProtection: {
            ...record.outcomeProtection,
            stage: 'evaluation_active',
            engine: {
                ...record.outcomeProtection.engine,
                status: 'not_started',
                summary: 'Protected evaluation is live. Engine scan will compare committed schema and freshness before buyer validation.'
            },
            validation: {
                ...record.outcomeProtection.validation,
                updatedAt: issuedAt.toISOString()
            }
        }
    }
}

export const confirmOutcomeValidation = (record: EscrowCheckoutRecord, note?: string): EscrowCheckoutRecord => {
    const updatedAt = nowIso()

    return {
        ...record,
        updatedAt,
        lifecycleState: 'RELEASE_PENDING',
        outcomeProtection: {
            ...record.outcomeProtection,
            stage: 'validated',
            validation: {
                status: 'confirmed',
                issueTypes: [],
                note,
                updatedAt
            }
        }
    }
}

const buildActualFieldCount = (
    dataset: DatasetDetail,
    quote: RightsQuote,
    record: EscrowCheckoutRecord
) => {
    let drift = 0
    if ((quote.input.fieldPack === 'full_schema' || quote.input.fieldPack === 'sensitive_review') && dataset.preview.structureQuality < 95) {
        drift += 1
    }
    if (record.configuration.accessMode === 'encrypted_download' && dataset.preview.structureQuality < 94) {
        drift += 1
    }

    return Math.max(0, record.outcomeProtection.commitments.expectedFieldCount - drift)
}

const buildActualFreshnessScore = (
    dataset: DatasetDetail,
    quote: RightsQuote,
    record: EscrowCheckoutRecord
) => {
    let penalty = 0
    if (record.configuration.accessMode === 'aggregated_export') penalty += 1
    if (record.configuration.accessMode === 'encrypted_download') penalty += 4
    if (quote.input.geography === 'global') penalty += 2
    if (quote.riskBand === 'heightened') penalty += 1
    if (quote.riskBand === 'strict') penalty += 2
    return Math.max(0, dataset.quality.freshnessScore - penalty)
}

export const runOutcomeProtectionEngine = (
    record: EscrowCheckoutRecord,
    dataset: DatasetDetail,
    quote: RightsQuote
): EscrowCheckoutRecord => {
    const updatedAt = nowIso()
    const actualFieldCount = buildActualFieldCount(dataset, quote, record)
    const actualFreshnessScore = buildActualFreshnessScore(dataset, quote, record)
    const issueTypes: OutcomeIssueType[] = []
    const findings: string[] = []

    if (actualFieldCount < record.outcomeProtection.commitments.expectedFieldCount) {
        issueTypes.push('schema_mismatch')
        findings.push(
            `Expected ${record.outcomeProtection.commitments.expectedFieldCount} contracted field(s), but evaluation surfaced ${actualFieldCount}.`
        )
    }

    if (actualFreshnessScore < record.outcomeProtection.commitments.confidenceFloor) {
        issueTypes.push('freshness_miss')
        findings.push(
            `Freshness signal scored ${actualFreshnessScore}% against a contracted floor of ${record.outcomeProtection.commitments.confidenceFloor}%.`
        )
    }

    if (issueTypes.length === 0) {
        return {
            ...record,
            updatedAt,
            outcomeProtection: {
                ...record.outcomeProtection,
                engine: {
                    status: 'passed',
                    summary: `Outcome engine verified ${actualFieldCount}/${record.outcomeProtection.commitments.expectedFieldCount} field(s) and freshness ${actualFreshnessScore}% against a floor of ${record.outcomeProtection.commitments.confidenceFloor}%.`,
                    findings: ['Committed schema and freshness checks passed.'],
                    actualFieldCount,
                    actualFreshnessScore,
                    lastRunAt: updatedAt
                }
            }
        }
    }

    const amountUsd = roundToNearest25(record.funding.amountUsd * creditRateForIssues(issueTypes))

    return {
        ...record,
        updatedAt,
        lifecycleState: 'DISPUTE_OPEN',
        outcomeProtection: {
            ...record.outcomeProtection,
            stage: 'credit_issued',
            engine: {
                status: 'failed',
                summary: `Outcome engine detected ${issueSummary(issueTypes)} during protected evaluation.`,
                findings,
                actualFieldCount,
                actualFreshnessScore,
                lastRunAt: updatedAt
            },
            validation: {
                status: 'issue_reported',
                issueTypes,
                note: `Protection engine automatically opened review because ${issueSummary(issueTypes)}.`,
                updatedAt
            },
            credits: {
                status: 'issued',
                amountUsd,
                reason: `Automatic credit issued because ${issueSummary(issueTypes)}.`,
                issuedAt: updatedAt
            }
        }
    }
}

export const issueAutomaticOutcomeCredit = (
    record: EscrowCheckoutRecord,
    issueTypes: OutcomeIssueType[],
    note?: string
): EscrowCheckoutRecord => {
    const updatedAt = nowIso()
    const amountUsd = roundToNearest25(record.funding.amountUsd * creditRateForIssues(issueTypes))

    return {
        ...record,
        updatedAt,
        lifecycleState: 'DISPUTE_OPEN',
        outcomeProtection: {
            ...record.outcomeProtection,
            stage: 'credit_issued',
            validation: {
                status: 'issue_reported',
                issueTypes,
                note,
                updatedAt
            },
            credits: {
                status: 'issued',
                amountUsd,
                reason: `Automatic credit issued because ${issueSummary(issueTypes)}.`,
                issuedAt: updatedAt
            }
        }
    }
}

