import type { DealArtifactPreview, DealArtifactPreviewTone } from '../../domain/dealArtifactPreview'

type DealArtifactPreviewGridProps = {
    artifacts: DealArtifactPreview[]
}

const toneClasses: Record<
    DealArtifactPreviewTone,
    {
        panel: string
        badge: string
        accent: string
    }
> = {
    slate: {
        panel: 'border-white/8 bg-slate-950/45',
        badge: 'border-white/12 bg-white/5 text-slate-200',
        accent: 'bg-slate-300'
    },
    cyan: {
        panel: 'border-cyan-400/18 bg-cyan-500/8',
        badge: 'border-cyan-400/30 bg-cyan-500/10 text-cyan-100',
        accent: 'bg-cyan-300'
    },
    amber: {
        panel: 'border-amber-400/18 bg-amber-500/8',
        badge: 'border-amber-400/30 bg-amber-500/10 text-amber-100',
        accent: 'bg-amber-300'
    },
    emerald: {
        panel: 'border-emerald-400/18 bg-emerald-500/8',
        badge: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100',
        accent: 'bg-emerald-300'
    },
    rose: {
        panel: 'border-rose-400/18 bg-rose-500/8',
        badge: 'border-rose-400/30 bg-rose-500/10 text-rose-100',
        accent: 'bg-rose-300'
    }
}

export default function DealArtifactPreviewGrid({
    artifacts
}: DealArtifactPreviewGridProps) {
    return (
        <div className="grid gap-4 xl:grid-cols-2">
            {artifacts.map(artifact => {
                const classes = toneClasses[artifact.tone]

                return (
                    <article
                        key={artifact.id}
                        className={`rounded-2xl border p-4 shadow-[0_10px_24px_rgba(0,0,0,0.16)] ${classes.panel}`}
                    >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                                    {artifact.artifactLabel}
                                </div>
                                <h3 className="mt-2 text-base font-semibold text-white">{artifact.title}</h3>
                            </div>
                            <span
                                className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold ${classes.badge}`}
                            >
                                {artifact.status}
                            </span>
                        </div>

                        <p className="mt-4 text-sm leading-6 text-slate-200">{artifact.summary}</p>

                        <div className="mt-4 space-y-2">
                            {artifact.highlights.map(item => (
                                <div key={`${artifact.id}-${item}`} className="flex gap-2 text-sm leading-6 text-slate-200">
                                    <span className={`mt-2 h-1.5 w-1.5 rounded-full ${classes.accent}`} />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>

                        {artifact.note ? (
                            <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-3 text-xs leading-5 text-slate-300">
                                {artifact.note}
                            </div>
                        ) : null}
                    </article>
                )
            })}
        </div>
    )
}
