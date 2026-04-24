import { useMemo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
    dashboardColorTokens,
    dashboardComponentTokens,
    dashboardRadiusTokens,
    dashboardShadowTokens,
    dashboardSpacingTokens,
    dashboardTypographyTokens
} from '../dashboardTokens'
import { CONTRACT_STATE_LABELS } from '../domain/accessContract'
import {
    checkoutAccessModeMeta,
    loadEscrowCheckouts,
    outcomeStageMeta,
    type EscrowCheckoutRecord
} from '../domain/escrowCheckout'
import { loadDealRouteContexts, type DealRouteContext } from '../domain/dealDossier'

type TokenStatus = 'Active' | 'Provisioning' | 'Frozen' | 'Expired' | 'Revoked'
type Tone = 'cyan' | 'emerald' | 'amber' | 'rose' | 'slate'
type TimelineState = 'complete' | 'current' | 'upcoming' | 'blocked'

type TokenLifecycleEvent = {
    title: string
    detail: string
    timestamp: string
    state: TimelineState
}

type TerminalState = {
    reason: string
    timestamp: string
    triggerSource: 'System' | 'Admin' | 'Outcome engine' | 'Policy control'
}

const pageClass = `relative min-h-screen ${dashboardColorTokens['surface-page']} ${dashboardColorTokens['text-primary']}`
const shellClass = `relative mx-auto max-w-[1680px] ${dashboardSpacingTokens['page-padding']}`
const panelClass = `relative overflow-hidden ${dashboardRadiusTokens['radius-lg']} border ${dashboardColorTokens['border-subtle']} ${dashboardColorTokens['surface-panel']} ${dashboardSpacingTokens['panel-padding']} ${dashboardShadowTokens['shadow-card']} before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-16 before:bg-[linear-gradient(180deg,rgba(255,255,255,0.025),transparent)] before:content-['']`
const cardClass = `relative overflow-hidden ${dashboardRadiusTokens['radius-md']} border ${dashboardColorTokens['border-card']} ${dashboardColorTokens['surface-card']} ${dashboardSpacingTokens['card-padding-compact']} shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]`
const secondaryButtonClass = `inline-flex items-center justify-center ${dashboardRadiusTokens['radius-md']} border ${dashboardColorTokens['border-soft']} bg-slate-950/45 px-4 py-2.5 text-sm font-semibold text-slate-100 transition-colors hover:border-cyan-400/40 hover:text-cyan-100`
const disabledButtonClass = `inline-flex cursor-not-allowed items-center justify-center ${dashboardRadiusTokens['radius-md']} border border-slate-800 bg-slate-950/35 px-4 py-2.5 text-sm font-semibold text-slate-500`

const text = {
    eyebrow: dashboardTypographyTokens['text-eyebrow'],
    heroEyebrow: dashboardTypographyTokens['text-hero-eyebrow'],
    heroTitle: dashboardTypographyTokens['text-hero-title'],
    sectionTitle: dashboardTypographyTokens['text-section-title'],
    panelTitle: dashboardTypographyTokens['text-panel-title'],
    itemTitle: dashboardTypographyTokens['text-item-title'],
    body: dashboardTypographyTokens['text-body'],
    bodyStrong: dashboardTypographyTokens['text-body-strong'],
    meta: dashboardTypographyTokens['text-muted'],
    metaStrong: dashboardTypographyTokens['text-muted-strong']
}

const statusToneClasses: Record<TokenStatus, string> = {
    Active: 'border-emerald-400/35 bg-emerald-500/10 text-emerald-100',
    Provisioning: 'border-cyan-400/35 bg-cyan-500/10 text-cyan-100',
    Frozen: 'border-amber-400/40 bg-amber-500/10 text-amber-100',
    Expired: 'border-slate-500/40 bg-slate-500/10 text-slate-200',
    Revoked: 'border-rose-400/40 bg-rose-500/10 text-rose-100'
}

const toneClasses: Record<Tone, { badge: string; marker: string; text: string; panel: string }> = {
    cyan: {
        badge: 'border-cyan-400/35 bg-cyan-500/10 text-cyan-100',
        marker: 'border-cyan-400/40 bg-cyan-500/15 text-cyan-100',
        text: 'text-cyan-200',
        panel: 'border-cyan-400/25 bg-cyan-500/[0.07]'
    },
    emerald: {
        badge: 'border-emerald-400/35 bg-emerald-500/10 text-emerald-100',
        marker: 'border-emerald-400/40 bg-emerald-500/15 text-emerald-100',
        text: 'text-emerald-200',
        panel: 'border-emerald-400/25 bg-emerald-500/[0.07]'
    },
    amber: {
        badge: 'border-amber-400/40 bg-amber-500/10 text-amber-100',
        marker: 'border-amber-400/40 bg-amber-500/15 text-amber-100',
        text: 'text-amber-200',
        panel: 'border-amber-400/25 bg-amber-500/[0.07]'
    },
    rose: {
        badge: 'border-rose-400/40 bg-rose-500/10 text-rose-100',
        marker: 'border-rose-400/40 bg-rose-500/15 text-rose-100',
        text: 'text-rose-200',
        panel: 'border-rose-400/25 bg-rose-500/[0.07]'
    },
    slate: {
        badge: 'border-slate-600/70 bg-slate-950/45 text-slate-200',
        marker: 'border-slate-600/70 bg-slate-950/60 text-slate-200',
        text: 'text-slate-300',
        panel: 'border-slate-700/75 bg-slate-950/35'
    }
}

const allowedAccess = [
    'Dataset read inside governed workspace',
    'Clean-room query',
    'Audit write',
    'Policy-enforced evaluation'
]

const blockedAccess = [
    'Raw export',
    'Re-identification',
    'Redistribution',
    'Unreviewed egress',
    'Download unless encrypted download mode is approved'
]

const emptyNextSteps = [
    'Browse datasets',
    'Build rights quote',
    'Complete escrow checkout',
    'Wait for workspace provisioning',
    'Token issued'
]

const tokenFlowSteps = [
    'Escrow is funded',
    'Workspace is provisioned',
    'Policy checks pass',
    'Ephemeral Token is issued',
    'Evaluation becomes active',
    'Token expires, freezes, or revokes based on deal and policy state'
]

const securityControls = [
    { title: 'Time-boxed access', detail: 'Credential windows are short-lived and close automatically at expiry.', tone: 'cyan' },
    { title: 'Policy-bound scope', detail: 'Scopes follow the approved evaluation workflow, not broad account access.', tone: 'emerald' },
    { title: 'Audit logging', detail: 'Workspace activity and control events remain tied to the deal audit trail.', tone: 'emerald' },
    { title: 'Egress review', detail: 'Outputs are blocked or routed through review depending on the access mode.', tone: 'amber' },
    { title: 'Raw export control', detail: 'Raw data export is blocked unless an explicitly approved encrypted download path applies.', tone: 'rose' },
    { title: 'Auto-expiry', detail: 'Expired credentials cannot continue workspace access without renewed review.', tone: 'cyan' },
    { title: 'Freeze / revoke controls', detail: 'Disputes, outcome failures, or policy events can freeze or revoke access.', tone: 'amber' },
    { title: 'No raw secret exposed', detail: 'The UI shows only safe token references for audit and support.', tone: 'emerald' }
] satisfies Array<{ title: string; detail: string; tone: Tone }>

const accessModeCards = [
    {
        title: 'Secure clean room',
        detail: 'Analysis happens inside an isolated workspace with no raw export path.'
    },
    {
        title: 'Aggregated export',
        detail: 'Governed analysis is allowed, but only reviewed aggregate outputs can leave.'
    },
    {
        title: 'Encrypted download',
        detail: 'Time-boxed, watermarked, encrypted package access is allowed when explicitly approved.'
    }
]

export default function EphemeralTokenPage() {
    const nowMs = useMemo(() => Date.now(), [])
    const dealContexts = useMemo(() => loadDealRouteContexts(), [])
    const checkoutRecords = useMemo(() => loadEscrowCheckouts(), [])
    // loadEscrowCheckouts returns records sorted newest first, so index 0 is the current token context.
    const currentToken = checkoutRecords[0] ?? null
    const dealContext = useMemo(
        () => (currentToken ? findDealContextForCheckout(currentToken, dealContexts) : null),
        [currentToken, dealContexts]
    )
    const tokenStatus = currentToken ? deriveTokenStatus(currentToken, nowMs) : undefined
    const statusTone = tokenStatus ? getStatusTone(tokenStatus) : 'cyan'

    return (
        <div className={pageClass}>
            <div className={dashboardComponentTokens['page-background']} />
            <main className={shellClass}>
                <PageHeader status={tokenStatus} statusTone={statusTone} />
                {currentToken ? (
                    <TokenDashboard currentToken={currentToken} dealContext={dealContext} nowMs={nowMs} />
                ) : (
                    <EmptyTokenState />
                )}
                <EducationSections />
                <SecurityNotice />
            </main>
        </div>
    )
}

function TokenDashboard({
    currentToken,
    dealContext,
    nowMs
}: {
    currentToken: EscrowCheckoutRecord
    dealContext: DealRouteContext | null
    nowMs: number
}) {
    const tokenStatus = deriveTokenStatus(currentToken, nowMs)
    const statusTone = getStatusTone(tokenStatus)
    const lifecycleLabel = CONTRACT_STATE_LABELS[currentToken.lifecycleState]
    const accessModeMeta = checkoutAccessModeMeta[currentToken.configuration.accessMode]
    const outcomeMeta = outcomeStageMeta[currentToken.outcomeProtection.stage]
    const timeRemaining = formatTimeRemaining(currentToken.credentials.expiresAt, nowMs)
    const policyState = getPolicyState(currentToken, tokenStatus)
    const safeTokenReference = getSafeTokenReference(currentToken)
    const dossierRoute = dealContext?.routeTargets.dossier ?? '/deals'
    const terminalState = getTerminalState(currentToken, tokenStatus)
    const timelineEvents = buildTimelineEvents(currentToken, tokenStatus, nowMs)
    const scopeChips = sanitizeScopes(currentToken.credentials.scopes)
    const workspaceReady = currentToken.workspace.status === 'ready'
    const renewalEligible = tokenStatus === 'Expired'

    return (
        <>
                <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Ephemeral Token summary">
                    <SummaryCard label="Token status" value={tokenStatus} detail={getStatusDetail(tokenStatus)} tone={statusTone} />
                    <SummaryCard label="Time remaining" value={timeRemaining} detail={formatIsoTimestamp(currentToken.credentials.expiresAt, 'Expiry pending')} tone={tokenStatus === 'Expired' ? 'slate' : statusTone} />
                    <SummaryCard label="Access mode" value={accessModeMeta.label} detail={accessModeMeta.detail} tone="cyan" />
                    <SummaryCard label="Policy state" value={policyState} detail="Deal, DUA, workspace, and egress controls remain linked." tone={policyState === 'Restricted' ? 'amber' : 'emerald'} />
                </section>

                {terminalState ? (
                    <TerminalStatePanel
                        status={tokenStatus}
                        terminalState={terminalState}
                        dossierRoute={dossierRoute}
                    />
                ) : null}

                <section className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1.42fr)_minmax(360px,0.8fr)]">
                    <div className="space-y-6">
                        <Panel
                            eyebrow="Current credential context"
                            title="Current Ephemeral Token"
                            description="Buyer/evaluator access is represented by a safe reference ID and metadata only."
                        >
                            <div className="grid gap-3 md:grid-cols-2">
                                <DetailRow label="Token reference ID" value={safeTokenReference} mono />
                                <DetailRow label="Status" value={tokenStatus} badgeClassName={statusToneClasses[tokenStatus]} />
                                <DetailRow label="Buyer / evaluator" value={currentToken.buyerLabel} mono />
                                <DetailRow label="Dataset" value={currentToken.datasetTitle} />
                                <DetailRow label="Workspace" value={currentToken.workspace.workspaceName} />
                                <DetailRow label="Issued time" value={formatIsoTimestamp(currentToken.credentials.issuedAt, 'Not issued yet')} />
                                <DetailRow label="Expiry time" value={formatIsoTimestamp(currentToken.credentials.expiresAt, 'Pending credential issue')} />
                                <DetailRow label="TTL" value={`${currentToken.credentials.tokenTtlMinutes} minutes`} />
                                <DetailRow label="Access mode" value={accessModeMeta.label} />
                                <DetailRow label="Lifecycle state" value={lifecycleLabel} />
                            </div>
                        </Panel>

                        <Panel
                            eyebrow="Permissions and scopes"
                            title="What this token allows and blocks"
                            description="Scopes are displayed as plain-language permissions, not as usable access material."
                        >
                            <div className="grid gap-4 lg:grid-cols-2">
                                <PermissionList title="Allowed" items={allowedAccess} tone="emerald" />
                                <PermissionList title="Blocked" items={blockedAccess} tone="rose" />
                            </div>
                            <div className="mt-5 flex flex-wrap gap-2">
                                {scopeChips.map(scope => (
                                    <span key={scope} className="rounded-full border border-cyan-400/20 bg-cyan-400/[0.08] px-3 py-1.5 text-xs font-semibold text-cyan-100">
                                        {scope}
                                    </span>
                                ))}
                            </div>
                        </Panel>

                        <Panel
                            eyebrow="Linked transaction"
                            title="Deal and escrow context"
                            description="The token is tied to funded escrow, rights scope, workspace controls, and buyer validation."
                        >
                            <div className="grid gap-3 md:grid-cols-2">
                                <DetailRow label="Deal / checkout reference" value={dealContext?.seed.dealId ?? currentToken.id} mono />
                                <DetailRow label="Escrow reference" value={currentToken.escrowId} mono />
                                <DetailRow label="Escrow state" value={lifecycleLabel} />
                                <DetailRow label="Provider label" value={currentToken.providerLabel} mono />
                                <DetailRow label="Buyer validation window" value={`${currentToken.configuration.reviewWindowHours} hours`} />
                                <DetailRow label="Outcome protection state" value={outcomeMeta.label} />
                                <DetailRow label="Evaluation fee" value={formatCurrency(currentToken.outcomeProtection.evaluationFeeUsd)} />
                                <DetailRow label="DUA" value={currentToken.dua.accepted ? `Accepted · ${currentToken.dua.version}` : `Pending · ${currentToken.dua.version}`} />
                            </div>
                            <p className={`mt-4 ${text.body}`}>{outcomeMeta.detail}</p>
                        </Panel>

                        <Panel
                            eyebrow="Activity timeline"
                            title="Lifecycle timeline"
                            description="A compact trace of escrow funding, workspace readiness, token issue, evaluation, and terminal state."
                        >
                            <div className="space-y-4">
                                {timelineEvents.map((event, index) => (
                                    <TimelineRow key={event.title} event={event} isLast={index === timelineEvents.length - 1} />
                                ))}
                            </div>
                        </Panel>
                    </div>

                    <aside className="space-y-6 xl:sticky xl:top-24">
                        <Panel
                            eyebrow="Workspace access"
                            title="Secure workspace"
                            description={accessModeMeta.detail}
                        >
                            <div className={cardClass}>
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className={text.eyebrow}>Workspace status</div>
                                        <div className="mt-2 text-lg font-semibold text-white">
                                            {workspaceReady ? 'Ready' : 'Planned'}
                                        </div>
                                    </div>
                                    <StatusBadge label={workspaceReady ? 'Ready' : 'Provisioning'} tone={workspaceReady ? 'emerald' : 'amber'} />
                                </div>
                                <div className="mt-4 text-sm font-semibold text-slate-100">{currentToken.workspace.workspaceName}</div>
                                <p className={`mt-2 ${text.body}`}>
                                    {workspaceReady
                                        ? 'Workspace controls are ready. Launching keeps evaluation inside the governed access boundary.'
                                        : 'Workspace provisioning is pending. Access opens after policy checks, escrow state review, and workspace readiness complete.'}
                                </p>
                                {workspaceReady ? (
                                    <Link to={currentToken.workspace.launchPath} className={`mt-5 w-full ${dashboardComponentTokens['action-button']} ${dashboardRadiusTokens['radius-md']} px-4 py-2.5`}>
                                        Open Secure Workspace
                                    </Link>
                                ) : (
                                    <button type="button" disabled className={`mt-5 w-full ${disabledButtonClass}`}>
                                        Workspace provisioning pending
                                    </button>
                                )}
                            </div>
                        </Panel>

                        <Panel
                            eyebrow="Expiry and renewal"
                            title="Time-boxed access"
                            description="After expiry, workspace access closes automatically. New access requires policy re-check, deal-state review, and a renewed Ephemeral Token."
                        >
                            <div className="space-y-3">
                                <DetailRow label="Countdown" value={timeRemaining} />
                                <DetailRow label="Expiry timestamp" value={formatIsoTimestamp(currentToken.credentials.expiresAt, 'Pending issue')} />
                                <DetailRow label="After expiry" value="Workspace access closes automatically" />
                                <DetailRow label="Renewal eligibility" value={renewalEligible ? 'Eligible after review' : 'Not currently available'} />
                            </div>
                            <button type="button" disabled className={`mt-5 w-full ${disabledButtonClass}`}>
                                Request Renewal · Coming soon
                            </button>
                        </Panel>

                        <Panel
                            eyebrow="Policy controls"
                            title="Active control checks"
                            description="Control rows show the safe enforcement posture for this evaluation credential."
                        >
                            <div className="space-y-3">
                                {buildPolicyControls(currentToken, tokenStatus).map(control => (
                                    <ControlRow key={control.label} label={control.label} value={control.value} tone={control.tone} />
                                ))}
                            </div>
                        </Panel>
                    </aside>
                </section>
        </>
    )
}

function PageHeader({ status, statusTone = 'cyan' }: { status?: TokenStatus; statusTone?: Tone }) {
    return (
        <header className={`${dashboardComponentTokens['hero-surface']} ${dashboardRadiusTokens['radius-lg']} ${dashboardSpacingTokens['hero-padding']}`}>
            <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <div>
                    <div className={text.heroEyebrow}>BUYER WORKFLOW · TEMPORARY ACCESS</div>
                    <h1 className={`mt-3 ${text.heroTitle}`}>Ephemeral Token</h1>
                    <p className={`mt-3 max-w-3xl ${text.bodyStrong}`}>
                        Temporary, policy-bound access for secure dataset evaluation.
                    </p>
                    <p className={`mt-3 max-w-4xl ${text.body}`}>
                        Redoubt issues short-lived Ephemeral Tokens after escrow, workspace provisioning, and policy checks clear. Access is scoped to the approved evaluation workflow and can expire, freeze, or revoke automatically.
                    </p>
                </div>
                {status ? (
                    <div className={`rounded-2xl border px-4 py-3 ${toneClasses[statusTone].panel}`}>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Current token state</div>
                        <div className={`mt-2 text-lg font-semibold ${toneClasses[statusTone].text}`}>{status}</div>
                    </div>
                ) : null}
            </div>
        </header>
    )
}

function EmptyTokenState() {
    return (
        <section className={`mt-6 ${panelClass}`}>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
                <div>
                    <div className={text.eyebrow}>No credential issued</div>
                    <h2 className={`mt-3 ${text.sectionTitle}`}>No active Ephemeral Token</h2>
                    <p className={`mt-3 max-w-3xl ${text.body}`}>
                        A short-lived evaluation token will appear here after escrow funding, workspace provisioning, and policy checks are complete.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <Link to="/datasets" className={`${dashboardComponentTokens['action-button']} ${dashboardRadiusTokens['radius-md']} px-4 py-2.5`}>
                            Browse Datasets
                        </Link>
                        <Link to="/escrow-center" className={secondaryButtonClass}>
                            Open Escrow Center
                        </Link>
                    </div>
                </div>
                <div className={cardClass}>
                    <div className={text.eyebrow}>Next steps</div>
                    <div className="mt-4 space-y-3">
                        {emptyNextSteps.map((step, index) => (
                            <div key={step} className="flex items-center gap-3">
                                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/[0.08] text-xs font-semibold text-cyan-100">
                                    {index + 1}
                                </span>
                                <span className="text-sm text-slate-300">{step}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

function EducationSections() {
    return (
        <div className="mt-6 space-y-6" aria-label="Ephemeral Token education">
            <Panel
                eyebrow="Buyer access model"
                title="How Ephemeral Tokens Work"
                description="An Ephemeral Token is a short-lived access credential that allows a buyer or evaluator to work with a protected dataset inside a governed workspace. It does not provide permanent access, uncontrolled raw data access, or reusable secrets."
            >
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {tokenFlowSteps.map((step, index) => (
                        <div key={step} className={cardClass}>
                            <div className="flex items-start gap-3">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-400/25 bg-cyan-400/[0.08] text-xs font-semibold text-cyan-100">
                                    {index + 1}
                                </span>
                                <div>
                                    <div className="text-sm font-semibold text-slate-100">{step}</div>
                                    <p className={`mt-2 ${text.meta}`}>
                                        {getFlowStepDetail(index)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Panel>

            <Panel
                eyebrow="Control posture"
                title="Security Controls"
                description="Every token is constrained by time, policy, audit, egress, and deal-state controls before protected data evaluation can proceed."
            >
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {securityControls.map(control => (
                        <div key={control.title} className={`rounded-2xl border px-4 py-4 ${toneClasses[control.tone].panel}`}>
                            <StatusBadge label={control.title} tone={control.tone} />
                            <p className={`mt-3 ${text.bodyStrong}`}>{control.detail}</p>
                        </div>
                    ))}
                </div>
            </Panel>

            <Panel
                eyebrow="Access mode reference"
                title="Access Modes"
                description="The token’s scope follows the selected access mode, so buyers can evaluate without receiving permanent or uncontrolled data access."
            >
                <div className="grid gap-3 lg:grid-cols-3">
                    {accessModeCards.map(mode => (
                        <article key={mode.title} className={cardClass}>
                            <h3 className={text.itemTitle}>{mode.title}</h3>
                            <p className={`mt-3 ${text.body}`}>{mode.detail}</p>
                        </article>
                    ))}
                </div>
            </Panel>
        </div>
    )
}

function SummaryCard({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: Tone }) {
    return (
        <article className={cardClass}>
            <div className={`absolute inset-x-0 top-0 h-1 ${tone === 'emerald' ? 'bg-emerald-400/50' : tone === 'amber' ? 'bg-amber-400/50' : tone === 'rose' ? 'bg-rose-400/50' : tone === 'slate' ? 'bg-slate-500/50' : 'bg-cyan-400/50'}`} />
            <div className={text.eyebrow}>{label}</div>
            <div className={`mt-3 text-2xl font-semibold tracking-[-0.04em] ${toneClasses[tone].text}`}>{value}</div>
            <p className={`mt-2 ${text.meta}`}>{detail}</p>
        </article>
    )
}

function SecurityNotice() {
    return (
        <section className="mt-6 rounded-[24px] border border-cyan-400/25 bg-cyan-400/[0.07] px-5 py-4 shadow-[0_24px_60px_-42px_rgba(34,211,238,0.45)]">
            <div className="flex gap-3">
                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.7)]" />
                <p className="text-sm leading-6 text-cyan-50/90">
                    This page does not expose raw access secrets. The token reference is for audit and support only. Access is time-boxed, policy-bound, audit-logged, and revocable based on deal state and access controls.
                </p>
            </div>
        </section>
    )
}

function TerminalStatePanel({
    status,
    terminalState,
    dossierRoute
}: {
    status: TokenStatus
    terminalState: TerminalState
    dossierRoute: string
}) {
    const tone = status === 'Revoked' ? 'rose' : 'amber'
    return (
        <section className={`mt-6 rounded-[24px] border px-5 py-5 ${toneClasses[tone].panel}`}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <StatusBadge label={status} tone={tone} />
                    <h2 className="mt-3 text-xl font-semibold text-white">Token access is {status.toLowerCase()}</h2>
                    <p className={`mt-2 max-w-3xl ${text.bodyStrong}`}>{terminalState.reason}</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <DetailRow label="Timestamp" value={terminalState.timestamp} />
                        <DetailRow label="Trigger source" value={terminalState.triggerSource} />
                    </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                    <Link to={dossierRoute} className={secondaryButtonClass}>
                        Open Deal Dossier
                    </Link>
                    <Link to="/audit-trail" className={secondaryButtonClass}>
                        View Audit Trail
                    </Link>
                    <a href="mailto:support@redoubt.io?subject=Ephemeral%20Token%20support" className={secondaryButtonClass}>
                        Contact Support
                    </a>
                </div>
            </div>
        </section>
    )
}

function Panel({
    eyebrow,
    title,
    description,
    children
}: {
    eyebrow: string
    title: string
    description: string
    children: ReactNode
}) {
    return (
        <section className={panelClass}>
            <div className="relative">
                <div className={text.eyebrow}>{eyebrow}</div>
                <h2 className={`mt-2 ${text.panelTitle}`}>{title}</h2>
                <p className={`mt-2 max-w-3xl ${text.body}`}>{description}</p>
                <div className="mt-5">{children}</div>
            </div>
        </section>
    )
}

function DetailRow({
    label,
    value,
    mono = false,
    badgeClassName
}: {
    label: string
    value: string
    mono?: boolean
    badgeClassName?: string
}) {
    return (
        <div className="rounded-2xl border border-[#22304D]/70 bg-slate-950/35 px-4 py-3">
            <div className={text.eyebrow}>{label}</div>
            {badgeClassName ? (
                <span className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${badgeClassName}`}>
                    {value}
                </span>
            ) : (
                <div className={`mt-2 text-sm font-semibold text-slate-100 ${mono ? 'font-mono' : ''}`}>{value}</div>
            )}
        </div>
    )
}

function PermissionList({ title, items, tone }: { title: string; items: string[]; tone: Tone }) {
    return (
        <div className={cardClass}>
            <div className="flex items-center justify-between gap-3">
                <h3 className={text.itemTitle}>{title}</h3>
                <StatusBadge label={`${items.length}`} tone={tone} />
            </div>
            <ul className="mt-4 space-y-3">
                {items.map(item => (
                    <li key={item} className="flex gap-3 text-sm leading-6 text-slate-300">
                        <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${tone === 'emerald' ? 'bg-emerald-300' : 'bg-rose-300'}`} />
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    )
}

function StatusBadge({ label, tone }: { label: string; tone: Tone }) {
    return (
        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${toneClasses[tone].badge}`}>
            {label}
        </span>
    )
}

function ControlRow({ label, value, tone }: { label: string; value: string; tone: Tone }) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#22304D]/70 bg-slate-950/35 px-4 py-3">
            <div>
                <div className="text-sm font-semibold text-slate-100">{label}</div>
                <div className={`mt-1 ${text.meta}`}>{value}</div>
            </div>
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${tone === 'emerald' ? 'bg-emerald-300' : tone === 'amber' ? 'bg-amber-300' : tone === 'rose' ? 'bg-rose-300' : tone === 'cyan' ? 'bg-cyan-300' : 'bg-slate-400'}`} />
        </div>
    )
}

function TimelineRow({ event, isLast }: { event: TokenLifecycleEvent; isLast: boolean }) {
    const tone = event.state === 'complete' ? 'emerald' : event.state === 'current' ? 'cyan' : event.state === 'blocked' ? 'rose' : 'slate'
    return (
        <div className="relative flex gap-4">
            <div className="flex flex-col items-center">
                <span className={`flex h-8 w-8 items-center justify-center rounded-full border ${toneClasses[tone].marker}`}>
                    <span className="h-2 w-2 rounded-full bg-current" />
                </span>
                {!isLast ? <span className="mt-2 h-full min-h-[28px] w-px bg-[#22304D]/90" /> : null}
            </div>
            <div className="min-w-0 pb-5">
                <div className="flex flex-wrap items-center gap-2">
                    <h3 className={text.itemTitle}>{event.title}</h3>
                    <StatusBadge label={event.state} tone={tone} />
                </div>
                <p className={`mt-1 ${text.body}`}>{event.detail}</p>
                <div className={`mt-2 ${text.metaStrong}`}>{event.timestamp}</div>
            </div>
        </div>
    )
}

function deriveTokenStatus(record: EscrowCheckoutRecord, nowMs: number): TokenStatus {
    if (record.lifecycleState === 'RELEASED_TO_PROVIDER') return 'Revoked'
    if (record.lifecycleState === 'DISPUTE_OPEN' || record.outcomeProtection.credits.status === 'issued') return 'Frozen'
    if (record.credentials.status === 'issued' && record.credentials.expiresAt && Date.parse(record.credentials.expiresAt) <= nowMs) return 'Expired'
    if (record.credentials.status === 'issued' && !hasFutureExpiry(record.credentials.expiresAt, nowMs)) return 'Provisioning'
    if (record.credentials.status !== 'issued' || record.workspace.status !== 'ready') return 'Provisioning'
    return 'Active'
}

function hasFutureExpiry(expiresAt: string | undefined, nowMs: number) {
    if (!expiresAt) return false
    const expiresMs = Date.parse(expiresAt)
    return !Number.isNaN(expiresMs) && expiresMs > nowMs
}

function getSafeTokenReference(record: EscrowCheckoutRecord) {
    return record.credentials.credentialId ?? `PLANNED-${record.escrowId}`
}

function getStatusTone(status: TokenStatus): Tone {
    if (status === 'Active') return 'emerald'
    if (status === 'Provisioning') return 'cyan'
    if (status === 'Frozen') return 'amber'
    if (status === 'Revoked') return 'rose'
    return 'slate'
}

function getStatusDetail(status: TokenStatus) {
    if (status === 'Active') return 'Scoped access is live inside the governed evaluation boundary.'
    if (status === 'Provisioning') return 'Workspace, policy checks, or credential issue is still pending.'
    if (status === 'Frozen') return 'Access is paused while policy, outcome, or dispute controls review the deal.'
    if (status === 'Revoked') return 'The credential has been archived after release or control action.'
    return 'The credential window has closed.'
}

function getFlowStepDetail(index: number) {
    if (index === 0) return 'The governed transaction starts only after escrow funding is captured.'
    if (index === 1) return 'Redoubt prepares the secure workspace that will contain evaluation activity.'
    if (index === 2) return 'Policy, DUA, and deal-state checks gate credential issue.'
    if (index === 3) return 'A safe reference ID and scoped permissions attach to the workspace.'
    if (index === 4) return 'The buyer evaluates protected data within the approved access boundary.'
    return 'Access ends automatically or is restricted when policy or deal state requires it.'
}

function getPolicyState(record: EscrowCheckoutRecord, status: TokenStatus) {
    if (status === 'Frozen' || status === 'Revoked') return 'Restricted'
    if (status === 'Expired') return 'Expired'
    if (!record.dua.accepted || record.workspace.status !== 'ready') return 'Checks pending'
    return 'Policy enforced'
}

function getTerminalState(record: EscrowCheckoutRecord, status: TokenStatus): TerminalState | null {
    if (status === 'Frozen') {
        return {
            reason:
                record.outcomeProtection.credits.reason ??
                record.outcomeProtection.validation.note ??
                'Deal controls froze access because escrow or outcome state requires review.',
            timestamp: formatIsoTimestamp(
                record.outcomeProtection.credits.issuedAt ??
                    record.outcomeProtection.validation.updatedAt ??
                    record.updatedAt,
                'Timestamp unavailable'
            ),
            triggerSource: record.outcomeProtection.credits.status === 'issued' ? 'Outcome engine' : 'Policy control'
        }
    }

    if (status === 'Revoked') {
        return {
            reason: 'Deal has settled and the ephemeral evaluation credential is archived after provider release.',
            timestamp: formatIsoTimestamp(record.outcomeProtection.release?.releasedAt ?? record.updatedAt, 'Timestamp unavailable'),
            triggerSource: 'System'
        }
    }

    return null
}

function buildPolicyControls(record: EscrowCheckoutRecord, status: TokenStatus) {
    const restricted = status === 'Frozen' || status === 'Revoked'
    return [
        { label: 'Policy enforcement', value: restricted ? 'Restricted by deal state' : 'Active and scoped', tone: restricted ? 'amber' : 'emerald' },
        { label: 'Audit logging', value: 'Every governed access event is audit logged', tone: 'emerald' },
        { label: 'Egress review', value: record.configuration.accessMode === 'clean_room' ? 'Blocked for clean-room evaluation' : 'Required before outputs leave', tone: record.configuration.accessMode === 'clean_room' ? 'cyan' : 'amber' },
        { label: 'Watermarking', value: record.configuration.accessMode === 'clean_room' ? 'Workspace trace active' : 'Required for approved output paths', tone: 'cyan' },
        { label: 'Re-identification block', value: 'Blocked by policy', tone: 'emerald' },
        { label: 'Redistribution block', value: 'Blocked by DUA', tone: 'emerald' },
        { label: 'Residency rule', value: 'Bound to deal and workspace policy', tone: 'cyan' },
        { label: 'DUA accepted', value: record.dua.accepted ? `Accepted ${formatIsoTimestamp(record.dua.acceptedAt, '')}`.trim() : 'Pending acceptance', tone: record.dua.accepted ? 'emerald' : 'amber' }
    ] satisfies Array<{ label: string; value: string; tone: Tone }>
}

function buildTimelineEvents(record: EscrowCheckoutRecord, status: TokenStatus, nowMs: number): TokenLifecycleEvent[] {
    const workspaceReady = record.workspace.status === 'ready'
    const credentialsIssued = record.credentials.status === 'issued'
    const engineStatus = record.outcomeProtection.engine.status
    const validationStatus = record.outcomeProtection.validation.status
    const terminalTitle =
        status === 'Expired'
            ? 'Token expired'
            : status === 'Frozen'
              ? 'Token frozen'
              : status === 'Revoked'
                ? 'Token revoked'
                : 'Token closes automatically'

    return [
        {
            title: 'Escrow funded',
            detail: `${record.escrowId} funded for ${record.datasetTitle}.`,
            timestamp: formatIsoTimestamp(record.funding.fundedAt, 'Funding timestamp unavailable'),
            state: 'complete'
        },
        {
            title: 'Workspace provisioned',
            detail: workspaceReady ? `${record.workspace.workspaceName} is ready.` : 'Workspace provisioning is pending.',
            timestamp: formatIsoTimestamp(record.workspace.provisionedAt, 'Pending'),
            state: workspaceReady ? 'complete' : 'current'
        },
        {
            title: 'Ephemeral Token issued',
            detail: credentialsIssued ? 'Safe token reference and scopes were attached to the evaluation workspace.' : 'Scoped credentials have not been issued yet.',
            timestamp: formatIsoTimestamp(record.credentials.issuedAt, 'Pending'),
            state: credentialsIssued ? 'complete' : workspaceReady ? 'current' : 'upcoming'
        },
        {
            title: 'Evaluation started',
            detail: credentialsIssued ? 'Buyer evaluation is tied to the governed workspace and audit trail.' : 'Evaluation starts after credential issue.',
            timestamp: credentialsIssued ? formatIsoTimestamp(record.credentials.issuedAt, 'Pending') : 'Pending',
            state: credentialsIssued ? 'complete' : 'upcoming'
        },
        {
            title: `Outcome engine ${engineStatus.replace('_', ' ')}`,
            detail: record.outcomeProtection.engine.summary,
            timestamp: formatIsoTimestamp(record.outcomeProtection.engine.lastRunAt, credentialsIssued ? 'Awaiting engine run' : 'Pending token issue'),
            state: engineStatus === 'failed' ? 'blocked' : engineStatus === 'passed' ? 'complete' : credentialsIssued ? 'current' : 'upcoming'
        },
        {
            title: validationStatus === 'pending' ? 'Buyer validation pending' : 'Buyer validation submitted',
            detail: record.outcomeProtection.validation.note ?? 'Buyer validation closes the review window before escrow can release.',
            timestamp: formatIsoTimestamp(record.outcomeProtection.validation.updatedAt, 'Pending'),
            state: validationStatus === 'pending' ? (engineStatus === 'passed' ? 'current' : 'upcoming') : validationStatus === 'issue_reported' ? 'blocked' : 'complete'
        },
        {
            title: terminalTitle,
            detail:
                status === 'Active'
                    ? 'Access will close at expiry unless a renewed token is approved.'
                    : status === 'Provisioning'
                      ? 'Terminal token state is pending credential issue.'
                      : getStatusDetail(status),
            timestamp: status === 'Expired' ? formatIsoTimestamp(record.credentials.expiresAt, 'Expired') : getTerminalTimestamp(record, status, nowMs),
            state: status === 'Active' || status === 'Provisioning' ? 'upcoming' : status === 'Frozen' ? 'blocked' : 'complete'
        }
    ]
}

function getTerminalTimestamp(record: EscrowCheckoutRecord, status: TokenStatus, nowMs: number) {
    if (status === 'Frozen') {
        return formatIsoTimestamp(
            record.outcomeProtection.credits.issuedAt ??
                record.outcomeProtection.validation.updatedAt ??
                record.updatedAt,
            'Timestamp unavailable'
        )
    }
    if (status === 'Revoked') return formatIsoTimestamp(record.outcomeProtection.release?.releasedAt ?? record.updatedAt, 'Timestamp unavailable')
    if (status === 'Expired') return formatIsoTimestamp(record.credentials.expiresAt, 'Expired')
    if (record.credentials.expiresAt && Date.parse(record.credentials.expiresAt) > nowMs) return formatIsoTimestamp(record.credentials.expiresAt, 'Scheduled expiry unavailable')
    return 'Pending'
}

function sanitizeScopes(scopes: string[]) {
    const labels = scopes.map(scope => {
        if (scope.startsWith('dataset:')) return 'dataset read'
        if (scope === 'audit:write') return 'audit write'
        if (scope === 'policy:enforced') return 'policy enforced'
        if (scope === 'query:clean-room') return 'query clean-room'
        if (scope === 'query:aggregated') return 'query aggregated'
        if (scope === 'export:aggregated') return 'aggregate export review'
        if (scope === 'export:none') return 'export none'
        if (scope === 'egress:blocked') return 'egress blocked'
        if (scope === 'egress:reviewed') return 'egress reviewed'
        if (scope === 'download:encrypted') return 'encrypted download approved'
        if (scope === 'watermark:required') return 'watermark required'
        if (scope === 'keys:ephemeral') return 'keys ephemeral'
        return 'additional scoped permission'
    })

    return Array.from(new Set(labels))
}

function findDealContextForCheckout(
    record: EscrowCheckoutRecord,
    contexts: DealRouteContext[]
): DealRouteContext | null {
    return (
        contexts.find(context =>
            context.checkoutId === record.id ||
            context.checkoutRecord?.id === record.id ||
            context.dataset?.id === record.datasetId ||
            context.seed.datasetId === record.datasetId
        ) ?? null
    )
}

function formatIsoTimestamp(value: string | undefined, fallback: string) {
    if (!value) return fallback
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return fallback

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
        timeZoneName: 'short'
    }).format(date)
}

function formatTimeRemaining(expiresAt: string | undefined, nowMs: number) {
    if (!expiresAt) return 'Pending issue'
    const expiresMs = Date.parse(expiresAt)
    if (Number.isNaN(expiresMs)) return 'Unknown'
    const remainingMs = expiresMs - nowMs
    if (remainingMs <= 0) return 'Expired'

    const totalMinutes = Math.ceil(remainingMs / 60000)
    const days = Math.floor(totalMinutes / 1440)
    const hours = Math.floor((totalMinutes % 1440) / 60)
    const minutes = totalMinutes % 60

    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(value)
}
