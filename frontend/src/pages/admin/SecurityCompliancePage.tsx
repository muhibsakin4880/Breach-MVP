import { Link, Navigate } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import {
    adminVisibilityBoundaries,
    evidencePacks,
    responsibilityLanes,
    sharedResponsibilityPlatforms,
    type EvidencePackStatus
} from '../../data/adminEvidenceData'
import { useAuth } from '../../contexts/AuthContext'

const statusTone: Record<EvidencePackStatus, string> = {
    Ready: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
    'In Review': 'border-amber-500/30 bg-amber-500/10 text-amber-200',
    Blocked: 'border-red-500/30 bg-red-500/10 text-red-200'
}

export default function SecurityCompliancePage({
    title = 'Security & Compliance',
    subtitle = 'Shared-responsibility controls, evidence readiness, and least-privilege review posture'
}: { title?: string; subtitle?: string }) {
    const auth = useAuth()

    if (!auth.isAuthenticated) {
        return <Navigate to="/admin/login" replace />
    }

    const readyPackCount = evidencePacks.filter((pack) => pack.status === 'Ready').length
    const blockedPackCount = evidencePacks.filter((pack) => pack.status === 'Blocked').length

    const summaryCards = [
        {
            label: 'Shared-Responsibility Platforms',
            value: sharedResponsibilityPlatforms.length.toString(),
            detail: 'AWS, Azure, Google Cloud, and OCI deployment patterns are mapped into the same review model.'
        },
        {
            label: 'Evidence Packs Ready',
            value: readyPackCount.toString(),
            detail: 'Ready packs can move into final signoff without reopening control design discussions.'
        },
        {
            label: 'Evidence Packs Blocked',
            value: blockedPackCount.toString(),
            detail: 'Blocked packs are waiting on legal, residency, or ethics evidence before signoff can continue.'
        },
        {
            label: 'Visibility Boundaries',
            value: adminVisibilityBoundaries.length.toString(),
            detail: 'Admins see review state and evidence summaries first; raw material stays outside the default admin surface.'
        }
    ]

    return (
        <AdminLayout title={title} subtitle={subtitle}>
            <div className="space-y-6">
                <div className="grid grid-cols-12 gap-5">
                    {summaryCards.map((card) => (
                        <div key={card.label} className="col-span-3 rounded-xl border border-slate-800/50 bg-slate-900/60 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{card.label}</p>
                            <p className="mt-3 text-4xl font-semibold tracking-tight text-slate-100">{card.value}</p>
                            <p className="mt-3 text-[11px] leading-relaxed text-slate-400">{card.detail}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-12 gap-5">
                    <section className="col-span-7 rounded-xl border border-slate-800/50 bg-slate-900/60 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-300">Shared-Responsibility Matrix</h2>
                                <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                                    A clean split between inherited cloud controls, Redoubt workflow controls, and organization-side signoff duties.
                                </p>
                            </div>
                            <Link
                                to="/admin/audit-trail"
                                className="rounded-md border border-cyan-500/30 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-cyan-400/80 transition hover:border-cyan-500/50 hover:bg-cyan-500/10"
                            >
                                Open audit evidence
                            </Link>
                        </div>

                        <div className="mt-4 space-y-3">
                            {responsibilityLanes.map((lane) => (
                                <article key={lane.owner} className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">{lane.owner}</p>
                                            <h3 className="mt-1 text-[13px] font-semibold text-slate-100">{lane.title}</h3>
                                            <p className="mt-2 text-[11px] leading-relaxed text-slate-400">{lane.detail}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 grid gap-2 md:grid-cols-3">
                                        {lane.controls.map((control) => (
                                            <div key={control} className="rounded-md border border-slate-800/80 bg-slate-900/60 px-3 py-2 text-[10px] leading-relaxed text-slate-300">
                                                {control}
                                            </div>
                                        ))}
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section className="col-span-5 rounded-xl border border-slate-800/50 bg-slate-900/60 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
                        <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-300">Platform Alignment</h2>
                        <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                            Each cloud option inherits different infrastructure baselines, but the review logic stays consistent.
                        </p>

                        <div className="mt-4 space-y-3">
                            {sharedResponsibilityPlatforms.map((platform) => (
                                <article key={platform.platform} className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <h3 className="text-[13px] font-semibold text-slate-100">{platform.platform}</h3>
                                        <span className="rounded-md border border-slate-700/80 bg-slate-800/60 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-300">
                                            shared model
                                        </span>
                                    </div>
                                    <div className="mt-3 space-y-2">
                                        {platform.inheritedControls.map((control) => (
                                            <p key={control} className="text-[10px] leading-relaxed text-slate-300">{control}</p>
                                        ))}
                                    </div>
                                    <p className="mt-3 text-[10px] leading-relaxed text-slate-400">Redoubt focus: {platform.redoubtFocus}</p>
                                    <p className="mt-2 text-[10px] leading-relaxed text-slate-500">{platform.residencyNote}</p>
                                </article>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="grid grid-cols-12 gap-5">
                    <section className="col-span-7 rounded-xl border border-slate-800/50 bg-slate-900/60 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-300">Evidence Pack Readiness</h2>
                                <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                                    Review-ready packets used in signoff, incident containment, and audit handoff.
                                </p>
                            </div>
                            <Link
                                to="/admin/incident-response"
                                className="rounded-md border border-slate-700/80 bg-slate-800/60 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-slate-300 transition hover:bg-slate-700/70"
                            >
                                Open incident chain
                            </Link>
                        </div>

                        <div className="mt-4 space-y-3">
                            {evidencePacks.map((pack) => (
                                <article key={pack.id} className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">{pack.id} · {pack.reviewId}</p>
                                            <h3 className="mt-1 text-[13px] font-semibold text-slate-100">{pack.name}</h3>
                                            <p className="mt-2 text-[11px] leading-relaxed text-slate-300">{pack.scope}</p>
                                        </div>
                                        <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${statusTone[pack.status]}`}>
                                            {pack.status}
                                        </span>
                                    </div>
                                    <div className="mt-4 grid gap-2 md:grid-cols-2">
                                        {pack.contents.map((item) => (
                                            <div key={item} className="rounded-md border border-slate-800/80 bg-slate-900/60 px-3 py-2 text-[10px] text-slate-300">
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[10px] text-slate-500">
                                        <span>{pack.organization} · {pack.owner} · {pack.updatedAt}</span>
                                        {pack.blocker && <span className="text-amber-300">Blocker: {pack.blocker}</span>}
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section className="col-span-5 rounded-xl border border-slate-800/50 bg-slate-900/60 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
                        <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-300">Admin Visibility Boundaries</h2>
                        <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                            The admin console is intentionally limited so review teams can make decisions without turning this surface into a raw-data browser.
                        </p>

                        <div className="mt-4 space-y-3">
                            {adminVisibilityBoundaries.map((boundary) => (
                                <article key={boundary.title} className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-4">
                                    <h3 className="text-[13px] font-semibold text-slate-100">{boundary.title}</h3>
                                    <p className="mt-2 text-[11px] leading-relaxed text-slate-400">{boundary.detail}</p>
                                    <div className="mt-4 rounded-md border border-emerald-500/20 bg-emerald-500/10 p-3">
                                        <p className="text-[10px] uppercase tracking-[0.1em] text-emerald-200">Visible to admins</p>
                                        <p className="mt-1 text-[10px] leading-relaxed text-emerald-100/85">{boundary.visibleToAdmins}</p>
                                    </div>
                                    <div className="mt-3 rounded-md border border-slate-700/80 bg-slate-900/60 p-3">
                                        <p className="text-[10px] uppercase tracking-[0.1em] text-slate-300">Held outside default admin view</p>
                                        <p className="mt-1 text-[10px] leading-relaxed text-slate-400">{boundary.hiddenFromAdmins}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </AdminLayout>
    )
}
