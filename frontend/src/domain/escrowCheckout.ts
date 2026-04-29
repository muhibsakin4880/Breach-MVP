// This module is types-only. Buyer-facing evaluation logic lives in
// `evaluationEscrow.ts`; funding, fulfillment, and release logic lives in
// `purchaseEscrow.ts`. Do not extend this file with new logic — add it to
// the appropriate split module instead.

import type { ContractLifecycleState } from './accessContract'

export type EscrowCheckoutAccessMode = 'clean_room' | 'aggregated_export' | 'encrypted_download'
export type EscrowPaymentMethod = 'wallet' | 'wire' | 'card'
export type EscrowReviewWindowHours = 24 | 48 | 72

export type OutcomeIssueType = 'schema_mismatch' | 'freshness_miss'
export type OutcomeEngineStatus = 'not_started' | 'passed' | 'failed'

type EscrowCheckoutLifecycle = Extract<
    ContractLifecycleState,
    'FUNDS_HELD' | 'ACCESS_ACTIVE' | 'RELEASE_PENDING' | 'RELEASED_TO_PROVIDER' | 'DISPUTE_OPEN'
>
type WorkspaceStatus = 'planned' | 'ready'
type CredentialStatus = 'planned' | 'issued'
export type OutcomeStage = 'evaluation_pending' | 'evaluation_active' | 'validated' | 'credit_issued' | 'released'
export type OutcomeValidationStatus = 'pending' | 'confirmed' | 'issue_reported'

export type EscrowCheckoutConfig = {
    accessMode: EscrowCheckoutAccessMode
    reviewWindowHours: EscrowReviewWindowHours
    paymentMethod: EscrowPaymentMethod
}

export type EscrowDueUseAgreement = {
    version: string
    checksum: string
    generatedAt: string
    summary: string
    clauses: string[]
    accepted: boolean
    acceptedAt?: string
}

export type EscrowCheckoutRecord = {
    id: string
    escrowId: string
    contractId: string
    datasetId: string
    datasetTitle: string
    quoteId: string
    passportId: string
    createdAt: string
    updatedAt: string
    lifecycleState: EscrowCheckoutLifecycle
    buyerLabel: string
    providerLabel: string
    funding: {
        amountUsd: number
        escrowHoldUsd: number
        fundedAt: string
        paymentMethod: EscrowPaymentMethod
    }
    configuration: EscrowCheckoutConfig
    dua: EscrowDueUseAgreement
    workspace: {
        status: WorkspaceStatus
        workspaceId: string
        workspaceName: string
        launchPath: string
        provisionedAt?: string
    }
    credentials: {
        status: CredentialStatus
        credentialId?: string
        issuedAt?: string
        expiresAt?: string
        scopes: string[]
        tokenTtlMinutes: number
    }
    outcomeProtection: {
        metadataPreviewIncluded: boolean
        evaluationFeeUsd: number
        stage: OutcomeStage
        commitments: {
            schemaVersion: string
            expectedFieldCount: number
            freshnessCommitment: string
            confidenceFloor: number
        }
        engine: {
            status: OutcomeEngineStatus
            summary: string
            findings: string[]
            actualFieldCount?: number
            actualFreshnessScore?: number
            lastRunAt?: string
        }
        validation: {
            status: OutcomeValidationStatus
            issueTypes: OutcomeIssueType[]
            note?: string
            updatedAt?: string
        }
        credits: {
            status: 'none' | 'issued'
            amountUsd: number
            reason?: string
            issuedAt?: string
        }
        release?: {
            releasedAt?: string
        }
    }
}

export type EscrowCenterTransaction = {
    id: string
    dataset: string
    buyer: string
    provider: string
    amount: string
    accessMethod: 'platform' | 'download'
    status: Extract<ContractLifecycleState, 'FUNDS_HELD' | 'ACCESS_ACTIVE' | 'RELEASE_PENDING' | 'RELEASED_TO_PROVIDER' | 'DISPUTE_OPEN'>
}
