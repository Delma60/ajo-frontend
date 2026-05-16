"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardBadge,
  CardProgress,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Plus,
  Search,
  Lock,
  Globe,
  CalendarClock,
  TrendingUp,
  ChevronRight,
  Filter,
} from "lucide-react";

// ─── Mock types (mirrors IGroup) ──────────────────────────────────────────────

interface IGroupCycle {
  id: string | number;
  cycle_number: string;
  amount: string;
  recipient: string;
  recipient_user: { name: string };
  created_at: string | Date;
}

interface IMember {
  id: string | number;
  name: string;
  email: string;
  role: "admin" | "member" | "pending";
  joined_at_human: string;
  hasPaid: boolean;
  last_payment_at: Date;
}

interface IGroup {
  id: string;
  name: string;
  description: string;
  nextDue: string;
  goal: number;
  saved: number;
  contribution: string | number;
  members: IMember[];
  membersCount: number;
  frequency: "daily" | "weekly" | "bi-weekly" | "monthly";
  max_members: number;
  start_date: Date | string;
  payout_order: "rotational" | "random" | "bidding";
  imageUrl: string;
  owner_id: string | number;
  status: "active" | "closed" | "paused";
  created_at: string | Date;
  nextPayout: string | Date;
  joined?: boolean;
  isPrivate: boolean;
  cycles: IGroupCycle[];
  creation_fee: string | number;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_GROUPS: IGroup[] = [
  {
    id: "1",
    name: "Lagos Tech Circle",
    description:
      "Monthly savings for tech professionals in Lagos. Join us to grow together and support each other's financial goals.",
    nextDue: "2026-05-30",
    goal: 500000,
    saved: 320000,
    contribution: 50000,
    members: [],
    membersCount: 8,
    frequency: "monthly",
    max_members: 10,
    start_date: "2026-01-01",
    payout_order: "rotational",
    imageUrl: "",
    owner_id: "1",
    status: "active",
    created_at: "2026-01-01",
    nextPayout: "2026-06-01",
    joined: true,
    isPrivate: false,
    cycles: [],
    creation_fee: 0,
  },
  {
    id: "2",
    name: "Abuja Women Save",
    description:
      "Empowering women through collective savings. Weekly contributions for big dreams.",
    nextDue: "2026-05-18",
    goal: 200000,
    saved: 140000,
    contribution: 10000,
    members: [],
    membersCount: 14,
    frequency: "weekly",
    max_members: 20,
    start_date: "2026-02-01",
    payout_order: "random",
    imageUrl: "",
    owner_id: "2",
    status: "active",
    created_at: "2026-02-01",
    nextPayout: "2026-05-18",
    joined: true,
    isPrivate: true,
    cycles: [],
    creation_fee: 500,
  },
  {
    id: "3",
    name: "Eko Entrepreneurs",
    description:
      "Funding the next generation of Lagos entrepreneurs through bi-weekly ajo cycles.",
    nextDue: "2026-05-24",
    goal: 1000000,
    saved: 600000,
    contribution: 100000,
    members: [],
    membersCount: 10,
    frequency: "bi-weekly",
    max_members: 10,
    start_date: "2026-01-15",
    payout_order: "bidding",
    imageUrl: "",
    owner_id: "3",
    status: "active",
    created_at: "2026-01-15",
    nextPayout: "2026-05-24",
    joined: false,
    isPrivate: false,
    cycles: [],
    creation_fee: 2000,
  },
  {
    id: "4",
    name: "Family Savings Club",
    description: "A private circle for the Okafor extended family.",
    nextDue: "2026-06-01",
    goal: 300000,
    saved: 300000,
    contribution: 25000,
    members: [],
    membersCount: 12,
    frequency: "monthly",
    max_members: 12,
    start_date: "2025-06-01",
    payout_order: "rotational",
    imageUrl: "",
    owner_id: "1",
    status: "closed",
    created_at: "2025-06-01",
    nextPayout: "2026-06-01",
    joined: true,
    isPrivate: true,
    cycles: [],
    creation_fee: 0,
  },
  {
    id: "5",
    name: "Port Harcourt Hustlers",
    description:
      "Daily micro-savings for the bold and ambitious. Every naira counts!",
    nextDue: "2026-05-17",
    goal: 50000,
    saved: 12000,
    contribution: 1000,
    members: [],
    membersCount: 6,
    frequency: "daily",
    max_members: 30,
    start_date: "2026-05-01",
    payout_order: "rotational",
    imageUrl: "",
    owner_id: "5",
    status: "active",
    created_at: "2026-05-01",
    nextPayout: "2026-05-17",
    joined: false,
    isPrivate: false,
    cycles: [],
    creation_fee: 200,
  },
  {
    id: "6",
    name: "Nurses Cooperative",
    description:
      "Healthcare workers uniting to save for training, equipment, and emergencies.",
    nextDue: "2026-05-28",
    goal: 400000,
    saved: 88000,
    contribution: 20000,
    members: [],
    membersCount: 5,
    frequency: "monthly",
    max_members: 20,
    start_date: "2026-04-01",
    payout_order: "rotational",
    imageUrl: "",
    owner_id: "6",
    status: "paused",
    created_at: "2026-04-01",
    nextPayout: "2026-06-28",
    joined: false,
    isPrivate: false,
    cycles: [],
    creation_fee: 1000,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatNaira(amount: number) {
  if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `₦${(amount / 1_000).toFixed(0)}k`;
  return `₦${amount}`;
}

function frequencyLabel(f: IGroup["frequency"]) {
  return {
    daily: "Daily",
    weekly: "Weekly",
    "bi-weekly": "Bi-weekly",
    monthly: "Monthly",
  }[f];
}

function payoutLabel(p: IGroup["payout_order"]) {
  return { rotational: "Rotational", random: "Random", bidding: "Bidding" }[p];
}

const STATUS_BADGE: Record<
  IGroup["status"],
  { label: string; color: "green" | "amber" | "red" | "gray" }
> = {
  active: { label: "Active", color: "green" },
  paused: { label: "Paused", color: "amber" },
  closed: { label: "Closed", color: "gray" },
};

// ─── Initials avatar colors ───────────────────────────────────────────────────

const AVATAR_COLORS = [
  "bg-emerald-700",
  "bg-teal-700",
  "bg-cyan-700",
  "bg-green-700",
  "bg-lime-700",
];

function GroupInitialsAvatar({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  const colorIdx = name.charCodeAt(0) % AVATAR_COLORS.length;
  const sizeClass = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-base",
  }[size];
  return (
    <div
      className={`${AVATAR_COLORS[colorIdx]} ${sizeClass} rounded-xl flex items-center justify-center font-bold text-white shrink-0 select-none`}
    >
      {initials}
    </div>
  );
}

// ─── Group Card ───────────────────────────────────────────────────────────────

function GroupCard({ group }: { group: IGroup }) {
  const pct = Math.min(100, Math.round((group.saved / group.goal) * 100));
  const { label: statusLabel, color: statusColor } = STATUS_BADGE[group.status];
  const spotsLeft = group.max_members - group.membersCount;
  const full = spotsLeft === 0;

  return (
    <Card variant="interactive" className="flex flex-col h-full">
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <GroupInitialsAvatar name={group.name} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="truncate">{group.name}</CardTitle>
              {group.isPrivate ? (
                <Lock size={12} className="text-zinc-400 shrink-0" />
              ) : (
                <Globe size={12} className="text-zinc-400 shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <CardBadge color={statusColor} dot>
                {statusLabel}
              </CardBadge>
              {group.joined && <CardBadge color="green">Joined</CardBadge>}
            </div>
          </div>
        </div>
        <CardDescription className="mt-2 line-clamp-2">
          {group.description}
        </CardDescription>
      </CardHeader>

      {/* Progress */}
      <CardContent className="flex-1 space-y-4">
        <div className="flex justify-between text-[12px] text-zinc-500 font-medium">
          <span>{formatNaira(group.saved)} saved</span>
          <span className="text-zinc-400">Goal: {formatNaira(group.goal)}</span>
        </div>
        <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${pct >= 100 ? "bg-emerald-400" : "bg-emerald-700"}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="rounded-xl bg-zinc-50 px-3 py-2">
            <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold mb-0.5">
              Contribution
            </p>
            <p className="text-[13px] font-semibold text-zinc-900">
              {formatNaira(Number(group.contribution))}
            </p>
            <p className="text-[10px] text-zinc-400">
              {frequencyLabel(group.frequency)}
            </p>
          </div>
          <div className="rounded-xl bg-zinc-50 px-3 py-2">
            <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold mb-0.5">
              Members
            </p>
            <p className="text-[13px] font-semibold text-zinc-900">
              {group.membersCount} / {group.max_members}
            </p>
            <p
              className={`text-[10px] ${full ? "text-amber-600" : "text-zinc-400"}`}
            >
              {full
                ? "Full"
                : `${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""} left`}
            </p>
          </div>
          <div className="rounded-xl bg-zinc-50 px-3 py-2">
            <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold mb-0.5">
              Next Payout
            </p>
            <p className="text-[13px] font-semibold text-zinc-900 truncate">
              {new Date(group.nextPayout).toLocaleDateString("en-NG", {
                day: "numeric",
                month: "short",
              })}
            </p>
            <p className="text-[10px] text-zinc-400">
              {payoutLabel(group.payout_order)}
            </p>
          </div>
          <div className="rounded-xl bg-zinc-50 px-3 py-2">
            <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold mb-0.5">
              Next Due
            </p>
            <p className="text-[13px] font-semibold text-zinc-900 truncate">
              {new Date(group.nextDue).toLocaleDateString("en-NG", {
                day: "numeric",
                month: "short",
              })}
            </p>
            <p className="text-[10px] text-zinc-400">Contribution due</p>
          </div>
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="pt-2">
        {group.joined ? (
          <Button
            variant="secondary"
            size="sm"
            className="flex-1 rounded-xl gap-1.5"
          >
            View Circle <ChevronRight size={14} />
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            className="flex-1 rounded-xl gap-1.5"
            disabled={full || group.status !== "active"}
          >
            {full
              ? "Circle Full"
              : group.status !== "active"
                ? "Unavailable"
                : "Join Circle"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

// ─── Filter tabs ──────────────────────────────────────────────────────────────

type FilterTab = "all" | "joined" | "available";

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All Circles" },
  { key: "joined", label: "My Circles" },
  { key: "available", label: "Available" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GroupsPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [statusFilter, setStatusFilter] = useState<IGroup["status"] | "all">(
    "all",
  );

  const filtered = MOCK_GROUPS.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.description.toLowerCase().includes(search.toLowerCase());

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "joined" && g.joined) ||
      (activeTab === "available" && !g.joined && g.status === "active");

    const matchesStatus = statusFilter === "all" || g.status === statusFilter;

    return matchesSearch && matchesTab && matchesStatus;
  });

  const myCount = MOCK_GROUPS.filter((g) => g.joined).length;
  const totalSaved = MOCK_GROUPS.filter((g) => g.joined).reduce(
    (sum, g) => sum + g.saved,
    0,
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Savings Circles</h1>
          <p className="text-zinc-500 mt-1 text-sm">
            You're in {myCount} circle{myCount !== 1 ? "s" : ""} ·{" "}
            {formatNaira(totalSaved)} saved total
          </p>
        </div>
        <Button variant="primary" className="gap-2 rounded-xl" size="md">
          <Plus size={16} />
          Create Circle
        </Button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Active Circles",
            value: MOCK_GROUPS.filter((g) => g.status === "active").length,
            icon: TrendingUp,
          },
          { label: "My Circles", value: myCount, icon: Users },
          {
            label: "Total Saved",
            value: formatNaira(totalSaved),
            icon: TrendingUp,
          },
          { label: "Next Due", value: "May 17", icon: CalendarClock },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="px-4 py-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <Icon size={16} className="text-emerald-700" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-zinc-400 font-medium uppercase tracking-wide truncate">
                {label}
              </p>
              <p className="text-[15px] font-bold text-zinc-900">{value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search circles…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl border-[1.5px] border-zinc-200 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-emerald-700 focus:shadow-[0_0_0_3px_rgba(26,107,82,.10)] transition-all"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1 bg-zinc-100 rounded-xl p-1">
          {(["all", "active", "paused", "closed"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium capitalize transition-all ${
                statusFilter === s
                  ? "bg-white shadow-sm text-zinc-900"
                  : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              {s === "all" ? "All Status" : s}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-zinc-200">
        {FILTER_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-all -mb-px ${
              activeTab === key
                ? "border-emerald-700 text-emerald-800"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            {label}
            {key === "joined" && (
              <span className="ml-1.5 inline-flex items-center justify-center h-4 px-1.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                {myCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <div className="h-14 w-14 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
            <Users size={24} className="text-zinc-400" />
          </div>
          <p className="text-zinc-600 font-medium">No circles found</p>
          <p className="text-zinc-400 text-sm mt-1">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}
