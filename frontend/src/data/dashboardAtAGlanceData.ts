export type DashboardAtAGlanceCard = {
    label: string
    value: string
    trend: string
    toneClassName: string
}

const dashboardAtAGlanceCards: DashboardAtAGlanceCard[] = [
    {
        label: 'TRUST SCORE',
        value: '80',
        trend: '+6 since the last attestation cycle',
        toneClassName: 'text-cyan-300'
    },
    {
        label: 'SESSIONS TODAY',
        value: '14',
        trend: '+3 from yesterday',
        toneClassName: 'text-emerald-300'
    },
    {
        label: 'PENDING TASKS',
        value: '06',
        trend: '2 need action this hour',
        toneClassName: 'text-amber-300'
    },
    {
        label: 'UNREAD MESSAGES',
        value: '09',
        trend: '4 from reviewers',
        toneClassName: 'text-violet-300'
    },
    {
        label: 'NEXT DEADLINE',
        value: '18 Apr',
        trend: 'Compliance packet due',
        toneClassName: 'text-rose-300'
    }
]

export const getDashboardAtAGlanceCards = (): DashboardAtAGlanceCard[] => dashboardAtAGlanceCards
