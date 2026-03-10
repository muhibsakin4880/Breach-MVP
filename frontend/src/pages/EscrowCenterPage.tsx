import { useMemo, useState } from 'react'

type EscrowStatus =
    | 'REQUEST_SUBMITTED'
    | 'ESCROW_PENDING'
    | 'ESCROW_ACTIVE'
    | 'IN_PROGRESS'
    | 'ESCROW_RELEASED'
    | 'ESCROW_DISPUTE'

type EscrowTransaction = {
    id: string
    dataset: string
    buyer: string
    provider: string
    amount: string
    status: EscrowStatus
}

const summaryStats = [
    { label: 'Active Escrows', value: '4' },
    { label: 'Pending Approval', value: '2' },
    { label: 'Released This Month', value: '12' },
    { label: 'Disputes', value: '1' },
    { label: 'Total Value in Escrow', value: '$8,420' }
]

const escrowTransactions: EscrowTransaction[] = [
    {
        id: 'ESC-2026-001',
        dataset: 'Global Climate 2020-2024',
        buyer: 'part_anon_042',
        provider: 'anon_provider_003',
        amount: '$299',
        status: 'REQUEST_SUBMITTED'
    },
    {
        id: 'ESC-2026-002',
        dataset: 'Financial Tick Data',
        buyer: 'part_anon_017',
        provider: 'anon_provider_007',
        amount: '$499',
        status: 'ESCROW_PENDING'
    },
    {
        id: 'ESC-2026-003',
        dataset: 'Clinical Outcomes Delta',
        buyer: 'part_anon_089',
        provider: 'anon_provider_012',
        amount: '$799',
        status: 'ESCROW_ACTIVE'
    },
    {
        id: 'ESC-2026-004',
        dataset: 'Consumer Behavior Analytics',
        buyer: 'part_anon_031',
        provider: 'anon_provider_005',
        amount: '$399',
        status: 'IN_PROGRESS'
    },
    {
        id: 'ESC-2026-005',
        dataset: 'Genomics Research Dataset',
        buyer: 'part_anon_056',
        provider: 'anon_provider_009',
        amount: '$599',
        status: 'ESCROW_RELEASED'
    },
    {
        id: 'ESC-2026-006',
        dataset: 'Satellite Land Use 2024',
        buyer: 'part_anon_008',
        provider: 'anon_provider_002',
        amount: '$249',
        status: 'ESCROW_DISPUTE'
    }
]

const statusStyles: Record<EscrowStatus, { badge: string; dot: string }> = {
    REQUEST_SUBMITTED: {
        badge: 'border-slate-500/40 bg-slate-500/10 text-slate-300',
        dot: 'bg-slate-400'
    },
    ESCROW_PENDING: {
        badge: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
        dot: 'bg-amber-400'
    },
    ESCROW_ACTIVE: {
        badge: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
        dot: 'bg-blue-400'
    },
    IN_PROGRESS: {
        badge: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
        dot: 'bg-blue-400 animate-pulse'
    },
    ESCROW_RELEASED: {
        badge: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
        dot: 'bg-emerald-400'
    },
    ESCROW_DISPUTE: {
        badge: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
        dot: 'bg-rose-400'
    }
}

const timelineSteps = [
    { label: 'Request Submitted', timestamp: '2026-03-08 09:14', state: 'complete' },
    { label: 'Escrow Pending', timestamp: '2026-03-08 09:15', state: 'complete' },
    { label: 'Provider Approved', timestamp: '2026-03-08 11:32', state: 'complete' },
    {
        label: 'Escrow Active',
        timestamp: 'Since 2026-03-08 11:33',
        state: 'active',
        detail: ['Controlled access granted', 'Monitoring active']
    },
    { label: 'Escrow Released', timestamp: 'Pending', state: 'pending' },
    { label: 'Trust Score Updated', timestamp: 'Pending', state: 'pending' }
]

export default function EscrowCenterPage() {
    const [selectedId, setSelectedId] = useState('ESC-2026-003')

    const selectedTransaction = useMemo(() => {
        return escrowTransactions.find(item => item.id === selectedId) ?? escrowTransactions[2]
    }, [selectedId])

    return (
        <div className="relative min-h-screen bg-[#050b15] text-white">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(34,211,238,0.12),transparent_40%),radial-gradient(circle_at_88%_12%,rgba(59,130,246,0.1),transparent_38%)]" />
            <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-10">
                <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Escrow Center
                        </div>
                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">Escrow Center</h1>
                        <p className="mt-2 max-w-2xl text-slate-400">
                            Secure transaction management for all dataset access requests
                        </p>
                    </div>
                    <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.18)]">
                        Escrow protections active across all transactions
                    </div>
                </header>

                <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {summaryStats.map(stat => (
                        <div
                            key={stat.label}
                            className="rounded-2xl border border-white/10 bg-[#0a1628] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
                        >
                            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{stat.label}</p>
                            <p className="mt-3 text-2xl font-semibold text-white">{stat.value}</p>
                        </div>
                    ))}
                </section>

                <section className="mt-10 grid gap-6 lg:grid-cols-[1.25fr_0.9fr]">
                    <div className="rounded-2xl border border-white/10 bg-[#0a1628] shadow-[0_10px_40px_rgba(0,0,0,0.25)] overflow-hidden">
                        <div className="px-5 py-4 border-b border-white/10">
                            <h2 className="text-lg font-semibold text-white">Escrow Transactions</h2>
                            <p className="text-xs text-slate-500">Click a request to view escrow detail</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left">
                                <thead className="bg-white/5 text-[11px] uppercase tracking-[0.14em] text-slate-500">
                                    <tr>
                                        {['Request ID', 'Dataset', 'Buyer', 'Provider', 'Amount', 'Status'].map(head => (
                                            <th key={head} className="px-4 py-3 whitespace-nowrap">
                                                {head}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-sm">
                                    {escrowTransactions.map(row => {
                                        const isSelected = row.id === selectedId
                                        const statusStyle = statusStyles[row.status]
                                        return (
                                            <tr
                                                key={row.id}
                                                className={`cursor-pointer transition-colors ${
                                                    isSelected ? 'bg-white/5' : 'hover:bg-white/5'
                                                }`}
                                                onClick={() => setSelectedId(row.id)}
                                            >
                                                <td className="px-4 py-3 text-slate-200 whitespace-nowrap">{row.id}</td>
                                                <td className="px-4 py-3 text-white whitespace-nowrap">{row.dataset}</td>
                                                <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{row.buyer}</td>
                                                <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{row.provider}</td>
                                                <td className="px-4 py-3 text-slate-200 whitespace-nowrap">{row.amount}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusStyle.badge}`}
                                                    >
                                                        <span className={`h-2 w-2 rounded-full ${statusStyle.dot}`} />
                                                        {row.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-[#0a1628] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.25)] space-y-6">
                        <div>
                            <h2 className="text-xl font-semibold text-white">
                                Escrow Detail - {selectedTransaction.id}
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">
                                Active escrow monitoring for {selectedTransaction.dataset}
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-xs uppercase tracking-[0.14em] text-slate-500">Status Timeline</h3>
                            <div className="space-y-3">
                                {timelineSteps.map(step => (
                                    <div key={step.label} className="flex items-start gap-3">
                                        <div className="mt-1">
                                            {step.state === 'complete' && (
                                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
                                                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                        <path
                                                            d="M20 7L9 18l-5-5"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                </span>
                                            )}
                                            {step.state === 'active' && (
                                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20">
                                                    <span className="h-2.5 w-2.5 rounded-full bg-blue-400" />
                                                </span>
                                            )}
                                            {step.state === 'pending' && (
                                                <span className="flex h-5 w-5 items-center justify-center rounded-md border border-slate-600 text-slate-500">
                                                    <span className="h-2 w-2 rounded-sm bg-slate-600" />
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 text-sm text-slate-200">
                                                <span className="font-semibold">{step.label}</span>
                                                <span className="text-xs text-slate-500">- {step.timestamp}</span>
                                            </div>
                                            {'detail' in step && step.detail && (
                                                <div className="mt-1 text-xs text-slate-400 space-y-1">
                                                    {step.detail.map(detail => (
                                                        <div key={detail}>{detail}</div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-300">Escrow window</span>
                                <span className="text-sm font-mono text-amber-300">47:23:11 remaining</span>
                            </div>
                            <div className="flex items-center justify-between text-sm text-slate-300">
                                <span>Access type</span>
                                <span className="text-slate-200">48 hours Extended</span>
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4 space-y-2">
                            <h3 className="text-sm font-semibold text-white">Monitoring Summary</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm text-slate-300">
                                <div>API calls made: 23</div>
                                <div>Export attempts: 0</div>
                                <div>Policy violations: 0</div>
                                <div className="text-emerald-300 flex items-center gap-2">
                                    <span>Status: Clean</span>
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path
                                            d="M20 7L9 18l-5-5"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <button className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white">
                                Release Payment
                            </button>
                            <button className="w-full rounded-lg border border-rose-500/60 px-4 py-2.5 text-sm font-semibold text-rose-200 hover:bg-rose-500/10">
                                Raise Dispute
                            </button>
                            <button className="w-full rounded-lg border border-blue-500/60 px-4 py-2.5 text-sm font-semibold text-blue-200 hover:bg-blue-500/10">
                                Extend Window
                            </button>
                        </div>
                    </div>
                </section>

                <section className="mt-10 rounded-2xl border border-white/10 bg-[#0a1628] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <h2 className="text-xl font-semibold text-white">Active Disputes</h2>
                        <span className="text-xs text-slate-500">Escalations requiring review</span>
                    </div>
                    <div className="mt-5 rounded-xl border border-slate-700 bg-slate-900/70 p-5">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div className="space-y-2">
                                <div className="text-sm font-semibold text-white">
                                    ESC-2026-006 | Satellite Land Use 2024
                                </div>
                                <div className="text-xs text-slate-400">Raised by: part_anon_008</div>
                                <div className="text-xs text-slate-400">
                                    Reason: "Data schema mismatch from description"
                                </div>
                                <div className="text-xs text-slate-400">Raised: 2026-03-09</div>
                            </div>
                            <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold text-amber-200">
                                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                                Under Investigation
                            </span>
                        </div>
                        <div className="mt-4 grid gap-2 md:grid-cols-3">
                            <button className="rounded-lg border border-slate-600 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-slate-400 hover:text-white">
                                View Evidence
                            </button>
                            <button className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-xs font-semibold text-white">
                                Resolve in favor of Buyer
                            </button>
                            <button className="rounded-lg bg-blue-600 hover:bg-blue-500 px-3 py-2 text-xs font-semibold text-white">
                                Resolve in favor of Provider
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
