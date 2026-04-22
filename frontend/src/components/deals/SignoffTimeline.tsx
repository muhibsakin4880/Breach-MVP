import type { ApprovalSignoff } from '../../domain/approvalArtifact'

type SignoffTimelineProps = {
    signoffs: ApprovalSignoff[]
}

const toneClasses = {
    slate: 'border-white/10 bg-white/5 text-slate-200',
    cyan: 'border-cyan-400/30 bg-cyan-500/10 text-cyan-100',
    amber: 'border-amber-400/30 bg-amber-500/10 text-amber-100',
    emerald: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100',
    rose: 'border-rose-400/30 bg-rose-500/10 text-rose-100'
} as const

export default function SignoffTimeline({
    signoffs
}: SignoffTimelineProps) {
    return (
        <div className="space-y-4">
            {signoffs.map(signoff => (
                <article
                    key={signoff.key}
                    className="rounded-3xl border border-white/8 bg-slate-950/45 px-5 py-5"
                >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-3xl">
                            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                                {signoff.label}
                            </div>
                            <h3 className="mt-2 text-lg font-semibold text-white">{signoff.owner}</h3>
                            <p className="mt-3 text-sm leading-6 text-slate-300">{signoff.rationale}</p>
                        </div>

                        <div className="flex flex-wrap gap-2 lg:justify-end">
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-200">
                                {signoff.timestamp}
                            </span>
                            <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${toneClasses[signoff.tone]}`}>
                                {signoff.status}
                            </span>
                        </div>
                    </div>

                    <div className="mt-5 grid gap-4 lg:grid-cols-2">
                        <div className="rounded-2xl border border-white/8 bg-slate-900/55 px-4 py-4">
                            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                                Evidence anchors
                            </div>
                            <div className="mt-3 space-y-2">
                                {signoff.evidence.length > 0 ? (
                                    signoff.evidence.map(item => (
                                        <div key={`${signoff.key}-${item}`} className="flex gap-2 text-sm leading-6 text-slate-200">
                                            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-300" />
                                            <span>{item}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-sm leading-6 text-slate-400">
                                        No explicit evidence anchors are attached to this signoff lane yet.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/8 bg-slate-900/55 px-4 py-4">
                            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                                Outstanding blockers
                            </div>
                            <div className="mt-3 space-y-2">
                                {signoff.blockers.length > 0 ? (
                                    signoff.blockers.map(item => (
                                        <div key={`${signoff.key}-${item}`} className="flex gap-2 text-sm leading-6 text-slate-200">
                                            <span className={`mt-2 h-1.5 w-1.5 rounded-full ${signoff.tone === 'rose' ? 'bg-rose-300' : 'bg-amber-300'}`} />
                                            <span>{item}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-sm leading-6 text-slate-400">
                                        No blocker is currently attached to this signoff lane.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </article>
            ))}
        </div>
    )
}
