'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-1.5',
    'font-medium rounded-full text-sm leading-none tracking-[-0.01em]',
    'transition-all duration-150 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2',
    'disabled:opacity-40 disabled:pointer-events-none',
    'active:scale-[.97]',
    'select-none cursor-pointer whitespace-nowrap',
  ],
  {
    variants: {
      variant: {
        /** Main CTA — solid brand green */
        primary: [
          'bg-emerald-800 text-white',
          'hover:bg-emerald-700',
        ],
        /** Soft tinted — use for secondary actions alongside primary */
        secondary: [
          'bg-emerald-50 text-emerald-800',
          'hover:bg-emerald-100',
        ],
        /** Bordered — use in toolbars, filter rows */
        outline: [
          'bg-transparent text-zinc-900 border border-zinc-200',
          'hover:border-emerald-400 hover:text-emerald-800',
        ],
        /** No background — use for nav links and tertiary actions */
        ghost: [
          'bg-transparent text-zinc-500',
          'hover:bg-zinc-100 hover:text-zinc-900',
        ],
        /** Destructive action — leave group, delete, etc. */
        danger: [
          'bg-red-50 text-red-700',
          'hover:bg-red-100',
        ],
      },
      size: {
        sm:   'h-8  px-3.5 text-[13px]',
        md:   'h-10 px-5  text-sm',
        lg:   'h-12 px-7  text-[15px]',
        /** Square icon button — pair with rounded-xl to soften */
        icon: 'h-10 w-10 rounded-xl p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Shows a spinner and disables the button */
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {loading && (
        <span
          className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin shrink-0"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  )
)
Button.displayName = 'Button'

export { Button, buttonVariants }