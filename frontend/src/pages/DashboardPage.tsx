import { Link } from 'react-router-dom'
import { datasetRequests, recentActivity, participantTrust, trustLevel, activityDot } from '../data/workspaceData'

export default function DashboardPage() {
    const misusePenalty = participantTrust.misuseWarning ? participantTrust.misusePenalty : 0
    const netTrustScore = Math.max(participantTrust.score - misusePenalty, 0)
    const pendingRequests = datasetRequests.filter(item => item.status === 'Pending').length
    const approvedAccess = datasetRequests.filter(item => item.status === 'Approved').length
    const recentCount = recentActivity.length

    const overviewCards = [
        {
            label: 'Trust Score',
            value: netTrustScore,
            helper: trustLevel(netTrustScore).label,
            gradient: 'from-emerald-500/20 via-emerald-400/10 to-slate-900'
        },
        {
            label: 'Pending Requests',
            value: pendingRequests,
            helper: 'Action required',
            gradient: 'from-amber-500/20 via-amber-400/10 to-slate-900'
        },
        {
            label: 'Approved Access',
            value: approvedAccess,
            helper: 'Active approvals',
            gradient: 'from-blue-500/20 via-blue-400/10 to-slate-900'
        },
        {
            label: 'Recent Activity',
            value: recentCount,
            helper: 'Last 7 days',
            gradient: 'from-cyan-500/20 via-cyan-400/10 to-slate-900'
        }
    ]

    return (
        <div className="bg-slate-900 text-white min-h-screen">
            <div className="border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-800">
                <div className="container mx-auto px-4 py-10 md:py-14 space-y-8">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs uppercase tracking-[0.12em] text-slate-300">
                            Participant Workspace
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-semibold mb-2">Dashboard Overview</h1>
                            <p className="text-slate-300 max-w-2xl">
                                High-level workspace summary. Use sidebar modules for detailed access, trust, and approval management.
                            </p>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {overviewCards.map(card => (
                            <div
                                key={card.label}
                                className={`rounded-xl border border-slate-800 bg-gradient-to-br ${card.gradient} p-4 shadow-lg`}
                            >
                                <div className="text-xs uppercase tracking-[0.12em] text-slate-400 mb-2">{card.label}</div>
                                <div className="flex items-baseline justify-between gap-3">
                                    <div className="text-3xl font-semibold">{card.value}</div>
                                    <div className="text-xs text-slate-400 text-right">{card.helper}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 space-y-6">
                <section className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 shadow-xl">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                        <div>
                            <h2 className="text-xl font-semibold">Recent activity summary</h2>
                            <p className="text-slate-400 text-sm">Latest workflow events across requests, approvals, and compliance.</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${trustLevel(netTrustScore).classes}`}>
                            Trust summary: {netTrustScore}
                        </span>
                    </div>

                    <div className="space-y-4 mb-6">
                        {recentActivity.slice(0, 4).map((item, idx) => (
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

                    <div className="flex flex-wrap gap-2">
                        <Link to="/access-requests" className="px-3 py-2 rounded-lg border border-slate-700 hover:border-blue-500 text-xs font-semibold text-slate-200 hover:text-white transition-colors">
                            Open Access Requests
                        </Link>
                        <Link to="/trust-profile" className="px-3 py-2 rounded-lg border border-slate-700 hover:border-blue-500 text-xs font-semibold text-slate-200 hover:text-white transition-colors">
                            Open Trust Profile
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    )
}
