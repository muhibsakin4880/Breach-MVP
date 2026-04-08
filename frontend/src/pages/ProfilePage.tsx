import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
    dashboardColorTokens,
    dashboardComponentTokens,
    dashboardRadiusTokens,
    dashboardShadowTokens,
    dashboardSpacingTokens,
    dashboardTypographyTokens
} from '../dashboardTokens'
import { buildCompliancePassport, describeAccessMode, passportStatusMeta } from '../domain/compliancePassport'
import {
    credentialHistory,
    participantApiCredential,
    policyEvents,
    recentApiActivity
} from '../data/pipelineOpsData'
import {
    getParticipantNetTrustScore,
    participantActivity,
    participantActivityStyles,
    participantTrust,
    trustLevel
} from '../data/workspaceData'

type DomainOption = 'Climate' | 'Finance' | 'Healthcare' | 'Mobility'
type AccessPreference = 'Metadata & summaries only' | 'Aggregated / anonymized data' | 'Full raw dataset access'
type ConsoleLanding = 'Dashboard' | 'Profile & Settings' | 'Platform Status'

type NotificationItem = {
    id: string
    label: string
    description: string
    enabled: boolean
}

type SessionItem = {
    id: string
    device: string
    location: string
    status: string
    isCurrent?: boolean
}

type AccountSummaryItem = {
    label: string
    value: string
    detail: string
}

type SecurityEventItem = {
    label: string
    detail: string
    timestamp: string
    tone: 'success' | 'warn' | 'info'
}

type AccountActivityItem = {
    title: string
    detail: string
    timestamp: string
    category: string
    tone: 'profile' | 'security' | 'invite' | 'api' | 'trust'
}

const sessionData: SessionItem[] = [
    { id: 'session-1', device: 'Chrome on Windows 11', location: 'New York, US', status: 'Current session', isCurrent: true },
    { id: 'session-2', device: 'Edge on Windows 11', location: 'Boston, US', status: '2 days ago' },
    { id: 'session-3', device: 'Mobile Safari on iOS', location: 'Chicago, US', status: '7 days ago' }
]

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
    {
        id: 'operational-alerts',
        label: 'Operational alerts',
        description: 'Notify me when uploads, sessions, or participant workflows degrade.',
        enabled: true
    },
    {
        id: 'request-updates',
        label: 'Request updates',
        description: 'Send access review and approval progress to my verified work email.',
        enabled: true
    },
    {
        id: 'governance-status',
        label: 'Governance and status alerts',
        description: 'Send trust, compliance, and platform-status updates that affect my workspace.',
        enabled: false
    }
]

const securityEvents: SecurityEventItem[] = [
    {
        label: 'Production key rotated cleanly',
        detail: credentialHistory[0]?.label ?? 'Production credential rotated successfully.',
        timestamp: credentialHistory[0]?.timestamp ?? 'Feb 18, 2026 - 14:10',
        tone: 'success'
    },
    {
        label: 'Policy escalation remained blocked',
        detail: policyEvents[1]?.detail ?? 'A guarded export remained blocked until manual approval.',
        timestamp: policyEvents[1]?.timestamp ?? 'Today · 07:34',
        tone: 'warn'
    },
    {
        label: 'Audit scope added to credential',
        detail: credentialHistory[1]?.label ?? 'Audit read scope was added to the active credential.',
        timestamp: credentialHistory[1]?.timestamp ?? 'Feb 08, 2026 - 09:18',
        tone: 'info'
    }
]

const STORAGE_TWO_FACTOR_ENABLED = 'Redoubt:profile:twoFactorEnabled'
const STORAGE_NOTIFICATION_SETTINGS = 'Redoubt:profile:notificationSettings'
const STORAGE_SELECTED_DOMAINS = 'Redoubt:profile:selectedDomains'
const STORAGE_DEFAULT_ACCESS = 'Redoubt:profile:defaultAccessPreference'
const STORAGE_DEFAULT_CONSOLE_HOME = 'Redoubt:profile:defaultConsoleLanding'

const generateInviteCode = (prefix = 'REDO') => {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let body = ''
    for (let index = 0; index < 6; index += 1) {
        const randomIndex =
            typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function'
                ? crypto.getRandomValues(new Uint32Array(1))[0] % alphabet.length
                : Math.floor(Math.random() * alphabet.length)
        body += alphabet[randomIndex]
    }
    return `${prefix}-${body}`
}

const profilePageClass = `relative min-h-screen ${dashboardColorTokens['surface-page']} ${dashboardColorTokens['text-primary']}`
const profilePageShellClass = `relative mx-auto max-w-[1680px] ${dashboardSpacingTokens['page-padding']}`
const profileSectionClass = dashboardSpacingTokens['section-gap']
const profileSectionIntroClass = dashboardSpacingTokens['section-intro']
const profilePanelClass = `relative overflow-hidden ${dashboardRadiusTokens['radius-lg']} border ${dashboardColorTokens['border-subtle']} ${dashboardColorTokens['surface-panel']} ${dashboardSpacingTokens['panel-padding']} ${dashboardShadowTokens['shadow-card']} before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-24 before:bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent)] before:content-['']`
const profileCardClass = `relative overflow-hidden ${dashboardRadiusTokens['radius-md']} border ${dashboardColorTokens['border-card']} ${dashboardColorTokens['surface-card']} ${dashboardSpacingTokens['card-padding']} before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-16 before:bg-[linear-gradient(180deg,rgba(255,255,255,0.025),transparent)] before:content-['']`
const profileSoftCardClass = `relative overflow-hidden ${dashboardRadiusTokens['radius-md']} ${dashboardComponentTokens['card-soft']} ${dashboardShadowTokens['shadow-card']}`
const profileHeroClass = `${dashboardComponentTokens['hero-surface']} ${dashboardRadiusTokens['radius-lg']} ${dashboardSpacingTokens['hero-padding']}`
const profileActionButtonClass = `${dashboardRadiusTokens['radius-md']} ${dashboardComponentTokens['action-button']} ${dashboardSpacingTokens['button-padding']}`
const profileText = {
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

const sessionStatusMeta = {
    current: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
    recent: 'border-slate-600 bg-slate-900/70 text-slate-200'
} as const

export default function ProfilePage() {
    const { signOut, workspaceRole } = useAuth()
    const passport = buildCompliancePassport()
    const passportMeta = passportStatusMeta(passport.status)
    const netTrustScore = getParticipantNetTrustScore(participantTrust)
    const trustMeta = trustLevel(netTrustScore)
    const participantName = formatParticipantName(passport.organization.officialWorkEmail)
    const residencySummary = participantApiCredential.residencyNote.replace(/\.$/, '')
    const workspaceRoleLabel = getWorkspaceRoleLabel(workspaceRole)
    const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(() => {
        const stored = localStorage.getItem(STORAGE_TWO_FACTOR_ENABLED)
        if (stored === null) return true
        return stored === 'true'
    })
    const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
        const stored = localStorage.getItem(STORAGE_NOTIFICATION_SETTINGS)
        if (!stored) return DEFAULT_NOTIFICATIONS

        try {
            const parsed = JSON.parse(stored) as Record<string, unknown>
            if (!parsed || typeof parsed !== 'object') return DEFAULT_NOTIFICATIONS
            return DEFAULT_NOTIFICATIONS.map(item => ({
                ...item,
                enabled: typeof parsed[item.id] === 'boolean' ? (parsed[item.id] as boolean) : item.enabled
            }))
        } catch {
            return DEFAULT_NOTIFICATIONS
        }
    })
    const [selectedDomains, setSelectedDomains] = useState<DomainOption[]>(() => {
        const stored = localStorage.getItem(STORAGE_SELECTED_DOMAINS)
        if (!stored) return ['Climate', 'Healthcare']

        try {
            const parsed = JSON.parse(stored)
            if (!Array.isArray(parsed)) return ['Climate', 'Healthcare']
            const allowed = new Set<DomainOption>(['Climate', 'Finance', 'Healthcare', 'Mobility'])
            return parsed.filter((value): value is DomainOption => typeof value === 'string' && allowed.has(value as DomainOption))
        } catch {
            return ['Climate', 'Healthcare']
        }
    })
    const [defaultAccessPreference, setDefaultAccessPreference] = useState<AccessPreference>(() => {
        const stored = localStorage.getItem(STORAGE_DEFAULT_ACCESS)
        if (!stored) return 'Aggregated / anonymized data'
        const allowed = new Set<AccessPreference>([
            'Metadata & summaries only',
            'Aggregated / anonymized data',
            'Full raw dataset access'
        ])
        return allowed.has(stored as AccessPreference) ? (stored as AccessPreference) : 'Aggregated / anonymized data'
    })
    const [defaultConsoleLanding, setDefaultConsoleLanding] = useState<ConsoleLanding>(() => {
        const stored = localStorage.getItem(STORAGE_DEFAULT_CONSOLE_HOME)
        const allowed = new Set<ConsoleLanding>(['Dashboard', 'Profile & Settings', 'Platform Status'])
        return allowed.has(stored as ConsoleLanding) ? (stored as ConsoleLanding) : 'Dashboard'
    })
    const [inviteCode, setInviteCode] = useState<string | null>(null)
    const [inviteCopied, setInviteCopied] = useState(false)
    const [showCredentialDetails, setShowCredentialDetails] = useState(false)

    useEffect(() => {
        localStorage.setItem(STORAGE_TWO_FACTOR_ENABLED, String(isTwoFactorEnabled))
    }, [isTwoFactorEnabled])

    useEffect(() => {
        const settings = Object.fromEntries(notifications.map(item => [item.id, item.enabled]))
        localStorage.setItem(STORAGE_NOTIFICATION_SETTINGS, JSON.stringify(settings))
    }, [notifications])

    useEffect(() => {
        localStorage.setItem(STORAGE_SELECTED_DOMAINS, JSON.stringify(selectedDomains))
    }, [selectedDomains])

    useEffect(() => {
        localStorage.setItem(STORAGE_DEFAULT_ACCESS, defaultAccessPreference)
    }, [defaultAccessPreference])

    useEffect(() => {
        localStorage.setItem(STORAGE_DEFAULT_CONSOLE_HOME, defaultConsoleLanding)
    }, [defaultConsoleLanding])

    const enabledNotificationCount = notifications.filter(item => item.enabled).length

    const accountSummaryItems: AccountSummaryItem[] = [
        {
            label: 'Verified email',
            value: passport.organization.officialWorkEmail,
            detail: 'Primary work identity used for trust, alerts, and review decisions.'
        },
        {
            label: 'Organization',
            value: passport.organization.organizationName,
            detail: 'Verified organization tied to your governed workspace and passport reuse.'
        },
        {
            label: 'Role and workspace',
            value: `${passport.organization.roleInOrganization} · ${workspaceRoleLabel}`,
            detail: 'Determines which participant-console flows and governed sessions are prioritized.'
        },
        {
            label: 'Joined and verified',
            value: 'February 12, 2026',
            detail: 'Verified participant since the current onboarding and compliance cycle was approved.'
        },
        {
            label: 'Residency and location',
            value: passport.organization.country,
            detail: residencySummary
        },
        {
            label: 'Alert delivery',
            value: `${enabledNotificationCount} channels active`,
            detail: 'Operational, request, and governance alerts are sent to the verified work email.'
        }
    ]

    const accountActivity: AccountActivityItem[] = [
        {
            title: 'Production key rotated for research workspace',
            detail: credentialHistory[0]?.label ?? 'The live credential was rotated without interrupting governed traffic.',
            timestamp: credentialHistory[0]?.timestamp ?? 'Feb 18, 2026 - 14:10',
            category: 'Security',
            tone: 'security'
        },
        {
            title: 'Access request approved for Financial Market Tick Data',
            detail: participantActivity[1]?.detail ?? 'Privileges are active in the workspace.',
            timestamp: participantActivity[1]?.ts ?? 'Feb 16, 2026 - 09:20',
            category: 'Access',
            tone: 'trust'
        },
        {
            title: 'Compliance confirmation recorded',
            detail: participantActivity[2]?.detail ?? 'The latest DUA acknowledgement is now attached to your workspace profile.',
            timestamp: participantActivity[2]?.ts ?? 'Feb 15, 2026 - 15:05',
            category: 'Trust',
            tone: 'profile'
        },
        {
            title: 'Invite workflow ready for vetted collaborators',
            detail: 'Generate a single-use invite code when you need to onboard another approved participant into the same operating posture.',
            timestamp: 'Today · on demand',
            category: 'Invites',
            tone: 'invite'
        },
        {
            title: 'Recent audit export completed with no policy violations',
            detail: recentApiActivity[2]?.result ?? 'Audit evidence export completed successfully.',
            timestamp: `Today · ${recentApiActivity[2]?.timestamp ?? '08:02:48'}`,
            category: 'API',
            tone: 'api'
        }
    ]

    const toggleDomain = (domain: DomainOption) => {
        setSelectedDomains(current => (current.includes(domain) ? current.filter(item => item !== domain) : [...current, domain]))
    }

    const toggleNotification = (id: string) => {
        setNotifications(current => current.map(item => (item.id === id ? { ...item, enabled: !item.enabled } : item)))
    }

    const handleGenerateInvite = () => {
        setInviteCopied(false)
        setInviteCode(generateInviteCode())
    }

    const handleCopyInvite = async () => {
        if (!inviteCode) return

        try {
            await navigator.clipboard.writeText(inviteCode)
            setInviteCopied(true)
            window.setTimeout(() => setInviteCopied(false), 2000)
        } catch {
            setInviteCopied(false)
        }
    }

    return (
        <div className={profilePageClass}>
            <div className={dashboardComponentTokens['page-background']} />

            <div className={profilePageShellClass}>
                <section className={profileSectionClass} aria-labelledby="profile-hero">
                    <div className={profileHeroClass}>
                        <div className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-teal-400/12 blur-3xl" />
                        <div className="pointer-events-none absolute right-6 top-4 h-44 w-44 rounded-full bg-cyan-300/12 blur-3xl" />
                        <div className="pointer-events-none absolute inset-y-0 right-0 w-[36%] bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.16),transparent_62%)]" />

                        <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.95fr)]">
                            <div>
                                <div className={profileText.heroEyebrow}>Account and security hub</div>
                                <h1 id="profile-hero" className={`mt-2 ${profileText.heroTitle}`}>Profile &amp; Settings</h1>
                                <p className={`mt-3 max-w-3xl ${profileText.bodyStrong}`}>
                                    Manage your verified participant identity, security posture, workspace preferences, and access tools from one operating surface without
                                    duplicating trust and compliance pages.
                                </p>

                                <div className="mt-5 flex flex-wrap gap-3">
                                    <HeroPill label={trustMeta.label} tone="healthy" />
                                    <HeroMetricChip label="Trust score" value={`${netTrustScore}`} />
                                    <HeroMetricChip label="2FA" value={isTwoFactorEnabled ? 'Enabled' : 'Review needed'} />
                                    <HeroMetricChip label="Alerts enabled" value={`${enabledNotificationCount}`} />
                                    <HeroMetricChip label="Passport" value={passportMeta.label} />
                                </div>

                                <div className="mt-6 flex flex-wrap gap-3">
                                    <a href="#account-snapshot" className={profileActionButtonClass}>Edit profile</a>
                                    <a
                                        href="#security-center"
                                        className={`inline-flex items-center justify-center ${dashboardRadiusTokens['radius-md']} border ${dashboardColorTokens['border-soft']} bg-slate-950/45 px-4 py-2.5 text-sm font-semibold text-slate-100 transition-colors hover:border-cyan-400/40 hover:text-cyan-100`}
                                    >
                                        Manage security
                                    </a>
                                    <button
                                        type="button"
                                        onClick={signOut}
                                        className={`inline-flex items-center justify-center ${dashboardRadiusTokens['radius-md']} border border-rose-500/35 bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-100 transition-colors hover:border-rose-400 hover:bg-rose-500/15`}
                                    >
                                        Sign out
                                    </button>
                                </div>
                            </div>

                            <section className={`${profilePanelClass} border-cyan-400/20 bg-[#0E1729]/88`}>
                                <div className="flex items-start gap-4">
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-[#0A1324]/90 text-lg font-semibold tracking-[0.06em] text-cyan-100">
                                        {getInitials(participantName)}
                                    </div>
                                    <div className="min-w-0">
                                        <div className={profileText.eyebrow}>Verified participant</div>
                                        <div className={`mt-2 ${profileText.panelTitle}`}>{participantName}</div>
                                        <div className={`mt-2 ${profileText.bodyStrong}`}>{passport.organization.organizationName}</div>
                                        <div className={profileText.meta}>{passport.organization.officialWorkEmail}</div>
                                    </div>
                                </div>

                                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                    <InfoBadge label="Current session" value="Healthy" tone="healthy" />
                                    <InfoBadge label="Workspace role" value={workspaceRoleLabel} tone="scheduled" />
                                    <InfoBadge label="Next action" value="Review key posture" tone="monitoring" />
                                    <InfoBadge label="Default landing" value={defaultConsoleLanding} tone="healthy" />
                                </div>

                                <div className="mt-5 rounded-[24px] border border-amber-500/25 bg-amber-500/8 px-4 py-4">
                                    <div className={profileText.itemTitle}>Next recommended action</div>
                                    <p className={`mt-2 ${profileText.body}`}>
                                        Review the current production credential and confirm your governance alerts before the next governed export or access-review cycle.
                                    </p>
                                </div>
                            </section>
                        </div>
                    </div>
                </section>

                <section className={profileSectionClass} aria-labelledby="account-snapshot">
                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
                        <ProfilePanel
                            eyebrow="Identity"
                            title="Account snapshot"
                            description="Core participant identity and workspace information used by downstream participant-console flows."
                            id="account-snapshot"
                            action={
                                <SectionActionLink href="#workspace-preferences">
                                    Manage defaults
                                </SectionActionLink>
                            }
                        >
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {accountSummaryItems.map(item => (
                                    <article key={item.label} className={profileCardClass}>
                                        <div className={profileText.eyebrow}>{item.label}</div>
                                        <div className={`mt-2 ${profileText.itemTitle}`}>{item.value}</div>
                                        <p className={`mt-3 ${profileText.body}`}>{item.detail}</p>
                                    </article>
                                ))}
                            </div>
                        </ProfilePanel>

                        <ProfilePanel
                            eyebrow="Trust summary"
                            title="Trust snapshot"
                            description="A compact trust and passport overview with links into the deeper trust-focused surfaces."
                        >
                            <div className="space-y-4">
                                <div className={`rounded-[24px] border ${dashboardColorTokens['border-accent']} bg-cyan-400/[0.07] px-5 py-5`}>
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <div className={profileText.eyebrow}>Current trust band</div>
                                            <div className={`mt-2 ${profileText.panelTitle}`}>{trustMeta.label}</div>
                                        </div>
                                        <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${trustMeta.classes}`}>{netTrustScore} score</span>
                                    </div>
                                    <p className={`mt-3 ${profileText.body}`}>{participantTrust.scoreDeltaLabel}</p>
                                </div>

                                <div className={profileCardClass}>
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <div className={profileText.eyebrow}>Compliance passport</div>
                                            <div className={`mt-2 ${profileText.itemTitle}`}>{passportMeta.label}</div>
                                        </div>
                                        <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${passportMeta.classes}`}>{passport.completionPercent}% complete</span>
                                    </div>
                                    <p className={`mt-3 ${profileText.body}`}>{passportMeta.detail}</p>
                                    <p className={`mt-3 ${profileText.metaStrong}`}>Preferred access mode: {describeAccessMode(passport.preferredAccessMode)}</p>
                                </div>

                                <div className="grid gap-3">
                                    <Link to="/trust-profile" className={profileActionButtonClass}>Open trust profile</Link>
                                    <Link
                                        to="/compliance-passport"
                                        className={`inline-flex items-center justify-center ${dashboardRadiusTokens['radius-md']} border ${dashboardColorTokens['border-soft']} bg-slate-950/45 px-4 py-2.5 text-sm font-semibold text-slate-100 transition-colors hover:border-cyan-400/40 hover:text-cyan-100`}
                                    >
                                        Open compliance passport
                                    </Link>
                                    <Link
                                        to="/status"
                                        className={`inline-flex items-center justify-center ${dashboardRadiusTokens['radius-md']} border ${dashboardColorTokens['border-soft']} bg-slate-950/45 px-4 py-2.5 text-sm font-semibold text-slate-100 transition-colors hover:border-cyan-400/40 hover:text-cyan-100`}
                                    >
                                        Open platform status
                                    </Link>
                                </div>
                            </div>
                        </ProfilePanel>
                    </div>
                </section>

                <section className={profileSectionClass} aria-labelledby="security-center">
                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                        <ProfilePanel
                            eyebrow="Security"
                            title="Security center"
                            description="Session hygiene, authentication posture, and recent events that reinforce participant confidence."
                            id="security-center"
                        >
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                <SecurityPostureCard
                                    label="Two-factor authentication"
                                    value={isTwoFactorEnabled ? 'Enabled' : 'Needs review'}
                                    detail="Required for governed session access and protected export actions."
                                    tone={isTwoFactorEnabled ? 'healthy' : 'monitoring'}
                                />
                                <SecurityPostureCard
                                    label="Active sessions"
                                    value={`${sessionData.length}`}
                                    detail="One current browser session and two recent device sessions are on record."
                                    tone="healthy"
                                />
                                <SecurityPostureCard
                                    label="Credential posture"
                                    value={participantApiCredential.statusLabel}
                                    detail={`Last rotated ${participantApiCredential.lastRotated}.`}
                                    tone="scheduled"
                                />
                            </div>

                            <div className="mt-5 rounded-[24px] border border-[#22304D]/90 bg-[#0D1528]/88 p-4">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <div className={profileText.itemTitle}>Authentication controls</div>
                                        <p className={`mt-2 ${profileText.body}`}>Keep protected routes and governed actions anchored to a strong participant identity.</p>
                                    </div>
                                    <ToggleSwitch
                                        label="Toggle two-factor authentication"
                                        enabled={isTwoFactorEnabled}
                                        onToggle={() => setIsTwoFactorEnabled(current => !current)}
                                    />
                                </div>
                            </div>

                            <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
                                <div>
                                    <div className="flex items-center justify-between gap-3">
                                        <h3 className={profileText.itemTitle}>Active sessions</h3>
                                        <SectionActionLink href="#activity-timeline">Review activity</SectionActionLink>
                                    </div>
                                    <div className="mt-3 space-y-3">
                                        {sessionData.map(session => (
                                            <article key={session.id} className={profileCardClass}>
                                                <div className="flex flex-wrap items-start justify-between gap-3">
                                                    <div>
                                                        <div className={profileText.itemTitle}>{session.device}</div>
                                                        <div className={`mt-2 ${profileText.body}`}>{session.location}</div>
                                                    </div>
                                                    <span
                                                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                                                            session.isCurrent ? sessionStatusMeta.current : sessionStatusMeta.recent
                                                        }`}
                                                    >
                                                        {session.status}
                                                    </span>
                                                </div>

                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    {session.isCurrent ? (
                                                        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-200">
                                                            Current device
                                                        </span>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            className="rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-100 transition-colors hover:border-rose-400 hover:bg-rose-500/15"
                                                        >
                                                            Sign out device
                                                        </button>
                                                    )}
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between gap-3">
                                        <h3 className={profileText.itemTitle}>Recent security events</h3>
                                        <SectionActionLink to="/status">View platform status</SectionActionLink>
                                    </div>
                                    <div className="mt-3 space-y-3">
                                        {securityEvents.map(event => (
                                            <article key={event.label} className={profileCardClass}>
                                                <div className="flex items-start gap-3">
                                                    <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${getSignalToneMeta(event.tone).dotClassName}`} />
                                                    <div className="min-w-0">
                                                        <div className={profileText.itemTitle}>{event.label}</div>
                                                        <p className={`mt-2 ${profileText.body}`}>{event.detail}</p>
                                                        <p className={`mt-3 ${profileText.meta}`}>{event.timestamp}</p>
                                                    </div>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </ProfilePanel>

                        <ProfilePanel
                            eyebrow="Workspace access tools"
                            title="Access & integrations"
                            description="Credential posture, workspace access tooling, and invite utilities for vetted collaborators."
                        >
                            <div className="space-y-4">
                                <article className={profileCardClass}>
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <div className={profileText.eyebrow}>API credential</div>
                                            <div className={`mt-2 font-mono text-sm text-slate-100`}>{participantApiCredential.maskedKey}</div>
                                        </div>
                                        <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-200">
                                            {participantApiCredential.statusLabel}
                                        </span>
                                    </div>

                                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                        <MetricStack label="Environment" value={participantApiCredential.environment} />
                                        <MetricStack label="Last rotated" value={participantApiCredential.lastRotated} />
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowCredentialDetails(current => !current)}
                                            className={profileActionButtonClass}
                                        >
                                            {showCredentialDetails ? 'Hide credential details' : 'Reveal credential details'}
                                        </button>
                                        <button
                                            type="button"
                                            className={`inline-flex items-center justify-center ${dashboardRadiusTokens['radius-md']} border ${dashboardColorTokens['border-soft']} bg-slate-950/45 px-4 py-2.5 text-sm font-semibold text-slate-100 transition-colors hover:border-cyan-400/40 hover:text-cyan-100`}
                                        >
                                            Rotate production key
                                        </button>
                                    </div>

                                    {showCredentialDetails && (
                                        <div className="mt-4 space-y-4 rounded-[24px] border border-[#22304D]/90 bg-[#0D1528]/88 p-4">
                                            <div>
                                                <div className={profileText.eyebrow}>Scopes</div>
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {participantApiCredential.scopes.map(scope => (
                                                        <span key={scope} className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-200">
                                                            {scope}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <div className={profileText.eyebrow}>Residency note</div>
                                                <p className={`mt-2 ${profileText.body}`}>{participantApiCredential.residencyNote}</p>
                                            </div>

                                            <div>
                                                <div className={profileText.eyebrow}>Recent API activity</div>
                                                <div className="mt-3 space-y-3">
                                                    {recentApiActivity.map(item => (
                                                        <div key={item.id} className={`rounded-2xl border ${dashboardColorTokens['border-soft']} bg-slate-950/45 px-4 py-3`}>
                                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                                <div>
                                                                    <div className={profileText.itemTitle}>{item.route}</div>
                                                                    <div className={`mt-2 ${profileText.body}`}>{item.dataset}</div>
                                                                </div>
                                                                <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getSignalToneMeta(item.tone).badgeClassName}`}>
                                                                    {item.timestamp}
                                                                </span>
                                                            </div>
                                                            <p className={`mt-3 ${profileText.metaStrong}`}>{item.result}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </article>

                                <article className={profileCardClass}>
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <div className={profileText.eyebrow}>Invitations</div>
                                            <div className={profileText.itemTitle}>Generate a vetted collaborator invite</div>
                                        </div>
                                        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-200">
                                            Single use
                                        </span>
                                    </div>
                                    <p className={`mt-3 ${profileText.body}`}>
                                        Invite codes inherit your verified organization and expire after first use so downstream trust reviews start with the right context.
                                    </p>

                                    <div className="mt-4 flex flex-wrap gap-3">
                                        <button type="button" onClick={handleGenerateInvite} className={profileActionButtonClass}>
                                            Generate invite code
                                        </button>
                                        {inviteCode && (
                                            <button
                                                type="button"
                                                onClick={handleCopyInvite}
                                                className={`inline-flex items-center justify-center ${dashboardRadiusTokens['radius-md']} border ${dashboardColorTokens['border-soft']} bg-slate-950/45 px-4 py-2.5 text-sm font-semibold text-slate-100 transition-colors hover:border-cyan-400/40 hover:text-cyan-100`}
                                            >
                                                {inviteCopied ? 'Copied' : 'Copy code'}
                                            </button>
                                        )}
                                    </div>

                                    {inviteCode && (
                                        <div className="mt-4 rounded-[24px] border border-[#22304D]/90 bg-[#0D1528]/88 px-4 py-4 font-mono text-sm text-slate-100">
                                            {inviteCode}
                                        </div>
                                    )}
                                </article>
                            </div>
                        </ProfilePanel>
                    </div>
                </section>

                <section className={profileSectionClass} aria-labelledby="workspace-preferences">
                    <ProfilePanel
                        eyebrow="Workspace defaults"
                        title="Workspace preferences"
                        description="Operational settings that shape alerts, access defaults, and how the participant console behaves for you."
                        id="workspace-preferences"
                    >
                        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                            <div>
                                <h3 className={profileText.itemTitle}>Notification preferences</h3>
                                <div className="mt-3 space-y-3">
                                    {notifications.map(notification => (
                                        <article key={notification.id} className={profileCardClass}>
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <div className={profileText.itemTitle}>{notification.label}</div>
                                                    <p className={`mt-2 ${profileText.body}`}>{notification.description}</p>
                                                </div>
                                                <ToggleSwitch
                                                    label={`Toggle ${notification.label}`}
                                                    enabled={notification.enabled}
                                                    onToggle={() => toggleNotification(notification.id)}
                                                />
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className={profileCardClass}>
                                    <div className={profileText.itemTitle}>Preferred data domains</div>
                                    <p className={`mt-2 ${profileText.body}`}>Use domain interests to keep dataset recommendations and workspace guidance relevant.</p>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {(['Climate', 'Finance', 'Healthcare', 'Mobility'] as DomainOption[]).map(domain => {
                                            const selected = selectedDomains.includes(domain)
                                            return (
                                                <button
                                                    key={domain}
                                                    type="button"
                                                    onClick={() => toggleDomain(domain)}
                                                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                                                        selected
                                                            ? 'border-cyan-400/40 bg-cyan-500/15 text-cyan-100'
                                                            : 'border-slate-700 bg-slate-950/70 text-slate-300 hover:border-cyan-400/30'
                                                    }`}
                                                >
                                                    {domain}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                <label className={`block ${profileCardClass}`}>
                                    <span className={profileText.itemTitle}>Default access preference</span>
                                    <span className={`mt-2 block ${profileText.body}`}>Choose the access posture new dataset work should default to when nothing stricter is required.</span>
                                    <select
                                        aria-label="Default access preference"
                                        value={defaultAccessPreference}
                                        onChange={(event) => setDefaultAccessPreference(event.target.value as AccessPreference)}
                                        className={`mt-4 w-full ${dashboardRadiusTokens['radius-md']} border ${dashboardColorTokens['border-soft']} bg-slate-950/55 px-4 py-3 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20`}
                                    >
                                        <option>Metadata & summaries only</option>
                                        <option>Aggregated / anonymized data</option>
                                        <option>Full raw dataset access</option>
                                    </select>
                                </label>

                                <label className={`block ${profileCardClass}`}>
                                    <span className={profileText.itemTitle}>Default console landing page</span>
                                    <span className={`mt-2 block ${profileText.body}`}>Pick the participant-console surface you want to land on first after signing in.</span>
                                    <select
                                        aria-label="Default console landing page"
                                        value={defaultConsoleLanding}
                                        onChange={(event) => setDefaultConsoleLanding(event.target.value as ConsoleLanding)}
                                        className={`mt-4 w-full ${dashboardRadiusTokens['radius-md']} border ${dashboardColorTokens['border-soft']} bg-slate-950/55 px-4 py-3 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20`}
                                    >
                                        <option>Dashboard</option>
                                        <option>Profile & Settings</option>
                                        <option>Platform Status</option>
                                    </select>
                                </label>
                            </div>
                        </div>
                    </ProfilePanel>
                </section>

                <section className={profileSectionClass} aria-labelledby="activity-timeline">
                    <div className={profileSectionIntroClass}>
                        <h2 id="activity-timeline" className={profileText.sectionTitle}>Recent account activity</h2>
                        <p className={`mt-2 ${profileText.body}`}>A denser timeline of profile, security, invite, and API events tied to this participant workspace.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <HeroMetricChip label="Datasets contributed" value="3" />
                        <HeroMetricChip label="Access requests" value="7" />
                        <HeroMetricChip label="Approved routes" value="4" />
                    </div>

                    <div className="mt-5 space-y-4">
                        {accountActivity.map((item, index) => (
                            <div key={item.title} className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <span className={`mt-1 flex h-9 w-9 items-center justify-center rounded-full border ${getActivityToneMeta(item.tone).markerClassName}`}>
                                        <ActivityGlyph tone={item.tone} />
                                    </span>
                                    {index < accountActivity.length - 1 && <span className={`mt-2 h-full w-px ${getActivityToneMeta(item.tone).connectorClassName}`} />}
                                </div>

                                <article className={`flex-1 ${profileCardClass}`}>
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <div className={profileText.itemTitle}>{item.title}</div>
                                            <div className={`mt-2 ${profileText.meta}`}>{item.category}</div>
                                        </div>
                                        <span className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${getActivityToneMeta(item.tone).badgeClassName}`}>
                                            {item.timestamp}
                                        </span>
                                    </div>
                                    <p className={`mt-3 ${profileText.body}`}>{item.detail}</p>
                                </article>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    )
}

type ProfilePanelProps = {
    eyebrow: string
    title: string
    description: string
    children: ReactNode
    id?: string
    action?: ReactNode
}

function ProfilePanel({ eyebrow, title, description, children, id, action }: ProfilePanelProps) {
    return (
        <section className={profilePanelClass} aria-labelledby={id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <div className={profileText.eyebrow}>{eyebrow}</div>
                    <h2 id={id} className={`mt-2 ${profileText.panelTitle}`}>{title}</h2>
                    <p className={`mt-2 ${profileText.body}`}>{description}</p>
                </div>
                {action}
            </div>
            <div className="mt-4">{children}</div>
        </section>
    )
}

function SectionActionLink({
    children,
    to,
    href
}: {
    children: ReactNode
    to?: string
    href?: string
}) {
    const className = `inline-flex items-center justify-center ${dashboardRadiusTokens['radius-md']} border ${dashboardColorTokens['border-soft']} bg-slate-950/45 px-3 py-2 text-xs font-semibold text-slate-100 transition-colors hover:border-cyan-400/40 hover:text-cyan-100`

    if (to) {
        return (
            <Link to={to} className={className}>
                {children}
            </Link>
        )
    }

    return (
        <a href={href} className={className}>
            {children}
        </a>
    )
}

function HeroPill({ label, tone }: { label: string; tone: 'healthy' | 'monitoring' | 'scheduled' }) {
    const toneMeta = getSignalToneMeta(tone)

    return (
        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium ${toneMeta.badgeClassName}`}>
            <span className={`h-2.5 w-2.5 rounded-full ${toneMeta.dotClassName} ${tone === 'healthy' ? 'animate-pulse' : ''}`} />
            {label}
        </span>
    )
}

function HeroMetricChip({ label, value }: { label: string; value: string }) {
    return (
        <span className={`inline-flex items-center gap-2 ${dashboardRadiusTokens['radius-pill']} ${dashboardComponentTokens['metric-chip']} px-3 py-2 text-xs font-medium text-slate-200`}>
            <span className="uppercase tracking-[0.16em] text-slate-500">{label}</span>
            <span className="text-slate-100">{value}</span>
        </span>
    )
}

function InfoBadge({ label, value, tone }: { label: string; value: string; tone: 'healthy' | 'monitoring' | 'scheduled' }) {
    return (
        <div className={`rounded-2xl border px-4 py-3 ${getSignalToneMeta(tone).surfaceClassName}`}>
            <div className={profileText.eyebrow}>{label}</div>
            <div className={`mt-2 ${profileText.itemTitle}`}>{value}</div>
        </div>
    )
}

function SecurityPostureCard({
    label,
    value,
    detail,
    tone
}: {
    label: string
    value: string
    detail: string
    tone: 'healthy' | 'monitoring' | 'scheduled'
}) {
    return (
        <article className={profileSoftCardClass}>
            <div className={profileText.eyebrow}>{label}</div>
            <div className={`mt-3 ${profileText.value}`}>{value}</div>
            <p className={`mt-3 ${profileText.body}`}>{detail}</p>
            <div className={`mt-3 ${profileText.metaStrong} ${getSignalToneMeta(tone).textClassName}`}>{getToneLabel(tone)}</div>
        </article>
    )
}

function MetricStack({ label, value }: { label: string; value: string }) {
    return (
        <div className={`rounded-2xl border ${dashboardColorTokens['border-soft']} bg-slate-950/45 px-4 py-3`}>
            <div className={profileText.eyebrow}>{label}</div>
            <div className={`mt-2 ${profileText.bodyStrong}`}>{value}</div>
        </div>
    )
}

function ToggleSwitch({
    enabled,
    onToggle,
    label
}: {
    enabled: boolean
    onToggle: () => void
    label: string
}) {
    return (
        <button
            type="button"
            onClick={onToggle}
            aria-label={label}
            aria-pressed={enabled}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center overflow-hidden rounded-full p-0.5 transition-colors ${
                enabled ? 'bg-cyan-500' : 'bg-slate-700'
            }`}
        >
            <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
            />
        </button>
    )
}

function ActivityGlyph({ tone }: { tone: AccountActivityItem['tone'] }) {
    if (tone === 'security') {
        return (
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path d="M8 1.5 3 3.8v4.1c0 3 1.8 5 5 6.6 3.2-1.6 5-3.6 5-6.6V3.8L8 1.5Z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6.2 8.1 7.3 9.2l2.6-2.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        )
    }

    if (tone === 'invite') {
        return (
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path d="M5 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm6 1.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2.5 12.5c.7-1.3 1.9-2 3.5-2 1 0 1.9.3 2.6.8m1.4 1.2c.4-.7 1.1-1.2 2-1.2 1 0 1.8.4 2.5 1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        )
    }

    if (tone === 'api') {
        return (
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path d="M3 5.5h10M3 10.5h10M5.5 3v10M10.5 3v10" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        )
    }

    if (tone === 'trust') {
        return (
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path d="M8 2.5 13 4v3.6c0 2.5-1.5 4.3-5 5.9-3.5-1.6-5-3.4-5-5.9V4l5-1.5Z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        )
    }

    return (
        <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path d="M8 3v10M3 8h10" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

function getInitials(name: string) {
    return name
        .split(' ')
        .slice(0, 2)
        .map(part => part.charAt(0).toUpperCase())
        .join('')
}

function formatParticipantName(email: string) {
    if (!email) return 'Participant'

    const localPart = email.split('@')[0] ?? ''
    const segments = localPart
        .split(/[._-]+/)
        .map(segment => segment.trim())
        .filter(Boolean)

    if (segments.length === 0) return 'Participant'

    return segments
        .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(' ')
}

function getWorkspaceRoleLabel(role: ReturnType<typeof useAuth>['workspaceRole']) {
    if (role === 'provider') return 'Provider workspace'
    if (role === 'hybrid') return 'Hybrid workspace'
    return 'Buyer workspace'
}

function getToneLabel(tone: 'healthy' | 'monitoring' | 'scheduled') {
    if (tone === 'monitoring') return 'Monitoring'
    if (tone === 'scheduled') return 'Scheduled'
    return 'Healthy'
}

function getSignalToneMeta(tone: 'healthy' | 'monitoring' | 'scheduled' | 'success' | 'warn' | 'info' | 'pending') {
    if (tone === 'monitoring' || tone === 'warn' || tone === 'pending') {
        return {
            badgeClassName: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
            dotClassName: 'bg-amber-300',
            textClassName: 'text-amber-200',
            surfaceClassName: 'border-amber-500/25 bg-amber-500/8'
        }
    }

    if (tone === 'scheduled' || tone === 'info') {
        return {
            badgeClassName: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200',
            dotClassName: 'bg-cyan-300',
            textClassName: 'text-cyan-200',
            surfaceClassName: 'border-cyan-500/25 bg-cyan-500/8'
        }
    }

    return {
        badgeClassName: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
        dotClassName: 'bg-emerald-300',
        textClassName: 'text-emerald-200',
        surfaceClassName: 'border-emerald-500/25 bg-emerald-500/8'
    }
}

function getActivityToneMeta(tone: AccountActivityItem['tone']) {
    if (tone === 'security') {
        return {
            badgeClassName: 'border border-amber-500/30 bg-amber-500/10 text-amber-200',
            markerClassName: 'border-amber-500/35 bg-amber-500/10 text-amber-200',
            connectorClassName: 'bg-gradient-to-b from-amber-400/60 to-slate-800'
        }
    }

    if (tone === 'api' || tone === 'profile') {
        return {
            badgeClassName: 'border border-cyan-500/30 bg-cyan-500/10 text-cyan-200',
            markerClassName: 'border-cyan-500/35 bg-cyan-500/10 text-cyan-200',
            connectorClassName: 'bg-gradient-to-b from-cyan-400/60 to-slate-800'
        }
    }

    if (tone === 'invite') {
        return {
            badgeClassName: 'border border-violet-500/30 bg-violet-500/10 text-violet-200',
            markerClassName: 'border-violet-500/35 bg-violet-500/10 text-violet-200',
            connectorClassName: 'bg-gradient-to-b from-violet-400/60 to-slate-800'
        }
    }

    return {
        badgeClassName: 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
        markerClassName: 'border-emerald-500/35 bg-emerald-500/10 text-emerald-200',
        connectorClassName: 'bg-gradient-to-b from-emerald-400/60 to-slate-800'
    }
}
