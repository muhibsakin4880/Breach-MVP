import type { OutputReviewCoreState, OutputReviewEvent } from '../../domain/outputReview'

type OutputReviewEventFeedProps = {
    events: OutputReviewEvent[]
    selectedState: OutputReviewCoreState
    onSelect: (state: OutputReviewCoreState) => void
}

export default function OutputReviewEventFeed({
    events,
    selectedState,
    onSelect
}: OutputReviewEventFeedProps) {
    return (
        <div className="space-y-3">
            {events.map(event => {
                const active = event.state === selectedState
                return (
                    <button
                        key={event.id}
                        type="button"
                        onClick={() => onSelect(event.state)}
                        className={`w-full rounded-2xl border px-4 py-4 text-left transition-colors ${
                            active
                                ? 'border-cyan-400/35 bg-cyan-500/10'
                                : 'border-white/8 bg-slate-950/45 hover:border-white/16'
                        }`}
                    >
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div className="max-w-3xl">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${getToneBadgeClasses(event.tone)}`}>
                                        {event.status}
                                    </span>
                                    <span className="text-xs text-slate-500">{event.at}</span>
                                </div>
                                <div className="mt-3 text-sm font-semibold text-white">{event.label}</div>
                                <div className="mt-2 text-sm leading-6 text-slate-300">{event.summary}</div>
                            </div>
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-200">
                                {event.actor}
                            </span>
                        </div>
                    </button>
                )
            })}
        </div>
    )
}

function getToneBadgeClasses(tone: OutputReviewEvent['tone']) {
    if (tone === 'rose') return 'border-rose-400/30 bg-rose-500/10 text-rose-100'
    if (tone === 'amber') return 'border-amber-400/30 bg-amber-500/10 text-amber-100'
    if (tone === 'emerald') return 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'
    if (tone === 'cyan') return 'border-cyan-400/30 bg-cyan-500/10 text-cyan-100'
    return 'border-white/12 bg-white/5 text-slate-200'
}
