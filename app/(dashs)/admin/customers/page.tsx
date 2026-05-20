"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import {
  Users,
  ShieldCheck,
  Clock,
  Ban,
  Search,
  Filter,
  ChevronRight,
  RefreshCw,
  Download,
  Eye,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Wallet,
  UserCheck,
  UserX,
} from "lucide-react";
import { HTTPS } from "@/lib/http";
import { formatNaira } from "@/lib/utils";
import { Filter as FilterComponent } from "@/components/ui/filter";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface AdminUser {
  id: string | number;
  name: string;
  email: string;
  phone?: string;
  imageUrl?: string;
  status: "active" | "pending" | "suspended" | "banned";
  isVerified: boolean;
  kyc_level?: string;
  kyc_status?: string;
  created_at: string;
  created_at_human?: string;
  balance?: {
    available_wallet: string;
    pending_wallet: string;
    available_referral: string;
    pending_referral: string;
    total_saved: number;
  };
  groups?: { id: string }[];
  transactions?: { id: string }[];
  referral_count?: number;
  referral_code?: string;
}

interface CustomerStats {
  total: number;
  verified: number;
  pending_kyc: number;
  suspended: number;
  new_this_month: number;
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "emerald",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color?: "emerald" | "amber" | "blue" | "rose";
}) {
  const colorMap = {
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
    rose: "bg-rose-50 text-rose-700",
  };

  return (
    <Card variant="default" className="hover:shadow-sm transition-shadow">
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
  );
}

// ─── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: AdminUser["status"] }) {
  const map: Record<
    AdminUser["status"],
    {
      color: "green" | "amber" | "red" | "gray";
      icon: React.ElementType;
      label: string;
    }
  > = {
    active: { color: "green", icon: CheckCircle2, label: "Active" },
    pending: { color: "amber", icon: Clock, label: "Pending" },
    suspended: { color: "red", icon: AlertCircle, label: "Suspended" },
    banned: { color: "red", icon: XCircle, label: "Banned" },
  };

  const conf = map[status] ?? map.pending;
  const StatusIcon = conf.icon;

  return (
    <CardBadge color={conf.color} dot>
      {conf.label}
    </CardBadge>
  );
}

// ─── KYC Badge ─────────────────────────────────────────────────────────────────

function KycBadge({
  isVerified,
  kycStatus,
}: {
  isVerified: boolean;
  kycStatus?: string;
}) {
  if (isVerified) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5">
        <ShieldCheck size={10} />
        Verified
      </span>
    );
  }
  if (kycStatus === "pending") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 rounded-full px-2 py-0.5">
        <Clock size={10} />
        Pending
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-500 bg-zinc-100 rounded-full px-2 py-0.5">
      <XCircle size={10} />
      Unverified
    </span>
  );
}

// ─── User Avatar ───────────────────────────────────────────────────────────────

function UserAvatar({
  name,
  size = "sm",
}: {
  name: string;
  size?: "sm" | "md";
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const sizeClass =
    size === "md" ? "w-10 h-10 text-[13px]" : "w-8 h-8 text-[11px]";

  return (
    <div
      className={`${sizeClass} rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0 select-none`}
    >
      {initials}
    </div>
  );
}

// ─── Customer Detail Drawer ────────────────────────────────────────────────────

function CustomerDrawer({
  user,
  onStatusChange,
}: {
  user: AdminUser;
  onStatusChange: (id: string | number, status: AdminUser["status"]) => void;
}) {
  const [actionLoading, setActionLoading] = useState(false);

  const handleStatusAction = async (newStatus: AdminUser["status"]) => {
    setActionLoading(true);
    try {
      await HTTPS.put(`/users/${user.id}`, { status: newStatus });
      onStatusChange(user.id, newStatus);
    } catch {
      // handle error
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger className=" flex items-center gap-1 ">
        <Eye size={13} />
        View
      </SheetTrigger>

      <SheetContent>
        <SheetHeader>
          <SheetTitle>Customer Profile</SheetTitle>
          <SheetDescription>
            View and manage user details and account status.
          </SheetDescription>
        </SheetHeader>
        <SheetBody className="">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Identity */}
            <div className="flex items-start gap-4">
              <UserAvatar name={user.name} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-zinc-900 text-[15px] truncate">
                  {user.name}
                </p>
                <p className="text-[13px] text-zinc-500 truncate">
                  {user.email}
                </p>
                {user.phone && (
                  <p className="text-[12px] text-zinc-400 mt-0.5">
                    {user.phone}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <StatusBadge status={user.status} />
                  <KycBadge
                    isVerified={user.isVerified}
                    kycStatus={user.kyc_status}
                  />
                </div>
              </div>
            </div>

            {/* Balance */}
            {user.balance && (
              <Card variant="flat">
                <CardContent className="pt-4">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-3">
                    Wallet Balance
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        label: "Available",
                        value: formatNaira(
                          Number(user.balance.available_wallet) || 0,
                        ),
                      },
                      {
                        label: "Pending",
                        value: formatNaira(
                          Number(user.balance.pending_wallet) || 0,
                        ),
                      },
                      {
                        label: "Referral",
                        value: formatNaira(
                          Number(user.balance.available_referral) || 0,
                        ),
                      },
                      {
                        label: "Total Saved",
                        value: formatNaira(user.balance.total_saved || 0),
                      },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wide">
                          {label}
                        </p>
                        <p className="text-[14px] font-semibold text-zinc-900">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Activity */}
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "Circles",
                  value: user.groups?.length ?? 0,
                  icon: Users,
                },
                {
                  label: "Transactions",
                  value: user.transactions?.length ?? 0,
                  icon: TrendingUp,
                },
                {
                  label: "Referrals",
                  value: user.referral_count ?? 0,
                  icon: UserCheck,
                },
              ].map(({ label, value, icon: Icon }) => (
                <Card key={label} variant="flat">
                  <CardContent className="pt-3 pb-3 text-center">
                    <Icon size={14} className="text-zinc-400 mx-auto mb-1" />
                    <p className="text-[18px] font-bold text-zinc-900">
                      {value}
                    </p>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wide font-medium">
                      {label}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Meta */}
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                Account Info
              </p>
              <div className="divide-y divide-zinc-50">
                {[
                  { label: "User ID", value: String(user.id) },
                  {
                    label: "Referral Code",
                    value: user.referral_code || "—",
                  },
                  {
                    label: "Joined",
                    value:
                      user.created_at_human ||
                      new Date(user.created_at).toLocaleDateString(),
                  },
                  {
                    label: "KYC Level",
                    value: user.kyc_level || "Level 0",
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between py-2.5 text-[13px]"
                  >
                    <span className="text-zinc-500">{label}</span>
                    <span className="font-medium text-zinc-800 font-mono text-[12px]">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SheetBody>
        <SheetFooter>
          {user.status === "active" ? (
            <Button
              variant="danger"
              size="sm"
              className="w-full rounded-xl gap-2"
              loading={actionLoading}
              onClick={() => handleStatusAction("suspended")}
            >
              <Ban size={14} />
              Suspend Account
            </Button>
          ) : user.status === "suspended" ? (
            <Button
              variant="secondary"
              size="sm"
              className="w-full rounded-xl gap-2"
              loading={actionLoading}
              onClick={() => handleStatusAction("active")}
            >
              <CheckCircle2 size={14} />
              Restore Account
            </Button>
          ) : null}

          {!user.isVerified && user.kyc_status === "pending" && (
            <Button
              variant="primary"
              size="sm"
              className="w-full rounded-xl gap-2"
              loading={actionLoading}
              onClick={() => {
                // navigate to KYC review
              }}
            >
              <ShieldCheck size={14} />
              Review KYC Documents
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminCustomersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filtered, setFiltered] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [stats, setStats] = useState<CustomerStats>({
    total: 0,
    verified: 0,
    pending_kyc: 0,
    suspended: 0,
    new_this_month: 0,
  });

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await HTTPS.get<AdminUser[]>("/users");
      const list = Array.isArray(data) ? data : [];
      setUsers(list);
      setFiltered(list);
      setStats({
        total: list.length,
        verified: list.filter((u) => u.isVerified).length,
        pending_kyc: list.filter(
          (u) => !u.isVerified && (u as any).kyc_status === "pending",
        ).length,
        suspended: list.filter(
          (u) => u.status === "suspended" || u.status === "banned",
        ).length,
        new_this_month: list.filter((u) => {
          const d = new Date(u.created_at);
          const now = new Date();
          return (
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear()
          );
        }).length,
      });
    } catch {
      // handle error
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchUsers();
  };

  const handleStatusChange = (
    id: string | number,
    status: AdminUser["status"],
  ) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)));
    setFiltered((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status } : u)),
    );
    if (selectedUser?.id === id) {
      setSelectedUser((prev) => (prev ? { ...prev, status } : prev));
    }
  };

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
              Customers
            </h1>
            <p className="text-zinc-500 text-sm mt-0.5">
              Manage all registered users and their accounts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="gap-1.5 rounded-xl"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                size={14}
                className={isRefreshing ? "animate-spin" : ""}
              />
              Refresh
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="gap-1.5 rounded-xl"
            >
              <Download size={14} />
              Export
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard
            icon={Users}
            label="Total Users"
            value={stats.total.toLocaleString()}
            color="blue"
          />
          <StatCard
            icon={UserCheck}
            label="Verified"
            value={stats.verified.toLocaleString()}
            sub={`${stats.total ? Math.round((stats.verified / stats.total) * 100) : 0}% of total`}
            color="emerald"
          />
          <StatCard
            icon={Clock}
            label="Pending KYC"
            value={stats.pending_kyc.toLocaleString()}
            color="amber"
          />
          <StatCard
            icon={UserX}
            label="Suspended"
            value={stats.suspended.toLocaleString()}
            color="rose"
          />
          <StatCard
            icon={TrendingUp}
            label="New This Month"
            value={stats.new_this_month.toLocaleString()}
            color="blue"
          />
        </div>

        {/* Filter */}
        <FilterComponent
          data={users}
          onResult={setFiltered}
          searchFields={["name", "email", "phone", "referral_code"]}
          searchPlaceholder="Search by name, email or phone…"
          quickGroup="status"
          groups={[
            {
              key: "status",
              label: "Status",
              options: [
                { value: "all", label: "All" },
                { value: "active", label: "Active" },
                { value: "pending", label: "Pending" },
                { value: "suspended", label: "Suspended" },
                { value: "banned", label: "Banned" },
              ],
              match: (item, v) => (item as AdminUser).status === v,
            },
            {
              key: "kyc",
              label: "KYC",
              options: [
                { value: "all", label: "All" },
                { value: "verified", label: "Verified" },
                { value: "pending", label: "Pending KYC" },
                { value: "unverified", label: "Unverified" },
              ],
              match: (item, v) => {
                const u = item as AdminUser;
                if (v === "verified") return u.isVerified;
                if (v === "pending")
                  return !u.isVerified && (u as any).kyc_status === "pending";
                if (v === "unverified")
                  return !u.isVerified && (u as any).kyc_status !== "pending";
                return true;
              },
            },
          ]}
        />

        {/* Table */}
        <Card variant="default">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Customers</CardTitle>
                <CardDescription className="mt-0.5">
                  {filtered.length} user{filtered.length !== 1 ? "s" : ""} found
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardDivider />
          <CardContent className="p-0">
            {loading ? (
              <div className="space-y-0">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 px-5 py-4 border-b border-zinc-50 animate-pulse"
                  >
                    <div className="w-8 h-8 rounded-full bg-zinc-100 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 bg-zinc-100 rounded w-1/3" />
                      <div className="h-3 bg-zinc-100 rounded w-1/4" />
                    </div>
                    <div className="h-5 bg-zinc-100 rounded w-16" />
                    <div className="h-5 bg-zinc-100 rounded w-16" />
                    <div className="h-8 bg-zinc-100 rounded w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>KYC</TableHead>
                      <TableHead>Wallet</TableHead>
                      <TableHead>Circles</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead align="right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableEmpty
                        colSpan={7}
                        message="No customers found matching your filters."
                      />
                    ) : (
                      filtered.map((user) => (
                        <TableRow key={user.id} hoverable>
                          {/* Customer */}
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <UserAvatar name={user.name} />
                              <div className="min-w-0">
                                <p className="text-[13px] font-semibold text-zinc-900 truncate max-w-[160px]">
                                  {user.name}
                                </p>
                                <p className="text-[11px] text-zinc-400 truncate max-w-[160px]">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          {/* Status */}
                          <TableCell>
                            <StatusBadge status={user.status} />
                          </TableCell>

                          {/* KYC */}
                          <TableCell>
                            <KycBadge
                              isVerified={user.isVerified}
                              kycStatus={(user as any).kyc_status}
                            />
                          </TableCell>

                          {/* Wallet */}
                          <TableCell mono>
                            <span className="text-[12px] text-zinc-700">
                              {user.balance
                                ? formatNaira(
                                    Number(user.balance.available_wallet) || 0,
                                  )
                                : "—"}
                            </span>
                          </TableCell>

                          {/* Circles */}
                          <TableCell muted>
                            {user.groups?.length ?? 0}
                          </TableCell>

                          {/* Joined */}
                          <TableCell muted>
                            <span className="text-[12px]">
                              {user.created_at_human ||
                                new Date(user.created_at).toLocaleDateString(
                                  "en-NG",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "2-digit",
                                  },
                                )}
                            </span>
                          </TableCell>

                          {/* Actions */}
                          <TableCell align="right">
                            <CustomerDrawer
                              user={user}
                              onStatusChange={handleStatusChange}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
