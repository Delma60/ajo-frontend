'use client'

import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/utils'
import { useSidebar } from './providers/sidebar'

// ─── Internal group context (for collapsible groups) ──────────────────────────

interface GroupContextValue {
  groupId: string
  expanded: boolean
  toggle: () => void
}
const GroupContext = createContext<GroupContextValue | null>(null)

// ─── Layout wrapper ───────────────────────────────────────────────────────────
// Wrap your page with this — it sets up the flex layout

export const SidebarLayout = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex h-screen w-full overflow-hidden bg-zinc-100 dark:bg-zinc-950', className)}
      {...props}
    />
  )
)
SidebarLayout.displayName = 'SidebarLayout'

// ─── Main content area ────────────────────────────────────────────────────────

export const SidebarContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <main
      ref={ref}
      className={cn('flex flex-1 flex-col overflow-auto min-w-0', className)}
      {...props}
    />
  )
)
SidebarContent.displayName = 'SidebarContent'

// ─── Mobile Overlay ───────────────────────────────────────────────────────────

export function SidebarOverlay() {
  const { mobileOpen, closeMobile } = useSidebar()
  return (
    <div
      aria-hidden="true"
      onClick={closeMobile}
      className={cn(
        'fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 md:hidden',
        mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      )}
    />
  )
}

// ─── Sidebar Root ─────────────────────────────────────────────────────────────

export interface SidebarProps extends HTMLAttributes<HTMLElement> {
  /** Width when expanded (default: 260px) */
  width?: number
  /** Width when collapsed to rail (default: 56px) */
  railWidth?: number
}

/**
 * The sidebar panel itself.
 * On desktop: slides in/out (or collapses to icon rail).
 * On mobile: fixed drawer that slides in from the side.
 */
export const Sidebar = forwardRef<HTMLElement, SidebarProps>(
  ({ className, width = 260, railWidth = 56, children, ...props }, ref) => {
    const { open, mobileOpen, side, isRail, closeMobile } = useSidebar()

    const desktopW = isRail ? railWidth : open ? width : 0
    const mobileTranslate = mobileOpen
      ? 'translate-x-0'
      : side === 'left'
        ? '-translate-x-full'
        : 'translate-x-full'

    return (
      <>
        {/* Desktop sidebar — participates in document flow */}
        <aside
          ref={ref}
          style={{ width: desktopW }}
          className={cn(
            'hidden md:flex flex-col shrink-0 overflow-hidden',
            'transition-[width] duration-300 ease-in-out',
            'bg-emerald-950 text-emerald-50',
            // subtle inner shadow on right edge
            side === 'left' && 'shadow-[inset_-1px_0_0_rgba(255,255,255,.06)]',
            side === 'right' && 'shadow-[inset_1px_0_0_rgba(255,255,255,.06)]',
            className
          )}
          {...props}
        >
          {/* Inner wrapper keeps content at full width so it clips cleanly */}
          <div
            style={{ width }}
            className="flex flex-col flex-1 min-h-0 overflow-hidden"
          >
            {children}
          </div>
        </aside>

        {/* Mobile overlay + drawer */}
        <SidebarOverlay />
        <aside
          style={{ width }}
          className={cn(
            'fixed inset-y-0 z-50 flex flex-col md:hidden',
            'bg-emerald-950 text-emerald-50',
            'transition-transform duration-300 ease-in-out',
            mobileTranslate,
            side === 'left' ? 'left-0' : 'right-0',
          )}
          aria-modal="true"
          role="dialog"
        >
          {children}
        </aside>
      </>
    )
  }
)
Sidebar.displayName = 'Sidebar'

// ─── Sidebar Header ───────────────────────────────────────────────────────────

export const SidebarHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { isRail } = useSidebar()
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-3 shrink-0 h-16 px-4',
          'border-b border-white/[.07]',
          isRail && 'px-0 justify-center',
          className
        )}
        {...props}
      />
    )
  }
)
SidebarHeader.displayName = 'SidebarHeader'

// ─── Sidebar Footer ───────────────────────────────────────────────────────────

export const SidebarFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { isRail } = useSidebar()
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center shrink-0 px-3 py-3 mt-auto',
          'border-t border-white/[.07]',
          isRail && 'px-0 justify-center',
          className
        )}
        {...props}
      />
    )
  }
)
SidebarFooter.displayName = 'SidebarFooter'

// ─── Sidebar Scroll Area ──────────────────────────────────────────────────────

export const SidebarScrollArea = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex-1 overflow-y-auto overflow-x-hidden min-h-0',
        'scrollbar-thin scrollbar-thumb-emerald-800 scrollbar-track-transparent',
        className
      )}
      {...props}
    />
  )
)
SidebarScrollArea.displayName = 'SidebarScrollArea'

// ─── Sidebar Group ────────────────────────────────────────────────────────────

export interface SidebarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Whether this group is collapsible */
  collapsible?: boolean
  /** Default expanded state when collapsible (default: true) */
  defaultExpanded?: boolean
}

export const SidebarGroup = forwardRef<HTMLDivElement, SidebarGroupProps>(
  ({ className, collapsible = false, defaultExpanded = true, children, ...props }, ref) => {
    const groupId = useId()
    const [expanded, setExpanded] = useState(defaultExpanded)
    const toggle = () => setExpanded(p => !p)

    return (
      <GroupContext.Provider value={{ groupId, expanded, toggle }}>
        <div
          ref={ref}
          className={cn('flex flex-col py-2', className)}
          {...props}
        >
          {children}
        </div>
      </GroupContext.Provider>
    )
  }
)
SidebarGroup.displayName = 'SidebarGroup'

// ─── Sidebar Group Label ──────────────────────────────────────────────────────

export const SidebarGroupLabel = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => {
    const { isRail } = useSidebar()
    const group = useContext(GroupContext)

    if (isRail) return null // labels hidden in rail mode

    const isCollapsible = !!group

    const handleClick = () => group?.toggle()

    return (
      <button
        ref={ref}
        type="button"
        onClick={isCollapsible ? handleClick : undefined}
        className={cn(
          'flex items-center justify-between w-full px-4 py-1.5 mb-0.5',
          'text-[10px] font-semibold uppercase tracking-[.12em] text-emerald-400/60',
          'select-none',
          isCollapsible && 'hover:text-emerald-400/90 transition-colors cursor-pointer',
          className
        )}
        {...props}
      >
        <span>{children}</span>
        {isCollapsible && (
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            className={cn(
              'shrink-0 transition-transform duration-200',
              group?.expanded ? 'rotate-0' : '-rotate-90'
            )}
            fill="currentColor"
          >
            <path d="M5 7 1 3h8L5 7Z" />
          </svg>
        )}
      </button>
    )
  }
)
SidebarGroupLabel.displayName = 'SidebarGroupLabel'

// ─── Sidebar Group Content (animated collapse) ────────────────────────────────

export const SidebarGroupContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const group = useContext(GroupContext)
    const contentRef = useRef<HTMLDivElement>(null)
    const [height, setHeight] = useState<number | 'auto'>('auto')

    useEffect(() => {
      if (!contentRef.current) return
      if (group?.expanded) {
        // Get the full scroll height before we start animating
        const h = contentRef.current.scrollHeight
        setHeight(h)
        // After transition, release to auto so it adapts to dynamic content
        const t = setTimeout(() => setHeight('auto'), 250)
        return () => clearTimeout(t)
      } else {
        // Snapshot current height first so transition has a from-value
        const h = contentRef.current.scrollHeight
        setHeight(h)
        requestAnimationFrame(() => setHeight(0))
      }
    }, [group?.expanded])

    return (
      <div
        ref={contentRef}
        style={{ height: group ? height : 'auto', overflow: 'hidden' }}
        className={cn('transition-[height] duration-250 ease-in-out', className)}
      >
        <div ref={ref} {...props} />
      </div>
    )
  }
)
SidebarGroupContent.displayName = 'SidebarGroupContent'

// ─── Sidebar Item ─────────────────────────────────────────────────────────────

export interface SidebarItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icon element — should be ~18px */
  icon?: ReactNode
  /** Right-side badge (string or number) */
  badge?: string | number
  /** Whether this item is the active route */
  active?: boolean
  /** Tooltip shown in rail mode */
  tooltip?: string
  /** Make item render as an anchor tag */
  asChild?: boolean
}

export const SidebarItem = forwardRef<HTMLButtonElement, SidebarItemProps>(
  ({ className, icon, badge, active, tooltip, children, ...props }, ref) => {
    const { isRail } = useSidebar()
    const [showTooltip, setShowTooltip] = useState(false)

    return (
      <div className="relative px-2">
        <button
          ref={ref}
          type="button"
          aria-current={active ? 'page' : undefined}
          onMouseEnter={() => isRail && setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onFocus={() => isRail && setShowTooltip(true)}
          onBlur={() => setShowTooltip(false)}
          className={cn(
            'group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5',
            'text-[13.5px] font-medium leading-none tracking-[-0.01em]',
            'transition-all duration-150 ease-out',
            'select-none outline-none',
            // default state
            'text-emerald-100/70 hover:text-emerald-50',
            'hover:bg-white/[.07]',
            // active state
            active && [
              'bg-white/[.10] text-emerald-50',
              'shadow-[inset_0_1px_0_rgba(255,255,255,.08),inset_0_0_0_1px_rgba(255,255,255,.06)]',
            ],
            // rail mode: center icon
            isRail && 'justify-center px-0 py-2.5 w-10 mx-auto',
            className
          )}
          {...props}
        >
          {/* Active indicator bar */}
          {active && !isRail && (
            <span
              aria-hidden
              className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-emerald-400"
            />
          )}

          {/* Icon */}
          {icon && (
            <span
              aria-hidden
              className={cn(
                'shrink-0 flex items-center justify-center w-[18px] text-[18px]',
                active ? 'text-emerald-400' : 'text-emerald-300/50 group-hover:text-emerald-300/80',
                'transition-colors duration-150'
              )}
            >
              {icon}
            </span>
          )}

          {/* Label */}
          {!isRail && (
            <span className="flex-1 truncate text-left">{children}</span>
          )}

          {/* Badge */}
          {!isRail && badge !== undefined && (
            <span className={cn(
              'ml-auto shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold leading-none tabular-nums',
              active
                ? 'bg-emerald-400/20 text-emerald-300'
                : 'bg-white/[.08] text-emerald-200/50'
            )}>
              {badge}
            </span>
          )}
        </button>

        {/* Rail tooltip */}
        {isRail && tooltip && showTooltip && (
          <div
            role="tooltip"
            className={cn(
              'pointer-events-none absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2 z-50',
              'whitespace-nowrap rounded-lg bg-zinc-900 px-3 py-1.5',
              'text-[12px] font-medium text-zinc-100',
              'shadow-xl ring-1 ring-white/10',
              'animate-in fade-in slide-in-from-left-1 duration-150'
            )}
          >
            {tooltip}
            {badge !== undefined && (
              <span className="ml-2 text-emerald-400">{badge}</span>
            )}
          </div>
        )}
      </div>
    )
  }
)
SidebarItem.displayName = 'SidebarItem'

// ─── Sidebar Separator ────────────────────────────────────────────────────────

export const SidebarSeparator = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mx-4 my-1 h-px bg-white/[.06]', className)}
      {...props}
    />
  )
)
SidebarSeparator.displayName = 'SidebarSeparator'

// ─── Sidebar Trigger (hamburger / collapse button) ────────────────────────────

export interface SidebarTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 'toggle' collapses desktop sidebar; 'mobile' opens mobile drawer */
  variant?: 'toggle' | 'mobile'
}

export const SidebarTrigger = forwardRef<HTMLButtonElement, SidebarTriggerProps>(
  ({ className, variant = 'mobile', ...props }, ref) => {
    const { toggle, toggleMobile, open, mobileOpen } = useSidebar()

    const handleClick = variant === 'toggle' ? toggle : toggleMobile
    const isOpen = variant === 'toggle' ? open : mobileOpen

    return (
      <button
        ref={ref}
        type="button"
        aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
        aria-expanded={isOpen}
        onClick={handleClick}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-xl',
          'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100',
          'dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-800',
          'transition-colors duration-150 outline-none',
          'focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2',
          className
        )}
        {...props}
      >
        <SidebarTriggerIcon open={isOpen} />
      </button>
    )
  }
)
SidebarTrigger.displayName = 'SidebarTrigger'

function SidebarTriggerIcon({ open }: { open: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <rect
        x="2" y="4.5" width="14" height="1.5" rx=".75" fill="currentColor"
        className="transition-all duration-200 origin-center"
        style={{ transform: open ? 'rotate(45deg) translate(2.5px, 2.5px)' : 'none' }}
      />
      <rect
        x="2" y="8.25" width="14" height="1.5" rx=".75" fill="currentColor"
        className="transition-all duration-200"
        style={{ opacity: open ? 0 : 1 }}
      />
      <rect
        x="2" y="12" width="14" height="1.5" rx=".75" fill="currentColor"
        className="transition-all duration-200 origin-center"
        style={{ transform: open ? 'rotate(-45deg) translate(2.5px, -2.5px)' : 'none' }}
      />
    </svg>
  )
}

// ─── Rail Toggle (collapse to icon mode) ─────────────────────────────────────

export const SidebarRailToggle = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => {
    const { isRail, toggleRail } = useSidebar()

    return (
      <button
        ref={ref}
        type="button"
        aria-label={isRail ? 'Expand sidebar' : 'Collapse to icons'}
        onClick={toggleRail}
        className={cn(
          'group flex h-7 w-7 items-center justify-center rounded-lg',
          'text-emerald-400/40 hover:text-emerald-300/80',
          'hover:bg-white/[.06] transition-all duration-150',
          'outline-none focus-visible:ring-1 focus-visible:ring-emerald-400/40',
          className
        )}
        {...props}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden
          className={cn('transition-transform duration-200', isRail && 'rotate-180')}
        >
          <path
            d="M8.5 2.5L4.5 7l4 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="10.5" y1="2.5" x2="10.5" y2="11.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeOpacity=".4"
          />
        </svg>
      </button>
    )
  }
)
SidebarRailToggle.displayName = 'SidebarRailToggle'

// ─── Sidebar User Card ────────────────────────────────────────────────────────

export interface SidebarUserProps {
  name: string
  email?: string
  avatar?: string
  /** Initials fallback when no avatar */
  initials?: string
  /** Called when the user card is clicked */
  onClick?: () => void
}

export function SidebarUser({ name, email, avatar, initials, onClick }: SidebarUserProps) {
  const { isRail } = useSidebar()
  const abbr = initials ?? name.slice(0, 2).toUpperCase()

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex w-full items-center gap-3 rounded-xl p-2',
        'hover:bg-white/[.07] transition-colors duration-150',
        'outline-none focus-visible:ring-1 focus-visible:ring-emerald-400/40',
        isRail && 'justify-center p-1'
      )}
    >
      {/* Avatar */}
      <span className="relative shrink-0">
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="h-8 w-8 rounded-full object-cover ring-1 ring-white/10"
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-700/60 ring-1 ring-white/10 text-[11px] font-bold text-emerald-200 uppercase tracking-wide">
            {abbr}
          </span>
        )}
        {/* Online indicator */}
        <span
          aria-hidden
          className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-emerald-950 bg-emerald-400"
        />
      </span>

      {/* Info */}
      {!isRail && (
        <div className="flex-1 min-w-0 text-left">
          <p className="truncate text-[13px] font-medium leading-none text-emerald-50 mb-1">{name}</p>
          {email && (
            <p className="truncate text-[11px] leading-none text-emerald-300/40">{email}</p>
          )}
        </div>
      )}

      {/* Chevron */}
      {!isRail && (
        <svg
          width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden
          className="shrink-0 text-emerald-400/30 group-hover:text-emerald-400/60 transition-colors"
        >
          <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}