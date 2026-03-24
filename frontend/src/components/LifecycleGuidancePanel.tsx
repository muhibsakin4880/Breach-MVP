import { getLifecycleGuidance, type LifecycleRole } from '../domain/lifecycleGuidance'
import type { ContractLifecycleState } from '../domain/accessContract'

type LifecycleGuidancePanelProps = {
    role: LifecycleRole
    state: ContractLifecycleState
    title?: string
    compact?: boolean
    className?: string
}

export default function LifecycleGuidancePanel({
    role,
    state,
    title = 'Lifecycle Guidance',
    compact = false,
    className = ''
}: LifecycleGuidancePanelProps) {
    const guidance = getLifecycleGuidance(role, state)

    return (
        <section className={`rounded-xl border border-slate-700 bg-slate-900/70 p-4 ${className}`}>
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{title}</p>
                    <h3 className="mt-1 text-sm font-semibold text-white">{guidance.stateLabel}</h3>
                </div>
                <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-cyan-200">
                    {role}
                </span>
            </div>

            <p className="mt-2 text-xs text-slate-400">{guidance.roleHint}</p>

            <div className={`mt-3 grid gap-3 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                <div className="rounded-lg border border-white/5 bg-white/5 p-3">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Owner</p>
                    <p className="mt-1 text-sm text-slate-200">{guidance.owner}</p>
                </div>
                <div className="rounded-lg border border-white/5 bg-white/5 p-3">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Next Step</p>
                    <p className="mt-1 text-sm text-slate-200">{guidance.nextStep}</p>
                </div>
            </div>

            <div className={`mt-3 grid gap-3 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
                <ListSection title="Allowed Now" tone="ok" items={guidance.allowedActions} />
                <ListSection title="Blocked Now" tone="warn" items={guidance.blockedActions} />
                <ListSection title="Security Controls" tone="neutral" items={guidance.securityControls} />
            </div>
        </section>
    )
}

type ListSectionProps = {
    title: string
    tone: 'ok' | 'warn' | 'neutral'
    items: string[]
}

function ListSection({ title, tone, items }: ListSectionProps) {
    const toneClasses =
        tone === 'ok'
            ? 'border-emerald-500/20 bg-emerald-500/8'
            : tone === 'warn'
              ? 'border-rose-500/20 bg-rose-500/8'
              : 'border-cyan-500/20 bg-cyan-500/8'

    return (
        <div className={`rounded-lg border p-3 ${toneClasses}`}>
            <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">{title}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
                {items.map(item => (
                    <span
                        key={item}
                        className="rounded-full border border-white/10 bg-slate-900/60 px-2 py-1 text-[10px] text-slate-200"
                    >
                        {item}
                    </span>
                ))}
            </div>
        </div>
    )
}
