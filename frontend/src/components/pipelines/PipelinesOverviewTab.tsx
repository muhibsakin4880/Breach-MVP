import { Link } from 'react-router-dom'
import { credentialStats } from './pipelinesContent'
import { CopyButton, SurfaceCard, type CopyHandler } from './PipelinesShared'

export default function PipelinesOverviewTab({
    copiedItem,
    onCopy
}: {
    copiedItem: string | null
    onCopy: CopyHandler
}) {
    return (
        <section className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                <Link
                    to="/datasets"
                    className="rounded-3xl border border-cyan-500/30 bg-black/70 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_25px_#00F0FF30]"
                >
                    <h3 className="text-lg font-semibold text-white">Explore verified datasets</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">
                        Browse metadata, trust metrics, and access policy details before integrating anything.
                    </p>
                    <div className="mt-4 text-sm font-semibold text-cyan-300">Go to Datasets</div>
                </Link>

                <Link
                    to="/access-requests"
                    className="rounded-3xl border border-cyan-500/30 bg-black/70 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_25px_#00F0FF30]"
                >
                    <h3 className="text-lg font-semibold text-white">Manage access requests</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">
                        Submit and update governed requests when you need more than metadata and summaries.
                    </p>
                    <div className="mt-4 text-sm font-semibold text-cyan-300">Open Access Requests</div>
                </Link>

                <Link
                    to="/usage-analytics"
                    className="rounded-3xl border border-cyan-500/30 bg-black/70 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_25px_#00F0FF30]"
                >
                    <h3 className="text-lg font-semibold text-white">Review recurring API usage</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">
                        Check query volume, plan usage, and workspace-level metering for the recurring API line.
                    </p>
                    <div className="mt-4 text-sm font-semibold text-cyan-300">Open Usage Analytics</div>
                </Link>

                <Link
                    to="/contributions"
                    className="rounded-3xl border border-cyan-500/30 bg-black/70 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_25px_#00F0FF30]"
                >
                    <h3 className="text-lg font-semibold text-white">Need upload or validation workflows?</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">
                        Contribution submission, validation pipeline state, and onboarding remain in the Contributions
                        console.
                    </p>
                    <div className="mt-4 text-sm font-semibold text-cyan-300">Go to Contributions</div>
                </Link>
            </div>

            <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
                <SurfaceCard>
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-white">Credentials & session controls</h3>
                            <p className="mt-2 text-sm text-slate-400">
                                This mirrors the live API key story in Profile & Settings and the residency story in Deployment Model.
                            </p>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-200">
                            Active production key
                        </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <div className="font-mono text-sm text-slate-200">br_live_••••••••••••••••••••••</div>
                                <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
                                    {credentialStats.map(stat => (
                                        <span key={stat}>{stat}</span>
                                    ))}
                                </div>
                                <p className="mt-3 text-xs text-slate-500">Your key is private. Never share it.</p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <Link
                                    to="/profile"
                                    className="rounded-xl bg-cyan-500 px-4 py-3 text-sm font-bold text-black transition-all duration-200 hover:bg-cyan-400"
                                >
                                    Generate or revoke in Profile
                                </Link>
                                <CopyButton
                                    label="Copy auth header"
                                    onClick={() => onCopy('overview-auth-header', 'Authorization: Bearer {your_api_key}')}
                                    copied={copiedItem === 'overview-auth-header'}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <Link
                            to="/deployment-model"
                            className="rounded-2xl border border-cyan-500/20 bg-black/40 p-4 transition-all duration-200 hover:border-cyan-500/40 hover:shadow-[0_0_18px_#00F0FF20]"
                        >
                            <div className="text-sm font-semibold text-white">Deployment & residency controls</div>
                            <p className="mt-2 text-sm text-slate-400">
                                Review where your data lives, what Redoubt can see, and how key material is treated at rest.
                            </p>
                        </Link>
                        <Link
                            to="/audit-trail"
                            className="rounded-2xl border border-cyan-500/20 bg-black/40 p-4 transition-all duration-200 hover:border-cyan-500/40 hover:shadow-[0_0_18px_#00F0FF20]"
                        >
                            <div className="text-sm font-semibold text-white">Audit evidence</div>
                            <p className="mt-2 text-sm text-slate-400">
                                Cross-check request updates, key usage, and policy enforcement from the participant side.
                            </p>
                        </Link>
                    </div>
                </SurfaceCard>

                <div className="space-y-6">
                    <SurfaceCard>
                        <h3 className="text-xl font-bold text-white">Current API plan snapshot</h3>
                        <p className="mt-2 text-sm text-slate-400">
                            Recurring API subscriptions stay separate from governed deal pricing. Participant onboarding,
                            dataset onboarding, metadata preview, and quote creation remain free.
                        </p>
                        <div className="mt-5 grid gap-4 md:grid-cols-3">
                            <div className="rounded-2xl border border-cyan-500/20 bg-black/50 p-4">
                                <div className="text-sm font-semibold text-white">Starter</div>
                                <div className="mt-2 text-2xl font-bold text-white">$500/mo</div>
                                <div className="mt-1 text-xs text-slate-400">1,000 calls per month</div>
                            </div>
                            <div className="rounded-2xl border border-cyan-500/40 bg-cyan-500/10 p-4 shadow-[0_0_15px_#00F0FF20]">
                                <div className="text-sm font-semibold text-white">Growth</div>
                                <div className="mt-2 text-2xl font-bold text-white">$2,000/mo</div>
                                <div className="mt-1 text-xs text-slate-300">10,000 calls per month</div>
                                <div className="mt-3 inline-flex rounded-full border border-cyan-400/40 bg-cyan-500/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-200">
                                    Current workspace plan
                                </div>
                            </div>
                            <div className="rounded-2xl border border-cyan-500/20 bg-black/50 p-4">
                                <div className="text-sm font-semibold text-white">Enterprise</div>
                                <div className="mt-2 text-2xl font-bold text-white">Custom</div>
                                <div className="mt-1 text-xs text-slate-400">Unlimited volume with SLA</div>
                            </div>
                        </div>
                        <div className="mt-5 flex flex-wrap gap-3">
                            <Link
                                to="/usage-analytics"
                                className="rounded-xl bg-cyan-500 px-4 py-3 text-sm font-bold text-black transition-all duration-200 hover:bg-cyan-400"
                            >
                                View usage and limits
                            </Link>
                            <Link
                                to="/profile"
                                className="rounded-xl border border-cyan-500/40 px-4 py-3 text-sm font-semibold text-cyan-200 transition-all duration-200 hover:bg-cyan-500/15"
                            >
                                Manage credentials
                            </Link>
                        </div>
                    </SurfaceCard>

                    <SurfaceCard>
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-white">Workspace integration checklist</h3>
                                <p className="mt-2 text-sm text-slate-400">
                                    Follow the same order your team already uses inside the participant console.
                                </p>
                            </div>
                            <Link
                                to="/profile"
                                className="rounded-xl border border-cyan-500/40 px-4 py-3 text-sm font-semibold text-cyan-200 transition-all duration-200 hover:bg-cyan-500/15"
                            >
                                Start with credentials
                            </Link>
                        </div>
                        <div className="mt-5 space-y-4">
                            {[
                                'Open Profile & Settings and confirm your current API key.',
                                'Review dataset metadata before requesting governed access.',
                                'Submit or update access requests as your workspace scope changes.',
                                'Monitor recurring usage in Usage Analytics and policy events in Audit Trail.'
                            ].map(item => (
                                <div
                                    key={item}
                                    className="flex items-start gap-3 rounded-2xl border border-cyan-500/15 bg-black/40 px-4 py-3"
                                >
                                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#00F0FF90]" />
                                    <p className="text-sm text-slate-300">{item}</p>
                                </div>
                            ))}
                        </div>
                    </SurfaceCard>
                </div>
            </div>
        </section>
    )
}
