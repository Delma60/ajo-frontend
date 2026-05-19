"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  Search,
  SlidersHorizontal,
  X,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Wallet,
  Building2,
  CreditCard,
  Repeat2,
  Gift,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardBadge,
  CardDivider,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HTTPS } from "@/lib/http";
import {
  ITransaction,
  TxStatus,
  TxType,
  Direction,
} from "@/lib/types/transaction.types";
import { formatNaira } from "@/lib/utils";
import { Filter } from "@/components/ui/filter";

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

function formatDate(dateStr: string, opts?: Intl.DateTimeFormatOptions) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(
    "en-NG",
    opts ?? { day: "numeric", month: "short", year: "numeric" },
  );
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
}

// Group transactions by date label
function groupByDate(
  txs: ITransaction[],
): { label: string; items: ITransaction[] }[] {
  const groups: Record<string, ITransaction[]> = {};
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  for (const tx of txs) {
    const d = new Date(tx.created_at);
    let label: string;
    if (d.toDateString() === today.toDateString()) label = "Today";
    else if (d.toDateString() === yesterday.toDateString()) label = "Yesterday";
    else
      label = formatDate(tx.created_at, {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    if (!groups[label]) groups[label] = [];
    groups[label].push(tx);
  }
  return Object.entries(groups).map(([label, items]) => ({ label, items }));
}

// ─── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  TxStatus,
  { icon: React.ElementType; color: string; bg: string; label: string }
> = {
  success: {
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    label: "Success",
  },
  pending: {
    icon: Clock,
    color: "text-amber-500",
    bg: "bg-amber-50",
    label: "Pending",
  },
  processing: {
    icon: RefreshCw,
    color: "text-blue-500",
    bg: "bg-blue-50",
    label: "Processing",
  },
  failed: {
    icon: XCircle,
    color: "text-red-500",
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

// ─── Summary Stats ─────────────────────────────────────────────────────────────

function SummaryStats({ transactions }: { transactions: ITransaction[] }) {
  const totalIn = transactions
    .filter((t) => t.direction === "credit" && t.status === "success")
    .reduce((s, t) => s + parseFloat(String(t.amount)), 0);

  const totalOut = transactions
    .filter((t) => t.direction === "debit" && t.status === "success")
    .reduce((s, t) => s + parseFloat(String(t.amount)), 0);

  const pending = transactions.filter((t) => t.status === "pending").length;

  return (
    <div className="grid grid-cols-3 gap-3">
      <Card variant="flat" className="px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1">
          Money In
        </p>
        <p className="text-[15px] font-bold text-emerald-700">
          {formatNaira(totalIn)}
        </p>
        <div className="flex items-center gap-1 mt-0.5">
          <TrendingUp size={10} className="text-emerald-500" />
          <p className="text-[11px] text-zinc-400">Credits</p>
        </div>
      </Card>
      <Card variant="flat" className="px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1">
          Money Out
        </p>
        <p className="text-[15px] font-bold text-zinc-700">
          {formatNaira(totalOut)}
        </p>
        <div className="flex items-center gap-1 mt-0.5">
          <TrendingDown size={10} className="text-zinc-400" />
          <p className="text-[11px] text-zinc-400">Debits</p>
        </div>
      </Card>
      <Card variant="flat" className="px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1">
          Pending
        </p>
        <p className="text-[15px] font-bold text-amber-600">{pending}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <Clock size={10} className="text-amber-400" />
          <p className="text-[11px] text-zinc-400">Awaiting</p>
        </div>
      </Card>
    </div>
  );
}

// ─── Transaction Row ───────────────────────────────────────────────────────────

function TxRow({ tx }: { tx: ITransaction }) {
  const status = STATUS_CONFIG[tx.status] ?? STATUS_CONFIG.pending;
  const typeConf = TYPE_CONFIG[tx.type] ?? TYPE_CONFIG.charge;
  const isCredit = tx.direction === "credit";
  const StatusIcon = status.icon;
  const TypeIcon = typeConf.icon;
  const amount = parseFloat(String(tx.amount));
  return (
    <Link href={`/transactions/${tx.id}`}>
      <div className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-50 transition-colors cursor-pointer group">
        {/* Icon */}
        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
            isCredit ? "bg-emerald-50" : "bg-zinc-50"
          }`}
        >
          <TypeIcon
            size={18}
            className={isCredit ? "text-emerald-600" : "text-zinc-500"}
          />
        </div>

        {/* Label + meta */}
        <div className="flex-1 min-w-0">
          <p className="text-[13.5px] font-semibold text-zinc-900 truncate">
            {tx.label || tx.short_label || typeConf.label}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-medium ${status.color}`}
            >
              <StatusIcon size={10} />
              {status.label}
            </span>
            <span className="text-zinc-300 text-[10px]">·</span>
            <span className="text-[11px] text-zinc-400">
              {formatTime(tx.created_at)}
            </span>
            {tx.reference && (
              <>
                <span className="text-zinc-300 text-[10px]">·</span>
                <span className="text-[11px] text-zinc-400 font-mono truncate max-w-[120px]">
                  {tx.reference}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Amount */}
        <div className="text-right shrink-0">
          <p
            className={`text-[14px] font-bold ${
              isCredit ? "text-emerald-700" : "text-zinc-800"
            }`}
          >
            {isCredit ? "+" : "-"}
            {formatAmount(amount)}
          </p>
          {parseFloat(String(tx.fee ?? 0)) > 0 && (
            <p className="text-[11px] text-zinc-400">
              fee {formatAmount(parseFloat(String(tx.fee)))}
            </p>
          )}
        </div>

        <ChevronRight
          size={15}
          className="text-zinc-300 group-hover:text-zinc-500 transition-colors shrink-0"
        />
      </div>
    </Link>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function TxSkeleton() {
  return (
    <div className="space-y-px">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-5 py-4 animate-pulse"
        >
          <div className="w-10 h-10 rounded-2xl bg-zinc-100 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-zinc-100 rounded w-1/2" />
            <div className="h-3 bg-zinc-100 rounded w-1/3" />
          </div>
          <div className="text-right space-y-1 shrink-0">
            <div className="h-4 bg-zinc-100 rounded w-20" />
            <div className="h-3 bg-zinc-100 rounded w-12 ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Filter bar types ──────────────────────────────────────────────────────────

type FilterType = TxType | "all";
type FilterStatus = TxStatus | "all";
type FilterDirection = Direction | "all";

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function TransactionHistoryPage() {
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtered, setFiltered] = useState<ITransaction[]>([]);
 

  useEffect(() => {
    let mounted = true;
    HTTPS.get<ITransaction[]>("/transactions")
      .then(({ data }) => {
        if (mounted) {
          const txs = Array.isArray(data) ? data : [];
          setTransactions(txs);
          setFiltered(txs);
        }
      })
      .catch(() => mounted && setError("Failed to load transactions."))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  return (
    <div className="min-h-full bg-zinc-50/40">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <div>
          <h1
            className="text-2xl font-bold text-zinc-900 tracking-tight"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Transactions
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            Your complete payment history
          </p>
        </div>

        {/* Summary */}
        {!loading && transactions.length > 0 && (
          <SummaryStats transactions={transactions} />
        )}

        {!loading && transactions.length > 0 && (
          <Filter
            data={transactions}
            onResult={setFiltered}
            searchFields={["label", "short_label", "reference"]}
            searchPlaceholder="Search by label or reference…"
            quickGroup="direction"
            groups={[
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
                key: "status",
                label: "Status",
                multi: true, // ← picks multiple statuses at once
                options: [
                  { value: "success", label: "Success" },
                  { value: "pending", label: "Pending" },
                  { value: "failed", label: "Failed" },
                ],
                match: (item, selected) =>
                  (selected as string[]).includes(
                    (item as ITransaction).status,
                  ),
              },
            ]}
          />
        )}

        {/* Transaction list */}
        {loading ? (
          <Card variant="default">
            <TxSkeleton />
          </Card>
        ) : error ? (
          <Card variant="default" className="py-12 text-center">
            <AlertCircle className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
            <p className="text-sm text-zinc-500">{error}</p>
            <Button
              size="sm"
              variant="secondary"
              className="mt-4 rounded-xl"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </Card>
        ) : filtered.length === 0 ? (
          <Card variant="default" className="py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-3">
              <Wallet className="w-5 h-5 text-zinc-400" />
            </div>
            <p className="text-sm font-medium text-zinc-600">
              No transactions found
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {grouped.map(({ label, items }) => (
              <div key={label}>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-2 px-1">
                  {label}
                </p>
                <Card
                  variant="default"
                  className="overflow-hidden divide-y divide-zinc-50"
                >
                  {items.map((tx) => (
                    <TxRow key={tx.id} tx={tx} />
                  ))}
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
