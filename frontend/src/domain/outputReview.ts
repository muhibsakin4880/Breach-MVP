import type { DealArtifactPreviewTone } from './dealArtifactPreview'
import { buildDealDossierProofBundle } from './dealArtifactPreview'
import type { DealRouteContext } from './dealDossier'
import { checkoutAccessModeMeta } from './escrowCheckout'

export type OutputReviewCoreState =
    | 'active_session'
    | 'blocked_export'
    | 'review_pending'
    | 'aggregate_approved'

export type OutputReviewEvent = {
    id: string
    state: OutputReviewCoreState
    label: string
    status: string
    tone: DealArtifactPreviewTone
    at: string
    actor: string
    summary: string
    detail: string
    controls: string[]
}

export type OutputReviewModel = {
    reviewId: string | null
    currentState: OutputReviewCoreState
    currentStateLabel: string
    currentStateTone: DealArtifactPreviewTone
    session: {
        sessionId: string
        analyst: string
        participant: string
        workspaceName: string
        launchPath: string
        status: string
        tone: DealArtifactPreviewTone
        credentialLabel: string
        issuedAt: string
        expiresAt: string
        reviewWindowLabel: string
    }
    request: {
        artifactName: string
        destination: string
        reviewerOwner: string
        queueStatus: string
        queueTone: DealArtifactPreviewTone
        rationale: string
        releaseBoundary: string
    }
    watermark: {
        watermarkId: string
        traceSummary: string
        auditPointer: string
    }
    controlRows: Array<{
        label: string
        value: string
    }>
    approvedHighlights: string[]
    events: OutputReviewEvent[]
}

type OutputReviewSeed = {
    analyst: string
    participant: string
    sessionId: string
    artifactName: string
    destination: string
    reviewerOwner: string
    watermarkId: string
    traceSummary: string
    fallbackTimestamps: Record<OutputReviewCoreState, string>
}

const OUTPUT_REVIEW_SEEDS: Record<string, OutputReviewSeed> = {
    'DL-1001': {
        analyst: 'A. Underwood',
        participant: 'part_anon_056',
        sessionId: 'enc_session_climate_2293',
        artifactName: 'Flood scenario aggregate export',
        destination: 'Regional resilience dashboard package',
        reviewerOwner: 'Governed output desk',
        watermarkId: 'wm_climate_2293',
        traceSummary: 'Aggregate flood-scenario output remains traceable to the named analyst and review id APP-2293.',
        fallbackTimestamps: {
            active_session: '2026-03-31 08:55 UTC',
            blocked_export: '2026-03-31 09:02 UTC',
            review_pending: '2026-03-31 09:08 UTC',
            aggregate_approved: '2026-03-31 09:21 UTC'
        }
    },
    'DL-1002': {
        analyst: 'L. Park',
        participant: 'part_anon_017',
        sessionId: 'enc_session_quant_3390',
        artifactName: 'Replay diagnostics aggregate bundle',
        destination: 'Research replay scorecard',
        reviewerOwner: 'Market data reviewer',
        watermarkId: 'wm_quant_3390',
        traceSummary: 'Approved replay diagnostics stay linked to the market-data reviewer and the release packet.',
        fallbackTimestamps: {
            active_session: '2026-03-30 13:14 UTC',
            blocked_export: '2026-03-30 13:29 UTC',
            review_pending: '2026-03-30 13:36 UTC',
            aggregate_approved: '2026-03-30 13:48 UTC'
        }
    },
    'DL-1003': {
        analyst: 'R. Chowdhury',
        participant: 'part_anon_042',
        sessionId: 'enc_session_mobility_4471',
        artifactName: 'Congestion summary export',
        destination: 'Planning-only mobility briefing',
        reviewerOwner: 'Mobility governance reviewer',
        watermarkId: 'wm_mobility_4471',
        traceSummary: 'Mobility output traces capture reviewer handoff and blocked direct-location joins before any approved release.',
        fallbackTimestamps: {
            active_session: '2026-03-31 10:12 UTC',
            blocked_export: '2026-03-31 10:22 UTC',
            review_pending: '2026-03-31 10:28 UTC',
            aggregate_approved: '2026-03-31 10:41 UTC'
        }
    }
}

const stageLabels: Record<OutputReviewCoreState, string> = {
    active_session: 'Active session',
    blocked_export: 'Blocked export',
    review_pending: 'Output review pending',
    aggregate_approved: 'Aggregate export approved'
}

const formatUtcTimestamp = (value?: string) => {
    if (!value) return 'Pending'

    const parsed = Date.parse(value)
    if (Number.isNaN(parsed)) return value

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'UTC'
    }).format(new Date(parsed)).replace(',', ' ·')
}

const getSeed = (dealId: string): OutputReviewSeed =>
    OUTPUT_REVIEW_SEEDS[dealId] ?? {
        analyst: 'Named analyst',
        participant: 'part_anon_000',
        sessionId: `enc_session_${dealId.toLowerCase()}`,
        artifactName: 'Governed aggregate output',
        destination: 'Reviewer-approved destination',
        reviewerOwner: 'Output review desk',
        watermarkId: `wm_${dealId.toLowerCase()}`,
        traceSummary: 'Output trace remains attached to the named analyst and review packet.',
        fallbackTimestamps: {
            active_session: '2026-03-31 09:00 UTC',
            blocked_export: '2026-03-31 09:07 UTC',
            review_pending: '2026-03-31 09:13 UTC',
            aggregate_approved: '2026-03-31 09:28 UTC'
        }
    }

export const buildOutputReviewModel = (context: DealRouteContext): OutputReviewModel => {
    const seed = getSeed(context.seed.dealId)
    const proofBundle = buildDealDossierProofBundle(context)
    const checkout = context.checkoutRecord
    const accessMode = checkout?.configuration.accessMode ?? 'clean_room'
    const sessionActive = checkout?.credentials.status === 'issued'
    const workspaceReady = checkout?.workspace.status === 'ready'
    const rawExportBlocked = accessMode !== 'encrypted_download'
    const reviewPending =
        accessMode === 'aggregated_export' &&
        !(
            checkout?.outcomeProtection.validation.status === 'confirmed' ||
            checkout?.lifecycleState === 'RELEASED_TO_PROVIDER'
        )
    const aggregateApproved =
        accessMode === 'aggregated_export' &&
        (
            checkout?.outcomeProtection.validation.status === 'confirmed' ||
            checkout?.lifecycleState === 'RELEASED_TO_PROVIDER'
        )

    const currentState: OutputReviewCoreState =
        aggregateApproved
            ? 'aggregate_approved'
            : reviewPending
                ? 'review_pending'
                : sessionActive && rawExportBlocked
                    ? 'blocked_export'
                    : 'active_session'

    const currentStateTone: DealArtifactPreviewTone =
        currentState === 'aggregate_approved'
            ? 'emerald'
            : currentState === 'review_pending'
                ? 'amber'
                : currentState === 'blocked_export'
                    ? 'rose'
                    : sessionActive
                        ? 'cyan'
                        : 'amber'

    const reviewWindowLabel = checkout
        ? `${checkout.configuration.reviewWindowHours} hours`
        : context.quote
            ? `${context.quote.input.validationWindowHours} hours`
            : 'Pending checkout'

    const sessionIssuedAt = checkout?.credentials.issuedAt
        ? formatUtcTimestamp(checkout.credentials.issuedAt)
        : workspaceReady
            ? formatUtcTimestamp(checkout?.workspace.provisionedAt)
            : seed.fallbackTimestamps.active_session

    const sessionExpiresAt = checkout?.credentials.expiresAt
        ? formatUtcTimestamp(checkout.credentials.expiresAt)
        : sessionActive
            ? 'Time-boxed JIT session'
            : 'Credentials not issued yet'

    const queueStatus =
        aggregateApproved
            ? 'Resolved after review'
            : reviewPending
                ? 'Pending reviewer action'
                : rawExportBlocked
                    ? 'Standby until aggregate request appears'
                    : 'Encrypted release route only'

    const queueTone: DealArtifactPreviewTone =
        aggregateApproved ? 'emerald' : reviewPending ? 'amber' : rawExportBlocked ? 'cyan' : 'amber'

    const releaseBoundary = checkout
        ? checkoutAccessModeMeta[accessMode].detail
        : 'Protected evaluation output remains bounded to the governed review lane.'

    const watermarkId =
        checkout?.credentials.credentialId
            ? `${seed.watermarkId}-${checkout.credentials.credentialId.toLowerCase()}`
            : seed.watermarkId

    const auditPointer = proofBundle.reviewId
        ? `audit://${proofBundle.reviewId.toLowerCase()}/output-review/${context.seed.dealId.toLowerCase()}`
        : `audit://output-review/${context.seed.dealId.toLowerCase()}`

    const events: OutputReviewEvent[] = [
        {
            id: `${context.seed.dealId}-active-session`,
            state: 'active_session',
            label: stageLabels.active_session,
            status: sessionActive ? 'Active' : workspaceReady ? 'Ready to launch' : 'Planned',
            tone: sessionActive ? 'cyan' : workspaceReady ? 'amber' : 'slate',
            at: sessionActive
                ? sessionIssuedAt
                : workspaceReady
                    ? formatUtcTimestamp(checkout?.workspace.provisionedAt)
                    : seed.fallbackTimestamps.active_session,
            actor: seed.analyst,
            summary: `${checkout?.workspace.workspaceName ?? `${context.dataset?.category ?? 'Governed'} clean room`} is the current operating surface for this evaluation.`,
            detail:
                sessionActive
                    ? 'The named analyst is inside a time-boxed session with reviewer-governed egress and full audit capture.'
                    : 'The workspace is staged for named-analyst launch, but session issuance still depends on checkout state.',
            controls: [
                `Workspace ${checkout?.workspace.workspaceName ?? 'planned'}`,
                `Credential ${checkout?.credentials.credentialId ?? 'pending issuance'}`,
                `Review window ${reviewWindowLabel}`
            ]
        },
        {
            id: `${context.seed.dealId}-blocked-export`,
            state: 'blocked_export',
            label: stageLabels.blocked_export,
            status: rawExportBlocked ? 'Blocked by policy' : 'Encrypted package only',
            tone: rawExportBlocked ? 'rose' : 'amber',
            at: seed.fallbackTimestamps.blocked_export,
            actor: 'Output policy engine',
            summary:
                rawExportBlocked
                    ? 'Raw export remains blocked while the analyst works inside the governed environment.'
                    : 'Direct raw export is not open; only an encrypted reviewed package can leave the environment.',
            detail:
                rawExportBlocked
                    ? 'Clipboard, screenshots, direct downloads, and unreviewed data package release remain outside the allowed policy envelope.'
                    : 'Any release still stays bound to the approved recipient, watermarking, and review controls.',
            controls: [
                accessMode === 'clean_room' ? 'No raw export' : checkoutAccessModeMeta[accessMode].label,
                'Watermark trace enforced',
                'Reviewer approval required for broader output movement'
            ]
        },
        {
            id: `${context.seed.dealId}-review-pending`,
            state: 'review_pending',
            label: stageLabels.review_pending,
            status: queueStatus,
            tone: queueTone,
            at: seed.fallbackTimestamps.review_pending,
            actor: seed.reviewerOwner,
            summary:
                reviewPending
                    ? `${seed.artifactName} is queued for reviewer inspection before it can leave the workspace.`
                    : aggregateApproved
                        ? 'The reviewer queue has already been resolved for the current aggregate artifact.'
                        : 'No aggregate review is currently open, but the review lane is ready if the analyst submits one.',
            detail:
                context.request?.reviewerFeedback ??
                proofBundle.evaluationState.note ??
                'Reviewer rationale, release boundary, and audit trace stay bound to the deal before any output broadens.',
            controls: [
                `Reviewer owner ${seed.reviewerOwner}`,
                `Destination ${seed.destination}`,
                `Boundary ${releaseBoundary}`
            ]
        },
        {
            id: `${context.seed.dealId}-aggregate-approved`,
            state: 'aggregate_approved',
            label: stageLabels.aggregate_approved,
            status: aggregateApproved ? 'Approved aggregate export' : 'Not approved yet',
            tone: aggregateApproved ? 'emerald' : 'slate',
            at: aggregateApproved
                ? formatUtcTimestamp(checkout?.outcomeProtection.release?.releasedAt) || seed.fallbackTimestamps.aggregate_approved
                : seed.fallbackTimestamps.aggregate_approved,
            actor: seed.reviewerOwner,
            summary:
                aggregateApproved
                    ? `${seed.artifactName} cleared review and can move to ${seed.destination}.`
                    : 'No aggregate output has been approved for release yet.',
            detail:
                aggregateApproved
                    ? 'The approved artifact remains watermark-linked, traceable to the named analyst, and bounded to the approved destination.'
                    : 'Approval appears here only after the reviewer queue resolves positively.',
            controls: [
                `Destination ${seed.destination}`,
                `Watermark ${watermarkId}`,
                `Audit ${auditPointer}`
            ]
        }
    ]

    return {
        reviewId: proofBundle.reviewId,
        currentState,
        currentStateLabel: stageLabels[currentState],
        currentStateTone,
        session: {
            sessionId: seed.sessionId,
            analyst: seed.analyst,
            participant: seed.participant,
            workspaceName: checkout?.workspace.workspaceName ?? `${context.dataset?.category ?? 'Governed'} clean room`,
            launchPath: checkout?.workspace.launchPath ?? '/secure-enclave',
            status: sessionActive ? 'Issued' : workspaceReady ? 'Ready' : 'Planned',
            tone: sessionActive ? 'cyan' : workspaceReady ? 'amber' : 'slate',
            credentialLabel: checkout?.credentials.credentialId ?? 'Credential pending',
            issuedAt: sessionIssuedAt,
            expiresAt: sessionExpiresAt,
            reviewWindowLabel
        },
        request: {
            artifactName: seed.artifactName,
            destination: seed.destination,
            reviewerOwner: seed.reviewerOwner,
            queueStatus,
            queueTone,
            rationale:
                context.request?.reviewerRationale ??
                'Only aggregate outputs that match the contracted evaluation purpose can move into reviewer inspection.',
            releaseBoundary
        },
        watermark: {
            watermarkId,
            traceSummary: seed.traceSummary,
            auditPointer
        },
        controlRows: [
            { label: 'Access mode', value: checkoutAccessModeMeta[accessMode].label },
            { label: 'Workspace', value: checkout?.workspace.workspaceName ?? 'Workspace pending' },
            { label: 'Credential', value: checkout?.credentials.credentialId ?? 'Scoped credential pending' },
            { label: 'Review window', value: reviewWindowLabel },
            { label: 'Watermark trace', value: watermarkId },
            { label: 'Audit pointer', value: auditPointer }
        ],
        approvedHighlights:
            aggregateApproved
                ? [
                    `Approved artifact ${seed.artifactName}`,
                    `Destination ${seed.destination}`,
                    `Reviewer ${seed.reviewerOwner}`
                ]
                : [
                    'Approval remains output-specific and reviewer-controlled.',
                    'No raw export path is unlocked by default.',
                    'Audit trace remains attached even when the queue is pending.'
                ],
        events
    }
}
