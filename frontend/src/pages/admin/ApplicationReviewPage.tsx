import { Navigate, useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import {
    getDocumentChecklistCounts,
    getDecisionStatusLabel,
    getOrganizationReviewRecord,
    getPacketStatusLabel,
    normalizeReviewCopy,
    type ApprovalStageStatus,
    type GovernanceDecisionStatus,
    type OrganizationReviewStatus,
    type ReviewDocumentStatus,
    type ReviewTone
} from '../../data/adminPilotOpsData'
import { useAuth } from '../../contexts/AuthContext'

const toneBadgeClasses: Record<ReviewTone, string> = {
    green: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
    amber: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
    red: 'border-red-500/40 bg-red-500/10 text-red-200',
    blue: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200'
}

const reviewStatusClasses: Record<OrganizationReviewStatus, string> = {
    Pending: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
    Reviewing: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200',
    Escalated: 'border-red-500/40 bg-red-500/10 text-red-200'
}

const decisionClasses: Record<GovernanceDecisionStatus, string> = {
    'Awaiting first pass': 'border-slate-700/80 bg-slate-800/60 text-slate-200',
    'Secondary review': 'border-amber-500/40 bg-amber-500/10 text-amber-200',
    'Ready for approval': 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
    'Approved for evaluation': 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200'
}

const packetClasses: Record<string, string> = {
    'Packet in preparation': 'border-slate-700/80 bg-slate-800/60 text-slate-200',
    'Packet submitted': 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200',
    'Packet under review': 'border-amber-500/40 bg-amber-500/10 text-amber-200',
    'Evaluation scope aligned': 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
    'Approved for evaluation': 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200'
}

const documentClasses: Record<ReviewDocumentStatus, string> = {
    ready: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
    review: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
    missing: 'border-red-500/30 bg-red-500/10 text-red-200'
}

const approvalStageClasses: Record<ApprovalStageStatus, string> = {
    complete: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
    active: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200',
    blocked: 'border-red-500/30 bg-red-500/10 text-red-200',
    pending: 'border-slate-700/80 bg-slate-800/60 text-slate-200'
}

const decisionButtonClasses: Record<'approve' | 'flag' | 'reject', string> = {
    approve: 'border-emerald-500/50 bg-emerald-500/12 text-emerald-200 hover:bg-emerald-500/18',
    flag: 'border-amber-500/50 bg-amber-500/12 text-amber-200 hover:bg-amber-500/18',
    reject: 'border-red-500/50 bg-red-500/12 text-red-200 hover:bg-red-500/18'
}

export default function ApplicationReviewPage() {
    const { isAuthenticated } = useAuth()
    const navigate = useNavigate()
    const { appId } = useParams<{ appId: string }>()
    const reviewId = appId ?? 'APP-3390'
    const record = getOrganizationReviewRecord(reviewId)

    if (!isAuthenticated) return <Navigate to="/admin/login" replace />
    if (!record) return <Navigate to="/admin/onboarding-queue" replace />

    const checklistCounts = getDocumentChecklistCounts(record)
    const decisionStatus = getDecisionStatusLabel(record.decisionStatus)
    const packetStatus = getPacketStatusLabel(record.loiStatus)
    const overviewItems = [
        { label: 'Organization', value: record.organizationName },
        { label: 'Review ID', value: record.id },
        { label: 'Review Scope', value: record.reviewScope },
        { label: 'Industry', value: record.industry },
        { label: 'Primary contact', value: `${record.contactRole} · ${record.workEmail}` },
        { label: 'Jurisdiction', value: record.jurisdiction },
        { label: 'Deployment preference', value: record.deploymentPreference },
        { label: 'Residency requirement', value: record.residencyRequirement },
        { label: 'Evaluation scope', value: normalizeReviewCopy(record.pilotScope) },
        { label: 'Owner', value: record.owner },
        { label: 'Review deadline', value: record.reviewDeadlineLabel },
        { label: 'Next action', value: normalizeReviewCopy(record.nextAction) }
    ]

    return (
        <AdminLayout title="ORGANIZATION REVIEW" subtitle="CONTROL READINESS, APPROVAL CHAIN & EVIDENCE CHECKS">
            <div className="space-y-6">
                <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/admin/onboarding-queue')}
                            className="inline-flex items-center gap-2 rounded-md border border-slate-700/80 bg-slate-900/60 px-3 py-2 text-[11px] font-semibold text-slate-200 transition-colors hover:bg-slate-800/70"
                        >
                            ← Back to Organization Review Queue
                        </button>

                        <div>
                            <h1 className="text-3xl font-semibold tracking-tight text-slate-100">{record.organizationName}</h1>
                            <p className="mt-1 text-sm text-slate-400">{record.id} · {record.reviewScope}</p>
                            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">{normalizeReviewCopy(record.overview)}</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center rounded-md border px-3 py-1.5 text-[11px] font-semibold tracking-wide ${reviewStatusClasses[record.reviewStatus]}`}>
                            {record.reviewStatus}
                        </span>
                        <span className={`inline-flex items-center rounded-md border px-3 py-1.5 text-[11px] font-semibold tracking-wide ${decisionClasses[decisionStatus]}`}>
                            {decisionStatus}
                        </span>
                        <span className={`inline-flex items-center rounded-md border px-3 py-1.5 text-[11px] font-semibold tracking-wide ${packetClasses[packetStatus]}`}>
                            {packetStatus}
                        </span>
                        <span className={`inline-flex items-center rounded-md border px-3 py-1.5 text-[11px] font-semibold tracking-wide ${record.riskScore >= 70 ? toneBadgeClasses.red : record.riskScore >= 40 ? toneBadgeClasses.amber : toneBadgeClasses.green}`}>
                            Risk Score: {record.riskScore}
                        </span>
                    </div>
                </section>

                <section className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
                    <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-300">Organization Profile</h2>
                    <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
                        {overviewItems.map((item) => (
                            <div key={item.label} className="rounded-md border border-slate-800/80 bg-slate-950/40 px-3 py-2.5">
                                <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">{item.label}</p>
                                <p className="mt-1 text-[12px] font-medium leading-relaxed text-slate-200">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="grid grid-cols-12 gap-5">
                    <section className="col-span-7 rounded-xl border border-slate-800/60 bg-slate-900/60 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
                        <div className="space-y-1">
                            <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-300">Review Context</h2>
                            <p className="text-sm text-slate-200">Use case, deployment posture, and current review intent.</p>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-3">
                            <div className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-4">
                                <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Use case</p>
                                <p className="mt-2 text-[12px] leading-relaxed text-slate-200">{normalizeReviewCopy(record.useCase)}</p>
                            </div>
                            <div className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-4">
                                <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Protected evaluation and deployment posture</p>
                                <p className="mt-2 text-[12px] leading-relaxed text-slate-200">{normalizeReviewCopy(record.deploymentPreference)}</p>
                                <p className="mt-3 text-[11px] leading-relaxed text-slate-500">{normalizeReviewCopy(record.residencyRequirement)}</p>
                            </div>
                            <div className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-4">
                                <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Evaluation scope and next action</p>
                                <p className="mt-2 text-[12px] leading-relaxed text-slate-200">{normalizeReviewCopy(record.pilotScope)}</p>
                                <p className="mt-3 text-[11px] leading-relaxed text-slate-500">Next: {normalizeReviewCopy(record.nextAction)}</p>
                            </div>
                        </div>
                    </section>

                    <section className="col-span-5 rounded-xl border border-slate-800/60 bg-slate-900/60 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
                        <div className="space-y-1">
                            <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-300">Review Packet Summary</h2>
                            <p className="text-sm text-slate-200">Current packet completeness and engagement posture.</p>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <div className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-4">
                                <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Checklist ready</p>
                                <p className="mt-2 text-3xl font-semibold text-slate-100">{checklistCounts.ready}</p>
                                <p className="mt-2 text-[10px] text-slate-500">{checklistCounts.review} in review · {checklistCounts.missing} missing</p>
                            </div>
                            <div className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-4">
                                <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Packet status</p>
                                <p className="mt-2 text-lg font-semibold text-slate-100">{packetStatus}</p>
                                <p className="mt-2 text-[10px] text-slate-500">{record.reviewDeadlineLabel}</p>
                            </div>
                            <div className="col-span-2 rounded-lg border border-slate-800/80 bg-slate-950/40 p-4">
                                <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Review summary</p>
                                <div className="mt-3 space-y-2">
                                    {record.summary.map((line) => (
                                        <p key={line} className="text-[11px] leading-relaxed text-slate-300">{normalizeReviewCopy(line)}</p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="grid grid-cols-12 gap-5">
                    <section className="col-span-7 rounded-xl border border-slate-800/60 bg-slate-900/60 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
                        <div className="space-y-1">
                            <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-300">Document Checklist</h2>
                            <p className="text-sm text-slate-200">Evidence items required before protected evaluation or final approval.</p>
                        </div>

                        <div className="mt-4 space-y-3">
                            {record.documents.map((document) => (
                                <div key={document.id} className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-[12px] font-semibold text-slate-100">{document.label}</p>
                                            <p className="mt-2 text-[11px] leading-relaxed text-slate-400">{document.detail}</p>
                                        </div>
                                        <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${documentClasses[document.status]}`}>
                                            {document.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="col-span-5 rounded-xl border border-slate-800/60 bg-slate-900/60 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
                        <div className="space-y-1">
                            <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-300">Approval Chain</h2>
                            <p className="text-sm text-slate-200">Internal owners, review stages, and current blockers.</p>
                        </div>

                        <div className="mt-4 space-y-3">
                            {record.approvalChain.map((stage) => (
                                <div key={stage.id} className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-[12px] font-semibold text-slate-100">{stage.stage}</p>
                                            <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-slate-500">{stage.owner}</p>
                                            <p className="mt-3 text-[11px] leading-relaxed text-slate-400">{normalizeReviewCopy(stage.note)}</p>
                                        </div>
                                        <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${approvalStageClasses[stage.status]}`}>
                                            {stage.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="grid grid-cols-12 gap-5">
                    <section className="col-span-7 rounded-xl border border-slate-800/60 bg-slate-900/60 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                            <div className="space-y-1">
                                <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-300">Automated Risk Assessment</h2>
                                <p className="text-sm text-slate-200">Policy and control analysis across the current organization packet.</p>
                            </div>
                            <div className={`rounded-lg border px-4 py-3 ${record.riskScore >= 70 ? toneBadgeClasses.red : record.riskScore >= 40 ? toneBadgeClasses.amber : toneBadgeClasses.green}`}>
                                <p className="text-[10px] uppercase tracking-[0.13em]">Overall Score</p>
                                <p className="mt-1 text-3xl font-semibold">{record.riskScore}/100</p>
                            </div>
                        </div>

                        <div className="mt-4 overflow-hidden rounded-lg border border-slate-800/80 bg-slate-950/35">
                            <div className="grid grid-cols-12 border-b border-slate-800/80 bg-slate-950/70 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                                <span className="col-span-6">Factor</span>
                                <span className="col-span-2">Score</span>
                                <span className="col-span-4">Status</span>
                            </div>
                            {record.riskFactors.map((row) => (
                                <div key={row.factor} className="grid grid-cols-12 items-center border-b border-slate-800/60 px-3 py-2.5 text-[11px] last:border-b-0">
                                    <span className="col-span-6 text-slate-200">{row.factor}</span>
                                    <span className="col-span-2 font-mono text-slate-300">{row.score}</span>
                                    <span className="col-span-4">
                                        <span className={`inline-flex items-center rounded-md border px-2 py-1 text-[10px] font-semibold tracking-wide ${toneBadgeClasses[row.tone]}`}>
                                            {row.status}
                                        </span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="col-span-5 rounded-xl border border-slate-800/60 bg-slate-900/60 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
                        <div className="space-y-1">
                            <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-300">Internal Notes</h2>
                            <p className="text-sm text-slate-200">Working notes that shape the current approval path.</p>
                        </div>

                        <div className="mt-4 space-y-3">
                            {record.internalNotes.map((note) => (
                                <div key={note} className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-4">
                                    <p className="text-[11px] leading-relaxed text-slate-300">{normalizeReviewCopy(note)}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <section className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
                    <div className="space-y-1">
                        <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-300">Review Decision</h2>
                        <p className="text-sm text-slate-200">Capture the current decision path and stage the next approval outcome.</p>
                    </div>

                    <div className="mt-4">
                        <label htmlFor="internal-note" className="text-[11px] font-medium text-slate-300">
                            Internal note (optional)
                        </label>
                        <textarea
                            id="internal-note"
                            placeholder="Add a decision note for audit visibility..."
                            className="mt-2 h-28 w-full resize-y rounded-lg border border-slate-700/80 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500/70 focus:outline-none"
                        />
                    </div>

                    <div className="mt-4 space-y-3">
                        <button className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${decisionButtonClasses.approve}`}>
                            <p className="text-[12px] font-semibold">Advance to Final Approval</p>
                            <p className="mt-1 text-[11px] text-emerald-100/80">Mark the review packet as approval-ready and notify the internal owner.</p>
                        </button>

                        <button className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${decisionButtonClasses.flag}`}>
                            <p className="text-[12px] font-semibold">Hold for Secondary Review</p>
                            <p className="mt-1 text-[11px] text-amber-100/80">Route the packet back through legal, privacy, or policy review.</p>
                        </button>

                        <button className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${decisionButtonClasses.reject}`}>
                            <p className="text-[12px] font-semibold">Close Current Review</p>
                            <p className="mt-1 text-[11px] text-red-100/80">Stop the current approval path and return the packet for material changes.</p>
                        </button>
                    </div>

                    <p className="mt-4 text-[11px] text-slate-500">
                        All review decisions are cryptographically logged and tied to the active approval chain.
                    </p>
                </section>
            </div>
        </AdminLayout>
    )
}
