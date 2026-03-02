import { Link } from 'react-router-dom'
import { datasetRequests, recentActivity, participantTrust, trustLevel, activityDot } from '../data/workspaceData'

export default function DashboardPage() {
    const misusePenalty = participantTrust.misuseWarning ? participantTrust.misusePenalty : 0
    const netTrustScore = Math.max(participantTrust.score - misusePenalty, 0)
    const pendingRequests = datasetRequests.filter(item => item.status === 'Pending').length
    const approvedAccess = datasetRequests.filter(item => item.status === 'Approved').length
    const recentCount = recentActivity.length

    const trustProgress = Math.min(Math.max(netTrustScore, 0), 100)
    const trustCircumference = 2 * Math.PI * 42
    const trustOffset = trustCircumference - (trustProgress / 100) * trustCircumference
    const trustRingColor = netTrustScore >= 70 ? '#10b981' : 'rgb(148 163 184)'

    const overviewCards = [
        {
            label: 'Trust Score',
            value: netTrustScore,
            helper: trustLevel(netTrustScore).label,
            gradient: 'from-emerald-500/20 via-emerald-400/10 to-slate-900',
            border: 'border-l-4 border-l-emerald-400',
            icon: '🛡️'
        },
        {
            label: 'Pending Requests',
            value: pendingRequests,
            helper: 'Action required',
            gradient: 'from-amber-500/20 via-amber-400/10 to-slate-900',
            border: 'border-l-4 border-l-amber-400',
            icon: '⏳'
        },
        {
            label: 'Approved Access',
            value: approvedAccess,
            helper: 'Active approvals',
            gradient: 'from-blue-500/20 via-blue-400/10 to-slate-900',
            border: 'border-l-4 border-l-blue-400',
            icon: '✅'
        },
        {
            label: 'Recent Activity',
            value: recentCount,
            helper: 'Last 7 days',
            gradient: 'from-purple-500/20 via-purple-400/10 to-slate-900',
            border: 'border-l-4 border-l-purple-400',
            icon: '📈'
        }
    ]

    const accessTrend = [40, 65, 35, 75, 85, 55, 70]
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const exclusiveAccessAlerts = [
        {
            id: 'climate-2024',
            title: '🔴 Global Climate Dataset 2024 — Only 2 researcher slots remaining',
            subtitle: 'Access window closes in 47 hours',
            borderClass: 'border-l-red-500',
            dotClass: 'bg-red-500',
            urgent: true
        },
        {
            id: 'market-tick-q1',
            title: '🟡 Financial Market Tick Data Q1 — New version available',
            subtitle: 'Your access tier qualifies · Expires in 5 days',
            borderClass: 'border-l-amber-500',
            dotClass: 'bg-amber-400',
            urgent: true
        },
        {
            id: 'urban-mobility',
            title: '🟢 Urban Mobility Sensor Pack — Newly verified, 12 slots open',
            subtitle: 'Matches your research domain',
            borderClass: 'border-l-emerald-500',
            dotClass: 'bg-emerald-500',
            urgent: false
        }
    ]
    const intelligenceFeed = [
        {
            id: 'healthcare-verified',
            icon: '📊',
            title: '3 new datasets verified in Healthcare domain',
            subtitle: 'Matches your industry · 2 hours ago',
            timestamp: '2 hours ago',
            action: 'View'
        },
        {
            id: 'trust-score-boost',
            icon: '🔐',
            title: 'Your Trust Score can increase by +5 points',
            subtitle: 'Complete your organization verification · Action required',
            timestamp: 'Action required',
            action: 'Act'
        },
        {
            id: 'mit-collab',
            icon: '🤝',
            title: 'MIT Research Lab requested collaboration',
            subtitle: 'Review their proposal · Yesterday',
            timestamp: 'Yesterday',
            action: 'View'
        }
    ]
    const trustScoreBreakdown = [
        {
            id: 'identity-verification',
            label: 'Identity Verification',
            score: 95,
            barClass: 'bg-emerald-500'
        },
        {
            id: 'data-contribution-quality',
            label: 'Data Contribution Quality',
            score: 78,
            barClass: 'bg-blue-500'
        },
        {
            id: 'organization-credibility',
            label: 'Organization Credibility',
            score: 85,
            barClass: 'bg-blue-500'
        },
        {
            id: 'compliance-history',
            label: 'Compliance History',
            score: 60,
            barClass: 'bg-amber-500',
            tip: 'Complete org verification to improve this score'
        }
    ]
    const kpiCards = overviewCards.filter(card => card.label !== 'Trust Score')
    const breakdownGlyphs: Record<string, string> = {
        'identity-verification': 'ID',
        'data-contribution-quality': 'DQ',
        'organization-credibility': 'OC',
        'compliance-history': 'CH'
    }
    const feedThumbnailStyles: Record<string, string> = {
        'healthcare-verified': 'from-cyan-500/25 to-blue-500/20 text-cyan-200',
        'trust-score-boost': 'from-emerald-500/25 to-cyan-500/20 text-emerald-200',
        'mit-collab': 'from-indigo-500/25 to-blue-500/20 text-indigo-200'
    }

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-slate-900 text-white">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(16,185,129,0.14),transparent_35%),radial-gradient(circle_at_88%_10%,rgba(59,130,246,0.12),transparent_32%),linear-gradient(to_bottom,rgba(15,23,42,0.88),rgba(2,6,23,0.94))]" />
            <div
                className="relative container mx-auto px-4 py-6 md:px-6 lg:py-8"
                data-trend-window={`${dayLabels[0]}-${dayLabels[dayLabels.length - 1]}`}
                data-trend-average={Math.round(accessTrend.reduce((sum, value) => sum + value, 0) / accessTrend.length)}
            >
                <header className="mb-6 rounded-2xl border border-slate-700/70 bg-slate-900/65 px-4 py-4 shadow-[0_18px_40px_rgba(2,6,23,0.45)] backdrop-blur-xl md:px-6">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/70 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-slate-300">
                                Participant Workspace
                            </div>
                            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">Dashboard Overview</h1>
                            <p className="mt-1 text-sm text-slate-400">Enterprise-grade trust, access, and activity intelligence in one view.</p>
                        </div>
                        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold border ${trustLevel(netTrustScore).classes}`}>
                            <span className="h-2 w-2 rounded-full bg-emerald-400" />
                            {trustLevel(netTrustScore).label}
                        </span>
                    </div>
                </header>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_23rem]">
                    <main className="space-y-6">
                        <section className="grid gap-4 2xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
                            <article className="relative overflow-hidden rounded-3xl border border-emerald-400/30 bg-gradient-to-br from-slate-800/85 via-slate-900/85 to-emerald-950/55 p-6 shadow-[0_22px_55px_rgba(0,0,0,0.55)] backdrop-blur-xl">
                                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(16,185,129,0.2),transparent_42%)]" />
                                <div className="relative flex h-full flex-col justify-between gap-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-[11px] uppercase tracking-[0.14em] text-emerald-200/80">Trust Score</p>
                                            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Participant Reputation Index</h2>
                                        </div>
                                        <span className="inline-flex items-center rounded-full border border-emerald-300/45 bg-emerald-500/12 px-3 py-1 text-xs font-semibold text-emerald-200">
                                            Trusted Participant
                                        </span>
                                    </div>

                                    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end sm:justify-start">
                                        <div className="relative h-48 w-48 shrink-0">
                                            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                                                <circle cx="50" cy="50" r="42" stroke="rgba(71,85,105,0.75)" strokeWidth="8" fill="none" />
                                                <circle
                                                    cx="50"
                                                    cy="50"
                                                    r="42"
                                                    stroke={trustRingColor}
                                                    strokeWidth="8"
                                                    fill="none"
                                                    strokeLinecap="round"
                                                    strokeDasharray={trustCircumference}
                                                    strokeDashoffset={trustOffset}
                                                    className="drop-shadow-[0_0_12px_rgba(16,185,129,0.55)]"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <div className="text-5xl font-semibold leading-none text-white">{netTrustScore}</div>
                                                <div className="mt-1 text-[11px] uppercase tracking-[0.1em] text-slate-400">Current Score</div>
                                            </div>
                                        </div>
                                        <div className="w-full max-w-xs rounded-2xl border border-slate-700/80 bg-slate-900/60 px-4 py-3 backdrop-blur-md">
                                            <div className="text-xs text-slate-400">Weekly performance</div>
                                            <div className="mt-1 text-sm font-semibold text-emerald-300">+2 points this week</div>
                                            <div className="mt-2 text-xs text-slate-500">Maintain compliance and complete remaining verification to unlock higher-value datasets.</div>
                                        </div>
                                    </div>
                                </div>
                            </article>

                            <div className="grid gap-4 sm:grid-cols-3">
                                {kpiCards.map(card => (
                                    <article
                                        key={card.label}
                                        className={`rounded-2xl border border-slate-700/80 ${card.border} bg-gradient-to-br ${card.gradient} p-4 shadow-[0_14px_28px_rgba(2,6,23,0.45)] backdrop-blur-md`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <p className="text-[11px] uppercase tracking-[0.14em] text-slate-300">{card.label}</p>
                                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700/80 bg-slate-900/55 text-sm">
                                                {card.icon}
                                            </span>
                                        </div>
                                        <div className="mt-5 text-3xl font-semibold leading-none text-white">{card.value}</div>
                                        <p className="mt-2 text-xs text-slate-400">{card.helper}</p>
                                    </article>
                                ))}
                            </div>
                        </section>

                        <section className="grid gap-6 xl:grid-cols-[60%_40%]">
                            <article className="rounded-3xl border border-slate-700/80 bg-slate-900/65 p-6 shadow-[0_18px_45px_rgba(2,6,23,0.5)] backdrop-blur-xl">
                                <div className="mb-5 flex items-start justify-between gap-3">
                                    <div>
                                        <h3 className="text-xl font-semibold tracking-tight text-white">Trust Score Breakdown</h3>
                                        <p className="mt-1 text-sm text-slate-400">Improve your score to unlock premium datasets</p>
                                    </div>
                                    <span className="rounded-full border border-slate-700 bg-slate-800/70 px-3 py-1 text-[11px] font-medium text-slate-300">
                                        4 components
                                    </span>
                                </div>
                                <div className="space-y-4">
                                    {trustScoreBreakdown.map(item => (
                                        <div key={item.id} className="rounded-2xl border border-slate-800/90 bg-slate-950/55 p-3">
                                            <div className="mb-2 flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-700 bg-slate-800/80 text-[10px] font-semibold text-slate-300">
                                                        {breakdownGlyphs[item.id] ?? 'SC'}
                                                    </span>
                                                    <span className="text-sm text-slate-200">{item.label}</span>
                                                </div>
                                                <span className="text-sm font-semibold text-slate-300">{item.score}%</span>
                                            </div>
                                            <div className="h-2.5 overflow-hidden rounded-full bg-slate-700/80">
                                                <div className={`h-full rounded-full ${item.barClass} shadow-[0_0_10px_rgba(59,130,246,0.35)]`} style={{ width: `${item.score}%` }} />
                                            </div>
                                            {item.tip ? <p className="mt-2 text-xs text-amber-300">{item.tip}</p> : null}
                                        </div>
                                    ))}
                                </div>
                            </article>

                            <article className="rounded-3xl border border-slate-700/80 bg-slate-900/70 p-6 shadow-[0_18px_45px_rgba(2,6,23,0.5)] backdrop-blur-xl">
                                <div className="mb-5 flex items-start justify-between gap-3">
                                    <div>
                                        <h3 className="text-xl font-semibold tracking-tight text-white">Recent Activity</h3>
                                        <p className="mt-1 text-sm text-slate-400">Latest workflow events across requests and compliance.</p>
                                    </div>
                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold border ${trustLevel(netTrustScore).classes}`}>
                                        Trust: {netTrustScore}
                                    </span>
                                </div>
                                <div className="relative space-y-3 pl-5 before:absolute before:bottom-2 before:left-1.5 before:top-2 before:w-px before:bg-slate-700">
                                    {recentActivity.slice(0, 4).map((item, idx) => (
                                        <div key={idx} className="relative rounded-xl border border-slate-800 bg-slate-950/55 px-4 py-3">
                                            <span className={`absolute -left-[1.15rem] top-4 h-3 w-3 rounded-full border-2 border-slate-900 ${activityDot[item.type]}`} />
                                            <div className="text-sm font-medium text-slate-100">{item.label}</div>
                                            <div className="mt-1 text-xs text-slate-400">{item.timestamp}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4">
                                    <Link
                                        to="/access-requests"
                                        className="inline-flex w-full justify-center rounded-xl border border-slate-700 bg-slate-800/65 px-3 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-blue-500 hover:text-white"
                                    >
                                        View All
                                    </Link>
                                </div>
                            </article>
                        </section>
                    </main>

                    <aside className="space-y-6">
                        <section className="rounded-3xl border border-slate-700/80 bg-slate-900/70 p-5 shadow-[0_18px_45px_rgba(2,6,23,0.55)] backdrop-blur-xl">
                            <h3 className="text-lg font-semibold tracking-tight text-white">Exclusive Access Alerts</h3>
                            <p className="mt-1 text-xs text-slate-400">Time-sensitive opportunities matched to your profile.</p>
                            <div className="mt-4 space-y-3">
                                {exclusiveAccessAlerts.map(alert => (
                                    <div
                                        key={alert.id}
                                        className={`rounded-xl border border-slate-800/90 ${alert.borderClass} border-l-[3px] bg-slate-950/60 p-3 shadow-[0_10px_18px_rgba(2,6,23,0.35)]`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex items-start gap-2.5">
                                                <span className={`mt-1 h-2.5 w-2.5 rounded-full ${alert.dotClass} ${alert.urgent ? 'animate-pulse' : ''}`} />
                                                <div className="min-w-0">
                                                    <div className="text-xs font-medium leading-5 text-slate-100">{alert.title}</div>
                                                    <div className="mt-0.5 text-[11px] text-slate-400">{alert.subtitle}</div>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                className="shrink-0 rounded-lg border border-slate-600 bg-slate-800/70 px-2.5 py-1.5 text-[10px] font-semibold text-slate-200 transition-colors hover:border-blue-500 hover:text-white"
                                            >
                                                Request Access
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="rounded-3xl border border-slate-700/80 bg-[#0a1628] p-5 shadow-[0_18px_45px_rgba(2,6,23,0.55)] backdrop-blur-xl">
                            <h3 className="text-lg font-semibold tracking-tight text-white">Your Intelligence Feed</h3>
                            <p className="mt-1 text-xs text-slate-400">Actionable updates based on your trust and domain alignment.</p>
                            <div className="mt-4 space-y-3">
                                {intelligenceFeed.map(item => (
                                    <div
                                        key={item.id}
                                        className="rounded-xl border border-slate-700/85 bg-slate-900/45 px-3 py-3 transition-all hover:border-l-blue-400 hover:shadow-[inset_2px_0_0_#60a5fa,0_0_12px_rgba(59,130,246,0.12)]"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex items-start gap-2.5">
                                                <span
                                                    className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-gradient-to-br ${feedThumbnailStyles[item.id] ?? 'from-slate-700/40 to-slate-600/30 text-slate-300'}`}
                                                    aria-hidden
                                                >
                                                    {item.icon}
                                                </span>
                                                <div className="min-w-0">
                                                    <div className="text-xs font-medium text-slate-100">{item.title}</div>
                                                    <div className="mt-0.5 text-[11px] text-slate-400">{item.subtitle}</div>
                                                </div>
                                            </div>
                                            <div className="shrink-0 text-right">
                                                <div className="text-[10px] text-slate-400">{item.timestamp}</div>
                                                <button
                                                    type="button"
                                                    className="mt-2 rounded-lg border border-slate-600 bg-slate-800/70 px-2.5 py-1.5 text-[10px] font-semibold text-slate-200 transition-colors hover:border-blue-500 hover:text-white"
                                                >
                                                    {item.action}
                                                </button>
                                            </div>
                                        </div>
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
