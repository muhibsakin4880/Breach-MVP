import { Link } from 'react-router-dom'
import { jsQuickstart, pythonQuickstart, resourceLinks, sdkCards } from './pipelinesContent'
import { CodeBlock, CopyButton, type CopyHandler, SurfaceCard } from './PipelinesShared'

export default function PipelinesResourcesTab({
    copiedItem,
    onCopy
}: {
    copiedItem: string | null
    onCopy: CopyHandler
}) {
    return (
        <section className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2">
                {sdkCards.map(card => (
                    <article
                        key={card.id}
                        className="rounded-3xl border border-cyan-500/30 bg-black/70 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_25px_#00F0FF30]"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                            {card.badge && (
                                <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-200">
                                    {card.badge}
                                </span>
                            )}
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-slate-400">{card.detail}</p>
                        {card.installCommand ? (
                            <div className="mt-5 rounded-2xl border border-cyan-500/20 bg-black/40 p-4">
                                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                    <code className="text-sm text-cyan-300">{card.installCommand}</code>
                                    <CopyButton
                                        label="Copy install"
                                        onClick={() => onCopy(card.id, card.installCommand ?? '')}
                                        copied={copiedItem === card.id}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="mt-5 rounded-2xl border border-cyan-500/20 bg-black/40 p-4 text-sm text-slate-500">
                                This SDK is not yet ready for participant self-serve setup.
                            </div>
                        )}
                    </article>
                ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                <CodeBlock
                    label="Python quickstart"
                    code={pythonQuickstart}
                    onCopy={() => onCopy('python-quickstart', pythonQuickstart)}
                    copied={copiedItem === 'python-quickstart'}
                />
                <CodeBlock
                    label="JavaScript quickstart"
                    code={jsQuickstart}
                    onCopy={() => onCopy('js-quickstart', jsQuickstart)}
                    copied={copiedItem === 'js-quickstart'}
                />
            </div>

            <SurfaceCard>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-white">Workspace resources</h3>
                        <p className="mt-1 text-sm text-slate-400">
                            Use the existing participant console instead of jumping out to a placeholder docs microsite.
                        </p>
                    </div>
                    <Link
                        to="/profile"
                        className="rounded-xl border border-cyan-500/40 px-4 py-3 text-sm font-semibold text-cyan-200 transition-all duration-200 hover:bg-cyan-500/15"
                    >
                        Manage current key
                    </Link>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {resourceLinks.map(link => (
                        <Link
                            key={link.title}
                            to={link.to}
                            className="rounded-2xl border border-cyan-500/20 bg-black/40 p-5 transition-all duration-200 hover:border-cyan-500/40 hover:shadow-[0_0_18px_#00F0FF20]"
                        >
                            <div className="text-base font-semibold text-white">{link.title}</div>
                            <p className="mt-2 text-sm leading-relaxed text-slate-400">{link.detail}</p>
                            <div className="mt-4 text-sm font-semibold text-cyan-300">{link.label}</div>
                        </Link>
                    ))}
                </div>
            </SurfaceCard>
        </section>
    )
}
