import { useState, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import { useAuth } from '../../contexts/AuthContext'

type ServiceStatus = 'healthy' | 'degraded' | 'down' | 'maintenance'
type TaskStatus = 'running' | 'completed' | 'failed' | 'scheduled' | 'pending'

type Service = {
    id: string
    name: string
    type: 'api' | 'database' | 'cache' | 'queue' | 'storage' | 'cdn' | 'authentication'
    status: ServiceStatus
    uptime: string
    latency: number
    cpu: number
    memory: number
    requests: number
    autoHealing: boolean
}

type SystemMetric = {
    timestamp: string
    cpu: number
    memory: number
    requests: number
    errors: number
    latency: number
}

type ScheduledJob = {
    id: string
    name: string
    type: 'backup' | 'cache_warm' | 'quota_enforce' | 'health_check' | 'log_cleanup' | 'sync' | 'optimize'
    schedule: string
    status: TaskStatus
    lastRun: string
    nextRun: string
    duration: string
    autoExecuted: boolean
    successRate: number
}

type QuotaRule = {
    id: string
    name: string
    target: 'user' | 'provider' | 'dataset' | 'api_key'
    limit: number
    period: 'hourly' | 'daily' | 'monthly'
    current: number
    autoEnforce: boolean
    action: 'block' | 'alert' | 'throttle'
    alertThreshold: number
}

type CacheConfig = {
    id: string
    dataset: string
    warmingSchedule: string
    status: 'active' | 'paused'
    hitRate: number
    preloaded: boolean
    lastWarmed: string
}

const mockServices: Service[] = [
    { id: 'svc-001', name: 'API Gateway', type: 'api', status: 'healthy', uptime: '99.99%', latency: 45, cpu: 32, memory: 48, requests: 15420, autoHealing: true },
    { id: 'svc-002', name: 'Primary Database', type: 'database', status: 'healthy', uptime: '99.95%', latency: 12, cpu: 45, memory: 62, requests: 8930, autoHealing: true },
    { id: 'svc-003', name: 'Redis Cache', type: 'cache', status: 'healthy', uptime: '99.99%', latency: 2, cpu: 18, memory: 34, requests: 45200, autoHealing: true },
    { id: 'svc-004', name: 'Message Queue', type: 'queue', status: 'healthy', uptime: '99.97%', latency: 5, cpu: 22, memory: 28, requests: 12100, autoHealing: true },
    { id: 'svc-005', name: 'Object Storage', type: 'storage', status: 'healthy', uptime: '100%', latency: 28, cpu: 8, memory: 15, requests: 3420, autoHealing: false },
    { id: 'svc-006', name: 'CDN Edge', type: 'cdn', status: 'degraded', uptime: '99.85%', latency: 65, cpu: 55, memory: 42, requests: 28900, autoHealing: true },
    { id: 'svc-007', name: 'Auth Service', type: 'authentication', status: 'healthy', uptime: '99.98%', latency: 8, cpu: 15, memory: 22, requests: 12400, autoHealing: true },
]

const mockScheduledJobs: ScheduledJob[] = [
    { id: 'job-001', name: 'Full Database Backup', type: 'backup', schedule: 'Daily 2:00 AM', status: 'completed', lastRun: 'Today 2:00 AM', nextRun: 'Tomorrow 2:00 AM', duration: '45 min', autoExecuted: true, successRate: 100 },
    { id: 'job-002', name: 'Popular Datasets Cache Warm', type: 'cache_warm', schedule: 'Every 6 hours', status: 'completed', lastRun: '6 hours ago', nextRun: 'In 6 hours', duration: '12 min', autoExecuted: true, successRate: 100 },
    { id: 'job-003', name: 'Quota Enforcement Check', type: 'quota_enforce', schedule: 'Every hour', status: 'running', lastRun: 'In progress', nextRun: 'In 45 min', duration: 'Running...', autoExecuted: true, successRate: 98 },
    { id: 'job-004', name: 'System Health Check', type: 'health_check', schedule: 'Every 5 min', status: 'running', lastRun: 'Continuous', nextRun: 'Every 5 min', duration: '30 sec', autoExecuted: true, successRate: 100 },
    { id: 'job-005', name: 'Log File Cleanup', type: 'log_cleanup', schedule: 'Daily 4:00 AM', status: 'scheduled', lastRun: 'Yesterday 4:00 AM', nextRun: 'Tomorrow 4:00 AM', duration: '8 min', autoExecuted: true, successRate: 100 },
    { id: 'job-006', name: 'Provider Data Sync', type: 'sync', schedule: 'Every 12 hours', status: 'completed', lastRun: '8 hours ago', nextRun: 'In 4 hours', duration: '25 min', autoExecuted: true, successRate: 96 },
    { id: 'job-007', name: 'Database Optimization', type: 'optimize', schedule: 'Weekly Sunday', status: 'completed', lastRun: 'Mar 23 2:00 AM', nextRun: 'Mar 30 2:00 AM', duration: '1 hr 20 min', autoExecuted: true, successRate: 100 },
    { id: 'job-008', name: 'Trust Score Recalculation', type: 'cache_warm', schedule: 'Daily 3:00 AM', status: 'completed', lastRun: 'Yesterday 3:00 AM', nextRun: 'Tomorrow 3:00 AM', duration: '18 min', autoExecuted: true, successRate: 100 },
]

const mockQuotaRules: QuotaRule[] = [
    { id: 'q-001', name: 'API Requests per User', target: 'user', limit: 10000, period: 'hourly', current: 4520, autoEnforce: true, action: 'throttle', alertThreshold: 80 },
    { id: 'q-002', name: 'Dataset Downloads per Provider', target: 'provider', limit: 5000, period: 'daily', current: 2340, autoEnforce: true, action: 'block', alertThreshold: 90 },
    { id: 'q-003', name: 'Storage per Dataset', target: 'dataset', limit: 100, period: 'monthly', current: 42, autoEnforce: true, action: 'alert', alertThreshold: 75 },
    { id: 'q-004', name: 'API Key Requests', target: 'api_key', limit: 50000, period: 'hourly', current: 12450, autoEnforce: false, action: 'alert', alertThreshold: 60 },
    { id: 'q-005', name: 'Bulk Export Size', target: 'user', limit: 10, period: 'daily', current: 3, autoEnforce: true, action: 'block', alertThreshold: 80 },
]

const mockCacheConfigs: CacheConfig[] = [
    { id: 'c-001', dataset: 'Clinical Outcomes Delta', warmingSchedule: 'Every 6 hours', status: 'active', hitRate: 94, preloaded: true, lastWarmed: '6 hours ago' },
    { id: 'c-002', dataset: 'Financial Tick Data Q4', warmingSchedule: 'Every 6 hours', status: 'active', hitRate: 91, preloaded: true, lastWarmed: '6 hours ago' },
    { id: 'c-003', dataset: 'Global Temperature Anomalies', warmingSchedule: 'Daily', status: 'active', hitRate: 78, preloaded: false, lastWarmed: '1 day ago' },
    { id: 'c-004', dataset: 'Market Sentiment Analysis', warmingSchedule: 'Every 12 hours', status: 'paused', hitRate: 0, preloaded: false, lastWarmed: 'Never' },
    { id: 'c-005', dataset: 'Emergency Response Dataset', warmingSchedule: 'Every 6 hours', status: 'active', hitRate: 88, preloaded: true, lastWarmed: '6 hours ago' },
]

const mockAlerts: { id: string; message: string; severity: 'info' | 'warning' | 'critical'; source: string; time: string }[] = [
    { id: 'a-001', message: 'CDN Edge latency above threshold (65ms)', severity: 'warning', source: 'CDN Edge', time: '15 min ago' },
    { id: 'a-002', message: 'Quota limit approaching for API Key requests', severity: 'info', source: 'Quota Monitor', time: '1 hour ago' },
    { id: 'a-003', message: 'Scheduled job "Provider Data Sync" completed with warnings', severity: 'warning', source: 'Scheduler', time: '8 hours ago' },
    { id: 'a-004', message: 'Database backup verified successfully', severity: 'info', source: 'Backup Service', time: 'Today 2:45 AM' },
]

const statusClasses: Record<ServiceStatus, string> = {
    healthy: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30',
    degraded: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
    down: 'text-rose-300 bg-rose-500/10 border-rose-500/30',
    maintenance: 'text-blue-300 bg-blue-500/10 border-blue-500/30'
}

const taskStatusClasses: Record<TaskStatus, string> = {
    running: 'text-amber-300 bg-amber-500/10',
    completed: 'text-emerald-300 bg-emerald-500/10',
    failed: 'text-rose-300 bg-rose-500/10',
    scheduled: 'text-blue-300 bg-blue-500/10',
    pending: 'text-slate-400 bg-slate-500/10'
}

const severityClasses: Record<string, string> = {
    info: 'text-blue-300 bg-blue-500/10',
    warning: 'text-amber-300 bg-amber-500/10',
    critical: 'text-rose-300 bg-rose-500/10'
}

export default function OperationsPage({ title = 'Operations', subtitle = 'Automated system monitoring, caching, backups & quota enforcement' }: { title?: string, subtitle?: string }) {
    const auth = useAuth()
    const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'jobs' | 'quotas' | 'cache'>('overview')
    const [quotaRules, setQuotaRules] = useState<QuotaRule[]>(mockQuotaRules)
    const [cacheConfigs, setCacheConfigs] = useState<CacheConfig[]>(mockCacheConfigs)

    if (!auth.isAuthenticated) {
        return <Navigate to="/admin/login" replace />
    }

    const toggleQuotaRule = (id: string) => {
        setQuotaRules(prev => prev.map(rule => 
            rule.id === id ? { ...rule, autoEnforce: !rule.autoEnforce } : rule
        ))
    }

    const toggleCacheConfig = (id: string) => {
        setCacheConfigs(prev => prev.map(config => 
            config.id === id ? { ...config, status: config.status === 'active' ? 'paused' : 'active' } : config
        ))
    }

    const stats = useMemo(() => ({
        totalServices: mockServices.length,
        healthyServices: mockServices.filter(s => s.status === 'healthy').length,
        totalJobs: mockScheduledJobs.length,
        runningJobs: mockScheduledJobs.filter(j => j.status === 'running').length,
        activeQuotas: quotaRules.filter(q => q.autoEnforce).length,
        activeCache: cacheConfigs.filter(c => c.status === 'active').length,
        avgHitRate: Math.round(cacheConfigs.reduce((acc, c) => acc + c.hitRate, 0) / cacheConfigs.length)
    }), [quotaRules, cacheConfigs])

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'services', label: 'Services', count: stats.totalServices },
        { id: 'jobs', label: 'Scheduled Jobs', count: stats.totalJobs },
        { id: 'quotas', label: 'Quota Rules', count: stats.activeQuotas },
        { id: 'cache', label: 'Cache Management', count: stats.activeCache }
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
                            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">Operations</h1>
                            <p className="mt-2 max-w-2xl text-slate-400">
                                Automated system monitoring, caching, backups, and quota enforcement for platform reliability.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button className="rounded-xl border border-cyan-400/60 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-100 shadow-[0_10px_30px_rgba(34,211,238,0.22)] hover:bg-cyan-500/20 transition">
                                Run Health Check
                            </button>
                            <button className="rounded-xl border border-emerald-400/60 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-100 shadow-[0_10px_30px_rgba(16,185,129,0.22)] hover:bg-emerald-500/20 transition">
                                Trigger Backup
                            </button>
                        </div>
                    </header>

                    <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-5">
                        <div className="rounded-xl border border-white/10 bg-[#0a1424] p-4">
                            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Services</p>
                            <p className="mt-2 text-3xl font-bold text-white">{stats.totalServices}</p>
                        </div>
                        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                            <p className="text-xs uppercase tracking-[0.14em] text-emerald-400">Healthy</p>
                            <p className="mt-2 text-3xl font-bold text-emerald-100">{stats.healthyServices}</p>
                        </div>
                        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                            <p className="text-xs uppercase tracking-[0.14em] text-amber-400">Running Jobs</p>
                            <p className="mt-2 text-3xl font-bold text-amber-100">{stats.runningJobs}</p>
                        </div>
                        <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
                            <p className="text-xs uppercase tracking-[0.14em] text-blue-400">Cache Hit Rate</p>
                            <p className="mt-2 text-3xl font-bold text-blue-100">{stats.avgHitRate}%</p>
                        </div>
                        <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-4">
                            <p className="text-xs uppercase tracking-[0.14em] text-purple-400">Active Quotas</p>
                            <p className="mt-2 text-3xl font-bold text-purple-100">{stats.activeQuotas}</p>
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
                                {tab.count !== undefined && (
                                    <span className={`rounded-full px-2 py-0.5 text-xs ${
                                        activeTab === tab.id ? 'bg-cyan-500/40' : 'bg-white/10'
                                    }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'overview' && (
                        <section className="mt-6">
                            <div className="grid gap-6 lg:grid-cols-2">
                                <article className="rounded-2xl border border-white/10 bg-[#0a1424] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.28)]">
                                    <h2 className="text-xl font-semibold text-white">Service Health</h2>
                                    <p className="text-sm text-slate-400">Real-time system status</p>
                                    <div className="mt-4 space-y-3">
                                        {mockServices.slice(0, 5).map(service => (
                                            <div key={service.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-2.5 w-2.5 rounded-full ${
                                                        service.status === 'healthy' ? 'bg-emerald-400' :
                                                        service.status === 'degraded' ? 'bg-amber-400' : 'bg-rose-400'
                                                    }`} />
                                                    <div>
                                                        <p className="text-sm font-medium text-white">{service.name}</p>
                                                        <p className="text-xs text-slate-500">{service.type} · {service.uptime}</p>
                                                    </div>
                                                </div>
                                                <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusClasses[service.status]}`}>
                                                    {service.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </article>

                                <article className="rounded-2xl border border-white/10 bg-[#0a1424] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.28)]">
                                    <h2 className="text-xl font-semibold text-white">Recent Alerts</h2>
                                    <p className="text-sm text-slate-400">System notifications</p>
                                    <div className="mt-4 space-y-3">
                                        {mockAlerts.map(alert => (
                                            <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                                                <div className={`mt-1 h-2 w-2 rounded-full ${
                                                    alert.severity === 'critical' ? 'bg-rose-400' :
                                                    alert.severity === 'warning' ? 'bg-amber-400' : 'bg-blue-400'
                                                }`} />
                                                <div className="flex-1">
                                                    <p className="text-sm text-white">{alert.message}</p>
                                                    <p className="text-xs text-slate-500 mt-1">{alert.source} · {alert.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </article>

                                <article className="rounded-2xl border border-white/10 bg-[#0a1424] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.28)]">
                                    <h2 className="text-xl font-semibold text-white">Active Jobs</h2>
                                    <p className="text-sm text-slate-400">Currently running automation</p>
                                    <div className="mt-4 space-y-3">
                                        {mockScheduledJobs.filter(j => j.status === 'running').map(job => (
                                            <div key={job.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                                                <div>
                                                    <p className="text-sm font-medium text-white">{job.name}</p>
                                                    <p className="text-xs text-slate-500">{job.type} · {job.duration}</p>
                                                </div>
                                                <span className="inline-flex items-center gap-1.5 text-amber-300">
                                                    <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                                                    Running
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </article>

                                <article className="rounded-2xl border border-white/10 bg-[#0a1424] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.28)]">
                                    <h2 className="text-xl font-semibold text-white">System Resources</h2>
                                    <p className="text-sm text-slate-400">Current utilization</p>
                                    <div className="mt-4 space-y-4">
                                        <div>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-slate-400">CPU</span>
                                                <span className="text-white">32%</span>
                                            </div>
                                            <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                                                <div className="h-full w-[32%] rounded-full bg-cyan-400" />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-slate-400">Memory</span>
                                                <span className="text-white">48%</span>
                                            </div>
                                            <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                                                <div className="h-full w-[48%] rounded-full bg-purple-400" />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-slate-400">Storage</span>
                                                <span className="text-white">67%</span>
                                            </div>
                                            <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                                                <div className="h-full w-[67%] rounded-full bg-emerald-400" />
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            </div>
                        </section>
                    )}

                    {activeTab === 'services' && (
                        <section className="mt-6">
                            <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0a1424]">
                                <table className="w-full text-sm">
                                    <thead className="bg-white/5 text-xs uppercase tracking-[0.12em] text-slate-400">
                                        <tr>
                                            <th className="px-4 py-3 text-left">Service</th>
                                            <th className="px-4 py-3 text-left">Type</th>
                                            <th className="px-4 py-3 text-left">Status</th>
                                            <th className="px-4 py-3 text-left">Uptime</th>
                                            <th className="px-4 py-3 text-right">Latency</th>
                                            <th className="px-4 py-3 text-right">CPU</th>
                                            <th className="px-4 py-3 text-right">Memory</th>
                                            <th className="px-4 py-3 text-right">Req/min</th>
                                            <th className="px-4 py-3 text-left">Auto-Heal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/70">
                                        {mockServices.map(service => (
                                            <tr key={service.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-4 py-3 font-medium text-white">{service.name}</td>
                                                <td className="px-4 py-3 text-slate-200 capitalize">{service.type}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusClasses[service.status]}`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${
                                                            service.status === 'healthy' ? 'bg-emerald-400' :
                                                            service.status === 'degraded' ? 'bg-amber-400' :
                                                            service.status === 'down' ? 'bg-rose-400' : 'bg-blue-400'
                                                        }`} />
                                                        {service.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-300">{service.uptime}</td>
                                                <td className="px-4 py-3 text-right text-slate-200">{service.latency}ms</td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <div className="h-1.5 w-12 rounded-full bg-slate-700 overflow-hidden">
                                                            <div className={`h-full rounded-full ${service.cpu > 80 ? 'bg-rose-400' : service.cpu > 60 ? 'bg-amber-400' : 'bg-emerald-400'}`} style={{ width: `${service.cpu}%` }} />
                                                        </div>
                                                        <span className="text-xs text-slate-400 w-8">{service.cpu}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <div className="h-1.5 w-12 rounded-full bg-slate-700 overflow-hidden">
                                                            <div className={`h-full rounded-full ${service.memory > 80 ? 'bg-rose-400' : service.memory > 60 ? 'bg-amber-400' : 'bg-emerald-400'}`} style={{ width: `${service.memory}%` }} />
                                                        </div>
                                                        <span className="text-xs text-slate-400 w-8">{service.memory}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right text-slate-200">{service.requests.toLocaleString()}</td>
                                                <td className="px-4 py-3">
                                                    {service.autoHealing ? (
                                                        <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Enabled
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-500">Disabled</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    {activeTab === 'jobs' && (
                        <section className="mt-6">
                            <div className="flex items-center justify-between gap-3 mb-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Scheduled Jobs</h2>
                                    <p className="text-sm text-slate-400">Automated operational tasks</p>
                                </div>
                                <button className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10 transition">
                                    + Schedule Job
                                </button>
                            </div>
                            <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0a1424]">
                                <table className="w-full text-sm">
                                    <thead className="bg-white/5 text-xs uppercase tracking-[0.12em] text-slate-400">
                                        <tr>
                                            <th className="px-4 py-3 text-left">Job Name</th>
                                            <th className="px-4 py-3 text-left">Type</th>
                                            <th className="px-4 py-3 text-left">Schedule</th>
                                            <th className="px-4 py-3 text-left">Status</th>
                                            <th className="px-4 py-3 text-left">Last Run</th>
                                            <th className="px-4 py-3 text-left">Next Run</th>
                                            <th className="px-4 py-3 text-left">Duration</th>
                                            <th className="px-4 py-3 text-right">Success</th>
                                            <th className="px-4 py-3 text-left">Auto</th>
                                            <th className="px-4 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/70">
                                        {mockScheduledJobs.map(job => (
                                            <tr key={job.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-4 py-3 font-medium text-white">{job.name}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                                                        job.type === 'backup' ? 'border-emerald-500/40 text-emerald-300' :
                                                        job.type === 'cache_warm' ? 'border-blue-500/40 text-blue-300' :
                                                        job.type === 'quota_enforce' ? 'border-purple-500/40 text-purple-300' :
                                                        job.type === 'health_check' ? 'border-cyan-500/40 text-cyan-300' :
                                                        job.type === 'log_cleanup' ? 'border-amber-500/40 text-amber-300' :
                                                        'border-slate-500/40 text-slate-300'
                                                    }`}>
                                                        {job.type.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-300">{job.schedule}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${taskStatusClasses[job.status]}`}>
                                                        {job.status === 'running' && <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />}
                                                        {job.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-400">{job.lastRun}</td>
                                                <td className="px-4 py-3 text-slate-400">{job.nextRun}</td>
                                                <td className="px-4 py-3 text-slate-300">{job.duration}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className={`font-semibold ${job.successRate >= 95 ? 'text-emerald-300' : job.successRate >= 80 ? 'text-amber-300' : 'text-rose-300'}`}>
                                                        {job.successRate}%
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {job.autoExecuted ? (
                                                        <span className="inline-flex items-center gap-1 text-xs text-cyan-400">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" /> Auto
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-500">Manual</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button className="rounded-lg border border-slate-600 bg-slate-700/50 px-2 py-1 text-xs text-slate-300 hover:bg-slate-600">
                                                            Run Now
                                                        </button>
                                                        <button className="rounded-lg border border-slate-600 bg-slate-700/50 px-2 py-1 text-xs text-slate-300 hover:bg-slate-600">
                                                            Edit
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    {activeTab === 'quotas' && (
                        <section className="mt-6">
                            <div className="flex items-center justify-between gap-3 mb-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Quota Rules</h2>
                                    <p className="text-sm text-slate-400">Automated usage limit enforcement</p>
                                </div>
                                <button className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10 transition">
                                    + Add Quota Rule
                                </button>
                            </div>
                            <div className="space-y-4">
                                {quotaRules.map(rule => (
                                    <article 
                                        key={rule.id}
                                        className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0a1424] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.28)]"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${
                                                        rule.target === 'user' ? 'border-blue-500/40 text-blue-300' :
                                                        rule.target === 'provider' ? 'border-emerald-500/40 text-emerald-300' :
                                                        rule.target === 'dataset' ? 'border-purple-500/40 text-purple-300' :
                                                        'border-amber-500/40 text-amber-300'
                                                    }`}>
                                                        {rule.target}
                                                    </span>
                                                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${
                                                        rule.action === 'block' ? 'border-rose-500/40 text-rose-300' :
                                                        rule.action === 'throttle' ? 'border-amber-500/40 text-amber-300' :
                                                        'border-blue-500/40 text-blue-300'
                                                    }`}>
                                                        {rule.action}
                                                    </span>
                                                </div>
                                                <h3 className="mt-2 text-base font-semibold text-white">{rule.name}</h3>
                                                <div className="mt-3 flex items-center gap-6 text-xs text-slate-500">
                                                    <span>Limit: <strong className="text-slate-300">{rule.limit.toLocaleString()}</strong> / {rule.period}</span>
                                                    <span>Alert at: <strong className="text-slate-300">{rule.alertThreshold}%</strong></span>
                                                </div>
                                                <div className="mt-3">
                                                    <div className="flex items-center justify-between text-xs mb-1">
                                                        <span className="text-slate-400">Current usage</span>
                                                        <span className="text-white">{Math.round(rule.current / rule.limit * 100)}%</span>
                                                    </div>
                                                    <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                                                        <div 
                                                            className={`h-full rounded-full ${
                                                                rule.current / rule.limit > 0.9 ? 'bg-rose-400' :
                                                                rule.current / rule.limit > 0.7 ? 'bg-amber-400' : 'bg-emerald-400'
                                                            }`} 
                                                            style={{ width: `${Math.min(rule.current / rule.limit * 100, 100)}%` }} 
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-3">
                                                <button 
                                                    onClick={() => toggleQuotaRule(rule.id)}
                                                    className={`relative h-6 w-11 rounded-full transition-colors ${
                                                        rule.autoEnforce ? 'bg-emerald-500' : 'bg-slate-600'
                                                    }`}
                                                >
                                                    <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                                                        rule.autoEnforce ? 'left-6' : 'left-1'
                                                    }`} />
                                                </button>
                                                <span className="text-xs text-slate-500">Auto-Enforce</span>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>
                    )}

                    {activeTab === 'cache' && (
                        <section className="mt-6">
                            <div className="flex items-center justify-between gap-3 mb-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Cache Management</h2>
                                    <p className="text-sm text-slate-400">Automated dataset cache warming</p>
                                </div>
                                <button className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10 transition">
                                    + Add Dataset to Cache
                                </button>
                            </div>
                            <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0a1424]">
                                <table className="w-full text-sm">
                                    <thead className="bg-white/5 text-xs uppercase tracking-[0.12em] text-slate-400">
                                        <tr>
                                            <th className="px-4 py-3 text-left">Dataset</th>
                                            <th className="px-4 py-3 text-left">Warming Schedule</th>
                                            <th className="px-4 py-3 text-left">Status</th>
                                            <th className="px-4 py-3 text-right">Hit Rate</th>
                                            <th className="px-4 py-3 text-left">Preloaded</th>
                                            <th className="px-4 py-3 text-left">Last Warmed</th>
                                            <th className="px-4 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/70">
                                        {cacheConfigs.map(config => (
                                            <tr key={config.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-4 py-3 font-medium text-white">{config.dataset}</td>
                                                <td className="px-4 py-3 text-slate-300">{config.warmingSchedule}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                                                        config.status === 'active' ? 'border-emerald-500/40 text-emerald-300' : 'border-slate-500/40 text-slate-400'
                                                    }`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${
                                                            config.status === 'active' ? 'bg-emerald-400' : 'bg-slate-400'
                                                        }`} />
                                                        {config.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className={`font-semibold ${
                                                        config.hitRate >= 90 ? 'text-emerald-300' :
                                                        config.hitRate >= 70 ? 'text-amber-300' : 'text-rose-300'
                                                    }`}>
                                                        {config.hitRate}%
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {config.preloaded ? (
                                                        <span className="inline-flex items-center gap-1 text-xs text-cyan-400">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" /> Yes
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-500">No</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-slate-400">{config.lastWarmed}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button 
                                                            onClick={() => toggleCacheConfig(config.id)}
                                                            className="rounded-lg border border-slate-600 bg-slate-700/50 px-2 py-1 text-xs text-slate-300 hover:bg-slate-600"
                                                        >
                                                            {config.status === 'active' ? 'Pause' : 'Activate'}
                                                        </button>
                                                        <button className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-2 py-1 text-xs text-cyan-300 hover:bg-cyan-500/20">
                                                            Warm Now
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </AdminLayout>
    )
}
