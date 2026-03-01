import { Link } from 'react-router-dom'
import {
    activityDot,
    confidenceColor,
    datasetRequests,
    recentActivity,
    statusStyles,
    type DatasetRequest
} from '../data/workspaceData'

export default function AccessRequestsPage() {
    const requestedCount = datasetRequests.length
    const approvedCount = datasetRequests.filter(item => item.status === 'Approved').length
    const pendingCount = datasetRequests.filter(item => item.status === 'Pending').length

    return (
        <div className="container mx-auto px-4 py-10 space-y-6 text-white">
            <section className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
                    <div>
                        <h1 className="text-2xl font-semibold">Access Requests</h1>
                        <p className="text-slate-400 text-sm">
                            Full request pipeline management with confidence scores and status tracking.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs text-slate-300">
                            {requestedCount} requested
                        </span>
                        <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs text-slate-300">
                            {pendingCount} pending
                        </span>
                        <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs text-slate-300">
                            {approvedCount} approved
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="text-xs uppercase tracking-[0.08em] text-slate-400 border-b border-slate-700">
                            <tr>
                                <th className="py-3 pr-4 text-left font-medium">Dataset</th>
                                <th className="py-3 px-4 text-left font-medium">Confidence</th>
                                <th className="py-3 px-4 text-left font-medium">Status</th>
                                <th className="py-3 px-4 text-left font-medium">Last updated</th>
                                <th className="py-3 pl-4 text-right font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {datasetRequests.map((request) => (
                                <RequestTableRow key={request.id} request={request} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 shadow-xl">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-semibold">Recent request activity</h2>
                        <p className="text-slate-400 text-sm">Approvals, pending reviews, and declines.</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs text-slate-300">
                        {recentActivity.length} items
                    </span>
                </div>
                <div className="space-y-4">
                    {recentActivity.map((item, idx) => (
                        <div key={idx} className="flex gap-3">
                            <div className="pt-1">
                                <span className={`inline-block w-2.5 h-2.5 rounded-full ${activityDot[item.type]}`} />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-white">{item.label}</div>
                                <div className="text-xs text-slate-400">{item.timestamp}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}

type RequestTableRowProps = {
    request: DatasetRequest
}

function RequestTableRow({ request }: RequestTableRowProps) {
    return (
        <tr className="hover:bg-slate-800/60 transition-colors">
            <td className="py-4 pr-4">
                <div className="font-semibold">{request.name}</div>
                <div className="text-slate-400 text-xs">
                    {request.category} - {request.delivery}
                </div>
            </td>
            <td className="py-4 px-4">
                <div className={`text-base font-semibold ${confidenceColor(request.confidence)}`}>{request.confidence}%</div>
                <div className="mt-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-400 via-emerald-400 to-emerald-500"
                        style={{ width: `${request.confidence}%` }}
                    />
                </div>
            </td>
            <td className="py-4 px-4">
                <span className={`px-3 py-1 rounded-full border text-xs font-medium ${statusStyles[request.status]}`}>
                    {request.status}
                </span>
            </td>
            <td className="py-4 px-4 text-slate-300">{request.lastUpdated}</td>
            <td className="py-4 pl-4 text-right">
                <Link
                    to={`/access-requests/${request.id}`}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700 hover:border-blue-500 text-xs font-semibold text-slate-200 hover:text-white transition-colors"
                >
                    Request Details
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            </td>
        </tr>
    )
}
