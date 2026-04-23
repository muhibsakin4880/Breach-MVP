import type { ApprovalSignoff } from '../../domain/approvalArtifact'

const toneClasses = {
    slate: 'border-white/12 bg-white/5 text-slate-200',
    cyan: 'border-cyan-400/30 bg-cyan-500/10 text-cyan-100',
    amber: 'border-amber-400/30 bg-amber-500/10 text-amber-100',
    emerald: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100',
    rose: 'border-rose-400/30 bg-rose-500/10 text-rose-100'
} as const

export default function DealApprovalMatrix({
    signoffs
}: {
    signoffs: ApprovalSignoff[]
}) {
    if (signoffs.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-white/12 bg-slate-950/35 px-4 py-5 text-sm leading-6 text-slate-400">
                No approval lanes are linked to this dossier yet.
            </div>
        )
    }

    return (
        <div className="overflow-x-auto rounded-2xl border border-white/8 bg-slate-950/35">
            <table className="min-w-[920px] w-full divide-y divide-white/8 text-sm">
                <thead className="bg-white/[0.03] text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    <tr>
                        <th className="px-4 py-3">Lane</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Owner</th>
                        <th className="px-4 py-3">Updated</th>
                        <th className="px-4 py-3">Rationale / Note</th>
                        <th className="px-4 py-3">Blocker</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/6">
                    {signoffs.map(signoff => (
                        <tr key={signoff.key} className="align-top">
                            <td className="px-4 py-4">
                                <div className="font-semibold text-white">
                                    {signoff.label.replace(/ signoff$/i, '')}
                                </div>
                                <div className="mt-1 text-xs text-slate-500">
                                    {signoff.evidence[0] ?? 'No evidence anchor'}
                                </div>
                            </td>
                            <td className="px-4 py-4">
                                <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold ${toneClasses[signoff.tone]}`}>
                                    {signoff.status}
                                </span>
                            </td>
                            <td className="px-4 py-4 text-slate-200">{signoff.owner}</td>
                            <td className="px-4 py-4 text-slate-300">{signoff.timestamp}</td>
                            <td className="px-4 py-4 leading-6 text-slate-300">
                                {signoff.rationale}
                            </td>
                            <td className="px-4 py-4 leading-6 text-slate-300">
                                {signoff.blockers.length > 0
                                    ? signoff.blockers.slice(0, 2).join(' · ')
                                    : 'No blocker attached'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
