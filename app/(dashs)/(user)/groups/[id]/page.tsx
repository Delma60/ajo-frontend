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
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Users,
  Lock,
  Globe,
  ShieldCheck,
  TrendingUp,
  Clock,
  CalendarClock,
  CheckCircle2,
  AlertCircle,
  Crown,
  ChevronRight,
  Copy,
  Bell,
  LogOut,
  Settings,
  ArrowDownLeft,
  CircleDollarSign,
  PauseCircle,
  Info,
  Repeat2,
  Shuffle,
  Gavel,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { Frequency, IGroup } from "@/lib/types/group.types";

// ─── Shared Types ─────────────────────────────────────────────────────────────



interface ITransaction {
  id: string;
  type: "contribution" | "payout" | "penalty";
  amount: number;
  date: string;
  status: "success" | "pending" | "failed";
  description: string;
}


// ─── All groups (merged My Circles + Discover) ────────────────────────────────

const ALL_GROUPS: Record<string, IGroup> = {
  // ── JOINED (member) ────────────────────────────────────────────────────────
  "1": {
    id: "1",
    name: "Lagos Tech Circle",
    description: "Monthly savings for tech professionals in Lagos.",
    longDescription:
      "A curated group of tech professionals across Lagos saving together monthly. Members span engineering, product, and design roles at both startups and big tech. Trust and accountability are at the core of this circle.",
    rules: [
      "Contributions must be made before the 5th of every month.",
      "Missed payments attract a 10% penalty on the contribution amount.",
      "Payout recipients must confirm receipt within 48 hours.",
      "Members must give 2 weeks' notice before exiting.",
    ],
    contribution: 50000,
    frequency: "monthly",
    payout_order: "rotational",
    status: "active",
    isPrivate: false,
    membersCount: 8,
    max_members: 10,
    nextDue: "2026-06-05",
    nextPayout: "2026-06-01",
    cycleStartDate: "2026-01-01",
    currentCycle: 5,
    totalCycles: 10,
    totalPaidOut: 2000000,
    trustScore: 98,
    adminName: "Emeka Obi",
    adminInitials: "EO",
    spotsLeft: 2,
    inviteCode: "LTC-2026-X7",
    myMemberId: "m3",
    members: [
      { id: "m1", name: "Emeka Obi", initials: "EO", role: "admin", status: "active", turnPosition: 1, hasPaidThisCycle: true, totalContributed: 250000, hasReceived: true },
      { id: "m2", name: "Adaeze Nwosu", initials: "AN", role: "member", status: "active", turnPosition: 2, hasPaidThisCycle: true, totalContributed: 250000, hasReceived: true },
      { id: "m3", name: "You", initials: "ME", role: "member", status: "active", turnPosition: 3, hasPaidThisCycle: true, totalContributed: 200000, hasReceived: false },
      { id: "m4", name: "Chidi Eze", initials: "CE", role: "member", status: "active", turnPosition: 4, hasPaidThisCycle: false, totalContributed: 150000, hasReceived: false },
      { id: "m5", name: "Fatima Bello", initials: "FB", role: "member", status: "active", turnPosition: 5, hasPaidThisCycle: true, totalContributed: 200000, hasReceived: false },
      { id: "m6", name: "Tunde Bakare", initials: "TB", role: "member", status: "defaulted", turnPosition: 6, hasPaidThisCycle: false, totalContributed: 100000, hasReceived: false },
      { id: "m7", name: "Ngozi Adeyemi", initials: "NA", role: "member", status: "active", turnPosition: 7, hasPaidThisCycle: true, totalContributed: 200000, hasReceived: false },
      { id: "m8", name: "Seun Falola", initials: "SF", role: "member", status: "active", turnPosition: 8, hasPaidThisCycle: true, totalContributed: 200000, hasReceived: false },
    ],
  },
  "2": {
    id: "2",
    name: "Abuja Women Save",
    description: "Empowering women through collective savings. Weekly contributions for big dreams.",
    longDescription:
      "A women-led savings circle based in Abuja. Members contribute weekly and payouts are determined by random draw at the start of each cycle. The admin verifies all members and ensures complete transparency.",
    rules: [
      "Open to women only.",
      "Contributions are due every Friday before 6pm.",
      "Payout draw is held every new cycle at a virtual meeting.",
      "Members may invite other women via the invite code only.",
    ],
    contribution: 10000,
    frequency: "weekly",
    payout_order: "random",
    status: "active",
    isPrivate: true,
    membersCount: 14,
    max_members: 20,
    nextDue: "2026-05-23",
    nextPayout: "2026-05-18",
    cycleStartDate: "2026-04-01",
    currentCycle: 7,
    totalCycles: 20,
    totalPaidOut: 700000,
    trustScore: 87,
    adminName: "Mama Chidinma",
    adminInitials: "MC",
    spotsLeft: 6,
    inviteCode: "AWS-FCT-99",
    myMemberId: "m1",
    members: [
      { id: "m1", name: "You (Admin)", initials: "ME", role: "admin", status: "active", turnPosition: 1, hasPaidThisCycle: true, totalContributed: 70000, hasReceived: false },
      { id: "m2", name: "Amaka Okonkwo", initials: "AO", role: "member", status: "active", turnPosition: 2, hasPaidThisCycle: true, totalContributed: 70000, hasReceived: true },
      { id: "m3", name: "Zainab Musa", initials: "ZM", role: "member", status: "active", turnPosition: 3, hasPaidThisCycle: false, totalContributed: 60000, hasReceived: false },
      { id: "m4", name: "Grace Eze", initials: "GE", role: "member", status: "active", turnPosition: 4, hasPaidThisCycle: true, totalContributed: 70000, hasReceived: true },
      { id: "m5", name: "Halima Ibrahim", initials: "HI", role: "member", status: "pending", turnPosition: 5, hasPaidThisCycle: false, totalContributed: 50000, hasReceived: false },
    ],
  },

  // ── DISCOVER (non-member) ──────────────────────────────────────────────────
  "d1": {
    id: "d1",
    name: "Lagos Tech Professionals",
    description: "A tight-knit savings circle for tech workers in Lagos.",
    longDescription:
      "Members include engineers, designers, and PMs from top companies across Lagos. Monthly contributions with rotational payouts, verified identities, and zero tolerance for defaults. One of the highest-rated circles on the platform.",
    rules: [
      "Proof of tech employment required on signup.",
      "Contributions due on the 1st of every month.",
      "Two consecutive missed payments result in automatic removal.",
      "New members must be vouched for by an existing member.",
    ],
    contribution: 50000,
    frequency: "monthly",
    payout_order: "rotational",
    status: "active",
    isPrivate: false,
    membersCount: 7,
    max_members: 10,
    nextDue: "2026-06-01",
    nextPayout: "2026-06-01",
    cycleStartDate: "2026-01-01",
    currentCycle: 5,
    totalCycles: 10,
    totalPaidOut: 3500000,
    trustScore: 98,
    adminName: "Emeka Obi",
    adminInitials: "EO",
    spotsLeft: 3,
    myMemberId: null,
    members: [
      { id: "m1", name: "Emeka Obi", initials: "EO", role: "admin", status: "active", turnPosition: 1, hasPaidThisCycle: true, totalContributed: 250000, hasReceived: true },
      { id: "m2", name: "Adaeze N.", initials: "AN", role: "member", status: "active", turnPosition: 2, hasPaidThisCycle: true, totalContributed: 250000, hasReceived: true },
      { id: "m3", name: "Chidi E.", initials: "CE", role: "member", status: "active", turnPosition: 3, hasPaidThisCycle: true, totalContributed: 200000, hasReceived: false },
      { id: "m4", name: "Fatima B.", initials: "FB", role: "member", status: "active", turnPosition: 4, hasPaidThisCycle: true, totalContributed: 200000, hasReceived: false },
      { id: "m5", name: "Tunde B.", initials: "TB", role: "member", status: "active", turnPosition: 5, hasPaidThisCycle: true, totalContributed: 200000, hasReceived: false },
      { id: "m6", name: "Ngozi A.", initials: "NA", role: "member", status: "active", turnPosition: 6, hasPaidThisCycle: false, totalContributed: 150000, hasReceived: false },
      { id: "m7", name: "Seun F.", initials: "SF", role: "member", status: "active", turnPosition: 7, hasPaidThisCycle: true, totalContributed: 200000, hasReceived: false },
    ],
  },
  "d8": {
    id: "d8",
    name: "Real Estate Investors Circle",
    description: "Serious investors pooling capital for property down-payments.",
    longDescription:
      "High-contribution circle for serious property investors. Payouts are allocated via bidding — members bid for early payout slots by offering a premium to the pool. Background verification is mandatory. All members are confirmed property investors.",
    rules: [
      "Background check and identity verification mandatory.",
      "Minimum 6-month commitment; exits attract a 15% penalty.",
      "Bidding opens on the 25th of each month.",
      "Winning bidder must confirm property purpose within 30 days.",
    ],
    contribution: 500000,
    frequency: "monthly",
    payout_order: "bidding",
    status: "active",
    isPrivate: false,
    membersCount: 4,
    max_members: 6,
    nextDue: "2026-06-01",
    nextPayout: "2026-06-01",
    cycleStartDate: "2026-02-01",
    currentCycle: 4,
    totalCycles: 6,
    totalPaidOut: 24000000,
    trustScore: 100,
    adminName: "Mr. Rotimi Adeyemo",
    adminInitials: "RA",
    spotsLeft: 2,
    myMemberId: null,
    members: [
      { id: "m1", name: "Rotimi A.", initials: "RA", role: "admin", status: "active", turnPosition: 1, hasPaidThisCycle: true, totalContributed: 2000000, hasReceived: true },
      { id: "m2", name: "Kunle O.", initials: "KO", role: "member", status: "active", turnPosition: 2, hasPaidThisCycle: true, totalContributed: 2000000, hasReceived: true },
      { id: "m3", name: "Yetunde A.", initials: "YA", role: "member", status: "active", turnPosition: 3, hasPaidThisCycle: true, totalContributed: 2000000, hasReceived: false },
      { id: "m4", name: "Babatunde F.", initials: "BF", role: "member", status: "active", turnPosition: 4, hasPaidThisCycle: false, totalContributed: 1500000, hasReceived: false },
    ],
  },
};

// Sample transactions for member view
const SAMPLE_TRANSACTIONS: ITransaction[] = [
  { id: "t1", type: "contribution", amount: 50000, date: "2026-05-01", status: "success", description: "Cycle 5 contribution" },
  { id: "t2", type: "contribution", amount: 50000, date: "2026-04-01", status: "success", description: "Cycle 4 contribution" },
  { id: "t3", type: "contribution", amount: 50000, date: "2026-03-01", status: "success", description: "Cycle 3 contribution" },
  { id: "t4", type: "contribution", amount: 50000, date: "2026-02-01", status: "success", description: "Cycle 2 contribution" },
  { id: "t5", type: "contribution", amount: 50000, date: "2026-01-01", status: "success", description: "Cycle 1 contribution" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatNaira(n: number) {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}k`;
  return `₦${n.toLocaleString()}`;
}
function freqLabel(f: Frequency) {
  return { daily: "Daily", weekly: "Weekly", "bi-weekly": "Bi-weekly", monthly: "Monthly" }[f];
}
function payoutLabel(p: PayoutOrder) {
  return { rotational: "Rotational", random: "Random draw", bidding: "Bid-based" }[p];
}
function payoutIcon(p: PayoutOrder) {
  if (p === "rotational") return <Repeat2 size={14} />;
  if (p === "random") return <Shuffle size={14} />;
  return <Gavel size={14} />;
}
function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  const d = Math.ceil(diff / 86400000);
  if (d < 0) return "Overdue";
  if (d === 0) return "Today";
  if (d === 1) return "Tomorrow";
  return `${d} days`;
}
function trustColor(score: number) {
  if (score >= 95) return { bg: "bg-emerald-50", text: "text-emerald-700", bar: "bg-emerald-500" };
  if (score >= 85) return { bg: "bg-blue-50", text: "text-blue-700", bar: "bg-blue-500" };
  return { bg: "bg-amber-50", text: "text-amber-700", bar: "bg-amber-500" };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function GroupHero({ group, isMember }: { group: IGroup; isMember: boolean }) {
  const statusIcon = {
    active: <CheckCircle2 size={14} className="text-emerald-600" />,
    paused: <PauseCircle size={14} className="text-amber-500" />,
    closed: <CheckCircle2 size={14} className="text-zinc-400" />,
  }[group.status];

  const backHref = isMember ? "/groups" : "/groups/discover";
  const backLabel = isMember ? "My Circles" : "Discover";

  return (
    <div
      className="relative rounded-2xl overflow-hidden px-6 py-8"
      style={{ background: "linear-gradient(135deg, #064e3b 0%, #065f46 55%, #047857 100%)" }}
    >
      {/* Blobs */}
      <div className="pointer-events-none absolute -top-12 -right-12 w-56 h-56 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #6ee7b7 0%, transparent 70%)" }} />
      <div className="pointer-events-none absolute bottom-0 left-1/3 w-36 h-36 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #a7f3d0 0%, transparent 70%)" }} />

      <div className="relative z-10 space-y-5">
        {/* Back */}
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-[12px] text-emerald-300/70 hover:text-emerald-200 transition-colors"
        >
          <ArrowLeft size={12} />
          {backLabel}
        </Link>

        {/* Name + badges */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              {statusIcon}
              <span className="text-[11px] font-semibold uppercase tracking-widest text-emerald-300/70 capitalize">
                {group.status}
              </span>
              {group.isPrivate
                ? <Lock size={11} className="text-emerald-300/50" />
                : <Globe size={11} className="text-emerald-300/50" />
              }
              {isMember && (
                <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-900 bg-emerald-300 rounded-full px-2 py-0.5">
                  Member
                </span>
              )}
            </div>
            <h1
              className="text-2xl sm:text-3xl font-bold text-white leading-tight"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {group.name}
            </h1>
            <p className="text-emerald-100/70 text-[13px] max-w-lg leading-relaxed">
              {group.description}
            </p>
          </div>

          {/* Admin */}
          <div className="flex items-center gap-2 bg-white/10 rounded-2xl px-4 py-2.5 shrink-0">
            <div className="w-8 h-8 rounded-full bg-emerald-700/60 ring-2 ring-white/20 flex items-center justify-center text-[11px] font-bold text-emerald-200">
              {group.adminInitials}
            </div>
            <div>
              <p className="text-[10px] text-emerald-300/60 font-medium uppercase tracking-wide">Admin</p>
              <p className="text-[13px] font-semibold text-white">{group.adminName}</p>
            </div>
          </div>
        </div>

        {/* Stat pills */}
        <div className="flex gap-3 flex-wrap">
          {[
            { icon: <Users size={12} />, label: `${group.membersCount}/${group.max_members} members` },
            { icon: <CircleDollarSign size={12} />, label: `${formatNaira(Number(group.contribution))}/${freqLabel(group.frequency).toLowerCase()}` },
            { icon: <TrendingUp size={12} />, label: `${formatNaira(group.totalPaidOut)} paid out` },
            { icon: <ShieldCheck size={12} />, label: `${group.trustScore}% trust` },
          ].map(({ icon, label }) => (
            <span key={label} className="inline-flex items-center gap-1.5 text-[12px] text-emerald-100/70 bg-white/10 rounded-full px-3 py-1.5">
              {icon} {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Member-only: My Status Panel
function MyStatusPanel({ group }: { group: IGroup }) {
  const me = group.members.find((m) => m.id === group.myMemberId)!;
  const dueIn = daysUntil(group.nextDue);
  const isDueSoon = !me.hasPaidThisCycle && (dueIn === "Today" || dueIn === "Tomorrow" || dueIn === "Overdue");
  const cyclePct = Math.round((group.currentCycle / group.totalCycles) * 100);

  return (
    <Card variant="default" className="overflow-hidden">
      <div
        className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between"
        style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)" }}
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-700/60 mb-0.5">My Position</p>
          <p className="text-[22px] font-bold text-emerald-900" style={{ fontFamily: "Georgia, serif" }}>
            Turn #{me.turnPosition}
            <span className="text-[13px] font-normal text-emerald-700/60 ml-1.5">of {group.max_members}</span>
          </p>
        </div>
        <div className="text-right">
          <p className={`text-[11px] font-bold uppercase tracking-wide mb-1 ${
            me.hasPaidThisCycle ? "text-emerald-700" : isDueSoon ? "text-red-600" : "text-amber-700"
          }`}>
            {me.hasPaidThisCycle ? "✓ Paid this cycle" : isDueSoon ? "⚠ Payment due" : "Unpaid"}
          </p>
          {!me.hasPaidThisCycle && (
            <p className={`text-[12px] font-semibold ${isDueSoon ? "text-red-600" : "text-amber-700"}`}>
              Due {dueIn}
            </p>
          )}
          {me.hasPaidThisCycle && (
            <p className="text-[12px] text-emerald-600">Next due {daysUntil(group.nextDue)}</p>
          )}
        </div>
      </div>

      <CardContent className="pt-4 space-y-4">
        {/* Cycle progress */}
        <div>
          <div className="flex items-center justify-between text-[12px] mb-2">
            <span className="text-zinc-500">Cycle progress</span>
            <span className="font-semibold text-zinc-900">
              Cycle {group.currentCycle} of {group.totalCycles}
            </span>
          </div>
          <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all duration-700"
              style={{ width: `${cyclePct}%` }}
            />
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">{cyclePct}% through the cycle</p>
        </div>

        {/* My numbers */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Contributed", value: formatNaira(me.totalContributed) },
            { label: "Payout", value: me.hasReceived ? "Received ✓" : `Turn ${me.turnPosition}` },
            { label: "Role", value: me.role === "admin" ? "Admin" : "Member" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-zinc-50 rounded-xl px-3 py-2.5 text-center">
              <p className="text-[10px] text-zinc-400 uppercase tracking-wide font-medium">{label}</p>
              <p className="text-[13px] font-bold text-zinc-900 mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        {!me.hasPaidThisCycle && (
          <Button variant="primary" size="md" className="w-full rounded-xl gap-2">
            <ArrowDownLeft size={16} />
            Pay {formatNaira(group.contribution)} Now
          </Button>
        )}
        {me.hasPaidThisCycle && (
          <div className="flex items-center gap-2 text-[12px] text-emerald-700 bg-emerald-50 rounded-xl px-4 py-3">
            <CheckCircle2 size={14} className="shrink-0" />
            You&apos;ve paid this cycle. Next payment due {daysUntil(group.nextDue)}.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Discover-only: Join Panel
function JoinPanel({ group }: { group: IGroup }) {
  const [requested, setRequested] = useState(false);
  const fillPct = Math.round((group.membersCount / group.max_members) * 100);
  const almostFull = group.spotsLeft <= 2;

  return (
    <Card variant="default" className="overflow-hidden sticky top-6">
      <div className="px-5 pt-5 pb-4 border-b border-zinc-100">
        <p className="text-[11px] uppercase tracking-widest font-semibold text-zinc-400 mb-1">Contribution</p>
        <p className="text-3xl font-bold text-zinc-900" style={{ fontFamily: "Georgia, serif" }}>
          {formatNaira(group.contribution)}
          <span className="text-[14px] font-normal text-zinc-400 ml-1.5">/{freqLabel(group.frequency).toLowerCase()}</span>
        </p>
      </div>

      <CardContent className="space-y-4 pt-4">
        {/* Fill bar */}
        <div>
          <div className="flex justify-between text-[12px] mb-1.5">
            <span className="text-zinc-500 flex items-center gap-1"><Users size={11} /> {group.membersCount}/{group.max_members} members</span>
            {almostFull
              ? <span className="font-bold text-amber-600">{group.spotsLeft} spot{group.spotsLeft !== 1 ? "s" : ""} left!</span>
              : <span className="text-zinc-400">{group.spotsLeft} open</span>}
          </div>
          <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${fillPct >= 90 ? "bg-amber-500" : "bg-emerald-600"}`}
              style={{ width: `${fillPct}%` }}
            />
          </div>
        </div>

        {/* Key facts */}
        {[
          { icon: payoutIcon(group.payout_order), label: "Payout method", value: payoutLabel(group.payout_order) },
          { icon: <CalendarClock size={14} />, label: "Frequency", value: freqLabel(group.frequency) },
          { icon: <TrendingUp size={14} />, label: "Total paid out", value: formatNaira(group.totalPaidOut) },
          { icon: <ShieldCheck size={14} />, label: "Trust score", value: `${group.trustScore}%` },
        ].map(({ icon, label, value }) => (
          <div key={label} className="flex items-center justify-between text-[13px]">
            <span className="flex items-center gap-2 text-zinc-500">
              <span className="text-zinc-400">{icon}</span>
              {label}
            </span>
            <span className="font-semibold text-zinc-900">{value}</span>
          </div>
        ))}

        <CardDivider className="mx-0" />

        {/* CTA */}
        {requested ? (
          <div className="text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
              <CheckCircle2 size={20} className="text-emerald-600" />
            </div>
            <p className="text-[14px] font-semibold text-zinc-900">Request Sent!</p>
            <p className="text-[12px] text-zinc-500">The admin will review your request. You&apos;ll be notified once approved.</p>
          </div>
        ) : (
          <>
            <Button
              variant="primary"
              size="lg"
              className="w-full rounded-xl"
              onClick={() => setRequested(true)}
            >
              Request to Join
            </Button>
            <button className="w-full text-center text-[12px] text-zinc-400 hover:text-zinc-700 transition-colors flex items-center justify-center gap-1.5">
              <Share2 size={12} /> Share this circle
            </button>
          </>
        )}

        <p className="text-[11px] text-zinc-400 text-center leading-relaxed">
          Your request will be reviewed by the admin. No payment until approved.
        </p>
      </CardContent>
    </Card>
  );
}

// Members list
function MembersList({ group, isMember }: { group: IGroup; isMember: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const visibleMembers = expanded ? group.members : group.members.slice(0, 5);

  const statusColor: Record<MemberStatus, string> = {
    active: "bg-emerald-500",
    defaulted: "bg-red-500",
    pending: "bg-amber-400",
  };

  return (
    <Card variant="default">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Members</CardTitle>
          <span className="text-[12px] text-zinc-400 bg-zinc-100 rounded-full px-2.5 py-1">
            {group.membersCount} / {group.max_members}
          </span>
        </div>
        <CardDescription>
          {group.payout_order === "rotational" ? "Payout order is fixed — position shown." : "Positions listed; payout order is dynamic."}
        </CardDescription>
      </CardHeader>
      <CardDivider />
      <CardContent className="px-0 pt-0">
        <ul>
          {visibleMembers.map((member, idx) => (
            <li
              key={member.id}
              className={`flex items-center gap-3 px-5 py-3 transition-colors ${
                member.id === group.myMemberId ? "bg-emerald-50/60" : "hover:bg-zinc-50"
              } ${idx < visibleMembers.length - 1 ? "border-b border-zinc-50" : ""}`}
            >
              {/* Position */}
              <span className="text-[11px] font-bold text-zinc-300 w-5 text-center shrink-0">
                {member.turnPosition}
              </span>

              {/* Avatar */}
              <div className="relative shrink-0">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold text-white ${
                    member.id === group.myMemberId
                      ? "bg-emerald-700 ring-2 ring-emerald-400"
                      : "bg-zinc-400"
                  }`}
                  style={member.id !== group.myMemberId ? { background: `hsl(${(member.turnPosition * 37) % 360}, 45%, 50%)` } : undefined}
                >
                  {member.initials}
                </div>
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white ${statusColor[member.status]}`}
                />
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-[13px] font-semibold truncate ${
                    member.id === group.myMemberId ? "text-emerald-900" : "text-zinc-800"
                  }`}>
                    {member.name}
                    {member.id === group.myMemberId && (
                      <span className="ml-1 text-[10px] font-bold text-emerald-600"> (you)</span>
                    )}
                  </p>
                  {member.role === "admin" && (
                    <Crown size={11} className="text-amber-500 shrink-0" />
                  )}
                </div>
                {isMember && (
                  <p className="text-[11px] text-zinc-400">
                    {formatNaira(member.totalContributed)} contributed
                  </p>
                )}
              </div>

              {/* Right side */}
              <div className="text-right shrink-0">
                {member.hasReceived ? (
                  <CardBadge color="gray">Paid out</CardBadge>
                ) : isMember ? (
                  member.hasPaidThisCycle
                    ? <CardBadge color="green" dot>Paid ✓</CardBadge>
                    : <CardBadge color={member.status === "defaulted" ? "red" : "amber"} dot>Unpaid</CardBadge>
                ) : null}
              </div>
            </li>
          ))}
        </ul>

        {group.members.length > 5 && (
          <div className="px-5 pt-3">
            <button
              onClick={() => setExpanded((p) => !p)}
              className="w-full text-[12px] text-zinc-400 hover:text-zinc-700 transition-colors flex items-center justify-center gap-1"
            >
              {expanded ? "Show fewer" : `Show all ${group.members.length} members`}
              <ChevronRight size={12} className={`transition-transform ${expanded ? "rotate-90" : ""}`} />
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Transaction history (member only)
function TransactionHistory() {
  const txIcon: Record<ITransaction["type"], React.JSX.Element> = {
    contribution: <ArrowDownLeft size={14} className="text-emerald-600" />,
    payout: <TrendingUp size={14} className="text-blue-600" />,
    penalty: <AlertCircle size={14} className="text-red-500" />,
  };

  return (
    <Card variant="default">
      <CardHeader>
        <CardTitle>My Transactions</CardTitle>
        <CardDescription>Your contribution and payout history in this circle.</CardDescription>
      </CardHeader>
      <CardDivider />
      <CardContent className="px-0 pt-0">
        {SAMPLE_TRANSACTIONS.map((tx, i) => (
          <div
            key={tx.id}
            className={`flex items-center gap-3 px-5 py-3 hover:bg-zinc-50 transition-colors ${
              i < SAMPLE_TRANSACTIONS.length - 1 ? "border-b border-zinc-50" : ""
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              tx.type === "contribution" ? "bg-emerald-50" : tx.type === "payout" ? "bg-blue-50" : "bg-red-50"
            }`}>
              {txIcon[tx.type]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-zinc-800 truncate">{tx.description}</p>
              <p className="text-[11px] text-zinc-400">
                {new Date(tx.date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className={`text-[13px] font-bold ${tx.type === "payout" ? "text-blue-700" : "text-zinc-900"}`}>
                {tx.type === "payout" ? "+" : "-"}{formatNaira(tx.amount)}
              </p>
              <CardBadge
                color={tx.status === "success" ? "green" : tx.status === "pending" ? "amber" : "red"}
                dot
              >
                {tx.status}
              </CardBadge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Rules & details panel
function GroupInfo({ group }: { group: IGroup }) {
  const tc = trustColor(group.trustScore);

  return (
    <div className="space-y-4">
      {/* About */}
      <Card variant="flat">
        <CardHeader>
          <CardTitle>About this circle</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[13px] text-zinc-600 leading-relaxed">{group.longDescription}</p>
        </CardContent>
      </Card>

      {/* Rules */}
      <Card variant="flat">
        <CardHeader>
          <CardTitle>Circle rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {group.rules.map((rule, i) => (
            <div key={i} className="flex items-start gap-3 text-[13px]">
              <span className="mt-0.5 w-5 h-5 rounded-full bg-zinc-200 text-zinc-600 text-[10px] font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <p className="text-zinc-600 leading-relaxed">{rule}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Trust */}
      <Card variant="flat">
        <CardHeader>
          <CardTitle>Trust & verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-[13px] mb-1">
            <span className="text-zinc-500">Trust score</span>
            <span className={`font-bold text-[15px] ${tc.text}`}>{group.trustScore}%</span>
          </div>
          <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
            <div className={`h-full rounded-full transition-all ${tc.bar}`} style={{ width: `${group.trustScore}%` }} />
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            {[
              { label: "Identity verified", ok: true },
              { label: "Zero defaults", ok: group.trustScore >= 90 },
              { label: "Active admin", ok: true },
              { label: "Platform insured", ok: group.trustScore >= 95 },
            ].map(({ label, ok }) => (
              <div key={label} className="flex items-center gap-2 text-[12px]">
                <span className={ok ? "text-emerald-500" : "text-zinc-300"}>
                  {ok ? <CheckCircle2 size={13} /> : <Info size={13} />}
                </span>
                <span className={ok ? "text-zinc-700" : "text-zinc-400"}>{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Member-only: Admin actions panel
function AdminPanel({ group }: { group: IGroup }) {
  const me = group.members.find((m) => m.id === group.myMemberId);
  if (me?.role !== "admin") return null;

  return (
    <Card variant="tinted" className="border-amber-200 bg-amber-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Crown size={15} className="text-amber-600" />
          <CardTitle className="text-amber-800">Admin controls</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        {[
          { icon: <Bell size={14} />, label: "Send reminder" },
          { icon: <Settings size={14} />, label: "Edit circle" },
          { icon: <Users size={14} />, label: "Manage members" },
          { icon: <Copy size={14} />, label: "Copy invite code" },
        ].map(({ icon, label }) => (
          <button
            key={label}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-amber-200 text-[12px] font-medium text-amber-800 hover:bg-amber-100 transition-colors"
          >
            <span className="text-amber-600">{icon}</span>
            {label}
          </button>
        ))}
      </CardContent>
    </Card>
  );
}

// Member-only: Invite code
function InviteCodeCard({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <Card variant="default">
      <CardHeader>
        <CardTitle>Invite someone</CardTitle>
        <CardDescription>Share this code to invite trusted members.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 bg-zinc-50 rounded-xl border border-zinc-200 px-4 py-3">
          <code className="flex-1 font-mono font-bold text-emerald-700 text-[15px] tracking-widest">
            {code}
          </code>
          <button
            onClick={copy}
            className="text-[12px] font-semibold text-zinc-500 hover:text-zinc-900 transition-colors flex items-center gap-1"
          >
            {copied ? <CheckCircle2 size={13} className="text-emerald-600" /> : <Copy size={13} />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

// Member-only: Danger zone
function DangerZone() {
  return (
    <Card variant="default" className="border-red-100">
      <CardContent className="py-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-[13px] font-semibold text-zinc-800">Leave this circle</p>
          <p className="text-[12px] text-zinc-400 mt-0.5">You may be subject to an exit penalty.</p>
        </div>
        <Button variant="danger" size="sm" className="rounded-xl shrink-0 gap-1.5">
          <LogOut size={13} />
          Leave
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  params: { id: string };
}

export default function GroupDetailPage({ params }: PageProps) {
  // Fallback to a default group if id not found
  const group = ALL_GROUPS[params.id] ?? ALL_GROUPS["1"];
  const isMember = group.myMemberId !== null;
  const isAdmin = isMember && group.members.find((m) => m.id === group.myMemberId)?.role === "admin";

  return (
    <div className="min-h-full bg-zinc-50/40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Hero */}
        <GroupHero group={group} isMember={isMember} />

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* Left column — main content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Member: status + pay */}
            {isMember && <MyStatusPanel group={group} />}

            {/* Admin panel */}
            {isAdmin && <AdminPanel group={group} />}

            {/* Members list */}
            <MembersList group={group} isMember={isMember} />

            {/* Member: transaction history */}
            {isMember && <TransactionHistory />}

            {/* Group info / rules */}
            <GroupInfo group={group} />

            {/* Member: invite + danger zone */}
            {isMember && group.inviteCode && <InviteCodeCard code={group.inviteCode} />}
            {isMember && <DangerZone />}
          </div>

          {/* Right column — sidebar */}
          <div className="space-y-4">
            {/* Discover: sticky join card */}
            {!isMember && <JoinPanel group={group} />}

            {/* Member: next events */}
            {isMember && (
              <Card variant="flat">
                <CardHeader>
                  <CardTitle>Upcoming</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { icon: <Clock size={14} />, label: "Next payment due", value: new Date(group.nextDue).toLocaleDateString("en-NG", { day: "numeric", month: "short" }), sub: daysUntil(group.nextDue) },
                    { icon: <CalendarClock size={14} />, label: "Next payout", value: new Date(group.nextPayout).toLocaleDateString("en-NG", { day: "numeric", month: "short" }), sub: daysUntil(group.nextPayout) },
                    { icon: <Repeat2 size={14} />, label: "Payout method", value: payoutLabel(group.payout_order), sub: null },
                  ].map(({ icon, label, value, sub }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-500 shrink-0">
                        {icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-zinc-400 font-medium">{label}</p>
                        <p className="text-[13px] font-semibold text-zinc-900">{value}</p>
                        {sub && <p className="text-[11px] text-emerald-700 font-medium">{sub}</p>}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Stats sidebar for non-members */}
            {!isMember && (
              <Card variant="flat">
                <CardHeader>
                  <CardTitle>Circle stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: "Cycle", value: `${group.currentCycle} of ${group.totalCycles}` },
                    { label: "Started", value: new Date(group.cycleStartDate).toLocaleDateString("en-NG", { month: "short", year: "numeric" }) },
                    { label: "Members paid out", value: `${group.members.filter((m) => m.hasReceived).length}` },
                    { label: "Total disbursed", value: formatNaira(group.totalPaidOut) },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between text-[13px]">
                      <span className="text-zinc-500">{label}</span>
                      <span className="font-semibold text-zinc-900">{value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}