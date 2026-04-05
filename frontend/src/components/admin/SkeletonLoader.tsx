export function MetricCardSkeleton() {
    return (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-xl p-5 shadow-2xl shadow-black/30">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-700/50 animate-pulse" />
                    <div className="h-3 w-20 bg-slate-700/50 rounded animate-pulse" />
                </div>
            </div>
            <div className="h-10 w-24 bg-slate-700/50 rounded animate-pulse mb-2" />
            <div className="h-3 w-16 bg-slate-700/50 rounded animate-pulse" />
        </div>
    )
}

export function AlertItemSkeleton() {
    return (
        <div className="flex items-center gap-4 px-5 py-4 border-l-4 border-slate-700/50">
            <div className="flex-shrink-0">
                <div className="h-6 w-14 bg-slate-700/50 rounded animate-pulse" />
            </div>
            <div className="min-w-0 flex-1">
                <div className="h-4 w-48 bg-slate-700/50 rounded animate-pulse mb-2" />
                <div className="h-3 w-64 bg-slate-700/50 rounded animate-pulse mb-1.5" />
                <div className="h-2 w-20 bg-slate-700/50 rounded animate-pulse" />
            </div>
            <div className="flex-shrink-0 flex gap-2">
                <div className="h-7 w-16 bg-slate-700/50 rounded animate-pulse" />
                <div className="h-7 w-16 bg-slate-700/50 rounded animate-pulse" />
                <div className="h-7 w-16 bg-slate-700/50 rounded animate-pulse" />
            </div>
        </div>
    )
}

export function WorkflowRowSkeleton() {
    return (
        <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-4">
                <div className="h-5 w-9 bg-slate-700/50 rounded-full animate-pulse" />
                <div>
                    <div className="h-4 w-56 bg-slate-700/50 rounded animate-pulse mb-2" />
                    <div className="h-3 w-72 bg-slate-700/50 rounded animate-pulse" />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <div className="h-2 w-24 bg-slate-700/50 rounded animate-pulse mb-1" />
                    <div className="h-2 w-20 bg-slate-700/50 rounded animate-pulse" />
                </div>
                <div className="h-6 w-10 bg-slate-700/50 rounded animate-pulse" />
            </div>
        </div>
    )
}

export function ActivityRowSkeleton() {
    return (
        <div className="flex items-center gap-4 px-5 py-3.5">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-700/50 animate-pulse" />
            <div className="flex-1 min-w-0">
                <div className="h-4 w-40 bg-slate-700/50 rounded animate-pulse mb-2" />
                <div className="flex items-center gap-2">
                    <div className="h-3 w-24 bg-slate-700/50 rounded animate-pulse" />
                    <div className="h-3 w-3 bg-slate-700/50 rounded animate-pulse" />
                    <div className="h-3 w-32 bg-slate-700/50 rounded animate-pulse" />
                </div>
            </div>
            <div className="flex-shrink-0">
                <div className="h-3 w-16 bg-slate-700/50 rounded animate-pulse" />
            </div>
        </div>
    )
}

export function CardSkeleton() {
    return (
        <div className="rounded-xl border border-slate-800/60 bg-slate-900/65 shadow-2xl shadow-black/20 overflow-hidden">
            <div className="border-b border-slate-800/60 px-5 py-4">
                <div className="h-4 w-32 bg-slate-700/50 rounded animate-pulse" />
                <div className="h-3 w-48 bg-slate-700/50 rounded animate-pulse mt-2" />
            </div>
            <div className="divide-y divide-slate-800/35">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="px-5 py-4">
                        <div className="flex items-center gap-4">
                            <div className="h-2 w-2 rounded-full bg-slate-700/50 animate-pulse" />
                            <div className="flex-1">
                                <div className="h-3 w-40 bg-slate-700/50 rounded animate-pulse mb-2" />
                                <div className="h-2 w-56 bg-slate-700/50 rounded animate-pulse" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export function StatSkeleton() {
    return (
        <div className="rounded-xl border border-slate-800/60 bg-slate-900/65 p-6 shadow-2xl shadow-black/20">
            <div className="flex items-start justify-between">
                <div>
                    <div className="h-3 w-24 bg-slate-700/50 rounded animate-pulse mb-3" />
                    <div className="h-10 w-16 bg-slate-700/50 rounded animate-pulse" />
                </div>
                <div className="h-10 w-10 bg-slate-700/50 rounded-lg animate-pulse" />
            </div>
            <div className="h-3 w-40 bg-slate-700/50 rounded animate-pulse mt-4" />
        </div>
    )
}