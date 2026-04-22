import type { DealArtifactPreview, DealArtifactPreviewTone } from './dealArtifactPreview'
import { buildDealDossierProofBundle } from './dealArtifactPreview'
import type { DealRouteContext } from './dealDossier'
import { checkoutAccessModeMeta } from './escrowCheckout'

export type OutputReviewCoreState =
    | 'active_session'
    | 'blocked_export'
    | 'review_pending'
    | 'aggregate_approved'
    | 'extension_request'
    | 'revoked_session'
    | 'dispute_frozen'

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
        reviewLinkage: string
        traceStatus: string
    }
    controlRows: Array<{
        label: string
        value: string
    }>
    approvedHighlights: string[]
    reviewerActionSummary: {
        decisionLabel: string
        reviewerOwner: string
        recordedAt: string
        rationale: string
        nextAction: string
        tone: DealArtifactPreviewTone
    }
    extensionRequest: {
        requester: string
        requestedWindow: string
        reason: string
        status: string
        reviewerDisposition: string
        recordedAt: string
        tone: DealArtifactPreviewTone
    } | null
    sessionControl: {
        posture: string
        owner: string
        revocationReason: string | null
        freezeReason: string | null
        note: string
        tone: DealArtifactPreviewTone
    }
    artifactPreviews: DealArtifactPreview[]
    events: OutputReviewEvent[]
}

type OutputReviewAdvancedSeed = {
    defaultState: Extract<OutputReviewCoreState, 'extension_request' | 'revoked_session' | 'dispute_frozen'>
    simulateActiveSession: boolean
    reviewerDecisionLabel: string
    recordedAt: string
    rationale: string
    nextAction: string
    controlOwner: string
    traceStatus: string
    reviewLinkage: string
    exportNoteSummary: string
    extensionRequest?: {
        requester: string
        requestedWindow: string
        reason: string
        status: string
        reviewerDisposition: string
        recordedAt: string
        tone: DealArtifactPreviewTone
    }
    revocationReason?: string
    freezeReason?: string
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
    advanced: OutputReviewAdvancedSeed
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
            extension_request: '2026-03-31 09:18 UTC',
            aggregate_approved: '2026-03-31 09:21 UTC',
            revoked_session: '2026-03-31 09:29 UTC',
            dispute_frozen: '2026-03-31 09:41 UTC'
        },
        advanced: {
            defaultState: 'extension_request',
            simulateActiveSession: true,
            reviewerDecisionLabel: 'Extension request open',
            recordedAt: '2026-03-31 09:18 UTC',
            rationale: 'The analyst requested additional governed time to complete the aggregate export packet without opening a broader export path.',
            nextAction: 'Output reviewer confirms whether the session may extend by four hours under the same policy envelope.',
            controlOwner: 'Governed output desk',
            traceStatus: 'Trace open while extension review is pending',
            reviewLinkage: 'Watermark and reviewer queue remain attached while the extension request is reviewed.',
            exportNoteSummary: 'The current output packet is still reviewer-bound and no raw export path has been broadened.',
            extensionRequest: {
                requester: 'A. Underwood',
                requestedWindow: 'Add 4 hours to the governed session',
                reason: 'Need more time to validate climate aggregation thresholds before submitting the final export note.',
                status: 'Pending extension decision',
                reviewerDisposition: 'Reviewer will either extend the current token window or require a fresh JIT session.',
                recordedAt: '2026-03-31 09:18 UTC',
                tone: 'amber'
            }
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
            extension_request: '2026-03-30 13:41 UTC',
            aggregate_approved: '2026-03-30 13:48 UTC',
            revoked_session: '2026-03-30 13:55 UTC',
            dispute_frozen: '2026-03-30 14:02 UTC'
        },
        advanced: {
            defaultState: 'revoked_session',
            simulateActiveSession: true,
            reviewerDecisionLabel: 'Session revoked after reviewer action',
            recordedAt: '2026-03-30 13:55 UTC',
            rationale: 'The analyst attempted to move replay diagnostics outside the approved destination lane, so the reviewer revoked the active session before approving any further output.',
            nextAction: 'A fresh JIT session can be requested only after the reviewer closes the revocation note.',
            controlOwner: 'Market data reviewer',
            traceStatus: 'Trace held after revocation',
            reviewLinkage: 'Watermark trace now points to the revocation decision rather than an approved release record.',
            exportNoteSummary: 'The export packet was intercepted before release and remains sealed behind the revocation note.',
            revocationReason: 'Replay diagnostics exceeded the approved destination posture and triggered reviewer revocation.'
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
            extension_request: '2026-03-31 10:34 UTC',
            aggregate_approved: '2026-03-31 10:41 UTC',
            revoked_session: '2026-03-31 10:45 UTC',
            dispute_frozen: '2026-03-31 10:52 UTC'
        },
        advanced: {
            defaultState: 'dispute_frozen',
            simulateActiveSession: true,
            reviewerDecisionLabel: 'Dispute-triggered freeze activated',
            recordedAt: '2026-03-31 10:52 UTC',
            rationale: 'Provider governance opened a dispute after a location-join concern surfaced, so the output lane froze before any reviewed delivery could proceed.',
            nextAction: 'Keep the session frozen until dispute review closes and the mobility restriction memo is refreshed.',
            controlOwner: 'Mobility governance reviewer',
            traceStatus: 'Trace frozen with dispute record',
            reviewLinkage: 'Watermark trace is now attached to the dispute packet and cannot advance into release.',
            exportNoteSummary: 'The export packet is preserved for dispute review, but it cannot move while the freeze stays active.',
            freezeReason: 'Dispute review is open because location-join safeguards need renewed governance confirmation.'
        }
    }
}

const stageLabels: Record<OutputReviewCoreState, string> = {
    active_session: 'Active session',
    blocked_export: 'Blocked export',
    review_pending: 'Output review pending',
    extension_request: 'Extension request',
    aggregate_approved: 'Aggregate export approved',
    revoked_session: 'Revoked session',
    dispute_frozen: 'Dispute-triggered freeze'
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
            extension_request: '2026-03-31 09:16 UTC',
            aggregate_approved: '2026-03-31 09:28 UTC',
            revoked_session: '2026-03-31 09:36 UTC',
            dispute_frozen: '2026-03-31 09:44 UTC'
        },
        advanced: {
            defaultState: 'extension_request',
            simulateActiveSession: true,
            reviewerDecisionLabel: 'Extension request open',
            recordedAt: '2026-03-31 09:16 UTC',
            rationale: 'Reviewer is still assessing whether the named analyst can keep the same governed session open.',
            nextAction: 'Output review desk decides whether the extension remains inside policy.',
            controlOwner: 'Output review desk',
            traceStatus: 'Trace open',
            reviewLinkage: 'Trace remains linked to the reviewer queue.',
            exportNoteSummary: 'The output packet remains bounded to the reviewer lane.',
            extensionRequest: {
                requester: 'Named analyst',
                requestedWindow: 'Add 2 hours',
                reason: 'Need more governed time to complete the export packet.',
                status: 'Pending extension decision',
                reviewerDisposition: 'Reviewer decides whether the current session may stay active.',
                recordedAt: '2026-03-31 09:16 UTC',
                tone: 'amber'
            }
        }
    }

const buildOutputArtifacts = ({
    dealId,
    seed,
    currentState,
    releaseBoundary,
    watermarkId,
    reviewId,
    reviewerActionSummary,
    extensionRequest,
    sessionControl
}: {
    dealId: string
    seed: OutputReviewSeed
    currentState: OutputReviewCoreState
    releaseBoundary: string
    watermarkId: string
    reviewId: string | null
    reviewerActionSummary: OutputReviewModel['reviewerActionSummary']
    extensionRequest: OutputReviewModel['extensionRequest']
    sessionControl: OutputReviewModel['sessionControl']
}): DealArtifactPreview[] => {
    const exportReviewPreview: DealArtifactPreview = {
        id: `${dealId}-output-export-note`,
        artifactLabel: 'Export review note',
        title: 'Reviewer export decision',
        status:
            currentState === 'aggregate_approved'
                ? 'Approved aggregate release'
                : currentState === 'dispute_frozen'
                    ? 'Held in dispute freeze'
                    : currentState === 'revoked_session'
                        ? 'Held after revocation'
                        : 'Reviewer-controlled output',
        tone:
            currentState === 'aggregate_approved'
                ? 'emerald'
                : currentState === 'dispute_frozen' || currentState === 'revoked_session'
                    ? 'rose'
                    : currentState === 'extension_request'
                        ? 'amber'
                        : 'cyan',
        summary: seed.advanced.exportNoteSummary,
        highlights: [
            `Artifact ${seed.artifactName}`,
            `Destination ${seed.destination}`,
            `Boundary ${releaseBoundary}`,
            `Watermark ${watermarkId}`
        ],
        note: `${reviewerActionSummary.reviewerOwner} · ${reviewerActionSummary.recordedAt}${reviewId ? ` · ${reviewId}` : ''}`
    }

    const previews: DealArtifactPreview[] = [exportReviewPreview]

    if (extensionRequest) {
        previews.push({
            id: `${dealId}-output-extension-note`,
            artifactLabel: 'Extension request note',
            title: 'Session extension request',
            status: extensionRequest.status,
            tone: extensionRequest.tone,
            summary: `${extensionRequest.requester} requested more governed time before the current export packet can be finalized.`,
            highlights: [
                extensionRequest.requestedWindow,
                extensionRequest.reason,
                extensionRequest.reviewerDisposition
            ],
            note: `Recorded ${extensionRequest.recordedAt}`
        })
    }

    if (currentState === 'revoked_session') {
        previews.push({
            id: `${dealId}-output-revocation-summary`,
            artifactLabel: 'Revocation summary',
            title: 'Reviewer revocation note',
            status: 'Session revoked',
            tone: 'rose',
            summary: sessionControl.revocationReason ?? 'The current governed session was revoked before release.',
            highlights: [
                `Owner ${sessionControl.owner}`,
                reviewerActionSummary.nextAction,
                `Trace status ${seed.advanced.traceStatus}`
            ],
            note: reviewerActionSummary.rationale
        })
    }

    if (currentState === 'dispute_frozen') {
        previews.push({
            id: `${dealId}-output-freeze-summary`,
            artifactLabel: 'Freeze summary',
            title: 'Dispute freeze memo',
            status: 'Frozen pending dispute',
            tone: 'rose',
            summary: sessionControl.freezeReason ?? 'The output lane is frozen while dispute review remains open.',
            highlights: [
                `Owner ${sessionControl.owner}`,
                reviewerActionSummary.nextAction,
                `Trace status ${seed.advanced.traceStatus}`
            ],
            note: reviewerActionSummary.rationale
        })
    }

    return previews
}

export const buildOutputReviewModel = (context: DealRouteContext): OutputReviewModel => {
    const seed = getSeed(context.seed.dealId)
    const proofBundle = buildDealDossierProofBundle(context)
    const checkout = context.checkoutRecord
    const accessMode = checkout?.configuration.accessMode ?? 'clean_room'
    const rawSessionIssued = checkout?.credentials.status === 'issued'
    const simulatedSessionIssued = rawSessionIssued || seed.advanced.simulateActiveSession
    const workspaceReady = checkout?.workspace.status === 'ready' || seed.advanced.simulateActiveSession
    const rawExportBlocked = accessMode !== 'encrypted_download'
    const aggregateApproved =
        accessMode === 'aggregated_export' &&
        (
            checkout?.outcomeProtection.validation.status === 'confirmed' ||
            checkout?.lifecycleState === 'RELEASED_TO_PROVIDER'
        )
    const reviewPending =
        accessMode === 'aggregated_export' &&
        !aggregateApproved &&
        (
            checkout?.credentials.status === 'issued' ||
            seed.advanced.defaultState === 'extension_request'
        )
    const disputeFrozen =
        checkout?.lifecycleState === 'DISPUTE_OPEN' ||
        checkout?.outcomeProtection.credits.status === 'issued' ||
        seed.advanced.defaultState === 'dispute_frozen'
    const revokedSession = !disputeFrozen && seed.advanced.defaultState === 'revoked_session'
    const extensionRequestOpen =
        !disputeFrozen &&
        !revokedSession &&
        !aggregateApproved &&
        !reviewPending &&
        seed.advanced.defaultState === 'extension_request' &&
        simulatedSessionIssued

    const currentState: OutputReviewCoreState =
        disputeFrozen
            ? 'dispute_frozen'
            : revokedSession
                ? 'revoked_session'
                : aggregateApproved
                    ? 'aggregate_approved'
                    : reviewPending
                        ? 'review_pending'
                        : extensionRequestOpen
                            ? 'extension_request'
                            : rawExportBlocked
                                ? 'blocked_export'
                                : 'active_session'

    const currentStateTone: DealArtifactPreviewTone =
        currentState === 'aggregate_approved'
            ? 'emerald'
            : currentState === 'review_pending' || currentState === 'extension_request'
                ? 'amber'
                : currentState === 'blocked_export'
                    ? 'cyan'
                    : currentState === 'revoked_session' || currentState === 'dispute_frozen'
                        ? 'rose'
                        : simulatedSessionIssued
                            ? 'cyan'
                            : 'slate'

    const reviewWindowLabel = checkout
        ? `${checkout.configuration.reviewWindowHours} hours`
        : context.quote
            ? `${context.quote.input.validationWindowHours} hours`
            : seed.advanced.extensionRequest?.requestedWindow ?? 'Pending checkout'

    const sessionIssuedAt = checkout?.credentials.issuedAt
        ? formatUtcTimestamp(checkout.credentials.issuedAt)
        : seed.fallbackTimestamps.active_session

    const sessionExpiresAt = checkout?.credentials.expiresAt
        ? formatUtcTimestamp(checkout.credentials.expiresAt)
        : currentState === 'revoked_session'
            ? 'Revoked by reviewer action'
            : currentState === 'dispute_frozen'
                ? 'Frozen pending dispute review'
                : simulatedSessionIssued
                    ? 'Time-boxed JIT session'
                    : 'Credentials not issued yet'

    const queueStatus =
        currentState === 'dispute_frozen'
            ? 'Frozen after dispute'
            : currentState === 'revoked_session'
                ? 'Closed after revocation'
                : currentState === 'aggregate_approved'
                    ? 'Resolved after review'
                    : currentState === 'review_pending'
                        ? 'Pending reviewer action'
                        : currentState === 'extension_request'
                            ? 'Extension pending decision'
                            : rawExportBlocked
                                ? 'Standby until aggregate request appears'
                                : 'Encrypted release route only'

    const queueTone: DealArtifactPreviewTone =
        currentState === 'aggregate_approved'
            ? 'emerald'
            : currentState === 'dispute_frozen' || currentState === 'revoked_session'
                ? 'rose'
                : currentState === 'review_pending' || currentState === 'extension_request'
                    ? 'amber'
                    : 'cyan'

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

    const reviewerActionSummary: OutputReviewModel['reviewerActionSummary'] = {
        decisionLabel: seed.advanced.reviewerDecisionLabel,
        reviewerOwner: seed.reviewerOwner,
        recordedAt: seed.advanced.recordedAt,
        rationale:
            checkout?.outcomeProtection.validation.note ??
            context.request?.reviewerFeedback ??
            seed.advanced.rationale,
        nextAction: seed.advanced.nextAction,
        tone:
            currentState === 'aggregate_approved'
                ? 'emerald'
                : currentState === 'extension_request' || currentState === 'review_pending'
                    ? 'amber'
                    : currentState === 'active_session'
                        ? 'cyan'
                        : 'rose'
    }

    const extensionRequest = seed.advanced.extensionRequest ?? null

    const sessionControl: OutputReviewModel['sessionControl'] = {
        posture:
            currentState === 'dispute_frozen'
                ? 'Session frozen pending dispute'
                : currentState === 'revoked_session'
                    ? 'Session revoked'
                    : currentState === 'extension_request'
                        ? 'Extension pending reviewer decision'
                        : currentState === 'aggregate_approved'
                            ? 'Session completed after approved export'
                            : simulatedSessionIssued
                                ? 'Active governed session'
                                : 'Session not yet issued',
        owner: seed.advanced.controlOwner,
        revocationReason:
            currentState === 'revoked_session'
                ? seed.advanced.revocationReason ?? 'Reviewer closed the governed session before release.'
                : null,
        freezeReason:
            currentState === 'dispute_frozen'
                ? checkout?.outcomeProtection.credits.reason ??
                  checkout?.outcomeProtection.validation.note ??
                  seed.advanced.freezeReason ??
                  'Dispute review remains open.'
                : null,
        note:
            currentState === 'extension_request'
                ? 'The current token window remains governed while the extension request is reviewed.'
                : currentState === 'revoked_session'
                    ? 'Any new access now requires a fresh JIT issuance and reviewer approval.'
                    : currentState === 'dispute_frozen'
                        ? 'The session, queue, and watermark trail remain preserved but cannot advance into release.'
                        : 'Session posture remains inside the standard output-review envelope.',
        tone:
            currentState === 'dispute_frozen' || currentState === 'revoked_session'
                ? 'rose'
                : currentState === 'extension_request'
                    ? 'amber'
                    : simulatedSessionIssued
                        ? 'cyan'
                        : 'slate'
    }

    const events: OutputReviewEvent[] = [
        {
            id: `${context.seed.dealId}-active-session`,
            state: 'active_session',
            label: stageLabels.active_session,
            status: simulatedSessionIssued ? 'Active' : workspaceReady ? 'Ready to launch' : 'Planned',
            tone: simulatedSessionIssued ? 'cyan' : workspaceReady ? 'amber' : 'slate',
            at: sessionIssuedAt,
            actor: seed.analyst,
            summary: `${checkout?.workspace.workspaceName ?? `${context.dataset?.category ?? 'Governed'} clean room`} is the current operating surface for this evaluation.`,
            detail:
                simulatedSessionIssued
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
            tone: rawExportBlocked ? 'cyan' : 'amber',
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
            id: `${context.seed.dealId}-extension-request`,
            state: 'extension_request',
            label: stageLabels.extension_request,
            status: extensionRequest?.status ?? 'No extension requested',
            tone: extensionRequest?.tone ?? 'slate',
            at: extensionRequest?.recordedAt ?? seed.fallbackTimestamps.extension_request,
            actor: extensionRequest?.requester ?? seed.analyst,
            summary:
                extensionRequest
                    ? `${extensionRequest.requester} requested a governed session extension before the current export packet can be finalized.`
                    : 'No governed extension request is currently open.',
            detail:
                extensionRequest
                    ? `${extensionRequest.reason} ${extensionRequest.reviewerDisposition}`
                    : 'Extension requests appear here when the active session needs more governed time without broadening export rights.',
            controls: extensionRequest
                ? [
                    extensionRequest.requestedWindow,
                    extensionRequest.status,
                    extensionRequest.reviewerDisposition
                ]
                : ['No extension note recorded']
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
        },
        {
            id: `${context.seed.dealId}-revoked-session`,
            state: 'revoked_session',
            label: stageLabels.revoked_session,
            status: currentState === 'revoked_session' ? 'Session revoked' : 'No revocation',
            tone: currentState === 'revoked_session' ? 'rose' : 'slate',
            at: seed.fallbackTimestamps.revoked_session,
            actor: seed.advanced.controlOwner,
            summary:
                currentState === 'revoked_session'
                    ? 'Reviewer intervention revoked the current governed session before output release.'
                    : 'Session revocation appears here only when reviewer intervention closes the lane.',
            detail:
                currentState === 'revoked_session'
                    ? sessionControl.revocationReason ?? 'Reviewer revoked the session.'
                    : 'The session remains revocable if reviewer intervention detects policy drift.',
            controls: [
                `Owner ${seed.advanced.controlOwner}`,
                reviewerActionSummary.nextAction,
                `Trace ${seed.advanced.traceStatus}`
            ]
        },
        {
            id: `${context.seed.dealId}-dispute-frozen`,
            state: 'dispute_frozen',
            label: stageLabels.dispute_frozen,
            status: currentState === 'dispute_frozen' ? 'Frozen pending dispute' : 'No dispute freeze',
            tone: currentState === 'dispute_frozen' ? 'rose' : 'slate',
            at:
                currentState === 'dispute_frozen'
                    ? formatUtcTimestamp(checkout?.updatedAt) || seed.fallbackTimestamps.dispute_frozen
                    : seed.fallbackTimestamps.dispute_frozen,
            actor: seed.advanced.controlOwner,
            summary:
                currentState === 'dispute_frozen'
                    ? 'Dispute review froze the output lane before any release could proceed.'
                    : 'Dispute-triggered freeze appears only when payout or release is blocked by dispute handling.',
            detail:
                currentState === 'dispute_frozen'
                    ? sessionControl.freezeReason ?? 'The output lane is frozen while dispute review remains open.'
                    : 'No dispute freeze is active for the current review lane.',
            controls: [
                `Owner ${seed.advanced.controlOwner}`,
                reviewerActionSummary.nextAction,
                `Trace ${seed.advanced.traceStatus}`
            ]
        }
    ]

    const artifactPreviews = buildOutputArtifacts({
        dealId: context.seed.dealId,
        seed,
        currentState,
        releaseBoundary,
        watermarkId,
        reviewId: proofBundle.reviewId,
        reviewerActionSummary,
        extensionRequest,
        sessionControl
    })

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
            status:
                currentState === 'dispute_frozen'
                    ? 'Frozen'
                    : currentState === 'revoked_session'
                        ? 'Revoked'
                        : simulatedSessionIssued
                            ? 'Issued'
                            : workspaceReady
                                ? 'Ready'
                                : 'Planned',
            tone:
                currentState === 'dispute_frozen' || currentState === 'revoked_session'
                    ? 'rose'
                    : simulatedSessionIssued
                        ? 'cyan'
                        : workspaceReady
                            ? 'amber'
                            : 'slate',
            credentialLabel:
                currentState === 'revoked_session'
                    ? `${checkout?.credentials.credentialId ?? 'Credential'} revoked`
                    : checkout?.credentials.credentialId ?? 'Credential pending',
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
                seed.advanced.rationale,
            releaseBoundary
        },
        watermark: {
            watermarkId,
            traceSummary: seed.traceSummary,
            auditPointer,
            reviewLinkage: seed.advanced.reviewLinkage,
            traceStatus: seed.advanced.traceStatus
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
        reviewerActionSummary,
        extensionRequest,
        sessionControl,
        artifactPreviews,
        events
    }
}
