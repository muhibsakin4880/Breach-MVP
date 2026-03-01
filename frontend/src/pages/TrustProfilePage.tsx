import { participantTrust, participantActivity, participantActivityStyles, trustLevel } from '../data/workspaceData'

export default function TrustProfilePage() {
    const misusePenalty = participantTrust.misuseWarning ? participantTrust.misusePenalty : 0
    const netTrustScore = Math.max(participantTrust.score - misusePenalty, 0)

    return (
        <div className="container mx-auto px-4 py-10 space-y-6 text-white">
            <section className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-white">Trust Profile</h1>
                        <p className="text-slate-400 text-sm">Detailed trust score breakdown and participant activity history.</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${trustLevel(netTrustScore).classes}`}>
                        {trustLevel(netTrustScore).label}
                    </span>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="text-slate-300 text-sm">Trust score</div>
                            <div className="flex items-baseline gap-2">
                                <div className="text-3xl font-semibold text-emerald-300">{netTrustScore}</div>
                                {misusePenalty > 0 && (
                                    <div className="text-xs text-rose-200 bg-rose-500/10 border border-rose-500/40 px-2 py-1 rounded-full">
                                        -{misusePenalty} penalty
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400" style={{ width: `${netTrustScore}%` }} />
                        </div>
                        <div className="text-xs text-slate-400">
                            {participantTrust.misuseWarning
                                ? (
                                    <div className="space-y-1">
                                        <span className="text-amber-200 bg-amber-500/10 border border-amber-500/40 rounded px-2 py-1 inline-block">
                                            {participantTrust.misuseWarning}
                                        </span>
                                        <div className="text-rose-200 bg-rose-500/10 border border-rose-500/30 rounded px-2 py-1 inline-flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-rose-400" />
                                            Access privileges restricted until review.
                                        </div>
                                        <div className="text-xs text-slate-400">Warning shown on participant profile.</div>
                                    </div>
                                )
                                : 'No misuse penalties applied.'}
                        </div>
                    </div>

                    <div className="lg:col-span-2 grid sm:grid-cols-2 gap-3">
                        {participantTrust.factors.map(factor => (
                            <div key={factor.label} className="bg-slate-900/70 border border-slate-700 rounded-lg p-3">
                                <div className="flex items-center justify-between text-sm text-slate-300 mb-1">
                                    <span>{factor.label}</span>
                                    <span className="text-xs text-slate-400">{factor.value}%</span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400" style={{ width: `${factor.value}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm uppercase tracking-[0.12em] text-slate-400">Participant activity history</h2>
                    <div className="text-xs text-slate-400">Access requests - Approvals - Contributions - Compliance</div>
                </div>

                <div className="relative border-l border-slate-800 pl-4 space-y-4">
                    {participantActivity.map((item, idx) => (
                        <div key={item.label} className="relative pl-4">
                            <span className={`absolute -left-2 top-2 inline-block w-3 h-3 rounded-full ${participantActivityStyles[item.type].dot}`} />
                            {idx !== participantActivity.length - 1 && (
                                <div className="absolute -left-[7px] top-5 h-full w-px bg-slate-800" aria-hidden />
                            )}
                            <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-3">
                                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                                    <span className="uppercase tracking-[0.12em]">{participantActivityStyles[item.type].label}</span>
                                    <span>{item.ts}</span>
                                </div>
                                <div className="text-sm font-semibold text-white">{item.label}</div>
                                {item.detail && <div className="text-xs text-slate-400 mt-1">{item.detail}</div>}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}
