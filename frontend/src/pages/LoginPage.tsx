import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const MOCK_AUTH = (import.meta.env.VITE_MOCK_AUTH ?? 'true') === 'true'

const generateSessionId = () => {
    const hex = '0123456789abcdef'
    let result = ''
    for (let i = 0; i < 8; i++) {
        result += hex[Math.floor(Math.random() * hex.length)]
    }
    return result
}

const generateTimestamp = () => {
    const now = new Date()
    return now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
}

export default function LoginPage() {
    const { isAuthenticated, accessStatus, signIn } = useAuth()
    const [step, setStep] = useState<1 | 2>(1)
    const [emailOrNodeId, setEmailOrNodeId] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [sessionId] = useState(() => generateSessionId())
    const [timestamp] = useState(() => generateTimestamp())
    const hasMockConsoleAccess = MOCK_AUTH && (accessStatus === 'pending' || accessStatus === 'not_started')
    const hasMockReviewAccess = MOCK_AUTH && accessStatus === 'pending'

    if (isAuthenticated && accessStatus === 'approved') return <Navigate to="/dashboard" replace />

    const handleVerifyIdentity = (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        const trimmed = emailOrNodeId.trim()
        if (!trimmed) {
            setError('Corporate identity is required.')
            return
        }

        setIsLoading(true)
        setTimeout(() => {
            setIsLoading(false)
            setStep(2)
        }, 1500)
    }

    const handleAuthMethodSelect = (method: string) => {
        console.log('Selected auth method:', method)
        signIn()
    }

    if (accessStatus === 'pending' && !hasMockReviewAccess) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black" />
                <div className="relative bg-slate-900 rounded-lg p-8 border border-slate-700 space-y-4 max-w-md w-full">
                    <h1 className="text-3xl font-bold text-white text-center">Verification Pending</h1>
                    <p className="text-slate-300 text-center">
                        Application submitted. Access will be granted after verification.
                    </p>
                    <p className="text-sm text-slate-400 text-center">
                        Dashboard and datasets remain locked until approval.
                    </p>
                    <div className="pt-2 flex justify-center">
                        <Link
                            to="/application-status"
                            className="px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-semibold transition-colors"
                        >
                            View Application Status
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    if (accessStatus === 'not_started' && !hasMockConsoleAccess) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black" />
                <div className="relative bg-slate-800 rounded-lg p-8 border border-slate-700 space-y-4 max-w-md w-full">
                    <h1 className="text-3xl font-bold text-white text-center">Access Request Required</h1>
                    <p className="text-slate-300 text-center">
                        Start from Request Platform Access to begin onboarding.
                    </p>
                    <div className="pt-2 flex justify-center">
                        <Link
                            to="/"
                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
                        >
                            Return to Home
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black" />
            <div className="absolute inset-0 backdrop-blur-sm bg-black/60" />
            
            <div className="relative bg-slate-900 rounded-xl border border-slate-700 p-6 max-w-md w-full shadow-2xl">
                {hasMockReviewAccess && (
                    <div className="mb-5 rounded-lg border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                        <div className="font-semibold">Application review is still pending.</div>
                        <div className="mt-1 text-amber-100/80">
                            Mock access is enabled, so you can still enter the participant console while the review UI stays visible.
                        </div>
                        <div className="mt-3">
                            <Link
                                to="/application-status"
                                className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200 hover:text-white transition-colors"
                            >
                                View application status
                            </Link>
                        </div>
                    </div>
                )}
                {step === 1 ? (
                    <form onSubmit={handleVerifyIdentity} noValidate>
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold text-white mb-1">System Authentication</h1>
                            <p className="text-sm text-slate-400">
                                Enter your corporate identity to request a secure session.
                            </p>
                        </div>

                        <div className="mb-6">
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 font-mono text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-slate-600"
                                placeholder="Authorized Corporate Email or Node ID"
                                value={emailOrNodeId}
                                onChange={(e) => setEmailOrNodeId(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>

                        {error && (
                            <div className="mb-4 text-sm text-amber-300 bg-amber-500/10 border border-amber-400/50 rounded-lg px-3 py-2">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full px-4 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span>Verifying Node...</span>
                                </>
                            ) : (
                                <span>Verify Identity →</span>
                            )}
                        </button>

                        <div className="mt-6 pt-4 border-t border-slate-800">
                            <p className="text-[10px] text-slate-500 font-mono leading-relaxed">
                                Restricted Enclave. All authentication attempts, IP metadata, and device fingerprints are cryptographically logged. Unauthorized access violates Redoubt's Zero-Trust policy.
                            </p>
                            <p className="text-[10px] text-slate-600 font-mono mt-2">
                                Session ID: RDT-{sessionId}
                            </p>
                            <p className="text-[10px] text-slate-600 font-mono">
                                Timestamp: {timestamp}
                            </p>
                        </div>
                    </form>
                ) : (
                    <div>
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold text-emerald-400 mb-1">Identity Verified ✓</h1>
                            <p className="text-sm text-slate-400">
                                Select your enterprise authentication method:
                            </p>
                        </div>

                        <div className="space-y-3 mb-6">
                            <button
                                onClick={() => handleAuthMethodSelect('okta')}
                                className="w-full px-4 py-4 bg-slate-950 border border-slate-700 hover:border-cyan-500 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] rounded-lg transition-all flex items-center gap-3 group"
                            >
                                <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center group-hover:border-cyan-500/50 transition-colors">
                                    <svg className="w-5 h-5 text-slate-400 group-hover:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <span className="text-slate-200 font-medium">Authenticate via Okta / Microsoft Entra (SSO)</span>
                            </button>

                            <button
                                onClick={() => handleAuthMethodSelect('webauthn')}
                                className="w-full px-4 py-4 bg-slate-950 border border-slate-700 hover:border-cyan-500 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] rounded-lg transition-all flex items-center gap-3 group"
                            >
                                <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center group-hover:border-cyan-500/50 transition-colors">
                                    <svg className="w-5 h-5 text-slate-400 group-hover:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                    </svg>
                                </div>
                                <span className="text-slate-200 font-medium">Use Hardware Key (WebAuthn / YubiKey)</span>
                            </button>
                        </div>

                        <div className="pt-4 border-t border-slate-800">
                            <p className="text-[10px] text-slate-500 font-mono leading-relaxed">
                                Restricted Enclave. All authentication attempts, IP metadata, and device fingerprints are cryptographically logged. Unauthorized access violates Redoubt's Zero-Trust policy.
                            </p>
                            <p className="text-[10px] text-slate-600 font-mono mt-2">
                                Session ID: RDT-{sessionId}
                            </p>
                            <p className="text-[10px] text-slate-600 font-mono">
                                Timestamp: {timestamp}
                            </p>
                        </div>
                    </div>
                )}

                <div className="mt-5 pt-4 border-t border-slate-800 text-center">
                    <Link
                        to="/admin"
                        className="text-xs font-medium text-cyan-300 hover:text-cyan-200 transition-colors"
                    >
                        System administrator? Open Admin Console
                    </Link>
                </div>
            </div>
        </div>
    )
}
