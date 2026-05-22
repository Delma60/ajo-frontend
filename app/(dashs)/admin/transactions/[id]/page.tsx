"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  RefreshCw,
  Copy,
  ExternalLink,
  CreditCard,
  Wallet,
  Building2,
  Repeat2,
  ArrowDownLeft,
  ArrowUpRight,
  Users,
  Receipt,
  User,
  ShieldCheck,
  Ban,
  RotateCcw,
  ChevronDown,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDivider,
  CardBadge,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HTTPS } from "@/lib/http";
import { ITransaction, TxStatus, TxType } from "@/lib/types/transaction.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatAmount(amount: string | number): string {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(n)) return "₦0.00";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(n);
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleString("en-NG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function useCopy(text: string) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return { copied, copy };
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  TxStatus,
  {
    icon: React.ElementType;
    color: string;
    bg: string;
    ring: string;
    label: string;
    desc: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    ring: "ring-emerald-200",
    label: "Successful",
    desc: "This transaction was completed successfully.",
  },
  pending: {
    icon: Clock,
    color: "text-amber-500",
    bg: "bg-amber-50",
    ring: "ring-amber-200",
    label: "Pending",
    desc: "This transaction is awaiting confirmation.",
  },
  processing: {
    icon: RefreshCw,
    color: "text-blue-500",
    bg: "bg-blue-50",
    ring: "ring-blue-200",
    label: "Processing",
    desc: "This transaction is currently being processed.",
  },
  failed: {
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-50",
    ring: "ring-red-200",
    label: "Failed",
    desc: "This transaction could not be completed.",
  },
  cancelled: {
    icon: AlertCircle,
    color: "text-zinc-400",
    bg: "bg-zinc-100",
    ring: "ring-zinc-200",
    label: "Cancelled",
    desc: "This transaction was cancelled.",
  },
};

const TYPE_CONFIG: Record<TxType, { icon: React.ElementType; label: string }> =
  {
    charge: { icon: CreditCard, label: "Payment" },
    payout: { icon: ArrowDownLeft, label: "Payout" },
    refund: { icon: Repeat2, label: "Refund" },
    topup: { icon: Wallet, label: "Wallet Top-up" },
    transfer: { icon: Building2, label: "Bank Transfer" },
  };

// ─── Sub-components ───────────────────────────────────────────────────────────

function CopyField({ label, value }: { label: string; value: string }) {
  const { copied, copy } = useCopy(value);
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-1">
        {label}
      </p>
      <div className="flex items-center gap-2 bg-zinc-50 rounded-lg px-3 py-2 border border-zinc-100">
        <p className="text-[12px] font-mono text-zinc-700 truncate flex-1">
          {value}
        </p>
        <button
          onClick={copy}
          className="shrink-0 text-zinc-400 hover:text-zinc-700 transition-colors p-0.5"
          title="Copy"
        >
          {copied ? (
            <CheckCircle2 size={13} className="text-emerald-600" />
          ) : (
            <Copy size={13} />
          )}
        </button>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  muted,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  muted?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-zinc-50 last:border-0">
      <p className="text-[13px] text-zinc-500 shrink-0">{label}</p>
      <p
        className={`text-[13px] text-right ${
          muted ? "text-zinc-400" : "font-medium text-zinc-900"
        } ${mono ? "font-mono text-[12px]" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

// ─── Admin Actions ────────────────────────────────────────────────────────────

function AdminActions({
  tx,
  onStatusChange,
}: {
  tx: ITransaction;
  onStatusChange: (status: TxStatus) => void;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleAction = async (action: string, newStatus?: TxStatus) => {
    setLoading(action);
    try {
      if (action === "retry") {
        // POST /admin/transactions/{id}/retry
        await HTTPS.post(`/admin/transactions/${tx.id}/retry`);
        onStatusChange("processing");
      } else if (action === "mark_success") {
        await HTTPS.post(`/admin/transactions/${tx.id}/mark-success`);
        onStatusChange("success");
      } else if (action === "mark_failed") {
        await HTTPS.post(`/admin/transactions/${tx.id}/mark-failed`);
        onStatusChange("failed");
      } else if (action === "refund") {
        await HTTPS.post(`/admin/transactions/${tx.id}/refund`);
        onStatusChange("cancelled");
      }
    } catch {
      // handle error
    } finally {
      setLoading(null);
      setMenuOpen(false);
    }
  };

  return (
    <Card variant="tinted" className="border-zinc-200 bg-zinc-50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck size={15} className="text-zinc-500" />
          <CardTitle className="text-zinc-700">Admin Actions</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0 grid grid-cols-1 md:grid-cols-2 gap-3">
        {tx.status === "failed" && (
          <Button
            variant="secondary"
            size="sm"
            className="rounded-xl gap-2 justify-start p-3"
            loading={loading === "retry"}
            onClick={() => handleAction("retry")}
          >
            <RotateCcw size={13} />
            Retry Transaction
          </Button>
        )}

        {(tx.status === "pending" || tx.status === "processing") && (
          <>
            <Button
              variant="secondary"
              size="sm"
              className="rounded-xl gap-2 justify-start bg-emerald-50 text-emerald-800 hover:bg-emerald-100 p-3"
              loading={loading === "mark_success"}
              onClick={() => handleAction("mark_success")}
            >
              <CheckCircle2 size={13} />
              Mark Successful
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="rounded-xl gap-2 justify-start bg-red-50 text-red-700 hover:bg-red-100 p-3"
              loading={loading === "mark_failed"}
              onClick={() => handleAction("mark_failed")}
            >
              <XCircle size={13} />
              Mark Failed
            </Button>
          </>
        )}

        {tx.status === "success" && tx.type !== "refund" && (
          <Button
            variant="secondary"
            size="sm"
            className="rounded-xl gap-2 justify-start bg-amber-50 p-3 text-amber-800 hover:bg-amber-100"
            loading={loading === "refund"}
            onClick={() => handleAction("refund")}
          >
            <Repeat2 size={13} />
            Initiate Refund
          </Button>
        )}

        {/* Copy receipt always available */}
        <Button
          variant="ghost"
          size="sm"
          className="rounded-xl gap-2 justify-start text-zinc-600 p-3"
          onClick={() => {
            const text = [
              `Transaction: ${tx.label || tx.short_label || tx.type}`,
              `Amount: ${formatAmount(tx.amount)}`,
              `Reference: ${tx.reference || "—"}`,
              `Status: ${tx.status}`,
              `Date: ${formatDateTime(tx.created_at)}`,
              `User: ${(tx.user as any)?.name ?? "—"}`,
            ].join("\n");
            navigator.clipboard.writeText(text);
          }}
        >
          <Copy size={13} />
          Copy Receipt
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function AmountHero({
  tx,
  statusConf,
}: {
  tx: ITransaction;
  statusConf: (typeof STATUS_CONFIG)[TxStatus];
}) {
  const isCredit = tx.direction === "credit";
  const StatusIcon = statusConf.icon;
  const typeConf = TYPE_CONFIG[tx.type] ?? TYPE_CONFIG.charge;
  const TypeIcon = typeConf.icon;
  const amount = parseFloat(String(tx.amount));

  return (
    <div
      className="relative rounded-2xl overflow-hidden px-6 pt-8 pb-7"
      style={{
        background: isCredit
          ? "linear-gradient(135deg, #064e3b 0%, #065f46 55%, #047857 100%)"
          : "linear-gradient(135deg, #18181b 0%, #27272a 60%, #3f3f46 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-10"
        style={{
          background: "radial-gradient(circle, #6ee7b7 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        {/* Amount side */}
        <div className="space-y-4">
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center ring-4 ${statusConf.ring} ${statusConf.bg}`}
          >
            <StatusIcon size={24} className={statusConf.color} />
          </div>

          <div>
            <p className="text-emerald-300/60 text-[11px] font-semibold uppercase tracking-widest mb-1">
              {isCredit ? "Money Received" : "Money Sent"}
            </p>
            <p
              className="text-4xl font-bold text-white"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {isCredit ? "+" : "-"}
              {formatAmount(amount)}
            </p>
            {parseFloat(String(tx.fee ?? 0)) > 0 && (
              <p className="text-emerald-300/50 text-[12px] mt-1">
                + {formatAmount(parseFloat(String(tx.fee)))} fee
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-full ${statusConf.bg} ${statusConf.color}`}
            >
              <StatusIcon size={11} />
              {statusConf.label}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[12px] text-emerald-200/60 bg-white/10 rounded-full px-3 py-1.5">
              <TypeIcon size={11} />
              {typeConf.label}
            </span>
          </div>
        </div>

        {/* User side */}
        {(tx.user as any)?.name && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-4 min-w-[200px] shrink-0">
            <p className="text-emerald-300/60 text-[10px] font-semibold uppercase tracking-widest mb-3">
              Customer
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-[13px] font-bold text-white">
                {((tx.user as any).name || "?").slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-white truncate">
                  {(tx.user as any).name}
                </p>
                {(tx.user as any).email && (
                  <p className="text-[11px] text-emerald-300/50 truncate">
                    {(tx.user as any).email}
                  </p>
                )}
              </div>
            </div>
            <Link
              href={`/admin/customers`}
              className="mt-3 flex items-center gap-1 text-[11px] text-emerald-300/60 hover:text-emerald-200 transition-colors"
            >
              <ExternalLink size={10} />
              View profile
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-5 bg-zinc-100 rounded w-28" />
      <div className="h-40 bg-zinc-100 rounded-2xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          {[80, 120, 100].map((h, i) => (
            <div
              key={i}
              className="bg-zinc-100 rounded-2xl"
              style={{ height: h }}
            />
          ))}
        </div>
        <div className="space-y-4">
          {[100, 120].map((h, i) => (
            <div
              key={i}
              className="bg-zinc-100 rounded-2xl"
              style={{ height: h }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminTransactionDetailPage() {
  const params = useParams<{ id: string }>();
  const [tx, setTx] = useState<ITransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metaOpen, setMetaOpen] = useState(false);

  useEffect(() => {
    HTTPS.get<ITransaction>(`/transactions/${params.id}`)
      .then(({ data }) => {
        if (data) setTx(data);
        else setError("Transaction not found.");
      })
      .catch(() => setError("Could not load transaction."))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleStatusChange = (status: TxStatus) => {
    if (!tx) return;
    setTx({ ...tx, status });
  };

  if (loading) {
    return (
      <div className="min-h-full bg-zinc-50/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <DetailSkeleton />
        </div>
      </div>
    );
  }

  if (error || !tx) {
    return (
      <div className="min-h-full bg-zinc-50/40 flex items-center justify-center p-6">
        <Card
          variant="default"
          className="max-w-md w-full text-center py-10 px-6"
        >
          <AlertCircle className="w-10 h-10 text-zinc-300 mx-auto mb-4" />
          <p className="text-sm font-medium text-zinc-600">
            {error ?? "Transaction not found"}
          </p>
          <Link href="/admin/transactions">
            <Button size="sm" variant="secondary" className="mt-4 rounded-xl">
              Back to transactions
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const statusConf = STATUS_CONFIG[tx.status] ?? STATUS_CONFIG.pending;
  const net = parseFloat(String(tx.net_amount ?? tx.amount));
  const hasMeta = tx.meta && Object.keys(tx.meta).length > 0;

  // Filter out webhook payload keys from visible meta
  const visibleMeta = hasMeta
    ? Object.entries(tx.meta!).filter(
        ([k]) =>
          !["webhook_payload", "provider_result", "provider_payload"].includes(
            k,
          ),
      )
    : [];

  return (
    <div className="min-h-full bg-zinc-50/40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Back */}
        <Link
          href="/admin/transactions"
          className="inline-flex items-center gap-1.5 text-[13px] text-zinc-400 hover:text-zinc-700 transition-colors"
        >
          <ArrowLeft size={13} />
          All Transactions
        </Link>

        {/* Hero */}
        <AmountHero tx={tx} statusConf={statusConf} />

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          {/* Left: core details */}
          <div className="lg:col-span-2 space-y-5">
            {/* Transaction details */}
            <Card variant="default">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Receipt size={15} className="text-zinc-400" />
                  Transaction Details
                </CardTitle>
              </CardHeader>
              <CardDivider />
              <CardContent className="pt-2">
                <DetailRow
                  label="Label"
                  value={tx.label || tx.short_label || "—"}
                />
                <DetailRow
                  label="Date & Time"
                  value={formatDateTime(tx.created_at)}
                />
                <DetailRow
                  label="Direction"
                  value={
                    <span
                      className={`inline-flex items-center gap-1 font-semibold ${tx.direction === "credit" ? "text-emerald-700" : "text-zinc-700"}`}
                    >
                      {tx.direction === "credit" ? (
                        <ArrowDownLeft size={13} />
                      ) : (
                        <ArrowUpRight size={13} />
                      )}
                      {tx.direction === "credit" ? "Incoming" : "Outgoing"}
                    </span>
                  }
                />
                <DetailRow label="Currency" value={tx.currency || "NGN"} />
                <DetailRow
                  label="Gross Amount"
                  value={formatAmount(tx.amount)}
                />
                {parseFloat(String(tx.fee ?? 0)) > 0 && (
                  <DetailRow label="Fee" value={formatAmount(tx.fee)} muted />
                )}
                <DetailRow
                  label="Net Amount"
                  value={
                    <span className="font-bold text-base">
                      {formatAmount(net)}
                    </span>
                  }
                />
                {tx.method && (
                  <DetailRow
                    label="Payment Method"
                    value={tx.method
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                  />
                )}
                {tx.provider && (
                  <DetailRow
                    label="Provider"
                    value={tx.provider.replace(/\b\w/g, (c) => c.toUpperCase())}
                  />
                )}
              </CardContent>
            </Card>

            {/* Reference info */}
            <Card variant="default">
              <CardHeader className="pb-3">
                <CardTitle>Reference Information</CardTitle>
              </CardHeader>
              <CardDivider />
              <CardContent className="pt-4 space-y-4">
                {tx.uuid && (
                  <CopyField label="Transaction UUID" value={tx.uuid} />
                )}
                {tx.reference && (
                  <CopyField label="Reference" value={tx.reference} />
                )}
                {tx.provider_reference && (
                  <CopyField
                    label="Provider Reference"
                    value={String(tx.provider_reference)}
                  />
                )}
                {(tx as any).idempotency_key && (
                  <CopyField
                    label="Idempotency Key"
                    value={(tx as any).idempotency_key}
                  />
                )}
              </CardContent>
            </Card>

            {/* Meta / extra info */}
            {visibleMeta.length > 0 && (
              <Card variant="flat">
                <button
                  onClick={() => setMetaOpen(!metaOpen)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-50 transition-colors rounded-2xl"
                >
                  <p className="text-[13px] font-semibold text-zinc-700">
                    Additional Metadata
                  </p>
                  <ChevronDown
                    size={14}
                    className={`text-zinc-400 transition-transform duration-200 ${metaOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {metaOpen && (
                  <CardContent className="pt-0 space-y-2">
                    {visibleMeta.slice(0, 10).map(([key, val]) => (
                      <div
                        key={key}
                        className="flex justify-between text-[12px] gap-4 py-1.5 border-b border-zinc-50 last:border-0"
                      >
                        <span className="text-zinc-400 capitalize">
                          {key.replace(/_/g, " ")}
                        </span>
                        <span className="text-zinc-700 font-medium text-right truncate max-w-[200px] font-mono text-[11px]">
                          {typeof val === "object"
                            ? JSON.stringify(val)
                            : String(val)}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                )}
              </Card>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-5">
            {/* Admin actions */}
            <AdminActions tx={tx} onStatusChange={handleStatusChange} />

            {/* User card */}
            {(tx.user as any)?.id && (
              <Card variant="default">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <User size={15} className="text-zinc-400" />
                    Customer
                  </CardTitle>
                </CardHeader>
                <CardDivider />
                <CardContent className="pt-3 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                      {((tx.user as any).name || "?").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-zinc-900">
                        {(tx.user as any).name}
                      </p>
                      {(tx.user as any).email && (
                        <p className="text-[12px] text-zinc-400 truncate">
                          {(tx.user as any).email}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-zinc-500">User ID</span>
                    <span className="font-mono text-zinc-700">
                      {(tx.user as any).id}
                    </span>
                  </div>
                  <Link href={`/admin/customers`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full rounded-xl gap-2 mt-2"
                    >
                      <ExternalLink size={13} />
                      View Customer Profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Group card */}
            {(tx.group as any)?.id && (
              <Card variant="default">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Users size={15} className="text-zinc-400" />
                    Circle
                  </CardTitle>
                </CardHeader>
                <CardDivider />
                <CardContent className="pt-3">
                  <Link
                    href={`/admin/groups/${(tx.group as any).id}`}
                    className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                      {((tx.group as any).name || "GR")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-zinc-900 truncate">
                        {(tx.group as any).name}
                      </p>
                      <p className="text-[11px] text-zinc-400">
                        View circle details
                      </p>
                    </div>
                    <ExternalLink
                      size={13}
                      className="text-zinc-300 group-hover:text-zinc-600 transition-colors shrink-0"
                    />
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Status timeline */}
            <Card variant="flat">
              <CardHeader className="pb-3">
                <CardTitle className="text-[13px] text-zinc-600">
                  Status Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {[
                  { label: "Created", time: tx.created_at, done: true },
                  {
                    label: "Processing",
                    time: null,
                    done: ["processing", "success", "failed"].includes(
                      tx.status,
                    ),
                  },
                  {
                    label: tx.status === "failed" ? "Failed" : "Completed",
                    time: (tx as any).processed_at ?? null,
                    done: ["success", "failed", "cancelled"].includes(
                      tx.status,
                    ),
                    isFail: tx.status === "failed",
                  },
                ].map(({ label, time, done, isFail }, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        done
                          ? isFail
                            ? "bg-red-100 text-red-600"
                            : "bg-emerald-100 text-emerald-600"
                          : "bg-zinc-100 text-zinc-400"
                      }`}
                    >
                      {done ? (
                        isFail ? (
                          <XCircle size={11} />
                        ) : (
                          <CheckCircle2 size={11} />
                        )
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-zinc-300" />
                      )}
                    </div>
                    <div>
                      <p
                        className={`text-[12px] font-semibold ${done ? "text-zinc-800" : "text-zinc-400"}`}
                      >
                        {label}
                      </p>
                      {time && (
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          {new Date(time).toLocaleString("en-NG", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
