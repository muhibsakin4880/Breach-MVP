import type { ReactNode } from 'react'

export type CopyHandler = (id: string, value: string) => void

export function CopyButton({
    label,
    onClick,
    copied
}: {
    label: string
    onClick: () => void
    copied?: boolean
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="rounded-lg border border-cyan-500/30 px-3 py-2 text-xs font-semibold text-cyan-300 transition-all duration-200 hover:bg-cyan-500/20 hover:shadow-[0_0_15px_#00F0FF40]"
        >
            {copied ? 'Copied' : label}
        </button>
    )
}

export function CodeBlock({
    label,
    code,
    onCopy,
    copied
}: {
    label: string
    code: string
    onCopy: () => void
    copied?: boolean
}) {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/80">
            <div className="flex items-center justify-between gap-3 border-b border-slate-700 px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.12em] text-slate-400">{label}</div>
                <CopyButton label="Copy" onClick={onCopy} copied={copied} />
            </div>
            <pre className="overflow-x-auto p-4 text-[12px] leading-relaxed text-slate-200">
                <code>{code}</code>
            </pre>
        </div>
    )
}

export function SurfaceCard({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <div className={`rounded-3xl border border-cyan-500/30 bg-black/70 p-6 shadow-[0_0_20px_#00F0FF20] backdrop-blur-xl ${className}`}>
            {children}
        </div>
    )
}
