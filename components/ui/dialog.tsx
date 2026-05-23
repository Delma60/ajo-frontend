"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────────

type DialogSize = "sm" | "md" | "lg" | "xl" | "full";

interface DialogContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
}

// ─── Context ───────────────────────────────────────────────────────────────────

const DialogContext = React.createContext<DialogContextType | null>(null);

function useDialog() {
  const ctx = React.useContext(DialogContext);
  if (!ctx) throw new Error("Dialog components must be used within <Dialog />");
  return ctx;
}

// ─── Focus Trap ────────────────────────────────────────────────────────────────

const FOCUSABLE_SELECTOR = [
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

    const raf = requestAnimationFrame(() => {
      const first = el.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)[0];
      first?.focus();
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const nodes = Array.from(
        el.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [active, ref]);
}

// ─── Animation mount/unmount ───────────────────────────────────────────────────

function useAnimatedMount(open: boolean, durationMs = 220) {
  const [mounted, setMounted] = React.useState(false);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setMounted(true);
      const raf = requestAnimationFrame(() =>
        requestAnimationFrame(() => setVisible(true)),
      );
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), durationMs);
      return () => clearTimeout(t);
    }
  }, [open, durationMs]);

  return { mounted, visible };
}

// ─── Size map ──────────────────────────────────────────────────────────────────

const SIZE_CLASSES: Record<DialogSize, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-[calc(100vw-2rem)] max-h-[calc(100dvh-2rem)]",
};

// ─── Root ──────────────────────────────────────────────────────────────────────

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

function Dialog({ open: controlledOpen, onOpenChange, children }: DialogProps) {
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

  const titleId = React.useId();
  const descriptionId = React.useId();

  return (
    <DialogContext.Provider value={{ open, setOpen, titleId, descriptionId }}>
      {children}
    </DialogContext.Provider>
  );
}

// ─── Trigger ──────────────────────────────────────────────────────────────────

function DialogTrigger({
  asChild = false,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const { setOpen } = useDialog();

  if (
    asChild &&
    React.isValidElement<{ onClick?: React.MouseEventHandler }>(children)
  ) {
    return React.cloneElement(children, {
      ...props,
      onClick: (e: React.MouseEvent) => {
        setOpen(true);
        children.props.onClick?.(e);
      },
    });
  }

  return (
    <button type="button" onClick={() => setOpen(true)} {...props}>
      {children}
    </button>
  );
}

// ─── Content ──────────────────────────────────────────────────────────────────

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Controls the max-width of the dialog panel.
   * @default "md"
   */
  size?: DialogSize;
  /**
   * When true, clicking the backdrop does NOT close the dialog.
   * Useful for forms with unsaved changes.
   */
  persistent?: boolean;
  /** Hide the default close (×) button */
  hideClose?: boolean;
}

function DialogContent({
  className,
  size = "md",
  persistent = false,
  hideClose = false,
  children,
  ...props
}: DialogContentProps) {
  const { open, setOpen, titleId, descriptionId } = useDialog();
  const ref = React.useRef<HTMLDivElement>(null);
  const [isBrowser, setIsBrowser] = React.useState(false);
  const { mounted, visible } = useAnimatedMount(open);

  React.useEffect(() => {
    setIsBrowser(true);
  }, []);

  // Scroll lock
  React.useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted]);

  // Escape
  React.useEffect(() => {
    if (!open || persistent) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, persistent, setOpen]);

  useFocusTrap(ref, open);

  if (!isBrowser || !mounted) return null;

  return createPortal(
    <>
      {/* ── Keyframe styles injected once ── */}
      <style>{`
        @keyframes dialog-overlay-in  { from { opacity:0 } to { opacity:1 } }
        @keyframes dialog-overlay-out { from { opacity:1 } to { opacity:0 } }
        @keyframes dialog-panel-in    { from { opacity:0; transform:scale(.96) translateY(8px) } to { opacity:1; transform:scale(1) translateY(0) } }
        @keyframes dialog-panel-out   { from { opacity:1; transform:scale(1) translateY(0) }    to { opacity:0; transform:scale(.96) translateY(8px) } }
        /* Mobile: slide up from bottom */
        @media (max-width:639px) {
          @keyframes dialog-panel-in  { from { opacity:0; transform:translateY(100%) } to { opacity:1; transform:translateY(0) } }
          @keyframes dialog-panel-out { from { opacity:1; transform:translateY(0) }    to { opacity:0; transform:translateY(100%) } }
        }
      `}</style>

      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={persistent ? undefined : () => setOpen(false)}
        style={{
          animation: `${visible ? "dialog-overlay-in" : "dialog-overlay-out"} 200ms ease forwards`,
        }}
        className="fixed inset-0 z-50 bg-zinc-950/50 backdrop-blur-[3px]"
      />

      {/* Panel wrapper — centres on desktop, anchors bottom on mobile */}
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-end sm:items-center justify-center",
          "p-0 sm:p-4",
        )}
        // clicking the dead-zone outside the panel also closes
        onClick={(e) => {
          if (!persistent && e.target === e.currentTarget) setOpen(false);
        }}
      >
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          style={{
            animation: `${visible ? "dialog-panel-in" : "dialog-panel-out"} 220ms cubic-bezier(.16,1,.3,1) forwards`,
          }}
          className={cn(
            // Base
            "relative z-50 w-full flex flex-col",
            "bg-white dark:bg-zinc-900",
            "border border-zinc-200 dark:border-zinc-800",
            "shadow-[0_24px_64px_rgba(0,0,0,.14),0_4px_12px_rgba(0,0,0,.08)]",
            // Rounding: full on desktop, top-only on mobile (sheet look)
            "rounded-t-3xl sm:rounded-2xl",
            // Max height: taller on mobile because it's anchored bottom
            "max-h-[92dvh] sm:max-h-[90dvh]",
            // Width
            SIZE_CLASSES[size],
            className,
          )}
          {...props}
        >
          {children}

          {/* Default close button */}
          {!hideClose && (
            <button
              type="button"
              aria-label="Close dialog"
              onClick={() => setOpen(false)}
              className={cn(
                "absolute right-4 top-4 z-10",
                "flex h-8 w-8 items-center justify-center rounded-xl",
                "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200",
                "bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800",
                "transition-colors duration-150 outline-none",
                "focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2",
              )}
            >
              <X size={15} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </>,
    document.body,
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

/**
 * Sticky header with a subtle bottom separator.
 * Pad right to avoid overlap with the close button (pr-10).
 */
function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "shrink-0 flex flex-col gap-1",
        "px-6 pt-6 pb-4 pr-12",
        "border-b border-zinc-100 dark:border-zinc-800",
        className,
      )}
      {...props}
    />
  );
}

// ─── Body ─────────────────────────────────────────────────────────────────────

/**
 * Scrollable content area. Grows to fill available space.
 */
function DialogBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex-1 overflow-y-auto overscroll-contain",
        "px-6 py-5",
        className,
      )}
      {...props}
    />
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

/**
 * Sticky footer with a top separator. Actions slot right-aligned by default.
 */
function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "shrink-0 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        "px-6 py-4",
        "border-t border-zinc-100 dark:border-zinc-800",
        "bg-zinc-50/60 dark:bg-zinc-900/60 rounded-b-2xl",
        className,
      )}
      {...props}
    />
  );
}

// ─── Title ────────────────────────────────────────────────────────────────────

function DialogTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  const { titleId } = useDialog();
  return (
    <h2
      id={titleId}
      className={cn(
        "text-[17px] font-semibold leading-snug tracking-[-0.01em]",
        "text-zinc-900 dark:text-zinc-50",
        className,
      )}
      style={{ fontFamily: "Georgia, serif" }}
      {...props}
    />
  );
}

// ─── Description ──────────────────────────────────────────────────────────────

function DialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const { descriptionId } = useDialog();
  return (
    <p
      id={descriptionId}
      className={cn(
        "text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400",
        className,
      )}
      {...props}
    />
  );
}

// ─── Close ────────────────────────────────────────────────────────────────────

function DialogClose({
  asChild = false,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const { setOpen } = useDialog();

  if (
    asChild &&
    React.isValidElement<{ onClick?: React.MouseEventHandler }>(children)
  ) {
    return React.cloneElement(children, {
      ...props,
      onClick: (e: React.MouseEvent) => {
        setOpen(false);
        children.props.onClick?.(e);
      },
    });
  }

  return (
    <button type="button" onClick={() => setOpen(false)} {...props}>
      {children}
    </button>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────

function DialogDivider({
  className,
  ...props
}: React.HTMLAttributes<HTMLHRElement>) {
  return (
    <hr
      className={cn(
        "border-t border-zinc-100 dark:border-zinc-800 mx-6",
        className,
      )}
      {...props}
    />
  );
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogDivider,
};

export type { DialogSize };
