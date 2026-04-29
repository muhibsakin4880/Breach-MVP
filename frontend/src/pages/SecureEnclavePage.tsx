import { Link, useLocation } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import DemoEscrowControls from '../components/demo/DemoEscrowControls'
import { getDealRouteRecordByDatasetId } from '../data/dealDossierData'
import { getDealRouteContextById } from '../domain/dealDossier'
import {
    filterOutCanonicalDemoEscrowRecords,
    getBuyerRouteTargets,
    getCanonicalDemoEscrowScenario,
    getDemoEscrowNextAction,
    isBuyerDemoActive,
    saveCanonicalDemoEscrowState
} from '../domain/demoEscrowScenario'
import { checkoutAccessModeMeta } from '../domain/evaluationEscrow'
import { loadEscrowCheckouts } from '../domain/purchaseEscrow'
import { buildOutputReviewModel } from '../domain/outputReview'

type SessionStat = {
    label: string
    value: string
    highlight?: boolean
}

const fallbackSessionStats = [
    { label: 'Session ID', value: 'enc_session_a3f8' },
    { label: 'Dataset', value: 'Clinical Outcomes Delta' },
    { label: 'Participant', value: 'part_anon_042' },
    { label: 'Time Remaining', value: '02:47:33', highlight: true }
] as const satisfies readonly SessionStat[]

const egressRules = [
    { label: 'Copy to clipboard', status: 'BLOCKED', allowed: false },
    { label: 'Download raw data', status: 'BLOCKED', allowed: false },
    { label: 'Screenshot', status: 'BLOCKED', allowed: false },
    { label: 'External API calls', status: 'BLOCKED', allowed: false },
    { label: 'Aggregated export', status: 'ALLOWED', allowed: true },
    { label: 'Summary statistics', status: 'ALLOWED', allowed: true }
] as const

export default function SecureEnclavePage() {
    const location = useLocation()
    const isDemo = location.pathname.startsWith('/demo/')
    const [demoControlsVersion, setDemoControlsVersion] = useState(0)
    const buyerDemoActive = !isDemo && isBuyerDemoActive()
    const useCanonicalBuyerDemo = isDemo || buyerDemoActive

    useEffect(() => {
        if (!useCanonicalBuyerDemo) return
        saveCanonicalDemoEscrowState()
    }, [useCanonicalBuyerDemo])

    const demoScenario = useMemo(
        () => (useCanonicalBuyerDemo ? getCanonicalDemoEscrowScenario() : null),
        [demoControlsVersion, useCanonicalBuyerDemo]
    )

    if (useCanonicalBuyerDemo && demoScenario) {
        return (
            <DemoSecureEnclavePage
                demoRoute={isDemo}
                onScenarioChange={() => setDemoControlsVersion(current => current + 1)}
            />
        )
    }

    const latestCheckout = useMemo(() => filterOutCanonicalDemoEscrowRecords(loadEscrowCheckouts())[0] ?? null, [])
    const dealRoute = useMemo(
        () => (latestCheckout ? getDealRouteRecordByDatasetId(latestCheckout.datasetId) : null),
        [latestCheckout]
    )
    const linkedContext = useMemo(
        () => (dealRoute ? getDealRouteContextById(dealRoute.dealId) : null),
        [dealRoute]
    )
    const linkedOutputReview = useMemo(
        () => (linkedContext ? buildOutputReviewModel(linkedContext) : null),
        [linkedContext]
    )

    const sessionStats: SessionStat[] = linkedOutputReview
        ? [
            { label: 'Session ID', value: linkedOutputReview.session.sessionId },
            { label: 'Dataset', value: latestCheckout?.datasetTitle ?? linkedContext?.dataset?.title ?? 'Governed dataset' },
            { label: 'Participant', value: linkedOutputReview.session.participant },
            { label: 'Time Remaining', value: linkedOutputReview.session.expiresAt, highlight: true }
        ]
        : [...fallbackSessionStats]

    const activityLog = linkedOutputReview
        ? linkedOutputReview.events
            .slice(0, 5)
            .map(event => ({
                time: event.at,
                action: event.label,
                detail: event.summary,
                status: event.tone === 'rose' ? 'blocked' : 'ok'
            }))
        : [
            { time: '09:14:02', action: 'Session initiated', detail: 'Enclave provisioned', status: 'ok' },
            { time: '09:15:44', action: 'Dataset loaded', detail: '12 fields, PHI masked', status: 'ok' },
            { time: '09:18:23', action: 'Query executed', detail: 'Aggregation only', status: 'ok' },
            { time: '09:22:11', action: 'Download attempted', detail: 'Blocked by egress policy', status: 'blocked' },
            { time: '09:23:47', action: 'Summary export', detail: 'Allowed - watermarked', status: 'ok' }
        ]

    return (
        <div className="relative min-h-screen bg-[#040812] text-white">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(251,191,36,0.18),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.12),transparent_35%),radial-gradient(circle_at_40%_80%,rgba(16,185,129,0.08),transparent_40%)]" />
            <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-10">
                {!isDemo ? (
                    <div className="mb-6">
                        <DemoEscrowControls
                            mode="normal-route"
                            onScenarioChange={() => setDemoControlsVersion(current => current + 1)}
                        />
                    </div>
                ) : null}
                <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Security & Compliance
                        </div>
                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                            Secure Enclave & Clean Room
                        </h1>
                        <p className="mt-2 max-w-2xl text-slate-400">
                            Isolated compute sessions with egress controls, watermarking, and temporary credentials.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-100 shadow-[0_0_24px_rgba(245,158,11,0.25)]">
                        Shared-control reference · AWS baseline
                    </div>
                </header>

                <section className="mt-8">
                    <div className="rounded-2xl border border-amber-400/40 bg-amber-400/10 px-6 py-4 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <div className="text-sm font-semibold text-white">
                                    {linkedOutputReview ? 'Clean room session linked to governed output review' : 'Clean room session active - isolated compute environment'}
                                </div>
                                <div className="text-xs text-amber-100/80">
                                    {linkedOutputReview
                                        ? `${linkedOutputReview.currentStateLabel} · ${linkedOutputReview.request.queueStatus}`
                                        : 'Session expires in: 02:47:33'}
                                </div>
                            </div>
                            <span className="rounded-full border border-amber-400/50 bg-amber-500/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-100">
                                All egress rules enforced
                            </span>
                        </div>
                    </div>
                </section>

                <section className="mt-8">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {sessionStats.map(stat => (
                            <article
                                key={stat.label}
                                className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
                            >
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.18),transparent_45%)] opacity-50" />
                                <div className="relative">
                                    <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{stat.label}</p>
                                    <p className={`mt-3 text-xl font-semibold ${stat.highlight ? 'text-amber-200' : 'text-white'}`}>{stat.value}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="mt-10 grid gap-6 lg:grid-cols-[2fr_1fr]">
                    <article className="rounded-3xl border border-cyan-500/30 bg-black/70 p-6 shadow-[0_0_20px_#00F0FF20] backdrop-blur-xl">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-semibold text-white">Egress Rules</h2>
                                <p className="text-sm text-slate-400">Outbound controls for the clean room</p>
                            </div>
                            <span className="text-xs text-slate-500">6 rules active</span>
                        </div>
                        <div className="mt-5 space-y-3">
                            {egressRules.map(rule => (
                                <div key={rule.label} className="flex items-center justify-between gap-3 rounded-xl border border-slate-800/80 bg-slate-900/60 px-4 py-3">
                                    <div className="text-sm text-slate-200">{rule.label}</div>
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                                                rule.allowed
                                                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                                                    : 'border-rose-500/40 bg-rose-500/10 text-rose-200'
                                            }`}
                                        >
                                            {rule.status}
                                        </span>
                                        <div className={`relative h-5 w-11 rounded-full ${rule.allowed ? 'bg-emerald-500/40' : 'bg-rose-500/40'}`}>
                                            <span
                                                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
                                                    rule.allowed ? 'left-6' : 'left-1'
                                                }`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </article>

                    <div className="space-y-6">
                        <article className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Watermarking Status</h3>
                                    <p className="text-sm text-emerald-100/80">
                                        {linkedOutputReview ? linkedOutputReview.watermark.traceStatus : 'All data views watermarked'}
                                    </p>
                                </div>
                                <span className="rounded-full border border-emerald-400/40 bg-emerald-500/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-100">
                                    Active
                                </span>
                            </div>
                            <div className="mt-4 space-y-2 text-sm text-emerald-100/90">
                                <div className="flex items-center justify-between">
                                    <span>Watermark ID</span>
                                    <span className="font-semibold text-white">{linkedOutputReview?.watermark.watermarkId ?? 'wm_042_enc_a3f8'}</span>
                                </div>
                                <p className="text-xs text-emerald-100/70">
                                    {linkedOutputReview?.watermark.reviewLinkage ?? 'Every record carries invisible participant fingerprint.'}
                                </p>
                            </div>
                        </article>

                        <article className="rounded-2xl border border-cyan-500/25 bg-cyan-500/10 p-6 shadow-[0_0_20px_rgba(34,211,238,0.16)]">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Linked output review</h3>
                                    <p className="text-sm text-cyan-100/80">
                                        {linkedOutputReview ? 'Latest governed output-review state derived from the active checkout.' : 'No governed output review is currently linked.'}
                                    </p>
                                </div>
                                {linkedOutputReview ? (
                                    <span className="rounded-full border border-cyan-400/40 bg-slate-950/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-100">
                                        {linkedOutputReview.currentStateLabel}
                                    </span>
                                ) : null}
                            </div>

                            {linkedOutputReview && dealRoute ? (
                                <div className="mt-4 space-y-3">
                                    <div className="rounded-xl border border-white/10 bg-slate-950/55 px-4 py-3">
                                        <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Reviewer owner</div>
                                        <div className="mt-2 text-sm font-semibold text-white">{linkedOutputReview.request.reviewerOwner}</div>
                                    </div>
                                    <div className="rounded-xl border border-white/10 bg-slate-950/55 px-4 py-3">
                                        <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Watermark trace</div>
                                        <div className="mt-2 text-sm font-semibold text-white">{linkedOutputReview.watermark.watermarkId}</div>
                                        <div className="mt-2 text-xs text-slate-300">{linkedOutputReview.watermark.auditPointer}</div>
                                    </div>
                                    <Link
                                        to={linkedContext?.routeTargets['output-review'] ?? `/deals/${dealRoute.dealId}/output-review`}
                                        className="inline-flex w-full items-center justify-center rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400"
                                    >
                                        Open active output review
                                    </Link>
                                </div>
                            ) : (
                                <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/55 px-4 py-3 text-sm leading-6 text-slate-300">
                                    Launch a governed workspace from protected evaluation setup, then return here to see the linked output-review lane.
                                </div>
                            )}
                        </article>

                        <article className="rounded-2xl border border-white/10 bg-[#0a1424] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.28)]">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Temporary Credentials</h3>
                                    <p className="text-sm text-slate-400">Short-lived access</p>
                                </div>
                                <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
                            </div>
                            <div className="mt-4 space-y-2 text-sm text-slate-200">
                                <div className="flex items-center justify-between">
                                    <span>Credential type</span>
                                    <span className="font-semibold text-white">Short-lived token</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Issued</span>
                                    <span className="font-semibold text-white">{linkedOutputReview?.session.issuedAt ?? '09:14:02'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Expires</span>
                                    <span className="font-semibold text-white">{linkedOutputReview?.session.expiresAt ?? '12:14:02'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Scope</span>
                                    <span className="font-semibold text-white">{linkedOutputReview?.session.workspaceName ?? 'Read-only, Clinical Outcomes Delta'}</span>
                                </div>
                            </div>
                            {latestCheckout ? (
                                <Link
                                    to={latestCheckout.workspace.launchPath}
                                    className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_0_20px_rgba(37,99,235,0.35)] transition hover:bg-blue-500"
                                >
                                    Launch governed workspace
                                </Link>
                            ) : (
                                <button className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_0_20px_rgba(37,99,235,0.35)] transition hover:bg-blue-500">
                                    Launch Jupyter Sandbox
                                </button>
                            )}
                            <button className="mt-3 w-full rounded-xl border border-rose-400/60 bg-transparent px-4 py-3 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/10">
                                Revoke Credentials
                            </button>
                        </article>
                    </div>
                </section>

                <section className="mt-10">
                    <article className="rounded-3xl border border-cyan-500/30 bg-black/70 p-6 shadow-[0_0_20px_#00F0FF20] backdrop-blur-xl">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h3 className="text-xl font-semibold text-white">Session Activity Log</h3>
                                <p className="text-sm text-slate-400">Realtime enclave telemetry</p>
                            </div>
                            <span className="text-xs text-slate-500">{activityLog.length} events</span>
                        </div>
                        <div className="mt-5 overflow-hidden rounded-xl border border-cyan-500/20">
                            <table className="w-full text-sm">
                                <thead className="bg-cyan-500/10 text-xs uppercase tracking-[0.12em] text-slate-400">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Time</th>
                                        <th className="px-4 py-3 text-left">Activity</th>
                                        <th className="px-4 py-3 text-left">Detail</th>
                                        <th className="px-4 py-3 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/70">
                                    {activityLog.map(entry => (
                                        <tr key={`${entry.time}-${entry.action}`} className="transition-colors hover:bg-white/5">
                                            <td className="px-4 py-3 text-left text-slate-300">{entry.time}</td>
                                            <td className="px-4 py-3 text-left text-white">{entry.action}</td>
                                            <td className="px-4 py-3 text-left text-slate-300">{entry.detail}</td>
                                            <td className="px-4 py-3 text-right">
                                                <span
                                                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold ${
                                                        entry.status === 'blocked'
                                                            ? 'border-rose-500/40 bg-rose-500/10 text-rose-200'
                                                            : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                                                    }`}
                                                >
                                                    {entry.status === 'blocked' ? 'Blocked' : 'Allowed'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </article>
                </section>

                <section className="mt-8">
                    <div className="flex flex-wrap items-center gap-3">
                        <button className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.35)] transition hover:bg-blue-500">
                            Extend Session
                        </button>
                        <button className="rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(225,29,72,0.35)] transition hover:bg-rose-500">
                            Terminate Session
                        </button>
                        <button className="rounded-xl border border-slate-600 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-400 hover:text-white">
                            Export Session Audit
                        </button>
                    </div>
                </section>
            </div>
        </div>
    )
}

function DemoSecureEnclavePage({
    demoRoute,
    onScenarioChange
}: {
    demoRoute: boolean
    onScenarioChange: () => void
}) {
    const scenario = getCanonicalDemoEscrowScenario()
    const record = scenario.checkoutRecord
    const stage = scenario.stage
    const buyerRouteTargets = getBuyerRouteTargets(demoRoute)
    const accessMode = record ? checkoutAccessModeMeta[record.configuration.accessMode] : checkoutAccessModeMeta.clean_room
    const workspaceStatus =
        stage === 'quote_ready' || stage === 'escrow_funded'
            ? 'Pending'
            : stage === 'released'
                ? 'Archived'
                : 'Ready'
    const evaluationStatus =
        stage === 'token_issued' || stage === 'release_pending'
            ? 'Evaluation access active'
            : stage === 'released'
                ? 'Access closed'
                : stage === 'workspace_ready'
                    ? 'Ready for token issue'
                    : 'Evaluation not started'
    const policyState =
        stage === 'released'
            ? 'Restricted after release'
            : stage === 'token_issued' || stage === 'release_pending'
                ? 'Policy enforced'
                : 'Checks pending'
    const tokenState =
        stage === 'token_issued' || stage === 'release_pending'
            ? record?.credentials.credentialId ?? 'Token active'
            : stage === 'released'
                ? 'Archived / revoked'
                : 'No active Ephemeral Token'
    const workspaceName = record?.workspace.workspaceName ?? scenario.workspaceName
    const lifecycleState =
        record?.lifecycleState === 'RELEASED_TO_PROVIDER'
            ? 'Released to provider'
            : record?.lifecycleState === 'RELEASE_PENDING'
                ? 'Release pending'
                : record?.lifecycleState === 'ACCESS_ACTIVE'
                    ? 'Access active'
                    : record?.lifecycleState === 'FUNDS_HELD'
                        ? 'Funds held'
                        : 'Pre-funding'

    return (
        <div className="relative min-h-screen bg-[#040812] text-white">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(251,191,36,0.18),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.12),transparent_35%),radial-gradient(circle_at_40%_80%,rgba(16,185,129,0.08),transparent_40%)]" />
            <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-10">
                {!demoRoute ? (
                    <div className="mb-6">
                        <DemoEscrowControls mode="normal-route" onScenarioChange={onScenarioChange} />
                    </div>
                ) : null}
                <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-100">
                            Buyer Demo · Secure Workspace
                        </div>
                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                            Secure Enclave & Clean Room
                        </h1>
                        <p className="mt-3 max-w-3xl text-slate-400">
                            The demo secure workspace reads the same canonical escrow case as checkout, escrow center, the Ephemeral Token page, and output review.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-amber-400/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                        {evaluationStatus}
                    </div>
                </header>

                <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <DemoStatCard label="Workspace" value={workspaceStatus} detail={workspaceName} tone={workspaceStatus === 'Pending' ? 'amber' : 'emerald'} />
                    <DemoStatCard label="Evaluation access" value={evaluationStatus} detail={tokenState} tone={stage === 'released' ? 'rose' : stage === 'token_issued' || stage === 'release_pending' ? 'emerald' : 'cyan'} />
                    <DemoStatCard label="Access mode" value={accessMode.label} detail={accessMode.detail} tone="cyan" />
                    <DemoStatCard label="Policy state" value={policyState} detail={getDemoEscrowNextAction(stage)} tone={stage === 'released' ? 'rose' : stage === 'token_issued' || stage === 'release_pending' ? 'emerald' : 'amber'} />
                </section>

                <section className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                    <article className="rounded-3xl border border-cyan-500/25 bg-black/65 p-6 shadow-[0_0_20px_rgba(34,211,238,0.16)] backdrop-blur-xl">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Workspace context</div>
                                <h2 className="mt-2 text-2xl font-semibold text-white">{workspaceName}</h2>
                                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                                    {stage === 'quote_ready' || stage === 'escrow_funded'
                                        ? 'Workspace provisioning is pending. The buyer cannot enter the governed environment until workspace readiness and policy checks complete.'
                                        : stage === 'workspace_ready'
                                            ? 'The secure workspace is provisioned and ready, but the buyer still needs an active Ephemeral Token before governed evaluation begins.'
                                            : stage === 'released'
                                                ? 'The governed workspace is archived because escrow is released and the demo access window is closed.'
                                                : 'Governed evaluation is active inside the secure workspace. Raw export stays blocked and all activity remains audit-linked.'}
                                </p>
                            </div>
                            <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${
                                stage === 'released'
                                    ? 'border-rose-400/35 bg-rose-500/10 text-rose-100'
                                    : stage === 'quote_ready' || stage === 'escrow_funded'
                                        ? 'border-amber-400/35 bg-amber-500/10 text-amber-100'
                                        : 'border-emerald-400/35 bg-emerald-500/10 text-emerald-100'
                            }`}>
                                {lifecycleState}
                            </span>
                        </div>

                        <div className="mt-5 grid gap-3 md:grid-cols-2">
                            <DemoFactRow label="Dataset" value={scenario.quote.datasetTitle} />
                            <DemoFactRow label="Deal" value={scenario.dealId} mono />
                            <DemoFactRow label="Workspace launch path" value={buyerRouteTargets.secureWorkspace} mono />
                            <DemoFactRow label="Workspace state" value={workspaceStatus} />
                            <DemoFactRow label="Token state" value={tokenState} mono={Boolean(record?.credentials.credentialId)} />
                            <DemoFactRow label="Policy state" value={policyState} />
                        </div>

                        <div className="mt-5 rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-4 text-sm leading-6 text-amber-100">
                            Raw export does not become freely available here. Evaluation remains controlled by workspace isolation, policy-bound scopes, audit logging, and reviewed output release rules.
                        </div>
                    </article>

                    <div className="space-y-6">
                        <article className="rounded-2xl border border-white/10 bg-[#0a1424] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.28)]">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Access posture</div>
                            <div className="mt-3 space-y-3">
                                <DemoPolicyRow label="Workspace provisioning" value={workspaceStatus} />
                                <DemoPolicyRow label="Ephemeral Token" value={tokenState} />
                                <DemoPolicyRow label="Evaluation lane" value={evaluationStatus} />
                                <DemoPolicyRow label="Release posture" value={stage === 'release_pending' ? 'Awaiting release' : stage === 'released' ? 'Closed' : 'Held in escrow'} />
                            </div>
                        </article>

                        <article className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-6 shadow-[0_0_20px_rgba(16,185,129,0.16)]">
                            <div className="text-sm font-semibold text-white">Next recommended action</div>
                            <p className="mt-3 text-sm leading-6 text-emerald-100/90">
                                {getDemoEscrowNextAction(stage)}
                            </p>
                        </article>

                        <div className="grid gap-3">
                            <Link
                                to={buyerRouteTargets.ephemeralToken}
                                className="rounded-xl border border-amber-400/35 bg-amber-500/10 px-4 py-3 text-center text-sm font-semibold text-amber-100 transition-colors hover:bg-amber-500/20"
                            >
                                View Ephemeral Token
                            </Link>
                            <Link
                                to={buyerRouteTargets.outputReview}
                                className="rounded-xl border border-cyan-400/35 bg-cyan-500/10 px-4 py-3 text-center text-sm font-semibold text-cyan-100 transition-colors hover:bg-cyan-500/20"
                            >
                                Review Output
                            </Link>
                            <Link
                                to={buyerRouteTargets.checkout}
                                className="rounded-xl border border-white/15 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:border-cyan-400/40 hover:bg-white/5"
                            >
                                Open Checkout
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}

function DemoStatCard({
    label,
    value,
    detail,
    tone
}: {
    label: string
    value: string
    detail: string
    tone: 'cyan' | 'emerald' | 'amber' | 'rose'
}) {
    const toneClass =
        tone === 'emerald'
            ? 'text-emerald-200'
            : tone === 'amber'
                ? 'text-amber-200'
                : tone === 'rose'
                    ? 'text-rose-200'
                    : 'text-cyan-200'

    return (
        <article className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
            <div className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</div>
            <div className={`mt-3 text-xl font-semibold ${toneClass}`}>{value}</div>
            <div className="mt-2 text-sm text-slate-400">{detail}</div>
        </article>
    )
}

function DemoFactRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
    return (
        <div className="rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-3">
            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
            <div className={`mt-2 text-sm font-semibold text-slate-100 ${mono ? 'font-mono' : ''}`}>{value}</div>
        </div>
    )
}

function DemoPolicyRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-slate-950/45 px-4 py-3 text-sm">
            <span className="text-slate-400">{label}</span>
            <span className="font-semibold text-white">{value}</span>
        </div>
    )
}
