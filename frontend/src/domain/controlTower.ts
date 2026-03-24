import { CONTRACT_STATE_LABELS, type ContractLifecycleState } from './accessContract'
import { buildDemoAuditTimeline } from './auditTimeline'
import { evaluateDemoContractHealth } from './contractHealth'
import {
    listTransitionActions,
    type TransitionActionId,
    type TransitionRole
} from './transitionSimulator'

export type SlaStatus = 'healthy' | 'at_risk' | 'breached'
export type PriorityBand = 'low' | 'medium' | 'high' | 'critical'

export type ContractControlTowerSnapshot = {
    contractId: string
    role: TransitionRole
    state: ContractLifecycleState
    stateLabel: string
    priorityBand: PriorityBand
    priorityScore: number
    slaTargetHours: number
    slaRemainingHours: number
    slaStatus: SlaStatus
    healthScore: number
    auditEventCount: number
    recommendedAction?: {
        id: TransitionActionId
        label: string
        allowed: boolean
        reason: string
    }
    rationale: string[]
    escalationPath: string[]
}

const SLA_TARGET_HOURS: Record<ContractLifecycleState, number> = {
    REQUEST_SUBMITTED: 24,
    REVIEW_IN_PROGRESS: 18,
    REQUEST_APPROVED: 12,
    FUNDS_HELD: 8,
    ACCESS_ACTIVE: 12,
    RELEASE_PENDING: 6,
    RELEASED_TO_PROVIDER: 72,
    DISPUTE_OPEN: 4,
    RESOLVED_REFUND: 72,
    RESOLVED_RELEASE: 72,
    REQUEST_REJECTED: 48,
    CANCELLED: 48
}

const STATE_PRIORITY_BASE: Record<ContractLifecycleState, number> = {
    REQUEST_SUBMITTED: 35,
    REVIEW_IN_PROGRESS: 45,
    REQUEST_APPROVED: 40,
    FUNDS_HELD: 55,
    ACCESS_ACTIVE: 60,
    RELEASE_PENDING: 78,
    RELEASED_TO_PROVIDER: 20,
    DISPUTE_OPEN: 92,
    RESOLVED_REFUND: 15,
    RESOLVED_RELEASE: 15,
    REQUEST_REJECTED: 25,
    CANCELLED: 10
}

const ACTION_PREFERENCE: Record<TransitionRole, Partial<Record<ContractLifecycleState, TransitionActionId[]>>> = {
    buyer: {
        RELEASE_PENDING: ['release_payment', 'open_dispute', 'extend_window'],
        ACCESS_ACTIVE: ['open_dispute', 'extend_window'],
        FUNDS_HELD: ['extend_window']
    },
    reviewer: {
        REVIEW_IN_PROGRESS: ['approve_with_conditions', 'escalate_dual_approval', 'reject_request'],
        REQUEST_APPROVED: ['approve_with_conditions'],
        REQUEST_REJECTED: ['escalate_dual_approval']
    },
    admin: {
        DISPUTE_OPEN: ['resolve_refund', 'resolve_release', 'escalate_legal'],
        RELEASE_PENDING: ['release_now', 'release_all_pending'],
        ACCESS_ACTIVE: ['release_all_pending']
    }
}

const priorityBandFor = (score: number): PriorityBand => {
    if (score >= 85) return 'critical'
    if (score >= 65) return 'high'
    if (score >= 40) return 'medium'
    return 'low'
}

const hashToHourOffset = (contractId: string, state: ContractLifecycleState, target: number) => {
    const raw = `${contractId}-${state}`
    const sum = raw.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
    const cycle = Math.max(1, target + 6)
    return sum % cycle
}

const slaStatusFor = (remainingHours: number): SlaStatus => {
    if (remainingHours <= 0) return 'breached'
    if (remainingHours <= 3) return 'at_risk'
    return 'healthy'
}

const preferredActionIds = (role: TransitionRole, state: ContractLifecycleState): TransitionActionId[] => {
    return ACTION_PREFERENCE[role][state] ?? []
}

const selectRecommendedAction = (
    role: TransitionRole,
    state: ContractLifecycleState,
    pendingReleaseCount: number
) => {
    const actions = listTransitionActions(role, state, pendingReleaseCount)
    if (actions.length === 0) return undefined

    const preferred = preferredActionIds(role, state)
    const preferredAllowed = preferred
        .map(id => actions.find(action => action.id === id))
        .find((action): action is NonNullable<typeof action> => Boolean(action?.allowed))
    if (preferredAllowed) return preferredAllowed

    const firstAllowed = actions.find(action => action.allowed)
    if (firstAllowed) return firstAllowed

    return actions[0]
}

const escalationPathFor = (status: SlaStatus, role: TransitionRole): string[] => {
    if (status === 'healthy') {
        return ['Continue normal workflow cadence.', 'Re-check contract health after next transition.']
    }

    if (status === 'at_risk') {
        return [
            'Flag contract as at-risk in control queue.',
            `Notify ${role} owner and backup reviewer.`,
            'Complete runbook checks before SLA breach.'
        ]
    }

    return [
        'Escalate contract to incident priority lane.',
        'Freeze non-essential state changes until triage completes.',
        'Require admin sign-off for final resolution action.'
    ]
}

export const buildContractControlTowerSnapshot = (
    contractId: string,
    role: TransitionRole,
    state: ContractLifecycleState,
    pendingReleaseCount = 0
): ContractControlTowerSnapshot => {
    const health = evaluateDemoContractHealth(contractId, state)
    const audit = buildDemoAuditTimeline(contractId, state)
    const recommendedAction = selectRecommendedAction(role, state, pendingReleaseCount)
    const slaTargetHours = SLA_TARGET_HOURS[state]
    const elapsed = hashToHourOffset(contractId, state, slaTargetHours)
    const slaRemainingHours = slaTargetHours - elapsed
    const slaStatus = slaStatusFor(slaRemainingHours)

    const score =
        STATE_PRIORITY_BASE[state] +
        (health.severity === 'critical' ? 22 : health.severity === 'watch' ? 12 : -4) +
        (slaStatus === 'breached' ? 18 : slaStatus === 'at_risk' ? 9 : 0) +
        (recommendedAction?.allowed ? -2 : 8)

    const priorityScore = Math.max(0, Math.min(100, score))
    const priorityBand = priorityBandFor(priorityScore)
    const rationale: string[] = [
        `State focus: ${CONTRACT_STATE_LABELS[state]}.`,
        `Health score is ${health.score}/100 with ${health.findings.length} finding(s).`,
        slaStatus === 'healthy'
            ? `SLA has ${slaRemainingHours}h remaining.`
            : slaStatus === 'at_risk'
              ? `SLA is at risk with ${slaRemainingHours}h remaining.`
              : `SLA breached by ${Math.abs(slaRemainingHours)}h.`,
        `Audit coverage has ${audit.length} immutable event(s).`
    ]

    return {
        contractId,
        role,
        state,
        stateLabel: CONTRACT_STATE_LABELS[state],
        priorityBand,
        priorityScore,
        slaTargetHours,
        slaRemainingHours,
        slaStatus,
        healthScore: health.score,
        auditEventCount: audit.length,
        recommendedAction,
        rationale,
        escalationPath: escalationPathFor(slaStatus, role)
    }
}

