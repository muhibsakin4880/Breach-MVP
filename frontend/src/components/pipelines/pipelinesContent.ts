import { approvedDatasets, datasetRequests } from '../../data/workspaceData'
import { participantApiCredential } from '../../data/pipelineOpsData'

export type PipelinesTab = 'overview' | 'api' | 'resources' | 'policies'

export type Endpoint = {
    id: string
    method: 'GET' | 'POST' | 'PATCH'
    path: string
    description: string
    auth: string
    note: string
}

export type SummaryCard = {
    label: string
    value: string
    hint: string
    to: string
    action: string
}

export type SdkCard = {
    id: string
    title: string
    installCommand?: string
    detail: string
    badge?: string
}

export type ResourceLink = {
    title: string
    detail: string
    to: string
    label: string
}

export const tabs: Array<{ id: PipelinesTab; label: string }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'api', label: 'API Reference' },
    { id: 'resources', label: 'SDKs & Quickstarts' },
    { id: 'policies', label: 'Usage & Policies' }
]

export const summaryCards: SummaryCard[] = [
    {
        label: 'Credential Status',
        value: participantApiCredential.statusLabel,
        hint: 'Managed in Profile & Settings',
        to: '/profile',
        action: 'Open credentials'
    },
    {
        label: 'Production Access',
        value: 'Growth plan active',
        hint: '10,000 calls per month after evaluation approval',
        to: '/usage-analytics',
        action: 'View usage'
    },
    {
        label: 'Access Workflows',
        value: `${datasetRequests.filter(request => request.status === 'REVIEW_IN_PROGRESS').length} in review`,
        hint: `${datasetRequests.filter(request => request.status === 'REQUEST_APPROVED').length} approved requests already provisioned`,
        to: '/access-requests',
        action: 'Open requests'
    },
    {
        label: 'Contribution Pipeline',
        value: `${approvedDatasets.length} active dataset routes`,
        hint: 'Uploads now start in the provider upload flow, with validation on dedicated status pages',
        to: '/provider/datasets/new',
        action: 'Open upload flow'
    }
]

export const endpoints: Endpoint[] = [
    {
        id: 'datasets-list',
        method: 'GET',
        path: '/v1/datasets',
        description: 'List datasets available to the current workspace.',
        auth: 'API key or OAuth token',
        note: 'Use filters for domain, confidence, and approval status.'
    },
    {
        id: 'datasets-detail',
        method: 'GET',
        path: '/v1/datasets/{id}',
        description: 'Fetch dataset metadata, trust metrics, and access policy.',
        auth: 'API key or OAuth token',
        note: 'Use this before submitting a governed access request.'
    },
    {
        id: 'access-create',
        method: 'POST',
        path: '/v1/access-requests',
        description: 'Create a new access request for a dataset.',
        auth: 'Scoped API key or OAuth token',
        note: 'Provide purpose, duration, and workspace usage scope.'
    },
    {
        id: 'access-update',
        method: 'PATCH',
        path: '/v1/access-requests/{id}',
        description: 'Update request rationale, duration, or approved usage scope.',
        auth: 'OAuth token',
        note: 'Use this after reviewer feedback or scope changes.'
    },
    {
        id: 'audit-list',
        method: 'GET',
        path: '/v1/audit/logs',
        description: 'Retrieve audit trail entries for requests and credential activity.',
        auth: 'OAuth token',
        note: 'Useful for compliance reviews and internal reporting.'
    }
]

export const curlExample = `curl -X GET "https://api.redoubt.io/v1/datasets?domain=climate&limit=10" \\
  -H "Authorization: Bearer $REDOUBT_API_KEY" \\
  -H "X-Workspace-Id: ws_participant_001"`

export const pythonExample = `from redoubt_sdk import RedoubtClient

client = RedoubtClient(api_key="YOUR_API_KEY", workspace_id="ws_participant_001")
datasets = client.datasets.list(domain="climate", limit=10)
print(datasets[0]["title"])`

export const jsExample = `import { RedoubtClient } from "@redoubt/sdk"

const client = new RedoubtClient({
  apiKey: process.env.REDOUBT_API_KEY,
  workspaceId: "ws_participant_001"
})

const datasets = await client.datasets.list({ domain: "climate", limit: 10 })
console.log(datasets[0].title)`

export const jsonResponseExample = `{
  "data": [
    {
      "id": "ds_1021",
      "title": "Global Climate Observations 2020-2024",
      "confidenceScore": 96,
      "verificationStatus": "Verified",
      "accessType": "Approved access required"
    }
  ],
  "meta": {
    "limit": 10,
    "nextCursor": "eyJwYWdlIjoyfQ=="
  }
}`

export const pythonQuickstart = `from redoubt_sdk import RedoubtClient

client = RedoubtClient(api_key="YOUR_API_KEY", workspace_id="ws_participant_001")

# 1) Find verified datasets
datasets = client.datasets.list(domain="Mobility", limit=5)
target = datasets[0]

# 2) Submit a governed access request
request = client.access_requests.create(
    dataset_id=target["id"],
    purpose="Model evaluation",
    duration="90_days",
    workspace_scope="Research workspace"
)

print(request["id"], request["status"])`

export const jsQuickstart = `import { RedoubtClient } from "@redoubt/sdk"

const client = new RedoubtClient({
  apiKey: process.env.REDOUBT_API_KEY,
  workspaceId: "ws_participant_001"
})

const datasets = await client.datasets.list({ domain: "Mobility", limit: 5 })
const target = datasets[0]

const request = await client.accessRequests.create({
  datasetId: target.id,
  purpose: "Model evaluation",
  duration: "90_days",
  workspaceScope: "Research workspace"
})

console.log(request.id, request.status)`

export const sdkCards: SdkCard[] = [
    {
        id: 'python-sdk',
        title: 'Python SDK',
        installCommand: 'pip install redoubt-sdk',
        detail: 'Use for dataset discovery, access requests, and workspace automation.'
    },
    {
        id: 'js-sdk',
        title: 'JavaScript / Node SDK',
        installCommand: 'npm install @redoubt/sdk',
        detail: 'Use for server-side integrations and internal developer tooling.'
    },
    {
        id: 'java-sdk',
        title: 'Java SDK',
        detail: 'Planned for enterprise JVM environments and governed data services.',
        badge: 'Coming soon'
    },
    {
        id: 'r-sdk',
        title: 'R SDK',
        detail: 'Planned for analyst and research workflows that rely on statistical tooling.',
        badge: 'Coming soon'
    }
]

export const resourceLinks: ResourceLink[] = [
    {
        title: 'Profile & Settings',
        detail: 'Review your live API key, rotate it, or revoke it when needed.',
        to: '/profile',
        label: 'Open profile'
    },
    {
        title: 'Usage Analytics',
        detail: 'Inspect query volume, dataset usage, and recurring API activity.',
        to: '/usage-analytics',
        label: 'Open usage analytics'
    },
    {
        title: 'Deployment Model',
        detail: 'Review data residency, visibility, and deployment controls.',
        to: '/deployment-model',
        label: 'Open deployment model'
    },
    {
        title: 'Audit Trail',
        detail: 'Check request history, access events, and compliance evidence.',
        to: '/audit-trail',
        label: 'Open audit trail'
    }
]

export const credentialStats = participantApiCredential.metrics.map(metric => {
    if (metric.includes('calls')) return `${metric} on the current key`
    if (metric.includes('datasets')) return `${metric} touched this month`
    return metric
})

export const policyStats = [
    { label: 'Active Policies', value: '12' },
    { label: 'Preflight Checks Today', value: '847' },
    { label: 'Blocked Operations', value: '3' },
    { label: 'Pending Approvals', value: '2' }
]

export const policyRows = [
    ['PHI Enclave Check', 'Healthcare datasets', 'Block if PHI leaves enclave'],
    ['Export Volume Limit', 'All datasets', 'Block if >10 GB per request'],
    ['Geographic Residency', 'US-only datasets', 'Block cross-border transfer'],
    ['API Rate Limiting', 'All pipelines', 'Block if >100 calls/minute'],
    ['Raw Data Export', 'Critical datasets', 'Require dual approval']
]

export const preflightRows = [
    ['PASSED', 'Global Climate 2020-2024', 'Export volume check', '09:14:02'],
    ['PASSED', 'Financial Tick Data', 'Residency check', '08:47:15'],
    ['BLOCKED', 'Clinical Outcomes Delta', 'PHI enclave violation', '08:23:44'],
    ['PASSED', 'Consumer Behavior Analytics', 'Rate limit check', '07:55:12'],
    ['BLOCKED', 'Genomics Research Dataset', 'Raw export attempted', '07:34:28']
]

export function methodStyle(method: Endpoint['method']) {
    if (method === 'GET') return 'bg-emerald-500/10 border-emerald-400/50 text-emerald-200'
    if (method === 'POST') return 'bg-blue-500/10 border-blue-400/50 text-blue-200'
    return 'bg-violet-500/10 border-violet-400/50 text-violet-200'
}
