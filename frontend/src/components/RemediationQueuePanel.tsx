import { useMemo } from 'react'
import {
    buildRemediationQueue,
    type RemediationSeverity,
    type RemediationTask
} from '../domain/remediationQueue'
import type { ResilienceDigest } from '../domain/resilienceInsights'

type RemediationQueuePanelProps = {
    digests: ResilienceDigest[]
    title?: string
    compact?: boolean
    className?: string
}

const severityClasses: Record<RemediationSeverity, string> = {
    critical: 'border-rose-500/40 bg-rose-500/10 text-rose-200',
    high: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
    medium: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200',
    low: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
}

export default function RemediationQueuePanel({
    digests,
    title = 'Remediation Queue',
    compact = false,
    className = ''
}: RemediationQueuePanelProps) {
    const queue = useMemo(() => buildRemediationQueue(digests), [digests])
    const visibleTasks = compact ? queue.tasks.slice(0, 3) : queue.tasks.slice(0, 6)

    return (
        <section className={`rounded-xl border border-slate-700 bg-slate-900/70 p-4 ${className}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{title}</p>
                    <p className="mt-1 text-sm font-semibold text-white">
                        {queue.tasks.length} remediation task(s) · Generated {queue.generatedAt}
                    </p>
                </div>
                <span className="rounded-full border border-slate-600/80 bg-slate-900/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-300">
                    Contracts {queue.contractsMonitored}
                </span>
            </div>

            <div className={`mt-3 grid gap-3 ${compact ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-5'}`}>
                <Metric label="Critical" value={`${queue.criticalCount}`} />
                <Metric label="High" value={`${queue.highCount}`} />
                <Metric label="Medium" value={`${queue.mediumCount}`} />
                <Metric label="Low" value={`${queue.lowCount}`} />
                <Metric label="Top Priority" value={`${queue.topTask?.priorityScore ?? 0}/100`} />
            </div>

            {queue.topTask && (
                <div className="mt-3 rounded-lg border border-white/5 bg-white/5 p-3">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Execution Focus</p>
                    <p className="mt-1 text-xs text-slate-100">
                        {queue.topTask.contractId} · {queue.topTask.title}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-300">{queue.topTask.detail}</p>
                    <p className="mt-1 text-[11px] text-cyan-200">Next: {queue.topTask.nextAction}</p>
                </div>
            )}

            <div className="mt-3 space-y-2">
                {visibleTasks.map(task => (
                    <TaskRow key={task.id} task={task} />
                ))}
            </div>
        </section>
    )
}

type MetricProps = {
    label: string
    value: string
}

function Metric({ label, value }: MetricProps) {
    return (
        <div className="rounded-lg border border-white/5 bg-white/5 p-2">
            <p className="text-[10px] uppercase tracking-[0.1em] text-slate-500">{label}</p>
            <p className="mt-1 text-xs text-slate-200">{value}</p>
        </div>
    )
}

type TaskRowProps = {
    task: RemediationTask
}

function TaskRow({ task }: TaskRowProps) {
    const blockers = task.blockers.slice(0, 1)
    return (
        <article className="rounded-lg border border-white/5 bg-white/5 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold text-slate-100">{task.contractId}</p>
                <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${severityClasses[task.severity]}`}
                >
                    {task.severity}
                </span>
            </div>
            <p className="mt-1 text-xs text-slate-100">{task.title}</p>
            <p className="mt-1 text-[11px] text-slate-300">{task.detail}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                <span>Owner: {task.owner}</span>
                <span className="text-slate-700">|</span>
                <span>Due: {task.dueInHours}h</span>
                <span className="text-slate-700">|</span>
                <span>Priority: {task.priorityScore}/100</span>
            </div>
            <p className="mt-1 text-[11px] text-cyan-200">Next: {task.nextAction}</p>
            {blockers.map(blocker => (
                <p key={blocker} className="mt-1 text-[11px] text-rose-200">
                    Blocker: {blocker}
                </p>
            ))}
        </article>
    )
}

