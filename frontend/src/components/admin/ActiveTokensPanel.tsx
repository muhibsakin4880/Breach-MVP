import { activeTokens } from './mockData'

type Token = {
    id: string
    tokenId: string
    participant: string
    dataset: string
    expiresAt: string
    status: 'active' | 'expiring' | 'suspicious'
}

const statusConfig = {
    active: { label: 'Active', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    expiring: { label: 'Expiring', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    suspicious: { label: 'Suspicious', color: 'bg-red-500/20 text-red-400 border-red-500/30' }
}

export default function ActiveTokensPanel() {
    const activeCount = activeTokens.filter(t => t.status === 'active').length
    const expiringCount = activeTokens.filter(t => t.status === 'expiring').length
    const suspiciousCount = activeTokens.filter(t => t.status === 'suspicious').length

    return (
        <div className="rounded-xl border border-slate-800/60 bg-slate-900/65 shadow-2xl shadow-black/20 overflow-hidden h-full">
            <div className="flex items-center justify-between border-b border-slate-800/60 px-5 py-4">
                <div>
                    <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-300">Active Tokens</h2>
                    <p className="mt-1 text-[10px] leading-relaxed text-slate-500">Ephemeral session overview</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-px bg-slate-800/30 border-b border-slate-800/60">
                <div className="bg-slate-900/80 px-4 py-3 text-center">
                    <p className="text-lg font-semibold text-emerald-400">{activeCount}</p>
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">Active</p>
                </div>
                <div className="bg-slate-900/80 px-4 py-3 text-center border-l border-slate-800/60">
                    <p className="text-lg font-semibold text-amber-400">{expiringCount}</p>
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">Expiring</p>
                </div>
                <div className="bg-slate-900/80 px-4 py-3 text-center border-l border-slate-800/60">
                    <p className="text-lg font-semibold text-red-400">{suspiciousCount}</p>
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">Suspicious</p>
                </div>
            </div>

            <div className="divide-y divide-slate-800/35">
                {activeTokens.map((token) => {
                    const status = statusConfig[token.status]
                    return (
                        <div key={token.id} className="px-5 py-3.5 hover:bg-slate-800/30 transition-colors">
                            <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] font-mono text-cyan-400 truncate">{token.tokenId}</p>
                                    <p className="text-[10px] text-slate-500 mt-1 truncate">{token.participant}</p>
                                    <p className="text-[9px] text-slate-600 mt-0.5 truncate">{token.dataset}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`text-[8px] font-semibold uppercase tracking-[0.1em] px-2 py-1 rounded border ${status.color}`}>
                                        {status.label}
                                    </span>
                                    <span className="text-[9px] font-mono text-slate-500">{token.expiresAt}</span>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="flex justify-end border-t border-slate-800/60 px-5 py-3">
                <a href="/admin/ephemeral-tokens" className="text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan-400 hover:text-cyan-300 transition-colors">
                    Manage Tokens →
                </a>
            </div>
        </div>
    )
}