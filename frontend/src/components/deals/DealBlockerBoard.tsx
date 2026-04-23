import { Link } from 'react-router-dom'

export type DealBlockerBoardItem = {
    id: string
    title: string
    severity: 'Low' | 'Medium' | 'High'
    owner: string
    deadline: string
    affectedObject: string
    impactSummary: string
    recommendedAction: string
    cta?: {
        label: string
        to?: string
        disabled?: boolean
    }
}

const severityClasses = {
    Low: 'border-white/12 bg-white/5 text-slate-200',
    Medium: 'border-amber-400/30 bg-amber-500/10 text-amber-100',
    High: 'border-rose-400/30 bg-rose-500/10 text-rose-100'
} as const

export default function DealBlockerBoard({
    items
}: {
    items: DealBlockerBoardItem[]
}) {
    if (items.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-white/12 bg-slate-950/35 px-4 py-5 text-sm leading-6 text-slate-400">
                No active blocker is preventing the dossier from advancing. The linked approval lanes and operating surfaces remain visible below.
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <div className="hidden xl:grid xl:grid-cols-[minmax(0,1.15fr)_110px_150px_130px_160px_minmax(0,1fr)_minmax(0,1fr)_auto] xl:gap-3 xl:px-4 xl:text-[11px] xl:font-semibold xl:uppercase xl:tracking-[0.14em] xl:text-slate-500">
                <div>Blocker</div>
                <div>Severity</div>
                <div>Owner</div>
                <div>Deadline</div>
                <div>Affected object</div>
                <div>Impact</div>
                <div>Recommended action</div>
                <div>Action</div>
            </div>

            {items.map(item => (
                <article
                    key={item.id}
                    className="rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-4"
                >
                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_110px_150px_130px_160px_minmax(0,1fr)_minmax(0,1fr)_auto] xl:items-start">
                        <div>
                            <div className="text-sm font-semibold text-white">{item.title}</div>
                            <div className="mt-2 text-xs leading-5 text-slate-500 xl:hidden">
                                {item.owner} · {item.deadline} · {item.affectedObject}
                            </div>
                        </div>

                        <div>
                            <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold ${severityClasses[item.severity]}`}>
                                {item.severity}
                            </span>
                        </div>

                        <MetaCell label="Owner" value={item.owner} />
                        <MetaCell label="Deadline" value={item.deadline} />
                        <MetaCell label="Affected object" value={item.affectedObject} />
                        <MetaCell label="Impact" value={item.impactSummary} />
                        <MetaCell label="Recommended action" value={item.recommendedAction} />

                        <div className="xl:text-right">
                            {item.cta?.to && !item.cta.disabled ? (
                                <Link
                                    to={item.cta.to}
                                    className="inline-flex rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-100 transition-colors hover:bg-cyan-500/20"
                                >
                                    {item.cta.label}
                                </Link>
                            ) : item.cta ? (
                                <button
                                    type="button"
                                    disabled
                                    className="inline-flex cursor-not-allowed rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-400"
                                >
                                    {item.cta.label}
                                </button>
                            ) : (
                                <span className="inline-flex rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300">
                                    Monitor
                                </span>
                            )}
                        </div>
                    </div>
                </article>
            ))}
        </div>
    )
}

function MetaCell({
    label,
    value
}: {
    label: string
    value: string
}) {
    return (
        <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 xl:hidden">
                {label}
            </div>
            <div className="text-sm leading-6 text-slate-300">{value}</div>
        </div>
    )
}
