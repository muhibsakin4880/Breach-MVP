import { useState, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import { useAuth } from '../../contexts/AuthContext'

type StatusTone = 'active' | 'pending' | 'suspended' | 'review' | 'compliant' | 'non_compliant'

type Provider = {
    id: string
    name: string
    email: string
    industry: string
    status: StatusTone
    trustScore: number
    datasetsCount: number
    lastSubmission: string
    autoApproved: boolean
    complianceStatus: 'compliant' | 'pending' | 'expired' | 'non_compliant'
    certExpiry: string
}

type Dataset = {
    id: string
    name: string
    provider: string
    category: string
    size: string
    status: 'published' | 'draft' | 'under_review' | 'rejected' | 'archived'
    validationStatus: 'passed' | 'failed' | 'pending' | 'auto_approved'
    trustScore: number
    lastUpdated: string
    autoPublished: boolean
    complianceFlags: number
}

type AutomationRule = {
    id: string
    name: string
    description: string
    enabled: boolean
    trigger: string
    action: string
    lastRun: string
    type: 'auto_approval' | 'validation' | 'trust_score' | 'compliance' | 'publishing'
}

type ComplianceAlert = {
    id: string
    provider: string
    type: 'cert_expiry' | 'renewal_required' | 'non_compliance' | 'validation_failed'
    severity: 'low' | 'medium' | 'high' | 'critical'
    message: string
    createdAt: string
    autoAction: string
}

type BulkAction = {
    id: string
    name: string
    targetCount: number
    type: 'validation' | 'recalculate_trust' | 'publish' | 'archive' | 'compliance_scan'
    status: 'scheduled' | 'running' | 'completed' | 'failed'
    scheduledTime: string
    createdBy: string
}

const mockProviders: Provider[] = [
    { id: 'p-001', name: 'MedData Solutions', email: 'ops@meddata.io', industry: 'Healthcare', status: 'active', trustScore: 94, datasetsCount: 12, lastSubmission: '2 hours ago', autoApproved: true, complianceStatus: 'compliant', certExpiry: '2026-09-15' },
    { id: 'p-002', name: 'FinVault Analytics', email: 'admin@finvault.com', industry: 'Financial', status: 'active', trustScore: 91, datasetsCount: 8, lastSubmission: '1 day ago', autoApproved: true, complianceStatus: 'compliant', certExpiry: '2026-07-20' },
    { id: 'p-003', name: 'Climate Research Institute', email: 'data@climate.org', industry: 'Research', status: 'pending', trustScore: 0, datasetsCount: 0, lastSubmission: 'Never', autoApproved: false, complianceStatus: 'pending', certExpiry: '-' },
    { id: 'p-004', name: 'GovData Portal', email: 'secure@govdata.gov', industry: 'Government', status: 'active', trustScore: 88, datasetsCount: 5, lastSubmission: '3 days ago', autoApproved: false, complianceStatus: 'compliant', certExpiry: '2026-11-30' },
    { id: 'p-005', name: 'PharmaCorp Trials', email: 'trials@pharmacorp.com', industry: 'Healthcare', status: 'review', trustScore: 72, datasetsCount: 3, lastSubmission: '5 days ago', autoApproved: false, complianceStatus: 'expired', certExpiry: '2026-02-28' },
    { id: 'p-006', name: 'Market Insights LLC', email: 'insights@market.io', industry: 'Financial', status: 'suspended', trustScore: 45, datasetsCount: 2, lastSubmission: '30 days ago', autoApproved: false, complianceStatus: 'non_compliant', certExpiry: '2026-01-15' },
    { id: 'p-007', name: 'BioGen Data', email: 'science@biogen.io', industry: 'Healthcare', status: 'active', trustScore: 89, datasetsCount: 7, lastSubmission: '12 hours ago', autoApproved: true, complianceStatus: 'compliant', certExpiry: '2026-08-10' },
    { id: 'p-008', name: 'EconMetrics', email: 'data@econmetrics.com', industry: 'Financial', status: 'active', trustScore: 86, datasetsCount: 4, lastSubmission: '6 hours ago', autoApproved: true, complianceStatus: 'compliant', certExpiry: '2026-10-25' },
]

const mockDatasets: Dataset[] = [
    { id: 'd-001', name: 'Clinical Outcomes Delta', provider: 'MedData Solutions', category: 'Healthcare', size: '2.4 GB', status: 'published', validationStatus: 'auto_approved', trustScore: 96, lastUpdated: '1 hour ago', autoPublished: true, complianceFlags: 0 },
    { id: 'd-002', name: 'Financial Tick Data Q4', provider: 'FinVault Analytics', category: 'Financial', size: '8.7 GB', status: 'published', validationStatus: 'passed', trustScore: 92, lastUpdated: '2 days ago', autoPublished: false, complianceFlags: 0 },
    { id: 'd-003', name: 'Global Temperature Anomalies', provider: 'Climate Research Institute', category: 'Climate', size: '1.2 GB', status: 'under_review', validationStatus: 'pending', trustScore: 0, lastUpdated: '3 days ago', autoPublished: false, complianceFlags: 0 },
    { id: 'd-004', name: 'Public Health Records (Anonymized)', provider: 'MedData Solutions', category: 'Healthcare', size: '5.1 GB', status: 'published', validationStatus: 'auto_approved', trustScore: 94, lastUpdated: '5 hours ago', autoPublished: true, complianceFlags: 1 },
    { id: 'd-005', name: 'Market Sentiment Analysis', provider: 'Market Insights LLC', category: 'Financial', size: '450 MB', status: 'rejected', validationStatus: 'failed', trustScore: 0, lastUpdated: '10 days ago', autoPublished: false, complianceFlags: 3 },
    { id: 'd-006', name: 'Drug Trial Results Phase III', provider: 'PharmaCorp Trials', category: 'Healthcare', size: '3.8 GB', status: 'under_review', validationStatus: 'pending', trustScore: 0, lastUpdated: '1 week ago', autoPublished: false, complianceFlags: 0 },
    { id: 'd-007', name: 'Treasury Bond Yields', provider: 'EconMetrics', category: 'Financial', size: '890 MB', status: 'published', validationStatus: 'auto_approved', trustScore: 88, lastUpdated: '4 hours ago', autoPublished: true, complianceFlags: 0 },
    { id: 'd-008', name: 'Emergency Response Dataset', provider: 'GovData Portal', category: 'Government', size: '12.3 GB', status: 'published', validationStatus: 'passed', trustScore: 91, lastUpdated: '2 weeks ago', autoPublished: false, complianceFlags: 0 },
]

const automationRules: AutomationRule[] = [
    { id: 'ar-1', name: 'Auto-Approve Trusted Providers', description: 'Automatically approve providers with trust score > 85 and valid compliance', enabled: true, trigger: 'New provider application', action: 'Auto-approve + onboard', lastRun: '1 hour ago', type: 'auto_approval' },
    { id: 'ar-2', name: 'Dataset Validation Scan', description: 'Run automated validation checks on uploaded datasets', enabled: true, trigger: 'Dataset upload', action: 'Scan + generate report', lastRun: '30 min ago', type: 'validation' },
    { id: 'ar-3', name: 'Trust Score Recalculation', description: 'Batch recalculate trust scores for all active datasets', enabled: true, trigger: 'Daily at 2:00 AM', action: 'Recalculate all scores', lastRun: 'Yesterday 2:00 AM', type: 'trust_score' },
    { id: 'ar-4', name: 'Compliance Certification Check', description: 'Verify provider compliance certifications are current', enabled: true, trigger: 'Daily at 6:00 AM', action: 'Check + alert if expired', lastRun: 'Today 6:00 AM', type: 'compliance' },
    { id: 'ar-5', name: 'Auto-Publish Low-Risk Datasets', description: 'Automatically publish datasets with validation passed and trust score > 80', enabled: false, trigger: 'Validation passed', action: 'Auto-publish', lastRun: 'Never', type: 'publishing' },
    { id: 'ar-6', name: 'Expired Certificate Notification', description: 'Alert providers 30 days before compliance certificate expiry', enabled: true, trigger: '30 days before expiry', action: 'Send renewal reminder', lastRun: 'Today 6:00 AM', type: 'compliance' },
]

const complianceAlerts: ComplianceAlert[] = [
    { id: 'ca-001', provider: 'PharmaCorp Trials', type: 'cert_expiry', severity: 'high', message: 'HIPAA certification expired on 2026-02-28', createdAt: '5 days ago', autoAction: 'Suspended pending renewal' },
    { id: 'ca-002', provider: 'Market Insights LLC', type: 'non_compliance', severity: 'critical', message: 'SOC 2 compliance validation failed - multiple gaps detected', createdAt: '3 days ago', autoAction: 'Auto-suspended all datasets' },
    { id: 'ca-003', provider: 'Climate Research Institute', type: 'renewal_required', severity: 'medium', message: 'IRB certification expires in 15 days', createdAt: '2 days ago', autoAction: 'Sent renewal reminder' },
    { id: 'ca-004', provider: 'MedData Solutions', type: 'validation_failed', severity: 'low', message: ' PHI detection flagged in dataset d-004 - review required', createdAt: '1 day ago', autoAction: 'Quarantined pending review' },
]

const bulkActions: BulkAction[] = [
    { id: 'ba-001', name: 'Validate All Healthcare Datasets', targetCount: 15, type: 'validation', status: 'completed', scheduledTime: '2026-03-25 03:00', createdBy: 'admin_001' },
    { id: 'ba-002', name: 'Recalculate Trust Scores', targetCount: 42, type: 'recalculate_trust', status: 'scheduled', scheduledTime: '2026-03-26 02:00', createdBy: 'admin_002' },
    { id: 'ba-003', name: 'Compliance Scan - Financial', targetCount: 18, type: 'compliance_scan', status: 'running', scheduledTime: '2026-03-25 14:00', createdBy: 'admin_001' },
    { id: 'ba-004', name: 'Archive Draft Datasets (90+ days)', targetCount: 7, type: 'archive', status: 'scheduled', scheduledTime: '2026-03-27 04:00', createdBy: 'admin_003' },
]

const statusClasses: Record<StatusTone, string> = {
    active: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30',
    pending: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
    suspended: 'text-rose-300 bg-rose-500/10 border-rose-500/30',
    review: 'text-blue-300 bg-blue-500/10 border-blue-500/30',
    compliant: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30',
    non_compliant: 'text-rose-300 bg-rose-500/10 border-rose-500/30'
}

const datasetStatusClasses: Record<string, string> = {
    published: 'text-emerald-300 bg-emerald-500/10',
    draft: 'text-slate-400 bg-slate-500/10',
    under_review: 'text-amber-300 bg-amber-500/10',
    rejected: 'text-rose-300 bg-rose-500/10',
    archived: 'text-slate-500 bg-slate-600/10'
}

const validationClasses: Record<string, string> = {
    passed: 'text-emerald-300 bg-emerald-500/10',
    failed: 'text-rose-300 bg-rose-500/10',
    pending: 'text-amber-300 bg-amber-500/10',
    auto_approved: 'text-cyan-300 bg-cyan-500/10'
}

const bulkStatusClasses: Record<string, string> = {
    completed: 'text-emerald-300',
    scheduled: 'text-blue-300',
    running: 'text-amber-300',
    failed: 'text-rose-300'
}

export default function ProviderDatasetManagementPage({ title = 'Provider & Dataset Management', subtitle = 'Automated provider approval, dataset validation & compliance' }: { title?: string, subtitle?: string }) {
    const auth = useAuth()
    const [activeTab, setActiveTab] = useState<'providers' | 'datasets' | 'automation' | 'compliance' | 'bulk-actions'>('providers')
    const [selectedItems, setSelectedItems] = useState<string[]>([])
    const [rules, setRules] = useState<AutomationRule[]>(automationRules)

    if (!auth.isAuthenticated) {
        return <Navigate to="/admin/login" replace />
    }

    const toggleSelection = (id: string) => {
        setSelectedItems(prev => 
            prev.includes(id) 
                ? prev.filter(item => item !== id)
                : [...prev, id]
        )
    }

    const toggleRule = (ruleId: string) => {
        setRules(prev => prev.map(rule => 
            rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
        ))
    }

    const stats = useMemo(() => ({
        totalProviders: mockProviders.length,
        activeProviders: mockProviders.filter(p => p.status === 'active').length,
        pendingProviders: mockProviders.filter(p => p.status === 'pending').length,
        totalDatasets: mockDatasets.length,
        publishedDatasets: mockDatasets.filter(d => d.status === 'published').length,
        underReview: mockDatasets.filter(d => d.status === 'under_review').length,
        autoApproved: mockDatasets.filter(d => d.autoPublished).length,
        complianceAlerts: complianceAlerts.length
    }), [])

    const tabs = [
        { id: 'providers', label: 'Providers', count: stats.totalProviders },
        { id: 'datasets', label: 'Datasets', count: stats.totalDatasets },
        { id: 'automation', label: 'Automation Rules', count: rules.filter(r => r.enabled).length },
        { id: 'compliance', label: 'Compliance Alerts', count: stats.complianceAlerts },
        { id: 'bulk-actions', label: 'Bulk Operations', count: bulkActions.filter(b => b.status === 'scheduled' || b.status === 'running').length }
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
                            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">Provider & Dataset Management</h1>
                            <p className="mt-2 max-w-2xl text-slate-400">
                                Automated provider onboarding, dataset validation, trust scoring, and compliance management.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button className="rounded-xl border border-cyan-400/60 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-100 shadow-[0_10px_30px_rgba(34,211,238,0.22)] hover:bg-cyan-500/20 transition">
                                + Add Provider
                            </button>
                            <button className="rounded-xl border border-emerald-400/60 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-100 shadow-[0_10px_30px_rgba(16,185,129,0.22)] hover:bg-emerald-500/20 transition">
                                Upload Dataset
                            </button>
                        </div>
                    </header>

                    <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div className="rounded-xl border border-white/10 bg-[#0a1424] p-4">
                            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Total Providers</p>
                            <p className="mt-2 text-3xl font-bold text-white">{stats.totalProviders}</p>
                        </div>
                        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                            <p className="text-xs uppercase tracking-[0.14em] text-emerald-400">Active Providers</p>
                            <p className="mt-2 text-3xl font-bold text-emerald-100">{stats.activeProviders}</p>
                        </div>
                        <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
                            <p className="text-xs uppercase tracking-[0.14em] text-blue-400">Total Datasets</p>
                            <p className="mt-2 text-3xl font-bold text-blue-100">{stats.totalDatasets}</p>
                        </div>
                        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                            <p className="text-xs uppercase tracking-[0.14em] text-amber-400">Under Review</p>
                            <p className="mt-2 text-3xl font-bold text-amber-100">{stats.underReview}</p>
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

                    {activeTab === 'providers' && (
                        <section className="mt-6">
                            <div className="flex items-center justify-between gap-3 mb-4">
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="text" 
                                        placeholder="Search providers..." 
                                        className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none w-64"
                                    />
                                    <select className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none">
                                        <option>All Industries</option>
                                        <option>Healthcare</option>
                                        <option>Financial</option>
                                        <option>Government</option>
                                        <option>Research</option>
                                    </select>
                                    <select className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none">
                                        <option>All Status</option>
                                        <option>Active</option>
                                        <option>Pending</option>
                                        <option>Suspended</option>
                                        <option>Under Review</option>
                                    </select>
                                </div>
                                <div className="flex gap-2">
                                    {selectedItems.length > 0 && (
                                        <button className="rounded-lg border border-blue-400/60 bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-100 hover:bg-blue-500/20 transition">
                                            Approve ({selectedItems.length})
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
                                            <th className="px-4 py-3 text-left">Provider</th>
                                            <th className="px-4 py-3 text-left">Industry</th>
                                            <th className="px-4 py-3 text-left">Status</th>
                                            <th className="px-4 py-3 text-left">Trust Score</th>
                                            <th className="px-4 py-3 text-right">Datasets</th>
                                            <th className="px-4 py-3 text-left">Compliance</th>
                                            <th className="px-4 py-3 text-left">Cert Expiry</th>
                                            <th className="px-4 py-3 text-left">Auto</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/70">
                                        {mockProviders.map(provider => (
                                            <tr key={provider.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-4 py-3">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={selectedItems.includes(provider.id)}
                                                        onChange={() => toggleSelection(provider.id)}
                                                        className="rounded" 
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <p className="font-medium text-white">{provider.name}</p>
                                                        <p className="text-xs text-slate-500">{provider.email}</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-slate-200">{provider.industry}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusClasses[provider.status]}`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${
                                                            provider.status === 'active' ? 'bg-emerald-400' :
                                                            provider.status === 'pending' ? 'bg-amber-400' :
                                                            provider.status === 'suspended' ? 'bg-rose-400' : 'bg-blue-400'
                                                        }`} />
                                                        {provider.status.charAt(0).toUpperCase() + provider.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-2 w-16 rounded-full bg-slate-700 overflow-hidden">
                                                            <div 
                                                                className={`h-full rounded-full ${
                                                                    provider.trustScore >= 80 ? 'bg-emerald-400' :
                                                                    provider.trustScore >= 50 ? 'bg-amber-400' : 'bg-rose-400'
                                                                }`} 
                                                                style={{ width: `${provider.trustScore}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs text-slate-400">{provider.trustScore}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right text-slate-200">{provider.datasetsCount}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                                                        provider.complianceStatus === 'compliant' ? 'border-emerald-500/40 text-emerald-300' :
                                                        provider.complianceStatus === 'pending' ? 'border-amber-500/40 text-amber-300' :
                                                        'border-rose-500/40 text-rose-300'
                                                    }`}>
                                                        {provider.complianceStatus.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-400 text-xs">{provider.certExpiry}</td>
                                                <td className="px-4 py-3">
                                                    {provider.autoApproved ? (
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

                    {activeTab === 'datasets' && (
                        <section className="mt-6">
                            <div className="flex items-center justify-between gap-3 mb-4">
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="text" 
                                        placeholder="Search datasets..." 
                                        className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none w-64"
                                    />
                                    <select className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none">
                                        <option>All Categories</option>
                                        <option>Healthcare</option>
                                        <option>Financial</option>
                                        <option>Government</option>
                                        <option>Climate</option>
                                    </select>
                                    <select className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none">
                                        <option>All Status</option>
                                        <option>Published</option>
                                        <option>Under Review</option>
                                        <option>Draft</option>
                                        <option>Rejected</option>
                                    </select>
                                </div>
                            </div>
                            <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0a1424]">
                                <table className="w-full text-sm">
                                    <thead className="bg-white/5 text-xs uppercase tracking-[0.12em] text-slate-400">
                                        <tr>
                                            <th className="px-4 py-3 text-left">Dataset</th>
                                            <th className="px-4 py-3 text-left">Provider</th>
                                            <th className="px-4 py-3 text-left">Category</th>
                                            <th className="px-4 py-3 text-left">Status</th>
                                            <th className="px-4 py-3 text-left">Validation</th>
                                            <th className="px-4 py-3 text-left">Trust Score</th>
                                            <th className="px-4 py-3 text-left">Size</th>
                                            <th className="px-4 py-3 text-left">Updated</th>
                                            <th className="px-4 py-3 text-left">Auto</th>
                                            <th className="px-4 py-3 text-right">Flags</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/70">
                                        {mockDatasets.map(dataset => (
                                            <tr key={dataset.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <p className="font-medium text-white">{dataset.name}</p>
                                                        <p className="text-xs text-slate-500">{dataset.id}</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-slate-200">{dataset.provider}</td>
                                                <td className="px-4 py-3 text-slate-200">{dataset.category}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${datasetStatusClasses[dataset.status]}`}>
                                                        {dataset.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${validationClasses[dataset.validationStatus]}`}>
                                                        {dataset.validationStatus.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-2 w-16 rounded-full bg-slate-700 overflow-hidden">
                                                            <div 
                                                                className={`h-full rounded-full ${
                                                                    dataset.trustScore >= 80 ? 'bg-emerald-400' :
                                                                    dataset.trustScore >= 50 ? 'bg-amber-400' : 'bg-rose-400'
                                                                }`} 
                                                                style={{ width: `${dataset.trustScore}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs text-slate-400">{dataset.trustScore}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-slate-400 text-xs">{dataset.size}</td>
                                                <td className="px-4 py-3 text-slate-400 text-xs">{dataset.lastUpdated}</td>
                                                <td className="px-4 py-3">
                                                    {dataset.autoPublished ? (
                                                        <span className="inline-flex items-center gap-1 text-xs text-cyan-400">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" /> Auto
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-slate-500" /> Manual
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {dataset.complianceFlags > 0 ? (
                                                        <span className="inline-flex items-center rounded-full bg-rose-500/20 px-2 py-1 text-xs font-semibold text-rose-300">
                                                            {dataset.complianceFlags}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-600">-</span>
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
                                                        rule.type === 'auto_approval' ? 'border-emerald-500/40 text-emerald-300' :
                                                        rule.type === 'validation' ? 'border-blue-500/40 text-blue-300' :
                                                        rule.type === 'trust_score' ? 'border-purple-500/40 text-purple-300' :
                                                        rule.type === 'compliance' ? 'border-amber-500/40 text-amber-300' :
                                                        'border-cyan-500/40 text-cyan-300'
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

                    {activeTab === 'compliance' && (
                        <section className="mt-6">
                            <div className="flex items-center justify-between gap-3 mb-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Compliance Alerts</h2>
                                    <p className="text-sm text-slate-400">Automated compliance monitoring and alerts</p>
                                </div>
                                <button className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10 transition">
                                    Run Compliance Scan
                                </button>
                            </div>
                            <div className="space-y-3">
                                {complianceAlerts.map(alert => (
                                    <article 
                                        key={alert.id}
                                        className="relative overflow-hidden rounded-xl border bg-[#0a1424] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.28)]"
                                    >
                                        <div className={`absolute inset-0 opacity-10 ${
                                            alert.severity === 'critical' ? 'bg-rose-500' :
                                            alert.severity === 'high' ? 'bg-orange-500' :
                                            alert.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                                        }`} />
                                        <div className="relative flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-3">
                                                <div className={`mt-1 h-2 w-2 rounded-full ${
                                                    alert.severity === 'critical' ? 'bg-rose-500' :
                                                    alert.severity === 'high' ? 'bg-orange-500' :
                                                    alert.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                                                }`} />
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${
                                                            alert.severity === 'critical' ? 'border-rose-500/40 text-rose-300' :
                                                            alert.severity === 'high' ? 'border-orange-500/40 text-orange-300' :
                                                            alert.severity === 'medium' ? 'border-amber-500/40 text-amber-300' :
                                                            'border-blue-500/40 text-blue-300'
                                                        }`}>
                                                            {alert.severity}
                                                        </span>
                                                        <span className="text-xs text-slate-500">{alert.type.replace('_', ' ')}</span>
                                                    </div>
                                                    <p className="mt-1 text-sm text-white">{alert.message}</p>
                                                    <p className="mt-1 text-xs text-slate-500">Provider: {alert.provider} · {alert.createdAt}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-slate-500">Auto-Action</p>
                                                <p className="text-sm text-amber-300">{alert.autoAction}</p>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>
                    )}

                    {activeTab === 'bulk-actions' && (
                        <section className="mt-6">
                            <div className="flex items-center justify-between gap-3 mb-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Bulk Operations</h2>
                                    <p className="text-sm text-slate-400">Automated batch operations on providers and datasets</p>
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
                                            <th className="px-4 py-3 text-left">Type</th>
                                            <th className="px-4 py-3 text-right">Target</th>
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
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                                                        action.type === 'validation' ? 'border-blue-500/40 text-blue-300' :
                                                        action.type === 'recalculate_trust' ? 'border-purple-500/40 text-purple-300' :
                                                        action.type === 'compliance_scan' ? 'border-amber-500/40 text-amber-300' :
                                                        'border-slate-500/40 text-slate-300'
                                                    }`}>
                                                        {action.type.replace('_', ' ')}
                                                    </span>
                                                </td>
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
