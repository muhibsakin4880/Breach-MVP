export const dashboardSpacingTokens = {
    'space-2': 'gap-2',
    'space-3': 'gap-3',
    'space-4': 'gap-4',
    'space-6': 'gap-6',
    'stack-3': 'space-y-3',
    'stack-4': 'space-y-4',
    'page-padding': 'px-6 py-6',
    'hero-padding': 'px-6 py-4',
    'section-gap': 'mb-6',
    'section-intro': 'mb-4',
    'panel-padding': 'p-4',
    'card-padding': 'px-4 py-4',
    'card-padding-compact': 'px-4 py-3',
    'empty-padding-compact': 'px-3 py-4',
    'chip-padding': 'px-3 py-2',
    'button-padding': 'px-4 py-2',
    'button-padding-tall': 'px-4 py-3',
    'panel-body-gap': 'mt-4',
    'title-gap': 'mt-2',
    'detail-gap': 'mt-3',
    'meta-gap': 'mt-2'
} as const

export const dashboardRadiusTokens = {
    'radius-sm': 'rounded-lg',
    'radius-md': 'rounded-xl',
    'radius-lg': 'rounded-2xl',
    'radius-pill': 'rounded-full'
} as const

export const dashboardShadowTokens = {
    'shadow-card': 'shadow-[0_12px_30px_-22px_rgba(15,23,42,0.95)]',
    'shadow-hero': 'shadow-[0_22px_60px_-34px_rgba(6,182,212,0.5)]',
    'shadow-float': 'shadow-[0_20px_40px_-26px_rgba(15,23,42,0.95)]',
    'shadow-tooltip': 'shadow-lg'
} as const

export const dashboardTypographyTokens = {
    'text-eyebrow': 'text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500',
    'text-hero-eyebrow': 'text-[11px] font-medium uppercase tracking-[0.18em] text-cyan-200/80',
    'text-hero-title': 'text-4xl font-bold tracking-tight text-white',
    'text-section-title': 'text-xl font-semibold tracking-tight text-white',
    'text-panel-title': 'text-lg font-semibold tracking-tight text-white',
    'text-item-title': 'text-sm font-semibold text-white',
    'text-body': 'text-sm leading-5 text-slate-400',
    'text-body-strong': 'text-sm leading-5 text-slate-300',
    'text-muted': 'text-xs leading-4 text-slate-500',
    'text-muted-strong': 'text-xs font-medium leading-4 text-slate-300',
    'text-value': 'text-3xl font-semibold tracking-tight text-white'
} as const

export const dashboardColorTokens = {
    'surface-page': 'bg-slate-900',
    'surface-panel': 'bg-slate-800/30',
    'surface-card': 'bg-slate-900/65',
    'surface-card-soft': 'bg-slate-800/35',
    'surface-accent': 'bg-cyan-500/8',
    'surface-overlay': 'bg-slate-950/85',
    'surface-overlay-soft': 'bg-slate-950/45',
    'surface-empty': 'bg-slate-900/55',
    'surface-success': 'bg-emerald-500/10',
    'surface-tooltip': 'bg-slate-900',
    'text-primary': 'text-white',
    'text-strong': 'text-slate-100',
    'text-accent': 'text-cyan-300',
    'text-accent-soft': 'text-cyan-200',
    'text-success': 'text-emerald-100',
    'text-inverse': 'text-slate-950',
    'border-subtle': 'border-white/10',
    'border-card': 'border-white/8',
    'border-soft': 'border-white/6',
    'border-accent': 'border-cyan-500/20',
    'border-success': 'border-emerald-500/30',
    'state-completed-badge': 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
    'state-completed-marker': 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200',
    'state-progress-badge': 'border border-cyan-500/30 bg-cyan-500/10 text-cyan-200',
    'state-progress-marker': 'border-cyan-500/40 bg-cyan-500/15 text-cyan-200',
    'state-upcoming-badge': 'border border-amber-500/30 bg-amber-500/10 text-amber-200',
    'state-upcoming-marker': 'border-amber-500/40 bg-amber-500/15 text-amber-200'
} as const

export const dashboardComponentTokens = {
    'page-background':
        'pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_25%_0%,rgba(16,185,129,0.12),transparent_50%),radial-gradient(ellipse_at_80%_20%,rgba(59,130,246,0.08),transparent_45%)]',
    'hero-surface':
        'overflow-hidden border border-cyan-500/20 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_35%),linear-gradient(135deg,rgba(15,23,42,0.94),rgba(17,24,39,0.86))] shadow-[0_22px_60px_-34px_rgba(6,182,212,0.5)]',
    'status-badge': 'border border-emerald-500/30 bg-emerald-500/10 text-xs font-medium text-emerald-100',
    'metric-chip': 'border border-white/10 bg-slate-950/45',
    'action-button':
        'bg-cyan-500 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400',
    'floating-rail': 'pointer-events-auto border border-white/10 bg-slate-950/85 p-3 backdrop-blur-xl',
    'card-soft': 'border border-white/10 bg-slate-800/35 px-4 py-3',
    tooltip:
        'pointer-events-none absolute right-[calc(100%+12px)] top-1/2 -translate-y-1/2 whitespace-nowrap border border-white/10 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-100 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100',
    'empty-border': 'border border-dashed border-white/10 bg-slate-900/55',
    'placeholder-surface': 'rounded-lg border border-white/6 bg-slate-950/45',
    'icon-well': 'flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-slate-950/55 text-cyan-200',
    'quick-action-button':
        'flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-slate-900 text-slate-100 transition-colors duration-150 group-hover:border-cyan-400/40 group-hover:text-cyan-200 group-focus-within:border-cyan-400/40 group-focus-within:text-cyan-200',
    'focus-ring':
        'rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
    'skeleton-action': 'h-12 w-12 animate-pulse rounded-xl border border-white/10 bg-slate-800/80'
} as const
