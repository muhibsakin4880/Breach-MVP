import { Link } from 'react-router-dom'
import { confidenceLevel, type DatasetDetail } from '../../data/datasetDetailData'
import { DatasetDetailMetric } from './DatasetDetailPanel'

type DatasetHeroPanelProps = {
    dataset: DatasetDetail
    dealId: string
    dealType: string
    dossierPath: string | null
    providerPacketPath: string | null
    availableSurfaceCount: number
    placeholderSurfaceCount: number
}

export default function DatasetHeroPanel({
    dataset,
    dealId,
    dealType,
    dossierPath,
    providerPacketPath,
    availableSurfaceCount,
    placeholderSurfaceCount
}: DatasetHeroPanelProps) {
    const confidenceTone = confidenceLevel(dataset.confidenceScore)

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-700 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.98)_0%,rgba(30,41,59,0.94)_55%,rgba(15,23,42,0.98)_100%)] p-6 shadow-[0_18px_54px_rgba(2,8,20,0.26)] md:p-7">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_320px]">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full border border-slate-600 bg-slate-900/75 px-3 py-1 text-sm text-slate-200">
                            {dataset.category}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-green-400 bg-green-500/15 px-3 py-1 text-sm text-green-300">
                            <span className="h-2 w-2 rounded-full bg-green-300" />
                            Provider attested
                        </span>
                    </div>

                    <h1 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-white md:text-4xl">
                        {dataset.title}
                    </h1>
                    <p className="mt-4 max-w-3xl text-lg text-slate-300">{dataset.description}</p>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <DatasetDetailMetric label="Size" value={dataset.size} className="bg-slate-900/70" />
                        <DatasetDetailMetric label="Records" value={dataset.recordCount} className="bg-slate-900/70" />
                        <DatasetDetailMetric label="Last Updated" value={dataset.lastUpdated} className="bg-slate-900/70" />
                        <DatasetDetailMetric label="Domain" value={dataset.category} className="bg-slate-900/70" />
                    </div>

                    {dossierPath ? (
                        <DealDossierHeroStrip
                            dealId={dealId}
                            dealType={dealType}
                            dossierPath={dossierPath}
                            providerPacketPath={providerPacketPath}
                            availableSurfaceCount={availableSurfaceCount}
                            placeholderSurfaceCount={placeholderSurfaceCount}
                        />
                    ) : null}
                </div>

                <aside className="rounded-2xl border border-slate-700 bg-slate-900/80 p-6 shadow-lg">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="text-sm text-slate-400">Overall Confidence Score</div>
                            <div className="mt-2 text-4xl font-bold text-white">{dataset.confidenceScore}%</div>
                        </div>
                        <span
                            className={`rounded-full border px-3 py-1 text-xs ${confidenceTone.classes}`}
                        >
                            {confidenceTone.label}
                        </span>
                    </div>

                    <div className="mt-4 h-3 rounded-full bg-slate-700">
                        <div
                            className="h-3 rounded-full bg-gradient-to-r from-blue-400 via-cyan-300 to-green-300"
                            style={{ width: `${dataset.confidenceScore}%` }}
                        />
                    </div>

                    <p className="mt-4 text-sm leading-6 text-slate-300">{dataset.confidenceSummary}</p>

                    <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                        <DatasetDetailMetric label="Completeness" value={`${dataset.quality.completeness}%`} />
                        <DatasetDetailMetric label="Freshness" value={`${dataset.quality.freshnessScore}%`} />
                        <DatasetDetailMetric label="Consistency" value={`${dataset.quality.consistency}%`} />
                        <DatasetDetailMetric label="Validation" value={dataset.quality.validationStatus} valueClassName="leading-6" />
                    </div>

                    <div className="mt-5 rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-4">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-sm text-slate-300">Quality review signal</span>
                            <span className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-100">
                                {dataset.preview.freshnessLabel}
                            </span>
                        </div>
                        <p className="mt-3 text-xs leading-5 text-slate-400">
                            Preview-only access remains active until a governed request is approved. Provider identity stays shielded throughout preview review.
                        </p>
                    </div>
                </aside>
            </div>
        </section>
    )
}

function DealDossierHeroStrip({
    dealId,
    dealType,
    dossierPath,
    providerPacketPath,
    availableSurfaceCount,
    placeholderSurfaceCount
}: {
    dealId: string
    dealType: string
    dossierPath: string
    providerPacketPath: string | null
    availableSurfaceCount: number
    placeholderSurfaceCount: number
}) {
    return (
        <section className="mt-6 overflow-hidden rounded-2xl border border-cyan-400/25 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_34%),linear-gradient(135deg,rgba(8,17,31,0.96)_0%,rgba(15,23,42,0.88)_100%)] p-4 shadow-[0_18px_54px_rgba(2,8,20,0.26)]">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-cyan-400/35 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-100">
                            Evaluation Dossier
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-200">
                            {dealId}
                        </span>
                        <span className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-100">
                            {dealType}
                        </span>
                    </div>

                    <h2 className="mt-3 text-lg font-semibold text-white">
                        This dataset has a dedicated deal operating surface
                    </h2>

                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                        <DatasetDetailMetric
                            label="Dossier route"
                            value={dossierPath}
                            className="min-w-0"
                            valueClassName="truncate text-xs"
                        />
                        <DatasetDetailMetric
                            label="Available surfaces"
                            value={`${availableSurfaceCount} configured`}
                            className="min-w-0"
                        />
                        <DatasetDetailMetric
                            label="Pending surfaces"
                            value={placeholderSurfaceCount > 0 ? `${placeholderSurfaceCount} placeholders` : 'None'}
                            className="min-w-0"
                        />
                    </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2 xl:flex-col">
                    <Link
                        to={dossierPath}
                        className="inline-flex justify-center rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-300"
                    >
                        Open evaluation dossier
                    </Link>
                    {providerPacketPath ? (
                        <Link
                            to={providerPacketPath}
                            className="inline-flex justify-center rounded-xl border border-white/12 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-100 transition-colors hover:border-cyan-400/40 hover:text-white"
                        >
                            Open provider rights packet
                        </Link>
                    ) : null}
                </div>
            </div>
        </section>
    )
}
