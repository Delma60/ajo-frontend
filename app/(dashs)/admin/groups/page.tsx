"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardDivider,
  CardBadge,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableEmpty,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  Search,
  ChevronRight,
  Crown,
  Globe,
  Lock,
  TrendingUp,
  CircleDollarSign,
  Clock,
  CheckCircle2,
  PauseCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Filter,
  Eye,
  Ban,
  Play,
  Trash2,
  MoreHorizontal,
  Calendar,
  ChevronDown,
  ArrowUpDown,
  ShieldCheck,
  Activity,
} from "lucide-react";
import { HTTPS } from "@/lib/http";
import {
  IGroup,
  GroupStatus,
  Frequency,
  PayoutOrder,
} from "@/lib/types/group.types";
import { formatNaira, freqLabel, payoutLabel } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────────

type SortField = "name" | "membersCount" | "saved" | "created_at" | "status";
type SortDir = "asc" | "desc";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function statusConfig(status: string) {
  switch (status) {
    case "active":
      return {
        icon: <CheckCircle2 size={12} />,
        label: "Active",
        cls: "bg-emerald-50 text-emerald-700",
      };
    case "paused":
      return {
        icon: <PauseCircle size={12} />,
        label: "Paused",
        cls: "bg-amber-50 text-amber-700",
      };
    case "closed":
      return {
        icon: <XCircle size={12} />,
        label: "Closed",
        cls: "bg-zinc-100 text-zinc-500",
      };
    default:
      return {
        icon: <Clock size={12} />,
        label: status,
        cls: "bg-zinc-100 text-zinc-500",
      };
  }
}

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig(status);
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.cls}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

// ─── Summary stats ──────────────────────────────────────────────────────────────

function SummaryCards({ groups }: { groups: IGroup[] }) {
  const active = groups.filter((g) => g.status === "active").length;
  const paused = groups.filter((g) => g.status === "paused").length;
  const closed = groups.filter((g) => g.status === "closed").length;
  const totalSaved = groups.reduce((s, g) => s + (g.saved || 0), 0);
  const totalMembers = groups.reduce((s, g) => s + (g.membersCount || 0), 0);

  const cards = [
    {
      label: "Total Circles",
      value: groups.length.toLocaleString(),
      icon: Users,
      color: "blue",
      sub: `${active} active`,
    },
    {
      label: "Total Saved",
      value: formatNaira(totalSaved),
      icon: CircleDollarSign,
      color: "emerald",
      sub: "Across all circles",
    },
    {
      label: "Total Members",
      value: totalMembers.toLocaleString(),
      icon: Activity,
      color: "amber",
      sub: `Avg ${groups.length ? Math.round(totalMembers / groups.length) : 0}/circle`,
    },
    {
      label: "Paused / Closed",
      value: `${paused + closed}`,
      icon: AlertTriangle,
      color: "rose",
      sub: `${paused} paused · ${closed} closed`,
    },
  ] as const;

  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, icon: Icon, color, sub }) => (
        <Card
          key={label}
          variant="default"
          className="hover:shadow-sm transition-shadow"
        >
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start justify-between mb-3">
              <span
                className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${colorMap[color]}`}
              >
                <Icon size={18} />
              </span>
            </div>
            <p
              className="text-2xl font-bold text-zinc-900 tracking-tight"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {value}
            </p>
            <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide mt-0.5">
              {label}
            </p>
            {sub && <p className="text-[11px] text-zinc-500 mt-1">{sub}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Action menu ──────────────────────────────────────────────────────────────

function ActionMenu({
  group,
  onStatusChange,
  onDelete,
}: {
  group: IGroup;
  onStatusChange: (id: string, status: GroupStatus) => void;
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors"
      >
        <MoreHorizontal size={16} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 w-44 bg-white border border-zinc-200 rounded-xl shadow-lg py-1 overflow-hidden">
            <Link
              href={`/admin/groups/${group.id}`}
              className="flex items-center gap-2 px-3 py-2 text-[12px] text-zinc-700 hover:bg-zinc-50 transition-colors"
              onClick={() => setOpen(false)}
            >
              <Eye size={13} className="text-zinc-400" />
              View details
            </Link>

            {group.status === "active" && (
              <button
                className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-amber-700 hover:bg-amber-50 transition-colors"
                onClick={() => {
                  onStatusChange(group.id, "paused");
                  setOpen(false);
                }}
              >
                <PauseCircle size={13} className="text-amber-500" />
                Pause circle
              </button>
            )}

            {group.status === "paused" && (
              <button
                className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-emerald-700 hover:bg-emerald-50 transition-colors"
                onClick={() => {
                  onStatusChange(group.id, "active");
                  setOpen(false);
                }}
              >
                <Play size={13} className="text-emerald-500" />
                Resume circle
              </button>
            )}

            {group.status !== "closed" && (
              <button
                className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-zinc-500 hover:bg-zinc-50 transition-colors"
                onClick={() => {
                  onStatusChange(group.id, "closed");
                  setOpen(false);
                }}
              >
                <Ban size={13} />
                Close circle
              </button>
            )}

            <div className="border-t border-zinc-100 mt-1 pt-1">
              <button
                className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-rose-600 hover:bg-rose-50 transition-colors"
                onClick={() => {
                  onDelete(group.id);
                  setOpen(false);
                }}
              >
                <Trash2 size={13} />
                Delete circle
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Sort header ──────────────────────────────────────────────────────────────

function SortHead({
  field,
  label,
  current,
  dir,
  onSort,
}: {
  field: SortField;
  label: string;
  current: SortField;
  dir: SortDir;
  onSort: (f: SortField) => void;
}) {
  const active = current === field;
  return (
    <button
      onClick={() => onSort(field)}
      className={`inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-widest transition-colors ${
        active ? "text-emerald-700" : "text-zinc-400 hover:text-zinc-600"
      }`}
    >
      {label}
      <ArrowUpDown size={10} className={active ? "text-emerald-600" : ""} />
    </button>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: 8 }).map((_, j) => (
            <TableCell key={j}>
              <div
                className="h-4 bg-zinc-100 rounded animate-pulse"
                style={{ width: `${50 + Math.random() * 40}%` }}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminGroupsPage() {
  const [groups, setGroups] = useState<IGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<GroupStatus | "all">("all");
  const [freqFilter, setFreqFilter] = useState<Frequency | "all">("all");
  const [payoutFilter, setPayoutFilter] = useState<PayoutOrder | "all">("all");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const PER_PAGE = 15;

  useEffect(() => {
    HTTPS.get<IGroup[]>("/groups?show_all=true")
      .then(({ data }) => setGroups(Array.isArray(data) ? data : []))
      .catch(() => setGroups([]))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (id: string, status: GroupStatus) => {
    try {
      await HTTPS.patch(`/groups/${id}`, { status });
      setGroups((prev) =>
        prev.map((g) => (g.id === id ? { ...g, status } : g)),
      );
    } catch {
      alert("Failed to update status.");
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this circle? This cannot be undone.",
      )
    )
      return;
    try {
      await HTTPS.delete(`/groups/${id}`);
      setGroups((prev) => prev.filter((g) => g.id !== id));
    } catch {
      alert("Failed to delete circle.");
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const filtered = useMemo(() => {
    let result = [...groups];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (g) =>
          g.name?.toLowerCase().includes(q) ||
          g.description?.toLowerCase().includes(q) ||
          String(g.id).includes(q),
      );
    }

    if (statusFilter !== "all")
      result = result.filter((g) => g.status === statusFilter);
    if (freqFilter !== "all")
      result = result.filter((g) => g.frequency === freqFilter);
    if (payoutFilter !== "all")
      result = result.filter((g) => g.payout_order === payoutFilter);

    result.sort((a, b) => {
      let av: number | string = 0;
      let bv: number | string = 0;
      if (sortField === "name") {
        av = a.name || "";
        bv = b.name || "";
      } else if (sortField === "membersCount") {
        av = a.membersCount || 0;
        bv = b.membersCount || 0;
      } else if (sortField === "saved") {
        av = a.saved || 0;
        bv = b.saved || 0;
      } else if (sortField === "created_at") {
        av = new Date(String(a.created_at)).getTime();
        bv = new Date(String(b.created_at)).getTime();
      } else if (sortField === "status") {
        av = a.status || "";
        bv = b.status || "";
      }

      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [
    groups,
    search,
    statusFilter,
    freqFilter,
    payoutFilter,
    sortField,
    sortDir,
  ]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const activeCount = groups.filter((g) => g.status === "active").length;
  const defaulterGroups = groups.filter(
    (g) =>
      g.status === "active" &&
      g.members?.some((m: any) => m.status === "defaulted"),
  ).length;

  return (
    <div className="min-h-full bg-zinc-50/40">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1
              className="text-2xl font-bold text-zinc-900 tracking-tight"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Circles Management
            </h1>
            <p className="text-zinc-500 text-sm mt-0.5">
              {activeCount} active · {groups.length} total
              {defaulterGroups > 0 && (
                <span className="ml-2 text-rose-600 font-medium">
                  · {defaulterGroups} with defaulters
                </span>
              )}
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="gap-1.5 rounded-xl"
            onClick={() => {
              setLoading(true);
              HTTPS.get<IGroup[]>("/groups?show_all=true")
                .then(({ data }) => setGroups(Array.isArray(data) ? data : []))
                .finally(() => setLoading(false));
            }}
          >
            <RefreshCw size={14} />
            Refresh
          </Button>
        </div>

        {/* Summary cards */}
        {!loading && <SummaryCards groups={groups} />}

        {/* Defaulters alert */}
        {defaulterGroups > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl">
            <AlertTriangle size={16} className="text-rose-600 shrink-0" />
            <p className="text-sm text-rose-800 font-medium flex-1">
              {defaulterGroups} circle{defaulterGroups > 1 ? "s have" : " has"}{" "}
              members with missed payments — penalty assessment may be required.
            </p>
            <button
              className="text-[12px] text-rose-700 underline hover:text-rose-900"
              onClick={() => setStatusFilter("active")}
            >
              Filter active
            </button>
          </div>
        )}

        {/* Filters */}
        <Card variant="default">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                />
                <input
                  type="text"
                  placeholder="Search by name, description, or ID…"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full h-9 pl-8 pr-3 rounded-xl border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/20 transition-all"
                />
              </div>

              {/* Status */}
              <div className="flex items-center gap-1 bg-zinc-100 rounded-xl p-1">
                {(["all", "active", "paused", "closed"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setStatusFilter(s);
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-medium capitalize transition-all ${
                      statusFilter === s
                        ? "bg-white shadow-sm text-zinc-900"
                        : "text-zinc-500 hover:text-zinc-700"
                    }`}
                  >
                    {s === "all" ? "All status" : s}
                  </button>
                ))}
              </div>

              {/* Frequency */}
              <select
                value={freqFilter}
                onChange={(e) => {
                  setFreqFilter(e.target.value as any);
                  setPage(1);
                }}
                className="h-9 px-3 rounded-xl border border-zinc-200 text-[12px] text-zinc-700 bg-white outline-none focus:border-emerald-600"
              >
                <option value="all">All frequencies</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="bi-weekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
              </select>

              {/* Payout order */}
              <select
                value={payoutFilter}
                onChange={(e) => {
                  setPayoutFilter(e.target.value as any);
                  setPage(1);
                }}
                className="h-9 px-3 rounded-xl border border-zinc-200 text-[12px] text-zinc-700 bg-white outline-none focus:border-emerald-600"
              >
                <option value="all">All payout types</option>
                <option value="rotational">Rotational</option>
                <option value="random">Random draw</option>
                <option value="bidding">Bidding</option>
              </select>

              {/* Result count */}
              <span className="text-[12px] text-zinc-400 bg-zinc-100 rounded-full px-3 py-1.5 font-medium ml-auto">
                {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card variant="default" className="overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Circles</CardTitle>
              {filtered.length > 0 && (
                <span className="text-[12px] text-zinc-400">
                  Page {page} of {totalPages}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-separate border-spacing-0">
                <thead className="bg-zinc-50">
                  <tr>
                    <th className="px-4 py-3 text-left border-b border-zinc-200 first:pl-5 w-[280px]">
                      <SortHead
                        field="name"
                        label="Circle"
                        current={sortField}
                        dir={sortDir}
                        onSort={handleSort}
                      />
                    </th>
                    <th className="px-4 py-3 text-left border-b border-zinc-200">
                      <SortHead
                        field="status"
                        label="Status"
                        current={sortField}
                        dir={sortDir}
                        onSort={handleSort}
                      />
                    </th>
                    <th className="px-4 py-3 text-left border-b border-zinc-200">
                      <SortHead
                        field="membersCount"
                        label="Members"
                        current={sortField}
                        dir={sortDir}
                        onSort={handleSort}
                      />
                    </th>
                    <th className="px-4 py-3 text-left border-b border-zinc-200 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                      Frequency
                    </th>
                    <th className="px-4 py-3 text-left border-b border-zinc-200 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                      Contribution
                    </th>
                    <th className="px-4 py-3 text-left border-b border-zinc-200">
                      <SortHead
                        field="saved"
                        label="Total Saved"
                        current={sortField}
                        dir={sortDir}
                        onSort={handleSort}
                      />
                    </th>
                    <th className="px-4 py-3 text-left border-b border-zinc-200">
                      <SortHead
                        field="created_at"
                        label="Created"
                        current={sortField}
                        dir={sortDir}
                        onSort={handleSort}
                      />
                    </th>
                    <th className="px-4 py-3 text-left border-b border-zinc-200 last:pr-5 w-10" />
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-zinc-50">
                  {loading ? (
                    <TableSkeleton />
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-5 py-16 text-center text-[13px] text-zinc-400"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <Users size={28} className="text-zinc-200" />
                          <p>No circles found. Try adjusting your filters.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginated.map((group) => {
                      const hasDefaulters = group.members?.some(
                        (m: any) => m.status === "defaulted",
                      );
                      return (
                        <tr
                          key={group.id}
                          className="hover:bg-zinc-50/60 transition-colors group"
                        >
                          {/* Name */}
                          <td className="px-4 py-3.5 first:pl-5">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[11px] shrink-0">
                                {(group.name || "GR").slice(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="text-[13px] font-semibold text-zinc-900 truncate max-w-[160px]">
                                    {group.name}
                                  </p>
                                  {group.isPrivate ? (
                                    <Lock
                                      size={11}
                                      className="text-zinc-400 shrink-0"
                                    />
                                  ) : (
                                    <Globe
                                      size={11}
                                      className="text-zinc-400 shrink-0"
                                    />
                                  )}
                                  {hasDefaulters && (
                                    <AlertTriangle
                                      size={11}
                                      className="text-rose-500 shrink-0"
                                    />
                                  )}
                                </div>
                                <p className="text-[11px] text-zinc-400 truncate max-w-[160px]">
                                  {group.description || "No description"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3.5">
                            <StatusBadge status={group.status} />
                          </td>

                          {/* Members */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[13px] font-medium text-zinc-800">
                                {group.membersCount ??
                                  group.members?.length ??
                                  0}
                              </span>
                              <span className="text-zinc-400 text-[12px]">
                                / {group.max_members}
                              </span>
                              <div className="w-12 h-1.5 bg-zinc-100 rounded-full overflow-hidden ml-1">
                                <div
                                  className="h-full bg-emerald-500 rounded-full"
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      ((group.membersCount ?? 0) /
                                        (group.max_members || 1)) *
                                        100,
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Frequency */}
                          <td className="px-4 py-3.5">
                            <span className="text-[12px] text-zinc-600 capitalize">
                              {freqLabel(group.frequency)}
                            </span>
                          </td>

                          {/* Contribution */}
                          <td className="px-4 py-3.5">
                            <span className="text-[13px] font-medium text-zinc-800">
                              {formatNaira(Number(group.contribution) || 0)}
                            </span>
                          </td>

                          {/* Saved */}
                          <td className="px-4 py-3.5">
                            <span className="text-[13px] font-semibold text-emerald-700">
                              {formatNaira(group.saved || 0)}
                            </span>
                          </td>

                          {/* Created */}
                          <td className="px-4 py-3.5">
                            <span className="text-[12px] text-zinc-500">
                              {group.created_at
                                ? new Date(
                                    String(group.created_at),
                                  ).toLocaleDateString("en-NG", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "—"}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3.5 last:pr-5">
                            <div className="flex items-center gap-1">
                              <Link href={`/admin/groups/${group.id}`}>
                                <button className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors opacity-0 group-hover:opacity-100">
                                  <Eye size={14} />
                                </button>
                              </Link>
                              <ActionMenu
                                group={group}
                                onStatusChange={handleStatusChange}
                                onDelete={handleDelete}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-100 bg-zinc-50/50">
                <p className="text-[12px] text-zinc-400">
                  Showing {(page - 1) * PER_PAGE + 1}–
                  {Math.min(page * PER_PAGE, filtered.length)} of{" "}
                  {filtered.length}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-[12px] font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors disabled:opacity-40 disabled:pointer-events-none"
                  >
                    ← Prev
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const n =
                      Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                    return (
                      <button
                        key={n}
                        onClick={() => setPage(n)}
                        className={`w-7 h-7 text-[12px] font-medium rounded-lg transition-colors ${
                          n === page
                            ? "bg-emerald-700 text-white"
                            : "text-zinc-600 hover:bg-zinc-100"
                        }`}
                      >
                        {n}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-[12px] font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors disabled:opacity-40 disabled:pointer-events-none"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
