import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

type OnboardingFormState = {
    organizationName: string
    officialWorkEmail: string
    inviteCode: string
    roleInOrganization: string
    industryDomain: string
    country: string
    intendedUsage: string[]
    participationIntent: string[]
    responsibleDataUsage: boolean
    noUnauthorizedSharing: boolean
    platformCompliancePolicies: boolean
    customOperationText: string
    processingJurisdiction: string
    dataTTL: string
    externalAPIs: boolean
    externalAPIDetails: string
    electronicSignature: string
}

const usageCategories = [
    {
        id: 'algorithmic',
        label: 'Algorithmic Training & Fine-Tuning',
        subOptions: ['Computer Vision Models', 'NLP & Text Analysis', 'Recommendation Systems', 'Predictive Analytics', 'Anomaly Detection'],
        riskTier: 'high' as const
    },
    {
        id: 'internal',
        label: 'Internal Business Intelligence',
        subOptions: ['Dashboards & Reporting', 'Performance Metrics', 'Customer Analytics', 'Supply Chain Optimization', 'Workforce Analytics'],
        riskTier: 'standard' as const
    },
    {
        id: 'financial',
        label: 'Financial & Quantitative Modeling',
        subOptions: ['Algorithmic Trading', 'Credit Risk Scoring', 'Fraud Detection', 'Portfolio Optimization', 'Market Simulation'],
        riskTier: 'high' as const
    },
    {
        id: 'academic',
        label: 'Academic / Non-Profit Research',
        subOptions: ['Public Policy Studies', 'Epidemiological Research', 'Environmental Analysis', 'Social Science Studies', 'Open Data Initiatives'],
        riskTier: 'standard' as const
    },
    {
        id: 'commercial',
        label: 'Commercial Product Integration',
        subOptions: ['SaaS Platform Features', 'Mobile Application', 'Embedded Analytics', 'API Services', 'Enterprise Solutions'],
        riskTier: 'high' as const
    },
    {
        id: 'custom',
        label: 'Custom Operation',
        subOptions: [],
        riskTier: 'high' as const
    }
]

const participationOptions = ['Data Consumer (Ingest & Analyze)', 'Data Provider (Contribute & Monetize)', 'Compliance / Legal Auditor']
const allowedFileExtensions = new Set(['pdf', 'jpg', 'jpeg', 'png'])
const maxFileSizeBytes = 5 * 1024 * 1024

const freeEmailProviders = new Set([
    'gmail.com',
    'yahoo.com',
    'outlook.com',
    'hotmail.com',
    'icloud.com',
    'aol.com',
    'protonmail.com'
])

const stepTitles = [
    'Organization & Identity',
    'Intended Platform Usage',
    'Participation Intent',
    'Verification & Credentials',
    'Zero-Trust Pipeline Agreement'
]

const isWorkEmail = (value: string) => /^[^\s@]+@[^\s@]+$/.test(value)
const isCorporateEmail = (value: string) => {
    if (!isWorkEmail(value)) return false
    const domain = value.split('@')[1]?.toLowerCase()
    return Boolean(domain) && !freeEmailProviders.has(domain)
}
const MOCK_AUTH = (import.meta.env.VITE_MOCK_AUTH ?? 'true') === 'true'
const SUBMISSION_META_STORAGE_KEY = 'Redoubt:onboarding:submissionMeta'
const generateReferenceId = () => `#RDT-2026-${Math.floor(1000 + Math.random() * 9000)}`

const formatSubmissionDate = (date: Date) =>
    date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    })

export default function OnboardingPage() {
    const navigate = useNavigate()
    const { accessStatus, applicantEmail, isAuthenticated, submitApplication } = useAuth()
    const [step, setStep] = useState(1)
    const [step5SubmitUnlockAt, setStep5SubmitUnlockAt] = useState(0)
    const [showStepError, setShowStepError] = useState(false)
    const [applicationReference, setApplicationReference] = useState(() => {
        const stored = localStorage.getItem(SUBMISSION_META_STORAGE_KEY)
        if (!stored) return generateReferenceId()
        try {
            const parsed = JSON.parse(stored) as { referenceId?: string }
            return parsed.referenceId || generateReferenceId()
        } catch {
            return generateReferenceId()
        }
    })
    const [submittedDate, setSubmittedDate] = useState(() => {
        const stored = localStorage.getItem(SUBMISSION_META_STORAGE_KEY)
        if (!stored) return formatSubmissionDate(new Date())
        try {
            const parsed = JSON.parse(stored) as { submittedDate?: string }
            return parsed.submittedDate || formatSubmissionDate(new Date())
        } catch {
            return formatSubmissionDate(new Date())
        }
    })
    const [state, setState] = useState<OnboardingFormState>({
        organizationName: '',
        officialWorkEmail: applicantEmail,
        inviteCode: '',
        roleInOrganization: '',
        industryDomain: '',
        country: '',
        intendedUsage: [],
        participationIntent: [],
        responsibleDataUsage: false,
        noUnauthorizedSharing: false,
        platformCompliancePolicies: false,
        customOperationText: '',
        processingJurisdiction: '',
        dataTTL: '',
        externalAPIs: false,
        externalAPIDetails: '',
        electronicSignature: ''
    })
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
    const [showAdvancedCompliance, setShowAdvancedCompliance] = useState(false)
    const linkedInTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const [isLinkedInLoading, setIsLinkedInLoading] = useState(false)
    const [isLinkedInConnected, setIsLinkedInConnected] = useState(false)
    const [affiliationFileName, setAffiliationFileName] = useState<string | null>(null)
    const [authorizationFileName, setAuthorizationFileName] = useState<string | null>(null)
    const [affiliationError, setAffiliationError] = useState<string | null>(null)
    const [authorizationError, setAuthorizationError] = useState<string | null>(null)
    const [dragTarget, setDragTarget] = useState<'affiliation' | 'authorization' | null>(null)
    const [isDNSVerifying, setIsDNSVerifying] = useState(false)
    const [isDomainVerified, setIsDomainVerified] = useState(false)

    useEffect(() => {
        return () => {
            if (linkedInTimerRef.current) {
                clearTimeout(linkedInTimerRef.current)
            }
        }
    }, [])

    if (!MOCK_AUTH && accessStatus === 'approved' && isAuthenticated) return <Navigate to="/dashboard" replace />
    if (!MOCK_AUTH && accessStatus === 'approved') return <Navigate to="/login" replace />

    const toggleValue = (field: 'intendedUsage' | 'participationIntent', value: string) => {
        setState(prev => {
            const exists = prev[field].includes(value)
            return { ...prev, [field]: exists ? prev[field].filter(item => item !== value) : [...prev[field], value] }
        })
    }

    const toggleCategory = (categoryId: string) => {
        setExpandedCategories(prev => {
            const next = new Set(prev)
            if (next.has(categoryId)) {
                next.delete(categoryId)
            } else {
                next.add(categoryId)
            }
            return next
        })
    }

    const handleCategorySelect = (category: typeof usageCategories[0]) => {
        const categoryFullLabel = category.label
        const isSelected = state.intendedUsage.includes(categoryFullLabel)
        
        if (isSelected) {
            setState(prev => ({
                ...prev,
                intendedUsage: prev.intendedUsage.filter(u => u !== categoryFullLabel)
            }))
            if (category.id === 'custom') {
                setState(prev => ({ ...prev, customOperationText: '' }))
            }
        } else {
            setState(prev => ({
                ...prev,
                intendedUsage: [...prev.intendedUsage, categoryFullLabel]
            }))
            setExpandedCategories(prev => new Set([...prev, category.id]))
        }
    }

    const handleSubOptionSelect = (subOption: string, categoryLabel: string) => {
        toggleValue('intendedUsage', subOption)
    }

    const handleLinkedInConnect = () => {
        if (isLinkedInLoading || isLinkedInConnected) return
        setIsLinkedInLoading(true)
        linkedInTimerRef.current = setTimeout(() => {
            setIsLinkedInLoading(false)
            setIsLinkedInConnected(true)
        }, 1600)
    }

    const handleDNSVerification = () => {
        if (isDNSVerifying || isDomainVerified) return
        setIsDNSVerifying(true)
        setTimeout(() => {
            setIsDNSVerifying(false)
            setIsDomainVerified(true)
        }, 2000)
    }

    const handleFileSelection = (file: File | null | undefined, target: 'affiliation' | 'authorization') => {
        if (!file) return
        const fileExtension = file.name.split('.').pop()?.toLowerCase()
        const setFileName = target === 'affiliation' ? setAffiliationFileName : setAuthorizationFileName
        const setError = target === 'affiliation' ? setAffiliationError : setAuthorizationError

        if (!fileExtension || !allowedFileExtensions.has(fileExtension)) {
            setError('Only PDF, JPG, and PNG files are accepted.')
            setFileName(null)
            return
        }

        if (file.size > maxFileSizeBytes) {
            setError('File size exceeds 5MB limit.')
            setFileName(null)
            return
        }

        setError(null)
        setFileName(file.name)
    }

    const handleFileDrop = (event: React.DragEvent<HTMLLabelElement>, target: 'affiliation' | 'authorization') => {
        event.preventDefault()
        setDragTarget(null)
        handleFileSelection(event.dataTransfer.files?.[0], target)
    }

    const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>, target: 'affiliation' | 'authorization') => {
        handleFileSelection(event.target.files?.[0], target)
    }

    const fillMockStep1 = () => {
        setState(prev => ({
            ...prev,
            organizationName: 'Demo Corporation',
            officialWorkEmail: 'demo@redoubt.local',
            inviteCode: 'REDO-2026',
            roleInOrganization: 'Senior Data Engineer',
            industryDomain: 'Technology & AI',
            country: 'United States'
        }))
        setShowStepError(false)
    }

    const fillMockStep2 = () => {
        setState(prev => ({
            ...prev,
            intendedUsage: ['Algorithmic Training & Fine-Tuning', 'Computer Vision Models', 'Internal Business Intelligence', 'Dashboards & Reporting'],
            customOperationText: ''
        }))
        setExpandedCategories(new Set(['algorithmic', 'internal']))
        setShowStepError(false)
    }

    const fillMockStep3 = () => {
        setState(prev => ({
            ...prev,
            participationIntent: ['Data Consumer (Ingest & Analyze)'],
            responsibleDataUsage: true,
            noUnauthorizedSharing: true,
            platformCompliancePolicies: true,
            electronicSignature: 'John Mitchell'
        }))
        setShowStepError(false)
    }

    const stepOneReady =
        state.organizationName.trim().length > 0 &&
        isCorporateEmail(state.officialWorkEmail.trim()) &&
        state.inviteCode.trim().length >= 6 &&
        state.roleInOrganization.trim().length > 0 &&
        state.industryDomain.trim().length > 0 &&
        state.country.trim().length > 0

    const stepTwoReady = state.intendedUsage.length > 0
    const stepThreeReady =
        state.participationIntent.length > 0 &&
        state.responsibleDataUsage &&
        state.noUnauthorizedSharing &&
        state.platformCompliancePolicies &&
        state.electronicSignature.trim().length > 0
    const stepFourReady = isDomainVerified && Boolean(affiliationFileName) && Boolean(authorizationFileName)
    const stepFiveReady = state.responsibleDataUsage && state.noUnauthorizedSharing && state.platformCompliancePolicies

    const stepReady =
        step === 1
            ? stepOneReady
            : step === 2
                ? stepTwoReady
                : step === 3
                    ? stepThreeReady
                    : step === 4
                        ? stepFourReady
                        : stepFiveReady

    useEffect(() => {
        if (stepReady) setShowStepError(false)
    }, [stepReady, step])

    // Temporarily disabled to debug redirect issue
    // useEffect(() => {
    //     if (accessStatus === 'pending' && step === 1) {
    //         navigate('/onboarding/confirmation', { replace: true })
    //     }
    // }, [accessStatus, navigate, step])

    const next = () => {
        if (step >= 5) return
        if (!stepReady) {
            setShowStepError(true)
            return
        }
        setShowStepError(false)
        if (step === 4) {
            setStep5SubmitUnlockAt(Date.now() + 400)
            setStep(5)
            return
        }
        setStep(prev => Math.min(prev + 1, 5))
    }

    const back = () => {
        if (step <= 1) return
        setShowStepError(false)
        if (step === 5) setStep5SubmitUnlockAt(0)
        setStep(prev => prev - 1)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (Date.now() < step5SubmitUnlockAt) return
        if (!stepFiveReady) {
            setShowStepError(true)
            return
        }

        const referenceId = generateReferenceId()
        const submissionDate = formatSubmissionDate(new Date())

        localStorage.setItem(
            SUBMISSION_META_STORAGE_KEY,
            JSON.stringify({
                referenceId,
                submittedDate: submissionDate
            })
        )

        submitApplication(state.officialWorkEmail)
        setApplicationReference(referenceId)
        setSubmittedDate(submissionDate)
        setShowStepError(false)
        navigate('/application-status')
    }

    return (
        <div className="bg-slate-900 min-h-screen text-white">
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Participant Onboarding</h1>
                    <p className="text-slate-400">Security and confidence infrastructure intake for controlled participation.</p>
                </div>

                <div className="mb-8 overflow-x-auto pb-1">
                    <div className="min-w-[760px] flex items-start">
                        {stepTitles.map((title, idx) => {
                            const currentStep = idx + 1
                            const active = currentStep === step
                            const done = currentStep < step
                            const connectorDone = currentStep < step
                            return (
                                <div key={title} className="flex items-center flex-1 last:flex-none">
                                    <div className="w-32">
                                        <div
                                            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-colors ${
                                                done
                                                    ? 'border-emerald-400 bg-emerald-500/15 text-emerald-300'
                                                    : active
                                                        ? 'border-blue-400 bg-blue-500/10 text-blue-200 shadow-[0_0_0_3px_rgba(59,130,246,0.25),0_0_18px_rgba(59,130,246,0.35)]'
                                                        : 'border-slate-700 bg-slate-900 text-slate-500'
                                            }`}
                                        >
{done ? (
                                                 <svg
                                                     viewBox="0 0 24 24"
                                                     className="w-6 h-6"
                                                     fill="none"
                                                     stroke="currentColor"
                                                     strokeWidth="2.75"
                                                 >
                                                     <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                                                 </svg>
                                             ) : (
                                                 currentStep
                                             )}
                                        </div>
                                        <div className="mt-2 text-[11px] uppercase tracking-[0.1em] text-slate-500">
                                            Step {currentStep}
                                        </div>
                                        <div
                                            className={`mt-1 text-xs font-semibold leading-4 ${
                                                done ? 'text-emerald-200' : active ? 'text-blue-100' : 'text-slate-500'
                                            }`}
                                        >
                                            {title}
                                        </div>
                                    </div>
                                    {idx < stepTitles.length - 1 && (
                                        <div
                                            className={`h-[2px] flex-1 mx-2 rounded-full ${
                                                connectorDone ? 'bg-emerald-400/70' : 'bg-slate-700'
                                            }`}
                                        />
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {step === 1 && (
                        <section className="bg-[#0a1628] border border-[rgba(148,163,184,0.08)] rounded-xl p-5 space-y-4">
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="text-xl font-semibold">Organization & Identity</h2>
                                <button
                                    type="button"
                                    onClick={fillMockStep1}
                                    className="text-[11px] px-2.5 py-1.5 rounded-md border border-slate-500/40 bg-transparent text-slate-300 hover:border-blue-500/70 hover:text-blue-100 transition-colors"
                                >
                                    Use mock data
                                </button>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[13px] text-slate-400 mb-2">Organization name</label>
                                    <input
                                        className="w-full px-4 py-3 bg-[#0d1f35] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/60"
                                        value={state.organizationName}
                                        onChange={(e) => setState(prev => ({ ...prev, organizationName: e.target.value }))}
                                        placeholder="Your organization"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[13px] text-slate-400 mb-2">Official work email</label>
                                    <input
                                        type="email"
                                        className="w-full px-4 py-3 bg-[#0d1f35] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/60"
                                        value={state.officialWorkEmail}
                                        onChange={(e) => setState(prev => ({ ...prev, officialWorkEmail: e.target.value }))}
                                        placeholder="name@organization.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[13px] text-slate-400 mb-2">Invite code</label>
                                    <input
                                        className="w-full px-4 py-3 bg-[#0d1f35] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/60"
                                        value={state.inviteCode}
                                        onChange={(e) => setState(prev => ({ ...prev, inviteCode: e.target.value }))}
                                        placeholder="INV-XXXXXX"
                                    />
                                    <p className="mt-1 text-[11px] text-slate-500">Optional — we'll verify either way, but this helps us move faster.</p>
                                </div>
                                <div>
                                    <label className="block text-[13px] text-slate-400 mb-2">Role in organization</label>
                                    <input
                                        className="w-full px-4 py-3 bg-[#0d1f35] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/60"
                                        value={state.roleInOrganization}
                                        onChange={(e) => setState(prev => ({ ...prev, roleInOrganization: e.target.value }))}
                                        placeholder="Research lead, ML engineer, analyst..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-[13px] text-slate-400 mb-2">Industry/domain</label>
                                    <input
                                        className="w-full px-4 py-3 bg-[#0d1f35] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/60"
                                        value={state.industryDomain}
                                        onChange={(e) => setState(prev => ({ ...prev, industryDomain: e.target.value }))}
                                        placeholder="Healthcare, mobility, climate..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-[13px] text-slate-400 mb-2">Country</label>
                                    <input
                                        className="w-full px-4 py-3 bg-[#0d1f35] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/60"
                                        value={state.country}
                                        onChange={(e) => setState(prev => ({ ...prev, country: e.target.value }))}
                                        placeholder="Country"
                                    />
                                </div>
                            </div>
                        </section>
                    )}

                    {step === 2 && (
                        <section className="bg-[#0a1628] border border-[rgba(148,163,184,0.08)] rounded-xl p-5 space-y-4">
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="text-xl font-semibold">Intended Platform Usage</h2>
                                <button
                                    type="button"
                                    onClick={fillMockStep2}
                                    className="text-[11px] px-2.5 py-1.5 rounded-md border border-slate-500/40 bg-transparent text-slate-300 hover:border-blue-500/70 hover:text-blue-100 transition-colors"
                                >
                                    Use mock data
                                </button>
                            </div>
                            <p className="text-sm text-slate-400">Select a category to view sub-options.</p>
                            <div className="space-y-3">
                                {usageCategories.map(category => {
                                    const isCategorySelected = state.intendedUsage.includes(category.label)
                                    const isExpanded = expandedCategories.has(category.id)
                                    return (
                                        <div key={category.id} className="space-y-2">
                                            <button
                                                type="button"
                                                onClick={() => handleCategorySelect(category)}
                                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm font-semibold transition-colors ${
                                                    isCategorySelected
                                                        ? 'bg-blue-500/15 border-blue-400 text-blue-200 shadow-[0_0_0_1px_rgba(96,165,250,0.45),0_0_18px_rgba(59,130,246,0.35)]'
                                                        : 'border-slate-700/80 bg-slate-900/70 text-slate-300 hover:border-slate-500'
                                                }`}
                                            >
                                                <span>{category.label}</span>
                                                <svg
                                                    className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                            {isExpanded && category.subOptions.length > 0 && (
                                                <div className="ml-4 pl-4 border-l-2 border-slate-700/80 py-2">
                                                    <div className="flex flex-wrap gap-2">
                                                        {category.subOptions.map(subOption => {
                                                            const isSubSelected = state.intendedUsage.includes(subOption)
                                                            return (
                                                                <button
                                                                    key={subOption}
                                                                    type="button"
                                                                    onClick={() => handleSubOptionSelect(subOption, category.label)}
                                                                    className={`px-2.5 py-1.5 rounded-md border text-xs font-medium transition-colors ${
                                                                        isSubSelected
                                                                            ? 'bg-cyan-500/15 border-cyan-400/50 text-cyan-300'
                                                                            : 'border-slate-700 bg-slate-900/50 text-slate-400 hover:border-slate-500 hover:text-slate-300'
                                                                    }`}
                                                                >
                                                                    {subOption}
                                                                </button>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                            {isExpanded && category.id === 'custom' && (
                                                <div className="ml-4 pl-4 border-l-2 border-slate-700/80 py-2">
                                                    <textarea
                                                        value={state.customOperationText}
                                                        onChange={(e) => setState(prev => ({ ...prev, customOperationText: e.target.value }))}
                                                        placeholder="Describe your intended data usage for DPO review..."
                                                        rows={3}
                                                        className="w-full px-3 py-2 bg-slate-900/80 border border-slate-700 rounded-lg text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 resize-none font-mono"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                            {state.intendedUsage.length > 0 && (
                                <div className="pt-2">
                                    {state.intendedUsage.some(u => 
                                        usageCategories.find(c => c.label === u)?.riskTier === 'high'
                                    ) ? (
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-medium">
                                            <span>⚠️</span> Clearance: High Compliance Tier (Stricter Audit Applied)
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
                                            <span>✓</span> Clearance: Standard Tier
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            <div className="pt-2 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowAdvancedCompliance(!showAdvancedCompliance)}
                                    className="flex items-center gap-2 text-xs text-slate-500 hover:text-cyan-400 transition-colors"
                                >
                                    <span className={`transition-transform ${showAdvancedCompliance ? 'rotate-90' : ''}`}>▶</span>
                                    {showAdvancedCompliance ? 'Hide' : '+'} Configure Advanced Compliance (PDPL/GDPR)
                                </button>
                                
                                {showAdvancedCompliance && (
                                    <div className="mt-3 p-4 bg-slate-900/60 border border-slate-700/80 rounded-lg space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-2">Processing Jurisdiction</label>
                                                <select
                                                    value={state.processingJurisdiction}
                                                    onChange={(e) => setState(prev => ({ ...prev, processingJurisdiction: e.target.value }))}
                                                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
                                                >
                                                    <option value="">Select jurisdiction...</option>
                                                    <option value="uae">UAE Local</option>
                                                    <option value="eu">EU GDPR Zone</option>
                                                    <option value="us">US</option>
                                                    <option value="global">Global/Distributed</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-2">Data Time-to-Live (TTL)</label>
                                                <select
                                                    value={state.dataTTL}
                                                    onChange={(e) => setState(prev => ({ ...prev, dataTTL: e.target.value }))}
                                                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
                                                >
                                                    <option value="">Select TTL...</option>
                                                    <option value="ephemeral">Ephemeral &lt;24h</option>
                                                    <option value="30days">30 Days</option>
                                                    <option value="1year">1 Year</option>
                                                    <option value="perpetual">Perpetual</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-2">External APIs / LLMs</label>
                                                <div className="flex items-center gap-3 h-[34px]">
                                                    <button
                                                        type="button"
                                                        onClick={() => setState(prev => ({ ...prev, externalAPIs: true }))}
                                                        className={`flex-1 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                                                            state.externalAPIs
                                                                ? 'bg-cyan-500/15 border-cyan-400/50 text-cyan-300'
                                                                : 'border-slate-700 bg-slate-800/50 text-slate-500 hover:border-slate-600'
                                                        }`}
                                                    >
                                                        Yes
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setState(prev => ({ ...prev, externalAPIs: false, externalAPIDetails: '' }))}
                                                        className={`flex-1 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                                                            !state.externalAPIs && state.externalAPIs !== undefined
                                                                ? 'bg-rose-500/15 border-rose-400/50 text-rose-300'
                                                                : 'border-slate-700 bg-slate-800/50 text-slate-500 hover:border-slate-600'
                                                        }`}
                                                    >
                                                        No
                                                    </button>
                                                </div>
                                                {state.externalAPIs && (
                                                    <div className="mt-2">
                                                        <input
                                                            type="text"
                                                            value={state.externalAPIDetails}
                                                            onChange={(e) => setState(prev => ({ ...prev, externalAPIDetails: e.target.value }))}
                                                            placeholder="Specify external APIs/LLMs..."
                                                            className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="pt-2 border-t border-slate-800">
                                            <p className="text-[10px] text-slate-600 font-mono">
                                                ⟪ Layered Defense ⟫ These parameters form the core of your 'Layered Defense' escrow agreement.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {step === 3 && (
                        <section className="bg-slate-800/70 border border-slate-700 rounded-xl p-5 space-y-4">
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="text-xl font-semibold">Participation Intent</h2>
                                <button
                                    type="button"
                                    onClick={fillMockStep3}
                                    className="text-xs px-3 py-2 rounded-lg border border-slate-600 text-slate-200 hover:border-blue-500 hover:text-white transition-colors"
                                >
                                    Use mock data
                                </button>
                            </div>
                            <p className="text-sm text-slate-400">Select your enterprise role.</p>
                            <div className="flex flex-wrap gap-2">
                                {participationOptions.map(option => {
                                    const active = state.participationIntent.includes(option)
                                    return (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => toggleValue('participationIntent', option)}
                                            className={`px-3 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                                                active
                                                    ? 'border-blue-500 bg-blue-500/10 text-blue-200'
                                                    : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-blue-500'
                                            }`}
                                        >
                                            {option}
                                        </button>
                                    )
                                })}
                            </div>

                            <div className="pt-4 space-y-4">
                                <h3 className="text-lg font-semibold text-white">Legal &amp; Governance Acknowledgment</h3>

                                <label className="flex items-start gap-3 text-[13px] text-slate-300">
                                    <input
                                        type="checkbox"
                                        className="mt-0.5 w-4 h-4 rounded border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-800"
                                        checked={state.responsibleDataUsage}
                                        onChange={(e) =>
                                            setState(prev => ({ ...prev, responsibleDataUsage: e.target.checked }))
                                        }
                                    />
                                    <span>
                                        I declare under penalty of perjury that I am the authorized legal signatory for this organization.
                                    </span>
                                </label>

                                <label className="flex items-start gap-3 text-[13px] text-slate-300">
                                    <input
                                        type="checkbox"
                                        className="mt-0.5 w-4 h-4 rounded border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-800"
                                        checked={state.noUnauthorizedSharing}
                                        onChange={(e) =>
                                            setState(prev => ({ ...prev, noUnauthorizedSharing: e.target.checked }))
                                        }
                                    />
                                    <span>
                                        I accept Redoubt's Zero-Trust Governance Policy. I understand that all platform actions are cryptographically logged and subject to instant access revocation.
                                    </span>
                                </label>

                                <label className="flex items-start gap-3 text-[13px] text-slate-300">
                                    <input
                                        type="checkbox"
                                        className="mt-0.5 w-4 h-4 rounded border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-800"
                                        checked={state.platformCompliancePolicies}
                                        onChange={(e) =>
                                            setState(prev => ({ ...prev, platformCompliancePolicies: e.target.checked }))
                                        }
                                    />
                                    <span>
                                        I acknowledge strict legal liability for any unauthorized data exfiltration, resale, or usage outside the declared scope, enforcing the 'Layered Defense' protocol.
                                    </span>
                                </label>
                            </div>

                            <div className="pt-4 border-t border-slate-700">
                                <label className="block text-[11px] uppercase tracking-wider text-cyan-400 mb-2">Electronic Signature</label>
                                <input
                                    type="text"
                                    value={state.electronicSignature}
                                    onChange={(e) => setState(prev => ({ ...prev, electronicSignature: e.target.value }))}
                                    placeholder="Type your full legal name to execute this agreement..."
                                    className="w-full px-4 py-3 bg-slate-900/80 border border-slate-600 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 font-mono"
                                />
                            </div>
                        </section>
                    )}

                    {step === 4 && (
                        <section className="bg-slate-800/70 border border-slate-700 rounded-xl p-5 space-y-5">
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="text-xl font-semibold">Verification &amp; Credentials</h2>
                                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-200 bg-amber-500/10 border border-amber-400/50 px-2 py-1 rounded-full">
                                    Required
                                </span>
                            </div>
                            <p className="text-sm text-slate-400">
                                Confirm identity and provide authorization documents before we can approve access.
                            </p>

                            <div className="grid gap-4 md:grid-cols-2">
                                <article className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
                                    <div className="flex items-center justify-between gap-2">
                                        <h3 className="text-base font-semibold text-white">Corporate Domain Verification</h3>
                                        <span className="text-xs text-amber-300">Required</span>
                                    </div>
                                    <p className="mt-1 text-sm text-slate-400">Verify your organizational identity via DNS TXT record or Corporate IdP (Okta/Entra).</p>

                                    <div className="mt-4">
                                        {isDomainVerified ? (
                                            <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-300">
                                                <span aria-hidden="true">✓</span>
                                                <span>Domain Verified</span>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleDNSVerification}
                                                disabled={isDNSVerifying}
                                                className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 disabled:cursor-not-allowed ${
                                                    isDNSVerifying
                                                        ? 'bg-slate-600'
                                                        : 'bg-blue-600 hover:bg-blue-700'
                                                }`}
                                            >
                                                {isDNSVerifying ? (
                                                    <span className="flex items-center gap-2">
                                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                        </svg>
                                                        Querying DNS...
                                                    </span>
                                                ) : 'Verify DNS Record'}
                                            </button>
                                        )}
                                    </div>
                                </article>

                                <article className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
                                    <div className="flex items-center justify-between gap-2">
                                        <h3 className="text-base font-semibold text-white">Corporate Registry Document</h3>
                                        <span className="text-xs text-amber-300">Required</span>
                                    </div>
                                    <p className="mt-1 text-sm text-slate-400">Upload UAE Trade License, Certificate of Incorporation, or equivalent government registry. PDF/JPG only. Max 10MB.</p>

                                    <label
                                        htmlFor="affiliation-proof-upload"
                                        onDragOver={(event) => {
                                            event.preventDefault()
                                            setDragTarget('affiliation')
                                        }}
                                        onDragLeave={() => setDragTarget(null)}
                                        onDrop={(event) => handleFileDrop(event, 'affiliation')}
                                        className={`mt-4 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-5 text-center transition-colors duration-200 ${
                                            dragTarget === 'affiliation'
                                                ? 'border-blue-500/80 bg-blue-500/10'
                                                : 'border-slate-600 bg-slate-900 hover:border-blue-500/70'
                                        }`}
                                    >
                                        <span className="text-sm text-slate-300">Drag and drop a file here</span>
                                        <span className="mt-1 text-xs text-slate-400">or click to browse</span>
                                    </label>

                                    <input
                                        id="affiliation-proof-upload"
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(event) => handleFileInputChange(event, 'affiliation')}
                                        className="sr-only"
                                    />

                                    {affiliationFileName && (
                                        <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                                            <span aria-hidden="true">✓</span>
                                            <span className="break-all">{affiliationFileName}</span>
                                        </div>
                                    )}

                                    {affiliationError && <p className="mt-3 text-xs text-amber-300">{affiliationError}</p>}
                                </article>
                            </div>

                            <article className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
                                <div className="flex items-center justify-between gap-2">
                                    <h3 className="text-base font-semibold text-white">Signed DPO / Legal Mandate</h3>
                                    <span className="text-xs text-amber-300">Required</span>
                                </div>
                                <p className="mt-1 text-sm text-slate-400">
                                    Upload the official Data Processing Agreement (DPA) signed by your Data Protection Officer.
                                </p>
                                <a
                                    href="#"
                                    onClick={(e) => e.preventDefault()}
                                    className="mt-2 inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                                >
                                    <span>📎</span> Download Redoubt Standard Mandate Template (.docx)
                                </a>

                                <label
                                    htmlFor="authorization-proof-upload"
                                    onDragOver={(event) => {
                                        event.preventDefault()
                                        setDragTarget('authorization')
                                    }}
                                    onDragLeave={() => setDragTarget(null)}
                                    onDrop={(event) => handleFileDrop(event, 'authorization')}
                                    className={`mt-4 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-5 text-center transition-colors duration-200 ${
                                        dragTarget === 'authorization'
                                            ? 'border-blue-500/80 bg-blue-500/10'
                                            : 'border-slate-600 bg-slate-900 hover:border-blue-500/70'
                                    }`}
                                >
                                    <span className="text-sm text-slate-300">Drag and drop a file here</span>
                                    <span className="mt-1 text-xs text-slate-400">or click to browse</span>
                                </label>

                                <input
                                    id="authorization-proof-upload"
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(event) => handleFileInputChange(event, 'authorization')}
                                    className="sr-only"
                                />

                                {authorizationFileName && (
                                    <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                                        <span aria-hidden="true">✓</span>
                                        <span className="break-all">{authorizationFileName}</span>
                                    </div>
                                )}

                                {authorizationError && <p className="mt-3 text-xs text-amber-300">{authorizationError}</p>}
                            </article>
                        </section>
                    )}

                    {step === 5 && (

                        <section className="bg-slate-800/70 border border-slate-700 rounded-xl p-5 space-y-4">
                            <h2 className="text-xl font-semibold">Zero-Trust Pipeline Agreement</h2>
                            <p className="text-sm text-slate-400">Acknowledge technical and legal constraints before initializing the secure escrow handshake.</p>

                            <label className="flex items-start gap-3 text-sm text-slate-200">
                                <input
                                    type="checkbox"
                                    className="mt-1 w-4 h-4 rounded border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-800"
                                    checked={state.responsibleDataUsage}
                                    onChange={(e) => setState(prev => ({ ...prev, responsibleDataUsage: e.target.checked }))}
                                />
                                <span>I acknowledge that all queries, extractions, and API interactions will be cryptographically hashed and logged in Redoubt's immutable audit trail.</span>
                            </label>

                            <label className="flex items-start gap-3 text-sm text-slate-200">
                                <input
                                    type="checkbox"
                                    className="mt-1 w-4 h-4 rounded border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-800"
                                    checked={state.noUnauthorizedSharing}
                                    onChange={(e) => setState(prev => ({ ...prev, noUnauthorizedSharing: e.target.checked }))}
                                />
                                <span>I consent to Redoubt's automated Kill-Switch protocol, which will instantly sever pipeline access upon detection of schema drift, geo-fencing violations, or unauthorized PII extraction.</span>
                            </label>

                            <label className="flex items-start gap-3 text-sm text-slate-200">
                                <input
                                    type="checkbox"
                                    className="mt-1 w-4 h-4 rounded border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-800"
                                    checked={state.platformCompliancePolicies}
                                    onChange={(e) => setState(prev => ({ ...prev, platformCompliancePolicies: e.target.checked }))}
                                />
                                <span>I assume full legal and financial liability for compliance with UAE PDPL and international data sovereignty laws regarding any data ingested through this node.</span>
                            </label>
                        </section>
                    )}

                    {step < 6 && (
                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={back}
                                disabled={step === 1}
                                className="px-4 py-2 rounded-lg border border-slate-700 hover:border-blue-500 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                ← Back
                            </button>
                            {step < 5 ? (
                                <button
                                    type="button"
                                    onClick={next}
                                    disabled={step !== 1 && !stepReady}
                                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Continue
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={!stepFiveReady}
                                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                >
                                    <span>🔒</span>
                                    <span>Execute Secure Handshake & Submit</span>
                                </button>
                            )}
                        </div>
                    )}
                    {step === 2 && (
                        <div className="mt-4 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                            <p className="text-xs text-slate-500 font-mono">
                                <span className="uppercase tracking-wider font-semibold">Declaration: </span>
                                By proceeding, you legally bind your organization to the selected usage scopes. Any data utilization outside these parameters violates Redoubt's Zero-Trust policy and will trigger an automatic access revocation (Kill Switch).
                            </p>
                        </div>
                    )}
                    {showStepError && !stepReady && step === 1 && (
                        <div className="text-sm text-amber-300 bg-amber-500/10 border border-amber-400/50 rounded-lg px-3 py-2">
                            Please complete all fields with a valid corporate email and invite code before continuing.
                        </div>
                    )}
                </form>
            </div>
        </div>
    )
}


