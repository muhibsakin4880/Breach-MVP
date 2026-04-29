import { CONTRACT_STATE_LABELS } from './accessContract'
import type { DealRouteContext } from './dealDossier'
import {
    checkoutAccessModeMeta,
    outcomeStageMeta
} from './evaluationEscrow'
import type { EscrowCheckoutRecord } from './escrowCheckout'

export type BuyerTokenStatus = 'Active' | 'Provisioning' | 'Frozen' | 'Expired' | 'Revoked'
export type BuyerTokenTone = 'cyan' | 'emerald' | 'amber' | 'rose' | 'slate'
export type BuyerPolicyState = 'Policy enforced' | 'Checks pending' | 'Restricted' | 'Expired'
export type BuyerTokenTimelineState = 'complete' | 'current' | 'upcoming' | 'blocked'
export type PolicyControlStatus = 'Active' | 'Required' | 'Pending' | 'Blocked' | 'Not applicable'
export type TerminalTriggerSource = 'system' | 'admin' | 'outcome engine' | 'policy control' | 'dispute state'

export type BuyerTokenPermissionMatrix = {
    allowed: string[]
    blocked: string[]
    scopeChips: string[]
}

export type BuyerTokenPolicyControl = {
    label: string
    status: PolicyControlStatus
    detail: string
}

export type BuyerTokenTimelineEvent = {
    title: string
    detail: string
    timestamp: string
    state: BuyerTokenTimelineState
}

export type BuyerTokenTerminalState = {
    status: Extract<BuyerTokenStatus, 'Frozen' | 'Revoked'>
    reason: string
    timestamp: string
    triggerSource: TerminalTriggerSource
    nextAction: string
}

export type BuyerTokenSelection = {
    record: EscrowCheckoutRecord
    status: BuyerTokenStatus
}

export type BuyerTokenViewModel = {
    record: EscrowCheckoutRecord
    dealContext: DealRouteContext | null
    status: BuyerTokenStatus
    tone: BuyerTokenTone
    statusDetail: string
    policyState: BuyerPolicyState
    timeRemaining: string
    safeTokenReference: string
    lifecycleLabel: string
    accessModeLabel: string
    accessModeDetail: string
    outcomeProtectionLabel: string
    outcomeProtectionDetail: string
    linkedDealReference: string
    dossierRoute: string
    escrowStateLabel: string
    releaseStateLabel: string
    credentialStatusLabel: 'Issued' | 'Planned'
    workspaceStatusLabel: 'Ready' | 'Planned'
    validationWindowLabel: string
    duaLabel: string
    evaluationFeeLabel: string
    workspaceReady: boolean
    renewalEligibilityLabel: string
    terminalState: BuyerTokenTerminalState | null
    permissions: BuyerTokenPermissionMatrix
    policyControls: BuyerTokenPolicyControl[]
    timelineEvents: BuyerTokenTimelineEvent[]
    datasetCategory?: string
    outputReviewStatus?: string
    egressStatus?: string
    releaseReady?: boolean
    outputReviewPath?: string
}

const statusPriority: Record<BuyerTokenStatus, number> = {
    Active: 0,
    Provisioning: 1,
    Frozen: 2,
    Expired: 3,
    Revoked: 4
}

export function deriveBuyerTokenStatus(record: EscrowCheckoutRecord, nowMs: number): BuyerTokenStatus {
    if (record.lifecycleState === 'RELEASED_TO_PROVIDER') return 'Revoked'
    if (record.lifecycleState === 'DISPUTE_OPEN' || record.outcomeProtection.credits.status === 'issued') {
        return 'Frozen'
    }

    if (record.credentials.status === 'issued') {
        const expiresMs = parseTimestamp(record.credentials.expiresAt)
        if (expiresMs === null) return 'Provisioning'
        if (expiresMs <= nowMs) return 'Expired'
    }

    if (record.credentials.status !== 'issued' || record.workspace.status !== 'ready') {
        return 'Provisioning'
    }

    return 'Active'
}

export function getBuyerTokenTone(status: BuyerTokenStatus): BuyerTokenTone {
    if (status === 'Active') return 'emerald'
    if (status === 'Provisioning') return 'cyan'
    if (status === 'Frozen') return 'amber'
    if (status === 'Revoked') return 'rose'
    return 'slate'
}

export function selectPrimaryBuyerToken(
    records: EscrowCheckoutRecord[],
    nowMs: number
): BuyerTokenSelection | null {
    if (records.length === 0) return null

    const ranked = [...records]
        .map(record => ({
            record,
            status: deriveBuyerTokenStatus(record, nowMs)
        }))
        .sort((left, right) => {
            const statusDelta = statusPriority[left.status] - statusPriority[right.status]
            if (statusDelta !== 0) return statusDelta
            return (parseTimestamp(right.record.updatedAt) ?? 0) - (parseTimestamp(left.record.updatedAt) ?? 0)
        })

    return ranked[0] ?? null
}

export function findDealContextForCheckout(
    record: EscrowCheckoutRecord,
    contexts: DealRouteContext[]
): DealRouteContext | null {
    return (
        contexts.find(context =>
            context.checkoutId === record.id ||
            context.checkoutRecord?.id === record.id ||
            context.dataset?.id === record.datasetId ||
            context.seed.datasetId === record.datasetId
        ) ?? null
    )
}

export function buildBuyerTokenViewModel(
    record: EscrowCheckoutRecord,
    dealContext: DealRouteContext | null,
    nowMs: number
): BuyerTokenViewModel {
    const status = deriveBuyerTokenStatus(record, nowMs)
    const accessModeMeta = checkoutAccessModeMeta[record.configuration.accessMode]
    const outcomeMeta = outcomeStageMeta[record.outcomeProtection.stage]
    const workspaceReady = record.workspace.status === 'ready'
    const outcomeStage = record.outcomeProtection.stage
    const releaseReady = outcomeStage === 'validated' || outcomeStage === 'released'

    return {
        record,
        dealContext,
        status,
        tone: getBuyerTokenTone(status),
        statusDetail: getStatusDetail(status),
        policyState: getBuyerPolicyState(record, status),
        timeRemaining: formatTimeRemaining(record.credentials.expiresAt, nowMs),
        safeTokenReference: getSafeTokenReference(record),
        lifecycleLabel: CONTRACT_STATE_LABELS[record.lifecycleState],
        accessModeLabel: accessModeMeta.label,
        accessModeDetail: accessModeMeta.detail,
        outcomeProtectionLabel: outcomeMeta.label,
        outcomeProtectionDetail: outcomeMeta.detail,
        linkedDealReference: dealContext?.seed.dealId ?? record.id,
        dossierRoute: dealContext?.routeTargets.dossier ?? '/deals',
        escrowStateLabel: CONTRACT_STATE_LABELS[record.lifecycleState],
        releaseStateLabel: getReleaseStateLabel(record),
        credentialStatusLabel: record.credentials.status === 'issued' ? 'Issued' : 'Planned',
        workspaceStatusLabel: workspaceReady ? 'Ready' : 'Planned',
        validationWindowLabel: `${record.configuration.reviewWindowHours} hours`,
        duaLabel: record.dua.accepted
            ? `Accepted · ${record.dua.version}`
            : `Pending · ${record.dua.version}`,
        evaluationFeeLabel: formatCurrency(record.outcomeProtection.evaluationFeeUsd),
        workspaceReady,
        renewalEligibilityLabel: status === 'Expired' ? 'Eligible after review' : 'Not currently available',
        terminalState: getTerminalState(record, status),
        permissions: buildPermissionMatrix(record),
        policyControls: buildPolicyControls(record, status),
        timelineEvents: buildTimelineEvents(record, status, nowMs),
        datasetCategory: record.configuration.accessMode === 'clean_room' ? 'Clean Room' : record.configuration.accessMode === 'aggregated_export' ? 'Aggregated Export' : 'Encrypted Download',
        outputReviewStatus: outcomeStage === 'evaluation_pending' ? 'Pending' : outcomeStage === 'evaluation_active' ? 'In progress' : outcomeStage === 'validated' ? 'Complete' : outcomeStage === 'credit_issued' ? 'Credit issued' : 'Released',
        egressStatus: record.configuration.accessMode === 'clean_room' ? 'Blocked' : record.configuration.accessMode === 'aggregated_export' ? 'Review required' : 'Download encrypted',
        releaseReady,
        outputReviewPath: dealContext?.routeTargets['output-review'] ?? undefined
    }
}

export function formatTimestamp(value: string | undefined, fallback: string) {
    if (!value) return fallback
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return fallback

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
        timeZoneName: 'short'
    }).format(date)
}

function getBuyerPolicyState(
    record: EscrowCheckoutRecord,
    status: BuyerTokenStatus
): BuyerPolicyState {
    if (status === 'Frozen' || status === 'Revoked') return 'Restricted'
    if (status === 'Expired') return 'Expired'
    if (!record.dua.accepted || record.workspace.status !== 'ready' || record.credentials.status !== 'issued') {
        return 'Checks pending'
    }
    return 'Policy enforced'
}

function getStatusDetail(status: BuyerTokenStatus) {
    if (status === 'Active') {
        return 'Scoped access is live inside the governed evaluation boundary.'
    }
    if (status === 'Provisioning') {
        return 'Workspace, policy checks, or credential issue is still pending.'
    }
    if (status === 'Frozen') {
        return 'Access is paused while policy, outcome, or dispute controls review the deal.'
    }
    if (status === 'Revoked') {
        return 'The credential has been archived after release or control action.'
    }
    return 'The credential window has closed.'
}

function getSafeTokenReference(record: EscrowCheckoutRecord) {
    return record.credentials.credentialId ?? 'Pending issuance'
}

function buildPermissionMatrix(record: EscrowCheckoutRecord): BuyerTokenPermissionMatrix {
    const allowed = [
        'Dataset read inside governed workspace',
        'Audit write',
        'Policy-enforced evaluation'
    ]

    if (record.configuration.accessMode === 'clean_room') {
        allowed.splice(1, 0, 'Clean-room query')
    }

    if (record.configuration.accessMode === 'aggregated_export') {
        allowed.splice(1, 0, 'Governed analysis inside reviewed workspace')
        allowed.push('Aggregated export if approved')
    }

    if (record.configuration.accessMode === 'encrypted_download') {
        allowed.splice(1, 0, 'Governed analysis inside approved workspace')
        allowed.push('Encrypted download if approved')
    }

    return {
        allowed,
        blocked: [
            'Raw export',
            'Re-identification',
            'Redistribution',
            'Unreviewed egress',
            'Download unless explicitly approved',
            'Access after expiry'
        ],
        scopeChips: sanitizeScopes(record.credentials.scopes)
    }
}

function buildPolicyControls(
    record: EscrowCheckoutRecord,
    status: BuyerTokenStatus
): BuyerTokenPolicyControl[] {
    return [
        {
            label: 'Policy enforcement',
            status:
                status === 'Frozen' || status === 'Revoked' || status === 'Expired'
                    ? 'Blocked'
                    : status === 'Provisioning'
                        ? 'Pending'
                        : 'Active',
            detail:
                status === 'Frozen' || status === 'Revoked'
                    ? 'A deal-state control is actively blocking this credential.'
                    : status === 'Expired'
                        ? 'The credential window has closed and policy blocks continued access.'
                        : status === 'Provisioning'
                            ? 'Policy checks must clear before live issuance.'
                            : 'Deal, DUA, workspace, and scope rules are enforced.'
        },
        {
            label: 'Audit logging',
            status: 'Active',
            detail: 'Every governed access event remains tied to the audit trail.'
        },
        {
            label: 'Egress review',
            status:
                record.configuration.accessMode === 'clean_room'
                    ? 'Blocked'
                    : 'Required',
            detail:
                record.configuration.accessMode === 'clean_room'
                    ? 'Raw egress stays blocked inside the secure clean room.'
                    : 'Outputs must clear reviewer controls before leaving the workspace.'
        },
        {
            label: 'Watermarking',
            status:
                record.configuration.accessMode === 'clean_room'
                    ? 'Active'
                    : 'Required',
            detail:
                record.configuration.accessMode === 'clean_room'
                    ? 'Workspace trace signals stay attached during governed evaluation.'
                    : 'Approved output paths require watermarking and traceability.'
        },
        {
            label: 'Re-identification block',
            status: 'Active',
            detail: 'Re-identification remains prohibited by policy and DUA terms.'
        },
        {
            label: 'Redistribution block',
            status: 'Active',
            detail: 'Redistribution outside the approved workflow remains blocked.'
        },
        {
            label: 'Residency rule',
            status: record.workspace.status === 'ready' ? 'Active' : 'Pending',
            detail:
                record.workspace.status === 'ready'
                    ? 'Workspace access stays bound to the current governed operating boundary.'
                    : 'Residency and workspace checks complete before activation.'
        },
        {
            label: 'DUA accepted',
            status: record.dua.accepted ? 'Active' : 'Pending',
            detail: record.dua.accepted
                ? `Accepted ${formatTimestamp(record.dua.acceptedAt, '')}`.trim()
                : 'The DUA must be accepted before the token can activate.'
        },
        {
            label: 'Outcome protection',
            status:
                record.outcomeProtection.stage === 'credit_issued'
                    ? 'Blocked'
                    : record.outcomeProtection.stage === 'released'
                        ? 'Not applicable'
                        : record.outcomeProtection.engine.status === 'not_started'
                            ? 'Pending'
                            : 'Active',
            detail:
                record.outcomeProtection.stage === 'credit_issued'
                    ? 'Outcome controls froze access because a commitment miss was detected.'
                    : record.outcomeProtection.stage === 'released'
                        ? 'Outcome review is complete and the evaluation credential is archived.'
                        : outcomeStageMeta[record.outcomeProtection.stage].detail
        },
        {
            label: 'Revocation control',
            status:
                status === 'Frozen' || status === 'Revoked'
                    ? 'Blocked'
                    : 'Active',
            detail:
                status === 'Frozen' || status === 'Revoked'
                    ? 'A freeze or revoke control has already restricted this token.'
                    : 'The token can freeze or revoke automatically on dispute, policy breach, or settlement.'
        }
    ]
}

function buildTimelineEvents(
    record: EscrowCheckoutRecord,
    status: BuyerTokenStatus,
    nowMs: number
): BuyerTokenTimelineEvent[] {
    const workspaceReady = record.workspace.status === 'ready'
    const credentialsIssued = record.credentials.status === 'issued'
    const engineStatus = record.outcomeProtection.engine.status
    const validationStatus = record.outcomeProtection.validation.status

    return [
        {
            title: 'Escrow funded',
            detail: `${record.escrowId} funded for ${record.datasetTitle}.`,
            timestamp: formatTimestamp(record.funding.fundedAt, 'Funding timestamp unavailable'),
            state: 'complete'
        },
        {
            title: 'Workspace provisioned',
            detail: workspaceReady
                ? `${record.workspace.workspaceName} is ready.`
                : 'Workspace provisioning is pending.',
            timestamp: formatTimestamp(record.workspace.provisionedAt, 'Pending'),
            state: workspaceReady ? 'complete' : 'current'
        },
        {
            title: 'Ephemeral Token issued',
            detail: credentialsIssued
                ? 'Safe token reference and scopes were attached to the evaluation workspace.'
                : 'Scoped credentials have not been issued yet.',
            timestamp: formatTimestamp(record.credentials.issuedAt, 'Pending'),
            state: credentialsIssued ? 'complete' : workspaceReady ? 'current' : 'upcoming'
        },
        {
            title: 'Evaluation started',
            detail: credentialsIssued
                ? 'Buyer evaluation is tied to the governed workspace and audit trail.'
                : 'Evaluation starts after credential issue.',
            timestamp: credentialsIssued
                ? formatTimestamp(record.credentials.issuedAt, 'Pending')
                : 'Pending',
            state: credentialsIssued ? 'complete' : 'upcoming'
        },
        {
            title: `Outcome engine ${engineStatus.replace('_', ' ')}`,
            detail: record.outcomeProtection.engine.summary,
            timestamp: formatTimestamp(
                record.outcomeProtection.engine.lastRunAt,
                credentialsIssued ? 'Awaiting engine run' : 'Pending token issue'
            ),
            state:
                engineStatus === 'failed'
                    ? 'blocked'
                    : engineStatus === 'passed'
                        ? 'complete'
                        : credentialsIssued
                            ? 'current'
                            : 'upcoming'
        },
        {
            title:
                validationStatus === 'pending'
                    ? 'Buyer validation pending'
                    : 'Buyer validation submitted',
            detail:
                record.outcomeProtection.validation.note ??
                'Buyer validation closes the review window before escrow can release.',
            timestamp: formatTimestamp(record.outcomeProtection.validation.updatedAt, 'Pending'),
            state:
                validationStatus === 'pending'
                    ? engineStatus === 'passed'
                        ? 'current'
                        : 'upcoming'
                    : validationStatus === 'issue_reported'
                        ? 'blocked'
                        : 'complete'
        },
        {
            title: getTerminalEventTitle(status),
            detail:
                status === 'Active'
                    ? 'Access will close at expiry unless a renewed token is approved.'
                    : status === 'Provisioning'
                        ? 'Terminal token state is pending credential issue.'
                        : getStatusDetail(status),
            timestamp:
                status === 'Expired'
                    ? formatTimestamp(record.credentials.expiresAt, 'Expired')
                    : getTerminalTimestamp(record, status, nowMs),
            state:
                status === 'Active' || status === 'Provisioning'
                    ? 'upcoming'
                    : status === 'Frozen'
                        ? 'blocked'
                        : 'complete'
        }
    ]
}

function getTerminalEventTitle(status: BuyerTokenStatus) {
    if (status === 'Expired') return 'Token expired'
    if (status === 'Frozen') return 'Token frozen'
    if (status === 'Revoked') return 'Token revoked'
    return 'Token closes automatically'
}

function getTerminalState(
    record: EscrowCheckoutRecord,
    status: BuyerTokenStatus
): BuyerTokenTerminalState | null {
    if (status === 'Frozen') {
        const triggerSource = getTerminalTriggerSource(record, status)
        return {
            status,
            reason:
                record.outcomeProtection.credits.reason ??
                record.outcomeProtection.validation.note ??
                'This token is no longer usable. Access was restricted because the deal, policy, or evaluation state requires review.',
            timestamp: formatTimestamp(
                record.outcomeProtection.credits.issuedAt ??
                    record.outcomeProtection.validation.updatedAt ??
                    record.updatedAt,
                'Timestamp unavailable'
            ),
            triggerSource,
            nextAction: getTerminalNextAction(status, triggerSource)
        }
    }

    if (status === 'Revoked') {
        const triggerSource = getTerminalTriggerSource(record, status)
        return {
            status,
            reason:
                record.outcomeProtection.validation.note ??
                'This token is no longer usable. Access was restricted because the deal, policy, or evaluation state requires review.',
            timestamp: formatTimestamp(
                record.outcomeProtection.release?.releasedAt ?? record.updatedAt,
                'Timestamp unavailable'
            ),
            triggerSource,
            nextAction: getTerminalNextAction(status, triggerSource)
        }
    }

    return null
}

function getTerminalTriggerSource(
    record: EscrowCheckoutRecord,
    status: Extract<BuyerTokenStatus, 'Frozen' | 'Revoked'>
): TerminalTriggerSource {
    const note = [
        record.outcomeProtection.credits.reason,
        record.outcomeProtection.validation.note
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

    if (note.includes('admin')) return 'admin'

    if (status === 'Frozen') {
        if (record.outcomeProtection.engine.status === 'failed' || record.outcomeProtection.credits.status === 'issued') {
            return 'outcome engine'
        }
        if (record.lifecycleState === 'DISPUTE_OPEN') return 'dispute state'
        return 'policy control'
    }

    if (note.includes('policy')) return 'policy control'
    return 'system'
}

function getTerminalNextAction(
    status: Extract<BuyerTokenStatus, 'Frozen' | 'Revoked'>,
    triggerSource: TerminalTriggerSource
) {
    if (status === 'Frozen') {
        if (triggerSource === 'outcome engine') {
            return 'Review the outcome findings and wait for dispute or re-issue review before requesting new access.'
        }
        if (triggerSource === 'admin') {
            return 'Open the deal dossier and contact support for manual access review.'
        }
        if (triggerSource === 'dispute state') {
            return 'Open the deal dossier and resolve the dispute review before access can resume.'
        }
        return 'Review the blocked policy condition before a new token can be considered.'
    }

    if (triggerSource === 'admin') {
        return 'Contact support if a new governed evaluation window should be reviewed manually.'
    }

    return 'Request a new governed evaluation window if follow-on access is approved.'
}

function getReleaseStateLabel(record: EscrowCheckoutRecord) {
    if (record.lifecycleState === 'RELEASED_TO_PROVIDER') return 'Released to provider'
    if (record.lifecycleState === 'RELEASE_PENDING') return 'Release pending'
    if (record.lifecycleState === 'DISPUTE_OPEN') return 'On hold for review'
    if (record.lifecycleState === 'ACCESS_ACTIVE') return 'Held until buyer validation closes'
    return 'Escrow hold active'
}

function getTerminalTimestamp(
    record: EscrowCheckoutRecord,
    status: BuyerTokenStatus,
    nowMs: number
) {
    if (status === 'Frozen') {
        return formatTimestamp(
            record.outcomeProtection.credits.issuedAt ??
                record.outcomeProtection.validation.updatedAt ??
                record.updatedAt,
            'Timestamp unavailable'
        )
    }

    if (status === 'Revoked') {
        return formatTimestamp(
            record.outcomeProtection.release?.releasedAt ?? record.updatedAt,
            'Timestamp unavailable'
        )
    }

    if (status === 'Expired') {
        return formatTimestamp(record.credentials.expiresAt, 'Expired')
    }

    const expiryMs = parseTimestamp(record.credentials.expiresAt)
    if (expiryMs !== null && expiryMs > nowMs) {
        return formatTimestamp(record.credentials.expiresAt, 'Scheduled expiry unavailable')
    }

    return 'Pending'
}

function formatTimeRemaining(expiresAt: string | undefined, nowMs: number) {
    if (!expiresAt) return 'Pending issue'
    const expiresMs = parseTimestamp(expiresAt)
    if (expiresMs === null) return 'Unknown'

    const remainingMs = expiresMs - nowMs
    if (remainingMs <= 0) return 'Expired'

    const totalMinutes = Math.ceil(remainingMs / 60000)
    const days = Math.floor(totalMinutes / 1440)
    const hours = Math.floor((totalMinutes % 1440) / 60)
    const minutes = totalMinutes % 60

    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
}

function sanitizeScopes(scopes: string[]) {
    const labels = scopes.map(scope => {
        if (scope.startsWith('dataset:')) return 'dataset read'
        if (scope === 'audit:write') return 'audit write'
        if (scope === 'policy:enforced') return 'policy enforced'
        if (scope === 'query:clean-room') return 'query clean-room'
        if (scope === 'query:aggregated') return 'query aggregated'
        if (scope === 'export:aggregated') return 'aggregate export approved'
        if (scope === 'export:none') return 'export none'
        if (scope === 'egress:blocked') return 'egress blocked'
        if (scope === 'egress:reviewed') return 'egress reviewed'
        if (scope === 'download:encrypted') return 'encrypted download approved'
        if (scope === 'watermark:required') return 'watermark required'
        if (scope === 'keys:ephemeral') return 'keys ephemeral'
        return 'additional scoped permission'
    })

    return Array.from(new Set(labels))
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(value)
}

function parseTimestamp(value: string | undefined) {
    if (!value) return null
    const parsed = Date.parse(value)
    return Number.isNaN(parsed) ? null : parsed
}
