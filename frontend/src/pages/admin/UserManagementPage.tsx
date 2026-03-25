import { useState, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import { useAuth } from '../../contexts/AuthContext'

type StatusTone = 'active' | 'pending' | 'inactive' | 'warning'

type User = {
    id: string
    name: string
    email: string
    role: string
    status: StatusTone
    lastActive: string
    trustScore: number
    autoApproved: boolean
    source: 'sso' | 'manual' | 'invite'
}

type AutomationRule = {
    id: string
    name: string
    description: string
    enabled: boolean
    trigger: string
    action: string
    lastRun: string
    type: 'provisioning' | 'deprovisioning' | 'role_assignment' | 'access_review' | 'onboarding'
}

type AccessReview = {
    id: string
    user: string
    role: string
    lastReviewed: string
    nextReview: string
    status: 'pending' | 'approved' | 'needs_action'
    autoAction: string
}

type BulkAction = {
    id: string
    name: string
    targetCount: number
    status: 'scheduled' | 'running' | 'completed' | 'failed'
    scheduledTime: string
    createdBy: string
}

const mockUsers: User[] = [
    { id: 'u-001', name: 'Sarah Chen', email: 'sarah.chen@healthco.io', role: 'Data Analyst', status: 'active', lastActive: '2 min ago', trustScore: 94, autoApproved: true, source: 'sso' },
    { id: 'u-002', name: 'Marcus Johnson', email: 'mjohnson@finvault.com', role: 'Research Lead', status: 'active', lastActive: '15 min ago', trustScore: 87, autoApproved: true, source: 'sso' },
    { id: 'u-003', name: 'Elena Rodriguez', email: 'elena.r@meddata.org', role: 'Compliance Officer', status: 'active', lastActive: '1 hour ago', trustScore: 91, autoApproved: false, source: 'manual' },
    { id: 'u-004', name: 'James Wilson', email: 'jwilson@govagency.gov', role: 'Guest Reviewer', status: 'pending', lastActive: 'Never', trustScore: 0, autoApproved: false, source: 'invite' },
    { id: 'u-005', name: 'Aisha Patel', email: 'aisha.p@fintech.io', role: 'Pipeline Engineer', status: 'active', lastActive: '5 min ago', trustScore: 82, autoApproved: true, source: 'sso' },
    { id: 'u-006', name: 'Robert Kim', email: 'rkim@hospital.net', role: 'Data Analyst', status: 'inactive', lastActive: '30 days ago', trustScore: 78, autoApproved: true, source: 'sso' },
    { id: 'u-007', name: 'Lisa Thompson', email: 'lisa.t@bank.com', role: 'Research Lead', status: 'active', lastActive: '30 min ago', trustScore: 89, autoApproved: true, source: 'sso' },
    { id: 'u-008', name: 'David Brown', email: 'dbrown@research.org', role: 'Guest Reviewer', status: 'warning', lastActive: '2 days ago', trustScore: 45, autoApproved: false, source: 'manual' },
]

const automationRules: AutomationRule[] = [
    { id: 'ar-1', name: 'SSO User Provisioning', description: 'Auto-create accounts for users authenticating via SSO', enabled: true, trigger: 'SSO login', action: 'Create user + assign role', lastRun: '5 min ago', type: 'provisioning' },
    { id: 'ar-2', name: 'Inactive User Deprovisioning', description: 'Auto-disable accounts inactive for 90+ days', enabled: true, trigger: '90 days inactive', action: 'Disable + revoke access', lastRun: '1 day ago', type: 'deprovisioning' },
    { id: 'ar-3', name: 'Trust-Based Role Assignment', description: 'Auto-assign roles based on trust score thresholds', enabled: true, trigger: 'Trust score update', action: 'Assign appropriate role', lastRun: '1 hour ago', type: 'role_assignment' },
    { id: 'ar-4', name: 'Quarterly Access Review', description: 'Scheduled review of all user permissions', enabled: true, trigger: 'Quarterly schedule', action: 'Generate review queue', lastRun: '3 days ago', type: 'access_review' },
    { id: 'ar-5', name: 'Trusted Domain Auto-Approval', description: 'Auto-approve users from verified email domains', enabled: false, trigger: 'New user signup', action: 'Auto-approve + onboard', lastRun: 'Never', type: 'onboarding' },
    { id: 'ar-6', name: 'Low Trust Alert', description: 'Flag users with declining trust scores', enabled: true, trigger: 'Score < 50', action: 'Notify admin + restrict', lastRun: '2 hours ago', type: 'access_review' },
]

const accessReviews: AccessReview[] = [
    { id: 'rev-001', user: 'David Brown', role: 'Guest Reviewer', lastReviewed: '2026-01-15', nextReview: '2026-03-25', status: 'needs_action', autoAction: 'Pending review' },
    { id: 'rev-002', user: 'James Wilson', role: 'Guest Reviewer', lastReviewed: '2026-02-01', nextReview: '2026-04-01', status: 'pending', autoAction: 'Scheduled' },
    { id: 'rev-003', user: 'Robert Kim', role: 'Data Analyst', lastReviewed: '2025-12-01', nextReview: '2026-03-01', status: 'approved', autoAction: 'Auto-renewed' },
]

const bulkActions: BulkAction[] = [
    { id: 'ba-001', name: 'Assign Healthcare Workspace Role', targetCount: 12, status: 'completed', scheduledTime: '2026-03-24 09:00', createdBy: 'admin_001' },
    { id: 'ba-002', name: 'Deprovision Inactive Users (30 days)', targetCount: 8, status: 'scheduled', scheduledTime: '2026-03-26 02:00', createdBy: 'admin_002' },
    { id: 'ba-003', name: 'Reset 2FA for High-Risk Users', targetCount: 3, status: 'running', scheduledTime: '2026-03-25 14:30', createdBy: 'admin_001' },
]

const statusClasses: Record<StatusTone, string> = {
    active: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30',
    pending: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
    inactive: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
    warning: 'text-rose-300 bg-rose-500/10 border-rose-500/30'
}

const reviewStatusClasses: Record<string, string> = {
    pending: 'text-amber-300 bg-amber-500/10',
    approved: 'text-emerald-300 bg-emerald-500/10',
    needs_action: 'text-rose-300 bg-rose-500/10'
}

const bulkStatusClasses: Record<string, string> = {
    completed: 'text-emerald-300',
    scheduled: 'text-blue-300',
    running: 'text-amber-300',
    failed: 'text-rose-300'
}

export default function UserManagementPage({ title = 'User Management', subtitle = 'Automated user provisioning & access control' }: { title?: string, subtitle?: string }) {
    const auth = useAuth()
    const [activeTab, setActiveTab] = useState<'users' | 'automation' | 'access-reviews' | 'bulk-actions'>('users')
    const [selectedUsers, setSelectedUsers] = useState<string[]>([])
    const [rules, setRules] = useState<AutomationRule[]>(automationRules)

    if (!auth.isAuthenticated) {
        return <Navigate to="/admin/login" replace />
    }

    const toggleUserSelection = (userId: string) => {
        setSelectedUsers(prev => 
            prev.includes(userId) 
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        )
    }

    const toggleRule = (ruleId: string) => {
        setRules(prev => prev.map(rule => 
            rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
        ))
    }

    const stats = useMemo(() => ({
        total: mockUsers.length,
        active: mockUsers.filter(u => u.status === 'active').length,
        pending: mockUsers.filter(u => u.status === 'pending').length,
        autoApproved: mockUsers.filter(u => u.autoApproved).length,
        ssoUsers: mockUsers.filter(u => u.source === 'sso').length
    }), [])

    const tabs = [
        { id: 'users', label: 'Users', count: stats.total },
        { id: 'automation', label: 'Automation Rules', count: rules.filter(r => r.enabled).length },
        { id: 'access-reviews', label: 'Access Reviews', count: accessReviews.filter(r => r.status === 'pending' || r.status === 'needs_action').length },
        { id: 'bulk-actions', label: 'Bulk Actions', count: bulkActions.filter(b => b.status === 'scheduled' || b.status === 'running').length }
    ]

    return (
        <AdminLayout title={title} subtitle={subtitle}>
            <div className="relative min-h-screen text-white">
                <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(16,185,129,0.14),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.14),transparent_35%),radial-gradient(circle_at_40%_80%,rgba(251,191,36,0.08),transparent_35%)]" />
                <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-10">
                    <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                                Administration
                            </div>
                            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">User Management</h1>
                            <p className="mt-2 max-w-2xl text-slate-400">
                                Automated user provisioning, role management, and access reviews for regulated industry workflows.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button className="rounded-xl border border-cyan-400/60 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-100 shadow-[0_10px_30px_rgba(34,211,238,0.22)] hover:bg-cyan-500/20 transition">
                                + New User
                            </button>
                            <button className="rounded-xl border border-emerald-400/60 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-100 shadow-[0_10px_30px_rgba(16,185,129,0.22)] hover:bg-emerald-500/20 transition">
                                Import Users
                            </button>
                        </div>
                    </header>

                    <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-5">
                        <div className="rounded-xl border border-white/10 bg-[#0a1424] p-4">
                            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Total Users</p>
                            <p className="mt-2 text-3xl font-bold text-white">{stats.total}</p>
                        </div>
                        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                            <p className="text-xs uppercase tracking-[0.14em] text-emerald-400">Active</p>
                            <p className="mt-2 text-3xl font-bold text-emerald-100">{stats.active}</p>
                        </div>
                        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                            <p className="text-xs uppercase tracking-[0.14em] text-amber-400">Pending</p>
                            <p className="mt-2 text-3xl font-bold text-amber-100">{stats.pending}</p>
                        </div>
                        <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
                            <p className="text-xs uppercase tracking-[0.14em] text-blue-400">Auto-Approved</p>
                            <p className="mt-2 text-3xl font-bold text-blue-100">{stats.autoApproved}</p>
                        </div>
                        <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-4">
                            <p className="text-xs uppercase tracking-[0.14em] text-purple-400">SSO Users</p>
                            <p className="mt-2 text-3xl font-bold text-purple-100">{stats.ssoUsers}</p>
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

                    {activeTab === 'users' && (
                        <section className="mt-6">
                            <div className="flex items-center justify-between gap-3 mb-4">
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="text" 
                                        placeholder="Search users..." 
                                        className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none w-64"
                                    />
                                    <select className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none">
                                        <option>All Roles</option>
                                        <option>Data Analyst</option>
                                        <option>Research Lead</option>
                                        <option>Compliance Officer</option>
                                        <option>Guest Reviewer</option>
                                    </select>
                                    <select className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none">
                                        <option>All Status</option>
                                        <option>Active</option>
                                        <option>Pending</option>
                                        <option>Inactive</option>
                                    </select>
                                </div>
                                <div className="flex gap-2">
                                    {selectedUsers.length > 0 && (
                                        <button className="rounded-lg border border-blue-400/60 bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-100 hover:bg-blue-500/20 transition">
                                            Assign Role ({selectedUsers.length})
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0a1424]">
                                <table className="w-full text-sm">
                                    <thead className="bg-white/5 text-xs uppercase tracking-[0.12em] text-slate-400">
                                        <tr>
                                            <th className="px-4 py-3 text-left w-10">
                                                <input type="checkbox" className="rounded" />
                                            </th>
                                            <th className="px-4 py-3 text-left">User</th>
                                            <th className="px-4 py-3 text-left">Role</th>
                                            <th className="px-4 py-3 text-left">Status</th>
                                            <th className="px-4 py-3 text-left">Trust Score</th>
                                            <th className="px-4 py-3 text-left">Source</th>
                                            <th className="px-4 py-3 text-left">Last Active</th>
                                            <th className="px-4 py-3 text-left">Auto</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/70">
                                        {mockUsers.map(user => (
                                            <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-4 py-3">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={selectedUsers.includes(user.id)}
                                                        onChange={() => toggleUserSelection(user.id)}
                                                        className="rounded" 
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <p className="font-medium text-white">{user.name}</p>
                                                        <p className="text-xs text-slate-500">{user.email}</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-slate-200">{user.role}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusClasses[user.status]}`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${
                                                            user.status === 'active' ? 'bg-emerald-400' :
                                                            user.status === 'pending' ? 'bg-amber-400' :
                                                            user.status === 'warning' ? 'bg-rose-400' : 'bg-slate-400'
                                                        }`} />
                                                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-2 w-16 rounded-full bg-slate-700 overflow-hidden">
                                                            <div 
                                                                className={`h-full rounded-full ${
                                                                    user.trustScore >= 80 ? 'bg-emerald-400' :
                                                                    user.trustScore >= 50 ? 'bg-amber-400' : 'bg-rose-400'
                                                                }`} 
                                                                style={{ width: `${user.trustScore}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs text-slate-400">{user.trustScore}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-slate-200 capitalize">{user.source}</td>
                                                <td className="px-4 py-3 text-slate-400 text-xs">{user.lastActive}</td>
                                                <td className="px-4 py-3">
                                                    {user.autoApproved ? (
                                                        <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Auto
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-slate-500" /> Manual
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    {activeTab === 'automation' && (
                        <section className="mt-6">
                            <div className="flex items-center justify-between gap-3 mb-4">
                                <h2 className="text-lg font-semibold text-white">Automation Rules</h2>
                                <button className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10 transition">
                                    + Add Rule
                                </button>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                {rules.map(rule => (
                                    <article 
                                        key={rule.id}
                                        className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0a1424] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.28)]"
                                    >
                                        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.15),transparent_45%)]" />
                                        <div className="relative flex items-start justify-between gap-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${
                                                        rule.type === 'provisioning' ? 'border-emerald-500/40 text-emerald-300' :
                                                        rule.type === 'deprovisioning' ? 'border-rose-500/40 text-rose-300' :
                                                        rule.type === 'role_assignment' ? 'border-blue-500/40 text-blue-300' :
                                                        rule.type === 'access_review' ? 'border-amber-500/40 text-amber-300' :
                                                        'border-purple-500/40 text-purple-300'
                                                    }`}>
                                                        {rule.type.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <h3 className="mt-2 text-base font-semibold text-white">{rule.name}</h3>
                                                <p className="mt-1 text-sm text-slate-400">{rule.description}</p>
                                            </div>
                                            <button 
                                                onClick={() => toggleRule(rule.id)}
                                                className={`relative h-6 w-11 rounded-full transition-colors ${
                                                    rule.enabled ? 'bg-emerald-500' : 'bg-slate-600'
                                                }`}
                                            >
                                                <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                                                    rule.enabled ? 'left-6' : 'left-1'
                                                }`} />
                                            </button>
                                        </div>
                                        <div className="relative mt-4 flex items-center justify-between text-xs text-slate-500">
                                            <div className="flex gap-4">
                                                <span><strong className="text-slate-400">Trigger:</strong> {rule.trigger}</span>
                                                <span><strong className="text-slate-400">Action:</strong> {rule.action}</span>
                                            </div>
                                            <span>Last run: {rule.lastRun}</span>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>
                    )}

                    {activeTab === 'access-reviews' && (
                        <section className="mt-6">
                            <div className="flex items-center justify-between gap-3 mb-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Scheduled Access Reviews</h2>
                                    <p className="text-sm text-slate-400">Quarterly permission audits required for compliance</p>
                                </div>
                                <button className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10 transition">
                                    Trigger Manual Review
                                </button>
                            </div>
                            <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0a1424]">
                                <table className="w-full text-sm">
                                    <thead className="bg-white/5 text-xs uppercase tracking-[0.12em] text-slate-400">
                                        <tr>
                                            <th className="px-4 py-3 text-left">User</th>
                                            <th className="px-4 py-3 text-left">Role</th>
                                            <th className="px-4 py-3 text-left">Last Reviewed</th>
                                            <th className="px-4 py-3 text-left">Next Review</th>
                                            <th className="px-4 py-3 text-left">Status</th>
                                            <th className="px-4 py-3 text-left">Automation</th>
                                            <th className="px-4 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/70">
                                        {accessReviews.map(review => (
                                            <tr key={review.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-4 py-3 font-medium text-white">{review.user}</td>
                                                <td className="px-4 py-3 text-slate-200">{review.role}</td>
                                                <td className="px-4 py-3 text-slate-400">{review.lastReviewed}</td>
                                                <td className="px-4 py-3 text-slate-400">{review.nextReview}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${reviewStatusClasses[review.status]}`}>
                                                        {review.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-400 text-xs">{review.autoAction}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <button className="rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-100 hover:bg-cyan-500/20">
                                                        Review
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    {activeTab === 'bulk-actions' && (
                        <section className="mt-6">
                            <div className="flex items-center justify-between gap-3 mb-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Bulk Operations</h2>
                                    <p className="text-sm text-slate-400">Automated batch operations on user accounts</p>
                                </div>
                                <button className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10 transition">
                                    + Create Bulk Action
                                </button>
                            </div>
                            <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0a1424]">
                                <table className="w-full text-sm">
                                    <thead className="bg-white/5 text-xs uppercase tracking-[0.12em] text-slate-400">
                                        <tr>
                                            <th className="px-4 py-3 text-left">Action Name</th>
                                            <th className="px-4 py-3 text-right">Target Users</th>
                                            <th className="px-4 py-3 text-left">Status</th>
                                            <th className="px-4 py-3 text-left">Scheduled</th>
                                            <th className="px-4 py-3 text-left">Created By</th>
                                            <th className="px-4 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/70">
                                        {bulkActions.map(action => (
                                            <tr key={action.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-4 py-3 font-medium text-white">{action.name}</td>
                                                <td className="px-4 py-3 text-right text-slate-200">{action.targetCount}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                                                        action.status === 'completed' ? 'border-emerald-500/40 text-emerald-300' :
                                                        action.status === 'scheduled' ? 'border-blue-500/40 text-blue-300' :
                                                        action.status === 'running' ? 'border-amber-500/40 text-amber-300' :
                                                        'border-rose-500/40 text-rose-300'
                                                    }`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${
                                                            action.status === 'completed' ? 'bg-emerald-400' :
                                                            action.status === 'scheduled' ? 'bg-blue-400' :
                                                            action.status === 'running' ? 'bg-amber-400 animate-pulse' :
                                                            'bg-rose-400'
                                                        }`} />
                                                        {action.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-400">{action.scheduledTime}</td>
                                                <td className="px-4 py-3 text-slate-400">{action.createdBy}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button className="rounded-lg border border-slate-600 bg-slate-700/50 px-2 py-1 text-xs text-slate-300 hover:bg-slate-600">
                                                            View
                                                        </button>
                                                        {action.status === 'scheduled' && (
                                                            <button className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-2 py-1 text-xs text-rose-300 hover:bg-rose-500/20">
                                                                Cancel
                                                            </button>
                                                        )}
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
