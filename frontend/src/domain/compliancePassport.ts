type Step1FormState = {
    organizationName: string
    officialWorkEmail: string
    inviteCode: string
    roleInOrganization: string
    industryDomain: string
    country: string
}

type LegalAcknowledgment = {
    authorizedRepresentative: boolean
    governancePolicyAccepted: boolean
    nonRedistributionAcknowledged: boolean
}

type VerificationSnapshot = {
    linkedInConnected: boolean
    affiliationFileName: string | null
    authorizationFileName: string | null
}

type ComplianceCommitment = {
    responsibleDataUsage: boolean
    noUnauthorizedSharing: boolean
    platformCompliancePolicies: boolean
}

export type CompliancePassportStatus = 'active' | 'review' | 'incomplete'

export type CompliancePassportSection = {
    key: 'identity' | 'usage' | 'legal' | 'verification' | 'commitments'
    label: string
    complete: boolean
    detail: string
}

export type CompliancePassportBenefit = {
    label: string
    active: boolean
    detail: string
}

export type CompliancePassport = {
    passportId: string
    status: CompliancePassportStatus
    completionPercent: number
    issuedAt: string
    validUntil: string
    organization: Step1FormState
    intendedUsage: string[]
    participationIntent: string[]
    legalAcknowledgment: LegalAcknowledgment
    verification: VerificationSnapshot
    commitments: ComplianceCommitment
    sections: CompliancePassportSection[]
    benefits: CompliancePassportBenefit[]
    fastTrackEligible: boolean
    preferredOrgType: 'research' | 'enterprise' | 'startup' | 'public' | 'other'
    defaultDuration: '30 days' | '90 days' | '6 months' | '12 months' | 'ongoing'
    preferredAccessMode: 'metadata' | 'clean_room' | 'clean_room_plus_aggregated' | 'encrypted_download'
    usageSummary: string
}

export type CompliancePassportRequestPrefill = {
    orgType: CompliancePassport['preferredOrgType']
    affiliation: string
    intendedUsage: string
    duration: CompliancePassport['defaultDuration']
    usageScale: 'low' | 'medium' | 'high'
    complianceChecked: boolean
    note: string
}

const STEP1_STORAGE_KEY = 'Redoubt:onboarding:step1'
const INTENDED_USAGE_STORAGE_KEY = 'Redoubt:onboarding:intendedUsage'
const PARTICIPATION_INTENT_STORAGE_KEY = 'Redoubt:onboarding:participationIntent'
const LEGAL_STORAGE_KEY = 'Redoubt:onboarding:legalAcknowledgment'
const VERIFICATION_STORAGE_KEY = 'Redoubt:onboarding:verification'
const COMPLIANCE_STORAGE_KEY = 'Redoubt:onboarding:compliance'
const SUBMISSION_META_STORAGE_KEY = 'Redoubt:onboarding:submissionMeta'

const defaultStep1: Step1FormState = {
    organizationName: 'Northbridge Research Labs',
    officialWorkEmail: 'avery.underwood@northbridge.ai',
    inviteCode: 'REDO-2026',
    roleInOrganization: 'Senior Data Scientist',
    industryDomain: 'Healthcare & AI',
    country: 'United States'
}

const defaultUsage = ['Research', 'AI/ML training']
const defaultParticipationIntent = ['Access datasets', 'Collaborate']
const defaultLegal: LegalAcknowledgment = {
    authorizedRepresentative: true,
    governancePolicyAccepted: true,
    nonRedistributionAcknowledged: true
}
const defaultVerification: VerificationSnapshot = {
    linkedInConnected: true,
    affiliationFileName: 'northbridge-affiliation.pdf',
    authorizationFileName: 'northbridge-compliance-letter.pdf'
}
const defaultCommitments: ComplianceCommitment = {
    responsibleDataUsage: true,
    noUnauthorizedSharing: true,
    platformCompliancePolicies: true
}

const readStoredValue = <T,>(key: string, fallback: T): T => {
    if (typeof window === 'undefined') return fallback
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback

    try {
        return JSON.parse(raw) as T
    } catch {
        return fallback
    }
}

const toTitleCase = (value: string) =>
    value
        .split(/[\s/_-]+/)
        .filter(Boolean)
        .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`)
        .join(' ')

const buildPassportId = (organizationName: string, officialWorkEmail: string) => {
    const seed = `${organizationName}:${officialWorkEmail}`.trim()
    let hash = 0
    for (let index = 0; index < seed.length; index += 1) {
        hash = (hash * 31 + seed.charCodeAt(index)) % 1000000
    }

    return `CP-${String(hash).padStart(6, '0')}`
}

const inferOrgType = (step1: Step1FormState): CompliancePassport['preferredOrgType'] => {
    const haystack = `${step1.organizationName} ${step1.roleInOrganization} ${step1.industryDomain}`.toLowerCase()
    if (haystack.includes('university') || haystack.includes('lab') || haystack.includes('research')) return 'research'
    if (haystack.includes('public') || haystack.includes('government') || haystack.includes('ngo')) return 'public'
    if (haystack.includes('startup') || haystack.includes('founder')) return 'startup'
    if (haystack.includes('enterprise') || haystack.includes('bank') || haystack.includes('hospital')) return 'enterprise'
    return 'enterprise'
}

const inferDefaultDuration = (usage: string[]): CompliancePassport['defaultDuration'] => {
    if (usage.some((item) => item.toLowerCase().includes('product'))) return '12 months'
    if (usage.some((item) => item.toLowerCase().includes('ai/ml'))) return '6 months'
    if (usage.some((item) => item.toLowerCase().includes('research'))) return '90 days'
    return '90 days'
}

const inferPreferredAccessMode = (
    usage: string[],
    participationIntent: string[]
): CompliancePassport['preferredAccessMode'] => {
    const normalizedUsage = usage.map(item => item.toLowerCase())
    const normalizedIntent = participationIntent.map(item => item.toLowerCase())

    if (normalizedUsage.some(item => item.includes('product')) || normalizedIntent.some(item => item.includes('contribute'))) {
        return 'clean_room_plus_aggregated'
    }
    if (normalizedUsage.some(item => item.includes('ai/ml'))) return 'clean_room'
    if (normalizedUsage.some(item => item.includes('analytics'))) return 'clean_room_plus_aggregated'
    return 'metadata'
}

const inferUsageScale = (usage: string[], participationIntent: string[]): CompliancePassportRequestPrefill['usageScale'] => {
    const normalizedUsage = usage.map(item => item.toLowerCase())
    const normalizedIntent = participationIntent.map(item => item.toLowerCase())
    if (normalizedUsage.some(item => item.includes('product')) || normalizedIntent.some(item => item.includes('contribute'))) return 'high'
    if (normalizedUsage.some(item => item.includes('ai/ml')) || normalizedUsage.some(item => item.includes('analytics'))) return 'medium'
    return 'low'
}

const getIssuedAt = () => {
    const submissionMeta = readStoredValue<{ submittedDate?: string } | null>(SUBMISSION_META_STORAGE_KEY, null)
    return submissionMeta?.submittedDate ?? 'March 27, 2026'
}

const getValidUntil = (status: CompliancePassportStatus) => {
    if (status === 'incomplete') return 'Pending completion'
    return status === 'active' ? 'June 30, 2026' : 'May 31, 2026'
}

export const buildCompliancePassport = (): CompliancePassport => {
    const organization = {
        ...defaultStep1,
        ...readStoredValue<Partial<Step1FormState>>(STEP1_STORAGE_KEY, {})
    }
    const intendedUsage = readStoredValue<string[]>(INTENDED_USAGE_STORAGE_KEY, defaultUsage)
    const participationIntent = readStoredValue<string[]>(PARTICIPATION_INTENT_STORAGE_KEY, defaultParticipationIntent)
    const legalAcknowledgment = {
        ...defaultLegal,
        ...readStoredValue<Partial<LegalAcknowledgment>>(LEGAL_STORAGE_KEY, {})
    }
    const verification = {
        ...defaultVerification,
        ...readStoredValue<Partial<VerificationSnapshot>>(VERIFICATION_STORAGE_KEY, {})
    }
    const commitments = {
        ...defaultCommitments,
        ...readStoredValue<Partial<ComplianceCommitment>>(COMPLIANCE_STORAGE_KEY, {})
    }

    const sections: CompliancePassportSection[] = [
        {
            key: 'identity',
            label: 'Organization identity',
            complete: Boolean(organization.organizationName && organization.officialWorkEmail && organization.country),
            detail: `${organization.organizationName} · ${organization.officialWorkEmail}`
        },
        {
            key: 'usage',
            label: 'Usage declaration',
            complete: intendedUsage.length > 0 && participationIntent.length > 0,
            detail: `${intendedUsage.length} usage scope(s) · ${participationIntent.length} participation path(s)`
        },
        {
            key: 'legal',
            label: 'Legal acknowledgment',
            complete:
                legalAcknowledgment.authorizedRepresentative &&
                legalAcknowledgment.governancePolicyAccepted &&
                legalAcknowledgment.nonRedistributionAcknowledged,
            detail: 'Representative authority, governance, and non-redistribution recorded'
        },
        {
            key: 'verification',
            label: 'Verification evidence',
            complete:
                verification.linkedInConnected &&
                Boolean(verification.affiliationFileName) &&
                Boolean(verification.authorizationFileName),
            detail: verification.linkedInConnected
                ? `${verification.affiliationFileName ?? 'Affiliation file'} · ${verification.authorizationFileName ?? 'Authorization file'}`
                : 'LinkedIn and document verification still required'
        },
        {
            key: 'commitments',
            label: 'Compliance commitments',
            complete:
                commitments.responsibleDataUsage &&
                commitments.noUnauthorizedSharing &&
                commitments.platformCompliancePolicies,
            detail: 'Responsible usage, no unauthorized sharing, and policy compliance committed'
        }
    ]

    const completedSections = sections.filter(section => section.complete).length
    const completionPercent = Math.round((completedSections / sections.length) * 100)
    const status: CompliancePassportStatus =
        completionPercent === 100 ? 'active' : completionPercent >= 60 ? 'review' : 'incomplete'
    const fastTrackEligible = completedSections >= 4
    const preferredOrgType = inferOrgType(organization)
    const defaultDuration = inferDefaultDuration(intendedUsage)
    const preferredAccessMode = inferPreferredAccessMode(intendedUsage, participationIntent)
    const usageSummary = intendedUsage.length > 0 ? intendedUsage.join(', ') : 'No declared usage scopes yet'

    const benefits: CompliancePassportBenefit[] = [
        {
            label: 'One-click request autofill',
            active: completionPercent >= 60,
            detail: 'Apply organization, usage, and compliance context to access requests automatically.'
        },
        {
            label: 'Quote friction reduction',
            active: fastTrackEligible,
            detail: 'Rights-based quotes can reuse your identity, legal, and verification state instead of re-collecting them.'
        },
        {
            label: 'Accelerated reviewer triage',
            active: completedSections === sections.length,
            detail: 'Completed passports can enter a fast-track review lane with fewer manual checks.'
        }
    ]

    return {
        passportId: buildPassportId(organization.organizationName, organization.officialWorkEmail),
        status,
        completionPercent,
        issuedAt: getIssuedAt(),
        validUntil: getValidUntil(status),
        organization,
        intendedUsage,
        participationIntent,
        legalAcknowledgment,
        verification,
        commitments,
        sections,
        benefits,
        fastTrackEligible,
        preferredOrgType,
        defaultDuration,
        preferredAccessMode,
        usageSummary
    }
}

export const buildRequestPrefillFromPassport = (
    passport: CompliancePassport
): CompliancePassportRequestPrefill => ({
    orgType: passport.preferredOrgType,
    affiliation: passport.organization.organizationName,
    intendedUsage: `${passport.usageSummary}. Requested by ${passport.organization.roleInOrganization.toLowerCase()} from ${passport.organization.organizationName}.`,
    duration: passport.defaultDuration,
    usageScale: inferUsageScale(passport.intendedUsage, passport.participationIntent),
    complianceChecked: passport.status === 'active' || passport.status === 'review',
    note:
        passport.status === 'active'
            ? `Reusable Compliance Passport ${passport.passportId} applied. Identity, legal, and verification evidence were reused.`
            : `Compliance Passport ${passport.passportId} provided partial reuse. Finish missing sections to unlock full fast-track treatment.`
})

export const passportStatusMeta = (status: CompliancePassportStatus) => {
    if (status === 'active') {
        return {
            label: 'Active',
            classes: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
            detail: 'Reusable across requests, quotes, and governed checkout.'
        }
    }

    if (status === 'review') {
        return {
            label: 'Review Needed',
            classes: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
            detail: 'Most fields are reusable, but one or more validation sections still need work.'
        }
    }

    return {
        label: 'Incomplete',
        classes: 'border-rose-500/40 bg-rose-500/10 text-rose-200',
        detail: 'Complete the remaining onboarding and compliance sections to unlock reuse.'
    }
}

export const describeAccessMode = (mode: CompliancePassport['preferredAccessMode']) => {
    if (mode === 'metadata') return 'Metadata-first evaluation'
    if (mode === 'clean_room') return 'Secure clean room'
    if (mode === 'clean_room_plus_aggregated') return 'Clean room + aggregated export'
    return 'Encrypted delivery package'
}

export const humanizePassportSectionKey = (value: CompliancePassportSection['key']) =>
    toTitleCase(value)
