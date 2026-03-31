import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AdminLayout from '../components/admin/AdminLayout'
import { getDocumentChecklistCounts, organizationReviewRecords } from '../data/adminPilotOpsData'
import {
    buildDealLifecycleSummary,
    buildPassportReminderSummary,
    buildDealTriageSummary,
    buildReleaseReadinessSummary,
    buildRightsRiskSummary,
    dealLifecycleStageMeta,
    dealRiskMeta,
    dealTriageMeta,
    dealUrgencyMeta,
    passportReminderMeta,
    releaseReadinessMeta,
    rightsRiskMeta,
    loadSharedDealLifecycleRecords
} from '../domain/dealLifecycle'

const interrogationData = [
    { timestamp: '2026-03-22 14:32:07', vendorId: 'ORG-7821', dataset: 'Financial_Records_Q4_2025', status: 'Quarantined', action: 'Contain' },
    { timestamp: '2026-03-22 14:31:54', vendorId: 'ORG-3390', dataset: 'Customer_PII_Index', status: 'Scanning', action: 'Inspect' },
    { timestamp: '2026-03-22 14:31:42', vendorId: 'ORG-1156', dataset: 'Healthcare_Compliance_Set', status: 'Clean', action: 'Inspect' },
    { timestamp: '2026-03-22 14:31:29', vendorId: 'ORG-8847', dataset: 'E-Commerce_Transactions', status: 'Clean', action: 'Inspect' },
    { timestamp: '2026-03-22 14:31:15', vendorId: 'ORG-2293', dataset: 'Social_Media_Metrics_DB', status: 'Quarantined', action: 'Contain' },
    { timestamp: '2026-03-22 14:30:58', vendorId: 'ORG-5501', dataset: 'IoT_Sensor_Raw_Data', status: 'Scanning', action: 'Inspect' },
]

const alertsData = [
    { type: 'critical', message: 'Sensitive field pattern detected in Dataset #492' },
    { type: 'warning', message: 'Repeated credential validation failure from 192.168.1.44' },
    { type: 'critical', message: 'Unusual bulk access pattern detected' },
    { type: 'warning', message: 'Short-lived token expiration surge: 847 tokens/hour' },
    { type: 'info', message: 'Scheduled audit backup completed' },
]

const normalizeAdminCopy = (value: string) =>
    value
        .replace(/\bBuyer\b/g, 'Requesting organization')
        .replace(/\bbuyer\b/g, 'requesting organization')
        .replace(/\bProvider\b/g, 'Contributing institution')
        .replace(/\bprovider\b/g, 'contributing institution')
        .replace(/\bpayout\b/g, 'release')

export default function AdminDashboard() {
    const { isAuthenticated } = useAuth()
    const dealRecords = loadSharedDealLifecycleRecords()
    const pilotReviewQueue = [...organizationReviewRecords].sort(
        (left, right) => new Date(left.reviewDeadline).getTime() - new Date(right.reviewDeadline).getTime()
    )
    const upcomingPilotReviews = pilotReviewQueue.slice(0, 4)
    const dealLifecycleSummary = buildDealLifecycleSummary(dealRecords)
    const dealTriageSummary = buildDealTriageSummary(dealRecords)
    const releaseReadinessSummary = buildReleaseReadinessSummary(dealRecords)
    const passportReminderSummary = buildPassportReminderSummary(dealRecords)
    const rightsRiskSummary = buildRightsRiskSummary(dealRecords)
    const triageActionQueue = dealTriageSummary.actionableQueue.slice(0, 4)
    const releaseActionQueue = releaseReadinessSummary.actionable.slice(0, 3)
    const rightsFlagQueue = rightsRiskSummary.flagged.slice(0, 3)
    const totalRecords = Math.max(dealRecords.length, 1)
    const activeReviewCount = dealTriageSummary.manualCount + dealTriageSummary.blockedCount
    const protectedEvaluationCount =
        dealLifecycleSummary.evaluationLiveCount + dealLifecycleSummary.workspacesProvisioningCount
    const policyExceptionCount =
        rightsRiskSummary.highRiskCount +
        rightsRiskSummary.restrictedCount +
        passportReminderSummary.blockingReminderCount
    const evidenceReadyCount =
        releaseReadinessSummary.autoReleaseCount + releaseReadinessSummary.humanApprovalCount
    const draftLetterCount = organizationReviewRecords.filter((record) => record.loiStatus === 'Draft LOI shared').length
    const underReviewLetterCount = organizationReviewRecords.filter((record) => record.loiStatus === 'LOI under review').length
    const scopeAgreedCount = organizationReviewRecords.filter((record) => record.loiStatus === 'Pilot scope agreed').length
    const signoffReadyCount = organizationReviewRecords.filter((record) => record.decisionStatus === 'Ready for signoff').length
    const summaryCards = [
        {
            label: 'Active Organization Reviews',
            value: activeReviewCount.toString(),
            detailLabel: 'REVIEW MIX',
            detailValue: `${dealTriageSummary.manualCount} manual · ${dealTriageSummary.blockedCount} blocked`,
            progress: Math.round((activeReviewCount / totalRecords) * 100),
            tone: 'amber' as const,
            icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
        },
        {
            label: 'Protected Evaluations',
            value: protectedEvaluationCount.toString(),
            detailLabel: 'ACTIVE WORKSPACES',
            detailValue: `${dealLifecycleSummary.evaluationLiveCount} live · ${dealLifecycleSummary.workspacesProvisioningCount} provisioning`,
            progress: Math.round((protectedEvaluationCount / totalRecords) * 100),
            tone: 'cyan' as const,
            icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z'
        },
        {
            label: 'Policy Exceptions',
            value: policyExceptionCount.toString(),
            detailLabel: 'FLAGGED SIGNALS',
            detailValue: `${rightsRiskSummary.highRiskCount + rightsRiskSummary.restrictedCount} rights alerts · ${passportReminderSummary.blockingReminderCount} critical reminders`,
            progress: Math.round((policyExceptionCount / totalRecords) * 100),
            tone: 'red' as const,
            icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
        },
        {
            label: 'Evidence Packs Ready',
            value: evidenceReadyCount.toString(),
            detailLabel: 'SIGNOFF PATH',
            detailValue: `${releaseReadinessSummary.autoReleaseCount} release-ready · ${releaseReadinessSummary.humanApprovalCount} awaiting signoff`,
            progress: Math.round((evidenceReadyCount / totalRecords) * 100),
            tone: 'emerald' as const,
            icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
        }
    ]

    if (!isAuthenticated) return <Navigate to="/admin/login" replace />

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Clean':
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-medium tracking-wider rounded-md bg-emerald-500/10 text-emerald-400/80 border border-emerald-500/20">Cleared</span>
            case 'Quarantined':
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-medium tracking-wider rounded-md bg-red-500/10 text-red-400/80 border border-red-500/20">Contained</span>
            case 'Scanning':
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-medium tracking-wider rounded-md bg-amber-500/10 text-amber-400/80 border border-amber-500/20 animate-pulse">Scanning</span>
            default:
                return null
        }
    }

    const getAlertStyle = (type: string) => {
        switch (type) {
            case 'critical':
                return 'border-l-[3px] border-rose-500/60 bg-slate-950/60 backdrop-blur-sm'
            case 'warning':
                return 'border-l-[3px] border-amber-500/50 bg-slate-950/40 backdrop-blur-sm'
            case 'info':
                return 'border-l-[3px] border-cyan-500/40 bg-slate-950/40 backdrop-blur-sm'
            default:
                return ''
        }
    }

    const getToneClasses = (tone: 'slate' | 'cyan' | 'amber' | 'emerald' | 'red') => {
        switch (tone) {
            case 'cyan':
                return 'border-cyan-500/20 bg-cyan-500/10 text-cyan-300'
            case 'amber':
                return 'border-amber-500/20 bg-amber-500/10 text-amber-300'
            case 'emerald':
                return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
            case 'red':
                return 'border-red-500/20 bg-red-500/10 text-red-300'
            default:
                return 'border-slate-700/60 bg-slate-800/50 text-slate-300'
        }
    }

    const getPilotReviewToneClasses = (status: string) => {
        switch (status) {
            case 'Pending':
            case 'Awaiting first pass':
            case 'Packet in preparation':
                return getToneClasses('slate')
            case 'Reviewing':
            case 'Draft LOI shared':
                return getToneClasses('cyan')
            case 'Escalated':
            case 'Secondary review':
            case 'LOI under review':
                return getToneClasses('amber')
            case 'Ready for signoff':
            case 'Pilot scope agreed':
            case 'Pilot approved':
                return getToneClasses('emerald')
            default:
                return getToneClasses('slate')
        }
    }

    return (
        <AdminLayout title="PILOT REVIEW DASHBOARD" subtitle="ORGANIZATION READINESS & CONTROL SIGNALS">
            <div className="space-y-6">
                <div className="grid grid-cols-12 gap-5">
                    {summaryCards.map((card) => (
                        <div key={card.label} className="col-span-3 rounded-xl border border-slate-800/50 bg-slate-900/60 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
                            <div className="mb-4 flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${getToneClasses(card.tone)}`}>
                                        <svg className="h-4 w-4 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                                        </svg>
                                    </div>
                                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{card.label}</span>
                                </div>
                            </div>
                            <span className="text-4xl font-semibold tracking-tight text-slate-100">{card.value}</span>
                            <div className="mt-4">
                                <div className="mb-1.5 flex items-center justify-between">
                                    <span className="text-[9px] font-medium tracking-wider text-slate-600">{card.detailLabel}</span>
                                    <span className="text-[9px] font-medium text-slate-500">{card.progress}%</span>
                                </div>
                                <div className="h-1 overflow-hidden rounded-full bg-slate-800/60">
                                    <div
                                        className={`h-full rounded-full ${
                                            card.tone === 'amber'
                                                ? 'bg-gradient-to-r from-amber-500/60 to-amber-500/30'
                                                : card.tone === 'cyan'
                                                    ? 'bg-gradient-to-r from-cyan-500/60 to-cyan-500/30'
                                                    : card.tone === 'red'
                                                        ? 'bg-gradient-to-r from-red-500/60 to-red-500/30'
                                                        : 'bg-gradient-to-r from-emerald-500/60 to-emerald-500/30'
                                        }`}
                                        style={{ width: `${card.progress}%` }}
                                    />
                                </div>
                                <p className="mt-2 text-[9px] tracking-wide text-slate-500">{card.detailValue}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-12 gap-5">
                    <div className="col-span-8 overflow-hidden rounded-xl border border-slate-800/50 bg-slate-900/60 shadow-2xl shadow-black/30 backdrop-blur-xl">
                        <div className="flex items-center justify-between border-b border-slate-800/60 px-5 py-4">
                            <div>
                                <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-300">Pilot Review Ops</h2>
                                <p className="mt-1 text-[10px] text-slate-500">
                                    Live organization packets with letter status, next action, owner, and review deadline.
                                </p>
                            </div>
                            <div className="rounded-lg border border-slate-800/70 bg-slate-950/45 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                {organizationReviewRecords.length} active packets
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-3 border-b border-slate-800/40 px-5 py-4">
                            <div className="rounded-lg border border-slate-800/60 bg-slate-950/45 p-3">
                                <div className="text-[9px] uppercase tracking-[0.12em] text-slate-600">Draft LOIs</div>
                                <div className="mt-2 text-2xl font-semibold text-slate-100">{draftLetterCount}</div>
                            </div>
                            <div className="rounded-lg border border-slate-800/60 bg-slate-950/45 p-3">
                                <div className="text-[9px] uppercase tracking-[0.12em] text-slate-600">Under Review</div>
                                <div className="mt-2 text-2xl font-semibold text-slate-100">{underReviewLetterCount}</div>
                            </div>
                            <div className="rounded-lg border border-slate-800/60 bg-slate-950/45 p-3">
                                <div className="text-[9px] uppercase tracking-[0.12em] text-slate-600">Scope Agreed</div>
                                <div className="mt-2 text-2xl font-semibold text-slate-100">{scopeAgreedCount}</div>
                            </div>
                            <div className="rounded-lg border border-slate-800/60 bg-slate-950/45 p-3">
                                <div className="text-[9px] uppercase tracking-[0.12em] text-slate-600">Ready for Signoff</div>
                                <div className="mt-2 text-2xl font-semibold text-slate-100">{signoffReadyCount}</div>
                            </div>
                        </div>

                        <div className="divide-y divide-slate-800/30">
                            {pilotReviewQueue.map((record) => (
                                <div key={record.id} className="px-5 py-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <div className="text-[11px] font-semibold text-slate-200">{record.organizationName}</div>
                                                <div className="text-[9px] uppercase tracking-[0.12em] text-slate-600">{record.industry}</div>
                                            </div>
                                            <p className="mt-2 text-[10px] leading-relaxed text-slate-300">{record.pilotScope}</p>
                                            <p className="mt-2 text-[9px] uppercase tracking-[0.12em] text-slate-600">
                                                {record.owner} · deadline {record.reviewDeadlineLabel}
                                            </p>
                                            <p className="mt-2 text-[9px] leading-relaxed text-slate-500">Next: {record.nextAction}</p>
                                        </div>
                                        <div className="flex min-w-[11rem] flex-col items-end gap-2">
                                            <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] ${getPilotReviewToneClasses(record.loiStatus)}`}>
                                                {record.loiStatus}
                                            </span>
                                            <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] ${getPilotReviewToneClasses(record.decisionStatus)}`}>
                                                {record.decisionStatus}
                                            </span>
                                            <Link
                                                to={`/admin/application-review/${record.id}`}
                                                className="rounded-md border border-cyan-500/30 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-cyan-400/80 transition-all duration-200 hover:border-cyan-500/50 hover:bg-cyan-500/10"
                                            >
                                                Open review
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="col-span-4 overflow-hidden rounded-xl border border-slate-800/50 bg-slate-900/60 shadow-2xl shadow-black/30 backdrop-blur-xl">
                        <div className="border-b border-slate-800/60 px-5 py-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-300">Decision Watchlist</h2>
                                <span className="text-[9px] font-medium tracking-wider text-slate-600">NEAREST DEADLINES</span>
                            </div>
                        </div>

                        <div className="divide-y divide-slate-800/30">
                            {upcomingPilotReviews.map((record) => {
                                const checklistCounts = getDocumentChecklistCounts(record)
                                return (
                                    <div key={record.id} className="px-5 py-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="text-[11px] font-semibold text-slate-200">{record.organizationName}</div>
                                                <div className="mt-1 text-[9px] uppercase tracking-[0.12em] text-slate-600">{record.owner}</div>
                                            </div>
                                            <div className={`inline-flex items-center rounded-md border px-2 py-1 text-[8px] font-semibold tracking-wider ${getPilotReviewToneClasses(record.reviewStatus)}`}>
                                                {record.reviewStatus}
                                            </div>
                                        </div>
                                        <p className="mt-3 text-[10px] leading-relaxed text-slate-400">{record.nextAction}</p>
                                        <p className="mt-2 text-[9px] text-slate-500">
                                            {checklistCounts.ready} ready · {checklistCounts.review} in review · {checklistCounts.missing} missing
                                        </p>
                                        <p className="mt-2 text-[9px] text-slate-600">Deadline: {record.reviewDeadlineLabel}</p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-5 mb-6">
                        <div className="col-span-7 bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-xl overflow-hidden shadow-2xl shadow-black/30">
                            <div className="px-5 py-4 border-b border-slate-800/60 flex items-center justify-between">
                                <div>
                                    <h2 className="text-[11px] font-semibold text-slate-300 tracking-[0.1em] uppercase">Controlled Evaluation Lifecycle</h2>
                                    <p className="text-[10px] text-slate-500 mt-1">
                                        Shared scoring model across organization passports, rights packages, protected evaluation, validation, and release.
                                    </p>
                                </div>
                                <div className="px-3 py-1.5 rounded-lg border border-cyan-500/20 bg-cyan-500/10 text-[10px] font-semibold text-cyan-300 tracking-[0.12em] uppercase">
                                    {dealLifecycleSummary.blockedCount} blocked
                                </div>
                            </div>

                            <div className="grid grid-cols-6 gap-3 px-5 py-5 border-b border-slate-800/40">
                                <div className="rounded-lg border border-slate-800/60 bg-slate-950/50 p-3">
                                    <div className="text-[9px] text-slate-600 tracking-[0.12em] uppercase">Active Passports</div>
                                    <div className="mt-2 text-2xl font-semibold text-slate-100">{dealLifecycleSummary.activePassportCount}</div>
                                </div>
                                <div className="rounded-lg border border-slate-800/60 bg-slate-950/50 p-3">
                                    <div className="text-[9px] text-slate-600 tracking-[0.12em] uppercase">Quotes Ready</div>
                                    <div className="mt-2 text-2xl font-semibold text-slate-100">{dealLifecycleSummary.quotePreparedCount}</div>
                                </div>
                                <div className="rounded-lg border border-slate-800/60 bg-slate-950/50 p-3">
                                    <div className="text-[9px] text-slate-600 tracking-[0.12em] uppercase">Funded Checkouts</div>
                                    <div className="mt-2 text-2xl font-semibold text-slate-100">{dealLifecycleSummary.fundedCheckoutCount}</div>
                                </div>
                                <div className="rounded-lg border border-slate-800/60 bg-slate-950/50 p-3">
                                    <div className="text-[9px] text-slate-600 tracking-[0.12em] uppercase">Provisioning</div>
                                    <div className="mt-2 text-2xl font-semibold text-slate-100">{dealLifecycleSummary.workspacesProvisioningCount}</div>
                                </div>
                                <div className="rounded-lg border border-slate-800/60 bg-slate-950/50 p-3">
                                    <div className="text-[9px] text-slate-600 tracking-[0.12em] uppercase">Release Backlog</div>
                                    <div className="mt-2 text-2xl font-semibold text-slate-100">{dealLifecycleSummary.releaseBacklogCount}</div>
                                </div>
                                <div className="rounded-lg border border-slate-800/60 bg-slate-950/50 p-3">
                                    <div className="text-[9px] text-slate-600 tracking-[0.12em] uppercase">Engine Failures</div>
                                    <div className="mt-2 text-2xl font-semibold text-slate-100">{dealLifecycleSummary.engineFailureCount}</div>
                                </div>
                            </div>

                            <div className="px-5 py-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[10px] font-semibold text-slate-500 tracking-[0.12em] uppercase">Stage Distribution</span>
                                    <span className="text-[9px] text-slate-600 tracking-wider">
                                        {dealLifecycleSummary.humanReviewCount} manual lane(s)
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        'passport_incomplete',
                                        'quote_prepared',
                                        'workspace_provisioning',
                                        'evaluation_live',
                                        'awaiting_validation',
                                        'release_ready'
                                    ].map((stageKey) => {
                                        const stage = stageKey as keyof typeof dealLifecycleStageMeta
                                        const meta = dealLifecycleStageMeta[stage]
                                        return (
                                            <div key={stage} className="rounded-lg border border-slate-800/60 bg-slate-950/40 p-3">
                                                <div className="flex items-center justify-between gap-3">
                                                    <span className="text-[10px] text-slate-300">{meta.label}</span>
                                                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[9px] font-semibold tracking-wider ${getToneClasses(meta.tone)}`}>
                                                        {dealLifecycleSummary.stageCounts[stage]}
                                                    </span>
                                                </div>
                                                <p className="mt-2 text-[9px] leading-relaxed text-slate-600">{normalizeAdminCopy(meta.detail)}</p>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="col-span-5 bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-xl overflow-hidden shadow-2xl shadow-black/30">
                            <div className="px-5 py-4 border-b border-slate-800/60 flex items-center justify-between">
                                <div>
                                    <h2 className="text-[11px] font-semibold text-slate-300 tracking-[0.1em] uppercase">Review Triage</h2>
                                    <p className="text-[10px] text-slate-500 mt-1">Review packets are routed automatically by stage, risk, urgency, and approval policy.</p>
                                </div>
                                <div className="text-[9px] text-slate-600 tracking-wider">
                                    {dealTriageSummary.manualCount} manual
                                </div>
                            </div>
                            <div className="grid grid-cols-5 gap-2 px-5 py-4 border-b border-slate-800/40">
                                {(['blocked', 'human_approval', 'review_now', 'watch', 'auto_advance'] as const).map((lane) => {
                                    const meta = dealTriageMeta[lane]
                                    return (
                                        <div key={lane} className="rounded-lg border border-slate-800/60 bg-slate-950/45 p-2.5">
                                            <div className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[8px] font-semibold tracking-[0.14em] uppercase ${getToneClasses(meta.tone)}`}>
                                                {meta.label}
                                            </div>
                                            <div className="mt-2 text-xl font-semibold text-slate-100">
                                                {dealTriageSummary.laneCounts[lane]}
                                            </div>
                                            <p className="mt-1 text-[8px] leading-relaxed text-slate-600">{normalizeAdminCopy(meta.detail)}</p>
                                        </div>
                                    )
                                })}
                            </div>
                            <div className="divide-y divide-slate-800/30">
                                {triageActionQueue.map((deal) => {
                                    const stageMeta = dealLifecycleStageMeta[deal.stage]
                                    const riskMeta = dealRiskMeta[deal.risk]
                                    const urgencyMeta = dealUrgencyMeta[deal.urgency]
                                    const triageMeta = dealTriageMeta[deal.triageLane]

                                    return (
                                        <div key={deal.id} className="px-5 py-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <div className="text-[11px] font-semibold text-slate-200">{deal.datasetTitle}</div>
                                                    <div className="mt-1 text-[9px] uppercase tracking-[0.12em] text-slate-600">
                                                        {deal.recommendedOwner} · {deal.queue.replace('_', ' ')} · SLA {deal.triageSla}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <div className={`inline-flex items-center rounded-md border px-2 py-1 text-[9px] font-semibold tracking-wider ${getToneClasses(triageMeta.tone)}`}>
                                                        {triageMeta.label}
                                                    </div>
                                                    <div className={`inline-flex items-center rounded-md border px-2 py-1 text-[8px] font-semibold tracking-wider ${getToneClasses(stageMeta.tone)}`}>
                                                        {stageMeta.label}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-3 flex flex-wrap gap-2">
                                                <span className={`inline-flex items-center rounded-md border px-2 py-1 text-[9px] font-semibold tracking-wider ${getToneClasses(riskMeta.tone)}`}>
                                                    {riskMeta.label}
                                                </span>
                                                <span className={`inline-flex items-center rounded-md border px-2 py-1 text-[9px] font-semibold tracking-wider ${getToneClasses(urgencyMeta.tone)}`}>
                                                    {urgencyMeta.label} urgency
                                                </span>
                                                <span className="inline-flex items-center rounded-md border border-slate-700/60 bg-slate-800/50 px-2 py-1 text-[9px] font-semibold tracking-wider text-slate-300">
                                                    {deal.approvalDisposition === 'auto_advance' ? 'Auto advance' : deal.approvalDisposition === 'human_review' ? 'Human review' : 'Blocked'}
                                                </span>
                                            </div>

                                            <p className="mt-3 text-[10px] leading-relaxed text-slate-400">
                                                {normalizeAdminCopy(deal.triageReason)}
                                            </p>
                                            <p className="mt-2 text-[9px] leading-relaxed text-slate-600">
                                                Next: {normalizeAdminCopy(deal.nextAction)}
                                            </p>
                                        </div>
                                    )
                                })}
                                {triageActionQueue.length === 0 && (
                                    <div className="px-5 py-5 text-[10px] text-slate-500">
                                        No manual triage items are active. Current records can continue in watch or auto-advance lanes.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-5 mb-6">
                        <div className="col-span-4 bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-xl overflow-hidden shadow-2xl shadow-black/30">
                            <div className="px-5 py-4 border-b border-slate-800/60 flex items-center justify-between">
                                <div>
                                    <h2 className="text-[11px] font-semibold text-slate-300 tracking-[0.1em] uppercase">Evidence & Release Readiness</h2>
                                    <p className="text-[10px] text-slate-500 mt-1">Automated checks decide what is ready for signoff, what needs approval, and what stays frozen.</p>
                                </div>
                                <div className="text-[9px] text-slate-600 tracking-wider">
                                    {releaseReadinessSummary.autoReleaseCount} safe
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 px-5 py-4 border-b border-slate-800/40">
                                {(['safe_to_release', 'human_approval', 'blocked'] as const).map((status) => {
                                    const meta = releaseReadinessMeta[status]
                                    return (
                                        <div key={status} className="rounded-lg border border-slate-800/60 bg-slate-950/45 p-2.5">
                                            <div className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[8px] font-semibold tracking-[0.14em] uppercase ${getToneClasses(meta.tone)}`}>
                                                {meta.label}
                                            </div>
                                            <div className="mt-2 text-xl font-semibold text-slate-100">
                                                {releaseReadinessSummary.statusCounts[status]}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                            <div className="divide-y divide-slate-800/30">
                                {releaseActionQueue.map((deal) => {
                                    const readinessMeta = releaseReadinessMeta[deal.releaseReadiness.status]
                                    return (
                                        <div key={deal.id} className="px-5 py-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <div className="text-[11px] font-semibold text-slate-200">{deal.datasetTitle}</div>
                                                    <div className="mt-1 text-[9px] uppercase tracking-[0.12em] text-slate-600">
                                                        {deal.recommendedOwner} · readiness {deal.releaseReadiness.score}%
                                                    </div>
                                                </div>
                                                <div className={`inline-flex items-center rounded-md border px-2 py-1 text-[8px] font-semibold tracking-wider ${getToneClasses(readinessMeta.tone)}`}>
                                                    {readinessMeta.label}
                                                </div>
                                            </div>
                                            <p className="mt-3 text-[10px] leading-relaxed text-slate-400">
                                                {normalizeAdminCopy(deal.releaseReadiness.summary)}
                                            </p>
                                            <p className="mt-2 text-[9px] leading-relaxed text-slate-600">
                                                Next: {normalizeAdminCopy(deal.releaseReadiness.recommendedAction)}
                                            </p>
                                        </div>
                                    )
                                })}
                                {releaseActionQueue.length === 0 && (
                                    <div className="px-5 py-5 text-[10px] text-slate-500">
                                        No release candidates are active yet.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="col-span-4 bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-xl overflow-hidden shadow-2xl shadow-black/30">
                            <div className="px-5 py-4 border-b border-slate-800/60 flex items-center justify-between">
                                <div>
                                    <h2 className="text-[11px] font-semibold text-slate-300 tracking-[0.1em] uppercase">Organization Passport Reminders</h2>
                                    <p className="text-[10px] text-slate-500 mt-1">Expiry, diligence gaps, and reuse blockers are grouped into a single reminder queue.</p>
                                </div>
                                <div className="text-[9px] text-slate-600 tracking-wider">
                                    {passportReminderSummary.impactedDealCount} impacted
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 px-5 py-4 border-b border-slate-800/40">
                                {(['critical', 'warning', 'info'] as const).map((severity) => {
                                    const meta = passportReminderMeta[severity]
                                    return (
                                        <div key={severity} className="rounded-lg border border-slate-800/60 bg-slate-950/45 p-2.5">
                                            <div className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[8px] font-semibold tracking-[0.14em] uppercase ${getToneClasses(meta.tone)}`}>
                                                {meta.label}
                                            </div>
                                            <div className="mt-2 text-xl font-semibold text-slate-100">
                                                {passportReminderSummary.severityCounts[severity]}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                            <div className="divide-y divide-slate-800/30">
                                {passportReminderSummary.reminders.map((reminder) => {
                                    const meta = passportReminderMeta[reminder.severity]
                                    return (
                                        <div key={reminder.id} className="px-5 py-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="text-[11px] font-semibold text-slate-200">{reminder.title}</div>
                                                <div className={`inline-flex items-center rounded-md border px-2 py-1 text-[8px] font-semibold tracking-wider ${getToneClasses(meta.tone)}`}>
                                                    {meta.label}
                                                </div>
                                            </div>
                                            <p className="mt-3 text-[10px] leading-relaxed text-slate-400">{reminder.detail}</p>
                                            <p className="mt-2 text-[9px] leading-relaxed text-slate-600">
                                                Due: {reminder.dueLabel}
                                            </p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="col-span-4 bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-xl overflow-hidden shadow-2xl shadow-black/30">
                            <div className="px-5 py-4 border-b border-slate-800/60 flex items-center justify-between">
                                <div>
                                    <h2 className="text-[11px] font-semibold text-slate-300 tracking-[0.1em] uppercase">Policy Exceptions</h2>
                                    <p className="text-[10px] text-slate-500 mt-1">Only unusual rights, handling, or release patterns are pulled into the admin review lane.</p>
                                </div>
                                <div className="text-[9px] text-slate-600 tracking-wider">
                                    {rightsRiskSummary.highRiskCount + rightsRiskSummary.restrictedCount} flagged
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 px-5 py-4 border-b border-slate-800/40">
                                {(['elevated', 'high', 'restricted'] as const).map((level) => {
                                    const meta = rightsRiskMeta[level]
                                    return (
                                        <div key={level} className="rounded-lg border border-slate-800/60 bg-slate-950/45 p-2.5">
                                            <div className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[8px] font-semibold tracking-[0.14em] uppercase ${getToneClasses(meta.tone)}`}>
                                                {meta.label}
                                            </div>
                                            <div className="mt-2 text-xl font-semibold text-slate-100">
                                                {rightsRiskSummary.levelCounts[level]}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                            <div className="divide-y divide-slate-800/30">
                                {rightsFlagQueue.map((deal) => {
                                    const meta = rightsRiskMeta[deal.rightsRisk.level]
                                    return (
                                        <div key={deal.id} className="px-5 py-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <div className="text-[11px] font-semibold text-slate-200">{deal.datasetTitle}</div>
                                                    <div className="mt-1 text-[9px] uppercase tracking-[0.12em] text-slate-600">
                                                        policy risk {deal.rightsRisk.score} · {deal.queue.replace('_', ' ')}
                                                    </div>
                                                </div>
                                                <div className={`inline-flex items-center rounded-md border px-2 py-1 text-[8px] font-semibold tracking-wider ${getToneClasses(meta.tone)}`}>
                                                    {meta.label}
                                                </div>
                                            </div>
                                            <p className="mt-3 text-[10px] leading-relaxed text-slate-400">
                                                {normalizeAdminCopy(deal.rightsRisk.flags[0] ?? deal.rightsRisk.summary)}
                                            </p>
                                            <p className="mt-2 text-[9px] leading-relaxed text-slate-600">
                                                {normalizeAdminCopy(deal.rightsRisk.summary)}
                                            </p>
                                        </div>
                                    )
                                })}
                                {rightsFlagQueue.length === 0 && (
                                    <div className="px-5 py-5 text-[10px] text-slate-500">
                                        No high-risk policy exceptions are active right now.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-5">
                        <div className="col-span-8 bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-xl overflow-hidden shadow-2xl shadow-black/30">
                            <div className="px-5 py-4 border-b border-slate-800/60 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-[11px] font-semibold text-slate-300 tracking-[0.1em] uppercase">Automated Review Lane</h2>
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-800/60 rounded-full">
                                        <div className="w-1.5 h-1.5 bg-cyan-500/80 rounded-full animate-pulse shadow-[0_0_6px_rgba(6,185,185,0.5)]" />
                                        <span className="text-[9px] font-semibold text-slate-500 tracking-wider">LIVE</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-[9px] text-slate-600 font-medium tracking-wider">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    POLICY ENGINE ACTIVE
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-950/40">
                                        <tr className="text-[9px] font-semibold text-slate-600 tracking-[0.12em] uppercase">
                                            <th className="text-left px-5 py-3 font-medium">Timestamp</th>
                                            <th className="text-left px-5 py-3 font-medium">Organization ID</th>
                                            <th className="text-left px-5 py-3 font-medium">Dataset Name</th>
                                            <th className="text-left px-5 py-3 font-medium">Review Status</th>
                                            <th className="text-left px-5 py-3 font-medium">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/30">
                                        {interrogationData.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-slate-800/20 transition-colors duration-150">
                                                <td className="px-5 py-4 text-[10px] font-mono text-slate-500">{row.timestamp}</td>
                                                <td className="px-5 py-4 text-[10px] font-mono text-cyan-400/80">{row.vendorId}</td>
                                                <td className="px-5 py-4 text-[10px] font-mono text-slate-300">{row.dataset}</td>
                                                <td className="px-5 py-4">{getStatusBadge(row.status)}</td>
                                                <td className="px-5 py-4">
                                                    <button className={`text-[9px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-md transition-all duration-200 ${
                                                        row.action === 'Contain'
                                                            ? 'border border-red-500/30 text-red-400/80 hover:bg-red-500/10 hover:border-red-500/50'
                                                            : 'border border-slate-700/50 text-slate-400/80 hover:bg-slate-800/50 hover:border-slate-600/50'
                                                    }`}>
                                                        {row.action}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="col-span-4 bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-xl overflow-hidden shadow-2xl shadow-black/30">
                            <div className="px-5 py-4 border-b border-slate-800/60">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-[11px] font-semibold text-slate-300 tracking-[0.1em] uppercase">Policy & Control Alerts</h2>
                                    <span className="text-[9px] font-medium text-slate-600 tracking-wider">LAST 24H</span>
                                </div>
                            </div>
                            <div className="divide-y divide-slate-800/30">
                                {alertsData.map((alert, idx) => (
                                    <div
                                        key={idx}
                                        className={`px-5 py-3.5 ${getAlertStyle(alert.type)}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {alert.type === 'critical' && (
                                                <div className="w-5 h-5 rounded-md bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <svg className="w-3 h-3 text-red-400/80" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                            {alert.type === 'warning' && (
                                                <div className="w-5 h-5 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <svg className="w-3 h-3 text-amber-400/80" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                            {alert.type === 'info' && (
                                                <div className="w-5 h-5 rounded-md bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <svg className="w-3 h-3 text-cyan-400/80" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                            <span className="text-[11px] text-slate-400 leading-relaxed">{alert.message}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 bg-slate-900/40 backdrop-blur-xl border border-slate-800/40 rounded-xl p-4 shadow-2xl shadow-black/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-red-950/40 border border-red-900/30 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-red-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-[11px] font-semibold text-slate-400 tracking-[0.08em] uppercase">Containment Controls</h3>
                                    <p className="text-[9px] text-slate-600 mt-0.5 tracking-wider">Requires dual authorization • Immediate effect</p>
                                </div>
                            </div>
                            <button className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-red-400/80 border border-red-900/40 bg-red-950/20 hover:bg-red-950/40 hover:border-red-800/60 rounded-lg transition-all duration-200">
                                Freeze New Evaluations
                            </button>
                        </div>
                    </div>
            </div>
        </AdminLayout>
    )
}
