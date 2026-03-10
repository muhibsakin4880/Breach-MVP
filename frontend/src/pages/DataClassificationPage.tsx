import React from 'react'

type SensitivityTone = 'low' | 'medium' | 'high' | 'critical'

const summaryStats = [
    { label: 'Total Datasets Scanned', value: '24', hint: 'Coverage' },
    { label: 'PHI Detected', value: '4', hint: 'Protected health' },
    { label: 'PII Detected', value: '7', hint: 'Personally identifiable' },
    { label: 'Clean (No Sensitive Data)', value: '13', hint: 'No tags' }
]

const datasets = [
    {
        dataset: 'Global Climate 2020-2024',
        sensitivity: 'Low',
        phi: 'None',
        pii: 'None',
        residency: 'US/EU',
        masking: 'None required',
        tone: 'low' as SensitivityTone
    },
    {
        dataset: 'Clinical Outcomes Delta',
        sensitivity: 'Critical',
        phi: 'Detected',
        pii: 'Detected',
        residency: 'US only',
        masking: 'Full masking',
        tone: 'critical' as SensitivityTone
    },
    {
        dataset: 'Financial Tick Data',
        sensitivity: 'High',
        phi: 'None',
        pii: 'Detected',
        residency: 'US/EU',
        masking: 'Partial masking',
        tone: 'high' as SensitivityTone
    },
    {
        dataset: 'Consumer Behavior Analytics',
        sensitivity: 'Medium',
        phi: 'None',
        pii: 'Detected',
        residency: 'Global',
        masking: 'Aggregation only',
        tone: 'medium' as SensitivityTone
    },
    {
        dataset: 'Genomics Research Dataset',
        sensitivity: 'Critical',
        phi: 'Detected',
        pii: 'Detected',
        residency: 'US only',
        masking: 'Full masking',
        tone: 'critical' as SensitivityTone
    },
    {
        dataset: 'Satellite Land Use 2024',
        sensitivity: 'Low',
        phi: 'None',
        pii: 'None',
        residency: 'Global',
        masking: 'None required',
        tone: 'low' as SensitivityTone
    }
]

const phiTags = [
    { label: 'patient_id', tone: 'critical' },
    { label: 'date_of_birth', tone: 'critical' },
    { label: 'diagnosis_code', tone: 'critical' },
    { label: 'provider_name', tone: 'high' },
    { label: 'zip_code', tone: 'high' },
    { label: 'admission_date', tone: 'high' }
]

const toneBadge: Record<SensitivityTone, string> = {
    low: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
    medium: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
    high: 'border-orange-500/40 bg-orange-500/10 text-orange-200',
    critical: 'border-rose-500/40 bg-rose-500/10 text-rose-200'
}

const tagTone: Record<string, string> = {
    critical: 'border-rose-500/40 bg-rose-500/15 text-rose-200',
    high: 'border-amber-500/40 bg-amber-500/10 text-amber-200'
}

export default function DataClassificationPage() {
    return (
        <div className="relative min-h-screen bg-[#040812] text-white">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(16,185,129,0.12),transparent_40%),radial-gradient(circle_at_85%_10%,rgba(59,130,246,0.14),transparent_35%),radial-gradient(circle_at_50%_80%,rgba(244,63,94,0.08),transparent_35%)]" />
            <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-10">
                <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Security & Compliance
                        </div>
                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                            Data Classification & PHI/PII Tagging
                        </h1>
                        <p className="mt-2 max-w-2xl text-slate-400">
                            Automated sensitivity detection, residency constraints, and masking policies per role.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100 shadow-[0_0_24px_rgba(16,185,129,0.25)]">
                        Auto-classification active - Last scan: 2 hours ago
                    </div>
                </header>

                <section className="mt-8">
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-emerald-500/8 to-emerald-400/10 px-5 py-4 shadow-[0_12px_40px_rgba(16,185,129,0.2)]">
                        <div className="flex items-center gap-3">
                            <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.9)]" />
                            <div>
                                <p className="text-sm font-semibold text-white">Auto-classification active - All datasets scanned</p>
                                <p className="text-xs text-emerald-100/80">Last scan: 2 hours ago</p>
                            </div>
                        </div>
                        <span className="rounded-full border border-emerald-400/40 bg-emerald-500/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-100">
                            Green badge
                        </span>
                    </div>
                </section>

                <section className="mt-8">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {summaryStats.map(stat => (
                            <article
                                key={stat.label}
                                className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
                            >
                                <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.18),transparent_45%)]" />
                                <div className="relative flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{stat.label}</p>
                                        <p className="mt-3 text-3xl font-semibold text-white">{stat.value}</p>
                                        <p className="mt-1 text-xs text-slate-400">{stat.hint}</p>
                                    </div>
                                    <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="mt-10 grid gap-6 xl:grid-cols-[2fr_1fr]">
                    <article className="rounded-2xl border border-white/10 bg-[#0a1424] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.28)]">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div>
                                <h2 className="text-xl font-semibold text-white">Dataset Classification</h2>
                                <p className="text-sm text-slate-400">Sensitivity, residency, and masking policies</p>
                            </div>
                            <span className="text-xs text-slate-500">6 datasets</span>
                        </div>
                        <div className="mt-5 overflow-hidden rounded-xl border border-white/5">
                            <table className="w-full text-sm">
                                <thead className="bg-white/5 text-xs uppercase tracking-[0.12em] text-slate-400">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Dataset</th>
                                        <th className="px-4 py-3 text-left">Sensitivity</th>
                                        <th className="px-4 py-3 text-left">PHI</th>
                                        <th className="px-4 py-3 text-left">PII</th>
                                        <th className="px-4 py-3 text-left">Residency</th>
                                        <th className="px-4 py-3 text-left">Masking Policy</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/70">
                                    {datasets.map(row => (
                                        <tr key={row.dataset} className="hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-3 text-left font-medium text-white">{row.dataset}</td>
                                            <td className="px-4 py-3 text-left text-slate-200">{row.sensitivity}</td>
                                            <td className="px-4 py-3 text-left">
                                                {row.phi === 'Detected' ? (
                                                    <span className="rounded-full border border-rose-500/40 bg-rose-500/10 px-2 py-1 text-xs font-semibold text-rose-200">
                                                        Detected
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400">None</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-left">
                                                {row.pii === 'Detected' ? (
                                                    <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${row.tone === 'critical' ? 'border-rose-500/40 bg-rose-500/10 text-rose-200' : 'border-amber-500/40 bg-amber-500/10 text-amber-200'}`}>
                                                        Detected
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400">None</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-left text-slate-200">{row.residency}</td>
                                            <td className="px-4 py-3 text-left">
                                                <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${toneBadge[row.tone]}`}>
                                                    {row.masking}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </article>

                    <article className="rounded-2xl border border-white/10 bg-[#0a1424] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.28)]">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-semibold text-white">Clinical Outcomes Delta - Detected Tags</h2>
                                <p className="text-sm text-slate-400">PHI/PII tag detail panel</p>
                            </div>
                            <span className="rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-100">
                                Critical
                            </span>
                        </div>
                        <div className="mt-5 flex flex-wrap gap-2">
                            {phiTags.map(tag => (
                                <span
                                    key={tag.label}
                                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${tagTone[tag.tone]}`}
                                >
                                    {tag.label}
                                </span>
                            ))}
                        </div>
                        <div className="mt-6 space-y-3">
                            <button className="w-full rounded-xl border border-rose-500/60 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-100 shadow-[0_12px_30px_rgba(244,63,94,0.24)] transition hover:bg-rose-500/20">
                                Apply Full Masking
                            </button>
                            <button className="w-full rounded-xl border border-blue-500/40 bg-blue-500/10 px-4 py-3 text-sm font-semibold text-blue-100 shadow-[0_12px_30px_rgba(59,130,246,0.2)] transition hover:bg-blue-500/20">
                                Restrict to Healthcare Role
                            </button>
                            <button className="w-full rounded-xl border border-amber-400/50 bg-transparent px-4 py-3 text-sm font-semibold text-amber-200 transition hover:bg-amber-400/10">
                                Flag for Manual Review
                            </button>
                        </div>
                    </article>
                </section>

                <section className="mt-10 grid gap-6 lg:grid-cols-[2fr_1fr]">
                    <article className="rounded-2xl border border-white/10 bg-[#0a1424] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.28)]">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div>
                                <h2 className="text-xl font-semibold text-white">Preview access as role</h2>
                                <p className="text-sm text-slate-400">See-as / Act-as controls</p>
                            </div>
                            <span className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-100">
                                Role preview
                            </span>
                        </div>
                        <div className="mt-5 space-y-3">
                            <label className="block text-xs uppercase tracking-[0.12em] text-slate-500">Role</label>
                            <select className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none">
                                <option>Research Lead</option>
                                <option>Data Analyst</option>
                                <option>Compliance Officer</option>
                            </select>
                            <div className="mt-4 space-y-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                                <div className="flex items-center justify-between"><span>Dataset</span><span className="font-semibold text-white">Clinical Outcomes Delta</span></div>
                                <div className="flex items-center justify-between"><span>Visible fields</span><span className="font-semibold text-white">3 of 12</span></div>
                                <div className="flex items-center justify-between"><span>Masked fields</span><span className="font-semibold text-white">9 of 12</span></div>
                                <div className="flex items-center justify-between"><span>PHI fields</span><span className="font-semibold text-rose-200">Hidden</span></div>
                                <div className="flex items-center justify-between"><span>Export allowed</span><span className="font-semibold text-amber-200">Aggregated only</span></div>
                            </div>
                            <p className="text-xs text-slate-400">
                                Viewing as Research Lead - PHI fields automatically masked.
                            </p>
                        </div>
                    </article>

                    <article className="rounded-2xl border border-blue-500/30 bg-gradient-to-b from-slate-900 via-slate-950 to-[#050b16] p-6 shadow-[0_15px_50px_rgba(30,64,175,0.25)]">
                        <div>
                            <h2 className="text-xl font-semibold text-white">Residency Constraints</h2>
                            <p className="text-sm text-slate-400">Data locality by region</p>
                        </div>
                        <div className="mt-5 space-y-3 text-sm text-slate-200">
                            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                                <span>US only datasets</span>
                                <span className="font-semibold text-white">4</span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                                <span>EU compliant</span>
                                <span className="font-semibold text-white">18</span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                                <span>Global</span>
                                <span className="font-semibold text-white">2</span>
                            </div>
                        </div>
                        <button className="mt-6 w-full rounded-xl border border-blue-500/40 bg-transparent px-4 py-3 text-sm font-semibold text-blue-100 transition hover:bg-blue-500/10">
                            View Residency Map
                        </button>
                    </article>
                </section>
            </div>
        </div>
    )
}
