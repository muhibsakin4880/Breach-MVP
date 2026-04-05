import { useState, useEffect } from 'react'
import { recentAuditEvents } from './mockData'

type AuditEvent = {
    id: string
    event: string
    participant: string
    dataset: string
    timestamp: string
    status: 'success' | 'warning' | 'error'
}

const statusConfig = {
    success: {
        icon: 'M5 13l4 4L19 7',
        bg: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
        border: 'border-l-emerald-500'
    },
    error: {
        icon: 'M6 18L18 6M6 6l12 12',
        bg: 'bg-red-500/20 border-red-500/30 text-red-400',
        border: 'border-l-red-500'
    },
    warning: {
        icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
        bg: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
        border: 'border-l-amber-500'
    }
}

export default function RecentActivityFeed() {
    const [lastUpdated, setLastUpdated] = useState('just now')
    const isEmpty = recentAuditEvents.length === 0

    useEffect(() => {
        const interval = setInterval(() => {
            setLastUpdated('just now')
        }, 30000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="rounded-xl border border-slate-800/60 bg-slate-900/65 shadow-2xl shadow-black/20 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800/60 px-5 py-4">
                <div>
                    <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-300">Recent Activity</h2>
                    <p className="mt-1 text-[10px] leading-relaxed text-slate-500">Live platform activity feed</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[9px] text-slate-600">Last updated: {lastUpdated}</span>
                    <span className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                        </span>
                        <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-emerald-400">LIVE</span>
                    </span>
                </div>
            </div>

            {isEmpty ? (
                <div className="flex flex-col items-center justify-center py-16 px-5">
                    <div className="w-12 h-12 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-400">No recent activity</p>
                    <p className="text-[10px] text-slate-600 mt-1">Activity will appear here</p>
                </div>
            ) : (
                <div className="divide-y divide-slate-800/35">
                    {recentAuditEvents.map((event) => {
                        const status = statusConfig[event.status]
                        return (
                            <div
                                key={event.id}
                                className={`flex items-center gap-4 px-5 py-3.5 transition-all hover:bg-slate-800/50 hover:border-l-2 ${status.border}`}
                            >
                                <div className={`flex-shrink-0 w-7 h-7 rounded-full border flex items-center justify-center ${status.bg}`}>
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d={status.icon} />
                                    </svg>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-semibold text-slate-200">{event.event}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] font-mono text-cyan-400">{event.participant}</span>
                                        <span className="text-[9px] text-slate-600">→</span>
                                        <span className="text-[10px] text-slate-500 truncate">{event.dataset}</span>
                                    </div>
                                </div>

                                <div className="flex-shrink-0">
                                    <span className="text-[10px] font-mono text-slate-600">{event.timestamp}</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            <div className="flex justify-end border-t border-slate-800/60 px-5 py-3">
                <a href="/admin/audit-trail" className="text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan-400 hover:text-cyan-300 transition-colors">
                    View Full Audit Trail →
                </a>
            </div>
        </div>
    )
}