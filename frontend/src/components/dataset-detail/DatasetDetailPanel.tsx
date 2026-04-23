import type { ReactNode } from 'react'

type DatasetDetailPanelProps = {
    eyebrow?: string
    title: string
    description?: string
    badge?: ReactNode
    action?: ReactNode
    className?: string
    bodyClassName?: string
    children: ReactNode
}

export default function DatasetDetailPanel({
    eyebrow,
    title,
    description,
    badge,
    action,
    className = '',
    bodyClassName = '',
    children
}: DatasetDetailPanelProps) {
    return (
        <section
            className={`rounded-2xl border border-slate-700 bg-slate-900/60 p-6 shadow-[0_12px_35px_rgba(0,0,0,0.18)] ${className}`.trim()}
        >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                    {eyebrow ? (
                        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{eyebrow}</div>
                    ) : null}
                    <h2 className={`${eyebrow ? 'mt-2' : ''} text-xl font-semibold text-white`.trim()}>{title}</h2>
                    {description ? (
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{description}</p>
                    ) : null}
                </div>

                {badge || action ? (
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                        {badge}
                        {action}
                    </div>
                ) : null}
            </div>

            <div className={`mt-5 ${bodyClassName}`.trim()}>{children}</div>
        </section>
    )
}

export function DatasetDetailMetric({
    label,
    value,
    className = '',
    valueClassName = ''
}: {
    label: string
    value: ReactNode
    className?: string
    valueClassName?: string
}) {
    return (
        <div
            className={`rounded-xl border border-white/8 bg-slate-950/45 px-4 py-3 ${className}`.trim()}
        >
            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
            <div className={`mt-2 text-sm font-semibold text-white ${valueClassName}`.trim()}>{value}</div>
        </div>
    )
}
