import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

type Dataset = {
    id: number
    title: string
    timeRange: string
    description: string
    domain: string
    dataType: string
    geography: string
    confidenceScore: number
    verificationStatus: 'Verified' | 'Under Review'
    lastUpdated: string
    size: string
    coverage: string
    completeness: number
    freshness: number
    consistency: number
    accessType: 'Restricted' | 'Approved access required'
    sampleSchema: { field: string; type: string }[]
    confidenceSummary: string
    contributorTrust: string
    contributionHistory: string
}

const DATASETS: Dataset[] = [
    {
        id: 1,
        title: 'Global Climate Observations 2020-2024',
        timeRange: '2020-2024',
        description: 'Harmonized temperature, precipitation, wind, and atmospheric metrics from 5,000+ stations.',
        domain: 'Climate',
        dataType: 'Time-series',
        geography: 'Global',
        confidenceScore: 96,
        verificationStatus: 'Verified',
        lastUpdated: '2026-02-15',
        size: '2.4 TB',
        coverage: '1.2M records',
        completeness: 96,
        freshness: 94,
        consistency: 95,
        accessType: 'Approved access required',
        sampleSchema: [
            { field: 'station_id', type: 'string' },
            { field: 'timestamp_utc', type: 'datetime' },
            { field: 'temperature_c', type: 'float' },
            { field: 'precip_mm', type: 'float' }
        ],
        confidenceSummary: 'Stable ingest with anomaly gating; near-real-time freshness and cross-source reconciliation.',
        contributorTrust: 'Verified Participant',
        contributionHistory: '12 integrity checks'
    },
    {
        id: 2,
        title: 'Urban Mobility Sensor Streams',
        timeRange: '2023-2026 rolling',
        description: 'Speed, occupancy, and flow metrics from smart-city sensors across 50 metros.',
        domain: 'Mobility',
        dataType: 'Streaming',
        geography: 'North America, EU, APAC',
        confidenceScore: 91,
        verificationStatus: 'Verified',
        lastUpdated: '2026-02-14',
        size: '1.8 TB',
        coverage: '920K sensors',
        completeness: 92,
        freshness: 90,
        consistency: 89,
        accessType: 'Restricted',
        sampleSchema: [
            { field: 'sensor_id', type: 'string' },
            { field: 'region', type: 'string' },
            { field: 'timestamp_utc', type: 'datetime' },
            { field: 'avg_speed_kph', type: 'float' }
        ],
        confidenceSummary: 'High availability with minor variance during peak hours; governed streaming channel.',
        contributorTrust: 'Trusted Participant',
        contributionHistory: '8 deliveries, zero disputes'
    },
    {
        id: 3,
        title: 'Financial Market Tick Data',
        timeRange: '2024-2026 rolling',
        description: 'Microsecond-level trades and quotes from major equity venues.',
        domain: 'Finance',
        dataType: 'Tick / time-series',
        geography: 'US, EU',
        confidenceScore: 95,
        verificationStatus: 'Verified',
        lastUpdated: '2026-02-12',
        size: '3.2 TB',
        coverage: '450M ticks',
        completeness: 97,
        freshness: 93,
        consistency: 94,
        accessType: 'Approved access required',
        sampleSchema: [
            { field: 'symbol', type: 'string' },
            { field: 'ts', type: 'datetime' },
            { field: 'price', type: 'decimal' },
            { field: 'size', type: 'int' }
        ],
        confidenceSummary: 'Tight latency distribution; reconciled across venues; anomaly filters for outliers.',
        contributorTrust: 'High Confidence Participant',
        contributionHistory: '18 verified pushes'
    },
    {
        id: 4,
        title: 'Clinical Outcomes (De-identified)',
        timeRange: '2018-2025',
        description: 'Aggregated, de-identified outcomes across multiple clinical trials.',
        domain: 'Healthcare',
        dataType: 'Tabular',
        geography: 'Global',
        confidenceScore: 92,
        verificationStatus: 'Under Review',
        lastUpdated: '2026-02-10',
        size: '780 GB',
        coverage: '3.1M patient encounters',
        completeness: 90,
        freshness: 88,
        consistency: 91,
        accessType: 'Restricted',
        sampleSchema: [
            { field: 'trial_id', type: 'string' },
            { field: 'arm', type: 'string' },
            { field: 'outcome_flag', type: 'boolean' },
            { field: 'time_to_event_days', type: 'int' }
        ],
        confidenceSummary: 'De-identification and k-anonymity applied; under review for additional privacy controls.',
        contributorTrust: 'Verified Participant',
        contributionHistory: '5 secure submissions'
    },
    {
        id: 5,
        title: 'Satellite Land Use Dataset 2023',
        timeRange: '2022-2023',
        description: 'Satellite imagery and land use classification data from Landsat and Sentinel-2 missions.',
        domain: 'Climate',
        dataType: 'Geospatial',
        geography: 'Global',
        confidenceScore: 88,
        verificationStatus: 'Verified',
        lastUpdated: '2026-01-20',
        size: '450 GB',
        coverage: '2.8M tiles',
        completeness: 88,
        freshness: 85,
        consistency: 87,
        accessType: 'Approved access required',
        sampleSchema: [
            { field: 'tile_id', type: 'string' },
            { field: 'acquisition_date', type: 'date' },
            { field: 'land_use_class', type: 'string' },
            { field: 'ndvi', type: 'float' },
            { field: 'latitude', type: 'float' },
            { field: 'longitude', type: 'float' }
        ],
        confidenceSummary: 'Multi-spectral analysis with ground truthing; some regions have incomplete coverage.',
        contributorTrust: 'Trusted Participant',
        contributionHistory: '6 verified submissions'
    },
    {
        id: 6,
        title: 'Consumer Behavior Analytics Q4',
        timeRange: 'Q4 2025',
        description: 'Consumer spending patterns and product preferences across demographic segments.',
        domain: 'Finance',
        dataType: 'Tabular',
        geography: 'North America',
        confidenceScore: 79,
        verificationStatus: 'Under Review',
        lastUpdated: '2026-01-25',
        size: '320 GB',
        coverage: '45M households',
        completeness: 82,
        freshness: 78,
        consistency: 80,
        accessType: 'Restricted',
        sampleSchema: [
            { field: 'household_id', type: 'string' },
            { field: 'category', type: 'string' },
            { field: 'spend_amount', type: 'decimal' },
            { field: 'demographic_segment', type: 'string' }
        ],
        confidenceSummary: 'Aggregated from retail loyalty cards; under review for anonymization compliance.',
        contributorTrust: 'Verified Participant',
        contributionHistory: '4 secure submissions'
    },
    {
        id: 7,
        title: 'Genomics Research Dataset v2',
        timeRange: '2019-2025',
        description: 'Gene expression data and variant calling from research institutions and biobanks.',
        domain: 'Healthcare',
        dataType: 'Genomic',
        geography: 'Global',
        confidenceScore: 94,
        verificationStatus: 'Verified',
        lastUpdated: '2026-02-01',
        size: '1.5 TB',
        coverage: '125K samples',
        completeness: 94,
        freshness: 92,
        consistency: 95,
        accessType: 'Approved access required',
        sampleSchema: [
            { field: 'sample_id', type: 'string' },
            { field: 'gene_id', type: 'string' },
            { field: 'expression_value', type: 'float' },
            { field: 'variant_call', type: 'string' },
            { field: 'patient_cohort', type: 'string' }
        ],
        confidenceSummary: 'Peer-reviewed and reproducibility validated; all data has ethical approvals.',
        contributorTrust: 'High Confidence Participant',
        contributionHistory: '15 verified pushes'
    },
    {
        id: 8,
        title: 'Smart Grid Energy Patterns',
        timeRange: '2024-2026 rolling',
        description: 'Energy consumption patterns from smart meters and grid sensors across utilities.',
        domain: 'Energy',
        dataType: 'Time-series',
        geography: 'US, EU',
        confidenceScore: 91,
        verificationStatus: 'Verified',
        lastUpdated: '2026-02-13',
        size: '890 GB',
        coverage: '4.2M meters',
        completeness: 91,
        freshness: 88,
        consistency: 90,
        accessType: 'Approved access required',
        sampleSchema: [
            { field: 'meter_id', type: 'string' },
            { field: 'timestamp_utc', type: 'datetime' },
            { field: 'consumption_kwh', type: 'float' },
            { field: 'voltage', type: 'float' },
            { field: 'frequency', type: 'float' }
        ],
        confidenceSummary: 'Real-time grid monitoring with anomaly detection; some residential data anonymized.',
        contributorTrust: 'Verified Participant',
        contributionHistory: '10 verified submissions'
    }
]

const domains = ['All', ...new Set(DATASETS.map(d => d.domain))]
const dataTypes = ['All', ...new Set(DATASETS.map(d => d.dataType))]
const geographies = ['All', ...new Set(DATASETS.map(d => d.geography))]
const verificationStates: Array<'All' | Dataset['verificationStatus']> = ['All', 'Verified', 'Under Review']
const freshnessBuckets = ['All', 'Real-time / <1h', 'Daily', 'Weekly']

const bucketFreshness = (score: number) => {
    if (score >= 93) return 'Real-time / <1h'
    if (score >= 88) return 'Daily'
    return 'Weekly'
}

const badgeColors: Record<Dataset['verificationStatus'], string> = {
    Verified: 'bg-emerald-500/10 border-emerald-400 text-emerald-200',
    'Under Review': 'bg-amber-500/10 border-amber-400 text-amber-200'
}

const accessBadgeColors: Record<Dataset['accessType'], string> = {
    Restricted: 'bg-violet-500/10 border-violet-400/70 text-violet-200',
    'Approved access required': 'bg-blue-500/10 border-blue-400/70 text-blue-200'
}

const confidenceColor = (score: number) => {
    if (score >= 95) return 'text-emerald-300'
    if (score >= 90) return 'text-cyan-300'
    if (score >= 85) return 'text-amber-300'
    return 'text-rose-300'
}

const toShortTrustLabel = (trust: string) => {
    if (trust.toLowerCase().includes('high confidence')) return 'High confidence'
    if (trust.toLowerCase().includes('verified')) return 'Verified'
    if (trust.toLowerCase().includes('trusted')) return 'Trusted'
    return trust
}

const compactMetricPillClasses = {
    Completeness: 'border-emerald-400/40 text-emerald-200 bg-emerald-500/10',
    Freshness: 'border-cyan-400/40 text-cyan-200 bg-cyan-500/10',
    Consistency: 'border-blue-400/40 text-blue-200 bg-blue-500/10'
} as const

export default function DatasetsPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedDomain, setSelectedDomain] = useState('All')
    const [selectedType, setSelectedType] = useState('All')
    const [selectedGeo, setSelectedGeo] = useState('All')
    const [selectedVerification, setSelectedVerification] = useState<'All' | Dataset['verificationStatus']>('All')
    const [selectedFreshness, setSelectedFreshness] = useState('All')
    const [minConfidence, setMinConfidence] = useState(0)

    const filtered = useMemo(() => {
        return DATASETS.filter(d => {
            const matchesSearch =
                d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                d.description.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesDomain = selectedDomain === 'All' || d.domain === selectedDomain
            const matchesType = selectedType === 'All' || d.dataType === selectedType
            const matchesGeo = selectedGeo === 'All' || d.geography === selectedGeo
            const matchesVerification = selectedVerification === 'All' || d.verificationStatus === selectedVerification
            const matchesFreshness = selectedFreshness === 'All' || bucketFreshness(d.freshness) === selectedFreshness
            const matchesConfidence = d.confidenceScore >= minConfidence
            return matchesSearch && matchesDomain && matchesType && matchesGeo && matchesVerification && matchesFreshness && matchesConfidence
        })
    }, [searchTerm, selectedDomain, selectedType, selectedGeo, selectedVerification, selectedFreshness, minConfidence])

    return (
        <div className="container mx-auto px-5 lg:px-6 py-8">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Dataset Discovery</h1>
                <p className="text-slate-400">
                    Browse verified datasets with AI-evaluated confidence. Metadata and summaries only; data stays secured until approval.
                </p>
            </div>

            {/* Search */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search by title or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
            </div>

            {/* Filters */}
            <div className="mb-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    <div>
                        <label className="block text-sm text-slate-300 mb-2">Domain</label>
                        <select
                            value={selectedDomain}
                            onChange={(e) => setSelectedDomain(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                            {domains.map(d => <option key={d}>{d}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-300 mb-2">Data type</label>
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                            {dataTypes.map(d => <option key={d}>{d}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-300 mb-2">Geography</label>
                        <select
                            value={selectedGeo}
                            onChange={(e) => setSelectedGeo(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                            {geographies.map(g => <option key={g}>{g}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-300 mb-2">Freshness</label>
                        <select
                            value={selectedFreshness}
                            onChange={(e) => setSelectedFreshness(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                            {freshnessBuckets.map(f => <option key={f}>{f}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-300 mb-2">Verification</label>
                        <select
                            value={selectedVerification}
                            onChange={(e) => setSelectedVerification(e.target.value as typeof selectedVerification)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                            {verificationStates.map(v => <option key={v}>{v}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-300 mb-2">Minimum confidence</label>
                        <select
                            value={minConfidence}
                            onChange={(e) => setMinConfidence(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                            {[0, 85, 90, 95].map(v => (
                                <option key={v} value={v}>{v === 0 ? 'Any' : `${v}+`}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="mb-6 text-slate-400">
                Showing <span className="text-white font-semibold">{filtered.length}</span> of{' '}
                <span className="text-white font-semibold">{DATASETS.length}</span> datasets
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 md:gap-9">
                {filtered.map(dataset => (
                    <div
                        key={dataset.id}
                        className="h-full rounded-2xl border border-slate-700/80 bg-slate-800/70 px-4 py-4 shadow-[0_12px_28px_-20px_rgba(2,132,199,0.35)] backdrop-blur-sm flex flex-col"
                    >
                        <div className="mb-3 rounded-xl border border-slate-700/70 bg-slate-900/70 px-3 py-3">
                            <div className="flex items-baseline justify-between">
                                <span className="text-[11px] uppercase tracking-[0.12em] text-slate-400">Confidence</span>
                                <span className={`text-2xl font-bold leading-none ${confidenceColor(dataset.confidenceScore)}`}>{dataset.confidenceScore}%</span>
                            </div>
                            <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-700/80">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400"
                                    style={{ width: `${dataset.confidenceScore}%` }}
                                />
                            </div>
                        </div>

                        <div className="mb-3 flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <h3 className="text-[15px] font-bold leading-tight text-white">{dataset.title}</h3>
                                <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{dataset.description}</p>
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-1.5">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${badgeColors[dataset.verificationStatus]}`}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-90" />
                                    {dataset.verificationStatus}
                                </span>
                                <span className="inline-flex items-center rounded-full border border-slate-600 bg-slate-900/80 px-2.5 py-1 text-[10px] font-semibold text-slate-200">
                                    {toShortTrustLabel(dataset.contributorTrust)}
                                </span>
                            </div>
                        </div>

                        <div className="mb-3 flex items-center gap-2 overflow-x-auto whitespace-nowrap text-[11px] text-slate-300">
                            <span className="rounded-full border border-slate-600/80 bg-slate-900/70 px-2.5 py-1">Domain: {dataset.domain}</span>
                            <span className="rounded-full border border-slate-600/80 bg-slate-900/70 px-2.5 py-1">Type: {dataset.dataType}</span>
                        </div>

                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-[11px]">
                                {([
                                    { label: 'Completeness', value: dataset.completeness, short: 'C' },
                                    { label: 'Freshness', value: dataset.freshness, short: 'F' },
                                    { label: 'Consistency', value: dataset.consistency, short: 'S' }
                                ] as const).map(metric => (
                                    <span
                                        key={metric.label}
                                        title={`${metric.label}: ${metric.value}%`}
                                        aria-label={`${metric.label}: ${metric.value}%`}
                                        className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full border px-2 font-semibold cursor-help ${compactMetricPillClasses[metric.label]}`}
                                    >
                                        {metric.short}
                                    </span>
                                ))}
                            </div>
                            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] ${accessBadgeColors[dataset.accessType]}`}>
                                {dataset.accessType}
                            </span>
                        </div>

                        <div className="text-[11px] text-slate-500">
                            <span>Range: {dataset.timeRange}</span>
                            <span className="mx-2 text-slate-600">|</span>
                            <span>{dataset.geography}</span>
                        </div>

                        <div className="mt-auto pt-4 flex justify-center">
                            <Link
                                to={`/datasets/${dataset.id}`}
                                className="inline-flex w-full items-center justify-center rounded-xl border border-blue-500 bg-transparent px-6 py-3.5 text-sm font-semibold text-blue-400 transition-colors hover:bg-blue-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                            >
                                View Details
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-slate-500 text-4xl mb-4">🔒</div>
                    <h3 className="text-xl font-semibold text-white mb-2">No datasets match these filters</h3>
                    <p className="text-slate-400">Adjust filters to discover verified datasets. Data stays locked until approved.</p>
                </div>
            )}
        </div>
    )
}
