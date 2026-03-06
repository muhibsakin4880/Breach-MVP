import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const MOCK_AUTH = (import.meta.env.VITE_MOCK_AUTH ?? 'true') === 'true'

export default function LoginPage() {
    const { isAuthenticated, accessStatus, signIn, applicantEmail } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState(applicantEmail)
    const [password, setPassword] = useState('')

    if (isAuthenticated && accessStatus === 'approved') return <Navigate to="/dashboard" replace />

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return
        if (!MOCK_AUTH && !password) return
        const signInResult = signIn() as boolean | { accessIntentRequired?: boolean }
        if (!signInResult) return

        const accessIntentRequired =
            typeof signInResult === 'object' && signInResult.accessIntentRequired === true

        if (accessIntentRequired) return
        navigate('/dashboard', { replace: true })
    }

    if (!MOCK_AUTH && accessStatus === 'pending') {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-md mx-auto">
                    <div className="bg-gray-900 rounded-lg p-8 border border-gray-700 space-y-4">
                        <h1 className="text-3xl font-bold text-white text-center">Verification Pending</h1>
                        <p className="text-slate-300 text-center">
                            Application submitted. Access will be granted after verification.
                        </p>
                        <p className="text-sm text-slate-400 text-center">
                            Dashboard and datasets remain locked until approval.
                        </p>
                        <div className="pt-2 flex justify-center">
                            <Link
                                to="/onboarding"
                                className="px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-semibold transition-colors"
                            >
                                View Application Status
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!MOCK_AUTH && accessStatus !== 'approved') {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-md mx-auto">
                    <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 space-y-4">
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
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-md mx-auto">
                <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
                    <h1 className="text-3xl font-bold text-white mb-2 text-center">Participant Sign In</h1>
                    <p className="text-slate-400 text-center mb-8">
                        Approved participants can access controlled workspace modules.
                    </p>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                                Work Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="name@organization.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder={MOCK_AUTH ? 'Any value in mock mode' : 'Enter your password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors"
                        >
                            Continue
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
