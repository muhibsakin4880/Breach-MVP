import { getParticipantNetTrustScore, participantTrust, trustLevel } from './workspaceData'

export type DashboardAtAGlanceCard = {
    label: string
    value: string
    trend: string
    toneClassName: string
}

const staticDashboardAtAGlanceCards: DashboardAtAGlanceCard[] = [
    {
        label: 'Sessions today',
        value: '14',
        trend: '+3 from yesterday',
        toneClassName: 'text-emerald-300'
    },
    {
        label: 'Pending tasks',
        value: '06',
        trend: '2 need action this hour',
        toneClassName: 'text-amber-300'
    },
    {
        label: 'Unread messages',
        value: '09',
        trend: '4 from reviewers',
        toneClassName: 'text-violet-300'
    },
    {
        label: 'Next deadline',
        value: '18 Apr',
        trend: 'Compliance packet due',
        toneClassName: 'text-rose-300'
    }
]

export const getDashboardAtAGlanceCards = (): DashboardAtAGlanceCard[] => {
    const netTrustScore = getParticipantNetTrustScore()
    const trustMeta = trustLevel(netTrustScore)

    return [
        {
            label: 'Trust Score',
            value: String(netTrustScore),
            trend: participantTrust.scoreDeltaLabel,
            toneClassName: trustMeta.toneClassName
        },
        ...staticDashboardAtAGlanceCards
    ]
}
