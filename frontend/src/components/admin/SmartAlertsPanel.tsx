import { smartAlerts } from './mockData'

const severityColors = {
    critical: 'bg-red-500/20 text-red-300 border-red-500/30',
    high: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    medium: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
}

const typeBorderColors: Record<string, string> = {
    high_risk: 'border-l-red-500',
    compliance: 'border-l-red-500',
    escrow: 'border-l-amber-500',
    ai_flag: 'border-l-amber-500',
    token: 'border-l-blue-500'
}

export default function SmartAlertsPanel() {
    const isEmpty = smartAlerts.length === 0
    
    return (
        <div className="rounded-xl border border-slate-800/60 bg-slate-900/65 shadow-2xl shadow-black/20 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800/60 px-5 py-4">
                <div>
                    <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-300">Smart Alerts</h2>
                    <p className="mt-1 text-[10px] leading-relaxed text-slate-500">AI-generated critical items requiring attention</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    </span>
                    <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-emerald-400">LIVE</span>
                </div>
            </div>
            {isEmpty ? (
                <div className="flex flex-col items-center justify-center py-16 px-5">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <p className="text-[11px] font-semibold text-emerald-400">No active alerts</p>
                    <p className="text-[10px] text-slate-500 mt-1">All systems operating normally</p>
                </div>
            ) : (
                <div className="divide-y divide-slate-800/35">
                    {smartAlerts.map((alert) => (
                        <div
                            key={alert.id}
                            className={`flex items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-900/30 border-l-4 ${typeBorderColors[alert.type]}`}
                        >
                            <div className="flex-shrink-0">
                                <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] ${severityColors[alert.severity]}`}>
                                    {alert.severity}
                                </span>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[11px] font-semibold text-slate-200">{alert.title}</p>
                                <p className="mt-1 text-[10px] leading-relaxed text-slate-400">{alert.description}</p>
                                <p className="mt-1.5 text-[9px] text-slate-600">{alert.timestamp}</p>
                            </div>
                            <div className="flex flex-shrink-0 items-center gap-2">
                                {alert.actions.map((action, idx) => (
                                    <button
                                        key={action}
                                        className={idx === 0
                                            ? 'rounded-md bg-red-500/20 border border-red-500/30 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-red-300 transition-all duration-200 hover:bg-red-500/30 active:scale-95'
                                            : 'rounded-md border border-slate-700/70 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400 transition-all duration-200 hover:bg-slate-800/60 active:scale-95'
                                        }
                                    >
                                        {action}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <div className="flex justify-end border-t border-slate-800/60 px-5 py-3">
                <button className="text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan-400 transition-colors hover:text-cyan-300">
                    View All Alerts →
                </button>
            </div>
        </div>
    )
}