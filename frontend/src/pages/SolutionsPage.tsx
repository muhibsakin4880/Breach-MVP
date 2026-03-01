export default function SolutionsPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Solutions for Every Team
                    </h1>
                    <p className="text-xl text-slate-400">
                        Data confidence built for your specific needs
                    </p>
                </div>

                {/* User Segments Grid */}
                <div className="grid md:grid-cols-2 gap-8">

                    {/* Researchers */}
                    <div id="researchers" className="bg-slate-800 rounded-lg p-8 border border-slate-700 hover:border-blue-500 transition-colors">
                        <div className="text-blue-400 text-4xl mb-4">🎓</div>
                        <h2 className="text-2xl font-bold text-white mb-3">Researchers</h2>
                        <p className="text-slate-400 mb-6">
                            Access verified, high-quality datasets for academic and scientific research with built-in citation support.
                        </p>
                        <ul className="space-y-3 mb-6">
                            <li className="flex items-start gap-2 text-slate-300">
                                <span className="text-blue-400 mt-1">✓</span>
                                <span>Institutional verification and credentialing</span>
                            </li>
                            <li className="flex items-start gap-2 text-slate-300">
                                <span className="text-blue-400 mt-1">✓</span>
                                <span>Academic pricing and grants support</span>
                            </li>
                            <li className="flex items-start gap-2 text-slate-300">
                                <span className="text-blue-400 mt-1">✓</span>
                                <span>Citation and attribution tools</span>
                            </li>
                            <li className="flex items-start gap-2 text-slate-300">
                                <span className="text-blue-400 mt-1">✓</span>
                                <span>Collaboration and sharing features</span>
                            </li>
                        </ul>
                        <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                            Learn More
                        </button>
                    </div>

                    {/* AI & ML Teams */}
                    <div id="ai-ml-teams" className="bg-slate-800 rounded-lg p-8 border border-slate-700 hover:border-blue-500 transition-colors">
                        <div className="text-blue-400 text-4xl mb-4">🤖</div>
                        <h2 className="text-2xl font-bold text-white mb-3">AI & ML Teams</h2>
                        <p className="text-slate-400 mb-6">
                            Training data with guaranteed quality, provenance tracking, and bias detection for reliable AI models.
                        </p>
                        <ul className="space-y-3 mb-6">
                            <li className="flex items-start gap-2 text-slate-300">
                                <span className="text-blue-400 mt-1">✓</span>
                                <span>Data quality verification and validation</span>
                            </li>
                            <li className="flex items-start gap-2 text-slate-300">
                                <span className="text-blue-400 mt-1">✓</span>
                                <span>Automated bias and fairness checks</span>
                            </li>
                            <li className="flex items-start gap-2 text-slate-300">
                                <span className="text-blue-400 mt-1">✓</span>
                                <span>Provenance and lineage tracking</span>
                            </li>
                            <li className="flex items-start gap-2 text-slate-300">
                                <span className="text-blue-400 mt-1">✓</span>
                                <span>API access for seamless integration</span>
                            </li>
                        </ul>
                        <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                            Learn More
                        </button>
                    </div>

                    {/* Enterprises */}
                    <div id="enterprises" className="bg-slate-800 rounded-lg p-8 border border-slate-700 hover:border-blue-500 transition-colors">
                        <div className="text-blue-400 text-4xl mb-4">🏢</div>
                        <h2 className="text-2xl font-bold text-white mb-3">Enterprises</h2>
                        <p className="text-slate-400 mb-6">
                            Enterprise-grade data management with compliance, security, and scalability for business-critical applications.
                        </p>
                        <ul className="space-y-3 mb-6">
                            <li className="flex items-start gap-2 text-slate-300">
                                <span className="text-blue-400 mt-1">✓</span>
                                <span>Enterprise security and compliance (SOC 2, GDPR)</span>
                            </li>
                            <li className="flex items-start gap-2 text-slate-300">
                                <span className="text-blue-400 mt-1">✓</span>
                                <span>Custom SLAs and dedicated support</span>
                            </li>
                            <li className="flex items-start gap-2 text-slate-300">
                                <span className="text-blue-400 mt-1">✓</span>
                                <span>On-premise and private cloud deployment</span>
                            </li>
                            <li className="flex items-start gap-2 text-slate-300">
                                <span className="text-blue-400 mt-1">✓</span>
                                <span>Advanced analytics and reporting</span>
                            </li>
                        </ul>
                        <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                            Learn More
                        </button>
                    </div>

                    {/* Participant Contributions */}
                    <div id="data-providers" className="bg-slate-800 rounded-lg p-8 border border-slate-700 hover:border-blue-500 transition-colors">
                        <div className="text-blue-400 text-4xl mb-4">📊</div>
                        <h2 className="text-2xl font-bold text-white mb-3">Contribute Data</h2>
                        <p className="text-slate-400 mb-6">
                            Participants can contribute datasets with built-in quality assurance, licensing controls, and governed delivery—no open marketplace.
                        </p>
                        <ul className="space-y-3 mb-6">
                            <li className="flex items-start gap-2 text-slate-300">
                                <span className="text-blue-400 mt-1">✓</span>
                                <span>Automated quality verification and certification</span>
                            </li>
                            <li className="flex items-start gap-2 text-slate-300">
                                <span className="text-blue-400 mt-1">✓</span>
                                <span>Flexible licensing and delivery controls</span>
                            </li>
                            <li className="flex items-start gap-2 text-slate-300">
                                <span className="text-blue-400 mt-1">✓</span>
                                <span>Usage and integrity analytics</span>
                            </li>
                        </ul>
                        <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                            Learn More
                        </button>
                    </div>

                </div>

                {/* CTA Section */}
                <div className="mt-12 text-center bg-gradient-to-r from-blue-900/50 to-slate-800 rounded-lg p-8 border border-blue-700/50">
                    <h3 className="text-2xl font-bold text-white mb-3">
                        Not sure which solution fits your needs?
                    </h3>
                    <p className="text-slate-300 mb-6">
                        Our team can help you find the right approach for your use case
                    </p>
                    <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                        Contact Sales
                    </button>
                </div>
            </div>
        </div>
    )
}



