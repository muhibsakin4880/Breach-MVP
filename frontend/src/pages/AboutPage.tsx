export default function AboutPage() {
    return (
        <div className="bg-slate-900 text-white">
            <div className="border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-800">
                <div className="container mx-auto px-4 py-12 md:py-16 space-y-4 max-w-5xl">
                    <h1 className="text-3xl md:text-4xl font-bold">About the Platform</h1>
                    <p className="text-slate-300 text-lg">
                        Redoubt is a high-trust protected evaluation platform for external datasets. It helps identity-verified teams review, validate,
                        and commercialize access under governed controls before production rollout. No open marketplace listing flow - just controlled evaluation, trust, and auditability.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-10 space-y-8 max-w-5xl">
                <section className="space-y-3">
                    <h2 className="text-2xl font-semibold">Security & Confidence</h2>
                    <p className="text-slate-400">
                        Every interaction—requests, protected evaluations, approvals, contributions, and compliance confirmations—is logged and evaluated for trust.
                        Quality checks, policy controls, and audit context keep datasets reviewable before production access is granted.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-2xl font-semibold">How It Works</h2>
                    <ul className="space-y-2 text-slate-300 list-disc pl-5">
                        <li>Teams authenticate, complete onboarding, and review free metadata before commercial steps begin.</li>
                        <li>Buyers move into paid protected evaluation by default, while selected design partners may enter a fee-waived pilot path.</li>
                        <li>Successful evaluations can expand into approved API or production access without losing the trust and audit trail.</li>
                    </ul>
                </section>
            </div>
        </div>
    )
}

