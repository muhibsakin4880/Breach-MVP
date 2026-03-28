import { Link, useParams } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState } from 'react'
import { DATASET_DETAILS, DEFAULT_DATASET, confidenceLevel, decisionLabel, qualityColor } from '../data/datasetDetailData'
import { askDatasetAssistant, getOllamaConfig } from '../services/ollama'

type ChatRole = 'assistant' | 'user'
type ChatMessage = {
    id: string
    role: ChatRole
    text: string
}

type SchemaRisk = 'safe' | 'gray' | 'high'
type SchemaAccess = 'metadata' | 'aggregated' | 'restricted'
type SchemaResidency = 'global' | 'local'
type SchemaSort = 'risk-desc' | 'field-asc' | 'null-desc' | 'access-asc'

type SchemaPreviewRow = {
    field: string
    type: string
    sampleValue: string
    risk: SchemaRisk
    access: SchemaAccess
    residency: SchemaResidency
    nullPercent: number
}

const schemaRiskMeta: Record<SchemaRisk, { label: string; dotClass: string; badgeClass: string; sortRank: number }> = {
    safe: {
        label: 'Tier 1: Safe',
        dotClass: 'bg-emerald-400',
        badgeClass: 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-200',
        sortRank: 0
    },
    gray: {
        label: 'Gray Zone: DPO Review Pending',
        dotClass: 'bg-amber-400',
        badgeClass: 'bg-amber-500/15 border border-amber-500/30 text-amber-200',
        sortRank: 1
    },
    high: {
        label: 'High Risk: PDPL Flagged',
        dotClass: 'bg-red-400',
        badgeClass: 'bg-red-500/15 border border-red-500/30 text-red-200',
        sortRank: 2
    }
}

const schemaAccessMeta: Record<SchemaAccess, { label: string; badgeClass: string; sortRank: number }> = {
    metadata: {
        label: 'Metadata Only',
        badgeClass: 'bg-slate-700/50 border border-slate-600 text-slate-300',
        sortRank: 0
    },
    aggregated: {
        label: 'Aggregated Only',
        badgeClass: 'bg-amber-500/15 border border-amber-500/30 text-amber-200',
        sortRank: 1
    },
    restricted: {
        label: 'Restricted',
        badgeClass: 'bg-red-500/15 border border-red-500/30 text-red-200',
        sortRank: 2
    }
}

const schemaResidencyMeta: Record<SchemaResidency, string> = {
    global: 'Global Transfer Cleared',
    local: 'Local Hosting Required'
}

const schemaRowsByDataset: Record<string, SchemaPreviewRow[]> = {
    '1': [
        { field: 'device_id', type: 'String', sampleValue: '["DE-7829-XK", "AE-4512-QR"]', risk: 'safe', access: 'metadata', residency: 'global', nullPercent: 0.0 },
        { field: 'timestamp_utc', type: 'Timestamp', sampleValue: '["2026-01-15T08:23:41Z"]', risk: 'safe', access: 'metadata', residency: 'global', nullPercent: 0.0 },
        { field: 'flow_count', type: 'Integer', sampleValue: '[1247, 3892, 562]', risk: 'safe', access: 'metadata', residency: 'global', nullPercent: 1.8 },
        { field: 'blood_type', type: 'String', sampleValue: '["A+", "O-", "B+"]', risk: 'high', access: 'restricted', residency: 'local', nullPercent: 0.0 },
        { field: 'national_id', type: 'String', sampleValue: '["784-1972-1234567-1"]', risk: 'high', access: 'restricted', residency: 'local', nullPercent: 0.0 },
        { field: 'location_lat', type: 'Float', sampleValue: '["24.4539", "25.2697"]', risk: 'gray', access: 'aggregated', residency: 'local', nullPercent: 2.1 },
        { field: 'location_lon', type: 'Float', sampleValue: '["54.3773", "55.3092"]', risk: 'gray', access: 'aggregated', residency: 'local', nullPercent: 2.1 },
        { field: 'salary_bracket', type: 'String', sampleValue: '["150000-200000 AED"]', risk: 'gray', access: 'aggregated', residency: 'local', nullPercent: 5.4 },
        { field: 'email_hash', type: 'String', sampleValue: '["a7b3c9f2..."]', risk: 'safe', access: 'metadata', residency: 'global', nullPercent: 0.0 },
        { field: 'registration_date', type: 'Date', sampleValue: '["2024-03-12", "2025-01-08"]', risk: 'safe', access: 'metadata', residency: 'global', nullPercent: 0.0 },
        { field: 'ip_address', type: 'String', sampleValue: '["185.58.142.12"]', risk: 'high', access: 'restricted', residency: 'local', nullPercent: 0.0 },
        { field: 'passport_number', type: 'String', sampleValue: '["A12345678"]', risk: 'high', access: 'restricted', residency: 'local', nullPercent: 0.0 },
        { field: 'phone_prefix', type: 'String', sampleValue: '["+971-50", "+971-55"]', risk: 'gray', access: 'aggregated', residency: 'local', nullPercent: 0.0 },
        { field: 'department_code', type: 'String', sampleValue: '["HR-FIN-001", "OPS-TECH-042"]', risk: 'safe', access: 'metadata', residency: 'global', nullPercent: 0.0 },
        { field: 'employee_id', type: 'String', sampleValue: '["EMP-2024-8891"]', risk: 'safe', access: 'metadata', residency: 'global', nullPercent: 0.0 }
    ]
}

const buildInitialChatMessages = (datasetTitle: string, confidenceScore: number, freshnessScore: number): ChatMessage[] => [
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

export default function DatasetQualityBreakdownPage() {
    const { id } = useParams()
    const dataset = (id && DATASET_DETAILS[id]) || DEFAULT_DATASET
    const ollamaConfig = getOllamaConfig()
    const schemaRows = schemaRowsByDataset[dataset.id] ?? schemaRowsByDataset[DEFAULT_DATASET.id] ?? []
    const previewDecision = decisionLabel(dataset.preview.decision)

    const [showConfidence, setShowConfidence] = useState(true)
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() =>
        buildInitialChatMessages(dataset.title, dataset.confidenceScore, dataset.quality.freshnessScore)
    )
    const [chatInput, setChatInput] = useState('')
    const [isThinking, setIsThinking] = useState(false)
    const [chatNotice, setChatNotice] = useState('')
    const [schemaSearch, setSchemaSearch] = useState('')
    const [schemaRiskFilter, setSchemaRiskFilter] = useState<'all' | SchemaRisk>('all')
    const [schemaAccessFilter, setSchemaAccessFilter] = useState<'all' | SchemaAccess>('all')
    const [schemaResidencyFilter, setSchemaResidencyFilter] = useState<'all' | SchemaResidency>('all')
    const [schemaSort, setSchemaSort] = useState<SchemaSort>('risk-desc')
    const chatContainerRef = useRef<HTMLDivElement | null>(null)

    const datasetSnapshot = useMemo(() => {
        const coverageMatch = dataset.title.match(/\b(20\d{2})-(20\d{2})\b/)
        const coverageWindow = coverageMatch ? `${coverageMatch[1]} to ${coverageMatch[2]}` : dataset.lastUpdated
        const sourceNetwork = dataset.description.split(' with ')[0]
        const licenseNote =
            dataset.access.allowedUsage.find(note => note.toLowerCase().includes('derived works')) ??
            dataset.access.allowedUsage[0] ??
            'Governed use only'

        return [
            { label: 'Provider posture', value: dataset.contributorTrust, detail: dataset.contributionHistory },
            { label: 'Source network', value: sourceNetwork, detail: 'Curated through verified contributor pipelines.' },
            { label: 'Geography', value: dataset.title.toLowerCase().includes('global') ? 'Global coverage' : dataset.category, detail: 'Cross-provider metadata is harmonized before preview.' },
            { label: 'Coverage window', value: coverageWindow, detail: 'Preview shows window-level metadata only.' },
            { label: 'Record volume', value: dataset.recordCount, detail: `${dataset.size} footprint in managed storage.` },
            { label: 'Update cadence', value: dataset.preview.freshnessLabel, detail: dataset.quality.freshnessNote },
            { label: 'Access model', value: 'Free preview -> paid clean room', detail: dataset.access.instructions[0] ?? 'Governed workspace access required.' },
            { label: 'Usage rights', value: licenseNote, detail: dataset.access.usageLimits }
        ]
    }, [dataset])

    const freePreviewItems = useMemo(
        () => [
            `AI summary and confidence signal for ${dataset.title}`,
            'Schema field names, types, risk labels, and residency requirements',
            `Protected record-count range: ${dataset.preview.recordCountRange}`,
            'Metadata-only inspection with no raw rows or direct exports'
        ],
        [dataset.preview.recordCountRange, dataset.title]
    )

    const paidEvaluationItems = useMemo(
        () => [
            'Governed clean-room workspace with protected query execution',
            'Policy-scoped access to deeper samples, joins, and derived outputs',
            dataset.access.usageLimits,
            dataset.access.instructions[1] ?? 'Scoped credentials and activity logging included'
        ],
        [dataset.access.instructions, dataset.access.usageLimits]
    )

    const filteredSchemaRows = useMemo(() => {
        const normalizedSearch = schemaSearch.trim().toLowerCase()
        const filtered = schemaRows.filter(row => {
            const matchesSearch =
                normalizedSearch.length === 0 ||
                [row.field, row.type, row.sampleValue, schemaRiskMeta[row.risk].label, schemaAccessMeta[row.access].label, schemaResidencyMeta[row.residency]]
                    .join(' ')
                    .toLowerCase()
                    .includes(normalizedSearch)

            const matchesRisk = schemaRiskFilter === 'all' || row.risk === schemaRiskFilter
            const matchesAccess = schemaAccessFilter === 'all' || row.access === schemaAccessFilter
            const matchesResidency = schemaResidencyFilter === 'all' || row.residency === schemaResidencyFilter

            return matchesSearch && matchesRisk && matchesAccess && matchesResidency
        })

        const sorted = [...filtered]
        sorted.sort((left, right) => {
            if (schemaSort === 'field-asc') return left.field.localeCompare(right.field)
            if (schemaSort === 'null-desc') return right.nullPercent - left.nullPercent
            if (schemaSort === 'access-asc') return schemaAccessMeta[left.access].sortRank - schemaAccessMeta[right.access].sortRank
            return schemaRiskMeta[right.risk].sortRank - schemaRiskMeta[left.risk].sortRank
        })

        return sorted
    }, [schemaAccessFilter, schemaResidencyFilter, schemaRiskFilter, schemaRows, schemaSearch, schemaSort])

    const schemaSummary = useMemo(
        () => ({
            total: schemaRows.length,
            highRisk: schemaRows.filter(row => row.risk === 'high').length,
            grayZone: schemaRows.filter(row => row.risk === 'gray').length,
            compliance: 94
        }),
        [schemaRows]
    )

    useEffect(() => {
        setShowConfidence(true)
        setChatInput('')
        setIsThinking(false)
        setChatNotice('')
        setChatMessages(buildInitialChatMessages(dataset.title, dataset.confidenceScore, dataset.quality.freshnessScore))
        setSchemaSearch('')
        setSchemaRiskFilter('all')
        setSchemaAccessFilter('all')
        setSchemaResidencyFilter('all')
        setSchemaSort('risk-desc')
    }, [dataset])

    useEffect(() => {
        const chatContainer = chatContainerRef.current
        if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight
    }, [chatMessages, isThinking])

    const getMockReply = (input: string) => {
        const value = input.toLowerCase()
        if (value.includes('confidence')) {
            return `Current confidence is ${dataset.confidenceScore}%, driven by completeness (${dataset.quality.completeness}%), freshness (${dataset.quality.freshnessScore}%), and consistency (${dataset.quality.consistency}%).`
        }
        if (value.includes('fresh') || value.includes('update')) {
            return `Freshness is ${dataset.quality.freshnessScore}% and latest update is ${dataset.lastUpdated}. ${dataset.quality.freshnessNote}`
        }
        if (value.includes('raw') || value.includes('sample')) {
            return 'I can only share metadata and summaries here. Raw rows are protected and require approved secure access.'
        }
        if (value.includes('domain') || value.includes('cover') || value.includes('category')) {
            return `This dataset is in ${dataset.category} and focuses on: ${dataset.description}`
        }
        return 'Fallback assistant: I can help with confidence score, freshness, consistency, access model, and high-level coverage details.'
    }

    const handleSendChatMessage = () => {
        if (isThinking) return

        const trimmed = chatInput.trim()
        if (!trimmed) return

        const history = chatMessages
        setChatMessages(prev => [...prev, { id: `u-${Date.now()}`, role: 'user', text: trimmed }])
        setChatInput('')
        setChatNotice(`Asking Ollama (${ollamaConfig.model})...`)
        setIsThinking(true)

        askDatasetAssistant(trimmed, dataset, history)
            .then((reply) => {
                setChatMessages(prev => [...prev, { id: `a-${Date.now()}`, role: 'assistant', text: reply }])
                setChatNotice(`Connected to Ollama at ${ollamaConfig.baseUrl}`)
            })
            .catch(() => {
                setChatMessages(prev => [...prev, { id: `a-${Date.now()}`, role: 'assistant', text: getMockReply(trimmed) }])
                setChatNotice('Ollama unavailable right now. Falling back to local metadata replies.')
            })
            .finally(() => {
                setIsThinking(false)
            })
    }

    return (
        <div className="bg-slate-900 text-white min-h-screen">
            <div className="container mx-auto px-6 py-12 space-y-12">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                        <div className="text-sm text-slate-400 mb-3">
                            <Link to="/datasets" className="hover:text-white transition-colors">Datasets</Link>
                            <span className="mx-2 text-slate-600">/</span>
                            <Link to={`/datasets/${dataset.id}`} className="hover:text-white transition-colors">{dataset.title}</Link>
                            <span className="mx-2 text-slate-600">/</span>
                            <span className="text-slate-200">Quality Breakdown</span>
                        </div>
                        <h1 className="text-3xl font-bold">Quality Breakdown for {dataset.title}</h1>
                        <p className="text-slate-400 mt-2">Signal-by-signal view of the checks backing the confidence score and AI-generated summary.</p>
                        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100">
                            Free metadata preview
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3 self-start">
                        <Link
                            to={`/datasets/${dataset.id}/escrow-checkout`}
                            className="inline-flex items-center px-5 py-2.5 rounded-lg border border-emerald-400/40 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/20 transition-colors"
                        >
                            Start Paid Clean-Room Evaluation
                        </Link>
                        <Link
                            to={`/datasets/${dataset.id}`}
                            className="inline-flex items-center px-5 py-2.5 rounded-lg border border-slate-700 hover:border-blue-500 text-slate-200 hover:text-white transition-colors"
                        >
                            Back to Dataset Detail
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-slate-300">Completeness</span>
                            <span className="text-white font-semibold">{dataset.quality.completeness}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2 mb-3">
                            <div className={`h-2 rounded-full ${qualityColor(dataset.quality.completeness)}`} style={{ width: `${dataset.quality.completeness}%` }} />
                        </div>
                        <p className="text-sm text-slate-400">Required fields filled across stations and time slices.</p>
                    </div>

                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-slate-300">Data Freshness</span>
                            <span className="text-white font-semibold">{dataset.quality.freshnessScore}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2 mb-3">
                            <div className={`h-2 rounded-full ${qualityColor(dataset.quality.freshnessScore)}`} style={{ width: `${dataset.quality.freshnessScore}%` }} />
                        </div>
                        <p className="text-sm text-slate-400">{dataset.quality.freshnessNote}</p>
                    </div>

                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-slate-300">Consistency</span>
                            <span className="text-white font-semibold">{dataset.quality.consistency}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2 mb-3">
                            <div className={`h-2 rounded-full ${qualityColor(dataset.quality.consistency)}`} style={{ width: `${dataset.quality.consistency}%` }} />
                        </div>
                        <p className="text-sm text-slate-400">Schema-aligned across providers with unit normalizations.</p>
                    </div>

                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-slate-300">Validation Status</span>
                            <span className="px-2 py-1 rounded-full bg-green-500/15 border border-green-400 text-green-200 text-xs">
                                {dataset.quality.validationStatus}
                            </span>
                        </div>
                        <p className="text-sm text-slate-400 mb-4">
                            Anomaly detection, duplication checks, and reference crosswalks run on each load.
                        </p>
                        <div className="text-sm text-slate-300">Escalations: none open</div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
                    <section className="rounded-2xl border border-slate-700 bg-slate-800/70 p-6 shadow-[0_0_35px_rgba(15,23,42,0.35)]">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-white">Dataset Snapshot</h2>
                                <p className="mt-1 text-sm text-slate-400">
                                    Fast context on source posture, coverage, cadence, and access shape before deeper evaluation.
                                </p>
                            </div>
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${previewDecision.classes}`}>
                                {previewDecision.text}
                            </span>
                        </div>

                        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            {datasetSnapshot.map(item => (
                                <article key={item.label} className="rounded-xl border border-slate-700/80 bg-slate-900/55 p-4">
                                    <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{item.label}</p>
                                    <p className="mt-2 text-sm font-semibold leading-relaxed text-white">{item.value}</p>
                                    <p className="mt-2 text-xs leading-relaxed text-slate-400">{item.detail}</p>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-800 via-slate-800/95 to-slate-900 p-6 shadow-[0_0_40px_rgba(34,211,238,0.08)]">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-semibold text-white">Free Preview vs Paid Evaluation</h2>
                                <p className="mt-1 text-sm text-slate-400">
                                    Show users exactly what they can inspect now and what unlocks in the governed clean-room path.
                                </p>
                            </div>
                            <span className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-100">
                                Decision support
                            </span>
                        </div>

                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                            <div className="rounded-xl border border-slate-700/80 bg-slate-900/55 p-4">
                                <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Included now</p>
                                <ul className="mt-3 space-y-2 text-sm text-slate-200">
                                    {freePreviewItems.map(item => (
                                        <li key={item} className="rounded-lg border border-slate-700/60 bg-slate-950/45 px-3 py-2">
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4">
                                <p className="text-[11px] uppercase tracking-[0.14em] text-emerald-200">Unlock with paid clean-room evaluation</p>
                                <ul className="mt-3 space-y-2 text-sm text-slate-100">
                                    {paidEvaluationItems.map(item => (
                                        <li key={item} className="rounded-lg border border-emerald-500/20 bg-slate-950/40 px-3 py-2">
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="mt-5 rounded-xl border border-slate-700/80 bg-slate-950/45 p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-white">Recommended next step</p>
                                    <p className="mt-1 text-xs text-slate-400">
                                        Use the free preview to validate fit, then move into clean-room evaluation when you need governed access to protected rows or derived outputs.
                                    </p>
                                </div>
                                <Link
                                    to={`/datasets/${dataset.id}/escrow-checkout`}
                                    className="inline-flex items-center justify-center rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-100 hover:bg-emerald-500/20 transition-colors"
                                >
                                    Compare Paid Options
                                </Link>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="grid lg:grid-cols-[1fr_1fr] gap-12">
                    <div className="flex flex-col bg-slate-800 border border-slate-700 rounded-2xl p-7 space-y-5 shadow-[0_0_40px_rgba(56,189,248,0.06)]">
                        <div className="flex items-center justify-between gap-4">
                            <h3 className="text-xl font-semibold">AI Insight</h3>
                            <span className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold text-cyan-200">
                                AI Evaluation Powered by Ollama
                            </span>
                        </div>
                        <p className="text-slate-200 text-sm leading-relaxed">{dataset.preview.aiSummary}</p>
                        <div className="bg-slate-900/60 border border-slate-600/60 rounded-xl overflow-hidden shadow-[0_0_0_1px_rgba(56,189,248,0.15),0_0_30px_rgba(56,189,248,0.1)]">
                            <div className="px-5 py-4 border-b border-slate-700/80 flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-white">Ask AI about this dataset</h4>
                                <span className="text-[11px] text-slate-400">Model: {ollamaConfig.model}</span>
                            </div>

                            <div ref={chatContainerRef} className="h-[380px] overflow-y-auto p-5 space-y-4">
                                {chatMessages.map(message => (
                                    <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div
                                            className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed border ${
                                                message.role === 'user'
                                                    ? 'bg-blue-600/20 border-blue-500/40 text-blue-100'
                                                    : 'bg-slate-800/90 border-slate-700 text-slate-200'
                                            }`}
                                        >
                                            {message.role === 'assistant' && (
                                                <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400 mb-1">Dataset Assistant</div>
                                            )}
                                            {message.text}
                                        </div>
                                    </div>
                                ))}
                                {isThinking && (
                                    <div className="flex justify-start">
                                        <div className="max-w-[90%] rounded-2xl px-4 py-3 text-sm border bg-slate-800/90 border-slate-700 text-slate-300">
                                            AI is thinking...
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-slate-700/80 p-4 space-y-3">
                                {chatNotice && (
                                    <div className="text-xs text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
                                        {chatNotice}
                                    </div>
                                )}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault()
                                                handleSendChatMessage()
                                            }
                                        }}
                                        placeholder="Ask about confidence, freshness, access policy..."
                                        className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                    />
                                    <button
                                        onClick={handleSendChatMessage}
                                        disabled={isThinking}
                                        className="px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold transition-colors"
                                    >
                                        Send
                                    </button>
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-slate-400">
                            Chat uses your local Ollama endpoint at {ollamaConfig.baseUrl}. If Ollama is unavailable, this panel falls back to deterministic metadata replies.
                        </p>
                    </div>

                    <div className="flex flex-col bg-slate-800 border border-slate-700 rounded-2xl p-7 space-y-5 shadow-[0_0_40px_rgba(56,189,248,0.04)]">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-semibold">AI Confidence Engine</h3>
                            <button
                                className="text-xs text-blue-300 hover:text-white"
                                onClick={() => setShowConfidence(prev => !prev)}
                            >
                                {showConfidence ? 'Hide' : 'Show'}
                            </button>
                        </div>

                        {showConfidence && (
                            <div className="flex-1 space-y-5">
                                <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="text-sm text-slate-300">Confidence Level</div>
                                            <div className="mt-1 flex items-baseline gap-2">
                                                <div className="text-5xl font-bold text-white">{dataset.confidenceScore}%</div>
                                                <div className="text-xs text-slate-500">overall</div>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${confidenceLevel(dataset.confidenceScore).classes}`}>
                                            {confidenceLevel(dataset.confidenceScore).label}
                                        </span>
                                    </div>

                                    <div className="mt-6">
                                        <div className="w-full bg-slate-800 rounded-full h-5 overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400" style={{ width: `${dataset.confidenceScore}%` }} />
                                        </div>
                                        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                                            <span>Low</span>
                                            <span>High</span>
                                        </div>
                                    </div>

                                    <div className="mt-6 grid grid-cols-3 gap-3">
                                        {[
                                            { label: 'Freshness', value: dataset.quality.freshnessScore },
                                            { label: 'Consistency', value: dataset.quality.consistency },
                                            { label: 'Structure', value: dataset.preview.structureQuality }
                                        ].map(item => (
                                            <div key={item.label} className="bg-slate-950/40 border border-slate-700/50 rounded-lg p-3 text-center">
                                                <div className="text-xs text-slate-400 mb-1">{item.label}</div>
                                                <div className="text-lg font-bold text-white">{item.value}%</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-5 space-y-2">
                                    <div className="text-sm font-semibold text-white">AI evaluation summary</div>
                                    <p className="text-sm text-slate-300">
                                        Dataset shows high structural consistency and recent updates. Missing values exist in ~3% of records. Suitable for analytical workloads; access is gated to protect sensitive dimensions.
                                    </p>
                                </div>

                                <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-5 space-y-2">
                                    <div className="text-sm font-semibold text-white">Risk flags</div>
                                    {dataset.preview.riskFlags.length === 0 ? (
                                        <div className="text-sm text-green-200">No active risks detected in preview checks.</div>
                                    ) : (
                                        <ul className="text-sm text-amber-200 space-y-1 list-disc list-inside">
                                            {dataset.preview.riskFlags.map(flag => (
                                                <li key={flag}>{flag}</li>
                                            ))}
                                            <li>Missing fields: ~3% nullable attributes</li>
                                            <li>Sparse coverage in coastal wind sensors</li>
                                        </ul>
                                    )}
                                </div>

                                <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-5 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-white">Preview safety</span>
                                        <span className="text-xs text-slate-400">No raw rows shown</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-950/40 px-4 py-3 text-xs">
                                        <span className="text-slate-400">Record count range</span>
                                        <span className="text-slate-200">{dataset.preview.recordCountRange}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <details open className="mt-8 rounded-2xl border border-slate-700 bg-slate-800/60 overflow-hidden">
                    <summary className="cursor-pointer select-none px-6 py-5 flex items-center justify-between">
                        <div>
                            <div className="text-base font-semibold text-white">Schema Preview</div>
                            <div className="text-xs text-slate-400 mt-1">Search, filter, and sort preview-safe schema signals</div>
                        </div>
                        <span className="text-xs text-slate-400">Preview-only fields (no raw rows)</span>
                    </summary>
                    <div className="border-t border-slate-700 bg-slate-900/40 px-6 py-5">
                        <div className="mb-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,0.8fr))]">
                                <label className="block">
                                    <span className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-slate-500">Search</span>
                                    <input
                                        type="search"
                                        value={schemaSearch}
                                        onChange={(event) => setSchemaSearch(event.target.value)}
                                        placeholder="Field, type, risk, access, residency..."
                                        className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                                    />
                                </label>
                                <label className="block">
                                    <span className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-slate-500">Risk</span>
                                    <select value={schemaRiskFilter} onChange={(event) => setSchemaRiskFilter(event.target.value as 'all' | SchemaRisk)} className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-3 text-sm text-white focus:outline-none focus:border-cyan-500">
                                        <option value="all">All risk levels</option>
                                        <option value="high">High risk only</option>
                                        <option value="gray">Gray zone only</option>
                                        <option value="safe">Tier 1 safe only</option>
                                    </select>
                                </label>
                                <label className="block">
                                    <span className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-slate-500">Access</span>
                                    <select value={schemaAccessFilter} onChange={(event) => setSchemaAccessFilter(event.target.value as 'all' | SchemaAccess)} className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-3 text-sm text-white focus:outline-none focus:border-cyan-500">
                                        <option value="all">All access tiers</option>
                                        <option value="restricted">Restricted</option>
                                        <option value="aggregated">Aggregated only</option>
                                        <option value="metadata">Metadata only</option>
                                    </select>
                                </label>
                                <label className="block">
                                    <span className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-slate-500">Residency</span>
                                    <select value={schemaResidencyFilter} onChange={(event) => setSchemaResidencyFilter(event.target.value as 'all' | SchemaResidency)} className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-3 text-sm text-white focus:outline-none focus:border-cyan-500">
                                        <option value="all">All residency rules</option>
                                        <option value="local">Local hosting required</option>
                                        <option value="global">Global transfer cleared</option>
                                    </select>
                                </label>
                                <label className="block">
                                    <span className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-slate-500">Sort</span>
                                    <select value={schemaSort} onChange={(event) => setSchemaSort(event.target.value as SchemaSort)} className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-3 text-sm text-white focus:outline-none focus:border-cyan-500">
                                        <option value="risk-desc">Risk severity</option>
                                        <option value="field-asc">Field name</option>
                                        <option value="null-desc">Highest null %</option>
                                        <option value="access-asc">Access tier</option>
                                    </select>
                                </label>
                            </div>
                            <div className="text-xs text-slate-300">
                                <span className="text-slate-400">{filteredSchemaRows.length} visible</span>
                                <span className="mx-2 text-slate-600">•</span>
                                <span className="text-slate-400">{schemaSummary.total} fields scanned</span>
                                <span className="mx-2 text-slate-600">•</span>
                                <span className="text-emerald-300 font-medium">Overall Compliance: {schemaSummary.compliance}%</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mb-5 flex-wrap gap-4">
                            <div className="flex items-center gap-4 text-xs flex-wrap">
                                <span className="text-slate-400 font-medium">Risk Legend:</span>
                                {(['safe', 'gray', 'high'] as const).map((risk) => (
                                    <span key={risk} className="inline-flex items-center gap-1.5">
                                        <span className={`w-2 h-2 rounded-full ${schemaRiskMeta[risk].dotClass}`} />
                                        <span className={risk === 'safe' ? 'text-emerald-200' : risk === 'gray' ? 'text-amber-200' : 'text-red-200'}>
                                            {schemaRiskMeta[risk].label}
                                        </span>
                                    </span>
                                ))}
                            </div>
                            <div className="text-xs text-slate-300">
                                <span className="text-slate-400">{schemaSummary.total} fields scanned</span>
                                <span className="mx-2 text-slate-600">•</span>
                                <span className="text-red-300">{schemaSummary.highRisk} High Risk</span>
                                <span className="mx-2 text-slate-600">•</span>
                                <span className="text-amber-300">{schemaSummary.grayZone} Gray Zone</span>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-900/60">
                            <div className="max-h-[34rem] overflow-auto">
                                <table className="min-w-full text-xs">
                                    <thead className="sticky top-0 z-10 border-b border-slate-700 bg-slate-900/95 text-[10px] uppercase tracking-[0.1em] text-slate-400 backdrop-blur">
                                        <tr>
                                            <th className="py-3 pr-3 pl-4 text-left font-medium">Field</th>
                                            <th className="py-3 px-3 text-left font-medium">Type</th>
                                            <th className="py-3 px-3 text-left font-medium">Sample Value</th>
                                            <th className="py-3 px-3 text-left font-medium">Compliance & PII</th>
                                            <th className="py-3 px-3 text-left font-medium">Access Level Required</th>
                                            <th className="py-3 px-3 text-left font-medium">Residency</th>
                                            <th className="py-3 pr-4 pl-3 text-left font-medium">Null %</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {filteredSchemaRows.map((row) => (
                                            <tr key={row.field} className="hover:bg-slate-800/30 transition-colors">
                                                <td className="py-3 pr-3 pl-4 text-white font-mono">{row.field}</td>
                                                <td className="py-3 px-3 text-slate-300">{row.type}</td>
                                                <td className="py-3 px-3 text-slate-300 font-mono">{row.sampleValue}</td>
                                                <td className="py-3 px-3"><span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium ${schemaRiskMeta[row.risk].badgeClass}`}>{schemaRiskMeta[row.risk].label}</span></td>
                                                <td className="py-3 px-3"><span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium ${schemaAccessMeta[row.access].badgeClass}`}>{schemaAccessMeta[row.access].label}</span></td>
                                                <td className={`py-3 px-3 ${row.residency === 'local' ? 'text-amber-300' : 'text-slate-300'}`}>{schemaResidencyMeta[row.residency]}</td>
                                                <td className="py-3 pr-4 pl-3 text-slate-300">{row.nullPercent.toFixed(1)}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {filteredSchemaRows.length === 0 && (
                            <div className="mt-4 rounded-xl border border-dashed border-slate-700 bg-slate-900/40 px-4 py-8 text-center">
                                <p className="text-sm font-semibold text-white">No schema fields match the current filters.</p>
                                <p className="mt-2 text-xs text-slate-400">Try clearing one or more filters to inspect the full preview-safe schema again.</p>
                            </div>
                        )}
                    </div>
                </details>

            </div>
        </div>
    )
}
