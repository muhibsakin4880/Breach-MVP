export default function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-slate-900 border-t border-slate-800">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
                    <div className="text-center md:text-left">
                        <h3 className="text-white font-bold text-lg mb-2">Data Confidence Layer</h3>
                        <p className="text-slate-400 text-sm">
                            A trusted platform for data verification, research access, and dataset management with built-in quality assurance.
                        </p>
                    </div>

                    <div className="text-center md:text-left">
                        <h4 className="text-white font-semibold text-sm mb-3">Quick Links</h4>
                        <div className="flex flex-col gap-2">
                            <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">
                                About Us
                            </a>
                            <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">
                                Documentation
                            </a>
                            <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">
                                API Reference
                            </a>
                        </div>
                    </div>

                    <div className="text-center md:text-left">
                        <h4 className="text-white font-semibold text-sm mb-3">Legal</h4>
                        <div className="flex flex-col gap-2">
                            <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">
                                Privacy Policy
                            </a>
                            <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">
                                Terms of Service
                            </a>
                            <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">
                                Contact
                            </a>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-800 text-center">
                    <p className="text-slate-400 text-sm">
                        © {currentYear} Data Confidence Layer. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}
