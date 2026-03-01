import { Link } from 'react-router-dom'
import { useState } from 'react'

type NavItem = { label: string; to: string; primary?: boolean }

const publicNav: NavItem[] = [
    { label: 'Home', to: '/' },
    { label: 'Platform Overview', to: '/about' },
    { label: 'Solutions', to: '/solutions' },
    { label: 'Sign In', to: '/login' }
]

export default function Header() {
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    const renderLinks = (isMobile = false) => (
        <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center gap-4 md:gap-6'}`}>
            {publicNav.map(item => {
                const classes = item.primary
                    ? 'px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm md:text-base font-medium rounded-lg transition-colors text-center'
                    : 'text-sm md:text-base text-slate-300 hover:text-white transition-colors'

                return (
                    <Link key={`${item.label}-${item.to}`} to={item.to} className={classes} onClick={() => setIsMobileOpen(false)}>
                        {item.label}
                    </Link>
                )
            })}
        </div>
    )

    return (
        <header className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700">
            <nav className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <Link to="/" className="text-xl md:text-2xl font-bold text-white hover:text-blue-400 transition-colors">
                        Breach
                        <span className="block text-xs text-slate-400 font-normal">Data Confidence & Security Infrastructure Layer</span>
                    </Link>

                    <div className="flex items-center gap-3 md:hidden">
                        <button
                            className="text-slate-200"
                            onClick={() => setIsMobileOpen(prev => !prev)}
                            aria-label="Toggle navigation"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        {renderLinks(false)}
                    </div>
                </div>

                {isMobileOpen && (
                    <div className="md:hidden mt-4 border-t border-slate-800 pt-4">
                        {renderLinks(true)}
                    </div>
                )}
            </nav>
        </header>
    )
}
