import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

type ProviderInfo = {
    providerName: string
    contactEmail: string
    orgType: string
}

type DatasetInfo = {
    title: string
    description: string
    category: string
    updateFrequency: string
    useCases: string
}

type UploadState = {
    fileName: string
    fileType: string
    fileSize: string
    progress: number
    status: 'idle' | 'uploading' | 'done'
}

const schemaColumns = [
    { name: 'record_id', type: 'string' },
    { name: 'timestamp_utc', type: 'datetime' },
    { name: 'region', type: 'string' },
    { name: 'signal_value', type: 'float' },
    { name: 'quality_flag', type: 'boolean' }
]

const sampleRows = [
    ['a1c9', '2026-02-15T10:00:00Z', 'NA-West', '0.842', 'true'],
    ['a1ca', '2026-02-15T10:05:00Z', 'EU-North', '0.913', 'true'],
    ['a1cb', '2026-02-15T10:10:00Z', 'APAC-East', '0.771', 'false']
]

const steps = [
    'Participant info',
    'Dataset details',
    'File upload',
    'Schema preview',
    'Review & submit'
] as const

export default function ProviderOnboardingPage() {
    const [currentStep, setCurrentStep] = useState(0)
    const [providerInfo, setProviderInfo] = useState<ProviderInfo>({
        providerName: '',
        contactEmail: '',
        orgType: 'enterprise'
    })
    const [datasetInfo, setDatasetInfo] = useState<DatasetInfo>({
        title: '',
        description: '',
        category: 'Climate',
        updateFrequency: 'Hourly',
        useCases: ''
    })
    const [privacy, setPrivacy] = useState<'anonymous' | 'visible' | 'restricted'>('anonymous')
    const [upload, setUpload] = useState<UploadState>({
        fileName: 'climate-observations.parquet',
        fileType: '.parquet',
        fileSize: '2.4 GB',
        progress: 0,
        status: 'idle'
    })

    useEffect(() => {
        if (upload.status !== 'uploading') return
        const interval = setInterval(() => {
            setUpload(prev => {
                const next = Math.min(prev.progress + 14, 100)
                return {
                    ...prev,
                    progress: next,
                    status: next >= 100 ? 'done' : 'uploading'
                }
            })
        }, 350)
        return () => clearInterval(interval)
    }, [upload.status])

    const progressPercent = useMemo(() => ((currentStep + 1) / steps.length) * 100, [currentStep])

    const nextStep = () => setCurrentStep(Math.min(currentStep + 1, steps.length - 1))
    const prevStep = () => setCurrentStep(Math.max(currentStep - 1, 0))

    return (
        <div className="bg-slate-900 text-white min-h-screen">
            <div className="border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-800">
                <div className="container mx-auto px-4 py-10 md:py-14 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs uppercase tracking-[0.12em] text-slate-300">
                                Participation Onboarding
                            </div>
                            <h1 className="text-3xl md:text-4xl font-semibold">Upload & Prepare a Secure Dataset</h1>
                            <p className="text-slate-300 max-w-3xl">
                                Secure, privacy-preserving flow for any participant to contribute data. Identity remains protected until you opt in.
                            </p>
                        </div>
                        <Link
                            to="/provider"
                            className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 hover:border-blue-500 text-sm font-medium text-slate-200 hover:text-white transition-colors"
                        >
                            Back to participant workspace
                        </Link>
                    </div>

                    <div>
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                            <span>{steps[currentStep]}</span>
                            <span>{currentStep + 1} / {steps.length}</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                            <div
                                className="h-full bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 transition-all"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-10 space-y-8">
                {currentStep === 0 && (
                    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold">Step 1 · Participant info</h2>
                                <p className="text-slate-400 text-sm">Participation requires identity and use-case verification; share basics while keeping public identity optional.</p>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs text-slate-300">Required</span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-slate-300 mb-2">Provider name</label>
                                <input
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    placeholder="e.g., Trusted Climate Consortium"
                                    value={providerInfo.providerName}
                                    onChange={(e) => setProviderInfo({ ...providerInfo, providerName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-300 mb-2">Contact email (not shown to buyers)</label>
                                <input
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    placeholder="alerts@provider.com"
                                    value={providerInfo.contactEmail}
                                    onChange={(e) => setProviderInfo({ ...providerInfo, contactEmail: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-300 mb-2">Organization type</label>
                                <select
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    value={providerInfo.orgType}
                                    onChange={(e) => setProviderInfo({ ...providerInfo, orgType: e.target.value })}
                                >
                                    <option value="enterprise">Enterprise / vendor</option>
                                    <option value="research">Research lab / academic</option>
                                    <option value="startup">Startup / product team</option>
                                    <option value="public">Public sector / NGO</option>
                                </select>
                            </div>
                            <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-4 text-sm text-slate-300">
                                <div className="font-semibold text-white mb-1">Privacy controls</div>
                                <p>Participation requires identity and use-case verification. You can remain non-public until approval.</p>
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 1 && (
                    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold">Step 2 · Dataset details</h2>
                                <p className="text-slate-400 text-sm">Help participants understand the dataset before secure access is approved.</p>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm text-slate-300 mb-2">Dataset title</label>
                                <input
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    placeholder="e.g., Global Climate Observations 2020-2024"
                                    value={datasetInfo.title}
                                    onChange={(e) => setDatasetInfo({ ...datasetInfo, title: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm text-slate-300 mb-2">Description</label>
                                <textarea
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                                    rows={4}
                                    placeholder="Short overview of coverage, sources, and controls."
                                    value={datasetInfo.description}
                                    onChange={(e) => setDatasetInfo({ ...datasetInfo, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-300 mb-2">Category</label>
                                <select
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    value={datasetInfo.category}
                                    onChange={(e) => setDatasetInfo({ ...datasetInfo, category: e.target.value })}
                                >
                                    <option value="Climate">Climate</option>
                                    <option value="Healthcare">Healthcare</option>
                                    <option value="Finance">Finance</option>
                                    <option value="Mobility">Mobility</option>
                                    <option value="Geospatial">Geospatial</option>
                                    <option value="Text/NLP">Text / NLP</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-300 mb-2">Update frequency</label>
                                <select
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    value={datasetInfo.updateFrequency}
                                    onChange={(e) => setDatasetInfo({ ...datasetInfo, updateFrequency: e.target.value })}
                                >
                                    <option value="Hourly">Hourly</option>
                                    <option value="Daily">Daily</option>
                                    <option value="Weekly">Weekly</option>
                                    <option value="Monthly">Monthly</option>
                                    <option value="Static">Static</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm text-slate-300 mb-2">Intended use cases</label>
                                <textarea
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                                    rows={3}
                                    placeholder="Forecasting, benchmarking, anomaly detection, LLM fine-tuning, etc."
                                    value={datasetInfo.useCases}
                                    onChange={(e) => setDatasetInfo({ ...datasetInfo, useCases: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold">Step 3 · File upload</h2>
                                <p className="text-slate-400 text-sm">Mock upload UI—no data leaves your machine until verification is approved.</p>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs text-slate-300">Secure & mock</span>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <div className="border border-dashed border-slate-600 rounded-lg p-4 text-center bg-slate-900/60">
                                    <div className="text-sm text-slate-300 mb-2">Drag & drop or choose a file</div>
                                    <button
                                        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm font-semibold"
                                        onClick={() =>
                                            setUpload({
                                                ...upload,
                                                status: 'uploading',
                                                progress: 0
                                            })
                                        }
                                    >
                                        Simulate upload
                                    </button>
                                    <div className="mt-3 text-xs text-slate-400">Accepted types: Parquet, CSV, JSONL (mock)</div>
                                </div>
                                <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-4 space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-300">File</span>
                                        <span className="text-white font-semibold">{upload.fileName}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-slate-400">
                                        <span>Type</span>
                                        <span>{upload.fileType}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-slate-400">
                                        <span>Size</span>
                                        <span>{upload.fileSize}</span>
                                    </div>
                                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                                        <div
                                            className={`h-full ${upload.status === 'done' ? 'bg-emerald-400' : 'bg-blue-400'} transition-all`}
                                            style={{ width: `${upload.progress}%` }}
                                        />
                                    </div>
                                    <div className="text-xs text-slate-400">
                                        {upload.status === 'idle' && 'Waiting to start mock upload.'}
                                        {upload.status === 'uploading' && 'Uploading...'}
                                        {upload.status === 'done' && 'Upload complete (mock).'}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-4">
                                <div className="text-sm text-slate-300 font-semibold mb-2">Upload guidance</div>
                                <ul className="list-disc list-inside text-sm text-slate-400 space-y-1">
                                    <li>No files are transmitted—this is a safe mock flow.</li>
                                    <li>Keep schema consistent for faster validation.</li>
                                    <li>Include small sample rows to speed QA.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold">Step 4 · Schema preview</h2>
                                <p className="text-slate-400 text-sm">Detected columns and sample rows (mocked) to streamline trust checks.</p>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs text-slate-300">Auto-detected</span>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-4">
                            <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-4">
                                <div className="text-sm text-slate-300 font-semibold mb-3">Columns</div>
                                <div className="space-y-2">
                                    {schemaColumns.map(col => (
                                        <div key={col.name} className="flex items-center justify-between bg-slate-800 rounded-lg px-3 py-2 border border-slate-700">
                                            <span className="text-white">{col.name}</span>
                                            <span className="text-xs px-2 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-200">
                                                {col.type}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-4">
                                <div className="text-sm text-slate-300 font-semibold mb-3">Sample rows</div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                        <thead className="text-xs uppercase tracking-[0.08em] text-slate-400 border-b border-slate-700">
                                            <tr>
                                                {schemaColumns.map(col => (
                                                    <th key={col.name} className="px-2 py-2 text-left">{col.name}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800 text-slate-200">
                                            {sampleRows.map((row, idx) => (
                                                <tr key={idx} className="hover:bg-slate-800/60">
                                                    {row.map((cell, cIdx) => (
                                                        <td key={`${idx}-${cIdx}`} className="px-2 py-2">{cell}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 4 && (
                    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold">Step 5 · Review & submit</h2>
                                <p className="text-slate-400 text-sm">Confirm details and privacy preferences. Access is granted only after approval.</p>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-xs text-emerald-200">
                                Ready to publish
                            </span>
                        </div>

                        <div className="grid lg:grid-cols-3 gap-4">
                            <div className="lg:col-span-2 bg-slate-900/60 border border-slate-700 rounded-lg p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-white">Dataset summary</h3>
                                    <span className="text-xs text-slate-400">{datasetInfo.updateFrequency} updates</span>
                                </div>
                                <div className="text-slate-200 text-sm">
                                    <div className="font-semibold text-lg">{datasetInfo.title || 'Untitled dataset'}</div>
                                    <div className="text-slate-400 mt-1">{datasetInfo.description || 'No description added yet.'}</div>
                                </div>
                                <div className="flex flex-wrap gap-2 text-xs">
                                    <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-200">Category: {datasetInfo.category}</span>
                                    <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-200">Use cases: {datasetInfo.useCases || 'Not specified'}</span>
                                </div>
                            </div>
                            <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-4 space-y-3">
                                <div className="text-sm font-semibold text-white">Privacy controls</div>
                                <div className="space-y-2 text-sm text-slate-200">
                                    <label className="flex items-start gap-2">
                                        <input
                                            type="radio"
                                            className="mt-1"
                                            checked={privacy === 'anonymous'}
                                            onChange={() => setPrivacy('anonymous')}
                                        />
                                        <span>Non-public participant (default). Others see dataset quality, not your identity.</span>
                                    </label>
                                    <label className="flex items-start gap-2">
                                        <input
                                            type="radio"
                                            className="mt-1"
                                            checked={privacy === 'visible'}
                                            onChange={() => setPrivacy('visible')}
                                        />
                                        <span>Identity visible to approved participants only.</span>
                                    </label>
                                    <label className="flex items-start gap-2">
                                        <input
                                            type="radio"
                                            className="mt-1"
                                            checked={privacy === 'restricted'}
                                            onChange={() => setPrivacy('restricted')}
                                        />
                                        <span>Restricted access — manual approvals required for any request.</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-4 text-sm text-slate-300">
                            <div className="font-semibold text-white mb-1">What happens next?</div>
                            <p>Upon submission, the platform will run QA on schema consistency, attach the AI confidence summary, and route buyer requests without revealing your identity unless you chose otherwise.</p>
                        </div>
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                    <div className="text-xs text-slate-400">
                        Step {currentStep + 1} of {steps.length} · {steps[currentStep]}
                    </div>
                    <div className="flex gap-3">
                        <button
                            className="px-4 py-2 rounded-lg border border-slate-700 text-slate-200 hover:border-slate-500 disabled:opacity-50"
                            onClick={prevStep}
                            disabled={currentStep === 0}
                        >
                            Back
                        </button>
                        {currentStep < steps.length - 1 ? (
                            <button
                                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                                onClick={nextStep}
                            >
                                Continue
                            </button>
                        ) : (
                            <button className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                                Submit for review
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
