import { cva, type VariantProps } from 'class-variance-authority'
import {
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
  forwardRef,
  useId,
} from 'react'
import { cn } from '@/lib/utils'

// ─── Base input styles ────────────────────────────────────────────────────────

const inputVariants = cva(
  [
    'w-full h-10 px-3 rounded-xl border-[1.5px] bg-white',
    'text-sm text-zinc-900 placeholder:text-zinc-400',
    'font-[DM_Sans,sans-serif]',
    'outline-none transition-[border-color,box-shadow] duration-150',
    'hover:border-emerald-200',
    'focus:border-emerald-700 focus:shadow-[0_0_0_3px_rgba(26,107,82,.10)]',
    'disabled:bg-zinc-50 disabled:text-zinc-400 disabled:cursor-not-allowed',
  ],
  {
    variants: {
      state: {
        default: 'border-zinc-200',
        error:   [
          'border-red-300',
          'focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(185,28,28,.08)]',
        ],
      },
    },
    defaultVariants: { state: 'default' },
  }
)

// ─── Field wrapper (label + input + hint/error) ────────────────────────────────

interface FieldProps {
  label?: string
  hint?: string
  error?: string
  className?: string
  children: ReactNode
}

function Field({ label, hint, error, className, children }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <span className="text-[13px] font-medium text-zinc-600 leading-none">{label}</span>
      )}
      {children}
      {error && !hint && (
        <span className="text-[12px] text-red-600 flex items-center gap-1">{error}</span>
      )}
      {hint && !error && (
        <span className="text-[12px] text-zinc-400">{hint}</span>
      )}
    </div>
  )
}

// ─── Input ────────────────────────────────────────────────────────────────────

export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string
  hint?: string
  error?: string
  /** Icon node on the left — use a Tabler icon or any 16px SVG */
  leftIcon?: ReactNode
  /** Icon node on the right */
  rightIcon?: ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      state,
      label,
      hint,
      error,
      leftIcon,
      rightIcon,
      id: providedId,
      ...props
    },
    ref
  ) => {
    const autoId = useId()
    const id = providedId ?? autoId
    const resolvedState = error ? 'error' : state

    return (
      <Field label={label} hint={hint} error={error}>
        <div className="relative flex items-center">
          {leftIcon && (
            <span
              className="absolute left-3 text-zinc-400 text-base pointer-events-none"
              aria-hidden="true"
            >
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            className={cn(
              inputVariants({ state: resolvedState }),
              leftIcon  && 'pl-9',
              rightIcon && 'pr-9',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span
              className="absolute right-3 text-zinc-400 text-base pointer-events-none"
              aria-hidden="true"
            >
              {rightIcon}
            </span>
          )}
        </div>
      </Field>
    )
  }
)
Input.displayName = 'Input'

// ─── Textarea ─────────────────────────────────────────────────────────────────

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
  error?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, hint, error, id: providedId, ...props }, ref) => {
    const autoId = useId()
    const id = providedId ?? autoId

    return (
      <Field label={label} hint={hint} error={error}>
        <textarea
          ref={ref}
          id={id}
          className={cn(
            'w-full px-3 py-2.5 rounded-xl border-[1.5px] bg-white',
            'text-sm text-zinc-900 placeholder:text-zinc-400 leading-relaxed',
            'outline-none resize-y min-h-[88px]',
            'transition-[border-color,box-shadow] duration-150',
            'hover:border-emerald-200',
            error
              ? 'border-red-300 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(185,28,28,.08)]'
              : 'border-zinc-200 focus:border-emerald-700 focus:shadow-[0_0_0_3px_rgba(26,107,82,.10)]',
            'disabled:bg-zinc-50 disabled:text-zinc-400 disabled:cursor-not-allowed',
            className
          )}
          {...props}
        />
      </Field>
    )
  }
)
Textarea.displayName = 'Textarea'

// ─── Checkbox ─────────────────────────────────────────────────────────────────

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id: providedId, ...props }, ref) => {
    const autoId = useId()
    const id = providedId ?? autoId

    return (
      <label
        htmlFor={id}
        className="inline-flex items-center gap-2 cursor-pointer group"
      >
        <input
          ref={ref}
          type="checkbox"
          id={id}
          className={cn(
            'w-4 h-4 rounded-[4px] border-[1.5px] border-zinc-300 appearance-none',
            'bg-white cursor-pointer transition-all duration-120',
            'checked:bg-emerald-800 checked:border-emerald-800',
            "checked:bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M2 6l3 3 5-5' stroke='%23fff' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")] bg-center bg-no-repeat",
            'focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1 outline-none',
            className
          )}
          {...props}
        />
        {label && (
          <span className="text-sm text-zinc-700 group-hover:text-zinc-900 transition-colors">
            {label}
          </span>
        )}
      </label>
    )
  }
)
Checkbox.displayName = 'Checkbox'

// ─── Radio ────────────────────────────────────────────────────────────────────

export interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, id: providedId, ...props }, ref) => {
    const autoId = useId()
    const id = providedId ?? autoId

    return (
      <label
        htmlFor={id}
        className="inline-flex items-center gap-2 cursor-pointer group"
      >
        <input
          ref={ref}
          type="radio"
          id={id}
          className={cn(
            'w-4 h-4 rounded-full border-[1.5px] border-zinc-300 appearance-none',
            'bg-white cursor-pointer transition-all duration-120',
            'checked:border-[4px] checked:border-emerald-800',
            'focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1 outline-none',
            className
          )}
          {...props}
        />
        {label && (
          <span className="text-sm text-zinc-700 group-hover:text-zinc-900 transition-colors">
            {label}
          </span>
        )}
      </label>
    )
  }
)
Radio.displayName = 'Radio'

export { Input, Textarea, Checkbox, Radio, Field }