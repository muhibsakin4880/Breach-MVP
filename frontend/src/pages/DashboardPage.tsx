import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { DATASET_DISCOVERY_SUMMARIES } from '../data/datasetCatalogData'
import {
    dashboardColorTokens,
    dashboardComponentTokens,
    dashboardRadiusTokens,
    dashboardShadowTokens
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
    eyebrow: 'text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500',
    heroEyebrow: 'text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-200/70',
    heroTitle: 'text-[1.85rem] font-semibold tracking-[-0.045em] text-slate-50 sm:text-[2.15rem] xl:text-[2.35rem]',
    sectionTitle: 'text-[1.2rem] font-semibold tracking-[-0.03em] text-slate-50',
    panelTitle: 'text-[1.02rem] font-semibold tracking-[-0.022em] text-slate-50',
    itemTitle: 'text-[0.95rem] font-semibold tracking-[-0.018em] text-slate-100',
    body: 'text-[13px] leading-5 text-slate-400',
    bodyStrong: 'text-[13px] leading-5 text-slate-300',
    meta: 'text-[11px] leading-5 text-slate-500',
    metaStrong: 'text-xs font-medium leading-5 text-slate-300',
    value: 'text-[1.8rem] font-semibold tracking-[-0.06em] text-slate-50'
} as const

const dashboardPageClass = `relative min-h-screen ${dashboardColorTokens['surface-page']} ${dashboardColorTokens['text-primary']}`
const dashboardPageShellClass = 'relative mx-auto max-w-[1680px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 xl:px-10 xl:py-7'
const dashboardPanelClass = `relative overflow-hidden ${dashboardRadiusTokens['radius-lg']} border border-[#23314B]/92 bg-[#131B2E]/92 p-5 shadow-[0_24px_60px_-42px_rgba(2,6,23,0.95)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-16 before:bg-[linear-gradient(180deg,rgba(255,255,255,0.025),transparent)] before:content-['']`
const dashboardPrimaryPanelClass = `relative overflow-hidden ${dashboardRadiusTokens['radius-lg']} border border-cyan-400/18 bg-[linear-gradient(135deg,rgba(10,20,37,0.97),rgba(16,26,46,0.95)_45%,rgba(12,20,36,0.98))] p-5 shadow-[0_28px_72px_-48px_rgba(34,211,238,0.22)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-16 before:bg-[linear-gradient(180deg,rgba(120,220,255,0.08),transparent)] before:content-['']`
const dashboardQuietPanelClass = `relative overflow-hidden ${dashboardRadiusTokens['radius-lg']} border border-[#1D2942]/85 bg-[#10182A]/82 p-5 shadow-[0_18px_46px_-40px_rgba(2,6,23,0.92)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-12 before:bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent)] before:content-['']`
const dashboardItemCardClass = `relative overflow-hidden ${dashboardRadiusTokens['radius-md']} border border-[#22314B]/90 bg-[#10192B]/90 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-12 before:bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent)] before:content-['']`
const dashboardFeatureCardClass = `relative overflow-hidden ${dashboardRadiusTokens['radius-md']} border border-cyan-400/16 bg-[linear-gradient(135deg,rgba(10,19,34,0.96),rgba(14,24,42,0.94)_48%,rgba(12,21,36,0.98))] px-5 py-4 shadow-[0_24px_50px_-42px_rgba(34,211,238,0.24)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-12 before:bg-[linear-gradient(180deg,rgba(125,211,252,0.08),transparent)] before:content-['']`
const dashboardUtilityCardClass = `relative overflow-hidden rounded-[22px] border border-[#1D2942]/82 bg-[#0E1728]/78 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]`
const dashboardKpiCardClass = `relative overflow-hidden ${dashboardRadiusTokens['radius-md']} border border-[#22314B]/88 bg-[#121B2F]/86 px-4 py-4 shadow-[0_18px_40px_-34px_rgba(2,6,23,0.95)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-10 before:bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent)] before:content-['']`
const dashboardAccentCardClass = `relative overflow-hidden ${dashboardRadiusTokens['radius-md']} border ${dashboardColorTokens['border-accent']} bg-[linear-gradient(135deg,rgba(34,211,238,0.08),rgba(12,19,34,0.92)_42%,rgba(9,14,27,0.96))] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]`
const dashboardSoftCardClass = `relative overflow-hidden ${dashboardRadiusTokens['radius-md']} border border-[#22314B]/82 bg-[#121B31]/80 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]`
const dashboardActionButtonClass = `${dashboardRadiusTokens['radius-md']} ${dashboardComponentTokens['action-button']} px-4 py-2.5`
const dashboardActionButtonTallClass = `${dashboardRadiusTokens['radius-md']} ${dashboardComponentTokens['action-button']} px-4 py-2.5`
const dashboardStripEmptyClass = `${dashboardRadiusTokens['radius-lg']} border ${dashboardColorTokens['border-subtle']} ${dashboardColorTokens['surface-card-soft']} px-4 py-4 ${dashboardShadowTokens['shadow-card']}`
const dashboardEmptyStateBaseClass = `${dashboardRadiusTokens['radius-md']} ${dashboardComponentTokens['empty-border']}`
const dashboardSectionIntroClass = 'mb-4'
const dashboardModuleStackClass = 'space-y-5'
const dashboardCompactStackClass = 'space-y-3'
const dashboardGridGapClass = 'gap-5'
const dashboardDenseGapClass = 'gap-4'
const dashboardCompactGapClass = 'gap-2.5'

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
    const incompleteChecklistItems = dashboardChecklistItems.filter(item => !item.done)
    const checklistProgress = Math.round((completedChecklistItems / dashboardChecklistItems.length) * 100)
    const topPriorityAction = dashboardPriorityActions[0]
    const nextSession = dashboardUpcomingSessions[0]
    const pendingTasksCard = dashboardAtAGlanceCards.find(card => card.label === 'PENDING TASKS')
    const unreadMessagesCard = dashboardAtAGlanceCards.find(card => card.label === 'UNREAD MESSAGES')
    const nextDeadlineCard = dashboardAtAGlanceCards.find(card => card.label === 'NEXT DEADLINE')
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
    const operatingFocusCards: OperatingFocusCard[] = [
        {
            label: 'Immediate priority',
            title: topPriorityAction?.title ?? 'No immediate priority',
            detail: topPriorityAction?.detail ?? 'The participant queue is clear for now.',
            meta: topPriorityAction ? topPriorityAction.ctaLabel : 'No action required',
            to: topPriorityAction?.ctaTo,
            primary: true
        },
        {
            label: 'Attention watchlist',
            title: pendingTasksCard ? `${pendingTasksCard.value} pending tasks` : `${incompleteChecklistItems.length} items open`,
            detail: incompleteChecklistItems[0]?.label ?? 'All tracked checklist items are complete.',
            meta: nextDeadlineCard?.trend ?? 'No deadline pressure right now'
        },
        {
            label: 'Next checkpoint',
            title: nextSession?.title ?? 'No session scheduled',
            detail: nextSession ? `${nextSession.time} • ${nextSession.status}` : 'Schedule the next review session.',
            meta: unreadMessagesCard ? `${unreadMessagesCard.value} unread messages` : 'No unread reviewer messages'
        }
    ]

    return (
        <div className={dashboardPageClass}>
            <div className={dashboardComponentTokens['page-background']} />

            <div className={dashboardPageShellClass}>
                <section className="mb-5" aria-labelledby="dashboard-intro-banner">
                    <div className={`${dashboardComponentTokens['hero-surface']} ${dashboardRadiusTokens['radius-lg']} px-5 py-4 sm:px-6 sm:py-5 xl:px-7`}>
                        <div className="pointer-events-none absolute -left-8 bottom-0 h-32 w-32 rounded-full bg-teal-400/10 blur-3xl" />
                        <div className="pointer-events-none absolute right-4 top-3 h-32 w-32 rounded-full bg-cyan-300/10 blur-3xl" />
                        <div className="pointer-events-none absolute inset-y-0 right-0 w-[28%] bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.12),transparent_62%)]" />

                        <div className="relative flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                            <div className="max-w-3xl">
                                <div className={dashboardText.heroEyebrow}>Participant dashboard</div>
                                <div className="mt-2 flex flex-wrap items-center gap-3">
                                    <h1 id="dashboard-intro-banner" className={dashboardText.heroTitle}>Welcome back, Demo</h1>
                                    <span className={`${dashboardRadiusTokens['radius-pill']} ${dashboardComponentTokens['status-badge']} px-3 py-1.5`}>
                                        Approved participant
                                    </span>
                                </div>
                                <p className={`mt-2 max-w-2xl ${dashboardText.bodyStrong}`}>
                                    Trust posture, approval flow, and escrow readiness across the active participant workspace.
                                </p>
                            </div>

                            <div className="flex w-full flex-col gap-3 xl:w-auto xl:min-w-[24rem] xl:items-end">
                                <div className="flex flex-wrap gap-2.5 xl:justify-end">
                                    <div className={`${dashboardUtilityCardClass} min-w-[174px]`}>
                                        <div className={dashboardText.eyebrow}>Next milestone</div>
                                        <div className="mt-1 text-sm font-semibold text-slate-100">Apr 10, 2026</div>
                                        <div className={`mt-1 ${dashboardText.meta}`}>{nextDeadlineCard?.trend ?? 'Compliance packet due'}</div>
                                    </div>
                                    <div className={`${dashboardUtilityCardClass} min-w-[174px]`}>
                                        <div className={dashboardText.eyebrow}>Open watchlist</div>
                                        <div className="mt-1 text-sm font-semibold text-slate-100">
                                            {incompleteChecklistItems.length} critical {incompleteChecklistItems.length === 1 ? 'item' : 'items'}
                                        </div>
                                        <div className={`mt-1 ${dashboardText.meta}`}>{incompleteChecklistItems[0]?.label ?? 'No active blockers'}</div>
                                    </div>
                                </div>
                                <Link
                                    to={topPriorityAction?.ctaTo ?? '/provider/datasets/new'}
                                    className={`w-full justify-center xl:w-auto ${dashboardActionButtonTallClass}`}
                                    aria-label="Continue where you left off in the participant dashboard"
                                >
                                    Resume highest-priority work
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mb-6" aria-labelledby="dashboard-operating-focus">
                    <div className={`${dashboardSectionIntroClass} flex flex-col gap-2 xl:flex-row xl:items-end xl:justify-between`}>
                        <div>
                            <div className={dashboardText.eyebrow}>Operating focus</div>
                            <h2 id="dashboard-operating-focus" className={`mt-2 ${dashboardText.sectionTitle}`}>Immediate actions and watchlist</h2>
                        </div>
                        <p className={`max-w-2xl ${dashboardText.meta}`}>
                            Where you are, what needs attention, and what is coming next for the current participant session.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.45fr)_repeat(2,minmax(0,1fr))]">
                        {operatingFocusCards.map(card => (
                            <DashboardOperatingFocusCard
                                key={card.label}
                                label={card.label}
                                title={card.title}
                                detail={card.detail}
                                meta={card.meta}
                                to={card.to}
                                primary={Boolean(card.primary)}
                            />
                        ))}
                    </div>
                </section>

                <section className="mb-6" aria-labelledby="today-at-a-glance">
                    <div className={dashboardSectionIntroClass}>
                        <h2 id="today-at-a-glance" className={dashboardText.sectionTitle}>Today at a Glance</h2>
                        <p className={`mt-1 ${dashboardText.meta}`}>Executive KPI strip for the active participant session.</p>
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
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                            {dashboardAtAGlanceCards.map((card, index) => (
                                <DashboardKpiCard
                                    key={card.label}
                                    card={card}
                                    emphasized={index === 0 || card.label === 'PENDING TASKS'}
                                />
                            ))}
                        </div>
                    </DashboardStateRenderer>
                </section>

                <section className="mb-8" aria-labelledby="dashboard-main-workspace">
                    <div className={dashboardSectionIntroClass}>
                        <h2 id="dashboard-main-workspace" className={dashboardText.sectionTitle}>Your working surface</h2>
                        <p className={`mt-1 ${dashboardText.meta}`}>The active queue, readiness modules, and supporting context that move this workspace forward.</p>
                    </div>

                    <div className={`grid grid-cols-1 ${dashboardGridGapClass} lg:grid-cols-[minmax(0,1.78fr)_minmax(320px,1fr)]`}>
                        <div className={dashboardModuleStackClass}>
                            <DashboardPanel
                                eyebrow="Priority"
                                title="What should I do next?"
                                description="The highest-leverage actions most likely to unblock approvals, releases, and trust refresh."
                                tone="primary"
                            >
                                <DashboardStateRenderer
                                    isLoading={dashboardModuleFlags.priority.isLoading}
                                    isEmpty={dashboardModuleFlags.priority.isEmpty}
                                    loading={<DashboardListSkeleton count={3} />}
                                    empty={
                                        <DashboardEmptyState
                                            icon="priority"
                                            text="No priority actions right now. Open the upload flow to create a new provider dataset package."
                                            action={{ label: 'Open upload flow', to: '/provider/datasets/new' }}
                                        />
                                    }
                                >
                                    <div className="space-y-3">
                                        {dashboardPriorityActions.map((action, index) => {
                                            const priorityTone = getPriorityToneMeta(index)
                                            return (
                                                <div
                                                    key={action.title}
                                                    className={`flex flex-col items-start justify-between gap-3 xl:flex-row xl:items-center ${
                                                        index === 0 ? dashboardFeatureCardClass : dashboardItemCardClass
                                                    }`}
                                                >
                                                    <div className="min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className={dashboardText.eyebrow}>Priority {index + 1}</span>
                                                            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${priorityTone.badgeClassName}`}>
                                                                {priorityTone.label}
                                                            </span>
                                                        </div>
                                                        <div className="mt-2 flex items-start gap-3">
                                                            <span className={`mt-1 h-2.5 w-2.5 rounded-full ${priorityTone.dotClassName}`} aria-hidden="true" />
                                                            <div className="min-w-0">
                                                                <div className={dashboardText.itemTitle}>{action.title}</div>
                                                                <div className={`mt-2 ${dashboardText.body} ${action.toneClassName}`}>{action.detail}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Link
                                                        to={action.ctaTo}
                                                        className={`w-full shrink-0 justify-center sm:w-auto ${dashboardActionButtonClass}`}
                                                    >
                                                        {action.ctaLabel}
                                                    </Link>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </DashboardStateRenderer>
                            </DashboardPanel>

                            <DashboardPanel
                                eyebrow="Action console"
                                title="Sessions and task control"
                                description="Scheduled touchpoints and the checklist items that still need participant input."
                            >
                                <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
                                    <DashboardStateRenderer
                                        isLoading={dashboardModuleFlags.upcomingSessions.isLoading}
                                        isEmpty={dashboardModuleFlags.upcomingSessions.isEmpty}
                                        loading={<DashboardListSkeleton count={3} compact />}
                                        empty={
                                            <DashboardEmptyState
                                                icon="calendar"
                                                text="No upcoming sessions. Book one now."
                                                action={{ label: 'Book session', href: 'mailto:support@redoubt.io?subject=Book%20participant%20review%20session' }}
                                            />
                                        }
                                    >
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className={dashboardText.eyebrow}>Upcoming sessions</div>
                                                <span className={dashboardText.meta}>Review, escrow, and compliance touchpoints</span>
                                            </div>
                                            {dashboardUpcomingSessions.map(session => (
                                                <article key={session.title} className={dashboardUtilityCardClass}>
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <div className={dashboardText.itemTitle}>{session.title}</div>
                                                            <div className={`mt-1 ${dashboardText.meta}`}>{session.time}</div>
                                                        </div>
                                                        <span className={`${dashboardText.metaStrong} ${session.statusClassName}`}>{session.status}</span>
                                                    </div>
                                                    <p className={`mt-2 ${dashboardText.body}`}>{session.detail}</p>
                                                </article>
                                            ))}
                                        </div>
                                    </DashboardStateRenderer>

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
                                        <div className="space-y-3">
                                            <div className={dashboardItemCardClass}>
                                                <div className="flex items-center justify-between gap-3">
                                                    <span className={dashboardText.itemTitle}>Checklist completion</span>
                                                    <span className={`${dashboardText.metaStrong} ${dashboardColorTokens['text-accent']}`}>
                                                        {completedChecklistItems} of {dashboardChecklistItems.length}
                                                    </span>
                                                </div>
                                                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#0A1324]">
                                                    <div className="h-2 rounded-full bg-cyan-400" style={{ width: `${checklistProgress}%` }} />
                                                </div>
                                                <div className={`mt-2 ${dashboardText.meta}`}>{checklistProgress}% complete</div>
                                            </div>

                                            {dashboardChecklistItems.map(item => (
                                                <div key={item.label} className={`flex items-start gap-3 ${dashboardUtilityCardClass}`}>
                                                    <span
                                                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold ${
                                                            item.done
                                                                ? 'border-emerald-400/40 bg-emerald-500/12 text-emerald-200'
                                                                : 'border-amber-400/30 bg-amber-500/10 text-amber-200'
                                                        }`}
                                                        aria-hidden="true"
                                                    >
                                                        {item.done ? '✓' : '!'}
                                                    </span>
                                                    <div className="min-w-0">
                                                        <div className={dashboardText.itemTitle}>{item.label}</div>
                                                        <div className={`mt-1 ${dashboardText.meta}`}>{item.detail}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </DashboardStateRenderer>
                                </div>
                            </DashboardPanel>

                            <DashboardPanel
                                eyebrow="Operational readiness"
                                title="Readiness and throughput"
                                description="Readiness score, evidence flow, and recent operating pace across the active queue."
                            >
                                <DashboardStateRenderer
                                    isLoading={dashboardModuleFlags.progress.isLoading}
                                    isEmpty={dashboardModuleFlags.progress.isEmpty}
                                    loading={<DashboardProgressSkeleton />}
                                    empty={
                                        <DashboardEmptyState
                                            icon="spark"
                                            text="No progress data yet. Upload a dataset package to start tracking."
                                            action={{ label: 'Upload now', to: '/provider/datasets/new' }}
                                        />
                                    }
                                >
                                    <div className="grid grid-cols-1 gap-4 2xl:grid-cols-[220px_minmax(0,1fr)]">
                                        <div className={dashboardItemCardClass}>
                                            <div className="flex items-center justify-between">
                                                <span className={dashboardText.itemTitle}>Readiness score</span>
                                                <span className={`${dashboardText.metaStrong} ${dashboardColorTokens['text-accent']}`}>78%</span>
                                            </div>
                                            <div className="mt-4 flex items-center justify-center">
                                                <div className="relative h-32 w-32">
                                                    <div className="absolute inset-4 rounded-full bg-cyan-400/10 blur-2xl" />
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
                                                        <span className="text-[1.55rem] font-semibold tracking-[-0.05em] text-slate-50">78%</span>
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

                                        <div className="space-y-4">
                                            <div className={dashboardItemCardClass}>
                                                <div className="flex items-center justify-between">
                                                    <span className={dashboardText.itemTitle}>Readiness bars</span>
                                                    <span className={dashboardText.meta}>Core operating modules</span>
                                                </div>
                                                <div className="mt-4 space-y-4">
                                                    <ProgressBarVisual label="Compliance evidence" widthClassName="w-[82%]" toneClassName="bg-emerald-400" valueLabel="82%" />
                                                    <ProgressBarVisual label="Reviewer feedback loop" widthClassName="w-[64%]" toneClassName="bg-cyan-400" valueLabel="64%" />
                                                    <ProgressBarVisual label="Settlement preparation" widthClassName="w-[71%]" toneClassName="bg-amber-400" valueLabel="71%" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_264px]">
                                                <div className={dashboardItemCardClass}>
                                                    <div className="flex items-center justify-between">
                                                        <span className={dashboardText.itemTitle}>Operating indicators</span>
                                                        <span className={dashboardText.meta}>Last 7 checkpoints</span>
                                                    </div>
                                                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                                        {dashboardProgressHighlights.map(highlight => (
                                                            <div key={highlight.label} className={dashboardUtilityCardClass}>
                                                                <div className={dashboardText.eyebrow}>{highlight.label}</div>
                                                                <div className={`mt-2 text-lg font-semibold tracking-[-0.03em] ${highlight.toneClassName}`}>{highlight.value}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className={dashboardItemCardClass}>
                                                    <div className="flex items-center justify-between">
                                                        <span className={dashboardText.itemTitle}>Activity trend</span>
                                                        <span className={dashboardText.meta}>7 checkpoints</span>
                                                    </div>
                                                    <div className="mt-4 rounded-2xl border border-[#22304D] bg-[#0C1527]/72 px-3 py-3">
                                                        <ReadinessSparkline />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </DashboardStateRenderer>
                            </DashboardPanel>
                        </div>

                        <div className={dashboardModuleStackClass}>
                            <DashboardPanel
                                eyebrow="Operations brief"
                                title="Updates, resources, and support"
                                description="The smallest context layer to keep the workspace moving without adding noise."
                                tone="quiet"
                            >
                                <div className="space-y-4">
                                    <DashboardStateRenderer
                                        isLoading={dashboardModuleFlags.announcements.isLoading}
                                        isEmpty={dashboardModuleFlags.announcements.isEmpty}
                                        loading={<DashboardListSkeleton count={2} compact />}
                                        empty={
                                            <DashboardEmptyState
                                                icon="megaphone"
                                                text="No announcements right now. Check the audit trail later."
                                                action={{ label: 'Open audit trail', to: '/audit-trail' }}
                                            />
                                        }
                                    >
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className={dashboardText.eyebrow}>Updates</div>
                                                <span className={dashboardText.meta}>Review timing and governance changes</span>
                                            </div>
                                            {dashboardAnnouncements.map(announcement => (
                                                <article key={announcement.title} className={dashboardUtilityCardClass}>
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <div className={dashboardText.itemTitle}>{announcement.title}</div>
                                                            <div className={`mt-1 ${dashboardText.body}`}>{announcement.detail}</div>
                                                        </div>
                                                        <span className={dashboardText.meta}>{announcement.timing}</span>
                                                    </div>
                                                </article>
                                            ))}
                                        </div>
                                    </DashboardStateRenderer>

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
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className={dashboardText.eyebrow}>Resources</div>
                                                <span className={dashboardText.meta}>High-frequency workspace tools</span>
                                            </div>
                                            <div className="space-y-3">
                                                {dashboardQuickLinks.map(link => (
                                                    <Link
                                                        key={link.label}
                                                        to={link.to}
                                                        className={`block ${dashboardUtilityCardClass} transition-colors hover:border-cyan-400/30 hover:bg-[#111C31]`}
                                                    >
                                                        <div className="flex items-center justify-between gap-3">
                                                            <div className="min-w-0">
                                                                <div className={dashboardText.itemTitle}>{link.label}</div>
                                                                <div className={`mt-1 ${dashboardText.meta}`}>{link.detail}</div>
                                                            </div>
                                                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cyan-400/15 bg-cyan-400/8 text-cyan-300">→</span>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </DashboardStateRenderer>

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
                                            <div className="flex items-start gap-4">
                                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-[#0A1324]/90 text-sm font-semibold tracking-[0.12em] text-cyan-100">
                                                    MC
                                                </span>
                                                <div className="min-w-0">
                                                    <div className={dashboardText.eyebrow}>Support lead</div>
                                                    <div className={`mt-1 ${dashboardText.panelTitle}`}>{dashboardSupportContact.name}</div>
                                                    <div className={`mt-1 ${dashboardText.bodyStrong} ${dashboardColorTokens['text-accent-soft']}`}>{dashboardSupportContact.role}</div>
                                                    <div className={`mt-2 ${dashboardText.meta}`}>{`${dashboardSupportContact.availability} • ${dashboardSupportContact.responseTime}`}</div>
                                                </div>
                                            </div>
                                            <a
                                                href={`mailto:${dashboardSupportContact.email}`}
                                                className={`mt-4 inline-flex ${dashboardActionButtonClass}`}
                                            >
                                                Contact support
                                            </a>
                                        </div>
                                    </DashboardStateRenderer>
                                </div>
                            </DashboardPanel>

                            <DashboardPanel
                                eyebrow="Timeline"
                                title="Activity timeline"
                                description="Completed, in-progress, and upcoming milestones that matter for this workspace."
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
                                    <div className="space-y-3">
                                        {dashboardActivityTimeline.map((item, index) => {
                                            const timelineState = getTimelineStateMeta(item.state)
                                            return (
                                                <div key={item.title} className="flex gap-3">
                                                    <div className="flex flex-col items-center">
                                                        <span
                                                            className={`flex h-8 w-8 items-center justify-center rounded-full border ${timelineState.markerClassName}`}
                                                            aria-hidden="true"
                                                        >
                                                            <TimelineMarkerIcon state={item.state} />
                                                        </span>
                                                        {index < dashboardActivityTimeline.length - 1 && <span className={`mt-2 h-full w-px ${timelineState.connectorClassName}`} />}
                                                    </div>
                                                    <article className={`relative flex-1 ${dashboardUtilityCardClass}`}>
                                                        <span className={`pointer-events-none absolute inset-y-4 left-0 w-px ${timelineState.connectorClassName}`} aria-hidden="true" />
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className={dashboardText.itemTitle}>{item.title}</div>
                                                            <span className={`rounded-full px-2.5 py-1.5 text-[11px] font-medium leading-none ${timelineState.badgeClassName}`}>
                                                                {timelineState.label}
                                                            </span>
                                                        </div>
                                                        <div className={`mt-2 ${dashboardText.meta}`}>{item.timing}</div>
                                                        <p className={`mt-2 ${dashboardText.body}`}>{item.detail}</p>
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

                <DashboardGeoAccessOverview
                    overview={geoAccessOverview}
                    metrics={geoAccessMetrics}
                    primaryAction={primaryGeoAccessAction}
                    secondaryAction={secondaryGeoAccessAction}
                />
            </div>
        </div>
    )
}

type GeoAccessMetric = {
    label: string
    value: string
    detail: string
}

type OperatingFocusCard = {
    label: string
    title: string
    detail: string
    meta: string
    to?: string
    primary?: boolean
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
        <section className="mb-8" aria-labelledby="dashboard-geo-access-posture">
            <div className={`relative overflow-hidden ${dashboardRadiusTokens['radius-lg']} border ${toneMeta.panelClassName} px-5 py-5 shadow-[0_24px_70px_-38px_rgba(2,6,23,0.92)] sm:px-6 sm:py-6`}>
                <div className={`pointer-events-none absolute -right-8 top-0 h-32 w-32 rounded-full blur-3xl ${toneMeta.glowClassName}`} />
                <div className={`pointer-events-none absolute -left-6 bottom-0 h-24 w-24 rounded-full blur-3xl ${toneMeta.glowClassName}`} />

                <div className="relative grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.95fr)] xl:items-start">
                    <div>
                        <div className={dashboardText.eyebrow}>Access posture</div>
                        <div className={`mt-3 flex flex-wrap items-center ${dashboardCompactGapClass}`}>
                            <h2 id="dashboard-geo-access-posture" className={dashboardText.panelTitle}>{overview.postureLabel}</h2>
                            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${toneMeta.badgeClassName}`}>
                                <span className={`h-2 w-2 rounded-full ${toneMeta.dotClassName}`} aria-hidden="true" />
                                Workspace visibility
                            </span>
                        </div>
                        <p className={`mt-3 max-w-3xl ${dashboardText.bodyStrong}`}>{overview.postureDetail}</p>
                        <p className={`mt-2 max-w-3xl ${dashboardText.meta}`}>
                            Derived from your organization location, provider geography, and residency controls already shown during discovery.
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2.5">
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

type DashboardPanelTone = 'default' | 'primary' | 'quiet'

function DashboardPanel({
    eyebrow,
    title,
    description,
    children,
    className = '',
    tone = 'default'
}: {
    eyebrow: string
    title: string
    description: string
    children: ReactNode
    className?: string
    tone?: DashboardPanelTone
}) {
    const panelClassName = tone === 'primary'
        ? dashboardPrimaryPanelClass
        : tone === 'quiet'
            ? dashboardQuietPanelClass
            : dashboardPanelClass
    const descriptionClassName = tone === 'quiet' ? dashboardText.meta : dashboardText.body

    return (
        <section className={`${panelClassName} ${className}`}>
            <div className={dashboardText.eyebrow}>{eyebrow}</div>
            <h3 className={`mt-2 ${dashboardText.panelTitle}`}>{title}</h3>
            <p className={`mt-2 ${descriptionClassName}`}>{description}</p>
            <div className="mt-4">{children}</div>
        </section>
    )
}

function DashboardOperatingFocusCard({
    label,
    title,
    detail,
    meta,
    to,
    primary = false
}: {
    label: string
    title: string
    detail: string
    meta: string
    to?: string
    primary?: boolean
}) {
    const cardClassName = primary ? dashboardFeatureCardClass : dashboardUtilityCardClass
    const content = (
        <>
            <div className={dashboardText.eyebrow}>{label}</div>
            <div className={`mt-2 ${primary ? dashboardText.panelTitle : dashboardText.itemTitle}`}>{title}</div>
            <div className={`mt-2 ${dashboardText.body}`}>{detail}</div>
            <div className={`mt-3 ${dashboardText.metaStrong}`}>{meta}</div>
        </>
    )

    if (!to) {
        return <article className={cardClassName}>{content}</article>
    }

    return (
        <Link to={to} className={`block transition-transform duration-200 hover:-translate-y-0.5 ${cardClassName}`}>
            {content}
        </Link>
    )
}

function DashboardKpiCard({
    card,
    emphasized = false
}: {
    card: ReturnType<typeof getDashboardAtAGlanceCards>[number]
    emphasized?: boolean
}) {
    return (
        <article
            className={`flex min-h-[118px] flex-col justify-between ${
                emphasized ? dashboardFeatureCardClass : dashboardKpiCardClass
            } transition-transform duration-200 hover:-translate-y-0.5`}
        >
            <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />
            <div className={dashboardText.eyebrow}>{card.label}</div>
            <div className="mt-3">
                <div className={`leading-none ${dashboardText.value}`}>{card.value}</div>
                <div className={`mt-3 ${dashboardText.metaStrong} ${card.toneClassName}`}>{card.trend}</div>
            </div>
        </article>
    )
}

function GeoAccessMetricCard({ metric }: { metric: GeoAccessMetric }) {
    return (
        <article className={`${dashboardUtilityCardClass} min-h-[118px]`}>
            <div className={dashboardText.eyebrow}>{metric.label}</div>
            <div className="mt-3 text-[1.55rem] font-semibold tracking-[-0.05em] text-slate-50">{metric.value}</div>
            <p className={`mt-2 ${dashboardText.meta}`}>{metric.detail}</p>
        </article>
    )
}

function ProgressBarVisual({
    label,
    widthClassName,
    toneClassName,
    valueLabel
}: {
    label: string
    widthClassName: string
    toneClassName: string
    valueLabel: string
}) {
    return (
        <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${toneClassName} shadow-[0_0_18px_rgba(34,211,238,0.22)]`} aria-hidden="true" />
                    <span className={dashboardText.itemTitle}>{label}</span>
                </div>
                <span className={dashboardText.metaStrong}>{valueLabel}</span>
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

function getPriorityToneMeta(index: number) {
    if (index === 0) {
        return {
            label: 'Immediate',
            badgeClassName: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-100',
            dotClassName: 'bg-cyan-300'
        }
    }

    if (index === 1) {
        return {
            label: 'Time-sensitive',
            badgeClassName: 'border-amber-400/30 bg-amber-500/10 text-amber-100',
            dotClassName: 'bg-amber-300'
        }
    }

    return {
        label: 'Enablement',
        badgeClassName: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100',
        dotClassName: 'bg-emerald-300'
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
        <div className={`flex flex-col items-start ${dashboardEmptyStateBaseClass} ${compact ? 'px-3 py-4' : 'px-4 py-4 sm:px-5 sm:py-5'}`}>
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
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
