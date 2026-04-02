import { Link, Navigate } from 'react-router-dom'

import {
    participantOnboardingPaths,
    participantOnboardingPolicyPath
} from '../onboarding/constants'
import OnboardingPageLayout from '../onboarding/components/OnboardingPageLayout'
import { getFirstIncompleteOnboardingPath, readOnboardingSnapshot } from '../onboarding/flow'
import { emptySubmissionMeta, hasStoredOnboardingValue, onboardingStorageKeys, readSubmissionMeta } from '../onboarding/storage'

const MOCK_AUTH = (import.meta.env.VITE_MOCK_AUTH ?? 'true') === 'true'

function generateAppId(): string {
    return 'RDT-APP-' + Math.random().toString(36).substring(2, 10).toUpperCase()
}

function formatTimestamp(): string {
    return new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
}

const authenticationMethodLabels: Record<string, string> = {
    sso: 'Okta / Microsoft Entra (SSO)',
    hardware_key: 'Hardware Key (YubiKey / WebAuthn)'
}

export default function OnboardingConfirmation() {
    const hasSubmission = hasStoredOnboardingValue(onboardingStorageKeys.submissionMeta)

    if (!hasSubmission) {
        return <Navigate to={getFirstIncompleteOnboardingPath() ?? participantOnboardingPaths.step5} replace />
    }

    const submissionMeta = readSubmissionMeta(emptySubmissionMeta)
    const snapshot = readOnboardingSnapshot()
    const appId = generateAppId()
    const timestamp = formatTimestamp()
    const authMethod = snapshot.verification.authenticationMethod 
        ? authenticationMethodLabels[snapshot.verification.authenticationMethod] 
        : 'Not selected'

    return (
        <OnboardingPageLayout activeStep={6}>
            <section className="rounded-2xl border border-amber-500/30 bg-[linear-gradient(180deg,rgba(120,53,15,0.28)_0%,rgba(15,23,42,0.88)_100%)] p-6 md:p-8 shadow-[0_24px_60px_rgba(120,53,15,0.24)]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-3">
                        <span className="inline-flex items-center rounded-full border border-amber-400/35 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
                            <svg className="w-3 h-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Under Review
                        </span>
                        <div>
                            <h2 className="text-2xl font-semibold text-white md:text-3xl">Application Submitted</h2>
                            <p className="mt-2 max-w-2xl text-sm text-slate-200 md:text-base">
                                Your application is under manual review by the Redoubt security team.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mt-6 rounded-xl border border-slate-700 bg-slate-800/70 p-5">
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Submission ID</div>
                        <div className="mt-1 font-mono text-sm text-white">{appId}</div>
                    </div>
                    <div>
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Submitted</div>
                        <div className="mt-1 font-mono text-sm text-white">{timestamp}</div>
                    </div>
                    <div>
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Authentication Method</div>
                        <div className="mt-1 text-sm text-white">{authMethod}</div>
                    </div>
                    <div>
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Domain Verification</div>
                        <div className="mt-1 text-sm text-amber-300">Pending</div>
                    </div>
                </div>
            </section>

            <section className="mt-6 rounded-xl border border-slate-700 bg-slate-800/70 p-5">
                <h3 className="text-base font-semibold text-white mb-4">Review Timeline</h3>
                <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                        <span className="text-emerald-400">✅</span>
                        <span className="text-slate-300">Application received</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <span className="text-blue-400">🔵</span>
                        <span className="text-slate-300">Identity verification <span className="text-slate-500">(1-2 business days)</span></span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <span className="text-slate-500">⬜</span>
                        <span className="text-slate-500">Document review <span className="text-slate-600">(1-2 business days)</span></span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <span className="text-slate-500">⬜</span>
                        <span className="text-slate-500">Security clearance <span className="text-slate-600">(1 business day)</span></span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <span className="text-slate-500">⬜</span>
                        <span className="text-slate-500">Access granted</span>
                    </div>
                </div>
            </section>

            <p className="mt-6 font-mono text-xs text-slate-500">
                All applications are reviewed by a human. Automated approvals are not permitted for regulated platform access. You will be notified at your corporate email when approved.
            </p>

            <section className="mt-6 flex flex-wrap gap-3">
                <Link
                    to="/"
                    className="rounded-lg border border-blue-500 px-4 py-2 font-semibold text-blue-400 transition-colors hover:bg-blue-500/10 hover:text-blue-300"
                >
                    Return to Homepage
                </Link>
                {MOCK_AUTH && (
                    <Link
                        to="/login"
                        className="rounded-lg border border-slate-600 px-4 py-2 font-semibold text-slate-200 transition-colors hover:border-blue-500 hover:text-white"
                    >
                        Login
                    </Link>
                )}
                <Link
                    to={participantOnboardingPolicyPath}
                    className="rounded-lg border border-slate-600 px-4 py-2 font-semibold text-slate-200 transition-colors hover:border-blue-500 hover:text-white"
                >
                    Review Trust Center
                </Link>
            </section>
        </OnboardingPageLayout>
    )
}
