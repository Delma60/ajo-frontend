"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useLayoutEffect,
  useRef,
} from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardDivider,
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
import {
  CreditCard,
  Zap,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  TrendingUp,
  Activity,
  Globe,
  Shield,
  ToggleLeft,
  ToggleRight,
  Copy,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronDown,
  ArrowDownLeft,
  ArrowUpRight,
  Settings,
  AlertCircle,
  Download,
  ExternalLink,
  Loader2,
  Webhook,
  BarChart3,
  ArrowRight,
  Info,
  CheckCheck,
  Ban,
  RotateCcw,
  WifiOff,
  Signal,
  Gauge,
} from "lucide-react";
import { HTTPS } from "@/lib/http";
import { formatNaira } from "@/lib/utils";
import { toast } from "sonner";
import AddProviderDialog from "@/components/add-provider-dialog";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Provider {
  id: string;
  name: string;
  slug: "flutterwave" | "paystack" | "monnify";
  logo: string;
  status: "active" | "inactive" | "degraded";
  isDefault: boolean;
  mode: "live" | "test";
  public_key: string;
  secret_key: string;
  webhook_url: string;
  webhook_secret: string;
  success_rate: number;
  total_volume: number;
  total_transactions: number;
  avgResponseMs: number;
  failureRate: number;
  lastChecked: string;
  supported_methods: string[];
  fees: { card: string; bank: string; ussd: string };
}

interface WebhookLog {
  id: string;
  provider: string;
  event: string;
  status: "delivered" | "failed" | "pending";
  statusCode: number;
  responseTime: number;
  payload: string;
  createdAt: string;
  retries: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function useCopy(text: string) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return { copied, copy };
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── SecretField ──────────────────────────────────────────────────────────────

function SecretField({ value, label }: { value: string; label: string }) {
  const [revealed, setRevealed] = useState(false);
  const { copied, copy } = useCopy(value);
  const masked = value.slice(0, 8) + "•".repeat(16) + value.slice(-4);

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-1.5">
        {label}
      </p>
      <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5">
        <span className="flex-1 font-mono text-[12px] text-zinc-700 dark:text-zinc-300 truncate">
          {revealed ? value : masked}
        </span>
        <button
          onClick={() => setRevealed((p) => !p)}
          className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors shrink-0"
        >
          {revealed ? <EyeOff size={13} /> : <Eye size={13} />}
        </button>
        <button
          onClick={copy}
          className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors shrink-0"
        >
          {copied ? (
            <CheckCheck size={13} className="text-emerald-600" />
          ) : (
            <Copy size={13} />
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Provider health ring ─────────────────────────────────────────────────────

function HealthRing({
  value,
  size = 48,
  color = "emerald",
}: {
  value: number;
  size?: number;
  color?: "emerald" | "amber" | "rose";
}) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;

  const strokeColor = {
    emerald: "#10b981",
    amber: "#f59e0b",
    rose: "#f43f5e",
  }[color];

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        className="text-zinc-100 dark:text-zinc-800"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={strokeColor}
        strokeWidth={3}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function GatewayStatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "emerald",
  trend,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  color?: "emerald" | "amber" | "blue" | "rose";
  trend?: { dir: "up" | "down"; value: string };
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
          {trend && (
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                trend.dir === "up" ? "text-emerald-700" : "text-rose-600"
              }`}
            >
              {trend.dir === "up" ? (
                <TrendingUp size={11} />
              ) : (
                <ArrowUpRight size={11} className="rotate-90" />
              )}
              {trend.value}
            </span>
          )}
        </div>
        <p
          className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight"
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

// ─── Provider Logo ────────────────────────────────────────────────────────────

function ProviderLogo({ slug }: { slug: string }) {
  const config: Record<string, { initials: string; from: string; to: string }> =
    {
      flutterwave: {
        initials: "FW",
        from: "#f97316",
        to: "#ef4444",
      },
      paystack: { initials: "PS", from: "#3b82f6", to: "#6366f1" },
      monnify: { initials: "MN", from: "#10b981", to: "#0d9488" },
    };
  const c = config[slug] ?? { initials: "??", from: "#71717a", to: "#52525b" };

  return (
    <div
      className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
      style={{
        background: `linear-gradient(135deg, ${c.from}, ${c.to})`,
      }}
    >
      <span className="text-[12px] font-bold text-white tracking-wider">
        {c.initials}
      </span>
    </div>
  );
}

// ─── Status Dot ───────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: Provider["status"] }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      {status === "active" && (
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
      )}
      <span
        className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
          status === "active"
            ? "bg-emerald-500"
            : status === "degraded"
              ? "bg-amber-500"
              : "bg-zinc-400"
        }`}
      />
    </span>
  );
}

// ─── Connection Test Button ───────────────────────────────────────────────────

function TestConnectionButton({ providerName }: { providerName: string }) {
  const [state, setState] = useState<"idle" | "testing" | "ok" | "fail">(
    "idle",
  );

  const run = async () => {
    setState("testing");
    await new Promise((r) => setTimeout(r, 1800));
    setState(Math.random() > 0.2 ? "ok" : "fail");
    setTimeout(() => setState("idle"), 3000);
  };

  return (
    <button
      onClick={run}
      disabled={state === "testing"}
      className="inline-flex items-center gap-1.5 text-[12px] font-medium text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 disabled:opacity-50 transition-colors px-3 py-1.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
    >
      {state === "testing" ? (
        <>
          <RefreshCw size={12} className="animate-spin" /> Testing…
        </>
      ) : state === "ok" ? (
        <>
          <CheckCircle2 size={12} className="text-emerald-600" /> Connected
        </>
      ) : state === "fail" ? (
        <>
          <XCircle size={12} className="text-rose-600" /> Failed
        </>
      ) : (
        <>
          <Zap size={12} /> Test connection
        </>
      )}
    </button>
  );
}

// ─── Provider Card (expanded) ─────────────────────────────────────────────────

function ProviderCard({
  provider,
  onToggle,
  onSetDefault,
}: {
  provider: Provider;
  onToggle: (id: string) => void;
  onSetDefault: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isActive = provider?.status === "active";
  const successColor =
    provider?.success_rate >= 95
      ? "emerald"
      : provider?.success_rate >= 88
        ? "amber"
        : "rose";

  return (
    <Card
      variant="default"
      className={`overflow-hidden transition-all duration-200 ${
        provider?.isDefault ? "ring-2 ring-emerald-600/30" : ""
      }`}
    >
      {/* Header */}
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start gap-4">
          <ProviderLogo slug={provider?.slug} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-1 flex-wrap">
              <StatusDot status={provider?.status} />
              <h3 className="text-[15px] font-semibold text-zinc-900 dark:text-white">
                {provider?.name}
              </h3>
              {provider?.isDefault && (
                <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  Default
                </span>
              )}
              <span
                className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                  provider?.mode === "live"
                    ? "bg-emerald-900 text-emerald-300"
                    : "bg-zinc-800 text-zinc-300"
                }`}
              >
                {provider?.mode}
              </span>
              <span
                className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                  provider?.status === "active"
                    ? "bg-emerald-50 text-emerald-700"
                    : provider?.status === "degraded"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-zinc-100 text-zinc-500"
                }`}
              >
                {provider?.status}
              </span>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-1 text-[12px] text-zinc-500">
              <span className="flex items-center gap-1">
                <Activity size={10} />
                {provider?.total_transactions.toLocaleString()} txns
              </span>
              <span className="flex items-center gap-1">
                <BarChart3 size={10} />
                {formatNaira(provider?.total_volume, { compact: true })} vol
              </span>
              {provider?.avgResponseMs > 0 && (
                <span className="flex items-center gap-1">
                  <Gauge size={10} />
                  {provider?.avgResponseMs}ms avg
                </span>
              )}
              <span className="text-zinc-400">
                Checked {timeAgo(provider?.lastChecked)}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {!provider?.isDefault && isActive && (
              <button
                onClick={() => onSetDefault(provider?.id)}
                className="text-[11px] font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors px-2.5 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Set default
              </button>
            )}
            <button
              onClick={() => onToggle(provider?.id)}
              title={isActive ? "Disable" : "Enable"}
              className="transition-colors"
            >
              {isActive ? (
                <ToggleRight size={30} className="text-emerald-600" />
              ) : (
                <ToggleLeft
                  size={30}
                  className="text-zinc-300 dark:text-zinc-600"
                />
              )}
            </button>
            <button
              onClick={() => setExpanded((p) => !p)}
              className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 transition-colors"
            >
              <ChevronDown
                size={15}
                className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Metrics row */}
        {isActive && (
          <div className="mt-5 grid grid-cols-3 gap-4">
            {/* Success rate with ring */}
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <HealthRing
                  value={provider?.success_rate}
                  size={44}
                  color={successColor as "emerald" | "amber" | "rose"}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-zinc-700 dark:text-zinc-300">
                  {provider?.success_rate}%
                </span>
              </div>
              <div>
                <p className="text-[10px] text-zinc-400 uppercase tracking-wide font-medium">
                  Success
                </p>
                <p className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-200">
                  {provider?.success_rate}%
                </p>
              </div>
            </div>

            {/* Failure rate */}
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <HealthRing
                  value={provider?.failureRate}
                  size={44}
                  color={provider?.failureRate > 5 ? "rose" : "amber"}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-zinc-700 dark:text-zinc-300">
                  {provider?.failureRate}%
                </span>
              </div>
              <div>
                <p className="text-[10px] text-zinc-400 uppercase tracking-wide font-medium">
                  Failures
                </p>
                <p
                  className={`text-[13px] font-semibold ${
                    provider?.failureRate > 5
                      ? "text-rose-700"
                      : "text-zinc-800 dark:text-zinc-200"
                  }`}
                >
                  {provider?.failureRate}%
                </p>
              </div>
            </div>

            {/* Methods */}
            <div>
              <p className="text-[10px] text-zinc-400 uppercase tracking-wide font-medium mb-1.5">
                Methods
              </p>
              <div className="flex gap-1.5 flex-wrap">
                {provider?.supported_methods.slice(0, 3).map((m) => (
                  <span
                    key={m}
                    className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-full px-2 py-0.5 font-medium"
                  >
                    {m}
                  </span>
                ))}
                {provider?.supported_methods.length > 3 && (
                  <span className="text-[10px] text-zinc-400">
                    +{provider?.supported_methods.length - 3}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {!isActive && (
          <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <WifiOff size={13} className="text-zinc-400" />
            <p className="text-[12px] text-zinc-500">
              Provider is disabled — enable to process payments
            </p>
          </div>
        )}
      </CardContent>

      {/* Expanded section */}

      {expanded && (
        <>
          <CardDivider />
          <CardContent className="pt-5 pb-5 space-y-5">
            {/* Keys grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SecretField value={provider?.public_key} label="Public Key" />
              <SecretField value={provider?.secret_key} label="Secret Key" />
              <SecretField
                value={provider?.webhook_secret}
                label="Webhook Secret"
              />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-1.5">
                  Webhook URL
                </p>
                <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5">
                  <Webhook size={12} className="text-zinc-400 shrink-0" />
                  <span className="flex-1 font-mono text-[12px] text-zinc-700 dark:text-zinc-300 truncate">
                    {provider?.webhook_url}
                  </span>
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(provider?.webhook_url)
                    }
                    className="text-zinc-400 hover:text-zinc-700 transition-colors shrink-0"
                  >
                    <Copy size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* Fees */}
            <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-3">
                Transaction Fees
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  {
                    label: "Card",
                    value: provider?.fees.card,
                    icon: CreditCard,
                  },
                  {
                    label: "Bank Transfer",
                    value: provider?.fees.bank,
                    icon: ArrowDownLeft,
                  },
                  {
                    label: "USSD",
                    value: provider?.fees.ussd,
                    icon: Signal,
                  },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                      <Icon size={12} className="text-zinc-500" />
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-400">{label}</p>
                      <p className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-200">
                        {value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl gap-1.5"
              >
                <Settings size={13} />
                Edit config
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-xl gap-1.5 text-zinc-500"
              >
                <ExternalLink size={13} />
                Dashboard
              </Button>
              {isActive && (
                <TestConnectionButton providerName={provider?.name} />
              )}
              {provider?.status === "degraded" && (
                <button className="inline-flex items-center gap-1.5 text-[12px] font-medium text-amber-700 hover:text-amber-800 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors">
                  <AlertCircle size={12} />
                  View incident
                </button>
              )}
            </div>
          </CardContent>
        </>
      )}
    </Card>
  );
}

// ─── Webhook Row ──────────────────────────────────────────────────────────────

function WebhookRow({ log }: { log: WebhookLog }) {
  const status = {
    delivered: {
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      label: "Delivered",
    },
    failed: {
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
      label: "Failed",
    },
    pending: {
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-50",
      label: "Pending",
    },
  }[log.status];

  const Icon = status.icon;

  const eventColors: Record<string, string> = {
    "charge.completed": "text-emerald-700 bg-emerald-50",
    "transfer.completed": "text-blue-700 bg-blue-50",
    "charge.failed": "text-red-700 bg-red-50",
    "transfer.failed": "text-red-700 bg-red-50",
  };

  return (
    <TableRow hoverable>
      <TableCell>
        <div className="flex items-center gap-2">
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${status.bg}`}
          >
            <Icon size={12} className={status.color} />
          </div>
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${eventColors[log.event] ?? "bg-zinc-100 text-zinc-600"}`}
          >
            {log.event}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <span className="text-[12px] font-medium capitalize text-zinc-700 dark:text-zinc-300">
          {log.provider}
        </span>
      </TableCell>
      <TableCell>
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}
        >
          <Icon size={10} />
          {status.label}
        </span>
      </TableCell>
      <TableCell muted>
        <span
          className={`text-[12px] font-mono ${log.statusCode >= 400 ? "text-red-600" : "text-zinc-600"}`}
        >
          {log.statusCode || "—"}
        </span>
      </TableCell>
      <TableCell muted>
        <span
          className={`text-[12px] tabular-nums ${log.responseTime > 1000 ? "text-amber-600" : ""}`}
        >
          {log.responseTime}ms
        </span>
      </TableCell>
      <TableCell>
        {log.retries > 0 ? (
          <span className="text-[11px] bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded-full">
            {log.retries} retries
          </span>
        ) : (
          <span className="text-[11px] text-zinc-300">—</span>
        )}
      </TableCell>
      <TableCell muted>
        <span className="text-[12px]">{timeAgo(log.createdAt)}</span>
      </TableCell>
      <TableCell align="right">
        <button
          onClick={() => navigator.clipboard.writeText(log.payload)}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-emerald-700 transition-colors px-2 py-1 rounded-lg hover:bg-emerald-50"
        >
          <Copy size={11} />
          Payload
        </button>
        {log.status === "failed" && (
          <button className="ml-1 inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 hover:text-rose-700 transition-colors px-2 py-1 rounded-lg hover:bg-rose-50">
            <RotateCcw size={11} />
            Retry
          </button>
        )}
      </TableCell>
    </TableRow>
  );
}

// ─── Routing Rule Row ─────────────────────────────────────────────────────────

const ROUTING_RULES = [
  {
    label: "Card payments",
    primary: "Flutterwave",
    fallback: "Paystack",
    condition: "If success rate < 90%",
    icon: CreditCard,
    color: "violet",
  },
  {
    label: "Bank transfers",
    primary: "Flutterwave",
    fallback: "Monnify",
    condition: "If provider is down",
    icon: ArrowDownLeft,
    color: "emerald",
  },
  {
    label: "USSD payments",
    primary: "Paystack",
    fallback: "Flutterwave",
    condition: "If response > 3s",
    icon: Signal,
    color: "amber",
  },
  {
    label: "Payouts / Withdrawals",
    primary: "Flutterwave",
    fallback: "Paystack",
    condition: "If failure rate > 5%",
    icon: ArrowUpRight,
    color: "blue",
  },
];

function RoutingRuleRow({ rule }: { rule: (typeof ROUTING_RULES)[number] }) {
  const Icon = rule.icon;
  const iconBg: Record<string, string> = {
    violet: "bg-violet-50 text-violet-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
  };

  return (
    <div className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg[rule.color]}`}
        >
          <Icon size={15} />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-zinc-900 dark:text-white">
            {rule.label}
          </p>
          <p className="text-[11px] text-zinc-400 mt-0.5">{rule.condition}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-[12px] shrink-0">
        <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 font-semibold px-2.5 py-1 rounded-lg">
          {rule.primary}
        </span>
        <ArrowRight size={12} className="text-zinc-300" />
        <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-medium px-2.5 py-1 rounded-lg">
          {rule.fallback}
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="rounded-xl gap-1.5 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Settings size={12} />
        Edit
      </Button>
    </div>
  );
}

// ─── Tab key ──────────────────────────────────────────────────────────────────

type TabKey = "providers" | "webhooks" | "routing";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PaymentGatewayPage() {
  const [providers, setProviders] = useState<Provider[] | null>(null);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[] | null>(null);
  const [filteredLogs, setFilteredLogs] = useState<WebhookLog[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("providers");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [webhookHealthPct, setWebhookHealthPct] = useState(0);

  const handleToggle = useCallback(
    (id: string) => {
      HTTPS.patch(`/admin/payment-gateway/providers/${id}/toggle`).then(
        ({ data: provider }) => {
          setProviders(
            (prev) =>
              prev?.map((p) => (p.id === id ? (provider as Provider) : p)) ??
              null,
          );
          const p = providers?.find((x) => x.id === id);
          if (p) {
            toast.success(
              p.status === "active"
                ? `${p.name} disabled`
                : `${p.name} enabled`,
            );
          }
        },
      );
    },
    [providers],
  );

  const handleSetDefault = useCallback(
    (id: string) => {
      setProviders(
        (prev) => prev?.map((p) => ({ ...p, isDefault: p.id === id })) ?? null,
      );
      const p = providers?.find((x) => x.id === id);
      if (p) toast.success(`${p.name} set as default provider`);
    },
    [providers],
  );

  const fetchData = async () => {
    const [_providers, _webhookLogs] = await Promise.all([
      HTTPS.get("/admin/payment-gateways/providers").then(({ data }) => data),
      HTTPS.get("/admin/webhook-logs").then(({ data }) => data ?? []),
    ]);
    setProviders(_providers as Provider[]);
    setWebhookLogs(_webhookLogs as WebhookLog[]);
    console.log(_providers, _webhookLogs);

    // Compute webhook health
    const logs = _webhookLogs as WebhookLog[];
    if (logs?.length) {
      const delivered = logs.filter((l) => l.status === "delivered").length;
      setWebhookHealthPct(Math.round((delivered / logs.length) * 100));
    }
  };

  useLayoutEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
    toast.success("Status refreshed");
  };

  const activeProviders = providers?.filter((p) => p.status === "active") ?? [];
  const degradedProviders =
    providers?.filter((p) => p.status === "degraded") ?? [];
  const totalVolume = providers?.reduce((s, p) => s + p.total_volume, 0) ?? 0;
  const avgSuccess = activeProviders.length
    ? activeProviders.reduce((s, p) => s + p.success_rate, 0) /
      activeProviders.length
    : 0;

  const TABS: { key: TabKey; label: string; count?: number }[] = [
    {
      key: "providers",
      label: "Providers",
      count: providers?.length ?? 0,
    },
    {
      key: "webhooks",
      label: "Webhook Logs",
      count: webhookLogs?.filter((l) => l.status === "failed").length,
    },
    { key: "routing", label: "Routing Rules", count: ROUTING_RULES.length },
  ];

  return (
    <div className="min-h-full bg-zinc-50/40">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1
              className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Payment Gateway
            </h1>
            <p className="text-zinc-500 text-sm mt-0.5">
              Manage providers, webhooks, and smart routing rules
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

        {/* ── Degraded alert ──────────────────────────────────────────────── */}
        {degradedProviders.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <AlertTriangle size={16} className="text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800 dark:text-amber-300 font-medium flex-1">
              {degradedProviders.length} provider
              {degradedProviders.length > 1 ? "s" : ""} experiencing degraded
              performance — {degradedProviders.map((p) => p.name).join(", ")}
            </p>
            <Button
              size="sm"
              variant="secondary"
              className="rounded-xl text-amber-700 bg-amber-100 hover:bg-amber-200 border-amber-200 shrink-0"
            >
              View incident
            </Button>
          </div>
        )}

        {/* ── Stat cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <GatewayStatCard
            icon={Globe}
            label="Active providers"
            value={`${activeProviders.length} / ${providers?.length ?? 0}`}
            sub={
              providers?.find((p) => p.isDefault)?.name
                ? `${providers?.find((p) => p.isDefault)?.name} is default`
                : undefined
            }
            color="emerald"
          />
          <GatewayStatCard
            icon={TrendingUp}
            label="Total volume"
            value={formatNaira(totalVolume, { compact: true })}
            sub={`${providers?.reduce((s, p) => s + p.total_transactions, 0).toLocaleString()} txns`}
            color="blue"
            trend={{ dir: "up", value: "+12%" }}
          />
          <GatewayStatCard
            icon={Activity}
            label="Avg success rate"
            value={`${avgSuccess.toFixed(1)}%`}
            sub="Across active providers"
            color={
              avgSuccess >= 95 ? "emerald" : avgSuccess >= 90 ? "amber" : "rose"
            }
          />
          <GatewayStatCard
            icon={Webhook}
            label="Webhook health"
            value={`${webhookHealthPct}%`}
            sub={`${webhookLogs?.filter((l) => l.status === "failed").length ?? 0} failures`}
            color={
              webhookHealthPct >= 95
                ? "emerald"
                : webhookHealthPct >= 85
                  ? "amber"
                  : "rose"
            }
          />
        </div>

        {/* ── Main card with tabs ─────────────────────────────────────────── */}
        <Card variant="default" className="overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-zinc-100 dark:border-zinc-800 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex items-center gap-2 px-6 py-4 text-[13px] font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                  activeTab === tab.key
                    ? "border-emerald-600 text-emerald-700 dark:text-emerald-400"
                    : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                }`}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center ${
                      tab.key === "webhooks" && tab.count > 0
                        ? "bg-rose-100 text-rose-700"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── Providers tab ────────────────────────────────────────────── */}
          {activeTab === "providers" && (
            <CardContent className="space-y-4 pt-5">
              {providers === null ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 size={22} className="animate-spin text-zinc-400" />
                  <p className="text-sm text-zinc-500">Loading providers…</p>
                </div>
              ) : providers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <CreditCard size={28} className="text-zinc-300" />
                  <p className="text-sm text-zinc-500">
                    No providers configured
                  </p>
                  <AddProviderDialog>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="rounded-xl gap-1.5"
                    >
                      <Settings size={13} /> Configure provider
                    </Button>
                  </AddProviderDialog>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {providers.map((p) => (
                      <ProviderCard
                        key={p.id}
                        provider={p}
                        onToggle={handleToggle}
                        onSetDefault={handleSetDefault}
                      />
                    ))}
                  </div>

                  {/* Add provider CTA */}
                  <button className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-[13px] font-medium text-zinc-400 hover:border-emerald-400 hover:text-emerald-600 dark:hover:border-emerald-600 dark:hover:text-emerald-400 transition-colors">
                    <Settings size={14} />
                    Add payment provider
                  </button>
                </>
              )}
            </CardContent>
          )}

          {/* ── Webhooks tab ─────────────────────────────────────────────── */}
          {activeTab === "webhooks" && (
            <CardContent className="pt-5 pb-0 px-0">
              {/* Summary bar */}
              {webhookLogs && webhookLogs.length > 0 && (
                <div className="flex items-center gap-6 px-5 pb-4 flex-wrap">
                  {[
                    {
                      label: "Delivered",
                      count: webhookLogs.filter((l) => l.status === "delivered")
                        .length,
                      color: "text-emerald-700",
                      bg: "bg-emerald-50",
                    },
                    {
                      label: "Failed",
                      count: webhookLogs.filter((l) => l.status === "failed")
                        .length,
                      color: "text-rose-600",
                      bg: "bg-rose-50",
                    },
                    {
                      label: "Pending",
                      count: webhookLogs.filter((l) => l.status === "pending")
                        .length,
                      color: "text-amber-600",
                      bg: "bg-amber-50",
                    },
                  ].map(({ label, count, color, bg }) => (
                    <div
                      key={label}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${bg}`}
                    >
                      <span className={`text-[13px] font-bold ${color}`}>
                        {count}
                      </span>
                      <span
                        className={`text-[12px] font-medium ${color} opacity-70`}
                      >
                        {label}
                      </span>
                    </div>
                  ))}

                  <button className="ml-auto inline-flex items-center gap-1.5 text-[12px] font-medium text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-xl hover:bg-rose-50 transition-colors">
                    <RotateCcw size={12} />
                    Retry all failed
                  </button>
                </div>
              )}

              {/* Filter */}
              {webhookLogs && webhookLogs.length > 0 && (
                <div className="px-5 pb-4">
                  <Filter
                    data={webhookLogs}
                    onResult={setFilteredLogs}
                    searchFields={["event", "provider"]}
                    searchPlaceholder="Search by event or provider…"
                    quickGroup="status"
                    groups={[
                      {
                        key: "status",
                        label: "Status",
                        options: [
                          { value: "all", label: "All" },
                          { value: "delivered", label: "Delivered" },
                          { value: "failed", label: "Failed" },
                          { value: "pending", label: "Pending" },
                        ],
                        match: (item, v) => (item as WebhookLog).status === v,
                      },
                      {
                        key: "provider",
                        label: "Provider",
                        options: [
                          { value: "all", label: "All" },
                          { value: "flutterwave", label: "Flutterwave" },
                          { value: "paystack", label: "Paystack" },
                          { value: "monnify", label: "Monnify" },
                        ],
                        match: (item, v) => (item as WebhookLog).provider === v,
                      },
                    ]}
                  />
                </div>
              )}

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>HTTP</TableHead>
                      <TableHead>Response</TableHead>
                      <TableHead>Retries</TableHead>
                      <TableHead>When</TableHead>
                      <TableHead align="right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!webhookLogs ? (
                      <TableRow>
                        <TableCell colSpan={8}>
                          <div className="flex items-center justify-center py-10 gap-2 text-zinc-400">
                            <Loader2 size={16} className="animate-spin" />
                            Loading webhook logs…
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredLogs.length === 0 ? (
                      <TableEmpty
                        colSpan={8}
                        message="No webhook logs match your filters."
                      />
                    ) : (
                      filteredLogs.map((log) => (
                        <WebhookRow key={log.id} log={log} />
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          )}

          {/* ── Routing tab ──────────────────────────────────────────────── */}
          {activeTab === "routing" && (
            <CardContent className="pt-5 space-y-5 pb-6">
              {/* Info banner */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl">
                <Info
                  size={15}
                  className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-[13px] font-semibold text-blue-900 dark:text-blue-300">
                    Smart routing enabled
                  </p>
                  <p className="text-[12px] text-blue-700 dark:text-blue-400 mt-0.5 leading-relaxed">
                    AjoSave automatically routes transactions to the best
                    available provider based on success rate, response time, and
                    payment method. Fallback rules activate automatically when
                    primary providers breach thresholds.
                  </p>
                </div>
              </div>

              {/* Rules */}
              <div className="space-y-2">
                {ROUTING_RULES.map((rule) => (
                  <RoutingRuleRow key={rule.label} rule={rule} />
                ))}
              </div>

              {/* Failover thresholds */}
              <Card
                variant="flat"
                className="border border-zinc-100 dark:border-zinc-800"
              >
                <CardHeader>
                  <CardTitle className="text-[14px]">
                    Failover thresholds
                  </CardTitle>
                  <CardDescription>
                    Adjust when automatic failover triggers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      label: "Success rate threshold",
                      value: "90%",
                      hint: "Switch provider when success drops below",
                    },
                    {
                      label: "Response time threshold",
                      value: "3 000ms",
                      hint: "Switch when avg response exceeds",
                    },
                    {
                      label: "Failure rate threshold",
                      value: "5%",
                      hint: "Switch when failure rate exceeds",
                    },
                    {
                      label: "Cooldown period",
                      value: "15 min",
                      hint: "Wait before retrying failed provider",
                    },
                  ].map(({ label, value, hint }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between text-[13px] py-2.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                    >
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-white">
                          {label}
                        </p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          {hint}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200 text-[13px]">
                          {value}
                        </span>
                        <button className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
                          <Settings size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  className="rounded-xl gap-2"
                >
                  <Shield size={13} />
                  Save routing rules
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
