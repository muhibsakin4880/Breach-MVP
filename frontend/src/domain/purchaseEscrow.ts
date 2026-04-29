import type { DatasetDetail } from '../data/datasetDetailData'
import type { CompliancePassport } from './compliancePassport'
import { formatUsd, type RightsQuote } from './rightsQuoteBuilder'
import type {
    EscrowCenterTransaction,
    EscrowCheckoutAccessMode,
    EscrowCheckoutConfig,
    EscrowCheckoutRecord,
    EscrowPaymentMethod
} from './escrowCheckout'
import { initializeEvaluationState } from './evaluationEscrow'

export type {
    EscrowCenterTransaction,
    EscrowCheckoutConfig,
    EscrowCheckoutRecord,
    EscrowPaymentMethod
}

const ESCROW_CHECKOUT_STORAGE_KEY = 'Redoubt:escrowCheckouts'

const nowIso = () => new Date().toISOString()

const buildStableHash = (input: string) => {
    let hash = 0
    for (let index = 0; index < input.length; index += 1) {
        hash = (hash * 31 + input.charCodeAt(index)) >>> 0
    }
    return hash.toString(16).toUpperCase().padStart(8, '0').slice(0, 8)
}

const buildId = (prefix: string, seed: string) => `${prefix}-${buildStableHash(`${seed}:${Date.now()}`)}`

const accessModeFromQuote = (quote: RightsQuote): EscrowCheckoutAccessMode => {
    if (quote.input.deliveryMode === 'encrypted_download') return 'encrypted_download'
    if (quote.input.deliveryMode === 'aggregated_export') return 'aggregated_export'
    return 'clean_room'
}

export const paymentMethodMeta: Record<
    EscrowPaymentMethod,
    { label: string; detail: string }
> = {
    wallet: {
        label: 'Treasury wallet',
        detail: 'Fastest settlement path for repeat buyers and smaller governed purchases.'
    },
    wire: {
        label: 'Wire transfer',
        detail: 'Recommended for larger enterprise transactions requiring accounting controls.'
    },
    card: {
        label: 'Card on file',
        detail: 'Convenient for evaluation and one-off access packages.'
    }
}

export const describeCheckoutPaymentMethod = (paymentMethod: EscrowPaymentMethod) =>
    paymentMethodMeta[paymentMethod].label

export const getRecommendedCheckoutConfig = (quote: RightsQuote): EscrowCheckoutConfig => ({
    accessMode: accessModeFromQuote(quote),
    reviewWindowHours: quote.input.validationWindowHours,
    paymentMethod: quote.totalUsd >= 5000 ? 'wire' : quote.totalUsd >= 2500 ? 'wallet' : 'card'
})

export const buildEscrowCheckoutRecord = (
    dataset: DatasetDetail,
    quote: RightsQuote,
    passport: CompliancePassport,
    config: EscrowCheckoutConfig
): EscrowCheckoutRecord => {
    const createdAt = nowIso()
    const evaluationState = initializeEvaluationState(dataset, quote, passport, config, createdAt)

    return {
        id: buildId('CHK', quote.id),
        escrowId: buildId('ESC', `${dataset.id}:${quote.id}`),
        contractId: buildId('CTR', `${dataset.id}:${passport.passportId}`),
        datasetId: dataset.id,
        datasetTitle: dataset.title,
        quoteId: quote.id,
        passportId: passport.passportId,
        createdAt,
        updatedAt: createdAt,
        lifecycleState: 'FUNDS_HELD',
        buyerLabel: `part_${passport.passportId.toLowerCase()}`,
        providerLabel: `anon_provider_${buildStableHash(dataset.title).slice(0, 4).toLowerCase()}`,
        funding: {
            amountUsd: quote.totalUsd,
            escrowHoldUsd: quote.escrowHoldUsd,
            fundedAt: createdAt,
            paymentMethod: config.paymentMethod
        },
        configuration: config,
        ...evaluationState
    }
}

export const releaseEscrowToProvider = (record: EscrowCheckoutRecord): EscrowCheckoutRecord => {
    const updatedAt = nowIso()

    return {
        ...record,
        updatedAt,
        lifecycleState: 'RELEASED_TO_PROVIDER',
        outcomeProtection: {
            ...record.outcomeProtection,
            stage: 'released',
            release: {
                releasedAt: updatedAt
            }
        }
    }
}

export const loadEscrowCheckouts = (datasetId?: string) => {
    if (typeof window === 'undefined') return [] as EscrowCheckoutRecord[]
    const raw = window.localStorage.getItem(ESCROW_CHECKOUT_STORAGE_KEY)
    if (!raw) return [] as EscrowCheckoutRecord[]

    try {
        const parsed = JSON.parse(raw) as EscrowCheckoutRecord[]
        if (!Array.isArray(parsed)) return [] as EscrowCheckoutRecord[]
        const sorted = parsed.sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt))
        return datasetId ? sorted.filter(record => record.datasetId === datasetId) : sorted
    } catch {
        return [] as EscrowCheckoutRecord[]
    }
}

export const loadEscrowCheckoutByQuoteId = (quoteId: string) =>
    loadEscrowCheckouts().find(record => record.quoteId === quoteId) ?? null

export const saveEscrowCheckout = (record: EscrowCheckoutRecord) => {
    const records = loadEscrowCheckouts()
    const next = [record, ...records.filter(existing => existing.id !== record.id)].slice(0, 30)
    if (typeof window !== 'undefined') {
        window.localStorage.setItem(ESCROW_CHECKOUT_STORAGE_KEY, JSON.stringify(next))
    }
    return next
}

export const loadEscrowCheckoutTransactions = (): EscrowCenterTransaction[] =>
    loadEscrowCheckouts().map(record => ({
        id: record.escrowId,
        dataset: record.datasetTitle,
        buyer: record.buyerLabel,
        provider: record.providerLabel,
        amount: formatUsd(record.funding.amountUsd),
        accessMethod: record.configuration.accessMode === 'encrypted_download' ? 'download' : 'platform',
        status: record.lifecycleState
    }))
