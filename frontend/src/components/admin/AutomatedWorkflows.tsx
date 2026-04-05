import { useState, useCallback } from 'react'
import { workflowRules } from './mockData'

interface Rule {
    id: string
    title: string
    description: string
    enabled: boolean
    lastTriggered: string
    triggerCount: number
}

export default function AutomatedWorkflows() {
    const [rules, setRules] = useState<Rule[]>(() => {
        return workflowRules.map(r => ({ ...r }))
    })
    const [toast, setToast] = useState<string | null>(null)
    const [showModal, setShowModal] = useState(false)
    const [newRule, setNewRule] = useState({ name: '', description: '' })

    const toggleRule = useCallback((id: string) => {
        setRules(prevRules => {
            const rule = prevRules.find(r => r.id === id)
            const willEnable = rule ? !rule.enabled : false
            
            setTimeout(() => {
                setToast(willEnable ? 'Rule enabled ✓' : 'Rule disabled')
                setTimeout(() => setToast(null), 3000)
            }, 0)
            
            return prevRules.map(r => 
                r.id === id ? { ...r, enabled: willEnable } : r
            )
        })
    }, [])

    const handleAddRule = () => {
        if (newRule.name.trim() && newRule.description.trim()) {
            setShowModal(false)
            setNewRule({ name: '', description: '' })
            setToast('New rule added successfully ✓')
            setTimeout(() => setToast(null), 3000)
        }
    }

    return (
        <>
            <div className="rounded-xl border border-slate-800/60 bg-slate-900/65 shadow-2xl shadow-black/20 overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800/60 px-5 py-4">
                    <div>
                        <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-300">Automated Workflows</h2>
                        <p className="mt-1 text-[10px] leading-relaxed text-slate-500">Pre-defined rules running automatically in the background</p>
                    </div>
                </div>
                <div className="divide-y divide-slate-800/35">
                    {rules.map((rule) => (
                        <div key={rule.id} className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-slate-900/30">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => toggleRule(rule.id)}
                                    type="button"
                                    className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${rule.enabled ? 'bg-emerald-500' : 'bg-slate-600'}`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${rule.enabled ? 'translate-x-6' : 'translate-x-1'}`}
                                    />
                                </button>
                                <div>
                                    <p className="text-[11px] font-semibold text-slate-200">{rule.title}</p>
                                    <p className="mt-1 text-[10px] leading-relaxed text-slate-500">{rule.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-[9px] text-slate-600">Last triggered: {rule.lastTriggered}</p>
                                    <p className="text-[9px] text-slate-600">Triggered {rule.triggerCount} times</p>
                                </div>
                                <button className="rounded-md border border-slate-700/70 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400 transition-all hover:bg-slate-800/60">
                                    Edit
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-end border-t border-slate-800/60 px-5 py-3">
                    <button
                        onClick={() => setShowModal(true)}
                        className="rounded-md border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-400 transition-all hover:bg-blue-500/20"
                    >
                        + Add New Rule
                    </button>
                </div>
            </div>

            {toast && (
                <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4">
                    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 shadow-xl backdrop-blur-xl">
                        <p className="text-[11px] font-medium text-emerald-300">{toast}</p>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-xl border border-slate-800/60 bg-slate-900/95 p-6 shadow-2xl">
                        <h3 className="text-[12px] font-semibold text-slate-200">Add New Rule</h3>
                        <div className="mt-4 space-y-4">
                            <div>
                                <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Rule Name</label>
                                <input
                                    type="text"
                                    value={newRule.name}
                                    onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                                    placeholder="Enter rule name"
                                    className="mt-2 w-full rounded-lg border border-slate-700/70 bg-slate-800/50 px-3 py-2.5 text-[11px] text-slate-300 placeholder-slate-600 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Description</label>
                                <textarea
                                    value={newRule.description}
                                    onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                                    placeholder="Enter description"
                                    rows={3}
                                    className="mt-2 w-full rounded-lg border border-slate-700/70 bg-slate-800/50 px-3 py-2.5 text-[11px] text-slate-300 placeholder-slate-600 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 resize-none"
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowModal(false)
                                    setNewRule({ name: '', description: '' })
                                }}
                                className="rounded-md border border-slate-700/70 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 transition-all hover:bg-slate-800/60"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddRule}
                                className="rounded-md bg-blue-500/20 border border-blue-500/30 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-300 transition-all hover:bg-blue-500/30"
                            >
                                Save Rule
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}