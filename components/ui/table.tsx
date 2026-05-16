import { cva, type VariantProps } from "class-variance-authority";
import {
  type HTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
  forwardRef,
} from "react";
import { cn } from "@/lib/utils";

// ─── Table Root ───────────────────────────────────────────────────────────────

const tableVariants = cva("w-full text-sm border-separate border-spacing-0", {
  variants: {
    variant: {
      /** Default — clean bordered table */
      default: "",
      /** Flush — no outer border, sits inside a Card */
      flush: "",
    },
  },
  defaultVariants: { variant: "default" },
});

export interface TableProps
  extends
    HTMLAttributes<HTMLTableElement>,
    VariantProps<typeof tableVariants> {}

const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ className, variant, ...props }, ref) => (
    <div className="w-full overflow-x-auto rounded-2xl border border-zinc-200">
      <table
        ref={ref}
        className={cn(tableVariants({ variant }), className)}
        {...props}
      />
    </div>
  ),
);
Table.displayName = "Table";

// ─── Table Header ───────────────────────────────────────────────────────────────

const TableHeader = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("bg-zinc-50", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

// ─── Table Body ───────────────────────────────────────────────────────────────

const TableBody = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn("bg-white", className)} {...props} />
));
TableBody.displayName = "TableBody";

// ─── Table Footer ─────────────────────────────────────────────────────────────

const TableFooter = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "bg-zinc-50 border-t border-zinc-200 font-medium text-zinc-700",
      className,
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

// ─── Table Row ────────────────────────────────────────────────────────────────

const tableRowVariants = cva(
  "transition-colors duration-100 border-b border-zinc-100 last:border-b-0",
  {
    variants: {
      hoverable: {
        true: "hover:bg-zinc-50 cursor-pointer",
        false: "",
      },
      selected: {
        true: "bg-emerald-50 hover:bg-emerald-50",
        false: "",
      },
    },
    defaultVariants: {
      hoverable: false,
      selected: false,
    },
  },
);

export interface TableRowProps
  extends
    HTMLAttributes<HTMLTableRowElement>,
    VariantProps<typeof tableRowVariants> {}

const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, hoverable, selected, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(tableRowVariants({ hoverable, selected }), className)}
      {...props}
    />
  ),
);
TableRow.displayName = "TableRow";

// ─── Table Head ────────────────────────────────────────────────────────

const tableHeadVariants = cva(
  [
    "px-4 py-3 text-left font-medium text-[11px] uppercase tracking-[.09em] text-zinc-400",
    "border-b border-zinc-200",
    "first:pl-5 last:pr-5",
  ],
  {
    variants: {
      align: {
        left: "text-left",
        center: "text-center",
        right: "text-right",
      },
    },
    defaultVariants: { align: "left" },
  },
);

export interface TableHeadCellProps
  extends
    ThHTMLAttributes<HTMLTableCellElement>,
    VariantProps<typeof tableHeadVariants> {}

const TableHead = forwardRef<HTMLTableCellElement, TableHeadCellProps>(
  ({ className, align, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(tableHeadVariants({ align }), className)}
      {...props}
    />
  ),
);
TableHead.displayName = "TableHead";

// ─── Table Data Cell ──────────────────────────────────────────────────────────

const tableDataCellVariants = cva(
  ["px-4 py-3 text-[13px] text-zinc-700 leading-snug", "first:pl-5 last:pr-5"],
  {
    variants: {
      align: {
        left: "text-left",
        center: "text-center",
        right: "text-right",
      },
      muted: {
        true: "text-zinc-400",
        false: "",
      },
      mono: {
        true: "font-mono text-[12px]",
        false: "",
      },
    },
    defaultVariants: {
      align: "left",
      muted: false,
      mono: false,
    },
  },
);

export interface TableDataCellProps
  extends
    TdHTMLAttributes<HTMLTableCellElement>,
    VariantProps<typeof tableDataCellVariants> {}

const TableCell = forwardRef<HTMLTableCellElement, TableDataCellProps>(
  ({ className, align, muted, mono, ...props }, ref) => (
    <td
      ref={ref}
      className={cn(tableDataCellVariants({ align, muted, mono }), className)}
      {...props}
    />
  ),
);
TableCell.displayName = "TableCell";

// ─── Table Caption ────────────────────────────────────────────────────────────

const TableCaption = forwardRef<
  HTMLTableCaptionElement,
  HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-3 text-[12px] text-zinc-400 text-left px-1", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

// ─── Table Empty State ────────────────────────────────────────────────────────

interface TableEmptyProps extends HTMLAttributes<HTMLTableRowElement> {
  colSpan: number;
  message?: string;
}

const TableEmpty = forwardRef<HTMLTableRowElement, TableEmptyProps>(
  ({ colSpan, message = "No data available.", className, ...props }, ref) => (
    <tr ref={ref} className={className} {...props}>
      <td
        colSpan={colSpan}
        className="px-5 py-10 text-center text-[13px] text-zinc-400"
      >
        {message}
      </td>
    </tr>
  ),
);
TableEmpty.displayName = "TableEmpty";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
  TableEmpty,
};
