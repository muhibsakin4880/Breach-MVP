import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
    participantOnboardingPaths,
    participantOnboardingVerificationSummary
} from '../onboarding/constants'
import OnboardingPageLayout from '../onboarding/components/OnboardingPageLayout'
import OnboardingStepGuard from '../onboarding/components/OnboardingStepGuard'
import { isStep4Complete } from '../onboarding/flow'
import {
    emptyVerificationSnapshot,
    onboardingStorageKeys,
    readOnboardingValue,
    writeOnboardingValue
} from '../onboarding/storage'
import type { AuthenticationMethod } from '../onboarding/types'

const allowedFileExtensions = new Set(['pdf', 'jpg', 'jpeg', 'png'])
const maxFileSizeBytes = 5 * 1024 * 1024

export default function OnboardingStep4() {
    const navigate = useNavigate()
    const snapshot = readOnboardingValue(onboardingStorageKeys.verification, emptyVerificationSnapshot)
    const linkedInTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const dnsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const [isLinkedInLoading, setIsLinkedInLoading] = useState(false)
    const [isLinkedInConnected, setIsLinkedInConnected] = useState(snapshot.linkedInConnected)
    const [isDNSVerifying, setIsDNSVerifying] = useState(false)
    const [isDomainVerified, setIsDomainVerified] = useState(snapshot.domainVerified)
    const [affiliationFileName, setAffiliationFileName] = useState<string | null>(snapshot.affiliationFileName)
    const [authorizationFileName, setAuthorizationFileName] = useState<string | null>(snapshot.authorizationFileName)
    const [authenticationMethod, setAuthenticationMethod] = useState<AuthenticationMethod | null>(snapshot.authenticationMethod)
    const [ssoDomain, setSSODomain] = useState(snapshot.ssoDomain)
    const [affiliationError, setAffiliationError] = useState<string | null>(null)
    const [authorizationError, setAuthorizationError] = useState<string | null>(null)
    const [dragTarget, setDragTarget] = useState<'affiliation' | 'authorization' | null>(null)
    const [showError, setShowError] = useState(false)
    const [corporateDomain, setCorporateDomain] = useState('')
    const [domainVerificationStep, setDomainVerificationStep] = useState<1 | 2 | 3>(1)
    const [verificationCode, setVerificationCode] = useState('')

    useEffect(() => {
        if (!verificationCode) {
            const randomCode = 'RDT-' + Math.random().toString(36).substring(2, 10)
            setVerificationCode(randomCode)
        }
    }, [verificationCode])

    useEffect(() => {
        return () => {
            if (linkedInTimerRef.current) {
                clearTimeout(linkedInTimerRef.current)
            }
            if (dnsTimerRef.current) {
                clearTimeout(dnsTimerRef.current)
            }
        }
    }, [])

    useEffect(() => {
        writeOnboardingValue(onboardingStorageKeys.verification, {
            linkedInConnected: isLinkedInConnected,
            domainVerified: isDomainVerified,
            affiliationFileName,
            authorizationFileName,
            authenticationMethod,
            ssoDomain
        })
    }, [isLinkedInConnected, isDomainVerified, affiliationFileName, authorizationFileName, authenticationMethod, ssoDomain])

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
        setDomainVerificationStep(3)
        setIsDNSVerifying(true)
        dnsTimerRef.current = setTimeout(() => {
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

    const handleAuthenticationMethodSelect = (method: AuthenticationMethod) => {
        setAuthenticationMethod(method)
    }

    const stepReady = isStep4Complete({
        linkedInConnected: isLinkedInConnected,
        domainVerified: isDomainVerified,
        affiliationFileName,
        authorizationFileName,
        authenticationMethod,
        ssoDomain
    })

    const handleNext = () => {
        if (!stepReady) {
            setShowError(true)
            return
        }

        setShowError(false)
        navigate(participantOnboardingPaths.step5)
    }

    const handleBack = () => {
        navigate(participantOnboardingPaths.step3)
    }

    const fillMockData = () => {
        setIsLinkedInConnected(true)
        setIsDomainVerified(true)
        setAffiliationFileName('affiliation-proof.pdf')
        setAuthorizationFileName('authorization-letter.pdf')
        setAuthenticationMethod('hardware_key')
        setSSODomain('')
        setAffiliationError(null)
        setAuthorizationError(null)
        setShowError(false)
    }

    return (
        <OnboardingStepGuard currentPath={participantOnboardingPaths.step4}>
            <OnboardingPageLayout activeStep={4}>
                <section className="bg-slate-800/70 border border-slate-700 rounded-xl p-5 space-y-5 mb-6">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-xl font-semibold">Verification &amp; Credentials</h2>
                        <span className="text-xs uppercase tracking-[0.14em] text-amber-200">Required</span>
                    </div>
                    <p className="text-sm text-slate-400">{participantOnboardingVerificationSummary}</p>

                    <div className="grid gap-4 md:grid-cols-2">
                        <article className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
                            <div className="flex items-center justify-between gap-2">
                                <h3 className="text-base font-semibold text-white">Connect LinkedIn</h3>
                                <span className="text-xs text-amber-300">Required</span>
                            </div>
                            <p className="mt-1 text-sm text-slate-400">
                                Confirm the public professional profile tied to your organizational role.
                            </p>

                            <div className="mt-4">
                                {isLinkedInConnected ? (
                                    <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-300">
                                        <span aria-hidden="true">✓</span>
                                        <span>Affiliation Confirmed</span>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleLinkedInConnect}
                                        disabled={isLinkedInLoading}
                                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-600/60"
                                    >
                                        {isLinkedInLoading ? 'Connecting...' : 'Connect LinkedIn'}
                                    </button>
                                )}
                            </div>
                        </article>

                        <article className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
                            <div className="flex items-center justify-between gap-2">
                                <h3 className="text-base font-semibold text-white">Corporate Domain Verification</h3>
                                <span className="text-xs text-amber-300">Required</span>
                            </div>
                            <p className="mt-1 text-sm text-slate-400">
                                Verify the domain associated with your work email using a DNS TXT record check.
                            </p>

                            <div className="mt-4 space-y-4">
                                {domainVerificationStep === 1 && (
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 mb-2">
                                            Step 1: Enter your corporate domain
                                        </label>
                                        <input
                                            type="text"
                                            value={corporateDomain}
                                            onChange={(e) => setCorporateDomain(e.target.value)}
                                            placeholder="yourcompany.com"
                                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                                        />
                                    </div>
                                )}

                                {domainVerificationStep >= 2 && corporateDomain && (
                                    <div>
                                        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 mb-2">
                                            Step 2: DNS verification
                                        </div>
                                        <p className="text-sm text-slate-300 mb-2">
                                            Add this TXT record to your DNS settings to verify ownership:
                                        </p>
                                        <div className="rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 font-mono text-sm text-emerald-400">
                                            redoubt-verify={verificationCode}
                                        </div>
                                        <p className="mt-2 text-xs text-slate-500">
                                            Ask your IT team to add this record. Verification may take up to 24 hours.
                                        </p>
                                    </div>
                                )}

                                {domainVerificationStep === 3 && (
                                    <div>
                                        {isDNSVerifying ? (
                                            <div className="inline-flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm font-medium text-amber-300">
                                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                <span>Verification Pending...</span>
                                            </div>
                                        ) : isDomainVerified ? (
                                            <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-300">
                                                <span aria-hidden="true">✓</span>
                                                <span>Domain Verified</span>
                                            </div>
                                        ) : null}
                                    </div>
                                )}

                                {domainVerificationStep === 1 && corporateDomain && (
                                    <button
                                        type="button"
                                        onClick={() => setDomainVerificationStep(2)}
                                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                                    >
                                        Continue to DNS Setup
                                    </button>
                                )}

                                {domainVerificationStep === 2 && (
                                    <button
                                        type="button"
                                        onClick={handleDNSVerification}
                                        disabled={isDNSVerifying}
                                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isDNSVerifying ? 'Verifying...' : 'Verify Domain'}
                                    </button>
                                )}
                            </div>
                        </article>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <article className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
                            <div className="flex items-center justify-between gap-2">
                                <h3 className="text-base font-semibold text-white">Upload Proof of Affiliation</h3>
                                <span className="text-xs text-amber-300">Required</span>
                            </div>
                            <p className="mt-1 text-sm text-slate-400">
                                Upload a badge, staff profile, or other document that supports your organisational affiliation. PDF, JPG or PNG only. Max 5MB.
                            </p>

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

                        <article className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
                            <div className="flex items-center justify-between gap-2">
                                <h3 className="text-base font-semibold text-white">Upload Authorization / Compliance Letter</h3>
                                <span className="text-xs text-amber-300">Required</span>
                            </div>
                            <p className="mt-1 text-sm text-slate-400">
                                Upload the approval or authority document that covers this access request. Examples: DPA, IRB approval, or letter of authority.
                            </p>

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
                    </div>

                    <article className="rounded-xl border border-slate-700 bg-slate-900/70 p-5">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h3 className="text-base font-semibold text-white">Authentication Setup</h3>
                                <p className="mt-1 text-sm text-slate-400">
                                    Choose how you will log in to Redoubt. This cannot be changed after submission.
                                </p>
                            </div>
                            <span className="text-xs text-amber-300">Required</span>
                        </div>

                        <div className="mt-5 grid gap-4 xl:grid-cols-2">
                            <label
                                className={`cursor-pointer rounded-xl border p-4 transition-colors ${
                                    authenticationMethod === 'sso'
                                        ? 'border-blue-500/80 bg-blue-500/10'
                                        : 'border-slate-700 bg-slate-950/60 hover:border-blue-500/50'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="authentication-method"
                                    className="sr-only"
                                    checked={authenticationMethod === 'sso'}
                                    onChange={() => handleAuthenticationMethodSelect('sso')}
                                />
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-300">
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 4v5c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V7l7-4z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 12.5l1.5 1.5 3.5-4" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-white">Okta / Microsoft Entra (SSO)</h4>
                                            <p className="mt-1 text-sm text-slate-400">
                                                Authenticate using your organization's SSO provider
                                            </p>
                                        </div>
                                    </div>
                                    <span
                                        className={`mt-1 h-4 w-4 rounded-full border ${
                                            authenticationMethod === 'sso'
                                                ? 'border-blue-400 bg-blue-400 shadow-[0_0_0_3px_rgba(59,130,246,0.22)]'
                                                : 'border-slate-600 bg-transparent'
                                        }`}
                                    />
                                </div>

                                {authenticationMethod === 'sso' && (
                                    <div className="mt-4 space-y-2 rounded-lg border border-blue-500/30 bg-slate-900/70 p-3">
                                        <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                                            SSO Domain
                                        </label>
                                        <input
                                            type="text"
                                            value={ssoDomain}
                                            onChange={(event) => setSSODomain(event.target.value)}
                                            placeholder="yourcompany.okta.com or login.microsoftonline.com/..."
                                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                                        />
                                        <p className="text-xs text-slate-500">Your IT team can provide this</p>
                                    </div>
                                )}
                            </label>

                            <label
                                className={`cursor-pointer rounded-xl border p-4 transition-colors ${
                                    authenticationMethod === 'hardware_key'
                                        ? 'border-emerald-500/70 bg-emerald-500/10'
                                        : 'border-slate-700 bg-slate-950/60 hover:border-emerald-500/40'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="authentication-method"
                                    className="sr-only"
                                    checked={authenticationMethod === 'hardware_key'}
                                    onChange={() => handleAuthenticationMethodSelect('hardware_key')}
                                />
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-300">
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-white">Hardware Key (YubiKey / WebAuthn)</h4>
                                            <p className="mt-1 text-sm text-slate-400">
                                                Use a physical security key for maximum security
                                            </p>
                                        </div>
                                    </div>
                                    <span
                                        className={`mt-1 h-4 w-4 rounded-full border ${
                                            authenticationMethod === 'hardware_key'
                                                ? 'border-emerald-400 bg-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,0.22)]'
                                                : 'border-slate-600 bg-transparent'
                                        }`}
                                    />
                                </div>

                                {authenticationMethod === 'hardware_key' && (
                                    <div className="mt-4 rounded-lg border border-emerald-500/30 bg-slate-900/70 p-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-sm text-slate-200">
                                                You will register your hardware key on your first login. Please have your key ready.
                                            </p>
                                            <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-200">
                                                Highest Security
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </label>
                        </div>

                        <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                            ⚠️ Personal email providers (Gmail, Outlook personal, Yahoo) are not accepted. A verified corporate domain is required to proceed.
                        </div>

                        <div className="mt-4 rounded-lg border border-slate-700/80 bg-slate-950/60 px-4 py-3 text-sm text-slate-400">
                            ⓘ Your selected authentication method will be shown on your Trust Profile and contributes to your overall Trust Score. Hardware Key authentication provides the highest trust score boost (+8 points).
                        </div>
                    </article>

                    {showError && !stepReady && (
                        <div className="text-sm text-amber-300 bg-amber-500/10 border border-amber-400/50 rounded-lg px-3 py-2">
                            Please complete LinkedIn, DNS verification, both required uploads, and authentication setup before continuing.
                        </div>
                    )}
                </section>

                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={fillMockData}
                        className="px-4 py-2 rounded-lg border border-slate-600 hover:border-blue-500 text-slate-300 hover:text-white transition-colors text-sm"
                    >
                        Use mock data
                    </button>
                    <button
                        type="button"
                        onClick={handleBack}
                        className="px-4 py-2 rounded-lg border border-slate-700 hover:border-blue-500 text-slate-200 transition-colors"
                    >
                        Back
                    </button>
                    <button
                        type="button"
                        onClick={handleNext}
                        disabled={!stepReady}
                        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Next
                    </button>
                </div>
            </OnboardingPageLayout>
        </OnboardingStepGuard>
    )
}
