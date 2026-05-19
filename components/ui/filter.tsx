"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { SlidersHorizontal, X, ChevronDown, Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface FilterOption<T extends string = string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

export interface FilterGroup<T extends string = string> {
  /** Matches a key in FilterValues */
  key: string;
  label: string;
  options: FilterOption<T>[];
  /** Allow selecting more than one value (default: false) */
  multi?: boolean;
  /**
   * How this group filters items. Return true to include an item.
   * If omitted the group is UI-only (e.g. a sort section).
   */
  match?: (item: unknown, selected: string | string[]) => boolean;
}

export type FilterValues = Record<string, string | string[]>;

export interface SortOption {
  value: string;
  label: string;
  compareFn: (a: unknown, b: unknown) => number;
}

export interface FilterProps<TData> {
  /** The full dataset to filter */
  data: TData[];
  /**
   * Called every time the filtered + sorted result changes.
   * Wire this directly: `onResult={setDisplayedItems}`
   */
  onResult: (filtered: TData[]) => void;

  /** Filter groups rendered in the dropdown panel */
  groups: FilterGroup[];

  /**
   * Optional sort options rendered as their own section in the panel.
   * Each option's `compareFn` receives two items from `data`.
   */
  sortOptions?: SortOption[];

  /**
   * Dot-notation field paths searched across each item.
   * e.g. ["name", "description", "admin.name"]
   * Omit entirely to hide the search input.
   */
  searchFields?: string[];
  searchPlaceholder?: string;

  /**
   * Key of a group whose options are rendered as always-visible quick pills
   * above the panel (in addition to appearing inside the panel).
   */
  quickGroup?: string;

  className?: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function deepGet(obj: unknown, path: string): string {
  const val = path
    .split(".")
    .reduce<unknown>(
      (acc, key) =>
        acc != null && typeof acc === "object"
          ? (acc as Record<string, unknown>)[key]
          : undefined,
      obj,
    );
  return val != null ? String(val) : "";
}

function buildDefaults(
  groups: FilterGroup[],
  sortOptions?: SortOption[],
): FilterValues {
  const v: FilterValues = {};
  groups.forEach((g) => {
    v[g.key] = g.multi ? [] : "all";
  });
  if (sortOptions?.length) v.__sort = sortOptions[0].value;
  return v;
}

function countActive(values: FilterValues, sortOptions?: SortOption[]): number {
  return Object.entries(values).filter(([key, v]) => {
    if (key === "__sort")
      return sortOptions?.length ? v !== sortOptions[0].value : false;
    if (Array.isArray(v)) return v.length > 0;
    return v !== "all" && v !== "";
  }).length;
}

// ─── QuickPills ───────────────────────────────────────────────────────────────

function QuickPills({
  group,
  value,
  onChange,
}: {
  group: FilterGroup;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {group.options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "text-[12px] font-medium px-3 py-1.5 rounded-full transition-all",
            value === opt.value
              ? "bg-emerald-800 text-white"
              : "bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300",
          )}
        >
          {opt.icon && (
            <span className="mr-1 inline-flex items-center">{opt.icon}</span>
          )}
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─── FilterSection ────────────────────────────────────────────────────────────

function FilterSection({
  group,
  value,
  onChange,
}: {
  group: FilterGroup;
  value: string | string[];
  onChange: (v: string | string[]) => void;
}) {
  const isMulti = group.multi ?? false;
  const selected: string | string[] = isMulti
    ? Array.isArray(value)
      ? value
      : value
        ? [value as string]
        : []
    : (value as string) || "all";

  const toggle = (opt: string) => {
    if (!isMulti) {
      onChange(opt);
      return;
    }
    const arr = Array.isArray(selected) ? selected : [];
    onChange(arr.includes(opt) ? arr.filter((v) => v !== opt) : [...arr, opt]);
  };

  const isActive = (opt: string) =>
    isMulti ? (selected as string[]).includes(opt) : selected === opt;

  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400 mb-2">
        {group.label}
      </p>
      <div className="flex gap-1.5 flex-wrap">
        {group.options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => toggle(opt.value)}
            className={cn(
              "inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg transition-all",
              isActive(opt.value)
                ? "bg-emerald-800 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200",
            )}
          >
            {opt.icon}
            {opt.label}
            {isActive(opt.value) && isMulti && (
              <Check size={10} className="shrink-0" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Filter (main) ────────────────────────────────────────────────────────────

export function Filter<TData>({
  data,
  onResult,
  groups,
  sortOptions,
  searchFields,
  searchPlaceholder = "Search…",
  quickGroup,
  className,
}: FilterProps<TData>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [values, setValues] = useState<FilterValues>(() =>
    buildDefaults(groups, sortOptions),
  );
  const panelRef = useRef<HTMLDivElement>(null);

  // ── Core filter + sort logic ───────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = [...data];

    // 1. Text search
    if (search.trim() && searchFields?.length) {
      const q = search.trim().toLowerCase();
      result = result.filter((item) =>
        searchFields.some((field) =>
          deepGet(item, field).toLowerCase().includes(q),
        ),
      );
    }

    // 2. Each filter group
    groups.forEach((group) => {
      if (!group.match) return;
      const selected = values[group.key];
      const isEmpty = Array.isArray(selected)
        ? selected.length === 0
        : selected === "all";
      if (isEmpty) return;
      result = result.filter((item) => group.match!(item, selected));
    });

    // 3. Sort
    if (sortOptions?.length) {
      const sortVal = (values.__sort as string) ?? sortOptions[0].value;
      const sortOpt = sortOptions.find((s) => s.value === sortVal);
      if (sortOpt) result = [...result].sort(sortOpt.compareFn);
    }

    return result;
  }, [data, search, values, groups, sortOptions, searchFields]);

  // Push to parent whenever result changes
  useEffect(() => {
    onResult(filtered);
  }, [filtered, onResult]);

  // Close panel on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleGroupChange = useCallback(
    (key: string, v: string | string[]) =>
      setValues((prev) => ({ ...prev, [key]: v })),
    [],
  );

  const clearAll = useCallback(() => {
    setValues(buildDefaults(groups, sortOptions));
    setSearch("");
  }, [groups, sortOptions]);

  const activeCount = countActive(values, sortOptions);
  const hasAnyActive = activeCount > 0 || search !== "";
  const quickGroupDef = quickGroup
    ? groups.find((g) => g.key === quickGroup)
    : null;

  return (
    <div className={cn("space-y-3", className)}>
      {/* ── Search + trigger row ──────────────────────────────────────────── */}
      <div className="flex gap-2">
        {!!searchFields?.length && (
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-8 pr-9 rounded-xl border-[1.5px] border-zinc-200 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-emerald-700 focus:shadow-[0_0_0_3px_rgba(26,107,82,.10)] transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        )}

        {/* Filter toggle */}
        <div className="relative" ref={panelRef}>
          <button
            onClick={() => setOpen((p) => !p)}
            className={cn(
              "h-10 px-4 rounded-xl border-[1.5px] text-sm font-medium flex items-center gap-2 transition-all relative select-none",
              open || activeCount > 0
                ? "border-emerald-700 text-emerald-700 bg-emerald-50"
                : "border-zinc-200 text-zinc-600 bg-white hover:border-zinc-300",
            )}
          >
            <SlidersHorizontal size={14} />
            Filters
            <ChevronDown
              size={12}
              className={cn(
                "transition-transform duration-200 text-zinc-400",
                open && "rotate-180",
              )}
            />
            {activeCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] rounded-full bg-emerald-700 text-white text-[10px] font-bold flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>

          {/* Dropdown panel */}
          {open && (
            <div className="absolute top-[calc(100%+8px)] right-0 z-50 w-[300px] bg-white rounded-2xl border border-zinc-200 shadow-lg p-4 space-y-4 animate-in fade-in zoom-in-95 slide-in-from-top-1 duration-150">
              {groups.map((group) => (
                <FilterSection
                  key={group.key}
                  group={group}
                  value={values[group.key] ?? (group.multi ? [] : "all")}
                  onChange={(v) => handleGroupChange(group.key, v)}
                />
              ))}

              {!!sortOptions?.length && (
                <FilterSection
                  group={{
                    key: "__sort",
                    label: "Sort by",
                    options: sortOptions.map(({ value, label }) => ({
                      value,
                      label,
                    })),
                  }}
                  value={(values.__sort as string) ?? sortOptions[0].value}
                  onChange={(v) => handleGroupChange("__sort", v as string)}
                />
              )}

              {hasAnyActive && (
                <div className="border-t border-zinc-100 pt-3">
                  <button
                    onClick={() => {
                      clearAll();
                      setOpen(false);
                    }}
                    className="w-full text-[12px] text-zinc-500 hover:text-zinc-800 transition-colors flex items-center justify-center gap-1.5 py-1"
                  >
                    <X size={12} /> Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Quick pills ───────────────────────────────────────────────────── */}
      {quickGroupDef && (
        <QuickPills
          group={quickGroupDef}
          value={(values[quickGroupDef.key] as string) ?? "all"}
          onChange={(v) => handleGroupChange(quickGroupDef.key, v)}
        />
      )}

      {/* ── Results summary ───────────────────────────────────────────────── */}
      {hasAnyActive && (
        <div className="flex items-center justify-between">
          <p className="text-[13px] text-zinc-500">
            <span className="font-semibold text-zinc-900">
              {filtered.length}
            </span>{" "}
            result
            {filtered.length !== 1 ? "s" : ""}
            {activeCount > 0 && (
              <span className="text-zinc-400">
                {" · "}
                {activeCount} filter{activeCount !== 1 ? "s" : ""} applied
              </span>
            )}
            {search && (
              <span className="text-zinc-400">
                {" · "}searching{" "}
                <span className="font-medium text-emerald-700">
                  &ldquo;{search}&rdquo;
                </span>
              </span>
            )}
          </p>
          <button
            onClick={clearAll}
            className="text-[12px] text-zinc-400 hover:text-zinc-700 transition-colors flex items-center gap-1"
          >
            <X size={11} /> Clear
          </button>
        </div>
      )}
    </div>
  );
}
