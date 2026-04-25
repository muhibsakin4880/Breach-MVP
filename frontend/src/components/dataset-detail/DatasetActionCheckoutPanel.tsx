import { Link } from 'react-router-dom'
import type { DatasetDetail } from '../../data/datasetDetailData'
import DatasetDetailPanel, { DatasetDetailMetric } from './DatasetDetailPanel'

type DatasetRailRequestStatusMeta = {
    label: string
    detail: string
    classes: string
}

type DatasetActionCheckoutPanelProps = {
    dataset: DatasetDetail
    requestStatus: DatasetRailRequestStatusMeta
    requestEntryLabel: string
    onOpenRequestModal: () => void
    minimumTrustNeedsReview: boolean
    rightsQuotePath: string
    escrowCheckoutPath: string
    escrowCheckoutState?: { quoteId: string }
    latestCheckoutLabel: string
    evaluationFeeLabel: string
    escrowHoldLabel: string
    reviewWindowHours: number
    protectedSummary: string
    qualityBreakdownPath: string
    checkoutInProgress: boolean
    activeDecisionMode: 'free' | 'protected'
    onDecisionModeChange: (mode: 'free' | 'protected') => void
    compact?: boolean
}

const decisionModes: ReadonlyArray<{
    key: 'free' | 'protected'
    label: string
}> = [
    { key: 'free', label: 'Free Preview' },
    { key: 'protected', label: 'Protected' }
]

export default function DatasetActionCheckoutPanel({
    dataset,
    requestStatus,
    requestEntryLabel,
    onOpenRequestModal,
    minimumTrustNeedsReview,
    rightsQuotePath,
    escrowCheckoutPath,
    escrowCheckoutState,
    latestCheckoutLabel,
    evaluationFeeLabel,
    escrowHoldLabel,
    reviewWindowHours,
    protectedSummary,
    qualityBreakdownPath,
    checkoutInProgress,
    activeDecisionMode,
    onDecisionModeChange,
    compact = true
}: DatasetActionCheckoutPanelProps) {
    const freeMetricDetails = [
        { label: 'Confidence score', value: `${dataset.confidenceScore}%` },
        { label: 'Freshness', value: dataset.preview.freshnessLabel },
        { label: 'Schema fields', value: `${dataset.preview.sampleSchema.length} fields` },
        { label: 'Access', value: 'Metadata only' }
    ]
    const protectedMetricDetails = [
        { label: 'Escrow hold', value: escrowHoldLabel },
        { label: 'Review window', value: `${reviewWindowHours} hours` },
        { label: 'Access mode', value: 'Governed workspace' },
        { label: 'Protection', value: 'Auto credits enabled' }
    ]
    const isProtected = activeDecisionMode === 'protected'

    return (
        <DatasetDetailPanel
            eyebrow="Action / Checkout"
            title="Protected evaluation next step"
            badge={
                <div className="rounded-sm border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-100">
                    {latestCheckoutLabel}
                </div>
            }
            compact={compact}
        >
            <div className={compact ? 'space-y-3' : 'space-y-4'}>
                <div className={`rounded-sm border border-slate-800 bg-slate-950/55 ${compact ? 'p-3' : 'p-4'}`}>
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Current status</div>
                            <p className="mt-2 text-xs leading-5 text-slate-300">{requestStatus.detail}</p>
                        </div>
                        <span className={`shrink-0 rounded-sm border px-2.5 py-1 text-[10px] font-semibold ${requestStatus.classes}`}>
                            {requestStatus.label}
                        </span>
                    </div>
                </div>

                <div className={`grid gap-2 ${compact ? 'sm:grid-cols-3' : 'md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.95fr)]'}`}>
                    <Link
                        to={escrowCheckoutPath}
                        state={escrowCheckoutState}
                        className="rounded-sm border border-emerald-400/40 bg-emerald-500/12 px-3 py-2 text-center text-xs font-semibold text-emerald-100 hover:bg-emerald-500/20"
                    >
                        {checkoutInProgress
                            ? 'Continue Protected Evaluation Checkout'
                            : 'Start Protected Evaluation Checkout'}
                    </Link>
                    <Link
                        to={rightsQuotePath}
                        className="rounded-sm border border-cyan-400/40 bg-cyan-500/10 px-3 py-2 text-center text-xs font-semibold text-cyan-100 hover:bg-cyan-500/20"
                    >
                        Open Advanced Terms
                    </Link>
                    <button
                        type="button"
                        onClick={onOpenRequestModal}
                        className={`rounded-sm px-3 py-2 text-xs font-semibold transition-colors ${
                            minimumTrustNeedsReview
                                ? 'border border-amber-400/40 bg-amber-500/15 text-amber-100 hover:bg-amber-500/20'
                                : 'border border-white/12 bg-white/5 text-white hover:border-cyan-400/35 hover:bg-white/10'
                        }`}
                    >
                        {requestEntryLabel}
                    </button>
                </div>

                <div className={`rounded-sm border border-slate-800 bg-slate-950/55 ${compact ? 'p-3' : 'p-4'}`}>
                    <div className="inline-flex w-full rounded-sm border border-slate-800 bg-slate-950/80 p-1">
                        {decisionModes.map(mode => {
                            const isActive = mode.key === activeDecisionMode

                            return (
                                <button
                                    key={mode.key}
                                    type="button"
                                    onClick={() => onDecisionModeChange(mode.key)}
                                    className={`flex-1 rounded-sm px-3 py-2 text-xs font-semibold transition-colors ${
                                        isActive
                                            ? 'bg-cyan-500/12 text-cyan-100'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    {mode.label}
                                    {mode.key === 'protected' ? ` (${evaluationFeeLabel})` : ''}
                                </button>
                            )
                        })}
                    </div>

                    <div className={`mt-3 rounded-sm border border-slate-800 bg-slate-950/60 ${compact ? 'p-3' : 'p-4'}`}>
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <div className={`inline-flex rounded-sm border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                                    isProtected
                                        ? 'border-emerald-400/35 bg-emerald-500/10 text-emerald-100'
                                        : 'border-cyan-400/35 bg-cyan-500/10 text-cyan-100'
                                }`}>
                                    {isProtected ? 'Protected' : 'Free'}
                                </div>
                                <div className="mt-3 text-base font-semibold text-white">
                                    {isProtected ? 'Protected Evaluation' : 'Metadata Preview'}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-semibold text-white">{isProtected ? evaluationFeeLabel : '$0'}</div>
                                <div className="mt-1 text-[11px] text-slate-500">
                                    {isProtected ? 'Evaluation fee' : 'Always available'}
                                </div>
                            </div>
                        </div>

                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            {(isProtected ? protectedMetricDetails : freeMetricDetails).slice(0, 2).map(metric => (
                                <DatasetDetailMetric
                                    key={metric.label}
                                    label={metric.label}
                                    value={metric.value}
                                    className="px-2.5 py-2"
                                />
                            ))}
                        </div>

                        {isProtected ? (
                            <div className="mt-3 text-xs leading-5 text-emerald-100/90">{protectedSummary}</div>
                        ) : (
                            <Link
                                to={qualityBreakdownPath}
                                className="mt-3 inline-flex items-center rounded-sm bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
                            >
                                Open Advanced Quality Workspace
                            </Link>
                        )}

                        <details className={`mt-3 rounded-sm border border-slate-800 bg-slate-950/50 ${compact ? 'p-3' : 'p-4'}`}>
                            <summary className="cursor-pointer list-none text-xs font-semibold text-slate-200">
                                More details
                            </summary>

                            {isProtected ? (
                                <div className="mt-3 space-y-3">
                                    <p className="text-sm text-slate-200/85">
                                        Checkout is the main buyer workflow. It carries terms inline, funds escrow, provisions the governed workspace,
                                        issues a short-lived Ephemeral Token, and keeps buyer validation plus release readiness in one place.
                                    </p>
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        {protectedMetricDetails.map(metric => (
                                            <DatasetDetailMetric key={metric.label} label={metric.label} value={metric.value} />
                                        ))}
                                    </div>
                                    <div className="rounded-sm border border-slate-800 bg-slate-950/60 px-3 py-2.5 text-sm text-slate-300">
                                        {protectedSummary}
                                    </div>
                                    <div className="rounded-sm border border-amber-400/25 bg-amber-500/10 px-3 py-2.5">
                                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-100">Pilot Cohort</div>
                                        <p className="mt-2 text-sm text-slate-200/90">
                                            Fee-waived evaluation is reserved for selected design partners in Redoubt&apos;s early-access evaluation program. Admission is LOI-backed and tied to feedback, design-partner participation, and a credible production pathway.
                                        </p>
                                    </div>
                                    <div className="rounded-sm border border-emerald-400/20 bg-emerald-500/8 px-3 py-2.5 text-sm text-emerald-100/90">
                                        The main buyer CTA is <span className="font-semibold text-white">Protected Evaluation Checkout</span>. Advanced Terms stays available as a secondary surface when you need to refine rights before funding.
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-3 space-y-3">
                                    <p className="text-sm text-slate-200/85">
                                        Inspect schema controls, quality signals, and governance labels before touching paid workflows.
                                    </p>
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        {freeMetricDetails.map(metric => (
                                            <DatasetDetailMetric key={metric.label} label={metric.label} value={metric.value} />
                                        ))}
                                    </div>
                                    <div className="rounded-sm border border-slate-800 bg-slate-950/60 px-3 py-2.5 text-sm text-slate-300">
                                        {dataset.preview.aiSummary}
                                    </div>
                                </div>
                            )}
                        </details>
                    </div>
                </div>
            </div>
        </DatasetDetailPanel>
    )
}
