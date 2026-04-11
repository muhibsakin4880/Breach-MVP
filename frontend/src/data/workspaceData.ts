import { requestReviewStateLabel, type RequestReviewState } from '../domain/accessContract'
import {
    DATASET_TRUST_PROFILE_LIBRARY,
    type DatasetTrustProfile
} from '../domain/datasetTrustProfile'

export type RequestStatus = RequestReviewState

export type DatasetRequest = {
    id: string
    requestNumber: string
    name: string
    confidence: number
    status: RequestStatus
    submittedDate: string
    lastUpdated: string
    category: string
    delivery: string
    organizationType: string
    intendedUsage: string
    duration: string
    requestedOutputs: string
    legalBasis: string
    rightsFit: string
    auditRequirement: string
    reviewerRationale: string
    reviewerNextStep: string
    reviewerFeedback?: string
    expectedResolution?: string
    notes?: string
    trustProfile: DatasetTrustProfile
}

export type ProviderReviewStatus = 'Needs provider review' | 'Awaiting clarification' | 'Actioned'

export type RequestReviewField = {
    label: string
    value: string
}

export type ApprovedDataset = {
    id: string
    name: string
    confidence: number
    lastUpdated: string
    expiry: string
    limits: string
    instructions: string
    usageScope: string[]
    accessRoute: string
    detailLink?: string
}

export type RecentActivityItem = {
    label: string
    timestamp: string
    type: 'success' | 'info' | 'pending' | 'error'
}

export type ParticipantActivityEvent = {
    label: string
    ts: string
    type: 'request' | 'approval' | 'contribution' | 'compliance'
    detail?: string
}

export const datasetRequests: DatasetRequest[] = [
    {
        id: 'fx-320',
        requestNumber: 'AR-2026-320',
        name: 'Financial Market Tick Data',
        confidence: 95,
        status: 'REQUEST_APPROVED',
        submittedDate: '2026-02-02',
        lastUpdated: '2026-02-12',
        category: 'Finance',
        delivery: 'S3 presigned + VPN',
        organizationType: 'Enterprise quant research desk',
        intendedUsage: 'Backtesting factor research models and replay analysis inside a governed workspace.',
        duration: '90 days',
        requestedOutputs: 'Factor diagnostics, simulated execution metrics, and aggregated model reports.',
        legalBasis: 'Commercial market-data licensing is assumed in the demo packet, with venue boundaries still requiring provider confirmation.',
        rightsFit: 'Aligned with research-only replay rights. No redistribution or customer-facing use was requested.',
        auditRequirement: 'Workspace session logging and replay export review are required.',
        reviewerRationale: 'Approved because the replay workflow stayed inside research-only rights and matched the scoped delivery route.',
        reviewerNextStep: 'Keep audit logging enabled and return for revalidation before the next 90-day window closes.',
        notes: 'Approved for quantitative research workspace. Revalidation every 90 days.',
        trustProfile: DATASET_TRUST_PROFILE_LIBRARY.marketData
    },
    {
        id: 'cl-204',
        requestNumber: 'AR-2026-204',
        name: 'Global Climate Observations 2020-2024',
        confidence: 96,
        status: 'REVIEW_IN_PROGRESS',
        submittedDate: '2026-02-06',
        lastUpdated: '2026-02-10',
        category: 'Climate Science',
        delivery: 'Workspace + API key',
        organizationType: 'Public climate-risk lab',
        intendedUsage: 'Climate risk scoring and resilience model calibration for flood exposure scenarios.',
        duration: '6 months',
        requestedOutputs: 'Derived risk scores, scenario summaries, and aggregated climate baselines.',
        legalBasis: 'Licensing basis is summarized in the demo packet, but provider confirmation is still required before live use.',
        rightsFit: 'Mostly aligned with resilience-planning scope, but downstream model-output intent still needs clarification.',
        auditRequirement: 'Scoped API logging and export review are required for regional control checks.',
        reviewerRationale: 'Pending because the request needs a narrower description of downstream model outputs before provider approval can proceed.',
        reviewerNextStep: 'Clarify whether outputs stay internal or will be embedded in customer-facing tooling.',
        reviewerFeedback: 'Reviewer requested clarification on intended downstream model outputs.',
        expectedResolution: 'Estimated by Feb 20, 2026',
        notes: 'Awaiting policy review for regional export controls.',
        trustProfile: DATASET_TRUST_PROFILE_LIBRARY.climateObservations
    },
    {
        id: 'nlp-118',
        requestNumber: 'AR-2026-118',
        name: 'Sentiment Analysis Corpus - Social Media',
        confidence: 89,
        status: 'REVIEW_IN_PROGRESS',
        submittedDate: '2026-02-04',
        lastUpdated: '2026-02-08',
        category: 'NLP & Text',
        delivery: 'API (awaiting approval)',
        organizationType: 'University policy lab',
        intendedUsage: 'Sentiment benchmark comparisons and prompt-evaluation research on moderated public-post corpora.',
        duration: '3 months',
        requestedOutputs: 'Model evaluation metrics and aggregate benchmark reports.',
        legalBasis: 'The sharing basis is only summarized at a mock level and still needs provider confirmation.',
        rightsFit: 'May exceed current aggregate-only rights until retention and moderation constraints are clarified.',
        auditRequirement: 'Mandatory audit logging with reviewer approval for any benchmark export.',
        reviewerRationale: 'Reviewer is holding the request because retention and moderation controls are not yet documented to match the benchmark workflow.',
        reviewerNextStep: 'Provide a narrower retention plan and confirm that outputs remain aggregate-only.',
        reviewerFeedback: 'Pending additional data retention and moderation compliance confirmation.',
        expectedResolution: 'Estimated by Feb 22, 2026',
        notes: 'External reviewer assigned for policy check.',
        trustProfile: DATASET_TRUST_PROFILE_LIBRARY.retailPanel
    },
    {
        id: 'med-441',
        requestNumber: 'AR-2026-441',
        name: 'Medical Imaging Dataset - Chest X-Rays',
        confidence: 92,
        status: 'REQUEST_REJECTED',
        submittedDate: '2026-01-29',
        lastUpdated: '2026-02-05',
        category: 'Healthcare',
        delivery: 'Secure enclave (declined)',
        organizationType: 'Healthcare AI startup',
        intendedUsage: 'Model validation against de-identified chest X-ray outcome cohorts.',
        duration: '12 months',
        requestedOutputs: 'Validation metrics, false-positive analysis, and aggregated performance summaries.',
        legalBasis: 'Clinical sharing basis and ethics coverage need reviewer confirmation before any live evaluation can be approved.',
        rightsFit: 'Not aligned yet because human-subject and institutional review evidence were incomplete.',
        auditRequirement: 'Safe-haven logging, output review, and named reviewer accountability are required.',
        reviewerRationale: 'Rejected because the request lacked full ethics approval and institutional review evidence for clinical validation.',
        reviewerNextStep: 'Attach a complete IRB package and resubmit with a narrower reviewed research scope.',
        reviewerFeedback: 'Rejected due to incomplete ethics approval and missing institutional review documentation.',
        notes: 'Resubmission allowed after full IRB package is attached.',
        trustProfile: DATASET_TRUST_PROFILE_LIBRARY.clinicalResearch
    },
    {
        id: 'urb-147',
        requestNumber: 'AR-2026-147',
        name: 'Urban Traffic Flow Patterns',
        confidence: 91,
        status: 'REQUEST_APPROVED',
        submittedDate: '2026-01-31',
        lastUpdated: '2026-02-09',
        category: 'Smart Cities',
        delivery: 'Streaming websocket + workspace',
        organizationType: 'Municipal transport analytics unit',
        intendedUsage: 'Traffic anomaly detection and congestion forecasting inside a governed municipal workspace.',
        duration: '3 months',
        requestedOutputs: 'Aggregate congestion indicators, route stress scores, and simulation summaries.',
        legalBasis: 'Governed operational analytics basis is assumed in the demo packet, with location controls still subject to provider confirmation.',
        rightsFit: 'Aligned with planning and forecasting scope. No direct location joins were requested.',
        auditRequirement: 'Region-scoped streaming audit logs and export review are mandatory.',
        reviewerRationale: 'Approved because the request stayed within aggregate planning scope and accepted region-scoped logging controls.',
        reviewerNextStep: 'Maintain aggregate-only outputs and return for review if direct location joins are added.',
        notes: 'Approved with streaming quota and audit logging enabled.',
        trustProfile: DATASET_TRUST_PROFILE_LIBRARY.mobilityTelemetry
    }
]

export const approvedDatasets: ApprovedDataset[] = [
    {
        id: 'fx-320',
        name: 'Financial Market Tick Data',
        confidence: 95,
        lastUpdated: '2026-02-12',
        expiry: 'Review on 2026-05-01',
        limits: 'API 75k calls/day; 100 GB export/month',
        instructions: 'Private S3 bucket with rotating presigned URLs. VPN required; keys scoped per workspace.',
        usageScope: ['Backtesting and factor research', 'Paper-trading simulations', 'Model performance dashboards'],
        accessRoute: 'S3 + VPN',
        detailLink: '/datasets/1'
    },
    {
        id: 'urb-147',
        name: 'Urban Traffic Flow Patterns',
        confidence: 91,
        lastUpdated: '2026-02-09',
        expiry: 'Expires 2026-04-18',
        limits: 'Streaming: 30 live connections; 4 TB monthly egress',
        instructions: 'Workspace notebooks pre-wired to streaming channel. Alerts enabled for anomaly spikes.',
        usageScope: ['Routing optimisation', 'Demand forecasting', 'Simulation of congestion scenarios'],
        accessRoute: 'Workspace + streaming channel',
        detailLink: '/datasets/1'
    }
]

export const recentActivity: RecentActivityItem[] = [
    {
        label: 'Access approved: Financial Market Tick Data',
        timestamp: 'Feb 16, 2026 - 09:20',
        type: 'success'
    },
    {
        label: 'Usage cap increased to 120 GPU hours for tick data workspace',
        timestamp: 'Feb 15, 2026 - 18:05',
        type: 'info'
    },
    {
        label: 'Pending review: Global Climate Observations 2020-2024',
        timestamp: 'Feb 14, 2026 - 12:40',
        type: 'pending'
    },
    {
        label: 'Request declined: E-Commerce Transaction Data 2023 (requires DUA)',
        timestamp: 'Feb 13, 2026 - 16:10',
        type: 'error'
    }
]

export const participantTrust = {
    score: 92,
    scoreDelta: 6,
    scoreDeltaLabel: '+6 since the last attestation cycle',
    misusePenalty: 12,
    level: 'Reviewed Participant',
    misuseWarning: 'Misuse flagged: export attempt outside approved scope',
    factors: [
        { label: 'Approved dataset participation', value: 90 },
        { label: 'Responsible data usage', value: 94 },
        { label: 'Positive feedback history', value: 88 },
        { label: 'Dataset contribution quality', value: 86 },
        { label: 'Compliance adherence', value: 95 },
        { label: 'Dispute / misuse penalties', value: 98 }
    ],
    timeline: [
        { label: 'Access approved: Financial Market Tick Data', ts: 'Feb 16, 2026' },
        { label: 'Compliance confirmation submitted', ts: 'Feb 15, 2026' },
        { label: 'Access request: Global Climate Observations', ts: 'Feb 14, 2026' },
        { label: 'Contribution uploaded: Mobility Sensor QA sample', ts: 'Feb 12, 2026' }
    ]
}

export const participantActivity: ParticipantActivityEvent[] = [
    {
        type: 'request',
        label: 'Access request submitted: Urban Mobility Sensor Streams',
        ts: 'Feb 17, 2026 - 09:40',
        detail: 'Awaiting provider review'
    },
    {
        type: 'approval',
        label: 'Access approved: Financial Market Tick Data',
        ts: 'Feb 16, 2026 - 09:20',
        detail: 'Privileges active in workspace'
    },
    {
        type: 'compliance',
        label: 'Compliance confirmation submitted',
        ts: 'Feb 15, 2026 - 15:05',
        detail: 'Acknowledged latest DUA version'
    },
    {
        type: 'contribution',
        label: 'Contribution uploaded: Mobility Sensor QA sample',
        ts: 'Feb 12, 2026 - 10:15',
        detail: 'Passed automated integrity checks'
    }
]

export const statusStyles: Record<RequestStatus, string> = {
    REQUEST_APPROVED: 'border-emerald-500/60 bg-emerald-500/10 text-emerald-200',
    REVIEW_IN_PROGRESS: 'border-amber-400/60 bg-amber-500/10 text-amber-200',
    REQUEST_REJECTED: 'border-rose-500/60 bg-rose-500/10 text-rose-200'
}

export const requestStatusLabel = (status: RequestStatus) => requestReviewStateLabel(status)

export const getProviderReviewStatus = (request: DatasetRequest): ProviderReviewStatus => {
    if (request.status !== 'REVIEW_IN_PROGRESS') return 'Actioned'
    if (request.reviewerFeedback) return 'Awaiting clarification'
    return 'Needs provider review'
}

export const providerReviewStatusStyles: Record<ProviderReviewStatus, string> = {
    'Needs provider review': 'border-cyan-500/30 bg-cyan-500/10 text-cyan-100',
    'Awaiting clarification': 'border-amber-500/30 bg-amber-500/10 text-amber-100',
    Actioned: 'border-slate-600 bg-slate-800/80 text-slate-200'
}

export const buildRequestBasisFields = (request: DatasetRequest): RequestReviewField[] => [
    { label: 'Organization type', value: request.organizationType },
    { label: 'Requested purpose', value: request.intendedUsage },
    { label: 'Requested outputs', value: request.requestedOutputs },
    { label: 'Duration', value: request.duration },
    { label: 'Delivery route', value: request.delivery }
]

export const buildRequestComplianceFields = (request: DatasetRequest): RequestReviewField[] => [
    { label: 'Legal basis', value: request.legalBasis },
    { label: 'Rights fit', value: request.rightsFit },
    { label: 'Sensitivity', value: request.trustProfile.sensitivity.value },
    { label: 'Re-id risk', value: request.trustProfile.reidentificationRisk.value },
    { label: 'Audit requirement', value: request.auditRequirement },
    { label: 'Responsibility boundary', value: request.trustProfile.responsibilityBoundary.value }
]

export const buildRequestReviewerFields = (request: DatasetRequest): RequestReviewField[] => {
    const queueStatus = getProviderReviewStatus(request)

    return [
        { label: 'Provider queue state', value: queueStatus },
        { label: 'Reviewer rationale', value: request.reviewerRationale },
        {
            label: 'Reviewer note',
            value:
                request.reviewerFeedback ??
                (request.status === 'REQUEST_APPROVED'
                    ? 'No additional reviewer note is blocking this approved request.'
                    : 'Reviewer note is still being prepared.')
        },
        {
            label: 'Expected resolution',
            value:
                request.status === 'REVIEW_IN_PROGRESS'
                    ? request.expectedResolution ?? 'Resolution timing will be shared after reviewer assignment.'
                    : 'No pending review window'
        },
        { label: 'Next step', value: request.reviewerNextStep },
        {
            label: 'Notes',
            value: request.notes ?? 'No additional notes are attached to this request.'
        }
    ]
}

export const activityDot: Record<RecentActivityItem['type'], string> = {
    success: 'bg-emerald-400',
    info: 'bg-cyan-400',
    pending: 'bg-amber-400',
    error: 'bg-rose-400'
}

export const participantActivityStyles: Record<ParticipantActivityEvent['type'], { dot: string; label: string }> = {
    request: { dot: 'bg-blue-400', label: 'Access request' },
    approval: { dot: 'bg-emerald-400', label: 'Access approved' },
    contribution: { dot: 'bg-violet-400', label: 'Contribution uploaded' },
    compliance: { dot: 'bg-amber-300', label: 'Compliance confirmation' }
}

export const confidenceColor = (score: number) => {
    if (score >= 95) return 'text-emerald-300'
    if (score >= 90) return 'text-cyan-300'
    if (score >= 85) return 'text-amber-300'
    return 'text-rose-300'
}

export const getParticipantNetTrustScore = (trust = participantTrust) => Math.max(trust.score - (trust.misuseWarning ? trust.misusePenalty : 0), 0)

export const trustLevel = (score: number) => {
    if (score >= 95) {
        return {
            label: 'High-Confidence Participant',
            classes: 'bg-emerald-500/15 border-emerald-400 text-emerald-200',
            toneClassName: 'text-emerald-300'
        }
    }
    if (score >= 90) {
        return {
            label: 'Reviewed Participant',
            classes: 'bg-green-500/15 border-green-400 text-green-200',
            toneClassName: 'text-green-300'
        }
    }
    if (score >= 80) {
        return {
            label: 'Established Participant',
            classes: 'bg-cyan-500/15 border-cyan-400 text-cyan-200',
            toneClassName: 'text-cyan-300'
        }
    }
    return {
        label: 'New Participant',
        classes: 'bg-slate-700 border-slate-500 text-slate-200',
        toneClassName: 'text-slate-300'
    }
}
