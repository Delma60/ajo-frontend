import { cva, type VariantProps } from 'class-variance-authority'
import { type HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

// ─── Card shell ───────────────────────────────────────────────────────────────

const cardVariants = cva(
  'rounded-2xl border bg-white',
  {
    variants: {
      variant: {
        /** Default — clean bordered surface */
        default: 'border-zinc-200',
        /** Elevated — adds a soft ambient shadow, good for modals/featured */
        elevated: 'border-zinc-200 shadow-[0_1px_2px_rgba(0,0,0,.04),0_4px_12px_rgba(0,0,0,.06)]',
        /** Interactive — lifts on hover, used for group/cycle list items */
        interactive: [
          'border-zinc-200 cursor-pointer',
          'transition-[border-color,transform] duration-150 ease-out',
          'hover:border-emerald-400 hover:-translate-y-px',
          'active:translate-y-0',
        ],
        /** Tinted — brand-green wash, for highlights and CTAs */
        tinted: 'border-emerald-200 bg-emerald-50',
        /** Flat — no border, just a subtle background fill */
        flat: 'border-transparent bg-zinc-50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <div ref={ref} className={cn(cardVariants({ variant }), className)} {...props} />
  )
)
Card.displayName = 'Card'

// ─── Card Header ─────────────────────────────────────────────────────────────

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-5 pb-0', className)} {...props} />
  )
)
CardHeader.displayName = 'CardHeader'

// ─── Card Label (eyebrow text above the title) ────────────────────────────────

const CardLabel = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-[11px] font-medium uppercase tracking-[.09em] text-zinc-400 mb-1', className)}
      {...props}
    />
  )
)
CardLabel.displayName = 'CardLabel'

// ─── Card Title ───────────────────────────────────────────────────────────────

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-[15px] font-medium leading-snug tracking-[-0.01em] text-zinc-900', className)}
      {...props}
    />
  )
)
CardTitle.displayName = 'CardTitle'

// ─── Card Description ─────────────────────────────────────────────────────────

const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-[13px] leading-relaxed text-zinc-500', className)}
      {...props}
    />
  )
)
CardDescription.displayName = 'CardDescription'

// ─── Card Content ─────────────────────────────────────────────────────────────

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-5 pt-3', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

// ─── Card Divider ─────────────────────────────────────────────────────────────

const CardDivider = forwardRef<HTMLHRElement, HTMLAttributes<HTMLHRElement>>(
  ({ className, ...props }, ref) => (
    <hr ref={ref} className={cn('border-t border-zinc-100 mx-5', className)} {...props} />
  )
)
CardDivider.displayName = 'CardDivider'

// ─── Card Footer ──────────────────────────────────────────────────────────────

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('px-5 pb-5 pt-3 flex items-center gap-2', className)} {...props} />
  )
)
CardFooter.displayName = 'CardFooter'

// ─── Card Stat (metric block inside a card) ───────────────────────────────────

interface CardStatProps extends HTMLAttributes<HTMLDivElement> {
  label: string
  value: string
  sub?: string
}

const CardStat = forwardRef<HTMLDivElement, CardStatProps>(
  ({ label, value, sub, className, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props}>
      <p className="text-[11px] font-medium uppercase tracking-[.09em] text-zinc-400 mb-1">{label}</p>
      <p className="text-[22px] font-semibold tracking-[-0.03em] leading-none text-zinc-900">{value}</p>
      {sub && <p className="text-[13px] text-zinc-400 mt-1">{sub}</p>}
    </div>
  )
)
CardStat.displayName = 'CardStat'

// ─── Card Badge ───────────────────────────────────────────────────────────────

type BadgeVariant = 'green' | 'amber' | 'red' | 'gray'

const badgeStyles: Record<BadgeVariant, string> = {
  green: 'bg-emerald-50 text-emerald-800',
  amber: 'bg-amber-50  text-amber-800',
  red:   'bg-red-50    text-red-700',
  gray:  'bg-zinc-100  text-zinc-500',
}

interface CardBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: BadgeVariant
  dot?: boolean
}

const CardBadge = forwardRef<HTMLSpanElement, CardBadgeProps>(
  ({ color = 'gray', dot = false, className, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-medium',
        badgeStyles[color],
        className
      )}
      {...props}
    >
      {dot && (
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80 shrink-0" aria-hidden="true" />
      )}
      {children}
    </span>
  )
)
CardBadge.displayName = 'CardBadge'

// ─── Card Progress ────────────────────────────────────────────────────────────

interface CardProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  label?: string
  sublabel?: string
}

const CardProgress = forwardRef<HTMLDivElement, CardProgressProps>(
  ({ value, max = 100, label, sublabel, className, ...props }, ref) => {
    const pct = Math.min(100, Math.max(0, (value / max) * 100))
    return (
      <div ref={ref} className={cn('', className)} {...props}>
        {(label || sublabel) && (
          <div className="flex items-center justify-between text-[12px] text-zinc-400 mb-1.5">
            {label && <span>{label}</span>}
            {sublabel && <span>{sublabel}</span>}
          </div>
        )}
        <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-700 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    )
  }
)
CardProgress.displayName = 'CardProgress'

export {
  Card,
  CardHeader,
  CardLabel,
  CardTitle,
  CardDescription,
  CardContent,
  CardDivider,
  CardFooter,
  CardStat,
  CardBadge,
  CardProgress,
  cardVariants,
}