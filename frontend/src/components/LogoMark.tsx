type LogoMarkProps = {
    className?: string
}

const AZURE = '#1E6CFF'
const OBSIDIAN = '#0B0F14'

export default function LogoMark({ className }: LogoMarkProps) {
    return (
        <svg className={className} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
            <rect width="48" height="48" fill={OBSIDIAN} />
            <g fill={AZURE}>
                <rect x="8" y="6" width="10" height="36" />
                <path d="M18 6H38L40 8V22H18V6Z" />
                <polygon points="18 22 38 42 26 42 18 34" />
            </g>
            <rect x="25" y="10" width="8" height="8" fill={OBSIDIAN} />
        </svg>
    )
}
