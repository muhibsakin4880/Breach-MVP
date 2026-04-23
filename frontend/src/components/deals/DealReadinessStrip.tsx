import type { DealArtifactPreviewTone } from '../../domain/dealArtifactPreview'

export type DealReadinessItem = {
    label: string
    value: string
    detail: string
    tone: DealArtifactPreviewTone
}

const toneClasses: Record<
    DealArtifactPreviewTone,
    {
        accent: string
        value: string
        detail: string
    }
> = {
    slate: {
        accent: 'bg-white/20',
        value: 'text-slate-100',
        detail: 'text-slate-400'
    },
    cyan: {
        accent: 'bg-cyan-400/70',
        value: 'text-cyan-100',
        detail: 'text-cyan-100/70'
    },
    amber: {
        accent: 'bg-amber-400/70',
        value: 'text-amber-100',
        detail: 'text-amber-100/75'
    },
    emerald: {
        accent: 'bg-emerald-400/70',
        value: 'text-emerald-100',
        detail: 'text-emerald-100/75'
    },
    rose: {
        accent: 'bg-rose-400/70',
        value: 'text-rose-100',
        detail: 'text-rose-100/75'
    }
}

export default function DealReadinessStrip({
    items
}: {
    items: DealReadinessItem[]
}) {
    return (
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#08111f]/92 shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
            <div className="grid divide-y divide-white/6 lg:grid-cols-5 lg:divide-x lg:divide-y-0">
                {items.map(item => {
                    const classes = toneClasses[item.tone]

                    return (
                        <article key={item.label} className="relative px-4 py-4">
                            <div className={`absolute inset-x-0 top-0 h-px ${classes.accent}`} />
                            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                {item.label}
                            </div>
                            <div className={`mt-2 text-sm font-semibold ${classes.value}`}>
                                {item.value}
                            </div>
                            <div className={`mt-1 text-xs leading-5 ${classes.detail}`}>
                                {item.detail}
                            </div>
                        </article>
                    )
                })}
            </div>
        </section>
    )
}
