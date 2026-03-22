import { useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import { useAuth } from '../../contexts/AuthContext'
import { logRows, schemaFieldRows } from './AIInterrogationLogsPage'

type AccordionSectionKey = 'high' | 'gray' | 'safe'

const decisionBadgeClasses = {
    red: 'bg-red-500/10 text-red-300 border-red-500/30',
    amber: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    green: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
}

const confidenceToneClasses = {
    red: 'text-red-300',
    amber: 'text-amber-300',
    green: 'text-emerald-300'
}

const schemaToneClasses = {
    red: 'border-red-500/30 bg-red-500/10 text-red-200',
    amber: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
    green: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
}

const accordionMeta: Record<AccordionSectionKey, { label: string; description: string; tone: 'red' | 'amber' | 'green' }> = {
    high: {
        label: 'High Risk fields',
        description: 'Expanded by default',
        tone: 'red'
    },
    gray: {
        label: 'Gray Zone fields',
        description: 'DPO review required',
        tone: 'amber'
    },
    safe: {
        label: 'Safe fields',
        description: 'Transfer ready',
        tone: 'green'
    }
}

export default function AIReportPage() {
    const { isAuthenticated } = useAuth()
    const navigate = useNavigate()
    const { reportId } = useParams<{ reportId: string }>()

    const selectedLog = useMemo(() => logRows.find(row => row.id === reportId) ?? logRows[0], [reportId])

    const [openSections, setOpenSections] = useState<Record<AccordionSectionKey, boolean>>({
        high: true,
        gray: false,
        safe: false
    })

    const groupedSchema = useMemo(() => {
        return {
            high: schemaFieldRows.filter(row => row.complianceTone === 'red'),
            gray: schemaFieldRows.filter(row => row.complianceTone === 'amber'),
            safe: schemaFieldRows.filter(row => row.complianceTone === 'green')
        }
    }, [])

    const confidenceGrid = selectedLog.report.confidenceBreakdown.slice(0, 4)
    const overallConfidence = selectedLog.report.confidenceBreakdown.find(item => item.label === 'Overall')

    const toggleSection = (section: AccordionSectionKey) => {
        setOpenSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }))
    }

    if (!isAuthenticated) return <Navigate to="/admin/login" replace />

    return (
        <AdminLayout title="AI DECISION REPORT" subtitle="FULL DECISION AUDIT">
            <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <button
                        onClick={() => navigate('/admin/ai-interrogation-logs')}
                        className="inline-flex items-center gap-2 rounded-md border border-slate-700/80 bg-slate-900/60 px-3 py-2 text-[11px] font-semibold text-slate-200 hover:bg-slate-800/70 transition-colors"
                    >
                        ← Back to Logs
                    </button>

                    <div className="flex items-center gap-2">
                        <button className="rounded-md border border-cyan-500/50 bg-cyan-500/15 px-3 py-2 text-[11px] font-semibold text-cyan-200 hover:bg-cyan-500/20 transition-colors">
                            Export Report
                        </button>
                        <button className="rounded-md border border-slate-600/80 bg-transparent px-3 py-2 text-[11px] font-semibold text-slate-200 hover:bg-slate-800/60 transition-colors">
                            Print
                        </button>
                    </div>
                </div>

                <section className="space-y-2">
                    <h1 className="text-3xl font-semibold text-slate-100 tracking-tight">AI Decision Report</h1>
                    <div className="flex flex-wrap items-center gap-3">
                        <p className="text-sm font-medium text-slate-100">{selectedLog.report.subjectTitle}</p>
                        <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] font-semibold tracking-wider ${decisionBadgeClasses[selectedLog.decisionTone]}`}>
                            {selectedLog.decision}
                        </span>
                    </div>
                </section>

                <section className="rounded-xl border border-slate-800/60 bg-slate-900/60 backdrop-blur-xl p-5 shadow-2xl shadow-black/30">
                    <h2 className="text-[12px] uppercase tracking-[0.12em] font-semibold text-slate-300">Confidence Breakdown</h2>
                    <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                        {confidenceGrid.map(item => (
                            <div key={item.label} className="rounded-md border border-slate-800/80 bg-slate-950/40 px-3 py-2">
                                <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">{item.label}</p>
                                <p className={`mt-1 text-lg font-semibold ${item.tone ? confidenceToneClasses[item.tone] : 'text-slate-200'}`}>
                                    {item.value}
                                </p>
                            </div>
                        ))}
                    </div>
                    {overallConfidence && (
                        <div className="mt-3 rounded-md border border-slate-800/80 bg-slate-950/40 px-3 py-2">
                            <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Overall</p>
                            <p className={`mt-1 text-xl font-semibold ${overallConfidence.tone ? confidenceToneClasses[overallConfidence.tone] : 'text-slate-200'}`}>
                                {overallConfidence.value}
                            </p>
                        </div>
                    )}
                </section>

                <section className="rounded-xl border border-slate-800/60 bg-slate-900/60 backdrop-blur-xl p-5 shadow-2xl shadow-black/30">
                    <h2 className="text-[12px] uppercase tracking-[0.12em] font-semibold text-slate-300">Schema Field Analysis</h2>
                    <div className="mt-3 space-y-3">
                        {(Object.keys(accordionMeta) as AccordionSectionKey[]).map(sectionKey => {
                            const meta = accordionMeta[sectionKey]
                            const rows = groupedSchema[sectionKey]
                            const isOpen = openSections[sectionKey]

                            return (
                                <div key={sectionKey} className="rounded-md border border-slate-800/80 bg-slate-950/35 overflow-hidden">
                                    <button
                                        onClick={() => toggleSection(sectionKey)}
                                        className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-slate-800/25 transition-colors"
                                    >
                                        <div>
                                            <p className="text-[11px] font-semibold text-slate-200 uppercase tracking-[0.11em]">{meta.label}</p>
                                            <p className="text-[10px] text-slate-500">{meta.description}</p>
                                        </div>
                                        <span className={`inline-flex items-center rounded-md border px-2 py-1 text-[10px] font-semibold ${schemaToneClasses[meta.tone]}`}>
                                            {rows.length} fields {isOpen ? '↑' : '↓'}
                                        </span>
                                    </button>

                                    {isOpen && (
                                        <div className="border-t border-slate-800/70 overflow-x-auto">
                                            <table className="w-full min-w-[900px]">
                                                <thead className="bg-slate-950/60">
                                                    <tr className="text-[9px] font-semibold uppercase tracking-[0.13em] text-slate-500">
                                                        <th className="px-3 py-2 text-left">Field</th>
                                                        <th className="px-3 py-2 text-left">Type</th>
                                                        <th className="px-3 py-2 text-left">Sample</th>
                                                        <th className="px-3 py-2 text-left">Compliance &amp; PII</th>
                                                        <th className="px-3 py-2 text-left">Residency</th>
                                                        <th className="px-3 py-2 text-left">Null %</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-800/60 font-mono text-[10px] text-slate-200">
                                                    {rows.map(row => (
                                                        <tr key={`${sectionKey}-${row.field}`} className="hover:bg-slate-800/20 transition-colors">
                                                            <td className="px-3 py-2 whitespace-nowrap">{row.field}</td>
                                                            <td className="px-3 py-2 whitespace-nowrap text-slate-300">{row.type}</td>
                                                            <td className="px-3 py-2 text-slate-300">{row.sample}</td>
                                                            <td className="px-3 py-2">
                                                                <span className={`inline-flex items-center rounded-md border px-2 py-1 leading-none ${schemaToneClasses[row.complianceTone]}`}>
                                                                    {row.complianceLabel}
                                                                </span>
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <span className={`inline-flex items-center rounded-md border px-2 py-1 leading-none ${schemaToneClasses[row.residencyTone]}`}>
                                                                    {row.residencyLabel}
                                                                </span>
                                                            </td>
                                                            <td className="px-3 py-2 whitespace-nowrap">{row.nullRate}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </section>

                <section className="rounded-xl border border-slate-800/60 bg-slate-900/60 backdrop-blur-xl p-5 shadow-2xl shadow-black/30">
                    <h2 className="text-[12px] uppercase tracking-[0.12em] font-semibold text-slate-300">Issues Detected</h2>
                    <div className="mt-3 space-y-2 text-[11px] font-mono">
                        {selectedLog.report.issues.map((issue, index) => (
                            <div
                                key={`${issue.text}-${index}`}
                                className={`rounded-md border px-3 py-2 leading-relaxed ${issue.tone === 'red' ? 'border-red-500/30 bg-red-500/10 text-red-200' : 'border-amber-500/30 bg-amber-500/10 text-amber-200'}`}
                            >
                                {issue.text}
                            </div>
                        ))}
                    </div>
                </section>

                <section className="rounded-xl border border-slate-800/60 bg-slate-900/60 backdrop-blur-xl p-5 shadow-2xl shadow-black/30">
                    <h2 className="text-[12px] uppercase tracking-[0.12em] font-semibold text-slate-300">Action Taken</h2>
                    <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3 text-[11px] font-mono">
                        {selectedLog.report.actionsTaken.map(item => (
                            <div key={item.label} className="rounded-md border border-slate-800/80 bg-slate-950/40 px-3 py-2">
                                <p className="text-slate-500">{item.label}</p>
                                <p className={`mt-1 font-semibold ${item.tone === 'green' ? 'text-emerald-300' : item.tone === 'amber' ? 'text-amber-300' : item.tone === 'red' ? 'text-red-300' : 'text-slate-200'}`}>
                                    {item.value}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <button className="rounded-md border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-[11px] font-semibold text-amber-200 hover:bg-amber-500/15 transition-colors">
                        Override & Approve
                    </button>
                    <button className="rounded-md border border-red-500/50 bg-red-500/10 px-3 py-2 text-[11px] font-semibold text-red-200 hover:bg-red-500/15 transition-colors">
                        Confirm Quarantine
                    </button>
                    <button className="rounded-md border border-cyan-500/50 bg-cyan-500/10 px-3 py-2 text-[11px] font-semibold text-cyan-200 hover:bg-cyan-500/15 transition-colors">
                        Request Manual Review
                    </button>
                </section>
            </div>
        </AdminLayout>
    )
}
