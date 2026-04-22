export type ProviderInstitutionReviewTone = 'emerald' | 'amber' | 'rose' | 'cyan' | 'slate'

export type ProviderInstitutionChecklistSeed = {
    id: string
    label: string
    detail: string
    owner: string
}

export type ProviderInstitutionReviewerSeed = {
    role: string
    name: string
    status: 'Signed off' | 'Waiting on provider' | 'Monitoring'
    note: string
}

export type ProviderInstitutionSubmissionSeed = {
    reviewState: 'Approved package' | 'Conditional release' | 'Publishing review' | 'Needs remediation' | 'Closed'
    note: string
    nextAction: string
    blockerTitle?: string
    severity?: 'High' | 'Medium' | 'Low'
}

export type ProviderInstitutionTimelineSeed = {
    at: string
    label: string
    detail: string
    tone: ProviderInstitutionReviewTone
}

export type ProviderInstitutionSeed = {
    reviewId: string
    institutionName: string
    institutionType: string
    legalEntity: string
    headquarters: string
    operatingRegions: string[]
    summary: string
    publishingDesk: string
    publishingLead: {
        name: string
        role: string
        email: string
    }
    governanceLead: {
        name: string
        role: string
        email: string
    }
    escalationContact: {
        name: string
        role: string
        email: string
    }
    reviewStatusNote: string
    verificationItems: ProviderInstitutionChecklistSeed[]
    reviewers: ProviderInstitutionReviewerSeed[]
    packetDealIds: string[]
    submissionSeeds: Record<string, ProviderInstitutionSubmissionSeed>
    timeline: ProviderInstitutionTimelineSeed[]
}

export const PROVIDER_INSTITUTION_REVIEW_SEED: ProviderInstitutionSeed = {
    reviewId: 'PIR-2026-041',
    institutionName: 'Northwind Research Exchange',
    institutionType: 'Multi-program data publishing institution',
    legalEntity: 'Northwind Research Exchange FZ-LLC',
    headquarters: 'Dubai Internet City, United Arab Emirates',
    operatingRegions: ['UAE', 'Saudi Arabia', 'Qatar', 'United Kingdom'],
    summary:
        'Institution-level publishing review for the current provider workspace. This route shows whether Northwind can keep publishing new governed evaluation packages, which submissions are holding the review open, and who still needs to sign off before more buyer-visible packets are released.',
    publishingDesk: 'Provider publishing review desk',
    publishingLead: {
        name: 'Amal Rahman',
        role: 'Director of publishing operations',
        email: 'amal.rahman@northwind.exchange'
    },
    governanceLead: {
        name: 'Yousef Haddad',
        role: 'Institutional governance steward',
        email: 'yousef.haddad@northwind.exchange'
    },
    escalationContact: {
        name: 'Hina Masood',
        role: 'Rights escalation lead',
        email: 'hina.masood@northwind.exchange'
    },
    reviewStatusNote:
        'New datasets can still be packaged, but institutional publishing readiness cannot be fully signed off until the open remediation items are cleared and the healthcare restriction memo stays current.',
    verificationItems: [
        {
            id: 'authority-roster',
            label: 'Delegated publishing authority roster is current',
            detail: 'Named signatories and publication authority instruments are mapped for the current provider workspace.',
            owner: 'Publishing operations'
        },
        {
            id: 'source-rights',
            label: 'Source rights and contributor agreements cover active submissions',
            detail: 'Every live submission needs a rights basis that matches the exact fields and delivery shape being offered.',
            owner: 'Rights operations'
        },
        {
            id: 'package-alignment',
            label: 'Buyer-visible access packaging matches the institution review file',
            detail: 'Allowed use, delivery posture, and export controls must align before new packets can go live.',
            owner: 'Commercial packaging desk'
        },
        {
            id: 'residency-matrix',
            label: 'Residency and cross-border controls are attached to every governed submission',
            detail: 'Region-specific restrictions and clean-room routing need to stay current before buyer review expands.',
            owner: 'Residency review'
        },
        {
            id: 'escalation-routing',
            label: 'Escalation owners are named for privacy, legal, and provider remediation',
            detail: 'Each blocked or conditional submission needs an accountable owner before the publishing desk can close review.',
            owner: 'Provider operations'
        }
    ],
    reviewers: [
        {
            role: 'Publishing authority',
            name: 'Amal Rahman',
            status: 'Signed off',
            note: 'Roster and packaging ownership are confirmed for the current institution file.'
        },
        {
            role: 'Legal and rights review',
            name: 'Hina Masood',
            status: 'Waiting on provider',
            note: 'Open remediation items must be corrected before rights coverage can be re-attested.'
        },
        {
            role: 'Governance and residency review',
            name: 'Yousef Haddad',
            status: 'Monitoring',
            note: 'Conditional healthcare release remains acceptable while residency guidance stays attached.'
        }
    ],
    packetDealIds: ['DL-1001', 'DL-1002', 'DL-1003'],
    submissionSeeds: {
        'cn-1001': {
            reviewState: 'Publishing review',
            note: 'Validation is still running, so this dataset cannot be added to the institution publication roster yet.',
            nextAction: 'Wait for schema and quality review to finish before rights packaging begins.',
            blockerTitle: 'Awaiting validation completion',
            severity: 'Medium'
        },
        'cn-1002': {
            reviewState: 'Needs remediation',
            note: 'Source-field remediation is required before source rights coverage and packaging can be re-attested.',
            nextAction: 'Patch the source columns and return to the validation lane with one corrected package.',
            blockerTitle: 'Rights coverage blocked by quality defects',
            severity: 'High'
        },
        'cn-1003': {
            reviewState: 'Approved package',
            note: 'This package already cleared institution review and can stay visible in governed buyer evaluation.',
            nextAction: 'Monitor live usage and preserve the approved package posture.'
        },
        'cn-1004': {
            reviewState: 'Conditional release',
            note: 'Institution review allows publication only inside approved healthcare workspaces with reviewed output paths.',
            nextAction: 'Keep the healthcare restriction memo current before broadening any buyer-facing posture.',
            blockerTitle: 'Conditional healthcare restrictions remain in force',
            severity: 'Low'
        },
        'cn-1005': {
            reviewState: 'Closed',
            note: 'The submission is closed after compliance rejection and does not count toward current publishing readiness.',
            nextAction: 'Open a new submission only after compliance blockers are fully corrected.',
            blockerTitle: 'Submission closed after compliance rejection',
            severity: 'High'
        }
    },
    timeline: [
        {
            at: '2026-02-11',
            label: 'Institution review opened',
            detail: 'The publishing desk opened a shared review after multiple regulated submissions entered the same provider workspace.',
            tone: 'cyan'
        },
        {
            at: '2026-02-14',
            label: 'First package signed off',
            detail: 'Financial Tick Delta Batch cleared validation, packaging, and institutional publishing review.',
            tone: 'emerald'
        },
        {
            at: '2026-02-16',
            label: 'Remediation required',
            detail: 'Climate Station Metadata Patch failed quality review and reopened source-rights attestation work.',
            tone: 'rose'
        },
        {
            at: '2026-02-18',
            label: 'Conditional healthcare release maintained',
            detail: 'Clinical Outcomes Delta stayed publishable, but only under healthcare-only residency and output controls.',
            tone: 'amber'
        }
    ]
}
