import { useEffect, useMemo, useRef, useState } from 'react'
import type { DatasetDetail } from '../../data/datasetDetailData'
import { askDatasetAssistant, getOllamaConfig } from '../../services/ollama'

type ChatRole = 'assistant' | 'user'

type ChatMessage = {
    id: string
    role: ChatRole
    text: string
}

type DatasetAssistantPanelProps = {
    dataset: DatasetDetail
    variant?: 'detail' | 'breakdown'
}

const buildInitialChatMessages = (
    datasetTitle: string,
    confidenceScore: number,
    freshnessScore: number
): ChatMessage[] => [
    {
        id: 'a-welcome',
        role: 'assistant',
        text: "Hi! I'm here to help you understand this dataset. I can answer questions based on its metadata, quality metrics, coverage, and high-level summaries. What would you like to know? (e.g. What is the confidence score? What domains does it cover?)"
    },
    { id: 'u-1', role: 'user', text: 'What is the overall confidence score?' },
    {
        id: 'a-1',
        role: 'assistant',
        text: `The overall confidence score for this dataset is ${confidenceScore}%, based on rolling quality and access reliability metrics.`
    },
    { id: 'u-2', role: 'user', text: 'Is the data fresh?' },
    {
        id: 'a-2',
        role: 'assistant',
        text: `Yes - Freshness is rated at ${freshnessScore}%, meeting SLA with automated anomaly gating.`
    },
    { id: 'u-3', role: 'user', text: 'Can I get raw data samples?' },
    {
        id: 'a-3',
        role: 'assistant',
        text: `Sorry, I can only share metadata and summaries for ${datasetTitle}. Raw data access requires approval through the "Request Access" button.`
    }
]

function getMockReply(input: string, dataset: DatasetDetail) {
    const value = input.toLowerCase()
    if (value.includes('gray zone')) {
        return 'Gray Zone fields are analytically useful but potentially sensitive in combination, so the free preview keeps them aggregated until governance review is complete.'
    }
    if (value.includes('restricted')) {
        return 'Restricted fields are blocked from the free preview. They require paid clean-room access, explicit approval, and full audit logging before they can be evaluated.'
    }
    if (
        value.includes('tier 1') ||
        (value.includes('safe') && value.includes('field'))
    ) {
        return 'Tier 1 Safe means the field metadata clears policy checks and can be shown in the preview without exposing sensitive values or row-level data.'
    }
    if (
        value.includes('masked') ||
        value.includes('hidden') ||
        value.includes('raw row')
    ) {
        return `Sensitive values are intentionally masked in this free preview. You can inspect schema shape, risk labels, and protected record-count ranges like ${dataset.preview.recordCountRange}, but raw rows stay unavailable until governed access is approved.`
    }
    if (value.includes('confidence')) {
        return `Current confidence is ${dataset.confidenceScore}%, combining completeness (${dataset.quality.completeness}%), freshness (${dataset.quality.freshnessScore}%), consistency (${dataset.quality.consistency}%), and structure quality (${dataset.preview.structureQuality}%) with contributor and access reliability checks.`
    }
    if (value.includes('fresh') || value.includes('update')) {
        return `Freshness is ${dataset.quality.freshnessScore}% and latest update is ${dataset.lastUpdated}. ${dataset.quality.freshnessNote}`
    }
    if (value.includes('raw') || value.includes('sample')) {
        return 'I can only share metadata and summaries here. Raw rows are protected and require approved secure access.'
    }
    if (
        value.includes('domain') ||
        value.includes('cover') ||
        value.includes('category')
    ) {
        return `This dataset is in ${dataset.category} and focuses on: ${dataset.description}`
    }
    return 'Fallback assistant: I can help with confidence score, freshness, consistency, access model, and high-level coverage details.'
}

export default function DatasetAssistantPanel({
    dataset,
    variant = 'detail'
}: DatasetAssistantPanelProps) {
    const ollamaConfig = useMemo(() => getOllamaConfig(), [])
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() =>
        buildInitialChatMessages(
            dataset.title,
            dataset.confidenceScore,
            dataset.quality.freshnessScore
        )
    )
    const [chatInput, setChatInput] = useState('')
    const [isThinking, setIsThinking] = useState(false)
    const [chatNotice, setChatNotice] = useState('')
    const chatContainerRef = useRef<HTMLDivElement | null>(null)

    const suggestedPrompts = useMemo(
        () =>
            variant === 'breakdown'
                ? [
                    {
                        section: 'Schema',
                        prompt: 'Which fields are highest risk in this preview?'
                    },
                    {
                        section: 'Residency',
                        prompt: 'What does local hosting required imply for this dataset?'
                    },
                    {
                        section: 'Labels',
                        prompt: 'Explain Gray Zone versus Restricted for this schema.'
                    },
                    {
                        section: 'Governance',
                        prompt: 'What should I inspect here before starting clean-room evaluation?'
                    }
                ]
                : [
                    {
                        section: 'Confidence',
                        prompt: `Why is the confidence score ${dataset.confidenceScore}%?`
                    },
                    {
                        section: 'Schema',
                        prompt: 'Which fields are restricted in this preview?'
                    },
                    { section: 'Risk', prompt: 'What does Gray Zone mean for this dataset?' },
                    { section: 'Freshness', prompt: 'How fresh is this dataset right now?' }
                ],
        [dataset.confidenceScore, variant]
    )

    useEffect(() => {
        setChatInput('')
        setIsThinking(false)
        setChatNotice('')
        setChatMessages(
            buildInitialChatMessages(
                dataset.title,
                dataset.confidenceScore,
                dataset.quality.freshnessScore
            )
        )
    }, [dataset.id, dataset.title, dataset.confidenceScore, dataset.quality.freshnessScore])

    useEffect(() => {
        const chatContainer = chatContainerRef.current
        if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight
    }, [chatMessages, isThinking])

    const handleSendChatMessage = (inputOverride?: string) => {
        if (isThinking) return

        const trimmed = (inputOverride ?? chatInput).trim()
        if (!trimmed) return

        const history = chatMessages
        setChatMessages(prev => [
            ...prev,
            { id: `u-${Date.now()}`, role: 'user', text: trimmed }
        ])
        setChatInput('')
        setChatNotice(`Asking Ollama (${ollamaConfig.model})...`)
        setIsThinking(true)

        askDatasetAssistant(trimmed, dataset, history)
            .then(reply => {
                setChatMessages(prev => [
                    ...prev,
                    { id: `a-${Date.now()}`, role: 'assistant', text: reply }
                ])
                setChatNotice(`Connected to Ollama at ${ollamaConfig.baseUrl}`)
            })
            .catch(() => {
                setChatMessages(prev => [
                    ...prev,
                    {
                        id: `a-${Date.now()}`,
                        role: 'assistant',
                        text: getMockReply(trimmed, dataset)
                    }
                ])
                setChatNotice(
                    'Ollama unavailable right now. Falling back to local metadata replies.'
                )
            })
            .finally(() => {
                setIsThinking(false)
            })
    }

    const shellClass = variant === 'breakdown'
        ? "relative overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/55 p-10 shadow-[0_30px_95px_rgba(2,6,23,0.48)] ring-1 ring-inset ring-white/8 backdrop-blur-2xl before:pointer-events-none before:absolute before:inset-0 before:content-[''] before:bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))] lg:p-12"
        : 'rounded-md border border-slate-800 bg-slate-950/55 p-4'
    const insightCardClass = variant === 'breakdown'
        ? 'mt-8 rounded-[26px] border border-white/10 bg-slate-950/40 p-6 shadow-[0_20px_45px_rgba(2,6,23,0.22),inset_0_1px_0_rgba(255,255,255,0.05)] ring-1 ring-inset ring-white/5 backdrop-blur-xl lg:p-7'
        : 'mt-5 rounded-sm border border-slate-800 bg-slate-900/70 p-4'
    const chatShellClass = variant === 'breakdown'
        ? 'mt-8 overflow-hidden rounded-[28px] border border-cyan-500/15 bg-slate-900/60 shadow-[0_0_0_1px_rgba(56,189,248,0.12),0_0_40px_rgba(56,189,248,0.08)]'
        : 'mt-6 overflow-hidden rounded-md border border-cyan-500/20 bg-slate-900/60'
    const transcriptHeightClass = variant === 'breakdown' ? 'h-[320px]' : 'h-[280px]'
    const promptButtonClass = variant === 'breakdown'
        ? 'inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/60 px-3.5 py-2.5 text-left text-xs text-slate-200 transition-colors hover:border-cyan-500/40 hover:text-white'
        : 'inline-flex items-center gap-2 rounded-sm border border-slate-800 bg-slate-900/80 px-3 py-2 text-left text-xs text-slate-200 transition-colors hover:border-cyan-500/40 hover:text-white'
    const messageBubbleClass = (role: ChatRole) =>
        role === 'user'
            ? variant === 'breakdown'
                ? 'max-w-[90%] rounded-2xl border border-blue-500/40 bg-blue-600/20 px-4 py-3 text-sm leading-relaxed text-blue-100'
                : 'max-w-[90%] rounded-md border border-blue-500/35 bg-blue-600/15 px-3.5 py-3 text-sm leading-relaxed text-blue-100'
            : variant === 'breakdown'
              ? 'max-w-[90%] rounded-2xl border border-white/10 bg-slate-800/90 px-4 py-3 text-sm leading-relaxed text-slate-200'
              : 'max-w-[90%] rounded-md border border-slate-800 bg-slate-800/85 px-3.5 py-3 text-sm leading-relaxed text-slate-200'
    const inputClass = variant === 'breakdown'
        ? 'flex-1 rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none'
        : 'flex-1 rounded-sm border border-slate-800 bg-slate-800 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none'
    const sendButtonClass = variant === 'breakdown'
        ? 'rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60'
        : 'rounded-sm bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60'
    const eyebrowLabel = variant === 'breakdown' ? 'Advanced AI Analysis' : 'AI Review'
    const titleLabel = variant === 'breakdown' ? 'Schema & Governance Copilot' : 'AI Insight'
    const insightSummary = variant === 'breakdown'
        ? 'Use this copilot to interpret schema risk, residency boundaries, access tiers, and masked-preview constraints before you move into governed evaluation.'
        : dataset.preview.aiSummary
    const insightFootnote = variant === 'breakdown'
        ? 'Grounded only in preview-safe schema labels, residency rules, access tiers, and confidence signals.'
        : 'Grounded only in preview-safe metadata: confidence, freshness, schema risk labels, and access policy signals.'
    const transcriptTitle = variant === 'breakdown'
        ? 'Ask AI about schema and governance'
        : 'Ask AI about this dataset'
    const transcriptDescription = variant === 'breakdown'
        ? 'Best for questions about field risk, residency, label meanings, and preview-safe inspection limits.'
        : 'Best for quick questions about confidence, hidden fields, and access controls.'
    const inputPlaceholder = variant === 'breakdown'
        ? 'Ask about field risk, residency, or governance labels...'
        : 'Ask about confidence, hidden fields, or access policy...'

    return (
        <section className={shellClass}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        {eyebrowLabel}
                    </div>
                    <h3 className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">
                        {titleLabel}
                    </h3>
                </div>
                <span className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold text-cyan-200">
                    AI Evaluation Powered by Ollama
                </span>
            </div>

            <div className={insightCardClass}>
                <p className="text-sm leading-7 text-slate-200">
                    {insightSummary}
                </p>
                <p className="mt-3 text-xs leading-6 text-slate-400">
                    {insightFootnote}
                </p>
            </div>

            <div className="mt-6 space-y-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Suggested questions
                </div>
                <div className="flex flex-wrap gap-2">
                    {suggestedPrompts.map(item => (
                        <button
                            key={item.prompt}
                            type="button"
                            onClick={() => handleSendChatMessage(item.prompt)}
                            className={promptButtonClass}
                        >
                            <span className="text-[10px] uppercase tracking-[0.12em] text-slate-500">
                                {item.section}
                            </span>
                            <span>{item.prompt}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className={chatShellClass}>
                <div className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-5">
                    <div>
                        <h4 className="text-sm font-semibold text-white">
                            {transcriptTitle}
                        </h4>
                        <p className="mt-1 text-[11px] text-slate-400">
                            {transcriptDescription}
                        </p>
                    </div>
                    <span className="text-[11px] text-slate-400">
                        Model: {ollamaConfig.model}
                    </span>
                </div>

                <div
                    ref={chatContainerRef}
                    className={`${transcriptHeightClass} space-y-4 overflow-y-auto px-7 py-6`}
                >
                    {chatMessages.map(message => (
                        <div
                            key={message.id}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={messageBubbleClass(message.role)}>
                                {message.role === 'assistant' ? (
                                    <div className="mb-1 text-[10px] uppercase tracking-[0.12em] text-slate-400">
                                        Dataset Assistant
                                    </div>
                                ) : null}
                                {message.text}
                            </div>
                        </div>
                    ))}
                    {isThinking ? (
                        <div className="flex justify-start">
                            <div className={messageBubbleClass('assistant')}>
                                AI is thinking...
                            </div>
                        </div>
                    ) : null}
                </div>

                <div className="space-y-3 border-t border-white/10 px-6 py-5">
                    {chatNotice ? (
                        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                            {chatNotice}
                        </div>
                    ) : null}
                    <div className="rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-xs text-slate-400">
                        Sensitive values stay masked here. The assistant can
                        reference preview-safe schema signals, but not raw rows or
                        direct exports.
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <input
                            value={chatInput}
                            onChange={event => setChatInput(event.target.value)}
                            onKeyDown={event => {
                                if (event.key === 'Enter') {
                                    event.preventDefault()
                                    handleSendChatMessage()
                                }
                            }}
                            placeholder={inputPlaceholder}
                            className={inputClass}
                        />
                        <button
                            onClick={() => handleSendChatMessage()}
                            disabled={isThinking}
                            className={sendButtonClass}
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>

            <p className="mt-5 text-xs leading-6 text-slate-400">
                Chat uses your local Ollama endpoint at {ollamaConfig.baseUrl}. If
                Ollama is unavailable, this panel falls back to deterministic
                metadata replies.
            </p>
        </section>
    )
}
