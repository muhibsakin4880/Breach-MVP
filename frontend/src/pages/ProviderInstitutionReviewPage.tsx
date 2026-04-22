import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { statusStyles } from '../data/contributionStatusData'
import {
    buildProviderPublishingReview,
    type ProviderPublishingBlocker,
    type ProviderPublishingChecklistItem,
    type ProviderPublishingReview
} from '../domain/providerPublishingReview'
import type { ProviderInstitutionReviewTone } from '../data/providerInstitutionData'

const panelClass =
    'rounded-[28px] border border-white/10 bg-[#081326]/88 p-6 shadow-[0_24px_70px_rgba(2,8,20,0.34)] backdrop-blur-xl'

export default function ProviderInstitutionReviewPage() {
    const { providerAccount } = useAuth()
    const review = useMemo(() => buildProviderPublishingReview(providerAccount), [providerAccount])

    return (
        <div data-provider-institution-review className="min-h-screen bg-[#030814] text-white">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(34,211,238,0.14),transparent_28%),radial-gradient(circle_at_86%_0%,rgba(16,185,129,0.12),transparent_26%),radial-gradient(circle_at_52%_88%,rgba(59,130,246,0.10),transparent_34%)]" />
            <div className="relative mx-auto flex w-full max-w-[1620px] flex-col gap-8 px-4 py-6 sm:px-6 xl:px-8">
                <header className={panelClass}>
                    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_360px] xl:items-start">
                        <div className="space-y-5">
                            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-100">
                                Provider institution onboarding and publishing review
                            </div>
                            <div>
                                <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">Provider Institution Review</h1>
                                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
                                    {review.summary}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <Pill tone={review.publishingTone} label={review.publishingState} />
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200">
                                    {review.reviewId}
                                </span>
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200">
                                    {review.profile.tierLabel}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <Link
                                    to="/provider/dashboard"
                                    className="rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400"
                                >
                                    Back to Provider Dashboard
                                </Link>
                                <Link
                                    to="/provider/datasets/new"
                                    className="rounded-xl border border-slate-700 bg-slate-950/45 px-4 py-3 text-sm font-semibold text-slate-100 transition-colors hover:border-cyan-400/40 hover:text-cyan-100"
                                >
                                    Open upload flow
                                </Link>
                            </div>
                        </div>

                        <aside className="rounded-[24px] border border-white/10 bg-slate-950/72 p-5 shadow-[0_18px_48px_rgba(2,8,20,0.28)]">
                            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                                <div>
                                    <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Current publishing state</div>
                                    <div className="mt-2 text-lg font-semibold text-white">{review.publishingState}</div>
                                </div>
                                <Pill tone={review.publishingTone} label={`${review.readiness.score}% ready`} compact />
                            </div>
                            <p className="mt-4 text-sm leading-6 text-slate-300">{review.publishingStateDetail}</p>
                            <div className="mt-5 grid gap-3">
                                <QuickSignal label="Publishing desk" value={review.profile.publishingDesk} />
                                <QuickSignal label="Publishing lead" value={review.profile.publishingLead} />
                                <QuickSignal label="Governance lead" value={review.profile.governanceLead} />
                                <QuickSignal label="Escalation contact" value={review.profile.escalationContact} />
                            </div>
                        </aside>
                    </div>
                </header>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <SummaryCard label="Institution readiness" value={`${review.readiness.score}%`} detail={review.readiness.detail} tone={review.publishingTone} />
                    <SummaryCard label="Approved packages" value={`${review.readiness.approvedPackages}`} detail="Institution review fully signed off" tone="emerald" />
                    <SummaryCard label="Conditional packages" value={`${review.readiness.conditionalPackages}`} detail="Published with restrictions still attached" tone="amber" />
                    <SummaryCard label="In review" value={`${review.readiness.inReviewPackages}`} detail="Still waiting on validation or packaging" tone="cyan" />
                    <SummaryCard label="Remediation required" value={`${review.readiness.remediationPackages}`} detail="Blocking institution-wide signoff" tone={review.readiness.remediationPackages > 0 ? 'rose' : 'slate'} />
                </section>

                <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] xl:items-start">
                    <div className="space-y-6">
                        <section className={panelClass}>
                            <div className="flex flex-col gap-3 border-b border-white/10 pb-5 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Institution profile</div>
                                    <h2 className="mt-2 text-2xl font-semibold text-white">{review.institutionName}</h2>
                                    <p className="mt-2 text-sm leading-6 text-slate-300">
                                        {review.institutionType}. This workspace-level review keeps publishing readiness visible even when buyer identity stays masked.
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-emerald-200/80">Provider lane</div>
                                    <div className="mt-2 text-sm font-semibold text-emerald-50">{review.profile.foundingProgramLabel}</div>
                                </div>
                            </div>

                            <div className="mt-5 grid gap-3 md:grid-cols-2">
                                <FieldCard label="Legal entity" value={review.profile.legalEntity} />
                                <FieldCard label="Headquarters" value={review.profile.headquarters} />
                                <FieldCard label="Operating regions" value={review.profile.operatingRegions.join(', ')} />
                                <FieldCard label="Publishing desk" value={review.profile.publishingDesk} />
                            </div>
                        </section>

                        <section className={panelClass}>
                            <div className="flex flex-col gap-3 border-b border-white/10 pb-5 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Rights verification checklist</div>
                                    <h2 className="mt-2 text-2xl font-semibold text-white">Rights verification checklist</h2>
                                    <p className="mt-2 text-sm leading-6 text-slate-300">
                                        These are the institution-level checks the publishing desk expects before more buyer-visible packets can go live.
                                    </p>
                                </div>
                                <Pill tone={review.publishingTone} label={review.publishingState} />
                            </div>

                            <div className="mt-5 grid gap-4">
                                {review.checklist.map(item => (
                                    <ChecklistCard key={item.id} item={item} />
                                ))}
                            </div>
                        </section>

                        <section className={panelClass}>
                            <div className="flex flex-col gap-3 border-b border-white/10 pb-5 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Review blockers and remediation</div>
                                    <h2 className="mt-2 text-2xl font-semibold text-white">Open blockers and remediation</h2>
                                    <p className="mt-2 text-sm leading-6 text-slate-300">
                                        Blockers stay tied to concrete submissions so the provider team can move between institution review and dataset status work without losing context.
                                    </p>
                                </div>
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
                                    {review.blockers.length} active item{review.blockers.length === 1 ? '' : 's'}
                                </span>
                            </div>

                            <div className="mt-5 grid gap-4">
                                {review.blockers.map(blocker => (
                                    <BlockerCard key={blocker.id} blocker={blocker} />
                                ))}
                            </div>
                        </section>

                        <section className={panelClass}>
                            <div className="flex flex-col gap-3 border-b border-white/10 pb-5 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Submission status</div>
                                    <h2 className="mt-2 text-2xl font-semibold text-white">Dataset submission map</h2>
                                    <p className="mt-2 text-sm leading-6 text-slate-300">
                                        One view across active submissions, institution review posture, and the next action each dataset still needs.
                                    </p>
                                </div>
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
                                    {review.submissions.length} submissions
                                </span>
                            </div>

                            <div className="mt-5 grid gap-4">
                                {review.submissions.map(submission => (
                                    <article key={submission.id} className="rounded-[22px] border border-white/10 bg-slate-950/72 p-5">
                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                            <div>
                                                <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Submission {submission.submissionId}</div>
                                                <h3 className="mt-2 text-lg font-semibold text-white">{submission.title}</h3>
                                                <p className="mt-2 text-sm leading-6 text-slate-300">{submission.note}</p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[submission.status]}`}>
                                                    {submission.status}
                                                </span>
                                                <Pill tone={getReviewStateTone(submission.reviewState)} label={submission.reviewState} compact />
                                            </div>
                                        </div>

                                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                                            <FieldCard label="Next action" value={submission.nextAction} />
                                            <FieldCard label="Validation context" value={submission.feedbackSummary} />
                                        </div>

                                        <div className="mt-4 flex flex-wrap gap-3">
                                            <Link
                                                to={submission.statusPath}
                                                className="rounded-xl border border-cyan-500/35 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-100 transition-colors hover:bg-cyan-500/20"
                                            >
                                                Open dataset status
                                            </Link>
                                            <Link
                                                to={submission.detailPath}
                                                className="rounded-xl border border-slate-700 bg-slate-950/45 px-4 py-2.5 text-sm font-semibold text-slate-100 transition-colors hover:border-cyan-400/40 hover:text-cyan-100"
                                            >
                                                Open dataset detail
                                            </Link>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="space-y-6 xl:sticky xl:top-24">
                        <section className={panelClass}>
                            <div className="border-b border-white/10 pb-5">
                                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Publishing readiness</div>
                                <h2 className="mt-2 text-2xl font-semibold text-white">Publishing readiness</h2>
                                <p className="mt-2 text-sm leading-6 text-slate-300">{review.readiness.headline}</p>
                            </div>

                            <div className="mt-5 grid gap-3">
                                <QuickSignal label="Approved package count" value={`${review.readiness.approvedPackages}`} />
                                <QuickSignal label="Conditional package count" value={`${review.readiness.conditionalPackages}`} />
                                <QuickSignal label="In review package count" value={`${review.readiness.inReviewPackages}`} />
                                <QuickSignal label="Closed package count" value={`${review.readiness.closedPackages}`} />
                            </div>
                        </section>

                        <section className={panelClass}>
                            <div className="border-b border-white/10 pb-5">
                                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Named reviewers</div>
                                <h2 className="mt-2 text-2xl font-semibold text-white">Who can clear this review</h2>
                            </div>

                            <div className="mt-5 grid gap-3">
                                {review.reviewers.map(reviewer => (
                                    <div key={`${review.reviewId}-${reviewer.role}`} className="rounded-[20px] border border-white/10 bg-slate-950/72 p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="text-sm font-semibold text-white">{reviewer.role}</div>
                                                <div className="mt-1 text-xs text-slate-400">{reviewer.name}</div>
                                            </div>
                                            <Pill tone={getReviewerTone(reviewer.status)} label={reviewer.status} compact />
                                        </div>
                                        <p className="mt-3 text-xs leading-5 text-slate-300">{reviewer.note}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className={panelClass}>
                            <div className="border-b border-white/10 pb-5">
                                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Buyer-visible packets</div>
                                <h2 className="mt-2 text-2xl font-semibold text-white">Published legitimacy surfaces</h2>
                            </div>

                            <div className="mt-5 grid gap-3">
                                {review.packetLinks.map(packet => (
                                    <Link
                                        key={packet.dealId}
                                        to={packet.to}
                                        className="rounded-[20px] border border-emerald-500/25 bg-emerald-500/10 p-4 transition-colors hover:bg-emerald-500/16"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="text-sm font-semibold text-white">{packet.label}</div>
                                                <div className="mt-1 text-xs text-emerald-100/80">{packet.dealId}</div>
                                            </div>
                                            <span className="rounded-full border border-emerald-500/35 bg-slate-950/40 px-2.5 py-1 text-[11px] font-semibold text-emerald-100">
                                                Open provider packet
                                            </span>
                                        </div>
                                        <p className="mt-3 text-xs leading-5 text-slate-200">{packet.summary}</p>
                                    </Link>
                                ))}
                            </div>
                        </section>

                        <section className={panelClass}>
                            <div className="border-b border-white/10 pb-5">
                                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Review timeline</div>
                                <h2 className="mt-2 text-2xl font-semibold text-white">Submission status and approvals</h2>
                            </div>

                            <div className="mt-5 space-y-3">
                                {review.timeline.map(event => (
                                    <div key={`${review.reviewId}-${event.at}-${event.label}`} className="rounded-[20px] border border-white/10 bg-slate-950/72 p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="text-sm font-semibold text-white">{event.label}</div>
                                            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${event.toneClasses}`}>
                                                {event.at}
                                            </span>
                                        </div>
                                        <p className="mt-3 text-xs leading-5 text-slate-300">{event.detail}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </section>
            </div>
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
    tone: ProviderInstitutionReviewTone
}) {
    return (
        <article className="rounded-[22px] border border-white/10 bg-[#081326]/88 p-5 shadow-[0_18px_48px_rgba(2,8,20,0.24)]">
            <div className="flex items-start justify-between gap-3">
                <div className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</div>
                <Pill tone={tone} label={value} compact />
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-300">{detail}</p>
        </article>
    )
}

function ChecklistCard({ item }: { item: ProviderPublishingChecklistItem }) {
    return (
        <article className="rounded-[22px] border border-white/10 bg-slate-950/72 p-5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-sm font-semibold text-white">{item.label}</div>
                    <div className="mt-2 text-xs uppercase tracking-[0.14em] text-slate-500">Owner: {item.owner}</div>
                </div>
                <Pill tone={item.tone} label={item.state} compact />
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">{item.detail}</p>
        </article>
    )
}

function BlockerCard({ blocker }: { blocker: ProviderPublishingBlocker }) {
    return (
        <article className="rounded-[22px] border border-white/10 bg-slate-950/72 p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <div className="text-xs uppercase tracking-[0.14em] text-slate-500">{blocker.datasetTitle}</div>
                    <h3 className="mt-2 text-lg font-semibold text-white">{blocker.title}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Pill tone={getSeverityTone(blocker.severity)} label={`${blocker.severity} severity`} compact />
                    <Pill tone={blocker.state === 'Monitoring' ? 'amber' : 'rose'} label={blocker.state} compact />
                </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">{blocker.detail}</p>
            <div className="mt-4 rounded-[18px] border border-white/10 bg-white/5 px-4 py-3">
                <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Next action</div>
                <div className="mt-2 text-sm leading-6 text-slate-100">{blocker.nextAction}</div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
                    Owner: {blocker.owner}
                </span>
                <Link
                    to={blocker.statusPath}
                    className="rounded-xl border border-cyan-500/35 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-100 transition-colors hover:bg-cyan-500/20"
                >
                    Open status route
                </Link>
            </div>
        </article>
    )
}

function FieldCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-[18px] border border-white/10 bg-slate-950/72 p-4">
            <div className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</div>
            <div className="mt-2 text-sm leading-6 text-slate-100">{value}</div>
        </div>
    )
}

function QuickSignal({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-[18px] border border-white/10 bg-slate-950/72 px-4 py-3">
            <div className="text-sm text-slate-300">{label}</div>
            <div className="text-sm font-semibold text-white">{value}</div>
        </div>
    )
}

function Pill({
    tone,
    label,
    compact = false
}: {
    tone: ProviderInstitutionReviewTone
    label: string
    compact?: boolean
}) {
    return (
        <span className={`rounded-full border px-3 ${compact ? 'py-1 text-[11px]' : 'py-1.5 text-xs'} font-semibold ${getToneClasses(tone)}`}>
            {label}
        </span>
    )
}

function getToneClasses(tone: ProviderInstitutionReviewTone) {
    switch (tone) {
        case 'emerald':
            return 'border-emerald-500/35 bg-emerald-500/10 text-emerald-100'
        case 'amber':
            return 'border-amber-500/35 bg-amber-500/10 text-amber-100'
        case 'rose':
            return 'border-rose-500/35 bg-rose-500/10 text-rose-100'
        case 'cyan':
            return 'border-cyan-500/35 bg-cyan-500/10 text-cyan-100'
        default:
            return 'border-white/10 bg-white/5 text-slate-200'
    }
}

function getSeverityTone(severity: ProviderPublishingBlocker['severity']): ProviderInstitutionReviewTone {
    switch (severity) {
        case 'High':
            return 'rose'
        case 'Medium':
            return 'amber'
        case 'Low':
            return 'cyan'
        default:
            return 'slate'
    }
}

function getReviewStateTone(state: ProviderPublishingReview['submissions'][number]['reviewState']): ProviderInstitutionReviewTone {
    switch (state) {
        case 'Approved package':
            return 'emerald'
        case 'Conditional release':
            return 'amber'
        case 'Publishing review':
            return 'cyan'
        case 'Needs remediation':
            return 'rose'
        case 'Closed':
            return 'slate'
        default:
            return 'slate'
    }
}

function getReviewerTone(
    status: ProviderPublishingReview['reviewers'][number]['status']
): ProviderInstitutionReviewTone {
    switch (status) {
        case 'Signed off':
            return 'emerald'
        case 'Monitoring':
            return 'amber'
        case 'Waiting on provider':
            return 'rose'
        default:
            return 'slate'
    }
}
