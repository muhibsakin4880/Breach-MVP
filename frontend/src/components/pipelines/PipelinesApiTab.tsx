import { Link } from 'react-router-dom'
import {
    curlExample,
    endpoints,
    jsExample,
    jsonResponseExample,
    methodStyle,
    pythonExample
} from './pipelinesContent'
import { CodeBlock, CopyButton, type CopyHandler, SurfaceCard } from './PipelinesShared'

export default function PipelinesApiTab({
    copiedItem,
    onCopy
}: {
    copiedItem: string | null
    onCopy: CopyHandler
}) {
    return (
        <section className="space-y-6">
            <SurfaceCard>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-cyan-500/20 bg-black/40 p-4">
                        <div className="text-xs uppercase tracking-[0.12em] text-slate-500">Base URL</div>
                        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <code className="text-sm text-cyan-300">https://api.redoubt.io/v1</code>
                            <CopyButton
                                label="Copy URL"
                                onClick={() => onCopy('base-url', 'https://api.redoubt.io/v1')}
                                copied={copiedItem === 'base-url'}
                            />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-cyan-500/20 bg-black/40 p-4">
                        <div className="text-xs uppercase tracking-[0.12em] text-slate-500">Auth Header</div>
                        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <code className="text-sm text-cyan-300">Authorization: Bearer {'{your_api_key}'}</code>
                            <CopyButton
                                label="Copy header"
                                onClick={() => onCopy('auth-header', 'Authorization: Bearer {your_api_key}')}
                                copied={copiedItem === 'auth-header'}
                            />
                        </div>
                    </div>
                </div>
            </SurfaceCard>

            <SurfaceCard>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-white">Core participant endpoints</h3>
                        <p className="mt-1 text-sm text-slate-400">
                            This reference is driven from one endpoint config so the paths and auth notes stay aligned.
                        </p>
                    </div>
                    <Link
                        to="/access-requests"
                        className="rounded-xl border border-cyan-500/40 px-4 py-3 text-sm font-semibold text-cyan-200 transition-all duration-200 hover:bg-cyan-500/15"
                    >
                        Open access workflows
                    </Link>
                </div>

                <div className="mt-5 space-y-4">
                    {endpoints.map(endpoint => (
                        <article
                            key={endpoint.id}
                            className="rounded-2xl border border-cyan-500/20 bg-black/50 p-5 transition-all duration-200 hover:border-cyan-500/40 hover:shadow-[0_0_20px_#00F0FF20]"
                        >
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                <div className="space-y-3">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${methodStyle(endpoint.method)}`}>
                                            {endpoint.method}
                                        </span>
                                        <code className="text-sm text-slate-100">{endpoint.path}</code>
                                    </div>
                                    <p className="text-sm text-slate-300">{endpoint.description}</p>
                                    <p className="text-xs text-slate-500">{endpoint.note}</p>
                                </div>
                                <div className="rounded-xl border border-cyan-500/15 bg-black/40 px-4 py-3 text-xs text-slate-400">
                                    <div className="uppercase tracking-[0.12em] text-slate-500">Auth</div>
                                    <div className="mt-2 text-slate-200">{endpoint.auth}</div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </SurfaceCard>

            <div className="grid gap-6 xl:grid-cols-2">
                <CodeBlock
                    label="cURL example"
                    code={curlExample}
                    onCopy={() => onCopy('curl-example', curlExample)}
                    copied={copiedItem === 'curl-example'}
                />
                <CodeBlock
                    label="Example response"
                    code={jsonResponseExample}
                    onCopy={() => onCopy('response-example', jsonResponseExample)}
                    copied={copiedItem === 'response-example'}
                />
                <CodeBlock
                    label="Python example"
                    code={pythonExample}
                    onCopy={() => onCopy('python-example', pythonExample)}
                    copied={copiedItem === 'python-example'}
                />
                <CodeBlock
                    label="JavaScript example"
                    code={jsExample}
                    onCopy={() => onCopy('js-example', jsExample)}
                    copied={copiedItem === 'js-example'}
                />
            </div>
        </section>
    )
}
