import { CONTRACT_STATE_LABELS, type ContractLifecycleState } from './accessContract'

export type LifecycleRole = 'buyer' | 'provider' | 'admin'

export type LifecycleGuidance = {
    state: ContractLifecycleState
    stateLabel: string
    owner: string
    nextStep: string
    roleHint: string
    allowedActions: string[]
    blockedActions: string[]
    securityControls: string[]
}

type GuidanceTemplate = Omit<LifecycleGuidance, 'state' | 'stateLabel' | 'roleHint'>

const BASE_GUIDANCE: Record<ContractLifecycleState, GuidanceTemplate> = {
    REQUEST_SUBMITTED: {
        owner: 'Trust Review Queue',
        nextStep: 'Policy and purpose validation starts.',
        allowedActions: ['Edit request rationale', 'Cancel request before review'],
        blockedActions: ['Start data session', 'Download data', 'Release funds'],
        securityControls: ['Request hash logged', 'Identity shielded', 'No token issuance']
    },
    REVIEW_IN_PROGRESS: {
        owner: 'Compliance Reviewer',
        nextStep: 'Risk scoring and policy conditions are assigned.',
        allowedActions: ['Respond to reviewer questions', 'Attach compliance evidence'],
        blockedActions: ['Access dataset content', 'Trigger escrow release'],
        securityControls: ['Dual-approval for high risk', 'Audit trail enforced', 'Residency policy checks']
    },
    REQUEST_APPROVED: {
        owner: 'Buyer + Platform',
        nextStep: 'Choose access mode and fund escrow hold.',
        allowedActions: ['Select enclave/download policy', 'Confirm escrow window'],
        blockedActions: ['Raw export outside enclave', 'Credential reuse across datasets'],
        securityControls: ['Scoped policy templates', 'Consent gate', 'Pre-access audit checkpoint']
    },
    FUNDS_HELD: {
        owner: 'Escrow Engine',
        nextStep: 'Provision secure session and ephemeral credentials.',
        allowedActions: ['Start enclave session', 'Inspect access policy'],
        blockedActions: ['Payout to provider', 'Direct unlogged access'],
        securityControls: ['Funds lock in escrow', 'TTL token policy', 'Kill-switch armed']
    },
    ACCESS_ACTIVE: {
        owner: 'Session Controller',
        nextStep: 'Monitor usage until release window decision.',
        allowedActions: ['Run governed analysis', 'Export only policy-allowed artifacts'],
        blockedActions: ['Bypass enclave controls', 'Unapproved data egress'],
        securityControls: ['Egress controls', 'Watermarking', 'Real-time anomaly detection']
    },
    RELEASE_PENDING: {
        owner: 'Buyer Confirmation',
        nextStep: 'Confirm release or open dispute before window expiry.',
        allowedActions: ['Release funds', 'Open dispute', 'Extend review window'],
        blockedActions: ['Silent release with open flags', 'New session issuance'],
        securityControls: ['Release policy guardrails', 'Final audit checkpoint', 'Auto-release timer']
    },
    RELEASED_TO_PROVIDER: {
        owner: 'Escrow Settlement',
        nextStep: 'Case is closed and trust updates are recorded.',
        allowedActions: ['View settlement receipt', 'Submit post-access feedback'],
        blockedActions: ['Re-open without formal dispute', 'Retroactive policy edits'],
        securityControls: ['Settlement hash written', 'Immutable receipt', 'Trust profile update']
    },
    DISPUTE_OPEN: {
        owner: 'Dispute Resolution Team',
        nextStep: 'Investigate evidence and resolve refund/release outcome.',
        allowedActions: ['Attach evidence', 'Freeze access', 'Escalate to legal'],
        blockedActions: ['Automatic payout', 'Session continuation without review'],
        securityControls: ['Escrow freeze', 'Evidence chain logging', 'Admin-only resolution actions']
    },
    RESOLVED_REFUND: {
        owner: 'Resolution Ledger',
        nextStep: 'Refund completed and case archived.',
        allowedActions: ['View resolution report', 'Apply remediation controls'],
        blockedActions: ['Release disputed payout', 'Delete dispute record'],
        securityControls: ['Refund proof logged', 'Case lock', 'Audit export ready']
    },
    RESOLVED_RELEASE: {
        owner: 'Resolution Ledger',
        nextStep: 'Payout completed and case archived.',
        allowedActions: ['View resolution report', 'Submit provider feedback'],
        blockedActions: ['Duplicate payout', 'Modify closed evidence'],
        securityControls: ['Resolution proof logged', 'Case lock', 'Post-resolution monitoring']
    },
    REQUEST_REJECTED: {
        owner: 'Trust Review Queue',
        nextStep: 'Resubmit with missing controls or required documentation.',
        allowedActions: ['Read reviewer feedback', 'Prepare corrected submission'],
        blockedActions: ['Start escrow', 'Issue access credentials'],
        securityControls: ['Rejected reason logged', 'No token path active', 'Policy non-compliance lock']
    },
    CANCELLED: {
        owner: 'Request Owner',
        nextStep: 'Contract remains closed unless re-created.',
        allowedActions: ['Recreate access request', 'Export cancellation receipt'],
        blockedActions: ['Resume old contract state', 'Issue credentials'],
        securityControls: ['Cancellation audit entry', 'Session invalidation', 'Escrow unlock policy']
    }
}

const ROLE_HINTS: Record<LifecycleRole, string> = {
    buyer: 'You control confirmation, dispute, and usage accountability.',
    provider: 'You control delivery policy and monitor governed consumption.',
    admin: 'You enforce policy, security controls, and dispute outcomes.'
}

export const getLifecycleGuidance = (
    role: LifecycleRole,
    state: ContractLifecycleState
): LifecycleGuidance => {
    const template = BASE_GUIDANCE[state]
    return {
        state,
        stateLabel: CONTRACT_STATE_LABELS[state],
        roleHint: ROLE_HINTS[role],
        ...template
    }
}
