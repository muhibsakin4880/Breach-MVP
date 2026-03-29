import type { PipelinesTab } from './pipelinesContent'
import { tabs } from './pipelinesContent'

export default function PipelinesTabNav({
    activeTab,
    onChange
}: {
    activeTab: PipelinesTab
    onChange: (tab: PipelinesTab) => void
}) {
    return (
        <section className="rounded-2xl border border-cyan-500/30 bg-black/70 p-2 shadow-[0_0_15px_#00F0FF30] backdrop-blur-xl">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => onChange(tab.id)}
                        className={`whitespace-nowrap rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-300 ${
                            activeTab === tab.id
                                ? 'border-b-2 border-cyan-400 bg-cyan-500/10 text-white shadow-[0_0_15px_#00F0FF30]'
                                : 'text-gray-400 hover:text-white hover:shadow-[0_0_15px_#00F0FF30]'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </section>
    )
}
