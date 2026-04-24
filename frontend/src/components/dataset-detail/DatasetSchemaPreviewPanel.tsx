import { Fragment, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { DatasetQualityPreview } from '../../data/datasetCatalogData'
import type { DatasetDetail } from '../../data/datasetDetailData'
import { PROVIDER_UPLOAD_STEP3_SCHEMA_FIELDS } from '../../data/providerUploadStep3Schema'
import type { ProviderDatasetSubmissionRecord } from '../../domain/providerDatasetSubmission'
import DatasetDetailPanel from './DatasetDetailPanel'

type DatasetSchemaPreviewPanelProps = {
    dataset: DatasetDetail
    qualityPreview?: DatasetQualityPreview | null
    providerSubmission?: ProviderDatasetSubmissionRecord | null
    qualityBreakdownPath?: string | null
}

type ResolvedSchemaRow = {
    field: string
    type: string
    sampleValue?: string
    complianceLabel: string
    complianceClassName: string
    complianceSortKey: number
    residencyLabel: string
    residencyClassName: string
    residencySortKey: number
    nullPercent?: number
    accessLabel?: string
    note?: string
    aiDescription?: string
    cryptoState?: string
    cardinality?: string
    provenance?: string
    anomalyFlags?: string
    updateVelocity?: string
}

const providerComplianceMeta = {
    safe: {
        label: 'Tier 1: Safe',
        className: 'border-emerald-500/30 bg-emerald-500/12 text-emerald-200',
        sortKey: 0
    },
    review: {
        label: 'Gray Zone: DPO Review Pending',
        className: 'border-amber-500/30 bg-amber-500/12 text-amber-200',
        sortKey: 1
    },
    flagged: {
        label: 'High Risk: PDPL Flagged',
        className: 'border-rose-500/30 bg-rose-500/12 text-rose-200',
        sortKey: 2
    }
} as const

const seededRiskMeta = {
    safe: {
        label: 'Tier 1: Safe',
        className: 'border-emerald-500/30 bg-emerald-500/12 text-emerald-200',
        sortKey: 0
    },
    gray: {
        label: 'Gray Zone: DPO Review Pending',
        className: 'border-amber-500/30 bg-amber-500/12 text-amber-200',
        sortKey: 1
    },
    high: {
        label: 'High Risk: PDPL Flagged',
        className: 'border-rose-500/30 bg-rose-500/12 text-rose-200',
        sortKey: 2
    }
} as const

const accessMeta = {
    metadata: 'Metadata Only',
    aggregated: 'Aggregated Only',
    restricted: 'Restricted'
} as const

const residencyMeta = {
    global: {
        label: 'Global Transfer Cleared',
        className: 'text-emerald-300',
        sortKey: 0,
        icon: 'G'
    },
    local: {
        label: 'Local Hosting Required',
        className: 'text-amber-300',
        sortKey: 1,
        icon: 'L'
    }
} as const

export default function DatasetSchemaPreviewPanel({
    dataset,
    qualityPreview,
    providerSubmission,
    qualityBreakdownPath
}: DatasetSchemaPreviewPanelProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set())
    const isProviderUploadMode = Boolean(providerSubmission)

    useEffect(() => {
        setSearchQuery('')
        setExpandedFields(new Set())
    }, [dataset.id])

    const providerRows = useMemo<ResolvedSchemaRow[]>(() => {
        if (!isProviderUploadMode || !providerSubmission) return []

        const persistedRowsByField = new Map(
            providerSubmission.schemaReview.fieldSummaries.map(field => [field.field, field])
        )

        return PROVIDER_UPLOAD_STEP3_SCHEMA_FIELDS.map<ResolvedSchemaRow>(canonicalField => {
            const persistedField = persistedRowsByField.get(canonicalField.field)
            const piiStatus = persistedField?.piiStatus ?? canonicalField.piiStatus
            const residency = persistedField?.residency ?? canonicalField.residency
            const complianceMeta = providerComplianceMeta[piiStatus]
            const residencyState = residencyMeta[residency]

            return {
                field: canonicalField.field,
                type: persistedField?.type ?? canonicalField.type,
                sampleValue: persistedField?.sample ?? canonicalField.sample,
                complianceLabel: complianceMeta.label,
                complianceClassName: complianceMeta.className,
                complianceSortKey: complianceMeta.sortKey,
                residencyLabel: residencyState.label,
                residencyClassName: residencyState.className,
                residencySortKey: residencyState.sortKey,
                nullPercent: persistedField?.nullRate ?? canonicalField.nullRate,
                aiDescription: persistedField?.aiDescription ?? canonicalField.aiDescription,
                cryptoState: persistedField?.cryptoState ?? canonicalField.cryptoState,
                cardinality: persistedField?.cardinality ?? canonicalField.cardinality,
                provenance: persistedField?.provenance ?? canonicalField.provenance,
                anomalyFlags: persistedField?.anomalyFlags ?? canonicalField.anomalyFlags,
                updateVelocity: persistedField?.updateVelocity ?? canonicalField.updateVelocity
            } satisfies ResolvedSchemaRow
        })
    }, [isProviderUploadMode, providerSubmission])

    const catalogRows = useMemo<ResolvedSchemaRow[]>(() => {
        if (isProviderUploadMode) return []

        const previewFieldNotes = new Map(
            dataset.preview.sampleSchema.map(field => [field.field, field.note])
        )

        if (qualityPreview?.schemaRows.length) {
            return qualityPreview.schemaRows.map<ResolvedSchemaRow>(field => {
                const complianceMeta = seededRiskMeta[field.risk]
                const residencyState = residencyMeta[field.residency]

                return {
                    field: field.field,
                    type: field.type,
                    sampleValue: field.sampleValue,
                    complianceLabel: complianceMeta.label,
                    complianceClassName: complianceMeta.className,
                    complianceSortKey: complianceMeta.sortKey,
                    residencyLabel: residencyState.label,
                    residencyClassName: residencyState.className,
                    residencySortKey: residencyState.sortKey,
                    nullPercent: field.nullPercent,
                    accessLabel: accessMeta[field.access],
                    note: previewFieldNotes.get(field.field)
                } satisfies ResolvedSchemaRow
            })
        }

        return dataset.preview.sampleSchema.map<ResolvedSchemaRow>(field => ({
            field: field.field,
            type: field.type,
            complianceLabel: 'Preview-safe metadata',
            complianceClassName: 'border-slate-700 bg-slate-800/70 text-slate-200',
            complianceSortKey: 0,
            residencyLabel: 'Review in access package',
            residencyClassName: 'text-slate-300',
            residencySortKey: 0,
            note: field.note
        } satisfies ResolvedSchemaRow))
    }, [dataset.preview.sampleSchema, isProviderUploadMode, qualityPreview])

    const rows = isProviderUploadMode ? providerRows : catalogRows

    const filteredRows = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase()
        if (!normalizedQuery) return rows

        return rows.filter(row =>
            [
                row.field,
                row.type,
                row.sampleValue,
                row.complianceLabel,
                row.residencyLabel,
                row.accessLabel,
                row.note,
                row.aiDescription,
                row.cryptoState,
                row.cardinality,
                row.provenance,
                row.anomalyFlags,
                row.updateVelocity
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase()
                .includes(normalizedQuery)
        )
    }, [rows, searchQuery])

    const schemaSummary = useMemo(() => {
        const totalFields = rows.length
        const restrictedCount = rows.filter(row => row.complianceSortKey >= 2).length
        const localCount = rows.filter(row => row.residencySortKey === 1).length
        const averageNull = totalFields > 0
            ? Number(
                (
                    rows.reduce((sum, row) => sum + (row.nullPercent ?? 0), 0) /
                    totalFields
                ).toFixed(1)
            )
            : 0

        return {
            totalFields,
            restrictedCount,
            localCount,
            averageNull
        }
    }, [rows])

    const sourceLabel = isProviderUploadMode
        ? 'Upload Step 3 schema review'
        : qualityPreview?.schemaRows.length
          ? 'Catalog schema preview'
          : 'Preview schema fallback'
    const panelTitle = isProviderUploadMode
        ? 'Upload Step 3 schema review'
        : 'Catalog schema preview'
    const panelDescription = isProviderUploadMode
        ? 'Exact persisted Step 3 field review for this uploaded dataset. Field order and field count match the upload-flow snapshot.'
        : 'This dataset uses the catalog preview schema model. Open the deeper quality/schema workspace for the full validation and schema review experience.'
    const badgeLabel = isProviderUploadMode
        ? `${providerRows.length} reviewed field${providerRows.length === 1 ? '' : 's'}`
        : `${rows.length} preview field${rows.length === 1 ? '' : 's'}`
    const searchPlaceholder = isProviderUploadMode
        ? 'Search the Step 3 reviewed fields...'
        : 'Search preview fields, labels, residency, or notes...'

    const toggleFieldExpansion = (field: string) => {
        setExpandedFields(current => {
            const next = new Set(current)
            if (next.has(field)) {
                next.delete(field)
            } else {
                next.add(field)
            }
            return next
        })
    }

    return (
        <DatasetDetailPanel
            eyebrow="Schema preview"
            title={panelTitle}
            description={panelDescription}
            badge={
                <div className="text-xs text-slate-500">
                    {badgeLabel}
                </div>
            }
        >
            <div className="space-y-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div className="relative w-full max-w-xl">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="search"
                            value={searchQuery}
                            onChange={event => setSearchQuery(event.target.value)}
                            placeholder={searchPlaceholder}
                            className="w-full rounded-sm border border-slate-800 bg-slate-950/80 py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                        <SummaryChip label="Source" value={sourceLabel} />
                        <SummaryChip label="Fields" value={String(schemaSummary.totalFields)} />
                        <SummaryChip label="Restricted / High-risk" value={String(schemaSummary.restrictedCount)} />
                        <SummaryChip label="Local-hosting" value={String(schemaSummary.localCount)} />
                        <SummaryChip label="Avg null rate" value={`${schemaSummary.averageNull.toFixed(1)}%`} />
                    </div>
                </div>

                {!isProviderUploadMode && qualityBreakdownPath ? (
                    <div className="flex flex-col gap-3 rounded-md border border-cyan-500/18 bg-cyan-500/6 px-4 py-3 md:flex-row md:items-center md:justify-between">
                        <div className="min-w-0">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-200/85">
                                Advanced schema workspace
                            </div>
                            <p className="mt-1 text-sm leading-6 text-slate-300">
                                This seeded dataset uses the catalog preview model here. Open the advanced quality workspace for fuller schema filtering, label guidance, and validation signals.
                            </p>
                        </div>
                        <Link
                            to={qualityBreakdownPath}
                            className="inline-flex shrink-0 items-center justify-center rounded-sm border border-cyan-400/35 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition-colors hover:bg-cyan-500/18 hover:text-white"
                        >
                            Open advanced quality workspace
                        </Link>
                    </div>
                ) : null}

                <div className="overflow-hidden rounded-md border border-slate-800 bg-slate-950/70">
                    <div className="max-h-[620px] overflow-auto">
                        <table className="min-w-full text-sm">
                            <thead className="sticky top-0 z-10 bg-slate-900/95 text-[10px] uppercase tracking-[0.14em] text-slate-500">
                                <tr>
                                    <th className="w-[17%] px-3 py-2.5 text-left font-semibold">Field</th>
                                    <th className="w-[10%] px-3 py-2.5 text-left font-semibold">Type</th>
                                    <th className="w-[18%] px-3 py-2.5 text-left font-semibold">Sample</th>
                                    <th className="w-[22%] px-3 py-2.5 text-left font-semibold">Compliance &amp; PII</th>
                                    <th className="w-[14%] px-3 py-2.5 text-left font-semibold">Residency</th>
                                    <th className="w-[9%] px-3 py-2.5 text-left font-semibold">Null %</th>
                                    <th className="w-[10%] px-3 py-2.5 text-center font-semibold">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 bg-slate-950/45 text-xs">
                                {filteredRows.length > 0 ? filteredRows.map(row => (
                                    <Fragment key={`${dataset.id}-${row.field}`}>
                                        <tr className="transition-colors hover:bg-slate-900/70">
                                            <td className="px-3 py-3 font-mono font-semibold text-cyan-300">
                                                {row.field}
                                            </td>
                                            <td className="px-3 py-3">
                                                <span className="rounded-sm border border-slate-700 bg-slate-900 px-2 py-0.5 font-mono text-[10px] text-slate-300">
                                                    {row.type}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 font-mono text-slate-400">
                                                <div className="max-w-[220px] truncate">
                                                    {row.sampleValue ?? '—'}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="flex flex-col gap-2">
                                                    <span className={`inline-flex w-fit rounded-full border px-2 py-0.5 text-[10px] font-semibold ${row.complianceClassName}`}>
                                                        {row.complianceLabel}
                                                    </span>
                                                    {row.accessLabel ? (
                                                        <span className="text-[10px] text-slate-400">
                                                            Access tier: {row.accessLabel}
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3">
                                                {isProviderUploadMode ? (
                                                    <div className={`inline-flex flex-col gap-1 text-[10px] font-medium ${row.residencyClassName}`}>
                                                        <span className="text-base leading-none">
                                                            {row.residencySortKey === 1 ? '🇦🇪' : '🌐'}
                                                        </span>
                                                        <span>{row.residencyLabel}</span>
                                                    </div>
                                                ) : (
                                                    <span className={`inline-flex items-center gap-1 text-[10px] ${row.residencyClassName}`}>
                                                        <span className="rounded-sm border border-current/20 bg-current/10 px-1.5 py-0.5 text-[9px] font-semibold">
                                                            {row.residencyLabel === 'Review in access package'
                                                                ? 'R'
                                                                : row.residencySortKey === 1
                                                                  ? residencyMeta.local.icon
                                                                  : residencyMeta.global.icon}
                                                        </span>
                                                        {row.residencyLabel}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-3 py-3">
                                                <span className={
                                                    row.nullPercent === undefined
                                                        ? 'text-slate-500'
                                                        : row.nullPercent > 5
                                                          ? 'text-amber-300'
                                                          : row.nullPercent > 0
                                                            ? 'text-slate-300'
                                                            : 'text-emerald-300'
                                                }>
                                                    {row.nullPercent !== undefined
                                                        ? `${row.nullPercent.toFixed(1)}%`
                                                        : '—'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleFieldExpansion(row.field)}
                                                    className="inline-flex rounded-sm border border-slate-700 bg-slate-900/75 p-1.5 text-slate-400 transition-colors hover:border-cyan-500/40 hover:text-cyan-200"
                                                    aria-label={`Toggle ${row.field} schema details`}
                                                >
                                                    <svg
                                                        className={`h-4 w-4 transition-transform ${expandedFields.has(row.field) ? 'rotate-180' : ''}`}
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedFields.has(row.field) ? (
                                            <tr className="bg-slate-900/35">
                                                <td colSpan={7} className="px-4 py-4">
                                                    {isProviderUploadMode ? (
                                                        <div className="space-y-4">
                                                            <div className="flex items-center gap-2">
                                                                <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                                                </svg>
                                                                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-400">
                                                                    Advanced AI Analysis &amp; Provenance
                                                                </span>
                                                            </div>
                                                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                                                                {row.cryptoState ? (
                                                                    <DetailCard
                                                                        label="Cryptographic State"
                                                                        value={row.cryptoState}
                                                                        valueClassName={getCryptoStateClassName(row.cryptoState)}
                                                                    />
                                                                ) : null}
                                                                {row.cardinality ? (
                                                                    <DetailCard label="Cardinality" value={row.cardinality} valueClassName="font-mono text-slate-300" />
                                                                ) : null}
                                                                {row.provenance ? (
                                                                    <DetailCard label="Data Provenance" value={row.provenance} valueClassName="font-mono text-slate-300" />
                                                                ) : null}
                                                                {row.anomalyFlags ? (
                                                                    <DetailCard
                                                                        label="Anomaly Flags"
                                                                        value={row.anomalyFlags}
                                                                        valueClassName={getAnomalyFlagsClassName(row.anomalyFlags)}
                                                                    />
                                                                ) : null}
                                                                {row.updateVelocity ? (
                                                                    <DetailCard label="Update Velocity" value={row.updateVelocity} valueClassName="font-mono text-slate-300" />
                                                                ) : null}
                                                            </div>

                                                            {row.aiDescription ? (
                                                                <div className="border-t border-slate-800 pt-2">
                                                                    <div className="mb-1 text-[10px] uppercase tracking-[0.14em] text-cyan-400">
                                                                        AI Inferred Description
                                                                    </div>
                                                                    <div className="text-xs font-mono text-slate-300">
                                                                        {row.aiDescription}
                                                                    </div>
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-4">
                                                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                                                                {row.note ? (
                                                                    <DetailCard label="Preview note" value={row.note} />
                                                                ) : null}
                                                                {row.accessLabel ? (
                                                                    <DetailCard label="Access tier" value={row.accessLabel} />
                                                                ) : null}
                                                                {row.cryptoState ? (
                                                                    <DetailCard label="Cryptographic state" value={row.cryptoState} />
                                                                ) : null}
                                                                {row.cardinality ? (
                                                                    <DetailCard label="Cardinality" value={row.cardinality} />
                                                                ) : null}
                                                                {row.provenance ? (
                                                                    <DetailCard label="Data provenance" value={row.provenance} />
                                                                ) : null}
                                                                {row.anomalyFlags ? (
                                                                    <DetailCard label="Anomaly flags" value={row.anomalyFlags} />
                                                                ) : null}
                                                                {row.updateVelocity ? (
                                                                    <DetailCard label="Update velocity" value={row.updateVelocity} />
                                                                ) : null}
                                                            </div>

                                                            {row.aiDescription ? (
                                                                <div className="rounded-sm border border-slate-800 bg-slate-950/70 px-4 py-3">
                                                                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-300">
                                                                        AI description
                                                                    </div>
                                                                    <p className="mt-2 text-sm leading-6 text-slate-200">
                                                                        {row.aiDescription}
                                                                    </p>
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ) : null}
                                    </Fragment>
                                )) : (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-400">
                                            No schema fields match the current search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DatasetDetailPanel>
    )
}

function SummaryChip({
    label,
    value
}: {
    label: string
    value: string
}) {
    return (
        <div className="rounded-sm border border-slate-800 bg-slate-950/70 px-3 py-2">
            <div className="text-[10px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
            <div className="mt-1 text-sm font-semibold text-slate-100">{value}</div>
        </div>
    )
}

function DetailCard({
    label,
    value,
    valueClassName
}: {
    label: string
    value: string
    valueClassName?: string
}) {
    return (
        <div className="rounded-sm border border-slate-800 bg-slate-950/70 px-3 py-3">
            <div className="text-[10px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
            <div className={`mt-2 text-xs leading-5 text-slate-200 ${valueClassName ?? ''}`.trim()}>{value}</div>
        </div>
    )
}

function getCryptoStateClassName(value?: string) {
    if (value === 'Plaintext') return 'font-mono font-medium text-amber-400'
    if (value === 'SHA-256 Hashed') return 'font-mono font-medium text-cyan-400'
    if (value === 'AES-256 Encrypted') return 'font-mono font-medium text-emerald-400'
    return 'font-mono font-medium text-purple-400'
}

function getAnomalyFlagsClassName(value?: string) {
    if (!value) return 'font-mono text-slate-300'
    if (value.includes('0.00%')) return 'font-mono font-medium text-emerald-400'
    if (value.includes('0.15%')) return 'font-mono font-medium text-rose-400'
    return 'font-mono font-medium text-amber-400'
}
