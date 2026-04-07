export type UsageSummaryStat = {
    label: string
    value: string
    hint: string
}

export type UsageDatasetRow = {
    dataset: string
    queries: string
    lastActive: string
    quota: string
    chargeback: string
}

export type UsageTrendPoint = {
    label: string
    value: number
}

export type UsageAnomaly = {
    title: string
    detail: string
    action: string
    status: string
    tone: 'alert' | 'warn' | 'resolved'
}

export type ParticipantApiCredential = {
    maskedKey: string
    statusLabel: string
    environment: string
    metrics: string[]
    scopes: string[]
    lastRotated: string
    residencyNote: string
}

export type CredentialHistoryItem = {
    label: string
    timestamp: string
    status: 'current' | 'success' | 'info'
}

export type RecentApiActivityItem = {
    id: string
    route: string
    dataset: string
    result: string
    timestamp: string
    tone: 'success' | 'pending' | 'info'
}

export type PolicyEventItem = {
    id: string
    title: string
    detail: string
    timestamp: string
    tone: 'info' | 'warn' | 'success'
}

export const usageSummaryStats: UsageSummaryStat[] = [
    { label: 'API Calls This Month', value: '12,847', hint: 'Month-to-date for this participant workspace' },
    { label: 'Datasets With Live Usage', value: '4', hint: 'Approved routes generating traffic right now' },
    { label: 'Projected Chargeback', value: '$8,420', hint: 'Current billing window before settlement fees' },
    { label: 'Policy Events Requiring Review', value: '2', hint: 'Export and quota controls still need attention' }
]

export const usageDatasetRows: UsageDatasetRow[] = [
    { dataset: 'Financial Market Tick Data', queries: '5,842', lastActive: '2h ago', quota: '61% of daily call cap', chargeback: '$4,180' },
    { dataset: 'Urban Traffic Flow Patterns', queries: '3,904', lastActive: '4h ago', quota: '48% of streaming quota', chargeback: '$2,930' },
    { dataset: 'Consumer Behavior Analytics', queries: '1,921', lastActive: 'Yesterday', quota: '33% of daily call cap', chargeback: '$1,310' },
    { dataset: 'Clinical Outcomes Delta', queries: '1,180', lastActive: 'Today · 07:34', quota: '22% of daily call cap', chargeback: '$890' }
]

export const usageTrendData: UsageTrendPoint[] = [
    { label: 'Mon', value: 1620 },
    { label: 'Tue', value: 1780 },
    { label: 'Wed', value: 1650 },
    { label: 'Thu', value: 1890 },
    { label: 'Fri', value: 2120 },
    { label: 'Sat', value: 1740 },
    { label: 'Sun', value: 2047 }
]

export const usageAnomalies: UsageAnomaly[] = [
    {
        title: 'Burst usage nearing daily cap',
        detail: 'Financial Market Tick Data consumed 82% of its daily allowance during the last six-hour window.',
        action: 'Review batching or cap non-essential queries before soft throttles engage.',
        status: 'Needs review',
        tone: 'warn'
    },
    {
        title: 'Raw export guardrail stayed blocked',
        detail: 'A raw export request remained blocked until manual approval is completed.',
        action: 'Open Audit Trail or Compliance Passport for the related policy event.',
        status: 'Waiting on approval',
        tone: 'alert'
    },
    {
        title: 'Credential rotation completed cleanly',
        detail: 'Production traffic continued without failed calls after the latest key rotation.',
        action: 'No further action required.',
        status: 'Stable',
        tone: 'resolved'
    }
]

export const participantApiCredential: ParticipantApiCredential = {
    maskedKey: 'br_live_••••••••••••••••••••••',
    statusLabel: '1 active production key',
    environment: 'Northbridge Research Labs / Production',
    metrics: ['12,847 calls this month', '4 datasets with live usage', 'Last used 2h ago'],
    scopes: ['datasets:read', 'access-requests:write', 'audit:read'],
    lastRotated: 'Feb 18, 2026',
    residencyNote: 'Key material is hashed at rest and aligned to your current residency controls.'
}

export const credentialHistory: CredentialHistoryItem[] = [
    { label: 'Rotated production key for research workspace', timestamp: 'Feb 18, 2026 - 14:10', status: 'current' },
    { label: 'Expanded scope to include audit trail reads', timestamp: 'Feb 08, 2026 - 09:18', status: 'info' },
    { label: 'Removed legacy staging key after review', timestamp: 'Feb 12, 2026 - 11:42', status: 'success' }
]

export const recentApiActivity: RecentApiActivityItem[] = [
    {
        id: 'api-1',
        route: 'GET /v1/datasets',
        dataset: 'Financial Market Tick Data',
        result: '200 OK · 240 records returned',
        timestamp: '09:14:02',
        tone: 'success'
    },
    {
        id: 'api-2',
        route: 'POST /v1/access-requests',
        dataset: 'Global Climate Observations 2020-2024',
        result: 'Reviewer clarification note received',
        timestamp: '08:47:15',
        tone: 'pending'
    },
    {
        id: 'api-3',
        route: 'GET /v1/audit/logs',
        dataset: 'Workspace policy bundle',
        result: '32 entries exported',
        timestamp: '08:02:48',
        tone: 'info'
    }
]

export const policyEvents: PolicyEventItem[] = [
    {
        id: 'pol-1',
        title: 'Residency guardrail matched current workspace region',
        detail: 'API requests for US-only datasets remained pinned to the approved deployment model.',
        timestamp: 'Today · 08:47',
        tone: 'success'
    },
    {
        id: 'pol-2',
        title: 'Raw export request escalated to manual approval',
        detail: 'Critical dataset export remained blocked until dual approval is completed.',
        timestamp: 'Today · 07:34',
        tone: 'warn'
    },
    {
        id: 'pol-3',
        title: 'Rate-limit policy applied to burst traffic',
        detail: 'An automated cap prevented a short-lived spike from creating downstream drift.',
        timestamp: 'Today · 07:12',
        tone: 'info'
    }
]

export const chargebackSummary = {
    totalBillableUsage: '$8,420',
    settlementFee: '$1,263',
    providerPayouts: '$7,157'
}
