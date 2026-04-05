import { useState } from 'react'

const buttonConfig = [
    {
        id: 'release_escrow',
        label: 'Release Escrow',
        icon: 'M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z',
        color: 'green',
        type: 'toast',
        toastMessage: 'Escrow released successfully ✓',
        tooltip: 'Release all funds in pending escrow accounts'
    },
    {
        id: 'revoke_tokens',
        label: 'Revoke All Tokens',
        icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
        color: 'red',
        type: 'confirm',
        confirmTitle: 'Are you sure?',
        confirmMessage: 'This will revoke all active tokens immediately.',
        confirmButton: 'Yes, Revoke All',
        tooltip: 'Immediately revoke all active session tokens'
    },
    {
        id: 'ai_audit',
        label: 'Run Full AI Audit',
        icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z',
        color: 'blue',
        type: 'toast',
        toastMessage: 'AI Audit initiated... Results in 2-3 minutes',
        tooltip: 'Run comprehensive AI-powered security audit'
    },
    {
        id: 'export_report',
        label: 'Export Compliance Report',
        icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4',
        color: 'cyan',
        type: 'toast',
        toastMessage: 'Compliance report exported successfully ✓',
        tooltip: 'Export compliance audit report as PDF'
    },
    {
        id: 'approve_low_risk',
        label: 'Approve All Low-Risk',
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        color: 'green',
        type: 'confirm',
        confirmTitle: 'Approve all items',
        confirmMessage: 'with risk score below 50?',
        confirmButton: 'Yes, Approve All',
        tooltip: 'Bulk approve all low-risk access requests'
    },
    {
        id: 'block_provider',
        label: 'Block Suspicious Provider',
        icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
        color: 'red',
        type: 'modal',
        modalTitle: 'Block Suspicious Provider',
        modalPlaceholder: 'Enter Provider ID to block',
        modalButton: 'Block Provider',
        tooltip: 'Block a provider by their ID'
    }
]

const colorClasses = {
    green: {
        bg: 'bg-emerald-500/10 border-emerald-500/20',
        icon: 'text-emerald-400',
        hover: 'hover:bg-emerald-500/20 hover:border-emerald-500/40',
        active: 'active:scale-95'
    },
    red: {
        bg: 'bg-red-500/10 border-red-500/20',
        icon: 'text-red-400',
        hover: 'hover:bg-red-500/20 hover:border-red-500/40',
        active: 'active:scale-95'
    },
    blue: {
        bg: 'bg-blue-500/10 border-blue-500/20',
        icon: 'text-blue-400',
        hover: 'hover:bg-blue-500/20 hover:border-blue-500/40',
        active: 'active:scale-95'
    },
    cyan: {
        bg: 'bg-cyan-500/10 border-cyan-500/20',
        icon: 'text-cyan-400',
        hover: 'hover:bg-cyan-500/20 hover:border-cyan-500/40',
        active: 'active:scale-95'
    }
}

export default function QuickActionsBar() {
    const [toast, setToast] = useState<string | null>(null)
    const [confirm, setConfirm] = useState<{ title: string; message: string; button: string; onConfirm: () => void } | null>(null)
    const [modal, setModal] = useState<{ title: string; placeholder: string; button: string } | null>(null)
    const [providerId, setProviderId] = useState('')

    const showToast = (message: string) => {
        setToast(message)
        setTimeout(() => setToast(null), 3000)
    }

    const handleAction = (config: typeof buttonConfig[0]) => {
        if (config.type === 'toast') {
            showToast(config.toastMessage!)
        } else if (config.type === 'confirm') {
            setConfirm({
                title: config.confirmTitle!,
                message: config.confirmMessage!,
                button: config.confirmButton!,
                onConfirm: () => {
                    showToast('Action completed successfully ✓')
                    setConfirm(null)
                }
            })
        } else if (config.type === 'modal') {
            setModal({
                title: config.modalTitle!,
                placeholder: config.modalPlaceholder!,
                button: config.modalButton!
            })
        }
    }

    const handleModalConfirm = () => {
        if (providerId.trim()) {
            showToast(`Provider ${providerId} blocked successfully ✓`)
            setProviderId('')
            setModal(null)
        }
    }

    return (
        <>
            <div className="rounded-xl border border-slate-800/60 bg-slate-900/65 shadow-2xl shadow-black/20 overflow-hidden">
                <div className="border-b border-slate-800/60 px-5 py-4">
                    <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-300">Quick Actions</h2>
                    <p className="mt-1 text-[10px] leading-relaxed text-slate-500">One-click administrative controls</p>
                </div>
                <div className="grid grid-cols-6 gap-4 p-5">
                    {buttonConfig.map((btn) => (
                        <button
                            key={btn.id}
                            onClick={() => handleAction(btn)}
                            className={`group relative flex flex-col items-center justify-center gap-3 rounded-lg border p-4 transition-all duration-200 ${colorClasses[btn.color as keyof typeof colorClasses].bg} ${colorClasses[btn.color as keyof typeof colorClasses].hover} ${colorClasses[btn.color as keyof typeof colorClasses].active}`}
                        >
                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800/50 ${colorClasses[btn.color as keyof typeof colorClasses].icon}`}>
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d={btn.icon} />
                                </svg>
                            </div>
                            <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-300 text-center">
                                {btn.label}
                            </span>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-[9px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                {btn.tooltip}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-700" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {toast && (
                <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4">
                    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 shadow-xl backdrop-blur-xl">
                        <p className="text-[11px] font-medium text-emerald-300 whitespace-pre-line">{toast}</p>
                    </div>
                </div>
            )}

            {confirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-xl border border-slate-800/60 bg-slate-900/95 p-6 shadow-2xl">
                        <h3 className="text-[12px] font-semibold text-slate-200">{confirm.title}</h3>
                        <p className="mt-2 text-[10px] text-slate-400">{confirm.message}</p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setConfirm(null)}
                                className="rounded-md border border-slate-700/70 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 transition-all hover:bg-slate-800/60"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirm.onConfirm}
                                className="rounded-md bg-red-500/20 border border-red-500/30 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-red-300 transition-all hover:bg-red-500/30"
                            >
                                {confirm.button}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-xl border border-slate-800/60 bg-slate-900/95 p-6 shadow-2xl">
                        <h3 className="text-[12px] font-semibold text-slate-200">{modal.title}</h3>
                        <input
                            type="text"
                            value={providerId}
                            onChange={(e) => setProviderId(e.target.value)}
                            placeholder={modal.placeholder}
                            className="mt-4 w-full rounded-lg border border-slate-700/70 bg-slate-800/50 px-3 py-2.5 text-[11px] text-slate-300 placeholder-slate-600 outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20"
                        />
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setModal(null)
                                    setProviderId('')
                                }}
                                className="rounded-md border border-slate-700/70 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 transition-all hover:bg-slate-800/60"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleModalConfirm}
                                className="rounded-md bg-red-500/20 border border-red-500/30 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-red-300 transition-all hover:bg-red-500/30"
                            >
                                {modal.button}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}