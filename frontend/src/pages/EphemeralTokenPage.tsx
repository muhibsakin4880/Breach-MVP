import {
    startTransition,
    useEffect,
    useMemo,
    useState,
    type ReactNode
} from 'react'
import { Link } from 'react-router-dom'
import {
    dashboardColorTokens,
    dashboardComponentTokens,
    dashboardRadiusTokens,
    dashboardShadowTokens,
    dashboardSpacingTokens,
    dashboardTypographyTokens
} from '../dashboardTokens'
import {
    buildBuyerTokenViewModel,
    findDealContextForCheckout,
    formatTimestamp,
    getBuyerTokenTone,
    selectPrimaryBuyerToken,
    type BuyerTokenPolicyControl,
    type BuyerTokenStatus,
    type BuyerTokenTerminalState,
    type BuyerTokenTimelineEvent,
    type BuyerTokenTone,
    type PolicyControlStatus
} from '../domain/ephemeralToken'
import { loadDealRouteContexts } from '../domain/dealDossier'
import { loadEscrowCheckouts } from '../domain/escrowCheckout'

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

const statusToneClasses: Record<BuyerTokenStatus, string> = {
    Active: 'border-emerald-400/35 bg-emerald-500/10 text-emerald-100',
    Provisioning: 'border-cyan-400/35 bg-cyan-500/10 text-cyan-100',
    Frozen: 'border-amber-400/40 bg-amber-500/10 text-amber-100',
    Expired: 'border-slate-500/40 bg-slate-500/10 text-slate-200',
    Revoked: 'border-rose-400/40 bg-rose-500/10 text-rose-100'
}

const toneClasses: Record<BuyerTokenTone, { badge: string; marker: string; text: string; panel: string }> = {
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

const securityControls = [
    {
        title: 'Time-boxed access',
        detail: 'Credential windows are short-lived and close automatically at expiry.',
        tone: 'cyan'
    },
    {
        title: 'Policy-bound scope',
        detail: 'Scopes follow the approved evaluation workflow, not broad account access.',
        tone: 'emerald'
    },
    {
        title: 'Audit logging',
        detail: 'Workspace activity and control events remain tied to the deal audit trail.',
        tone: 'emerald'
    },
    {
        title: 'Egress review',
        detail: 'Outputs are blocked or routed through review depending on the access mode.',
        tone: 'amber'
    },
    {
        title: 'Raw export control',
        detail: 'Raw data export is blocked unless an explicitly approved encrypted path applies.',
        tone: 'rose'
    },
    {
        title: 'Auto-expiry',
        detail: 'Expired credentials cannot continue workspace access without renewed review.',
        tone: 'cyan'
    },
    {
        title: 'Freeze / revoke controls',
        detail: 'Disputes, outcome failures, or policy events can freeze or revoke access.',
        tone: 'amber'
    },
    {
        title: 'No raw secret exposed',
        detail: 'The UI shows only safe token references for audit and support.',
        tone: 'emerald'
    }
] satisfies Array<{ title: string; detail: string; tone: BuyerTokenTone }>

const tokenFlowSteps = [
    'Escrow is funded',
    'Workspace is provisioned',
    'Policy checks pass',
    'Ephemeral Token is issued',
    'Evaluation becomes active',
    'Token expires, freezes, or revokes based on deal and policy state'
]

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

const emptyNextSteps = [
    'Browse datasets',
    'Build rights quote',
    'Complete escrow checkout',
    'Wait for workspace provisioning',
    'Token issued'
]

const lifecyclePreviewEvents: BuyerTokenTimelineEvent[] = [
    {
        title: 'Escrow funded',
        detail: 'A governed transaction starts after the rights package, DUA, and funding checks complete.',
        timestamp: 'Pending funded checkout',
        state: 'current'
    },
    {
        title: 'Workspace provisioned',
        detail: 'Redoubt prepares the secure workspace for the approved evaluation flow.',
        timestamp: 'After escrow clears',
        state: 'upcoming'
    },
    {
        title: 'Ephemeral Token issued',
        detail: 'A short-lived token reference is attached to the workspace after policy checks pass.',
        timestamp: 'After provisioning and policy checks',
        state: 'upcoming'
    },
    {
        title: 'Evaluation active',
        detail: 'The buyer evaluates the protected dataset inside the governed workspace.',
        timestamp: 'During the approved review window',
        state: 'upcoming'
    },
    {
        title: 'Outcome and validation controls',
        detail: 'Outcome protection, egress review, and buyer validation remain tied to the deal state.',
        timestamp: 'During live evaluation',
        state: 'upcoming'
    },
    {
        title: 'Token closes or renews',
        detail: 'Access expires, freezes, revokes, or re-issues only after deal-state and policy review.',
        timestamp: 'At expiry or control event',
        state: 'upcoming'
    }
]

export default function EphemeralTokenPage() {
    const [nowMs, setNowMs] = useState(() => Date.now())
    const dealContexts = useMemo(() => loadDealRouteContexts(), [])
    const checkoutRecords = useMemo(() => loadEscrowCheckouts(), [])

    useEffect(() => {
        let timeoutId = 0

        const scheduleTick = () => {
            const delay = Math.max(1000, 60000 - (Date.now() % 60000))
            timeoutId = window.setTimeout(() => {
                startTransition(() => {
                    setNowMs(Date.now())
                })
                scheduleTick()
            }, delay)
        }

        scheduleTick()

        return () => {
            window.clearTimeout(timeoutId)
        }
    }, [])

    const primaryToken = useMemo(
        () => selectPrimaryBuyerToken(checkoutRecords, nowMs),
        [checkoutRecords, nowMs]
    )
    const dealContext = useMemo(
        () => (primaryToken ? findDealContextForCheckout(primaryToken.record, dealContexts) : null),
        [dealContexts, primaryToken]
    )
    const viewModel = useMemo(
        () => (primaryToken ? buildBuyerTokenViewModel(primaryToken.record, dealContext, nowMs) : null),
        [dealContext, nowMs, primaryToken]
    )

    return (
        <div className={pageClass}>
            <div className={dashboardComponentTokens['page-background']} />
            <main className={shellClass}>
                <PageHeader
                    status={viewModel?.status}
                    statusTone={viewModel ? getBuyerTokenTone(viewModel.status) : 'cyan'}
                />
                {viewModel ? <TokenDashboard viewModel={viewModel} /> : <EmptyTokenState />}
                <EducationSections />
                <SecurityNotice />
            </main>
        </div>
    )
}

function TokenDashboard({ viewModel }: { viewModel: ReturnType<typeof buildBuyerTokenViewModel> }) {
    const policyTone =
        viewModel.policyState === 'Policy enforced'
            ? 'emerald'
            : viewModel.policyState === 'Expired'
                ? 'slate'
                : 'amber'
    const canOpenWorkspace = viewModel.workspaceReady && viewModel.status === 'Active'

    return (
        <>
            <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Ephemeral Token summary">
                <SummaryCard
                    label="Token status"
                    value={viewModel.status}
                    detail={viewModel.statusDetail}
                    tone={viewModel.tone}
                />
                <SummaryCard
                    label="Time remaining"
                    value={viewModel.timeRemaining}
                    detail={formatTimestamp(viewModel.record.credentials.expiresAt, 'Expiry pending')}
                    tone={viewModel.status === 'Expired' ? 'slate' : viewModel.tone}
                />
                <SummaryCard
                    label="Access mode"
                    value={viewModel.accessModeLabel}
                    detail={viewModel.accessModeDetail}
                    tone="cyan"
                />
                <SummaryCard
                    label="Policy state"
                    value={viewModel.policyState}
                    detail="Deal, DUA, workspace, and egress controls remain linked."
                    tone={policyTone}
                />
            </section>

            {viewModel.terminalState ? (
                <TerminalStatePanel
                    terminalState={viewModel.terminalState}
                    dossierRoute={viewModel.dossierRoute}
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
                            <DetailRow label="Token reference ID" value={viewModel.safeTokenReference} mono />
                            <DetailRow
                                label="Token status"
                                value={viewModel.status}
                                badgeClassName={statusToneClasses[viewModel.status]}
                            />
                            <DetailRow label="Credential status" value={viewModel.credentialStatusLabel} />
                            <DetailRow label="Buyer / evaluator" value={viewModel.record.buyerLabel} mono />
                            <DetailRow label="Dataset" value={viewModel.record.datasetTitle} />
                            <DetailRow label="Workspace" value={viewModel.record.workspace.workspaceName} />
                            <DetailRow label="Workspace status" value={viewModel.workspaceStatusLabel} />
                            <DetailRow
                                label="Issued time"
                                value={formatTimestamp(viewModel.record.credentials.issuedAt, 'Not issued yet')}
                            />
                            <DetailRow
                                label="Expiry time"
                                value={formatTimestamp(
                                    viewModel.record.credentials.expiresAt,
                                    'Pending credential issue'
                                )}
                            />
                            <DetailRow
                                label="TTL"
                                value={`${viewModel.record.credentials.tokenTtlMinutes} minutes`}
                            />
                            <DetailRow label="Access mode" value={viewModel.accessModeLabel} />
                            <DetailRow label="Lifecycle state" value={viewModel.lifecycleLabel} />
                        </div>
                    </Panel>

                    <Panel
                        eyebrow="Permissions and scopes"
                        title="What this token allows and blocks"
                        description="Scopes are displayed as plain-language permissions, not as usable access material."
                    >
                        <div className="grid gap-4 lg:grid-cols-2">
                            <PermissionList title="Allowed" items={viewModel.permissions.allowed} tone="emerald" />
                            <PermissionList title="Blocked" items={viewModel.permissions.blocked} tone="rose" />
                        </div>
                        <div className="mt-5 flex flex-wrap gap-2">
                            {viewModel.permissions.scopeChips.map(scope => (
                                <span
                                    key={scope}
                                    className="rounded-full border border-cyan-400/20 bg-cyan-400/[0.08] px-3 py-1.5 text-xs font-semibold text-cyan-100"
                                >
                                    {scope}
                                </span>
                            ))}
                        </div>
                    </Panel>

                    <Panel
                        eyebrow="Linked transaction"
                        title="Deal and escrow context"
                        description="The token exists because a governed transaction, escrow flow, rights package, and evaluation workflow exist."
                    >
                        <div className="grid gap-3 md:grid-cols-2">
                            <DetailRow label="Checkout / deal reference" value={viewModel.linkedDealReference} mono />
                            <DetailRow label="Escrow reference" value={viewModel.record.escrowId} mono />
                            <DetailRow label="Escrow state" value={viewModel.escrowStateLabel} />
                            <DetailRow label="Provider label" value={viewModel.record.providerLabel} mono />
                            <DetailRow label="Buyer validation window" value={viewModel.validationWindowLabel} />
                            <DetailRow
                                label="Outcome protection state"
                                value={viewModel.outcomeProtectionLabel}
                            />
                            <DetailRow label="Evaluation fee" value={viewModel.evaluationFeeLabel} />
                            <DetailRow label="DUA status" value={viewModel.duaLabel} />
                            <DetailRow label="Release state" value={viewModel.releaseStateLabel} />
                        </div>
                        <p className={`mt-4 ${text.body}`}>{viewModel.outcomeProtectionDetail}</p>
                    </Panel>

                    <Panel
                        eyebrow="Activity timeline"
                        title="Lifecycle timeline"
                        description="A compact trace of escrow funding, workspace readiness, token issue, evaluation, and terminal state."
                    >
                        <div className="space-y-4">
                            {viewModel.timelineEvents.map((event, index) => (
                                <TimelineRow
                                    key={event.title}
                                    event={event}
                                    isLast={index === viewModel.timelineEvents.length - 1}
                                />
                            ))}
                        </div>
                    </Panel>
                </div>

                <aside className="space-y-6 xl:sticky xl:top-24">
                    <Panel
                        eyebrow="Workspace access"
                        title="Secure workspace"
                        description={viewModel.accessModeDetail}
                    >
                        <div className={cardClass}>
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className={text.eyebrow}>Workspace status</div>
                                    <div className="mt-2 text-lg font-semibold text-white">
                                        {viewModel.workspaceStatusLabel}
                                    </div>
                                </div>
                                <StatusBadge
                                    label={viewModel.workspaceStatusLabel}
                                    tone={viewModel.workspaceReady ? 'emerald' : 'amber'}
                                />
                            </div>

                            <div className="mt-4 grid gap-3">
                                <CompactDetailRow
                                    label="Workspace name"
                                    value={viewModel.record.workspace.workspaceName}
                                />
                                <CompactDetailRow
                                    label="Workspace access mode"
                                    value={viewModel.accessModeLabel}
                                />
                                <CompactDetailRow
                                    label="Workspace launch path"
                                    value={viewModel.record.workspace.launchPath}
                                    mono
                                />
                            </div>

                            <p className={`mt-4 ${text.body}`}>
                                {canOpenWorkspace
                                    ? 'Workspace controls are ready. Launching keeps evaluation inside the governed access boundary.'
                                    : viewModel.status === 'Frozen' || viewModel.status === 'Revoked'
                                        ? 'Workspace access is unavailable because this token is no longer usable.'
                                        : viewModel.status === 'Expired'
                                            ? 'Workspace access is closed because the evaluation window has expired.'
                                            : 'Workspace provisioning is pending. Your Ephemeral Token will activate when provisioning and policy checks complete.'}
                            </p>

                            {canOpenWorkspace ? (
                                <Link
                                    to={viewModel.record.workspace.launchPath}
                                    className={`mt-5 w-full ${dashboardComponentTokens['action-button']} ${dashboardRadiusTokens['radius-md']} px-4 py-2.5`}
                                >
                                    Open Secure Workspace
                                </Link>
                            ) : (
                                <button type="button" disabled className={`mt-5 w-full ${disabledButtonClass}`}>
                                    {viewModel.workspaceReady
                                        ? 'Workspace access unavailable'
                                        : 'Workspace provisioning pending'}
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
                            <DetailRow label="Countdown" value={viewModel.timeRemaining} />
                            <DetailRow
                                label="Expiry timestamp"
                                value={formatTimestamp(viewModel.record.credentials.expiresAt, 'Pending issue')}
                            />
                            <DetailRow
                                label="After expiry"
                                value="Workspace access closes automatically"
                            />
                            <DetailRow
                                label="Renewal eligibility"
                                value={viewModel.renewalEligibilityLabel}
                            />
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
                            {viewModel.policyControls.map(control => (
                                <PolicyControlRow key={control.label} control={control} />
                            ))}
                        </div>
                    </Panel>
                </aside>
            </section>
        </>
    )
}

function PageHeader({
    status,
    statusTone = 'cyan'
}: {
    status?: BuyerTokenStatus
    statusTone?: BuyerTokenTone
}) {
    return (
        <header
            className={`${dashboardComponentTokens['hero-surface']} ${dashboardRadiusTokens['radius-lg']} ${dashboardSpacingTokens['hero-padding']}`}
        >
            <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <div>
                    <div className={text.heroEyebrow}>BUYER WORKFLOW · TEMPORARY ACCESS</div>
                    <h1 className={`mt-3 ${text.heroTitle}`}>Ephemeral Token</h1>
                    <p className={`mt-3 max-w-3xl ${text.bodyStrong}`}>
                        Temporary, policy-bound access for secure dataset evaluation.
                    </p>
                    <p className={`mt-3 max-w-4xl ${text.body}`}>
                        Redoubt issues short-lived Ephemeral Tokens after escrow, workspace provisioning, and
                        policy checks clear. Access is scoped to the approved evaluation workflow and can expire,
                        freeze, or revoke automatically.
                    </p>
                </div>
                {status ? (
                    <div className={`rounded-2xl border px-4 py-3 ${toneClasses[statusTone].panel}`}>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Current token state
                        </div>
                        <div className={`mt-2 text-lg font-semibold ${toneClasses[statusTone].text}`}>
                            {status}
                        </div>
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
                        A short-lived evaluation token will appear here after escrow funding, workspace provisioning,
                        and policy checks are complete.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <Link
                            to="/datasets"
                            className={`${dashboardComponentTokens['action-button']} ${dashboardRadiusTokens['radius-md']} px-4 py-2.5`}
                        >
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
                                    <p className={`mt-2 ${text.meta}`}>{getFlowStepDetail(index)}</p>
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
                        <div
                            key={control.title}
                            className={`rounded-2xl border px-4 py-4 ${toneClasses[control.tone].panel}`}
                        >
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

            <Panel
                eyebrow="Lifecycle preview"
                title="What the buyer workflow looks like"
                description="Even before a token exists, the lifecycle remains visible: escrow, workspace readiness, policy checks, issuance, evaluation, and closure all stay governed."
            >
                <div className="space-y-4">
                    {lifecyclePreviewEvents.map((event, index) => (
                        <TimelineRow
                            key={event.title}
                            event={event}
                            isLast={index === lifecyclePreviewEvents.length - 1}
                        />
                    ))}
                </div>
            </Panel>
        </div>
    )
}

function SummaryCard({
    label,
    value,
    detail,
    tone
}: {
    label: string
    value: string
    detail: string
    tone: BuyerTokenTone
}) {
    return (
        <article className={cardClass}>
            <div
                className={`absolute inset-x-0 top-0 h-1 ${
                    tone === 'emerald'
                        ? 'bg-emerald-400/50'
                        : tone === 'amber'
                            ? 'bg-amber-400/50'
                            : tone === 'rose'
                                ? 'bg-rose-400/50'
                                : tone === 'slate'
                                    ? 'bg-slate-500/50'
                                    : 'bg-cyan-400/50'
                }`}
            />
            <div className={text.eyebrow}>{label}</div>
            <div className={`mt-3 text-2xl font-semibold tracking-[-0.04em] ${toneClasses[tone].text}`}>
                {value}
            </div>
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
                    This page does not expose raw access secrets. The token reference is for audit and support only.
                    Access is time-boxed, policy-bound, audit-logged, and revocable based on deal state and access
                    controls.
                </p>
            </div>
        </section>
    )
}

function TerminalStatePanel({
    terminalState,
    dossierRoute
}: {
    terminalState: BuyerTokenTerminalState
    dossierRoute: string
}) {
    const tone = terminalState.status === 'Revoked' ? 'rose' : 'amber'
    return (
        <section className={`mt-6 rounded-[24px] border px-5 py-5 ${toneClasses[tone].panel}`}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <StatusBadge label={terminalState.status} tone={tone} />
                    <h2 className="mt-3 text-xl font-semibold text-white">
                        Token access is {terminalState.status.toLowerCase()}
                    </h2>
                    <p className={`mt-2 max-w-3xl ${text.bodyStrong}`}>
                        This token is no longer usable. Access was restricted because the deal, policy, or evaluation
                        state requires review.
                    </p>
                    <p className={`mt-3 max-w-3xl ${text.body}`}>{terminalState.reason}</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <DetailRow label="Timestamp" value={terminalState.timestamp} />
                        <DetailRow label="Trigger source" value={formatTriggerSource(terminalState.triggerSource)} />
                        <DetailRow label="Next action" value={terminalState.nextAction} />
                    </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                    <Link to={dossierRoute} className={secondaryButtonClass}>
                        Open Deal Dossier
                    </Link>
                    <Link to="/audit-trail" className={secondaryButtonClass}>
                        View Audit Trail
                    </Link>
                    <a
                        href="mailto:support@redoubt.io?subject=Ephemeral%20Token%20support"
                        className={secondaryButtonClass}
                    >
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
                <div className={`mt-2 break-words text-sm font-semibold text-slate-100 ${mono ? 'font-mono' : ''}`}>
                    {value}
                </div>
            )}
        </div>
    )
}

function CompactDetailRow({
    label,
    value,
    mono = false
}: {
    label: string
    value: string
    mono?: boolean
}) {
    return (
        <div className="rounded-2xl border border-[#22304D]/70 bg-slate-950/35 px-4 py-3">
            <div className={text.eyebrow}>{label}</div>
            <div className={`mt-2 break-words text-sm font-semibold text-slate-100 ${mono ? 'font-mono' : ''}`}>
                {value}
            </div>
        </div>
    )
}

function PermissionList({
    title,
    items,
    tone
}: {
    title: string
    items: string[]
    tone: BuyerTokenTone
}) {
    return (
        <div className={cardClass}>
            <div className="flex items-center justify-between gap-3">
                <h3 className={text.itemTitle}>{title}</h3>
                <StatusBadge label={`${items.length}`} tone={tone} />
            </div>
            <ul className="mt-4 space-y-3">
                {items.map(item => (
                    <li key={item} className="flex gap-3 text-sm leading-6 text-slate-300">
                        <span
                            className={`mt-2 h-2 w-2 shrink-0 rounded-full ${
                                tone === 'emerald' ? 'bg-emerald-300' : 'bg-rose-300'
                            }`}
                        />
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    )
}

function StatusBadge({ label, tone }: { label: string; tone: BuyerTokenTone }) {
    return (
        <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${toneClasses[tone].badge}`}
        >
            {label}
        </span>
    )
}

function PolicyControlRow({ control }: { control: BuyerTokenPolicyControl }) {
    return (
        <div className="rounded-2xl border border-[#22304D]/70 bg-slate-950/35 px-4 py-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <div className="text-sm font-semibold text-slate-100">{control.label}</div>
                    <div className={`mt-1 ${text.meta}`}>{control.detail}</div>
                </div>
                <PolicyStatusBadge status={control.status} />
            </div>
        </div>
    )
}

function PolicyStatusBadge({ status }: { status: PolicyControlStatus }) {
    const tone =
        status === 'Active'
            ? 'emerald'
            : status === 'Required' || status === 'Pending'
                ? 'amber'
                : status === 'Blocked'
                    ? 'rose'
                    : 'slate'

    return <StatusBadge label={status} tone={tone} />
}

function TimelineRow({
    event,
    isLast
}: {
    event: BuyerTokenTimelineEvent
    isLast: boolean
}) {
    const tone =
        event.state === 'complete'
            ? 'emerald'
            : event.state === 'current'
                ? 'cyan'
                : event.state === 'blocked'
                    ? 'rose'
                    : 'slate'

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

function getFlowStepDetail(index: number) {
    if (index === 0) return 'The governed transaction starts only after escrow funding is captured.'
    if (index === 1) return 'Redoubt prepares the secure workspace that will contain evaluation activity.'
    if (index === 2) return 'Policy, DUA, and deal-state checks gate credential issue.'
    if (index === 3) return 'A safe reference ID and scoped permissions attach to the workspace.'
    if (index === 4) return 'The buyer evaluates protected data within the approved access boundary.'
    return 'Access ends automatically or is restricted when policy or deal state requires it.'
}

function formatTriggerSource(source: BuyerTokenTerminalState['triggerSource']) {
    if (source === 'outcome engine') return 'Outcome engine'
    if (source === 'policy control') return 'Policy control'
    if (source === 'dispute state') return 'Dispute state'
    if (source === 'admin') return 'Admin'
    return 'System'
}
