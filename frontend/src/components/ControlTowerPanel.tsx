import { useMemo } from 'react'
import type { ContractLifecycleState } from '../domain/accessContract'
import {
    buildContractControlTowerSnapshot,
    type PriorityBand,
    type SlaStatus
} from '../domain/controlTower'
import type { TransitionRole } from '../domain/transitionSimulator'

type ControlTowerPanelProps = {
    contractId: string
    state: ContractLifecycleState
    role: TransitionRole
    title?: string
    compact?: boolean
    pendingReleaseCount?: number
    className?: string
}

const priorityClasses: Record<PriorityBand, string> = {
    low: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
    medium: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200',
    high: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
    critical: 'border-rose-500/40 bg-rose-500/10 text-rose-200'
}

const slaClasses: Record<SlaStatus, string> = {
    healthy: 'text-emerald-200',
    at_risk: 'text-amber-200',
    breached: 'text-rose-200'
}

export default function ControlTowerPanel({
    contractId,
    state,
    role,
    title = 'Control Tower',
    compact = false,
    pendingReleaseCount = 0,
    className = ''
}: ControlTowerPanelProps) {
    const snapshot = useMemo(
        () => buildContractControlTowerSnapshot(contractId, role, state, pendingReleaseCount),
        [contractId, role, state, pendingReleaseCount]
    )
    const rationale = compact ? snapshot.rationale.slice(0, 2) : snapshot.rationale
    const escalation = compact ? snapshot.escalationPath.slice(0, 2) : snapshot.escalationPath

    return (
        <section className={`rounded-xl border border-slate-700 bg-slate-900/70 p-4 ${className}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{title}</p>
                    <p className="mt-1 text-sm font-semibold text-white">
                        Priority {snapshot.priorityScore}/100 · {snapshot.stateLabel}
                    </p>
                </div>
                <span
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${priorityClasses[snapshot.priorityBand]}`}
                >
                    {snapshot.priorityBand}
                </span>
            </div>

            <div className={`mt-3 grid gap-3 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
                <MetricTile label="SLA Target" value={`${snapshot.slaTargetHours}h`} />
                <MetricTile
                    label="SLA Remaining"
                    value={`${snapshot.slaRemainingHours}h`}
                    valueClass={slaClasses[snapshot.slaStatus]}
                />
                <MetricTile label="Audit Events" value={`${snapshot.auditEventCount}`} />
            </div>

            <div className="mt-3 rounded-lg border border-white/5 bg-white/5 p-3">
                <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Recommended Next Action</p>
                {snapshot.recommendedAction ? (
                    <>
                        <p className="mt-1 text-xs text-slate-100">{snapshot.recommendedAction.label}</p>
                        <p
                            className={`mt-1 text-[11px] ${
                                snapshot.recommendedAction.allowed ? 'text-slate-400' : 'text-amber-300'
                            }`}
                        >
                            {snapshot.recommendedAction.reason}
                        </p>
                    </>
                ) : (
                    <p className="mt-1 text-xs text-slate-400">No action recommendations for this role/state.</p>
                )}
            </div>

            <div className="mt-3 rounded-lg border border-white/5 bg-white/5 p-3">
                <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Priority Rationale</p>
                <div className="mt-2 space-y-1.5">
                    {rationale.map(item => (
                        <p key={item} className="text-xs text-slate-200">
                            • {item}
                        </p>
                    ))}
                </div>
            </div>

            <div className="mt-3 rounded-lg border border-white/5 bg-white/5 p-3">
                <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Escalation Path</p>
                <div className="mt-2 space-y-1.5">
                    {escalation.map(item => (
                        <p key={item} className="text-xs text-slate-200">
                            • {item}
                        </p>
                    ))}
                </div>
            </div>
        </section>
    )
}

type MetricTileProps = {
    label: string
    value: string
    valueClass?: string
}

function MetricTile({ label, value, valueClass = 'text-slate-200' }: MetricTileProps) {
    return (
        <div className="rounded-lg border border-white/5 bg-white/5 p-3">
            <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">{label}</p>
            <p className={`mt-1 text-xs ${valueClass}`}>{value}</p>
        </div>
    )
}

