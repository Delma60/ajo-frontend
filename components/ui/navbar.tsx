'use client'

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavbarContextValue {
  /** Whether the mobile drawer is open */
  mobileOpen: boolean
  toggleMobile: () => void
  closeMobile: () => void
  /** Whether the user has scrolled past the threshold */
  scrolled: boolean
  /** Currently active path (for link highlighting) */
  activePath: string
  setActivePath: (path: string) => void
}

// ─── Context ──────────────────────────────────────────────────────────────────

const NavbarContext = createContext<NavbarContextValue | null>(null)

export function useNavbar(): NavbarContextValue {
  const ctx = useContext(NavbarContext)
  if (!ctx) throw new Error('useNavbar must be used inside <NavbarProvider>')
  return ctx
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export interface NavbarProviderProps {
  children: ReactNode
  /** Scroll distance in px before the navbar "elevates". Default: 8 */
  scrollThreshold?: number
  /** Initial active path. Defaults to window.location.pathname */
  defaultPath?: string
}

export function NavbarProvider({
  children,
  scrollThreshold = 8,
  defaultPath,
}: NavbarProviderProps) {
  const resolvePath = () =>
    defaultPath ?? (typeof window !== 'undefined' ? window.location.pathname : '/')

  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activePath, setActivePath] = useState(resolvePath)

  const toggleMobile = useCallback(() => setMobileOpen((p) => !p), [])
  const closeMobile = useCallback(() => setMobileOpen(false), [])

  // Scroll detection
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > scrollThreshold)
    window.addEventListener('scroll', handler, { passive: true })
    handler()
    return () => window.removeEventListener('scroll', handler)
  }, [scrollThreshold])

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  // Close mobile drawer on resize to desktop
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const handler = (e: MediaQueryListEvent) => { if (e.matches) closeMobile() }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [closeMobile])

  return (
    <NavbarContext.Provider
      value={{ mobileOpen, toggleMobile, closeMobile, scrolled, activePath, setActivePath }}
    >
      {children}
    </NavbarContext.Provider>
  )
}

// ─── Navbar Root ──────────────────────────────────────────────────────────────

export interface NavbarProps extends HTMLAttributes<HTMLElement> {
  /** Pin to top of viewport. Default: true */
  sticky?: boolean
}

export const Navbar = forwardRef<HTMLElement, NavbarProps>(
  ({ className, sticky = true, children, ...props }, ref) => {
    const { scrolled } = useNavbar()

    return (
        <NavbarProvider>
            <header
                ref={ref}
                className={cn(
                'w-full z-30',
                sticky && 'sticky top-0',
                'bg-white/[.97] dark:bg-zinc-950/[.97]',
                'backdrop-blur-md',
                'transition-all duration-300',
                scrolled
                    ? 'shadow-[0_1px_0_rgba(0,0,0,.06),0_8px_32px_rgba(0,0,0,.06)] dark:shadow-[0_1px_0_rgba(255,255,255,.04),0_8px_32px_rgba(0,0,0,.4)]'
                    : 'border-b border-zinc-100 dark:border-zinc-800/70',
                className,
                )}
                {...props}
            >
                {children}
            </header>
        </NavbarProvider>
    )
  }
)
Navbar.displayName = 'Navbar'

// ─── Navbar Container ─────────────────────────────────────────────────────────

export const NavbarContainer = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'mx-auto max-w-7xl px-4 sm:px-6',
        'flex h-16 items-center gap-4',
        className,
      )}
      {...props}
    />
  )
)
NavbarContainer.displayName = 'NavbarContainer'

// ─── Navbar Brand ─────────────────────────────────────────────────────────────

export interface NavbarBrandProps extends HTMLAttributes<HTMLAnchorElement> {
  href?: string
}

export const NavbarBrand = forwardRef<HTMLAnchorElement, NavbarBrandProps>(
  ({ className, href = '/', children, ...props }, ref) => (
    <a
      ref={ref}
      href={href}
      className={cn(
        'shrink-0 flex items-center gap-2.5 group',
        'outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 rounded-lg',
        className,
      )}
      {...props}
    >
      {children}
    </a>
  )
)
NavbarBrand.displayName = 'NavbarBrand'

// ─── Navbar Content (desktop nav area) ───────────────────────────────────────

export const NavbarContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <nav
      ref={ref}
      aria-label="Main navigation"
      className={cn('hidden md:flex flex-1 items-center', className)}
      {...props}
    />
  )
)
NavbarContent.displayName = 'NavbarContent'

// ─── Navbar Actions (right side slot) ────────────────────────────────────────

export const NavbarActions = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center gap-1.5 ml-auto', className)}
      {...props}
    />
  )
)
NavbarActions.displayName = 'NavbarActions'

// ─── Navbar Divider ───────────────────────────────────────────────────────────

export const NavbarDivider = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="separator"
      aria-hidden="true"
      className={cn('w-px h-5 bg-zinc-200 dark:bg-zinc-700 mx-1', className)}
      {...props}
    />
  )
)
NavbarDivider.displayName = 'NavbarDivider'

// ─── Navbar Link ──────────────────────────────────────────────────────────────

export interface NavbarLinkProps extends HTMLAttributes<HTMLAnchorElement> {
  href: string
  /** Treat this link as active regardless of activePath */
  active?: boolean
  /** Match loosely (startsWith) instead of exact match. Default: false */
  matchPrefix?: boolean
}

export const NavbarLink = forwardRef<HTMLAnchorElement, NavbarLinkProps>(
  ({ className, href, active, matchPrefix = false, onClick, children, ...props }, ref) => {
    const { activePath, setActivePath, closeMobile } = useNavbar()
    const isActive =
      active ??
      (matchPrefix ? activePath.startsWith(href) : activePath === href)

    return (
      <a
        ref={ref}
        href={href}
        aria-current={isActive ? 'page' : undefined}
        onClick={(e) => {
          setActivePath(href)
          closeMobile()
          onClick?.(e)
        }}
        className={cn(
          'relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
          'text-[13.5px] font-medium tracking-[-0.01em] leading-none',
          'transition-colors duration-150 outline-none select-none',
          'focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1',
          isActive
            ? 'text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50'
            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/50',
          className,
        )}
        {...props}
      >
        {isActive && (
          <span
            aria-hidden
            className="absolute inset-x-2 -bottom-[1px] h-[2px] rounded-full bg-emerald-600 dark:bg-emerald-500"
          />
        )}
        {children}
      </a>
    )
  }
)
NavbarLink.displayName = 'NavbarLink'

// ─── Navbar Dropdown ──────────────────────────────────────────────────────────

export interface NavbarDropdownProps extends HTMLAttributes<HTMLDivElement> {
  trigger: ReactNode
  active?: boolean
}

export function NavbarDropdown({ trigger, active, children, className, ...props }: NavbarDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div
      ref={ref}
      className={cn('relative', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((p) => !p)}
        className={cn(
          'flex items-center gap-1 px-3 py-1.5 rounded-lg',
          'text-[13.5px] font-medium tracking-[-0.01em] leading-none',
          'transition-colors duration-150 outline-none select-none',
          'focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1',
          active || open
            ? 'text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50'
            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/50',
        )}
      >
        {trigger}
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden
          className={cn('opacity-50 transition-transform duration-200', open && 'rotate-180')}
        >
          <path d="M6 8 2 4h8L6 8Z" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            'absolute top-[calc(100%+6px)] left-1/2 -translate-x-1/2 z-50',
            'min-w-[176px] py-1.5',
            'rounded-2xl border border-zinc-200/80 dark:border-zinc-700/60',
            'bg-white dark:bg-zinc-900',
            'shadow-xl shadow-zinc-200/50 dark:shadow-black/50',
            'animate-in fade-in zoom-in-95 slide-in-from-top-1 duration-150',
          )}
        >
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Navbar Dropdown Item ─────────────────────────────────────────────────────

export interface NavbarDropdownItemProps extends HTMLAttributes<HTMLAnchorElement> {
  href: string
  icon?: ReactNode
}

export const NavbarDropdownItem = forwardRef<HTMLAnchorElement, NavbarDropdownItemProps>(
  ({ className, href, icon, children, onClick, ...props }, ref) => {
    const { setActivePath, closeMobile } = useNavbar()

    return (
      <a
        ref={ref}
        href={href}
        role="menuitem"
        onClick={(e) => {
          setActivePath(href)
          closeMobile()
          onClick?.(e)
        }}
        className={cn(
          'flex items-center gap-2.5 px-4 py-2.5',
          'text-[13px] font-medium text-zinc-700 dark:text-zinc-300',
          'hover:bg-emerald-50 dark:hover:bg-emerald-950/40',
          'hover:text-emerald-800 dark:hover:text-emerald-300',
          'transition-colors duration-100 outline-none',
          'focus-visible:bg-emerald-50 dark:focus-visible:bg-emerald-950/40',
          className,
        )}
        {...props}
      >
        {icon && (
          <span className="shrink-0 text-zinc-400 dark:text-zinc-500 w-4 h-4 flex items-center justify-center">
            {icon}
          </span>
        )}
        {children}
      </a>
    )
  }
)
NavbarDropdownItem.displayName = 'NavbarDropdownItem'

// ─── Navbar Dropdown Separator ────────────────────────────────────────────────

export const NavbarDropdownSeparator = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="separator"
      className={cn('my-1 h-px bg-zinc-100 dark:bg-zinc-800 mx-2', className)}
      {...props}
    />
  )
)
NavbarDropdownSeparator.displayName = 'NavbarDropdownSeparator'

// ─── Navbar Icon Button ───────────────────────────────────────────────────────

export interface NavbarIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  badge?: number
  label: string
}

export const NavbarIconButton = forwardRef<HTMLButtonElement, NavbarIconButtonProps>(
  ({ className, badge = 0, label, children, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-label={badge > 0 ? `${label} (${badge} unread)` : label}
      className={cn(
        'relative flex h-9 w-9 items-center justify-center rounded-xl',
        'text-zinc-500 dark:text-zinc-400',
        'hover:bg-zinc-100 dark:hover:bg-zinc-800',
        'hover:text-zinc-900 dark:hover:text-zinc-100',
        'transition-colors duration-150 outline-none',
        'focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2',
        className,
      )}
      {...props}
    >
      {children}
      {badge > 0 && (
        <span
          aria-hidden
          className="absolute top-1.5 right-1.5 h-[7px] w-[7px] rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-950"
        />
      )}
    </button>
  )
)
NavbarIconButton.displayName = 'NavbarIconButton'

// ─── Navbar Trigger (hamburger — mobile only) ─────────────────────────────────

export const NavbarTrigger = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => {
    const { mobileOpen, toggleMobile } = useNavbar()
    return (
      <button
        ref={ref}
        type="button"
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={mobileOpen}
        onClick={toggleMobile}
        className={cn(
          'md:hidden flex h-9 w-9 items-center justify-center rounded-xl',
          'text-zinc-500 dark:text-zinc-400',
          'hover:bg-zinc-100 dark:hover:bg-zinc-800',
          'hover:text-zinc-900 dark:hover:text-zinc-100',
          'transition-colors duration-150 outline-none',
          'focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2',
          className,
        )}
        {...props}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
          <rect
            x="2" y="4.5" width="14" height="1.5" rx=".75" fill="currentColor"
            className="transition-all duration-200 origin-center"
            style={{ transform: mobileOpen ? 'rotate(45deg) translate(2.5px, 2.5px)' : 'none' }}
          />
          <rect
            x="2" y="8.25" width="14" height="1.5" rx=".75" fill="currentColor"
            className="transition-all duration-200"
            style={{ opacity: mobileOpen ? 0 : 1 }}
          />
          <rect
            x="2" y="12" width="14" height="1.5" rx=".75" fill="currentColor"
            className="transition-all duration-200 origin-center"
            style={{ transform: mobileOpen ? 'rotate(-45deg) translate(2.5px, -2.5px)' : 'none' }}
          />
        </svg>
      </button>
    )
  }
)
NavbarTrigger.displayName = 'NavbarTrigger'

// ─── Navbar Overlay ───────────────────────────────────────────────────────────

export const NavbarOverlay = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { mobileOpen, closeMobile } = useNavbar()
    return (
      <div
        ref={ref}
        aria-hidden="true"
        onClick={closeMobile}
        className={cn(
          'fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px]',
          'md:hidden transition-opacity duration-300',
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
          className,
        )}
        {...props}
      />
    )
  }
)
NavbarOverlay.displayName = 'NavbarOverlay'

// ─── Navbar Drawer ────────────────────────────────────────────────────────────

export interface NavbarDrawerProps extends HTMLAttributes<HTMLDivElement> {
  width?: number
  side?: 'left' | 'right'
}

export const NavbarDrawer = forwardRef<HTMLDivElement, NavbarDrawerProps>(
  ({ className, width = 280, side = 'left', children, ...props }, ref) => {
    const { mobileOpen } = useNavbar()

    return (
      <aside
        ref={ref}
        aria-modal="true"
        role="dialog"
        style={{ width }}
        className={cn(
          'fixed inset-y-0 z-50 md:hidden flex flex-col',
          'bg-white dark:bg-zinc-950',
          'transition-transform duration-300 ease-in-out',
          'shadow-2xl shadow-black/20',
          side === 'left'
            ? ['left-0 border-r border-zinc-200 dark:border-zinc-800', mobileOpen ? 'translate-x-0' : '-translate-x-full']
            : ['right-0 border-l border-zinc-200 dark:border-zinc-800', mobileOpen ? 'translate-x-0' : 'translate-x-full'],
          className,
        )}
        {...props}
      >
        {children}
      </aside>
    )
  }
)
NavbarDrawer.displayName = 'NavbarDrawer'

// ─── Navbar Drawer Header ─────────────────────────────────────────────────────

export const NavbarDrawerHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-between h-16 px-4 shrink-0',
        'border-b border-zinc-100 dark:border-zinc-800',
        className,
      )}
      {...props}
    />
  )
)
NavbarDrawerHeader.displayName = 'NavbarDrawerHeader'

// ─── Navbar Drawer Close ──────────────────────────────────────────────────────

export const NavbarDrawerClose = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => {
    const { closeMobile } = useNavbar()
    return (
      <button
        ref={ref}
        type="button"
        aria-label="Close menu"
        onClick={closeMobile}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-xl',
          'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200',
          'hover:bg-zinc-100 dark:hover:bg-zinc-800',
          'transition-colors duration-150 outline-none',
          'focus-visible:ring-2 focus-visible:ring-emerald-600',
          className,
        )}
        {...props}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M2 2l12 12M14 2 2 14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      </button>
    )
  }
)
NavbarDrawerClose.displayName = 'NavbarDrawerClose'

// ─── Navbar Drawer Scroll Area ────────────────────────────────────────────────

export const NavbarDrawerScrollArea = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex-1 overflow-y-auto overflow-x-hidden px-3 py-3', className)}
      {...props}
    />
  )
)
NavbarDrawerScrollArea.displayName = 'NavbarDrawerScrollArea'

// ─── Navbar Drawer Footer ─────────────────────────────────────────────────────

export const NavbarDrawerFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'shrink-0 px-4 py-4',
        'border-t border-zinc-100 dark:border-zinc-800',
        className,
      )}
      {...props}
    />
  )
)
NavbarDrawerFooter.displayName = 'NavbarDrawerFooter'

// ─── Navbar Drawer Link ───────────────────────────────────────────────────────

export interface NavbarDrawerLinkProps extends HTMLAttributes<HTMLAnchorElement> {
  href: string
  icon?: ReactNode
  active?: boolean
  matchPrefix?: boolean
}

export const NavbarDrawerLink = forwardRef<HTMLAnchorElement, NavbarDrawerLinkProps>(
  ({ className, href, icon, active, matchPrefix = false, onClick, children, ...props }, ref) => {
    const { activePath, setActivePath, closeMobile } = useNavbar()
    const isActive =
      active ?? (matchPrefix ? activePath.startsWith(href) : activePath === href)

    return (
      <a
        ref={ref}
        href={href}
        aria-current={isActive ? 'page' : undefined}
        onClick={(e) => {
          setActivePath(href)
          closeMobile()
          onClick?.(e)
        }}
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-xl w-full',
          'text-[14px] font-medium transition-colors duration-100 outline-none',
          'focus-visible:ring-2 focus-visible:ring-emerald-600',
          isActive
            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
            : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60',
          className,
        )}
        {...props}
      >
        {icon && (
          <span
            className={cn(
              'w-[18px] h-[18px] flex items-center justify-center shrink-0',
              isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-500',
            )}
          >
            {icon}
          </span>
        )}
        <span className="flex-1">{children}</span>
        {isActive && (
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
        )}
      </a>
    )
  }
)
NavbarDrawerLink.displayName = 'NavbarDrawerLink'

// ─── Navbar Drawer Section ────────────────────────────────────────────────────

export interface NavbarDrawerSectionProps extends HTMLAttributes<HTMLDivElement> {
  label?: string
}

export const NavbarDrawerSection = forwardRef<HTMLDivElement, NavbarDrawerSectionProps>(
  ({ className, label, children, ...props }, ref) => (
    <div ref={ref} className={cn('mb-2', className)} {...props}>
      {label && (
        <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-[.1em] text-zinc-400 dark:text-zinc-600">
          {label}
        </p>
      )}
      {children}
    </div>
  )
)
NavbarDrawerSection.displayName = 'NavbarDrawerSection'