import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
    buildBuyerTokenViewModel,
    findDealContextForCheckout,
    selectPrimaryBuyerToken,
    type BuyerTokenViewModel
} from '../domain/ephemeralToken'
import { loadEscrowCheckouts } from '../domain/purchaseEscrow'
import { loadDealRouteContexts } from '../domain/dealDossier'
import {
    filterOutCanonicalDemoEscrowRecords,
    getBuyerRouteTargets,
    getCanonicalDemoEscrowScenario,
    isBuyerDemoActive
} from '../domain/demoEscrowScenario'
import DemoEscrowControls from '../components/demo/DemoEscrowControls'

type EphemeralTokenPageProps = {
    demo?: boolean
}

const panelClass =
    'rounded-3xl border border-white/10 bg-[#0a1526]/85 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl'
const insetCardClass = 'rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-3'
const eyebrowClass = 'text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500'

const policyControlToneClass: Record<string, string> = {
    Active: 'border-emerald-500/35 bg-emerald-500/10 text-emerald-100',
    Required: 'border-cyan-500/35 bg-cyan-500/10 text-cyan-100',
    Pending: 'border-amber-500/35 bg-amber-500/10 text-amber-100',
    Blocked: 'border-rose-500/35 bg-rose-500/10 text-rose-100',
    'Not applicable': 'border-slate-700/60 bg-slate-900/40 text-slate-300'
}

const tokenStatusToneClass: Record<string, string> = {
    Active: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100',
    Provisioning: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-100',
    Frozen: 'border-amber-500/40 bg-amber-500/10 text-amber-100',
    Expired: 'border-slate-600/50 bg-slate-800/50 text-slate-300',
    Revoked: 'border-rose-500/40 bg-rose-500/10 text-rose-100'
}

const timelineToneDot: Record<string, string> = {
    complete: 'bg-emerald-400',
    current: 'bg-cyan-400',
    upcoming: 'bg-slate-600',
    blocked: 'bg-rose-400'
}

function capitalize(value: string) {
    if (!value) return value
    return value.charAt(0).toUpperCase() + value.slice(1)
}

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
    return (
        <div className={insetCardClass}>
            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
            <div className={`mt-1.5 text-sm ${mono ? 'font-mono' : 'font-medium'} text-slate-100 break-all`}>{value}</div>
        </div>
    )
}

function EphemeralTokenEmptyState({ datasetsPath, escrowCenterPath }: { datasetsPath: string; escrowCenterPath: string }) {
    return (
        <>
            <section className={`${panelClass} text-center`}>
                <div className={eyebrowClass}>Empty State</div>
                <h2 className="mt-3 text-2xl font-semibold text-white">No active Ephemeral Token</h2>
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                    Ephemeral Tokens are issued only after escrow funding, workspace provisioning, and policy checks
                    clear inside an active evaluation. Start by funding a checkout and the token will appear here once
                    issuance completes.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <Link
                        to={datasetsPath}
                        className="rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
                    >
                        Browse Datasets
                    </Link>
                    <Link
                        to={escrowCenterPath}
                        className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:border-cyan-400/40 hover:text-white"
                    >
                        Open Escrow Center
                    </Link>
                </div>
            </section>

            <section className={panelClass}>
                <div className={eyebrowClass}>Concept</div>
                <h2 className="mt-2 text-xl font-semibold text-white">How Ephemeral Tokens Work</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                    A scoped, short-lived credential is bound to one evaluation, one workspace, and a single review
                    window. It cannot be reused across deals or extended past its expiry; a new evaluation requires a
                    fresh token.
                </p>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    <li className={insetCardClass}>
                        <div className="text-sm font-semibold text-white">Bound to escrow</div>
                        <div className="mt-1 text-xs text-slate-400">Issuance follows funded escrow and a provisioned workspace.</div>
                    </li>
                    <li className={insetCardClass}>
                        <div className="text-sm font-semibold text-white">Time-boxed</div>
                        <div className="mt-1 text-xs text-slate-400">Validation window is fixed at issuance and expires automatically.</div>
                    </li>
                    <li className={insetCardClass}>
                        <div className="text-sm font-semibold text-white">Scope-locked</div>
                        <div className="mt-1 text-xs text-slate-400">Only the listed scopes can be exercised inside the governed enclave.</div>
                    </li>
                    <li className={insetCardClass}>
                        <div className="text-sm font-semibold text-white">Audit-linked</div>
                        <div className="mt-1 text-xs text-slate-400">Every action remains tied to the evaluation audit trail.</div>
                    </li>
                </ul>
            </section>

            <section className={panelClass}>
                <div className={eyebrowClass}>Controls</div>
                <h2 className="mt-2 text-xl font-semibold text-white">Security Controls</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    <li className={insetCardClass}>
                        <div className="text-sm font-semibold text-white">Egress review</div>
                        <div className="mt-1 text-xs text-slate-400">Outputs leave only after governed review.</div>
                    </li>
                    <li className={insetCardClass}>
                        <div className="text-sm font-semibold text-white">Watermarking</div>
                        <div className="mt-1 text-xs text-slate-400">Approved exports are watermarked and traced.</div>
                    </li>
                    <li className={insetCardClass}>
                        <div className="text-sm font-semibold text-white">Re-identification block</div>
                        <div className="mt-1 text-xs text-slate-400">Re-identification is prohibited by token scope and DUA.</div>
                    </li>
                    <li className={insetCardClass}>
                        <div className="text-sm font-semibold text-white">Revocation</div>
                        <div className="mt-1 text-xs text-slate-400">Tokens can freeze or revoke on policy or dispute events.</div>
                    </li>
                </ul>
            </section>

            <section className={panelClass}>
                <div className={eyebrowClass}>Modes</div>
                <h2 className="mt-2 text-xl font-semibold text-white">Access Modes</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className={insetCardClass}>
                        <div className="text-sm font-semibold text-white">Secure clean room</div>
                        <div className="mt-1 text-xs text-slate-400">Analysis happens in an isolated workspace with no raw export path.</div>
                    </div>
                    <div className={insetCardClass}>
                        <div className="text-sm font-semibold text-white">Aggregated export</div>
                        <div className="mt-1 text-xs text-slate-400">Reviewed aggregate outputs can leave the workspace.</div>
                    </div>
                    <div className={insetCardClass}>
                        <div className="text-sm font-semibold text-white">Encrypted download</div>
                        <div className="mt-1 text-xs text-slate-400">Time-boxed, watermarked encrypted package access.</div>
                    </div>
                </div>
            </section>

            <section className={panelClass}>
                <div className={eyebrowClass}>Walkthrough</div>
                <h2 className="mt-2 text-xl font-semibold text-white">What the buyer workflow looks like</h2>
                <ol className="mt-4 space-y-3">
                    {[
                        'Configure rights and accept the DUA in checkout.',
                        'Fund escrow to lock provider payout against validation.',
                        'Workspace provisions automatically inside the governed enclave.',
                        'Ephemeral Token issues and the evaluation window opens.',
                        'Outputs flow through governed review before any release.',
                        'Buyer validation closes the window before escrow releases.'
                    ].map((step, index) => (
                        <li key={step} className="flex items-start gap-3">
                            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-500/10 text-[11px] font-semibold text-cyan-100">
                                {index + 1}
                            </span>
                            <span className="text-sm leading-6 text-slate-300">{step}</span>
                        </li>
                    ))}
                </ol>
            </section>
        </>
    )
}

function EphemeralTokenDetail({
    viewModel,
    routeTargets
}: {
    viewModel: BuyerTokenViewModel
    routeTargets: ReturnType<typeof getBuyerRouteTargets>
}) {
    const { record } = viewModel
    const tokenLabel = viewModel.safeTokenReference
    const accessMode = record.configuration.accessMode
    const accessModeWorkspaceLabel =
        accessMode === 'clean_room'
            ? 'Secure clean room'
            : accessMode === 'aggregated_export'
                ? 'Aggregated export'
                : 'Encrypted download'
    const workspaceLaunchPath = record.workspace.launchPath || routeTargets.secureWorkspace
    const dossierPath = viewModel.dealContext?.routeTargets.dossier ?? routeTargets.dealDossier
    const outputReviewPath = viewModel.outputReviewPath ?? routeTargets.outputReview
    const checkoutPath = `/datasets/${record.datasetId}/escrow-checkout`
    const isWorkspaceAvailable = viewModel.status === 'Active' || viewModel.status === 'Provisioning'

    return (
        <>
            <section className={panelClass} aria-label="Ephemeral Token summary">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                        <div className={eyebrowClass}>Token reference ID</div>
                        <div className="mt-2 text-2xl font-semibold text-white font-mono break-all">{tokenLabel}</div>
                        <p className="mt-2 max-w-2xl text-sm text-slate-400">{viewModel.statusDetail}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Token status</div>
                        <span
                            className={`mt-1 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${tokenStatusToneClass[viewModel.status]}`}
                        >
                            <span className="h-2 w-2 rounded-full bg-current" />
                            {viewModel.status}
                        </span>
                    </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <InfoRow label="Credential status" value={viewModel.credentialStatusLabel} />
                    <InfoRow label="Policy state" value={viewModel.policyState} />
                    <InfoRow label="Time remaining" value={viewModel.timeRemaining} />
                    <InfoRow label="Validation window" value={viewModel.validationWindowLabel} />
                </div>
            </section>

            {viewModel.terminalState && (
                <section
                    className={`${panelClass} ${
                        viewModel.terminalState.status === 'Frozen'
                            ? 'border-amber-500/35 bg-amber-500/8'
                            : 'border-rose-500/35 bg-rose-500/8'
                    }`}
                >
                    <div className={eyebrowClass}>Terminal State</div>
                    <h2 className="mt-2 text-xl font-semibold text-white">
                        {viewModel.terminalState.status === 'Frozen' ? 'Token access is frozen' : 'Token access is revoked'}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-200">
                        This token is no longer usable. Access was restricted because the deal, policy, or evaluation state requires review.
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{viewModel.terminalState.reason}</p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <InfoRow label="Triggered by" value={capitalize(viewModel.terminalState.triggerSource)} />
                        <InfoRow label="Timestamp" value={viewModel.terminalState.timestamp} />
                        <InfoRow label="Release state" value={viewModel.releaseStateLabel} />
                    </div>

                    <p className="mt-4 text-sm leading-6 text-slate-300">{viewModel.terminalState.nextAction}</p>

                    <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/8 px-4 py-3 text-sm font-semibold text-rose-100">
                        Workspace access unavailable
                    </div>
                </section>
            )}

            <section className={panelClass}>
                <div className={eyebrowClass}>Linked Deal</div>
                <h2 className="mt-2 text-xl font-semibold text-white">{record.datasetTitle}</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <InfoRow label="Deal" value={viewModel.linkedDealReference} mono />
                    <InfoRow label="Dataset" value={record.datasetTitle} />
                    <InfoRow label="Escrow" value={record.escrowId} mono />
                    <InfoRow label="Contract" value={record.contractId} mono />
                    <InfoRow label="Buyer" value={record.buyerLabel} />
                    <InfoRow label="Provider" value={record.providerLabel} />
                </div>
            </section>

            <section className={panelClass}>
                <div className={eyebrowClass}>Workspace & Access</div>
                <h2 className="mt-2 text-xl font-semibold text-white">{accessModeWorkspaceLabel}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">{viewModel.accessModeDetail}</p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <InfoRow label="Access mode" value={accessModeWorkspaceLabel} />
                    <InfoRow label="Workspace status" value={viewModel.workspaceStatusLabel} />
                    <InfoRow label="Workspace name" value={record.workspace.workspaceName} />
                    <InfoRow label="Workspace launch path" value={workspaceLaunchPath} mono />
                    <InfoRow label="Escrow state" value={viewModel.escrowStateLabel} />
                    <InfoRow label="Release state" value={viewModel.releaseStateLabel} />
                </div>
            </section>

            <section className={panelClass}>
                <div className={eyebrowClass}>Permissions</div>
                <h2 className="mt-2 text-xl font-semibold text-white">Allowed vs Blocked</h2>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <div className={`${insetCardClass} border-emerald-500/25`}>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-200">Allowed</div>
                        <ul className="mt-3 space-y-2 text-sm text-slate-200">
                            {viewModel.permissions.allowed.map(item => (
                                <li key={item} className="flex items-start gap-2">
                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className={`${insetCardClass} border-rose-500/25`}>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-200">Blocked</div>
                        <ul className="mt-3 space-y-2 text-sm text-slate-200">
                            {viewModel.permissions.blocked.map(item => (
                                <li key={item} className="flex items-start gap-2">
                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-4">
                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Active Scopes</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {viewModel.permissions.scopeChips.map(scope => (
                            <span
                                key={scope}
                                className="rounded-full border border-cyan-400/25 bg-cyan-400/[0.08] px-3 py-1 text-[11px] font-semibold text-cyan-100"
                            >
                                {scope}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            <section className={panelClass}>
                <div className={eyebrowClass}>Policy Controls</div>
                <h2 className="mt-2 text-xl font-semibold text-white">Token Policy Surface</h2>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {viewModel.policyControls.map(control => (
                        <div key={control.label} className={insetCardClass}>
                            <div className="flex items-center justify-between gap-2">
                                <div className="text-sm font-semibold text-white">{control.label}</div>
                                <span
                                    className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                                        policyControlToneClass[control.status] ?? policyControlToneClass['Not applicable']
                                    }`}
                                >
                                    {control.status}
                                </span>
                            </div>
                            <p className="mt-2 text-xs leading-5 text-slate-400">{control.detail}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className={panelClass}>
                <div className={eyebrowClass}>Timeline</div>
                <h2 className="mt-2 text-xl font-semibold text-white">Token Event History</h2>

                <div className="mt-4 space-y-3">
                    {viewModel.timelineEvents.map((event, index) => (
                        <div key={`${event.title}-${index}`} className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${timelineToneDot[event.state]}`} />
                                {index < viewModel.timelineEvents.length - 1 && (
                                    <span className="mt-1 w-px flex-1 bg-slate-800" style={{ minHeight: '1.25rem' }} />
                                )}
                            </div>
                            <div className="min-w-0 pb-3">
                                <div className="text-sm font-semibold text-white">{event.title}</div>
                                <div className="mt-0.5 text-xs leading-5 text-slate-400">{event.detail}</div>
                                <div className="mt-0.5 text-[11px] text-slate-600">{event.timestamp}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className={panelClass}>
                <div className={eyebrowClass}>Quick Links</div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <Link
                        to={dossierPath}
                        className="rounded-xl border border-white/12 px-4 py-3 text-center text-sm font-semibold text-slate-200 hover:border-cyan-400/40 hover:text-white"
                    >
                        Open Deal Dossier
                    </Link>
                    {isWorkspaceAvailable && (
                        <Link
                            to={workspaceLaunchPath}
                            className="rounded-xl bg-emerald-500 px-4 py-3 text-center text-sm font-semibold text-slate-950 hover:bg-emerald-400"
                        >
                            Open Secure Workspace
                        </Link>
                    )}
                    <Link
                        to={checkoutPath}
                        className="rounded-xl border border-white/12 px-4 py-3 text-center text-sm font-semibold text-slate-200 hover:border-cyan-400/40 hover:text-white"
                    >
                        Open Escrow Checkout
                    </Link>
                    {viewModel.outputReviewPath && (
                        <Link
                            to={outputReviewPath}
                            className="rounded-xl border border-white/12 px-4 py-3 text-center text-sm font-semibold text-slate-200 hover:border-cyan-400/40 hover:text-white"
                        >
                            Open Output Review
                        </Link>
                    )}
                </div>
            </section>
        </>
    )
}

export default function EphemeralTokenPage({ demo = false }: EphemeralTokenPageProps) {
    const location = useLocation()
    const isDemoRoute = demo || location.pathname.startsWith('/demo/')
    const buyerDemoActive = !demo && isBuyerDemoActive()
    const useDemo = isDemoRoute || buyerDemoActive
    const [, setRefreshKey] = useState(0)
    const nowMs = useMemo(() => Date.now(), [])

    const routeTargets = getBuyerRouteTargets(isDemoRoute)

    const viewModel = useMemo<BuyerTokenViewModel | null>(() => {
        if (useDemo) {
            const scenario = getCanonicalDemoEscrowScenario()
            const record = scenario.checkoutRecord
            if (!record) return null
            const dealContexts = loadDealRouteContexts()
            const dealContext = findDealContextForCheckout(record, dealContexts)
            return buildBuyerTokenViewModel(record, dealContext, nowMs)
        }

        const records = filterOutCanonicalDemoEscrowRecords(loadEscrowCheckouts())
        const selection = selectPrimaryBuyerToken(records, nowMs)
        if (!selection) return null
        const dealContexts = loadDealRouteContexts()
        const dealContext = findDealContextForCheckout(selection.record, dealContexts)
        return buildBuyerTokenViewModel(selection.record, dealContext, nowMs)
    }, [nowMs, useDemo])

    return (
        <div className="relative min-h-screen bg-[#030814] text-white">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(34,211,238,0.08),transparent_35%),radial-gradient(circle_at_85%_5%,rgba(16,185,129,0.07),transparent_32%),radial-gradient(circle_at_50%_92%,rgba(59,130,246,0.06),transparent_38%)]" />

            <div className="relative mx-auto max-w-[1280px] px-4 py-8 sm:px-8 sm:py-10 lg:px-12">
                {!isDemoRoute && (
                    <div className="mb-6">
                        <DemoEscrowControls
                            mode="normal-route"
                            onScenarioChange={() => setRefreshKey(value => value + 1)}
                        />
                    </div>
                )}

                <header className={`${panelClass} mb-6`}>
                    <nav className="flex items-center gap-2 text-sm text-slate-400">
                        <Link to={useDemo ? '/demo/datasets' : '/datasets'} className="hover:text-white">
                            Datasets
                        </Link>
                        <span className="text-slate-600">/</span>
                        <Link to={useDemo ? '/demo/escrow-center' : '/escrow-center'} className="hover:text-white">
                            Escrow Center
                        </Link>
                        <span className="text-slate-600">/</span>
                        <span className="text-slate-200">Ephemeral Token</span>
                    </nav>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                        <div className={eyebrowClass}>Buyer Workflow · Token Control Center</div>
                    </div>

                    <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">Ephemeral Token</h1>

                    <p className="mt-3 max-w-2xl text-base leading-7 text-slate-400">
                        Read-only buyer view of the temporary, scoped credential that gates governed evaluation access.
                        The token is bound to one escrow, one workspace, and a single review window.
                    </p>
                </header>

                <div className="space-y-6">
                    {viewModel ? (
                        <EphemeralTokenDetail viewModel={viewModel} routeTargets={routeTargets} />
                    ) : (
                        <EphemeralTokenEmptyState
                            datasetsPath={useDemo ? '/demo/datasets' : '/datasets'}
                            escrowCenterPath={useDemo ? '/demo/escrow-center' : '/escrow-center'}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
