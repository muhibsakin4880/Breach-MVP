import { Link } from 'react-router-dom'
import { policyRows, policyStats, preflightRows } from './pipelinesContent'
import { SurfaceCard } from './PipelinesShared'

export default function PipelinesPoliciesTab() {
    return (
        <section className="space-y-8">
            <SurfaceCard>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="max-w-3xl">
                        <h2 className="text-2xl font-bold text-white">Usage and policy controls</h2>
                        <p className="mt-2 text-sm leading-relaxed text-slate-400">
                            Track the guardrails that shape participant API access: rate limits, residency rules, and
                            protected export checks. This stays lighter than the admin policy view, but still gives
                            participants clear operating boundaries.
                        </p>
                    </div>
                    <Link
                        to="/audit-trail"
                        className="rounded-xl bg-cyan-500 px-4 py-3 text-sm font-bold text-black transition-all duration-200 hover:bg-cyan-400"
                    >
                        Open Audit Trail
                    </Link>
                </div>
            </SurfaceCard>

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-4 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <div className="text-sm font-semibold text-white">
                            Workspace policies are active and enforcing without manual overrides
                        </div>
                        <div className="text-xs text-emerald-100/80">Last policy update: March 2026</div>
                    </div>
                    <span className="rounded-full border border-emerald-400/40 bg-emerald-500/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-100">
                        Active
                    </span>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {policyStats.map(stat => (
                    <div
                        key={stat.label}
                        className="rounded-2xl border border-cyan-500/20 bg-black/70 p-5 shadow-[0_0_15px_#00F0FF20]"
                    >
                        <div className="text-xs uppercase tracking-[0.12em] text-slate-500">{stat.label}</div>
                        <div className="mt-3 text-3xl font-semibold text-white">{stat.value}</div>
                    </div>
                ))}
            </div>

            <SurfaceCard>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                        <h3 className="text-xl font-semibold text-white">Active policies</h3>
                        <p className="text-sm text-slate-400">The main controls affecting participant API usage</p>
                    </div>
                    <span className="text-xs text-slate-500">5 policies</span>
                </div>
                <div className="mt-5 overflow-hidden rounded-xl border border-cyan-500/20">
                    <table className="w-full text-sm">
                        <thead className="bg-cyan-500/10 text-xs uppercase tracking-[0.12em] text-slate-400">
                            <tr>
                                <th className="px-4 py-3 text-left">Policy</th>
                                <th className="px-4 py-3 text-left">Scope</th>
                                <th className="px-4 py-3 text-left">Action</th>
                                <th className="px-4 py-3 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/70">
                            {policyRows.map(row => (
                                <tr key={row[0]} className="transition-colors hover:bg-white/5">
                                    <td className="px-4 py-3 text-left font-medium text-white">{row[0]}</td>
                                    <td className="px-4 py-3 text-left text-slate-300">{row[1]}</td>
                                    <td className="px-4 py-3 text-left text-slate-300">{row[2]}</td>
                                    <td className="px-4 py-3 text-right">
                                        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-200">
                                            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                            Active
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </SurfaceCard>

            <SurfaceCard>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                        <h3 className="text-xl font-semibold text-white">Recent preflight results</h3>
                        <p className="text-sm text-slate-400">The latest checks applied to participant API activity</p>
                    </div>
                    <Link to="/usage-analytics" className="text-sm font-semibold text-cyan-300 hover:text-cyan-200">
                        Compare with usage trends
                    </Link>
                </div>
                <div className="mt-5 overflow-hidden rounded-xl border border-cyan-500/20">
                    <table className="w-full text-sm">
                        <thead className="bg-cyan-500/10 text-xs uppercase tracking-[0.12em] text-slate-400">
                            <tr>
                                <th className="px-4 py-3 text-left">Result</th>
                                <th className="px-4 py-3 text-left">Dataset</th>
                                <th className="px-4 py-3 text-left">Check</th>
                                <th className="px-4 py-3 text-right">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/70">
                            {preflightRows.map(row => (
                                <tr key={`${row[0]}-${row[1]}`} className="transition-colors hover:bg-white/5">
                                    <td className="px-4 py-3 text-left">
                                        <span
                                            className={`rounded-full border px-2 py-1 text-xs font-semibold ${
                                                row[0] === 'BLOCKED'
                                                    ? 'border-rose-500/40 bg-rose-500/10 text-rose-200'
                                                    : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                                            }`}
                                        >
                                            {row[0]}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-left text-slate-300">{row[1]}</td>
                                    <td className="px-4 py-3 text-left text-slate-300">{row[2]}</td>
                                    <td className="px-4 py-3 text-right text-slate-300">{row[3]}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </SurfaceCard>
        </section>
    )
}
