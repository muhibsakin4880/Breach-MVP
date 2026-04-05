import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { notifications as initialNotifications } from './mockData'

type Notification = {
    id: string
    title: string
    description: string
    read: boolean
    timestamp: string
    severity: 'info' | 'warning' | 'critical'
}

const severityConfig = {
    critical: 'bg-red-500',
    warning: 'bg-amber-500',
    info: 'bg-blue-500'
}

export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false)
    const [notifs, setNotifs] = useState<Notification[]>(() => initialNotifications.map(n => ({ ...n })))
    const dropdownRef = useRef<HTMLDivElement>(null)
    const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null)

    useEffect(() => {
        setPortalContainer(document.getElementById('notification-portal') || document.body)
    }, [])

    const unreadCount = notifs.filter(n => !n.read).length
    const hasUnread = unreadCount > 0

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const markAllAsRead = () => {
        setNotifs(prev => prev.map(n => ({ ...n, read: true })))
    }

    const handleNotificationClick = (id: string) => {
        setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    }

    const dropdownContent = isOpen ? (
        <div
            className="fixed top-14 right-6 w-[380px] z-[99999]"
            style={{ backgroundColor: '#09090b' }}
        >
            <div className="rounded-xl border border-zinc-700 shadow-2xl overflow-hidden" style={{ backgroundColor: '#09090b' }}>
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-800" style={{ backgroundColor: '#09090b' }}>
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <h3 className="text-xs font-semibold text-white tracking-wide">Notifications</h3>
                        {hasUnread && (
                            <span className="px-2 py-0.5 text-[9px] font-bold bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
                                {unreadCount} new
                            </span>
                        )}
                    </div>
                    <button
                        onClick={markAllAsRead}
                        className="text-[10px] font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                        Mark all as read
                    </button>
                </div>

                <div className="max-h-[340px] overflow-y-auto" style={{ backgroundColor: '#09090b' }}>
                    {notifs.map((notif) => {
                        const severity = severityConfig[notif.severity]
                        return (
                            <div
                                key={notif.id}
                                onClick={() => handleNotificationClick(notif.id)}
                                className={`px-4 py-3 cursor-pointer transition-all border-b border-zinc-800/50 ${
                                    !notif.read 
                                        ? 'hover:bg-cyan-500/10' 
                                        : 'hover:bg-zinc-800/50'
                                }`}
                                style={{ backgroundColor: !notif.read ? 'rgba(6, 182, 212, 0.03)' : undefined }}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${severity}`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-[11px] font-semibold text-white">{notif.title}</p>
                                            {!notif.read && (
                                                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                                            )}
                                        </div>
                                        <p className="text-[10px] text-zinc-400 mt-1 line-clamp-2">{notif.description}</p>
                                        <p className="text-[9px] text-zinc-500 mt-1.5">{notif.timestamp}</p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="flex justify-between items-center px-4 py-3 border-t border-zinc-800" style={{ backgroundColor: '#09090b' }}>
                    <span className="text-[9px] text-zinc-500">{notifs.length} notifications</span>
                    <button className="text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan-400 hover:text-cyan-300 transition-colors">
                        View All Alerts →
                    </button>
                </div>
            </div>
        </div>
    ) : null

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {hasUnread && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white px-1 animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>

            {portalContainer && createPortal(dropdownContent, portalContainer)}
        </div>
    )
}