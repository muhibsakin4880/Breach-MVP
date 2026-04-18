import { startTransition, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { type ToastType, useToast } from './Toast'

type QuickActionGroupId = 'save' | 'upload' | 'chat' | 'download'

type RouteTarget = '/provider/datasets/new' | '/audit-trail' | '/compliance-passport' | '/usage-analytics'

type QuickAction =
    | {
          id: string
          label: string
          detail: string
          kind: 'toast'
          message: string
          toastType?: ToastType
      }
    | {
          id: string
          label: string
          detail: string
          kind: 'navigate'
          to: RouteTarget
          notice: string
          toastType?: ToastType
      }

type QuickActionGroup = {
    id: QuickActionGroupId
    label: string
    items: QuickAction[]
}

const quickActionGroups: QuickActionGroup[] = [
    {
        id: 'save',
        label: 'Save',
        items: [
            {
                id: 'save-draft',
                label: 'Save draft',
                detail: 'Store the current workspace state.',
                kind: 'toast',
                message: 'Draft saved to your governed workspace.',
                toastType: 'success'
            },
            {
                id: 'export-pdf',
                label: 'Export PDF',
                detail: 'Queue a read-only PDF snapshot.',
                kind: 'toast',
                message: 'PDF export queued for this workspace view.',
                toastType: 'info'
            },
            {
                id: 'export-csv',
                label: 'Export CSV',
                detail: 'Prepare a structured report export.',
                kind: 'toast',
                message: 'CSV export prepared with the current filters.',
                toastType: 'info'
            }
        ]
    },
    {
        id: 'upload',
        label: 'Upload',
        items: [
            {
                id: 'upload-dataset',
                label: 'Upload dataset',
                detail: 'Open the upload flow to stage a new dataset.',
                kind: 'navigate',
                to: '/provider/datasets/new',
                notice: 'Opening the provider upload flow to stage a dataset.',
                toastType: 'info'
            },
            {
                id: 'upload-document',
                label: 'Upload document',
                detail: 'Attach supporting files to a new dataset package.',
                kind: 'navigate',
                to: '/provider/datasets/new',
                notice: 'Use the upload flow to add supporting documents.',
                toastType: 'info'
            },
            {
                id: 'upload-compliance',
                label: 'Upload compliance evidence',
                detail: 'Continue verification in Compliance Passport.',
                kind: 'navigate',
                to: '/compliance-passport',
                notice: 'Opening Compliance Passport to manage evidence files.',
                toastType: 'info'
            }
        ]
    },
    {
        id: 'chat',
        label: 'Chat',
        items: [
            {
                id: 'message-reviewer',
                label: 'Message reviewer',
                detail: 'Notify the review queue with current context.',
                kind: 'toast',
                message: 'Secure reviewer messaging is being prepared for this workspace.',
                toastType: 'info'
            },
            {
                id: 'contact-support',
                label: 'Contact support',
                detail: 'Raise the current issue with operations.',
                kind: 'toast',
                message: 'Support routing opened for this workspace.',
                toastType: 'info'
            },
            {
                id: 'start-conversation',
                label: 'Start new conversation',
                detail: 'Create a fresh discussion thread.',
                kind: 'toast',
                message: 'A new workspace conversation draft is ready.',
                toastType: 'success'
            }
        ]
    },
    {
        id: 'download',
        label: 'Download',
        items: [
            {
                id: 'download-report',
                label: 'Download report',
                detail: 'Jump to Usage Analytics for reporting.',
                kind: 'navigate',
                to: '/usage-analytics',
                notice: 'Usage Analytics has the latest chargeback-ready report.',
                toastType: 'info'
            },
            {
                id: 'download-audit',
                label: 'Download audit log',
                detail: 'Review export-ready activity history.',
                kind: 'navigate',
                to: '/audit-trail',
                notice: 'Opening Audit Trail for export-ready evidence.',
                toastType: 'info'
            },
            {
                id: 'download-packet',
                label: 'Download compliance packet',
                detail: 'Open the active compliance packet.',
                kind: 'navigate',
                to: '/compliance-passport',
                notice: 'Opening Compliance Passport for the current packet.',
                toastType: 'info'
            }
        ]
    }
]

export default function ParticipantQuickActions() {
    const [openMenu, setOpenMenu] = useState<QuickActionGroupId | null>(null)
    const menuRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()
    const location = useLocation()
    const { showToast } = useToast()

    useEffect(() => {
        setOpenMenu(null)
    }, [location.pathname])

    useEffect(() => {
        const handlePointerDown = (event: PointerEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenu(null)
            }
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpenMenu(null)
            }
        }

        document.addEventListener('pointerdown', handlePointerDown)
        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown)
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [])

    const toggleMenu = (menu: QuickActionGroupId) => {
        setOpenMenu((currentMenu) => (currentMenu === menu ? null : menu))
    }

    const handleAction = (action: QuickAction) => {
        if (action.kind === 'navigate') {
            startTransition(() => {
                navigate(action.to)
            })
            showToast(action.notice, action.toastType ?? 'info')
        } else {
            showToast(action.message, action.toastType ?? 'info')
        }

        setOpenMenu(null)
    }

    return (
        <div
            ref={menuRef}
            className="fixed inset-x-4 bottom-4 z-40 flex items-center justify-end gap-2 rounded-[28px] border border-slate-700/80 bg-slate-950/88 p-2 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.95)] backdrop-blur-2xl md:inset-x-auto md:right-4 md:bottom-6 md:gap-3 lg:bottom-auto lg:right-5 lg:top-1/2 lg:flex-col lg:justify-center lg:gap-2 lg:rounded-[24px] lg:border lg:border-[#22304D]/80 lg:bg-[#0C1426]/76 lg:p-2 lg:shadow-[0_28px_56px_-36px_rgba(2,6,23,0.96)] lg:-translate-y-1/2"
            role="toolbar"
            aria-label="Participant quick actions"
        >
            {quickActionGroups.map((group) => {
                const menuId = `participant-quick-actions-${group.id}`

                return (
                    <div key={group.id} className="relative">
                        <button
                            type="button"
                            onClick={() => toggleMenu(group.id)}
                            aria-label={group.label}
                            aria-expanded={openMenu === group.id}
                            aria-haspopup="menu"
                            aria-controls={menuId}
                            className={`flex h-11 w-11 items-center justify-center rounded-[18px] border transition-all duration-200 ${
                                openMenu === group.id
                                    ? 'border-cyan-400/35 bg-cyan-500/14 text-cyan-200 shadow-[0_14px_30px_-18px_rgba(34,211,238,0.35)]'
                                    : 'border-[#25314A]/78 bg-[#0C1426]/90 text-slate-400 hover:border-cyan-400/28 hover:bg-[#101a30] hover:text-slate-200'
                            }`}
                        >
                            <ActionIcon name={group.id} className="h-5 w-5" />
                        </button>

                        {openMenu === group.id ? (
                            <div
                                id={menuId}
                                role="menu"
                                aria-label={`${group.label} actions`}
                                className="fixed inset-x-4 bottom-20 w-auto rounded-[24px] border border-[#25314A]/80 bg-[#0B1221]/96 p-2 shadow-[0_28px_50px_-30px_rgba(2,6,23,0.98)] backdrop-blur-xl md:inset-x-auto md:right-4 md:bottom-24 md:w-72 lg:absolute lg:inset-x-auto lg:bottom-auto lg:right-16 lg:top-1/2 lg:w-64 lg:-translate-y-1/2"
                            >
                                {group.items.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        role="menuitem"
                                        onClick={() => handleAction(item)}
                                        className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-slate-800/60"
                                    >
                                        <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-[#25314A]/80 bg-[#0E172B]/92 text-cyan-200">
                                            <ActionIcon name={group.id} className="h-4 w-4" />
                                        </span>
                                        <span className="min-w-0">
                                            <span className="block text-sm font-medium text-slate-100">{item.label}</span>
                                            <span className="mt-0.5 block text-xs leading-5 text-slate-400">{item.detail}</span>
                                        </span>
                                    </button>
                                ))}
                            </div>
                        ) : null}
                    </div>
                )
            })}
        </div>
    )
}

function ActionIcon({ name, className }: { name: QuickActionGroupId; className?: string }) {
    const iconClassName = className ?? 'h-5 w-5'

    switch (name) {
        case 'save':
            return (
                <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.75 5.75A1.75 1.75 0 0 1 6.5 4h8.94c.46 0 .9.18 1.24.51l2.81 2.81c.33.33.51.78.51 1.24V18.5a1.75 1.75 0 0 1-1.75 1.75h-11.5A1.75 1.75 0 0 1 5 18.5V5.75Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 4.75v4.5h7V4.75" />
                </svg>
            )
        case 'upload':
            return (
                <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.25v-9.5" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 13.25-3.75-3.75-3.75 3.75" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.75 5.75h12.5" />
                </svg>
            )
        case 'chat':
            return (
                <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.25 16.25H5a1.25 1.25 0 0 1-1.25-1.25V6A1.25 1.25 0 0 1 5 4.75h14A1.25 1.25 0 0 1 20.25 6v9A1.25 1.25 0 0 1 19 16.25h-6.75L8 19.25v-3Z" />
                </svg>
            )
        case 'download':
            return (
                <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.75v9.5" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 10.75 3.75 3.75 3.75-3.75" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.75 18.25h12.5" />
                </svg>
            )
    }
}
