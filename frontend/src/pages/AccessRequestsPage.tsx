import { Link } from 'react-router-dom'
import {
    activityDot,
    approvedDatasets,
    confidenceColor,
    datasetRequests,
    recentActivity,
    requestStatusLabel,
    statusStyles,
    type DatasetRequest
} from '../data/workspaceData'

type WorkflowLane = {
    label: string
    count: number
    detail: string
    badgeClassName: string
}

type SummaryCard = {
    label: string
    value: string
    detail: string
    accentClassName: string
}

type RequestWorkflowMeta = {
    label: string
    detail: string
    actionLabel: string
    chipClassName: string
}

const createSummaryCards = (needsActionCount: number, pendingCount: number, approvedCount: number): SummaryCard[] => [
    {
        label: 'Needs your action',
        value: String(needsActionCount).padStart(2, '0'),
        detail: 'Requests with reviewer notes or a resubmission requirement.',
        accentClassName: 'bg-amber-400'
    },
    {
        label: 'Pending review',
        value: String(pendingCount).padStart(2, '0'),
        detail: 'Packages moving through reviewer and policy checks.',
        accentClassName: 'bg-cyan-400'
    },
    {
        label: 'Approved access',
        value: String(approvedCount).padStart(2, '0'),
        detail: 'Requests already cleared for workspace or API access.',
        accentClassName: 'bg-emerald-400'
    },
    {
        label: 'Active routes',
        value: String(approvedDatasets.length).padStart(2, '0'),
        detail: 'Approved delivery paths currently active in this workspace.',
        accentClassName: 'bg-slate-300'
    }
]

function requestNeedsAction(request: DatasetRequest) {
    return request.status === 'REQUEST_REJECTED' || (request.status === 'REVIEW_IN_PROGRESS' && Boolean(request.reviewerFeedback))
}

function getRequestWorkflowMeta(request: DatasetRequest): RequestWorkflowMeta {
    if (request.status === 'REQUEST_APPROVED') {
        return {
            label: 'Access is live',
            detail: `Use ${request.delivery} through the approved route and watch the next review window.`,
            actionLabel: 'Open request',
            chipClassName: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
        }
    }

    if (request.status === 'REQUEST_REJECTED') {
        return {
            label: 'Prepare resubmission',
            detail:
                request.reviewerFeedback ??
                request.notes ??
                'Review the decline reason and update the request package before resubmitting.',
            actionLabel: 'View reason',
            chipClassName: 'border-rose-400/30 bg-rose-500/10 text-rose-200'
        }
    }

    if (request.reviewerFeedback) {
        return {
            label: 'Respond to reviewer note',
            detail: request.reviewerFeedback,
            actionLabel: 'Review note',
            chipClassName: 'border-amber-400/30 bg-amber-500/10 text-amber-200'
        }
    }

    return {
        label: 'Awaiting reviewer decision',
        detail: request.expectedResolution ?? 'Reviewer assignment and policy checks are still in motion.',
        actionLabel: 'Track request',
        chipClassName: 'border-cyan-400/30 bg-cyan-500/10 text-cyan-200'
    }
}

function getWorkflowLanes(pendingCount: number, approvedCount: number, rejectedCount: number): WorkflowLane[] {
    return [
        {
            label: 'Pending review',
            count: pendingCount,
            detail: 'Requests currently moving through reviewer checks and governance review.',
            badgeClassName: 'border-cyan-400/30 bg-cyan-500/10 text-cyan-200'
        },
        {
            label: 'Approved access',
            count: approvedCount,
            detail: 'Requests already approved and ready for active dataset usage.',
            badgeClassName: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
        },
        {
            label: 'Resubmission required',
            count: rejectedCount,
            detail: 'Requests that need updated evidence, clarification, or a fresh submission.',
            badgeClassName: 'border-rose-400/30 bg-rose-500/10 text-rose-200'
        }
    ]
}

export default function AccessRequestsPage() {
    const pendingRequests = datasetRequests.filter(request => request.status === 'REVIEW_IN_PROGRESS')
    const approvedCount = datasetRequests.filter(request => request.status === 'REQUEST_APPROVED').length
    const rejectedCount = datasetRequests.filter(request => request.status === 'REQUEST_REJECTED').length
    const needsActionRequests = datasetRequests.filter(requestNeedsAction)
    const nextReviewTarget = pendingRequests.find(request => request.expectedResolution)?.expectedResolution ?? 'No pending review milestones'
    const lanes = getWorkflowLanes(pendingRequests.length, approvedCount, rejectedCount)

    return (
        <div className="min-h-screen bg-[#0a111f] text-white">
            <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
                <header className="rounded-[28px] border border-slate-800 bg-[#10182c]/95 p-6 shadow-[0_24px_70px_-45px_rgba(2,6,23,0.95)]">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950/70 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                                Participant workflow
                            </div>
                            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">Access Requests</h1>
                            <p className="mt-2 text-sm leading-6 text-slate-400">
                                Track every request from submission through review, clarification, approval, and access activation without leaving the participant workspace.
                            </p>
                        </div>

                        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
                            <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-100">
                                <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                                {needsActionRequests.length} requests need your input
                            </span>
                            <div className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3">
                                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Next review target</div>
                                <div className="mt-2 text-sm font-medium text-slate-200">{nextReviewTarget}</div>
                            </div>
                            <a
                                href="#request-queue"
                                className="inline-flex items-center justify-center rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_40px_-24px_rgba(34,211,238,0.75)] transition-all duration-200 hover:-translate-y-px hover:bg-cyan-300"
                            >
                                Review request queue
                            </a>
                        </div>
                    </div>
                </header>

                <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {createSummaryCards(needsActionRequests.length, pendingRequests.length, approvedCount).map(card => (
                        <article
                            key={card.label}
                            className="rounded-2xl border border-slate-800 bg-[#10182c]/88 px-5 py-5 shadow-[0_18px_50px_-38px_rgba(2,6,23,0.95)]"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">{card.label}</p>
                                <span className={`h-2.5 w-2.5 rounded-full ${card.accentClassName}`} />
                            </div>
                            <p className="mt-4 text-[1.9rem] font-semibold tracking-[-0.06em] text-slate-50">{card.value}</p>
                            <p className="mt-2 text-sm leading-6 text-slate-400">{card.detail}</p>
                        </article>
                    ))}
                </section>

                <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,0.95fr)]">
                    <article
                        id="request-queue"
                        className="rounded-[28px] border border-slate-800 bg-[#10182c]/95 p-6 shadow-[0_24px_70px_-45px_rgba(2,6,23,0.95)]"
                    >
                        <div className="flex flex-col gap-3 border-b border-slate-800 pb-5 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Request queue</h2>
                                <p className="mt-2 text-sm leading-6 text-slate-400">
                                    Use this queue to scan status, spot blockers, and jump into the exact request that needs the next participant action.
                                </p>
                            </div>
                            <span className="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300">
                                {datasetRequests.length} active requests
                            </span>
                        </div>

                        <div className="mt-5 overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="border-b border-slate-800 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                                    <tr>
                                        <th className="py-3 pr-4 text-left font-medium">Request</th>
                                        <th className="hidden py-3 px-4 text-left font-medium md:table-cell">Signal</th>
                                        <th className="py-3 px-4 text-left font-medium">Status</th>
                                        <th className="hidden py-3 px-4 text-left font-medium lg:table-cell">Your next step</th>
                                        <th className="hidden py-3 px-4 text-left font-medium xl:table-cell">Updated</th>
                                        <th className="py-3 pl-4 text-right font-medium">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-900/80">
                                    {datasetRequests.map(request => (
                                        <RequestTableRow key={request.id} request={request} />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </article>

                    <div className="space-y-6">
                        <section className="rounded-[28px] border border-slate-800 bg-[#10182c]/95 p-6 shadow-[0_24px_70px_-45px_rgba(2,6,23,0.95)]">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Needs your action now</h2>
                                    <p className="mt-2 text-sm leading-6 text-slate-400">
                                        The requests most likely to move if you respond or resubmit today.
                                    </p>
                                </div>
                                <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-200">
                                    {needsActionRequests.length} open
                                </span>
                            </div>

                            <div className="mt-5 space-y-3">
                                {needsActionRequests.map(request => {
                                    const meta = getRequestWorkflowMeta(request)
                                    return (
                                        <div
                                            key={request.id}
                                            className="rounded-2xl border border-slate-800 bg-slate-950/55 px-4 py-4"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="text-sm font-semibold text-white">{request.name}</div>
                                                    <div className="mt-1 text-xs text-slate-500">{request.requestNumber}</div>
                                                </div>
                                                <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold ${meta.chipClassName}`}>
                                                    {meta.label}
                                                </span>
                                            </div>
                                            <p className="mt-3 text-sm leading-6 text-slate-300">{meta.detail}</p>
                                            <Link
                                                to={`/access-requests/${request.id}`}
                                                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-cyan-400/40 hover:text-white"
                                            >
                                                {meta.actionLabel}
                                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                                </svg>
                                            </Link>
                                        </div>
                                    )
                                })}
                            </div>
                        </section>

                        <section className="rounded-[28px] border border-slate-800 bg-[#10182c]/95 p-6 shadow-[0_24px_70px_-45px_rgba(2,6,23,0.95)]">
                            <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Current workflow lanes</h2>
                            <p className="mt-2 text-sm leading-6 text-slate-400">
                                A compact read on where the participant request portfolio is sitting right now.
                            </p>

                            <div className="mt-5 space-y-3">
                                {lanes.map(lane => (
                                    <div
                                        key={lane.label}
                                        className="flex items-start justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/55 px-4 py-4"
                                    >
                                        <div>
                                            <div className="text-sm font-semibold text-white">{lane.label}</div>
                                            <div className="mt-2 text-sm leading-6 text-slate-400">{lane.detail}</div>
                                        </div>
                                        <span className={`inline-flex min-w-[2.5rem] items-center justify-center rounded-full border px-3 py-1 text-sm font-semibold ${lane.badgeClassName}`}>
                                            {lane.count}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </section>

                <section className="mt-8 rounded-[28px] border border-slate-800 bg-[#10182c]/95 p-6 shadow-[0_24px_70px_-45px_rgba(2,6,23,0.95)]">
                    <div className="flex flex-col gap-3 border-b border-slate-800 pb-5 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Recent request activity</h2>
                            <p className="mt-2 text-sm leading-6 text-slate-400">
                                Timeline context for the current request pipeline across approvals, pending reviews, and decline outcomes.
                            </p>
                        </div>
                        <span className="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300">
                            {recentActivity.length} timeline events
                        </span>
                    </div>

                    <div className="mt-6 space-y-4">
                        {recentActivity.map((item, index) => (
                            <div key={item.label} className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <span className={`mt-1 inline-block h-3 w-3 rounded-full ${activityDot[item.type]}`} />
                                    {index < recentActivity.length - 1 && <span className="mt-2 h-full w-px bg-slate-800" />}
                                </div>
                                <div className="pb-5">
                                    <div className="text-sm font-medium text-white">{item.label}</div>
                                    <div className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">{item.timestamp}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    )
}

function RequestTableRow({ request }: { request: DatasetRequest }) {
    const workflow = getRequestWorkflowMeta(request)

    return (
        <tr className="align-top transition-colors hover:bg-white/[0.02]">
            <td className="py-4 pr-4">
                <div className="font-semibold text-white">{request.name}</div>
                <div className="mt-1 text-xs text-slate-500">{request.requestNumber}</div>
                <div className="mt-2 text-xs text-slate-400">
                    {request.category} · {request.delivery}
                </div>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1 text-[11px] font-semibold text-slate-300 md:hidden">
                    <span className={`${confidenceColor(request.confidence)}`}>{request.confidence}%</span>
                    Request signal
                </div>
                <div className="mt-3 lg:hidden">
                    <div className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold ${workflow.chipClassName}`}>
                        {workflow.label}
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-400">{workflow.detail}</p>
                </div>
            </td>
            <td className="hidden py-4 px-4 md:table-cell">
                <div className={`text-lg font-semibold ${confidenceColor(request.confidence)}`}>{request.confidence}%</div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-900">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-emerald-500"
                        style={{ width: `${request.confidence}%` }}
                    />
                </div>
                <div className="mt-2 text-xs uppercase tracking-[0.14em] text-slate-500">Request signal</div>
            </td>
            <td className="py-4 px-4">
                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${statusStyles[request.status]}`}>
                    {requestStatusLabel(request.status)}
                </span>
            </td>
            <td className="hidden py-4 px-4 lg:table-cell">
                <div className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold ${workflow.chipClassName}`}>
                    {workflow.label}
                </div>
                <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">{workflow.detail}</p>
            </td>
            <td className="hidden py-4 px-4 xl:table-cell">
                <div className="text-sm text-slate-200">{request.lastUpdated}</div>
                <div className="mt-2 text-xs text-slate-500">{request.submittedDate}</div>
            </td>
            <td className="py-4 pl-4 text-right">
                <Link
                    to={`/access-requests/${request.id}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition-colors transition-transform duration-100 hover:border-cyan-400/40 hover:text-white active:scale-95"
                >
                    {workflow.actionLabel}
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            </td>
        </tr>
    )
}
