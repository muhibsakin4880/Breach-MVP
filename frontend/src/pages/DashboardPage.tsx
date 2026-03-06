import { Link } from 'react-router-dom'
import { datasetRequests, recentActivity, participantTrust, trustLevel, activityDot } from '../data/workspaceData'

export default function DashboardPage() {
    const misusePenalty = participantTrust.misuseWarning ? participantTrust.misusePenalty : 0
    const netTrustScore = Math.max(participantTrust.score - misusePenalty, 0)
    const pendingRequests = datasetRequests.filter(item => item.status === 'Pending').length
    const approvedAccess = datasetRequests.filter(item => item.status === 'Approved').length
    const recentCount = recentActivity.length

    const trustProgress = Math.min(Math.max(netTrustScore, 0), 100)
    const trustCircumference = 2 * Math.PI * 45
    const trustOffset = trustCircumference - (trustProgress / 100) * trustCircumference

    const trustScoreBreakdown = [
        { id: 'identity-verification', label: 'Identity Verification', score: 95, barClass: 'bg-emerald-500', icon: '🛡️' },
        { id: 'data-contribution-quality', label: 'Data Contribution Quality', score: 78, barClass: 'bg-blue-500', icon: '📊' },
        { id: 'organization-credibility', label: 'Organization Credibility', score: 85, barClass: 'bg-indigo-500', icon: '🏢' },
        { id: 'compliance-history', label: 'Compliance History', score: 60, barClass: 'bg-amber-500', icon: '✓', tip: 'Complete org verification to improve this score' }
    ]

    const exclusiveAccessAlerts = [
        { id: 'climate-2024', title: 'Global Climate Dataset 2024', subtitle: 'Only 2 slots remaining · Closes in 47h', borderClass: 'border-l-red-500', dotClass: 'bg-red-500', urgent: true },
        { id: 'market-tick-q1', title: 'Financial Market Tick Data Q1', subtitle: 'New version · Your tier qualifies · 5 days', borderClass: 'border-l-amber-500', dotClass: 'bg-amber-400', urgent: true },
        { id: 'urban-mobility', title: 'Urban Mobility Sensor Pack', subtitle: '12 slots open · Matches your domain', borderClass: 'border-l-emerald-500', dotClass: 'bg-emerald-500', urgent: false }
    ]

    const intelligenceFeed = [
        { id: 'healthcare-verified', icon: '📊', title: '3 new datasets in Healthcare', subtitle: 'Matches your industry · 2h ago', timestamp: '2h ago', action: 'View' },
        { id: 'trust-score-boost', icon: '🔐', title: 'Trust Score +5 points available', subtitle: 'Complete org verification', timestamp: 'Action req.', action: 'Act' },
        { id: 'mit-collab', icon: '🤝', title: 'MIT Lab requested collaboration', subtitle: 'Review proposal', timestamp: 'Yesterday', action: 'View' }
    ]

    const breakdownGlyphs: Record<string, string> = { 'identity-verification': 'ID', 'data-contribution-quality': 'DQ', 'organization-credibility': 'OC', 'compliance-history': 'CH' }
    const feedThumbnailStyles: Record<string, string> = {
        'healthcare-verified': 'from-cyan-500/20 to-blue-500/15 text-cyan-200',
        'trust-score-boost': 'from-emerald-500/20 to-cyan-500/15 text-emerald-200',
        'mit-collab': 'from-indigo-500/20 to-blue-500/15 text-indigo-200'
    }

    return (
        <div className="relative min-h-screen bg-[#010915] text-white overflow-x-hidden">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_25%_0%,rgba(16,185,129,0.12),transparent_50%),radial-gradient(ellipse_at_80%_20%,rgba(59,130,246,0.08),transparent_45%)]" />
            <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(1,9,21,0.3)_100%)]" />

            <div className="relative mx-auto max-w-[1680px] px-8 py-10 lg:px-12">
                <header className="mb-6">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Participant Workspace
                            </div>
                            <h1 className="mt-5 text-5xl font-bold tracking-tight text-white lg:text-6xl">Dashboard</h1>
                            <p className="mt-3 text-lg text-slate-500">Enterprise-grade trust and access intelligence.</p>
                        </div>
                        <span className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-base font-semibold ${trustLevel(netTrustScore).classes}`}>
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                            {trustLevel(netTrustScore).label}
                        </span>
                    </div>
                </header>

                <div className="mb-10 flex items-center gap-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/8 px-6 py-4 backdrop-blur-xl shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20">
                        <svg className="h-5 w-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-emerald-300">All Systems Secure</p>
                        <p className="text-xs text-emerald-400/70">SOC2 Compliant • No breaches detected</p>
                    </div>
                </div>

                <div className="grid gap-10 xl:grid-cols-[1fr_380px]">
                    <main className="space-y-10">
                        <div className="grid gap-10 xl:grid-cols-[1fr_1fr]">
                            <article className="relative rounded-[2.5rem] border border-white/[0.08] bg-gradient-to-br from-slate-900/80 via-slate-900/90 to-slate-800/60 p-10 backdrop-blur-2xl shadow-[0_0_60px_rgba(16,185,129,0.12),inset_0_1px_0_rgba(255,255,255,0.05)]">
                                <div className="absolute inset-0 rounded-[2.5rem] border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.15)]" />
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.08] via-transparent to-blue-500/[0.04] rounded-[2.5rem]" />
                                
                                <div className="relative flex flex-col xl:flex-row xl:items-center justify-between gap-12">
                                    <div className="order-2 xl:order-1">
                                        <h2 className="text-4xl font-bold text-white tracking-tight">Participant Reputation Index</h2>
                                        <span className="mt-6 inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-500/12 px-5 py-2.5 text-base font-semibold text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                                            Trusted Participant
                                        </span>
                                        <div className="mt-8">
                                            <p className="text-sm text-slate-500">This week</p>
                                            <p className="mt-1 text-3xl font-bold text-emerald-400">+2 points</p>
                                            <p className="mt-4 text-sm text-slate-500 leading-relaxed max-w-[260px]">Maintain compliance to unlock premium datasets.</p>
                                        </div>
                                    </div>
                                    <div className="order-1 xl:order-2 flex justify-center">
                                        <div className="relative">
                                            <div className="absolute inset-0 rounded-full bg-emerald-500/40 blur-[80px] animate-pulse" />
                                            <div className="relative h-[280px] w-[280px]">
                                                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                                                    <defs>
                                                        <linearGradient id="trustGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                                            <stop offset="0%" stopColor="#10b981" />
                                                            <stop offset="50%" stopColor="#059669" />
                                                            <stop offset="100%" stopColor="#047857" />
                                                        </linearGradient>
                                                        <filter id="glow">
                                                            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                                                            <feMerge>
                                                                <feMergeNode in="coloredBlur"/>
                                                                <feMergeNode in="SourceGraphic"/>
                                                            </feMerge>
                                                        </filter>
                                                    </defs>
                                                    <circle cx="50" cy="50" r="45" stroke="rgba(30,41,59,0.8)" strokeWidth="5" fill="none" />
                                                    <circle cx="50" cy="50" r="45" stroke="url(#trustGrad)" strokeWidth="5" fill="none" strokeLinecap="round" strokeDasharray={trustCircumference} strokeDashoffset={trustOffset} filter="url(#glow)" className="drop-shadow-[0_0_15px_rgba(16,185,129,0.8)] transition-all duration-1000 ease-out" />
                                                </svg>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <div className="text-8xl font-bold text-white drop-shadow-lg">{netTrustScore}</div>
                                                    <div className="mt-2 text-[11px] uppercase tracking-[0.25em] text-slate-400 font-medium">Current Score</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </article>

                            <div className="grid grid-cols-1 gap-6">
                                <article className="group relative overflow-hidden rounded-2xl border border-l-4 border-l-amber-500/50 border-white/[0.06] bg-slate-900/50 p-8 backdrop-blur-xl transition-all duration-300 hover:border-l-amber-500/70 hover:shadow-[0_0_40px_rgba(245,158,11,0.15)]">
                                    <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-500/8 blur-3xl transition-all duration-500 group-hover:bg-amber-500/15" />
                                    <div className="relative flex items-center justify-between mb-6">
                                        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Pending Requests</span>
                                        <span className="text-2xl">⏳</span>
                                    </div>
                                    <div className="text-7xl font-bold text-white">{pendingRequests}</div>
                                    <p className="mt-3 text-sm text-slate-500">Action required</p>
                                </article>
                                <article className="group relative overflow-hidden rounded-2xl border border-l-4 border-l-blue-500/50 border-white/[0.06] bg-slate-900/50 p-8 backdrop-blur-xl transition-all duration-300 hover:border-l-blue-500/70 hover:shadow-[0_0_40px_rgba(59,130,246,0.15)]">
                                    <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-blue-500/8 blur-3xl transition-all duration-500 group-hover:bg-blue-500/15" />
                                    <div className="relative flex items-center justify-between mb-6">
                                        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Approved Access</span>
                                        <span className="text-2xl">✅</span>
                                    </div>
                                    <div className="text-7xl font-bold text-white">{approvedAccess}</div>
                                    <p className="mt-3 text-sm text-slate-500">Active approvals</p>
                                </article>
                                <article className="group relative overflow-hidden rounded-2xl border border-l-4 border-l-emerald-500/50 border-white/[0.06] bg-slate-900/50 p-8 backdrop-blur-xl transition-all duration-300 hover:border-l-emerald-500/70 hover:shadow-[0_0_40px_rgba(16,185,129,0.15)]">
                                    <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-500/8 blur-3xl transition-all duration-500 group-hover:bg-emerald-500/15" />
                                    <div className="relative flex items-center justify-between mb-6">
                                        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Recent Activity</span>
                                        <span className="text-2xl">📋</span>
                                    </div>
                                    <div className="text-7xl font-bold text-white">{recentCount}</div>
                                    <p className="mt-3 text-sm text-slate-500">Events this week</p>
                                </article>
                            </div>
                        </div>

                        <section className="grid gap-8 xl:grid-cols-[1fr_1fr]">
                            <article className="rounded-3xl border border-white/[0.06] bg-slate-900/50 p-10 backdrop-blur-2xl">
                                <div className="mb-10 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-3xl font-bold text-white tracking-tight">Trust Score Breakdown</h3>
                                        <p className="mt-2 text-base text-slate-500">Components affecting your overall score</p>
                                    </div>
                                    <span className="rounded-full border border-white/10 bg-white/6 px-5 py-2 text-sm font-semibold text-slate-400">4 factors</span>
                                </div>
                                <div className="space-y-8">
                                    {trustScoreBreakdown.map(item => (
                                        <div key={item.id} className="group">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-4">
                                                    <span className={`flex h-10 w-10 items-center justify-center rounded-xl border text-lg font-bold ${item.id === 'identity-verification' ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300' : item.id === 'data-contribution-quality' ? 'border-blue-500/30 bg-blue-500/15 text-blue-300' : item.id === 'organization-credibility' ? 'border-indigo-500/30 bg-indigo-500/15 text-indigo-300' : 'border-amber-500/30 bg-amber-500/15 text-amber-300'}`}>
                                                        {item.icon}
                                                    </span>
                                                    <span className="text-base font-semibold text-slate-200">{item.label}</span>
                                                </div>
                                                <span className="text-2xl font-bold text-slate-200">{item.score}%</span>
                                            </div>
                                            <div className="h-3.5 rounded-full bg-slate-800/50 overflow-hidden">
                                                <div className={`h-full rounded-full ${item.barClass} transition-all duration-700 ease-out ${item.barClass === 'bg-emerald-500' ? 'shadow-[0_0_16px_rgba(16,185,129,0.6)]' : item.barClass === 'bg-blue-500' ? 'shadow-[0_0_16px_rgba(59,130,246,0.6)]' : item.barClass === 'bg-indigo-500' ? 'shadow-[0_0_16px_rgba(99,102,241,0.6)]' : 'shadow-[0_0_16px_rgba(245,158,11,0.6)]'}`} style={{ width: `${item.score}%` }} />
                                            </div>
                                            {item.tip && <p className="mt-4 text-sm text-amber-400/80">{item.tip}</p>}
                                        </div>
                                    ))}
                                </div>
                            </article>

                            <article className="rounded-3xl border border-white/[0.06] bg-slate-900/50 p-10 backdrop-blur-2xl">
                                <div className="mb-10 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-3xl font-bold text-white tracking-tight">Recent Activity</h3>
                                        <p className="mt-2 text-base text-slate-500">Latest workflow events</p>
                                    </div>
                                    <span className={`rounded-full px-5 py-2 text-sm font-semibold border ${trustLevel(netTrustScore).classes}`}>{netTrustScore}</span>
                                </div>
                                <div className="relative space-y-6 pl-6">
                                    <div className="absolute left-2 top-2 bottom-2 w-px bg-gradient-to-b from-emerald-500/40 via-slate-700/40 to-transparent" />
                                    {recentActivity.slice(0, 4).map((item, idx) => (
                                        <div key={idx} className="relative group">
                                            <span className={`absolute -left-[1.6rem] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-[#010915] ${activityDot[item.type]} shadow-lg`} />
                                            <p className="text-base font-medium text-slate-200 group-hover:text-white transition-colors">{item.label}</p>
                                            <p className="mt-1 text-xs text-slate-500">{item.timestamp}</p>
                                        </div>
                                    ))}
                                </div>
                                <Link to="/access-requests" className="mt-10 flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-4 text-base font-semibold text-slate-300 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06] hover:text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                                    View all activity
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </article>
                        </section>
                    </main>

                    <aside className="space-y-8">
                        <section className="rounded-3xl border border-white/[0.06] bg-slate-900/50 p-8 backdrop-blur-2xl">
                            <div className="mb-2">
                                <h3 className="text-xl font-bold text-white">Exclusive Access</h3>
                                <p className="mt-1 text-sm text-slate-500">Time-sensitive opportunities</p>
                            </div>
                            <div className="mt-6 space-y-4">
                                {exclusiveAccessAlerts.map(alert => (
                                    <div key={alert.id} className={`group relative rounded-2xl border-l-[4px] ${alert.borderClass} border border-white/[0.04] bg-white/[0.02] p-5 transition-all duration-300 hover:bg-white/[0.05] hover:shadow-[0_0_25px_rgba(255,255,255,0.03)]`}>
                                        <div className="flex items-start gap-3">
                                            <span className={`mt-1.5 h-2.5 w-2.5 rounded-full ${alert.dotClass} ${alert.urgent ? 'animate-pulse' : ''}`} />
                                            <div>
                                                <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">{alert.title}</p>
                                                <p className="mt-1.5 text-xs text-slate-500">{alert.subtitle}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="rounded-3xl border border-white/[0.06] bg-slate-900/50 p-8 backdrop-blur-2xl">
                            <div className="mb-2">
                                <h3 className="text-xl font-bold text-white">Intelligence Feed</h3>
                                <p className="mt-1 text-sm text-slate-500">Updates based on your profile</p>
                            </div>
                            <div className="mt-6 space-y-3">
                                {intelligenceFeed.map(item => (
                                    <div key={item.id} className="group flex items-start gap-3 rounded-xl p-3 -mx-3 transition-all duration-200 hover:bg-white/[0.03]">
                                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-gradient-to-br ${feedThumbnailStyles[item.id]}`}>
                                            {item.icon}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">{item.title}</p>
                                            <p className="text-xs text-slate-500">{item.subtitle}</p>
                                        </div>
                                        <button className="shrink-0 text-xs font-semibold text-slate-500 hover:text-emerald-400 transition-colors">
                                            {item.action}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </aside>
                </div>
            </div>
        </div>
    )
}
