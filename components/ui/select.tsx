'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

// 1. Create the Provider Context
interface SelectContextType {
  value?: string
  onValueChange?: (value: string) => void
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

const SelectContext = React.createContext<SelectContextType | undefined>(undefined)

function useSelectContext() {
  const context = React.useContext(SelectContext)
  if (!context) {
    throw new Error("Select components must be wrapped in a <Select> provider.")
  }
  return context
}

// 2. The Root Wrapper (Provider)
export function Select({
  value,
  onValueChange,
  children,
}: {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Handle clicking outside the dropdown to close it
  React.useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [isOpen])

  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen }}>
      <div ref={containerRef} className="relative w-full">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

// 3. The Trigger Button
export const SelectTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => {
    const { isOpen, setIsOpen } = useSelectContext()

    return (
      <button
        ref={ref}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
        {/* Chevron Icon that rotates when open */}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("h-4 w-4 opacity-50 transition-transform duration-200", isOpen && "rotate-180")}>
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

// 4. A helper to display the current value inside the Trigger
export function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value } = useSelectContext()
  return <span className="truncate">{value || placeholder}</span>
}

// 5. The Dropdown Menu
export const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const { isOpen } = useSelectContext()

    if (!isOpen) return null

    return (
      <div
        ref={ref}
        className={cn(
          "absolute z-50 mt-1 max-h-60 w-full overflow-hidden rounded-md border border-zinc-200 bg-white text-zinc-950 shadow-md animate-in fade-in-0 zoom-in-95",
          className
        )}
        {...props}
      >
        <div className="w-full overflow-auto p-1 max-h-60">
          {children}
        </div>
      </div>
    )
  }
)
SelectContent.displayName = "SelectContent"

// 6. Individual Options
export const SelectItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value: string }>(
  ({ className, children, value, ...props }, ref) => {
    const { value: selectedValue, onValueChange, setIsOpen } = useSelectContext()
    const isSelected = selectedValue === value

    return (
      <div
        ref={ref}
        onClick={() => {
          onValueChange?.(value)
          setIsOpen(false) // Close dropdown on selection
        }}
        className={cn(
          "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors hover:bg-zinc-100 focus:bg-zinc-100",
          isSelected && "font-medium text-zinc-900 bg-zinc-50",
          className
        )}
        {...props}
      >
        {/* Checkmark Icon for the selected item */}
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          {isSelected && (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
          )}
        </span>
        <span className="truncate">{children}</span>
      </div>
    )
  }
)
SelectItem.displayName = "SelectItem"