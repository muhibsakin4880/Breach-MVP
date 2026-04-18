import { Link } from 'react-router-dom'
import { credentialStats } from './pipelinesContent'
import { CopyButton, SurfaceCard, type CopyHandler } from './PipelinesShared'
import {
    approvedDatasets,
    confidenceColor,
    datasetRequests,
    participantActivity,
    participantActivityStyles,
    requestStatusLabel,
    statusStyles
} from '../../data/workspaceData'
import { credentialHistory, participantApiCredential, recentApiActivity } from '../../data/pipelineOpsData'

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
                    <h3 className="text-lg font-semibold text-white">Review production API usage</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">
                        Check query volume, plan usage, and workspace-level metering for approved production access.
                    </p>
                    <div className="mt-4 text-sm font-semibold text-cyan-300">Open Usage Analytics</div>
                </Link>

                <Link
                    to="/provider/datasets/new"
                    className="rounded-3xl border border-cyan-500/30 bg-black/70 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_25px_#00F0FF30]"
                >
                    <h3 className="text-lg font-semibold text-white">Need upload or validation workflows?</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">
                        Start new uploads in the provider flow, then monitor validation from dataset-specific status pages.
                    </p>
                    <div className="mt-4 text-sm font-semibold text-cyan-300">Open Upload Flow</div>
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
                                <div className="font-mono text-sm text-slate-200">{participantApiCredential.maskedKey}</div>
                                <div className="mt-2 text-xs uppercase tracking-[0.12em] text-slate-500">
                                    {participantApiCredential.environment}
                                </div>
                                <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
                                    {credentialStats.map(stat => (
                                        <span key={stat}>{stat}</span>
                                    ))}
                                </div>
                                <p className="mt-3 text-xs text-slate-500">Your key is private. Never share it.</p>
                                <p className="mt-1 text-xs text-slate-500">{participantApiCredential.residencyNote}</p>
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

                    <div className="mt-5 grid gap-4 md:grid-cols-[2fr_3fr]">
                        <div className="rounded-2xl border border-cyan-500/20 bg-black/40 p-4">
                            <div className="text-sm font-semibold text-white">Credential history</div>
                            <div className="mt-3 space-y-3">
                                {credentialHistory.map(event => (
                                    <div key={event.label} className="rounded-xl border border-cyan-500/10 bg-black/30 px-3 py-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="text-sm text-slate-200">{event.label}</div>
                                            <span
                                                className={`rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                                                    event.status === 'current'
                                                        ? 'bg-emerald-500/15 text-emerald-200'
                                                        : event.status === 'success'
                                                        ? 'bg-cyan-500/15 text-cyan-200'
                                                        : 'bg-slate-700/80 text-slate-200'
                                                }`}
                                            >
                                                {event.status}
                                            </span>
                                        </div>
                                        <div className="mt-1 text-xs text-slate-500">{event.timestamp}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="rounded-2xl border border-cyan-500/20 bg-black/40 p-4">
                            <div className="text-sm font-semibold text-white">Current key scopes</div>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {participantApiCredential.scopes.map(scope => (
                                    <span
                                        key={scope}
                                        className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-200"
                                    >
                                        {scope}
                                    </span>
                                ))}
                            </div>
                            <div className="mt-4 rounded-xl border border-cyan-500/10 bg-black/30 px-3 py-3 text-sm text-slate-400">
                                Last rotated on {participantApiCredential.lastRotated}. Rotate or revoke from Profile when your environment or downstream systems change.
                            </div>
                        </div>
                    </div>
                </SurfaceCard>

                <div className="space-y-6">
                    <SurfaceCard>
                        <h3 className="text-xl font-bold text-white">Production Access Pricing</h3>
                        <p className="mt-2 text-sm text-slate-400">
                            Monthly API pricing begins after protected evaluation clears or a validated pilot hands off into production. Participant onboarding, dataset onboarding, metadata preview, and quote creation remain free.
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
                        <div className="mt-5 rounded-2xl border border-cyan-500/20 bg-black/40 p-4">
                            <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Validated deployment path</div>
                            <div className="mt-3 grid gap-3 md:grid-cols-3">
                                {[
                                    'Free metadata preview',
                                    'Protected evaluation and buyer validation',
                                    'Approved API or production access'
                                ].map(step => (
                                    <div key={step} className="rounded-xl border border-cyan-500/15 bg-black/30 px-3 py-3 text-sm text-slate-300">
                                        {step}
                                    </div>
                                ))}
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

                    <SurfaceCard>
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div>
                                <h3 className="text-xl font-bold text-white">Recent API activity</h3>
                                <p className="mt-2 text-sm text-slate-400">
                                    Shared mock activity connected to the post-evaluation production access story.
                                </p>
                            </div>
                            <Link to="/audit-trail" className="text-sm font-semibold text-cyan-300 hover:text-cyan-200">
                                Open audit evidence
                            </Link>
                        </div>
                        <div className="mt-4 space-y-3">
                            {recentApiActivity.map(activity => (
                                <div key={activity.id} className="rounded-2xl border border-cyan-500/15 bg-black/40 px-4 py-3">
                                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <div className="text-sm font-semibold text-white">{activity.route}</div>
                                            <div className="mt-1 text-sm text-slate-400">{activity.dataset}</div>
                                        </div>
                                        <span
                                            className={`rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                                                activity.tone === 'success'
                                                    ? 'bg-emerald-500/15 text-emerald-200'
                                                    : activity.tone === 'pending'
                                                    ? 'bg-amber-500/15 text-amber-200'
                                                    : 'bg-cyan-500/15 text-cyan-200'
                                            }`}
                                        >
                                            {activity.timestamp}
                                        </span>
                                    </div>
                                    <div className="mt-2 text-sm text-slate-300">{activity.result}</div>
                                </div>
                            ))}
                        </div>
                    </SurfaceCard>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
                <SurfaceCard>
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div>
                            <h3 className="text-xl font-bold text-white">Approved API-enabled datasets</h3>
                            <p className="mt-2 text-sm text-slate-400">
                                These routes are derived from dataset access that has already cleared protected evaluation or a validated pilot handoff.
                            </p>
                        </div>
                        <Link to="/datasets" className="text-sm font-semibold text-cyan-300 hover:text-cyan-200">
                            View all datasets
                        </Link>
                    </div>
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                        {approvedDatasets.map(dataset => (
                            <article
                                key={dataset.id}
                                className="rounded-2xl border border-cyan-500/20 bg-black/40 p-5"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="text-base font-semibold text-white">{dataset.name}</div>
                                        <div className={`mt-2 text-sm font-semibold ${confidenceColor(dataset.confidence)}`}>
                                            Confidence {dataset.confidence}
                                        </div>
                                    </div>
                                    <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-200">
                                        {dataset.accessRoute}
                                    </span>
                                </div>
                                <p className="mt-3 text-sm leading-relaxed text-slate-400">{dataset.instructions}</p>
                                <div className="mt-4 text-xs text-slate-500">{dataset.limits}</div>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {dataset.usageScope.map(scope => (
                                        <span
                                            key={scope}
                                            className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-[11px] text-slate-300"
                                        >
                                            {scope}
                                        </span>
                                    ))}
                                </div>
                            </article>
                        ))}
                    </div>
                </SurfaceCard>

                <SurfaceCard>
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div>
                            <h3 className="text-xl font-bold text-white">Request timeline</h3>
                            <p className="mt-2 text-sm text-slate-400">
                                Access-request history is now pulled from shared workspace data.
                            </p>
                        </div>
                        <Link to="/access-requests" className="text-sm font-semibold text-cyan-300 hover:text-cyan-200">
                            Open requests
                        </Link>
                    </div>
                    <div className="mt-4 space-y-3">
                        {datasetRequests.slice(0, 4).map(request => (
                            <div key={request.id} className="rounded-2xl border border-cyan-500/15 bg-black/40 px-4 py-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="text-sm font-semibold text-white">{request.name}</div>
                                        <div className="mt-1 text-xs text-slate-500">{request.requestNumber}</div>
                                    </div>
                                    <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${statusStyles[request.status]}`}>
                                        {requestStatusLabel(request.status)}
                                    </span>
                                </div>
                                <div className="mt-2 text-sm text-slate-400">{request.delivery}</div>
                                <div className="mt-2 text-xs text-slate-500">Updated {request.lastUpdated}</div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-5 rounded-2xl border border-cyan-500/15 bg-black/40 p-4">
                        <div className="text-sm font-semibold text-white">Workspace activity feed</div>
                        <div className="mt-3 space-y-3">
                            {participantActivity.slice(0, 3).map(item => {
                                const style = participantActivityStyles[item.type]
                                return (
                                    <div key={item.label} className="flex items-start gap-3">
                                        <span className={`mt-1 h-2.5 w-2.5 rounded-full ${style.dot}`} />
                                        <div>
                                            <div className="text-sm text-slate-200">{item.label}</div>
                                            <div className="text-xs text-slate-500">{item.ts}</div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </SurfaceCard>
            </div>
        </section>
    )
}
