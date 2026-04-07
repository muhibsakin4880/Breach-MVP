export type DashboardPriorityAction = {
    title: string
    detail: string
    ctaLabel: string
    ctaTo: string
    toneClassName: string
}

export type DashboardUpcomingSession = {
    title: string
    time: string
    detail: string
    status: string
    statusClassName: string
}

export type DashboardChecklistItem = {
    label: string
    detail: string
    done: boolean
}

export type DashboardAnnouncement = {
    title: string
    detail: string
    timing: string
}

export type DashboardQuickLink = {
    label: string
    detail: string
    to: string
}

export type DashboardSupportContact = {
    name: string
    role: string
    availability: string
    responseTime: string
    email: string
}

export const dashboardPriorityActions: DashboardPriorityAction[] = [
    {
        title: 'Finish the climate submission clarification',
        detail: 'Reviewer notes are waiting on a short downstream-model explanation before approval can continue.',
        ctaLabel: 'Open contribution',
        ctaTo: '/contributions',
        toneClassName: 'text-cyan-300'
    },
    {
        title: 'Confirm the next escrow release',
        detail: 'One settlement window closes in 18 hours and still needs participant confirmation.',
        ctaLabel: 'Review escrow',
        ctaTo: '/escrow-center',
        toneClassName: 'text-amber-300'
    },
    {
        title: 'Refresh your compliance passport',
        detail: 'A single attestation update will unlock the next trust-score band for new requests.',
        ctaLabel: 'Open passport',
        ctaTo: '/compliance-passport',
        toneClassName: 'text-emerald-300'
    }
]

export const dashboardUpcomingSessions: DashboardUpcomingSession[] = [
    {
        title: 'Provider policy review',
        time: 'Today · 2:30 PM',
        detail: 'Review the redistribution controls on the restricted healthcare package.',
        status: 'Confirmed',
        statusClassName: 'text-emerald-300'
    },
    {
        title: 'Escrow release checkpoint',
        time: 'Tomorrow · 10:00 AM',
        detail: 'Verify final release conditions for the financial tick batch settlement.',
        status: 'Upcoming',
        statusClassName: 'text-cyan-300'
    },
    {
        title: 'Compliance office hours',
        time: 'Apr 12 · 4:00 PM',
        detail: 'Optional walkthrough for participant passport renewals and evidence packs.',
        status: 'Open seats',
        statusClassName: 'text-violet-300'
    }
]

export const dashboardChecklistItems: DashboardChecklistItem[] = [
    {
        label: 'Respond to reviewer note on climate submission',
        detail: 'Needed for approval handoff.',
        done: false
    },
    {
        label: 'Validate settlement recipient details',
        detail: 'Required before the next release window.',
        done: true
    },
    {
        label: 'Upload the remaining compliance attachment',
        detail: 'Moves trust refresh out of pending.',
        done: false
    },
    {
        label: 'Acknowledge the latest platform policy update',
        detail: 'Already synced to this workspace.',
        done: true
    }
]

export const dashboardAnnouncements: DashboardAnnouncement[] = [
    {
        title: 'Reviewer SLA update',
        detail: 'Priority policy clarifications are now reviewed within one business day.',
        timing: 'Updated 45 min ago'
    },
    {
        title: 'Clean-room export reminder',
        detail: 'Aggregated export requests now require an attribution confirmation before checkout.',
        timing: 'Today'
    }
]

export const dashboardQuickLinks: DashboardQuickLink[] = [
    {
        label: 'Trust profile',
        detail: 'Review score drivers and participant standing.',
        to: '/trust-profile'
    },
    {
        label: 'Rights quote builder',
        detail: 'Prepare scoped terms for the next buyer request.',
        to: '/datasets/1/rights-quote'
    },
    {
        label: 'Audit trail',
        detail: 'Trace recent approvals, notes, and control events.',
        to: '/audit-trail'
    }
]

export const dashboardSupportContact: DashboardSupportContact = {
    name: 'Maya Chen',
    role: 'Participant Success Lead',
    availability: 'Mon-Fri · 09:00-18:00 UTC',
    responseTime: 'Average response: under 2 hours',
    email: 'support@redoubt.io'
}
