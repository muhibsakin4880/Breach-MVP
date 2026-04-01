import { Navigate } from 'react-router-dom'

import { getOnboardingResumePath } from '../onboarding/flow'

export default function OnboardingConfirmation() {
    return <Navigate to={getOnboardingResumePath()} replace />
}
