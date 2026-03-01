import { Link, useNavigate } from 'react-router-dom'
import { ChangeEvent, DragEvent, FormEvent, useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'

// --- Animated counter hook ---
function useCountUp(target: number, duration = 1500, start = false) {
    const [count, setCount] = useState(0)
    useEffect(() => {
        if (!start) return
        let startTime: number | null = null
        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp
            const progress = Math.min((timestamp - startTime) / duration, 1)
            setCount(Math.floor(progress * target))
            if (progress < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
    }, [target, duration, start])
    return count
}

// --- Intersection observer hook ---
function useInView(threshold = 0.2) {
    const ref = useRef<HTMLDivElement>(null)
    const [inView, setInView] = useState(false)
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setInView(true) },
            { threshold }
        )
        if (ref.current) observer.observe(ref.current)
        return () => observer.disconnect()
    }, [threshold])
    return { ref, inView }
}

export default function HomePage() {
    const { startOnboarding, signIn } = useAuth()
    const navigate = useNavigate()
    const [wizardOpen, setWizardOpen] = useState(false)
    const [wizardStep, setWizardStep] = useState(1)
    const [heroVisible, setHeroVisible] = useState(false)
    const statsRef = useInView()

    useEffect(() => {
        const timer = setTimeout(() => setHeroVisible(true), 100)
        return () => clearTimeout(timer)
    }, [])

    const datasetsCount = useCountUp(12400, 1800, statsRef.inView)
    const verifiedCount = useCountUp(98, 1200, statsRef.inView)
    const partnersCount = useCountUp(340, 1600, statsRef.inView)

    const handleRequestPlatformAccess = () => {
        startOnboarding()
        navigate('/onboarding')
    }

    const handleWizardProceed = (data: BasicInfoFormState) => {
        console.debug('Step 1 submission', data)
        setWizardStep(2)
    }

    const handleWizardCancel = () => {
        setWizardOpen(false)
        setWizardStep(1)
    }

    const handleSubmitAccessRequest = (data: AccessIntentFormState) => {
        console.debug('Step 2 access intent submission', data)
        setWizardStep(3)
    }

    const handleEnterDashboard = () => {
        signIn()
        setWizardOpen(false)
        setWizardStep(1)
        navigate('/dashboard')
    }

    const handleReviewProfile = () => {
        signIn()
        setWizardOpen(false)
        setWizardStep(1)
        navigate('/profile')
    }

    return (
        <div className="relative overflow-hidden">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

                .breach-font { font-family: 'Syne', sans-serif; }
                .body-font { font-family: 'DM Sans', sans-serif; }

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(32px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(3deg); }
                }
                @keyframes pulse-ring {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59,130,246,0.4); }
                    70% { transform: scale(1); box-shadow: 0 0 0 20px rgba(59,130,246,0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59,130,246,0); }
                }
                @keyframes shimmer {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                @keyframes grid-move {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(40px); }
                }
                @keyframes orb-drift {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -20px) scale(1.05); }
                    66% { transform: translate(-20px, 15px) scale(0.95); }
                }

                .animate-fadeUp { animation: fadeUp 0.7s ease forwards; }
                .animate-fadeIn { animation: fadeIn 0.6s ease forwards; }
                .animate-float { animation: float 6s ease-in-out infinite; }
                .animate-pulse-ring { animation: pulse-ring 2.5s ease-in-out infinite; }
                .animate-shimmer {
                    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%);
                    background-size: 200% auto;
                    animation: shimmer 3s linear infinite;
                }
                .animate-orb { animation: orb-drift 12s ease-in-out infinite; }

                .delay-100 { animation-delay: 0.1s; }
                .delay-200 { animation-delay: 0.2s; }
                .delay-300 { animation-delay: 0.3s; }
                .delay-400 { animation-delay: 0.4s; }
                .delay-500 { animation-delay: 0.5s; }

                .glass-card {
                    background: rgba(15, 23, 42, 0.6);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(148, 163, 184, 0.08);
                    transition: all 0.3s ease;
                }
                .glass-card:hover {
                    border-color: rgba(59, 130, 246, 0.3);
                    background: rgba(15, 23, 42, 0.8);
                    transform: translateY(-4px);
                    box-shadow: 0 20px 60px rgba(59, 130, 246, 0.1);
                }

                .step-connector::after {
                    content: '';
                    position: absolute;
                    top: 32px;
                    left: calc(50% + 40px);
                    width: calc(100% - 80px);
                    height: 1px;
                    background: linear-gradient(90deg, rgba(59,130,246,0.4), rgba(59,130,246,0.1));
                }

                .hero-bg {
                    background:
                        radial-gradient(ellipse 80% 50% at 50% -10%, rgba(59,130,246,0.15) 0%, transparent 70%),
                        radial-gradient(ellipse 40% 40% at 80% 60%, rgba(99,102,241,0.08) 0%, transparent 60%),
                        linear-gradient(170deg, #020817 0%, #0a1628 40%, #020817 100%);
                }

                .text-shimmer {
                    background: linear-gradient(135deg, #ffffff 0%, #93c5fd 40%, #ffffff 60%, #93c5fd 100%);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: shimmer 4s linear infinite;
                }

                .btn-primary {
                    position: relative;
                    overflow: hidden;
                    background: linear-gradient(135deg, #2563eb, #3b82f6);
                    transition: all 0.3s ease;
                }
                .btn-primary::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, #3b82f6, #60a5fa);
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                .btn-primary:hover::before { opacity: 1; }
                .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(59,130,246,0.4); }

                .btn-secondary {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.15);
                    transition: all 0.3s ease;
                    backdrop-filter: blur(10px);
                }
                .btn-secondary:hover {
                    background: rgba(255,255,255,0.1);
                    border-color: rgba(255,255,255,0.3);
                    transform: translateY(-2px);
                }

                .grid-bg {
                    background-image:
                        linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px);
                    background-size: 60px 60px;
                    animation: grid-move 8s linear infinite;
                }

                .stat-card {
                    background: linear-gradient(135deg, rgba(59,130,246,0.08), rgba(99,102,241,0.05));
                    border: 1px solid rgba(59,130,246,0.15);
                    transition: all 0.3s ease;
                }
                .stat-card:hover {
                    border-color: rgba(59,130,246,0.4);
                    transform: translateY(-2px);
                }

                .opacity-0-init { opacity: 0; }
            `}</style>

            {wizardOpen && (
                <OnboardingWizardOverlay
                    step={wizardStep}
                    onCancel={handleWizardCancel}
                    onProceed={handleWizardProceed}
                    onSubmitReview={() => {
                        console.debug('Submitted for review')
                        setWizardStep(4)
                    }}
                    onBackToStep1={() => setWizardStep(1)}
                    onBackToStep2={() => setWizardStep(2)}
                    onSubmitAccessRequest={handleSubmitAccessRequest}
                    onEnterDashboard={handleEnterDashboard}
                    onReviewProfile={handleReviewProfile}
                />
            )}

            <div aria-hidden={wizardOpen} className={wizardOpen ? 'hidden' : 'body-font'}>

                {/* ═══════════════════════════════════════
                    HERO SECTION
                ═══════════════════════════════════════ */}
                <section className="hero-bg relative min-h-screen flex items-center overflow-hidden">
                    {/* Animated grid background */}
                    <div className="absolute inset-0 grid-bg opacity-40" />

                    {/* Floating orbs */}
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full animate-orb"
                         style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />
                    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full"
                         style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', filter: 'blur(40px)', animation: 'orb-drift 15s ease-in-out infinite reverse' }} />

                    {/* Floating geometric shapes */}
                    <div className="absolute top-20 right-20 w-32 h-32 opacity-10 animate-float"
                         style={{ border: '1px solid rgba(59,130,246,0.5)', borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%', animationDelay: '0s' }} />
                    <div className="absolute bottom-32 left-16 w-20 h-20 opacity-10 animate-float"
                         style={{ border: '1px solid rgba(148,163,184,0.4)', borderRadius: '50%', animationDelay: '2s' }} />
                    <div className="absolute top-1/2 right-12 w-12 h-12 opacity-15 animate-float"
                         style={{ background: 'rgba(59,130,246,0.2)', borderRadius: '4px', transform: 'rotate(45deg)', animationDelay: '1s' }} />

                    <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
                        <div className="max-w-5xl mx-auto text-center">

                            {/* Badge */}
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 opacity-0-init ${heroVisible ? 'animate-fadeUp' : ''}`}
                                 style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', animationDelay: '0s', opacity: heroVisible ? undefined : 0 }}>
                                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse-ring" />
                                <span className="text-blue-300 text-sm font-medium tracking-wide">Trusted Data Infrastructure</span>
                            </div>

                            {/* Headline */}
                            <h1 className={`breach-font text-5xl md:text-7xl font-bold mb-6 leading-none tracking-tight opacity-0-init ${heroVisible ? 'animate-fadeUp delay-100' : ''}`}
                                style={{ opacity: heroVisible ? undefined : 0 }}>
                                <span className="text-white block">Breach —</span>
                                <span className="text-shimmer block">Data Confidence &</span>
                                <span className="text-white block">Security Layer</span>
                            </h1>

                            {/* Subtitle */}
                            <p className={`text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed opacity-0-init ${heroVisible ? 'animate-fadeUp delay-200' : ''}`}
                               style={{ opacity: heroVisible ? undefined : 0 }}>
                                Secure data access with verified datasets, AI-backed confidence, and
                                controlled participation — no marketplace, just trust-first collaboration.
                            </p>

                            {/* CTA Buttons */}
                            <div className={`flex flex-col sm:flex-row gap-4 justify-center opacity-0-init ${heroVisible ? 'animate-fadeUp delay-300' : ''}`}
                                 style={{ opacity: heroVisible ? undefined : 0 }}>
                                <Link to="/login" className="btn-primary relative z-10 px-8 py-4 text-white font-semibold rounded-xl text-lg">
                                    <span className="relative z-10">Sign In →</span>
                                </Link>
                                <button
                                    type="button"
                                    onClick={handleRequestPlatformAccess}
                                    className="btn-secondary px-8 py-4 text-white font-semibold rounded-xl text-lg"
                                >
                                    Request Platform Access
                                </button>
                            </div>

                            {/* Trust indicators */}
                            <div className={`mt-12 flex flex-wrap items-center justify-center gap-6 opacity-0-init ${heroVisible ? 'animate-fadeIn delay-400' : ''}`}
                                 style={{ opacity: heroVisible ? undefined : 0 }}>
                                {['SOC 2 Compliant', 'End-to-End Encrypted', 'Zero Marketplace Risk'].map((item) => (
                                    <div key={item} className="flex items-center gap-2 text-slate-500 text-sm">
                                        <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bottom fade */}
                    <div className="absolute bottom-0 left-0 right-0 h-32"
                         style={{ background: 'linear-gradient(to bottom, transparent, #020817)' }} />
                </section>

                {/* ═══════════════════════════════════════
                    STATS SECTION
                ═══════════════════════════════════════ */}
                <section className="py-16" style={{ background: '#020817' }}>
                    <div ref={statsRef.ref} className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6">
                            {[
                                { value: datasetsCount.toLocaleString() + '+', label: 'Verified Datasets' },
                                { value: verifiedCount + '%', label: 'Accuracy Rate' },
                                { value: partnersCount + '+', label: 'Trusted Partners' },
                            ].map((stat) => (
                                <div key={stat.label} className="stat-card rounded-2xl p-6 text-center">
                                    <div className="breach-font text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
                                    <div className="text-slate-500 text-sm">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════
                    HOW IT WORKS SECTION
                ═══════════════════════════════════════ */}
                <section className="py-24" style={{ background: 'linear-gradient(180deg, #020817 0%, #070f1f 100%)' }}>
                    <div className="container mx-auto px-4">
                        <div className="max-w-6xl mx-auto">
                            <div className="text-center mb-20">
                                <p className="text-blue-400 text-sm font-semibold tracking-widest uppercase mb-3">Process</p>
                                <h2 className="breach-font text-4xl md:text-5xl font-bold text-white mb-4">
                                    How It Works
                                </h2>
                                <p className="text-slate-400 text-lg max-w-xl mx-auto">
                                    Our automated pipeline ensures every dataset meets the highest standards
                                </p>
                            </div>

                            <div className="grid md:grid-cols-4 gap-6 relative">
                                {/* Connector line */}
                                <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-px"
                                     style={{ background: 'linear-gradient(90deg, rgba(59,130,246,0.3), rgba(59,130,246,0.1))', left: '12.5%', right: '12.5%' }} />

                                {[
                                    { num: '01', title: 'Controlled Dataset Onboarding', desc: 'Participants submit datasets with metadata and documentation for verification', icon: '⬆' },
                                    { num: '02', title: 'AI Quality Verification', desc: 'Automated AI systems check data quality, completeness, and consistency', icon: '⚡' },
                                    { num: '03', title: 'Confidence Scoring', desc: 'Each dataset receives a comprehensive confidence score based on multiple factors', icon: '◎' },
                                    { num: '04', title: 'Secure Access', desc: 'Approved participants access datasets with full audit trails and security controls', icon: '🔐' },
                                ].map((step, i) => (
                                    <div key={step.num} className="glass-card rounded-2xl p-6 relative" style={{ animationDelay: `${i * 0.1}s` }}>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold"
                                                 style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(99,102,241,0.1))', border: '1px solid rgba(59,130,246,0.2)' }}>
                                                {step.icon}
                                            </div>
                                            <span className="breach-font text-blue-400 text-sm font-semibold">{step.num}</span>
                                        </div>
                                        <h3 className="breach-font text-lg font-semibold text-white mb-3">{step.title}</h3>
                                        <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════
                    TRUST & VERIFICATION SECTION
                ═══════════════════════════════════════ */}
                <section className="py-24" style={{ background: '#020817' }}>
                    <div className="container mx-auto px-4">
                        <div className="max-w-6xl mx-auto">
                            <div className="text-center mb-16">
                                <p className="text-blue-400 text-sm font-semibold tracking-widest uppercase mb-3">Security</p>
                                <h2 className="breach-font text-4xl md:text-5xl font-bold text-white mb-4">
                                    Trust & Verification
                                </h2>
                                <p className="text-slate-400 text-lg max-w-xl mx-auto">
                                    Multi-layered verification ensures secure, trustworthy collaboration without marketplace risks
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                                {[
                                    { icon: '🤖', title: 'AI Dataset Validation', desc: 'Automated AI systems validate data quality, detect anomalies, and ensure consistency', color: 'rgba(59,130,246,0.1)' },
                                    { icon: '✓', title: 'Provider Verification', desc: 'All data providers undergo identity verification and credentialing processes', color: 'rgba(16,185,129,0.1)' },
                                    { icon: '📊', title: 'Confidence Scores', desc: 'Transparent scoring system showing quality, completeness, and reliability metrics', color: 'rgba(245,158,11,0.1)' },
                                    { icon: '🔒', title: 'Secure Dataset Access', desc: 'Enterprise-grade security with role-based access and complete audit trails', color: 'rgba(99,102,241,0.1)' },
                                ].map((card) => (
                                    <div key={card.title} className="glass-card rounded-2xl p-6">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5"
                                             style={{ background: card.color, border: `1px solid ${card.color.replace('0.1', '0.3')}` }}>
                                            {card.icon}
                                        </div>
                                        <h3 className="breach-font text-lg font-semibold text-white mb-3">{card.title}</h3>
                                        <p className="text-slate-400 text-sm leading-relaxed">{card.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════
                    BUILT FOR EVERY TEAM SECTION
                ═══════════════════════════════════════ */}
                <section className="py-24" style={{ background: 'linear-gradient(180deg, #020817 0%, #070f1f 100%)' }}>
                    <div className="container mx-auto px-4">
                        <div className="max-w-6xl mx-auto">
                            <div className="text-center mb-16">
                                <p className="text-blue-400 text-sm font-semibold tracking-widest uppercase mb-3">Solutions</p>
                                <h2 className="breach-font text-4xl md:text-5xl font-bold text-white mb-4">
                                    Built for Every Team
                                </h2>
                                <p className="text-slate-400 text-lg">Tailored solutions for diverse data needs</p>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                                {[
                                    { icon: '🎓', title: 'Researchers', desc: 'Verified datasets for academic research with citation support', to: '/solutions#researchers', color: '#3b82f6' },
                                    { icon: '🤖', title: 'AI & ML Teams', desc: 'Training data with quality validation and bias detection', to: '/solutions#ai-ml-teams', color: '#8b5cf6' },
                                    { icon: '🏢', title: 'Enterprises', desc: 'Enterprise-grade security and compliance for critical applications', to: '/solutions#enterprises', color: '#10b981' },
                                    { icon: '📊', title: 'Contribute Data', desc: 'Participants can contribute datasets with verification, governance, and audit trails', to: '/solutions#data-providers', color: '#f59e0b' },
                                ].map((card) => (
                                    <Link key={card.title} to={card.to} className="glass-card rounded-2xl p-6 group block">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 transition-transform group-hover:scale-110"
                                             style={{ background: `${card.color}18`, border: `1px solid ${card.color}30` }}>
                                            {card.icon}
                                        </div>
                                        <h3 className="breach-font text-lg font-semibold text-white mb-3">{card.title}</h3>
                                        <p className="text-slate-400 text-sm leading-relaxed mb-4">{card.desc}</p>
                                        <span className="text-sm font-medium transition-colors group-hover:text-white" style={{ color: card.color }}>
                                            Learn more →
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════
                    FINAL CTA SECTION
                ═══════════════════════════════════════ */}
                <section className="py-24 relative overflow-hidden"
                         style={{ background: 'linear-gradient(135deg, #020817 0%, #0a1628 50%, #020817 100%)' }}>
                    <div className="absolute inset-0"
                         style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(59,130,246,0.08) 0%, transparent 70%)' }} />
                    <div className="absolute inset-0 grid-bg opacity-20" />

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-3xl mx-auto text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
                                 style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
                                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                                <span className="text-blue-300 text-sm">Invitation-only platform</span>
                            </div>

                            <h2 className="breach-font text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                                Participation requires
                                <span className="text-shimmer block">verification & approval</span>
                            </h2>
                            <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
                                Secure data access only after identity and use-case verification. Collaborate with confidence as trusted participants in a controlled network.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link to="/login" className="btn-primary relative z-10 px-8 py-4 text-white font-semibold rounded-xl text-lg">
                                    <span className="relative z-10">Sign In →</span>
                                </Link>
                                <button
                                    type="button"
                                    onClick={handleRequestPlatformAccess}
                                    className="btn-secondary px-8 py-4 text-white font-semibold rounded-xl text-lg"
                                >
                                    Request Platform Access
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════════
// TYPES & CONSTANTS (unchanged from original)
// ═══════════════════════════════════════════════════════

type BasicInfoFormState = {
    workEmail: string
    fullName: string
    organizationName: string
    role: string
}

type AccessIntentFormState = {
    domains: string[]
    primaryPurpose: string
    accessType: string
    usageFrequency: string
}

type OnboardingWizardOverlayProps = {
    step: number
    onCancel: () => void
    onProceed: (data: BasicInfoFormState) => void
    onSubmitReview: () => void
    onBackToStep1: () => void
    onBackToStep2: () => void
    onSubmitAccessRequest: (data: AccessIntentFormState) => void
    onEnterDashboard: () => void
    onReviewProfile: () => void
}

const ROLE_OPTIONS = ['Researcher', 'Data Scientist', 'Engineer', 'Analyst', 'Other']
const DOMAIN_OPTIONS = [
    'Climate & Environment',
    'Finance & Markets',
    'Healthcare & Life Sciences',
    'Urban Mobility & Sensors',
    'Other'
]
const ACCESS_TYPE_OPTIONS = [
    'Metadata & summaries only',
    'Aggregated / anonymized data',
    'Full raw dataset access (subject to approval)'
]
const USAGE_FREQUENCY_OPTIONS = [
    'Occasional / Research',
    'Regular analysis',
    'High-volume / Production use'
]

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

// ═══════════════════════════════════════════════════════
// ONBOARDING WIZARD (unchanged from original)
// ═══════════════════════════════════════════════════════

function OnboardingWizardOverlay({
                                     step,
                                     onCancel,
                                     onSubmitReview,
                                     onBackToStep1,
                                     onBackToStep2,
                                     onSubmitAccessRequest,
                                     onEnterDashboard,
                                     onReviewProfile,
                                     onProceed,
                                 }: OnboardingWizardOverlayProps) {
    const [form, setForm] = useState<BasicInfoFormState>({
        workEmail: '',
        fullName: '',
        organizationName: '',
        role: 'Researcher'
    })
    const [accessIntent, setAccessIntent] = useState<AccessIntentFormState>({
        domains: [],
        primaryPurpose: '',
        accessType: ACCESS_TYPE_OPTIONS[0],
        usageFrequency: USAGE_FREQUENCY_OPTIONS[0]
    })
    const [touched, setTouched] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [fileError, setFileError] = useState<string | null>(null)
    const [dragActive, setDragActive] = useState(false)

    const updateField = (key: keyof BasicInfoFormState, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }))
    }

    const readyStep1 =
        isValidEmail(form.workEmail.trim()) &&
        form.fullName.trim().length > 0 &&
        form.organizationName.trim().length > 0 &&
        form.role.trim().length > 0

    const handleSubmitStep1 = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setTouched(true)
        if (!readyStep1) return
        onProceed(form)
    }

    const acceptFile = (file: File) => {
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
        const isAllowedType = allowedTypes.includes(file.type) || /\.(pdf|jpe?g|png)$/i.test(file.name)
        if (!isAllowedType) {
            setFileError('Only PDF, JPG, or PNG files are allowed.')
            setSelectedFile(null)
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            setFileError('File size must be under 5MB.')
            setSelectedFile(null)
            return
        }
        setSelectedFile(file)
        setFileError(null)
    }

    const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) acceptFile(file)
    }

    const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault()
        setDragActive(false)
        const file = event.dataTransfer.files?.[0]
        if (file) acceptFile(file)
    }

    const toggleDomain = (domain: string) => {
        setAccessIntent((prev) => ({
            ...prev,
            domains: prev.domains.includes(domain)
                ? prev.domains.filter((selected) => selected !== domain)
                : [...prev.domains, domain]
        }))
    }

    const handleSubmitStep4 = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        onSubmitAccessRequest(accessIntent)
    }

    const trustLevel = 45
    const trustColor = trustLevel >= 70 ? 'bg-emerald-500' : trustLevel >= 50 ? 'bg-blue-500' : 'bg-amber-400'
    const wizardTitle =
        step === 1
            ? 'Participant Verification - Basic Info'
            : step === 2
                ? 'Access Intent & Use Case'
                : step === 3
                    ? 'Advanced Organization Verification'
                    : 'Verification Complete'

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm overflow-y-auto">
            <div className="min-h-screen flex items-start justify-center py-6 md:py-10 px-4 md:px-8">
                <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-4">
                    <div className="px-6 md:px-8 py-5 border-b border-slate-800 flex items-center justify-between gap-4">
                        <div className="space-y-1">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Step {step} of 4</p>
                            <h2 className="text-xl md:text-2xl font-semibold text-white">{wizardTitle}</h2>
                        </div>
                        <div className="hidden sm:block text-slate-400 text-sm">Step {step} of 4</div>
                    </div>

                    {step === 1 ? (
                        <form onSubmit={handleSubmitStep1} className="px-6 md:px-8 py-6 space-y-6">
                            <div className="grid gap-4">
                                <label className="space-y-2">
                                    <span className="block text-sm font-semibold text-slate-200">
                                        Work Email <span className="text-blue-300">*</span>
                                    </span>
                                    <input
                                        type="email"
                                        required
                                        autoFocus
                                        value={form.workEmail}
                                        onChange={(e) => updateField('workEmail', e.target.value)}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-4 text-lg text-white focus:border-blue-500 focus:outline-none"
                                        placeholder="name@company.com"
                                    />
                                </label>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <label className="space-y-2">
                                        <span className="block text-sm font-semibold text-slate-200">
                                            Full Name <span className="text-blue-300">*</span>
                                        </span>
                                        <input
                                            type="text"
                                            required
                                            value={form.fullName}
                                            onChange={(e) => updateField('fullName', e.target.value)}
                                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                                            placeholder="Your full name"
                                        />
                                    </label>
                                    <label className="space-y-2">
                                        <span className="block text-sm font-semibold text-slate-200">
                                            Organization Name <span className="text-blue-300">*</span>
                                        </span>
                                        <input
                                            type="text"
                                            required
                                            value={form.organizationName}
                                            onChange={(e) => updateField('organizationName', e.target.value)}
                                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                                            placeholder="Organization"
                                        />
                                    </label>
                                </div>
                                <label className="space-y-2">
                                    <span className="block text-sm font-semibold text-slate-200">Position / Role</span>
                                    <select
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                                        value={form.role}
                                        onChange={(e) => updateField('role', e.target.value)}
                                    >
                                        {ROLE_OPTIONS.map((option) => (
                                            <option key={option}>{option}</option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <p className="text-sm text-slate-400">
                                    Access is restricted to verified participants from reputed organizations.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setForm({ workEmail: 'demo@trusted.org', fullName: 'Demo User', organizationName: 'Trusted Labs', role: 'Researcher' })}
                                    className="text-xs text-blue-300 hover:text-blue-200 underline"
                                >
                                    Autofill demo data
                                </button>
                            </div>
                            {touched && !readyStep1 && (
                                <div className="text-sm text-amber-300 bg-amber-500/10 border border-amber-400/50 rounded-lg px-3 py-2">
                                    Please complete all required fields with a valid work email to continue.
                                </div>
                            )}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
                                <button type="submit" className="w-full sm:w-auto sm:min-w-[260px] px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors">
                                    Proceed to Verification
                                </button>
                                <button type="button" onClick={onCancel} className="text-slate-300 hover:text-white text-sm">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : step === 2 ? (
                        <Step3AccessIntent
                            value={accessIntent}
                            onToggleDomain={toggleDomain}
                            onChange={setAccessIntent}
                            onBack={onBackToStep1}
                            onSubmit={handleSubmitStep4}
                        />
                    ) : step === 3 ? (
                        <div className="px-6 md:px-8 py-6 space-y-6">
                            <div className="space-y-1">
                                <p className="text-sm text-slate-300">Step 3 of 4</p>
                                <h3 className="text-xl font-semibold text-white">Verify your organization to gain access</h3>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 space-y-3">
                                    <h4 className="text-lg font-semibold text-white">Connect with LinkedIn</h4>
                                    <p className="text-sm text-slate-400">Securely confirm your organizational affiliation via LinkedIn.</p>
                                    <button className="w-full px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors">
                                        Connect LinkedIn (mock)
                                    </button>
                                </div>
                                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 space-y-3">
                                    <h4 className="text-lg font-semibold text-white">Upload Proof of Affiliation</h4>
                                    <p className="text-sm text-slate-400">PDF, JPG, or PNG only. Max 5MB.</p>
                                    <label
                                        onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
                                        onDragLeave={() => setDragActive(false)}
                                        onDrop={handleDrop}
                                        className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg px-4 py-10 cursor-pointer transition-colors ${dragActive ? 'border-blue-400 bg-blue-500/5' : 'border-slate-700 bg-slate-900'}`}
                                    >
                                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFileInput} />
                                        <div className="text-slate-200 font-semibold">{selectedFile ? selectedFile.name : 'Drag & drop file or click to browse'}</div>
                                        <div className="text-xs text-slate-500">PDF, JPG, PNG | Max 5MB</div>
                                    </label>
                                    {fileError && (
                                        <div className="text-sm text-amber-300 bg-amber-500/10 border border-amber-400/50 rounded-lg px-3 py-2">{fileError}</div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm text-slate-300">
                                    <span>Current Trust Level: {trustLevel}%</span>
                                    <span className="text-slate-500">Live estimate</span>
                                </div>
                                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                                    <div className={`h-full ${trustColor}`} style={{ width: `${Math.min(trustLevel, 100)}%` }} />
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
                                <button type="button" onClick={onSubmitReview} className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors">
                                    Submit for Review
                                </button>
                                <div className="flex gap-3 w-full sm:w-auto">
                                    <button type="button" onClick={onBackToStep2} className="flex-1 sm:flex-none px-4 py-3 rounded-lg border border-slate-700 text-slate-200 hover:border-blue-500">Back</button>
                                    <button type="button" onClick={onCancel} className="flex-1 sm:flex-none px-4 py-3 rounded-lg border border-transparent text-slate-300 hover:text-white">Cancel</button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <Step4VerificationComplete onEnterDashboard={onEnterDashboard} onReviewProfile={onReviewProfile} />
                    )}
                </div>
            </div>
        </div>
    )
}

type Step4VerificationCompleteProps = {
    onEnterDashboard: () => void
    onReviewProfile: () => void
}

function Step4VerificationComplete({ onEnterDashboard, onReviewProfile }: Step4VerificationCompleteProps) {
    const trustScore = 85
    return (
        <div className="px-6 md:px-8 py-8 space-y-7">
            <div className="space-y-5 text-center">
                <div className="mx-auto w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <svg className="w-10 h-10 text-emerald-400" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M20 7L9 18l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl md:text-3xl font-semibold text-white">Welcome to the Data Access Layer</h3>
                    <p className="text-slate-300 max-w-2xl mx-auto">
                        Your participant profile has been verified.<br />
                        You now have access as a verified participant from a reputed organization.
                    </p>
                </div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 space-y-3">
                <div className="flex items-center justify-between text-sm text-slate-300">
                    <span>Trust Score: {trustScore}%</span>
                    <span className="text-emerald-400 font-medium">Verified</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${trustScore}%` }} />
                </div>
            </div>
            <p className="text-sm text-slate-400 text-center">All data access remains private and governed by platform policies.</p>
            <div className="flex flex-col items-center gap-4">
                <button type="button" onClick={onEnterDashboard} className="w-full sm:w-auto sm:min-w-[260px] px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors">
                    Enter Dashboard
                </button>
                <button type="button" onClick={onReviewProfile} className="text-sm text-slate-300 hover:text-white underline underline-offset-4">
                    Review My Profile
                </button>
            </div>
        </div>
    )
}

type Step3AccessIntentProps = {
    value: AccessIntentFormState
    onToggleDomain: (domain: string) => void
    onChange: (next: AccessIntentFormState) => void
    onBack: () => void
    onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

function Step3AccessIntent({ value, onToggleDomain, onChange, onBack, onSubmit }: Step3AccessIntentProps) {
    return (
        <form onSubmit={onSubmit} className="px-6 md:px-8 py-6 space-y-6">
            <div className="space-y-1">
                <p className="text-sm text-slate-300">Step 2 of 4</p>
                <h3 className="text-xl font-semibold text-white">Tell us how you plan to use the platform</h3>
            </div>
            <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-5">
                <h4 className="text-sm font-semibold text-slate-200">Domain of Interest</h4>
                <div className="flex flex-wrap gap-2">
                    {DOMAIN_OPTIONS.map((option) => {
                        const selected = value.domains.includes(option)
                        return (
                            <button key={option} type="button" onClick={() => onToggleDomain(option)}
                                    className={`px-3 py-2 rounded-full text-sm border transition-colors ${selected ? 'bg-blue-600/20 border-blue-500 text-blue-100' : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-blue-500'}`}>
                                {option}
                            </button>
                        )
                    })}
                </div>
            </div>
            <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-5">
                <h4 className="text-sm font-semibold text-slate-200">Primary Purpose</h4>
                <textarea value={value.primaryPurpose} onChange={(event) => onChange({ ...value, primaryPurpose: event.target.value })} rows={4} placeholder="Briefly describe your intended use case..." className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none resize-none" />
            </div>
            <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-5">
                <h4 className="text-sm font-semibold text-slate-200">Type of Access Needed</h4>
                <div className="space-y-2">
                    {ACCESS_TYPE_OPTIONS.map((option) => (
                        <label key={option} className="flex items-center gap-3 rounded-lg border border-slate-800 px-3 py-2">
                            <input type="radio" name="access-type" checked={value.accessType === option} onChange={() => onChange({ ...value, accessType: option })} className="accent-blue-500" />
                            <span className="text-slate-200 text-sm">{option}</span>
                        </label>
                    ))}
                </div>
            </div>
            <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-5">
                <h4 className="text-sm font-semibold text-slate-200">Expected Usage Frequency</h4>
                <select value={value.usageFrequency} onChange={(event) => onChange({ ...value, usageFrequency: event.target.value })} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white focus:border-blue-500 focus:outline-none">
                    {USAGE_FREQUENCY_OPTIONS.map((option) => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
                <button type="submit" className="w-full sm:w-auto sm:min-w-[260px] px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors">Proceed</button>
                <button type="button" onClick={onBack} className="w-full sm:w-auto px-5 py-3 rounded-lg border border-slate-700 text-slate-200 hover:border-blue-500 transition-colors">Back</button>
            </div>
        </form>
    )
}
