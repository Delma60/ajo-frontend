"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Crown,
  CheckCircle2,
  PauseCircle,
  XCircle,
  Globe,
  Lock,
  Clock,
  AlertTriangle,
  Shield,
  TrendingUp,
  CircleDollarSign,
  Calendar,
  Ban,
  Play,
  Trash2,
  RefreshCw,
  ChevronDown,
  MoreHorizontal,
  UserMinus,
  UserCheck,
  Repeat2,
  ArrowDownLeft,
  CreditCard,
  Activity,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardDivider,
  CardBadge,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HTTPS } from "@/lib/http";
import { IGroup, GroupStatus, IMember } from "@/lib/types/group.types";
import { ITransaction } from "@/lib/types/transaction.types";
import { formatNaira, freqLabel, payoutLabel, formatDate } from "@/lib/utils";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
  PopoverBody,
  PopoverFooter,
  PopoverClose,
} from "@/components/ui/popover";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<
    string,
    { icon: React.ReactNode; cls: string; label: string }
  > = {
    active: {
      icon: <CheckCircle2 size={11} />,
      cls: "bg-emerald-50 text-emerald-700",
      label: "Active",
    },
    paused: {
      icon: <PauseCircle size={11} />,
      cls: "bg-amber-50 text-amber-700",
      label: "Paused",
    },
    closed: {
      icon: <XCircle size={11} />,
      cls: "bg-zinc-100 text-zinc-500",
      label: "Closed",
    },
    pending: {
      icon: <Clock size={11} />,
      cls: "bg-blue-50 text-blue-700",
      label: "Pending",
    },
    defaulted: {
      icon: <AlertTriangle size={11} />,
      cls: "bg-rose-50 text-rose-700",
      label: "Defaulted",
    },
    success: {
      icon: <CheckCircle2 size={11} />,
      cls: "bg-emerald-50 text-emerald-700",
      label: "Success",
    },
    failed: {
      icon: <XCircle size={11} />,
      cls: "bg-rose-50 text-rose-700",
      label: "Failed",
    },
  };
  const cfg = map[status] ?? map.pending;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.cls}`}
    >
      {cfg.icon} {cfg.label}
    </span>
  );
}

// ─── Member action menu ───────────────────────────────────────────────────────

function MemberActionMenu({
  member,
  groupId,
  onUpdate,
}: {
  member: IMember;
  groupId: string;
  onUpdate: () => void;
}) {
  const promote = async () => {
    try {
      const { ok, message } = await HTTPS.post(`/groups/${groupId}/members/${member.id}/promote`);
      if (ok){
        onUpdate();
        toast.success(`${member.name} promoted to admin successfully.`);
      } else {
        toast.error(message || `Failed to promote ${member.name} to admin.`);
      }
    } catch (error) {
      toast.error(`Failed to promote ${member.name} to admin.`);
    }
  };

  const demote = async () => {
    await HTTPS.post(`/groups/${groupId}/members/${member.id}/demote`);
    onUpdate();
  };

  const remove = async () => {
    if (!confirm(`Remove ${member.name} from this circle?`)) return;
    await HTTPS.delete(`/groups/${groupId}/members/${member.id}`);
    onUpdate();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </PopoverTrigger>
      <PopoverContent width={220} className="min-h-10">
        <PopoverBody>
          {member.role !== "admin" && (
            <button
              onClick={promote}
              className="w-full flex items-center gap-2 px-3 py-2 text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              <Crown size={12} className="text-amber-500" />
              Promote to admin
            </button>
          )}
          {member.role === "admin" && (
            <button
              onClick={demote}
              className="w-full flex items-center gap-2 px-3 py-2 text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              <UserCheck size={12} />
              Demote to member
            </button>
          )}
          <div className="border-t border-zinc-100 mt-1 pt-1">
            <button
              onClick={remove}
              className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <UserMinus size={12} />
              Remove member
            </button>
          </div>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color = "emerald",
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  color?: "emerald" | "blue" | "amber" | "rose";
}) {
  const clr = {
    emerald: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
  }[color];

  return (
    <Card variant="flat" className="px-4 py-3">
      <div className="flex items-center gap-3">
        <div
          className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${clr}`}
        >
          <Icon size={16} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wide truncate">
            {label}
          </p>
          <p className="text-[15px] font-bold text-zinc-900 leading-tight">
            {value}
          </p>
          {sub && <p className="text-[11px] text-zinc-400">{sub}</p>}
        </div>
      </div>
    </Card>
  );
}

// ─── Hero banner ──────────────────────────────────────────────────────────────

function GroupHero({
  group,
  onStatusChange,
  isUpdating,
}: {
  group: IGroup;
  onStatusChange: (s: GroupStatus) => void;
  isUpdating: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const adminMember = group.members?.find((m) => m.role === "admin");

  return (
    <div
      className="relative rounded-2xl overflow-hidden px-6 py-8"
      style={{
        background:
          "linear-gradient(135deg, #18181b 0%, #27272a 60%, #3f3f46 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute -top-12 -right-12 w-56 h-56 rounded-full opacity-10"
        style={{
          background: "radial-gradient(circle, #6ee7b7 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
        <div className="space-y-3">
          <Link
            href="/admin/groups"
            className="inline-flex items-center gap-1.5 text-[12px] text-zinc-400/70 hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft size={12} />
            All circles
          </Link>

          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={group.status} />
            {group.isPrivate ? (
              <span className="inline-flex items-center gap-1 text-[10px] text-zinc-400 bg-white/10 rounded-full px-2 py-0.5">
                <Lock size={9} /> Private
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] text-zinc-400 bg-white/10 rounded-full px-2 py-0.5">
                <Globe size={9} /> Public
              </span>
            )}
          </div>

          <h1
            className="text-2xl sm:text-3xl font-bold text-white leading-tight"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {group.name}
          </h1>
          <p className="text-zinc-400 text-[13px] max-w-lg leading-relaxed">
            {group.description || "No description provided."}
          </p>

          {adminMember && (
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 w-fit">
              <div className="w-7 h-7 rounded-full bg-amber-600/60 flex items-center justify-center text-[10px] font-bold text-amber-200">
                {(adminMember.name || "AD").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wide">
                  Admin
                </p>
                <p className="text-[13px] font-semibold text-white leading-none">
                  {adminMember.name}
                </p>
              </div>
              <Crown size={12} className="text-amber-400 ml-1" />
            </div>
          )}
        </div>

        {/* Admin actions */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <button
              onClick={() => setMenuOpen((p) => !p)}
              disabled={isUpdating}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white text-[13px] font-medium hover:bg-white/20 transition-colors disabled:opacity-50"
            >
              {isUpdating ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Activity size={14} />
              )}
              Manage
              <ChevronDown size={12} />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-10 z-20 w-44 bg-white border border-zinc-200 rounded-xl shadow-lg py-1 overflow-hidden text-[12px]">
                  {group.status !== "active" && (
                    <button
                      onClick={() => {
                        onStatusChange("active");
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-emerald-700 hover:bg-emerald-50 transition-colors"
                    >
                      <Play size={12} /> Set Active
                    </button>
                  )}
                  {group.status !== "paused" && (
                    <button
                      onClick={() => {
                        onStatusChange("paused");
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-amber-700 hover:bg-amber-50 transition-colors"
                    >
                      <PauseCircle size={12} /> Pause Circle
                    </button>
                  )}
                  {group.status !== "closed" && (
                    <button
                      onClick={() => {
                        onStatusChange("closed");
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-zinc-600 hover:bg-zinc-50 transition-colors"
                    >
                      <Ban size={12} /> Close Circle
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminGroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<IGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "members" | "transactions" | "cycles" | "info"
  >("members");

  const fetchGroup = () => {
    HTTPS.get<IGroup>(`/groups/${id}?by_pass=true`)
      .then(({ data, ok }) => {
        if (ok) setGroup(data);
        else setError("Group not found.");
      })
      .catch(() => setError("Failed to load circle."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchGroup();
  }, [id]);

  const handleStatusChange = async (status: GroupStatus) => {
    if (!group) return;
    setIsUpdating(true);
    try {
      await HTTPS.patch(`/groups/${id}`, { status });
      setGroup((g) => (g ? { ...g, status } : g));
    } catch {
      alert("Failed to update status.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-full bg-zinc-50/40 flex items-center justify-center">
        <RefreshCw size={20} className="animate-spin text-zinc-400" />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-full bg-zinc-50/40 flex items-center justify-center p-6">
        <Card
          variant="default"
          className="max-w-sm w-full text-center py-10 px-6"
        >
          <AlertTriangle className="w-10 h-10 text-zinc-300 mx-auto mb-4" />
          <p className="text-sm text-zinc-500">
            {error ?? "Circle not found."}
          </p>
          <Link href="/admin/groups">
            <Button size="sm" variant="secondary" className="mt-4 rounded-xl">
              Back to circles
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const members = group.members ?? [];
  const transactions = group.transactions ?? [];
  const cycles = group.cycles ?? [];
  const defaulterCount = members.filter((m) => m.status === "defaulted").length;
  const paidCount = members.filter((m) => m.hasPaid).length;
  const fillPct = group.max_members
    ? Math.round((members.length / group.max_members) * 100)
    : 0;

  const TABS = [
    { key: "members", label: `Members (${members.length})` },
    { key: "transactions", label: `Transactions (${transactions.length})` },
    { key: "cycles", label: `Cycles (${cycles.length})` },
    { key: "info", label: "Circle Info" },
  ] as const;

  return (
    <div className="min-h-full bg-zinc-50/40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Hero */}
        <GroupHero
          group={group}
          onStatusChange={handleStatusChange}
          isUpdating={isUpdating}
        />

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Total Saved"
            value={formatNaira(group.saved || 0)}
            icon={CircleDollarSign}
            color="emerald"
            sub={`Goal: ${formatNaira(group.goal || 0)}`}
          />
          <StatCard
            label="Members"
            value={`${members.length} / ${group.max_members}`}
            icon={Users}
            color="blue"
            sub={`${fillPct}% capacity`}
          />
          <StatCard
            label="Paid this cycle"
            value={`${paidCount} / ${members.length}`}
            icon={CheckCircle2}
            color={paidCount === members.length ? "emerald" : "amber"}
            sub={
              members.length > 0
                ? `${Math.round((paidCount / members.length) * 100)}% compliance`
                : undefined
            }
          />
          <StatCard
            label="Defaulters"
            value={String(defaulterCount)}
            icon={AlertTriangle}
            color={defaulterCount > 0 ? "rose" : "emerald"}
            sub={defaulterCount > 0 ? "Require attention" : "All compliant"}
          />
        </div>

        {/* Alerts */}
        {defaulterCount > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl">
            <AlertTriangle size={15} className="text-rose-600 shrink-0" />
            <p className="text-[13px] text-rose-800 font-medium">
              {defaulterCount} member{defaulterCount > 1 ? "s have" : " has"}{" "}
              defaulted — consider applying penalty or removing from circle.
            </p>
          </div>
        )}

        {/* Tabs + content */}
        <Card variant="default" className="overflow-hidden">
          {/* Tab bar */}
          <CardHeader className="py-4 p-0">
            <div className="flex border-b border-zinc-100 overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-5 py-3.5 text-[13px] font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                    activeTab === tab.key
                      ? "border-emerald-600 text-emerald-700"
                      : "border-transparent text-zinc-500 hover:text-zinc-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </CardHeader>

          <CardContent>
            {activeTab === "members" && (
              <CardContent className="p-0">
                {members.length === 0 ? (
                  <div className="py-12 text-center text-[13px] text-zinc-400">
                    No members yet.
                  </div>
                ) : (
                  <Table className="w-full text-sm border-separate border-spacing-0">
                    <TableHeader className="">
                      <TableRow>
                        <TableHead className="px-5 py-3 text-left border-b border-zinc-200 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                          #
                        </TableHead>
                        <TableHead className="px-4 py-3 text-left border-b border-zinc-200 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                          Member
                        </TableHead>
                        <TableHead className="px-4 py-3 text-left border-b border-zinc-200 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                          Role
                        </TableHead>
                        <TableHead className="px-4 py-3 text-left border-b border-zinc-200 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                          Status
                        </TableHead>
                        <TableHead className="px-4 py-3 text-left border-b border-zinc-200 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                          Contributed
                        </TableHead>
                        <TableHead className="px-4 py-3 text-left border-b border-zinc-200 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                          Paid this cycle
                        </TableHead>
                        <TableHead className="px-4 py-3 text-left border-b border-zinc-200 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                          Joined
                        </TableHead>
                        <TableHead className="px-4 py-3 last:pr-5 border-b border-zinc-200 w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-zinc-50">
                      {members.map((member, idx) => (
                        <TableRow
                          key={member.id}
                          className={`hover:bg-zinc-50/60 transition-colors ${member.status === "defaulted" ? "bg-rose-50/30" : ""}`}
                        >
                          <TableCell className="px-5 py-3 text-[12px] text-zinc-400 font-medium">
                            {idx + 1}
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0 ${
                                  member.role === "admin"
                                    ? "bg-amber-600"
                                    : "bg-zinc-400"
                                }`}
                              >
                                {(member.name || "?").slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-[13px] font-semibold text-zinc-800">
                                  {member.name}
                                </p>
                                <p className="text-[11px] text-zinc-400">
                                  {member.email || "—"}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            {member.role === "admin" ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 rounded-full px-2 py-0.5">
                                <Crown size={9} /> Admin
                              </span>
                            ) : (
                              <span className="text-[12px] text-zinc-500">
                                Member
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <StatusBadge status={member.status || "active"} />
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <span className="text-[13px] font-medium text-zinc-800">
                              {formatNaira(
                                Number(
                                  (member as any).pivot?.total_contributed ||
                                    (member as any).total_contributed ||
                                    0,
                                ),
                              )}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            {member.hasPaid ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                                <CheckCircle2 size={11} /> Paid
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 font-semibold">
                                <Clock size={11} /> Pending
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <span className="text-[12px] text-zinc-500">
                              {(member as any).joined_at_human ||
                              (member as any).pivot?.joined_at
                                ? new Date(
                                    (member as any).pivot?.joined_at || "",
                                  ).toLocaleDateString("en-NG", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "—"}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-3 last:pr-5">
                            <MemberActionMenu
                              member={member}
                              groupId={group.id}
                              onUpdate={fetchGroup}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            )}

            {/* Transactions tab */}
            {activeTab === "transactions" && (
              <CardContent className="p-0">
                {transactions.length === 0 ? (
                  <div className="py-12 text-center text-[13px] text-zinc-400">
                    No transactions yet.
                  </div>
                ) : (
                  <table className="w-full text-sm border-separate border-spacing-0">
                    <thead className="bg-zinc-50">
                      <tr>
                        <th className="px-5 py-3 text-left border-b border-zinc-200 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left border-b border-zinc-200 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-left border-b border-zinc-200 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                          User
                        </th>
                        <th className="px-4 py-3 text-left border-b border-zinc-200 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left border-b border-zinc-200 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                          Reference
                        </th>
                        <th className="px-4 py-3 last:pr-5 border-b border-zinc-200 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                      {transactions.map((tx: any) => {
                        const isCredit = tx.direction === "credit";
                        return (
                          <tr
                            key={tx.id}
                            className="hover:bg-zinc-50/60 transition-colors"
                          >
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${isCredit ? "bg-emerald-50 text-emerald-600" : "bg-zinc-100 text-zinc-500"}`}
                                >
                                  {tx.type === "payout" ? (
                                    <ArrowDownLeft size={12} />
                                  ) : tx.type === "refund" ? (
                                    <Repeat2 size={12} />
                                  ) : (
                                    <CreditCard size={12} />
                                  )}
                                </div>
                                <span className="text-[12px] text-zinc-700 capitalize">
                                  {tx.label || tx.type}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`text-[13px] font-semibold ${isCredit ? "text-emerald-700" : "text-zinc-800"}`}
                              >
                                {isCredit ? "+" : "-"}
                                {formatNaira(Number(tx.amount))}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-[12px] text-zinc-600">
                                {tx.user?.name ?? "—"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <StatusBadge status={tx.status} />
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-[11px] text-zinc-400 font-mono">
                                {tx.reference || "—"}
                              </span>
                            </td>
                            <td className="px-4 py-3 last:pr-5">
                              <span className="text-[12px] text-zinc-500">
                                {tx.created_at
                                  ? new Date(tx.created_at).toLocaleDateString(
                                      "en-NG",
                                      {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      },
                                    )
                                  : "—"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </CardContent>
            )}

            {/* Cycles tab */}
            {activeTab === "cycles" && (
              <CardContent className="p-0">
                {cycles.length === 0 ? (
                  <div className="py-12 text-center text-[13px] text-zinc-400">
                    No cycle records yet.
                  </div>
                ) : (
                  <table className="w-full text-sm border-separate border-spacing-0">
                    <thead className="bg-zinc-50">
                      <tr>
                        <th className="px-5 py-3 text-left border-b border-zinc-200 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                          Cycle
                        </th>
                        <th className="px-4 py-3 text-left border-b border-zinc-200 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                          Recipient
                        </th>
                        <th className="px-4 py-3 text-left border-b border-zinc-200 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                          Amount
                        </th>
                        <th className="px-4 py-3 last:pr-5 border-b border-zinc-200 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                      {cycles.map((cycle: any) => (
                        <tr
                          key={cycle.id}
                          className="hover:bg-zinc-50/60 transition-colors"
                        >
                          <td className="px-5 py-3">
                            <span className="text-[13px] font-semibold text-zinc-800">
                              Cycle #{cycle.cycle_number}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">
                                {(
                                  cycle.recipient_user?.name ||
                                  cycle.recipient ||
                                  "?"
                                )
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </div>
                              <span className="text-[13px] text-zinc-700">
                                {cycle.recipient_user?.name ||
                                  cycle.recipient ||
                                  "—"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-[13px] font-semibold text-emerald-700">
                              {formatNaira(Number(cycle.amount) || 0)}
                            </span>
                          </td>
                          <td className="px-4 py-3 last:pr-5">
                            <span className="text-[12px] text-zinc-500">
                              {cycle.created_at
                                ? new Date(
                                    String(cycle.created_at),
                                  ).toLocaleDateString("en-NG", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "—"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            )}

            {/* Info tab */}
            {activeTab === "info" && (
              <CardContent className="pt-4 pb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="text-[12px] font-semibold text-zinc-400 uppercase tracking-widest">
                      Circle Rules
                    </h3>
                    {[
                      { label: "Frequency", value: freqLabel(group.frequency) },
                      {
                        label: "Payout order",
                        value: payoutLabel(group.payout_order),
                      },
                      {
                        label: "Contribution",
                        value: formatNaira(Number(group.contribution) || 0),
                      },
                      {
                        label: "Max members",
                        value: String(group.max_members),
                      },
                      {
                        label: "Start date",
                        value:
                          (group as any).meta?.start_date ||
                          (group as any).start_date
                            ? new Date(
                                String(
                                  (group as any).meta?.start_date ||
                                    (group as any).start_date,
                                ),
                              ).toLocaleDateString("en-NG", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })
                            : "—",
                      },
                      {
                        label: "Privacy",
                        value: group.isPrivate ? "Private" : "Public",
                      },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="flex items-center justify-between text-[13px] py-2 border-b border-zinc-50"
                      >
                        <span className="text-zinc-500">{label}</span>
                        <span className="font-medium text-zinc-900">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-[12px] font-semibold text-zinc-400 uppercase tracking-widest">
                      Financial Summary
                    </h3>
                    {[
                      { label: "Goal", value: formatNaira(group.goal || 0) },
                      {
                        label: "Total saved",
                        value: formatNaira(group.saved || 0),
                      },
                      {
                        label: "Next payout",
                        value: group.nextPayout
                          ? new Date(
                              String(group.nextPayout),
                            ).toLocaleDateString("en-NG", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : "—",
                      },
                      {
                        label: "Creation fee",
                        value: formatNaira(Number(group.creation_fee) || 0),
                      },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="flex items-center justify-between text-[13px] py-2 border-b border-zinc-50"
                      >
                        <span className="text-zinc-500">{label}</span>
                        <span className="font-medium text-zinc-900">
                          {value}
                        </span>
                      </div>
                    ))}

                    {/* Recent group transactions */}
                    {group.group_transaction &&
                      group.group_transaction.length > 0 && (
                        <div className="pt-3 space-y-2">
                          <h3 className="text-[12px] font-semibold text-zinc-400 uppercase tracking-widest">
                            Recent Contributions
                          </h3>
                          {group.group_transaction.slice(0, 5).map((tx, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between text-[12px]"
                            >
                              <span className="text-zinc-500">{tx.who}</span>
                              <span className="font-semibold text-emerald-700">
                                {formatNaira(tx.amount)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              </CardContent>
            )}
          </CardContent>

          {/* Members tab */}
        </Card>
      </div>
    </div>
  );
}
