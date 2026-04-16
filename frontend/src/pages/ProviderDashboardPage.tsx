import { Link } from 'react-router-dom'
import {
    approvedDatasets,
    buildRequestBasisFields,
    buildRequestComplianceFields,
    datasetRequests,
    getProviderReviewStatus,
    providerReviewStatusStyles,
    requestStatusLabel,
    statusStyles,
    type DatasetRequest
} from '../data/workspaceData'

type DatasetStatus = 'Active' | 'Paused'

type ProviderDataset = {
    id: string
    name: string
    confidence: number
    requests: number
    status: DatasetStatus
    lastUpdated: string
}

const datasets: ProviderDataset[] = [
    { id: 'dp-01', name: 'Anonymized Retail Transactions 2024', confidence: 94, requests: 18, status: 'Active', lastUpdated: '2026-02-14' },
    { id: 'dp-02', name: 'Urban Mobility Sensor Streams', confidence: 90, requests: 11, status: 'Active', lastUpdated: '2026-02-13' },
    { id: 'dp-03', name: 'Satellite Imagery - Agriculture Zones', confidence: 92, requests: 7, status: 'Paused', lastUpdated: '2026-02-10' },
    { id: 'dp-04', name: 'Clinical Trial Outcomes (De-identified)', confidence: 96, requests: 5, status: 'Active', lastUpdated: '2026-02-12' }
]

const performanceSummary = {
    uptime: '99.4%',
    freshness: 'Updated < 2h',
    anomalies: 1,
    avgConfidence: 93
}

const economicsSummary = {
    grossContractValue: '$184,000',
    platformFee: '$22,080',
    netPayout: '$161,920',
    currentFeeTier: '12% repeat-provider tier'
}

const statusBadge: Record<DatasetStatus, string> = {
    Active: 'bg-emerald-500/10 text-emerald-200 border border-emerald-400/60',
    Paused: 'bg-amber-500/10 text-amber-200 border border-amber-400/60'
}

const confidenceColor = (score: number) => {
    if (score >= 95) return 'text-emerald-300'
    if (score >= 90) return 'text-cyan-300'
    if (score >= 85) return 'text-amber-300'
    return 'text-rose-300'
}

const primaryPanelClass =
    'rounded-[28px] border border-white/10 bg-slate-950/70 shadow-[0_24px_80px_rgba(2,8,20,0.3)] backdrop-blur-sm'

const secondaryPanelClass =
    'rounded-[24px] border border-white/10 bg-slate-900/70 shadow-[0_18px_56px_rgba(2,8,20,0.24)] backdrop-blur-sm'

export default function ProviderDashboardPage() {
    const totalDatasets = datasets.length
    const providerReviewRequests = datasetRequests.filter(request => request.status === 'REVIEW_IN_PROGRESS')
    const actionedReviewCount = datasetRequests.length - providerReviewRequests.length
    const activeRequests = providerReviewRequests.length
    const approvedAccesses = approvedDatasets.length

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-8 px-4 py-6 sm:px-6 xl:px-8">
                <section className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_36%),linear-gradient(180deg,rgba(15,23,42,0.98)_0%,rgba(2,8,20,0.96)_100%)] p-6 shadow-[0_30px_90px_rgba(2,8,20,0.34)] backdrop-blur-sm lg:p-8">
                    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_340px] xl:items-start">
                        <div className="space-y-6">
                            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                <div className="max-w-3xl space-y-3">
                                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/70 px-3 py-1 text-xs uppercase tracking-[0.12em] text-slate-300">
                                        Data Provider Hub
                                    </div>
                                    <div className="space-y-2">
                                        <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">Provider Dashboard</h1>
                                        <p className="max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                                            Manage the datasets you publish, respond to access requests, and monitor delivery quality—all without revealing buyer identity.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex shrink-0 flex-wrap gap-3">
                                    <button className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-blue-500 hover:text-white">
                                        Configure delivery
                                    </button>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                <SummaryMetricCard label="Total datasets" value={totalDatasets} hint="Uploaded" toneClass="bg-[linear-gradient(180deg,rgba(59,130,246,0.16)_0%,rgba(2,8,20,0)_100%)]" />
                                <SummaryMetricCard label="Active requests" value={activeRequests} hint="Awaiting action" toneClass="bg-[linear-gradient(180deg,rgba(245,158,11,0.16)_0%,rgba(2,8,20,0)_100%)]" />
                                <SummaryMetricCard label="Approved accesses" value={approvedAccesses} hint="Provisioned" toneClass="bg-[linear-gradient(180deg,rgba(16,185,129,0.16)_0%,rgba(2,8,20,0)_100%)]" />
                                <SummaryMetricCard label="Avg confidence" value={`${performanceSummary.avgConfidence}%`} hint="Quality signal" valueClass="text-cyan-300" toneClass="bg-[linear-gradient(180deg,rgba(34,211,238,0.16)_0%,rgba(2,8,20,0)_100%)]" />
                            </div>
                        </div>

                        <aside className="rounded-[26px] border border-white/10 bg-slate-950/78 p-6 shadow-[0_20px_60px_rgba(2,8,20,0.32)]">
                            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                                <span className="text-sm text-slate-400">Dataset performance</span>
                                <span className="rounded-full border border-emerald-400/60 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-200">
                                    Healthy
                                </span>
                            </div>
                            <div className="pt-5">
                                <div className="mb-2 text-4xl font-semibold tracking-tight text-emerald-300">{performanceSummary.uptime} uptime</div>
                                <p className="text-sm leading-6 text-slate-400">Freshness {performanceSummary.freshness}; {performanceSummary.anomalies} anomaly flagged this week.</p>
                            </div>
                        </aside>
                    </div>
                </section>

                <section className="grid gap-8 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.72fr)] xl:items-start">
                    <section className={`${primaryPanelClass} overflow-hidden`}>
                        <div className="flex flex-col gap-4 border-b border-white/10 px-6 py-6 lg:flex-row lg:items-start lg:justify-between lg:px-7">
                            <div>
                                <h2 className="text-xl font-semibold text-white">Dataset management</h2>
                                <p className="mt-1 text-sm text-slate-400">Control status, review requests, and keep confidence high.</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-blue-500">
                                    Bulk actions
                                </button>
                                <button className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-slate-500">
                                    Export
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="border-b border-white/10 bg-slate-900/50 text-xs uppercase tracking-[0.08em] text-slate-400">
                                    <tr>
                                        <th className="py-4 pr-4 pl-6 text-left font-medium lg:pl-7">Dataset</th>
                                        <th className="px-4 py-4 text-left font-medium">Confidence</th>
                                        <th className="px-4 py-4 text-left font-medium">Requests</th>
                                        <th className="px-4 py-4 text-left font-medium">Status</th>
                                        <th className="px-4 py-4 text-left font-medium">Updated</th>
                                        <th className="py-4 pl-4 pr-6 text-right font-medium lg:pr-7">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {datasets.map(dataset => (
                                        <tr key={dataset.id} className="transition-colors hover:bg-white/[0.03]">
                                            <td className="py-5 pr-4 pl-6 align-top lg:pl-7">
                                                <div className="font-semibold text-white">{dataset.name}</div>
                                                <div className="mt-1 text-xs text-slate-400">ID: {dataset.id}</div>
                                            </td>
                                            <td className="px-4 py-5 align-top">
                                                <div className={`text-base font-semibold ${confidenceColor(dataset.confidence)}`}>
                                                    {dataset.confidence}%
                                                </div>
                                                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
                                                    <div className="h-full rounded-full bg-gradient-to-r from-blue-400 via-emerald-400 to-emerald-500" style={{ width: `${dataset.confidence}%` }} />
                                                </div>
                                            </td>
                                            <td className="px-4 py-5 align-top text-slate-200">{dataset.requests}</td>
                                            <td className="px-4 py-5 align-top">
                                                <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadge[dataset.status]}`}>
                                                    {dataset.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-5 align-top text-slate-300">{dataset.lastUpdated}</td>
                                            <td className="py-5 pl-4 pr-6 text-right align-top lg:pr-7">
                                                <button className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-blue-500 hover:text-white">
                                                    Manage dataset
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <aside className={`${secondaryPanelClass} p-6 lg:p-7 xl:sticky xl:top-24`}>
                        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                            <div>
                                <h2 className="text-xl font-semibold text-white">Performance summary</h2>
                                <p className="mt-1 text-sm text-slate-400">Monitor delivery signals.</p>
                            </div>
                        </div>
                        <div className="mt-5 space-y-3">
                            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3">
                                <div className="text-sm text-slate-300">Freshness</div>
                                <div className="text-sm text-emerald-200">{performanceSummary.freshness}</div>
                            </div>
                            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3">
                                <div className="text-sm text-slate-300">Uptime</div>
                                <div className="text-sm text-emerald-200">{performanceSummary.uptime}</div>
                            </div>
                            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3">
                                <div className="text-sm text-slate-300">Anomalies this week</div>
                                <div className="text-sm text-amber-200">{performanceSummary.anomalies}</div>
                            </div>
                            <div className="rounded-[20px] border border-cyan-500/20 bg-cyan-500/10 p-5">
                                <div className="mb-2 text-xs uppercase tracking-[0.12em] text-cyan-200/80">Confidence trend</div>
                                <div className="text-3xl font-semibold text-cyan-300">{performanceSummary.avgConfidence}%</div>
                                <p className="mt-1 text-sm text-cyan-100/75">Rolling average across active datasets.</p>
                            </div>
                        </div>
                    </aside>
                </section>

                <section className={`${primaryPanelClass} p-6 lg:p-7`}>
                    <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-white">Incoming access requests</h2>
                            <p className="mt-1 text-sm text-slate-400">Buyer identity stays hidden, but purpose, legal basis, rights fit, and risk posture stay visible before you act.</p>
                        </div>
                        <span className="rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-xs text-blue-100">
                            {activeRequests} awaiting provider action
                        </span>
                    </div>

                    <div className="mt-5 rounded-xl border border-white/10 bg-slate-900/55 px-4 py-3 text-sm text-slate-300">
                        {actionedReviewCount} request{actionedReviewCount === 1 ? '' : 's'} already have an action recorded in the shared review log. This queue stays focused on items that still need a provider decision or clarification.
                    </div>

                    <div className={`mt-5 grid gap-5 ${providerReviewRequests.length > 1 ? '2xl:grid-cols-2' : ''}`}>
                        {providerReviewRequests.map(request => (
                            <ProviderRequestCard key={request.id} request={request} />
                        ))}
                    </div>
                </section>

                <section className={`${secondaryPanelClass} p-6 lg:p-7`}>
                    <div className="flex flex-col gap-3 border-b border-white/10 pb-5 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-100">
                                Commercial snapshot
                            </div>
                            <h2 className="mt-4 text-xl font-semibold text-white">Provider economics at a glance</h2>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                                Mock commercial values for the current protected-evaluation pipeline. These numbers are demo-only, but they make the fee path and provider payout structure visible.
                            </p>
                        </div>
                        <span className="rounded-full border border-emerald-500/35 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-200">
                            {economicsSummary.currentFeeTier}
                        </span>
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
                        <div className="rounded-[20px] border border-white/10 bg-slate-950/70 p-4">
                            <div className="text-xs uppercase tracking-[0.12em] text-slate-500">Gross contract value</div>
                            <div className="mt-3 text-2xl font-semibold text-white">{economicsSummary.grossContractValue}</div>
                            <div className="mt-1 text-xs text-slate-400">Current protected-evaluation book</div>
                        </div>
                        <div className="rounded-[20px] border border-white/10 bg-slate-950/70 p-4">
                            <div className="text-xs uppercase tracking-[0.12em] text-slate-500">Redoubt platform fee</div>
                            <div className="mt-3 text-2xl font-semibold text-white">{economicsSummary.platformFee}</div>
                            <div className="mt-1 text-xs text-slate-400">Applied after successful engagement</div>
                        </div>
                        <div className="rounded-[20px] border border-emerald-500/20 bg-emerald-500/10 p-4">
                            <div className="text-xs uppercase tracking-[0.12em] text-emerald-200/80">Provider net payout</div>
                            <div className="mt-3 text-2xl font-semibold text-emerald-100">{economicsSummary.netPayout}</div>
                            <div className="mt-1 text-xs text-emerald-100/75">Net after current fee tier</div>
                        </div>
                        <div className="rounded-[20px] border border-cyan-500/20 bg-cyan-500/10 p-4">
                            <div className="text-xs uppercase tracking-[0.12em] text-cyan-200/80">Current fee tier</div>
                            <div className="mt-3 text-lg font-semibold text-cyan-100">{economicsSummary.currentFeeTier}</div>
                            <div className="mt-1 text-xs text-cyan-100/75">Repeat-provider economics</div>
                        </div>
                    </div>

                    <div className="mt-5 grid gap-3 lg:grid-cols-2">
                        <div className="rounded-[18px] border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-slate-200">
                            <span className="font-semibold text-white">Pilot Cohort:</span> fee-waived buyer evaluations are reserved for selected design partners with LOI-backed intent, feedback participation, and a credible production pathway.
                        </div>
                        <div className="rounded-[18px] border border-cyan-500/20 bg-slate-950/70 px-4 py-3 text-sm text-slate-200">
                            <span className="font-semibold text-white">Expansion path:</span> successful evaluations can expand into production or API access pricing without restarting provider onboarding.
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}

function ProviderRequestCard({ request }: { request: DatasetRequest }) {
    const providerReviewStatus = getProviderReviewStatus(request)
    const basisFields = buildRequestBasisFields(request)
    const complianceFields = buildRequestComplianceFields(request)

    return (
        <article className="flex h-full flex-col rounded-[24px] border border-white/10 bg-slate-950/72 p-5 shadow-[0_18px_48px_rgba(2,8,20,0.24)]">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <p className="mb-1 text-xs uppercase tracking-[0.12em] text-slate-400">Dataset</p>
                    <h3 className="text-lg font-semibold text-white">{request.name}</h3>
                    <p className="text-xs text-slate-400">Request ID: {request.requestNumber}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${providerReviewStatusStyles[providerReviewStatus]}`}>
                        {providerReviewStatus}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[request.status]}`}>
                        {requestStatusLabel(request.status)}
                    </span>
                </div>
            </div>

            <div className="mt-5 space-y-5">
                <div className="grid gap-3 md:grid-cols-2">
                    {basisFields.map(field => (
                        <RequestFieldCard key={`${request.id}-${field.label}`} label={field.label} value={field.value} />
                    ))}
                </div>

                <div className="rounded-[20px] border border-white/10 bg-slate-900/60 p-4">
                    <div className="mb-3 text-xs uppercase tracking-[0.12em] text-slate-400">Compliance posture</div>
                    <div className="grid gap-3 md:grid-cols-2">
                        {complianceFields.map(field => (
                            <RequestFieldCard key={`${request.id}-compliance-${field.label}`} label={field.label} value={field.value} />
                        ))}
                    </div>
                </div>

                <div className="rounded-[20px] border border-amber-400/20 bg-amber-500/8 px-4 py-3">
                    <div className="text-xs uppercase tracking-[0.12em] text-slate-400">Reviewer rationale</div>
                    <p className="mt-2 text-sm leading-6 text-amber-50/95">{request.reviewerRationale}</p>
                </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-white/10 pt-4 text-sm">
                <Link
                    to={`/access-requests/${request.id}`}
                    className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-cyan-400 hover:text-white"
                >
                    Open review detail
                </Link>
                <button className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700">
                    Approve access
                </button>
                <button className="rounded-lg border border-rose-500 px-3 py-2 text-xs font-semibold text-rose-100 transition-colors hover:bg-rose-500/10">
                    Reject request
                </button>
                <button className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-blue-500 hover:text-white">
                    Ask clarification
                </button>
            </div>
        </article>
    )
}

function RequestFieldCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="h-full rounded-xl border border-white/10 bg-slate-950/70 p-3.5">
            <div className="mb-1 text-xs uppercase tracking-[0.12em] text-slate-400">{label}</div>
            <div className="text-sm leading-6 text-slate-100">{value}</div>
        </div>
    )
}

function SummaryMetricCard({
    label,
    value,
    hint,
    valueClass = 'text-white',
    toneClass = ''
}: {
    label: string
    value: string | number
    hint: string
    valueClass?: string
    toneClass?: string
}) {
    return (
        <div className={`rounded-[22px] border border-white/10 bg-slate-950/55 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] ${toneClass}`}>
            <div className="mb-3 text-xs uppercase tracking-[0.12em] text-slate-400">{label}</div>
            <div className={`text-3xl font-semibold tracking-tight ${valueClass}`}>{value}</div>
            <div className="mt-1 text-xs text-slate-400">{hint}</div>
        </div>
    )
}
