import { useState } from 'react'

type PipelinesTab = 'overview' | 'api' | 'sdks' | 'samples' | 'downloads'

type Endpoint = {
    method: 'GET' | 'POST' | 'PATCH'
    path: string
    description: string
    auth: string
}

const tabs: Array<{ id: PipelinesTab; label: string }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'api', label: 'API Reference' },
    { id: 'sdks', label: 'SDKs' },
    { id: 'samples', label: 'Code Samples' },
    { id: 'downloads', label: 'Downloads / Links' }
]

const endpoints: Endpoint[] = [
    { method: 'GET', path: '/v1/datasets', description: 'List datasets available to current workspace.', auth: 'API key or OAuth token' },
    { method: 'GET', path: '/v1/datasets/{id}', description: 'Fetch metadata, trust metrics, and access policy.', auth: 'API key or OAuth token' },
    { method: 'POST', path: '/v1/uploads', description: 'Create a new dataset upload session.', auth: 'Verified session + scoped key' },
    { method: 'POST', path: '/v1/uploads/{id}/complete', description: 'Finalize upload and trigger validation pipeline.', auth: 'Verified session + scoped key' },
    { method: 'PATCH', path: '/v1/access-requests/{id}', description: 'Update request rationale or usage scope.', auth: 'OAuth token' }
]

const curlExample = `curl -X GET "https://api.breach.local/v1/datasets?domain=climate&limit=10" \\
  -H "Authorization: Bearer $BREACH_API_KEY" \\
  -H "X-Workspace-Id: ws_participant_001"`

const pythonExample = `from breach_sdk import BreachClient

client = BreachClient(api_key="YOUR_API_KEY", workspace_id="ws_participant_001")
datasets = client.datasets.list(domain="climate", limit=10)
print(datasets[0]["title"])`

const jsExample = `import { BreachClient } from "@breach/sdk"

const client = new BreachClient({
  apiKey: process.env.BREACH_API_KEY,
  workspaceId: "ws_participant_001"
})

const datasets = await client.datasets.list({ domain: "climate", limit: 10 })
console.log(datasets[0].title)`

const jsonResponseExample = `{
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

const pythonQuickstart = `from breach_sdk import BreachClient

client = BreachClient(api_key="YOUR_API_KEY", workspace_id="ws_participant_001")

# 1) List datasets
for ds in client.datasets.list(limit=5):
    print(ds["id"], ds["title"])

# 2) Start upload session
upload = client.uploads.create(
    title="Mobility QA Batch",
    domain="Mobility",
    data_type="Time-series"
)

# 3) Upload file and complete
client.uploads.add_file(upload["id"], "./mock-data/mobility_q1.parquet")
client.uploads.complete(upload["id"])`

const jsQuickstart = `import { BreachClient } from "@breach/sdk"

const client = new BreachClient({
  apiKey: process.env.BREACH_API_KEY,
  workspaceId: "ws_participant_001"
})

const list = await client.datasets.list({ limit: 5 })
console.log(list.map(x => x.title))

const upload = await client.uploads.create({
  title: "Mobility QA Batch",
  domain: "Mobility",
  dataType: "Time-series"
})

await client.uploads.addFile(upload.id, "./mock-data/mobility_q1.parquet")
await client.uploads.complete(upload.id)`

function methodStyle(method: Endpoint['method']) {
    if (method === 'GET') return 'bg-emerald-500/10 border-emerald-400/50 text-emerald-200'
    if (method === 'POST') return 'bg-blue-500/10 border-blue-400/50 text-blue-200'
    return 'bg-violet-500/10 border-violet-400/50 text-violet-200'
}

function CodeBlock({ label, code }: { label: string; code: string }) {
    return (
        <div className="rounded-lg border border-slate-700 bg-slate-900/80 overflow-hidden">
            <div className="px-3 py-2 border-b border-slate-700 text-[11px] uppercase tracking-[0.12em] text-slate-400">{label}</div>
            <pre className="p-3 text-[12px] leading-relaxed text-slate-200 overflow-x-auto">
                <code>{code}</code>
            </pre>
        </div>
    )
}

export default function PipelinesPage() {
    const [activeTab, setActiveTab] = useState<PipelinesTab>('overview')

    return (
        <div className="container mx-auto px-4 py-10 text-white space-y-6">
            <section className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Pipelines</h1>
                    <p className="text-slate-400 mt-1">Access and contribute data via our APIs and SDKs.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-3 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-200">API v1</span>
                    <span className="px-3 py-1 rounded-full border border-cyan-500/40 bg-cyan-500/10 text-cyan-200">Verified session enabled</span>
                </div>
            </section>

            <section className="rounded-2xl border border-slate-700 bg-slate-800/60 p-2 md:p-3 shadow-xl">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`rounded-lg border px-3 py-2 text-xs md:text-sm font-semibold transition-colors ${
                                activeTab === tab.id
                                    ? 'border-blue-500/60 bg-blue-500/10 text-blue-100'
                                    : 'border-slate-700 text-slate-300 hover:border-blue-500/60 hover:text-white'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </section>

            {activeTab === 'overview' && (
                <section className="grid xl:grid-cols-3 gap-4">
                    <div className="xl:col-span-2 rounded-2xl border border-slate-700 bg-slate-800/60 p-5 shadow-xl space-y-4">
                        <h2 className="text-xl font-semibold">Pipeline Overview</h2>
                        <p className="text-slate-300 text-sm">
                            Use Breach Pipelines to discover datasets, automate access workflows, and contribute new dataset packages through an
                            auditable validation process.
                        </p>
                        <div className="grid md:grid-cols-3 gap-3">
                            {[
                                { title: 'Discover', detail: 'Query metadata and confidence scores via read APIs.' },
                                { title: 'Contribute', detail: 'Upload files, finalize submissions, and start validations.' },
                                { title: 'Govern', detail: 'Use scoped credentials, limits, and policy enforcement.' }
                            ].map(item => (
                                <div key={item.title} className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
                                    <div className="text-sm font-semibold text-white">{item.title}</div>
                                    <div className="text-xs text-slate-400 mt-1">{item.detail}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5 shadow-xl space-y-3">
                        <h3 className="text-base font-semibold">Auth Modes</h3>
                        <ul className="space-y-2 text-sm text-slate-300">
                            <li className="rounded-lg border border-slate-700 bg-slate-900/70 p-2">API key (server-to-server)</li>
                            <li className="rounded-lg border border-slate-700 bg-slate-900/70 p-2">OAuth 2.0 (user delegated)</li>
                            <li className="rounded-lg border border-slate-700 bg-slate-900/70 p-2">Verified session token (upload flows)</li>
                        </ul>
                    </div>
                </section>
            )}

            {activeTab === 'api' && (
                <section className="space-y-4">
                    <div className="grid xl:grid-cols-3 gap-4">
                        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5 shadow-xl space-y-3">
                            <h3 className="text-lg font-semibold">Authentication</h3>
                            <ul className="space-y-2 text-sm text-slate-300 list-disc list-inside">
                                <li>Send `Authorization: Bearer &lt;token&gt;` on every request.</li>
                                <li>Use workspace-scoped API keys for backend jobs.</li>
                                <li>Use OAuth for user-context operations and approval flows.</li>
                            </ul>
                        </div>
                        <div className="xl:col-span-2 rounded-2xl border border-slate-700 bg-slate-800/60 p-5 shadow-xl">
                            <h3 className="text-lg font-semibold mb-3">Endpoints</h3>
                            <div className="space-y-2">
                                {endpoints.map(endpoint => (
                                    <div key={`${endpoint.method}-${endpoint.path}`} className="grid md:grid-cols-[auto_1fr] gap-3 rounded-lg border border-slate-700 bg-slate-900/70 p-3">
                                        <div className="flex items-start gap-2">
                                            <span className={`px-2 py-1 rounded border text-[11px] font-semibold ${methodStyle(endpoint.method)}`}>
                                                {endpoint.method}
                                            </span>
                                            <code className="text-xs text-slate-100">{endpoint.path}</code>
                                        </div>
                                        <div className="text-xs text-slate-300">
                                            <div>{endpoint.description}</div>
                                            <div className="text-slate-400 mt-1">Auth: {endpoint.auth}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid xl:grid-cols-2 gap-4">
                        <div className="space-y-3 rounded-2xl border border-slate-700 bg-slate-800/60 p-5 shadow-xl">
                            <h3 className="text-lg font-semibold">Request / Response Examples</h3>
                            <CodeBlock label="curl" code={curlExample} />
                            <CodeBlock label="JSON response" code={jsonResponseExample} />
                        </div>
                        <div className="space-y-3 rounded-2xl border border-slate-700 bg-slate-800/60 p-5 shadow-xl">
                            <h3 className="text-lg font-semibold">Language Examples</h3>
                            <CodeBlock label="Python" code={pythonExample} />
                            <CodeBlock label="JavaScript" code={jsExample} />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5 shadow-xl space-y-3">
                            <h3 className="text-lg font-semibold">Rate Limits</h3>
                            <div className="text-sm text-slate-300 space-y-1">
                                <div>Read APIs: 120 requests/minute</div>
                                <div>Upload APIs: 20 requests/minute</div>
                                <div>Burst window: 2x for 30 seconds</div>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5 shadow-xl space-y-3">
                            <h3 className="text-lg font-semibold">Error Codes</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                {[
                                    ['400', 'Invalid request payload'],
                                    ['401', 'Missing/invalid credentials'],
                                    ['403', 'Scope not allowed'],
                                    ['404', 'Dataset or upload not found'],
                                    ['409', 'Validation state conflict'],
                                    ['429', 'Rate limit exceeded']
                                ].map(([code, message]) => (
                                    <div key={code} className="rounded-lg border border-slate-700 bg-slate-900/70 p-2">
                                        <div className="text-slate-100 font-semibold">{code}</div>
                                        <div className="text-xs text-slate-400">{message}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {activeTab === 'sdks' && (
                <section className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5 shadow-xl space-y-3">
                            <h3 className="text-lg font-semibold">Available SDKs</h3>
                            <div className="space-y-2 text-sm text-slate-300">
                                <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">Python SDK: `breach-sdk`</div>
                                <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">JavaScript SDK: `@breach/sdk`</div>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5 shadow-xl space-y-3">
                            <h3 className="text-lg font-semibold">Installation</h3>
                            <CodeBlock label="pip" code="pip install breach-sdk" />
                            <CodeBlock label="npm" code="npm install @breach/sdk" />
                        </div>
                    </div>

                    <div className="grid xl:grid-cols-2 gap-4">
                        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5 shadow-xl space-y-3">
                            <h3 className="text-lg font-semibold">Python Quickstart</h3>
                            <CodeBlock label="Python" code={pythonQuickstart} />
                        </div>
                        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5 shadow-xl space-y-3">
                            <h3 className="text-lg font-semibold">JavaScript Quickstart</h3>
                            <CodeBlock label="JavaScript" code={jsQuickstart} />
                        </div>
                    </div>
                </section>
            )}

            {activeTab === 'samples' && (
                <section className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5 shadow-xl space-y-3">
                    <h2 className="text-xl font-semibold">Code Samples / Playground</h2>
                    <p className="text-sm text-slate-400">Expandable examples for common integration tasks.</p>
                    <div className="space-y-2">
                        <details className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
                            <summary className="cursor-pointer text-sm font-semibold text-slate-100">Sample: Filter verified datasets by domain</summary>
                            <div className="mt-3">
                                <CodeBlock label="curl" code={`curl "https://api.breach.local/v1/datasets?domain=healthcare&verification=verified"`} />
                            </div>
                        </details>
                        <details className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
                            <summary className="cursor-pointer text-sm font-semibold text-slate-100">Sample: Start upload + finalize validation</summary>
                            <div className="mt-3">
                                <CodeBlock label="JSON payload" code={`{\n  "title": "Mobility QA Batch",\n  "domain": "Mobility",\n  "dataType": "Time-series"\n}`} />
                            </div>
                        </details>
                        <details className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
                            <summary className="cursor-pointer text-sm font-semibold text-slate-100">Sample: Handle 429 retries with backoff</summary>
                            <div className="mt-3">
                                <CodeBlock label="JavaScript helper" code={`const retryAfter = Number(res.headers.get("retry-after") || "2")\nawait new Promise(r => setTimeout(r, retryAfter * 1000))`} />
                            </div>
                        </details>
                    </div>
                </section>
            )}

            {activeTab === 'downloads' && (
                <section className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {[
                        { title: 'OpenAPI Spec', desc: 'Download OpenAPI 3.0 spec for API clients.', href: '#openapi' },
                        { title: 'Swagger UI', desc: 'Interactive endpoint explorer for testing.', href: '#swagger' },
                        { title: 'Python SDK Repo', desc: 'Examples, changelog, and release notes.', href: '#python-sdk' },
                        { title: 'JS SDK Repo', desc: 'Type-safe client, docs, and quickstarts.', href: '#js-sdk' }
                    ].map(link => (
                        <a
                            key={link.title}
                            href={link.href}
                            className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5 shadow-xl hover:border-blue-500/60 transition-colors"
                        >
                            <div className="text-base font-semibold text-white">{link.title}</div>
                            <div className="text-sm text-slate-400 mt-1">{link.desc}</div>
                            <div className="text-xs text-blue-300 mt-3">Open link</div>
                        </a>
                    ))}
                </section>
            )}
        </div>
    )
}
