import { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
    buildCompliancePassport,
    describeAccessMode,
    humanizePassportSectionKey,
    passportStatusMeta
} from '../domain/compliancePassport'

const panelClass =
    'rounded-3xl border border-white/10 bg-[#0a1526]/85 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl'
const insetCardClass = 'rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-3'
const eyebrowClass = 'text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500'

const orgTypeLabel: Record<string, string> = {
    research: 'Research / Lab',
    enterprise: 'Enterprise',
    startup: 'Startup',
    public: 'Public sector',
    other: 'Other'
}

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
    return (
        <div className={insetCardClass}>
            <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
            <div className={`mt-1.5 text-sm ${mono ? 'font-mono' : 'font-medium'} text-slate-100 break-words`}>{value}</div>
        </div>
    )
}

function SectionStatusBadge({ complete }: { complete: boolean }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                complete
                    ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-100'
                    : 'border-amber-500/35 bg-amber-500/10 text-amber-100'
            }`}
        >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {complete ? 'Complete' : 'In progress'}
        </span>
    )
}

export default function CompliancePassportPage() {
    const location = useLocation()
    const useDemo = location.pathname.startsWith('/demo/')
    const passport = useMemo(() => buildCompliancePassport(), [])
    const meta = passportStatusMeta(passport.status)

    const rightsQuotePath = useDemo ? '/demo/datasets' : '/datasets'
    const accessRequestsPath = useDemo ? '/demo/access-requests' : '/access-requests'
    const trustProfilePath = useDemo ? '/demo/trust-profile' : '/trust-profile'

    const verificationItems = [
        { label: 'LinkedIn linked', complete: passport.verification.linkedInConnected },
        { label: 'Domain verified', complete: passport.verification.domainVerified },
        { label: 'Affiliation document', complete: Boolean(passport.verification.affiliationFileName) },
        { label: 'Authorization document', complete: Boolean(passport.verification.authorizationFileName) }
    ]

    const legalItems = [
        { label: 'Authorized representative', complete: passport.legalAcknowledgment.authorizedRepresentative },
        { label: 'Governance policy accepted', complete: passport.legalAcknowledgment.governancePolicyAccepted },
        { label: 'Non-redistribution acknowledged', complete: passport.legalAcknowledgment.nonRedistributionAcknowledged }
    ]

    const commitmentItems = [
        { label: 'Responsible data usage', complete: passport.commitments.responsibleDataUsage },
        { label: 'No unauthorized sharing', complete: passport.commitments.noUnauthorizedSharing },
        { label: 'Platform compliance policies', complete: passport.commitments.platformCompliancePolicies }
    ]

    return (
        <div className="relative min-h-screen bg-[#030814] text-white">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(34,211,238,0.08),transparent_35%),radial-gradient(circle_at_85%_5%,rgba(16,185,129,0.07),transparent_32%),radial-gradient(circle_at_50%_92%,rgba(59,130,246,0.06),transparent_38%)]" />

            <div className="relative mx-auto max-w-[1280px] px-4 py-8 sm:px-8 sm:py-10 lg:px-12">
                <header className={`${panelClass} mb-6`}>
                    <nav className="flex items-center gap-2 text-sm text-slate-400">
                        <Link to={useDemo ? '/demo' : '/dashboard'} className="hover:text-white">
                            Console
                        </Link>
                        <span className="text-slate-600">/</span>
                        <span className="text-slate-200">Compliance Passport</span>
                    </nav>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                        <div className={eyebrowClass}>Reusable Trust · Read-only Snapshot</div>
                        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold ${meta.classes}`}>
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {meta.label}
                        </span>
                        {passport.fastTrackEligible && (
                            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/35 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold text-cyan-100">
                                Fast-track eligible
                            </span>
                        )}
                    </div>

                    <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">Compliance Passport</h1>

                    <p className="mt-3 max-w-2xl text-base leading-7 text-slate-400">{meta.detail}</p>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <InfoRow label="Passport ID" value={passport.passportId} mono />
                        <InfoRow label="Issued" value={passport.issuedAt} />
                        <InfoRow label="Valid until" value={passport.validUntil} />
                        <InfoRow label="Completion" value={`${passport.completionPercent}%`} />
                    </div>

                    <div className="mt-4">
                        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400 transition-all"
                                style={{ width: `${passport.completionPercent}%` }}
                            />
                        </div>
                    </div>
                </header>

                <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
                    <div className="min-w-0 space-y-6">
                        <section className={panelClass}>
                            <div className={eyebrowClass}>Organization Identity</div>
                            <h2 className="mt-2 text-xl font-semibold text-white">{passport.organization.organizationName}</h2>
                            <p className="mt-2 text-sm text-slate-400">{passport.organization.officialWorkEmail}</p>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                <InfoRow label="Primary contact" value={passport.organization.primaryContactName} />
                                <InfoRow label="Role" value={passport.organization.roleInOrganization} />
                                <InfoRow label="Industry" value={passport.organization.industryDomain} />
                                <InfoRow label="Country" value={passport.organization.country} />
                                {passport.organization.organizationWebsite && (
                                    <InfoRow label="Website" value={passport.organization.organizationWebsite} />
                                )}
                                {passport.organization.inviteCode && (
                                    <InfoRow label="Invite code" value={passport.organization.inviteCode} mono />
                                )}
                            </div>
                        </section>

                        <section className={panelClass}>
                            <div className={eyebrowClass}>Declared Usage</div>
                            <h2 className="mt-2 text-xl font-semibold text-white">Usage Summary</h2>
                            <p className="mt-2 text-sm leading-6 text-slate-300">{passport.useCaseSummary}</p>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                <InfoRow label="Org type" value={orgTypeLabel[passport.preferredOrgType] ?? passport.preferredOrgType} />
                                <InfoRow label="Preferred access mode" value={describeAccessMode(passport.preferredAccessMode)} />
                                <InfoRow label="Default duration" value={passport.defaultDuration} />
                                <InfoRow label="Usage scopes" value={passport.usageSummary} />
                                <InfoRow
                                    label="Participation intent"
                                    value={
                                        passport.participationIntent.length > 0
                                            ? passport.participationIntent.join(', ')
                                            : 'No intent declared'
                                    }
                                />
                            </div>
                        </section>

                        <section className={panelClass}>
                            <div className={eyebrowClass}>Completion Checklist</div>
                            <h2 className="mt-2 text-xl font-semibold text-white">Sections</h2>

                            <ul className="mt-4 space-y-3">
                                {passport.sections.map(section => (
                                    <li key={section.key} className={insetCardClass}>
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                                                    {humanizePassportSectionKey(section.key)}
                                                </div>
                                                <div className="mt-1 text-sm font-semibold text-white">{section.label}</div>
                                                <p className="mt-1 text-xs leading-5 text-slate-400">{section.detail}</p>
                                            </div>
                                            <SectionStatusBadge complete={section.complete} />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        <section className={panelClass}>
                            <div className={eyebrowClass}>Verification Evidence</div>
                            <h2 className="mt-2 text-xl font-semibold text-white">Identity & Document Checks</h2>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                {verificationItems.map(item => (
                                    <div key={item.label} className={`${insetCardClass} flex items-center justify-between gap-3`}>
                                        <span className="text-sm text-slate-200">{item.label}</span>
                                        <SectionStatusBadge complete={item.complete} />
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                <InfoRow label="Authentication" value={passport.verification.authenticationMethod || 'Not configured'} />
                                <InfoRow label="Corporate domain" value={passport.verification.corporateDomain || 'Not provided'} />
                                <InfoRow label="Node ID" value={passport.verification.nodeId || 'Not provisioned'} mono />
                            </div>
                        </section>

                        <section className={panelClass}>
                            <div className={eyebrowClass}>Legal Acknowledgment</div>
                            <h2 className="mt-2 text-xl font-semibold text-white">Authority & Governance</h2>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                {legalItems.map(item => (
                                    <div key={item.label} className={`${insetCardClass} flex items-center justify-between gap-3`}>
                                        <span className="text-sm text-slate-200">{item.label}</span>
                                        <SectionStatusBadge complete={item.complete} />
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className={panelClass}>
                            <div className={eyebrowClass}>Compliance Commitments</div>
                            <h2 className="mt-2 text-xl font-semibold text-white">Ongoing Obligations</h2>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                {commitmentItems.map(item => (
                                    <div key={item.label} className={`${insetCardClass} flex items-center justify-between gap-3`}>
                                        <span className="text-sm text-slate-200">{item.label}</span>
                                        <SectionStatusBadge complete={item.complete} />
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
                        <div className={panelClass}>
                            <div className={eyebrowClass}>Reuse Benefits</div>
                            <ul className="mt-3 space-y-3">
                                {passport.benefits.map(benefit => (
                                    <li key={benefit.label} className={insetCardClass}>
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="text-sm font-semibold text-white">{benefit.label}</div>
                                                <p className="mt-1 text-xs leading-5 text-slate-400">{benefit.detail}</p>
                                            </div>
                                            <span
                                                className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                                                    benefit.active
                                                        ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-100'
                                                        : 'border-slate-600/50 bg-slate-800/50 text-slate-300'
                                                }`}
                                            >
                                                {benefit.active ? 'Active' : 'Locked'}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className={panelClass}>
                            <div className={eyebrowClass}>Where this passport applies</div>
                            <div className="mt-3 grid gap-2">
                                <Link
                                    to={rightsQuotePath}
                                    className="rounded-xl border border-white/12 px-4 py-2.5 text-center text-sm font-semibold text-slate-200 hover:border-cyan-400/40 hover:text-white"
                                >
                                    Build Rights Quote
                                </Link>
                                <Link
                                    to={accessRequestsPath}
                                    className="rounded-xl border border-white/12 px-4 py-2.5 text-center text-sm font-semibold text-slate-200 hover:border-cyan-400/40 hover:text-white"
                                >
                                    Open Access Requests
                                </Link>
                                <Link
                                    to={trustProfilePath}
                                    className="rounded-xl border border-white/12 px-4 py-2.5 text-center text-sm font-semibold text-slate-200 hover:border-cyan-400/40 hover:text-white"
                                >
                                    View Trust Profile
                                </Link>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    )
}
