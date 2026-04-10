import type { DatasetDiscoverySummary } from '../data/datasetCatalogData'
import { getAccessPackageForDataset } from '../data/datasetAccessPackageData'

export type GeoAccessTone = 'healthy' | 'monitoring' | 'scheduled'

export type GeoAccessSignalLabel =
    | 'Geo check requires org profile'
    | 'Eligible from your org location'
    | 'Region-restricted'
    | 'Residency constrained'

export type GeoAccessSignal = {
    label: GeoAccessSignalLabel
    detail: string
    tone: GeoAccessTone
}

export type DatasetGeoAccessOverview = {
    orgCountry: string
    totalDatasetCount: number
    eligibleCount: number
    regionRestrictedCount: number
    residencyConstrainedCount: number
    pendingProfileCount: number
    postureLabel: string
    postureDetail: string
    tone: GeoAccessTone
}

const northAmericaCountries = new Set([
    'united states',
    'united states of america',
    'canada',
    'mexico'
])

const usEuCountries = new Set([
    'united states',
    'united states of america',
    'austria',
    'belgium',
    'bulgaria',
    'croatia',
    'cyprus',
    'czech republic',
    'czechia',
    'denmark',
    'estonia',
    'finland',
    'france',
    'germany',
    'greece',
    'hungary',
    'ireland',
    'italy',
    'latvia',
    'lithuania',
    'luxembourg',
    'malta',
    'netherlands',
    'poland',
    'portugal',
    'romania',
    'slovakia',
    'slovenia',
    'spain',
    'sweden'
])

export const normalizeCountry = (value: string) => value.trim().toLowerCase()

export function getDatasetGeoAccessSignal(datasetId: number | string, buyerOrgCountry: string): GeoAccessSignal {
    const packageGeography = getAccessPackageForDataset(String(datasetId)).geography.label
    const normalizedCountry = normalizeCountry(buyerOrgCountry)

    if (!normalizedCountry) {
        return {
            label: 'Geo check requires org profile',
            detail: `${packageGeography} policy. Add your organization country to evaluate provider residency and regional access fit.`,
            tone: 'scheduled'
        }
    }

    if (packageGeography === 'Global') {
        return {
            label: 'Eligible from your org location',
            detail: `Global package. ${buyerOrgCountry} is eligible to proceed to provider review, subject to final purpose and compliance checks.`,
            tone: 'healthy'
        }
    }

    if (packageGeography === 'North America') {
        return northAmericaCountries.has(normalizedCountry)
            ? {
                label: 'Eligible from your org location',
                detail: `North America package. ${buyerOrgCountry} falls inside the current regional access scope.`,
                tone: 'healthy'
            }
            : {
                label: 'Region-restricted',
                detail: `North America package. ${buyerOrgCountry} sits outside the provider's current regional access scope.`,
                tone: 'monitoring'
            }
    }

    if (packageGeography === 'US / EU venue scope' || packageGeography === 'US / EU utility scope') {
        return usEuCountries.has(normalizedCountry)
            ? {
                label: 'Eligible from your org location',
                detail: `${packageGeography} package. ${buyerOrgCountry} matches the current buyer geography scope.`,
                tone: 'healthy'
            }
            : {
                label: 'Region-restricted',
                detail: `${packageGeography} package. ${buyerOrgCountry} needs manual geography review before access can proceed.`,
                tone: 'monitoring'
            }
    }

    if (packageGeography === 'Residency constrained' || packageGeography === 'Residency reviewed') {
        return {
            label: 'Residency constrained',
            detail: `${packageGeography} package. Provider residency controls and buyer location checks shape final access eligibility for ${buyerOrgCountry}.`,
            tone: 'monitoring'
        }
    }

    return {
        label: 'Region-restricted',
        detail: `${packageGeography} package. Final access depends on matching your organization location to the provider's approved geography.`,
        tone: 'scheduled'
    }
}

export function buildDatasetGeoAccessOverview(
    datasets: Pick<DatasetDiscoverySummary, 'id'>[],
    buyerOrgCountry: string
): DatasetGeoAccessOverview {
    const orgCountry = buyerOrgCountry.trim()
    const totalDatasetCount = datasets.length
    let eligibleCount = 0
    let regionRestrictedCount = 0
    let residencyConstrainedCount = 0
    let pendingProfileCount = 0

    for (const dataset of datasets) {
        const signal = getDatasetGeoAccessSignal(dataset.id, orgCountry)

        switch (signal.label) {
            case 'Eligible from your org location':
                eligibleCount += 1
                break
            case 'Residency constrained':
                residencyConstrainedCount += 1
                break
            case 'Geo check requires org profile':
                pendingProfileCount += 1
                break
            default:
                regionRestrictedCount += 1
                break
        }
    }

    if (totalDatasetCount === 0) {
        return {
            orgCountry,
            totalDatasetCount,
            eligibleCount,
            regionRestrictedCount,
            residencyConstrainedCount,
            pendingProfileCount,
            postureLabel: 'Geo policy signals will appear here',
            postureDetail: 'Once datasets are available, this workspace will summarize how provider geography and residency controls affect your access posture.',
            tone: 'scheduled'
        }
    }

    if (!normalizeCountry(orgCountry)) {
        return {
            orgCountry,
            totalDatasetCount,
            eligibleCount,
            regionRestrictedCount,
            residencyConstrainedCount,
            pendingProfileCount,
            postureLabel: 'Add your organization location',
            postureDetail: `Complete your organization country to activate buyer-specific geo eligibility across ${totalDatasetCount} catalog datasets. Provider geography and residency checks will appear once the profile is complete.`,
            tone: 'monitoring'
        }
    }

    if (residencyConstrainedCount > 0) {
        return {
            orgCountry,
            totalDatasetCount,
            eligibleCount,
            regionRestrictedCount,
            residencyConstrainedCount,
            pendingProfileCount,
            postureLabel: 'Residency and geo controls are active',
            postureDetail: `${eligibleCount} catalog datasets align with ${orgCountry} today. ${residencyConstrainedCount} remain residency-constrained and ${regionRestrictedCount} are still region-restricted until provider policies match your organization location.`,
            tone: 'monitoring'
        }
    }

    if (regionRestrictedCount > 0) {
        return {
            orgCountry,
            totalDatasetCount,
            eligibleCount,
            regionRestrictedCount,
            residencyConstrainedCount,
            pendingProfileCount,
            postureLabel: 'Mixed geo eligibility',
            postureDetail: `${eligibleCount} catalog datasets align with ${orgCountry} today, while ${regionRestrictedCount} still sit outside the current provider geography scope.`,
            tone: 'scheduled'
        }
    }

    return {
        orgCountry,
        totalDatasetCount,
        eligibleCount,
        regionRestrictedCount,
        residencyConstrainedCount,
        pendingProfileCount,
        postureLabel: 'Broadly eligible from your org location',
        postureDetail: `All ${eligibleCount} current catalog datasets pass the first-pass geography check for ${orgCountry}. Final access still depends on purpose, compliance, and provider review.`,
        tone: 'healthy'
    }
}
