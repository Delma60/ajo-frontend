"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  Building2,
  Repeat2,
  Download,
  ExternalLink,
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
import { Filter } from "@/components/ui/filter";
import { HTTPS } from "@/lib/http";
import {
  ITransaction,
  TxStatus,
  TxType,
  Direction,
} from "@/lib/types/transaction.types";
import { formatNaira } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatAmount(amount: string | number) {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(n)) return "₦0.00";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(n);
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
}

// ─── Config maps ──────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  TxStatus,
  { icon: React.ElementType; color: string; bg: string; label: string }
> = {
  success: {
    icon: CheckCircle2,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    label: "Success",
  },
  pending: {
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-50",
    label: "Pending",
  },
  processing: {
    icon: RefreshCw,
    color: "text-blue-600",
    bg: "bg-blue-50",
    label: "Processing",
  },
  failed: {
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50",
    label: "Failed",
  },
  cancelled: {
    icon: AlertCircle,
    color: "text-zinc-400",
    bg: "bg-zinc-100",
    label: "Cancelled",
  },
};

const TYPE_CONFIG: Record<TxType, { icon: React.ElementType; label: string }> =
  {
    charge: { icon: CreditCard, label: "Payment" },
    payout: { icon: ArrowDownLeft, label: "Payout" },
    refund: { icon: Repeat2, label: "Refund" },
    topup: { icon: Wallet, label: "Top-up" },
    transfer: { icon: Building2, label: "Transfer" },
  };

// ─── Summary Stats ────────────────────────────────────────────────────────────

function SummaryStats({ transactions }: { transactions: ITransaction[] }) {
  const totalVolume = transactions
    .filter((t) => t.status === "success")
    .reduce((s, t) => s + parseFloat(String(t.amount)), 0);

  const totalIn = transactions
    .filter((t) => t.direction === "credit" && t.status === "success")
    .reduce((s, t) => s + parseFloat(String(t.amount)), 0);

  const totalOut = transactions
    .filter((t) => t.direction === "debit" && t.status === "success")
    .reduce((s, t) => s + parseFloat(String(t.amount)), 0);

  const pending = transactions.filter((t) => t.status === "pending").length;
  const failed = transactions.filter((t) => t.status === "failed").length;
  const successCount = transactions.filter(
    (t) => t.status === "success",
  ).length;
  const successRate =
    transactions.length > 0
      ? Math.round((successCount / transactions.length) * 100)
      : 0;

  const stats = [
    {
      label: "Total Volume",
      value: formatNaira(totalVolume),
      sub: `${transactions.length} transactions`,
      icon: TrendingUp,
      color: "emerald",
    },
    {
      label: "Money In",
      value: formatNaira(totalIn),
      sub: "Credits",
      icon: ArrowDownLeft,
      color: "blue",
    },
    {
      label: "Money Out",
      value: formatNaira(totalOut),
      sub: "Debits",
      icon: ArrowUpRight,
      color: "amber",
    },
    {
      label: "Success Rate",
      value: `${successRate}%`,
      sub: `${pending} pending · ${failed} failed`,
      icon: CheckCircle2,
      color: failed > 0 ? "rose" : "emerald",
    },
  ] as const;

  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ label, value, sub, icon: Icon, color }) => (
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

// ─── Table Row ────────────────────────────────────────────────────────────────

function TxTableRow({ tx }: { tx: ITransaction }) {
  const status = STATUS_CONFIG[tx.status] ?? STATUS_CONFIG.pending;
  const typeConf = TYPE_CONFIG[tx.type] ?? TYPE_CONFIG.charge;
  const isCredit = tx.direction === "credit";
  const StatusIcon = status.icon;
  const TypeIcon = typeConf.icon;

  return (
    <TableRow hoverable>
      {/* Reference + Label */}
      <TableCell>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-zinc-900 truncate max-w-[180px]">
            {tx.label || tx.short_label || typeConf.label}
          </p>
          {tx.reference && (
            <p className="text-[11px] text-zinc-400 font-mono truncate max-w-[180px] mt-0.5">
              {tx.reference}
            </p>
          )}
        </div>
      </TableCell>

      {/* User */}
      <TableCell>
        {(tx.user as any)?.name ? (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-bold text-zinc-600 shrink-0">
              {((tx.user as any).name || "?").slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-zinc-800 truncate max-w-[120px]">
                {(tx.user as any).name}
              </p>
              <p className="text-[11px] text-zinc-400 truncate max-w-[120px]">
                {(tx.user as any).email ?? ""}
              </p>
            </div>
          </div>
        ) : (
          <span className="text-[12px] text-zinc-400">System</span>
        )}
      </TableCell>

      {/* Type */}
      <TableCell>
        <span
          className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-full ${isCredit ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-600"}`}
        >
          <TypeIcon size={11} />
          {typeConf.label}
        </span>
      </TableCell>

      {/* Amount */}
      <TableCell>
        <div>
          <p
            className={`text-[13px] font-bold ${isCredit ? "text-emerald-700" : "text-zinc-800"}`}
          >
            {isCredit ? "+" : "-"}
            {formatAmount(tx.amount)}
          </p>
          {parseFloat(String(tx.fee ?? 0)) > 0 && (
            <p className="text-[11px] text-zinc-400">
              fee {formatAmount(tx.fee)}
            </p>
          )}
        </div>
      </TableCell>

      {/* Status */}
      <TableCell>
        <span
          className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}
        >
          <StatusIcon size={10} />
          {status.label}
        </span>
      </TableCell>

      {/* Group */}
      <TableCell muted>
        {(tx.group as any)?.name ? (
          <span className="text-[12px] text-zinc-600 truncate max-w-[100px] block">
            {(tx.group as any).name}
          </span>
        ) : (
          <span className="text-[11px] text-zinc-300">—</span>
        )}
      </TableCell>

      {/* Date */}
      <TableCell muted>
        <div>
          <p className="text-[12px]">{formatDate(tx.created_at)}</p>
          <p className="text-[11px] text-zinc-400">
            {formatTime(tx.created_at)}
          </p>
        </div>
      </TableCell>

      {/* Action */}
      <TableCell align="right">
        <Link href={`/admin/transactions/${tx.id}`}>
          <button className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-emerald-700 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-emerald-50">
            <ExternalLink size={12} />
            View
          </button>
        </Link>
      </TableCell>
    </TableRow>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: 8 }).map((_, j) => (
            <TableCell key={j}>
              <div
                className="h-4 bg-zinc-100 rounded animate-pulse"
                style={{ width: `${40 + Math.random() * 40}%` }}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const PER_PAGE = 20;

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [filtered, setFiltered] = useState<ITransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);

  const fetchTransactions = async () => {
    try {
      // Uses the recent-transactions admin endpoint; replace with /admin/transactions for full list
      const { data } = await HTTPS.get<ITransaction[]>(
        "/admin/transactions/recent",
      );
      const list = Array.isArray(data) ? data : [];
      setTransactions(list);
      setFiltered(list);
    } catch {
      // handle
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchTransactions();
  };

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

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
              Transactions
            </h1>
            <p className="text-zinc-500 text-sm mt-0.5">
              Platform-wide transaction ledger · {transactions.length} records
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
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats */}
        {!loading && <SummaryStats transactions={transactions} />}

        {/* Filter */}
        <Filter
          data={transactions}
          onResult={(result) => {
            setFiltered(result);
            setPage(1);
          }}
          searchFields={["label", "short_label", "reference"]}
          searchPlaceholder="Search by label, reference or user…"
          quickGroup="status"
          groups={[
            {
              key: "status",
              label: "Status",
              options: [
                { value: "all", label: "All" },
                { value: "success", label: "Success" },
                { value: "pending", label: "Pending" },
                { value: "processing", label: "Processing" },
                { value: "failed", label: "Failed" },
                { value: "cancelled", label: "Cancelled" },
              ],
              match: (item, v) => (item as ITransaction).status === v,
            },
            {
              key: "type",
              label: "Type",
              options: [
                { value: "all", label: "All" },
                { value: "charge", label: "Payment" },
                { value: "payout", label: "Payout" },
                { value: "topup", label: "Top-up" },
                { value: "transfer", label: "Transfer" },
                { value: "refund", label: "Refund" },
              ],
              match: (item, v) => (item as ITransaction).type === v,
            },
            {
              key: "direction",
              label: "Direction",
              options: [
                { value: "all", label: "All" },
                { value: "credit", label: "Money In" },
                { value: "debit", label: "Money Out" },
              ],
              match: (item, v) => (item as ITransaction).direction === v,
            },
            {
              key: "_status",
              label: "Status (multi)",
              multi: true,
              options: [
                { value: "success", label: "Success" },
                { value: "pending", label: "Pending" },
                { value: "failed", label: "Failed" },
                { value: "cancelled", label: "Cancelled" },
              ],
              match: (item, selected) =>
                (selected as string[]).includes((item as ITransaction).status),
            },
          ]}
        />

        {/* Table */}
        <Card variant="default" className="overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Transactions</CardTitle>
              {!loading && (
                <span className="text-[12px] text-zinc-400">
                  {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                  {totalPages > 1 && ` · page ${page} of ${totalPages}`}
                </span>
              )}
            </div>
          </CardHeader>
          <CardDivider />
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Circle</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead align="right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableSkeleton />
                  ) : paginated.length === 0 ? (
                    <TableEmpty
                      colSpan={8}
                      message="No transactions match your filters."
                    />
                  ) : (
                    paginated.map((tx) => <TxTableRow key={tx.id} tx={tx} />)
                  )}
                </TableBody>
              </Table>
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
