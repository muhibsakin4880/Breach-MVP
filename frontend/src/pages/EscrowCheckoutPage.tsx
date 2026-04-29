import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import DatasetUnavailableState from '../components/DatasetUnavailableState'
import DealArtifactPreviewGrid from '../components/deals/DealArtifactPreviewGrid'
import { getDealRouteRecordByDatasetId } from '../data/dealDossierData'
import { DATASET_DETAILS, getDatasetDetailById } from '../data/datasetDetailData'
import DealProgressTracker from '../components/DealProgressTracker'
import { buildCompliancePassport, passportStatusMeta } from '../domain/compliancePassport'
import { buildDealProgressModel } from '../domain/dealProgress'
import { getDealRouteContextById } from '../domain/dealDossier'
import DemoEscrowControls from '../components/demo/DemoEscrowControls'
import {
    buildEscrowCheckoutRecord,
    buildEscrowDueUseAgreement,
    checkoutAccessModeMeta,
    confirmOutcomeValidation,
    describeCheckoutPaymentMethod,
    getPlannedCredentialScopes,
    getOutcomeEvaluationFee,
    getPlannedWorkspaceLaunchPath,
    getPlannedWorkspaceName,
    getRecommendedCheckoutConfig,
    issueEscrowScopedCredentials,
    loadEscrowCheckoutByQuoteId,
    outcomeStageMeta,
    paymentMethodMeta,
    provisionEscrowWorkspace,
    releaseEscrowToProvider,
    reviewWindowOptions,
    runOutcomeProtectionEngine,
    saveEscrowCheckout,
    type EscrowCheckoutConfig,
    type EscrowCheckoutRecord,
    type EscrowCheckoutAccessMode,
    type EscrowPaymentMethod,
    type EscrowReviewWindowHours
} from '../domain/escrowCheckout'
import { buildOutputReviewModel } from '../domain/outputReview'
import {
    DEMO_ESCROW_CANONICAL_IDS,
    filterOutCanonicalDemoQuotes,
    getBuyerRouteTargets,
    getCanonicalDemoEscrowScenario,
    isCanonicalDemoEscrowRecord,
    saveCanonicalDemoEscrowState,
    setDemoStage,
    type DemoEscrowScenario
} from '../domain/demoEscrowScenario'
import { buildBuyerTokenViewModel, formatTimestamp } from '../domain/ephemeralToken'
import {
    buildRightsQuote,
    formatUsd,
    getDefaultRightsQuoteForm,
    loadRightsQuotes
} from '../domain/rightsQuoteBuilder'

const checkoutSectionClass =
    'rounded-[28px] border border-white/10 bg-slate-900/80 p-5 shadow-[0_22px_70px_rgba(2,6,23,0.42)] backdrop-blur-sm sm:p-6'
const checkoutInsetClass = 'rounded-2xl border border-white/8 bg-slate-950/60 p-4'
const checkoutMutedLabelClass = 'text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500'
const checkoutActionButtonClass =
    'rounded-xl border px-4 py-3 text-sm font-semibold transition-colors'

type EscrowCheckoutLocationState = {
    quoteId?: string
} | null

type JurisdictionStatusTone = 'active' | 'pending' | 'blocked' | 'standby'

type JurisdictionStatus = {
    label: string
    status: string
    detail: string
    tone: JurisdictionStatusTone
}

type TransferSafeguardState = 'active' | 'review' | 'blocked'

type TransferSafeguard = {
    label: string
    detail: string
    state: TransferSafeguardState
}

type TransferReviewModule = {
    destination: string
    transferStatus: string
    reviewState: string
    explanation: string
    tone: JurisdictionStatusTone
    safeguards: TransferSafeguard[]
}

type TransactionTimelineStepState = 'complete' | 'current' | 'upcoming' | 'issue'

type TransactionTimelineStep = {
    label: string
    detail: string
    state: TransactionTimelineStepState
}

type CheckoutFlowTone = 'active' | 'pending' | 'blocked' | 'standby'

type CheckoutFlowCard = {
    label: string
    value: string
    detail: string
    tone: CheckoutFlowTone
}

const geographyLabelMap = {
    single_region: 'Single region',
    dual_region: 'Dual region',
    global: 'Global'
} as const

const accessRegionLabelMap = {
    single_region: 'Single-region governed lane',
    dual_region: 'Dual-region reviewed lane',
    global: 'Cross-region reviewed lane'
} as const

const providerJurisdictionLabelMap = {
    single_region: 'Provider regional entity',
    dual_region: 'Provider multi-market entity',
    global: 'Provider multi-region entity'
} as const

const getTransferPostureLabel = (accessMode: EscrowCheckoutAccessMode) => {
    if (accessMode === 'clean_room') return 'Local processing preferred'
    if (accessMode === 'aggregated_export') return 'Conditional transfer review'
    return 'Export-restricted encrypted release'
}

const transferStateExplainers = [
    {
        title: 'Blocked',
        detail: 'No approved external destination is open, or the checkout stays workspace-only.'
    },
    {
        title: 'Conditional',
        detail: 'A destination exists, but transfer waits for safeguard review before release.'
    },
    {
        title: 'Allowed',
        detail: 'The destination stays inside the approved operating lane with active controls.'
    }
] as const

const buildJurisdictionStatuses = (
    accessMode: EscrowCheckoutAccessMode,
    geography: keyof typeof geographyLabelMap
): JurisdictionStatus[] => {
    const localProcessing: JurisdictionStatus =
        accessMode === 'clean_room'
            ? {
                label: 'Local processing',
                status: 'Primary',
                detail: 'Evaluation stays inside the governed workspace by default.',
                tone: 'active'
            }
            : accessMode === 'aggregated_export'
                ? {
                    label: 'Local processing',
                    status: 'Preferred',
                    detail: 'Primary analysis remains workspace-bound before any reviewed aggregate transfer.',
                    tone: 'pending'
                }
                : {
                    label: 'Local processing',
                    status: 'Scoped',
                    detail: 'The workspace remains the first control point before any encrypted release.',
                    tone: 'pending'
                }

    const conditionalTransferReview: JurisdictionStatus =
        accessMode === 'clean_room' && geography === 'single_region'
            ? {
                label: 'Conditional transfer review',
                status: 'Standby',
                detail: 'Cross-region review is not part of the standard checkout path.',
                tone: 'active'
            }
            : {
                label: 'Conditional transfer review',
                status: 'Required',
                detail: 'Any transfer outside the governed lane is held for review before release.',
                tone: accessMode === 'encrypted_download' ? 'pending' : 'pending'
            }

    const exportRestricted: JurisdictionStatus =
        accessMode === 'clean_room'
            ? {
                label: 'Export restricted',
                status: 'Blocked',
                detail: 'Raw export stays disabled in the clean-room configuration.',
                tone: 'active'
            }
            : accessMode === 'aggregated_export'
                ? {
                    label: 'Export restricted',
                    status: 'Aggregate only',
                    detail: 'Only reviewed aggregate outputs can leave the workspace.',
                    tone: 'pending'
                }
                : {
                    label: 'Export restricted',
                    status: 'Encrypted only',
                    detail: 'Release is time-boxed, watermarked, and limited to the approved package.',
                    tone: 'pending'
                }

    return [localProcessing, conditionalTransferReview, exportRestricted]
}

const getJurisdictionToneClasses = (tone: JurisdictionStatusTone) => {
    if (tone === 'active') return 'border-teal-500/30 bg-teal-500/10 text-teal-100'
    if (tone === 'pending') return 'border-amber-500/30 bg-amber-500/10 text-amber-100'
    if (tone === 'blocked') return 'border-rose-500/30 bg-rose-500/10 text-rose-100'
    return 'border-slate-500/30 bg-slate-500/10 text-slate-300'
}

const buildTransferReviewModule = (
    accessMode: EscrowCheckoutAccessMode,
    geography: keyof typeof geographyLabelMap
): TransferReviewModule => {
    const commonSafeguards: TransferSafeguard[] = [
        {
            label: 'Governed workspace',
            detail: 'Evaluation remains inside a monitored workspace before any release decision.',
            state: 'active'
        },
        {
            label: 'Audit logging',
            detail: 'Destination, reviewer actions, and release events stay recorded.',
            state: 'active'
        },
        {
            label: 'Restricted credentials',
            detail: 'Access stays scoped to the approved recipient and review window.',
            state: 'active'
        }
    ]

    if (accessMode === 'clean_room' && geography === 'single_region') {
        return {
            destination: 'No external transfer destination opened',
            transferStatus: 'Blocked',
            reviewState: 'Workspace-only lane',
            explanation: 'This checkout is configured for local governed evaluation, so cross-border transfer remains blocked unless the package is re-scoped first.',
            tone: 'blocked',
            safeguards: [
                ...commonSafeguards,
                {
                    label: 'Restricted export',
                    detail: 'Raw export is disabled for this clean-room configuration.',
                    state: 'blocked'
                },
                {
                    label: 'Watermarking',
                    detail: 'Standing by until a transferable package is formally reviewed.',
                    state: 'review'
                }
            ]
        }
    }

    if (accessMode === 'aggregated_export' && geography === 'single_region') {
        return {
            destination: 'Approved in-market aggregate output lane',
            transferStatus: 'Allowed',
            reviewState: 'Condition set',
            explanation: 'This package can move through the approved lane because the destination stays inside the licensed region and only reviewed aggregate outputs are eligible.',
            tone: 'active',
            safeguards: [
                ...commonSafeguards,
                {
                    label: 'Restricted export',
                    detail: 'Only reviewed aggregate outputs can leave the workspace.',
                    state: 'active'
                },
                {
                    label: 'Watermarking',
                    detail: 'Applied if the reviewed output is converted into a delivered package.',
                    state: 'review'
                }
            ]
        }
    }

    if (accessMode === 'clean_room') {
        return {
            destination:
                geography === 'dual_region'
                    ? 'Reviewed secondary regional workspace'
                    : 'Reviewed cross-region governed workspace',
            transferStatus: 'Conditional approval',
            reviewState: 'Review required',
            explanation: 'Processing remains governed, but opening a second regional workspace requires transfer review before that destination activates.',
            tone: 'pending',
            safeguards: [
                ...commonSafeguards,
                {
                    label: 'Restricted export',
                    detail: 'External release is still blocked; only reviewed workspace routing can expand.',
                    state: 'review'
                },
                {
                    label: 'Watermarking',
                    detail: 'Prepared if the transaction later shifts into a released package path.',
                    state: 'review'
                }
            ]
        }
    }

    if (accessMode === 'aggregated_export') {
        return {
            destination:
                geography === 'dual_region'
                    ? 'Reviewed aggregate lane to an approved secondary region'
                    : 'Reviewed aggregate lane to an approved cross-region endpoint',
            transferStatus: 'Conditional approval',
            reviewState: 'Review required',
            explanation: 'Aggregate transfer can proceed only after destination and safeguard checks clear for the selected operating scope.',
            tone: geography === 'global' ? 'pending' : 'pending',
            safeguards: [
                ...commonSafeguards,
                {
                    label: 'Restricted export',
                    detail: 'Transfer is limited to approved aggregate outputs after review.',
                    state: 'review'
                },
                {
                    label: 'Watermarking',
                    detail: 'Applied when reviewed outputs are packaged for delivery.',
                    state: 'review'
                }
            ]
        }
    }

    return {
        destination:
            geography === 'single_region'
                ? 'Named recipient vault in the licensed region'
                : geography === 'dual_region'
                    ? 'Named recipient vault after regional review'
                    : 'Named recipient vault after cross-border review',
        transferStatus: geography === 'single_region' ? 'Conditional approval' : 'Review required',
        reviewState: 'Review required',
        explanation:
            geography === 'single_region'
                ? 'The release path is available, but the recipient, package scope, and safeguards still need transfer review before delivery.'
                : 'This package can move only after transfer review confirms the destination, recipient controls, and release safeguards.',
        tone: geography === 'single_region' ? 'pending' : 'pending',
        safeguards: [
            ...commonSafeguards,
            {
                label: 'Restricted export',
                detail: 'Release remains limited to the named encrypted package.',
                state: 'review'
            },
            {
                label: 'Watermarking',
                detail: 'Applied to the delivered package before transfer clearance.',
                state: 'active'
            }
        ]
    }
}

const getTransferSafeguardStateClasses = (state: TransferSafeguardState) => {
    if (state === 'active') return 'border-teal-500/30 bg-teal-500/10 text-teal-100'
    if (state === 'review') return 'border-amber-500/30 bg-amber-500/10 text-amber-100'
    return 'border-rose-500/30 bg-rose-500/10 text-rose-100'
}

const getTransferSafeguardStateLabel = (state: TransferSafeguardState) => {
    if (state === 'active') return 'Active'
    if (state === 'review') return 'Review'
    return 'Blocked'
}

const buildTransactionTimelineSteps = ({
    checkoutRecordPresent,
    workspaceReady,
    credentialsIssued,
    lifecycleState,
    validationStatus,
    creditIssued
}: {
    checkoutRecordPresent: boolean
    workspaceReady: boolean
    credentialsIssued: boolean
    lifecycleState: EscrowCheckoutRecord['lifecycleState'] | null
    validationStatus: EscrowCheckoutRecord['outcomeProtection']['validation']['status']
    creditIssued: boolean
}): TransactionTimelineStep[] => {
    const releasePending = lifecycleState === 'RELEASE_PENDING'
    const released = lifecycleState === 'RELEASED_TO_PROVIDER'
    const disputeOpen = lifecycleState === 'DISPUTE_OPEN'
    const refundTriggered = creditIssued || disputeOpen

    return [
        {
            label: 'Funded',
            detail: checkoutRecordPresent
                ? 'Escrow now holds funds before any live evaluation access can broaden.'
                : 'Checkout is waiting for escrow funding to open the governed path.',
            state: checkoutRecordPresent ? 'complete' : 'current'
        },
        {
            label: 'Workspace active',
            detail: workspaceReady
                ? 'The governed workspace is provisioned and ready for scoped evaluation.'
                : checkoutRecordPresent
                    ? 'Workspace provisioning is the next control point after funding.'
                    : 'Workspace activation starts only after funding clears.',
            state: workspaceReady ? 'complete' : checkoutRecordPresent ? 'current' : 'upcoming'
        },
        {
            label: 'Validation open',
            detail: refundTriggered
                ? 'Validation closed through the protection path because commitments did not clear.'
                : validationStatus === 'confirmed' || releasePending || released
                    ? 'Buyer validation cleared the contracted outcome before release.'
                    : credentialsIssued
                        ? 'Evaluation is active and validation remains open inside the governed workspace.'
                        : 'Validation opens once scoped credentials activate the evaluation workspace.',
            state:
                refundTriggered
                    ? 'issue'
                    : validationStatus === 'confirmed' || releasePending || released
                        ? 'complete'
                        : credentialsIssued
                            ? 'current'
                            : 'upcoming'
        },
        {
            label: 'Release pending',
            detail: refundTriggered
                ? 'Release is bypassed while refund or dispute handling resolves the missed commitment.'
                : released
                    ? 'Buyer validation completed and escrow has already released to the provider.'
                    : releasePending
                        ? 'Validation passed and escrow is queued for provider release.'
                        : 'Provider release stays locked until validation clears.',
            state: released ? 'complete' : releasePending ? 'current' : 'upcoming'
        },
        {
            label: 'Refund / dispute if commitments fail',
            detail: creditIssued
                ? 'A commitment miss triggered the refund-credit path and payout remains frozen.'
                : disputeOpen
                    ? 'A dispute is open, so release remains paused until review closes.'
                    : 'This fallback lane activates only if schema, freshness, or delivery commitments miss.',
            state: refundTriggered ? 'issue' : 'upcoming'
        }
    ]
}

const getTransactionTimelineStateClasses = (state: TransactionTimelineStepState) => {
    if (state === 'complete') return 'border-teal-500/30 bg-teal-500/10 text-teal-100'
    if (state === 'current') return 'border-amber-500/30 bg-amber-500/10 text-amber-100'
    if (state === 'issue') return 'border-rose-500/30 bg-rose-500/10 text-rose-100'
    return 'border-slate-500/30 bg-slate-500/10 text-slate-300'
}

const getTransactionTimelineStateLabel = (state: TransactionTimelineStepState) => {
    if (state === 'complete') return 'Done'
    if (state === 'current') return 'Active'
    if (state === 'issue') return 'Fallback'
    return 'Standby'
}

export default function EscrowCheckoutPage() {
    const { id } = useParams()
    const location = useLocation()
    const isDemo = location.pathname.startsWith('/demo/')
    const routeDataset = getDatasetDetailById(id)
    const dataset = routeDataset ?? Object.values(DATASET_DETAILS)[0]
    const isCanonicalDemoRoute = isDemo && dataset.id === DEMO_ESCROW_CANONICAL_IDS.datasetId
    const usesCanonicalBuyerDemo = isCanonicalDemoRoute
    const buyerRouteTargets = getBuyerRouteTargets(isDemo)
    const datasetsPath = isDemo ? '/demo/datasets' : '/datasets'
    const datasetDetailPath = isDemo ? `/demo/datasets/${dataset.id}` : `/datasets/${dataset.id}`
    const rightsQuotePath = isDemo ? `/demo/datasets/${dataset.id}/rights-quote` : `/datasets/${dataset.id}/rights-quote`
    const qualityPreviewPath = isDemo
        ? `/demo/datasets/${dataset.id}/quality-breakdown`
        : `/datasets/${dataset.id}/quality-breakdown`
    const dealRoute = getDealRouteRecordByDatasetId(dataset.id)
    const outputReviewPath = usesCanonicalBuyerDemo
        ? buyerRouteTargets.outputReview
        : dealRoute
            ? isDemo
                ? `/demo/deals/${dealRoute.dealId}/output-review`
                : `/deals/${dealRoute.dealId}/output-review`
            : null
    const passport = useMemo(() => buildCompliancePassport(), [])
    const passportStatus = passportStatusMeta(passport.status)
    const [recordVersion, setRecordVersion] = useState(0)
    const [nowMs, setNowMs] = useState(() => Date.now())
    const savedQuotes = useMemo(() => {
        const quotes = loadRightsQuotes(dataset.id)
        return usesCanonicalBuyerDemo ? quotes : filterOutCanonicalDemoQuotes(quotes)
    }, [dataset.id, recordVersion, usesCanonicalBuyerDemo])
    const fallbackQuote = useMemo(
        () => buildRightsQuote(dataset, getDefaultRightsQuoteForm(passport), passport),
        [dataset, passport]
    )
    const availableQuotes = savedQuotes.length > 0 ? savedQuotes : [fallbackQuote]
    const requestedQuoteId = (location.state as EscrowCheckoutLocationState)?.quoteId
    const [selectedQuoteId, setSelectedQuoteId] = useState<string>(
        () =>
            availableQuotes.find(quote => quote.id === requestedQuoteId)?.id ??
            availableQuotes[0]?.id ??
            fallbackQuote.id
    )
    const selectedQuote =
        availableQuotes.find(quote => quote.id === selectedQuoteId) ??
        availableQuotes[0] ??
        fallbackQuote
    const persistedCheckout = useMemo(
        () => {
            const record = loadEscrowCheckoutByQuoteId(selectedQuote.id)
            if (!usesCanonicalBuyerDemo && record && isCanonicalDemoEscrowRecord(record)) {
                return null
            }

            return record
        },
        [selectedQuote.id, recordVersion, usesCanonicalBuyerDemo]
    )
    const [checkoutRecord, setCheckoutRecord] = useState<EscrowCheckoutRecord | null>(persistedCheckout)
    const [config, setConfig] = useState<EscrowCheckoutConfig>(() =>
        persistedCheckout ? persistedCheckout.configuration : getRecommendedCheckoutConfig(selectedQuote)
    )
    const [duaAccepted, setDuaAccepted] = useState(Boolean(persistedCheckout?.dua.accepted))
    const [notice, setNotice] = useState<string | null>(
        savedQuotes.length === 0 ? 'No saved terms were found for this dataset, so evaluation is using a terms package generated from your passport defaults.' : null
    )

    const applyDemoScenario = (scenario: DemoEscrowScenario) => {
        setSelectedQuoteId(scenario.quote.id)
        setCheckoutRecord(scenario.checkoutRecord)
        setConfig(scenario.checkoutRecord?.configuration ?? getRecommendedCheckoutConfig(scenario.quote))
        setDuaAccepted(Boolean(scenario.checkoutRecord?.dua.accepted))
        setRecordVersion(current => current + 1)
        setNotice(
            scenario.checkoutRecord
                ? `${scenario.stageLabel} loaded for ${scenario.checkoutRecord.escrowId}.`
                : `${scenario.stageLabel} loaded. Rights terms are ready, but no escrow checkout is active yet.`
        )
    }

    const handleDemoControlsChange = (scenario: DemoEscrowScenario | null) => {
        if (scenario) {
            applyDemoScenario(scenario)
            return
        }

        setSelectedQuoteId(requestedQuoteId ?? fallbackQuote.id)
        setCheckoutRecord(null)
        setConfig(getRecommendedCheckoutConfig(fallbackQuote))
        setDuaAccepted(false)
        setRecordVersion(current => current + 1)
        setNotice('Buyer demo cleared. Returning to the standard checkout surface.')
    }

    useEffect(() => {
        if (!usesCanonicalBuyerDemo) return
        saveCanonicalDemoEscrowState()
        applyDemoScenario(getCanonicalDemoEscrowScenario())
    }, [usesCanonicalBuyerDemo])

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            setNowMs(Date.now())
        }, 60000)

        return () => window.clearInterval(intervalId)
    }, [])

    useEffect(() => {
        if (!availableQuotes.some(quote => quote.id === selectedQuoteId)) {
            setSelectedQuoteId(availableQuotes[0]?.id ?? fallbackQuote.id)
        }
    }, [availableQuotes, fallbackQuote.id, selectedQuoteId])

    useEffect(() => {
        setCheckoutRecord(persistedCheckout)
        if (persistedCheckout) {
            setConfig(persistedCheckout.configuration)
            setDuaAccepted(Boolean(persistedCheckout.dua.accepted))
            if (!checkoutRecord || checkoutRecord.id !== persistedCheckout.id) {
                setNotice(`Escrow evaluation ${persistedCheckout.escrowId} is already in progress for these terms.`)
            }
            return
        }

        setConfig(getRecommendedCheckoutConfig(selectedQuote))
        setDuaAccepted(false)
        setNotice(
            savedQuotes.length === 0
                ? 'No saved terms were found for this dataset, so evaluation is using a terms package generated from your passport defaults.'
                : null
        )
    }, [checkoutRecord, persistedCheckout, savedQuotes.length, selectedQuote])

    const duaPreview = useMemo(
        () => buildEscrowDueUseAgreement(dataset, selectedQuote, passport, config),
        [config, dataset, passport, selectedQuote]
    )
    const plannedScopes = useMemo(
        () => getPlannedCredentialScopes(selectedQuote, config.accessMode),
        [config.accessMode, selectedQuote]
    )
    const dealProgress = useMemo(
        () =>
            buildDealProgressModel({
                passport,
                quote: selectedQuote,
                checkoutRecord
            }),
        [checkoutRecord, passport, selectedQuote]
    )
    const configurationLocked = checkoutRecord !== null
    const acceptedForFunding = checkoutRecord ? checkoutRecord.dua.accepted : duaAccepted
    const fundEscrowDisabled = usesCanonicalBuyerDemo
        ? checkoutRecord !== null
        : checkoutRecord !== null || !acceptedForFunding
    const workspaceReady = checkoutRecord?.workspace.status === 'ready'
    const credentialsIssued = checkoutRecord?.credentials.status === 'issued'
    const buyerJurisdiction = passport.organization.country || 'Pending buyer jurisdiction'
    const accessRegion = accessRegionLabelMap[selectedQuote.input.geography]
    const providerJurisdiction = providerJurisdictionLabelMap[selectedQuote.input.geography]
    const transferPosture = getTransferPostureLabel(config.accessMode)
    const jurisdictionStatuses = useMemo(
        () => buildJurisdictionStatuses(config.accessMode, selectedQuote.input.geography),
        [config.accessMode, selectedQuote.input.geography]
    )
    const transferReviewModule = useMemo(
        () => buildTransferReviewModule(config.accessMode, selectedQuote.input.geography),
        [config.accessMode, selectedQuote.input.geography]
    )
    const outcomeStage = checkoutRecord?.outcomeProtection.stage ?? 'evaluation_pending'
    const outcomeStatus = outcomeStageMeta[outcomeStage]
    const evaluationFeeUsd = checkoutRecord?.outcomeProtection.evaluationFeeUsd ?? getOutcomeEvaluationFee(selectedQuote)
    const outcomeValidation = checkoutRecord?.outcomeProtection.validation ?? {
        status: 'pending' as const,
        issueTypes: [] as EscrowCheckoutRecord['outcomeProtection']['validation']['issueTypes'],
        note: undefined,
        updatedAt: undefined
    }
    const outcomeEngine: EscrowCheckoutRecord['outcomeProtection']['engine'] = checkoutRecord?.outcomeProtection.engine ?? {
        status: 'not_started',
        summary: 'Outcome engine will run automatically once scoped credentials activate the evaluation workspace.',
        findings: []
    }
    const outcomeCredits = checkoutRecord?.outcomeProtection.credits ?? {
        status: 'none',
        amountUsd: 0,
        reason: undefined,
        issuedAt: undefined
    }
    const transactionTimelineSteps = useMemo(
        () =>
            buildTransactionTimelineSteps({
                checkoutRecordPresent: checkoutRecord !== null,
                workspaceReady,
                credentialsIssued,
                lifecycleState: checkoutRecord?.lifecycleState ?? null,
                validationStatus: outcomeValidation.status,
                creditIssued: outcomeCredits.status === 'issued'
            }),
        [checkoutRecord, credentialsIssued, outcomeCredits.status, outcomeValidation.status, workspaceReady]
    )
    const transactionSafetyItems = useMemo(
        () => [
            {
                label: 'Governed evaluation first',
                detail: 'Live review begins in the governed workspace before payout or broad delivery can move.'
            },
            {
                label: 'No broad exposure before release',
                detail:
                    config.accessMode === 'clean_room'
                        ? 'Raw exposure stays blocked while evaluation remains workspace-only.'
                        : config.accessMode === 'aggregated_export'
                            ? 'Only reviewed aggregate outputs can move before any release decision.'
                            : 'Delivered packages stay encrypted, scoped, and unreleased until review clears.'
            },
            {
                label: 'Auditability',
                detail: 'Credentials, workspace activity, and release decisions remain logged throughout the transaction.'
            },
            {
                label: 'Conditional release',
                detail:
                    outcomeCredits.status === 'issued'
                        ? 'A commitment miss already froze release and shifted the transaction into the refund-credit lane.'
                        : 'Provider payout remains conditional on buyer validation and the configured release path.'
            }
        ],
        [config.accessMode, outcomeCredits.status]
    )
    const outputReviewContext = useMemo(
        () => (dealRoute ? getDealRouteContextById(dealRoute.dealId) : null),
        [recordVersion, dealRoute?.dealId, selectedQuote.id]
    )
    const outputReviewModel = useMemo(
        () => (outputReviewContext ? buildOutputReviewModel(outputReviewContext) : null),
        [outputReviewContext]
    )
    const checkoutOutputArtifacts = useMemo(() => {
        if (!outputReviewModel) return []

        const exportReviewNote = outputReviewModel.artifactPreviews.find(
            artifact => artifact.artifactLabel === 'Export review note'
        )
        const disputePreview = outputReviewModel.artifactPreviews.find(
            artifact => artifact.artifactLabel === 'Freeze summary'
        )
        const extensionPreview = outputReviewModel.artifactPreviews.find(
            artifact => artifact.artifactLabel === 'Extension request note'
        )
        const revocationPreview = outputReviewModel.artifactPreviews.find(
            artifact => artifact.artifactLabel === 'Revocation summary'
        )

        return [
            exportReviewNote,
            outputReviewModel.currentState === 'dispute_frozen'
                ? disputePreview
                : outputReviewModel.currentState === 'revoked_session'
                    ? revocationPreview
                    : extensionPreview
        ].filter((artifact): artifact is NonNullable<typeof artifact> => Boolean(artifact))
    }, [outputReviewModel])
    const tokenViewModel = useMemo(
        () =>
            checkoutRecord
                ? buildBuyerTokenViewModel(checkoutRecord, outputReviewContext, nowMs)
                : null,
        [checkoutRecord, nowMs, outputReviewContext]
    )
    const buyerValidationReady = Boolean(
        checkoutRecord &&
        credentialsIssued &&
        outcomeValidation.status === 'pending' &&
        (outcomeEngine.status === 'passed' || usesCanonicalBuyerDemo)
    )
    const releaseReady = checkoutRecord?.lifecycleState === 'RELEASE_PENDING'
    const checkoutReleased = checkoutRecord?.lifecycleState === 'RELEASED_TO_PROVIDER'
    const secureWorkspacePath = usesCanonicalBuyerDemo
        ? buyerRouteTargets.secureWorkspace
        : checkoutRecord?.workspace.launchPath ?? getPlannedWorkspaceLaunchPath(config.accessMode)
    const showOutputReviewLink = Boolean(outputReviewPath && tokenViewModel)
    const showOutputReviewStatus = Boolean(tokenViewModel && outputReviewModel)
    const inlineScopeChips = tokenViewModel?.permissions.scopeChips ?? plannedScopes.map(formatCheckoutScopeLabel)
    const checkoutFlowCards: CheckoutFlowCard[] = [
        {
            label: 'Rights summary',
            value: selectedQuote.id,
            detail:
                savedQuotes.length > 0
                    ? 'Terms are already attached to checkout and can be refined as an advanced step.'
                    : 'Starter terms were generated from the current passport and are already loaded into checkout.',
            tone: 'pending'
        },
        {
            label: 'Escrow funding',
            value: checkoutRecord ? 'Funds held' : acceptedForFunding ? 'Ready to fund' : 'DUA required',
            detail: checkoutRecord
                ? `${checkoutRecord.escrowId} is holding funds while governed evaluation remains active.`
                : acceptedForFunding
                    ? 'Fund escrow to open workspace provisioning and token issuance.'
                    : 'Accept the DUA before escrow funding can begin.',
            tone: checkoutRecord ? 'active' : acceptedForFunding ? 'pending' : 'pending'
        },
        {
            label: 'Workspace',
            value: workspaceReady ? 'Ready' : checkoutRecord ? 'Provisioning next' : 'Planned',
            detail: workspaceReady
                ? `${checkoutRecord?.workspace.workspaceName ?? getPlannedWorkspaceName(dataset, config.accessMode)} is ready for governed evaluation.`
                : checkoutRecord
                    ? 'Provision the secure workspace before any Ephemeral Token can activate.'
                    : 'The workspace is planned and will provision after funding clears.',
            tone: workspaceReady ? 'active' : checkoutRecord ? 'pending' : 'standby'
        },
        {
            label: 'Ephemeral Token',
            value: tokenViewModel?.status ?? 'Pending issue',
            detail: tokenViewModel
                ? `${tokenViewModel.safeTokenReference} · ${tokenViewModel.statusDetail}`
                : 'A temporary, scoped token appears only after escrow funding, workspace provisioning, and policy checks clear.',
            tone: tokenViewModel
                ? tokenViewModel.status === 'Active'
                    ? 'active'
                    : tokenViewModel.status === 'Provisioning'
                        ? 'pending'
                        : tokenViewModel.status === 'Frozen'
                            ? 'pending'
                            : 'blocked'
                : 'standby'
        },
        {
            label: 'Buyer validation',
            value:
                outcomeValidation.status === 'confirmed'
                    ? 'Complete'
                    : outcomeValidation.status === 'issue_reported'
                        ? 'Issue reported'
                        : credentialsIssued
                            ? 'Open in checkout'
                            : 'Locked',
            detail:
                outcomeValidation.status === 'confirmed'
                    ? 'The evaluating organization validated the contracted outcome.'
                    : outcomeValidation.status === 'issue_reported'
                        ? 'Validation is blocked while a protection issue remains open.'
                        : credentialsIssued
                            ? 'Buyer validation is controlled here after the evaluation run completes.'
                            : 'Validation unlocks only after the Ephemeral Token activates governed access.',
            tone:
                outcomeValidation.status === 'confirmed'
                    ? 'active'
                    : outcomeValidation.status === 'issue_reported'
                        ? 'blocked'
                        : credentialsIssued
                            ? 'pending'
                            : 'standby'
        },
        {
            label: 'Release readiness',
            value:
                checkoutReleased
                    ? 'Released'
                    : releaseReady
                        ? 'Ready to release'
                        : outcomeCredits.status === 'issued'
                            ? 'Blocked'
                            : 'Awaiting validation',
            detail:
                checkoutReleased
                    ? 'Escrow released to the provider and buyer access is now closing.'
                    : releaseReady
                        ? 'Buyer validation passed and payout can now be released.'
                        : outcomeCredits.status === 'issued'
                            ? 'Release is frozen because the outcome engine issued protection credits.'
                            : 'Release remains locked until buyer validation closes the evaluation window.',
            tone:
                checkoutReleased
                    ? 'active'
                    : releaseReady
                        ? 'pending'
                        : outcomeCredits.status === 'issued'
                            ? 'blocked'
                            : 'standby'
        }
    ]
    const rightsSummaryPreview = selectedQuote.rightsSummary.slice(0, 4)
    const quoteBreakdownPreview = selectedQuote.breakdown.slice(0, 3)
    const governanceDisclosureOpen =
        outcomeCredits.status === 'issued' ||
        outcomeEngine.status === 'failed' ||
        outcomeValidation.status === 'issue_reported'
    const accessStatusTitle = tokenViewModel
        ? tokenViewModel.status === 'Active'
            ? 'Access is now live'
            : tokenViewModel.status === 'Frozen'
                ? 'Access is frozen'
                : tokenViewModel.status === 'Revoked'
                    ? 'Access is closed'
                    : tokenViewModel.status === 'Expired'
                        ? 'Access has expired'
                        : 'Access is provisioning'
        : 'Access remains staged'
    const nextRecommendedAction = !checkoutRecord
        ? acceptedForFunding
            ? 'Fund escrow to open the governed evaluation transaction.'
            : 'Accept the DUA and confirm the inline rights package before funding.'
        : !workspaceReady
            ? 'Provision the secure workspace so Redoubt can prepare the governed evaluation boundary.'
            : !credentialsIssued
                ? 'Issue the short-lived Ephemeral Token to activate buyer evaluation access.'
                : outcomeValidation.status === 'pending'
                    ? outcomeEngine.status === 'failed'
                        ? 'Output release is blocked while the protection issue is reviewed.'
                        : 'Complete buyer validation here before escrow can move to release.'
                    : checkoutRecord.lifecycleState === 'RELEASE_PENDING'
                        ? 'Release escrow once validation is complete.'
                        : checkoutReleased
                            ? 'Access is closed. Use secondary pages for audit and review context only.'
                            : 'Continue inside the secure workspace or review outputs as secondary views.'

    useEffect(() => {
        if (usesCanonicalBuyerDemo) return
        if (!checkoutRecord || checkoutRecord.credentials.status !== 'issued') return
        if (checkoutRecord.outcomeProtection.engine.status !== 'not_started') return

        const nextRecord = runOutcomeProtectionEngine(checkoutRecord, dataset, selectedQuote)
        saveRecord(
            nextRecord,
            nextRecord.outcomeProtection.engine.status === 'failed'
                ? `${nextRecord.outcomeProtection.engine.summary} ${formatUsd(nextRecord.outcomeProtection.credits.amountUsd)} automatic credit applied and provider payout remains frozen.`
                : `${nextRecord.outcomeProtection.engine.summary} Buyer confirmation is now required before escrow release.`
        )
    }, [checkoutRecord, dataset, selectedQuote, usesCanonicalBuyerDemo])

    const updateConfig = <T extends keyof EscrowCheckoutConfig>(field: T, value: EscrowCheckoutConfig[T]) => {
        if (configurationLocked) return
        setConfig(current => ({ ...current, [field]: value }))
        if (field !== 'paymentMethod') {
            setDuaAccepted(false)
        }
        setNotice(null)
    }

    const saveRecord = (nextRecord: EscrowCheckoutRecord, nextNotice: string) => {
        saveEscrowCheckout(nextRecord)
        setCheckoutRecord(nextRecord)
        setRecordVersion(current => current + 1)
        setNotice(nextNotice)
    }

    if (!routeDataset) {
        return (
            <DatasetUnavailableState
                contextLabel="Escrow Evaluation"
                detail="This escrow-setup route does not point to a known dataset. Return to Dataset Discovery and reopen the dataset before continuing into evaluation setup."
            />
        )
    }

    const handleFundEscrow = () => {
        if (usesCanonicalBuyerDemo) {
            applyDemoScenario(setDemoStage('escrow_funded'))
            return
        }
        if (!duaAccepted) return
        const nextRecord = buildEscrowCheckoutRecord(dataset, selectedQuote, passport, config)
        saveRecord(
            nextRecord,
            `${nextRecord.escrowId} funded via ${describeCheckoutPaymentMethod(config.paymentMethod)}. DUA ${nextRecord.dua.version} has been accepted and escrow is now holding ${formatUsd(nextRecord.funding.escrowHoldUsd)}.`
        )
    }

    const handleProvisionWorkspace = () => {
        if (!checkoutRecord || workspaceReady) return
        if (usesCanonicalBuyerDemo) {
            applyDemoScenario(setDemoStage('workspace_ready'))
            return
        }
        const nextRecord = provisionEscrowWorkspace(checkoutRecord)
        saveRecord(
            nextRecord,
            `${nextRecord.workspace.workspaceName} is provisioned and ready for governed access.`
        )
    }

    const handleIssueCredentials = () => {
        if (!checkoutRecord || !workspaceReady || credentialsIssued) return
        if (usesCanonicalBuyerDemo) {
            applyDemoScenario(setDemoStage('token_issued'))
            return
        }
        const nextRecord = issueEscrowScopedCredentials(checkoutRecord)
        saveRecord(
            nextRecord,
            `Scoped credentials ${nextRecord.credentials.credentialId} were issued with ${nextRecord.credentials.tokenTtlMinutes}-minute TTL enforcement.`
        )
    }

    const handleConfirmOutcome = () => {
        if (!checkoutRecord || !credentialsIssued) return
        if (usesCanonicalBuyerDemo) {
            applyDemoScenario(setDemoStage('release_pending'))
            return
        }
        const nextRecord = confirmOutcomeValidation(
            checkoutRecord,
            'Buyer confirmed that schema and freshness commitments match the contracted deal.'
        )
        saveRecord(
            nextRecord,
            'Buyer validation is complete. Escrow has moved to release-pending status.'
        )
    }

    const handleReleaseEscrow = () => {
        if (!checkoutRecord || checkoutRecord.lifecycleState !== 'RELEASE_PENDING') return
        if (usesCanonicalBuyerDemo) {
            applyDemoScenario(setDemoStage('released'))
            return
        }
        const nextRecord = releaseEscrowToProvider(checkoutRecord)
        saveRecord(
            nextRecord,
            'Buyer validation passed and escrow has been released to the provider.'
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.12),transparent_30%),radial-gradient(circle_at_85%_10%,rgba(59,130,246,0.1),transparent_30%),linear-gradient(180deg,rgba(2,6,23,0.92),rgba(2,6,23,1))]" />
            <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-10 lg:pb-16">
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
                    <Link to={datasetsPath} className="transition-colors hover:text-white">Datasets</Link>
                    <span>/</span>
                    <Link to={datasetDetailPath} className="transition-colors hover:text-white">{dataset.title}</Link>
                    <span>/</span>
                    <span className="text-slate-200">Escrow Checkout</span>
                </div>

                <section className={`${checkoutSectionClass} mt-5 overflow-hidden`}>
                    <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
                        <div className="max-w-4xl">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                                Buyer workflow · Protected evaluation
                            </div>
                            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                                Escrow Checkout
                            </h1>
                            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
                                Checkout keeps rights terms, escrow funding, workspace provisioning, scoped Ephemeral Token
                                issuance, buyer validation, and release readiness on one governed enterprise surface.
                            </p>
                        </div>

                        <div className="grid w-full max-w-md gap-4">
                            <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold ${passportStatus.classes}`}>
                                <span className="h-2.5 w-2.5 rounded-full bg-current" />
                                Passport {passport.passportId} · {passportStatus.label}
                            </div>
                            <div className="rounded-2xl border border-teal-500/30 bg-teal-500/10 p-4 text-sm text-teal-100">
                                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-100/80">
                                    Next recommended action
                                </div>
                                <div className="mt-3 text-base font-semibold text-white">{nextRecommendedAction}</div>
                            </div>
                        </div>
                    </div>
                </section>

                {isCanonicalDemoRoute && (
                    <div className="mt-6">
                        <DemoEscrowControls mode="demo-route" onScenarioChange={handleDemoControlsChange} />
                    </div>
                )}

                {notice && (
                    <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
                        {notice}
                    </div>
                )}

                <section className="mt-6">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                Guided buyer flow
                            </div>
                            <h2 className="mt-2 text-2xl font-semibold text-white">
                                One checkout surface from rights summary through release
                            </h2>
                            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-400">
                                Buyer access stays temporary, scoped, policy-bound, and audit-logged. The page below
                                keeps the commercial path and the release controls aligned on the same governed timeline.
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {checkoutFlowCards.map(card => (
                            <CheckoutFlowStatusCard
                                key={card.label}
                                label={card.label}
                                value={card.value}
                                detail={card.detail}
                                tone={card.tone}
                            />
                        ))}
                    </div>
                </section>

                <div className="mt-6">
                    <DealProgressTracker model={dealProgress} compact variant="terminal" />
                </div>

                <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.92fr)]">
                    <div className="space-y-6">
                        <section className={checkoutSectionClass}>
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div>
                                    <div className={checkoutMutedLabelClass}>Rights package</div>
                                    <h2 className="mt-2 text-2xl font-semibold text-white">Dataset & rights summary</h2>
                                    <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-400">
                                        Checkout is anchored to one active rights package. Commercial terms can still be
                                        refined in Advanced Terms until escrow is funded.
                                    </p>
                                </div>
                                <Link
                                    to={rightsQuotePath}
                                    className="inline-flex items-center justify-center rounded-xl border border-teal-500/35 bg-teal-500/10 px-4 py-2.5 text-sm font-semibold text-teal-100 transition-colors hover:bg-teal-500/20"
                                >
                                    Open Advanced Terms
                                </Link>
                            </div>

                            <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
                                <div className={checkoutInsetClass}>
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <div className={checkoutMutedLabelClass}>Active rights package</div>
                                            <div className="mt-2 text-xl font-semibold text-white">{selectedQuote.id}</div>
                                            <div className="mt-2 text-sm text-slate-300">
                                                {selectedQuote.datasetTitle} · {checkoutAccessModeMeta[config.accessMode].label}
                                            </div>
                                        </div>
                                        <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                                            {selectedQuote.riskBand === 'controlled'
                                                ? 'Controlled review'
                                                : selectedQuote.riskBand === 'heightened'
                                                    ? 'Heightened review'
                                                    : 'Strict review'}
                                        </span>
                                    </div>

                                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                                        {rightsSummaryPreview.map(item => (
                                            <div key={item} className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-slate-200">
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                                    <SummaryStat label="Commercial total" value={formatUsd(selectedQuote.totalUsd)} />
                                    <SummaryStat label="Escrow hold" value={formatUsd(selectedQuote.escrowHoldUsd)} />
                                    <SummaryStat label="Validation window" value={`${config.reviewWindowHours} hours`} />
                                    <SummaryStat label="Buyer note" value={selectedQuote.checkoutNotes[0]} />
                                </div>
                            </div>
                        </section>

                        <section className={checkoutSectionClass}>
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div>
                                    <div className={checkoutMutedLabelClass}>Configuration</div>
                                    <h2 className="mt-2 text-2xl font-semibold text-white">Evaluation configuration</h2>
                                    <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-400">
                                        The selected access mode, review window, and funding rail become part of the DUA
                                        once the escrow transaction is funded.
                                    </p>
                                </div>
                                {configurationLocked && (
                                    <span className="inline-flex rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-200">
                                        Locked after funding
                                    </span>
                                )}
                            </div>

                            <div className="mt-5">
                                <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Access mode</div>
                                <div className="grid gap-3 md:grid-cols-3">
                                    {(Object.entries(checkoutAccessModeMeta) as Array<[EscrowCheckoutAccessMode, typeof checkoutAccessModeMeta[EscrowCheckoutAccessMode]]>).map(([value, meta]) => (
                                        <button
                                            key={value}
                                            type="button"
                                            disabled={configurationLocked}
                                            onClick={() => updateConfig('accessMode', value)}
                                            className={`rounded-2xl border p-4 text-left transition-colors ${
                                                config.accessMode === value
                                                    ? 'border-teal-500/50 bg-teal-500/10 text-teal-100'
                                                    : 'border-white/8 bg-slate-950/50 text-slate-300 hover:border-slate-600'
                                            } ${configurationLocked ? 'cursor-not-allowed opacity-50' : ''}`}
                                        >
                                            <div className="text-sm font-semibold">{meta.label}</div>
                                            <div className="mt-2 text-xs leading-6 text-slate-400">{meta.detail}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-6 grid gap-6 xl:grid-cols-2">
                                <div>
                                    <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Review window</div>
                                    <div className="grid gap-3 sm:grid-cols-3">
                                        {reviewWindowOptions.map(hours => (
                                            <button
                                                key={hours}
                                                type="button"
                                                disabled={configurationLocked}
                                                onClick={() => updateConfig('reviewWindowHours', hours as EscrowReviewWindowHours)}
                                                className={`rounded-2xl border px-4 py-4 text-left transition-colors ${
                                                    config.reviewWindowHours === hours
                                                        ? 'border-teal-500/50 bg-teal-500/10 text-teal-100'
                                                        : 'border-white/8 bg-slate-950/50 text-slate-300 hover:border-slate-600'
                                                } ${configurationLocked ? 'cursor-not-allowed opacity-50' : ''}`}
                                            >
                                                <div className="text-sm font-semibold">{hours} hours</div>
                                                <div className="mt-2 text-xs leading-5 text-slate-400">Buyer validation before release.</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Funding rail</div>
                                    <div className="grid gap-3">
                                        {(Object.entries(paymentMethodMeta) as Array<[EscrowPaymentMethod, typeof paymentMethodMeta[EscrowPaymentMethod]]>).map(([value, meta]) => (
                                            <button
                                                key={value}
                                                type="button"
                                                disabled={configurationLocked}
                                                onClick={() => updateConfig('paymentMethod', value)}
                                                className={`rounded-2xl border p-4 text-left transition-colors ${
                                                    config.paymentMethod === value
                                                        ? 'border-amber-500/50 bg-amber-500/10 text-amber-100'
                                                        : 'border-white/8 bg-slate-950/50 text-slate-300 hover:border-slate-600'
                                                } ${configurationLocked ? 'cursor-not-allowed opacity-50' : ''}`}
                                            >
                                                <div className="text-sm font-semibold">{meta.label}</div>
                                                <div className="mt-2 text-xs leading-6 text-slate-400">{meta.detail}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className={checkoutSectionClass}>
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div>
                                    <div className={checkoutMutedLabelClass}>Agreement</div>
                                    <h2 className="mt-2 text-2xl font-semibold text-white">Generated DUA</h2>
                                    <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-400">
                                        The agreement is assembled from the selected terms, passport, review window, and
                                        delivery configuration. Accepting it unlocks escrow funding.
                                    </p>
                                </div>
                                <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                                    {checkoutRecord?.dua.version ?? duaPreview.version}
                                </span>
                            </div>

                            <div className="mt-5 rounded-2xl border border-teal-500/25 bg-teal-500/10 p-4">
                                <div className="text-sm font-semibold text-white">{checkoutRecord?.dua.summary ?? duaPreview.summary}</div>
                                <div className="mt-2 text-xs text-slate-300">
                                    Checksum {(checkoutRecord?.dua.checksum ?? duaPreview.checksum)} · Generated{' '}
                                    {new Date(checkoutRecord?.dua.generatedAt ?? duaPreview.generatedAt).toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit'
                                    })}
                                </div>
                            </div>

                            <div className="mt-5 grid gap-3">
                                {(checkoutRecord?.dua.clauses ?? duaPreview.clauses).map(clause => (
                                    <div key={clause} className="rounded-xl border border-white/8 bg-slate-950/55 px-4 py-3 text-sm leading-6 text-slate-200">
                                        {clause}
                                    </div>
                                ))}
                            </div>

                            <label className={`mt-5 flex items-start gap-3 rounded-2xl border px-4 py-4 text-sm ${
                                duaAccepted || checkoutRecord?.dua.accepted
                                    ? 'border-teal-500/30 bg-teal-500/10 text-teal-100'
                                    : 'border-white/8 bg-slate-950/55 text-slate-200'
                            }`}>
                                <input
                                    type="checkbox"
                                    className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900 text-teal-500 focus:ring-teal-500"
                                    disabled={configurationLocked}
                                    checked={checkoutRecord?.dua.accepted ?? duaAccepted}
                                    onChange={event => setDuaAccepted(event.target.checked)}
                                />
                                <span className="leading-6">
                                    I accept this DUA, including the escrow release conditions, non-redistribution obligations,
                                    and scoped credential controls.
                                </span>
                            </label>
                        </section>

                        <section className={checkoutSectionClass}>
                            <div>
                                <div className={checkoutMutedLabelClass}>Access activation</div>
                                <h2 className="mt-2 text-2xl font-semibold text-white">Workspace & Ephemeral Token</h2>
                                <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-400">
                                    Funding escrow prepares the governed workspace. Issuing the Ephemeral Token activates
                                    short-lived, policy-bound buyer evaluation access.
                                </p>
                            </div>

                            <div className="mt-5 grid gap-4 xl:grid-cols-2">
                                <div className={checkoutInsetClass}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <div className={checkoutMutedLabelClass}>Workspace</div>
                                            <div className="mt-2 text-lg font-semibold text-white">
                                                {checkoutRecord?.workspace.workspaceName ?? getPlannedWorkspaceName(dataset, config.accessMode)}
                                            </div>
                                        </div>
                                        <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                                            workspaceReady
                                                ? 'border-teal-500/35 bg-teal-500/10 text-teal-200'
                                                : 'border-amber-500/35 bg-amber-500/10 text-amber-200'
                                        }`}>
                                            {workspaceReady ? 'Ready' : checkoutRecord ? 'Provisioning' : 'Planned'}
                                        </span>
                                    </div>

                                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                        <SummaryStat label="Workspace ID" value={checkoutRecord?.workspace.workspaceId ?? 'WS planned'} />
                                        <SummaryStat label="Access mode" value={checkoutAccessModeMeta[config.accessMode].label} />
                                        <SummaryStat label="Launch path" value={secureWorkspacePath} />
                                        <SummaryStat label="Policy state" value={tokenViewModel?.policyState ?? 'Checks pending'} />
                                    </div>

                                    <div className="mt-4 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-slate-300">
                                        {workspaceReady
                                            ? 'The governed workspace is live. Buyer access still remains bounded by policy state and the active Ephemeral Token window.'
                                            : checkoutRecord
                                                ? 'Escrow is funded. Workspace provisioning is the next control point before any token can activate.'
                                                : 'Workspace provisioning begins only after escrow funding clears.'}
                                    </div>
                                </div>

                                <div className={checkoutInsetClass}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <div className={checkoutMutedLabelClass}>Ephemeral Token</div>
                                            <div className="mt-2 text-lg font-semibold text-white">
                                                {tokenViewModel?.safeTokenReference ?? 'Pending issuance'}
                                            </div>
                                        </div>
                                        <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                                            tokenViewModel
                                                ? tokenViewModel.status === 'Active'
                                                    ? 'border-teal-500/35 bg-teal-500/10 text-teal-200'
                                                    : tokenViewModel.status === 'Provisioning'
                                                        ? 'border-amber-500/35 bg-amber-500/10 text-amber-200'
                                                        : tokenViewModel.status === 'Frozen'
                                                            ? 'border-amber-500/35 bg-amber-500/10 text-amber-200'
                                                            : 'border-rose-500/35 bg-rose-500/10 text-rose-200'
                                                : 'border-slate-600 bg-slate-800/80 text-slate-300'
                                        }`}>
                                            {tokenViewModel?.status ?? 'Pending'}
                                        </span>
                                    </div>

                                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                        <SummaryStat label="Time remaining" value={tokenViewModel?.timeRemaining ?? 'Pending issue'} />
                                        <SummaryStat label="Access mode" value={tokenViewModel?.accessModeLabel ?? checkoutAccessModeMeta[config.accessMode].label} />
                                        <SummaryStat label="Policy state" value={tokenViewModel?.policyState ?? 'Checks pending'} />
                                        <SummaryStat
                                            label="Expiry"
                                            value={
                                                tokenViewModel
                                                    ? formatTimestamp(tokenViewModel.record.credentials.expiresAt, 'Pending issue')
                                                    : 'Pending issue'
                                            }
                                        />
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {inlineScopeChips.map(scope => (
                                            <span key={scope} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                                                {scope}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                        <div className="rounded-xl border border-teal-500/20 bg-teal-500/10 px-4 py-3">
                                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-100/80">Allowed</div>
                                            <div className="mt-2 space-y-2 text-sm text-teal-100">
                                                {(tokenViewModel?.permissions.allowed ?? [
                                                    'Dataset read inside governed workspace',
                                                    'Audit write',
                                                    'Policy-enforced evaluation'
                                                ]).slice(0, 4).map(item => (
                                                    <div key={item}>{item}</div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3">
                                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-100/80">Blocked</div>
                                            <div className="mt-2 space-y-2 text-sm text-rose-100">
                                                {(tokenViewModel?.permissions.blocked ?? [
                                                    'Raw export',
                                                    'Unreviewed egress',
                                                    'Access after expiry'
                                                ]).slice(0, 4).map(item => (
                                                    <div key={item}>{item}</div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm leading-6 text-cyan-100">
                                        {tokenViewModel
                                            ? tokenViewModel.terminalState
                                                ? tokenViewModel.terminalState.reason
                                                : tokenViewModel.statusDetail
                                            : 'No raw secret is shown here. The token remains a safe audit reference until issuance conditions clear.'}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className={checkoutSectionClass}>
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div>
                                    <div className={checkoutMutedLabelClass}>Outcome controls</div>
                                    <h2 className="mt-2 text-2xl font-semibold text-white">Outcome protection</h2>
                                    <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-400">
                                        Metadata preview is free, protected evaluation is paid by default, and provider
                                        payout remains gated until the buyer validates the committed outcome.
                                    </p>
                                </div>
                                <span className="inline-flex rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-200">
                                    {outcomeStatus.label}
                                </span>
                            </div>

                            <div className="mt-5 grid gap-4 xl:grid-cols-2">
                                <div className={checkoutInsetClass}>
                                    <div className={checkoutMutedLabelClass}>Free metadata preview</div>
                                    <div className="mt-3 text-lg font-semibold text-white">Included</div>
                                    <p className="mt-2 text-sm leading-6 text-slate-300">
                                        Buyers can inspect confidence, freshness, schema metadata, and AI summaries
                                        before entering paid evaluation.
                                    </p>
                                    <Link
                                        to={qualityPreviewPath}
                                        className="mt-4 inline-flex rounded-xl border border-cyan-500/35 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-100 transition-colors hover:bg-cyan-500/20"
                                    >
                                        Open Metadata Preview
                                    </Link>
                                </div>

                                <div className={checkoutInsetClass}>
                                    <div className={checkoutMutedLabelClass}>Protected evaluation fee</div>
                                    <div className="mt-3 text-lg font-semibold text-white">{formatUsd(evaluationFeeUsd)}</div>
                                    <p className="mt-2 text-sm leading-6 text-slate-300">
                                        Evaluation happens inside the governed workspace before escrow release, even when
                                        later delivery shifts into production access.
                                    </p>
                                    <div className="mt-3 text-xs leading-6 text-slate-400">{outcomeStatus.detail}</div>
                                </div>
                            </div>

                            <div className="mt-5 rounded-2xl border border-white/8 bg-slate-950/55 p-4">
                                <div className={checkoutMutedLabelClass}>Committed outcome</div>
                                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                    <SummaryStat
                                        label="Schema version"
                                        value={checkoutRecord?.outcomeProtection.commitments.schemaVersion ?? duaPreview.checksum}
                                    />
                                    <SummaryStat
                                        label="Expected fields"
                                        value={String(checkoutRecord?.outcomeProtection.commitments.expectedFieldCount ?? dataset.preview.sampleSchema.length)}
                                    />
                                    <SummaryStat
                                        label="Freshness commitment"
                                        value={checkoutRecord?.outcomeProtection.commitments.freshnessCommitment ?? dataset.preview.freshnessLabel}
                                    />
                                    <SummaryStat
                                        label="Freshness floor"
                                        value={`${checkoutRecord?.outcomeProtection.commitments.confidenceFloor ?? Math.max(75, dataset.quality.freshnessScore - 3)}%`}
                                    />
                                </div>
                            </div>

                            <div className="mt-5 grid gap-4 xl:grid-cols-2">
                                <div className={checkoutInsetClass}>
                                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                        <div>
                                            <div className="text-sm font-semibold text-white">Protection engine</div>
                                            <div className="mt-1 text-xs leading-6 text-slate-400">
                                                Schema count and freshness commitments are checked automatically once the governed workspace is live.
                                            </div>
                                        </div>
                                        <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                                            outcomeEngine.status === 'passed'
                                                ? 'border-teal-500/35 bg-teal-500/10 text-teal-200'
                                                : outcomeEngine.status === 'failed'
                                                    ? 'border-rose-500/35 bg-rose-500/10 text-rose-200'
                                                    : 'border-amber-500/35 bg-amber-500/10 text-amber-200'
                                        }`}>
                                            {outcomeEngine.status === 'passed'
                                                ? 'Checks passed'
                                                : outcomeEngine.status === 'failed'
                                                    ? 'Commitment miss'
                                                    : 'Armed for evaluation'}
                                        </span>
                                    </div>

                                    {credentialsIssued ? (
                                        <div className="mt-4 space-y-4">
                                            <div className={`rounded-xl border px-4 py-3 text-sm ${
                                                outcomeEngine.status === 'failed'
                                                    ? 'border-rose-500/25 bg-rose-500/10 text-rose-100'
                                                    : outcomeEngine.status === 'passed'
                                                        ? 'border-teal-500/25 bg-teal-500/10 text-teal-100'
                                                        : 'border-white/8 bg-white/[0.03] text-slate-300'
                                            }`}>
                                                {outcomeEngine.summary}
                                            </div>

                                            {(outcomeEngine.actualFieldCount !== undefined || outcomeEngine.actualFreshnessScore !== undefined) && (
                                                <div className="grid gap-3 sm:grid-cols-2">
                                                    <SummaryStat label="Observed fields" value={String(outcomeEngine.actualFieldCount ?? 0)} />
                                                    <SummaryStat
                                                        label="Observed freshness"
                                                        value={outcomeEngine.actualFreshnessScore !== undefined ? `${outcomeEngine.actualFreshnessScore}%` : 'Pending'}
                                                    />
                                                </div>
                                            )}

                                            {outcomeEngine.findings.length > 0 && (
                                                <div className="grid gap-3">
                                                    {outcomeEngine.findings.map(finding => (
                                                        <div key={finding} className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                                                            {finding}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {outcomeEngine.lastRunAt && (
                                                <div className="text-xs text-slate-500">
                                                    Last engine run{' '}
                                                    {new Date(outcomeEngine.lastRunAt).toLocaleString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: 'numeric',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="mt-4 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                                            The protection engine arms itself after scoped credentials are issued for protected evaluation.
                                        </div>
                                    )}
                                </div>

                                <div className={checkoutInsetClass}>
                                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                        <div>
                                            <div className="text-sm font-semibold text-white">Buyer validation gate</div>
                                            <div className="mt-1 text-xs leading-6 text-slate-400">
                                                Escrow cannot release until the evaluating organization validates the contracted schema and freshness outcome.
                                            </div>
                                        </div>
                                        <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                                            outcomeValidation.status === 'confirmed'
                                                ? 'border-teal-500/35 bg-teal-500/10 text-teal-200'
                                                : outcomeValidation.status === 'issue_reported'
                                                    ? 'border-rose-500/35 bg-rose-500/10 text-rose-200'
                                                    : 'border-amber-500/35 bg-amber-500/10 text-amber-200'
                                        }`}>
                                            {outcomeValidation.status === 'confirmed'
                                                ? 'Validated'
                                                : outcomeValidation.status === 'issue_reported'
                                                    ? 'Issue reported'
                                                    : 'Awaiting validation'}
                                        </span>
                                    </div>

                                    {credentialsIssued ? (
                                        <div className="mt-4 grid gap-3">
                                            {((outcomeEngine.status === 'passed') ||
                                                (usesCanonicalBuyerDemo && outcomeValidation.status === 'pending')) &&
                                                outcomeValidation.status === 'pending' && (
                                                <button
                                                    type="button"
                                                    onClick={handleConfirmOutcome}
                                                    className="rounded-xl bg-teal-500 px-4 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-teal-400"
                                                >
                                                    Complete buyer validation in place
                                                </button>
                                            )}

                                            {outcomeEngine.status === 'not_started' && (
                                                <div className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                                                    Protected evaluation is live. The engine is still completing its automatic schema and freshness scan.
                                                </div>
                                            )}

                                            {outcomeEngine.status === 'failed' && (
                                                <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                                                    Buyer validation is locked because the protection engine already detected a committed outcome miss and issued automatic credits.
                                                </div>
                                            )}

                                            {outcomeValidation.note && (
                                                <div className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                                                    {outcomeValidation.note}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="mt-4 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                                            Buyer validation controls unlock after the protected evaluation workspace is live.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {outcomeCredits.status === 'issued' && (
                                <div className="mt-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4">
                                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <div className="text-sm font-semibold text-white">Automatic credit issued</div>
                                            <div className="mt-1 text-xs text-rose-100/85">{outcomeCredits.reason}</div>
                                        </div>
                                        <div className="text-lg font-semibold text-rose-100">{formatUsd(outcomeCredits.amountUsd)}</div>
                                    </div>
                                </div>
                            )}

                            {showOutputReviewStatus && outputReviewModel && (
                                <div className="mt-5 rounded-2xl border border-white/8 bg-slate-950/55 p-4">
                                    <div className={checkoutMutedLabelClass}>Output review status</div>
                                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                                        <SummaryStat label="Current output-review state" value={outputReviewModel.currentStateLabel} />
                                        <SummaryStat label="Reviewer queue" value={outputReviewModel.request.queueStatus} />
                                        <SummaryStat label="Watermark trace" value={outputReviewModel.watermark.traceStatus} />
                                    </div>
                                    {checkoutOutputArtifacts.length > 0 ? (
                                        <div className="mt-4">
                                            <DealArtifactPreviewGrid artifacts={checkoutOutputArtifacts} />
                                        </div>
                                    ) : null}
                                </div>
                            )}
                        </section>

                        <details className={checkoutSectionClass} open={governanceDisclosureOpen}>
                            <summary className="flex cursor-pointer list-none flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <div className={checkoutMutedLabelClass}>Advanced oversight</div>
                                    <h2 className="mt-2 text-2xl font-semibold text-white">Governance & release controls</h2>
                                    <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-400">
                                        Jurisdiction posture, transfer review, lifecycle handling, and safety controls stay
                                        attached to the same transaction without crowding the primary buyer workflow.
                                    </p>
                                </div>
                                <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                                    Expand details
                                </span>
                            </summary>

                            <div className="mt-6 space-y-6">
                                <div className="grid gap-6 xl:grid-cols-2">
                                    <div className={checkoutInsetClass}>
                                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                            <div>
                                                <div className={checkoutMutedLabelClass}>Jurisdiction summary</div>
                                                <div className="mt-2 text-base font-semibold text-white">Region-aware checkout posture</div>
                                                <div className="mt-1 text-xs leading-6 text-slate-400">
                                                    Operational routing summary for this governed evaluation transaction.
                                                </div>
                                            </div>
                                            <span className="inline-flex rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                                                {transferPosture}
                                            </span>
                                        </div>

                                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                            <CompactJurisdictionRow label="Buyer organization jurisdiction" value={buyerJurisdiction} />
                                            <CompactJurisdictionRow label="Provider jurisdiction" value={providerJurisdiction} />
                                            <CompactJurisdictionRow label="Access region" value={accessRegion} />
                                            <CompactJurisdictionRow
                                                label="Transfer posture"
                                                value={`${transferPosture} · ${geographyLabelMap[selectedQuote.input.geography]}`}
                                            />
                                        </div>

                                        <div className="mt-4 grid gap-3">
                                            {jurisdictionStatuses.map(item => (
                                                <div key={item.label} className={`rounded-2xl border px-4 py-3 ${getJurisdictionToneClasses(item.tone)}`}>
                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                        <div className="text-sm font-semibold text-white">{item.label}</div>
                                                        <span className="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-[11px] font-semibold text-current">
                                                            {item.status}
                                                        </span>
                                                    </div>
                                                    <div className="mt-2 text-xs leading-6 text-current/80">{item.detail}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className={checkoutInsetClass}>
                                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                            <div>
                                                <div className={checkoutMutedLabelClass}>Cross-border transfer review</div>
                                                <div className="mt-2 text-base font-semibold text-white">Transfer routing module</div>
                                                <div className="mt-1 text-xs leading-6 text-slate-400">
                                                    Controlled routing for any movement beyond the primary governed lane.
                                                </div>
                                            </div>
                                            <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${getJurisdictionToneClasses(transferReviewModule.tone)}`}>
                                                {transferReviewModule.transferStatus}
                                            </span>
                                        </div>

                                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                            <CompactJurisdictionRow label="Transfer destination" value={transferReviewModule.destination} />
                                            <CompactJurisdictionRow label="Transfer status" value={transferReviewModule.transferStatus} />
                                            <CompactJurisdictionRow label="Review state" value={transferReviewModule.reviewState} />
                                        </div>

                                        <div className="mt-4">
                                            <div className={checkoutMutedLabelClass}>Safeguard checklist</div>
                                            <div className="mt-3 grid gap-2">
                                                {transferReviewModule.safeguards.map(item => (
                                                    <TransferSafeguardRow
                                                        key={item.label}
                                                        label={item.label}
                                                        detail={item.detail}
                                                        state={item.state}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm leading-6 ${getJurisdictionToneClasses(transferReviewModule.tone)}`}>
                                            {transferReviewModule.explanation}
                                        </div>

                                        <div className="mt-4 grid gap-2 sm:grid-cols-3">
                                            {transferStateExplainers.map(item => (
                                                <div key={item.title} className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
                                                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{item.title}</div>
                                                    <div className="mt-2 text-xs leading-6 text-slate-300">{item.detail}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
                                    <div className={checkoutInsetClass}>
                                        <div className="flex flex-col gap-2">
                                            <div className={checkoutMutedLabelClass}>Transaction lifecycle</div>
                                            <div className="text-base font-semibold text-white">Release / refund / dispute timeline</div>
                                            <div className="text-xs leading-6 text-slate-400">
                                                A fast view of how funding, evaluation, validation, and fallback handling move this transaction forward.
                                            </div>
                                        </div>

                                        <div className="mt-4 space-y-3">
                                            {transactionTimelineSteps.map((step, index) => (
                                                <TransactionTimelineRow
                                                    key={step.label}
                                                    label={step.label}
                                                    detail={step.detail}
                                                    state={step.state}
                                                    isLast={index === transactionTimelineSteps.length - 1}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className={checkoutInsetClass}>
                                        <div className={checkoutMutedLabelClass}>Why this transaction is safe</div>
                                        <div className="mt-3 grid gap-3">
                                            {transactionSafetyItems.map(item => (
                                                <SafetyPrincipleRow key={item.label} label={item.label} detail={item.detail} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </details>
                    </div>

                    <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
                        <section className={checkoutSectionClass}>
                            <div className={checkoutMutedLabelClass}>Guided actions</div>
                            <h2 className="mt-2 text-2xl font-semibold text-white">Run the buyer workflow here</h2>
                            <p className="mt-2 text-sm leading-7 text-slate-400">
                                These actions move the governed evaluation from quote-ready to release. Secondary pages remain
                                available for detail, not for required setup.
                            </p>

                            <div className="mt-5 grid gap-3">
                                {usesCanonicalBuyerDemo && (
                                    <button
                                        type="button"
                                        onClick={() => applyDemoScenario(setDemoStage('quote_ready'))}
                                        className={`${checkoutActionButtonClass} border-cyan-500/40 bg-cyan-500/10 text-cyan-100 hover:bg-cyan-500/20`}
                                    >
                                        {checkoutRecord === null ? 'Quote Ready Loaded' : '0. Confirm Quote / Reset to Quote Ready'}
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={handleFundEscrow}
                                    disabled={fundEscrowDisabled}
                                    className={`${checkoutActionButtonClass} ${
                                        fundEscrowDisabled
                                            ? 'cursor-not-allowed border border-slate-700 bg-slate-900/80 text-slate-500'
                                            : 'border-teal-500/40 bg-teal-500 text-slate-950 shadow-[0_12px_32px_rgba(20,184,166,0.22)] hover:bg-teal-400'
                                    }`}
                                >
                                    {checkoutRecord ? 'Escrow Funded' : '1. Fund Escrow'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleProvisionWorkspace}
                                    disabled={!checkoutRecord || workspaceReady}
                                    className={`${checkoutActionButtonClass} ${
                                        !checkoutRecord || workspaceReady
                                            ? 'cursor-not-allowed border border-slate-700 bg-slate-900/80 text-slate-500'
                                            : 'border-cyan-500/40 bg-cyan-500/10 text-cyan-100 hover:bg-cyan-500/20'
                                    }`}
                                >
                                    {workspaceReady ? 'Workspace Ready' : '2. Provision Workspace'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleIssueCredentials}
                                    disabled={!checkoutRecord || !workspaceReady || credentialsIssued}
                                    className={`${checkoutActionButtonClass} ${
                                        !checkoutRecord || !workspaceReady || credentialsIssued
                                            ? 'cursor-not-allowed border border-slate-700 bg-slate-900/80 text-slate-500'
                                            : 'border-amber-500/40 bg-amber-500/10 text-amber-100 hover:bg-amber-500/20'
                                    }`}
                                >
                                    {credentialsIssued ? 'Ephemeral Token Issued' : '3. Issue Ephemeral Token'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmOutcome}
                                    disabled={!buyerValidationReady}
                                    className={`${checkoutActionButtonClass} ${
                                        !buyerValidationReady
                                            ? 'cursor-not-allowed border border-slate-700 bg-slate-900/80 text-slate-500'
                                            : 'border-teal-500/40 bg-teal-500/10 text-teal-100 hover:bg-teal-500/20'
                                    }`}
                                >
                                    {outcomeValidation.status === 'confirmed'
                                        ? 'Buyer Validation Complete'
                                        : '4. Validate Buyer Outcome'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReleaseEscrow}
                                    disabled={!checkoutRecord || checkoutRecord.lifecycleState !== 'RELEASE_PENDING'}
                                    className={`${checkoutActionButtonClass} ${
                                        !checkoutRecord || checkoutRecord.lifecycleState !== 'RELEASE_PENDING'
                                            ? 'cursor-not-allowed border border-slate-700 bg-slate-900/80 text-slate-500'
                                            : 'border-white/10 bg-white text-slate-950 hover:bg-slate-100'
                                    }`}
                                >
                                    {checkoutRecord?.lifecycleState === 'RELEASED_TO_PROVIDER'
                                        ? 'Escrow Released'
                                        : '5. Release Escrow'}
                                </button>
                            </div>

                            <div className="mt-5 grid gap-2">
                                {checkoutFlowCards.slice(1).map(card => (
                                    <div key={card.label} className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-slate-950/55 px-4 py-3">
                                        <div>
                                            <div className="text-sm font-semibold text-white">{card.label}</div>
                                            <div className="mt-1 text-xs text-slate-400">{card.detail}</div>
                                        </div>
                                        <span className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${getCheckoutFlowToneClasses(card.tone)}`}>
                                            {card.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className={checkoutSectionClass}>
                            <div className={checkoutMutedLabelClass}>Settlement summary</div>
                            <h2 className="mt-2 text-3xl font-semibold text-white">{formatUsd(selectedQuote.totalUsd)}</h2>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <SummaryStat label="Escrow hold" value={formatUsd(selectedQuote.escrowHoldUsd)} />
                                <SummaryStat label="Evaluation fee" value={formatUsd(evaluationFeeUsd)} />
                                <SummaryStat label="Review window" value={`${config.reviewWindowHours} hours`} />
                                <SummaryStat label="Payment rail" value={paymentMethodMeta[config.paymentMethod].label} />
                            </div>

                            <div className="mt-4 rounded-2xl border border-white/8 bg-slate-950/55 p-4">
                                <div className={checkoutMutedLabelClass}>Commercial drivers</div>
                                <div className="mt-3 grid gap-3">
                                    {quoteBreakdownPreview.map(item => (
                                        <div key={item.label} className="flex items-start justify-between gap-4 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
                                            <div>
                                                <div className="text-sm font-semibold text-white">{item.label}</div>
                                                <div className="mt-1 text-xs leading-6 text-slate-400">{item.detail}</div>
                                            </div>
                                            <div className="text-sm font-semibold text-slate-100">{formatUsd(item.amountUsd)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <section className={checkoutSectionClass}>
                            <div className={checkoutMutedLabelClass}>Secondary views</div>
                            <div className="mt-4 grid gap-3">
                                {usesCanonicalBuyerDemo && tokenViewModel ? (
                                    <Link
                                        to={buyerRouteTargets.ephemeralToken}
                                        className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-3 text-center text-sm font-semibold text-cyan-100 transition-colors hover:bg-cyan-500/20"
                                    >
                                        View Ephemeral Token
                                    </Link>
                                ) : null}
                                <Link
                                    to={secureWorkspacePath}
                                    className="rounded-xl border border-teal-500/35 bg-teal-500/10 px-4 py-3 text-center text-sm font-semibold text-teal-100 transition-colors hover:bg-teal-500/20"
                                >
                                    Open Secure Workspace
                                </Link>
                                {showOutputReviewLink && outputReviewPath ? (
                                    <Link
                                        to={outputReviewPath}
                                        className="rounded-xl border border-cyan-500/35 bg-cyan-500/10 px-4 py-3 text-center text-sm font-semibold text-cyan-100 transition-colors hover:bg-cyan-500/20"
                                    >
                                        Open Output Review
                                    </Link>
                                ) : null}
                                <Link
                                    to={usesCanonicalBuyerDemo ? buyerRouteTargets.escrowCenter : isDemo ? '/demo/escrow-center' : '/escrow-center'}
                                    className="rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:border-slate-500 hover:bg-white/[0.05]"
                                >
                                    Open Escrow Center
                                </Link>
                            </div>
                        </section>

                        {tokenViewModel && (
                            <section className={checkoutSectionClass}>
                                <div className={checkoutMutedLabelClass}>Session status</div>
                                <div className="mt-2 text-xl font-semibold text-white">{accessStatusTitle}</div>
                                <div className="mt-2 text-sm leading-6 text-slate-300">
                                    {tokenViewModel.safeTokenReference} · {tokenViewModel.timeRemaining}
                                    {tokenViewModel.record.credentials.expiresAt
                                        ? ` · expires ${formatTimestamp(tokenViewModel.record.credentials.expiresAt, 'Pending')}`
                                        : ''}
                                </div>

                                {tokenViewModel.terminalState ? (
                                    <div className="mt-4 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-slate-200">
                                        {tokenViewModel.terminalState.reason}
                                    </div>
                                ) : null}
                            </section>
                        )}
                    </aside>
                </section>
            </div>
        </div>
    )
}

function CheckoutFlowStatusCard({
    label,
    value,
    detail,
    tone
}: CheckoutFlowCard) {
    return (
        <div className={`h-full rounded-[26px] border px-4 py-4 shadow-[0_12px_28px_rgba(2,6,23,0.22)] ${getCheckoutFlowToneClasses(tone)}`}>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-current/80">{label}</div>
            <div className="mt-3 text-base font-semibold text-white">{value}</div>
            <div className="mt-2 text-xs leading-6 text-current/85">{detail}</div>
        </div>
    )
}

type TokenConditionState = 'complete' | 'current' | 'upcoming' | 'blocked'

function TokenConditionCard({
    label,
    detail,
    state
}: {
    label: string
    detail: string
    state: TokenConditionState
}) {
    return (
        <div className={`rounded-2xl border px-4 py-4 ${getTokenConditionClasses(state)}`}>
            <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-white">{label}</div>
                <span className="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-current">
                    {state === 'complete'
                        ? 'Done'
                        : state === 'current'
                            ? 'In progress'
                            : state === 'blocked'
                                ? 'Blocked'
                                : 'Standby'}
                </span>
            </div>
            <div className="mt-2 text-xs leading-6 text-current/85">{detail}</div>
        </div>
    )
}

function SummaryStat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</div>
            <div className="mt-2 text-sm font-semibold leading-6 text-slate-100">{value}</div>
        </div>
    )
}

function CompactJurisdictionRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</div>
            <div className="mt-2 text-sm font-semibold leading-6 text-white">{value}</div>
        </div>
    )
}

function TransferSafeguardRow({
    label,
    detail,
    state
}: {
    label: string
    detail: string
    state: TransferSafeguardState
}) {
    return (
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-semibold text-white">{label}</div>
                <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${getTransferSafeguardStateClasses(state)}`}>
                    {getTransferSafeguardStateLabel(state)}
                </span>
            </div>
            <div className="mt-2 text-xs leading-6 text-slate-400">{detail}</div>
        </div>
    )
}

function TransactionTimelineRow({
    label,
    detail,
    state,
    isLast
}: {
    label: string
    detail: string
    state: TransactionTimelineStepState
    isLast: boolean
}) {
    return (
        <div className="relative pl-10">
            {!isLast && <div className="absolute left-[11px] top-6 h-[calc(100%+0.75rem)] w-px bg-white/10" />}
            <span className={`absolute left-0 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full border ${getTransactionTimelineStateClasses(state)}`}>
                <span className="h-2.5 w-2.5 rounded-full bg-current" />
            </span>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-white">{label}</div>
                    <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${getTransactionTimelineStateClasses(state)}`}>
                        {getTransactionTimelineStateLabel(state)}
                    </span>
                </div>
                <div className="mt-2 text-xs leading-6 text-slate-400">{detail}</div>
            </div>
        </div>
    )
}

function SafetyPrincipleRow({ label, detail }: { label: string; detail: string }) {
    return (
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
            <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                </span>
                <div>
                    <div className="text-sm font-semibold text-white">{label}</div>
                    <div className="mt-1 text-xs leading-6 text-slate-400">{detail}</div>
                </div>
            </div>
        </div>
    )
}

function getCheckoutFlowToneClasses(tone: CheckoutFlowTone) {
    if (tone === 'active') return 'border-teal-500/25 bg-teal-500/10 text-teal-100'
    if (tone === 'pending') return 'border-amber-500/25 bg-amber-500/10 text-amber-100'
    if (tone === 'blocked') return 'border-rose-500/25 bg-rose-500/10 text-rose-100'
    return 'border-slate-500/25 bg-slate-500/10 text-slate-300'
}

function getTokenConditionClasses(state: TokenConditionState) {
    if (state === 'complete') return 'border-teal-500/25 bg-teal-500/10 text-teal-100'
    if (state === 'current') return 'border-amber-500/25 bg-amber-500/10 text-amber-100'
    if (state === 'blocked') return 'border-rose-500/25 bg-rose-500/10 text-rose-100'
    return 'border-slate-500/25 bg-slate-500/10 text-slate-300'
}

function formatCheckoutScopeLabel(scope: string) {
    if (scope.startsWith('dataset:')) return 'dataset read'
    if (scope === 'audit:write') return 'audit write'
    if (scope === 'policy:enforced') return 'policy enforced'
    if (scope === 'query:clean-room') return 'query clean-room'
    if (scope === 'query:aggregated') return 'query aggregated'
    if (scope === 'export:aggregated') return 'aggregate export approved'
    if (scope === 'export:none') return 'export none'
    if (scope === 'egress:blocked') return 'egress blocked'
    if (scope === 'egress:reviewed') return 'egress reviewed'
    if (scope === 'download:encrypted') return 'encrypted download approved'
    if (scope === 'watermark:required') return 'watermark required'
    if (scope === 'keys:ephemeral') return 'keys ephemeral'
    return scope.replace(/[:]/g, ' ')
}
