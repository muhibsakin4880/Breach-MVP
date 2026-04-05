interface MetricCard {
  id: string
  title: string
  value: string | number
  trend: string
  trendUp: boolean
  aiSummary: string
  color: string
}

interface AlertItem {
  id: string
  type: 'high_risk' | 'compliance' | 
        'escrow' | 'ai_flag' | 'token'
  title: string
  description: string
  severity: 'critical' | 'high' | 'medium'
  timestamp: string
  actions: string[]
}

interface WorkflowRule {
  id: string
  title: string
  description: string
  enabled: boolean
  lastTriggered: string
  triggerCount: number
}

interface AuditEvent {
  id: string
  event: string
  participant: string
  dataset: string
  timestamp: string
  status: 'success' | 'warning' | 'error'
}

interface TokenSession {
  id: string
  tokenId: string
  participant: string
  dataset: string
  expiresAt: string
  status: 'active' | 'expiring' | 'suspicious'
}

interface AICopilotMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface NotificationItem {
  id: string
  title: string
  description: string
  read: boolean
  timestamp: string
  severity: 'info' | 'warning' | 'critical'
}

export const metrics: MetricCard[] = [
  {
    id: '1',
    title: 'Active Datasets',
    value: 24,
    trend: '+3 this week',
    trendUp: true,
    aiSummary: 'Dataset volume stable. 2 pending AI classification.',
    color: 'blue'
  },
  {
    id: '2',
    title: 'Avg Trust Score',
    value: '82/100',
    trend: '+4 this month',
    trendUp: true,
    aiSummary: 'Trust scores improving. 1 participant flagged for review.',
    color: 'green'
  },
  {
    id: '3',
    title: 'Pending Reviews',
    value: 12,
    trend: '+5 today',
    trendUp: false,
    aiSummary: '3 high-risk requests require immediate attention.',
    color: 'amber'
  },
  {
    id: '4',
    title: 'Active Escrow',
    value: '$8,420',
    trend: '4 transactions',
    trendUp: true,
    aiSummary: '1 escrow dispute pending resolution.',
    color: 'cyan'
  },
  {
    id: '5',
    title: 'Compliance Rate',
    value: '98.2%',
    trend: '-0.3% this week',
    trendUp: false,
    aiSummary: '1 compliance violation detected in audit trail.',
    color: 'green'
  }
]

export const smartAlerts: AlertItem[] = [
  {
    id: '1',
    type: 'high_risk',
    title: 'High Risk Access Request',
    description: 'part_anon_089 requesting access to Clinical Outcomes Delta. Risk score: 84/100',
    severity: 'critical',
    timestamp: '2 minutes ago',
    actions: ['Approve', 'Reject', 'Review']
  },
  {
    id: '2',
    type: 'compliance',
    title: 'Compliance Violation Detected',
    description: 'PHI field detected in Financial_Records_Q4_2025. Dataset quarantined automatically.',
    severity: 'critical',
    timestamp: '8 minutes ago',
    actions: ['Review', 'Dismiss']
  },
  {
    id: '3',
    type: 'escrow',
    title: 'Escrow Release Pending',
    description: 'ESC-2026-002 window expired. $499 pending release for Financial Tick Data.',
    severity: 'high',
    timestamp: '15 minutes ago',
    actions: ['Release', 'Review']
  },
  {
    id: '4',
    type: 'ai_flag',
    title: 'AI Flagged Dataset',
    description: 'Confidence score dropped to 23/100 for Customer_PII_Index. Immediate review required.',
    severity: 'high',
    timestamp: '32 minutes ago',
    actions: ['Review', 'Quarantine', 'Dismiss']
  },
  {
    id: '5',
    type: 'token',
    title: 'Token Expiry Warning',
    description: '247 tokens expiring within 1 hour. 3 marked as suspicious.',
    severity: 'medium',
    timestamp: '1 hour ago',
    actions: ['Review', 'Revoke All', 'Dismiss']
  }
]

export const workflowRules: WorkflowRule[] = [
  {
    id: '1',
    title: 'Auto-approve Tier 1 Datasets',
    description: 'Automatically approve datasets with confidence score above 90/100',
    enabled: true,
    lastTriggered: '2 hours ago',
    triggerCount: 847
  },
  {
    id: '2',
    title: 'Auto-revoke Expired Tokens',
    description: 'Automatically revoke all tokens past expiry time',
    enabled: true,
    lastTriggered: '14 minutes ago',
    triggerCount: 1893
  },
  {
    id: '3',
    title: 'Auto-quarantine PHI Datasets',
    description: 'Quarantine any dataset where PHI is detected by AI scan',
    enabled: true,
    lastTriggered: '8 minutes ago',
    triggerCount: 23
  },
  {
    id: '4',
    title: 'Auto-flag High Risk Requests',
    description: 'Flag access requests with risk score above 70 for manual review',
    enabled: true,
    lastTriggered: '2 minutes ago',
    triggerCount: 312
  },
  {
    id: '5',
    title: 'Auto-release Dispute-free Escrow',
    description: 'Release escrow funds after 14-day dispute window with no disputes',
    enabled: false,
    lastTriggered: 'Never',
    triggerCount: 0
  }
]

export const recentAuditEvents: AuditEvent[] = [
  {
    id: '1',
    event: 'Dataset Access Approved',
    participant: 'part_anon_042',
    dataset: 'Global Climate 2020-2024',
    timestamp: '09:14:02',
    status: 'success'
  },
  {
    id: '2',
    event: 'PHI Detected — Quarantined',
    participant: 'part_anon_089',
    dataset: 'Financial_Records_Q4_2025',
    timestamp: '09:08:44',
    status: 'error'
  },
  {
    id: '3',
    event: 'Escrow Released',
    participant: 'part_anon_017',
    dataset: 'Financial Tick Data',
    timestamp: '08:55:12',
    status: 'success'
  },
  {
    id: '4',
    event: 'Token Revoked — IP Anomaly',
    participant: 'part_anon_031',
    dataset: 'Clinical Outcomes Delta',
    timestamp: '08:41:33',
    status: 'warning'
  },
  {
    id: '5',
    event: 'New Participant Approved',
    participant: 'part_anon_103',
    dataset: '—',
    timestamp: '08:23:17',
    status: 'success'
  }
]

export const activeTokens: TokenSession[] = [
  {
    id: '1',
    tokenId: 'TKN-a3f8b2c1',
    participant: 'part_anon_042',
    dataset: 'Clinical Outcomes Delta',
    expiresAt: '01:23:44 remaining',
    status: 'active'
  },
  {
    id: '2',
    tokenId: 'TKN-d9e2f4a7',
    participant: 'part_anon_017',
    dataset: 'Financial Tick Data',
    expiresAt: '00:08:12 remaining',
    status: 'expiring'
  },
  {
    id: '3',
    tokenId: 'TKN-b7c1e3d5',
    participant: 'part_anon_089',
    dataset: 'Genomics Research Dataset',
    expiresAt: '00:44:22 remaining',
    status: 'suspicious'
  }
]

export const aiChatHistory: AICopilotMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content: "Admin Co-Pilot ready. I have reviewed today's activity. 3 critical alerts require your immediate attention.",
    timestamp: '09:00:00'
  }
]

export const notifications: NotificationItem[] = [
  {
    id: '1',
    title: 'High Risk Request',
    description: 'part_anon_089 requesting Clinical data',
    read: false,
    timestamp: '2 min ago',
    severity: 'critical'
  },
  {
    id: '2',
    title: 'PHI Detected',
    description: 'Dataset quarantined automatically',
    read: false,
    timestamp: '8 min ago',
    severity: 'critical'
  },
  {
    id: '3',
    title: 'Escrow Ready',
    description: 'ESC-2026-002 ready for release',
    read: false,
    timestamp: '15 min ago',
    severity: 'warning'
  },
  {
    id: '4',
    title: 'New Participant',
    description: 'part_anon_103 approved and onboarded',
    read: true,
    timestamp: '1 hour ago',
    severity: 'info'
  },
  {
    id: '5',
    title: 'Compliance Report',
    description: 'Monthly report generated successfully',
    read: true,
    timestamp: '2 hours ago',
    severity: 'info'
  }
]