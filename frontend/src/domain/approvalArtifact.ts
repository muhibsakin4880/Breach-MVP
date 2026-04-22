import {
    getDecisionStatusLabel,
    getOrganizationReviewRecord,
    getPacketStatusLabel,
    normalizeReviewCopy,
    type ApprovalStageStatus,
    type OrganizationReviewDocument,
    type OrganizationReviewRecord
} from '../data/adminPilotOpsData'
import { buildDealDossierProofBundle, type DealArtifactPreview } from './dealArtifactPreview'
import { getDealRouteContextById, loadDealRouteContexts, type DealRouteContext } from './dealDossier'
import {
    buildProviderRightsPacket,
    loadProviderPacketDraft
} from './providerRightsPacket'

export type ApprovalSignoffKey =
    | 'privacy'
    | 'legal'
    | 'governance'
    | 'provider'
    | 'commercial'

export type ApprovalSignoffStatus =
    | 'Signed'
    | 'In review'
    | 'Blocked'
    | 'Pending'

export type ApprovalSignoff = {
    key: ApprovalSignoffKey
    label: string
    owner: string
    status: ApprovalSignoffStatus
    tone: 'slate' | 'cyan' | 'amber' | 'emerald' | 'rose'
    timestamp: string
    rationale: string
    blockers: string[]
    evidence: string[]
}

export type ApprovalArtifactReference = {
    label: string
    value: string
}

export type ApprovalArtifactModel = {
    artifactId: string
    title: string
    dealId: string
    reviewId: string | null
    organizationName: string
    overallStatus: string
    overallTone: 'slate' | 'cyan' | 'amber' | 'emerald' | 'rose'
    summary: string
    nextAction: string
    blockerCount: number
    signedCount: number
    reviewStatus: string
    packetStatus: string
    signoffs: ApprovalSignoff[]
    outstandingBlockers: string[]
    rationaleSummary: string[]
    references: ApprovalArtifactReference[]
    approvalMemoPreview: DealArtifactPreview | null
    context: DealRouteContext
    reviewRecord: OrganizationReviewRecord | null
}

const ROLE_TIMESTAMPS: Record<string, Partial<Record<ApprovalSignoffKey, string>>> = {
    'DL-1001': {
        privacy: '2026-03-30T14:42:00Z',
        legal: '2026-03-31T08:52:00Z',
        governance: '2026-03-31T09:16:00Z',
        provider: '2026-03-30T17:05:00Z',
        commercial: '2026-03-29T12:10:00Z'
    },
    'DL-1002': {
        privacy: '2026-03-29T11:18:00Z',
        legal: '2026-03-31T08:31:00Z',
        governance: '2026-03-31T09:04:00Z',
        provider: '2026-03-30T15:28:00Z',
        commercial: '2026-03-29T09:24:00Z'
    },
    'DL-1003': {
        privacy: '2026-03-31T07:46:00Z',
        legal: '2026-03-31T09:18:00Z',
        governance: '2026-03-31T09:24:00Z',
        provider: '2026-03-30T18:12:00Z',
        commercial: '2026-03-29T16:05:00Z'
    }
}

const formatTimestamp = (value?: string) => {
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

const formatUsd = (value: number) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(value)

const stageStatusToSignoffStatus = (status?: ApprovalStageStatus): ApprovalSignoffStatus => {
    if (status === 'complete') return 'Signed'
    if (status === 'active') return 'In review'
    if (status === 'blocked') return 'Blocked'
    return 'Pending'
}

const toneFromStatus = (
    status: ApprovalSignoffStatus
): ApprovalSignoff['tone'] => {
    if (status === 'Signed') return 'emerald'
    if (status === 'In review') return 'amber'
    if (status === 'Blocked') return 'rose'
    return 'slate'
}

const findStage = (
    record: OrganizationReviewRecord | null,
    patterns: RegExp[]
) =>
    record?.approvalChain.find(stage =>
        patterns.some(pattern => pattern.test(stage.stage))
    ) ?? null

const findDocuments = (
    record: OrganizationReviewRecord | null,
    patterns: RegExp[]
) =>
    record?.documents.filter(document =>
        patterns.some(pattern => pattern.test(`${document.label} ${document.detail}`))
    ) ?? []

const deriveStatusFromDocuments = (
    documents: OrganizationReviewDocument[]
): ApprovalSignoffStatus | null => {
    if (documents.some(document => document.status === 'missing')) return 'Blocked'
    if (documents.some(document => document.status === 'review')) return 'In review'
    if (documents.length > 0 && documents.every(document => document.status === 'ready')) return 'Signed'
    return null
}

const mapOverallTone = (signoffs: ApprovalSignoff[]) => {
    if (signoffs.some(signoff => signoff.status === 'Blocked')) return 'rose' as const
    if (signoffs.every(signoff => signoff.status === 'Signed')) return 'emerald' as const
    if (signoffs.some(signoff => signoff.status === 'In review')) return 'amber' as const
    if (signoffs.some(signoff => signoff.status === 'Pending')) return 'cyan' as const
    return 'slate' as const
}

const mapOverallStatus = (signoffs: ApprovalSignoff[]) => {
    if (signoffs.some(signoff => signoff.status === 'Blocked')) return 'Blocked by open signoff issue'
    if (signoffs.every(signoff => signoff.status === 'Signed')) return 'Signed for governed evaluation'
    if (signoffs.some(signoff => signoff.status === 'In review')) return 'Shared approval in review'
    return 'Awaiting signoff packet assembly'
}

const getTimestampForRole = (
    dealId: string,
    key: ApprovalSignoffKey,
    status: ApprovalSignoffStatus,
    fallback?: string
) => (status === 'Pending' ? 'Pending' : formatTimestamp(ROLE_TIMESTAMPS[dealId]?.[key] ?? fallback))

const findApprovalMemoPreview = (context: DealRouteContext) =>
    buildDealDossierProofBundle(context).artifactPreviews.find(
        artifact => artifact.artifactLabel === 'Approval memo preview'
    ) ?? null

function buildPrivacySignoff(
    context: DealRouteContext,
    record: OrganizationReviewRecord | null
): ApprovalSignoff {
    const proofBundle = buildDealDossierProofBundle(context)
    const stage = findStage(record, [/privacy/i, /ethics/i, /residency/i])
    const documents = findDocuments(record, [/privacy/i, /ethics/i, /residency/i, /moderation/i])
    const documentStatus = deriveStatusFromDocuments(documents)
    const blockers = [
        ...proofBundle.approvalBlockers
            .filter(blocker => /residency|privacy|ethics|export/i.test(blocker.blocker))
            .map(blocker => blocker.blocker),
        ...documents
            .filter(document => document.status !== 'ready')
            .map(document => document.detail)
    ]
    const status = stage
        ? stageStatusToSignoffStatus(stage.status)
        : documentStatus ?? (blockers.length > 0 ? 'In review' : 'Pending')

    return {
        key: 'privacy',
        label: 'Privacy signoff',
        owner: stage?.owner ?? 'Salman Farooq',
        status,
        tone: toneFromStatus(status),
        timestamp: getTimestampForRole(context.seed.dealId, 'privacy', status, record?.submittedAt),
        rationale: stage?.note
            ? normalizeReviewCopy(stage.note)
            : documents[0]?.detail ?? 'Reviewing handling scope, evidence visibility, and regional reviewer exposure before approval.',
        blockers,
        evidence: documents.map(document => document.label).slice(0, 3)
    }
}

function buildLegalSignoff(
    context: DealRouteContext,
    record: OrganizationReviewRecord | null
): ApprovalSignoff {
    const proofBundle = buildDealDossierProofBundle(context)
    const stage = findStage(record, [/legal/i, /rights/i, /policy/i, /controls/i])
    const documents = findDocuments(record, [/rights/i, /legal/i, /policy/i, /controls/i, /mandate/i])
    const documentStatus = deriveStatusFromDocuments(documents)
    const blockers = [
        ...proofBundle.approvalBlockers
            .filter(blocker => /rights|legal|policy|registry|authenticity/i.test(blocker.blocker))
            .map(blocker => blocker.blocker),
        ...documents
            .filter(document => document.status !== 'ready')
            .map(document => document.detail)
    ]
    const status = stage
        ? stageStatusToSignoffStatus(stage.status)
        : documentStatus ?? (blockers.length > 0 ? 'In review' : 'Pending')

    return {
        key: 'legal',
        label: 'Legal signoff',
        owner: stage?.owner ?? record?.owner ?? 'Layla Haddad',
        status,
        tone: toneFromStatus(status),
        timestamp: getTimestampForRole(context.seed.dealId, 'legal', status, record?.reviewDeadline),
        rationale: stage?.note
            ? normalizeReviewCopy(stage.note)
            : proofBundle.evidencePack?.blocker ?? 'Validating the publishing basis, rights schedule, and evidence completeness before approval.',
        blockers,
        evidence: documents.map(document => document.label).slice(0, 3)
    }
}

function buildGovernanceSignoff(
    context: DealRouteContext,
    record: OrganizationReviewRecord | null
): ApprovalSignoff {
    const proofBundle = buildDealDossierProofBundle(context)
    const stage = findStage(record, [/protected evaluation approval/i, /approval/i])
    const blockers = proofBundle.approvalBlockers.map(blocker => blocker.blocker)
    let status: ApprovalSignoffStatus = 'Pending'

    if (context.lifecycleRecord?.approvalDisposition === 'auto_advance' || record?.decisionStatus === 'Pilot approved') {
        status = 'Signed'
    } else if (
        context.lifecycleRecord?.approvalDisposition === 'blocked' ||
        proofBundle.evidencePack?.status === 'Blocked'
    ) {
        status = 'Blocked'
    } else if (
        context.lifecycleRecord?.approvalDisposition === 'human_review' ||
        proofBundle.evidencePack?.status === 'In Review' ||
        stage?.status === 'active'
    ) {
        status = 'In review'
    }

    return {
        key: 'governance',
        label: 'Governance signoff',
        owner: stage?.owner ?? record?.owner ?? 'Faris Noor',
        status,
        tone: toneFromStatus(status),
        timestamp: getTimestampForRole(context.seed.dealId, 'governance', status, context.checkoutRecord?.updatedAt),
        rationale: proofBundle.evaluationState.summary,
        blockers,
        evidence: [
            proofBundle.reviewId ? `Review ${proofBundle.reviewId}` : 'No linked review id',
            proofBundle.evidencePack?.name ?? 'No evidence pack attached',
            proofBundle.evaluationState.status
        ]
    }
}

function buildProviderSignoff(context: DealRouteContext): ApprovalSignoff {
    const packet = buildProviderRightsPacket(context, loadProviderPacketDraft(context.seed.dealId))
    const unsignedApprovers = packet.namedApprovers.filter(approver => approver.status !== 'Signed')
    const highException = packet.unresolvedExceptions.some(exception => exception.severity === 'High')
    const status: ApprovalSignoffStatus =
        highException
            ? 'Blocked'
            : packet.namedApprovers.every(approver => approver.status === 'Signed') &&
                packet.unresolvedExceptions.length === 0
                ? 'Signed'
                : packet.namedApprovers.length > 0
                    ? 'In review'
                    : 'Pending'

    return {
        key: 'provider',
        label: 'Provider signoff',
        owner: packet.publishingAuthority.owner,
        status,
        tone: toneFromStatus(status),
        timestamp: getTimestampForRole(context.seed.dealId, 'provider', status, loadProviderPacketDraft(context.seed.dealId).updatedAt),
        rationale: packet.publishingAuthority.summary,
        blockers: [
            ...packet.unresolvedExceptions.map(exception => exception.title),
            ...unsignedApprovers.map(approver => `${approver.role} still ${approver.status.toLowerCase()}`)
        ].slice(0, 4),
        evidence: [
            packet.publishingAuthority.instrument,
            packet.provenance.confidenceLabel,
            ...packet.namedApprovers.slice(0, 2).map(approver => `${approver.role}: ${approver.name}`)
        ]
    }
}

function buildCommercialSignoff(context: DealRouteContext): ApprovalSignoff {
    const proofBundle = buildDealDossierProofBundle(context)
    const quote = context.quote
    const checkoutRecord = context.checkoutRecord

    let status: ApprovalSignoffStatus = 'Pending'
    const blockers: string[] = []

    if (!quote) {
        blockers.push('Rights package has not been saved yet.')
    } else if (checkoutRecord?.lifecycleState === 'DISPUTE_OPEN' || checkoutRecord?.outcomeProtection.credits.status === 'issued') {
        status = 'Blocked'
        blockers.push(
            checkoutRecord.outcomeProtection.validation.note ??
                'Settlement is frozen while the dispute or credit path is open.'
        )
    } else if (checkoutRecord) {
        status = 'Signed'
    } else {
        status = 'In review'
        blockers.push('Escrow funding and workspace issuance have not completed yet.')
    }

    return {
        key: 'commercial',
        label: 'Commercial signoff',
        owner: recordCommercialOwner(context, quote),
        status,
        tone: toneFromStatus(status),
        timestamp: getTimestampForRole(context.seed.dealId, 'commercial', status, checkoutRecord?.updatedAt),
        rationale: checkoutRecord
            ? proofBundle.settlementState.summary
            : quote
                ? `Rights scope priced at ${formatUsd(quote.totalUsd)} with ${formatUsd(quote.escrowHoldUsd)} held in escrow for evaluation.`
                : 'Commercial alignment begins once the rights package is priced and the evaluation path is funded.',
        blockers,
        evidence: [
            quote ? `${quote.id} · ${formatUsd(quote.totalUsd)}` : 'No quote linked',
            checkoutRecord ? `${checkoutRecord.id} · ${checkoutRecord.outcomeProtection.stage}` : 'No checkout record linked',
            proofBundle.settlementState.status
        ]
    }
}

function recordCommercialOwner(
    context: DealRouteContext,
    quote: DealRouteContext['quote']
) {
    const record = getOrganizationReviewRecord(buildDealDossierProofBundle(context).reviewId ?? '') ?? null
    const stage = findStage(record, [/pilot signoff/i, /final approval/i])
    return stage?.owner ?? record?.owner ?? (quote ? 'Omar Siddiqui' : 'Commercial review queue')
}

const buildArtifactFromContext = (
    context: DealRouteContext
): ApprovalArtifactModel => {
    const proofBundle = buildDealDossierProofBundle(context)
    const reviewRecord = proofBundle.reviewId ? getOrganizationReviewRecord(proofBundle.reviewId) ?? null : null
    const signoffs = [
        buildPrivacySignoff(context, reviewRecord),
        buildLegalSignoff(context, reviewRecord),
        buildGovernanceSignoff(context, reviewRecord),
        buildProviderSignoff(context),
        buildCommercialSignoff(context)
    ]
    const signedCount = signoffs.filter(signoff => signoff.status === 'Signed').length
    const blockerCount = signoffs.reduce(
        (count, signoff) => count + signoff.blockers.length,
        0
    )
    const overallStatus = mapOverallStatus(signoffs)
    const overallTone = mapOverallTone(signoffs)

    return {
        artifactId: `APR-${context.seed.dealId}`,
        title: 'Unified Approval & Signoff',
        dealId: context.seed.dealId,
        reviewId: proofBundle.reviewId,
        organizationName:
            reviewRecord?.organizationName ??
            context.request?.organizationType ??
            context.dataset?.category ??
            context.seed.label,
        overallStatus,
        overallTone,
        summary:
            overallTone === 'rose'
                ? 'One or more named signoff lanes are blocked, so the evaluation cannot progress without remediation.'
                : overallTone === 'emerald'
                    ? 'All named signoff lanes are aligned strongly enough for governed evaluation or release.'
                    : 'This approval artifact shows how privacy, legal, governance, provider, and commercial owners are currently converging.',
        nextAction:
            proofBundle.approvalBlockers[0]?.blocker ??
            context.lifecycleRecord?.nextAction ??
            reviewRecord?.nextAction ??
            'Continue the active review lane until all signoff owners are aligned.',
        blockerCount,
        signedCount,
        reviewStatus: reviewRecord ? getDecisionStatusLabel(reviewRecord.decisionStatus) : context.currentStageLabel,
        packetStatus: reviewRecord ? getPacketStatusLabel(reviewRecord.loiStatus) : proofBundle.evaluationState.status,
        signoffs,
        outstandingBlockers: signoffs.flatMap(signoff => signoff.blockers).slice(0, 8),
        rationaleSummary: reviewRecord?.summary.map(normalizeReviewCopy) ?? [
            proofBundle.evaluationState.summary,
            proofBundle.settlementState.summary
        ],
        references: [
            { label: 'Deal id', value: context.seed.dealId },
            { label: 'Review id', value: proofBundle.reviewId ?? 'Not linked' },
            { label: 'Evidence pack', value: proofBundle.evidencePack?.id ?? 'Pending' },
            { label: 'Provider packet', value: `PKT-${context.seed.dealId}` },
            { label: 'Quote id', value: context.quoteId ?? 'Pending' },
            { label: 'Checkout id', value: context.checkoutId ?? 'Pending' }
        ],
        approvalMemoPreview: findApprovalMemoPreview(context),
        context,
        reviewRecord
    }
}

export const getApprovalArtifactByDealId = (dealId?: string | null) => {
    const context = getDealRouteContextById(dealId)
    if (!context) return null
    return buildArtifactFromContext(context)
}

export const getApprovalArtifactByReviewId = (reviewId?: string | null) => {
    if (!reviewId) return null

    const context = loadDealRouteContexts().find(candidate => {
        const proofBundle = buildDealDossierProofBundle(candidate)
        return proofBundle.reviewId === reviewId
    })

    if (!context) return null
    return buildArtifactFromContext(context)
}
