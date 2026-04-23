export type DiscoveryReviewTone = 'healthy' | 'monitoring' | 'scheduled'

export type DiscoveryReviewState =
    | 'shortlisted'
    | 'committee_review'
    | 'needs_governance_input'
    | 'awaiting_provider_clarification'
    | 'rejected_for_now'

export type DiscoveryReviewStateMeta = {
    value: DiscoveryReviewState
    label: string
    shortLabel: string
    tone: DiscoveryReviewTone
    summary: string
}

export const DEFAULT_DISCOVERY_REVIEW_STATE: DiscoveryReviewState = 'shortlisted'

export const DISCOVERY_REVIEW_STATE_META: Record<DiscoveryReviewState, DiscoveryReviewStateMeta> = {
    shortlisted: {
        value: 'shortlisted',
        label: 'Shortlisted',
        shortLabel: 'Shortlisted',
        tone: 'scheduled',
        summary:
            'Tracked as a viable opportunity while the buyer team decides whether to advance into committee review, governance review, or provider follow-up.'
    },
    committee_review: {
        value: 'committee_review',
        label: 'Under committee review',
        shortLabel: 'Committee review',
        tone: 'scheduled',
        summary:
            'Internal reviewers are ranking the opportunity against other candidates before moving into a governed evaluation path.'
    },
    needs_governance_input: {
        value: 'needs_governance_input',
        label: 'Needs governance input',
        shortLabel: 'Needs governance',
        tone: 'monitoring',
        summary:
            'Privacy, legal, or governance reviewers need to weigh in before the opportunity should move into a broader evaluation lane.'
    },
    awaiting_provider_clarification: {
        value: 'awaiting_provider_clarification',
        label: 'Awaiting provider clarification',
        shortLabel: 'Awaiting clarification',
        tone: 'monitoring',
        summary:
            'The buyer team needs a provider-side answer, rights clarification, or scope change before internal review can continue cleanly.'
    },
    rejected_for_now: {
        value: 'rejected_for_now',
        label: 'Rejected for now',
        shortLabel: 'Rejected for now',
        tone: 'monitoring',
        summary:
            'The opportunity is being held back for this cycle without deleting it from the tracked decision set.'
    }
}

export const DISCOVERY_REVIEW_STATE_OPTIONS = Object.values(DISCOVERY_REVIEW_STATE_META)
