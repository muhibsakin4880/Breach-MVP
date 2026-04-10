import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { DATASET_DISCOVERY_SUMMARIES } from '../data/datasetCatalogData'
import {
    dashboardColorTokens,
    dashboardComponentTokens,
    dashboardRadiusTokens,
    dashboardShadowTokens,
    dashboardSpacingTokens,
    dashboardTypographyTokens
} from '../dashboardTokens'
import { getDashboardAtAGlanceCards } from '../data/dashboardAtAGlanceData'
import {
    dashboardActivityTimeline,
    dashboardAnnouncements,
    dashboardChecklistItems,
    dashboardProgressHighlights,
    dashboardPriorityActions,
    dashboardQuickLinks,
    dashboardSupportContact,
    dashboardUpcomingSessions
} from '../data/dashboardPanelsData'
import {
    buildDatasetGeoAccessOverview,
    type GeoAccessTone
} from '../domain/datasetGeoAccess'
import {
    emptyStep1FormState,
    onboardingStorageKeys,
    readOnboardingValue
} from '../onboarding/storage'

const dashboardSparklinePoints = [
    { x: 18, y: 60 },
    { x: 62, y: 54 },
    { x: 106, y: 58 },
    { x: 150, y: 42 },
    { x: 194, y: 46 },
    { x: 238, y: 26 },
    { x: 282, y: 32 },
    { x: 322, y: 18 }
] as const

const dashboardText = {
    eyebrow: dashboardTypographyTokens['text-eyebrow'],
    heroEyebrow: dashboardTypographyTokens['text-hero-eyebrow'],
    heroTitle: dashboardTypographyTokens['text-hero-title'],
    sectionTitle: dashboardTypographyTokens['text-section-title'],
    panelTitle: dashboardTypographyTokens['text-panel-title'],
    itemTitle: dashboardTypographyTokens['text-item-title'],
    body: dashboardTypographyTokens['text-body'],
    bodyStrong: dashboardTypographyTokens['text-body-strong'],
    meta: dashboardTypographyTokens['text-muted'],
    metaStrong: dashboardTypographyTokens['text-muted-strong'],
    value: dashboardTypographyTokens['text-value']
} as const

const dashboardPageClass = `relative min-h-screen ${dashboardColorTokens['surface-page']} ${dashboardColorTokens['text-primary']}`
const dashboardPageShellClass = `relative mx-auto max-w-[1680px] ${dashboardSpacingTokens['page-padding']}`
const dashboardPanelClass = `relative overflow-hidden ${dashboardRadiusTokens['radius-lg']} border ${dashboardColorTokens['border-subtle']} ${dashboardColorTokens['surface-panel']} ${dashboardSpacingTokens['panel-padding']} ${dashboardShadowTokens['shadow-card']} before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-24 before:bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent)] before:content-['']`
const dashboardItemCardClass = `relative overflow-hidden ${dashboardRadiusTokens['radius-md']} border ${dashboardColorTokens['border-card']} ${dashboardColorTokens['surface-card']} ${dashboardSpacingTokens['card-padding']} before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-16 before:bg-[linear-gradient(180deg,rgba(255,255,255,0.025),transparent)] before:content-['']`
const dashboardAccentCardClass = `relative overflow-hidden ${dashboardRadiusTokens['radius-md']} border ${dashboardColorTokens['border-accent']} ${dashboardColorTokens['surface-accent']} ${dashboardSpacingTokens['card-padding']} shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]`
const dashboardSoftCardClass = `relative overflow-hidden ${dashboardRadiusTokens['radius-md']} ${dashboardComponentTokens['card-soft']} ${dashboardShadowTokens['shadow-card']}`
const dashboardActionButtonClass = `${dashboardRadiusTokens['radius-md']} ${dashboardComponentTokens['action-button']} ${dashboardSpacingTokens['button-padding']}`
const dashboardActionButtonTallClass = `${dashboardRadiusTokens['radius-md']} ${dashboardComponentTokens['action-button']} ${dashboardSpacingTokens['button-padding-tall']}`
const dashboardStripEmptyClass = `${dashboardRadiusTokens['radius-lg']} border ${dashboardColorTokens['border-subtle']} ${dashboardColorTokens['surface-card-soft']} ${dashboardSpacingTokens['card-padding']} ${dashboardShadowTokens['shadow-card']}`
const dashboardEmptyStateBaseClass = `${dashboardRadiusTokens['radius-md']} ${dashboardComponentTokens['empty-border']}`
const dashboardSectionIntroClass = dashboardSpacingTokens['section-intro']
const dashboardModuleStackClass = dashboardSpacingTokens['stack-4']
const dashboardCompactStackClass = dashboardSpacingTokens['stack-3']
const dashboardGridGapClass = dashboardSpacingTokens['space-6']
const dashboardDenseGapClass = dashboardSpacingTokens['space-4']
const dashboardCompactGapClass = dashboardSpacingTokens['space-3']

const dashboardModuleFlags = {
    atAGlance: { isLoading: false, isEmpty: false },
    priority: { isLoading: false, isEmpty: false },
    upcomingSessions: { isLoading: false, isEmpty: false },
    checklist: { isLoading: false, isEmpty: false },
    announcements: { isLoading: false, isEmpty: false },
    quickLinks: { isLoading: false, isEmpty: false },
    support: { isLoading: false, isEmpty: false },
    progress: { isLoading: false, isEmpty: false },
    timeline: { isLoading: false, isEmpty: false }
} as const

export default function DashboardPage() {
    const dashboardAtAGlanceCards = getDashboardAtAGlanceCards()
    const completedChecklistItems = dashboardChecklistItems.filter(item => item.done).length
    const checklistProgress = Math.round((completedChecklistItems / dashboardChecklistItems.length) * 100)
    const buyerOrgCountry = readOnboardingValue(onboardingStorageKeys.step1, emptyStep1FormState).country.trim()
    const geoAccessOverview = buildDatasetGeoAccessOverview(DATASET_DISCOVERY_SUMMARIES, buyerOrgCountry)
    const geoAccessMetrics: GeoAccessMetric[] = [
        {
            label: 'Organization location',
            value: buyerOrgCountry || 'Add org country',
            detail: buyerOrgCountry
                ? 'Used to personalize buyer geo eligibility across discovery.'
                : 'Complete your org profile to activate buyer-specific geo checks.'
        },
        {
            label: 'Eligible now',
            value: `${geoAccessOverview.eligibleCount}`,
            detail: `Of ${geoAccessOverview.totalDatasetCount} catalog datasets`
        },
        {
            label: 'Region-restricted',
            value: `${geoAccessOverview.regionRestrictedCount}`,
            detail: 'Outside current provider geography scope'
        },
        buyerOrgCountry
            ? {
                label: 'Residency constrained',
                value: `${geoAccessOverview.residencyConstrainedCount}`,
                detail: 'Provider residency controls still narrow access'
            }
            : {
                label: 'Geo checks pending',
                value: `${geoAccessOverview.pendingProfileCount}`,
                detail: 'Waiting on your organization location'
            }
    ]
    const primaryGeoAccessAction = buyerOrgCountry
        ? { label: 'Browse eligible datasets', to: '/datasets' }
        : { label: 'Update org profile', to: '/profile' }
    const secondaryGeoAccessAction = buyerOrgCountry
        ? { label: 'Review org profile', to: '/profile' }
        : { label: 'Open discovery', to: '/datasets' }

    return (
        <div className={dashboardPageClass}>
            <div className={dashboardComponentTokens['page-background']} />

            <div className={dashboardPageShellClass}>
                <section className={dashboardSpacingTokens['section-gap']} aria-labelledby="dashboard-intro-banner">
                    <div className={`${dashboardComponentTokens['hero-surface']} ${dashboardRadiusTokens['radius-lg']} ${dashboardSpacingTokens['hero-padding']}`}>
                        <div className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-teal-400/12 blur-3xl" />
                        <div className="pointer-events-none absolute right-6 top-4 h-44 w-44 rounded-full bg-cyan-300/12 blur-3xl" />
                        <div className="pointer-events-none absolute inset-y-0 right-0 w-[36%] bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.16),transparent_62%)]" />

                        <div className={`relative flex min-h-[88px] flex-col justify-between ${dashboardGridGapClass} lg:flex-row lg:items-center`}>
                            <div className="max-w-2xl">
                                <h1 id="dashboard-intro-banner" className={dashboardText.heroTitle}>Welcome back, Demo</h1>
                                <p className={`mt-2 ${dashboardText.bodyStrong}`}>
                                    Continue managing trust, access, and escrow milestones from the same governed workspace.
                                </p>
                            </div>

                            <div className={`flex w-full shrink-0 flex-col items-start ${dashboardCompactGapClass} sm:w-auto sm:flex-row sm:flex-wrap sm:items-center lg:max-w-[30rem] lg:justify-end`}>
                                <span className={`${dashboardRadiusTokens['radius-pill']} ${dashboardComponentTokens['status-badge']} ${dashboardSpacingTokens['chip-padding']}`}>
                                    Approved participant
                                </span>
                                <div className={`${dashboardRadiusTokens['radius-md']} border ${dashboardColorTokens['border-subtle']} ${dashboardColorTokens['surface-overlay-soft']} ${dashboardSpacingTokens['card-padding-compact']} shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]`}>
                                    <div className={dashboardText.eyebrow}>NEXT MILESTONE DATE: Apr 10, 2026</div>
                                </div>
                                <button
                                    type="button"
                                    className={`w-full sm:w-auto ${dashboardActionButtonTallClass}`}
                                    aria-label="Continue where you left off in the participant dashboard"
                                >
                                    Continue where you left off
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <DashboardGeoAccessOverview
                    overview={geoAccessOverview}
                    metrics={geoAccessMetrics}
                    primaryAction={primaryGeoAccessAction}
                    secondaryAction={secondaryGeoAccessAction}
                />

                <section className={dashboardSpacingTokens['section-gap']} aria-labelledby="today-at-a-glance">
                    <div className={dashboardSectionIntroClass}>
                        <h2 id="today-at-a-glance" className={dashboardText.sectionTitle}>Today at a Glance</h2>
                        <p className={`mt-2 ${dashboardText.body}`}>Fast-read operating signals for the current participant session.</p>
                    </div>
                    <DashboardStateRenderer
                        isLoading={dashboardModuleFlags.atAGlance.isLoading}
                        isEmpty={dashboardModuleFlags.atAGlance.isEmpty}
                        loading={<DashboardAtAGlanceSkeleton />}
                        empty={
                            <DashboardStripEmptyState
                                icon="spark"
                                text="No glance metrics available yet. Start a session to populate today’s snapshot."
                                action={{ label: 'Browse datasets', to: '/datasets' }}
                            />
                        }
                    >
                        <div className={`grid grid-cols-1 ${dashboardCompactGapClass} sm:grid-cols-2 lg:grid-cols-5`}>
                            {dashboardAtAGlanceCards.map(card => (
                                <article
                                    key={card.label}
                                    className={`flex min-h-[112px] flex-col justify-between ${dashboardSoftCardClass} transition-transform duration-200 hover:-translate-y-0.5 hover:border-cyan-400/25`}
                                >
                                    <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />
                                    <div className={dashboardText.eyebrow}>{card.label}</div>
                                    <div className={`mt-3 ${dashboardText.value}`}>{card.value}</div>
                                    <div className={`mt-3 ${dashboardText.metaStrong} ${card.toneClassName}`}>{card.trend}</div>
                                </article>
                            ))}
                        </div>
                    </DashboardStateRenderer>
                </section>

                <section className={dashboardSpacingTokens['section-gap']} aria-labelledby="dashboard-main-workspace">
                    <div className={dashboardSectionIntroClass}>
                        <h2 id="dashboard-main-workspace" className={dashboardText.sectionTitle}>Your working surface</h2>
                        <p className={`mt-2 ${dashboardText.body}`}>The highest-signal actions, sessions, tasks, and support options for this participant workspace.</p>
                    </div>

                    <div className={`grid grid-cols-1 ${dashboardGridGapClass} lg:grid-cols-[minmax(0,1.85fr)_minmax(0,1fr)]`}>
                        <div className={dashboardModuleStackClass}>
                            <DashboardPanel
                                eyebrow="Priority"
                                title="What should I do next?"
                                description="Focus on the next three actions most likely to unblock approvals, releases, and trust refresh."
                            >
                                <DashboardStateRenderer
                                    isLoading={dashboardModuleFlags.priority.isLoading}
                                    isEmpty={dashboardModuleFlags.priority.isEmpty}
                                    loading={<DashboardListSkeleton count={3} />}
                                    empty={
                                        <DashboardEmptyState
                                            icon="priority"
                                            text="No priority actions right now. Open your contribution queue to create one."
                                            action={{ label: 'Open contributions', to: '/contributions' }}
                                        />
                                    }
                                >
                                    <div className={dashboardModuleStackClass}>
                                        {dashboardPriorityActions.map((action, index) => (
                                            <div key={action.title} className={`flex flex-col items-start justify-between ${dashboardDenseGapClass} ${dashboardItemCardClass} xl:flex-row xl:items-center`}>
                                                <div>
                                                    <div className={`${dashboardText.meta} mb-2`}>Priority {index + 1}</div>
                                                    <div className={dashboardText.itemTitle}>{action.title}</div>
                                                    <div className={`mt-2 ${dashboardText.body} ${action.toneClassName}`}>{action.detail}</div>
                                                </div>
                                                <Link
                                                    to={action.ctaTo}
                                                    className={`w-full shrink-0 sm:w-auto ${dashboardActionButtonClass}`}
                                                >
                                                    {action.ctaLabel}
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                </DashboardStateRenderer>
                            </DashboardPanel>

                            <DashboardPanel
                                eyebrow="Sessions"
                                title="Upcoming Sessions"
                                description="The next scheduled participant touchpoints across review, escrow, and compliance."
                            >
                                <DashboardStateRenderer
                                    isLoading={dashboardModuleFlags.upcomingSessions.isLoading}
                                    isEmpty={dashboardModuleFlags.upcomingSessions.isEmpty}
                                    loading={<DashboardListSkeleton count={3} />}
                                    empty={
                                        <DashboardEmptyState
                                            icon="calendar"
                                            text="No upcoming sessions. Book one now."
                                            action={{ label: 'Book session', href: 'mailto:support@redoubt.io?subject=Book%20participant%20review%20session' }}
                                        />
                                    }
                                >
                                    <div className={dashboardModuleStackClass}>
                                        {dashboardUpcomingSessions.map(session => (
                                            <article key={session.title} className={dashboardItemCardClass}>
                                                <div className={`flex items-start justify-between ${dashboardCompactGapClass}`}>
                                                    <div>
                                                        <div className={dashboardText.itemTitle}>{session.title}</div>
                                                        <div className={`mt-2 ${dashboardText.meta}`}>{session.time}</div>
                                                    </div>
                                                    <span className={`${dashboardText.metaStrong} ${session.statusClassName}`}>{session.status}</span>
                                                </div>
                                                <p className={`mt-3 ${dashboardText.body}`}>{session.detail}</p>
                                            </article>
                                        ))}
                                    </div>
                                </DashboardStateRenderer>
                            </DashboardPanel>

                            <DashboardPanel
                                eyebrow="Checklist"
                                title="Task Checklist"
                                description="Progress across the tasks that keep the participant workspace moving toward release readiness."
                            >
                                <DashboardStateRenderer
                                    isLoading={dashboardModuleFlags.checklist.isLoading}
                                    isEmpty={dashboardModuleFlags.checklist.isEmpty}
                                    loading={<DashboardChecklistSkeleton />}
                                    empty={
                                        <DashboardEmptyState
                                            icon="tasks"
                                            text="No checklist items right now. Review your trust profile for the next step."
                                            action={{ label: 'Open trust profile', to: '/trust-profile' }}
                                        />
                                    }
                                >
                                    <div className={dashboardItemCardClass}>
                                        <div className="mb-3 flex items-center justify-between">
                                            <span className={dashboardText.itemTitle}>Completion progress</span>
                                            <span className={`${dashboardText.metaStrong} ${dashboardColorTokens['text-accent']}`}>{completedChecklistItems} of {dashboardChecklistItems.length} done</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-slate-800">
                                            <div className="h-2 rounded-full bg-cyan-400" style={{ width: `${checklistProgress}%` }} />
                                        </div>
                                        <div className={`mt-2 ${dashboardText.meta}`}>{checklistProgress}% complete</div>
                                    </div>

                                    <div className={`mt-4 ${dashboardCompactStackClass}`}>
                                        {dashboardChecklistItems.map(item => (
                                            <div key={item.label} className={`flex items-start ${dashboardCompactGapClass} ${dashboardItemCardClass} py-3`}>
                                                <span
                                                    className={`mt-0 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                                                        item.done
                                                            ? 'border-emerald-400 bg-emerald-500/15 text-emerald-200'
                                                            : 'border-slate-600 bg-slate-800 text-slate-500'
                                                    }`}
                                                    aria-hidden="true"
                                                >
                                                    {item.done ? '✓' : ''}
                                                </span>
                                                <div>
                                                    <div className={dashboardText.itemTitle}>{item.label}</div>
                                                    <div className={`mt-2 ${dashboardText.meta}`}>{item.detail}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </DashboardStateRenderer>
                            </DashboardPanel>

                            <div className={dashboardSectionIntroClass}>
                                <h3 className={dashboardText.sectionTitle}>Progress and activity</h3>
                                <p className={`mt-2 ${dashboardText.body}`}>A compact view of operational momentum across readiness, evidence flow, and the next milestone states.</p>
                            </div>

                            <DashboardPanel
                                eyebrow="Progress"
                                title="Release momentum"
                                description="Placeholder visualizations for readiness, recent movement, and the pace of participant-side completion."
                            >
                                <DashboardStateRenderer
                                    isLoading={dashboardModuleFlags.progress.isLoading}
                                    isEmpty={dashboardModuleFlags.progress.isEmpty}
                                    loading={<DashboardProgressSkeleton />}
                                    empty={
                                        <DashboardEmptyState
                                            icon="spark"
                                            text="No progress data yet. Upload a contribution to start tracking."
                                            action={{ label: 'Upload now', to: '/contributions' }}
                                        />
                                    }
                                >
                                    <div className={`grid grid-cols-1 ${dashboardDenseGapClass} 2xl:grid-cols-[220px_minmax(0,1fr)]`}>
                                        <div className={dashboardItemCardClass}>
                                            <div className="flex items-center justify-between">
                                                <span className={dashboardText.itemTitle}>Readiness score</span>
                                                <span className={`${dashboardText.metaStrong} ${dashboardColorTokens['text-accent']}`}>78%</span>
                                            </div>
                                        <div className="mt-4 flex items-center justify-center">
                                                <div className="relative h-40 w-40">
                                                    <div className="absolute inset-5 rounded-full bg-cyan-400/12 blur-2xl" />
                                                    <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
                                                        <defs>
                                                            <linearGradient id="dashboardReadinessStroke" x1="0%" x2="100%" y1="0%" y2="100%">
                                                                <stop offset="0%" stopColor="rgb(103 232 249)" />
                                                                <stop offset="100%" stopColor="rgb(34 211 238)" />
                                                            </linearGradient>
                                                        </defs>
                                                        <circle cx="60" cy="60" r="44" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
                                                        <circle
                                                            cx="60"
                                                            cy="60"
                                                            r="44"
                                                            fill="none"
                                                            stroke="url(#dashboardReadinessStroke)"
                                                            strokeWidth="12"
                                                            strokeLinecap="round"
                                                            strokeDasharray="216 276"
                                                        />
                                                    </svg>
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                        <span className={dashboardText.value}>78%</span>
                                                        <span className={dashboardText.meta}>On track</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-4 grid gap-2">
                                                {dashboardProgressHighlights.map(highlight => (
                                                    <div key={highlight.label} className="flex items-center justify-between rounded-2xl border border-[#22304D] bg-[#0C1527]/72 px-3 py-2.5">
                                                        <span className={dashboardText.meta}>{highlight.label}</span>
                                                        <span className={`${dashboardText.metaStrong} ${highlight.toneClassName}`}>{highlight.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className={dashboardModuleStackClass}>
                                            <div className={dashboardItemCardClass}>
                                                <div className="flex items-center justify-between">
                                                    <span className={dashboardText.itemTitle}>Readiness bars</span>
                                                </div>
                                                <div className="mt-4 space-y-4">
                                                    <ProgressBarVisual label="Compliance evidence" widthClassName="w-[82%]" toneClassName="bg-emerald-400" />
                                                    <ProgressBarVisual label="Reviewer feedback loop" widthClassName="w-[64%]" toneClassName="bg-cyan-400" />
                                                    <ProgressBarVisual label="Settlement preparation" widthClassName="w-[71%]" toneClassName="bg-amber-400" />
                                                </div>
                                            </div>

                                            <div className={dashboardItemCardClass}>
                                                <div className="flex items-center justify-between">
                                                    <span className={dashboardText.itemTitle}>Activity sparkline</span>
                                                    <span className={dashboardText.meta}>Last 7 checkpoints</span>
                                                </div>
                                                <div className="mt-4 rounded-2xl border border-[#22304D] bg-[#0C1527]/72 px-3 py-3">
                                                    <ReadinessSparkline />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </DashboardStateRenderer>
                            </DashboardPanel>
                        </div>

                        <div className={dashboardModuleStackClass}>
                            <DashboardPanel
                                eyebrow="Updates"
                                title="Announcements"
                                description="Short operational updates that affect review timing and governance expectations."
                            >
                                <DashboardStateRenderer
                                    isLoading={dashboardModuleFlags.announcements.isLoading}
                                    isEmpty={dashboardModuleFlags.announcements.isEmpty}
                                    loading={<DashboardListSkeleton count={2} />}
                                    empty={
                                        <DashboardEmptyState
                                            icon="megaphone"
                                            text="No announcements right now. Check the audit trail later."
                                            action={{ label: 'Open audit trail', to: '/audit-trail' }}
                                        />
                                    }
                                >
                                    <div className={dashboardModuleStackClass}>
                                        {dashboardAnnouncements.map(announcement => (
                                            <article key={announcement.title} className={dashboardItemCardClass}>
                                                <div className={dashboardText.itemTitle}>{announcement.title}</div>
                                                <div className={`mt-2 ${dashboardText.body}`}>{announcement.detail}</div>
                                                <div className={`mt-2 ${dashboardText.meta}`}>{announcement.timing}</div>
                                            </article>
                                        ))}
                                    </div>
                                </DashboardStateRenderer>
                            </DashboardPanel>

                            <DashboardPanel
                                eyebrow="Links"
                                title="Resources / Quick Links"
                                description="Jump directly into the pages participants use most while managing trust and access."
                            >
                                <DashboardStateRenderer
                                    isLoading={dashboardModuleFlags.quickLinks.isLoading}
                                    isEmpty={dashboardModuleFlags.quickLinks.isEmpty}
                                    loading={<DashboardListSkeleton count={3} compact />}
                                    empty={
                                        <DashboardEmptyState
                                            icon="links"
                                            text="No quick links configured. Open your profile to set them up."
                                            action={{ label: 'Open profile', to: '/profile' }}
                                        />
                                    }
                                >
                                    <div className={dashboardCompactStackClass}>
                                        {dashboardQuickLinks.map(link => (
                                            <Link
                                                key={link.label}
                                                to={link.to}
                                                className={`block ${dashboardItemCardClass} transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-400/30 hover:bg-[#0E182C]`}
                                            >
                                                <div className={`flex items-center justify-between ${dashboardCompactGapClass}`}>
                                                    <div className={dashboardText.itemTitle}>{link.label}</div>
                                                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-cyan-400/15 bg-cyan-400/10 text-cyan-300">→</span>
                                                </div>
                                                <div className={`mt-2 ${dashboardText.meta}`}>{link.detail}</div>
                                            </Link>
                                        ))}
                                    </div>
                                </DashboardStateRenderer>
                            </DashboardPanel>

                            <DashboardPanel
                                eyebrow="Support"
                                title="Support Contact"
                                description="Reach the participant support lead for blockers around approvals, sessions, and evidence packages."
                            >
                                <DashboardStateRenderer
                                    isLoading={dashboardModuleFlags.support.isLoading}
                                    isEmpty={dashboardModuleFlags.support.isEmpty}
                                    loading={<DashboardListSkeleton count={1} compact />}
                                    empty={
                                        <DashboardEmptyState
                                            icon="support"
                                            text="No support contact assigned. Message the coordinator now."
                                            action={{ label: 'Message coordinator', href: 'mailto:support@redoubt.io?subject=Participant%20coordinator%20question' }}
                                        />
                                    }
                                >
                                    <div className={dashboardAccentCardClass}>
                                        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-cyan-400/12 blur-3xl" />
                                        <div className="relative flex items-start gap-4">
                                            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-[#0A1324]/90 text-sm font-semibold tracking-[0.12em] text-cyan-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                                                MC
                                            </span>
                                            <div className="min-w-0">
                                                <div className={dashboardText.panelTitle}>{dashboardSupportContact.name}</div>
                                                <div className={`mt-2 ${dashboardText.bodyStrong} ${dashboardColorTokens['text-accent-soft']}`}>{dashboardSupportContact.role}</div>
                                                <div className={`mt-4 ${dashboardText.meta}`}>{`${dashboardSupportContact.availability} / ${dashboardSupportContact.responseTime}`}</div>
                                            </div>
                                        </div>
                                        <a
                                            href={`mailto:${dashboardSupportContact.email}`}
                                            className={`mt-5 inline-flex ${dashboardActionButtonClass}`}
                                        >
                                            Contact support
                                        </a>
                                    </div>
                                </DashboardStateRenderer>
                            </DashboardPanel>

                            <DashboardPanel
                                eyebrow="Timeline"
                                title="Activity timeline"
                                description="Completed, in-progress, and upcoming milestones with clear state markers for quick scanning."
                            >
                                <DashboardStateRenderer
                                    isLoading={dashboardModuleFlags.timeline.isLoading}
                                    isEmpty={dashboardModuleFlags.timeline.isEmpty}
                                    loading={<DashboardTimelineSkeleton />}
                                    empty={
                                        <DashboardEmptyState
                                            icon="timeline"
                                            text="No timeline events yet. Book one now."
                                            action={{ label: 'Book session', href: 'mailto:support@redoubt.io?subject=Book%20participant%20review%20session' }}
                                        />
                                    }
                                >
                                    <div className={dashboardModuleStackClass}>
                                        {dashboardActivityTimeline.map((item, index) => {
                                            const timelineState = getTimelineStateMeta(item.state)
                                            return (
                                                <div key={item.title} className={`flex ${dashboardDenseGapClass}`}>
                                                    <div className="flex flex-col items-center">
                                                        <span
                                                            className={`flex h-9 w-9 items-center justify-center rounded-full border ${timelineState.markerClassName}`}
                                                            aria-hidden="true"
                                                        >
                                                            <TimelineMarkerIcon state={item.state} />
                                                        </span>
                                                        {index < dashboardActivityTimeline.length - 1 && <span className={`mt-2 h-full w-px ${timelineState.connectorClassName}`} />}
                                                    </div>
                                                    <article className={`relative flex-1 ${dashboardItemCardClass}`}>
                                                        <span className={`pointer-events-none absolute inset-y-5 left-0 w-px ${timelineState.connectorClassName}`} aria-hidden="true" />
                                                        <div className={`flex items-start justify-between ${dashboardCompactGapClass}`}>
                                                            <div className={dashboardText.itemTitle}>{item.title}</div>
                                                            <span className={`rounded-full px-3 py-2 text-[11px] font-medium leading-none ${timelineState.badgeClassName}`}>
                                                                {timelineState.label}
                                                            </span>
                                                        </div>
                                                        <div className={`mt-2 ${dashboardText.meta}`}>{item.timing}</div>
                                                        <p className={`mt-3 ${dashboardText.body}`}>{item.detail}</p>
                                                    </article>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </DashboardStateRenderer>
                            </DashboardPanel>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}

type GeoAccessMetric = {
    label: string
    value: string
    detail: string
}

function DashboardGeoAccessOverview({
    overview,
    metrics,
    primaryAction,
    secondaryAction
}: {
    overview: ReturnType<typeof buildDatasetGeoAccessOverview>
    metrics: GeoAccessMetric[]
    primaryAction: { label: string; to: string }
    secondaryAction: { label: string; to: string }
}) {
    const toneMeta = getDashboardGeoAccessToneMeta(overview.tone)

    return (
        <section className={dashboardSpacingTokens['section-gap']} aria-labelledby="dashboard-geo-access-posture">
            <div className={`relative overflow-hidden ${dashboardRadiusTokens['radius-lg']} border ${toneMeta.panelClassName} px-6 py-6 shadow-[0_24px_70px_-38px_rgba(2,6,23,0.92)] sm:px-7 sm:py-7`}>
                <div className={`pointer-events-none absolute -right-10 top-0 h-40 w-40 rounded-full blur-3xl ${toneMeta.glowClassName}`} />
                <div className={`pointer-events-none absolute -left-8 bottom-0 h-32 w-32 rounded-full blur-3xl ${toneMeta.glowClassName}`} />

                <div className={`relative grid grid-cols-1 ${dashboardGridGapClass} xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] xl:items-start`}>
                    <div>
                        <div className={dashboardText.eyebrow}>Geo access posture</div>
                        <div className={`mt-3 flex flex-wrap items-center ${dashboardCompactGapClass}`}>
                            <h2 id="dashboard-geo-access-posture" className={dashboardText.panelTitle}>{overview.postureLabel}</h2>
                            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold ${toneMeta.badgeClassName}`}>
                                <span className={`h-2 w-2 rounded-full ${toneMeta.dotClassName}`} aria-hidden="true" />
                                Workspace visibility
                            </span>
                        </div>
                        <p className={`mt-3 max-w-3xl ${dashboardText.bodyStrong}`}>{overview.postureDetail}</p>
                        <p className={`mt-4 max-w-3xl ${dashboardText.meta}`}>
                            These signals are derived from your organization location, provider package geography, and residency controls already shown during discovery.
                        </p>

                        <div className={`mt-5 flex flex-wrap ${dashboardCompactGapClass}`}>
                            <Link to={primaryAction.to} className={dashboardActionButtonClass}>
                                {primaryAction.label}
                            </Link>
                            <Link
                                to={secondaryAction.to}
                                className={`inline-flex items-center justify-center ${dashboardRadiusTokens['radius-md']} border ${dashboardColorTokens['border-soft']} bg-slate-950/45 px-4 py-2.5 text-sm font-semibold text-slate-100 transition-colors hover:border-cyan-400/40 hover:text-cyan-100`}
                            >
                                {secondaryAction.label}
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {metrics.map(metric => (
                            <GeoAccessMetricCard key={metric.label} metric={metric} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

function DashboardPanel({
    eyebrow,
    title,
    description,
    children,
    className = ''
}: {
    eyebrow: string
    title: string
    description: string
    children: ReactNode
    className?: string
}) {
    return (
        <section className={`${dashboardPanelClass} ${className}`}>
            <div className={dashboardText.eyebrow}>{eyebrow}</div>
            <h3 className={`mt-2 ${dashboardText.panelTitle}`}>{title}</h3>
            <p className={`mt-2 ${dashboardText.body}`}>{description}</p>
            <div className="mt-4">{children}</div>
        </section>
    )
}

function GeoAccessMetricCard({ metric }: { metric: GeoAccessMetric }) {
    return (
        <article className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[#0D1528]/88 px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <div className={dashboardText.eyebrow}>{metric.label}</div>
            <div className={`mt-3 ${dashboardText.value}`}>{metric.value}</div>
            <p className={`mt-3 ${dashboardText.meta}`}>{metric.detail}</p>
        </article>
    )
}

function ProgressBarVisual({
    label,
    widthClassName,
    toneClassName
}: {
    label: string
    widthClassName: string
    toneClassName: string
}) {
    return (
        <div className="space-y-2.5">
            <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${toneClassName} shadow-[0_0_18px_rgba(34,211,238,0.22)]`} aria-hidden="true" />
                <span className={dashboardText.itemTitle}>{label}</span>
            </div>
            <div className="relative h-2.5 overflow-hidden rounded-full bg-[#0A1324]">
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.03),transparent_45%,rgba(255,255,255,0.03))]" />
                <div className={`relative h-2.5 rounded-full shadow-[0_0_24px_rgba(34,211,238,0.12)] ${widthClassName} ${toneClassName}`} />
            </div>
        </div>
    )
}

function getDashboardGeoAccessToneMeta(tone: GeoAccessTone) {
    switch (tone) {
        case 'monitoring':
            return {
                panelClassName: 'border-amber-400/22 bg-[linear-gradient(135deg,rgba(120,53,15,0.24),rgba(15,23,42,0.94)_42%,rgba(9,14,27,0.98))]',
                badgeClassName: 'border-amber-400/35 bg-amber-500/10 text-amber-100',
                dotClassName: 'bg-amber-300',
                glowClassName: 'bg-amber-300/14'
            }
        case 'scheduled':
            return {
                panelClassName: 'border-cyan-400/22 bg-[linear-gradient(135deg,rgba(8,47,73,0.24),rgba(15,23,42,0.94)_42%,rgba(9,14,27,0.98))]',
                badgeClassName: 'border-cyan-400/35 bg-cyan-500/10 text-cyan-100',
                dotClassName: 'bg-cyan-300',
                glowClassName: 'bg-cyan-300/14'
            }
        default:
            return {
                panelClassName: 'border-emerald-400/22 bg-[linear-gradient(135deg,rgba(6,78,59,0.24),rgba(15,23,42,0.94)_42%,rgba(9,14,27,0.98))]',
                badgeClassName: 'border-emerald-400/35 bg-emerald-500/10 text-emerald-100',
                dotClassName: 'bg-emerald-300',
                glowClassName: 'bg-emerald-300/14'
            }
    }
}

function getTimelineStateMeta(state: 'completed' | 'in_progress' | 'upcoming') {
    switch (state) {
        case 'completed':
            return {
                label: 'Completed',
                badgeClassName: dashboardColorTokens['state-completed-badge'],
                markerClassName: dashboardColorTokens['state-completed-marker'],
                connectorClassName: 'bg-gradient-to-b from-emerald-400/60 to-slate-800'
            }
        case 'in_progress':
            return {
                label: 'In progress',
                badgeClassName: dashboardColorTokens['state-progress-badge'],
                markerClassName: dashboardColorTokens['state-progress-marker'],
                connectorClassName: 'bg-gradient-to-b from-cyan-400/60 to-slate-800'
            }
        default:
            return {
                label: 'Upcoming',
                badgeClassName: dashboardColorTokens['state-upcoming-badge'],
                markerClassName: dashboardColorTokens['state-upcoming-marker'],
                connectorClassName: 'bg-gradient-to-b from-amber-300/60 to-slate-800'
            }
    }
}

function TimelineMarkerIcon({ state }: { state: 'completed' | 'in_progress' | 'upcoming' }) {
    if (state === 'completed') {
        return (
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path d="M3.5 8.25 6.5 11l6-6.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        )
    }

    if (state === 'in_progress') {
        return (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeOpacity="0.28" strokeWidth="1.8" />
                <path d="M8 2.5a5.5 5.5 0 0 1 5.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
        )
    }

    return <span className="h-2.5 w-2.5 rounded-full bg-current" aria-hidden="true" />
}

function ReadinessSparkline() {
    const linePath = dashboardSparklinePoints.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`).join(' ')
    const areaPath = `${linePath} L322 96 L18 96 Z`

    return (
        <svg className="h-24 w-full" viewBox="0 0 340 96" preserveAspectRatio="none" aria-hidden="true">
            <defs>
                <linearGradient id="sparkFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="rgb(34 211 238)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="rgb(34 211 238)" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="sparkStroke" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="rgb(125 211 252)" />
                    <stop offset="100%" stopColor="rgb(34 211 238)" />
                </linearGradient>
            </defs>
            <path d="M18 78H322" stroke="rgba(148,163,184,0.16)" strokeWidth="1" />
            <path d="M18 56H322" stroke="rgba(148,163,184,0.1)" strokeDasharray="3 5" strokeWidth="1" />
            <path d="M18 34H322" stroke="rgba(148,163,184,0.1)" strokeDasharray="3 5" strokeWidth="1" />
            <path d={areaPath} fill="url(#sparkFill)" />
            <path d={linePath} fill="none" stroke="url(#sparkStroke)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {dashboardSparklinePoints.map(point => (
                <circle key={`${point.x}-${point.y}`} cx={point.x} cy={point.y} r="3.25" fill="rgb(34 211 238)" stroke="#0C1527" strokeWidth="2" />
            ))}
        </svg>
    )
}

function DashboardStateRenderer({
    isLoading,
    isEmpty,
    loading,
    empty,
    children
}: {
    isLoading: boolean
    isEmpty: boolean
    loading: ReactNode
    empty: ReactNode
    children: ReactNode
}) {
    if (isLoading) return <>{loading}</>
    if (isEmpty) return <>{empty}</>
    return <>{children}</>
}

function DashboardStripEmptyState({
    icon,
    text,
    action
}: {
    icon: DashboardEmptyIconName
    text: string
    action: DashboardStateAction
}) {
    return (
        <div className={dashboardStripEmptyClass}>
            <DashboardEmptyState icon={icon} text={text} action={action} />
        </div>
    )
}

type DashboardStateAction = {
    label: string
    to?: string
    href?: string
    downloadName?: string
}

type DashboardEmptyIconName = 'spark' | 'calendar' | 'priority' | 'tasks' | 'megaphone' | 'links' | 'support' | 'timeline'

function DashboardEmptyState({
    icon,
    text,
    action,
    compact = false
}: {
    icon: DashboardEmptyIconName
    text: string
    action: DashboardStateAction
    compact?: boolean
}) {
    return (
        <div className={`flex flex-col items-start ${dashboardEmptyStateBaseClass} ${compact ? dashboardSpacingTokens['empty-padding-compact'] : dashboardSpacingTokens['card-padding']}`}>
            <span className={dashboardComponentTokens['icon-well']} aria-hidden="true">
                <DashboardEmptyIcon icon={icon} />
            </span>
            <p className={`mt-4 ${dashboardText.body}`}>{text}</p>
            <DashboardStateActionLink action={action} className="mt-4" />
        </div>
    )
}

function DashboardStateActionLink({
    action,
    className = ''
}: {
    action: DashboardStateAction
    className?: string
}) {
    const actionClassName = `inline-flex ${dashboardActionButtonClass} ${className}`.trim()

    if (action.to) {
        return (
            <Link to={action.to} className={actionClassName}>
                {action.label}
            </Link>
        )
    }

    return (
        <a href={action.href} download={action.downloadName} className={actionClassName}>
            {action.label}
        </a>
    )
}

function DashboardEmptyIcon({ icon }: { icon: DashboardEmptyIconName }) {
    switch (icon) {
        case 'calendar':
            return (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3.75v3M17.25 3.75v3M4.5 8.25h15M5.25 5.25h13.5A.75.75 0 0119.5 6v12.75a.75.75 0 01-.75.75H5.25A.75.75 0 014.5 18.75V6a.75.75 0 01.75-.75z" />
                </svg>
            )
        case 'priority':
            return (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75l7.5 4.5v7.5L12 20.25l-7.5-4.5v-7.5L12 3.75z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v4.5" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75h.01" />
                </svg>
            )
        case 'tasks':
            return (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h10.5" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 12h10.5" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 17.25h10.5" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 6.75h.008v.008H4.5V6.75zM4.5 12h.008v.008H4.5V12zm0 5.25h.008v.008H4.5v-.008z" />
                </svg>
            )
        case 'megaphone':
            return (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 10.5h3l8.25-4.5v12l-8.25-4.5h-3z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 13.5l1.5 4.5" />
                </svg>
            )
        case 'links':
            return (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 13.5l3-3" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 16.5l-1.5 1.5a3.182 3.182 0 104.5 4.5l1.5-1.5" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 7.5l1.5-1.5a3.182 3.182 0 10-4.5-4.5L12 3" />
                </svg>
            )
        case 'support':
            return (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.09 9a3 3 0 115.82 1c0 2-3 3-3 3" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 17h.01" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        case 'timeline':
            return (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.008v.008H6.75V6.75zm0 5.25h.008v.008H6.75V12zm0 5.25h.008v.008H6.75v-.008z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6.75h6.75M10.5 12h6.75M10.5 17.25h6.75" />
                </svg>
            )
        default:
            return (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 15.75l4.5-4.5 3 3 6-7.5 2.25 2.25" />
                </svg>
            )
    }
}

function DashboardAtAGlanceSkeleton() {
    return (
        <div className={`grid grid-cols-5 ${dashboardCompactGapClass}`}>
            {Array.from({ length: 5 }).map((_, index) => (
                <DashboardSkeletonCard key={index} minHeightClassName="min-h-[96px]" />
            ))}
        </div>
    )
}

function DashboardListSkeleton({
    count,
    compact = false
}: {
    count: number
    compact?: boolean
}) {
    return (
        <div className={dashboardModuleStackClass}>
            {Array.from({ length: count }).map((_, index) => (
                <DashboardSkeletonCard key={index} minHeightClassName={compact ? 'min-h-[96px]' : 'min-h-[112px]'} />
            ))}
        </div>
    )
}

function DashboardChecklistSkeleton() {
    return (
        <div className={dashboardModuleStackClass}>
            <DashboardSkeletonCard minHeightClassName="min-h-[88px]" />
            <DashboardListSkeleton count={3} compact />
        </div>
    )
}

function DashboardProgressSkeleton() {
    return (
        <div className={`grid grid-cols-[220px_minmax(0,1fr)] ${dashboardDenseGapClass}`}>
            <DashboardSkeletonCard minHeightClassName="min-h-[324px]" />
            <div className={dashboardModuleStackClass}>
                <DashboardSkeletonCard minHeightClassName="min-h-[144px]" />
                <DashboardSkeletonCard minHeightClassName="min-h-[144px]" />
            </div>
        </div>
    )
}

function DashboardTimelineSkeleton() {
    return <DashboardListSkeleton count={3} />
}

function DashboardSkeletonCard({ minHeightClassName }: { minHeightClassName: string }) {
    return (
        <div className={`animate-pulse ${dashboardItemCardClass} ${minHeightClassName}`}>
            <div className="h-3 w-20 rounded bg-slate-700/80" />
            <div className="mt-4 h-6 w-2/3 rounded bg-slate-700/80" />
            <div className="mt-3 h-3 w-full rounded bg-slate-800" />
            <div className="mt-2 h-3 w-4/5 rounded bg-slate-800" />
        </div>
    )
}
