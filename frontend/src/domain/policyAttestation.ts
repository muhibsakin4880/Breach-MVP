import { CONTRACT_STATE_LABELS, type ContractLifecycleState } from './accessContract'
import { buildDemoAuditTimeline } from './auditTimeline'
import { evaluateDemoContractHealth } from './contractHealth'
import { buildContractControlTowerSnapshot } from './controlTower'
import type { TransitionRole } from './transitionSimulator'

export type AttestationStatus = 'pass' | 'warn' | 'fail'

export type PolicyControlCheck = {
    id: string
    label: string
    owner: string
    frameworkRefs: string[]
    status: AttestationStatus
    rationale: string
    evidencePointer: string
}

export type PolicyAttestationReport = {
    contractId: string
    role: TransitionRole
    state: ContractLifecycleState
    stateLabel: string
    overallStatus: AttestationStatus
    completionPercent: number
    passCount: number
    warnCount: number
    failCount: number
    nextGate: string
    criticalGaps: string[]
    checks: PolicyControlCheck[]
}

const ATT_STATUS_WEIGHT: Record<AttestationStatus, number> = {
    pass: 100,
    warn: 65,
    fail: 20
}

const statusFromHealth = (
    severity: 'healthy' | 'watch' | 'critical',
    hasMismatch: boolean
): AttestationStatus => {
    if (hasMismatch || severity === 'critical') return 'fail'
    if (severity === 'watch') return 'warn'
    return 'pass'
}

const gateForState = (state: ContractLifecycleState): string => {
    if (state === 'REQUEST_SUBMITTED' || state === 'REVIEW_IN_PROGRESS') return 'Review Approval Gate'
    if (state === 'REQUEST_APPROVED' || state === 'FUNDS_HELD') return 'Escrow Activation Gate'
    if (state === 'ACCESS_ACTIVE' || state === 'RELEASE_PENDING') return 'Settlement Decision Gate'
    if (state === 'DISPUTE_OPEN') return 'Dispute Resolution Gate'
    if (state === 'REQUEST_REJECTED' || state === 'CANCELLED') return 'Remediation/Recreate Gate'
    return 'Closure Gate'
}

const stateSupportsEscrowControls = (state: ContractLifecycleState) =>
    state === 'FUNDS_HELD' ||
    state === 'ACCESS_ACTIVE' ||
    state === 'RELEASE_PENDING' ||
    state === 'RELEASED_TO_PROVIDER' ||
    state === 'DISPUTE_OPEN' ||
    state === 'RESOLVED_REFUND' ||
    state === 'RESOLVED_RELEASE'

const stateRequiresDisputeReadiness = (state: ContractLifecycleState) =>
    state === 'ACCESS_ACTIVE' || state === 'RELEASE_PENDING' || state === 'DISPUTE_OPEN'

export const buildPolicyAttestation = (
    contractId: string,
    role: TransitionRole,
    state: ContractLifecycleState,
    pendingReleaseCount = 0
): PolicyAttestationReport => {
    const health = evaluateDemoContractHealth(contractId, state)
    const tower = buildContractControlTowerSnapshot(contractId, role, state, pendingReleaseCount)
    const audit = buildDemoAuditTimeline(contractId, state)
    const hasLifecycleMismatch = health.derivedState !== state

    const checks: PolicyControlCheck[] = [
        {
            id: 'lifecycle-consistency',
            label: 'Lifecycle Consistency',
            owner: 'Policy Engine',
            frameworkRefs: ['SOC2-CC7', 'ISO27001-A.8.32'],
            status: statusFromHealth(health.severity, hasLifecycleMismatch),
            rationale: hasLifecycleMismatch
                ? `Stored state ${CONTRACT_STATE_LABELS[state]} differs from derived ${CONTRACT_STATE_LABELS[health.derivedState]}.`
                : 'Stored lifecycle state aligns with derived contract state.',
            evidencePointer: `attest://${contractId.toLowerCase()}/lifecycle`
        },
        {
            id: 'audit-integrity',
            label: 'Audit Integrity',
            owner: 'Audit Service',
            frameworkRefs: ['SOC2-CC2', 'NIST-AU-3'],
            status: audit.length >= 4 ? 'pass' : audit.length >= 2 ? 'warn' : 'fail',
            rationale:
                audit.length >= 4
                    ? `${audit.length} immutable events recorded for this contract.`
                    : audit.length >= 2
                      ? `Audit depth is limited (${audit.length} events); expand evidence chain.`
                      : 'Insufficient immutable audit coverage.',
            evidencePointer: `attest://${contractId.toLowerCase()}/audit`
        },
        {
            id: 'escrow-control',
            label: 'Escrow Protection Controls',
            owner: 'Escrow Engine',
            frameworkRefs: ['SOC2-CC6', 'PCI-DSS-3'],
            status: stateSupportsEscrowControls(state) ? 'pass' : state === 'REQUEST_APPROVED' ? 'warn' : 'pass',
            rationale: stateSupportsEscrowControls(state)
                ? 'Escrow-managed controls are active for this lifecycle stage.'
                : state === 'REQUEST_APPROVED'
                  ? 'Escrow controls are pending activation at the next gate.'
                  : 'Escrow controls are not required yet for this lifecycle stage.',
            evidencePointer: `attest://${contractId.toLowerCase()}/escrow`
        },
        {
            id: 'sla-governance',
            label: 'SLA Governance',
            owner: 'Control Tower',
            frameworkRefs: ['ISO27001-A.5.36', 'NIST-IR-4'],
            status:
                tower.slaStatus === 'healthy'
                    ? 'pass'
                    : tower.slaStatus === 'at_risk'
                      ? 'warn'
                      : 'fail',
            rationale:
                tower.slaStatus === 'healthy'
                    ? `SLA has ${tower.slaRemainingHours}h remaining.`
                    : tower.slaStatus === 'at_risk'
                      ? `SLA at risk with ${tower.slaRemainingHours}h remaining.`
                      : `SLA breached by ${Math.abs(tower.slaRemainingHours)}h.`,
            evidencePointer: `attest://${contractId.toLowerCase()}/sla`
        },
        {
            id: 'dispute-readiness',
            label: 'Dispute Readiness',
            owner: 'Resolution Desk',
            frameworkRefs: ['SOC2-CC3', 'NIST-IR-5'],
            status:
                state === 'DISPUTE_OPEN'
                    ? 'pass'
                    : stateRequiresDisputeReadiness(state)
                      ? 'warn'
                      : 'pass',
            rationale:
                state === 'DISPUTE_OPEN'
                    ? 'Dispute workflow and freeze controls are active.'
                    : stateRequiresDisputeReadiness(state)
                      ? 'Dispute pathway should remain pre-validated for rapid escalation.'
                      : 'Dispute pathway not currently in active scope.',
            evidencePointer: `attest://${contractId.toLowerCase()}/dispute`
        }
    ]

    const passCount = checks.filter(check => check.status === 'pass').length
    const warnCount = checks.filter(check => check.status === 'warn').length
    const failCount = checks.filter(check => check.status === 'fail').length
    const completionRaw =
        checks.reduce((sum, check) => sum + ATT_STATUS_WEIGHT[check.status], 0) / Math.max(1, checks.length)
    const completionPercent = Math.round(completionRaw)

    const overallStatus: AttestationStatus =
        failCount > 0 ? 'fail' : warnCount > 0 ? 'warn' : 'pass'

    const criticalGaps = checks
        .filter(check => check.status === 'fail')
        .map(check => `${check.label}: ${check.rationale}`)

    if (criticalGaps.length === 0 && warnCount > 0) {
        criticalGaps.push('No hard failures. Complete warning-level controls before advancing to next gate.')
    }
    if (criticalGaps.length === 0) {
        criticalGaps.push('No critical control gaps detected.')
    }

    return {
        contractId,
        role,
        state,
        stateLabel: CONTRACT_STATE_LABELS[state],
        overallStatus,
        completionPercent,
        passCount,
        warnCount,
        failCount,
        nextGate: gateForState(state),
        criticalGaps,
        checks
    }
}

