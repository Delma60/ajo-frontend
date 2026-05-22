"use client";

import React, { useState, useEffect } from "react";
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
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Users,
  TrendingUp,
  TrendingDown,
  Wallet,
  CircleDollarSign,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Download,
  RefreshCw,
  ArrowDownLeft,
  ArrowUpRight,
  Activity,
} from "lucide-react";
import { HTTPS } from "@/lib/http";
import { formatNaira } from "@/lib/utils";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ITransaction } from "@/lib/types/transaction.types";
import { IGroup } from "@/lib/types/group.types";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface RevenueBreakdownItem {
  type: string;
  amount: number;
  count: number;
}

interface ChartPoint {
  label: string;
  contributions: number;
  payouts: number;
}

interface UserGrowthPoint {
  label: string;
  users: number;
}

interface AdminMetrics {
  // Users
  total_users: number;
  new_users_this_month: number;
  verified_users: number;
  pending_kyc: number;
  suspended_users: number;
  user_growth_pct: number;

  // Circles
  active_circles: number;
  new_circles_this_month: number;
  avg_members_per_circle: number;
  avg_pool_size: number;

  // Financials
  payouts_mtd: number;
  payouts_change_pct: number;
  revenue_mtd: number;
  revenue_change_pct: number;
  revenue_breakdown: RevenueBreakdownItem[];

  // Volume chart
  volume_chart: ChartPoint[];
  volume_total: number;
  volume_tx_count: number;
  volume_avg_size: number;

  // User growth chart
  user_growth_chart: UserGrowthPoint[];

  // Circle health
  defaulter_rate: number;
  on_time_rate: number;
  completion_rate: number;
  avg_trust_score: number;
}

interface AlertItem {
  id: string;
  message: string;
  severity: "error" | "warning" | "info";
  created_at: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const REVENUE_COLORS = ["#4ade80", "#93c5fd", "#fcd34d"];

/** Maps backend transaction type strings to human-readable labels. */
const REVENUE_TYPE_LABELS: Record<string, string> = {
  charge: "Contribution fees",
  topup: "Top-up fees",
  payout: "Withdrawal fees",
  penalty: "Penalty income",
  transfer: "Transfer fees",
};

// Static alerts — replace with a real /admin/alerts endpoint when available.
const MOCK_ALERTS: AlertItem[] = [
  {
    id: "1",
    message:
      "3 circles have defaulters this cycle — penalty assessment pending",
    severity: "error",
    created_at: "5 min ago",
  },
  {
    id: "2",
    message: "Payout failure for group #1842 — insufficient platform balance",
    severity: "error",
    created_at: "14 min ago",
  },
  {
    id: "3",
    message: "28 pending KYC verifications older than 24 hrs",
    severity: "warning",
    created_at: "1 hr ago",
  },
  {
    id: "4",
    message: "Webhook delivery failure rate above 5% for Flutterwave",
    severity: "warning",
    created_at: "2 hrs ago",
  },
  {
    id: "5",
    message: "New app release v2.4.1 ready for Android distribution",
    severity: "info",
    created_at: "4 hrs ago",
  },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  trend,
  trendValue,
  iconColor = "emerald",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  trend?: "up" | "down";
  trendValue?: string;
  iconColor?: "emerald" | "amber" | "blue" | "rose";
}) {
  const colorMap: Record<string, string> = {
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
            className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${colorMap[iconColor]}`}
          >
            <Icon size={18} />
          </span>
          {trend && trendValue && (
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-semibold ${trend === "up" ? "text-emerald-700" : "text-rose-600"}`}
            >
              {trend === "up" ? (
                <TrendingUp size={12} />
              ) : (
                <TrendingDown size={12} />
              )}
              {trendValue}
            </span>
          )}
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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    success: "bg-emerald-50 text-emerald-700",
    pending: "bg-amber-50 text-amber-700",
    failed: "bg-rose-50 text-rose-700",
    active: "bg-emerald-50 text-emerald-700",
    paused: "bg-amber-50 text-amber-700",
    closed: "bg-zinc-100 text-zinc-500",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${map[status] ?? "bg-zinc-100 text-zinc-500"}`}
    >
      {status === "success" || status === "active" ? (
        <CheckCircle2 size={10} />
      ) : status === "pending" ? (
        <Clock size={10} />
      ) : (
        <XCircle size={10} />
      )}
      {status}
    </span>
  );
}

/**
 * HealthBar renders a labelled progress bar.
 *
 * `value`        — 0–100 percentage to fill the bar.
 * `displayValue` — optional override for the right-hand label (e.g. "4.8/5").
 *                  Falls back to `${value}%` when omitted.
 */
function HealthBar({
  label,
  value,
  color = "emerald",
  displayValue,
}: {
  label: string;
  value: number;
  color?: string;
  displayValue?: string;
}) {
  const barColor = color === "rose" ? "bg-rose-500" : "bg-emerald-500";
  const clamped = Math.min(Math.max(value, 0), 100);
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-zinc-50 last:border-0">
      <span className="text-[12px] text-zinc-500">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-20 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${barColor}`}
            style={{ width: `${clamped}%` }}
          />
        </div>
        <span className="text-[12px] font-semibold text-zinc-800 w-10 text-right">
          {displayValue ?? `${value}%`}
        </span>
      </div>
    </div>
  );
}

function AlertRow({ alert }: { alert: AlertItem }) {
  const dotColor =
    alert.severity === "error"
      ? "bg-rose-500"
      : alert.severity === "warning"
        ? "bg-amber-500"
        : "bg-zinc-400";

  return (
    <div className="flex items-start gap-3 px-4 py-3 border-b border-zinc-50 last:border-0 hover:bg-zinc-50 transition-colors">
      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${dotColor}`} />
      <div className="flex-1 min-w-0">
        <p className="text-[12px] text-zinc-800 leading-snug">
          {alert.message}
        </p>
        <p className="text-[11px] text-zinc-400 mt-0.5">{alert.created_at}</p>
      </div>
    </div>
  );
}

// ─── Volume chart custom tooltip ───────────────────────────────────────────────

function VolumeTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-zinc-200 rounded-xl shadow-sm px-3 py-2 text-[12px]">
      <p className="font-semibold text-zinc-700 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {formatNaira(p.value)}
        </p>
      ))}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [transactions, setTransactions] = useState<ITransaction[] | null>(null);
  const [circles, setCircles] = useState<IGroup[] | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[] | null>(null);
  const [volumeRange, setVolumeRange] = useState<"7d" | "30d" | "90d">("7d");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ── Data fetching ────────────────────────────────────────────────────────────

  async function fetchData(timeframe: string = volumeRange) {
    const [_metric, _transaction, _circleRes, _alertRes] = await Promise.all([
      HTTPS.get<AdminMetrics>(`/admin/metrics?timeframe=${timeframe}`).then(
        ({ data }) => data,
      ),
      HTTPS.get<ITransaction[]>("/admin/transactions/recent?num=4").then(
        ({ data }) => data,
      ),
      // GroupResource::collection wraps in {data:[...]};  handle both shapes.
      HTTPS.get("/admin/circles/top").then(({ data }) => data),
      HTTPS.get("/admin/system-alerts/summary").then(({ data }) => data ?? []),
    ]);

    setMetrics(_metric);
    setTransactions(_transaction as ITransaction[]);
    setCircles(_circleRes as IGroup[]);
    setAlerts(_alertRes as AlertItem[]);
  }

  // Re-fetch whenever the chart range toggle changes.
  useEffect(() => {
    fetchData(volumeRange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volumeRange]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData(volumeRange);
    setIsRefreshing(false);
  };

  // ── Derived values ───────────────────────────────────────────────────────────

  const urgentAlerts =
    alerts?.filter((a) => a.severity === "error").length ?? 0;

  // Fix: parenthesise the division before the || guard to avoid precedence bug.
  const verifiedPct = Math.round(
    (Number(metrics?.verified_users) / Number(metrics?.total_users) || 0) * 100,
  );

  // Scale avg_trust_score (0–5) to a 0–100 bar-fill percentage.
  const trustScorePct = Math.round(((metrics?.avg_trust_score ?? 0) / 5) * 100);

  // Build revenue breakdown with friendly labels and percentages.
  const revenueBreakdown = (() => {
    const items = metrics?.revenue_breakdown ?? [];
    const total = items.reduce((s, r) => s + r.amount, 0);
    return items.map((r, i) => ({
      name: REVENUE_TYPE_LABELS[r.type] ?? r.type,
      value: r.amount,
      pct: total > 0 ? Math.round((r.amount / total) * 100) : 0,
      color: REVENUE_COLORS[i % REVENUE_COLORS.length],
    }));
  })();

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-full bg-zinc-50/40">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1
              className="text-2xl font-bold text-zinc-900 tracking-tight"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Admin Dashboard
            </h1>
            <p className="text-zinc-500 text-sm mt-0.5">
              {new Date().toLocaleDateString("en-NG", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
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

        {/* ── Urgent alert banner ─────────────────────────────────────────────── */}
        {urgentAlerts > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl">
            <AlertTriangle size={16} className="text-rose-600 shrink-0" />
            <p className="text-sm text-rose-800 font-medium flex-1">
              {urgentAlerts} urgent alert{urgentAlerts > 1 ? "s" : ""} require
              your attention
            </p>
            <Button
              size="sm"
              variant="secondary"
              className="rounded-xl text-rose-700 bg-rose-100 hover:bg-rose-200 border-rose-200"
            >
              View alerts
            </Button>
          </div>
        )}

        {/* ── Metric cards ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={Users}
            label="Total users"
            value={metrics?.total_users?.toLocaleString() || "0"}
            sub={`+${metrics?.new_users_this_month ?? 0} this month`}
            trend="up"
            trendValue={`+${metrics?.new_users_this_month ?? 0}`}
            iconColor="blue"
          />
          <MetricCard
            icon={Activity}
            label="Active circles"
            value={metrics?.active_circles?.toLocaleString() || "0"}
            sub={`+${metrics?.new_circles_this_month ?? 0} this month`}
            trend="up"
            trendValue={`+${metrics?.new_circles_this_month ?? 0}`}
            iconColor="emerald"
          />
          <MetricCard
            icon={ArrowDownLeft}
            label="Payouts MTD"
            value={formatNaira(metrics?.payouts_mtd || 0)}
            trend={Number(metrics?.payouts_change_pct) >= 0 ? "up" : "down"}
            trendValue={`${Number(metrics?.payouts_change_pct) > 0 ? "+" : ""}${metrics?.payouts_change_pct}%`}
            iconColor="amber"
          />
          <MetricCard
            icon={CircleDollarSign}
            label="Revenue MTD"
            value={formatNaira(metrics?.revenue_mtd || 0)}
            trend={Number(metrics?.revenue_change_pct) >= 0 ? "up" : "down"}
            trendValue={`${Number(metrics?.revenue_change_pct) > 0 ? "+" : ""}${metrics?.revenue_change_pct}%`}
            iconColor={
              Number(metrics?.revenue_change_pct) >= 0 ? "emerald" : "rose"
            }
          />
        </div>

        {/* ── Main grid: volume chart + alerts ────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Volume chart */}
          <div className="lg:col-span-2">
            <Card variant="default" className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Transaction volume</CardTitle>
                    <CardDescription className="mt-0.5">
                      Contributions vs payouts over time
                    </CardDescription>
                  </div>
                  {/* Range toggle — triggers re-fetch via useEffect */}
                  <div className="flex items-center gap-1 bg-zinc-100 rounded-xl p-1">
                    {(["7d", "30d", "90d"] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setVolumeRange(r)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                          volumeRange === r
                            ? "bg-white shadow-sm text-zinc-900"
                            : "text-zinc-500 hover:text-zinc-700"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {metrics === null ? (
                  <p>
                    <span className="text-[12px] text-zinc-500 text-center py-4 block">
                      Loading volume data...
                    </span>
                  </p>
                ) : metrics.volume_chart && metrics.volume_chart.length > 0 ? (
                  <>
                    <div className="flex gap-6 px-5 pb-4">
                      {[
                        {
                          label: "Total volume",
                          value: formatNaira(metrics?.volume_total ?? 0),
                        },
                        {
                          label: "Transactions",
                          value: (
                            metrics?.volume_tx_count ?? 0
                          ).toLocaleString(),
                        },
                        {
                          label: "Avg. size",
                          value: formatNaira(metrics?.volume_avg_size ?? 0),
                        },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p className="text-[11px] text-zinc-400">{label}</p>
                          <p
                            className="text-lg font-semibold text-zinc-900"
                            style={{ fontFamily: "Georgia, serif" }}
                          >
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="px-4 pb-4">
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={metrics?.volume_chart ?? []} barGap={3}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f4f4f5"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="label"
                            tick={{ fontSize: 10, fill: "#a1a1aa" }}
                            axisLine={false}
                            tickLine={false}
                            // Avoid label overcrowding for 30d/90d ranges
                            interval={
                              volumeRange === "7d"
                                ? 0
                                : volumeRange === "30d"
                                  ? 4
                                  : 13
                            }
                          />
                          <YAxis
                            tick={{ fontSize: 10, fill: "#a1a1aa" }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v) =>
                              formatNaira(v, { compact: true })
                            }
                          />
                          <Tooltip content={<VolumeTooltip />} />
                          <Bar
                            dataKey="contributions"
                            name="Contributions"
                            fill="#4ade80"
                            radius={[3, 3, 0, 0]}
                          />
                          <Bar
                            dataKey="payouts"
                            name="Payouts"
                            fill="#93c5fd"
                            radius={[3, 3, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>

                      <div className="flex gap-4 mt-3">
                        {[
                          { color: "#4ade80", label: "Contributions" },
                          { color: "#93c5fd", label: "Payouts" },
                        ].map(({ color, label }) => (
                          <span
                            key={label}
                            className="flex items-center gap-1.5 text-[11px] text-zinc-500"
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-sm inline-block"
                              style={{ background: color }}
                            />
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <p>
                    <span className="text-[12px] text-zinc-500 text-center py-4 block">
                      No volume data to display
                    </span>
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Alerts panel */}
          <Card variant="default">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Alerts</CardTitle>
                {urgentAlerts > 0 && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">
                    {urgentAlerts} urgent
                  </span>
                )}
              </div>
            </CardHeader>
            <CardDivider />
            <CardContent className="px-0 pt-0">
              {alerts === null ? (
                <p className="text-[12px] text-zinc-500 text-center py-4">
                  Loading alerts...
                </p>
              ) : alerts?.length <= 0 ? (
                <p className="text-[12px] text-zinc-500 text-center py-4">
                  No alerts to display
                </p>
              ) : (
                alerts?.map((alert) => (
                  <AlertRow key={alert.id} alert={alert} />
                ))
              )}
            </CardContent>
            <div className="flex items-center justify-center gap-1 py-2.5 border-t border-zinc-100 text-[11px] text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 cursor-pointer transition-colors rounded-b-xl">
              <ChevronRight size={12} />
              View all alerts
            </div>
          </Card>
        </div>

        {/* ── Second grid: transactions + circle health + user growth ──────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent transactions */}
          <Card variant="default">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent transactions</CardTitle>
                <Link href="/admin/transactions">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-[11px] gap-1"
                  >
                    View all <ChevronRight size={11} />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardDivider />
            <CardContent className="px-0 pt-0">
              {transactions === null ? (
                <p className="text-[12px] text-zinc-500 text-center py-4">
                  Loading transactions...
                </p>
              ) : transactions?.length <= 0 ? (
                <p className="text-[12px] text-zinc-500 text-center py-4">
                  No transactions to display
                </p>
              ) : (
                transactions?.map((tx) => {
                  const isCredit = tx?.direction === "credit";
                  const iconBg =
                    tx?.status === "pending"
                      ? "bg-amber-50 text-amber-600"
                      : isCredit
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-zinc-100 text-zinc-500";
                  const Icon =
                    tx?.status === "pending"
                      ? Clock
                      : isCredit
                        ? ArrowDownLeft
                        : ArrowUpRight;
                  return (
                    <div
                      key={tx?.id}
                      className="flex items-center gap-3 px-4 py-3 border-b border-zinc-50 last:border-0 hover:bg-zinc-50 transition-colors"
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}
                      >
                        <Icon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-zinc-800 truncate">
                          {tx?.label}
                        </p>
                        {/* Backend now returns tx.user as a nested object */}
                        <p className="text-[11px] text-zinc-400">
                          {tx?.user?.name ?? "System"} · {tx?.reference}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p
                          className={`text-[12px] font-semibold ${isCredit ? "text-emerald-700" : "text-zinc-800"}`}
                        >
                          {isCredit ? "+" : "-"}
                          {formatNaira(Number(tx?.amount))}
                        </p>
                        <StatusBadge status={tx?.status} />
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Circle health */}
          <Card variant="default" className="h-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Circle health</CardTitle>
                <CardBadge color="gray">
                  {metrics?.active_circles?.toLocaleString()} active
                </CardBadge>
              </div>
            </CardHeader>
            <CardDivider />
            <CardContent className="pt-3 h-[100%]">
              <HealthBar
                label="On-time rate"
                value={metrics?.on_time_rate ?? 0}
              />
              <HealthBar
                label="Defaulter rate"
                value={metrics?.defaulter_rate ?? 0}
                color="rose"
              />
              <HealthBar
                label="Completion rate"
                value={metrics?.completion_rate ?? 0}
              />
              {/* avg_trust_score is 0–5; scale to 0–100 for bar, show original for label */}
              <HealthBar
                label="Avg trust score"
                value={trustScorePct}
                displayValue={`${metrics?.avg_trust_score ?? 0}/5`}
              />
              <div className="flex items-center justify-between py-2.5 border-b border-zinc-50">
                <span className="text-[12px] text-zinc-500">
                  Avg members / circle
                </span>
                <span className="text-[12px] font-semibold text-zinc-800">
                  {metrics?.avg_members_per_circle ?? "—"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-[12px] text-zinc-500">Avg pool size</span>
                <span className="text-[12px] font-semibold text-zinc-800">
                  {metrics ? formatNaira(metrics.avg_pool_size) : "—"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* User acquisition */}
          <Card className="h-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>User acquisition</CardTitle>
                {metrics?.user_growth_pct !== undefined && (
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      metrics.user_growth_pct >= 0
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {metrics.user_growth_pct >= 0 ? (
                      <TrendingUp size={10} />
                    ) : (
                      <TrendingDown size={10} />
                    )}
                    {metrics.user_growth_pct >= 0 ? "+" : ""}
                    {metrics.user_growth_pct}%
                  </span>
                )}
              </div>
            </CardHeader>
            <div className="px-4 pb-2">
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={metrics?.user_growth_chart ?? []}>
                  <defs>
                    <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="#4ade80"
                        stopOpacity={0.15}
                      />
                      <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f4f4f5"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: "#a1a1aa" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip
                    formatter={(v: number) => [
                      v?.toLocaleString(),
                      "New users",
                    ]}
                    contentStyle={{
                      fontSize: 11,
                      borderRadius: 8,
                      border: "0.5px solid #e4e4e7",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="#4ade80"
                    strokeWidth={1.5}
                    fill="url(#userGrad)"
                    dot={{ r: 2, fill: "#4ade80" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <CardDivider />
            <CardContent className="pt-3 space-y-2">
              <div className="flex justify-between text-[12px]">
                <span className="text-zinc-500">Verified (KYC)</span>
                <span className="font-semibold text-emerald-700">
                  {metrics?.verified_users?.toLocaleString()} · {verifiedPct}%
                </span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-zinc-500">Pending KYC</span>
                <span className="font-semibold text-amber-700">
                  {metrics?.pending_kyc ?? 0}
                </span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-zinc-500">Suspended</span>
                <span className="font-semibold text-rose-700">
                  {metrics?.suspended_users ?? 0}
                </span>
              </div>
              <Link href="/admin/customers?filter=pending_kyc">
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full rounded-xl mt-2 text-[11px] gap-1"
                >
                  <ShieldCheck size={12} />
                  Review pending KYC ({metrics?.pending_kyc ?? 0})
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* ── Bottom grid: top circles + revenue breakdown ─────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top circles table */}
          <div className="lg:col-span-2">
            <Card variant="default">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Top circles by pool size</CardTitle>
                    <CardDescription className="mt-0.5">
                      Sorted by total saved amount
                    </CardDescription>
                  </div>
                  <Link href="/admin/groups">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-[11px] gap-1"
                    >
                      View all <ChevronRight size={11} />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Circle</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Payout</TableHead>
                      <TableHead>Pool size</TableHead>
                      <TableHead align="right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {circles?.map((circle) => (
                      <TableRow key={circle?.id} hoverable>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                              {circle?.name.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="font-medium text-[12px] text-zinc-800 truncate max-w-[180px]">
                              {circle?.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell muted>{circle?.membersCount}</TableCell>
                        <TableCell muted className="capitalize">
                          {circle?.frequency}
                        </TableCell>
                        <TableCell muted className="capitalize">
                          {circle?.payout_order}
                        </TableCell>
                        <TableCell mono>{formatNaira(circle?.saved)}</TableCell>
                        <TableCell align="right">
                          <StatusBadge status={circle?.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Revenue breakdown — from API */}
          <Card variant="default">
            <CardHeader>
              <CardTitle>Revenue breakdown</CardTitle>
              <CardDescription>
                MTD · {formatNaira(metrics?.revenue_mtd ?? 0)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {revenueBreakdown.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={revenueBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={44}
                        outerRadius={70}
                        dataKey="value"
                        paddingAngle={3}
                      >
                        {revenueBreakdown.map((entry, i) => (
                          <Cell key={i} fill={entry.color} strokeWidth={0} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v: number) => [formatNaira(v), ""]}
                        contentStyle={{
                          fontSize: 11,
                          borderRadius: 8,
                          border: "0.5px solid #e4e4e7",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="space-y-2.5 mt-2">
                    {revenueBreakdown.map(({ name, value, pct, color }) => (
                      <div
                        key={name}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-sm shrink-0"
                            style={{ background: color }}
                          />
                          <span className="text-[12px] text-zinc-600">
                            {name}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[12px] font-semibold text-zinc-800">
                            {formatNaira(value)}
                          </span>
                          <span className="text-[11px] text-zinc-400 ml-1">
                            · {pct}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-[12px] text-zinc-400 text-center py-8">
                  No fee revenue this month yet
                </p>
              )}
            </CardContent>

            <CardDivider />

            {/* Quick admin actions */}
            <CardContent className="pt-4">
              <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-3">
                Quick actions
              </p>
              <div className="space-y-2">
                <Link href="/admin/customers?filter=pending_kyc">
                  <button className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 transition-colors text-left">
                    <ShieldCheck size={13} className="text-amber-600" />
                    Review {metrics?.pending_kyc ?? 0} pending KYC
                  </button>
                </Link>
                <Link href="/admin/settlements">
                  <button className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-medium text-zinc-700 bg-zinc-50 hover:bg-zinc-100 transition-colors text-left">
                    <Wallet size={13} className="text-zinc-500" />
                    View pending settlements
                  </button>
                </Link>
                <Link href="/admin/groups?filter=defaulters">
                  <button className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-medium text-rose-800 bg-rose-50 hover:bg-rose-100 transition-colors text-left">
                    <AlertTriangle size={13} className="text-rose-600" />
                    Assess defaulter penalties
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
