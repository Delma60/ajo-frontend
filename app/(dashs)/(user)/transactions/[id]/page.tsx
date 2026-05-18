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

// ─── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  TxStatus,
  { icon: React.ElementType; color: string; bg: string; ring: string; label: string; desc: string }
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

const TYPE_CONFIG: Record<TxType, { icon: React.ElementType; label: string }> = {
  charge: { icon: CreditCard, label: "Payment" },
  payout: { icon: ArrowDownLeft, label: "Payout" },
  refund: { icon: Repeat2, label: "Refund" },
  topup: { icon: Wallet, label: "Wallet Top-up" },
  transfer: { icon: Building2, label: "Bank Transfer" },
};

// ─── Copy field ────────────────────────────────────────────────────────────────

function CopyField({ label, value }: { label: string; value: string }) {
  const { copied, copy } = useCopy(value);
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <p className="text-[13px] font-mono text-zinc-700 truncate flex-1">{value}</p>
        <button
          onClick={copy}
          className="shrink-0 text-zinc-400 hover:text-zinc-700 transition-colors"
          title="Copy"
        >
          {copied ? (
            <CheckCircle2 size={14} className="text-emerald-600" />
          ) : (
            <Copy size={14} />
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Detail row ────────────────────────────────────────────────────────────────

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
    <div className="flex items-start justify-between gap-4 py-3">
      <p className="text-[13px] text-zinc-500 shrink-0">{label}</p>
      <p
        className={`text-[13px] text-right ${
          muted ? "text-zinc-400" : "font-medium text-zinc-900"
        } ${mono ? "font-mono" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-6 bg-zinc-100 rounded w-24" />
      <Card variant="default" className="p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-zinc-100 mx-auto" />
        <div className="h-8 bg-zinc-100 rounded w-36 mx-auto" />
        <div className="h-4 bg-zinc-100 rounded w-24 mx-auto" />
      </Card>
      <Card variant="default">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex justify-between px-5 py-4 border-b border-zinc-50">
            <div className="h-3.5 bg-zinc-100 rounded w-24" />
            <div className="h-3.5 bg-zinc-100 rounded w-32" />
          </div>
        ))}
      </Card>
    </div>
  );
}

// ─── Hero amount block ──────────────────────────────────────────────────────────

function AmountHero({ tx, statusConf }: { tx: ITransaction; statusConf: (typeof STATUS_CONFIG)[TxStatus] }) {
  const isCredit = tx.direction === "credit";
  const StatusIcon = statusConf.icon;
  const amount = parseFloat(String(tx.amount));
  const typeConf = TYPE_CONFIG[tx.type] ?? TYPE_CONFIG.charge;
  const TypeIcon = typeConf.icon;

  return (
    <div
      className="relative rounded-2xl overflow-hidden px-6 pt-8 pb-6"
      style={{
        background: isCredit
          ? "linear-gradient(135deg, #064e3b 0%, #065f46 55%, #047857 100%)"
          : "linear-gradient(135deg, #18181b 0%, #27272a 60%, #3f3f46 100%)",
      }}
    >
      {/* decorative blob */}
      <div
        className="pointer-events-none absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #6ee7b7 0%, transparent 70%)" }}
      />

      <div className="relative z-10 text-center space-y-4">
        {/* status icon */}
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto ring-4 ${statusConf.ring} ${statusConf.bg}`}
        >
          <StatusIcon size={24} className={statusConf.color} />
        </div>

        {/* amount */}
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

        {/* status badge + type */}
        <div className="flex items-center justify-center gap-2">
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
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function TransactionDetailPage() {
  const params = useParams<{ id: string }>();
  const [tx, setTx] = useState<ITransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    HTTPS.get<ITransaction>(`/transactions/${params.id}`)
      .then(({ data }) => {
        if (data) setTx(data);
        else setError("Transaction not found.");
      })
      .catch(() => setError("Could not load transaction."))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-full bg-zinc-50/40">
        <div className="max-w-xl mx-auto px-4 sm:px-6 py-6">
          <DetailSkeleton />
        </div>
      </div>
    );
  }

  if (error || !tx) {
    return (
      <div className="min-h-full bg-zinc-50/40 flex items-center justify-center p-6">
        <Card variant="default" className="max-w-md w-full text-center py-10 px-6">
          <AlertCircle className="w-10 h-10 text-zinc-300 mx-auto mb-4" />
          <p className="text-sm font-medium text-zinc-600">{error ?? "Transaction not found"}</p>
          <Link href="/transactions/history">
            <Button size="sm" variant="secondary" className="mt-4 rounded-xl">
              Back to history
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const statusConf = STATUS_CONFIG[tx.status] ?? STATUS_CONFIG.pending;
  const net = parseFloat(String(tx.net_amount ?? tx.amount));

  return (
    <div className="min-h-full bg-zinc-50/40">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Back */}
        <Link
          href="/transactions/history"
          className="inline-flex items-center gap-1.5 text-[13px] text-zinc-400 hover:text-zinc-700 transition-colors"
        >
          <ArrowLeft size={13} />
          Transaction History
        </Link>

        {/* Hero */}
        <AmountHero tx={tx} statusConf={statusConf} />

        {/* Status message */}
        <p className="text-[13px] text-zinc-500 text-center px-4">{statusConf.desc}</p>

        {/* Core details */}
        <Card variant="default">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Receipt size={15} className="text-zinc-400" />
              Transaction Details
            </CardTitle>
          </CardHeader>
          <CardDivider />
          <CardContent className="pt-0 px-5 divide-y divide-zinc-50">
            <DetailRow label="Label" value={tx.label || tx.short_label || "—"} />
            <DetailRow
              label="Date & Time"
              value={formatDateTime(tx.created_at)}
            />
            <DetailRow
              label="Direction"
              value={
                <span
                  className={`inline-flex items-center gap-1 font-semibold ${
                    tx.direction === "credit" ? "text-emerald-700" : "text-zinc-700"
                  }`}
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
            <DetailRow label="Gross Amount" value={formatAmount(tx.amount)} />
            {parseFloat(String(tx.fee ?? 0)) > 0 && (
              <DetailRow label="Fee" value={formatAmount(tx.fee)} muted />
            )}
            <DetailRow
              label="Net Amount"
              value={
                <span className="font-bold">{formatAmount(net)}</span>
              }
            />
            {tx.method && (
              <DetailRow
                label="Method"
                value={tx.method.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
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
          <CardContent className="pt-3 space-y-4">
            {tx.reference && <CopyField label="Reference" value={tx.reference} />}
            {tx.provider_reference && (
              <CopyField label="Provider Reference" value={String(tx.provider_reference)} />
            )}
            {tx.uuid && <CopyField label="Transaction ID" value={tx.uuid} />}
          </CardContent>
        </Card>

        {/* Group info */}
        {tx.group && (
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
                href={`/groups/${(tx.group as any).id}`}
                className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition-colors group"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                  {((tx.group as any).name || "GR").slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-zinc-900 truncate">
                    {(tx.group as any).name}
                  </p>
                  <p className="text-[11px] text-zinc-400">View circle details</p>
                </div>
                <ExternalLink
                  size={13}
                  className="text-zinc-300 group-hover:text-zinc-500 transition-colors shrink-0"
                />
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Meta / extra info */}
        {tx.meta && Object.keys(tx.meta).length > 0 && (
          <Card variant="flat">
            <CardHeader className="pb-2">
              <CardTitle className="text-[13px] text-zinc-500">Additional Info</CardTitle>
            </CardHeader>
            <CardContent className="pt-1 space-y-2">
              {Object.entries(tx.meta)
                .filter(
                  ([k]) =>
                    !["webhook_payload", "provider_result", "provider_payload"].includes(k)
                )
                .slice(0, 6)
                .map(([key, val]) => (
                  <div key={key} className="flex justify-between text-[12px] gap-4">
                    <span className="text-zinc-400 capitalize">
                      {key.replace(/_/g, " ")}
                    </span>
                    <span className="text-zinc-700 font-medium text-right truncate max-w-[180px]">
                      {typeof val === "object" ? JSON.stringify(val) : String(val)}
                    </span>
                  </div>
                ))}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2 pb-6">
          <Button
            variant="outline"
            size="md"
            className="flex-1 rounded-xl gap-2"
            onClick={() => {
              const text = [
                `Transaction: ${tx.label || tx.short_label || tx.type}`,
                `Amount: ${formatAmount(tx.amount)}`,
                `Reference: ${tx.reference || "—"}`,
                `Status: ${statusConf.label}`,
                `Date: ${formatDateTime(tx.created_at)}`,
              ].join("\n");
              navigator.clipboard.writeText(text);
            }}
          >
            <Copy size={15} />
            Copy Receipt
          </Button>
          {tx.status === "failed" && (
            <Button variant="primary" size="md" className="flex-1 rounded-xl gap-2">
              <RefreshCw size={15} />
              Retry
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}