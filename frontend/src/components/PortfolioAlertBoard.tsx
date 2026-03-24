import { useMemo } from 'react'
import { buildPortfolioAlertSummary } from '../domain/alertCenter'
import type { ResilienceDigest } from '../domain/resilienceInsights'

type PortfolioAlertBoardProps = {
    digests: ResilienceDigest[]
    title?: string
    compact?: boolean
    className?: string
}

export default function PortfolioAlertBoard({
    digests,
    title = 'Portfolio Alert Board',
    compact = false,
    className = ''
}: PortfolioAlertBoardProps) {
    const summary = useMemo(() => buildPortfolioAlertSummary(digests), [digests])
    const visibleTopAlerts = compact ? summary.topAlerts.slice(0, 3) : summary.topAlerts

    return (
        <section className={`rounded-xl border border-slate-700 bg-slate-900/70 p-4 ${className}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{title}</p>
                    <p className="mt-1 text-sm font-semibold text-white">
                        {summary.contractsMonitored} contracts · {summary.totalAlerts} active alerts
                    </p>
                </div>
                <span className="rounded-full border border-slate-600/80 bg-slate-900/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-300">
                    Critical {summary.criticalCount}
                </span>
            </div>

            <div className={`mt-3 grid gap-3 ${compact ? 'grid-cols-3' : 'grid-cols-3 md:grid-cols-6'}`}>
                <Metric label="Critical" value={`${summary.criticalCount}`} />
                <Metric label="Warning" value={`${summary.warningCount}`} />
                <Metric label="Info" value={`${summary.infoCount}`} />
                <Metric label="Total" value={`${summary.totalAlerts}`} />
                <Metric label="Contracts" value={`${summary.contractsMonitored}`} />
                <Metric label="Top Feed" value={`${visibleTopAlerts.length}`} />
            </div>

            <div className="mt-3 rounded-lg border border-white/5 bg-white/5 p-3">
                <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Top Alerts</p>
                <div className="mt-2 space-y-2">
                    {visibleTopAlerts.length === 0 ? (
                        <p className="text-xs text-slate-400">No alerts in current scope.</p>
                    ) : (
                        visibleTopAlerts.map(alert => (
                            <div key={alert.id} className="rounded-md border border-slate-700 bg-slate-950/60 p-2">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-xs font-semibold text-slate-100">{alert.contractId}</p>
                                    <span className="text-[10px] uppercase tracking-[0.1em] text-slate-400">
                                        {alert.severity}
                                    </span>
                                </div>
                                <p className="mt-1 text-[11px] text-slate-300">{alert.title}</p>
                                <p className="mt-1 text-[11px] text-slate-500">{alert.source}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    )
}

type MetricProps = {
    label: string
    value: string
}

function Metric({ label, value }: MetricProps) {
    return (
        <div className="rounded-lg border border-white/5 bg-white/5 p-2">
            <p className="text-[10px] uppercase tracking-[0.1em] text-slate-500">{label}</p>
            <p className="mt-1 text-xs text-slate-200">{value}</p>
        </div>
    )
}

