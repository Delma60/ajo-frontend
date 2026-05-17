"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowDownLeft,
  AlertCircle,
  Bell,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock,
  Copy,
  Crown,
  Gavel,
  Globe,
  Info,
  Lock,
  LogOut,
  PauseCircle,
  Repeat2,
  Settings,
  Share2,
  ShieldCheck,
  Shuffle,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardDivider,
  CardHeader,
  CardTitle,
  CardBadge,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// import type { IGroup, ITransaction, MemberStatus, PayoutOrder } from "./types";
import { ALL_GROUPS, SAMPLE_TRANSACTIONS } from "./data";
import {
  daysUntil,
  formatDate,
  formatNaira,
  freqLabel,
  payoutLabel,
  trustColor,
} from "@/lib/utils";
import { IGroup, MemberStatus, PayoutOrder } from "@/lib/types/group.types";
import { ITransaction } from "@/lib/types/transaction.types";

// ─── Small shared primitives ──────────────────────────────────────────────────

function PayoutIcon({ order }: { order: PayoutOrder }) {
  if (order === "rotational") return <Repeat2 size={14} />;
  if (order === "random")     return <Shuffle size={14} />;
  return <Gavel size={14} />;
}

const MEMBER_STATUS_COLOR: Record<MemberStatus, string> = {
  active:   "bg-emerald-500",
  defaulted:"bg-red-500",
  pending:  "bg-amber-400",
};

const TX_ICON_BG: Record<ITransaction["type"], string> = {
  contribution: "bg-emerald-50",
  payout:       "bg-blue-50",
  penalty:      "bg-red-50",
};

// ─── GroupHero ────────────────────────────────────────────────────────────────

interface GroupHeroProps {
  group: IGroup;
  isMember: boolean;
}

function GroupHero({ group, isMember }: GroupHeroProps) {
  const backHref  = isMember ? "/groups" : "/groups/discover";
  const backLabel = isMember ? "My Circles" : "Discover";

  const statusIcon = {
    active: <CheckCircle2 size={14} className="text-emerald-600" />,
    paused: <PauseCircle  size={14} className="text-amber-500"   />,
    closed: <CheckCircle2 size={14} className="text-zinc-400"    />,
  }[group.status];

  const statPills = [
    { icon: <Users           size={12} />, label: `${group.membersCount}/${group.max_members} members`                                           },
    { icon: <CircleDollarSign size={12} />, label: `${formatNaira(Number(group.contribution))}/${freqLabel(group.frequency).toLowerCase()}` },
    { icon: <TrendingUp      size={12} />, label: `${formatNaira(group.totalPaidOut)} paid out`                                                  },
    { icon: <ShieldCheck     size={12} />, label: `${group.trustScore}% trust`                                                                    },
  ];

  return (
    <div
      className="relative rounded-2xl overflow-hidden px-6 py-8"
      style={{ background: "linear-gradient(135deg, #064e3b 0%, #065f46 55%, #047857 100%)" }}
    >
      {/* Decorative blobs */}
      <div
        className="pointer-events-none absolute -top-12 -right-12 w-56 h-56 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #6ee7b7 0%, transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/3 w-36 h-36 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #a7f3d0 0%, transparent 70%)" }}
      />

      <div className="relative z-10 space-y-5">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-[12px] text-emerald-300/70 hover:text-emerald-200 transition-colors"
        >
          <ArrowLeft size={12} />
          {backLabel}
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          {/* Title block */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              {statusIcon}
              <span className="text-[11px] font-semibold uppercase tracking-widest text-emerald-300/70 capitalize">
                {group.status}
              </span>
              {group.isPrivate
                ? <Lock  size={11} className="text-emerald-300/50" />
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

          {/* Admin chip */}
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
          {statPills.map(({ icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 text-[12px] text-emerald-100/70 bg-white/10 rounded-full px-3 py-1.5"
            >
              {icon} {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MyStatusPanel ────────────────────────────────────────────────────────────

function MyStatusPanel({ group }: { group: IGroup }) {
  const me       = group.members.find((m) => m.id === group.myMemberId)!;
  const dueIn    = daysUntil(group.nextDue);
  const dueSoon  = !me.hasPaid && ["Today", "Tomorrow", "Overdue"].includes(dueIn);
  const cyclePct = Math.round((group.currentCycle / group.totalCycles) * 100);

  const paymentStatusLabel = me.hasPaidThisCycle
    ? "✓ Paid this cycle"
    : dueSoon
    ? "⚠ Payment due"
    : "Unpaid";

  const paymentStatusColor = me.hasPaidThisCycle
    ? "text-emerald-700"
    : dueSoon
    ? "text-red-600"
    : "text-amber-700";

  const miniStats = [
    { label: "Contributed", value: formatNaira(me.totalContributed) },
    { label: "Payout",      value: me.hasReceived ? "Received ✓" : `Turn ${me.turnPosition}` },
    { label: "Role",        value: me.role === "admin" ? "Admin" : "Member" },
  ];

  return (
    <Card variant="default" className="overflow-hidden">
      {/* Header strip */}
      <div
        className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between"
        style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)" }}
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-700/60 mb-0.5">
            My Position
          </p>
          <p className="text-[22px] font-bold text-emerald-900" style={{ fontFamily: "Georgia, serif" }}>
            Turn #{me.turnPosition}
            <span className="text-[13px] font-normal text-emerald-700/60 ml-1.5">of {group.max_members}</span>
          </p>
        </div>

        <div className="text-right">
          <p className={`text-[11px] font-bold uppercase tracking-wide mb-1 ${paymentStatusColor}`}>
            {paymentStatusLabel}
          </p>
          {!me.hasPaidThisCycle && (
            <p className={`text-[12px] font-semibold ${dueSoon ? "text-red-600" : "text-amber-700"}`}>
              Due {dueIn}
            </p>
          )}
          {me.hasPaidThisCycle && (
            <p className="text-[12px] text-emerald-600">Next due {daysUntil(group.nextDue)}</p>
          )}
        </div>
      </div>

      <CardContent className="pt-4 space-y-4">
        {/* Cycle progress bar */}
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

        {/* Mini stat grid */}
        <div className="grid grid-cols-3 gap-3">
          {miniStats.map(({ label, value }) => (
            <div key={label} className="bg-zinc-50 rounded-xl px-3 py-2.5 text-center">
              <p className="text-[10px] text-zinc-400 uppercase tracking-wide font-medium">{label}</p>
              <p className="text-[13px] font-bold text-zinc-900 mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        {me.hasPaidThisCycle ? (
          <div className="flex items-center gap-2 text-[12px] text-emerald-700 bg-emerald-50 rounded-xl px-4 py-3">
            <CheckCircle2 size={14} className="shrink-0" />
            You&apos;ve paid this cycle. Next payment due {daysUntil(group.nextDue)}.
          </div>
        ) : (
          <Button variant="primary" size="md" className="w-full rounded-xl gap-2">
            <ArrowDownLeft size={16} />
            Pay {formatNaira(group.contribution)} Now
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ─── JoinPanel ────────────────────────────────────────────────────────────────

function JoinPanel({ group }: { group: IGroup }) {
  const [requested, setRequested] = useState(false);

  const fillPct    = Math.round((group.membersCount / group.max_members) * 100);
  const almostFull = group.spotsLeft <= 2;

  const keyFacts = [
    { icon: <PayoutIcon order={group.payout_order} />, label: "Payout method", value: payoutLabel(group.payout_order) },
    { icon: <CalendarClock size={14} />,               label: "Frequency",     value: freqLabel(group.frequency)      },
    { icon: <TrendingUp    size={14} />,               label: "Total paid out",value: formatNaira(group.totalPaidOut)  },
    { icon: <ShieldCheck   size={14} />,               label: "Trust score",   value: `${group.trustScore}%`          },
  ];

  return (
    <Card variant="default" className="overflow-hidden sticky top-6">
      {/* Contribution header */}
      <div className="px-5 pt-5 pb-4 border-b border-zinc-100">
        <p className="text-[11px] uppercase tracking-widest font-semibold text-zinc-400 mb-1">Contribution</p>
        <p className="text-3xl font-bold text-zinc-900" style={{ fontFamily: "Georgia, serif" }}>
          {formatNaira(group.contribution)}
          <span className="text-[14px] font-normal text-zinc-400 ml-1.5">
            /{freqLabel(group.frequency).toLowerCase()}
          </span>
        </p>
      </div>

      <CardContent className="space-y-4 pt-4">
        {/* Fill bar */}
        <div>
          <div className="flex justify-between text-[12px] mb-1.5">
            <span className="text-zinc-500 flex items-center gap-1">
              <Users size={11} /> {group.membersCount}/{group.max_members} members
            </span>
            {almostFull
              ? <span className="font-bold text-amber-600">{group.spotsLeft} spot{group.spotsLeft !== 1 ? "s" : ""} left!</span>
              : <span className="text-zinc-400">{group.spotsLeft} open</span>
            }
          </div>
          <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${fillPct >= 90 ? "bg-amber-500" : "bg-emerald-600"}`}
              style={{ width: `${fillPct}%` }}
            />
          </div>
        </div>

        {/* Key facts */}
        {keyFacts.map(({ icon, label, value }) => (
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
            <p className="text-[12px] text-zinc-500">
              The admin will review your request. You&apos;ll be notified once approved.
            </p>
          </div>
        ) : (
          <>
            <Button variant="primary" size="lg" className="w-full rounded-xl" onClick={() => setRequested(true)}>
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

// ─── MembersList ──────────────────────────────────────────────────────────────

interface MembersListProps {
  group: IGroup;
  isMember: boolean;
}

function MembersList({ group, isMember }: MembersListProps) {
  const [expanded, setExpanded] = useState(false);

  const visibleMembers = expanded ? group.members : group.members.slice(0, 5);
  const hasMore        = group.members.length > 5;

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
          {group.payout_order === "rotational"
            ? "Payout order is fixed — position shown."
            : "Positions listed; payout order is dynamic."}
        </CardDescription>
      </CardHeader>
      <CardDivider />

      <CardContent className="px-0 pt-0">
        <ul>
          {visibleMembers.map((member, idx) => {
            const isMe = member.id === group.myMemberId;
            return (
              <li
                key={member.id}
                className={[
                  "flex items-center gap-3 px-5 py-3 transition-colors",
                  isMe ? "bg-emerald-50/60" : "hover:bg-zinc-50",
                  idx < visibleMembers.length - 1 ? "border-b border-zinc-50" : "",
                ].join(" ")}
              >
                {/* Turn position */}
                <span className="text-[11px] font-bold text-zinc-300 w-5 text-center shrink-0">
                  {member.turnPosition}
                </span>

                {/* Avatar with status dot */}
                <div className="relative shrink-0">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold text-white ${isMe ? "bg-emerald-700 ring-2 ring-emerald-400" : ""}`}
                    style={!isMe ? { background: `hsl(${(member.turnPosition * 37) % 360}, 45%, 50%)` } : undefined}
                  >
                    {member.initials}
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white ${MEMBER_STATUS_COLOR[member.status]}`}
                  />
                </div>

                {/* Name + contributed */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-[13px] font-semibold truncate ${isMe ? "text-emerald-900" : "text-zinc-800"}`}>
                      {member.name}
                      {isMe && <span className="ml-1 text-[10px] font-bold text-emerald-600">(you)</span>}
                    </p>
                    {member.role === "admin" && <Crown size={11} className="text-amber-500 shrink-0" />}
                  </div>
                  {isMember && (
                    <p className="text-[11px] text-zinc-400">{formatNaira(member.totalContributed)} contributed</p>
                  )}
                </div>

                {/* Payment badge */}
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
            );
          })}
        </ul>

        {hasMore && (
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

// ─── TransactionHistory ───────────────────────────────────────────────────────

function TransactionHistory() {
  const txIcon: Record<ITransaction["type"], React.ReactNode> = {
    contribution: <ArrowDownLeft size={14} className="text-emerald-600" />,
    payout:       <TrendingUp    size={14} className="text-blue-600"    />,
    penalty:      <AlertCircle   size={14} className="text-red-500"     />,
  };

  const statusColor: Record<ITransaction["status"], "green" | "amber" | "red"> = {
    success: "green",
    pending: "amber",
    failed:  "red",
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
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${TX_ICON_BG[tx.type]}`}>
              {txIcon[tx.type]}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-zinc-800 truncate">{tx.description}</p>
              <p className="text-[11px] text-zinc-400">
                {formatDate(tx.date, { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>

            <div className="text-right shrink-0">
              <p className={`text-[13px] font-bold ${tx.type === "payout" ? "text-blue-700" : "text-zinc-900"}`}>
                {tx.type === "payout" ? "+" : "-"}{formatNaira(tx.amount)}
              </p>
              <CardBadge color={statusColor[tx.status]} dot>
                {tx.status}
              </CardBadge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ─── GroupInfo ────────────────────────────────────────────────────────────────

function GroupInfo({ group }: { group: IGroup }) {
  const tc = trustColor(group.trustScore);

  const trustChecks = [
    { label: "Identity verified",  ok: true                       },
    { label: "Zero defaults",      ok: group.trustScore >= 90     },
    { label: "Active admin",       ok: true                       },
    { label: "Platform insured",   ok: group.trustScore >= 95     },
  ];

  return (
    <div className="space-y-4">
      <Card variant="flat">
        <CardHeader>
          <CardTitle>About this circle</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[13px] text-zinc-600 leading-relaxed">{group.longDescription}</p>
        </CardContent>
      </Card>

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

      <Card variant="flat">
        <CardHeader>
          <CardTitle>Trust &amp; verification</CardTitle>
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
            {trustChecks.map(({ label, ok }) => (
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

// ─── AdminPanel ───────────────────────────────────────────────────────────────

function AdminPanel({ group }: { group: IGroup }) {
  const me = group.members.find((m) => m.id === group.myMemberId);
  if (me?.role !== "admin") return null;

  const actions = [
    { icon: <Bell     size={14} />, label: "Send reminder"    },
    { icon: <Settings size={14} />, label: "Edit circle"      },
    { icon: <Users    size={14} />, label: "Manage members"   },
    { icon: <Copy     size={14} />, label: "Copy invite code" },
  ];

  return (
    <Card variant="tinted" className="border-amber-200 bg-amber-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Crown size={15} className="text-amber-600" />
          <CardTitle className="text-amber-800">Admin controls</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        {actions.map(({ icon, label }) => (
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

// ─── InviteCodeCard ───────────────────────────────────────────────────────────

function InviteCodeCard({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
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
            onClick={handleCopy}
            className="text-[12px] font-semibold text-zinc-500 hover:text-zinc-900 transition-colors flex items-center gap-1"
          >
            {copied
              ? <CheckCircle2 size={13} className="text-emerald-600" />
              : <Copy         size={13} />
            }
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── DangerZone ───────────────────────────────────────────────────────────────

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

// ─── Sidebar panels ───────────────────────────────────────────────────────────

function UpcomingPanel({ group }: { group: IGroup }) {
  const items = [
    {
      icon:  <Clock size={14} />,
      label: "Next payment due",
      value: formatDate(group.nextDue),
      sub:   daysUntil(group.nextDue),
    },
    {
      icon:  <CalendarClock size={14} />,
      label: "Next payout",
      value: formatDate(group.nextPayout),
      sub:   daysUntil(group.nextPayout),
    },
    {
      icon:  <Repeat2 size={14} />,
      label: "Payout method",
      value: payoutLabel(group.payout_order),
      sub:   null,
    },
  ];

  return (
    <Card variant="flat">
      <CardHeader>
        <CardTitle>Upcoming</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map(({ icon, label, value, sub }) => (
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
  );
}

function CircleStatsPanel({ group }: { group: IGroup }) {
  const stats = [
    { label: "Cycle",             value: `${group.currentCycle} of ${group.totalCycles}` },
    { label: "Started",           value: formatDate(group.cycleStartDate, { month: "short", year: "numeric" }) },
    { label: "Members paid out",  value: `${group.members.filter((m) => m.hasReceived).length}` },
    { label: "Total disbursed",   value: formatNaira(group.totalPaidOut) },
  ];

  return (
    <Card variant="flat">
      <CardHeader>
        <CardTitle>Circle stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {stats.map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between text-[13px]">
            <span className="text-zinc-500">{label}</span>
            <span className="font-semibold text-zinc-900">{value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  params: { id: string };
}

export default function GroupDetailPage({ params }: PageProps) {
  const group    = ALL_GROUPS[params.id] ?? ALL_GROUPS["1"];
  const isMember = group.myMemberId !== null;
  const isAdmin  = isMember && group.members.find((m) => m.id === group.myMemberId)?.role === "admin";

  return (
    <div className="min-h-full bg-zinc-50/40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        <GroupHero group={group} isMember={isMember} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* ── Main column ─────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {isMember  && <MyStatusPanel group={group} />}
            {isAdmin   && <AdminPanel    group={group} />}
            <MembersList group={group} isMember={isMember} />
            {isMember  && <TransactionHistory />}
            <GroupInfo group={group} />
            {isMember && group.inviteCode && <InviteCodeCard code={group.inviteCode} />}
            {isMember  && <DangerZone />}
          </div>

          {/* ── Sidebar ─────────────────────────────────────────────────── */}
          <div className="space-y-4">
            {!isMember && <JoinPanel         group={group} />}
            {isMember  && <UpcomingPanel     group={group} />}
            {!isMember && <CircleStatsPanel  group={group} />}
          </div>

        </div>
      </div>
    </div>
  );
}