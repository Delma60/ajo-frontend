"use client";

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
  cloneElement,
  isValidElement,
  type HTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
  type ReactElement,
  forwardRef,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PopoverSide = "top" | "right" | "bottom" | "left";
export type PopoverAlign = "start" | "center" | "end";
export type PopoverVariant = "default" | "rich" | "minimal";

interface PopoverPosition {
  top: number;
  left: number;
  arrowLeft?: number;
  arrowTop?: number;
  transformOrigin: string;
  slideX: number;
  slideY: number;
  actualSide: PopoverSide;
}

interface PopoverContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  anchorRef: React.RefObject<HTMLElement | null>;
  contentId: string;
  side: PopoverSide;
  align: PopoverAlign;
  sideOffset: number;
  alignOffset: number;
  arrow: boolean;
  modal: boolean;
  variant: PopoverVariant;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const PopoverContext = createContext<PopoverContextValue | null>(null);

function usePopover(): PopoverContextValue {
  const ctx = useContext(PopoverContext);
  if (!ctx) throw new Error("Popover components must be used within <Popover />");
  return ctx;
}

// ─── Focus trap ───────────────────────────────────────────────────────────────

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

function trapFocus(el: HTMLElement, e: KeyboardEvent) {
  if (e.key !== "Tab") return;
  const nodes = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE));
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
}

// ─── Position calculation ─────────────────────────────────────────────────────

const PADDING = 8;
const ARROW_SIZE = 8;

function calculatePosition(
  anchorRect: DOMRect,
  contentRect: DOMRect,
  side: PopoverSide,
  align: PopoverAlign,
  sideOffset: number,
  alignOffset: number,
  showArrow: boolean,
  viewport: { width: number; height: number }
): PopoverPosition {
  const gap = sideOffset + (showArrow ? ARROW_SIZE : 0);
  let top = 0;
  let left = 0;
  let arrowLeft: number | undefined;
  let arrowTop: number | undefined;
  let actualSide = side;

  // ── Flip ──────────────────────────────────────────────────────────────────
  const fits = {
    top: anchorRect.top >= contentRect.height + gap + PADDING,
    bottom: viewport.height - anchorRect.bottom >= contentRect.height + gap + PADDING,
    left: anchorRect.left >= contentRect.width + gap + PADDING,
    right: viewport.width - anchorRect.right >= contentRect.width + gap + PADDING,
  };

  const opposite: Record<PopoverSide, PopoverSide> = {
    top: "bottom",
    bottom: "top",
    left: "right",
    right: "left",
  };

  if (!fits[side] && fits[opposite[side]]) {
    actualSide = opposite[side];
  }

  // ── Main-axis placement ───────────────────────────────────────────────────
  if (actualSide === "bottom") top = anchorRect.bottom + gap;
  else if (actualSide === "top") top = anchorRect.top - contentRect.height - gap;
  else if (actualSide === "right") left = anchorRect.right + gap;
  else left = anchorRect.left - contentRect.width - gap;

  // ── Cross-axis alignment ──────────────────────────────────────────────────
  if (actualSide === "bottom" || actualSide === "top") {
    const base =
      align === "start"
        ? anchorRect.left + alignOffset
        : align === "end"
        ? anchorRect.right - contentRect.width - alignOffset
        : anchorRect.left + anchorRect.width / 2 - contentRect.width / 2 + alignOffset;
    left = base;
    // Arrow horizontal center relative to content
    const anchorCenterX = anchorRect.left + anchorRect.width / 2;
    arrowLeft = Math.max(
      ARROW_SIZE,
      Math.min(anchorCenterX - left - ARROW_SIZE, contentRect.width - ARROW_SIZE * 2)
    );
  } else {
    const base =
      align === "start"
        ? anchorRect.top + alignOffset
        : align === "end"
        ? anchorRect.bottom - contentRect.height - alignOffset
        : anchorRect.top + anchorRect.height / 2 - contentRect.height / 2 + alignOffset;
    top = base;
    const anchorCenterY = anchorRect.top + anchorRect.height / 2;
    arrowTop = Math.max(
      ARROW_SIZE,
      Math.min(anchorCenterY - top - ARROW_SIZE, contentRect.height - ARROW_SIZE * 2)
    );
  }

  // ── Clamp to viewport ─────────────────────────────────────────────────────
  left = Math.max(PADDING, Math.min(left, viewport.width - contentRect.width - PADDING));
  top = Math.max(PADDING, Math.min(top, viewport.height - contentRect.height - PADDING));

  // ── Transform origin & slide direction ───────────────────────────────────
  const originX =
    actualSide === "right"
      ? "left"
      : actualSide === "left"
      ? "right"
      : align === "start"
      ? "left"
      : align === "end"
      ? "right"
      : "center";
  const originY =
    actualSide === "bottom"
      ? "top"
      : actualSide === "top"
      ? "bottom"
      : align === "start"
      ? "top"
      : align === "end"
      ? "bottom"
      : "center";

  const SLIDE = 6;
  const slideX =
    actualSide === "right" ? -SLIDE : actualSide === "left" ? SLIDE : 0;
  const slideY =
    actualSide === "bottom" ? -SLIDE : actualSide === "top" ? SLIDE : 0;

  return {
    top,
    left,
    arrowLeft,
    arrowTop,
    transformOrigin: `${originX} ${originY}`,
    slideX,
    slideY,
    actualSide,
  };
}

// ─── Popover Root ─────────────────────────────────────────────────────────────

export interface PopoverProps {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Preferred side to render the popover on */
  side?: PopoverSide;
  /** Alignment along the cross-axis */
  align?: PopoverAlign;
  /** Gap between anchor and popover panel (px) */
  sideOffset?: number;
  /** Shift along the alignment axis (px) */
  alignOffset?: number;
  /** Show a directional arrow pointing at the trigger */
  arrow?: boolean;
  /** Trap focus and show backdrop overlay */
  modal?: boolean;
  /** Visual variant */
  variant?: PopoverVariant;
}

let _id = 0;

export function Popover({
  children,
  open: controlledOpen,
  onOpenChange,
  side = "bottom",
  align = "start",
  sideOffset = 8,
  alignOffset = 0,
  arrow = false,
  modal = false,
  variant = "default",
}: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const triggerRef = useRef<HTMLElement | null>(null);
  const anchorRef = useRef<HTMLElement | null>(null); // may be overridden by PopoverAnchor
  const [contentId] = useState(() => `popover-${++_id}`);

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  return (
    <PopoverContext.Provider
      value={{
        open,
        setOpen,
        triggerRef,
        anchorRef,
        contentId,
        side,
        align,
        sideOffset,
        alignOffset,
        arrow,
        modal,
        variant,
      }}
    >
      {children}
    </PopoverContext.Provider>
  );
}

// ─── PopoverAnchor ────────────────────────────────────────────────────────────
// Use to detach positioning from the visual trigger.

export const PopoverAnchor = forwardRef<HTMLElement, HTMLAttributes<HTMLElement> & { asChild?: boolean }>(
  ({ children, asChild }, ref) => {
    const { anchorRef } = usePopover();

    const handleRef = useCallback(
      (el: HTMLElement | null) => {
        (anchorRef as React.MutableRefObject<HTMLElement | null>).current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = el;
      },
      [anchorRef, ref]
    );

    if (asChild && isValidElement(children)) {
      return cloneElement(children as ReactElement<{ ref?: unknown }>, { ref: handleRef });
    }

    return <span ref={handleRef as React.RefObject<HTMLSpanElement>}>{children}</span>;
  }
);
PopoverAnchor.displayName = "PopoverAnchor";

// ─── PopoverTrigger ───────────────────────────────────────────────────────────

export interface PopoverTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Render as the child element instead of a <button> */
  asChild?: boolean;
}

export const PopoverTrigger = forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  ({ children, asChild, className, onClick, ...props }, ref) => {
    const { setOpen, open, triggerRef, anchorRef, contentId } = usePopover();

    const handleRef = useCallback(
      (el: HTMLButtonElement | null) => {
        (triggerRef as React.MutableRefObject<HTMLElement | null>).current = el;
        // If no explicit PopoverAnchor, the trigger IS the anchor
        if (!(anchorRef as React.MutableRefObject<HTMLElement | null>).current) {
          (anchorRef as React.MutableRefObject<HTMLElement | null>).current = el;
        }
        if (typeof ref === "function") ref(el);
        else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = el;
      },
      [triggerRef, anchorRef, ref]
    );

    const triggerProps = {
      "aria-expanded": open,
      "aria-controls": contentId,
      "aria-haspopup": "dialog" as const,
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        setOpen(!open);
        (onClick as ((e: React.MouseEvent<HTMLElement>) => void) | undefined)?.(e);
      },
    };

    if (asChild && isValidElement(children)) {
      return cloneElement(children as ReactElement<Record<string, unknown>>, {
        ref: handleRef,
        ...triggerProps,
      });
    }

    return (
      <button ref={handleRef} type="button" className={className} {...triggerProps} {...props}>
        {children}
      </button>
    );
  }
);
PopoverTrigger.displayName = "PopoverTrigger";

// ─── Variant styles ───────────────────────────────────────────────────────────

const variantStyles: Record<PopoverVariant, string> = {
  default: "bg-white border border-zinc-200 shadow-lg",
  rich: "bg-white border border-zinc-200 shadow-xl shadow-zinc-200/60",
  minimal: "bg-white border-0 shadow-2xl shadow-zinc-300/50",
};

// ─── PopoverContent ───────────────────────────────────────────────────────────

export interface PopoverContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Width of the popover panel. Defaults to auto. */
  width?: number | string;
  /** Min width. Defaults to the trigger width when "trigger". */
  minWidth?: number | string | "trigger";
}

export const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ children, className, width, minWidth, style, ...props }, ref) => {
    const {
      open,
      setOpen,
      triggerRef,
      anchorRef,
      contentId,
      side,
      align,
      sideOffset,
      alignOffset,
      arrow,
      modal,
      variant,
    } = usePopover();

    const panelRef = useRef<HTMLDivElement | null>(null);
    const [pos, setPos] = useState<PopoverPosition | null>(null);
    const [mounted, setMounted] = useState(false);
    const [visible, setVisible] = useState(false);
    const [resolvedMinWidth, setResolvedMinWidth] = useState<number | string | undefined>();

    // ── Mount / unmount with animation ──────────────────────────────────────
    useEffect(() => {
      if (open) {
        setMounted(true);
      } else {
        setVisible(false);
        const t = setTimeout(() => {
          setMounted(false);
          setPos(null);
        }, 200);
        return () => clearTimeout(t);
      }
    }, [open]);

    // ── Two-pass position: render offscreen → measure → position → show ─────
    useLayoutEffect(() => {
      if (!mounted || !panelRef.current) return;
      let cancelled = false;

      const update = () => {
        if (cancelled || !panelRef.current) return;
        const anchor = anchorRef.current ?? triggerRef.current;
        if (!anchor) return;

        const anchorRect = anchor.getBoundingClientRect();
        const contentRect = panelRef.current.getBoundingClientRect();
        const viewport = { width: window.innerWidth, height: window.innerHeight };

        if (minWidth === "trigger") {
          setResolvedMinWidth(anchorRect.width);
        } else {
          setResolvedMinWidth(minWidth);
        }

        const newPos = calculatePosition(
          anchorRect,
          contentRect,
          side,
          align,
          sideOffset,
          alignOffset,
          arrow,
          viewport
        );
        setPos(newPos);
        setVisible(true);
      };

      // Initial measure after mount
      const raf1 = requestAnimationFrame(() => {
        const raf2 = requestAnimationFrame(update);
        return () => cancelAnimationFrame(raf2);
      });

      window.addEventListener("scroll", update, { capture: true, passive: true });
      window.addEventListener("resize", update, { passive: true });

      return () => {
        cancelled = true;
        cancelAnimationFrame(raf1);
        window.removeEventListener("scroll", update, true);
        window.removeEventListener("resize", update);
      };
    }, [mounted, side, align, sideOffset, alignOffset, arrow, triggerRef, anchorRef, minWidth]);

    // ── Outside-click to close ───────────────────────────────────────────────
    useEffect(() => {
      if (!open) return;
      const handler = (e: MouseEvent) => {
        const target = e.target as Node;
        if (!panelRef.current?.contains(target) && !triggerRef.current?.contains(target)) {
          setOpen(false);
        }
      };
      // Delay to avoid firing on the same click that opened it
      const t = setTimeout(() => document.addEventListener("mousedown", handler), 0);
      return () => {
        clearTimeout(t);
        document.removeEventListener("mousedown", handler);
      };
    }, [open, setOpen, triggerRef]);

    // ── Keyboard: Escape & focus trap ────────────────────────────────────────
    useEffect(() => {
      if (!open || !panelRef.current) return;
      const el = panelRef.current;

      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          setOpen(false);
          triggerRef.current?.focus();
        }
        if (modal) trapFocus(el, e);
      };

      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }, [open, modal, setOpen, triggerRef]);

    // ── Move focus into panel on open ────────────────────────────────────────
    useEffect(() => {
      if (!visible || !panelRef.current) return;
      const first = panelRef.current.querySelector<HTMLElement>(FOCUSABLE);
      first?.focus();
    }, [visible]);

    if (!mounted) return null;

    const slideX = pos?.slideX ?? 0;
    const slideY = pos?.slideY ?? 0;

    const panel = (
      <div
        id={contentId}
        ref={(el) => {
          panelRef.current = el;
          if (typeof ref === "function") ref(el);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
        }}
        role="dialog"
        aria-modal={modal}
        style={{
          position: "fixed",
          zIndex: 1050,
          top: pos?.top ?? -9999,
          left: pos?.left ?? -9999,
          transformOrigin: pos?.transformOrigin ?? "top left",
          width: width ?? undefined,
          minWidth: resolvedMinWidth,
          transform: visible
            ? "translate(0, 0) scale(1)"
            : `translate(${slideX}px, ${slideY}px) scale(0.95)`,
          opacity: visible ? 1 : 0,
          transition: "transform 180ms cubic-bezier(0.16, 1, 0.3, 1), opacity 150ms ease",
          pointerEvents: visible ? "auto" : "none",
          ...style,
        }}
        className={cn("rounded-2xl overflow-hidden", variantStyles[variant], className)}
        {...props}
      >
        {children}
        {arrow && pos && (
          <PopoverArrowEl
            side={pos.actualSide}
            arrowLeft={pos.arrowLeft}
            arrowTop={pos.arrowTop}
            variant={variant}
          />
        )}
      </div>
    );

    return createPortal(
      <>
        {modal && (
          <div
            aria-hidden="true"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1040,
              background: "rgba(0,0,0,0.25)",
              backdropFilter: "blur(2px)",
              opacity: visible ? 1 : 0,
              transition: "opacity 150ms ease",
            }}
            onClick={() => setOpen(false)}
          />
        )}
        {panel}
      </>,
      document.body
    );
  }
);
PopoverContent.displayName = "PopoverContent";

// ─── Arrow ────────────────────────────────────────────────────────────────────

function PopoverArrowEl({
  side,
  arrowLeft,
  arrowTop,
  variant,
}: {
  side: PopoverSide;
  arrowLeft?: number;
  arrowTop?: number;
  variant: PopoverVariant;
}) {
  const borderColor = variant === "minimal" ? "transparent" : "#e4e4e7";

  const base: React.CSSProperties = {
    position: "absolute",
    width: 0,
    height: 0,
    pointerEvents: "none",
  };

  const styles: Record<PopoverSide, React.CSSProperties> = {
    bottom: {
      ...base,
      top: -ARROW_SIZE,
      left: arrowLeft ?? "50%",
      borderLeft: `${ARROW_SIZE}px solid transparent`,
      borderRight: `${ARROW_SIZE}px solid transparent`,
      borderBottom: `${ARROW_SIZE}px solid white`,
      filter: `drop-shadow(0 -1px 0 ${borderColor})`,
    },
    top: {
      ...base,
      bottom: -ARROW_SIZE,
      left: arrowLeft ?? "50%",
      borderLeft: `${ARROW_SIZE}px solid transparent`,
      borderRight: `${ARROW_SIZE}px solid transparent`,
      borderTop: `${ARROW_SIZE}px solid white`,
      filter: `drop-shadow(0 1px 0 ${borderColor})`,
    },
    right: {
      ...base,
      left: -ARROW_SIZE,
      top: arrowTop ?? "50%",
      borderTop: `${ARROW_SIZE}px solid transparent`,
      borderBottom: `${ARROW_SIZE}px solid transparent`,
      borderRight: `${ARROW_SIZE}px solid white`,
      filter: `drop-shadow(-1px 0 0 ${borderColor})`,
    },
    left: {
      ...base,
      right: -ARROW_SIZE,
      top: arrowTop ?? "50%",
      borderTop: `${ARROW_SIZE}px solid transparent`,
      borderBottom: `${ARROW_SIZE}px solid transparent`,
      borderLeft: `${ARROW_SIZE}px solid white`,
      filter: `drop-shadow(1px 0 0 ${borderColor})`,
    },
  };

  return <span aria-hidden="true" style={styles[side]} />;
}

// ─── PopoverClose ─────────────────────────────────────────────────────────────

export const PopoverClose = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ children, className, onClick, asChild, ...props }, ref) => {
  const { setOpen, triggerRef } = usePopover();

  const handleClose = (e: React.MouseEvent<HTMLButtonElement>) => {
    setOpen(false);
    triggerRef.current?.focus();
    onClick?.(e);
  };

  if (asChild && isValidElement(children)) {
    return cloneElement(children as ReactElement<Record<string, unknown>>, {
      ref,
      onClick: handleClose,
    });
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={handleClose}
      className={cn(
        "inline-flex items-center justify-center rounded-lg p-1.5",
        "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100",
        "transition-colors duration-150 outline-none",
        "focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
PopoverClose.displayName = "PopoverClose";

// ─── Structural helpers ───────────────────────────────────────────────────────

export const PopoverHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-between gap-3",
        "px-4 pt-4 pb-3 border-b border-zinc-100",
        className
      )}
      {...props}
    />
  )
);
PopoverHeader.displayName = "PopoverHeader";

export const PopoverTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        "text-[13.5px] font-semibold leading-snug tracking-[-0.01em] text-zinc-900",
        className
      )}
      {...props}
    />
  )
);
PopoverTitle.displayName = "PopoverTitle";

export const PopoverDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-[12px] text-zinc-500 mt-0.5 leading-relaxed", className)}
    {...props}
  />
));
PopoverDescription.displayName = "PopoverDescription";

export const PopoverBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("px-4 py-3", className)} {...props} />
  )
);
PopoverBody.displayName = "PopoverBody";

export const PopoverFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-end gap-2 px-4 py-3 border-t border-zinc-100",
        className
      )}
      {...props}
    />
  )
);
PopoverFooter.displayName = "PopoverFooter";

export const PopoverSeparator = forwardRef<HTMLHRElement, HTMLAttributes<HTMLHRElement>>(
  ({ className, ...props }, ref) => (
    <hr ref={ref} className={cn("border-t border-zinc-100", className)} {...props} />
  )
);
PopoverSeparator.displayName = "PopoverSeparator";

// ─── Convenience: usePopoverState ─────────────────────────────────────────────
// For externally-controlled popovers.

export function usePopoverState(defaultOpen = false) {
  const [open, setOpen] = useState(defaultOpen);
  return { open, onOpenChange: setOpen, close: () => setOpen(false) };
}