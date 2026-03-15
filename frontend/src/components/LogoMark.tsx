type LogoMarkProps = {
    className?: string
}

export default function LogoMark({ className }: LogoMarkProps) {
    return (
        <svg className={className} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
            <defs>
                <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4"/>
                    <stop offset="100%" stopColor="#10b981"/>
                </linearGradient>
            </defs>
            
            <rect width="48" height="48" fill="#010915" rx="8"/>
            
            <path 
                d="M24 4 L42 14 L42 34 L24 44 L6 34 L6 14 Z" 
                stroke="url(#hexGrad)" 
                strokeWidth="2" 
                fill="none"
            />
            <path 
                d="M24 8 L36 15 L36 33 L24 40 L12 33 L12 15 Z" 
                stroke="url(#hexGrad)" 
                strokeWidth="1" 
                fill="rgba(34,211,238,0.1)"
            />
            <circle cx="24" cy="24" r="4" fill="#22d3ee"/>
        </svg>
    )
}
