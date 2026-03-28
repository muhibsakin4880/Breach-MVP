import { Link, useParams } from 'react-router-dom'

const ContributionStatusDetailsPage = () => {
    const { datasetId } = useParams<'datasetId'>()

    return (
        <section className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <p className="text-sm font-medium uppercase tracking-[0.3em] text-slate-500">
                    Contribution Status
                </p>
                <h1 className="mt-3 text-3xl font-semibold text-slate-900">
                    Detailed contribution tracking is on the way
                </h1>
                <p className="mt-4 max-w-2xl text-base text-slate-600">
                    {datasetId
                        ? `We captured the request for dataset ${datasetId}.`
                        : 'We captured the request for this contribution.'}{' '}
                    The route is now wired correctly, and you can return to the main contributions views while the detailed workflow is finalized.
                </p>
                <Link
                    className="mt-6 inline-flex items-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    to="/contributions"
                >
                    Back to contributions
                </Link>
            </div>
        </section>
    )
}

export default ContributionStatusDetailsPage
