export type UsageSummaryStat = {
    label: string
    value: string
    hint: string
}

export type UsageDatasetRow = {
    dataset: string
    queries: string
    participants: number
    confidence: string
    revenue: string
}

export type UsageTrendPoint = {
    label: string
    value: number
}

export type UsageAnomaly = {
    id: string
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
    { label: 'Total API Calls This Month', value: '48,291', hint: 'Month-to-date' },
    { label: 'Active Participants', value: '89', hint: 'Signed-in uniques' },
    { label: 'Datasets Queried', value: '24', hint: 'Distinct datasets' },
    { label: 'Anomalous Queries Flagged', value: '3', hint: 'Requires review' }
]

export const usageDatasetRows: UsageDatasetRow[] = [
    { dataset: 'Global Climate 2020-2024', queries: '12,847', participants: 34, confidence: '96%', revenue: '$9,847' },
    { dataset: 'Financial Tick Data', queries: '9,234', participants: 21, confidence: '94%', revenue: '$7,234' },
    { dataset: 'Consumer Behavior Analytics', queries: '7,891', participants: 18, confidence: '89%', revenue: '$5,891' },
    { dataset: 'Clinical Outcomes Delta', queries: '4,234', participants: 9, confidence: '92%', revenue: '$3,234' },
    { dataset: 'Genomics Research Dataset', queries: '2,891', participants: 7, confidence: '91%', revenue: '$2,891' }
]

export const usageTrendData: UsageTrendPoint[] = [
    { label: 'Mon', value: 6200 },
    { label: 'Tue', value: 7100 },
    { label: 'Wed', value: 6800 },
    { label: 'Thu', value: 7400 },
    { label: 'Fri', value: 8200 },
    { label: 'Sat', value: 5900 },
    { label: 'Sun', value: 6691 }
]

export const usageAnomalies: UsageAnomaly[] = [
    { id: 'part_anon_031', detail: '847 calls in 10 minutes', action: 'Rate limit triggered', status: 'Flagged', tone: 'alert' },
    { id: 'part_anon_067', detail: 'Unusual geographic access pattern', action: 'Under review', status: 'Under review', tone: 'warn' },
    { id: 'part_anon_012', detail: 'Repeated failed auth attempts', action: 'Resolved', status: 'Resolved', tone: 'resolved' }
]

export const participantApiCredential: ParticipantApiCredential = {
    maskedKey: 'br_live_••••••••••••••••••••••',
    statusLabel: '1 active production key',
    environment: 'Northbridge Research Labs / Production',
    metrics: ['1,247 calls', '8 datasets', 'Last used 2h ago'],
    scopes: ['datasets:read', 'access-requests:write', 'audit:read'],
    lastRotated: 'Feb 18, 2026',
    residencyNote: 'Key material is hashed at rest and aligned to your current residency controls.'
}

export const credentialHistory: CredentialHistoryItem[] = [
    { label: 'Rotated production key for research workspace', timestamp: 'Feb 18, 2026 - 14:10', status: 'current' },
    { label: 'Removed legacy staging key after review', timestamp: 'Feb 12, 2026 - 11:42', status: 'success' },
    { label: 'Expanded scope to include audit trail reads', timestamp: 'Feb 08, 2026 - 09:18', status: 'info' }
]

export const recentApiActivity: RecentApiActivityItem[] = [
    {
        id: 'api-1',
        route: 'GET /v1/datasets',
        dataset: 'Global Climate 2020-2024',
        result: '200 OK · 240 records returned',
        timestamp: '09:14:02',
        tone: 'success'
    },
    {
        id: 'api-2',
        route: 'POST /v1/access-requests',
        dataset: 'Financial Tick Data',
        result: 'Request updated with reviewer feedback',
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
    totalBillableUsage: '$29,097',
    settlementFee: '$4,365',
    providerPayouts: '$24,732'
}
