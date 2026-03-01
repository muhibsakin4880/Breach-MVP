import { Link } from 'react-router-dom'

type DatasetStatus = 'Active' | 'Paused'

type ProviderDataset = {
    id: string
    name: string
    confidence: number
    requests: number
    status: DatasetStatus
    lastUpdated: string
}

type AccessRequest = {
    id: string
    organizationType: string
    usage: string
    duration: string
    datasetName: string
    status: 'New' | 'Pending' | 'Actioned'
}

const datasets: ProviderDataset[] = [
    { id: 'dp-01', name: 'Anonymized Retail Transactions 2024', confidence: 94, requests: 18, status: 'Active', lastUpdated: '2026-02-14' },
    { id: 'dp-02', name: 'Urban Mobility Sensor Streams', confidence: 90, requests: 11, status: 'Active', lastUpdated: '2026-02-13' },
    { id: 'dp-03', name: 'Satellite Imagery - Agriculture Zones', confidence: 92, requests: 7, status: 'Paused', lastUpdated: '2026-02-10' },
    { id: 'dp-04', name: 'Clinical Trial Outcomes (De-identified)', confidence: 96, requests: 5, status: 'Active', lastUpdated: '2026-02-12' }
]

const accessRequests: AccessRequest[] = [
    {
        id: 'rq-781',
        organizationType: 'Enterprise analytics team',
        usage: 'Demand forecasting models across new regions',
        duration: '6 months',
        datasetName: 'Anonymized Retail Transactions 2024',
        status: 'New'
    },
    {
        id: 'rq-782',
        organizationType: 'Research lab (university)',
        usage: 'Traffic anomaly detection benchmarks',
        duration: '3 months',
        datasetName: 'Urban Mobility Sensor Streams',
        status: 'Pending'
    },
    {
        id: 'rq-783',
        organizationType: 'Healthcare AI startup',
        usage: 'Model validation with aggregated outcomes',
        duration: '12 months',
        datasetName: 'Clinical Trial Outcomes (De-identified)',
        status: 'New'
    },
    {
        id: 'rq-784',
        organizationType: 'Mapping provider partnership',
        usage: 'Crop health layer enrichment for LATAM',
        duration: '9 months',
        datasetName: 'Satellite Imagery - Agriculture Zones',
        status: 'Pending'
    }
]

const performanceSummary = {
    uptime: '99.4%',
    freshness: 'Updated < 2h',
    anomalies: 1,
    avgConfidence: 93
}

const statusBadge: Record<DatasetStatus, string> = {
    Active: 'bg-emerald-500/10 text-emerald-200 border border-emerald-400/60',
    Paused: 'bg-amber-500/10 text-amber-200 border border-amber-400/60'
}

const requestBadge: Record<AccessRequest['status'], string> = {
    New: 'bg-blue-500/10 text-blue-200 border border-blue-400/60',
    Pending: 'bg-amber-500/10 text-amber-200 border border-amber-400/60',
    Actioned: 'bg-slate-700 text-slate-200 border border-slate-600'
}

const confidenceColor = (score: number) => {
    if (score >= 95) return 'text-emerald-300'
    if (score >= 90) return 'text-cyan-300'
    if (score >= 85) return 'text-amber-300'
    return 'text-rose-300'
}

export default function ProviderDashboardPage() {
    const totalDatasets = datasets.length
    const activeRequests = accessRequests.filter(r => r.status !== 'Actioned').length
    const approvedAccesses = 9 // mock aggregate

    return (
        <div className="bg-slate-900 text-white min-h-screen">
            <div className="border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-800">
                <div className="container mx-auto px-4 py-10 md:py-14 space-y-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs uppercase tracking-[0.12em] text-slate-300">
                                Data Provider Hub
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-semibold mb-2">Provider Dashboard</h1>
                                <p className="text-slate-300 max-w-2xl">
                                    Manage the datasets you publish, respond to access requests, and monitor delivery quality—all without revealing buyer identity.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <Link
                                    to="/provider/onboarding"
                                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors text-sm font-medium"
                                >
                                    Upload new dataset
                                </Link>
                                <button className="px-4 py-2 rounded-lg border border-slate-700 hover:border-blue-500 text-sm font-medium text-slate-200 hover:text-white transition-colors">
                                    Configure delivery
                                </button>
                            </div>
                        </div>
                        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-lg w-full max-w-sm">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-slate-400">Dataset performance</span>
                                <span className="px-2 py-1 rounded-full text-xs border border-emerald-400/60 bg-emerald-500/10 text-emerald-200">
                                    Healthy
                                </span>
                            </div>
                            <div className="text-3xl font-semibold text-emerald-300 mb-1">{performanceSummary.uptime} uptime</div>
                            <p className="text-sm text-slate-400">Freshness {performanceSummary.freshness}; {performanceSummary.anomalies} anomaly flagged this week.</p>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-blue-500/20 via-blue-400/10 to-slate-900 p-4 shadow-lg">
                            <div className="text-xs uppercase tracking-[0.12em] text-slate-400 mb-2">Total datasets</div>
                            <div className="text-3xl font-semibold">{totalDatasets}</div>
                            <div className="text-xs text-slate-400">Uploaded</div>
                        </div>
                        <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-amber-500/20 via-amber-400/10 to-slate-900 p-4 shadow-lg">
                            <div className="text-xs uppercase tracking-[0.12em] text-slate-400 mb-2">Active requests</div>
                            <div className="text-3xl font-semibold">{activeRequests}</div>
                            <div className="text-xs text-slate-400">Awaiting action</div>
                        </div>
                        <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-emerald-500/20 via-emerald-400/10 to-slate-900 p-4 shadow-lg">
                            <div className="text-xs uppercase tracking-[0.12em] text-slate-400 mb-2">Approved accesses</div>
                            <div className="text-3xl font-semibold">{approvedAccesses}</div>
                            <div className="text-xs text-slate-400">Provisioned</div>
                        </div>
                        <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-cyan-500/20 via-cyan-400/10 to-slate-900 p-4 shadow-lg">
                            <div className="text-xs uppercase tracking-[0.12em] text-slate-400 mb-2">Avg confidence</div>
                            <div className="text-3xl font-semibold text-cyan-300">{performanceSummary.avgConfidence}%</div>
                            <div className="text-xs text-slate-400">Quality signal</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-10 space-y-10">
                <section className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 shadow-xl">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
                        <div>
                            <h2 className="text-xl font-semibold">Dataset management</h2>
                            <p className="text-slate-400 text-sm">Control status, review requests, and keep confidence high.</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="px-3 py-2 rounded-lg border border-slate-700 hover:border-blue-500 text-xs font-semibold text-slate-200 transition-colors">
                                Bulk actions
                            </button>
                            <button className="px-3 py-2 rounded-lg border border-slate-700 hover:border-slate-500 text-xs font-semibold text-slate-200 transition-colors">
                                Export
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="text-xs uppercase tracking-[0.08em] text-slate-400 border-b border-slate-700">
                                <tr>
                                    <th className="py-3 pr-4 text-left font-medium">Dataset</th>
                                    <th className="py-3 px-4 text-left font-medium">Confidence</th>
                                    <th className="py-3 px-4 text-left font-medium">Requests</th>
                                    <th className="py-3 px-4 text-left font-medium">Status</th>
                                    <th className="py-3 px-4 text-left font-medium">Updated</th>
                                    <th className="py-3 pl-4 text-right font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {datasets.map(dataset => (
                                    <tr key={dataset.id} className="hover:bg-slate-800/60 transition-colors">
                                        <td className="py-4 pr-4">
                                            <div className="font-semibold">{dataset.name}</div>
                                            <div className="text-slate-400 text-xs">ID: {dataset.id}</div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className={`text-base font-semibold ${confidenceColor(dataset.confidence)}`}>
                                                {dataset.confidence}%
                                            </div>
                                            <div className="mt-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-blue-400 via-emerald-400 to-emerald-500"
                                                    style={{ width: `${dataset.confidence}%` }}
                                                />
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-slate-200">{dataset.requests}</td>
                                        <td className="py-4 px-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge[dataset.status]}`}>
                                                {dataset.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-slate-300">{dataset.lastUpdated}</td>
                                        <td className="py-4 pl-4 text-right">
                                            <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700 hover:border-blue-500 text-xs font-semibold text-slate-200 hover:text-white transition-colors">
                                                Manage dataset
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

                <section className="grid xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2 bg-slate-800/60 border border-slate-700 rounded-2xl p-6 shadow-xl">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
                            <div>
                                <h2 className="text-xl font-semibold">Incoming access requests</h2>
                                <p className="text-slate-400 text-sm">Only org type and usage are shown; buyer identity stays hidden.</p>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/40 text-xs text-blue-100">
                                {activeRequests} awaiting
                            </span>
                        </div>

                        <div className="space-y-4">
                            {accessRequests.map(request => (
                                <div key={request.id} className="rounded-xl border border-slate-700 bg-slate-900/70 p-4 space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.12em] text-slate-400 mb-1">Dataset</p>
                                            <h3 className="text-lg font-semibold">{request.datasetName}</h3>
                                            <p className="text-xs text-slate-400">Request ID: {request.id}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${requestBadge[request.status]}`}>
                                            {request.status}
                                        </span>
                                    </div>
                                    <div className="grid md:grid-cols-3 gap-3 text-sm">
                                        <div className="bg-slate-800 rounded-lg border border-slate-700 p-3">
                                            <div className="text-slate-400 text-xs uppercase tracking-[0.12em] mb-1">Org type</div>
                                            <div className="text-slate-100">{request.organizationType}</div>
                                        </div>
                                        <div className="bg-slate-800 rounded-lg border border-slate-700 p-3 md:col-span-2">
                                            <div className="text-slate-400 text-xs uppercase tracking-[0.12em] mb-1">Intended usage</div>
                                            <div className="text-slate-100">{request.usage}</div>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 text-sm">
                                        <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-200">
                                            Duration: {request.duration}
                                        </span>
                                        <div className="flex gap-2">
                                            <button className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white transition-colors">
                                                Approve access
                                            </button>
                                            <button className="px-3 py-2 rounded-lg border border-rose-500 text-rose-100 hover:bg-rose-500/10 text-xs font-semibold transition-colors">
                                                Reject request
                                            </button>
                                            <button className="px-3 py-2 rounded-lg border border-slate-700 hover:border-blue-500 text-xs font-semibold text-slate-200 hover:text-white transition-colors">
                                                Ask clarification
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 shadow-xl">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="text-xl font-semibold">Performance summary</h2>
                                <p className="text-slate-400 text-sm">Monitor delivery signals.</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between bg-slate-900/70 border border-slate-700 rounded-lg p-3">
                                <div className="text-slate-300 text-sm">Freshness</div>
                                <div className="text-sm text-emerald-200">{performanceSummary.freshness}</div>
                            </div>
                            <div className="flex items-center justify-between bg-slate-900/70 border border-slate-700 rounded-lg p-3">
                                <div className="text-slate-300 text-sm">Uptime</div>
                                <div className="text-sm text-emerald-200">{performanceSummary.uptime}</div>
                            </div>
                            <div className="flex items-center justify-between bg-slate-900/70 border border-slate-700 rounded-lg p-3">
                                <div className="text-slate-300 text-sm">Anomalies this week</div>
                                <div className="text-sm text-amber-200">{performanceSummary.anomalies}</div>
                            </div>
                            <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-4">
                                <div className="text-slate-400 text-xs uppercase tracking-[0.12em] mb-2">Confidence trend</div>
                                <div className="text-3xl font-semibold text-cyan-300">{performanceSummary.avgConfidence}%</div>
                                <p className="text-slate-400 text-sm mt-1">Rolling average across active datasets.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
