import DatasetDetailPanel, { DatasetDetailMetric } from './DatasetDetailPanel'

type DatasetAccessPackagePanelProps = {
    accessPackageBuyerOverview: string
    accessDeliverySummaryItems: ReadonlyArray<{
        label: string
        value: string
    }>
    accessPostureItems: ReadonlyArray<{
        title: string
        badge: string
        tone: 'available' | 'protected' | 'approval'
        detail: string
    }>
    uaeJurisdictionResidencyPanel: {
        accessRegion: string
        operatingRegion: string
        residencyPosture: string
        datasetPosture: string
        postureSummary: string
        badgeClassName: string
    }
    compatibilityBadges: ReadonlyArray<string>
}

const getAccessPostureBadgeClass = (state: 'available' | 'protected' | 'approval') => {
    if (state === 'available') return 'border-white/10 bg-white/5 text-slate-100'
    if (state === 'protected') return 'border-cyan-400/25 bg-cyan-500/10 text-cyan-100'
    return 'border-emerald-400/25 bg-emerald-500/10 text-emerald-100'
}

export default function DatasetAccessPackagePanel({
    accessPackageBuyerOverview,
    accessDeliverySummaryItems,
    accessPostureItems,
    uaeJurisdictionResidencyPanel,
    compatibilityBadges
}: DatasetAccessPackagePanelProps) {
    return (
        <DatasetDetailPanel
            eyebrow="Access Package"
            title="Access & Delivery Profile"
            description={accessPackageBuyerOverview}
        >
            <div className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {accessDeliverySummaryItems.map(item => (
                        <DatasetDetailMetric key={item.label} label={item.label} value={item.value} />
                    ))}
                </div>

                <div className="rounded-2xl border border-cyan-500/20 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_32%),linear-gradient(180deg,rgba(2,6,23,0.94)_0%,rgba(15,23,42,0.9)_100%)] p-5 shadow-[0_14px_34px_rgba(8,47,73,0.16)]">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-100">
                                Jurisdiction & Residency
                            </div>
                            <h3 className="mt-3 text-xl font-semibold text-white">UAE operating posture</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-300">
                                Product posture summary for regulated evaluation routing across UAE-relevant operating boundaries.
                            </p>
                        </div>
                        <div className={`inline-flex w-fit items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${uaeJurisdictionResidencyPanel.badgeClassName}`}>
                            {uaeJurisdictionResidencyPanel.datasetPosture}
                        </div>
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                        <DatasetDetailMetric label="Access region" value={uaeJurisdictionResidencyPanel.accessRegion} />
                        <DatasetDetailMetric label="Operating region" value={uaeJurisdictionResidencyPanel.operatingRegion} />
                        <DatasetDetailMetric label="Residency posture" value={uaeJurisdictionResidencyPanel.residencyPosture} />
                    </div>

                    <div className="mt-4 rounded-xl border border-white/8 bg-slate-950/45 px-4 py-4">
                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Dataset classification</div>
                        <div className="mt-2 text-base font-semibold text-white">{uaeJurisdictionResidencyPanel.datasetPosture}</div>
                        <p className="mt-2 text-sm leading-6 text-slate-300">{uaeJurisdictionResidencyPanel.postureSummary}</p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2.5">
                        {compatibilityBadges.map(badge => (
                            <span
                                key={badge}
                                className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-200"
                            >
                                {badge}
                            </span>
                        ))}
                    </div>

                    <p className="mt-4 text-xs leading-6 text-slate-400">
                        This summarizes Redoubt&apos;s operating posture for regulated evaluation workflows and does not constitute legal advice.
                    </p>
                </div>

                <div className="grid gap-4 xl:grid-cols-3">
                    {accessPostureItems.map(item => (
                        <article key={item.title} className="rounded-2xl border border-slate-700/80 bg-slate-950/45 p-5">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="text-sm font-semibold text-white">{item.title}</div>
                                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${getAccessPostureBadgeClass(item.tone)}`}>
                                    {item.badge}
                                </span>
                            </div>
                            <p className="mt-3 text-sm leading-6 text-slate-300">{item.detail}</p>
                        </article>
                    ))}
                </div>
            </div>
        </DatasetDetailPanel>
    )
}
