import React from 'react'

type Tone = 'ok' | 'warn'

const certs = [
    {
        title: 'SOC 2 Type II Report',
        meta: 'Issued: Jan 2026 | Valid until: Jan 2027',
        action: 'Download',
        tone: 'ok' as Tone
    },
    {
        title: 'HIPAA Compliance Assessment',
        meta: 'Issued: Feb 2026 | Status: Current',
        action: 'Download',
        tone: 'ok' as Tone
    },
    {
        title: 'GDPR Data Processing Agreement',
        meta: 'Issued: Dec 2025 | Status: Current',
        action: 'Download',
        tone: 'ok' as Tone
    },
    {
        title: 'ISO 27001 Certification',
        meta: 'Status: In Progress — Expected Q3 2026',
        action: 'View Roadmap',
        tone: 'warn' as Tone
    }
]

const templates = [
    { title: 'BAA Template (Business Associate Agreement)', action: 'Download Template' },
    { title: 'Data Processing Agreement (DPA)', action: 'Download Template' },
    { title: 'Participant Terms of Use', action: 'Download Template' }
]

const vendors = [
    { name: 'AWS', role: 'Infrastructure', status: 'SOC2 Certified', regions: 'US/EU', tone: 'ok' as Tone },
    { name: 'Stripe', role: 'Payments', status: 'PCI-DSS', regions: 'Global', tone: 'ok' as Tone },
    { name: 'SendGrid', role: 'Email', status: 'SOC2 Certified', regions: 'Global', tone: 'ok' as Tone }
]

const toneClass: Record<Tone, string> = {
    ok: 'bg-emerald-500/10 text-emerald-200 border-emerald-500/30',
    warn: 'bg-amber-500/10 text-amber-200 border-amber-500/30'
}

const dotClass: Record<Tone, string> = {
    ok: 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]',
    warn: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]'
}

export default function ComplianceLockerPage() {
    return (
        <div className="relative min-h-screen bg-[#010915] text-white">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(52,211,153,0.12),transparent_40%),radial-gradient(circle_at_82%_0%,rgba(59,130,246,0.08),transparent_35%)]" />
            <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-10">
                <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Compliance Evidence Locker
                        </div>
                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">Compliance Evidence Locker</h1>
                        <p className="mt-2 text-slate-400">
                            Certified artifacts, signed policies, and audit-ready documentation for regulated industry access
                        </p>
                    </div>
                    <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.18)]">
                        Evidence immutability & integrity checks enabled
                    </div>
                </header>

                <section className="mt-10">
                    <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-emerald-500/8 to-emerald-400/10 px-6 py-4 shadow-[0_0_30px_rgba(16,185,129,0.18)]">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_50%,rgba(16,185,129,0.25),transparent_35%)]" />
                        <div className="relative flex items-center justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-3">
                                <span className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.9)]" />
                                <div>
                                    <p className="text-base font-semibold text-emerald-200">Audit Ready — All critical documents current</p>
                                    <p className="text-xs text-emerald-100/70">Chain-of-custody logged for every artifact</p>
                                </div>
                            </div>
                            <div className="text-xs font-medium text-emerald-100/70">Last reviewed: March 2026</div>
                        </div>
                    </div>
                </section>

                <section className="mt-10">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <h2 className="text-2xl font-semibold text-white">Certification Artifacts</h2>
                        <span className="text-xs text-slate-500">Evidence-backed, exportable PDFs</span>
                    </div>
                    <div className="mt-6 grid gap-6 md:grid-cols-2">
                        {certs.map(cert => (
                            <article
                                key={cert.title}
                                className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a1628] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.25)]"
                            >
                                <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_18%_18%,rgba(16,185,129,0.12),transparent_40%)]" />
                                <div className="relative flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm uppercase tracking-[0.14em] text-slate-500">Artifact</p>
                                        <h3 className="mt-2 text-xl font-semibold text-white">{cert.title}</h3>
                                        <p className="mt-2 text-sm text-slate-300">{cert.meta}</p>
                                    </div>
                                    <span className={`flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold ${toneClass[cert.tone]}`}>
                                        <span className={`h-2.5 w-2.5 rounded-full ${dotClass[cert.tone]}`} />
                                        {cert.tone === 'warn' ? 'In Progress' : 'Current'}
                                    </span>
                                </div>
                                <div className="relative mt-4 flex justify-end">
                                    <button
                                        className={`rounded-xl px-4 py-2 text-sm font-semibold border transition-colors ${
                                            cert.tone === 'warn'
                                                ? 'border-amber-400 text-amber-200 hover:bg-amber-500/10'
                                                : 'border-emerald-400 text-emerald-200 hover:bg-emerald-500/10'
                                        }`}
                                    >
                                        {cert.action}
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="mt-10 grid gap-6 lg:grid-cols-[2fr_1fr]">
                    <article className="rounded-2xl border border-white/10 bg-[#0a1628] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <h2 className="text-xl font-semibold text-white">Legal Templates</h2>
                            <span className="text-xs text-slate-500">Pre-reviewed, regulator-friendly</span>
                        </div>
                        <div className="mt-6 space-y-4">
                            {templates.map(template => (
                                <div key={template.title} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3">
                                    <div>
                                        <p className="text-sm font-semibold text-white">{template.title}</p>
                                        <p className="text-xs text-slate-500">Version-controlled, tracked distribution</p>
                                    </div>
                                    <button className="rounded-lg border border-cyan-400 text-cyan-200 px-3 py-2 text-xs font-semibold hover:bg-cyan-500/10 transition-colors">
                                        {template.action}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </article>

                    <article className="rounded-2xl border border-white/10 bg-[#0a1628] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <h2 className="text-xl font-semibold text-white">Audit Calendar</h2>
                            <span className="flex items-center gap-2 text-xs text-slate-400">
                                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                Upcoming checkpoints
                            </span>
                        </div>
                        <div className="mt-5 space-y-3">
                            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2">
                                <p className="text-sm text-slate-300">Next scheduled audit</p>
                                <p className="text-sm font-semibold text-white">June 2026</p>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2">
                                <p className="text-sm text-slate-300">Last penetration test</p>
                                <p className="text-sm font-semibold text-white">March 2026</p>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2">
                                <p className="text-sm text-slate-300">Next pentest</p>
                                <p className="text-sm font-semibold text-white">September 2026</p>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2">
                                <p className="text-sm text-slate-300">Compliance review cadence</p>
                                <p className="text-sm font-semibold text-white">Quarterly</p>
                            </div>
                        </div>
                    </article>
                </section>

                <section className="mt-10">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <h2 className="text-2xl font-semibold text-white">Vendor Security</h2>
                        <span className="text-xs text-slate-500">Subprocessor transparency</span>
                    </div>
                    <div className="mt-5 grid gap-4 md:grid-cols-3">
                        {vendors.map(vendor => (
                            <div key={vendor.name} className="rounded-2xl border border-white/10 bg-[#0a1628] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-white">{vendor.name}</p>
                                        <p className="text-xs text-slate-500">{vendor.role}</p>
                                    </div>
                                    <span className={`flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold ${toneClass[vendor.tone]}`}>
                                        <span className={`h-2.5 w-2.5 rounded-full ${dotClass[vendor.tone]}`} />
                                        {vendor.status}
                                    </span>
                                </div>
                                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                                    <span>Regions</span>
                                    <span className="text-slate-200">{vendor.regions}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    )
}
