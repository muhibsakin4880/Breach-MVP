import type { ContractLifecycleState } from './accessContract'
import { evaluateDemoContractHealth } from './contractHealth'
import { buildContractControlTowerSnapshot } from './controlTower'
import { buildDecisionGateReport } from './decisionGate'
import { buildPolicyAttestation } from './policyAttestation'
import type { ResilienceDigest } from './resilienceInsights'
import type { TransitionRole } from './transitionSimulator'

export type AlertSeverity = 'info' | 'warning' | 'critical'

export type ContractAlert = {
    id: string
    contractId: string
    severity: AlertSeverity
    source: string
    title: string
    detail: string
    owner: string
    responseBy: string
    actionLabel: string
}

export type ContractAlertFeed = {
    contractId: string
    role: TransitionRole
    state: ContractLifecycleState
    alerts: ContractAlert[]
    criticalCount: number
    warningCount: number
    infoCount: number
}

export type PortfolioAlertSummary = {
    contractsMonitored: number
    totalAlerts: number
    criticalCount: number
    warningCount: number
    infoCount: number
    topAlerts: ContractAlert[]
}

const severityWeight: Record<AlertSeverity, number> = {
    critical: 3,
    warning: 2,
    info: 1
}

const responseWindowFor = (severity: AlertSeverity): string => {
    if (severity === 'critical') return 'Within 1 hour'
    if (severity === 'warning') return 'Within 8 hours'
    return 'Within 24 hours'
}

const pushAlert = (
    alerts: ContractAlert[],
    contractId: string,
    severity: AlertSeverity,
    source: string,
    title: string,
    detail: string,
    owner: string,
    actionLabel: string
) => {
    const nextId = `${contractId}-${source.toLowerCase().replace(/\s+/g, '-')}-${alerts.length + 1}`
    alerts.push({
        id: nextId,
        contractId,
        severity,
        source,
        title,
        detail,
        owner,
        responseBy: responseWindowFor(severity),
        actionLabel
    })
}

export const buildContractAlertFeed = (
    contractId: string,
    role: TransitionRole,
    state: ContractLifecycleState,
    pendingReleaseCount = 0
): ContractAlertFeed => {
    const health = evaluateDemoContractHealth(contractId, state)
    const tower = buildContractControlTowerSnapshot(contractId, role, state, pendingReleaseCount)
    const attestation = buildPolicyAttestation(contractId, role, state, pendingReleaseCount)
    const gate = buildDecisionGateReport(contractId, role, state, pendingReleaseCount)
    const alerts: ContractAlert[] = []

    if (gate.status === 'hold') {
        pushAlert(
            alerts,
            contractId,
            'critical',
            'Decision Gate',
            'Execution blocked by gate policy',
            gate.blockers[0],
            'Operations Lead',
            'Resolve blockers'
        )
    } else if (gate.status === 'conditional') {
        pushAlert(
            alerts,
            contractId,
            'warning',
            'Decision Gate',
            'Conditional checks pending',
            gate.conditions[0],
            'Workflow Owner',
            'Complete conditional checks'
        )
    }

    if (attestation.overallStatus === 'fail') {
        pushAlert(
            alerts,
            contractId,
            'critical',
            'Policy Attestation',
            'Control attestation failure',
            attestation.criticalGaps[0],
            'Policy Engine',
            'Close failed controls'
        )
    } else if (attestation.overallStatus === 'warn') {
        pushAlert(
            alerts,
            contractId,
            'warning',
            'Policy Attestation',
            'Control warnings require follow-up',
            attestation.criticalGaps[0],
            'Policy Engine',
            'Complete warning controls'
        )
    }

    if (tower.slaStatus === 'breached') {
        pushAlert(
            alerts,
            contractId,
            'critical',
            'Control Tower',
            'SLA breached',
            `SLA breached by ${Math.abs(tower.slaRemainingHours)}h.`,
            'Operations Lead',
            'Escalate incident'
        )
    } else if (tower.slaStatus === 'at_risk') {
        pushAlert(
            alerts,
            contractId,
            'warning',
            'Control Tower',
            'SLA at risk',
            `SLA has only ${tower.slaRemainingHours}h remaining.`,
            'Operations Lead',
            'Expedite next action'
        )
    }

    if (health.severity === 'critical') {
        pushAlert(
            alerts,
            contractId,
            'critical',
            'Contract Health',
            'Critical integrity findings detected',
            health.findings[0],
            'Security Reviewer',
            'Triage integrity incident'
        )
    } else if (health.severity === 'watch') {
        pushAlert(
            alerts,
            contractId,
            'warning',
            'Contract Health',
            'Contract needs attention',
            health.findings[0],
            'Security Reviewer',
            'Address health findings'
        )
    }

    if (tower.recommendedAction && !tower.recommendedAction.allowed) {
        pushAlert(
            alerts,
            contractId,
            'warning',
            'Action Planner',
            'Recommended action is currently blocked',
            tower.recommendedAction.reason,
            'Workflow Owner',
            'Align lifecycle prerequisites'
        )
    }

    if (alerts.length === 0) {
        pushAlert(
            alerts,
            contractId,
            'info',
            'Alert Center',
            'No active alerts',
            'Current contract signals are stable.',
            'Workflow Owner',
            'Continue monitoring'
        )
    }

    alerts.sort((a, b) => severityWeight[b.severity] - severityWeight[a.severity])

    return {
        contractId,
        role,
        state,
        alerts,
        criticalCount: alerts.filter(alert => alert.severity === 'critical').length,
        warningCount: alerts.filter(alert => alert.severity === 'warning').length,
        infoCount: alerts.filter(alert => alert.severity === 'info').length
    }
}

export const buildPortfolioAlertSummary = (digests: ResilienceDigest[]): PortfolioAlertSummary => {
    const allAlerts = digests.flatMap(digest =>
        buildContractAlertFeed(
            digest.contractId,
            digest.role,
            digest.state,
            digest.pendingReleaseCount ?? 0
        ).alerts
    )

    const sortedAlerts = [...allAlerts].sort((a, b) => severityWeight[b.severity] - severityWeight[a.severity])

    return {
        contractsMonitored: digests.length,
        totalAlerts: allAlerts.length,
        criticalCount: allAlerts.filter(alert => alert.severity === 'critical').length,
        warningCount: allAlerts.filter(alert => alert.severity === 'warning').length,
        infoCount: allAlerts.filter(alert => alert.severity === 'info').length,
        topAlerts: sortedAlerts.slice(0, 5)
    }
}

