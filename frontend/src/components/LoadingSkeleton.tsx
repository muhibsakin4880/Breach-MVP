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
        <div className="h-full rounded-2xl border border-slate-700/80 bg-slate-800/70 px-4 py-4 shadow-[0_12px_28px_-20px_rgba(2,132,199,0.35)] backdrop-blur-sm flex flex-col">
            <div className="mb-3 rounded-xl border border-slate-700/70 bg-slate-900/70 px-3 py-3">
                <div className="flex items-baseline justify-between">
                    <Skeleton className="w-20 h-4" />
                    <Skeleton className="w-12 h-8" />
                </div>
                <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-700/80">
                    <Skeleton className="h-full rounded-full w-3/4" />
                </div>
            </div>

            <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-2 flex-1">
                    <Skeleton className="w-4/5 h-5" />
                    <Skeleton className="w-full h-4" />
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <Skeleton className="w-20 h-6 rounded-full" />
                    <Skeleton className="w-16 h-5 rounded-full" />
                </div>
            </div>

            <div className="mb-3 flex items-center gap-2">
                <Skeleton className="w-20 h-6 rounded-full" />
                <Skeleton className="w-16 h-6 rounded-full" />
            </div>

            <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Skeleton className="w-6 h-6 rounded-full" />
                    <Skeleton className="w-6 h-6 rounded-full" />
                    <Skeleton className="w-6 h-6 rounded-full" />
                </div>
                <Skeleton className="w-28 h-6 rounded-full" />
            </div>

            <div className="text-[11px] text-slate-500 flex gap-2">
                <Skeleton className="w-16 h-4" />
                <Skeleton className="w-24 h-4" />
            </div>

            <div className="mt-auto pt-4 flex justify-center">
                <Skeleton className="w-full h-11 rounded-xl" />
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
