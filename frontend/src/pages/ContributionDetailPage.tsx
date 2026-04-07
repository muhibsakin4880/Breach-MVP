import { Link, useParams } from 'react-router-dom'
import { getAccessPackageForContribution } from '../data/datasetAccessPackageData'

type BuyerActivity = {
    id: string
    date: string
    amount: string
    status: 'Active' | 'Expired'
}

type ContributionDetailRecord = {
    id: string
    title: string
    submissionId: string
    datasetId: string
    status: 'Approved' | 'Restricted' | 'Rejected' | 'Needs fixes' | 'Processing'
    metrics: {
        totalRequests: number
        approvedAccess: number
        revenueEarned: string
        reliabilityScore: string
    }
    buyerActivity: BuyerActivity[]
}

type SummaryItem = {
    label: string
    value: string
}

const CONTRIBUTION_DETAIL_RECORDS: Record<string, ContributionDetailRecord> = {
    'cn-1003': {
        id: 'cn-1003',
        title: 'Financial Tick Delta Batch',
        submissionId: 'BRE-DS-2026-1003',
        datasetId: 'ds_finance_2026_a8f3k2',
        status: 'Approved',
        metrics: {
            totalRequests: 42,
            approvedAccess: 28,
            revenueEarned: '$2,240',
            reliabilityScore: '94%'
        },
        buyerActivity: [
            { id: 'buyer_anon_001', date: '2026-02-20', amount: '$299', status: 'Active' },
            { id: 'buyer_anon_002', date: '2026-02-18', amount: '$299', status: 'Active' },
            { id: 'buyer_anon_003', date: '2026-02-15', amount: '$299', status: 'Expired' }
        ]
    }
}

const DEFAULT_CONTRIBUTION = CONTRIBUTION_DETAIL_RECORDS['cn-1003']

export default function ContributionDetailPage() {
    const { id } = useParams<{ id: string }>()
    const contribution = (id && CONTRIBUTION_DETAIL_RECORDS[id]) || DEFAULT_CONTRIBUTION
    const accessPackage = getAccessPackageForContribution(contribution.id)
    const submissionTerms: SummaryItem[] = [
        { label: 'Access method', value: accessPackage.accessMethod.label },
        { label: 'Delivery detail', value: accessPackage.deliveryDetail.label },
        { label: 'Field access', value: accessPackage.fieldAccess.label },
        { label: 'Usage rights', value: accessPackage.usageRights.label },
        { label: 'Term', value: accessPackage.term.label },
        { label: 'Geography', value: accessPackage.geography.label },
        { label: 'Exclusivity', value: accessPackage.exclusivity.label }
    ]
    const securityControls: SummaryItem[] = [
        { label: 'Encryption', value: accessPackage.security.encryption },
        { label: 'Masking', value: accessPackage.security.masking },
        { label: 'Watermarking', value: accessPackage.security.watermarking },
        { label: 'Revocation rights', value: accessPackage.security.revocation }
    ]
    const advancedRights: SummaryItem[] = [
        { label: 'Audit logging', value: accessPackage.advancedRights.auditLogging },
        { label: 'Attribution', value: accessPackage.advancedRights.attribution },
        { label: 'Redistribution', value: accessPackage.advancedRights.redistribution },
        { label: 'Volume pricing', value: accessPackage.advancedRights.volumePricing }
    ]
    const providerPackageOverview = [
        accessPackage.accessMethod.providerSummary,
        accessPackage.deliveryDetail.providerSummary
    ].filter(Boolean).join(' ')

    return (
        <div data-contribution-id={contribution.id} className="container mx-auto space-y-8 px-4 py-10 text-white">
            <Link
                to="/contributions"
                className="inline-flex items-center text-sm text-slate-400 transition-colors hover:text-white"
            >
                <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Contributions
            </Link>

            <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-6 shadow-xl">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{contribution.title}</h1>
                        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                            <div>
                                <span className="text-slate-400">Submission ID: </span>
                                <span className="text-slate-200">{contribution.submissionId}</span>
                            </div>
                            <div>
                                <span className="text-slate-400">Dataset ID: </span>
                                <span className="text-slate-200">{contribution.datasetId}</span>
                            </div>
                        </div>
                    </div>
                    <span className="inline-flex whitespace-nowrap rounded-full border border-emerald-500/60 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200">
                        {contribution.status}
                    </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <MetricCard label="Total Requests" value={String(contribution.metrics.totalRequests)} />
                    <MetricCard label="Approved Access" value={String(contribution.metrics.approvedAccess)} valueClassName="text-emerald-200" />
                    <MetricCard label="Revenue Earned" value={contribution.metrics.revenueEarned} valueClassName="text-emerald-200" />
                    <MetricCard label="Reliability Score" value={contribution.metrics.reliabilityScore} valueClassName="text-cyan-200" />
                </div>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-6 shadow-xl">
                <div className="max-w-3xl">
                    <div className="text-xs uppercase tracking-[0.18em] text-cyan-200/80">Submission Package</div>
                    <h2 className="mt-2 text-xl font-semibold">Current Access, Security, And Governance Terms</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                        Review the approved buyer package attached to this submission. Marketplace-facing access terms stay aligned with the
                        same mock controls shown in the onboarding flow.
                    </p>
                </div>

                <div className="mt-6 grid gap-4 xl:grid-cols-3">
                    <ContributionSummaryCard
                        eyebrow="Access"
                        title="Submission Terms"
                        description={providerPackageOverview}
                        items={submissionTerms}
                        eyebrowClassName="text-cyan-200/80"
                    />
                    <ContributionSummaryCard
                        eyebrow="Security"
                        title="Security Controls"
                        description="Encryption, masking, watermarking, and revocation settings currently applied to approved buyer sessions."
                        items={securityControls}
                        eyebrowClassName="text-emerald-200/80"
                    />
                    <ContributionSummaryCard
                        eyebrow="Governance"
                        title="Advanced Rights"
                        description="Commercial governance controls that accompany the approved access package for this submission."
                        items={advancedRights}
                        eyebrowClassName="text-amber-200/80"
                    />
                </div>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-6 shadow-xl">
                <h2 className="mb-4 text-xl font-semibold">Recent Buyer Activity</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="border-b border-slate-700 text-xs uppercase tracking-[0.08em] text-slate-400">
                            <tr>
                                <th className="py-3 pr-4 text-left font-medium">Buyer ID</th>
                                <th className="px-4 py-3 text-left font-medium">Access Date</th>
                                <th className="px-4 py-3 text-left font-medium">Amount Paid</th>
                                <th className="pl-4 py-3 text-left font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {contribution.buyerActivity.map(buyer => (
                                <tr key={buyer.id} className="transition-colors hover:bg-slate-800/60">
                                    <td className="py-3 pr-4 text-slate-200">{buyer.id}</td>
                                    <td className="px-4 py-3 text-slate-300">{buyer.date}</td>
                                    <td className="px-4 py-3 text-slate-300">{buyer.amount}</td>
                                    <td className="pl-4 py-3">
                                        <span
                                            className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${
                                                buyer.status === 'Active'
                                                    ? 'border border-emerald-500/60 bg-emerald-500/10 text-emerald-200'
                                                    : 'border border-slate-600 bg-slate-800 text-slate-400'
                                            }`}
                                        >
                                            {buyer.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

function MetricCard({
    label,
    value,
    valueClassName = ''
}: {
    label: string
    value: string
    valueClassName?: string
}) {
    return (
        <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-4">
            <div className="text-xs uppercase tracking-[0.12em] text-slate-400">{label}</div>
            <div className={`mt-1 text-3xl font-semibold ${valueClassName}`.trim()}>{value}</div>
        </div>
    )
}

function ContributionSummaryCard({
    eyebrow,
    title,
    description,
    items,
    eyebrowClassName
}: {
    eyebrow: string
    title: string
    description: string
    items: SummaryItem[]
    eyebrowClassName: string
}) {
    return (
        <div className="rounded-2xl border border-slate-700/80 bg-slate-950/45 p-5">
            <div className={`text-[11px] uppercase tracking-[0.18em] ${eyebrowClassName}`}>{eyebrow}</div>
            <h3 className="mt-2 text-lg font-semibold text-white">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
            <div className="mt-5 grid gap-3">
                {items.map(item => (
                    <div key={item.label} className="rounded-xl border border-white/8 bg-slate-900/70 px-4 py-3">
                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{item.label}</div>
                        <div className="mt-2 text-sm font-medium text-slate-100">{item.value}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}
