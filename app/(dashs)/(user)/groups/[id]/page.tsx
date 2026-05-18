"use client";

import { useState, useEffect } from "react";
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

import {
  daysUntil,
  formatDate,
  formatNaira,
  freqLabel,
  payoutLabel,
} from "@/lib/utils";
import { IGroup, MemberStatus, PayoutOrder } from "@/lib/types/group.types";
import { ITransaction } from "@/lib/types/transaction.types";
import { HTTPS } from "@/lib/http";
import { Auth } from "@/lib/auth";
import { useParams } from "next/navigation";
import { IUser } from "@/lib/types/user.types";
import RequestToJoinButton from "@/components/request-to-join-button";

const TX_ICON_BG: Record<string, string> = {
  contribution: "bg-emerald-50",
  charge: "bg-emerald-50", // fallback for DB types
  payout: "bg-blue-50",
  penalty: "bg-red-50",
};

// ─── Component Blocks ─────────────────────────────────────────────────────────

function PrivateGroupState() {
  return (
    <div className="min-h-full bg-zinc-50/40 flex items-center justify-center p-6 py-20">
      <Card
        variant="default"
        className="max-w-md w-full text-center py-10 px-6 border-zinc-200"
      >
        <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock size={24} className="text-zinc-400" />
        </div>
        <CardTitle className="text-xl mb-2 text-zinc-900">
          Private Circle
        </CardTitle>
        <CardDescription className="text-[14px] text-zinc-500">
          This circle is private. You must receive an invitation from the admin
          to view its details or join.
        </CardDescription>
        <Link href="/groups/discover">
          <Button variant="primary" className="mt-6 w-full rounded-xl">
            Explore Public Circles
          </Button>
        </Link>
      </Card>
    </div>
  );
}

function GroupHero({ group, isMember }: { group: IGroup; isMember: boolean }) {
  const backHref = isMember ? "/groups" : "/groups/discover";
  const backLabel = isMember ? "My Circles" : "Discover";
  const isPrivate = group.meta?.is_private || group.isPrivate;
  const adminName = group?.admin?.name; //(group?.admin?.name || "U").slice(0, 2).toUpperCase();
  const adminInitials = (group?.admin?.name || "U").slice(0, 2).toUpperCase();

  const statusIcon = {
    active: <CheckCircle2 size={14} className="text-emerald-600" />,
    paused: <PauseCircle size={14} className="text-amber-500" />,
    closed: <CheckCircle2 size={14} className="text-zinc-400" />,
  }[group.status as string] || (
    <CheckCircle2 size={14} className="text-emerald-600" />
  );

  const statPills = [
    {
      icon: <Users size={12} />,
      label: `${group.members?.length || 0}/${group.max_members} members`,
    },
    {
      icon: <CircleDollarSign size={12} />,
      label: `${formatNaira(Number(group.contribution))}/${freqLabel(group.frequency).toLowerCase()}`,
    },
    {
      icon: <ShieldCheck size={12} />,
      label: `${group.meta?.trustScore || 100}% trust`,
    },
  ];

  return (
    <div
      className="relative rounded-2xl overflow-hidden px-6 py-8"
      style={{
        background:
          "linear-gradient(135deg, #064e3b 0%, #065f46 55%, #047857 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute -top-12 -right-12 w-56 h-56 rounded-full opacity-10"
        style={{
          background: "radial-gradient(circle, #6ee7b7 0%, transparent 70%)",
        }}
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
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              {statusIcon}
              <span className="text-[11px] font-semibold uppercase tracking-widest text-emerald-300/70 capitalize">
                {group.status}
              </span>
              {isPrivate ? (
                <Lock size={11} className="text-emerald-300/50" />
              ) : (
                <Globe size={11} className="text-emerald-300/50" />
              )}
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
              {group.description || "No description provided."}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/10 rounded-2xl px-4 py-2.5 shrink-0">
            <div className="w-8 h-8 rounded-full bg-emerald-700/60 ring-2 ring-white/20 flex items-center justify-center text-[11px] font-bold text-emerald-200">
              {adminInitials}
            </div>
            <div>
              <p className="text-[10px] text-emerald-300/60 font-medium uppercase tracking-wide">
                Admin
              </p>
              <p className="text-[13px] font-semibold text-white">
                {adminName}
              </p>
            </div>
          </div>
        </div>

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

function JoinPanel({ group }: { group: IGroup }) {
  const userId = Auth.id();
  const hasPendingRequest = !!group.pendingRequests?.find(
    (request) => request.sender_id === userId,
  );
  const [requested, setRequested] = useState(hasPendingRequest);
  const [loading, setLoading] = useState(false);

  const membersCount = group.members?.length || 0;
  // console.log(group)
  const spotsLeft = group.max_members - membersCount;
  const fillPct = Math.round((membersCount / group.max_members) * 100);
  const almostFull = spotsLeft > 0 && spotsLeft <= 2;

  return (
    <Card variant="default" className="overflow-hidden sticky top-6">
      <div className="px-5 pt-5 pb-4 border-b border-zinc-100">
        <p className="text-[11px] uppercase tracking-widest font-semibold text-zinc-400 mb-1">
          Contribution
        </p>
        <p
          className="text-3xl font-bold text-zinc-900"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {formatNaira(Number(group.contribution))}
          <span className="text-[14px] font-normal text-zinc-400 ml-1.5">
            /{freqLabel(group.frequency).toLowerCase()}
          </span>
        </p>
      </div>
      <CardContent className="space-y-4 pt-4">
        <div>
          <div className="flex justify-between text-[12px] mb-1.5">
            <span className="text-zinc-500 flex items-center gap-1">
              <Users size={11} /> {membersCount}/{group.max_members} members
            </span>
            {almostFull ? (
              <span className="font-bold text-amber-600">
                {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left!
              </span>
            ) : spotsLeft > 0 ? (
              <span className="text-zinc-400">{spotsLeft} open</span>
            ) : (
              <span className="text-emerald-600 font-bold">Full</span>
            )}
          </div>
          <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${fillPct >= 90 ? "bg-amber-500" : "bg-emerald-600"}`}
              style={{ width: `${fillPct}%` }}
            />
          </div>
        </div>

        <CardDivider className="mx-0" />

        {requested ? (
          <div className="text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
              <CheckCircle2 size={20} className="text-emerald-600" />
            </div>
            <p className="text-[14px] font-semibold text-zinc-900">
              Request Sent!
            </p>
            <p className="text-[12px] text-zinc-500">
              The admin will review your request.
            </p>
          </div>
        ) : (
          <RequestToJoinButton
            className="w-full rounded-xl"
            size={"lg"}
            group={group}
            onRequested={setRequested}
          />
        )}
      </CardContent>
    </Card>
  );
}

function MembersList({
  group,
  isMember,
  myUserId,
}: {
  group: IGroup;
  isMember: boolean;
  myUserId: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const users = group.members || [];
  const visibleMembers = expanded ? users : users.slice(0, 5);
  return (
    <Card variant="default">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Members</CardTitle>
          <span className="text-[12px] text-zinc-400 bg-zinc-100 rounded-full px-2.5 py-1">
            {users.length} / {group.max_members}
          </span>
        </div>
      </CardHeader>
      <CardDivider />
      <CardContent className="px-0 pt-0">
        <ul>
          {visibleMembers.map((u: any, idx: number) => {
            const isMe = u.id === myUserId;
            const pivot = u.pivot || {};
            const role = pivot.role;
            const initials = (u.name || "U").slice(0, 2).toUpperCase();

            return (
              <li
                key={u.id}
                className={`flex items-center gap-3 px-5 py-3 transition-colors ${isMe ? "bg-emerald-50/60" : "hover:bg-zinc-50"} border-b border-zinc-50`}
              >
                <span className="text-[11px] font-bold text-zinc-300 w-5 text-center shrink-0">
                  {idx + 1}
                </span>
                <div className="relative shrink-0">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold text-white ${isMe ? "bg-emerald-700 ring-2 ring-emerald-400" : "bg-zinc-400"}`}
                  >
                    {initials}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-[13px] font-semibold truncate ${isMe ? "text-emerald-900" : "text-zinc-800"}`}
                    >
                      {u.name}{" "}
                      {isMe && (
                        <span className="ml-1 text-[10px] font-bold text-emerald-600">
                          (you)
                        </span>
                      )}
                    </p>
                    {role === "admin" && (
                      <Crown size={11} className="text-amber-500 shrink-0" />
                    )}
                  </div>
                  {isMember && (
                    <p className="text-[11px] text-zinc-400">
                      {formatNaira(pivot.total_contributed || 0)} contributed
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        {users.length > 5 && (
          <div className="px-5 pt-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full text-[12px] text-zinc-400 hover:text-zinc-700 transition-colors flex items-center justify-center gap-1"
            >
              {expanded ? "Show fewer" : `Show all ${users.length} members`}
              <ChevronRight
                size={12}
                className={`transition-transform ${expanded ? "rotate-90" : ""}`}
              />
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────

export default function GroupDetailPage() {
  const [group, setGroup] = useState<IGroup | null>(null);
  const params = useParams<{ id: string }>();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    HTTPS.get(`/groups/${params.id}`)
      .then(({ data }) => {
        const user = Auth.user();
        if (data) setGroup(data as IGroup);
        if (user) setCurrentUser(user);
        setLoading(false);
      })
      .catch((err) => {
        if (err.response?.status === 403) setError("private");
        else setError("not_found");
        setLoading(false);
      });
  }, [params.id]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-500">
        Loading circle details...
      </div>
    );
  if (error === "private") return <PrivateGroupState />;
  if (error || !group)
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-500">
        Circle not found.
      </div>
    );

  const isMember = group.members?.some((u: any) => u.id === currentUser?.id);
  const myMembership = group.members?.find(
    (u: any) => u.id === currentUser?.id,
  );
  const isAdmin =
    myMembership?.role === "admin" || group.owner_id === currentUser?.id;

  return (
    <div className="min-h-full bg-zinc-50/40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <GroupHero group={group} isMember={isMember} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {isAdmin && (
              <Card variant="tinted" className="border-amber-200 bg-amber-50">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Crown size={15} className="text-amber-600" />
                    <CardTitle className="text-amber-800">
                      Admin controls
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-2">
                  <button className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-amber-200 text-[12px] font-medium text-amber-800 hover:bg-amber-100">
                    <Settings size={14} className="text-amber-600" /> Edit
                    circle
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-amber-200 text-[12px] font-medium text-amber-800 hover:bg-amber-100">
                    <Users size={14} className="text-amber-600" /> Manage
                    members
                  </button>
                </CardContent>
              </Card>
            )}

            <MembersList
              group={group}
              isMember={isMember}
              myUserId={currentUser?.id}
            />

            {isMember && (
              <Card variant="default">
                <CardHeader>
                  <CardTitle>Transactions</CardTitle>
                </CardHeader>
                <CardDivider />
                <CardContent className="px-0 pt-0">
                  {!group.transactions || group.transactions.length === 0 ? (
                    <div className="p-6 text-center text-sm text-zinc-400">
                      No transactions yet.
                    </div>
                  ) : (
                    group.transactions.map((tx: any, i: number) => (
                      <div
                        key={tx.id}
                        className={`flex items-center gap-3 px-5 py-3 border-b border-zinc-50`}
                      >
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${TX_ICON_BG[tx.type] || "bg-zinc-100"}`}
                        >
                          <Clock size={14} className="text-zinc-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium text-zinc-800 truncate">
                            {tx.meta?.note || tx.type}
                          </p>
                          <p className="text-[11px] text-zinc-400">
                            {formatDate(tx.created_at)}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[13px] font-bold">
                            {formatNaira(tx.amount)}
                          </p>
                          <CardBadge
                            color={tx.status === "success" ? "green" : "amber"}
                          >
                            {tx.status}
                          </CardBadge>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {!isMember && <JoinPanel group={group} />}

            <Card variant="flat">
              <CardHeader>
                <CardTitle>Circle rules & info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-zinc-500">Payout method</span>
                  <span className="font-semibold text-zinc-900">
                    {payoutLabel(group.payout_order)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-zinc-500">Frequency</span>
                  <span className="font-semibold text-zinc-900">
                    {freqLabel(group.frequency)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-zinc-500">Goal</span>
                  <span className="font-semibold text-zinc-900">
                    {formatNaira(group.goal || 0)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
