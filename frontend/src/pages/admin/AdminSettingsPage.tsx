import { useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import { useAuth } from '../../contexts/AuthContext'

type SettingsTabKey =
    | 'autoApproval'
    | 'automationControl'
    | 'aiEngine'
    | 'escrowRules'
    | 'platformLimits'
    | 'notifications'
    | 'accessControl'

type RuleTone = 'green' | 'amber' | 'red'

type AutoApprovalRule = {
    score: string
    action: string
    description: string
    tone: RuleTone
}

type AutomationMode = 'manual' | 'assist' | 'autonomous'
type AutomationEnvironment = 'sandbox' | 'production'
type AutomationRiskTier = 'low' | 'medium' | 'high'
type RouteSeverity = 'low' | 'medium' | 'high' | 'critical'

type RuleMatrixRow = {
    id: string
    scoreRange: string
    action: string
    escalation: string
    sla: string
    active: boolean
}

type ExceptionRow = {
    id: string
    scope: string
    override: string
    reason: string
    expiry: string
    owner: string
}

type AlertRouteRow = {
    id: string
    event: string
    channel: string
    severity: RouteSeverity
    recipients: string
    lastTest: string
}

type AutomationAuditLogItem = {
    id: string
    time: string
    actor: string
    change: string
    impact: string
}

const initialRuleMatrixRows: RuleMatrixRow[] = [
    { id: 'rm-1', scoreRange: '90-100', action: 'Auto Approve', escalation: 'None', sla: 'Instant', active: true },
    { id: 'rm-2', scoreRange: '70-89', action: 'Approve with Audit Flag', escalation: 'Security log', sla: '< 5 min', active: true },
    { id: 'rm-3', scoreRange: '50-69', action: 'Manual Review Queue', escalation: 'Reviewer assigned', sla: '< 30 min', active: true },
    { id: 'rm-4', scoreRange: '30-49', action: 'Auto Quarantine', escalation: 'Compliance ping', sla: 'Immediate', active: true },
    { id: 'rm-5', scoreRange: '0-29', action: 'Auto Block & Notify', escalation: 'Incident response', sla: 'Immediate', active: true }
]

const initialExceptionRows: ExceptionRow[] = [
    {
        id: 'exc-001',
        scope: 'Provider: anon_provider_003',
        override: 'Force manual review for all uploads',
        reason: 'Active remediation program',
        expiry: '2026-05-01',
        owner: 'security_admin'
    },
    {
        id: 'exc-002',
        scope: 'Dataset: Clinical Outcomes Delta',
        override: 'Disallow auto-release',
        reason: 'High sensitivity and recurring disputes',
        expiry: '2026-06-15',
        owner: 'compliance_admin'
    },
    {
        id: 'exc-003',
        scope: 'Buyer: part_anon_017',
        override: 'Skip sandbox autopolicies',
        reason: 'Trusted pilot partner',
        expiry: '2026-04-20',
        owner: 'super_admin'
    }
]

const initialAlertRoutes: AlertRouteRow[] = [
    {
        id: 'route-1',
        event: 'Auto Block Triggered',
        channel: 'SIEM',
        severity: 'critical',
        recipients: 'sec_lead@redoubt.io',
        lastTest: '2026-03-24 08:41 UTC'
    },
    {
        id: 'route-2',
        event: 'Dispute Escalated',
        channel: 'Slack',
        severity: 'high',
        recipients: '#trust-ops',
        lastTest: '2026-03-24 07:58 UTC'
    },
    {
        id: 'route-3',
        event: 'Release Queue Backlog',
        channel: 'Email',
        severity: 'medium',
        recipients: 'ops@redoubt.io',
        lastTest: '2026-03-24 06:09 UTC'
    },
    {
        id: 'route-4',
        event: 'Model Drift Advisory',
        channel: 'Webhook',
        severity: 'low',
        recipients: 'https://siem.redoubt.io/webhook',
        lastTest: '2026-03-23 19:22 UTC'
    }
]

const automationAuditLog: AutomationAuditLogItem[] = [
    {
        id: 'log-1',
        time: '2026-03-24 09:21 UTC',
        actor: 'admin_001',
        change: 'Updated escrow auto-release policy to business-hours only',
        impact: '12 release jobs deferred to next execution window'
    },
    {
        id: 'log-2',
        time: '2026-03-24 07:11 UTC',
        actor: 'admin_003',
        change: 'Added provider exception for anon_provider_003',
        impact: 'New uploads from provider now route to manual review'
    },
    {
        id: 'log-3',
        time: '2026-03-23 18:52 UTC',
        actor: 'admin_002',
        change: 'Enabled circuit breaker for high-risk region transfers',
        impact: '4 transactions held for compliance approval'
    }
]

const settingsTabs: Array<{ key: SettingsTabKey; label: string; icon: string }> = [
    {
        key: 'autoApproval',
        label: 'Auto-Approval Rules',
        icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
    },
    {
        key: 'automationControl',
        label: 'Automation Control Center',
        icon: 'M4 7h16M4 12h10M4 17h16M16 10v4m0 0l-2-2m2 2l2-2'
    },
    {
        key: 'aiEngine',
        label: 'AI Engine',
        icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
    },
    {
        key: 'escrowRules',
        label: 'Escrow Rules',
        icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
    },
    {
        key: 'platformLimits',
        label: 'Platform Limits',
        icon: 'M3 6h18M7 12h10M10 18h4'
    },
    {
        key: 'notifications',
        label: 'Notifications',
        icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
    },
    {
        key: 'accessControl',
        label: 'Admin Access Control',
        icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z'
    }
]

const autoApprovalRules: AutoApprovalRule[] = [
    {
        score: '90-100',
        action: 'Auto Approve',
        description: 'Dataset approved and published automatically',
        tone: 'green'
    },
    {
        score: '70-89',
        action: 'Auto Approve with Log',
        description: 'Approved but flagged in audit trail for review',
        tone: 'green'
    },
    {
        score: '50-69',
        action: 'Flag for Manual Review',
        description: 'Admin notification sent, hold for review',
        tone: 'amber'
    },
    {
        score: '30-49',
        action: 'Auto Quarantine',
        description: 'Dataset quarantined, provider notified automatically',
        tone: 'red'
    },
    {
        score: '0-29',
        action: 'Auto Block & Notify',
        description: 'Dataset blocked, provider and compliance team notified immediately',
        tone: 'red'
    }
]

const ruleBadgeClasses: Record<RuleTone, string> = {
    green: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
    amber: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
    red: 'border-red-500/40 bg-red-500/10 text-red-200'
}

const routeSeverityClasses: Record<RouteSeverity, string> = {
    low: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
    medium: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200',
    high: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
    critical: 'border-red-500/40 bg-red-500/10 text-red-200'
}

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
    return (
        <section className="rounded-xl border border-slate-800/60 bg-slate-900/60 backdrop-blur-xl p-5 shadow-2xl shadow-black/30">
            <div className="mb-4">
                <h2 className="text-xl font-semibold text-slate-100">{title}</h2>
                {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
            </div>
            {children}
        </section>
    )
}

export default function AdminSettingsPage() {
    const { isAuthenticated } = useAuth()
    const [activeTab, setActiveTab] = useState<SettingsTabKey>('autoApproval')
    const [automationEnabled, setAutomationEnabled] = useState(true)
    const [automationMode, setAutomationMode] = useState<AutomationMode>('assist')
    const [automationEnvironment, setAutomationEnvironment] = useState<AutomationEnvironment>('sandbox')
    const [ruleMatrixRows, setRuleMatrixRows] = useState<RuleMatrixRow[]>(initialRuleMatrixRows)
    const [pauseAutoRelease, setPauseAutoRelease] = useState(false)
    const [forceManualReview, setForceManualReview] = useState(false)
    const [blockHighRiskRegions, setBlockHighRiskRegions] = useState(true)
    const [requireDualApproval, setRequireDualApproval] = useState(true)
    const [runFrequency, setRunFrequency] = useState('Hourly')
    const [runTimezone, setRunTimezone] = useState('UTC')
    const [businessHoursOnly, setBusinessHoursOnly] = useState(true)
    const [blackoutInput, setBlackoutInput] = useState('Fri 22:00-23:59 UTC')
    const [blackoutWindows, setBlackoutWindows] = useState<string[]>([
        'Sat 00:00-03:00 UTC',
        'Month-end 23:00-23:59 UTC'
    ])
    const [exceptionRows, setExceptionRows] = useState<ExceptionRow[]>(initialExceptionRows)
    const [alertRoutes, setAlertRoutes] = useState<AlertRouteRow[]>(initialAlertRoutes)
    const [simulationConfidence, setSimulationConfidence] = useState(84)
    const [simulationRisk, setSimulationRisk] = useState<AutomationRiskTier>('medium')
    const [simulationDisputeFlag, setSimulationDisputeFlag] = useState(false)
    const [simulationTrustScore, setSimulationTrustScore] = useState(76)
    const [isDirty, setIsDirty] = useState(false)
    const [lastSavedAt, setLastSavedAt] = useState('Never')
    const [validationMessage, setValidationMessage] = useState<string | null>(null)

    if (!isAuthenticated) return <Navigate to="/admin/login" replace />

    const markDirty = () => {
        setIsDirty(true)
        setValidationMessage(null)
    }

    const updateRuleMatrixRow = (id: string, patch: Partial<RuleMatrixRow>) => {
        setRuleMatrixRows(prev => prev.map(row => (row.id === id ? { ...row, ...patch } : row)))
        markDirty()
    }

    const moveRuleMatrixRow = (id: string, direction: 'up' | 'down') => {
        setRuleMatrixRows(prev => {
            const index = prev.findIndex(row => row.id === id)
            if (index < 0) return prev
            const targetIndex = direction === 'up' ? index - 1 : index + 1
            if (targetIndex < 0 || targetIndex >= prev.length) return prev
            const next = [...prev]
            const [moved] = next.splice(index, 1)
            next.splice(targetIndex, 0, moved)
            return next
        })
        markDirty()
    }

    const updateAlertRouteRow = (id: string, patch: Partial<AlertRouteRow>) => {
        setAlertRoutes(prev => prev.map(route => (route.id === id ? { ...route, ...patch } : route)))
        markDirty()
    }

    const updateExceptionRow = (id: string, patch: Partial<ExceptionRow>) => {
        setExceptionRows(prev => prev.map(row => (row.id === id ? { ...row, ...patch } : row)))
        markDirty()
    }

    const validationIssues = useMemo(() => {
        const issues: string[] = []
        if (automationEnvironment === 'production' && !requireDualApproval) {
            issues.push('Production mode requires dual admin approval.')
        }
        if (automationEnabled && automationMode === 'autonomous' && forceManualReview) {
            issues.push('Force manual review conflicts with Autonomous mode.')
        }
        if (automationEnabled && ruleMatrixRows.every(row => !row.active)) {
            issues.push('At least one matrix rule must stay active when automation is enabled.')
        }
        if (alertRoutes.some(route => route.recipients.trim().length === 0)) {
            issues.push('Each alert route must include at least one recipient endpoint.')
        }
        return issues
    }, [alertRoutes, automationEnabled, automationEnvironment, automationMode, forceManualReview, requireDualApproval, ruleMatrixRows])

    const simulatorOutcome = useMemo(() => {
        if (!automationEnabled || automationMode === 'manual') {
            return { label: 'Manual Review Queue', tone: 'amber' as RuleTone, detail: 'Automation disabled or manual mode selected.' }
        }
        if (forceManualReview) {
            return { label: 'Manual Review Queue', tone: 'amber' as RuleTone, detail: 'Circuit breaker forced manual routing.' }
        }
        if (simulationDisputeFlag || simulationRisk === 'high') {
            return { label: 'Auto Quarantine', tone: 'red' as RuleTone, detail: 'High-risk or disputed payload detected.' }
        }
        if (simulationConfidence >= 90 && simulationTrustScore >= 80 && simulationRisk === 'low') {
            return { label: 'Auto Approve', tone: 'green' as RuleTone, detail: 'Confidence and trust thresholds satisfied.' }
        }
        if (simulationConfidence >= 70 && simulationTrustScore >= 65) {
            return { label: 'Approve with Audit Flag', tone: 'green' as RuleTone, detail: 'Approved with elevated audit trace.' }
        }
        if (simulationConfidence >= 50) {
            return { label: 'Manual Review Queue', tone: 'amber' as RuleTone, detail: 'Confidence needs analyst confirmation.' }
        }
        return { label: 'Auto Block & Notify', tone: 'red' as RuleTone, detail: 'Confidence below minimum policy threshold.' }
    }, [automationEnabled, automationMode, forceManualReview, simulationConfidence, simulationDisputeFlag, simulationRisk, simulationTrustScore])

    const activeRuleCount = useMemo(() => ruleMatrixRows.filter(row => row.active).length, [ruleMatrixRows])
    const breakerTripCount = useMemo(
        () => [pauseAutoRelease, forceManualReview].filter(Boolean).length,
        [forceManualReview, pauseAutoRelease]
    )

    const handleAddBlackoutWindow = () => {
        const windowValue = blackoutInput.trim()
        if (!windowValue) return
        setBlackoutWindows(prev => [...prev, windowValue])
        setBlackoutInput('')
        markDirty()
    }

    const handleRunValidation = () => {
        if (validationIssues.length === 0) {
            setValidationMessage('Validation passed. No policy conflicts detected.')
            return
        }
        setValidationMessage(`Validation found ${validationIssues.length} issue(s): ${validationIssues.join(' ')}`)
    }

    const handleDiscardChanges = () => {
        setRuleMatrixRows(initialRuleMatrixRows)
        setExceptionRows(initialExceptionRows)
        setAlertRoutes(initialAlertRoutes)
        setAutomationEnabled(true)
        setAutomationMode('assist')
        setAutomationEnvironment('sandbox')
        setPauseAutoRelease(false)
        setForceManualReview(false)
        setBlockHighRiskRegions(true)
        setRequireDualApproval(true)
        setRunFrequency('Hourly')
        setRunTimezone('UTC')
        setBusinessHoursOnly(true)
        setBlackoutInput('Fri 22:00-23:59 UTC')
        setBlackoutWindows(['Sat 00:00-03:00 UTC', 'Month-end 23:00-23:59 UTC'])
        setValidationMessage('Changes discarded.')
        setIsDirty(false)
    }

    const handleSaveDraft = () => {
        const now = new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC'
        setLastSavedAt(now)
        setValidationMessage('Draft saved locally.')
        setIsDirty(false)
    }

    const handlePublishPolicies = () => {
        if (validationIssues.length > 0) {
            setValidationMessage(`Cannot publish until conflicts are resolved: ${validationIssues.join(' ')}`)
            return
        }
        const now = new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC'
        setLastSavedAt(now)
        setValidationMessage('Automation policies published.')
        setIsDirty(false)
    }

    const renderTabContent = () => {
        if (activeTab === 'autoApproval') {
            return (
                <SectionCard
                    title="AI Decision Automation"
                    subtitle="Set confidence thresholds for automatic decisions"
                >
                    <div className="space-y-3">
                        {autoApprovalRules.map(rule => (
                            <div key={`${rule.score}-${rule.action}`} className="rounded-lg border border-slate-800/80 bg-slate-950/45 p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <span className="inline-flex items-center rounded-md border border-slate-700/70 bg-slate-900/70 px-2.5 py-1 text-[11px] font-mono text-slate-200">
                                            {rule.score}
                                        </span>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-100">{rule.action}</p>
                                            <p className="mt-1 text-xs text-slate-400 leading-relaxed max-w-2xl">{rule.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] font-semibold tracking-wider ${ruleBadgeClasses[rule.tone]}`}>
                                            ACTIVE
                                        </span>
                                        <button className="rounded-md border border-cyan-500/40 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-semibold text-cyan-200 hover:bg-cyan-500/20 transition-colors">
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-5 rounded-lg border border-slate-800/80 bg-slate-950/45 p-4">
                        <p className="text-sm font-medium text-slate-200">Daily automation summary:</p>
                        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
                            <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
                                <p className="text-[10px] uppercase tracking-[0.12em] text-emerald-200/80">Auto approved today</p>
                                <p className="mt-1 text-lg font-semibold text-emerald-200">782</p>
                            </div>
                            <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2">
                                <p className="text-[10px] uppercase tracking-[0.12em] text-amber-200/80">Flagged for review</p>
                                <p className="mt-1 text-lg font-semibold text-amber-200">42</p>
                            </div>
                            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2">
                                <p className="text-[10px] uppercase tracking-[0.12em] text-red-200/80">Auto quarantined</p>
                                <p className="mt-1 text-lg font-semibold text-red-200">16</p>
                            </div>
                            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2">
                                <p className="text-[10px] uppercase tracking-[0.12em] text-red-200/80">Auto blocked</p>
                                <p className="mt-1 text-lg font-semibold text-red-200">7</p>
                            </div>
                        </div>
                        <button className="mt-4 rounded-md border border-cyan-500/50 bg-cyan-500/15 px-4 py-2 text-[11px] font-semibold text-cyan-200 hover:bg-cyan-500/25 transition-colors">
                            Save Rules
                        </button>
                    </div>
                </SectionCard>
            )
        }

        if (activeTab === 'automationControl') {
            return (
                <SectionCard
                    title="Automation Control Center"
                    subtitle="Configure autonomous policy execution, safeguards, schedules, and rollback controls."
                >
                    <div className="space-y-5">
                        <section className="rounded-lg border border-slate-800/80 bg-slate-950/45 p-4">
                            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Master Controls</p>
                                    <h3 className="mt-1 text-sm font-semibold text-slate-100">Automation Runtime</h3>
                                    <p className="mt-1 max-w-xl text-xs text-slate-400">
                                        Manage global automation state, execution mode, and environment guardrails before publishing.
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <button
                                        onClick={() => {
                                            setAutomationEnabled(prev => !prev)
                                            markDirty()
                                        }}
                                        className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                                            automationEnabled
                                                ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-200'
                                                : 'border-slate-700 bg-slate-900 text-slate-300'
                                        }`}
                                    >
                                        {automationEnabled ? 'Automation ON' : 'Automation OFF'}
                                    </button>
                                    <select
                                        value={automationMode}
                                        onChange={event => {
                                            setAutomationMode(event.target.value as AutomationMode)
                                            markDirty()
                                        }}
                                        className="rounded-md border border-slate-700/80 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/70"
                                    >
                                        <option value="manual">Manual</option>
                                        <option value="assist">Assist</option>
                                        <option value="autonomous">Autonomous</option>
                                    </select>
                                    <div className="inline-flex rounded-md border border-slate-700/80 bg-slate-900/70 p-1">
                                        {(['sandbox', 'production'] as AutomationEnvironment[]).map(env => (
                                            <button
                                                key={env}
                                                onClick={() => {
                                                    setAutomationEnvironment(env)
                                                    markDirty()
                                                }}
                                                className={`rounded px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                                                    automationEnvironment === env
                                                        ? env === 'production'
                                                            ? 'bg-red-500/20 text-red-200'
                                                            : 'bg-cyan-500/20 text-cyan-200'
                                                        : 'text-slate-400'
                                                }`}
                                            >
                                                {env}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            <div className="rounded-lg border border-slate-800/80 bg-slate-950/45 p-4">
                                <h3 className="text-sm font-semibold text-slate-100">Dry-Run Simulator</h3>
                                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <label className="text-xs text-slate-400">
                                        Confidence
                                        <input
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={simulationConfidence}
                                            onChange={event => {
                                                setSimulationConfidence(Number(event.target.value))
                                                markDirty()
                                            }}
                                            className="mt-1 w-full rounded-md border border-slate-700/80 bg-slate-900 px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/70"
                                        />
                                    </label>
                                    <label className="text-xs text-slate-400">
                                        Trust Score
                                        <input
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={simulationTrustScore}
                                            onChange={event => {
                                                setSimulationTrustScore(Number(event.target.value))
                                                markDirty()
                                            }}
                                            className="mt-1 w-full rounded-md border border-slate-700/80 bg-slate-900 px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/70"
                                        />
                                    </label>
                                    <label className="text-xs text-slate-400">
                                        Risk Tier
                                        <select
                                            value={simulationRisk}
                                            onChange={event => {
                                                setSimulationRisk(event.target.value as AutomationRiskTier)
                                                markDirty()
                                            }}
                                            className="mt-1 w-full rounded-md border border-slate-700/80 bg-slate-900 px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/70"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </label>
                                    <label className="flex items-center gap-2 rounded-md border border-slate-800/80 bg-slate-900/60 px-2 py-2 text-xs text-slate-300">
                                        <input
                                            type="checkbox"
                                            checked={simulationDisputeFlag}
                                            onChange={event => {
                                                setSimulationDisputeFlag(event.target.checked)
                                                markDirty()
                                            }}
                                        />
                                        Dispute flag present
                                    </label>
                                </div>
                                <div className={`mt-3 rounded-md border px-3 py-2 ${ruleBadgeClasses[simulatorOutcome.tone]}`}>
                                    <p className="text-[10px] uppercase tracking-[0.12em]">Simulated Outcome</p>
                                    <p className="mt-1 text-sm font-semibold">{simulatorOutcome.label}</p>
                                    <p className="mt-1 text-xs">{simulatorOutcome.detail}</p>
                                </div>
                            </div>

                            <div className="rounded-lg border border-slate-800/80 bg-slate-950/45 p-4">
                                <h3 className="text-sm font-semibold text-slate-100">Guardrails</h3>
                                <div className="mt-3 space-y-2 text-xs">
                                    {[
                                        {
                                            key: 'pauseAutoRelease',
                                            label: 'Pause auto-release queue',
                                            hint: 'Holds payout execution until manually resumed.',
                                            value: pauseAutoRelease,
                                            setter: setPauseAutoRelease
                                        },
                                        {
                                            key: 'forceManualReview',
                                            label: 'Force manual review mode',
                                            hint: 'Overrides autonomous actions for all new events.',
                                            value: forceManualReview,
                                            setter: setForceManualReview
                                        },
                                        {
                                            key: 'blockHighRiskRegions',
                                            label: 'Block high-risk region transfer',
                                            hint: 'Stops cross-region release flows above policy risk.',
                                            value: blockHighRiskRegions,
                                            setter: setBlockHighRiskRegions
                                        },
                                        {
                                            key: 'requireDualApproval',
                                            label: 'Require two-admin approval',
                                            hint: 'Mandatory for production policy updates.',
                                            value: requireDualApproval,
                                            setter: setRequireDualApproval
                                        }
                                    ].map(item => (
                                        <div key={item.key} className="rounded-md border border-slate-800/70 bg-slate-900/60 px-3 py-2">
                                            <div className="flex items-center justify-between gap-3">
                                                <div>
                                                    <p className="text-sm text-slate-200">{item.label}</p>
                                                    <p className="mt-0.5 text-[11px] text-slate-500">{item.hint}</p>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        item.setter((prev: boolean) => !prev)
                                                        markDirty()
                                                    }}
                                                    className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                                                        item.value
                                                            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                                                            : 'border-slate-700 text-slate-400'
                                                    }`}
                                                >
                                                    {item.value ? 'On' : 'Off'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <section className="rounded-lg border border-slate-800/80 bg-slate-950/45 p-4">
                            <h3 className="text-sm font-semibold text-slate-100">Schedule & Execution Windows</h3>
                            <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
                                <label className="text-xs text-slate-400">
                                    Frequency
                                    <select
                                        value={runFrequency}
                                        onChange={event => {
                                            setRunFrequency(event.target.value)
                                            markDirty()
                                        }}
                                        className="mt-1 w-full rounded-md border border-slate-700/80 bg-slate-900 px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/70"
                                    >
                                        <option>Every 15 min</option>
                                        <option>Hourly</option>
                                        <option>Every 4 hours</option>
                                        <option>Daily</option>
                                    </select>
                                </label>
                                <label className="text-xs text-slate-400">
                                    Timezone
                                    <select
                                        value={runTimezone}
                                        onChange={event => {
                                            setRunTimezone(event.target.value)
                                            markDirty()
                                        }}
                                        className="mt-1 w-full rounded-md border border-slate-700/80 bg-slate-900 px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/70"
                                    >
                                        <option>UTC</option>
                                        <option>America/New_York</option>
                                        <option>Asia/Dhaka</option>
                                        <option>Europe/London</option>
                                    </select>
                                </label>
                                <label className="flex items-center gap-2 rounded-md border border-slate-800/80 bg-slate-900/60 px-3 py-2 text-xs text-slate-300">
                                    <input
                                        type="checkbox"
                                        checked={businessHoursOnly}
                                        onChange={event => {
                                            setBusinessHoursOnly(event.target.checked)
                                            markDirty()
                                        }}
                                    />
                                    Business hours only
                                </label>
                            </div>
                            <div className="mt-3 rounded-md border border-slate-800/80 bg-slate-900/60 p-3">
                                <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Blackout Windows</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {blackoutWindows.map(windowValue => (
                                        <span key={windowValue} className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] text-amber-200">
                                            {windowValue}
                                            <button
                                                onClick={() => {
                                                    setBlackoutWindows(prev => prev.filter(item => item !== windowValue))
                                                    markDirty()
                                                }}
                                                className="text-amber-100 hover:text-white"
                                            >
                                                x
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <input
                                        value={blackoutInput}
                                        onChange={event => setBlackoutInput(event.target.value)}
                                        placeholder="Add blackout window"
                                        className="w-full max-w-sm rounded-md border border-slate-700/80 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/70"
                                    />
                                    <button
                                        onClick={handleAddBlackoutWindow}
                                        className="rounded-md border border-cyan-500/50 bg-cyan-500/15 px-3 py-1.5 text-[10px] font-semibold text-cyan-200 hover:bg-cyan-500/25 transition-colors"
                                    >
                                        Add Window
                                    </button>
                                </div>
                            </div>
                        </section>

                        <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                            <div className="xl:col-span-2 rounded-lg border border-slate-800/80 bg-slate-950/45 p-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-slate-100">Rule Matrix Editor</h3>
                                    <button
                                        onClick={() => {
                                            setRuleMatrixRows(prev => [
                                                ...prev,
                                                {
                                                    id: `rm-${prev.length + 1}`,
                                                    scoreRange: '40-59',
                                                    action: 'Manual Review Queue',
                                                    escalation: 'Reviewer assigned',
                                                    sla: '< 30 min',
                                                    active: true
                                                }
                                            ])
                                            markDirty()
                                        }}
                                        className="rounded-md border border-cyan-500/40 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-semibold text-cyan-200 hover:bg-cyan-500/20 transition-colors"
                                    >
                                        Add Rule
                                    </button>
                                </div>
                                <div className="mt-3 overflow-x-auto rounded-lg border border-slate-800/80">
                                    <table className="w-full min-w-[760px]">
                                        <thead className="bg-slate-950/70">
                                            <tr className="text-[10px] uppercase tracking-[0.12em] text-slate-500">
                                                <th className="px-3 py-2 text-left">Score</th>
                                                <th className="px-3 py-2 text-left">Action</th>
                                                <th className="px-3 py-2 text-left">Escalation</th>
                                                <th className="px-3 py-2 text-left">SLA</th>
                                                <th className="px-3 py-2 text-left">Status</th>
                                                <th className="px-3 py-2 text-right">Order</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/70 text-xs text-slate-200">
                                            {ruleMatrixRows.map((row, index) => (
                                                <tr key={row.id}>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            value={row.scoreRange}
                                                            onChange={event => updateRuleMatrixRow(row.id, { scoreRange: event.target.value })}
                                                            className="w-24 rounded-md border border-slate-700/80 bg-slate-900 px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/70"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <select
                                                            value={row.action}
                                                            onChange={event => updateRuleMatrixRow(row.id, { action: event.target.value })}
                                                            className="rounded-md border border-slate-700/80 bg-slate-900 px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/70"
                                                        >
                                                            <option>Auto Approve</option>
                                                            <option>Approve with Audit Flag</option>
                                                            <option>Manual Review Queue</option>
                                                            <option>Auto Quarantine</option>
                                                            <option>Auto Block & Notify</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <select
                                                            value={row.escalation}
                                                            onChange={event => updateRuleMatrixRow(row.id, { escalation: event.target.value })}
                                                            className="rounded-md border border-slate-700/80 bg-slate-900 px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/70"
                                                        >
                                                            <option>None</option>
                                                            <option>Security log</option>
                                                            <option>Reviewer assigned</option>
                                                            <option>Compliance ping</option>
                                                            <option>Incident response</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <select
                                                            value={row.sla}
                                                            onChange={event => updateRuleMatrixRow(row.id, { sla: event.target.value })}
                                                            className="rounded-md border border-slate-700/80 bg-slate-900 px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/70"
                                                        >
                                                            <option>Instant</option>
                                                            <option>{'< 5 min'}</option>
                                                            <option>{'< 30 min'}</option>
                                                            <option>{'< 2 hours'}</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <button
                                                            onClick={() => updateRuleMatrixRow(row.id, { active: !row.active })}
                                                            className={`rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                                                                row.active
                                                                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                                                                    : 'border-slate-700 text-slate-400'
                                                            }`}
                                                        >
                                                            {row.active ? 'Active' : 'Disabled'}
                                                        </button>
                                                    </td>
                                                    <td className="px-3 py-2 text-right">
                                                        <div className="inline-flex gap-1">
                                                            <button
                                                                disabled={index === 0}
                                                                onClick={() => moveRuleMatrixRow(row.id, 'up')}
                                                                className="rounded-md border border-slate-700/80 bg-slate-900 px-2 py-1 text-[10px] text-slate-200 disabled:opacity-40"
                                                            >
                                                                Up
                                                            </button>
                                                            <button
                                                                disabled={index === ruleMatrixRows.length - 1}
                                                                onClick={() => moveRuleMatrixRow(row.id, 'down')}
                                                                className="rounded-md border border-slate-700/80 bg-slate-900 px-2 py-1 text-[10px] text-slate-200 disabled:opacity-40"
                                                            >
                                                                Down
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="rounded-lg border border-slate-800/80 bg-slate-950/45 p-4">
                                <h3 className="text-sm font-semibold text-slate-100">Policy Health</h3>
                                <div className="mt-3 space-y-2 text-xs">
                                    <div className="flex items-center justify-between rounded-md border border-slate-800/70 bg-slate-900/60 px-3 py-2">
                                        <span className="text-slate-400">Rules active</span>
                                        <span className="font-semibold text-slate-100">{activeRuleCount}</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-md border border-slate-800/70 bg-slate-900/60 px-3 py-2">
                                        <span className="text-slate-400">Conflict checks</span>
                                        <span className={`font-semibold ${validationIssues.length === 0 ? 'text-emerald-200' : 'text-amber-200'}`}>
                                            {validationIssues.length === 0 ? 'Clean' : `${validationIssues.length} issue(s)`}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-md border border-slate-800/70 bg-slate-900/60 px-3 py-2">
                                        <span className="text-slate-400">Circuit breakers</span>
                                        <span className={`font-semibold ${breakerTripCount === 0 ? 'text-emerald-200' : 'text-amber-200'}`}>
                                            {breakerTripCount === 0 ? 'Nominal' : `${breakerTripCount} tripped`}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-md border border-slate-800/70 bg-slate-900/60 px-3 py-2">
                                        <span className="text-slate-400">Last saved</span>
                                        <span className="font-mono text-slate-300">{lastSavedAt}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleRunValidation}
                                    className="mt-3 rounded-md border border-cyan-500/50 bg-cyan-500/15 px-3 py-1.5 text-[10px] font-semibold text-cyan-200 hover:bg-cyan-500/25 transition-colors"
                                >
                                    Validate Policies
                                </button>
                                {validationIssues.length > 0 && (
                                    <div className="mt-3 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2">
                                        <p className="text-[10px] uppercase tracking-[0.12em] text-amber-200/80">Open Issues</p>
                                        <div className="mt-1 space-y-1">
                                            {validationIssues.map(issue => (
                                                <p key={issue} className="text-xs text-amber-200">{issue}</p>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                            <div className="rounded-lg border border-slate-800/80 bg-slate-950/45 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <h3 className="text-sm font-semibold text-slate-100">Exception List</h3>
                                    <button
                                        onClick={() => {
                                            setExceptionRows(prev => [
                                                ...prev,
                                                {
                                                    id: `exc-${String(prev.length + 1).padStart(3, '0')}`,
                                                    scope: 'New scope',
                                                    override: 'Manual review required',
                                                    reason: 'Temporary exception',
                                                    expiry: '2026-12-31',
                                                    owner: 'admin_pending'
                                                }
                                            ])
                                            markDirty()
                                        }}
                                        className="rounded-md border border-cyan-500/40 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-semibold text-cyan-200 hover:bg-cyan-500/20 transition-colors"
                                    >
                                        Add Exception
                                    </button>
                                </div>
                                <div className="mt-3 space-y-2">
                                    {exceptionRows.map(row => (
                                        <div key={row.id} className="rounded-md border border-slate-800/70 bg-slate-900/60 p-3">
                                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                                <label className="text-[11px] text-slate-400">
                                                    Scope
                                                    <input
                                                        value={row.scope}
                                                        onChange={event => updateExceptionRow(row.id, { scope: event.target.value })}
                                                        className="mt-1 w-full rounded-md border border-slate-700/80 bg-slate-950 px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/70"
                                                    />
                                                </label>
                                                <label className="text-[11px] text-slate-400">
                                                    Override
                                                    <input
                                                        value={row.override}
                                                        onChange={event => updateExceptionRow(row.id, { override: event.target.value })}
                                                        className="mt-1 w-full rounded-md border border-slate-700/80 bg-slate-950 px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/70"
                                                    />
                                                </label>
                                                <label className="text-[11px] text-slate-400">
                                                    Reason
                                                    <input
                                                        value={row.reason}
                                                        onChange={event => updateExceptionRow(row.id, { reason: event.target.value })}
                                                        className="mt-1 w-full rounded-md border border-slate-700/80 bg-slate-950 px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/70"
                                                    />
                                                </label>
                                                <label className="text-[11px] text-slate-400">
                                                    Expiry
                                                    <input
                                                        value={row.expiry}
                                                        onChange={event => updateExceptionRow(row.id, { expiry: event.target.value })}
                                                        className="mt-1 w-full rounded-md border border-slate-700/80 bg-slate-950 px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/70"
                                                    />
                                                </label>
                                            </div>
                                            <div className="mt-2 flex items-center justify-between">
                                                <p className="text-[11px] text-slate-500">Owner: {row.owner}</p>
                                                <button
                                                    onClick={() => {
                                                        setExceptionRows(prev => prev.filter(item => item.id !== row.id))
                                                        markDirty()
                                                    }}
                                                    className="rounded-md border border-red-500/40 bg-red-500/10 px-2 py-1 text-[10px] font-semibold text-red-200 hover:bg-red-500/20 transition-colors"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-lg border border-slate-800/80 bg-slate-950/45 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <h3 className="text-sm font-semibold text-slate-100">Alert Routing Builder</h3>
                                    <button
                                        onClick={() => {
                                            setAlertRoutes(prev => [
                                                ...prev,
                                                {
                                                    id: `route-${prev.length + 1}`,
                                                    event: 'New Policy Event',
                                                    channel: 'Email',
                                                    severity: 'medium',
                                                    recipients: 'ops@redoubt.io',
                                                    lastTest: 'Not tested'
                                                }
                                            ])
                                            markDirty()
                                        }}
                                        className="rounded-md border border-cyan-500/40 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-semibold text-cyan-200 hover:bg-cyan-500/20 transition-colors"
                                    >
                                        Add Route
                                    </button>
                                </div>
                                <div className="mt-3 space-y-2">
                                    {alertRoutes.map(route => (
                                        <div key={route.id} className="rounded-md border border-slate-800/70 bg-slate-900/60 p-3">
                                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                                <label className="text-[11px] text-slate-400">
                                                    Event
                                                    <input
                                                        value={route.event}
                                                        onChange={event => updateAlertRouteRow(route.id, { event: event.target.value })}
                                                        className="mt-1 w-full rounded-md border border-slate-700/80 bg-slate-950 px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/70"
                                                    />
                                                </label>
                                                <label className="text-[11px] text-slate-400">
                                                    Channel
                                                    <select
                                                        value={route.channel}
                                                        onChange={event => updateAlertRouteRow(route.id, { channel: event.target.value })}
                                                        className="mt-1 w-full rounded-md border border-slate-700/80 bg-slate-950 px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/70"
                                                    >
                                                        <option>Email</option>
                                                        <option>Slack</option>
                                                        <option>Webhook</option>
                                                        <option>SIEM</option>
                                                        <option>PagerDuty</option>
                                                    </select>
                                                </label>
                                                <label className="text-[11px] text-slate-400">
                                                    Severity
                                                    <select
                                                        value={route.severity}
                                                        onChange={event => updateAlertRouteRow(route.id, { severity: event.target.value as RouteSeverity })}
                                                        className="mt-1 w-full rounded-md border border-slate-700/80 bg-slate-950 px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/70"
                                                    >
                                                        <option value="low">low</option>
                                                        <option value="medium">medium</option>
                                                        <option value="high">high</option>
                                                        <option value="critical">critical</option>
                                                    </select>
                                                </label>
                                                <label className="text-[11px] text-slate-400">
                                                    Recipients
                                                    <input
                                                        value={route.recipients}
                                                        onChange={event => updateAlertRouteRow(route.id, { recipients: event.target.value })}
                                                        className="mt-1 w-full rounded-md border border-slate-700/80 bg-slate-950 px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/70"
                                                    />
                                                </label>
                                            </div>
                                            <div className="mt-2 flex items-center justify-between">
                                                <span className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${routeSeverityClasses[route.severity]}`}>
                                                    {route.severity}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[11px] text-slate-500">{route.lastTest}</span>
                                                    <button
                                                        onClick={() => {
                                                            const now = new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC'
                                                            updateAlertRouteRow(route.id, { lastTest: now })
                                                        }}
                                                        className="rounded-md border border-slate-700/80 px-2 py-1 text-[10px] text-slate-300 hover:bg-slate-800/70"
                                                    >
                                                        Test
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                            <div className="lg:col-span-2 rounded-lg border border-slate-800/80 bg-slate-950/45 p-4">
                                <h3 className="text-sm font-semibold text-slate-100">Audit & Version History</h3>
                                <div className="mt-3 space-y-2">
                                    {automationAuditLog.map(item => (
                                        <article key={item.id} className="rounded-md border border-slate-800/70 bg-slate-900/60 px-3 py-2">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <p className="text-xs font-mono text-slate-400">{item.time}</p>
                                                <span className="rounded-md border border-slate-700/80 bg-slate-900 px-2 py-0.5 text-[10px] text-slate-300">
                                                    {item.actor}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-sm text-slate-200">{item.change}</p>
                                            <p className="mt-1 text-xs text-slate-500">{item.impact}</p>
                                        </article>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-lg border border-slate-800/80 bg-slate-950/45 p-4">
                                <h3 className="text-sm font-semibold text-slate-100">Execution Runbook</h3>
                                <div className="mt-3 space-y-2 text-xs text-slate-400">
                                    <div className="rounded-md border border-slate-800/70 bg-slate-900/60 px-3 py-2">
                                        <p className="font-semibold text-slate-200">Preflight Checklist</p>
                                        <p className="mt-1">Validate route endpoints, conflicts, and breaker state before publish.</p>
                                    </div>
                                    <div className="rounded-md border border-slate-800/70 bg-slate-900/60 px-3 py-2">
                                        <p className="font-semibold text-slate-200">Rollback Procedure</p>
                                        <p className="mt-1">Revert to previous policy snapshot and force manual queue in under 2 minutes.</p>
                                    </div>
                                    <div className="rounded-md border border-slate-800/70 bg-slate-900/60 px-3 py-2">
                                        <p className="font-semibold text-slate-200">Incident Drill</p>
                                        <p className="mt-1">Run weekly simulation for high-risk transfer and alert fan-out validation.</p>
                                    </div>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <button className="rounded-md border border-cyan-500/40 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-semibold text-cyan-200 hover:bg-cyan-500/20 transition-colors">
                                        Open Runbook
                                    </button>
                                    <button className="rounded-md border border-slate-700/80 bg-slate-900 px-2.5 py-1 text-[10px] font-semibold text-slate-300 hover:bg-slate-800/70 transition-colors">
                                        View Last Drill
                                    </button>
                                </div>
                            </div>
                        </section>

                        {validationMessage && (
                            <div
                                className={`rounded-md border px-3 py-2 text-xs ${
                                    validationMessage.startsWith('Cannot publish') || validationMessage.startsWith('Validation found')
                                        ? 'border-amber-500/30 bg-amber-500/10 text-amber-200'
                                        : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                                }`}
                            >
                                {validationMessage}
                            </div>
                        )}
                    </div>
                </SectionCard>
            )
        }
        if (activeTab === 'aiEngine') {
            return (
                <SectionCard title="AI Engine Configuration">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="rounded-lg border border-slate-800/80 bg-slate-950/45 p-4 space-y-3">
                            <h3 className="text-sm font-semibold text-slate-100">Model Version</h3>
                            <p className="text-xs text-slate-500">Current: RDT-AI-v2.4.1</p>
                            <select defaultValue="v2.4.1" className="w-full rounded-md border border-slate-700/80 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/70">
                                <option value="v2.4.1">v2.4.1</option>
                                <option value="v2.3.0">v2.3.0</option>
                                <option value="v2.2.0">v2.2.0</option>
                            </select>
                            <button className="rounded-md border border-cyan-500/50 bg-cyan-500/15 px-3 py-2 text-[11px] font-semibold text-cyan-200 hover:bg-cyan-500/25 transition-colors">
                                Update Model
                            </button>
                        </div>

                        <div className="rounded-lg border border-slate-800/80 bg-slate-950/45 p-4 space-y-3">
                            <h3 className="text-sm font-semibold text-slate-100">Scan Sensitivity</h3>
                            <div className="space-y-2 text-sm text-slate-300">
                                <label className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-2">
                                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                    <span>Standard (default)</span>
                                </label>
                                <label className="flex items-center gap-2 rounded-md border border-slate-700/70 bg-slate-900/60 px-2.5 py-2">
                                    <span className="h-2 w-2 rounded-full bg-slate-500" />
                                    <span>High Sensitivity</span>
                                </label>
                                <label className="flex items-center gap-2 rounded-md border border-slate-700/70 bg-slate-900/60 px-2.5 py-2">
                                    <span className="h-2 w-2 rounded-full bg-slate-500" />
                                    <span>Maximum (slower)</span>
                                </label>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Higher sensitivity catches more edge cases but increases scan time
                            </p>
                        </div>

                        <div className="rounded-lg border border-slate-800/80 bg-slate-950/45 p-4 space-y-3">
                            <h3 className="text-sm font-semibold text-slate-100">PHI/PII Detection</h3>
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-200">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                Enabled
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-2">Sensitivity: High</p>
                                <input type="range" min={1} max={3} defaultValue={3} className="w-full accent-cyan-500" />
                                <div className="mt-1 flex justify-between text-[10px] text-slate-500">
                                    <span>Low</span>
                                    <span>Medium</span>
                                    <span>High</span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-slate-800/80 bg-slate-950/45 p-4 space-y-3">
                            <h3 className="text-sm font-semibold text-slate-100">Auto Scan on Upload</h3>
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-200">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                Enabled
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                All datasets scanned immediately upon provider upload
                            </p>
                        </div>
                    </div>

                    <button className="mt-5 rounded-md border border-cyan-500/50 bg-cyan-500/15 px-4 py-2 text-[11px] font-semibold text-cyan-200 hover:bg-cyan-500/25 transition-colors">
                        Save AI Settings
                    </button>
                </SectionCard>
            )
        }
        if (activeTab === 'escrowRules') {
            return (
                <SectionCard title="Escrow Configuration">
                    <div className="space-y-3">
                        <div className="rounded-lg border border-slate-800/80 bg-slate-950/45 p-4">
                            <p className="text-sm font-semibold text-slate-100">Default Escrow Window</p>
                            <select defaultValue="24" className="mt-2 w-full rounded-md border border-slate-700/80 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/70">
                                <option value="24">24 hours (default)</option>
                                <option value="48">48 hours</option>
                                <option value="72">72 hours</option>
                            </select>
                        </div>
                        <div className="rounded-lg border border-slate-800/80 bg-slate-950/45 p-4">
                            <p className="text-sm font-semibold text-slate-100">Auto-release Condition</p>
                            <select defaultValue="expiry" className="mt-2 w-full rounded-md border border-slate-700/80 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/70">
                                <option value="expiry">Window expiry (default)</option>
                                <option value="buyer">Buyer confirmation only</option>
                                <option value="manual">Manual admin release only</option>
                            </select>
                        </div>
                        <div className="rounded-lg border border-slate-800/80 bg-slate-950/45 p-4">
                            <p className="text-sm font-semibold text-slate-100">Dispute Escalation</p>
                            <select defaultValue="auto24" className="mt-2 w-full rounded-md border border-slate-700/80 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/70">
                                <option value="auto24">Auto escalate after 24h</option>
                                <option value="manual">Manual escalation only</option>
                            </select>
                        </div>
                        <div className="rounded-lg border border-slate-800/80 bg-slate-950/45 p-4">
                            <p className="text-sm font-semibold text-slate-100">Escrow Fee</p>
                            <div className="mt-2 flex items-center gap-2">
                                <input defaultValue="10%" className="w-32 rounded-md border border-slate-700/80 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/70" />
                                <span className="text-xs text-slate-500">Applied to all transactions</span>
                            </div>
                        </div>
                    </div>
                    <button className="mt-5 rounded-md border border-cyan-500/50 bg-cyan-500/15 px-4 py-2 text-[11px] font-semibold text-cyan-200 hover:bg-cyan-500/25 transition-colors">
                        Save Escrow Rules
                    </button>
                </SectionCard>
            )
        }

        if (activeTab === 'platformLimits') {
            return (
                <SectionCard title="Platform Configuration">
                    <div className="space-y-3">
                        <div className="rounded-lg border border-slate-800/80 bg-slate-950/45 p-4">
                            <p className="text-sm font-semibold text-slate-100">Max Dataset Size</p>
                            <div className="mt-2 flex items-center gap-2">
                                <input defaultValue="10 GB" className="w-48 rounded-md border border-slate-700/80 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/70" />
                                <span className="text-xs text-slate-500">Per upload limit</span>
                            </div>
                        </div>
                        <div className="rounded-lg border border-slate-800/80 bg-slate-950/45 p-4">
                            <p className="text-sm font-semibold text-slate-100">API Rate Limit</p>
                            <div className="mt-2 flex items-center gap-2">
                                <input defaultValue="100 requests/minute" className="w-64 rounded-md border border-slate-700/80 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/70" />
                                <span className="text-xs text-slate-500">Per participant</span>
                            </div>
                        </div>
                        <div className="rounded-lg border border-slate-800/80 bg-slate-950/45 p-4">
                            <p className="text-sm font-semibold text-slate-100">Max Access Window</p>
                            <div className="mt-2 flex items-center gap-2">
                                <input defaultValue="72 hours" className="w-48 rounded-md border border-slate-700/80 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/70" />
                                <span className="text-xs text-slate-500">Maximum escrow window allowed</span>
                            </div>
                        </div>
                        <div className="rounded-lg border border-slate-800/80 bg-slate-950/45 p-4">
                            <p className="text-sm font-semibold text-slate-100">Max Active Escrows</p>
                            <div className="mt-2 flex items-center gap-2">
                                <input defaultValue="5" className="w-24 rounded-md border border-slate-700/80 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/70" />
                                <span className="text-xs text-slate-500">Per participant simultaneously</span>
                            </div>
                        </div>
                        <div className="rounded-lg border border-slate-800/80 bg-slate-950/45 p-4">
                            <p className="text-sm font-semibold text-slate-100">Session Timeout</p>
                            <div className="mt-2 flex items-center gap-2">
                                <input defaultValue="30 minutes" className="w-40 rounded-md border border-slate-700/80 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/70" />
                                <span className="text-xs text-slate-500">Inactive session auto-logout</span>
                            </div>
                        </div>
                    </div>
                    <button className="mt-5 rounded-md border border-cyan-500/50 bg-cyan-500/15 px-4 py-2 text-[11px] font-semibold text-cyan-200 hover:bg-cyan-500/25 transition-colors">
                        Save Platform Limits
                    </button>
                </SectionCard>
            )
        }

        if (activeTab === 'notifications') {
            return (
                <SectionCard title="Alert & Notification Settings">
                    <div className="space-y-5">
                        <div className="rounded-lg border border-slate-800/80 bg-slate-950/45 p-4">
                            <h3 className="text-sm font-semibold text-slate-100">Alert Thresholds</h3>
                            <div className="mt-3 space-y-2">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="text-xs text-slate-400">Critical alert trigger</span>
                                    <input defaultValue="Score below 30" className="w-56 rounded-md border border-slate-700/80 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/70" />
                                </div>
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="text-xs text-slate-400">Bulk access alert</span>
                                    <input defaultValue="500+ records/minute" className="w-56 rounded-md border border-slate-700/80 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/70" />
                                </div>
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="text-xs text-slate-400">Failed auth alert</span>
                                    <input defaultValue="5 attempts" className="w-56 rounded-md border border-slate-700/80 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/70" />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-slate-800/80 bg-slate-950/45 p-4">
                            <h3 className="text-sm font-semibold text-slate-100">Notification Recipients</h3>
                            <div className="mt-3 space-y-2">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="text-xs text-slate-400">Security Lead</span>
                                    <input defaultValue="sec_lead@redoubt.io" className="w-72 rounded-md border border-slate-700/80 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/70" />
                                </div>
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="text-xs text-slate-400">Compliance Officer</span>
                                    <input defaultValue="compliance@redoubt.io" className="w-72 rounded-md border border-slate-700/80 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/70" />
                                </div>
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="text-xs text-slate-400">Platform Admin</span>
                                    <input defaultValue="admin@redoubt.io" className="w-72 rounded-md border border-slate-700/80 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/70" />
                                </div>
                            </div>
                            <button className="mt-3 rounded-md border border-cyan-500/50 bg-transparent px-3 py-1.5 text-[11px] font-semibold text-cyan-200 hover:bg-cyan-500/10 transition-colors">
                                Add Recipient
                            </button>
                        </div>

                        <div className="rounded-lg border border-slate-800/80 bg-slate-950/45 p-4">
                            <h3 className="text-sm font-semibold text-slate-100">Webhook Endpoints</h3>
                            <div className="mt-3 space-y-2">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="text-xs text-slate-400">SIEM Webhook</span>
                                    <input defaultValue="https://siem.redoubt.io/webhook" className="w-80 rounded-md border border-slate-700/80 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/70" />
                                </div>
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="text-xs text-slate-400">Slack Alert</span>
                                    <input defaultValue="https://hooks.slack.com/..." className="w-80 rounded-md border border-slate-700/80 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/70" />
                                </div>
                            </div>
                            <button className="mt-3 rounded-md border border-slate-600/80 bg-transparent px-3 py-1.5 text-[11px] font-semibold text-slate-200 hover:bg-slate-800/70 transition-colors">
                                Test Webhook
                            </button>
                        </div>
                    </div>
                    <button className="mt-5 rounded-md border border-cyan-500/50 bg-cyan-500/15 px-4 py-2 text-[11px] font-semibold text-cyan-200 hover:bg-cyan-500/25 transition-colors">
                        Save Notification Settings
                    </button>
                </SectionCard>
            )
        }

        return (
            <SectionCard title="Admin Roles & Permissions">
                <div className="rounded-lg border border-slate-800/80 bg-slate-950/45 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-950/60">
                            <tr className="text-[10px] uppercase tracking-[0.12em] text-slate-500">
                                <th className="px-3 py-2 text-left">Role</th>
                                <th className="px-3 py-2 text-left">Permissions</th>
                                <th className="px-3 py-2 text-left">Assigned To</th>
                                <th className="px-3 py-2 text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/70 text-[11px] text-slate-200">
                            <tr><td className="px-3 py-2 font-medium">Super Admin</td><td className="px-3 py-2">Full access</td><td className="px-3 py-2 font-mono">admin_001</td><td className="px-3 py-2"><span className="inline-flex rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-200">Active</span></td></tr>
                            <tr><td className="px-3 py-2 font-medium">Security Admin</td><td className="px-3 py-2">Security + Incidents only</td><td className="px-3 py-2 font-mono">admin_002</td><td className="px-3 py-2"><span className="inline-flex rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-200">Active</span></td></tr>
                            <tr><td className="px-3 py-2 font-medium">Compliance Admin</td><td className="px-3 py-2">Compliance + Audit only</td><td className="px-3 py-2 font-mono">admin_003</td><td className="px-3 py-2"><span className="inline-flex rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-200">Active</span></td></tr>
                        </tbody>
                    </table>
                </div>

                <button className="mt-4 rounded-md border border-cyan-500/50 bg-transparent px-3 py-2 text-[11px] font-semibold text-cyan-200 hover:bg-cyan-500/10 transition-colors">
                    Add Admin Role
                </button>

                <div className="mt-5 space-y-3 rounded-lg border border-slate-800/80 bg-slate-950/45 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm text-slate-200">Admin session timeout</span>
                        <input defaultValue="15 minutes" className="w-40 rounded-md border border-slate-700/80 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/70" />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm text-slate-200">MFA required</span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-200"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />ON</span>
                    </div>
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-sm text-slate-200">IP whitelist</span>
                            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-200"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />ON</span>
                        </div>
                        <input defaultValue="10.15.22.4, 10.15.22.8" className="w-full rounded-md border border-slate-700/80 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/70" />
                    </div>
                </div>

                <button className="mt-5 rounded-md border border-cyan-500/50 bg-cyan-500/15 px-4 py-2 text-[11px] font-semibold text-cyan-200 hover:bg-cyan-500/25 transition-colors">
                    Save Access Settings
                </button>
            </SectionCard>
        )
    }

    return (
        <AdminLayout title="ADMIN SETTINGS" subtitle="SYSTEM CONFIGURATION">
            <div className="space-y-6">
                <section>
                    <h1 className="text-3xl font-semibold text-slate-100 tracking-tight">Admin Settings</h1>
                    <p className="mt-2 text-sm text-slate-400 max-w-3xl">
                        Platform configuration, automation rules, and system preferences
                    </p>
                </section>

                <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                    <aside className="lg:col-span-3 rounded-xl border border-slate-800/60 bg-slate-900/60 p-3 backdrop-blur-xl shadow-2xl shadow-black/30">
                        <div className="space-y-2">
                            {settingsTabs.map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left transition-all ${
                                        activeTab === tab.key
                                            ? 'border-cyan-500/60 bg-cyan-500/15 text-cyan-200'
                                            : 'border-slate-800/70 bg-slate-900/50 text-slate-400 hover:text-slate-200 hover:border-slate-700/80 hover:bg-slate-800/50'
                                    }`}
                                >
                                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                                    </svg>
                                    <span className="text-[11px] font-medium tracking-wide">{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </aside>

                    <div className="lg:col-span-9 space-y-4">
                        {renderTabContent()}
                        {activeTab === 'automationControl' && isDirty && (
                            <div className="sticky bottom-4 z-20 rounded-lg border border-cyan-500/40 bg-slate-950/95 p-3 shadow-2xl shadow-black/50 backdrop-blur-xl">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-200">Unsaved Automation Changes</p>
                                        <p className="mt-1 text-xs text-slate-400">
                                            Review conflicts, save a draft, or publish the current policy set.
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <button
                                            onClick={handleDiscardChanges}
                                            className="rounded-md border border-slate-700/80 bg-slate-900 px-3 py-1.5 text-[10px] font-semibold text-slate-200 hover:bg-slate-800/70 transition-colors"
                                        >
                                            Discard
                                        </button>
                                        <button
                                            onClick={handleSaveDraft}
                                            className="rounded-md border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-[10px] font-semibold text-cyan-200 hover:bg-cyan-500/20 transition-colors"
                                        >
                                            Save Draft
                                        </button>
                                        <button
                                            onClick={handlePublishPolicies}
                                            className="rounded-md border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 text-[10px] font-semibold text-emerald-200 hover:bg-emerald-500/25 transition-colors"
                                        >
                                            Publish
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </AdminLayout>
    )
}

