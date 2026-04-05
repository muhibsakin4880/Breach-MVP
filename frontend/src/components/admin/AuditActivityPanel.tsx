import { recentAuditEvents } from './mockData'

const statusColors = {
    success: { indicator: 'bg-emerald-500', text: 'text-emerald-300' },
    warning: { indicator: 'bg-amber-500', text: 'text-amber-300' },
    error: { indicator: 'bg-red-500', text: 'text-red-300' }
}

export default function AuditActivityPanel() {
    return (
        <div className="rounded-xl border border-slate-800/60 bg-slate-900/65 shadow-2xl shadow-black/20 overflow-hidden">
            <div className="border-b border-slate-800/60 px-5 py-4">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-300">Audit Activity</h2>
                <p className="mt-1 text-[10px] leading-relaxed text-slate-500">Real-time compliance and access events</p>
            </div>
            <div className="divide-y divide-slate-800/35">
                {recentAuditEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-slate-900/30">
                        <div className="flex items-center gap-4">
                            <div className={`h-2 w-2 rounded-full ${statusColors[event.status].indicator}`} />
                            <div>
                                <p className={`text-[11px] font-semibold ${statusColors[event.status].text}`}>{event.event}</p>
                                <p className="mt-1 text-[10px] text-slate-500">{event.participant}</p>
                                <p className="text-[9px] text-slate-600">{event.dataset}</p>
                            </div>
                        </div>
                        <p className="text-[10px] font-mono text-slate-600">{event.timestamp}</p>
                    </div>
                ))}
            </div>
            <div className="flex justify-end border-t border-slate-800/60 px-5 py-3">
                <button className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 transition-colors hover:text-cyan-400">
                    View Full Audit Trail →
                </button>
            </div>
        </div>
    )
}