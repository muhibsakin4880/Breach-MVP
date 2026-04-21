import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
    getProviderReviewStatus,
    providerReviewStatusStyles,
    requestStatusLabel
} from '../data/workspaceData'
import {
    buildCompliancePassport,
    buildRequestPrefillFromPassport,
    describeAccessMode,
    passportStatusMeta
} from '../domain/compliancePassport'
import {
    buildDealDossierProofBundle,
    type DealArtifactPreviewTone
} from '../domain/dealArtifactPreview'
import { loadDealRouteContexts, type DealRouteContext } from '../domain/dealDossier'
import {
    buildProviderRightsPacket,
    loadProviderPacketDraft
} from '../domain/providerRightsPacket'

type RequestedWorkspace = 'metadata' | 'clean_room' | 'aggregated_export' | 'encrypted_download'
type ExportPosture = 'no_export' | 'aggregate_review' | 'reviewed_package'
type JitDuration = '30 minutes' | '2 hours' | '8 hours'
type DataClassKey = 'metadata_schema' | 'governed_query' | 'aggregated_outputs' | 'sensitive_fields'
type SubmissionTone = 'emerald' | 'amber' | 'rose'

type ResearcherAccessDraft = {
    selectedDealId: string
    namedResearcher: string
    analystRole: string
    sponsoringTeam: string
    internalApprover: string
    requestedWorkspace: RequestedWorkspace
    exportPosture: ExportPosture
    jitDuration: JitDuration
    dataClasses: DataClassKey[]
    intendedAnalysis: string
    reviewerNote: string
    attestNoCopyOut: boolean
    attestNamedAnalyst: boolean
    attestIncidentReporting: boolean
    attestStepUpAuth: boolean
}

type DerivedBlocker = {
    id: string
    title: string
    detail: string
    severity: 'Low' | 'Medium' | 'High'
    owner: string
    resolution: string
}

type ControlPreview = {
    workspaceLabel: string
    egressLabel: string
    tokenTtlLabel: string
    stepUpAuth: string
    auditBoundary: string
    watermarking: string
    routeSummary: string
}

const panelClass =
    'rounded-3xl border border-white/10 bg-[#0a1526]/88 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl'

const storageKey = 'Redoubt:researcherAccessDraft:v1'

const workspaceOptions: Array<{
    key: RequestedWorkspace
    label: string
    detail: string
}> = [
    {
        key: 'metadata',
        label: 'Metadata-first review',
        detail: 'Schema, sample fields, policy envelopes, and no governed row-level work.'
    },
    {
        key: 'clean_room',
        label: 'Clean room only',
        detail: 'Named analyst access with blocked copy-out and no export beyond reviewer-approved aggregates.'
    },
    {
        key: 'aggregated_export',
        label: 'Clean room + aggregate export',
        detail: 'Protected workspace plus reviewer-approved aggregate result export.'
    },
    {
        key: 'encrypted_download',
        label: 'Encrypted delivery package',
        detail: 'Only after stronger rights, provider packet readiness, and final reviewer approval.'
    }
]

const exportPostureOptions: Array<{
    key: ExportPosture
    label: string
    detail: string
}> = [
    {
        key: 'no_export',
        label: 'No export',
        detail: 'Results stay inside the governed environment.'
    },
    {
        key: 'aggregate_review',
        label: 'Aggregate review',
        detail: 'Only reviewer-approved aggregate tables or metrics may leave the workspace.'
    },
    {
        key: 'reviewed_package',
        label: 'Reviewed package',
        detail: 'A signed release package can leave the workspace after manual review and audit capture.'
    }
]

const jitDurationOptions: JitDuration[] = ['30 minutes', '2 hours', '8 hours']

const dataClassOptions: Array<{
    key: DataClassKey
    label: string
    detail: string
}> = [
    {
        key: 'metadata_schema',
        label: 'Metadata and schema',
        detail: 'Field names, row counts, lineage notes, and evaluator-facing metadata.'
    },
    {
        key: 'governed_query',
        label: 'Governed query access',
        detail: 'Run scoped analytical queries inside the clean room without row-level extraction.'
    },
    {
        key: 'aggregated_outputs',
        label: 'Aggregated outputs',
        detail: 'Export-reviewed summary tables, metrics, or approved dashboards.'
    },
    {
        key: 'sensitive_fields',
        label: 'Sensitive fields in workspace',
        detail: 'Restricted field exposure inside the named-analyst environment only.'
    }
]

const severityClasses: Record<DerivedBlocker['severity'], string> = {
    Low: 'border-white/12 bg-white/5 text-slate-200',
    Medium: 'border-amber-400/30 bg-amber-500/10 text-amber-100',
    High: 'border-rose-400/30 bg-rose-500/10 text-rose-100'
}

const submissionToneClasses: Record<SubmissionTone, string> = {
    emerald: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100',
    amber: 'border-amber-400/30 bg-amber-500/10 text-amber-100',
    rose: 'border-rose-400/30 bg-rose-500/10 text-rose-100'
}

export default function ResearcherAccessPage() {
    const passport = useMemo(() => buildCompliancePassport(), [])
    const passportPrefill = useMemo(() => buildRequestPrefillFromPassport(passport), [passport])
    const passportMeta = passportStatusMeta(passport.status)
    const contexts = useMemo(() => loadDealRouteContexts(), [])
    const [draft, setDraft] = useState<ResearcherAccessDraft>(() => loadDraft(passport, contexts))

    useEffect(() => {
        if (!contexts.length) return
        if (contexts.some(context => context.seed.dealId === draft.selectedDealId)) return
        setDraft(loadDraft(passport, contexts))
    }, [contexts, draft.selectedDealId, passport])

    useEffect(() => {
        saveDraft(draft)
    }, [draft])

    const selectedContext = useMemo(
        () => contexts.find(context => context.seed.dealId === draft.selectedDealId) ?? contexts[0] ?? null,
        [contexts, draft.selectedDealId]
    )

    const providerPacket = useMemo(
        () =>
            selectedContext
                ? buildProviderRightsPacket(
                    selectedContext,
                    loadProviderPacketDraft(selectedContext.seed.dealId)
                )
                : null,
        [selectedContext]
    )

    const proofBundle = useMemo(
        () => (selectedContext ? buildDealDossierProofBundle(selectedContext) : null),
        [selectedContext]
    )

    const readinessChecks = useMemo(
        () => buildReadinessChecks(draft),
        [draft]
    )

    const derivedBlockers = useMemo(
        () =>
            selectedContext && providerPacket && proofBundle
                ? buildDerivedBlockers({
                    context: selectedContext,
                    packet: providerPacket,
                    proofBundle,
                    draft
                })
                : [],
        [draft, proofBundle, providerPacket, selectedContext]
    )

    const controlPreview = useMemo(
        () =>
            buildControlPreview({
                draft,
                passport,
                context: selectedContext
            }),
        [draft, passport, selectedContext]
    )

    const submissionPosture = useMemo(
        () => buildSubmissionPosture(readinessChecks, derivedBlockers),
        [derivedBlockers, readinessChecks]
    )

    if (!selectedContext || !providerPacket || !proofBundle) {
        return (
            <div className="min-h-screen bg-[#030814] text-white">
                <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(16,185,129,0.14),transparent_30%),radial-gradient(circle_at_84%_0%,rgba(34,211,238,0.12),transparent_28%),radial-gradient(circle_at_48%_85%,rgba(59,130,246,0.10),transparent_34%)]" />
                <div className="relative mx-auto max-w-6xl px-6 py-10 lg:px-10">
                    <section className={panelClass}>
                        <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-100">
                            Researcher access unavailable
                        </div>
                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white">
                            No seeded deal context is available
                        </h1>
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                            The governed access application depends on at least one seeded deal route so it can reuse the dossier, provider packet, and approval signals.
                        </p>
                        <div className="mt-6">
                            <Link
                                to="/deals"
                                className="inline-flex rounded-xl border border-cyan-400/35 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-100 hover:bg-cyan-500/20"
                            >
                                Open evaluation dossier
                            </Link>
                        </div>
                    </section>
                </div>
            </div>
        )
    }

    const request = selectedContext.request
    const verificationFiles = [
        passport.verification.affiliationFileName,
        passport.verification.authorizationFileName
    ].filter((value): value is string => Boolean(value))

    const completedChecks = readinessChecks.filter(check => check.complete).length

    return (
        <div className="min-h-screen bg-[#030814] text-white">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(16,185,129,0.14),transparent_30%),radial-gradient(circle_at_84%_0%,rgba(34,211,238,0.12),transparent_28%),radial-gradient(circle_at_48%_85%,rgba(59,130,246,0.10),transparent_34%)]" />
            <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-10">
                <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Governed analyst application
                        </div>
                        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                            Researcher Access
                        </h1>
                        <p className="mt-2 max-w-3xl text-slate-400">
                            Apply for named-analyst access against a real evaluation deal, reuse your compliance passport, preview the effective JIT controls, and surface the exact provider or governance blockers before reviewer handoff.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200">
                            {selectedContext.seed.dealId}
                        </span>
                        <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${submissionToneClasses[submissionPosture.tone]}`}>
                            {submissionPosture.label}
                        </span>
                    </div>
                </header>

                <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        label="Selected evaluation"
                        value={selectedContext.seed.label}
                        detail={selectedContext.currentStageLabel}
                        tone="cyan"
                    />
                    <SummaryCard
                        label="Passport reuse"
                        value={passportMeta.label}
                        detail={`${passport.passportId} · ${passport.completionPercent}% complete`}
                        tone={passport.status === 'active' ? 'emerald' : passport.status === 'review' ? 'amber' : 'rose'}
                    />
                    <SummaryCard
                        label="Requested environment"
                        value={getWorkspaceLabel(draft.requestedWorkspace)}
                        detail={getExportPostureLabel(draft.exportPosture)}
                        tone={draft.requestedWorkspace === 'encrypted_download' ? 'amber' : 'cyan'}
                    />
                    <SummaryCard
                        label="Reviewer readiness"
                        value={`${completedChecks}/${readinessChecks.length} checks complete`}
                        detail={submissionPosture.detail}
                        tone={submissionPosture.tone}
                    />
                </section>

                <section className="mt-8 grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
                    <div className="space-y-6">
                        <section className={panelClass}>
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Access application</div>
                                    <h2 className="mt-2 text-2xl font-semibold text-white">Named analyst request</h2>
                                    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                                        This request is scoped to one evaluation object. The analyst, approver, export posture, and workspace route will all be attached to the shared dossier and later token controls.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setDraft(buildPassportDefaults(passport, selectedContext))}
                                    className="rounded-xl border border-cyan-400/35 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition-colors hover:bg-cyan-500/20"
                                >
                                    Apply passport defaults
                                </button>
                            </div>

                            <div className="mt-5 grid gap-4 md:grid-cols-2">
                                <SelectField
                                    label="Evaluation deal"
                                    value={draft.selectedDealId}
                                    onChange={value =>
                                        setDraft(current => {
                                            const nextContext =
                                                contexts.find(context => context.seed.dealId === value) ?? selectedContext
                                            return {
                                                ...current,
                                                selectedDealId: value,
                                                requestedWorkspace: deriveWorkspaceFromAccessMode(
                                                    nextContext.passport.preferredAccessMode
                                                ),
                                                exportPosture: deriveExportPosture(
                                                    deriveWorkspaceFromAccessMode(nextContext.passport.preferredAccessMode)
                                                ),
                                                dataClasses: deriveDefaultDataClasses(
                                                    deriveWorkspaceFromAccessMode(nextContext.passport.preferredAccessMode)
                                                )
                                            }
                                        })
                                    }
                                    options={contexts.map(context => ({
                                        value: context.seed.dealId,
                                        label: `${context.seed.dealId} · ${context.seed.label}`
                                    }))}
                                />
                                <TextField
                                    label="Named researcher"
                                    value={draft.namedResearcher}
                                    onChange={value => setDraft(current => ({ ...current, namedResearcher: value }))}
                                    placeholder="A named analyst must be accountable for the session"
                                />
                                <TextField
                                    label="Analyst role"
                                    value={draft.analystRole}
                                    onChange={value => setDraft(current => ({ ...current, analystRole: value }))}
                                    placeholder="Principal investigator, data scientist, reviewer..."
                                />
                                <TextField
                                    label="Sponsoring team"
                                    value={draft.sponsoringTeam}
                                    onChange={value => setDraft(current => ({ ...current, sponsoringTeam: value }))}
                                    placeholder="Which internal team owns the evaluation"
                                />
                                <TextField
                                    label="Internal approver"
                                    value={draft.internalApprover}
                                    onChange={value => setDraft(current => ({ ...current, internalApprover: value }))}
                                    placeholder="Manager, governance lead, or workstream approver"
                                />
                                <FieldShell label="Passport default posture">
                                    <div className="rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-3 text-sm leading-6 text-slate-200">
                                        {describeAccessMode(passport.preferredAccessMode)} · {passport.defaultDuration}
                                    </div>
                                </FieldShell>
                            </div>

                            <div className="mt-5 rounded-2xl border border-cyan-400/20 bg-cyan-500/8 px-4 py-4 text-sm leading-6 text-cyan-100/90">
                                {passportPrefill.note}
                            </div>
                        </section>

                        <section className={panelClass}>
                            <div>
                                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Policy envelope</div>
                                <h2 className="mt-2 text-xl font-semibold text-white">Workspace, export, and scope controls</h2>
                            </div>

                            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                {workspaceOptions.map(option => {
                                    const active = draft.requestedWorkspace === option.key
                                    return (
                                        <button
                                            key={option.key}
                                            type="button"
                                            onClick={() =>
                                                setDraft(current => ({
                                                    ...current,
                                                    requestedWorkspace: option.key,
                                                    exportPosture: deriveExportPosture(option.key),
                                                    dataClasses: deriveDefaultDataClasses(option.key)
                                                }))
                                            }
                                            className={`rounded-2xl border px-4 py-4 text-left transition-colors ${
                                                active
                                                    ? 'border-cyan-400/35 bg-cyan-500/10'
                                                    : 'border-white/8 bg-slate-950/45 hover:border-white/18'
                                            }`}
                                        >
                                            <div className="text-sm font-semibold text-white">{option.label}</div>
                                            <div className="mt-2 text-xs leading-5 text-slate-400">{option.detail}</div>
                                        </button>
                                    )
                                })}
                            </div>

                            <div className="mt-5 grid gap-4 md:grid-cols-2">
                                <SelectField
                                    label="Export posture"
                                    value={draft.exportPosture}
                                    onChange={value =>
                                        setDraft(current => ({
                                            ...current,
                                            exportPosture: value as ExportPosture
                                        }))
                                    }
                                    options={exportPostureOptions.map(option => ({
                                        value: option.key,
                                        label: `${option.label} · ${option.detail}`
                                    }))}
                                />
                                <SelectField
                                    label="JIT token window"
                                    value={draft.jitDuration}
                                    onChange={value =>
                                        setDraft(current => ({
                                            ...current,
                                            jitDuration: value as JitDuration
                                        }))
                                    }
                                    options={jitDurationOptions.map(value => ({
                                        value,
                                        label: value
                                    }))}
                                />
                            </div>

                            <div className="mt-5">
                                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Requested data classes</div>
                                <div className="mt-3 grid gap-3 md:grid-cols-2">
                                    {dataClassOptions.map(option => {
                                        const active = draft.dataClasses.includes(option.key)
                                        return (
                                            <label
                                                key={option.key}
                                                className={`flex gap-3 rounded-2xl border px-4 py-4 ${
                                                    active
                                                        ? 'border-emerald-400/20 bg-emerald-500/8'
                                                        : 'border-white/8 bg-slate-950/45'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={active}
                                                    onChange={() =>
                                                        setDraft(current => ({
                                                            ...current,
                                                            dataClasses: toggleDataClass(current.dataClasses, option.key)
                                                        }))
                                                    }
                                                    className="mt-1 h-4 w-4 rounded border-white/20 bg-slate-950 text-emerald-400"
                                                />
                                                <div>
                                                    <div className="text-sm font-semibold text-white">{option.label}</div>
                                                    <div className="mt-1 text-xs leading-5 text-slate-400">{option.detail}</div>
                                                </div>
                                            </label>
                                        )
                                    })}
                                </div>
                            </div>
                        </section>

                        <section className={panelClass}>
                            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                                <div>
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Intent and reviewer note</div>
                                    <h2 className="mt-2 text-xl font-semibold text-white">Why this analyst needs access</h2>

                                    <div className="mt-5 space-y-4">
                                        <TextAreaField
                                            label="Intended analysis"
                                            value={draft.intendedAnalysis}
                                            onChange={value => setDraft(current => ({ ...current, intendedAnalysis: value }))}
                                            rows={6}
                                            placeholder="Describe the governed analysis, expected outputs, and why this analyst needs this route instead of metadata-only evaluation."
                                        />
                                        <TextAreaField
                                            label="Reviewer note"
                                            value={draft.reviewerNote}
                                            onChange={value => setDraft(current => ({ ...current, reviewerNote: value }))}
                                            rows={4}
                                            placeholder="Optional context for privacy, legal, or governance reviewers."
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Attestations</div>
                                    <h2 className="mt-2 text-xl font-semibold text-white">Named-analyst commitments</h2>

                                    <div className="mt-5 space-y-3">
                                        <AttestationCard
                                            checked={draft.attestNamedAnalyst}
                                            label="Only the named analyst will use the session"
                                            detail="No shared credentials, delegated use, or anonymous researcher rotation."
                                            onChange={checked => setDraft(current => ({ ...current, attestNamedAnalyst: checked }))}
                                        />
                                        <AttestationCard
                                            checked={draft.attestNoCopyOut}
                                            label="No copy-out outside the approved export posture"
                                            detail="Clipboard, screenshots, and raw export remain blocked unless later approved."
                                            onChange={checked => setDraft(current => ({ ...current, attestNoCopyOut: checked }))}
                                        />
                                        <AttestationCard
                                            checked={draft.attestIncidentReporting}
                                            label="Incident escalation will be reported immediately"
                                            detail="Any policy breach, anomaly, or unexpected provider restriction is escalated into the review trail."
                                            onChange={checked => setDraft(current => ({ ...current, attestIncidentReporting: checked }))}
                                        />
                                        <AttestationCard
                                            checked={draft.attestStepUpAuth}
                                            label="Step-up authentication is available before session launch"
                                            detail="Hardware key, SSO, or equivalent step-up auth is ready before credentials are issued."
                                            onChange={checked => setDraft(current => ({ ...current, attestStepUpAuth: checked }))}
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <aside className="space-y-6">
                        <section className={panelClass}>
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Reviewer status</div>
                                    <h2 className="mt-2 text-xl font-semibold text-white">What the reviewers will see</h2>
                                </div>
                                <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${submissionToneClasses[submissionPosture.tone]}`}>
                                    {submissionPosture.label}
                                </span>
                            </div>

                            <div className="mt-5 grid gap-3">
                                <FieldRow label="Compliance passport" value={passportMeta.label} />
                                <FieldRow
                                    label="Provider packet"
                                    value={`${providerPacket.overallStatus} · ${providerPacket.providerInstitution}`}
                                />
                                <FieldRow
                                    label="Request review state"
                                    value={
                                        request
                                            ? `${requestStatusLabel(request.status)} · ${getProviderReviewStatus(request)}`
                                            : 'No request is mapped yet'
                                    }
                                />
                                <FieldRow
                                    label="Evidence pack"
                                    value={
                                        proofBundle.evidencePack
                                            ? `${proofBundle.evidencePack.id} · ${proofBundle.evidencePack.status}`
                                            : 'No evidence pack is attached yet'
                                    }
                                />
                            </div>

                            {request ? (
                                <div className="mt-5 flex flex-wrap gap-2">
                                    <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${providerReviewStatusStyles[getProviderReviewStatus(request)]}`}>
                                        {getProviderReviewStatus(request)}
                                    </span>
                                    <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${passportMeta.classes}`}>
                                        {passportMeta.label}
                                    </span>
                                    <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${getToneBadgeClasses(providerPacket.overallTone)}`}>
                                        {providerPacket.overallStatus}
                                    </span>
                                </div>
                            ) : null}
                        </section>

                        <section className={panelClass}>
                            <div>
                                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Identity and verification reuse</div>
                                <h2 className="mt-2 text-xl font-semibold text-white">Institutional proof already attached</h2>
                            </div>

                            <div className="mt-5 grid gap-3">
                                <FieldRow label="Organization" value={passport.organization.organizationName} />
                                <FieldRow label="Work email" value={passport.organization.officialWorkEmail} />
                                <FieldRow label="Step-up auth" value={buildAuthSummary(passport)} />
                                <FieldRow
                                    label="Verification files"
                                    value={verificationFiles.length > 0 ? verificationFiles.join(' · ') : 'No verification file attached'}
                                />
                            </div>
                        </section>

                        <section className={panelClass}>
                            <div>
                                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Effective control preview</div>
                                <h2 className="mt-2 text-xl font-semibold text-white">What access would actually look like</h2>
                            </div>

                            <div className="mt-5 grid gap-3">
                                <FieldRow label="Workspace route" value={controlPreview.workspaceLabel} />
                                <FieldRow label="Access route" value={controlPreview.routeSummary} />
                                <FieldRow label="Token TTL" value={controlPreview.tokenTtlLabel} />
                                <FieldRow label="Egress posture" value={controlPreview.egressLabel} />
                                <FieldRow label="Watermarking" value={controlPreview.watermarking} />
                                <FieldRow label="Audit boundary" value={controlPreview.auditBoundary} />
                                <FieldRow label="Step-up auth" value={controlPreview.stepUpAuth} />
                            </div>
                        </section>

                        <section className={panelClass}>
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Conditional blockers</div>
                                    <h2 className="mt-2 text-xl font-semibold text-white">What still needs to clear</h2>
                                </div>
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-200">
                                    {derivedBlockers.length}
                                </span>
                            </div>

                            <div className="mt-5 space-y-3">
                                {derivedBlockers.length > 0 ? (
                                    derivedBlockers.map(blocker => (
                                        <BlockerCard key={blocker.id} blocker={blocker} />
                                    ))
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-white/12 bg-slate-950/35 px-4 py-5 text-sm leading-6 text-slate-400">
                                        No policy or provider-side blocker is currently preventing this draft from going to reviewers.
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className={panelClass}>
                            <div>
                                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Readiness checklist</div>
                                <h2 className="mt-2 text-xl font-semibold text-white">Reviewer handoff conditions</h2>
                            </div>

                            <div className="mt-5 space-y-3">
                                {readinessChecks.map(check => (
                                    <div
                                        key={check.label}
                                        className={`rounded-2xl border px-4 py-3 ${
                                            check.complete
                                                ? 'border-emerald-400/20 bg-emerald-500/8'
                                                : 'border-white/8 bg-slate-950/45'
                                        }`}
                                    >
                                        <div className="text-sm font-semibold text-white">{check.label}</div>
                                        <div className="mt-1 text-xs leading-5 text-slate-400">{check.detail}</div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className={panelClass}>
                            <div>
                                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Quick links</div>
                                <h2 className="mt-2 text-xl font-semibold text-white">Open the connected surfaces</h2>
                            </div>

                            <div className="mt-5 grid gap-3">
                                <QuickLink to={selectedContext.routeTargets.dossier} label="Evaluation dossier" />
                                <QuickLink to={selectedContext.routeTargets['provider-packet']} label="Provider packet" />
                                {request ? (
                                    <QuickLink to={`/access-requests/${request.id}`} label="Access request detail" />
                                ) : null}
                                <QuickLink to="/compliance-passport" label="Compliance passport" />
                                <QuickLink to="/rbac-console" label="RBAC console" />
                                <QuickLink to="/secure-enclave" label="Secure enclave" />
                            </div>
                        </section>
                    </aside>
                </section>
            </div>
        </div>
    )
}

function SummaryCard({
    label,
    value,
    detail,
    tone
}: {
    label: string
    value: string
    detail: string
    tone: SubmissionTone | 'cyan'
}) {
    return (
        <article className="rounded-2xl border border-white/10 bg-[#0a1526]/88 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.24)]">
            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
            <div className={`mt-3 text-xl font-semibold ${tone === 'cyan' ? 'text-cyan-200' : tone === 'emerald' ? 'text-emerald-200' : tone === 'amber' ? 'text-amber-200' : 'text-rose-200'}`}>
                {value}
            </div>
            <div className="mt-2 text-xs leading-5 text-slate-400">{detail}</div>
        </article>
    )
}

function FieldShell({
    label,
    children
}: {
    label: string
    children: React.ReactNode
}) {
    return (
        <div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
            <div className="mt-2">{children}</div>
        </div>
    )
}

function TextField({
    label,
    value,
    onChange,
    placeholder
}: {
    label: string
    value: string
    onChange: (value: string) => void
    placeholder: string
}) {
    return (
        <FieldShell label={label}>
            <input
                value={value}
                onChange={event => onChange(event.target.value)}
                placeholder={placeholder}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400/40 focus:outline-none"
            />
        </FieldShell>
    )
}

function SelectField({
    label,
    value,
    onChange,
    options
}: {
    label: string
    value: string
    onChange: (value: string) => void
    options: Array<{ value: string; label: string }>
}) {
    return (
        <FieldShell label={label}>
            <select
                value={value}
                onChange={event => onChange(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white focus:border-cyan-400/40 focus:outline-none"
            >
                {options.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </FieldShell>
    )
}

function TextAreaField({
    label,
    value,
    onChange,
    rows,
    placeholder
}: {
    label: string
    value: string
    onChange: (value: string) => void
    rows: number
    placeholder: string
}) {
    return (
        <FieldShell label={label}>
            <textarea
                value={value}
                onChange={event => onChange(event.target.value)}
                rows={rows}
                placeholder={placeholder}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-cyan-400/40 focus:outline-none"
            />
        </FieldShell>
    )
}

function AttestationCard({
    checked,
    label,
    detail,
    onChange
}: {
    checked: boolean
    label: string
    detail: string
    onChange: (checked: boolean) => void
}) {
    return (
        <label
            className={`flex gap-3 rounded-2xl border px-4 py-4 ${
                checked
                    ? 'border-emerald-400/20 bg-emerald-500/8'
                    : 'border-white/8 bg-slate-950/45'
            }`}
        >
            <input
                type="checkbox"
                checked={checked}
                onChange={event => onChange(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-white/20 bg-slate-950 text-emerald-400"
            />
            <div>
                <div className="text-sm font-semibold text-white">{label}</div>
                <div className="mt-1 text-xs leading-5 text-slate-400">{detail}</div>
            </div>
        </label>
    )
}

function FieldRow({
    label,
    value
}: {
    label: string
    value: string
}) {
    return (
        <div className="rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-3">
            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
            <div className="mt-2 text-sm leading-6 text-slate-100">{value}</div>
        </div>
    )
}

function QuickLink({
    to,
    label
}: {
    to: string
    label: string
}) {
    return (
        <Link
            to={to}
            className="rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-3 text-sm font-semibold text-slate-100 transition-colors hover:border-cyan-400/40 hover:text-cyan-100"
        >
            {label}
        </Link>
    )
}

function BlockerCard({
    blocker
}: {
    blocker: DerivedBlocker
}) {
    return (
        <div className="rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-2xl">
                    <div className="text-sm font-semibold text-white">{blocker.title}</div>
                    <div className="mt-2 text-sm leading-6 text-slate-300">{blocker.detail}</div>
                </div>
                <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${severityClasses[blocker.severity]}`}>
                    {blocker.severity}
                </span>
            </div>

            <div className="mt-4 grid gap-3">
                <FieldRow label="Owner" value={blocker.owner} />
                <FieldRow label="Resolution path" value={blocker.resolution} />
            </div>
        </div>
    )
}

function loadDraft(
    passport: ReturnType<typeof buildCompliancePassport>,
    contexts: DealRouteContext[]
) {
    const fallback = contexts[0] ? buildPassportDefaults(passport, contexts[0]) : buildStandaloneFallback(passport)

    if (typeof window === 'undefined') return fallback

    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return fallback

    try {
        const parsed = JSON.parse(raw) as Partial<ResearcherAccessDraft>
        return {
            ...fallback,
            ...parsed,
            dataClasses: Array.isArray(parsed.dataClasses) && parsed.dataClasses.length > 0
                ? parsed.dataClasses
                : fallback.dataClasses
        }
    } catch {
        return fallback
    }
}

function saveDraft(draft: ResearcherAccessDraft) {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(storageKey, JSON.stringify(draft))
}

function buildStandaloneFallback(
    passport: ReturnType<typeof buildCompliancePassport>
): ResearcherAccessDraft {
    const requestedWorkspace = deriveWorkspaceFromAccessMode(passport.preferredAccessMode)
    return {
        selectedDealId: '',
        namedResearcher: passport.organization.primaryContactName,
        analystRole: passport.organization.roleInOrganization,
        sponsoringTeam: passport.organization.organizationName,
        internalApprover: passport.organization.primaryContactName,
        requestedWorkspace,
        exportPosture: deriveExportPosture(requestedWorkspace),
        jitDuration: '2 hours',
        dataClasses: deriveDefaultDataClasses(requestedWorkspace),
        intendedAnalysis: buildRequestPrefillFromPassport(passport).intendedUsage,
        reviewerNote: '',
        attestNoCopyOut: true,
        attestNamedAnalyst: true,
        attestIncidentReporting: false,
        attestStepUpAuth: passport.verification.authenticationMethod === 'hardware_key'
    }
}

function buildPassportDefaults(
    passport: ReturnType<typeof buildCompliancePassport>,
    context: DealRouteContext
): ResearcherAccessDraft {
    const requestedWorkspace = deriveWorkspaceFromAccessMode(context.passport.preferredAccessMode)
    const prefill = buildRequestPrefillFromPassport(context.passport)
    return {
        selectedDealId: context.seed.dealId,
        namedResearcher:
            context.passport.organization.primaryContactName || context.passport.organization.fullName,
        analystRole: context.passport.organization.roleInOrganization,
        sponsoringTeam: context.passport.organization.organizationName,
        internalApprover: context.passport.organization.primaryContactName,
        requestedWorkspace,
        exportPosture: deriveExportPosture(requestedWorkspace),
        jitDuration: context.checkoutRecord?.credentials.tokenTtlMinutes && context.checkoutRecord.credentials.tokenTtlMinutes <= 30
            ? '30 minutes'
            : context.checkoutRecord?.credentials.tokenTtlMinutes && context.checkoutRecord.credentials.tokenTtlMinutes >= 480
                ? '8 hours'
                : '2 hours',
        dataClasses: deriveDefaultDataClasses(requestedWorkspace),
        intendedAnalysis: context.request?.intendedUsage ?? prefill.intendedUsage,
        reviewerNote: context.request?.reviewerFeedback ?? '',
        attestNoCopyOut: true,
        attestNamedAnalyst: true,
        attestIncidentReporting: false,
        attestStepUpAuth:
            context.passport.verification.authenticationMethod === 'hardware_key' ||
            Boolean(context.passport.verification.ssoDomain)
    }
}

function deriveWorkspaceFromAccessMode(
    mode: ReturnType<typeof buildCompliancePassport>['preferredAccessMode']
): RequestedWorkspace {
    if (mode === 'metadata') return 'metadata'
    if (mode === 'clean_room') return 'clean_room'
    if (mode === 'clean_room_plus_aggregated') return 'aggregated_export'
    return 'encrypted_download'
}

function deriveExportPosture(workspace: RequestedWorkspace): ExportPosture {
    if (workspace === 'metadata') return 'no_export'
    if (workspace === 'clean_room') return 'aggregate_review'
    if (workspace === 'aggregated_export') return 'aggregate_review'
    return 'reviewed_package'
}

function deriveDefaultDataClasses(workspace: RequestedWorkspace): DataClassKey[] {
    if (workspace === 'metadata') return ['metadata_schema']
    if (workspace === 'clean_room') return ['metadata_schema', 'governed_query']
    if (workspace === 'aggregated_export') {
        return ['metadata_schema', 'governed_query', 'aggregated_outputs']
    }
    return ['metadata_schema', 'governed_query', 'aggregated_outputs', 'sensitive_fields']
}

function toggleDataClass(current: DataClassKey[], key: DataClassKey) {
    return current.includes(key)
        ? current.filter(item => item !== key)
        : [...current, key]
}

function buildReadinessChecks(draft: ResearcherAccessDraft) {
    return [
        {
            label: 'Named analyst recorded',
            detail: 'A specific person must be accountable for the session.',
            complete: Boolean(draft.namedResearcher.trim())
        },
        {
            label: 'Internal approver recorded',
            detail: 'A sponsoring manager or governance owner must be visible to reviewers.',
            complete: Boolean(draft.internalApprover.trim())
        },
        {
            label: 'Analysis intent written',
            detail: 'Reviewers need a concrete purpose and output expectation.',
            complete: Boolean(draft.intendedAnalysis.trim())
        },
        {
            label: 'Requested data classes chosen',
            detail: 'The application must name what will be visible inside the workspace.',
            complete: draft.dataClasses.length > 0
        },
        {
            label: 'All analyst attestations accepted',
            detail: 'Named-analyst, incident, step-up auth, and no copy-out commitments are required.',
            complete:
                draft.attestNamedAnalyst &&
                draft.attestNoCopyOut &&
                draft.attestIncidentReporting &&
                draft.attestStepUpAuth
        }
    ]
}

function buildDerivedBlockers({
    context,
    packet,
    proofBundle,
    draft
}: {
    context: DealRouteContext
    packet: ReturnType<typeof buildProviderRightsPacket>
    proofBundle: ReturnType<typeof buildDealDossierProofBundle>
    draft: ResearcherAccessDraft
}) {
    const blockers: DerivedBlocker[] = [
        ...proofBundle.approvalBlockers.map(blocker => ({
            id: blocker.id,
            title: blocker.blocker,
            detail: `${blocker.organization} still has an approval blocker attached to this evaluation object.`,
            severity: blocker.severity,
            owner: blocker.owner,
            resolution: `Resolve before ${blocker.deadline} and update the shared review packet.`
        })),
        ...packet.unresolvedExceptions.map(exception => ({
            id: exception.id,
            title: exception.title,
            detail: exception.detail,
            severity: exception.severity,
            owner: exception.owner,
            resolution: exception.resolution
        }))
    ]

    if (draft.requestedWorkspace === 'metadata' && draft.dataClasses.includes('sensitive_fields')) {
        blockers.push({
            id: 'researcher-access-sensitive-metadata',
            title: 'Sensitive fields requested in metadata-only mode',
            detail: 'Metadata-first evaluation cannot expose sensitive fields or governed row-level material.',
            severity: 'High',
            owner: 'Access policy engine',
            resolution: 'Move to a clean-room route or remove sensitive fields from the requested scope.'
        })
    }

    if (draft.requestedWorkspace === 'metadata' && draft.exportPosture !== 'no_export') {
        blockers.push({
            id: 'researcher-access-metadata-export',
            title: 'Export posture exceeds metadata-only route',
            detail: 'Metadata review does not support aggregate or reviewed export lanes.',
            severity: 'High',
            owner: 'Access policy engine',
            resolution: 'Keep the request no-export or switch to a clean-room evaluation route.'
        })
    }

    if (
        draft.requestedWorkspace === 'encrypted_download' &&
        packet.overallTone !== 'emerald'
    ) {
        blockers.push({
            id: 'researcher-access-provider-packet-download',
            title: 'Provider packet is not ready for encrypted delivery',
            detail: 'Encrypted delivery needs a buyer-ready provider packet with signed restrictions and no unresolved release concerns.',
            severity: 'High',
            owner: 'Provider review',
            resolution: 'Clear provider exceptions or narrow the request back to a governed workspace.'
        })
    }

    if (
        draft.exportPosture === 'reviewed_package' &&
        context.request?.status !== 'REQUEST_APPROVED'
    ) {
        blockers.push({
            id: 'researcher-access-reviewed-package-pending',
            title: 'Reviewed package requested before request approval',
            detail: 'The evaluation request is not yet approved for a wider release package posture.',
            severity: 'Medium',
            owner: 'Governance review',
            resolution: 'Wait for request approval or keep the application in clean-room aggregate review mode.'
        })
    }

    if (
        proofBundle.deploymentSurface?.blocker &&
        (draft.requestedWorkspace === 'aggregated_export' || draft.requestedWorkspace === 'encrypted_download')
    ) {
        blockers.push({
            id: 'researcher-access-deployment-review',
            title: 'Deployment and residency review still open',
            detail: proofBundle.deploymentSurface.blocker,
            severity: 'Medium',
            owner: 'Residency review',
            resolution: 'Resolve the deployment memo or keep the evaluation inside the protected environment.'
        })
    }

    return blockers
}

function buildControlPreview({
    draft,
    passport,
    context
}: {
    draft: ResearcherAccessDraft
    passport: ReturnType<typeof buildCompliancePassport>
    context: DealRouteContext | null
}): ControlPreview {
    const workspaceLabel = getWorkspaceLabel(draft.requestedWorkspace)
    const routeSummary =
        context?.checkoutRecord?.workspace.workspaceName ??
        (draft.requestedWorkspace === 'metadata'
            ? 'Metadata review surface'
            : draft.requestedWorkspace === 'clean_room'
                ? 'Protected evaluation clean room'
                : draft.requestedWorkspace === 'aggregated_export'
                    ? 'Protected evaluation clean room with reviewed aggregate lane'
                    : 'Encrypted release package after signoff')

    const egressLabel =
        draft.exportPosture === 'no_export'
            ? 'No output leaves the governed environment.'
            : draft.exportPosture === 'aggregate_review'
                ? 'Only reviewer-approved aggregate outputs may leave the workspace.'
                : 'Reviewed release package only after manual signoff and audit capture.'

    return {
        workspaceLabel,
        routeSummary,
        egressLabel,
        tokenTtlLabel: `${draft.jitDuration} JIT credential${draft.requestedWorkspace === 'metadata' ? ' not issued until workspace route is approved' : ''}`,
        stepUpAuth: buildAuthSummary(passport),
        auditBoundary:
            context?.request?.auditRequirement ??
            'Named-analyst session logging, token issuance, and export review stay in the deal audit trail.',
        watermarking:
            draft.requestedWorkspace === 'metadata'
                ? 'Metadata review remains watermark-light and no export path is opened.'
                : draft.requestedWorkspace === 'encrypted_download'
                    ? 'Released package remains watermarked and bound to the approver chain.'
                    : 'All outputs stay watermark-linked to the analyst and evaluation session.'
    }
}

function buildSubmissionPosture(
    readinessChecks: ReturnType<typeof buildReadinessChecks>,
    blockers: DerivedBlocker[]
) {
    const incompleteChecks = readinessChecks.filter(check => !check.complete)
    const hasHighBlocker = blockers.some(blocker => blocker.severity === 'High')
    const hasMediumBlocker = blockers.some(blocker => blocker.severity === 'Medium')

    if (incompleteChecks.length > 0 || hasHighBlocker) {
        return {
            label: 'Blocked for reviewer handoff',
            tone: 'rose' as const,
            detail:
                incompleteChecks.length > 0
                    ? `${incompleteChecks.length} readiness condition${incompleteChecks.length === 1 ? '' : 's'} still missing`
                    : 'One or more high-severity provider or policy blockers still apply'
        }
    }

    if (hasMediumBlocker) {
        return {
            label: 'Conditional review',
            tone: 'amber' as const,
            detail: 'The application is credible, but reviewers still need to close one or more medium-severity conditions'
        }
    }

    return {
        label: 'Ready for reviewer handoff',
        tone: 'emerald' as const,
        detail: 'The draft matches the named-analyst control model and no blocker is currently preventing review'
    }
}

function getWorkspaceLabel(workspace: RequestedWorkspace) {
    return workspaceOptions.find(option => option.key === workspace)?.label ?? workspace
}

function getExportPostureLabel(posture: ExportPosture) {
    return exportPostureOptions.find(option => option.key === posture)?.label ?? posture
}

function buildAuthSummary(passport: ReturnType<typeof buildCompliancePassport>) {
    if (passport.verification.authenticationMethod === 'hardware_key') {
        return `Hardware key · ${passport.verification.hardwareKeyType || 'step-up ready'}`
    }
    if (passport.verification.ssoDomain) {
        return `SSO domain ${passport.verification.ssoDomain}`
    }
    return 'Step-up auth evidence attached'
}

function getToneBadgeClasses(tone: DealArtifactPreviewTone) {
    if (tone === 'rose') return 'border-rose-400/30 bg-rose-500/10 text-rose-100'
    if (tone === 'amber') return 'border-amber-400/30 bg-amber-500/10 text-amber-100'
    if (tone === 'emerald') return 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'
    if (tone === 'cyan') return 'border-cyan-400/30 bg-cyan-500/10 text-cyan-100'
    return 'border-white/12 bg-white/5 text-slate-200'
}
