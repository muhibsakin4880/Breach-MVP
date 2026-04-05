import { useState } from 'react'
import { aiChatHistory } from './mockData'

const quickQuestions = [
    { id: 'risks', label: "Today's risks?" },
    { id: 'approvals', label: 'Pending approvals?' },
    { id: 'compliance', label: 'Compliance status?' }
]

const quickResponses: Record<string, string> = {
    risks: "3 critical alerts active. High risk access request from part_anon_089, PHI detected in Financial_Records_Q4_2025, and 1 escrow dispute pending.",
    approvals: "12 items pending review. 3 high risk, 6 medium risk, 3 low risk. Recommend reviewing high risk items first.",
    compliance: "Compliance rate: 98.2%. 1 violation detected today. Audit trail intact. Hash chain verified."
}

export default function AICopilot() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState(aiChatHistory)
    const [inputValue, setInputValue] = useState('')

    const handleQuickQuestion = (question: string) => {
        const userMessage = {
            id: Date.now().toString(),
            role: 'user' as const,
            content: question,
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }
        
        const aiResponse = {
            id: (Date.now() + 1).toString(),
            role: 'assistant' as const,
            content: quickResponses[question.toLowerCase().includes('risks') ? 'risks' : question.toLowerCase().includes('approvals') ? 'approvals' : 'compliance'],
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }

        setMessages(prev => [...prev, userMessage, aiResponse])
    }

    const handleSendMessage = () => {
        if (!inputValue.trim()) return

        const userMessage = {
            id: Date.now().toString(),
            role: 'user' as const,
            content: inputValue,
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }

        const aiResponse = {
            id: (Date.now() + 1).toString(),
            role: 'assistant' as const,
            content: "Analyzing your query... Based on current platform data, I recommend reviewing the Smart Alerts panel for immediate action items.",
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }

        setMessages(prev => [...prev, userMessage, aiResponse])
        setInputValue('')
    }

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {isOpen ? (
                <div className="w-[380px] h-[500px] rounded-xl border border-slate-800/60 bg-slate-900/95 shadow-2xl shadow-black/40 overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between border-b border-slate-800/60 px-4 py-3 bg-slate-900/80">
                        <div className="flex items-center gap-2">
                            <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-300">Admin Co-Pilot</h3>
                            <span className="flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[9px] text-emerald-400">Online</span>
                            </span>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-slate-500 hover:text-slate-300 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-lg px-3 py-2 ${msg.role === 'user' ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-slate-800/50 border border-slate-700/50'}`}>
                                    <p className="text-[10px] leading-relaxed text-slate-300">{msg.content}</p>
                                    <p className="text-[8px] text-slate-600 mt-1">{msg.timestamp}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-slate-800/60 p-3 bg-slate-900/80">
                        <div className="flex gap-2 mb-3">
                            {quickQuestions.map((q) => (
                                <button
                                    key={q.id}
                                    onClick={() => handleQuickQuestion(q.label)}
                                    className="text-[9px] font-medium px-2 py-1 rounded bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:bg-slate-700/50 hover:text-cyan-400 hover:border-cyan-500/30 transition-all"
                                >
                                    {q.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Ask anything..."
                                className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-[10px] text-slate-300 placeholder-slate-600 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20"
                            />
                            <button
                                onClick={handleSendMessage}
                                className="px-3 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30 transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="group relative w-14 h-14 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-500/20 hover:bg-cyan-500/30 transition-all"
                >
                    <span className="absolute w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
                    <span className="absolute w-2 h-2 bg-cyan-400 rounded-full" />
                    <svg className="w-6 h-6 text-cyan-400 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-800/90 border border-slate-700/50 rounded-lg text-[10px] font-medium text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Admin Co-Pilot
                        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-700/50" />
                    </span>
                </button>
            )}
        </div>
    )
}