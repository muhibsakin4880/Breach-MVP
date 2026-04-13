import { Link } from 'react-router-dom'
import type { PipelinesTab } from './pipelinesContent'
import { summaryCards, tabs } from './pipelinesContent'
import { SurfaceCard } from './PipelinesShared'

export default function PipelinesHero({ activeTab }: { activeTab: PipelinesTab }) {
    return (
        <>
            <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-xs">
                        <span className="text-gray-500">Pipelines</span>
                        <span className="text-cyan-400">/</span>
                        <span className="font-medium text-cyan-400">{tabs.find(tab => tab.id === activeTab)?.label}</span>
                    </div>
                    <h1 className="text-3xl font-bold">Pipelines</h1>
                    <p className="mt-1 text-slate-400">
                        Manage production access, credentials, and downstream dataset integrations after protected evaluation is approved.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-emerald-200">API v1</span>
                    <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-cyan-200">Verified session enabled</span>
                    <Link
                        to="/dashboard"
                        className="rounded-full border border-cyan-500/30 px-3 py-1 text-cyan-300 transition-all duration-200 hover:bg-cyan-500/20 hover:shadow-[0_0_15px_#00F0FF40]"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </section>

            <SurfaceCard>
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-200">
                            Participant integration workspace
                        </div>
                        <h2 className="mt-4 text-2xl font-bold text-white md:text-3xl">
                            Move validated datasets into scoped production access and tracked integration workflows.
                        </h2>
                        <p className="mt-3 text-sm leading-relaxed text-slate-400 md:text-base">
                            Pipelines is the downstream handoff after protected evaluation succeeds. Dataset uploads and validation still run through Contributions, while recurring API usage is tracked separately from evaluation pricing and procurement-stage review.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Link
                            to="/profile"
                            className="rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-black transition-all duration-200 hover:bg-cyan-400 hover:shadow-[0_0_25px_#00F0FF70]"
                        >
                            Open API Credentials
                        </Link>
                        <Link
                            to="/usage-analytics"
                            className="rounded-xl border border-cyan-500/40 px-5 py-3 text-sm font-semibold text-cyan-200 transition-all duration-200 hover:bg-cyan-500/15 hover:shadow-[0_0_20px_#00F0FF40]"
                        >
                            View Usage Analytics
                        </Link>
                    </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {summaryCards.map(card => (
                        <article key={card.label} className="rounded-2xl border border-cyan-500/20 bg-black/50 p-5 shadow-[0_0_15px_#00F0FF15]">
                            <div className="text-xs uppercase tracking-[0.12em] text-slate-500">{card.label}</div>
                            <div className="mt-3 text-xl font-semibold text-white">{card.value}</div>
                            <p className="mt-2 text-sm text-slate-400">{card.hint}</p>
                            <Link to={card.to} className="mt-4 inline-flex text-sm font-semibold text-cyan-300 transition-colors hover:text-cyan-200">
                                {card.action}
                            </Link>
                        </article>
                    ))}
                </div>
            </SurfaceCard>
        </>
    )
}
