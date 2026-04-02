import type { ReactNode } from 'react'

import {
    participantOnboardingActiveStepTitles,
    participantOnboardingSubtitle,
    participantOnboardingTitle
} from '../constants'
import OnboardingProgress from './OnboardingProgress'

type OnboardingPageLayoutProps = {
    activeStep?: number
    children: ReactNode
}

export default function OnboardingPageLayout({
    activeStep,
    children
}: OnboardingPageLayoutProps) {
    return (
        <div className="bg-slate-900 min-h-screen text-white">
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">{participantOnboardingTitle}</h1>
                    <p className="text-slate-400">{participantOnboardingSubtitle}</p>
                </div>

                {typeof activeStep === 'number' && activeStep >= 1 && activeStep <= 5 && (
                    <OnboardingProgress
                        activeStep={activeStep}
                        steps={participantOnboardingActiveStepTitles}
                        variant="grid"
                    />
                )}

                {children}
            </div>
        </div>
    )
}
