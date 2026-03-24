import { useMemo } from 'react'
import type { ContractLifecycleState } from '../domain/accessContract'
import {
    buildPolicyAttestation,
    type AttestationStatus,
    type PolicyControlCheck
} from '../domain/policyAttestation'
import type { TransitionRole } from '../domain/transitionSimulator'

type PolicyAttestationPanelProps = {
    contractId: string
    state: ContractLifecycleState
    role: TransitionRole
    title?: string
    compact?: boolean
    pendingReleaseCount?: number
    className?: string
}

const statusClasses: Record<AttestationStatus, string> = {
    pass: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
    warn: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
    fail: 'border-rose-500/40 bg-rose-500/10 text-rose-200'
}

export default function PolicyAttestationPanel({
    contractId,
    state,
    role,
    title = 'Policy Attestation',
    compact = false,
    pendingReleaseCount = 0,
    className = ''
}: PolicyAttestationPanelProps) {
    const report = useMemo(
        () => buildPolicyAttestation(contractId, role, state, pendingReleaseCount),
        [contractId, role, state, pendingReleaseCount]
    )
    const visibleChecks = compact ? report.checks.slice(0, 3) : report.checks
    const visibleGaps = compact ? report.criticalGaps.slice(0, 2) : report.criticalGaps

    return (
        <section className={`rounded-xl border border-slate-700 bg-slate-900/70 p-4 ${className}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{title}</p>
                    <p className="mt-1 text-sm font-semibold text-white">
                        Coverage {report.completionPercent}% · Next gate: {report.nextGate}
                    </p>
                </div>
                <span
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${statusClasses[report.overallStatus]}`}
                >
                    {report.overallStatus}
                </span>
            </div>

            <div className={`mt-3 grid gap-3 ${compact ? 'grid-cols-3' : 'grid-cols-3 md:grid-cols-6'}`}>
                <Metric label="Pass" value={`${report.passCount}`} />
                <Metric label="Warn" value={`${report.warnCount}`} />
                <Metric label="Fail" value={`${report.failCount}`} />
                <Metric label="Role" value={report.role} />
                <Metric label="State" value={report.stateLabel} />
                <Metric label="Coverage" value={`${report.completionPercent}%`} />
            </div>

            <div className="mt-3 rounded-lg border border-white/5 bg-white/5 p-3">
                <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Critical Gaps</p>
                <div className="mt-2 space-y-1.5">
                    {visibleGaps.map(gap => (
                        <p key={gap} className="text-xs text-slate-200">
                            • {gap}
                        </p>
                    ))}
                </div>
            </div>

            <div className="mt-3 rounded-lg border border-white/5 bg-white/5 p-3">
                <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Control Checks</p>
                <div className="mt-2 space-y-2">
                    {visibleChecks.map(check => (
                        <CheckRow key={check.id} check={check} />
                    ))}
                </div>
            </div>
        </section>
    )
}

type MetricProps = {
    label: string
    value: string
}

function Metric({ label, value }: MetricProps) {
    return (
        <div className="rounded-lg border border-white/5 bg-white/5 p-2">
            <p className="text-[10px] uppercase tracking-[0.1em] text-slate-500">{label}</p>
            <p className="mt-1 text-xs text-slate-200">{value}</p>
        </div>
    )
}

type CheckRowProps = {
    check: PolicyControlCheck
}

function CheckRow({ check }: CheckRowProps) {
    return (
        <article className="rounded-md border border-slate-700 bg-slate-950/60 p-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold text-slate-100">{check.label}</p>
                <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${statusClasses[check.status]}`}
                >
                    {check.status}
                </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-300">{check.rationale}</p>
            <div className="mt-1 text-[10px] text-slate-500">
                Owner: {check.owner} | {check.frameworkRefs.join(', ')}
            </div>
            <div className="mt-1 text-[10px] text-slate-600">{check.evidencePointer}</div>
        </article>
    )
}

