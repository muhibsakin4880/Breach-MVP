export default function ResearcherAccessPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-4">Researcher Access</h1>
                <p className="text-xl text-slate-400 mb-8">
                    Apply for verified researcher access to our curated datasets
                </p>

                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                        <div className="text-blue-400 text-3xl mb-4">🎓</div>
                        <h3 className="text-xl font-semibold text-white mb-3">Academic Research</h3>
                        <p className="text-slate-400 mb-4">
                            Access high-quality datasets for academic research and publications
                        </p>
                        <ul className="text-slate-400 text-sm space-y-2">
                            <li>✓ Verified institutional affiliation</li>
                            <li>✓ Enhanced data access</li>
                            <li>✓ Citation support</li>
                        </ul>
                    </div>

                    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                        <div className="text-blue-400 text-3xl mb-4">🔬</div>
                        <h3 className="text-xl font-semibold text-white mb-3">Industry Research</h3>
                        <p className="text-slate-400 mb-4">
                            Enterprise-grade access for commercial research and analysis
                        </p>
                        <ul className="text-slate-400 text-sm space-y-2">
                            <li>✓ Commercial licensing</li>
                            <li>✓ Priority support</li>
                            <li>✓ Custom data requests</li>
                        </ul>
                    </div>
                </div>

                <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
                    <h2 className="text-2xl font-semibold text-white mb-6">Application Process</h2>

                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                1
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-white mb-2">Submit Application</h4>
                                <p className="text-slate-400 text-sm">
                                    Complete the researcher verification form with your credentials and research proposal
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                2
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-white mb-2">Verification Review</h4>
                                <p className="text-slate-400 text-sm">
                                    Our team reviews your credentials and validates your institutional affiliation
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                3
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-white mb-2">Get Access</h4>
                                <p className="text-slate-400 text-sm">
                                    Upon approval, gain immediate access to verified researcher features and datasets
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                            Apply for Researcher Access
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
