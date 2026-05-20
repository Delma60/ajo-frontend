"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────────

type SheetSide = "top" | "right" | "bottom" | "left";

interface SheetContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  side: SheetSide;
  contentId: string;
  titleId: string;
  descriptionId: string;
}

// ─── Context ────────────────────────────────────────────────────────────────────

const SheetContext = React.createContext<SheetContextType | null>(null);

function useSheet(): SheetContextType {
  const ctx = React.useContext(SheetContext);
  if (!ctx) throw new Error("Sheet components must be used within a <Sheet />");
  return ctx;
}

// ─── Focus Trap ─────────────────────────────────────────────────────────────────

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(", ");

function useFocusTrap(
  ref: React.RefObject<HTMLElement | null>,
  active: boolean,
) {
  React.useEffect(() => {
    if (!active || !ref.current) return;

    const el = ref.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    // Focus first focusable element
    const first = el.querySelectorAll<HTMLElement>(FOCUSABLE)[0];
    first?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const focusables = Array.from(
        el.querySelectorAll<HTMLElement>(FOCUSABLE),
      );
      if (!focusables.length) return;

      const firstEl = focusables[0];
      const lastEl = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    }

    el.addEventListener("keydown", handleKeyDown);
    return () => {
      el.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [active, ref]);
}

// ─── Animation hook ─────────────────────────────────────────────────────────────
// Keeps the DOM node mounted for the exit animation, then unmounts.

function useAnimatedMount(open: boolean, durationMs = 300) {
  const [mounted, setMounted] = React.useState(open);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setMounted(true);
      // Defer to allow mount → paint → transition
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
      const timer = setTimeout(() => setMounted(false), durationMs);
      return () => clearTimeout(timer);
    }
  }, [open, durationMs]);

  return { mounted, visible };
}

// ─── Sheet Root ─────────────────────────────────────────────────────────────────

interface SheetProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: SheetSide;
}

export function Sheet({
  children,
  open: controlledOpen,
  onOpenChange,
  side = "right",
}: SheetProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  // Stable IDs for aria attributes
  const contentId = React.useId();
  const titleId = React.useId();
  const descriptionId = React.useId();

  return (
    <SheetContext.Provider
      value={{ open, setOpen, side, contentId, titleId, descriptionId }}
    >
      {children}
    </SheetContext.Provider>
  );
}

// ─── SheetTrigger ───────────────────────────────────────────────────────────────

interface SheetTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export function SheetTrigger({
  children,
  asChild,
  className,
  ...props
}: SheetTriggerProps) {
  const { setOpen, open, contentId } = useSheet();

  if (
    asChild &&
    React.isValidElement<React.HTMLAttributes<HTMLElement>>(children)
  ) {
    return React.cloneElement(children, {
      ...props,
      "aria-haspopup": "dialog",
      "aria-expanded": open,
      "aria-controls": contentId,
      onClick(e: React.MouseEvent<HTMLElement>) {
        setOpen(true);
        children.props.onClick?.(
          e as React.MouseEvent<HTMLElement> & React.MouseEvent<never>,
        );
      },
    } as React.HTMLAttributes<HTMLElement>);
  }

  return (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls={contentId}
      onClick={() => setOpen(true)}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}

// ─── SheetClose ─────────────────────────────────────────────────────────────────

export function SheetClose({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpen } = useSheet();
  return (
    <button
      type="button"
      onClick={() => setOpen(false)}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}

// ─── SheetContent ───────────────────────────────────────────────────────────────

const SIDE_STYLES: Record<SheetSide, string> = {
  top: "inset-x-0 top-0 border-b max-h-[90dvh] rounded-b translate-y-0",
  bottom: "inset-x-0 bottom-0 border-t max-h-[90dvh] rounded-t translate-y-0",
  left: "inset-y-0 left-0 h-[100dvh] w-3/4 border-r sm:max-w-sm rounded-r translate-x-0",
  right:
    "inset-y-0 right-0 h-[100dvh] w-3/4 border-l sm:max-w-sm rounded-l translate-x-0",
};

const ENTER_FROM: Record<SheetSide, string> = {
  top: "-translate-y-full",
  bottom: "translate-y-full",
  left: "-translate-x-full",
  right: "translate-x-full",
};

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  overlayClassName?: string;
}

export function SheetContent({
  children,
  className,
  overlayClassName,
  ...props
}: SheetContentProps) {
  const { open, setOpen, side, contentId, titleId, descriptionId } = useSheet();
  const panelRef = React.useRef<HTMLDivElement>(null);
  const { mounted, visible } = useAnimatedMount(open);

  // Focus trap — only while panel is visible
  useFocusTrap(panelRef, open);

  // Scroll lock
  React.useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted]);

  // Escape key
  React.useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  if (!mounted) return null;

  return createPortal(
    <div role="presentation">
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-sm transition-opacity duration-300",
          visible ? "opacity-100" : "opacity-0",
          overlayClassName,
        )}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        id={contentId}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={cn(
          "fixed z-50 flex flex-col bg-white shadow border border-zinc-200",
          "transition-transform duration-300 ease-in-out",
          SIDE_STYLES[side],
          visible ? "" : ENTER_FROM[side],
          className,
        )}
        {...props}
      >
        {/* Default close button */}
        <SheetClose
          aria-label="Close"
          className="absolute right-4 top-4 z-10 rounded-xl p-1.5 text-zinc-400 transition-all hover:bg-zinc-100 hover:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-300"
        >
          <X size={16} aria-hidden="true" />
        </SheetClose>

        {children}
      </div>
    </div>,
    document.body,
  );
}

// ─── Structural helpers ─────────────────────────────────────────────────────────

export function SheetHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 px-6 pt-6 pb-4 border-b border-zinc-100 pr-12",
        className,
      )}
      {...props}
    />
  );
}

export function SheetTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  const { titleId } = useSheet();
  return (
    <h2
      id={titleId}
      className={cn(
        "text-lg font-semibold leading-snug tracking-tight text-zinc-900",
        className,
      )}
      style={{ fontFamily: "Georgia, serif" }}
      {...props}
    />
  );
}

export function SheetDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const { descriptionId } = useSheet();
  return (
    <p
      id={descriptionId}
      className={cn("text-sm text-zinc-500 leading-relaxed", className)}
      {...props}
    />
  );
}

export function SheetBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex-1 overflow-y-auto overscroll-contain px-6 py-5 min-h-0",
        className,
      )}
      {...props}
    />
  );
}

export function SheetFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 px-6 py-4 border-t border-zinc-100 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}
