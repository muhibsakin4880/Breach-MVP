import { Link } from 'react-router-dom'
import AdminLayout from '../components/admin/AdminLayout'
import { adminVisibilityBoundaries, evidencePacks, incidentEvidenceRecords, incidentRunbook } from '../data/adminEvidenceData'

type StepStatus = 'done' | 'current' | 'pending'

const stepTone: Record<StepStatus, string> = {
    done: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
    current: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-100',
    pending: 'border-slate-600/40 bg-slate-800/40 text-slate-300'
}

const stepDot: Record<StepStatus, string> = {
    done: 'bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)]',
    current: 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]',
    pending: 'bg-slate-500'
}

const severityTone = {
    Critical: 'border-red-500/30 bg-red-500/10 text-red-200',
    High: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
    Medium: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200'
} as const

export default function IncidentResponsePage() {
    const activeRecord = incidentEvidenceRecords[0]
    const secondaryRecord = incidentEvidenceRecords[1]
    const linkedPack = evidencePacks.find((pack) => pack.id === activeRecord.evidencePackId)

    const incidentStats = [
        { label: 'Active Incident Chains', value: incidentEvidenceRecords.length.toString(), hint: 'Open or contained review-linked incidents' },
        { label: 'Evidence Packs Attached', value: evidencePacks.filter((pack) => pack.status !== 'Ready').length.toString(), hint: 'Incident-linked packs still being updated' },
        { label: 'Containment SLA Window', value: activeRecord.slaWindow, hint: 'Current incident clock' },
        { label: 'Visibility Boundaries', value: adminVisibilityBoundaries.length.toString(), hint: 'Rules applied during incident review' }
    ]

    return (
        <AdminLayout title="INCIDENT RESPONSE" subtitle="CONTAINMENT, EVIDENCE UPDATES & REVIEW-SAFE ESCALATION">
            <div className="space-y-6">
                <div className="grid grid-cols-12 gap-5">
                    {incidentStats.map((stat) => (
                        <article
                            key={stat.label}
                            className="col-span-3 rounded-xl border border-slate-800/50 bg-slate-900/60 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl"
                        >
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{stat.label}</p>
                            <p className="mt-3 text-3xl font-semibold text-slate-100">{stat.value}</p>
                            <p className="mt-2 text-[10px] leading-relaxed text-slate-400">{stat.hint}</p>
                        </article>
                    ))}
                </div>

                <section className="rounded-2xl border border-amber-500/30 bg-slate-900/60 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-200">
                                Active containment chain
                            </div>
                            <div>
                                <h1 className="text-3xl font-semibold tracking-tight text-slate-100">{activeRecord.title}</h1>
                                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">
                                    {activeRecord.residencyImpact}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center rounded-md border px-3 py-1.5 text-[11px] font-semibold tracking-wide ${severityTone[activeRecord.severity]}`}>
                                {activeRecord.severity}
                            </span>
                            <span className="inline-flex items-center rounded-md border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-cyan-200">
                                {activeRecord.status}
                            </span>
                            <span className="inline-flex items-center rounded-md border border-slate-700/80 bg-slate-800/60 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-slate-200">
                                {activeRecord.reviewId}
                            </span>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-4 lg:grid-cols-4">
                        <div className="rounded-xl border border-slate-800/80 bg-slate-950/45 p-4">
                            <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Environment</p>
                            <p className="mt-2 text-[12px] font-medium leading-relaxed text-slate-200">{activeRecord.environment}</p>
                        </div>
                        <div className="rounded-xl border border-slate-800/80 bg-slate-950/45 p-4">
                            <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Evidence pack</p>
                            <p className="mt-2 text-[12px] font-medium text-slate-200">{activeRecord.evidencePackId}</p>
                        </div>
                        <div className="rounded-xl border border-slate-800/80 bg-slate-950/45 p-4">
                            <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">SLA window</p>
                            <p className="mt-2 text-[12px] font-medium text-slate-200">{activeRecord.slaWindow}</p>
                        </div>
                        <div className="rounded-xl border border-slate-800/80 bg-slate-950/45 p-4">
                            <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Next action</p>
                            <p className="mt-2 text-[12px] font-medium leading-relaxed text-slate-200">{activeRecord.nextAction}</p>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-12 gap-5">
                    <section className="col-span-8 rounded-2xl border border-slate-800/50 bg-slate-900/60 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-300">Incident Runbook</h2>
                                <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                                    Run the incident through containment and evidence updates without expanding admin visibility unnecessarily.
                                </p>
                            </div>
                            <Link
                                to="/admin/audit-trail"
                                className="rounded-md border border-cyan-500/30 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-cyan-400/80 transition hover:border-cyan-500/50 hover:bg-cyan-500/10"
                            >
                                Open evidence ledger
                            </Link>
                        </div>

                        <div className="mt-5 space-y-4">
                            {incidentRunbook.map((step) => (
                                <div key={step.step} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <span className={`flex h-3 w-3 rounded-full ${stepDot[step.status]}`} />
                                        <span className="mt-2 h-full w-px bg-slate-700/80" />
                                    </div>
                                    <div className={`flex-1 rounded-xl border p-4 ${stepTone[step.status]}`}>
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">{step.step}</p>
                                                <h3 className="mt-1 text-[16px] font-semibold text-slate-100">{step.title}</h3>
                                            </div>
                                            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-semibold text-slate-200">
                                                {step.status}
                                            </span>
                                        </div>
                                        <p className="mt-3 text-[12px] leading-relaxed text-slate-300">{step.detail}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="col-span-4 rounded-2xl border border-slate-800/50 bg-slate-900/60 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
                        <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-300">Incident Evidence Attachment</h2>
                        <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                            Every incident chain points back to a review ID and an evidence pack before signoff can resume.
                        </p>

                        {linkedPack && (
                            <div className="mt-5 rounded-xl border border-slate-800/80 bg-slate-950/45 p-4">
                                <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">{linkedPack.id}</p>
                                <h3 className="mt-1 text-[13px] font-semibold text-slate-100">{linkedPack.name}</h3>
                                <p className="mt-3 text-[10px] leading-relaxed text-slate-400">{linkedPack.scope}</p>
                                <div className="mt-4 space-y-2">
                                    {linkedPack.contents.map((item) => (
                                        <div key={item} className="rounded-md border border-slate-800/80 bg-slate-900/60 px-3 py-2 text-[10px] text-slate-300">
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-5 rounded-xl border border-slate-800/80 bg-slate-950/45 p-4">
                            <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Linked review</p>
                            <p className="mt-2 text-[12px] font-medium text-slate-200">{activeRecord.reviewId}</p>
                            <p className="mt-2 text-[10px] leading-relaxed text-slate-500">{activeRecord.nextAction}</p>
                        </div>
                    </section>
                </div>

                <div className="grid grid-cols-12 gap-5">
                    <section className="col-span-7 rounded-2xl border border-slate-800/50 bg-slate-900/60 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-300">Additional Incident Chains</h2>
                                <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                                    Secondary records still tied to protected evaluation and audit-safe evidence handling.
                                </p>
                            </div>
                            <Link
                                to={`/admin/application-review/${secondaryRecord.reviewId}`}
                                className="rounded-md border border-slate-700/80 bg-slate-800/60 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-slate-300 transition hover:bg-slate-700/70"
                            >
                                Open linked review
                            </Link>
                        </div>

                        <div className="mt-4 rounded-xl border border-slate-800/80 bg-slate-950/45 p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">{secondaryRecord.id}</p>
                                    <h3 className="mt-1 text-[14px] font-semibold text-slate-100">{secondaryRecord.title}</h3>
                                    <p className="mt-3 text-[11px] leading-relaxed text-slate-400">{secondaryRecord.residencyImpact}</p>
                                </div>
                                <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${severityTone[secondaryRecord.severity]}`}>
                                    {secondaryRecord.status}
                                </span>
                            </div>
                            <div className="mt-4 grid gap-3 md:grid-cols-3">
                                <div className="rounded-md border border-slate-800/80 bg-slate-900/60 px-3 py-2">
                                    <p className="text-[9px] uppercase tracking-[0.12em] text-slate-500">Environment</p>
                                    <p className="mt-1 text-[10px] text-slate-300">{secondaryRecord.environment}</p>
                                </div>
                                <div className="rounded-md border border-slate-800/80 bg-slate-900/60 px-3 py-2">
                                    <p className="text-[9px] uppercase tracking-[0.12em] text-slate-500">Evidence pack</p>
                                    <p className="mt-1 text-[10px] text-slate-300">{secondaryRecord.evidencePackId}</p>
                                </div>
                                <div className="rounded-md border border-slate-800/80 bg-slate-900/60 px-3 py-2">
                                    <p className="text-[9px] uppercase tracking-[0.12em] text-slate-500">Next action</p>
                                    <p className="mt-1 text-[10px] text-slate-300">{secondaryRecord.nextAction}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="col-span-5 rounded-2xl border border-slate-800/50 bg-slate-900/60 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
                        <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-300">Least-Privilege During Incident Review</h2>
                        <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                            Incident response should expand evidence context, not raw-content exposure.
                        </p>

                        <div className="mt-4 space-y-3">
                            {adminVisibilityBoundaries.map((boundary) => (
                                <article key={boundary.title} className="rounded-lg border border-slate-800/80 bg-slate-950/45 p-4">
                                    <h3 className="text-[12px] font-semibold text-slate-100">{boundary.title}</h3>
                                    <p className="mt-2 text-[10px] leading-relaxed text-slate-400">{boundary.detail}</p>
                                    <p className="mt-3 text-[10px] text-emerald-200">Visible: {boundary.visibleToAdmins}</p>
                                    <p className="mt-2 text-[10px] text-slate-500">Held back: {boundary.hiddenFromAdmins}</p>
                                </article>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </AdminLayout>
    )
}
