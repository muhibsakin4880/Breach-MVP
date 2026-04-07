import {
    Bar,
    BarChart,
    CartesianGrid,
    LabelList,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts'
import {
    chargebackSummary,
    credentialHistory,
    participantApiCredential,
    policyEvents,
    recentApiActivity,
    usageAnomalies as usageAlerts,
    usageDatasetRows as datasetRows,
    usageSummaryStats as summaryStats,
    usageTrendData as trendData
} from '../data/pipelineOpsData'
import { useToast } from '../components/Toast'

type AnomalyTone = 'alert' | 'warn' | 'resolved'
type ApiTone = (typeof recentApiActivity)[number]['tone']
type PolicyTone = (typeof policyEvents)[number]['tone']
type CredentialHistoryTone = (typeof credentialHistory)[number]['status']

const chartAxisStyle = {
    fill: '#94a3b8',
    fontSize: 12
} as const

const chartTooltipContentStyle = {
    backgroundColor: 'rgba(7, 15, 29, 0.94)',
    border: '1px solid rgba(59, 130, 246, 0.35)',
    borderRadius: '18px',
    boxShadow: '0 24px 40px -20px rgba(2, 6, 23, 0.9)'
} as const

const chartTooltipLabelStyle = {
    color: '#e2e8f0',
    fontWeight: 600
} as const

const chartTooltipItemStyle = {
    color: '#bfdbfe'
} as const

const chartLabelStyle = {
    fill: '#dbeafe',
    fontSize: 11,
    fontWeight: 600
} as const

const alertToneStyles: Record<AnomalyTone, string> = {
    alert: 'border-rose-500/40 bg-rose-500/10 shadow-[0_10px_40px_rgba(244,63,94,0.22)]',
    warn: 'border-amber-400/40 bg-amber-400/10 shadow-[0_10px_40px_rgba(245,158,11,0.18)]',
    resolved: 'border-emerald-400/40 bg-emerald-400/10 shadow-[0_10px_40px_rgba(16,185,129,0.18)]'
}

const alertDotStyles: Record<AnomalyTone, string> = {
    alert: 'bg-rose-400 shadow-[0_0_14px_rgba(244,63,94,0.8)]',
    warn: 'bg-amber-300 shadow-[0_0_14px_rgba(245,158,11,0.8)]',
    resolved: 'bg-emerald-400 shadow-[0_0_14px_rgba(16,185,129,0.75)]'
}

const activityToneStyles: Record<ApiTone, string> = {
    success: 'border-emerald-400/25 bg-emerald-500/10 text-emerald-200',
    pending: 'border-amber-400/25 bg-amber-500/10 text-amber-200',
    info: 'border-cyan-400/25 bg-cyan-500/10 text-cyan-200'
}

const policyToneStyles: Record<PolicyTone, string> = {
    success: 'bg-emerald-400',
    warn: 'bg-amber-300',
    info: 'bg-cyan-300'
}

const credentialHistoryToneStyles: Record<CredentialHistoryTone, string> = {
    current: 'bg-cyan-300',
    success: 'bg-emerald-400',
    info: 'bg-slate-300'
}

const formatQueryValue = (value: unknown) => {
    if (typeof value === 'number') return value.toLocaleString()
    if (typeof value === 'string') return value
    if (Array.isArray(value)) return value.join(', ')
    return ''
}

const formatYAxisTick = (value: number) => `${Math.round(value / 100) / 10}k`

export default function UsageAnalyticsPage() {
    const { showToast } = useToast()

    return (
        <div className="relative min-h-screen bg-[#040812] text-white">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_16%,rgba(59,130,246,0.12),transparent_28%),radial-gradient(circle_at_86%_14%,rgba(34,211,238,0.12),transparent_24%),radial-gradient(circle_at_48%_82%,rgba(45,212,191,0.08),transparent_28%)]" />
            <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-10">
                <header className="relative rounded-[30px] border border-blue-500/20 bg-[linear-gradient(135deg,rgba(8,15,29,0.95),rgba(12,22,40,0.92)_44%,rgba(7,15,28,0.98))] p-6 shadow-[0_30px_80px_-50px_rgba(37,99,235,0.6)]">
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-[34%] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15),transparent_62%)]" />
                    <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                                Participant metering
                            </div>
                            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">Usage Analytics</h1>
                            <p className="mt-3 text-sm leading-6 text-slate-400">
                                Meter approved usage, follow API activity, inspect policy controls, and close the billing loop for this participant workspace.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
                            <div className="rounded-2xl border border-white/10 bg-[#07111f]/80 px-4 py-3">
                                <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">API credential</div>
                                <div className="mt-2 text-sm font-medium text-slate-100">{participantApiCredential.statusLabel}</div>
                            </div>
                            <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-100 shadow-[0_0_24px_rgba(59,130,246,0.25)]">
                                Live metering is active · Updated 5 minutes ago
                            </div>
                        </div>
                    </div>
                </header>

                <section className="mt-8">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {summaryStats.map(stat => (
                            <article
                                key={stat.label}
                                className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a1424]/88 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.28)]"
                            >
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.16),transparent_48%)]" />
                                <div className="relative">
                                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">{stat.label}</p>
                                    <p className="mt-4 text-[2rem] font-semibold tracking-[-0.06em] text-white">{stat.value}</p>
                                    <p className="mt-2 text-sm leading-6 text-slate-400">{stat.hint}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.9fr)]">
                    <article className="rounded-[28px] border border-blue-500/20 bg-gradient-to-b from-[#0a1424] via-[#09111f] to-[#050b16] p-6 shadow-[0_24px_70px_-40px_rgba(30,64,175,0.35)]">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Query Trend</h2>
                                <p className="mt-2 text-sm leading-6 text-slate-400">Last 7 days · participant API calls across approved routes</p>
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-100">
                                <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.9)]" />
                                Live sampling
                            </div>
                        </div>
                        <div className="mt-6 h-72 rounded-2xl border border-white/10 bg-[#07111f]/85 px-4 py-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={trendData} margin={{ top: 24, right: 8, left: -18, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="usageTrendFill" x1="0" x2="0" y1="0" y2="1">
                                            <stop offset="0%" stopColor="#67e8f9" />
                                            <stop offset="48%" stopColor="#38bdf8" />
                                            <stop offset="100%" stopColor="#2563eb" />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} stroke="rgba(148,163,184,0.12)" strokeDasharray="3 3" />
                                    <XAxis axisLine={false} dataKey="label" tick={chartAxisStyle} tickLine={false} />
                                    <YAxis
                                        axisLine={false}
                                        domain={[0, 2400]}
                                        tick={chartAxisStyle}
                                        tickFormatter={formatYAxisTick}
                                        tickLine={false}
                                        width={44}
                                    />
                                    <Tooltip
                                        contentStyle={chartTooltipContentStyle}
                                        cursor={{ fill: 'rgba(59,130,246,0.08)' }}
                                        formatter={(value) => [formatQueryValue(value), 'API calls']}
                                        itemStyle={chartTooltipItemStyle}
                                        labelStyle={chartTooltipLabelStyle}
                                    />
                                    <Bar
                                        animationDuration={700}
                                        barSize={30}
                                        dataKey="value"
                                        fill="url(#usageTrendFill)"
                                        radius={[12, 12, 0, 0]}
                                    >
                                        <LabelList dataKey="value" formatter={formatQueryValue} position="top" style={chartLabelStyle} />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </article>

                    <article className="rounded-[28px] border border-white/10 bg-[#0a1424]/92 p-6 shadow-[0_20px_60px_-38px_rgba(2,6,23,0.95)]">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">API credential status</h2>
                                <p className="mt-2 text-sm leading-6 text-slate-400">Current production key posture, scope coverage, and recent credential changes.</p>
                            </div>
                            <span className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-200">
                                Active
                            </span>
                        </div>

                        <div className="mt-5 rounded-2xl border border-white/10 bg-[#07111f]/85 px-4 py-4">
                            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Masked key</div>
                            <div className="mt-2 font-mono text-sm text-slate-200">{participantApiCredential.maskedKey}</div>
                            <div className="mt-4 text-sm font-medium text-white">{participantApiCredential.environment}</div>
                            <p className="mt-2 text-sm leading-6 text-slate-400">{participantApiCredential.residencyNote}</p>

                            <div className="mt-5 grid gap-3">
                                {participantApiCredential.metrics.map(metric => (
                                    <div key={metric} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-slate-200">
                                        {metric}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-5">
                                <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Scopes</div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {participantApiCredential.scopes.map(scope => (
                                        <span key={scope} className="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1 text-xs font-medium text-slate-300">
                                            {scope}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-5">
                            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Credential history</div>
                            <div className="mt-3 space-y-3">
                                {credentialHistory.map(item => (
                                    <div key={item.label} className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                        <span className={`mt-1 h-2.5 w-2.5 rounded-full ${credentialHistoryToneStyles[item.status]}`} />
                                        <div>
                                            <div className="text-sm font-medium text-white">{item.label}</div>
                                            <div className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">{item.timestamp}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </article>
                </section>

                <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.9fr)]">
                    <article className="rounded-[28px] border border-white/10 bg-[#0a1424]/92 p-6 shadow-[0_20px_60px_-38px_rgba(2,6,23,0.95)]">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Active dataset usage</h2>
                                <p className="mt-2 text-sm leading-6 text-slate-400">Approved routes with participant traffic, quota pressure, and chargeback contribution.</p>
                            </div>
                            <span className="rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-100">
                                Ranked by API calls
                            </span>
                        </div>
                        <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
                            <table className="w-full text-sm">
                                <thead className="bg-white/5 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Dataset</th>
                                        <th className="px-4 py-3 text-right">Queries</th>
                                        <th className="hidden px-4 py-3 text-left md:table-cell">Last active</th>
                                        <th className="hidden px-4 py-3 text-left lg:table-cell">Quota</th>
                                        <th className="px-4 py-3 text-right">Chargeback</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/70">
                                    {datasetRows.map(row => (
                                        <tr key={row.dataset} className="transition-colors hover:bg-white/5">
                                            <td className="px-4 py-3 text-left font-medium text-white">{row.dataset}</td>
                                            <td className="px-4 py-3 text-right text-slate-200">{row.queries}</td>
                                            <td className="hidden px-4 py-3 text-left text-slate-300 md:table-cell">{row.lastActive}</td>
                                            <td className="hidden px-4 py-3 text-left text-slate-300 lg:table-cell">{row.quota}</td>
                                            <td className="px-4 py-3 text-right font-semibold text-emerald-200">{row.chargeback}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </article>

                    <article className="rounded-[28px] border border-white/10 bg-[#0a1424]/92 p-6 shadow-[0_20px_60px_-38px_rgba(2,6,23,0.95)]">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Usage alerts</h2>
                                <p className="mt-2 text-sm leading-6 text-slate-400">Participant-relevant quota, export, and credential notices that need monitoring.</p>
                            </div>
                            <span className="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300">
                                {usageAlerts.length} alerts
                            </span>
                        </div>
                        <div className="mt-5 space-y-3">
                            {usageAlerts.map(alert => (
                                <article key={alert.title} className={`rounded-2xl border px-5 py-4 ${alertToneStyles[alert.tone]}`}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <div className="text-sm font-semibold text-white">{alert.title}</div>
                                            <p className="mt-3 text-sm leading-6 text-slate-100">{alert.detail}</p>
                                            <p className="mt-2 text-xs leading-5 text-slate-200/75">{alert.action}</p>
                                        </div>
                                        <span className={`mt-1 h-2.5 w-2.5 rounded-full ${alertDotStyles[alert.tone]}`} />
                                    </div>
                                    <div className="mt-4 inline-flex rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80">
                                        {alert.status}
                                    </div>
                                </article>
                            ))}
                        </div>
                    </article>
                </section>

                <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
                    <article className="rounded-[28px] border border-white/10 bg-[#0a1424]/92 p-6 shadow-[0_20px_60px_-38px_rgba(2,6,23,0.95)]">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Recent API activity</h2>
                                <p className="mt-2 text-sm leading-6 text-slate-400">Latest routes, request outcomes, and participant-side activity across the active workspace.</p>
                            </div>
                            <span className="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300">
                                Last 3 events
                            </span>
                        </div>

                        <div className="mt-5 space-y-3">
                            {recentApiActivity.map(activity => (
                                <article key={activity.id} className="rounded-2xl border border-white/10 bg-[#07111f]/82 px-4 py-4">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <div className="text-sm font-semibold text-white">{activity.route}</div>
                                            <div className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">{activity.dataset}</div>
                                            <div className="mt-3 text-sm leading-6 text-slate-300">{activity.result}</div>
                                        </div>
                                        <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                                            <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${activityToneStyles[activity.tone]}`}>
                                                {activity.tone}
                                            </span>
                                            <span className="text-xs uppercase tracking-[0.14em] text-slate-500">{activity.timestamp}</span>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </article>

                    <article className="rounded-[28px] border border-white/10 bg-[#0a1424]/92 p-6 shadow-[0_20px_60px_-38px_rgba(2,6,23,0.95)]">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Policy events</h2>
                                <p className="mt-2 text-sm leading-6 text-slate-400">Recent governance controls, export rules, and residency checks affecting current usage.</p>
                            </div>
                            <span className="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300">
                                {policyEvents.length} updates
                            </span>
                        </div>

                        <div className="mt-5 space-y-4">
                            {policyEvents.map(event => (
                                <div key={event.id} className="flex gap-3">
                                    <span className={`mt-2 h-2.5 w-2.5 rounded-full ${policyToneStyles[event.tone]}`} />
                                    <div className="rounded-2xl border border-white/10 bg-[#07111f]/82 px-4 py-4">
                                        <div className="text-sm font-semibold text-white">{event.title}</div>
                                        <p className="mt-2 text-sm leading-6 text-slate-300">{event.detail}</p>
                                        <div className="mt-3 text-xs uppercase tracking-[0.14em] text-slate-500">{event.timestamp}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </article>
                </section>

                <section className="mt-8">
                    <article className="relative overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-r from-slate-900 via-slate-950 to-[#0b1020] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                        <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.12),transparent_35%),radial-gradient(circle_at_80%_70%,rgba(16,185,129,0.12),transparent_32%)]" />
                        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Chargeback Summary</p>
                                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">Billing ready for export</h3>
                                <p className="mt-2 text-sm leading-6 text-slate-400">
                                    Current participant usage is mapped to provider share-out and settlement fees for the active billing window.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => showToast('Chargeback report queued from Usage Analytics.', 'success')}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.35)] transition hover:bg-blue-500"
                            >
                                Export Chargeback Report
                            </button>
                        </div>
                        <div className="relative mt-6 grid gap-4 sm:grid-cols-3">
                            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                                <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Total billable usage</p>
                                <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">{chargebackSummary.totalBillableUsage}</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                                <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Launch settlement fee (15%)</p>
                                <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">{chargebackSummary.settlementFee}</p>
                            </div>
                            <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-4">
                                <p className="text-[11px] uppercase tracking-[0.14em] text-emerald-200">Provider payouts</p>
                                <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-emerald-100">{chargebackSummary.providerPayouts}</p>
                            </div>
                        </div>
                    </article>
                </section>
            </div>
        </div>
    )
}
