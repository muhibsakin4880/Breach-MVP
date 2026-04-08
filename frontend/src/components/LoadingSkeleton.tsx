type SkeletonProps = {
    className?: string
    variant?: 'text' | 'circular' | 'rectangular'
    width?: string | number
    height?: string | number
}

export function Skeleton({ className = '', variant = 'rectangular', width, height }: SkeletonProps) {
    const baseClass = variant === 'circular' ? 'rounded-full' : variant === 'text' ? 'rounded' : 'rounded-lg'
    
    return (
        <div
            className={`animate-pulse bg-slate-700/50 ${baseClass} ${className}`}
            style={{
                width: width ?? '100%',
                height: height ?? (variant === 'text' ? '1em' : variant === 'circular' ? '40px' : '20px')
            }}
            aria-hidden="true"
        />
    )
}

export function DatasetCardSkeleton() {
    return (
        <div className="relative flex h-full min-h-[540px] flex-col overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,27,45,0.88),rgba(10,17,31,0.8))] px-6 py-6 shadow-[0_26px_84px_-40px_rgba(2,6,23,0.98),0_16px_36px_-22px_rgba(8,145,178,0.16)] ring-1 ring-inset ring-white/6 backdrop-blur-xl before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-20 before:bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent)] before:content-[''] sm:px-7 sm:py-7 xl:px-8 xl:py-8">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-7 w-4/5" />
                    <Skeleton className="h-5 w-full" />
                </div>
                <div className="flex flex-col items-end gap-2">
                    <Skeleton className="h-8 w-24 rounded-full" />
                    <Skeleton className="h-8 w-28 rounded-full" />
                </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[22px] border border-emerald-500/25 bg-emerald-500/8 px-5 py-4 shadow-[0_18px_40px_-32px_rgba(2,6,23,0.92)]">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="mt-3 h-7 w-20" />
                    <Skeleton className="mt-3 h-4 w-28" />
                </div>
                <div className="rounded-[22px] border border-cyan-500/25 bg-cyan-500/8 px-5 py-4 shadow-[0_18px_40px_-32px_rgba(2,6,23,0.92)]">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="mt-3 h-7 w-20" />
                    <Skeleton className="mt-3 h-4 w-24" />
                </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5">
                <Skeleton className="h-8 w-20 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-28 rounded-full" />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <Skeleton className="h-20 rounded-[20px]" />
                <Skeleton className="h-20 rounded-[20px]" />
                <Skeleton className="h-20 rounded-[20px]" />
            </div>

            <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.04] px-5 py-5 shadow-[0_18px_42px_-30px_rgba(2,6,23,0.92)]">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="mt-4 h-5 w-full" />
                <Skeleton className="mt-3 h-5 w-4/5" />
                <Skeleton className="mt-4 h-4 w-2/3" />
            </div>

            <div className="mt-auto pt-8">
                <div className="flex flex-wrap gap-3.5">
                    <Skeleton className="h-12 w-36 rounded-2xl" />
                    <Skeleton className="h-12 w-36 rounded-2xl" />
                    <Skeleton className="h-12 flex-1 rounded-2xl" />
                </div>
            </div>
        </div>
    )
}

export function StatsCardSkeleton() {
    return (
        <div className="rounded-2xl border border-white/10 bg-[#0a1628] p-5">
            <div className="flex items-center justify-between">
                <Skeleton className="w-24 h-3" />
                <Skeleton className="w-16 h-5 rounded-full" />
            </div>
            <Skeleton className="mt-4 w-16 h-8" />
        </div>
    )
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
    return (
        <tr className="border-b border-slate-800">
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="py-4 px-4">
                    <Skeleton className="w-full h-5" />
                </td>
            ))}
        </tr>
    )
}

export function CardSkeleton() {
    return (
        <div className="rounded-2xl border border-slate-700/80 bg-slate-800/70 p-5">
            <div className="flex items-center gap-4 mb-4">
                <Skeleton variant="circular" className="w-12 h-12" />
                <div className="space-y-2 flex-1">
                    <Skeleton className="w-3/4 h-5" />
                    <Skeleton className="w-1/2 h-4" />
                </div>
            </div>
            <div className="space-y-3">
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-5/6 h-4" />
                <Skeleton className="w-4/5 h-4" />
            </div>
        </div>
    )
}
