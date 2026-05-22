"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardBadge,
  CardStat,
  CardProgress,
  CardFooter,
  CardDivider,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Wallet,
  Users,
  ArrowUpRight,
  ArrowDownLeft,
  Bell,
  TrendingUp,
  Clock,
  ChevronRight,
  Plus,
  CircleDollarSign,
  BadgeCheck,
  AlertCircle,
  Layers,
  // Link as LinkIcon,
} from "lucide-react";
import { Auth } from "@/lib/auth";
import { useState, useEffect } from "react";
import Link from "next/link";
import { IBalance, IUser } from "@/lib/types/user.types";
import { formatNaira } from "@/lib/utils";
import { ITransaction } from "@/lib/types/transaction.types";
import { IGroup } from "@/lib/types/group.types";
import { GreetingSection } from "@/components/greeting-section";
import { BalanceCard } from "@/balance-card";


function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "emerald",
  badge,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  color?: "emerald" | "amber" | "blue" | "rose";
  badge?: string;
}) {
  const colorMap = {
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
    rose: "bg-rose-50 text-rose-700",
  };

  return (
    <Card variant="default" className="hover:shadow-sm transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <span
            className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${colorMap[color]}`}
          >
            <Icon className="w-4.5 h-4.5" size={18} />
          </span>
          {badge && (
            <CardBadge color="gray" dot>
              {badge}
            </CardBadge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p
          className="text-2xl font-bold text-zinc-900 tracking-tight"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {value}
        </p>
        <p className="text-xs text-zinc-400 mt-0.5 font-medium uppercase tracking-wide">
          {label}
        </p>
        {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function QuickActions() {
  const actions = [
    { icon: CircleDollarSign, label: "Deposit", color: "emerald" as const, href:"/deposit" },
    { icon: ArrowUpRight, label: "Withdraw", color: "amber" as const, href:"/withdraw" },
    { icon: Users, label: "New Circle", color: "blue" as const, href:"/groups/create" },
    { icon: Layers, label: "History", color: "rose" as const, href:"/transactions/history" },
  ];

  return (
    <Card variant="flat">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        <div className="grid grid-cols-4   gap-2">
          {actions.map(({ icon: Icon, label, color, href }) => {
            const colorMap = {
              emerald: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
              amber: "bg-amber-50 text-amber-700 hover:bg-amber-100",
              blue: "bg-blue-50 text-blue-700 hover:bg-blue-100",
              rose: "bg-rose-50 text-rose-700 hover:bg-rose-100",
            };
            return (
               <Link href={href} key={label}>
                <button
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-colors ${colorMap[color]} cursor-pointer`}
                >
                  <Icon size={20} />
                  <span className="text-[11px] font-semibold">{label}</span>
                </button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function CirclesSection({
  groups = [],
  id: currentId,
}: {
  groups?: IGroup[];
  id: IUser["id"];
}) {
  const myTurn = groups
    .flatMap((group) => group.members)
    .find((mem) => mem.id === currentId)?.myTurn;
  if (groups.length === 0) {
    return (
      <Card variant="default">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>My Circles</CardTitle>
            <Link href="/groups/discover">
              <Button
                size="sm"
                variant="secondary"
                className="rounded-lg gap-1.5"
              >
                <Plus size={14} />
                Join
              </Button>
            </Link>
          </div>
          <CardDescription>Your active savings groups</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-14 h-14 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-zinc-400" />
            </div>
            <p className="text-sm text-zinc-500 mb-3">
              You haven&apos;t joined any circles yet.
            </p>
            <Link href="/groups/discover">
              <Button size="sm" variant="primary" className="rounded-lg">
                Find a Circle
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="default">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>My Circles</CardTitle>
          <div className="flex gap-2">
            <Link href="/groups/discover">
              <Button
                size="sm"
                variant="secondary"
                className="rounded-lg gap-1.5"
              >
                <Plus size={14} />
                Join
              </Button>
            </Link>
            <Link href="/groups">
              <Button size="sm" variant="ghost" className="rounded-lg gap-1.5">
                View all
              </Button>
            </Link>
          </div>
        </div>
        <CardDescription>Your active savings groups</CardDescription>
      </CardHeader>
      <CardDivider />
      <CardContent className="pt-0 px-0">
        <ul>
          {groups.slice(0, 5).map((circle, idx, arr) => (
            <Link href={`/groups/${circle.id}`} key={circle.id}>
              <li className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-50 transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                  {circle.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-zinc-900 truncate">
                      {circle.name}
                    </p>
                    <CardBadge color="green" dot>
                      Active
                    </CardBadge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Users size={10} /> {circle.membersCount} members
                    </span>
                    <span>{circle.name}</span>
                    <span className="flex items-center gap-1">
                      <Clock size={10} /> Payout{" "}
                      {new Date(circle.nextPayout).toLocaleDateString("en-NG", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <CardProgress
                    value={Number(myTurn || 0)}
                    max={circle.membersCount}
                    label={`Turn ${myTurn || 0} of ${circle.membersCount}`}
                    className="mt-2"
                  />
                </div>
                <ChevronRight
                  size={16}
                  className="text-zinc-300 group-hover:text-zinc-500 transition-colors shrink-0"
                />
              </li>
              {idx < Math.min(arr.length, 5) - 1 && (
                <CardDivider className="mx-0" />
              )}
            </Link>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function TransactionsSection({
  transactions = [],
}: {
  transactions: ITransaction[];
}) {
  return (
    <Card variant="default">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription className="mt-0.5">
              Deposits, withdrawals &amp; contributions
            </CardDescription>
          </div>
          <Link href="/transactions/history" className="ml-auto">
            <Button
              size="sm"
              variant="ghost"
              className="rounded-lg text-emerald-700 hover:text-emerald-800"
            >
              View all <ChevronRight size={14} className="ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead align="right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableEmpty
                colSpan={4}
                message="No transactions yet. Make your first deposit to get started."
              />
            ) : (
              transactions.map((tx, i) => (
                <TableRow key={i} hoverable>
                  {/* <TableCell>{tx.description}</TableCell> */}
                  <TableCell mono>{tx.amount}</TableCell>
                  <TableCell muted>{tx.created_at}</TableCell>
                  <TableCell align="right">
                    <CardBadge
                      color={
                        tx.status === "success"
                          ? "green"
                          : tx.status === "pending"
                            ? "amber"
                            : "red"
                      }
                      dot
                    >
                      {tx.status}
                    </CardBadge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function NoticeCard() {
  return (
    <Card variant="tinted" className="border-amber-200 bg-amber-50">
      <CardContent className="py-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-800">
            Verify your account
          </p>
          <p className="text-xs text-amber-700 mt-0.5">
            Complete identity verification to unlock higher withdrawal limits
            and join premium circles.
          </p>
          <Button
            size="sm"
            variant="secondary"
            className="mt-2 rounded-lg text-amber-800 bg-amber-100 hover:bg-amber-200"
          >
            Verify Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ReferralCard({ code }: { code: string }) {
  return (
    <Card variant="default">
      <CardHeader>
        <CardTitle>Refer &amp; Earn</CardTitle>
        <CardDescription>
          Invite friends and earn ₦500 per referral
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 bg-zinc-50 rounded-xl px-3 py-2.5 border border-zinc-200">
          <code className="text-sm font-mono font-semibold text-emerald-700 flex-1">
            {code}
          </code>
          <button className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors">
            Copy
          </button>
        </div>
        <div className="flex items-center justify-between mt-4 text-sm">
          <span className="text-zinc-500">Total referred</span>
          <span className="font-semibold text-zinc-900">0 friends</span>
        </div>
        <div className="flex items-center justify-between mt-1 text-sm">
          <span className="text-zinc-500">Earned</span>
          <span className="font-semibold text-emerald-700">₦0.00</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [user, setUser] = useState<IUser | null>(null);
  useEffect(() => {
    setUser(Auth.user() as unknown as IUser);
  }, []);
  const referralCode = user?.referral_code ?? "MT-XXXX";
  const isVerified = Boolean((user as any)?.isVerified);
  const activeGroup = user?.groups?.filter((g) => g.status === "active").length;

  return (
    <div className="min-h-full bg-zinc-50/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* { JSON.stringify(user) } */}

        {/* Greeting */}
        <GreetingSection name={user?.name || "Friend"} />

        {/* Verification notice */}
        {!isVerified && <NoticeCard />}

        {/* Top metric row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Balance card spans 2 cols */}
          {user && <BalanceCard {...user} />}

          <StatCard
            icon={Users}
            label="Active Circles"
            value={String(user?.groups?.length ?? 0)}
            sub={`${String(user?.inviteReceived?.length || 0)} pending invites`}
            color="blue"
          />

          <StatCard
            icon={TrendingUp}
            label="Next Payout"
            value={
              user?.next_due
                ? new Date(user.next_due.due_by).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                  })
                : "--"
            }
            sub={
              activeGroup ? `${activeGroup} active cycles` : "No active cycles"
            }
            color="emerald"
          />
        </div>

        {/* Quick actions (mobile-first utility strip) */}
        <div className="md:hidden">
          <QuickActions />
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: circles + transactions (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {user && <CirclesSection groups={user.groups ?? []} id={user.id} />}
            {user && (
              <TransactionsSection transactions={user.transactions ?? []} />
            )}
          </div>

          {/* Right sidebar (1/3) */}
          <div className="space-y-6">
            {/* Quick actions desktop */}
            <div className="hidden md:block">
              <QuickActions />
            </div>

            <ReferralCard code={referralCode} />

            {/* Summary stats */}
            <Card variant="flat">
              <CardHeader>
                <CardTitle>Savings Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <CardStat
                  label="Total Contributed"
                  value="₦0.00"
                  sub="All time"
                />
                <CardDivider className="mx-0" />
                <CardStat
                  label="Total Received"
                  value="₦0.00"
                  sub="Payouts received"
                />
                <CardDivider className="mx-0" />
                <CardStat
                  label="Referral Earnings"
                  value="₦0.00"
                  sub="Pending cashout"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
