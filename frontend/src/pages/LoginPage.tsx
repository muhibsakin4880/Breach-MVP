import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
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

type AuthScreen = 1 | 2

export default function LoginPage() {
    const { isAuthenticated, accessStatus, signIn, workspaceRole, updateWorkspaceRole } = useAuth()
    const navigate = useNavigate()
    const [screen, setScreen] = useState<1 | 2>(1)
    const [authMethod, setAuthMethod] = useState<'sso' | 'hardware'>('sso')
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [sessionId] = useState(() => generateSessionId())
    const [timestamp] = useState(() => generateTimestamp())
    const hasMockConsoleAccess = MOCK_AUTH && (accessStatus === 'pending' || accessStatus === 'not_started')
    const hasMockReviewAccess = MOCK_AUTH && accessStatus === 'pending'

    if (isAuthenticated && accessStatus === 'approved') {
        const targetPath = workspaceRole === 'provider' || workspaceRole === 'hybrid' 
            ? '/provider/dashboard' 
            : '/dashboard'
        return <Navigate to={targetPath} replace />
    }

    const handleContinue = (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setTimeout(() => {
            setIsLoading(false)
            setScreen(2)
        }, 1500)
    }

    const handleAuthenticate = () => {
        signIn()
        
        const isProvider = email.toLowerCase().includes('provider') || email.toLowerCase().includes('contrib')
        
        if (isProvider) {
            updateWorkspaceRole('provider')
            navigate('/provider/dashboard')
        } else {
            updateWorkspaceRole('buyer')
            navigate('/dashboard')
        }
    }

    const handleStartOver = () => {
        setScreen(1)
        setEmail('')
    }

    const handleAuthMethodSwitch = (method: 'sso' | 'hardware') => {
        setAuthMethod(method)
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

                {screen === 1 ? (
                    <form onSubmit={handleContinue} noValidate>
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold text-white mb-1">Secure Node Entry</h1>
                            <p className="text-sm text-slate-400">
                                Enter your verified corporate email to begin authentication
                            </p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-xs uppercase tracking-[0.16em] text-slate-400 mb-2">
                                Corporate Email
                            </label>
                            <input
                                type="email"
                                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 font-mono text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
                                placeholder="you@yourcompany.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                            />
                            <p className="mt-2 text-xs text-slate-500">
                                Personal email addresses are not accepted
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !email.trim()}
                            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span>Resolving Node...</span>
                                </>
                            ) : (
                                <span>Continue →</span>
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
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 mb-3">
                                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-1">SSO Redirect</h1>
                        </div>

                        <div className="mb-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Identity node located.</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Organization:</span>
                                <span className="text-white font-medium">Demo Corporation</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Auth method:</span>
                                <span className="text-white font-medium">Okta / Microsoft Entra</span>
                            </div>
                        </div>

                        <div className="mb-6 rounded-lg border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                            <p>You are being redirected to your organization's SSO provider. Complete authentication there to access Redoubt.</p>
                        </div>

                        <div className="mb-4 p-3 bg-slate-950 rounded-lg border border-slate-700">
                            <span className="text-xs text-slate-500">SSO Domain: </span>
                            <span className="text-sm font-mono text-emerald-400">demo.okta.com</span>
                        </div>

                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => handleAuthMethodSwitch('sso')}
                                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    authMethod === 'sso'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-800 text-slate-400 hover:text-white'
                                }`}
                            >
                                SSO
                            </button>
                            <button
                                onClick={() => handleAuthMethodSwitch('hardware')}
                                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    authMethod === 'hardware'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-800 text-slate-400 hover:text-white'
                                }`}
                            >
                                Hardware Key
                            </button>
                        </div>

                        {authMethod === 'sso' ? (
                            <div>
                                <button
                                    onClick={handleAuthenticate}
                                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                                >
                                    Continue to SSO →
                                </button>

                                <button
                                    onClick={handleStartOver}
                                    className="mt-3 w-full text-center text-sm text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    Wrong account? ← Start over
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
                            </div>
                        ) : (
                            <div>
                                <div className="text-center mb-6">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/40 mb-3">
                                        <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                        </svg>
                                    </div>
                                    <h1 className="text-2xl font-bold text-white mb-1">Hardware Key Required</h1>
                                </div>

                                <div className="mb-4 space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Identity node located.</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Organization:</span>
                                        <span className="text-white font-medium">Demo Corporation</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Auth method:</span>
                                        <span className="text-white font-medium">YubiKey / WebAuthn</span>
                                    </div>
                                </div>

                                <div className="mb-6 rounded-lg border border-blue-400/40 bg-blue-500/10 px-4 py-3 text-sm text-blue-100">
                                    <p>Insert your registered hardware key and tap when prompted.</p>
                                </div>

                                <div className="mb-6 flex flex-col items-center">
                                    <div className="animate-pulse">
                                        <svg className="w-12 h-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                        </svg>
                                    </div>
                                    <span className="mt-2 text-sm text-slate-400">Waiting for key tap...</span>
                                </div>

                                <button
                                    onClick={handleAuthenticate}
                                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                                >
                                    Authenticate with Key
                                </button>

                                <button
                                    onClick={handleStartOver}
                                    className="mt-3 w-full text-center text-sm text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    Wrong account? ← Start over
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
                            </div>
                        )}
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