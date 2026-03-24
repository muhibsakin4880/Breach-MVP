import { CONTRACT_STATE_LABELS, type ContractLifecycleState, type RequestReviewState } from './accessContract'

type GuardrailResult = {
    allowed: boolean
    reason: string
}

const createResult = (allowed: boolean, reason: string): GuardrailResult => ({ allowed, reason })

const stateListText = (states: ContractLifecycleState[]) =>
    states.map(state => CONTRACT_STATE_LABELS[state]).join(' or ')

export type BuyerEscrowAction = 'release_payment' | 'open_dispute' | 'extend_window'

const BUYER_ESCROW_POLICY: Record<BuyerEscrowAction, ContractLifecycleState[]> = {
    release_payment: ['RELEASE_PENDING'],
    open_dispute: ['ACCESS_ACTIVE', 'RELEASE_PENDING'],
    extend_window: ['FUNDS_HELD', 'ACCESS_ACTIVE', 'RELEASE_PENDING']
}

export const canPerformBuyerEscrowAction = (
    action: BuyerEscrowAction,
    state: ContractLifecycleState
): GuardrailResult => {
    const allowedStates = BUYER_ESCROW_POLICY[action]
    if (allowedStates.includes(state)) {
        return createResult(true, 'Allowed by lifecycle policy.')
    }

    return createResult(
        false,
        `Allowed only during ${stateListText(allowedStates)}. Current state is ${CONTRACT_STATE_LABELS[state]}.`
    )
}

export const canStartEscrowForRequest = (
    requestState: RequestReviewState,
    escrowActive: boolean
): GuardrailResult => {
    if (escrowActive) {
        return createResult(false, 'Escrow is already active for this request.')
    }

    if (requestState !== 'REQUEST_APPROVED') {
        return createResult(
            false,
            `Escrow can start only after ${CONTRACT_STATE_LABELS.REQUEST_APPROVED}. Current state is ${CONTRACT_STATE_LABELS[requestState]}.`
        )
    }

    return createResult(true, 'Request is approved and eligible for escrow.')
}

export type ReviewerAction = 'approve_with_conditions' | 'escalate_dual_approval' | 'reject_request'

export const canPerformReviewerAction = (
    action: ReviewerAction,
    state: RequestReviewState
): GuardrailResult => {
    if (state === 'REVIEW_IN_PROGRESS') {
        return createResult(true, 'Request is in reviewer workflow.')
    }

    if (action === 'approve_with_conditions') {
        return createResult(false, 'Approval is disabled because this request has already been decided.')
    }

    if (action === 'reject_request') {
        return createResult(false, 'Rejection is disabled because this request has already been decided.')
    }

    return createResult(false, 'Dual-approval escalation is only available while review is in progress.')
}

export type AdminEscrowAction =
    | 'resolve_refund'
    | 'resolve_release'
    | 'escalate_legal'
    | 'release_now'
    | 'release_all_pending'

export const canPerformAdminEscrowAction = (
    action: AdminEscrowAction,
    state: ContractLifecycleState,
    pendingReleaseCount = 0
): GuardrailResult => {
    if (action === 'release_all_pending') {
        if (pendingReleaseCount > 0) {
            return createResult(true, 'There are contracts waiting for release.')
        }
        return createResult(false, 'No contracts are currently in Release Pending.')
    }

    if (action === 'release_now') {
        if (state === 'RELEASE_PENDING') return createResult(true, 'Contract is release-ready.')
        return createResult(false, `Release is allowed only in ${CONTRACT_STATE_LABELS.RELEASE_PENDING}.`)
    }

    if (action === 'resolve_refund' || action === 'resolve_release' || action === 'escalate_legal') {
        if (state === 'DISPUTE_OPEN') return createResult(true, 'Dispute is open for resolution.')
        return createResult(false, `Dispute actions require ${CONTRACT_STATE_LABELS.DISPUTE_OPEN}.`)
    }

    return createResult(false, 'Action is blocked by policy.')
}
