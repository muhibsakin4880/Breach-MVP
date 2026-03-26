import { useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import SecurityAuditTimeline from '../../components/SecurityAuditTimeline'
import ContractHealthPanel from '../../components/ContractHealthPanel'
import ExecutionRunbookPanel from '../../components/ExecutionRunbookPanel'
import PolicyAttestationPanel from '../../components/PolicyAttestationPanel'
import DecisionGatePanel from '../../components/DecisionGatePanel'
import AlertCenterPanel from '../../components/AlertCenterPanel'
import { useAuth } from '../../contexts/AuthContext'
import { CONTRACT_STATE_LABELS, type ContractLifecycleState } from '../../domain/accessContract'
import { canPerformAdminEscrowAction } from '../../domain/actionGuardrails'

type SummaryTone = 'cyan' | 'emerald' | 'amber' | 'rose'
type TransactionStatus = Extract<
    ContractLifecycleState,
    'ACCESS_ACTIVE' | 'FUNDS_HELD' | 'RELEASE_PENDING' | 'DISPUTE_OPEN' | 'RELEASED_TO_PROVIDER'
>
type FilterTab = 'all' | 'active' | 'fundsHeld' | 'pendingRelease' | 'disputed' | 'released'
type ActionTone = 'blue' | 'green' | 'amber' | 'red' | 'slate'
type WorkspaceTab = 'operations' | 'disputes' | 'governance' | 'reporting'
type GovernanceTab = 'policy' | 'audit' | 'health'
type Sector = 'Healthcare' | 'Finance' | 'Government'
type RiskLevel = 'low' | 'medium' | 'high'
type DisputeSeverity = 'high' | 'medium'
type ArtifactStatus = 'Ready' | 'Scheduled' | 'Attention'

type SummaryCard = {
    label: string
    value: string
    detail: string
    tone: SummaryTone
}

type TransactionRow = {
    escId: string
    buyer: string
    provider: string
    dataset: string
    sector: Sector
    amount: number
    status: TransactionStatus
    window: string
    owner: string
    risk: RiskLevel
    policyHold: string
    requiredAction: string
    releaseTrigger?: string
    releaseReadiness?: string
    actionLabel: string
    actionTone: ActionTone
    lastEvent: string
    controls: string[]
}

type DisputeCard = {
    escId: string
    dataset: string
    raisedBy: string
    reason: string
    amount: number
    raisedAt: string
    evidenceStatus: string
    owner: string
    severity: DisputeSeverity
    policyConcern: string
    nextDeadline: string
    recommendedPath: string
}

type MonthlyFinancialRow = {
    month: string
    gmv: number
    platformFee: number
    payouts: number
    refunds: number
    net: number
}

type ReportArtifact = {
    id: string
    name: string
    description: string
    cadence: string
    lastRun: string
    owner: string
    status: ArtifactStatus
}

const transactionRows: TransactionRow[] = [
    {
        escId: 'ESC-2026-001',
        buyer: 'part_anon_042',
        provider: 'anon_provider_003',
        dataset: 'Multi-Region Oncology Outcomes',
        sector: 'Healthcare',
        amount: 245000,
        status: 'ACCESS_ACTIVE',
        window: '47h 23m',
        owner: 'settlement_ops',
        risk: 'medium',
        policyHold: 'Usage session active under restricted export policy',
        requiredAction: 'Monitor access session until release window opens',
        actionLabel: 'Open Review',
        actionTone: 'blue',
        lastEvent: 'Buyer session extended after provider confirmed enclave delivery.',
        controls: ['Zero-egress mode', 'Watermarking enabled', 'Anomaly scan live']
    },
    {
        escId: 'ESC-2026-002',
        buyer: 'part_anon_017',
        provider: 'anon_provider_007',
        dataset: 'Consolidated Market Tick Archive',
        sector: 'Finance',
        amount: 182000,
        status: 'RELEASE_PENDING',
        window: '02h 14m',
        owner: 'admin_001',
        risk: 'high',
        policyHold: 'Dual approval required before provider payout',
        requiredAction: 'Approve release or continue hold before timer expires',
        releaseTrigger: 'Buyer attested delivery completion',
        releaseReadiness: 'Signer 1 of 2 recorded · evidence packet attached',
        actionLabel: 'Open Review',
        actionTone: 'green',
        lastEvent: 'Buyer attestation and access logs passed automated validation.',
        controls: ['Dual-admin release', 'Receipt hash staged', 'Payout channel verified']
    },
    {
        escId: 'ESC-2026-003',
        buyer: 'part_anon_089',
        provider: 'anon_provider_012',
        dataset: 'Payer Claims Benchmark Delta',
        sector: 'Healthcare',
        amount: 410000,
        status: 'DISPUTE_OPEN',
        window: 'Frozen',
        owner: 'dispute_admin_01',
        risk: 'high',
        policyHold: 'Dispute freeze applied to settlement channel',
        requiredAction: 'Issue refund or release decision after evidence review',
        actionLabel: 'Resolve Case',
        actionTone: 'red',
        lastEvent: 'Schema mismatch challenge logged and payout freeze confirmed.',
        controls: ['Settlement freeze', 'Evidence chain locked', 'Dual decision required']
    },
    {
        escId: 'ESC-2026-004',
        buyer: 'part_anon_031',
        provider: 'anon_provider_005',
        dataset: 'Consumer Credit Risk Signals',
        sector: 'Finance',
        amount: 96000,
        status: 'FUNDS_HELD',
        window: '23h 45m',
        owner: 'settlement_ops',
        risk: 'medium',
        policyHold: 'Funding confirmed, buyer validation window still open',
        requiredAction: 'Track access completion and prepare next release check',
        actionLabel: 'Open Review',
        actionTone: 'blue',
        lastEvent: 'Buyer funded escrow and provider delivery package cleared malware scan.',
        controls: ['Funds segregated', 'Buyer confirmation window', 'Auto-release disabled']
    },
    {
        escId: 'ESC-2026-005',
        buyer: 'part_anon_056',
        provider: 'anon_provider_009',
        dataset: 'Genomics Validation Cohort',
        sector: 'Healthcare',
        amount: 138000,
        status: 'RELEASE_PENDING',
        window: '00h 47m',
        owner: 'admin_003',
        risk: 'high',
        policyHold: 'Auto-release blocked pending final compliance review',
        requiredAction: 'Clear release controls before timer breaches SLA',
        releaseTrigger: 'Window expired',
        releaseReadiness: 'Evidence packet ready · compliance approval missing',
        actionLabel: 'Open Review',
        actionTone: 'amber',
        lastEvent: 'Timer expired but payout remains on hold due to policy checkpoint.',
        controls: ['Compliance sign-off', 'Release receipt draft', 'Counterparty watchlist clear']
    },
    {
        escId: 'ESC-2026-006',
        buyer: 'part_anon_008',
        provider: 'anon_provider_002',
        dataset: 'Border Movement Ledger',
        sector: 'Government',
        amount: 72000,
        status: 'DISPUTE_OPEN',
        window: 'Frozen',
        owner: 'dispute_admin_02',
        risk: 'medium',
        policyHold: 'Evidence request outstanding with buyer',
        requiredAction: 'Collect missing evidence or dismiss dispute',
        actionLabel: 'Resolve Case',
        actionTone: 'red',
        lastEvent: 'Quality challenge filed and buyer asked to upload supporting artifacts.',
        controls: ['Case freeze', 'Evidence due timer', 'Manual payout path only']
    },
    {
        escId: 'ESC-2026-007',
        buyer: 'part_anon_021',
        provider: 'anon_provider_014',
        dataset: 'Healthcare IoT Device Telemetry',
        sector: 'Healthcare',
        amount: 520000,
        status: 'RELEASED_TO_PROVIDER',
        window: 'Completed',
        owner: 'settlement_engine',
        risk: 'low',
        policyHold: 'Receipt issued and archived',
        requiredAction: 'Review settlement receipt if finance requests evidence',
        actionLabel: 'View Receipt',
        actionTone: 'slate',
        lastEvent: 'Provider payout executed and immutable receipt written to audit log.',
        controls: ['Receipt stored', 'Counterparty notified', 'Reconciliation complete']
    },
    {
        escId: 'ESC-2026-008',
        buyer: 'part_anon_063',
        provider: 'anon_provider_008',
        dataset: 'Municipal Procurement Trace',
        sector: 'Government',
        amount: 214000,
        status: 'ACCESS_ACTIVE',
        window: '71h 12m',
        owner: 'settlement_ops',
        risk: 'low',
        policyHold: 'Restricted export route enforced for current session',
        requiredAction: 'Monitor policy exceptions and timer drift',
        actionLabel: 'Open Review',
        actionTone: 'blue',
        lastEvent: 'Session remains clean after overnight anomaly scan sweep.',
        controls: ['Restricted export route', 'Admin alerting', 'Immutable session log']
    }
]

const disputeCards: DisputeCard[] = [
    {
        escId: 'ESC-2026-003',
        dataset: 'Payer Claims Benchmark Delta',
        raisedBy: 'part_anon_089 (Buyer)',
        reason: 'Delivered schema does not match the contracted specification. Buyer expected 15 mandatory fields and received 8.',
        amount: 410000,
        raisedAt: '2026-03-22 14:23:11',
        evidenceStatus: 'Complete',
        owner: 'dispute_admin_01',
        severity: 'high',
        policyConcern: 'Provider may have breached the signed delivery commitment and release eligibility gate.',
        nextDeadline: 'Decision due in 06h 10m',
        recommendedPath: 'Refund buyer unless provider produces a signed reconciliation package and corrected field map.'
    },
    {
        escId: 'ESC-2026-006',
        dataset: 'Border Movement Ledger',
        raisedBy: 'part_anon_008 (Buyer)',
        reason: 'Buyer claims the delivered file quality is below the advertised confidence score and has not uploaded full validation evidence yet.',
        amount: 72000,
        raisedAt: '2026-03-21 09:14:44',
        evidenceStatus: 'Pending buyer upload',
        owner: 'dispute_admin_02',
        severity: 'medium',
        policyConcern: 'Evidence chain is incomplete, so the case should stay frozen until buyer artifacts arrive or the claim is dismissed.',
        nextDeadline: 'Buyer evidence due in 18h 40m',
        recommendedPath: 'Maintain freeze, request missing buyer proof, then re-evaluate for dismissal or partial refund.'
    }
]

const monthlyFinancialRows: MonthlyFinancialRow[] = [
    { month: 'March 2026', gmv: 2810000, platformFee: 281000, payouts: 1920000, refunds: 122000, net: 159000 },
    { month: 'February 2026', gmv: 2430000, platformFee: 243000, payouts: 1715000, refunds: 94000, net: 149000 },
    { month: 'January 2026', gmv: 2120000, platformFee: 212000, payouts: 1490000, refunds: 78000, net: 134000 },
    { month: 'December 2025', gmv: 1880000, platformFee: 188000, payouts: 1324000, refunds: 61000, net: 127000 }
]

const reportingArtifacts: ReportArtifact[] = [
    {
        id: 'artifact-1',
        name: 'Settlement register',
        description: 'Full escrow lifecycle register with release and refund receipts.',
        cadence: 'Daily 01:15 UTC',
        lastRun: '2026-03-26 01:15 UTC',
        owner: 'finance_ops',
        status: 'Ready'
    },
    {
        id: 'artifact-2',
        name: 'Dual-approval decision log',
        description: 'Signer matrix and approval rationale for each payout event.',
        cadence: 'Real-time export',
        lastRun: '2026-03-26 01:08 UTC',
        owner: 'compliance_admin',
        status: 'Ready'
    },
    {
        id: 'artifact-3',
        name: 'Dispute evidence packet',
        description: 'Case notes, evidence references, and final resolution chain for open disputes.',
        cadence: 'On demand',
        lastRun: 'Awaiting buyer upload for ESC-2026-006',
        owner: 'dispute_admin_02',
        status: 'Attention'
    },
    {
        id: 'artifact-4',
        name: 'Monthly finance pack',
        description: 'GMV, fees, refunds, and reconciliation summary for controller review.',
        cadence: 'Monthly',
        lastRun: 'Next scheduled 2026-04-01 09:00 UTC',
        owner: 'finance_ops',
        status: 'Scheduled'
    }
]

const filterTabs: Array<{ key: FilterTab; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'fundsHeld', label: 'Funds Held' },
    { key: 'pendingRelease', label: 'Pending Release' },
    { key: 'disputed', label: 'Disputed' },
    { key: 'released', label: 'Released' }
]

const workspaceTabs: Array<{ key: WorkspaceTab; label: string; hint: string }> = [
    { key: 'operations', label: 'Operations', hint: 'Action queue, releases awaiting sign-off, and the currently focused contract.' },
    { key: 'disputes', label: 'Disputes', hint: 'Case triage, evidence completeness, and resolution decisions.' },
    { key: 'governance', label: 'Governance', hint: 'Policy checks, audit evidence, and contract health for the focused escrow.' },
    { key: 'reporting', label: 'Reporting', hint: 'Financial summaries and exportable settlement evidence.' }
]

const governanceTabs: Array<{ key: GovernanceTab; label: string }> = [
    { key: 'policy', label: 'Policy Checks' },
    { key: 'audit', label: 'Audit Trail' },
    { key: 'health', label: 'Operational Health' }
]

const summaryValueClasses: Record<SummaryTone, string> = {
    cyan: 'text-cyan-300',
    emerald: 'text-emerald-300',
    amber: 'text-amber-300',
    rose: 'text-rose-300'
}

const summaryAccentClasses: Record<SummaryTone, string> = {
    cyan: 'border-cyan-500/35 bg-cyan-500/10',
    emerald: 'border-emerald-500/35 bg-emerald-500/10',
    amber: 'border-amber-500/35 bg-amber-500/10',
    rose: 'border-rose-500/35 bg-rose-500/10'
}

const statusBadgeClasses: Record<TransactionStatus, string> = {
    ACCESS_ACTIVE: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200',
    FUNDS_HELD: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
    RELEASE_PENDING: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-200',
    DISPUTE_OPEN: 'border-rose-500/40 bg-rose-500/10 text-rose-200',
    RELEASED_TO_PROVIDER: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
}

const riskBadgeClasses: Record<RiskLevel, string> = {
    low: 'border-emerald-500/35 bg-emerald-500/10 text-emerald-200',
    medium: 'border-amber-500/35 bg-amber-500/10 text-amber-200',
    high: 'border-rose-500/35 bg-rose-500/10 text-rose-200'
}

const actionButtonClasses: Record<ActionTone, string> = {
    blue: 'border-cyan-500/50 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/18',
    green: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/18',
    amber: 'border-amber-500/50 bg-amber-500/10 text-amber-200 hover:bg-amber-500/18',
    red: 'border-rose-500/50 bg-rose-500/10 text-rose-200 hover:bg-rose-500/18',
    slate: 'border-slate-600/70 bg-slate-800/60 text-slate-200 hover:bg-slate-700/70'
}

const disputeSeverityClasses: Record<DisputeSeverity, string> = {
    high: 'border-rose-500/40 bg-rose-500/10 text-rose-200',
    medium: 'border-amber-500/40 bg-amber-500/10 text-amber-200'
}

const artifactStatusClasses: Record<ArtifactStatus, string> = {
    Ready: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
    Scheduled: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200',
    Attention: 'border-amber-500/40 bg-amber-500/10 text-amber-200'
}

const disabledActionClass =
    'cursor-not-allowed border-slate-700/80 bg-slate-900/60 text-slate-500 hover:bg-slate-900/60'

const panelClass =
    'rounded-2xl border border-slate-800/70 bg-slate-900/60 shadow-2xl shadow-black/20'

const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
})

function getTransactionsForFilter(filter: FilterTab) {
    if (filter === 'all') return transactionRows
    if (filter === 'active') return transactionRows.filter(row => row.status === 'ACCESS_ACTIVE')
    if (filter === 'fundsHeld') return transactionRows.filter(row => row.status === 'FUNDS_HELD')
    if (filter === 'pendingRelease') return transactionRows.filter(row => row.status === 'RELEASE_PENDING')
    if (filter === 'disputed') return transactionRows.filter(row => row.status === 'DISPUTE_OPEN')
    return transactionRows.filter(row => row.status === 'RELEASED_TO_PROVIDER')
}

function formatCurrency(value: number) {
    return currencyFormatter.format(value)
}

export default function EscrowVaultPage() {
    const { isAuthenticated } = useAuth()
    const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceTab>('operations')
    const [activeFilter, setActiveFilter] = useState<FilterTab>('all')
    const [activeGovernanceTab, setActiveGovernanceTab] = useState<GovernanceTab>('policy')
    const [selectedEscrowId, setSelectedEscrowId] = useState(transactionRows[0].escId)
    const [selectedDisputeId, setSelectedDisputeId] = useState(disputeCards[0].escId)

    const filteredTransactions = useMemo(() => getTransactionsForFilter(activeFilter), [activeFilter])
    const pendingReleaseRows = useMemo(
        () => transactionRows.filter(row => row.status === 'RELEASE_PENDING'),
        []
    )
    const currentTimestamp = useMemo(
        () => `${new Date().toISOString().replace('T', ' ').substring(0, 19)} UTC`,
        []
    )

    const selectedTransaction = useMemo(
        () =>
            filteredTransactions.find(row => row.escId === selectedEscrowId) ??
            transactionRows.find(row => row.escId === selectedEscrowId) ??
            filteredTransactions[0] ??
            transactionRows[0],
        [filteredTransactions, selectedEscrowId]
    )

    const selectedDispute = useMemo(
        () => disputeCards.find(dispute => dispute.escId === selectedDisputeId) ?? disputeCards[0],
        [selectedDisputeId]
    )

    const selectedDisputeState = useMemo<TransactionStatus>(
        () =>
            transactionRows.find(row => row.escId === selectedDispute.escId)?.status ??
            'DISPUTE_OPEN',
        [selectedDispute]
    )

    const fundsUnderControl = useMemo(
        () =>
            transactionRows
                .filter(row => row.status !== 'RELEASED_TO_PROVIDER')
                .reduce((sum, row) => sum + row.amount, 0),
        []
    )
    const pendingReleaseAmount = useMemo(
        () => pendingReleaseRows.reduce((sum, row) => sum + row.amount, 0),
        [pendingReleaseRows]
    )
    const disputedAmount = useMemo(
        () =>
            transactionRows
                .filter(row => row.status === 'DISPUTE_OPEN')
                .reduce((sum, row) => sum + row.amount, 0),
        []
    )
    const settledThisMonthAmount = useMemo(
        () =>
            transactionRows
                .filter(row => row.status === 'RELEASED_TO_PROVIDER')
                .reduce((sum, row) => sum + row.amount, 0),
        []
    )
    const missingEvidenceCount = useMemo(
        () => disputeCards.filter(dispute => dispute.evidenceStatus !== 'Complete').length,
        []
    )
    const highRiskCount = useMemo(
        () => transactionRows.filter(row => row.risk === 'high').length,
        []
    )
    const focusContracts = useMemo(
        () =>
            transactionRows.filter(
                row => row.status === 'RELEASE_PENDING' || row.status === 'DISPUTE_OPEN' || row.risk === 'high'
            ),
        []
    )

    const summaryCards: SummaryCard[] = useMemo(
        () => [
            {
                label: 'Funds Under Platform Control',
                value: formatCurrency(fundsUnderControl),
                detail: 'Escrows still held, active, pending release, or frozen in dispute.',
                tone: 'cyan'
            },
            {
                label: 'Releases Awaiting Approval',
                value: `${pendingReleaseRows.length}`,
                detail: `${formatCurrency(pendingReleaseAmount)} pending manual approval or policy clearance.`,
                tone: 'emerald'
            },
            {
                label: 'Open Disputes',
                value: `${disputeCards.length}`,
                detail: `${formatCurrency(disputedAmount)} is frozen while cases are reviewed.`,
                tone: 'rose'
            },
            {
                label: 'Settled This Month',
                value: formatCurrency(settledThisMonthAmount),
                detail: 'Closed payouts with receipts already written to the audit chain.',
                tone: 'amber'
            }
        ],
        [disputeCards.length, disputedAmount, fundsUnderControl, pendingReleaseAmount, pendingReleaseRows.length, settledThisMonthAmount]
    )

    const attentionItems = useMemo(
        () => [
            {
                title: 'Immediate release review',
                value: `${pendingReleaseRows.length} contract(s)`,
                detail: 'Both pending releases require human sign-off before any payout can proceed.'
            },
            {
                title: 'Evidence gap',
                value: `${missingEvidenceCount} case`,
                detail: 'One dispute is frozen until the buyer uploads supporting validation evidence.'
            },
            {
                title: 'High-risk workload',
                value: `${highRiskCount} contract(s)`,
                detail: 'Priority queue items are concentrated in pending releases and disputed settlements.'
            }
        ],
        [highRiskCount, missingEvidenceCount, pendingReleaseRows.length]
    )

    const releaseAllPendingGuardrail = useMemo(
        () => canPerformAdminEscrowAction('release_all_pending', 'RELEASE_PENDING', pendingReleaseRows.length),
        [pendingReleaseRows.length]
    )

    const resolveRefundGuardrail = useMemo(
        () => canPerformAdminEscrowAction('resolve_refund', selectedDisputeState),
        [selectedDisputeState]
    )
    const resolveReleaseGuardrail = useMemo(
        () => canPerformAdminEscrowAction('resolve_release', selectedDisputeState),
        [selectedDisputeState]
    )
    const escalateLegalGuardrail = useMemo(
        () => canPerformAdminEscrowAction('escalate_legal', selectedDisputeState),
        [selectedDisputeState]
    )

    const reportingIndicators = useMemo(
        () => [
            {
                label: 'Manual release holds',
                value: `${pendingReleaseRows.length}`,
                detail: 'Contracts blocked from auto-settlement by policy or approver requirements.'
            },
            {
                label: 'Dispute rate',
                value: `${Math.round((disputeCards.length / transactionRows.length) * 100)}%`,
                detail: 'Share of monitored contracts currently frozen in a dispute state.'
            },
            {
                label: 'Average release review',
                value: '4h 18m',
                detail: 'Median human review time for release-pending contracts this month.'
            },
            {
                label: 'Missing evidence',
                value: `${missingEvidenceCount}`,
                detail: 'Open dispute cases still waiting on buyer or provider artifacts.'
            }
        ],
        [disputeCards.length, missingEvidenceCount, pendingReleaseRows.length]
    )

    const handleFilterChange = (filter: FilterTab) => {
        setActiveFilter(filter)
        const nextRows = getTransactionsForFilter(filter)
        if (nextRows[0]) {
            setSelectedEscrowId(nextRows[0].escId)
        }
    }

    const handleSelectDispute = (escId: string) => {
        setSelectedDisputeId(escId)
        setSelectedEscrowId(escId)
    }

    if (!isAuthenticated) return <Navigate to="/admin/login" replace />

    return (
        <AdminLayout title="ESCROW OPERATIONS" subtitle="SETTLEMENT CONTROL & EVIDENCE">
            <div className="space-y-6">
                <section className={`${panelClass} overflow-hidden p-6`}>
                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                        <div className="max-w-3xl">
                            <span className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-200">
                                Settlement Operations
                            </span>
                            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-100">Escrow Operations</h1>
                            <p className="mt-2 text-sm text-slate-400">
                                Release approvals, dispute handling, and control evidence across regulated data access contracts.
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Control Posture</p>
                            <div className="mt-4 space-y-3">
                                <StatusRow
                                    label="Release policy"
                                    value="Dual approval enforced"
                                    detail="Pending releases cannot settle without recorded admin sign-off."
                                />
                                <StatusRow
                                    label="Open exceptions"
                                    value={`${disputeCards.length} case(s)`}
                                    detail="Dispute freezes and evidence gaps are routed to manual review."
                                />
                                <StatusRow
                                    label="Evidence cadence"
                                    value="Daily settlement export"
                                    detail={`Last control sync ${currentTimestamp}`}
                                />
                            </div>
                            <button
                                onClick={() => setActiveWorkspace(disputeCards.length > 0 ? 'disputes' : 'operations')}
                                className="mt-4 w-full rounded-md border border-cyan-500/60 bg-cyan-500/15 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan-200 transition-colors hover:bg-cyan-500/25"
                            >
                                Review Exceptions
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {summaryCards.map(card => (
                            <article
                                key={card.label}
                                className={`rounded-xl border p-4 ${summaryAccentClasses[card.tone]}`}
                            >
                                <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">{card.label}</p>
                                <p className={`mt-2 text-2xl font-semibold ${summaryValueClasses[card.tone]}`}>{card.value}</p>
                                <p className="mt-2 text-xs leading-relaxed text-slate-400">{card.detail}</p>
                            </article>
                        ))}
                    </div>

                    <div className="mt-6 rounded-xl border border-slate-800/80 bg-slate-950/40 p-4">
                        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Operational Attention</p>
                                <p className="mt-1 text-sm text-slate-300">
                                    Items requiring human review before funds move or cases close.
                                </p>
                            </div>
                            <span className="text-[11px] font-mono text-slate-500">Last control sync {currentTimestamp}</span>
                        </div>
                        <div className="mt-3 grid gap-3 md:grid-cols-3">
                            {attentionItems.map(item => (
                                <article key={item.title} className="rounded-lg border border-slate-800/70 bg-slate-900/55 p-3">
                                    <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">{item.title}</p>
                                    <p className="mt-1 text-lg font-semibold text-slate-100">{item.value}</p>
                                    <p className="mt-1 text-xs text-slate-400">{item.detail}</p>
                                </article>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 border-t border-slate-800/70 pt-4">
                        <div className="flex flex-wrap gap-2">
                            {workspaceTabs.map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveWorkspace(tab.key)}
                                    className={`rounded-md border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                                        activeWorkspace === tab.key
                                            ? 'border-cyan-500/60 bg-cyan-500/15 text-cyan-200'
                                            : 'border-slate-700/70 bg-slate-900/50 text-slate-400 hover:border-slate-600/80 hover:text-slate-200'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                            {workspaceTabs.find(tab => tab.key === activeWorkspace)?.hint}
                        </p>
                    </div>
                </section>

                {activeWorkspace === 'operations' && (
                    <section className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_380px]">
                        <div className="space-y-6">
                            <section className={panelClass}>
                                <div className="border-b border-slate-800/70 px-5 py-4">
                                    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                                        <div>
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Action Queue</p>
                                            <h2 className="mt-1 text-lg font-semibold text-slate-100">Contracts requiring review</h2>
                                            <p className="mt-1 text-sm text-slate-400">
                                                Prioritize release decisions, frozen disputes, and active contracts with policy risk.
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {filterTabs.map(tab => (
                                                <button
                                                    key={tab.key}
                                                    onClick={() => handleFilterChange(tab.key)}
                                                    className={`rounded-md border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                                                        activeFilter === tab.key
                                                            ? 'border-cyan-500/60 bg-cyan-500/15 text-cyan-200'
                                                            : 'border-slate-700/70 bg-slate-900/50 text-slate-400 hover:border-slate-600/80 hover:text-slate-200'
                                                    }`}
                                                >
                                                    {tab.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[1220px]">
                                        <thead className="bg-slate-950/45">
                                            <tr className="text-[9px] font-semibold uppercase tracking-[0.13em] text-slate-500">
                                                <th className="px-4 py-3 text-left">Contract</th>
                                                <th className="px-4 py-3 text-left">Dataset</th>
                                                <th className="px-4 py-3 text-left">Amount</th>
                                                <th className="px-4 py-3 text-left">Status</th>
                                                <th className="px-4 py-3 text-left">Policy Checkpoint</th>
                                                <th className="px-4 py-3 text-left">Owner</th>
                                                <th className="px-4 py-3 text-left">Due</th>
                                                <th className="px-4 py-3 text-left">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/50 text-[11px] text-slate-200">
                                            {filteredTransactions.map(row => (
                                                <tr
                                                    key={row.escId}
                                                    onClick={() => setSelectedEscrowId(row.escId)}
                                                    className={`cursor-pointer transition-colors ${
                                                        selectedTransaction.escId === row.escId
                                                            ? 'bg-cyan-500/8'
                                                            : 'hover:bg-slate-800/25'
                                                    }`}
                                                >
                                                    <td className="px-4 py-3">
                                                        <div className="space-y-1">
                                                            <p className="font-mono text-cyan-300">{row.escId}</p>
                                                            <p className="text-[10px] uppercase tracking-[0.1em] text-slate-500">{row.sector}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <p className="font-medium text-slate-100">{row.dataset}</p>
                                                        <p className="mt-1 text-[10px] text-slate-500">{row.requiredAction}</p>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap font-mono text-slate-100">
                                                        {formatCurrency(row.amount)}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <div className="flex flex-col gap-1">
                                                            <span className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-wide ${statusBadgeClasses[row.status]}`}>
                                                                {CONTRACT_STATE_LABELS[row.status]}
                                                            </span>
                                                            <span className={`inline-flex w-fit rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${riskBadgeClasses[row.risk]}`}>
                                                                {row.risk} risk
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-300">{row.policyHold}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap font-mono text-slate-300">{row.owner}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.window}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <button
                                                            onClick={event => {
                                                                event.stopPropagation()
                                                                setSelectedEscrowId(row.escId)
                                                            }}
                                                            className={`rounded-md border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors ${actionButtonClasses[row.actionTone]}`}
                                                        >
                                                            {row.actionLabel}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            <section className={panelClass}>
                                <div className="border-b border-slate-800/70 px-5 py-4">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Release Queue</p>
                                            <h2 className="mt-1 text-lg font-semibold text-slate-100">Pending payouts awaiting admin release</h2>
                                            <p className="mt-1 text-sm text-slate-400">
                                                Move only the contracts that have met policy, signer, and evidence requirements.
                                            </p>
                                        </div>
                                        <div className="sm:text-right">
                                            <button
                                                disabled={!releaseAllPendingGuardrail.allowed}
                                                className={`rounded-md border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                                                    releaseAllPendingGuardrail.allowed ? actionButtonClasses.green : disabledActionClass
                                                }`}
                                            >
                                                Approve All Ready Releases
                                            </button>
                                            <p className={`mt-2 text-[10px] ${releaseAllPendingGuardrail.allowed ? 'text-slate-500' : 'text-amber-300'}`}>
                                                {releaseAllPendingGuardrail.allowed
                                                    ? `${pendingReleaseRows.length} contract(s) can move once signers complete review.`
                                                    : releaseAllPendingGuardrail.reason}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[980px]">
                                        <thead className="bg-slate-950/45">
                                            <tr className="text-[9px] font-semibold uppercase tracking-[0.13em] text-slate-500">
                                                <th className="px-4 py-3 text-left">Contract</th>
                                                <th className="px-4 py-3 text-left">Dataset</th>
                                                <th className="px-4 py-3 text-left">Amount</th>
                                                <th className="px-4 py-3 text-left">Trigger</th>
                                                <th className="px-4 py-3 text-left">Readiness</th>
                                                <th className="px-4 py-3 text-left">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/50 text-[11px] text-slate-200">
                                            {pendingReleaseRows.map(row => {
                                                const releaseNowGuardrail = canPerformAdminEscrowAction('release_now', row.status)
                                                return (
                                                    <tr key={row.escId} className="hover:bg-slate-800/25 transition-colors">
                                                        <td className="px-4 py-3 font-mono text-cyan-300">{row.escId}</td>
                                                        <td className="px-4 py-3">
                                                            <p className="font-medium text-slate-100">{row.dataset}</p>
                                                            <p className="mt-1 text-[10px] text-slate-500">{row.window} remaining</p>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap font-mono">{formatCurrency(row.amount)}</td>
                                                        <td className="px-4 py-3 text-slate-300">{row.releaseTrigger}</td>
                                                        <td className="px-4 py-3 text-slate-300">{row.releaseReadiness}</td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <button
                                                                disabled={!releaseNowGuardrail.allowed}
                                                                onClick={() => setSelectedEscrowId(row.escId)}
                                                                className={`rounded-md border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                                                                    releaseNowGuardrail.allowed ? actionButtonClasses.green : disabledActionClass
                                                                }`}
                                                            >
                                                                Release Now
                                                            </button>
                                                            {!releaseNowGuardrail.allowed && (
                                                                <p className="mt-1 max-w-[200px] text-[10px] text-amber-300">{releaseNowGuardrail.reason}</p>
                                                            )}
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </div>

                        <div className="space-y-6">
                            <section className={`${panelClass} p-5`}>
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Focused Contract</p>
                                        <h2 className="mt-1 text-lg font-semibold text-slate-100">{selectedTransaction.escId}</h2>
                                        <p className="mt-1 text-sm text-slate-400">{selectedTransaction.dataset}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="rounded-full border border-slate-700 bg-slate-950/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-300">
                                            {selectedTransaction.sector}
                                        </span>
                                        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-wide ${statusBadgeClasses[selectedTransaction.status]}`}>
                                            {CONTRACT_STATE_LABELS[selectedTransaction.status]}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                    <DetailTile label="Amount at stake" value={formatCurrency(selectedTransaction.amount)} />
                                    <DetailTile label="Queue owner" value={selectedTransaction.owner} />
                                    <DetailTile label="Policy checkpoint" value={selectedTransaction.policyHold} />
                                    <DetailTile label="Next required action" value={selectedTransaction.requiredAction} />
                                </div>

                                <div className="mt-4 rounded-lg border border-slate-800/70 bg-slate-950/45 p-3">
                                    <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Latest event</p>
                                    <p className="mt-1 text-sm text-slate-200">{selectedTransaction.lastEvent}</p>
                                </div>

                                <div className="mt-4">
                                    <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Active controls</p>
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                        {selectedTransaction.controls.map(control => (
                                            <span
                                                key={control}
                                                className="rounded-full border border-slate-700 bg-slate-950/70 px-2 py-1 text-[10px] text-slate-300"
                                            >
                                                {control}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            <DecisionGatePanel
                                contractId={selectedTransaction.escId}
                                state={selectedTransaction.status}
                                role="admin"
                                pendingReleaseCount={pendingReleaseRows.length}
                                compact
                                title="Release Controls"
                            />

                            <AlertCenterPanel
                                contractId={selectedTransaction.escId}
                                state={selectedTransaction.status}
                                role="admin"
                                pendingReleaseCount={pendingReleaseRows.length}
                                compact
                                title="Contract Alerts"
                            />
                        </div>
                    </section>
                )}

                {activeWorkspace === 'disputes' && (
                    <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_420px]">
                        <section className={panelClass}>
                            <div className="border-b border-slate-800/70 px-5 py-4">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Dispute Cases</p>
                                <h2 className="mt-1 text-lg font-semibold text-slate-100">Open case queue</h2>
                                <p className="mt-1 text-sm text-slate-400">
                                    Keep payout frozen until evidence is complete and a resolution path is approved.
                                </p>
                            </div>

                            <div className="space-y-4 p-5">
                                {disputeCards.map(dispute => (
                                    <button
                                        key={dispute.escId}
                                        onClick={() => handleSelectDispute(dispute.escId)}
                                        className={`w-full rounded-xl border p-4 text-left transition-colors ${
                                            selectedDispute.escId === dispute.escId
                                                ? 'border-cyan-500/50 bg-cyan-500/8'
                                                : 'border-slate-800/70 bg-slate-950/35 hover:border-slate-700/90 hover:bg-slate-900/60'
                                        }`}
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <p className="font-mono text-[11px] text-cyan-300">{dispute.escId}</p>
                                                <h3 className="mt-1 text-base font-semibold text-slate-100">{dispute.dataset}</h3>
                                            </div>
                                            <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${disputeSeverityClasses[dispute.severity]}`}>
                                                {dispute.severity} severity
                                            </span>
                                        </div>

                                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                                            <DetailTile label="Raised by" value={dispute.raisedBy} />
                                            <DetailTile label="Case owner" value={dispute.owner} />
                                            <DetailTile label="Amount at stake" value={formatCurrency(dispute.amount)} />
                                            <DetailTile label="Evidence status" value={dispute.evidenceStatus} />
                                        </div>

                                        <div className="mt-4 rounded-lg border border-rose-500/20 bg-rose-500/8 p-3">
                                            <p className="text-[10px] uppercase tracking-[0.12em] text-rose-300/90">Buyer claim</p>
                                            <p className="mt-1 text-sm leading-relaxed text-rose-100/90">{dispute.reason}</p>
                                        </div>

                                        <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                                            <span>{dispute.nextDeadline}</span>
                                            <span className="text-slate-700">|</span>
                                            <span>Raised {dispute.raisedAt}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </section>

                        <div className="space-y-6">
                            <section className={`${panelClass} p-5`}>
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Case Review</p>
                                        <h2 className="mt-1 text-lg font-semibold text-slate-100">{selectedDispute.escId}</h2>
                                        <p className="mt-1 text-sm text-slate-400">{selectedDispute.dataset}</p>
                                    </div>
                                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${disputeSeverityClasses[selectedDispute.severity]}`}>
                                        {selectedDispute.severity} severity
                                    </span>
                                </div>

                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                    <DetailTile label="Case owner" value={selectedDispute.owner} />
                                    <DetailTile label="Deadline" value={selectedDispute.nextDeadline} />
                                    <DetailTile label="Amount at stake" value={formatCurrency(selectedDispute.amount)} />
                                    <DetailTile label="Evidence status" value={selectedDispute.evidenceStatus} />
                                </div>

                                <div className="mt-4 rounded-lg border border-rose-500/20 bg-rose-500/8 p-3">
                                    <p className="text-[10px] uppercase tracking-[0.12em] text-rose-300/90">Buyer claim</p>
                                    <p className="mt-1 text-sm leading-relaxed text-rose-100/90">{selectedDispute.reason}</p>
                                </div>

                                <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/8 p-3">
                                    <p className="text-[10px] uppercase tracking-[0.12em] text-amber-300/90">Policy concern</p>
                                    <p className="mt-1 text-sm leading-relaxed text-amber-100/90">{selectedDispute.policyConcern}</p>
                                </div>

                                <div className="mt-3 rounded-lg border border-slate-800/70 bg-slate-950/45 p-3">
                                    <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Recommended path</p>
                                    <p className="mt-1 text-sm text-slate-200">{selectedDispute.recommendedPath}</p>
                                </div>

                                <textarea
                                    placeholder="Internal case note"
                                    className="mt-4 h-28 w-full resize-y rounded-md border border-slate-700/80 bg-slate-950/90 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500/70 focus:outline-none"
                                />

                                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                                    <button
                                        disabled={!resolveRefundGuardrail.allowed}
                                        className={`rounded-md border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.11em] transition-colors ${
                                            resolveRefundGuardrail.allowed ? actionButtonClasses.blue : disabledActionClass
                                        }`}
                                    >
                                        Refund Buyer
                                    </button>
                                    <button
                                        disabled={!resolveReleaseGuardrail.allowed}
                                        className={`rounded-md border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.11em] transition-colors ${
                                            resolveReleaseGuardrail.allowed ? actionButtonClasses.green : disabledActionClass
                                        }`}
                                    >
                                        Release to Provider
                                    </button>
                                    <button
                                        disabled={!escalateLegalGuardrail.allowed}
                                        className={`rounded-md border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.11em] transition-colors ${
                                            escalateLegalGuardrail.allowed ? actionButtonClasses.amber : disabledActionClass
                                        }`}
                                    >
                                        Escalate to Legal
                                    </button>
                                </div>

                                <div className="mt-3 space-y-1">
                                    {!resolveRefundGuardrail.allowed && (
                                        <p className="text-[10px] text-amber-300">Refund path: {resolveRefundGuardrail.reason}</p>
                                    )}
                                    {!resolveReleaseGuardrail.allowed && (
                                        <p className="text-[10px] text-amber-300">Release path: {resolveReleaseGuardrail.reason}</p>
                                    )}
                                    {!escalateLegalGuardrail.allowed && (
                                        <p className="text-[10px] text-amber-300">Legal escalation: {escalateLegalGuardrail.reason}</p>
                                    )}
                                </div>
                            </section>

                            <ExecutionRunbookPanel
                                contractId={selectedDispute.escId}
                                state={selectedDisputeState}
                                role="admin"
                                pendingReleaseCount={pendingReleaseRows.length}
                                compact
                                title="Resolution Runbook"
                            />

                            <SecurityAuditTimeline
                                contractId={selectedDispute.escId}
                                state={selectedDisputeState}
                                compact
                                title="Case Audit Trail"
                            />
                        </div>
                    </section>
                )}

                {activeWorkspace === 'governance' && (
                    <section className="space-y-6">
                        <section className={`${panelClass} p-5`}>
                            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Governance Controls</p>
                                    <h2 className="mt-1 text-lg font-semibold text-slate-100">Focused contract {selectedTransaction.escId}</h2>
                                    <p className="mt-1 text-sm text-slate-400">
                                        {selectedTransaction.dataset} · {selectedTransaction.requiredAction}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {focusContracts.map(row => (
                                        <button
                                            key={row.escId}
                                            onClick={() => setSelectedEscrowId(row.escId)}
                                            className={`rounded-md border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                                                selectedTransaction.escId === row.escId
                                                    ? 'border-cyan-500/60 bg-cyan-500/15 text-cyan-200'
                                                    : 'border-slate-700/70 bg-slate-900/50 text-slate-400 hover:border-slate-600/80 hover:text-slate-200'
                                            }`}
                                        >
                                            {row.escId}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                                {governanceTabs.map(tab => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveGovernanceTab(tab.key)}
                                        className={`rounded-md border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                                            activeGovernanceTab === tab.key
                                                ? 'border-cyan-500/60 bg-cyan-500/15 text-cyan-200'
                                                : 'border-slate-700/70 bg-slate-900/50 text-slate-400 hover:border-slate-600/80 hover:text-slate-200'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {activeGovernanceTab === 'policy' && (
                            <div className="grid gap-6 xl:grid-cols-2">
                                <PolicyAttestationPanel
                                    contractId={selectedTransaction.escId}
                                    state={selectedTransaction.status}
                                    role="admin"
                                    pendingReleaseCount={pendingReleaseRows.length}
                                    title="Policy Checks"
                                />
                                <DecisionGatePanel
                                    contractId={selectedTransaction.escId}
                                    state={selectedTransaction.status}
                                    role="admin"
                                    pendingReleaseCount={pendingReleaseRows.length}
                                    title="Release Controls"
                                />
                            </div>
                        )}

                        {activeGovernanceTab === 'audit' && (
                            <div className="grid gap-6 xl:grid-cols-2">
                                <SecurityAuditTimeline
                                    contractId={selectedTransaction.escId}
                                    state={selectedTransaction.status}
                                    compact
                                    title="Escrow Audit Trail"
                                />
                                <ExecutionRunbookPanel
                                    contractId={selectedTransaction.escId}
                                    state={selectedTransaction.status}
                                    role="admin"
                                    pendingReleaseCount={pendingReleaseRows.length}
                                    title="Admin Runbook"
                                />
                            </div>
                        )}

                        {activeGovernanceTab === 'health' && (
                            <div className="grid gap-6 xl:grid-cols-2">
                                <ContractHealthPanel
                                    contractId={selectedTransaction.escId}
                                    state={selectedTransaction.status}
                                    title="Operational Health"
                                />
                                <AlertCenterPanel
                                    contractId={selectedTransaction.escId}
                                    state={selectedTransaction.status}
                                    role="admin"
                                    pendingReleaseCount={pendingReleaseRows.length}
                                    title="Open Alerts"
                                />
                            </div>
                        )}
                    </section>
                )}

                {activeWorkspace === 'reporting' && (
                    <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_380px]">
                        <section className={panelClass}>
                            <div className="border-b border-slate-800/70 px-5 py-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Financial Summary</p>
                                        <h2 className="mt-1 text-lg font-semibold text-slate-100">Escrow financial reporting</h2>
                                        <p className="mt-1 text-sm text-slate-400">
                                            Monthly GMV, fees, payouts, and refunds prepared for finance and compliance review.
                                        </p>
                                    </div>
                                    <button
                                        className={`rounded-md border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors ${actionButtonClasses.blue}`}
                                    >
                                        Export Monthly Pack
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-5 p-5">
                                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                    {summaryCards.map(card => (
                                        <article
                                            key={card.label}
                                            className={`rounded-xl border p-3 ${summaryAccentClasses[card.tone]}`}
                                        >
                                            <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">{card.label}</p>
                                            <p className={`mt-2 text-xl font-semibold ${summaryValueClasses[card.tone]}`}>{card.value}</p>
                                            <p className="mt-2 text-xs text-slate-400">{card.detail}</p>
                                        </article>
                                    ))}
                                </div>

                                <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/35">
                                    <table className="w-full min-w-[960px]">
                                        <thead className="bg-slate-950/60">
                                            <tr className="text-[9px] font-semibold uppercase tracking-[0.13em] text-slate-500">
                                                <th className="px-4 py-3 text-left">Month</th>
                                                <th className="px-4 py-3 text-left">GMV</th>
                                                <th className="px-4 py-3 text-left">Platform Fee</th>
                                                <th className="px-4 py-3 text-left">Payouts</th>
                                                <th className="px-4 py-3 text-left">Refunds</th>
                                                <th className="px-4 py-3 text-left">Net</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/50 font-mono text-[11px] text-slate-200">
                                            {monthlyFinancialRows.map(row => (
                                                <tr key={row.month} className="hover:bg-slate-800/25 transition-colors">
                                                    <td className="px-4 py-3 whitespace-nowrap">{row.month}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap">{formatCurrency(row.gmv)}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-emerald-300">{formatCurrency(row.platformFee)}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-amber-300">{formatCurrency(row.payouts)}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-rose-300">{formatCurrency(row.refunds)}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-cyan-300">{formatCurrency(row.net)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>

                        <div className="space-y-6">
                            <section className={`${panelClass} p-5`}>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Reporting Outputs</p>
                                <h2 className="mt-1 text-lg font-semibold text-slate-100">Exportable evidence and finance artifacts</h2>
                                <div className="mt-4 space-y-3">
                                    {reportingArtifacts.map(artifact => (
                                        <article key={artifact.id} className="rounded-xl border border-slate-800/80 bg-slate-950/45 p-3">
                                            <div className="flex flex-wrap items-start justify-between gap-2">
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-100">{artifact.name}</p>
                                                    <p className="mt-1 text-xs leading-relaxed text-slate-400">{artifact.description}</p>
                                                </div>
                                                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${artifactStatusClasses[artifact.status]}`}>
                                                    {artifact.status}
                                                </span>
                                            </div>
                                            <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                                                <span>{artifact.cadence}</span>
                                                <span className="text-slate-700">|</span>
                                                <span>{artifact.owner}</span>
                                                <span className="text-slate-700">|</span>
                                                <span>{artifact.lastRun}</span>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </section>

                            <section className={`${panelClass} p-5`}>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Current Period Indicators</p>
                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                    {reportingIndicators.map(indicator => (
                                        <article key={indicator.label} className="rounded-xl border border-slate-800/80 bg-slate-950/45 p-3">
                                            <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">{indicator.label}</p>
                                            <p className="mt-2 text-xl font-semibold text-slate-100">{indicator.value}</p>
                                            <p className="mt-2 text-xs text-slate-400">{indicator.detail}</p>
                                        </article>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </section>
                )}
            </div>
        </AdminLayout>
    )
}

type StatusRowProps = {
    label: string
    value: string
    detail: string
}

function StatusRow({ label, value, detail }: StatusRowProps) {
    return (
        <div className="rounded-lg border border-slate-800/70 bg-slate-900/55 p-3">
            <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">{label}</p>
            <p className="mt-1 text-sm font-semibold text-slate-100">{value}</p>
            <p className="mt-1 text-xs text-slate-400">{detail}</p>
        </div>
    )
}

type DetailTileProps = {
    label: string
    value: string
}

function DetailTile({ label, value }: DetailTileProps) {
    return (
        <div className="rounded-lg border border-slate-800/70 bg-slate-950/45 p-3">
            <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">{label}</p>
            <p className="mt-1 text-sm text-slate-200">{value}</p>
        </div>
    )
}
