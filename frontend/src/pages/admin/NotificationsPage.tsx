import { useState, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import { useAuth } from '../../contexts/AuthContext'

type NotificationChannel = 'email' | 'slack' | 'sms' | 'webhook' | 'dashboard'
type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info'
type DigestFrequency = 'realtime' | 'hourly' | 'daily' | 'weekly' | 'monthly'

type EmailDigest = {
    id: string
    name: string
    frequency: DigestFrequency
    recipients: string[]
    enabled: boolean
    lastSent: string
    nextSend: string
    includes: string[]
    type: 'summary' | 'alert' | 'report' | 'audit'
}

type AlertThreshold = {
    id: string
    name: string
    metric: string
    condition: 'above' | 'below' | 'equals'
    threshold: number
    severity: AlertSeverity
    channel: NotificationChannel
    enabled: boolean
    lastTriggered: string
    triggerCount: number
}

type NotificationLog = {
    id: string
    type: 'digest' | 'alert' | 'reminder'
    channel: NotificationChannel
    recipient: string
    subject: string
    sentAt: string
    status: 'sent' | 'failed' | 'pending'
}

type RecipientGroup = {
    id: string
    name: string
    members: number
    type: 'role' | 'team' | 'custom'
    channels: NotificationChannel[]
}

const mockEmailDigests: EmailDigest[] = [
    { id: 'd-001', name: 'Weekly Platform Summary', frequency: 'weekly', recipients: ['admin@redoubt.io', 'ops@redoubt.io'], enabled: true, lastSent: 'Mar 23 9:00 AM', nextSend: 'Mar 30 9:00 AM', includes: ['new_users', 'dataset_uploads', 'incidents', 'compliance_status'], type: 'summary' },
    { id: 'd-002', name: 'Daily Operations Digest', frequency: 'daily', recipients: ['ops-team@redoubt.io'], enabled: true, lastSent: 'Today 6:00 AM', nextSend: 'Tomorrow 6:00 AM', includes: ['service_health', 'job_status', 'alerts'], type: 'summary' },
    { id: 'd-003', name: 'Monthly Compliance Report', frequency: 'monthly', recipients: ['compliance@redoubt.io', 'admin@redoubt.io'], enabled: true, lastSent: 'Mar 1 9:00 AM', nextSend: 'Apr 1 9:00 AM', includes: ['audit_logs', 'access_reviews', 'policy_violations', 'compliance_metrics'], type: 'report' },
    { id: 'd-004', name: 'Real-time Critical Alerts', frequency: 'realtime', recipients: ['oncall@redoubt.io'], enabled: true, lastSent: '3 hours ago', nextSend: 'On trigger', includes: ['critical_incidents', 'security_breaches', 'system_down'], type: 'alert' },
    { id: 'd-005', name: 'Quarterly Business Review', frequency: 'monthly', recipients: ['executive@redoubt.io'], enabled: false, lastSent: 'Feb 1 9:00 AM', nextSend: 'Suspended', includes: ['usage_stats', 'revenue', 'growth_metrics', 'provider_stats'], type: 'report' },
]

const mockAlertThresholds: AlertThreshold[] = [
    { id: 'at-001', name: 'High Error Rate', metric: 'Error Rate', condition: 'above', threshold: 5, severity: 'critical', channel: 'slack', enabled: true, lastTriggered: '2 days ago', triggerCount: 12 },
    { id: 'at-002', name: 'Low Cache Hit Rate', metric: 'Cache Hit Rate', condition: 'below', threshold: 70, severity: 'medium', channel: 'email', enabled: true, lastTriggered: '1 week ago', triggerCount: 3 },
    { id: 'at-003', name: 'API Latency Spike', metric: 'API Latency', condition: 'above', threshold: 500, severity: 'high', channel: 'slack', enabled: true, lastTriggered: '5 hours ago', triggerCount: 8 },
    { id: 'at-004', name: 'Disk Space Low', metric: 'Disk Usage', condition: 'above', threshold: 90, severity: 'high', channel: 'email', enabled: true, lastTriggered: 'Yesterday', triggerCount: 2 },
    { id: 'at-005', name: 'Failed Login Attempts', metric: 'Failed Logins', condition: 'above', threshold: 10, severity: 'medium', channel: 'slack', enabled: true, lastTriggered: '1 day ago', triggerCount: 15 },
    { id: 'at-006', name: 'Trust Score Drop', metric: 'Trust Score', condition: 'below', threshold: 50, severity: 'low', channel: 'dashboard', enabled: false, lastTriggered: 'Never', triggerCount: 0 },
    { id: 'at-007', name: 'Quota Limit Reached', metric: 'API Quota Usage', condition: 'above', threshold: 95, severity: 'high', channel: 'email', enabled: true, lastTriggered: '3 days ago', triggerCount: 6 },
    { id: 'at-008', name: 'New Provider Application', metric: 'Applications', condition: 'equals', threshold: 1, severity: 'info', channel: 'email', enabled: true, lastTriggered: 'Today', triggerCount: 28 },
]

const mockNotificationLogs: NotificationLog[] = [
    { id: 'nl-001', type: 'alert', channel: 'slack', recipient: '#security-alerts', subject: 'Critical: High error rate detected', sentAt: '3 hours ago', status: 'sent' },
    { id: 'nl-002', type: 'digest', channel: 'email', recipient: 'ops-team@redoubt.io', subject: 'Daily Operations Digest - Mar 25', sentAt: '6 hours ago', status: 'sent' },
    { id: 'nl-003', type: 'alert', channel: 'email', recipient: 'admin@redoubt.io', subject: 'Alert: Disk usage above 90%', sentAt: '1 day ago', status: 'sent' },
    { id: 'nl-004', type: 'alert', channel: 'slack', recipient: '#ops-alerts', subject: 'Warning: API latency above threshold', sentAt: '5 hours ago', status: 'sent' },
    { id: 'nl-005', type: 'digest', channel: 'email', recipient: 'compliance@redoubt.io', subject: 'Weekly Platform Summary', sentAt: '2 days ago', status: 'failed' },
    { id: 'nl-006', type: 'reminder', channel: 'email', recipient: 'reviewers@redoubt.io', subject: 'Access Review Reminder', sentAt: '3 days ago', status: 'sent' },
]

const mockRecipientGroups: RecipientGroup[] = [
    { id: 'rg-001', name: 'Platform Admins', members: 3, type: 'role', channels: ['email', 'slack'] },
    { id: 'rg-002', name: 'Security Team', members: 5, type: 'role', channels: ['slack', 'sms'] },
    { id: 'rg-003', name: 'Operations On-Call', members: 4, type: 'team', channels: ['email', 'slack', 'sms'] },
    { id: 'rg-004', name: 'Compliance Officers', members: 2, type: 'role', channels: ['email'] },
    { id: 'rg-005', name: 'Executive Team', members: 6, type: 'custom', channels: ['email'] },
]

const frequencyLabels: Record<DigestFrequency, string> = {
    realtime: 'Real-time',
    hourly: 'Hourly',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly'
}

const severityClasses: Record<AlertSeverity, string> = {
    critical: 'text-rose-300 bg-rose-500/20 border-rose-500/40',
    high: 'text-orange-300 bg-orange-500/20 border-orange-500/40',
    medium: 'text-amber-300 bg-amber-500/20 border-amber-500/40',
    low: 'text-blue-300 bg-blue-500/20 border-blue-500/40',
    info: 'text-slate-300 bg-slate-500/20 border-slate-500/40'
}

const channelClasses: Record<NotificationChannel, string> = {
    email: 'text-blue-300 bg-blue-500/10',
    slack: 'text-purple-300 bg-purple-500/10',
    sms: 'text-emerald-300 bg-emerald-500/10',
    webhook: 'text-amber-300 bg-amber-500/10',
    dashboard: 'text-cyan-300 bg-cyan-500/10'
}

const statusClasses: Record<string, string> = {
    sent: 'text-emerald-300 bg-emerald-500/10',
    failed: 'text-rose-300 bg-rose-500/10',
    pending: 'text-amber-300 bg-amber-500/10'
}

export default function NotificationsPage({ title = 'Notifications', subtitle = 'Digest scheduling, alert thresholds & notification automation' }: { title?: string, subtitle?: string }) {
    const auth = useAuth()
    const [activeTab, setActiveTab] = useState<'digests' | 'thresholds' | 'logs' | 'groups'>('digests')
    const [digests, setDigests] = useState<EmailDigest[]>(mockEmailDigests)
    const [thresholds, setThresholds] = useState<AlertThreshold[]>(mockAlertThresholds)

    if (!auth.isAuthenticated) {
        return <Navigate to="/admin/login" replace />
    }

    const toggleDigest = (id: string) => {
        setDigests(prev => prev.map(d => d.id === id ? { ...d, enabled: !d.enabled } : d))
    }

    const toggleThreshold = (id: string) => {
        setThresholds(prev => prev.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t))
    }

    const stats = useMemo(() => ({
        activeDigests: digests.filter(d => d.enabled).length,
        activeThresholds: thresholds.filter(t => t.enabled).length,
        totalNotifications: mockNotificationLogs.length,
        failedNotifications: mockNotificationLogs.filter(n => n.status === 'failed').length,
        groupsCount: mockRecipientGroups.length,
        realtimeAlerts: digests.filter(d => d.frequency === 'realtime').length
    }), [digests, thresholds])

    const tabs = [
        { id: 'digests', label: 'Email Digests', count: stats.activeDigests },
        { id: 'thresholds', label: 'Alert Thresholds', count: stats.activeThresholds },
        { id: 'logs', label: 'Notification Logs', count: stats.totalNotifications },
        { id: 'groups', label: 'Recipient Groups', count: stats.groupsCount }
    ]

    return (
        <AdminLayout title={title} subtitle={subtitle}>
            <div className="relative min-h-screen bg-[#040812] text-white">
                <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(16,185,129,0.14),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.14),transparent_35%),radial-gradient(circle_at_40%_80%,rgba(251,191,36,0.08),transparent_35%)]" />
                <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-10">
                    <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                                Administration
                            </div>
                            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">Notifications</h1>
                            <p className="mt-2 max-w-2xl text-slate-400">
                                Configure digest emails, alert thresholds, and notification channels for automated alerts.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button className="rounded-xl border border-cyan-400/60 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-100 shadow-[0_10px_30px_rgba(34,211,238,0.22)] hover:bg-cyan-500/20 transition">
                                + Create Digest
                            </button>
                            <button className="rounded-xl border border-emerald-400/60 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-100 shadow-[0_10px_30px_rgba(16,185,129,0.22)] hover:bg-emerald-500/20 transition">
                                + Add Alert
                            </button>
                        </div>
                    </header>

                    <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-5">
                        <div className="rounded-xl border border-white/10 bg-[#0a1424] p-4">
                            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Active Digests</p>
                            <p className="mt-2 text-3xl font-bold text-white">{stats.activeDigests}</p>
                        </div>
                        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                            <p className="text-xs uppercase tracking-[0.14em] text-emerald-400">Active Alerts</p>
                            <p className="mt-2 text-3xl font-bold text-emerald-100">{stats.activeThresholds}</p>
                        </div>
                        <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-4">
                            <p className="text-xs uppercase tracking-[0.14em] text-purple-400">Realtime</p>
                            <p className="mt-2 text-3xl font-bold text-purple-100">{stats.realtimeAlerts}</p>
                        </div>
                        <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
                            <p className="text-xs uppercase tracking-[0.14em] text-blue-400">Sent Today</p>
                            <p className="mt-2 text-3xl font-bold text-blue-100">{stats.totalNotifications}</p>
                        </div>
                        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
                            <p className="text-xs uppercase tracking-[0.14em] text-rose-400">Failed</p>
                            <p className="mt-2 text-3xl font-bold text-rose-100">{stats.failedNotifications}</p>
                        </div>
                    </div>

                    <div className="mt-8 flex gap-1 overflow-x-auto rounded-xl border border-white/10 bg-white/5 p-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                                    activeTab === tab.id 
                                        ? 'bg-cyan-500/20 text-cyan-100' 
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                {tab.label}
                                <span className={`rounded-full px-2 py-0.5 text-xs ${
                                    activeTab === tab.id ? 'bg-cyan-500/40' : 'bg-white/10'
                                }`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    {activeTab === 'digests' && (
                        <section className="mt-6">
                            <div className="flex items-center justify-between gap-3 mb-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Email Digest Schedules</h2>
                                    <p className="text-sm text-slate-400">Automated weekly/monthly activity summaries</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {digests.map(digest => (
                                    <article 
                                        key={digest.id}
                                        className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0a1424] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.28)]"
                                    >
                                        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.15),transparent_45%)]" />
                                        <div className="relative flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                                                        digest.frequency === 'realtime' ? 'border-rose-500/40 text-rose-300' :
                                                        digest.frequency === 'daily' ? 'border-blue-500/40 text-blue-300' :
                                                        digest.frequency === 'weekly' ? 'border-purple-500/40 text-purple-300' :
                                                        'border-amber-500/40 text-amber-300'
                                                    }`}>
                                                        {frequencyLabels[digest.frequency]}
                                                    </span>
                                                    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                                                        digest.type === 'alert' ? 'border-rose-500/40 text-rose-300' :
                                                        digest.type === 'report' ? 'border-purple-500/40 text-purple-300' :
                                                        'border-emerald-500/40 text-emerald-300'
                                                    }`}>
                                                        {digest.type}
                                                    </span>
                                                </div>
                                                <h3 className="mt-2 text-base font-semibold text-white">{digest.name}</h3>
                                                <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                                                    <span>Recipients: {digest.recipients.length}</span>
                                                    <span>Last sent: {digest.lastSent}</span>
                                                    <span>Next: {digest.nextSend}</span>
                                                </div>
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {digest.includes.map(item => (
                                                        <span key={item} className="inline-flex items-center rounded-full bg-white/5 px-2 py-1 text-[10px] text-slate-400">
                                                            {item.replace('_', ' ')}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-3">
                                                <button 
                                                    onClick={() => toggleDigest(digest.id)}
                                                    className={`relative h-6 w-11 rounded-full transition-colors ${
                                                        digest.enabled ? 'bg-emerald-500' : 'bg-slate-600'
                                                    }`}
                                                >
                                                    <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                                                        digest.enabled ? 'left-6' : 'left-1'
                                                    }`} />
                                                </button>
                                                <span className="text-xs text-slate-500">{digest.enabled ? 'Active' : 'Paused'}</span>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>
                    )}

                    {activeTab === 'thresholds' && (
                        <section className="mt-6">
                            <div className="flex items-center justify-between gap-3 mb-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Alert Threshold Rules</h2>
                                    <p className="text-sm text-slate-400">Configurable alerts for platform metrics</p>
                                </div>
                            </div>
                            <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0a1424]">
                                <table className="w-full text-sm">
                                    <thead className="bg-white/5 text-xs uppercase tracking-[0.12em] text-slate-400">
                                        <tr>
                                            <th className="px-4 py-3 text-left">Alert Name</th>
                                            <th className="px-4 py-3 text-left">Metric</th>
                                            <th className="px-4 py-3 text-left">Condition</th>
                                            <th className="px-4 py-3 text-left">Severity</th>
                                            <th className="px-4 py-3 text-left">Channel</th>
                                            <th className="px-4 py-3 text-left">Last Triggered</th>
                                            <th className="px-4 py-3 text-right">Triggers</th>
                                            <th className="px-4 py-3 text-left">Enabled</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/70">
                                        {thresholds.map(threshold => (
                                            <tr key={threshold.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-4 py-3 font-medium text-white">{threshold.name}</td>
                                                <td className="px-4 py-3 text-slate-200">{threshold.metric}</td>
                                                <td className="px-4 py-3">
                                                    <span className="text-slate-300">
                                                        {threshold.condition === 'above' ? '>' : threshold.condition === 'below' ? '<' : '='} {threshold.threshold}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${severityClasses[threshold.severity]}`}>
                                                        {threshold.severity}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${channelClasses[threshold.channel]}`}>
                                                        {threshold.channel}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-400">{threshold.lastTriggered}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className={`font-semibold ${
                                                        threshold.triggerCount > 10 ? 'text-rose-300' :
                                                        threshold.triggerCount > 0 ? 'text-amber-300' : 'text-slate-500'
                                                    }`}>
                                                        {threshold.triggerCount}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <button 
                                                        onClick={() => toggleThreshold(threshold.id)}
                                                        className={`relative h-6 w-11 rounded-full transition-colors ${
                                                            threshold.enabled ? 'bg-emerald-500' : 'bg-slate-600'
                                                        }`}
                                                    >
                                                        <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                                                            threshold.enabled ? 'left-6' : 'left-1'
                                                        }`} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    {activeTab === 'logs' && (
                        <section className="mt-6">
                            <div className="flex items-center justify-between gap-3 mb-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Notification Logs</h2>
                                    <p className="text-sm text-slate-400">Recent notification deliveries</p>
                                </div>
                                <button className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10 transition">
                                    Export Logs
                                </button>
                            </div>
                            <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0a1424]">
                                <table className="w-full text-sm">
                                    <thead className="bg-white/5 text-xs uppercase tracking-[0.12em] text-slate-400">
                                        <tr>
                                            <th className="px-4 py-3 text-left">Type</th>
                                            <th className="px-4 py-3 text-left">Channel</th>
                                            <th className="px-4 py-3 text-left">Recipient</th>
                                            <th className="px-4 py-3 text-left">Subject</th>
                                            <th className="px-4 py-3 text-left">Sent At</th>
                                            <th className="px-4 py-3 text-left">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/70">
                                        {mockNotificationLogs.map(log => (
                                            <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                                                        log.type === 'alert' ? 'border-rose-500/40 text-rose-300' :
                                                        log.type === 'digest' ? 'border-blue-500/40 text-blue-300' :
                                                        'border-amber-500/40 text-amber-300'
                                                    }`}>
                                                        {log.type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${channelClasses[log.channel]}`}>
                                                        {log.channel}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-200">{log.recipient}</td>
                                                <td className="px-4 py-3 text-white">{log.subject}</td>
                                                <td className="px-4 py-3 text-slate-400">{log.sentAt}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClasses[log.status]}`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${
                                                            log.status === 'sent' ? 'bg-emerald-400' :
                                                            log.status === 'failed' ? 'bg-rose-400' : 'bg-amber-400'
                                                        }`} />
                                                        {log.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    {activeTab === 'groups' && (
                        <section className="mt-6">
                            <div className="flex items-center justify-between gap-3 mb-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Recipient Groups</h2>
                                    <p className="text-sm text-slate-400">Manage notification recipient groups and channels</p>
                                </div>
                                <button className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10 transition">
                                    + Create Group
                                </button>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {mockRecipientGroups.map(group => (
                                    <article 
                                        key={group.id}
                                        className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0a1424] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.28)]"
                                    >
                                        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.15),transparent_45%)]" />
                                        <div className="relative">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${
                                                        group.type === 'role' ? 'border-blue-500/40 text-blue-300' :
                                                        group.type === 'team' ? 'border-purple-500/40 text-purple-300' :
                                                        'border-amber-500/40 text-amber-300'
                                                    }`}>
                                                        {group.type}
                                                    </span>
                                                    <h3 className="mt-2 text-base font-semibold text-white">{group.name}</h3>
                                                </div>
                                            </div>
                                            <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                                                <span>{group.members} members</span>
                                            </div>
                                            <div className="mt-3 flex gap-2">
                                                {group.channels.map(channel => (
                                                    <span key={channel} className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-semibold capitalize ${channelClasses[channel]}`}>
                                                        {channel}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </AdminLayout>
    )
}
