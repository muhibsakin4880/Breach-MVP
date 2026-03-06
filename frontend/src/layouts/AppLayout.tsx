import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

type WorkspaceItem = {
    label: string
    to: string
}

const workspaceNav: WorkspaceItem[] = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Datasets', to: '/datasets' },
    { label: 'Access Requests', to: '/access-requests' },
    { label: 'Trust Profile', to: '/trust-profile' },
    { label: 'Contributions', to: '/contributions' },
    { label: 'Pipelines', to: '/pipelines' },
    { label: 'Profile / Settings', to: '/profile' }
]

export default function AppLayout() {
    const navigate = useNavigate()
    const { signOut } = useAuth()

    const handleSignOut = () => {
        signOut()
        navigate('/', { replace: true })
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white flex">
            <aside className="hidden md:flex md:w-64 flex-col border-r border-slate-800 bg-slate-950/80">
                <div className="px-5 py-5 border-b border-slate-800">
                    <Link to="/dashboard" className="text-xl font-bold text-white hover:text-blue-300 transition-colors">
                        Breach Workspace
                    </Link>
                    <p className="text-xs text-slate-400 mt-1">Participant Console</p>
                </div>
                <nav className="p-4 space-y-1">
                    {workspaceNav.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `block px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                                    isActive
                                        ? 'bg-blue-600/30 border border-blue-500/60 text-blue-100 shadow-[0_0_20px_rgba(37,99,235,0.2)]'
                                        : 'text-slate-400 border border-transparent hover:border-slate-700/50 hover:text-white hover:bg-slate-800/50'
                                }`
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
            </aside>

            <div className="flex-1 min-w-0">
                <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur">
                    <div className="h-full px-4 md:px-6 flex items-center justify-between">
                        <div className="md:hidden">
                            <Link to="/dashboard" className="text-sm font-semibold text-slate-100">
                                Workspace
                            </Link>
                        </div>
                        <div className="hidden md:block text-sm text-slate-400">Participant workspace</div>
                        <div className="flex items-center gap-3">
                            <button className="relative p-2 rounded-lg border border-slate-700 text-slate-200 hover:text-white hover:border-blue-500 transition-colors" aria-label="Notifications">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .53-.21 1.04-.59 1.42L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400" />
                            </button>
                            <div className="text-right leading-tight">
                                <div className="text-sm font-semibold text-white">Participant</div>
                                <div className="text-xs text-slate-400">Verified session</div>
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="px-3 py-2 rounded-lg border border-slate-700 hover:border-rose-500 text-sm text-slate-200 hover:text-white transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </header>

                <main className="min-h-[calc(100vh-4rem)]">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
