import { useMemo } from 'react'
import type { ContractLifecycleState } from '../domain/accessContract'
import { buildContractAlertFeed, type AlertSeverity, type ContractAlert } from '../domain/alertCenter'
import type { TransitionRole } from '../domain/transitionSimulator'

type AlertCenterPanelProps = {
    contractId: string
    state: ContractLifecycleState
    role: TransitionRole
    title?: string
    compact?: boolean
    pendingReleaseCount?: number
    className?: string
}

const severityClasses: Record<AlertSeverity, string> = {
    info: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200',
    warning: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
    critical: 'border-rose-500/40 bg-rose-500/10 text-rose-200'
}

export default function AlertCenterPanel({
    contractId,
    state,
    role,
    title = 'Alert Center',
    compact = false,
    pendingReleaseCount = 0,
    className = ''
}: AlertCenterPanelProps) {
    const feed = useMemo(
        () => buildContractAlertFeed(contractId, role, state, pendingReleaseCount),
        [contractId, role, state, pendingReleaseCount]
    )
    const visibleAlerts = compact ? feed.alerts.slice(0, 3) : feed.alerts

    return (
        <section className={`rounded-xl border border-slate-700 bg-slate-900/70 p-4 ${className}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{title}</p>
                    <p className="mt-1 text-sm font-semibold text-white">
                        {feed.criticalCount} critical · {feed.warningCount} warning · {feed.infoCount} info
                    </p>
                </div>
                <span className="rounded-full border border-slate-600/80 bg-slate-900/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-300">
                    {role}
                </span>
            </div>

            <div className="mt-3 space-y-2">
                {visibleAlerts.map(alert => (
                    <AlertRow key={alert.id} alert={alert} />
                ))}
            </div>
        </section>
    )
}

type AlertRowProps = {
    alert: ContractAlert
}

function AlertRow({ alert }: AlertRowProps) {
    return (
        <article className="rounded-lg border border-white/5 bg-white/5 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold text-slate-100">{alert.title}</p>
                <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${severityClasses[alert.severity]}`}
                >
                    {alert.severity}
                </span>
            </div>
            <p className="mt-1 text-xs text-slate-300">{alert.detail}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                <span>Source: {alert.source}</span>
                <span className="text-slate-700">|</span>
                <span>Owner: {alert.owner}</span>
                <span className="text-slate-700">|</span>
                <span>{alert.responseBy}</span>
            </div>
            <p className="mt-1 text-[11px] text-cyan-200">Next: {alert.actionLabel}</p>
        </article>
    )
}

