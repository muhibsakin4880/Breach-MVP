import { Link } from 'react-router-dom'
import type { RequestStatus } from '../../data/datasetDetailData'
import type { DealProgressModel } from '../../domain/dealProgress'
import type { RightsQuote } from '../../domain/rightsQuoteBuilder'
import DealProgressTracker from '../DealProgressTracker'
import DatasetDetailPanel from './DatasetDetailPanel'

type GuardrailState = {
    allowed: boolean
    reason: string
}

type DatasetRequestStatusPanelProps = {
    datasetId: string
    requestStatus: RequestStatus
    statusSteps: ReadonlyArray<{
        id: RequestStatus
        title: string
        description: string
    }>
    requestSectionDescription: string
    minimumTrustNeedsReview: boolean
    minimumTrustLabel: string
    requestEntryLabel: string
    onOpenRequestModal: () => void
    onOpenRiskAssessment: () => void
    onApplyPassportAndRequest: () => void
    onApplyQuoteAndRequest: () => void
    compliancePassportId: string
    compliancePassportCompletionPercent: number
    passportStatus: {
        label: string
        detail: string
        classes: string
    }
    latestSavedQuote: RightsQuote | null
    dealProgress: DealProgressModel
    escrowWindow: string
    onEscrowWindowChange: (value: string) => void
    escrowActive: boolean
    onActivateEscrow: () => void
    startEscrowGuardrail: GuardrailState
    releasePaymentGuardrail: GuardrailState
    disputeRefundGuardrail: GuardrailState
}

const quoteExpiryFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
})

const getRequestStatusClasses = (requestStatus: RequestStatus) => {
    if (requestStatus === 'REQUEST_APPROVED') {
        return 'bg-green-500/15 border-green-400 text-green-200'
    }
    if (requestStatus === 'REVIEW_IN_PROGRESS') {
        return 'bg-yellow-500/15 border-yellow-400 text-yellow-200'
    }
    return 'bg-red-500/15 border-red-400 text-red-200'
}

const getRequestStatusDetail = (requestStatus: RequestStatus) => {
    if (requestStatus === 'REQUEST_APPROVED') {
        return 'Access configured. Review scope, quote posture, and settlement controls before widening usage.'
    }
    if (requestStatus === 'REVIEW_IN_PROGRESS') {
        return 'We received your request. A reviewer will follow up with controls, scope, and delivery steps.'
    }
    return 'Request declined. We can suggest alternate sources or share summary stats.'
}

export default function DatasetRequestStatusPanel({
    datasetId,
    requestStatus,
    statusSteps,
    requestSectionDescription,
    minimumTrustNeedsReview,
    minimumTrustLabel,
    requestEntryLabel,
    onOpenRequestModal,
    onOpenRiskAssessment,
    onApplyPassportAndRequest,
    onApplyQuoteAndRequest,
    compliancePassportId,
    compliancePassportCompletionPercent,
    passportStatus,
    latestSavedQuote,
    dealProgress,
    escrowWindow,
    onEscrowWindowChange,
    escrowActive,
    onActivateEscrow,
    startEscrowGuardrail,
    releasePaymentGuardrail,
    disputeRefundGuardrail
}: DatasetRequestStatusPanelProps) {
    return (
        <DatasetDetailPanel
            eyebrow="Request control"
            title="Request, progress, and settlement"
            description="Move from review request into rights packaging, governed checkout, and escrow-backed validation without leaving the dataset surface."
        >
            <div className="space-y-5">
                <div className="rounded-xl border border-slate-700 bg-slate-950/55 p-4">
                    <div className="flex items-center justify-between gap-3">
                        <div className="text-sm text-slate-400">Current status</div>
                        <span className={`rounded-full border px-3 py-1 text-xs ${getRequestStatusClasses(requestStatus)}`}>
                            {requestStatus === 'REQUEST_APPROVED'
                                ? 'Approved'
                                : requestStatus === 'REVIEW_IN_PROGRESS'
                                  ? 'Pending review'
                                  : 'Rejected'}
                        </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{getRequestStatusDetail(requestStatus)}</p>
                </div>

                <div className="rounded-xl border border-slate-700 bg-slate-950/45 p-5">
                    <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Request entry</div>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{requestSectionDescription}</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                        <button
                            onClick={onOpenRequestModal}
                            className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                                minimumTrustNeedsReview
                                    ? 'border border-amber-400/40 bg-amber-500/15 text-amber-100 hover:bg-amber-500/20'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        >
                            {requestEntryLabel}
                        </button>
                        <Link
                            to={`/datasets/${datasetId}/rights-quote`}
                            className="rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-100 hover:bg-cyan-500/20"
                        >
                            Build Rights Quote
                        </Link>
                        <Link
                            to={`/datasets/${datasetId}/escrow-checkout`}
                            state={latestSavedQuote ? { quoteId: latestSavedQuote.id } : undefined}
                            className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-100 hover:bg-emerald-500/20"
                        >
                            Escrow-Native Checkout
                        </Link>
                    </div>

                    <div
                        className={`mt-4 rounded-xl border px-4 py-3 text-xs ${
                            minimumTrustNeedsReview
                                ? 'border-amber-400/25 bg-amber-500/8 text-amber-100'
                                : 'border-cyan-400/20 bg-cyan-500/8 text-cyan-100'
                        }`}
                    >
                        {minimumTrustNeedsReview
                            ? `${minimumTrustLabel} before live access can be approved. The request stays open, but it routes to review-first handling.`
                            : 'Minimum trust fields are documented in the current demo packet, but access still follows provider review and configured controls.'}
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                    {statusSteps.map(step => {
                        const isActive = step.id === requestStatus

                        return (
                            <div
                                key={step.id}
                                className={`rounded-xl border p-4 ${
                                    isActive
                                        ? 'border-blue-400 bg-blue-500/10 shadow-lg'
                                        : 'border-slate-700 bg-slate-900/60'
                                }`}
                            >
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-sm font-semibold text-white">{step.title}</span>
                                    <span className={`h-2.5 w-2.5 rounded-full ${isActive ? 'bg-blue-400' : 'bg-slate-600'}`} />
                                </div>
                                <p className="text-sm leading-6 text-slate-400">{step.description}</p>
                            </div>
                        )
                    })}
                </div>

                <DealProgressTracker model={dealProgress} compact />

                <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4">
                    <div className="text-sm font-semibold text-white">Risk Assessment Workspace</div>
                    <p className="mt-1 text-xs text-slate-300">
                        Detailed risk controls and review components now open in a dedicated page.
                    </p>
                    <button
                        onClick={onOpenRiskAssessment}
                        className="mt-3 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/20"
                    >
                        Risk Assessment
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/8 p-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <div className="text-sm font-semibold text-white">Reusable Compliance Passport</div>
                                <div className="mt-1 text-xs text-slate-300">
                                    {compliancePassportId} · {compliancePassportCompletionPercent}% complete
                                </div>
                            </div>
                            <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${passportStatus.classes}`}>
                                {passportStatus.label}
                            </span>
                        </div>
                        <p className="mt-3 text-xs text-slate-300">{passportStatus.detail}</p>
                        <p className="mt-3 text-[11px] leading-5 text-slate-400">
                            Passport reuse organizes declared review context. It does not grant access or legal approval.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <button
                                onClick={onApplyPassportAndRequest}
                                className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
                            >
                                Use In Request
                            </button>
                            <Link
                                to="/compliance-passport"
                                className="rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white hover:border-emerald-400/50 hover:bg-white/5"
                            >
                                Open Passport
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-xl border border-cyan-500/30 bg-slate-950/55 p-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <div className="text-sm font-semibold text-white">Latest Rights Quote</div>
                                <div className="mt-1 text-xs text-slate-400">Commercial terms built from configurable usage rights.</div>
                            </div>
                            {latestSavedQuote ? (
                                <span className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-semibold text-cyan-100">
                                    {latestSavedQuote.totalUsd.toLocaleString('en-US', {
                                        style: 'currency',
                                        currency: 'USD',
                                        maximumFractionDigits: 0
                                    })}
                                </span>
                            ) : null}
                        </div>

                        {latestSavedQuote ? (
                            <>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {latestSavedQuote.rightsSummary.slice(0, 3).map(item => (
                                        <span key={item} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-slate-200">
                                            {item}
                                        </span>
                                    ))}
                                </div>
                                <div className="mt-3 text-xs text-slate-400">
                                    Quote {latestSavedQuote.id} · Valid until {quoteExpiryFormatter.format(new Date(latestSavedQuote.expiresAt))}
                                </div>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <button
                                        onClick={onApplyQuoteAndRequest}
                                        className="rounded-lg bg-cyan-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400"
                                    >
                                        Use Quote In Request
                                    </button>
                                    <Link
                                        to={`/datasets/${datasetId}/rights-quote`}
                                        className="rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white hover:border-cyan-400/50 hover:bg-white/5"
                                    >
                                        Refine Terms
                                    </Link>
                                </div>
                                <div className="mt-4 text-[11px] leading-5 text-slate-500">
                                    Quote terms describe licensed use in this demo. They do not prove ownership, lawful basis, or chain-of-title.
                                </div>
                                <div className="text-[11px] leading-5 text-slate-500">
                                    When you are ready to proceed, use the main <span className="font-semibold text-slate-300">Escrow-Native Checkout</span> action above so this quote is applied through the single checkout path.
                                </div>
                            </>
                        ) : (
                            <div className="mt-3">
                                <p className="text-xs text-slate-400">
                                    No terms saved yet. Build evaluation terms to turn delivery, usage, term, and exclusivity into a reusable package.
                                </p>
                                <Link
                                    to={`/datasets/${datasetId}/rights-quote`}
                                    className="mt-4 inline-flex rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-100 hover:bg-cyan-500/20"
                                >
                                    Build Evaluation Terms
                                </Link>
                                <p className="mt-3 text-[11px] leading-5 text-slate-500">
                                    After terms are ready, continue from the main <span className="font-semibold text-slate-300">Escrow-Native Checkout</span> action above.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-5">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold text-white">Secure Access Options</h3>
                        <span className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Access Options</span>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4">
                        <div className="rounded-2xl border border-emerald-500/30 bg-slate-950/60 p-5">
                            <div className="mb-4 flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3">
                                    <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.12)]">
                                        <svg className="h-4 w-4 text-emerald-200/90" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v2H5a2 2 0 00-2 2v5a3 3 0 003 3h8a3 3 0 003-3v-5a2 2 0 00-2-2h-1V6a4 4 0 00-4-4zm2 6V6a2 2 0 10-4 0v2h4z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                    <div>
                                        <p className="text-base font-semibold text-white">Escrow Access</p>
                                        <p className="mt-1 text-xs text-slate-400">
                                            Payment held until you verify data quality
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <span className="mb-3 inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
                                <svg className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path d="M10 1.5l2.47 5 5.53.8-4 3.9.95 5.5L10 14.9 5.05 16.7l.95-5.5-4-3.9 5.53-.8L10 1.5z" />
                                </svg>
                                Recommended
                            </span>
                            <div className="space-y-3">
                                <div>
                                    <label className="mb-1.5 block text-xs uppercase tracking-[0.12em] text-slate-500">
                                        Escrow window
                                    </label>
                                    <select
                                        value={escrowWindow}
                                        onChange={(event) => onEscrowWindowChange(event.target.value)}
                                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
                                    >
                                        <option value="24 hours">24 hours</option>
                                        <option value="48 hours">48 hours (higher escrow hold)</option>
                                        <option value="72 hours">72 hours (largest escrow hold)</option>
                                    </select>
                                </div>
                                <p className="text-xs text-slate-400">Full refund if unsatisfied</p>
                                <button
                                    disabled={!startEscrowGuardrail.allowed}
                                    className={`w-full rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors transition-transform duration-100 active:scale-95 ${
                                        startEscrowGuardrail.allowed
                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                            : 'cursor-not-allowed border border-slate-700 bg-slate-900/80 text-slate-500'
                                    }`}
                                    onClick={onActivateEscrow}
                                >
                                    Put on Escrow
                                </button>
                                <p className={`text-[11px] ${startEscrowGuardrail.allowed ? 'text-slate-500' : 'text-amber-300'}`}>
                                    {startEscrowGuardrail.allowed
                                        ? 'Escrow can be activated for this approved request.'
                                        : startEscrowGuardrail.reason}
                                </p>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-600/50 bg-slate-950/40 p-5">
                            <div className="mb-3 flex items-start gap-3">
                                <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-600 bg-slate-800/60">
                                    <svg className="h-4 w-4 text-slate-200/90" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v2H5a2 2 0 00-2 2v5a3 3 0 003 3h8a3 3 0 003-3v-5a2 2 0 00-2-2h-1V6a4 4 0 00-4-4zm2 6V6a2 2 0 10-4 0v2h4z" clipRule="evenodd" />
                                    </svg>
                                </span>
                                <div>
                                    <p className="text-base font-semibold text-white">Direct Secure Access</p>
                                    <p className="mt-1 text-xs text-slate-400">Immediate access, no refund</p>
                                </div>
                            </div>
                            <p className="mb-3 text-xs text-amber-200/70">
                                Higher risk - known providers only
                            </p>
                            <button className="w-full rounded-lg border border-slate-600 px-3 py-2.5 text-sm text-slate-200 transition-colors hover:border-slate-400 hover:text-white">
                                Direct Secure Access
                            </button>
                        </div>
                    </div>

                    <p className="mt-4 text-[11px] leading-relaxed text-slate-500">
                        Redoubt holds payment in escrow and releases to provider only after evaluation org confirmation or window expiry.
                    </p>

                    {escrowActive ? (
                        <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                            <div className="mb-3 flex items-center justify-between text-sm text-amber-200">
                                <span className="font-semibold">Escrow Active - 23:47:12 remaining</span>
                                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                            </div>
                            <div className="grid gap-2">
                                <button
                                    disabled={!releasePaymentGuardrail.allowed}
                                    className={`w-full rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                                        releasePaymentGuardrail.allowed
                                            ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                                            : 'cursor-not-allowed border border-slate-700 bg-slate-900/80 text-slate-500'
                                    }`}
                                >
                                    Confirm & Release Payment
                                </button>
                                <p className={`text-[11px] ${releasePaymentGuardrail.allowed ? 'text-slate-500' : 'text-amber-300'}`}>
                                    {releasePaymentGuardrail.allowed
                                        ? 'Payment release is currently permitted by lifecycle policy.'
                                        : releasePaymentGuardrail.reason}
                                </p>
                                <button
                                    disabled={!disputeRefundGuardrail.allowed}
                                    className={`w-full rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                                        disputeRefundGuardrail.allowed
                                            ? 'border border-rose-500/60 text-rose-200 hover:bg-rose-500/10'
                                            : 'cursor-not-allowed border border-slate-700 bg-slate-900/80 text-slate-500'
                                    }`}
                                >
                                    Dispute & Refund
                                </button>
                                <p className={`text-[11px] ${disputeRefundGuardrail.allowed ? 'text-slate-500' : 'text-amber-300'}`}>
                                    {disputeRefundGuardrail.allowed
                                        ? 'Dispute remains available until escrow is settled.'
                                        : disputeRefundGuardrail.reason}
                                </p>
                            </div>
                        </div>
                    ) : null}
                </div>

                <div className="text-xs text-slate-500">
                    Provider identity remains shielded; communication is routed through the platform.
                </div>
            </div>
        </DatasetDetailPanel>
    )
}
