import { Link, useParams } from 'react-router-dom'

type ContributionStatus = 'Needs fixes' | 'Restricted' | 'Rejected'

type ContributionStatusDetail = {
    id: string
    datasetName: string
    status: ContributionStatus
    reasonFeedback: string
    issues: string[]
    statusUpdatedAt: string
}

const statusStyles: Record<ContributionStatus, string> = {
    'Needs fixes': 'border-amber-500/60 bg-amber-500/10 text-amber-200',
    Restricted: 'border-violet-500/60 bg-violet-500/10 text-violet-200',
    Rejected: 'border-rose-500/60 bg-rose-500/10 text-rose-200'
}

const contributionStatusDetails: Record<string, ContributionStatusDetail> = {
    'cn-1002': {
        id: 'cn-1002',
        datasetName: 'Climate Station Metadata Patch',
        status: 'Needs fixes',
        reasonFeedback:
            'Validation found schema and quality issues that must be corrected before this dataset can proceed to approval.',
        issues: [
            'Backfill missing values in station altitude and region fields; null ratio exceeds acceptable threshold.',
            'Normalize `stationCode` type to a single format across all files.',
            'Regenerate and upload a clean schema manifest after corrections.',
            'Re-run quality checks and attach the updated validation report.'
        ],
        statusUpdatedAt: '2026-02-16'
    },
    'cn-1004': {
        id: 'cn-1004',
        datasetName: 'Clinical Outcomes Delta',
        status: 'Restricted',
        reasonFeedback:
            'This dataset contains sensitive healthcare attributes and is limited to approved healthcare workspaces with policy controls.',
        issues: [
            'Allowed: approved internal analytics workspaces with audited access logs.',
            'Allowed: aggregated outputs compliant with healthcare data handling policy.',
            'Not allowed: unrestricted export of row-level records.',
            'Not allowed: sharing with non-approved or external participant workspaces.'
        ],
        statusUpdatedAt: '2026-02-13'
    },
    'cn-1005': {
        id: 'cn-1005',
        datasetName: 'Retail Event Enrichment Feed',
        status: 'Rejected',
        reasonFeedback:
            'Submission was rejected after compliance and data quality review due to blocking format and integrity failures.',
        issues: [
            'Use a single timestamp standard (ISO-8601) across all partitions.',
            'Resolve duplicate primary keys in merged partitions and provide deduplication evidence.',
            'Attach an updated schema contract and consistency validation output.',
            'Reviewer suggestion: run pre-submission lint checks before re-upload.'
        ],
        statusUpdatedAt: '2026-02-11'
    }
}

export default function ContributionStatusDetailsPage() {
    const { datasetId } = useParams()
    const detail = datasetId ? contributionStatusDetails[datasetId] : undefined

    if (!detail) {
        return (
            <div className="container mx-auto px-4 py-10 text-white space-y-4">
                <Link
                    to="/contributions"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 hover:border-blue-500 text-sm font-semibold text-slate-200 hover:text-white transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Contributions
                </Link>
                <section className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 shadow-xl">
                    <h1 className="text-2xl font-semibold">Status Details</h1>
                    <p className="text-slate-400 mt-2">Status details are not available for this contribution.</p>
                </section>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-10 text-white space-y-5">
            <Link
                to="/contributions"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 hover:border-blue-500 text-sm font-semibold text-slate-200 hover:text-white transition-colors"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Contributions
            </Link>

            <section className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-5">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">Status Details</h1>
                        <p className="text-slate-300 mt-1">{detail.datasetName}</p>
                        <p className="text-xs text-slate-400">Dataset ID: {detail.id}</p>
                    </div>
                    <span className={`inline-flex px-4 py-2 rounded-full border text-sm font-semibold ${statusStyles[detail.status]}`}>
                        {detail.status}
                    </span>
                </div>

                <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
                    <h2 className="text-sm uppercase tracking-[0.08em] text-slate-400 mb-2">Reason & Feedback</h2>
                    <p className="text-sm text-slate-200 leading-relaxed">{detail.reasonFeedback}</p>
                </div>

                <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
                    <h2 className="text-sm uppercase tracking-[0.08em] text-slate-400 mb-2">Specific Issues</h2>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-slate-200">
                        {detail.issues.map((issue) => (
                            <li key={issue}>{issue}</li>
                        ))}
                    </ul>
                </div>

                <div className="text-sm text-slate-400">Date of status update: {detail.statusUpdatedAt}</div>
            </section>
        </div>
    )
}
