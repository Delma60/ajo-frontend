"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardBadge,
  CardDivider,
  CardProgress,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Plus,
  Search,
  ChevronRight,
  Clock,
  CalendarClock,
  TrendingUp,
  Lock,
  Globe,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  PauseCircle,
} from "lucide-react";
import Link from "next/link";
import { IGroup } from "@/lib/types/group.types";
import { Auth } from "@/lib/auth";
import { Input } from "@/components/ui/input";



// ─── Mock data — only groups the user has joined ──────────────────────────────

const MY_GROUPS: IGroup[] = [
  {
    id: "1",
    name: "Lagos Tech Circle",
    description: "Monthly savings for tech professionals in Lagos.",
    nextDue: "2026-05-30",
    goal: 500000,
    saved: 320000,
    contribution: 50000,
    membersCount: 8,
    frequency: "monthly",
    max_members: 10,
    payout_order: "rotational",
    status: "active",
    nextPayout: "2026-06-01",
    isPrivate: false,
    members: [],
    start_date: "",
    imageUrl: "",
    owner_id: "",
    created_at: "",
    group_transaction: [],
    transactions: [],
    cycles: [],
    creation_fee: "",
    pendingInvites: [],
    pendingRequests: []
  },
  {
    id: "2",
    name: "Abuja Women Save",
    description: "Empowering women through collective savings. Weekly contributions for big dreams.",
    nextDue: "2026-05-18",
    goal: 200000,
    saved: 140000,
    contribution: 10000,
    membersCount: 14,
    frequency: "weekly",
    max_members: 20,
    payout_order: "random",
    status: "active",
    nextPayout: "2026-05-18",
    isPrivate: true,
    members: [],
    start_date: "",
    imageUrl: "",
    owner_id: "",
    created_at: "",
    group_transaction: [],
    transactions: [],
    cycles: [],
    creation_fee: "",
    pendingInvites: [],
    pendingRequests: []
  },
  {
    id: "4",
    name: "Family Savings Club",
    description: "A private circle for the Okafor extended family.",
    nextDue: "2026-06-01",
    goal: 300000,
    saved: 300000,
    contribution: 25000,
    membersCount: 12,
    frequency: "monthly",
    max_members: 12,
    payout_order: "rotational",
    status: "closed",
    nextPayout: "2026-06-01",
    isPrivate: true,
    members: [],
    start_date: "",
    imageUrl: "",
    owner_id: "",
    created_at: "",
    group_transaction: [],
    transactions: [],
    cycles: [],
    creation_fee: "",
    pendingInvites: [],
    pendingRequests: []
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatNaira(amount: number) {
  if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `₦${(amount / 1_000).toFixed(0)}k`;
  return `₦${amount}`;
}

function frequencyLabel(f: IGroup["frequency"]) {
  return { daily: "Daily", weekly: "Weekly", "bi-weekly": "Bi-weekly", monthly: "Monthly" }[f];
}

function daysUntil(dateStr: string | Date) {
  const diff = new Date(dateStr).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return "Overdue";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `${days} days`;
}

// ─── Payment alert banner ─────────────────────────────────────────────────────

function PaymentDueBanner({ groups, currentUserId }: { groups: IGroup[], currentUserId: string }) {
  // find user in member
  const currentMember = groups.flatMap(g => g.members).find(m => m.id === currentUserId);
  const unpaid = groups.filter((g) => g.status === "active" && !currentMember?.hasPaid);
  if (unpaid.length === 0) return null;

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-start gap-3">
      <AlertCircle size={18} className="text-amber-600 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-amber-800">
          {unpaid.length} contribution{unpaid.length > 1 ? "s" : ""} due soon
        </p>
        <p className="text-xs text-amber-700 mt-0.5">
          {unpaid.map((g) => g.name).join(", ")} — make your payment to stay in good standing.
        </p>
      </div>
      <Button size="sm" variant="secondary" className="rounded-xl shrink-0 bg-amber-100 text-amber-800 hover:bg-amber-200">
        Pay now
      </Button>
    </div>
  );
}

// ─── Circle row (list item style) ────────────────────────────────────────────

function CircleRow({ group, currentUserId }: { group: IGroup, currentUserId: string }) {
  const currentMember = group.members.find(m => m.id === currentUserId);

  const pct = Math.min(100, Math.round((group.saved / group.goal) * 100));
  const dueIn = daysUntil(group.nextDue);
  const isDueSoon = !currentMember?.hasPaid && group.status === "active" && (dueIn === "Today" || dueIn === "Tomorrow" || dueIn === "Overdue");

  const statusIcon = {
    active: <CheckCircle2 size={14} className="text-emerald-600" />,
    paused: <PauseCircle size={14} className="text-amber-500" />,
    closed: <CheckCircle2 size={14} className="text-zinc-400" />,
  }[group.status];

  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-50 transition-colors group cursor-pointer">
      {/* Avatar */}
      <div className="h-11 w-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0 select-none">
        {group.name.slice(0, 2).toUpperCase()}
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="text-[14px] font-semibold text-zinc-900 truncate">{group.name}</span>
          {currentMember?.role === "admin" && (
            <CardBadge color="green">Admin</CardBadge>
          )}
          {group.isPrivate
            ? <Lock size={11} className="text-zinc-400" />
            : <Globe size={11} className="text-zinc-400" />
          }
          {statusIcon}
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden mb-1.5 max-w-xs">
          <div
            className={`h-full rounded-full transition-all duration-500 ${pct >= 100 ? "bg-emerald-400" : "bg-emerald-600"}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="flex items-center gap-3 text-[11px] text-zinc-400 flex-wrap">
          <span className="flex items-center gap-1">
            <Users size={10} /> {group.membersCount}/{group.max_members}
          </span>
          <span>{formatNaira(Number(group.contribution))} · {frequencyLabel(group.frequency)}</span>
          {currentMember?.myTurn && (
            <span>Turn {currentMember.myTurn} of {group.max_members}</span>
          )}
        </div>
      </div>

      {/* Right: due date + action */}
      <div className="text-right shrink-0 hidden sm:block">
        <p className={`text-[12px] font-semibold mb-0.5 ${isDueSoon ? "text-amber-600" : "text-zinc-700"}`}>
          {currentMember?.hasPaid ? "Paid ✓" : dueIn}
        </p>
        <p className="text-[11px] text-zinc-400">
          {currentMember?.hasPaid ? "This cycle" : "Next due"}
        </p>
      </div>

      <ChevronRight size={16} className="text-zinc-300 group-hover:text-zinc-500 transition-colors shrink-0" />
    </div>
  );
}

// ─── Summary stats ────────────────────────────────────────────────────────────

function SummaryStats({ groups }: { groups: IGroup[] }) {
  const active = groups.filter((g) => g.status === "active");
  const totalContributed = active.reduce((s, g) => s + Number(g.contribution), 0);
  const nextPayoutGroup = active.sort(
    (a, b) => new Date(a.nextPayout).getTime() - new Date(b.nextPayout).getTime()
  )[0];

  const stats = [
    { label: "Active circles", value: active.length.toString(), icon: TrendingUp },
    { label: "Per cycle", value: formatNaira(totalContributed), icon: ArrowUpRight },
    { label: "Next payout", value: nextPayoutGroup ? new Date(nextPayoutGroup.nextPayout).toLocaleDateString("en-NG", { day: "numeric", month: "short" }) : "--", icon: CalendarClock },
    { label: "Total saved", value: formatNaira(groups.reduce((s, g) => s + g.saved, 0)), icon: TrendingUp },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map(({ label, value, icon: Icon }) => (
        <Card key={label} className="px-4 py-3 flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <Icon size={15} className="text-emerald-700" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wide truncate">{label}</p>
            <p className="text-[15px] font-bold text-zinc-900 leading-tight">{value}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MyCirclesPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "closed">("all");
  const userId = Auth.id();
  const filtered = MY_GROUPS.filter((g) => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || g.status === filter;
    return matchSearch && matchFilter;
  });

  const activeGroups = MY_GROUPS.filter((g) => g.status === "active");

  return (
    <div className="min-h-full bg-zinc-50/40">
      <div className=" px-4 sm:px-6 py-6 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">My Circles</h1>
            <p className="text-zinc-500 text-sm mt-0.5">
              {MY_GROUPS.length} circle{MY_GROUPS.length !== 1 ? "s" : ""} · {activeGroups.length} active
            </p>
          </div>
          <Link href="/groups/discover">
            <Button variant="primary" size="sm" className="gap-2 rounded-xl">
              <Plus size={15} />
              Join a circle
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <SummaryStats groups={MY_GROUPS} />

        {/* Payment alert */}
        <PaymentDueBanner groups={MY_GROUPS} currentUserId={String(userId)} />

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search your circles…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="py-[25px]"
            />
          </div>
          <div className="flex items-center gap-1 bg-zinc-100 rounded-xl p-1">
            {(["all", "active", "closed"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2.5 rounded-lg text-[12px] font-medium capitalize transition-all ${filter === f ? "bg-white shadow-sm text-zinc-900" : "text-zinc-500 hover:text-zinc-700"}`}
              >
                {f === "all" ? "All" : f}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <Card className="py-16 text-center">
            <div className="h-12 w-12 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-3">
              <Users size={22} className="text-zinc-400" />
            </div>
            <p className="text-zinc-600 font-medium text-sm">No circles found</p>
            <p className="text-zinc-400 text-xs mt-1">Try a different search or filter</p>
          </Card>
        ) : (
          <Card variant="default" className="overflow-hidden divide-y divide-zinc-100">
            {filtered.map((group) => (
              <CircleRow key={group.id} group={group} currentUserId={String(userId)} />
            ))}
          </Card>
        )}

        {/* Footer CTA */}
        {MY_GROUPS.length > 0 && (
          <div className="text-center pt-2">
            <Link href="/groups/discover">
              <button className="text-sm text-emerald-700 font-medium hover:text-emerald-600 hover:underline transition-colors">
                Discover more circles →
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}