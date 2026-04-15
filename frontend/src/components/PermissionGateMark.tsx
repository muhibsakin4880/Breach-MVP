import { useId } from 'react'

type PermissionGateMarkProps = {
    className?: string
}

const outerRingArcs = [
    [10, 110],
    [130, 230],
    [250, 350]
] as const

const innerRingArcs = [
    [30, 165],
    [210, 345]
] as const

const outerGateAngles = [0, 120, 240] as const
const innerGateAngles = [15, 195] as const

function pointOnCircle(cx: number, cy: number, radius: number, degrees: number) {
    const radians = degrees * Math.PI / 180
    return {
        x: cx + radius * Math.sin(radians),
        y: cy - radius * Math.cos(radians)
    }
}

function buildArcPath(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
    const start = pointOnCircle(cx, cy, radius, startAngle)
    const end = pointOnCircle(cx, cy, radius, endAngle)
    const isLargeArc = endAngle - startAngle > 180 ? 1 : 0

    return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${radius} ${radius} 0 ${isLargeArc} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`
}

export default function PermissionGateMark({ className }: PermissionGateMarkProps) {
    const uniqueId = useId().replace(/:/g, '')
    const glowId = `permission-gate-mark-glow-${uniqueId}`
    const discId = `permission-gate-mark-disc-${uniqueId}`
    const coreId = `permission-gate-mark-core-${uniqueId}`

    return (
        <svg className={className} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
            <defs>
                <radialGradient id={discId} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#0c1e3e" stopOpacity="0.96" />
                    <stop offset="100%" stopColor="#030c1e" stopOpacity="0.9" />
                </radialGradient>
                <radialGradient id={coreId} cx="40%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="60%" stopColor="#00e5ff" />
                    <stop offset="100%" stopColor="#0077b6" />
                </radialGradient>
                <filter id={glowId} x="-60%" y="-60%" width="220%" height="220%">
                    <feGaussianBlur stdDeviation="1.2" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            <circle cx="24" cy="24" r="21" fill="#00e5ff" opacity="0.08" />
            <circle cx="24" cy="24" r="18.5" fill={`url(#${discId})`} stroke="#12385a" strokeWidth="1" />
            <circle cx="24" cy="24" r="16.5" fill="none" stroke="#143a5a" strokeWidth="0.8" opacity="0.8" />

            {outerRingArcs.map(([startAngle, endAngle]) => (
                <path
                    key={`outer-${startAngle}-${endAngle}`}
                    d={buildArcPath(24, 24, 14.5, startAngle, endAngle)}
                    fill="none"
                    stroke="#00e5ff"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    opacity="0.92"
                    filter={`url(#${glowId})`}
                />
            ))}

            {innerRingArcs.map(([startAngle, endAngle]) => (
                <path
                    key={`inner-${startAngle}-${endAngle}`}
                    d={buildArcPath(24, 24, 10.5, startAngle, endAngle)}
                    fill="none"
                    stroke="#67e8f9"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    opacity="0.78"
                    filter={`url(#${glowId})`}
                />
            ))}

            {outerGateAngles.map(angle => {
                const { x, y } = pointOnCircle(24, 24, 14.5, angle)
                return (
                    <circle
                        key={`outer-gate-${angle}`}
                        cx={x}
                        cy={y}
                        r="1.5"
                        fill="#a5f3fc"
                        opacity="0.95"
                        filter={`url(#${glowId})`}
                    />
                )
            })}

            {innerGateAngles.map(angle => {
                const { x, y } = pointOnCircle(24, 24, 10.5, angle)
                return (
                    <circle
                        key={`inner-gate-${angle}`}
                        cx={x}
                        cy={y}
                        r="1.2"
                        fill="#67e8f9"
                        opacity="0.85"
                        filter={`url(#${glowId})`}
                    />
                )
            })}

            <circle cx="24" cy="24" r="6.5" fill={`url(#${coreId})`} opacity="0.22" />
            <circle cx="24" cy="24" r="4.8" fill="none" stroke="#9aeffb" strokeWidth="0.9" opacity="0.9" />
            <circle cx="24" cy="24" r="2.2" fill="#ecfeff" filter={`url(#${glowId})`} />
        </svg>
    )
}
