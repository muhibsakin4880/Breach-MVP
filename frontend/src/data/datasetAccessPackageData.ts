export type AccessPackageFacet = {
    label: string
    buyerSummary?: string
    providerSummary?: string
}

export type DatasetAccessPackage = {
    id: string
    accessMethod: AccessPackageFacet
    deliveryDetail: AccessPackageFacet
    fieldAccess: AccessPackageFacet
    usageRights: AccessPackageFacet
    term: AccessPackageFacet
    geography: AccessPackageFacet
    exclusivity: AccessPackageFacet
    security: {
        encryption: string
        masking: string
        watermarking: string
        revocation: string
    }
    advancedRights: {
        auditLogging: string
        attribution: string
        redistribution: string
        volumePricing: string
    }
}

const ACCESS_PACKAGES: Record<string, DatasetAccessPackage> = {
    'platform-clean-room-standard': {
        id: 'platform-clean-room-standard',
        accessMethod: {
            label: 'Platform Only',
            buyerSummary: 'Governed workspace access only for approved buyers.',
            providerSummary: 'Approved buyers are confined to a governed Redoubt workspace.'
        },
        deliveryDetail: {
            label: 'Secure clean room',
            buyerSummary: 'Delivery is configured as a secure clean-room session with no open export path.',
            providerSummary: 'Delivery remains limited to secure clean-room sessions.'
        },
        fieldAccess: {
            label: 'Analytics pack'
        },
        usageRights: {
            label: 'Research use'
        },
        term: {
            label: '12 months'
        },
        geography: {
            label: 'Dual region'
        },
        exclusivity: {
            label: 'Non-exclusive'
        },
        security: {
            encryption: 'AES-256 at rest + TLS 1.3 in transit',
            masking: 'Automatic PII masking',
            watermarking: 'Invisible watermarking enabled on approved extracts',
            revocation: 'Provider can revoke access at any time'
        },
        advancedRights: {
            auditLogging: 'Mandatory',
            attribution: 'Required',
            redistribution: 'Not Allowed',
            volumePricing: 'Disabled'
        }
    }
}

const DATASET_ACCESS_PACKAGE_BY_ID: Record<string, string> = {
    '1': 'platform-clean-room-standard'
}

const CONTRIBUTION_ACCESS_PACKAGE_BY_ID: Record<string, string> = {
    'cn-1003': 'platform-clean-room-standard'
}

const DEFAULT_ACCESS_PACKAGE = ACCESS_PACKAGES['platform-clean-room-standard']

export function getAccessPackageForDataset(datasetId: string) {
    return ACCESS_PACKAGES[DATASET_ACCESS_PACKAGE_BY_ID[datasetId] ?? DEFAULT_ACCESS_PACKAGE.id] ?? DEFAULT_ACCESS_PACKAGE
}

export function getAccessPackageForContribution(contributionId?: string) {
    if (!contributionId) return DEFAULT_ACCESS_PACKAGE
    return ACCESS_PACKAGES[CONTRIBUTION_ACCESS_PACKAGE_BY_ID[contributionId] ?? DEFAULT_ACCESS_PACKAGE.id] ?? DEFAULT_ACCESS_PACKAGE
}
