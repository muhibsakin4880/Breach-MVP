import { Link } from 'react-router-dom'

export default function NotFoundPage() {
    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-md mx-auto text-center">
                <h1 className="text-6xl font-bold text-white mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-slate-300 mb-4">Page Not Found</h2>
                <p className="text-slate-400 mb-8">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <Link
                    to="/"
                    className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                    Go Home
                </Link>
            </div>
        </div>
    )
}
