import { buildContractAlertFeed, type AlertSeverity } from './alertCenter'
import { buildContractControlTowerSnapshot } from './controlTower'
import { buildDecisionGateReport } from './decisionGate'
import type { ResilienceDigest } from './resilienceInsights'

export type RemediationSeverity = 'critical' | 'high' | 'medium' | 'low'

export type RemediationTask = {
    id: string
    contractId: string
    severity: RemediationSeverity
    priorityScore: number
    title: string
    detail: string
    owner: string
    dueInHours: number
    nextAction: string
    blockers: string[]
    signals: string[]
}

export type RemediationQueue = {
    generatedAt: string
    contractsMonitored: number
    tasks: RemediationTask[]
    criticalCount: number
    highCount: number
    mediumCount: number
    lowCount: number
    topTask?: RemediationTask
}

const severityRank: Record<RemediationSeverity, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1
}

const severityFromAlert = (alertSeverity: AlertSeverity, gateStatus: 'ready' | 'conditional' | 'hold'): RemediationSeverity => {
    if (alertSeverity === 'critical' || gateStatus === 'hold') return 'critical'
    if (alertSeverity === 'warning' || gateStatus === 'conditional') return 'high'
    return 'medium'
}

const dueWindowForSeverity = (severity: RemediationSeverity) => {
    if (severity === 'critical') return 1
    if (severity === 'high') return 6
    if (severity === 'medium') return 24
    return 48
}

const boostForSeverity = (severity: RemediationSeverity) => {
    if (severity === 'critical') return 20
    if (severity === 'high') return 10
    if (severity === 'medium') return 0
    return -10
}

const monitoringTask = (contractId: string, priorityScore: number): RemediationTask => ({
    id: `${contractId}-monitoring`,
    contractId,
    severity: 'low',
    priorityScore,
    title: 'Continue monitored operations',
    detail: 'No urgent remediation required. Keep telemetry and policy checks active.',
    owner: 'Workflow Owner',
    dueInHours: 48,
    nextAction: 'Review next scheduled control checkpoint',
    blockers: [],
    signals: ['All major signals are stable']
})

export const buildRemediationQueue = (digests: ResilienceDigest[]): RemediationQueue => {
    const generatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
    const tasks: RemediationTask[] = []

    for (const digest of digests) {
        const feed = buildContractAlertFeed(
            digest.contractId,
            digest.role,
            digest.state,
            digest.pendingReleaseCount ?? 0
        )
        const tower = buildContractControlTowerSnapshot(
            digest.contractId,
            digest.role,
            digest.state,
            digest.pendingReleaseCount ?? 0
        )
        const gate = buildDecisionGateReport(
            digest.contractId,
            digest.role,
            digest.state,
            digest.pendingReleaseCount ?? 0
        )

        const topAlert = feed.alerts[0]
        if (!topAlert || topAlert.severity === 'info') {
            tasks.push(monitoringTask(digest.contractId, Math.max(10, tower.priorityScore - 20)))
            continue
        }

        const severity = severityFromAlert(topAlert.severity, gate.status)
        const priorityScore = Math.max(0, Math.min(100, tower.priorityScore + boostForSeverity(severity)))
        const blockers =
            gate.status === 'hold'
                ? gate.blockers.filter(item => item !== 'No blocking conditions.')
                : []

        const signals = [
            `State priority ${tower.priorityScore}/100`,
            `SLA status ${tower.slaStatus}`,
            `Gate status ${gate.status}`,
            `Alerts ${feed.criticalCount} critical / ${feed.warningCount} warning`
        ]

        tasks.push({
            id: `${digest.contractId}-${topAlert.id}`,
            contractId: digest.contractId,
            severity,
            priorityScore,
            title: topAlert.title,
            detail: topAlert.detail,
            owner: topAlert.owner,
            dueInHours: dueWindowForSeverity(severity),
            nextAction: topAlert.actionLabel,
            blockers,
            signals
        })
    }

    tasks.sort((a, b) => {
        const severityDelta = severityRank[b.severity] - severityRank[a.severity]
        if (severityDelta !== 0) return severityDelta
        return b.priorityScore - a.priorityScore
    })

    return {
        generatedAt,
        contractsMonitored: digests.length,
        tasks,
        criticalCount: tasks.filter(task => task.severity === 'critical').length,
        highCount: tasks.filter(task => task.severity === 'high').length,
        mediumCount: tasks.filter(task => task.severity === 'medium').length,
        lowCount: tasks.filter(task => task.severity === 'low').length,
        topTask: tasks[0]
    }
}

