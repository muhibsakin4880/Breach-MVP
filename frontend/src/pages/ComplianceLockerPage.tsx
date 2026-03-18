import React from 'react'

const certs = [
    {
        title: 'SOC 2 Type II',
        description: 'Inherited via AWS infrastructure',
        validity: 'Valid: Continuously maintained by AWS',
        badge: 'Inherited',
        badgeType: 'inherited'
    },
    {
        title: 'ISO 27001',
        description: 'Inherited via AWS infrastructure',
        validity: 'Valid: Continuously maintained by AWS',
        badge: 'Inherited',
        badgeType: 'inherited'
    },
    {
        title: 'HIPAA Eligible',
        description: 'AWS infrastructure is HIPAA eligible. Redoubt applies HIPAA controls at application layer.',
        badge: 'Inherited',
        badgeType: 'inherited'
    },
    {
        title: 'GDPR Aligned',
        description: 'Data residency in AWS EU-West-1. GDPR compliance inherited and extended by Redoubt.',
        badge: 'Active',
        badgeType: 'active'
    }
]

const templates = [
    { title: 'BAA Template (Business Associate Agreement)', action: 'Download Template' },
    { title: 'Data Processing Agreement (DPA)', action: 'Download Template' },
    { title: 'Participant Terms of Use', action: 'Download Template' }
]

const awsResponsibilities = [
    'Physical infrastructure security',
    'Network protection',
    'Hardware failure prevention',
    'SOC 2 Type II certified',
    'ISO 27001 certified',
    'HIPAA eligible infrastructure'
]

const reDoubtResponsibilities = [
    'Buyer-seller trust matching',
    'Dataset scanning & validation',
    'Access control & audit trail',
    'Consent & legal basis tracking',
    'Escrow transaction management',
    'Zero raw data storage policy'
]

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
                </header>

                <section className="mt-10">
                    <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-emerald-500/8 to-emerald-400/10 px-6 py-5 shadow-[0_0_30px_rgba(16,185,129,0.18)]">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_50%,rgba(16,185,129,0.25),transparent_35%)]" />
                        <div className="relative flex items-center justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-3">
                                <span className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.9)]" />
                                <div>
                                    <p className="text-base font-semibold text-emerald-200">Compliance via Inherited Trust</p>
                                    <p className="mt-1 text-sm text-slate-300">Redoubt's infrastructure is built on AWS Enterprise Shield — inheriting SOC 2 Type II, ISO 27001, HIPAA, and GDPR compliance by design.</p>
                                </div>
                            </div>
                            <div className="rounded-full border border-emerald-400/40 bg-emerald-500/20 px-4 py-2 text-xs font-semibold text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                AWS Inherited Compliance Active
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-10">
                    <h2 className="text-2xl font-semibold text-white">Shared Responsibility Model</h2>
                    <div className="mt-6 grid gap-6 lg:grid-cols-2">
                        <article className="relative overflow-hidden rounded-2xl border border-blue-500/40 bg-gradient-to-br from-blue-500/5 to-[#0a1628] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
                            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.15),transparent_50%)]" />
                            <div className="relative">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/40 bg-blue-500/10">
                                        <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-white">AWS Responsibility</h3>
                                </div>
                                <ul className="space-y-3">
                                    {awsResponsibilities.map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                                            <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-5 rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
                                    <p className="text-xs text-blue-200/80 italic">"If infrastructure is breached, liability rests with AWS"</p>
                                </div>
                            </div>
                        </article>

                        <article className="relative overflow-hidden rounded-2xl border border-cyan-500/40 bg-gradient-to-br from-cyan-500/5 to-[#0a1628] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
                            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_80%_80%,rgba(34,211,238,0.15),transparent_50%)]" />
                            <div className="relative">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/40 bg-cyan-500/10">
                                        <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-white">Redoubt Responsibility</h3>
                                </div>
                                <ul className="space-y-3">
                                    {reDoubtResponsibilities.map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                                            <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </article>
                    </div>
                </section>

                <section className="mt-10">
                    <article className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/8 to-amber-400/5 px-6 py-5 shadow-[0_0_25px_rgba(245,158,11,0.12)]">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_50%,rgba(245,158,11,0.2),transparent_40%)]" />
                        <div className="relative flex items-start gap-5">
                            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border border-amber-500/40 bg-amber-500/15 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                                <svg className="h-7 w-7 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-amber-200">Think of it like a bank vault</h3>
                                <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                                    AWS builds and secures the vault. Redoubt manages who gets access and what they can do inside. We never hold the contents.
                                </p>
                            </div>
                        </div>
                    </article>
                </section>

                <section className="mt-10">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <h2 className="text-2xl font-semibold text-white">Inherited Certifications via AWS</h2>
                        <span className="text-xs text-slate-500">Evidence-backed, exportable PDFs</span>
                    </div>
                    <div className="mt-6 grid gap-6 md:grid-cols-2">
                        {certs.map(cert => (
                            <article
                                key={cert.title}
                                className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a1628] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.25)]"
                            >
                                <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_18%_18%,rgba(16,185,129,0.12),transparent_40%)]" />
                                <div className="relative">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-sm uppercase tracking-[0.14em] text-slate-500">Certification</p>
                                            <h3 className="mt-2 text-xl font-semibold text-white">{cert.title}</h3>
                                        </div>
                                        <span className={`flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold ${
                                            cert.badgeType === 'active' 
                                                ? 'bg-emerald-500/10 text-emerald-200 border-emerald-500/30' 
                                                : 'bg-blue-500/10 text-blue-200 border-blue-500/30'
                                        }`}>
                                            {cert.badge}
                                        </span>
                                    </div>
                                    <p className="mt-3 text-sm text-slate-300">{cert.description}</p>
                                    {cert.validity && (
                                        <p className="mt-1 text-xs text-slate-400">{cert.validity}</p>
                                    )}
                                    <div className="mt-4 flex justify-end">
                                        <button className="rounded-xl border border-blue-400/50 text-blue-300 px-4 py-2 text-xs font-semibold hover:bg-blue-500/10 transition-colors flex items-center gap-2">
                                            View AWS Compliance Page
                                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="mt-10">
                    <article className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a1628] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/5">
                                <svg className="h-5 w-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-white">Our Legal Position</h3>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-[#050f1e] p-5 font-mono text-sm leading-relaxed text-slate-300 shadow-inner">
                            <p className="mb-3">Redoubt does not store raw dataset content on proprietary infrastructure. All data is encrypted at rest (AES-256) and in transit (TLS 1.3) within AWS S3. In the event of infrastructure-level security incidents, liability rests with the infrastructure provider per AWS Shared Responsibility Model. Redoubt's architectural responsibility is limited to access control, audit integrity, and trust validation.</p>
                        </div>
                        <p className="mt-4 text-xs text-slate-500">
                            Reference: AWS Shared Responsibility Model — aws.amazon.com/compliance/shared-responsibility-model
                        </p>
                    </article>
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
            </div>
        </div>
    )
}
