"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useLayoutEffect,
} from "react";
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
import {
  CreditCard,
  Zap,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Activity,
  Globe,
  Shield,
  ToggleLeft,
  ToggleRight,
  Copy,
  Eye,
  EyeOff,
  ChevronRight,
  Webhook,
  ArrowDownLeft,
  ArrowUpRight,
  Settings,
  BarChart3,
  AlertCircle,
  Download,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { HTTPS } from "@/lib/http";
import { formatNaira } from "@/lib/utils";
import { toast } from "sonner";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Provider {
  id: string;
  name: string;
  slug: "flutterwave" | "paystack" | "monnify";
  logo: string;
  status: "active" | "inactive" | "degraded";
  isDefault: boolean;
  mode: "live" | "test";
  publicKey: string;
  secretKey: string;
  webhookUrl: string;
  webhookSecret: string;
  successRate: number;
  totalVolume: number;
  totalTransactions: number;
  avgResponseMs: number;
  failureRate: number;
  lastChecked: string;
  supportedMethods: string[];
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

interface ProviderStats {
  provider: string;
  successRate: number;
  volume: number;
  txCount: number;
  avgTime: number;
  failureRate: number;
}

// ─── Mock data helpers ────────────────────────────────────────────────────────

// const MOCK_PROVIDERS: Provider[] = [
//   {
//     id: "p1",
//     name: "Flutterwave",
//     slug: "flutterwave",
//     logo: "FW",
//     status: "active",
//     isDefault: true,
//     mode: "live",
//     publicKey: "FLWPUBK-xxxxxxxxxxxxxxxxxxxx-X",
//     secretKey: "FLWSECK-xxxxxxxxxxxxxxxxxxxx-X",
//     webhookUrl: "https://api.ajosave.com/webhooks/flutterwave",
//     webhookSecret: "whsec_xxxxxxxxxxxxxxxxxxxx",
//     successRate: 97.4,
//     totalVolume: 84200000,
//     totalTransactions: 3842,
//     avgResponseMs: 1240,
//     failureRate: 2.6,
//     lastChecked: new Date(Date.now() - 120000).toISOString(),
//     supportedMethods: ["Card", "Bank Transfer", "USSD", "Mobile Money"],
//     fees: { card: "1.4% + ₦100", bank: "₦10", ussd: "₦10" },
//   },
//   {
//     id: "p2",
//     name: "Paystack",
//     slug: "paystack",
//     logo: "PS",
//     status: "active",
//     isDefault: false,
//     mode: "live",
//     publicKey: "pk_live_xxxxxxxxxxxxxxxxxxxx",
//     secretKey: "sk_live_xxxxxxxxxxxxxxxxxxxx",
//     webhookUrl: "https://api.ajosave.com/webhooks/paystack",
//     webhookSecret: "whsec_xxxxxxxxxxxxxxxxxxxx",
//     successRate: 98.1,
//     totalVolume: 12300000,
//     totalTransactions: 641,
//     avgResponseMs: 980,
//     failureRate: 1.9,
//     lastChecked: new Date(Date.now() - 300000).toISOString(),
//     supportedMethods: ["Card", "Bank Transfer", "USSD"],
//     fees: { card: "1.5% + ₦100", bank: "₦10", ussd: "₦10" },
//   },
//   {
//     id: "p3",
//     name: "Monnify",
//     slug: "monnify",
//     logo: "MN",
//     status: "inactive",
//     isDefault: false,
//     mode: "test",
//     publicKey: "MK_TEST_xxxxxxxxxxxxxxxxxxxx",
//     secretKey: "xxxxxxxxxxxxxxxxxxxx",
//     webhookUrl: "https://api.ajosave.com/webhooks/monnify",
//     webhookSecret: "whsec_xxxxxxxxxxxxxxxxxxxx",
//     successRate: 0,
//     totalVolume: 0,
//     totalTransactions: 0,
//     avgResponseMs: 0,
//     failureRate: 0,
//     lastChecked: new Date(Date.now() - 86400000).toISOString(),
//     supportedMethods: ["Bank Transfer", "USSD"],
//     fees: { card: "N/A", bank: "₦20", ussd: "₦20" },
//   },
// ];

// const MOCK_WEBHOOK_LOGS: WebhookLog[] = Array.from({ length: 20 }, (_, i) => ({
//   id: `wh_${i + 1}`,
//   provider: i % 3 === 2 ? "paystack" : "flutterwave",
//   event: ["charge.completed", "transfer.completed", "charge.failed", "transfer.failed"][i % 4],
//   status: (["delivered", "delivered", "delivered", "failed", "pending"] as const)[i % 5],
//   statusCode: [200, 200, 200, 500, 0][i % 5],
//   responseTime: Math.floor(Math.random() * 800 + 100),
//   payload: `{"event":"charge.completed","data":{"id":${10000 + i}}}`,
//   createdAt: new Date(Date.now() - i * 3600000).toISOString(),
//   retries: [0, 0, 0, 2, 1][i % 5],
// }));

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusDot({ status }: { status: Provider["status"] }) {
  const map = {
    active: "bg-emerald-500",
    inactive: "bg-zinc-400",
    degraded: "bg-amber-500",
  };
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${map[status]} ${status === "active" ? "animate-pulse" : ""}`}
    />
  );
}

function SecretField({ value }: { value: string }) {
  const [revealed, setRevealed] = useState(false);
  const { copied, copy } = useCopy(value);
  const display = revealed
    ? value
    : value.slice(0, 8) + "•".repeat(20) + value.slice(-4);
  return (
    <div className="flex items-center gap-2 font-mono text-[12px] bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2">
      <span className="flex-1 truncate text-zinc-700">{display}</span>
      <button
        onClick={() => setRevealed((p) => !p)}
        className="text-zinc-400 hover:text-zinc-700 transition-colors shrink-0"
      >
        {revealed ? <EyeOff size={13} /> : <Eye size={13} />}
      </button>
      <button
        onClick={copy}
        className="text-zinc-400 hover:text-zinc-700 transition-colors shrink-0"
      >
        {copied ? (
          <CheckCircle2 size={13} className="text-emerald-600" />
        ) : (
          <Copy size={13} />
        )}
      </button>
    </div>
  );
}

function useCopy(text: string) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return { copied, copy };
}

function HealthBar({
  value,
  color = "emerald",
}: {
  value: number;
  color?: string;
}) {
  const barColor =
    color === "rose"
      ? "bg-rose-500"
      : color === "amber"
        ? "bg-amber-500"
        : "bg-emerald-500";
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <span className="text-[12px] font-semibold text-zinc-700 tabular-nums">
        {value.toFixed(1)}%
      </span>
    </div>
  );
}

function ProviderLogo({ slug, initials }: { slug: string; initials: string }) {
  const colors: Record<string, string> = {
    flutterwave: "from-orange-500 to-red-500",
    paystack: "from-blue-500 to-indigo-600",
    monnify: "from-emerald-500 to-teal-600",
  };
  return (
    <div
      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[slug] ?? "from-zinc-400 to-zinc-600"} flex items-center justify-center shrink-0`}
    >
      <span className="text-[11px] font-bold text-white tracking-wider">
        {initials}
      </span>
    </div>
  );
}

// ─── Provider Card ─────────────────────────────────────────────────────────────

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
  const isActive = provider.status === "active";

  return (
    <Card
      variant="default"
      className={`overflow-hidden transition-all duration-200 ${expanded ? "shadow-md" : ""}`}
    >
      {/* Header row */}
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start gap-4">
          <ProviderLogo slug={provider.slug} initials={provider.logo} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="text-[15px] font-semibold text-zinc-900">
                {provider.name}
              </h3>
              <StatusDot status={provider.status} />
              <span
                className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                  provider.status === "active"
                    ? "bg-emerald-50 text-emerald-700"
                    : provider.status === "degraded"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-zinc-100 text-zinc-500"
                }`}
              >
                {provider.status}
              </span>
              {provider.isDefault && (
                <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                  Default
                </span>
              )}
              <span
                className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                  provider.mode === "live"
                    ? "bg-emerald-900 text-emerald-300"
                    : "bg-zinc-800 text-zinc-300"
                }`}
              >
                {provider.mode}
              </span>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-zinc-500">
              <span className="flex items-center gap-1">
                <Activity size={10} />{" "}
                {provider.totalTransactions.toLocaleString()} txns
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp size={10} />{" "}
                {formatNaira(provider.totalVolume, { compact: true })} volume
              </span>
              {provider.avgResponseMs > 0 && (
                <span className="flex items-center gap-1">
                  <Zap size={10} /> {provider.avgResponseMs}ms avg
                </span>
              )}
              <span className="text-zinc-400">
                Checked{" "}
                {new Date(provider.lastChecked).toLocaleTimeString("en-NG", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {!provider.isDefault && isActive && (
              <Button
                variant="ghost"
                size="sm"
                className="rounded-lg text-[11px] gap-1 text-zinc-500"
                onClick={() => onSetDefault(provider.id)}
              >
                Set default
              </Button>
            )}
            <button
              onClick={() => onToggle(provider.id)}
              className="text-zinc-400 hover:text-zinc-700 transition-colors"
              title={isActive ? "Disable provider" : "Enable provider"}
            >
              {isActive ? (
                <ToggleRight size={28} className="text-emerald-600" />
              ) : (
                <ToggleLeft size={28} className="text-zinc-400" />
              )}
            </button>
            <button
              onClick={() => setExpanded((p) => !p)}
              className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors"
            >
              <ChevronRight
                size={14}
                className={`transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Stats row */}
        {isActive && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div>
              <p className="text-[10px] text-zinc-400 uppercase tracking-wide font-medium mb-1">
                Success rate
              </p>
              <HealthBar value={provider.successRate} />
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 uppercase tracking-wide font-medium mb-1">
                Failure rate
              </p>
              <HealthBar
                value={provider.failureRate}
                color={provider.failureRate > 5 ? "rose" : "amber"}
              />
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 uppercase tracking-wide font-medium mb-1">
                Methods
              </p>
              <div className="flex gap-1 flex-wrap">
                {provider.supportedMethods.slice(0, 3).map((m) => (
                  <span
                    key={m}
                    className="text-[10px] bg-zinc-100 text-zinc-600 rounded-full px-2 py-0.5"
                  >
                    {m}
                  </span>
                ))}
                {provider.supportedMethods.length > 3 && (
                  <span className="text-[10px] text-zinc-400">
                    +{provider.supportedMethods.length - 3}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* Expanded: keys + config */}
      {expanded && (
        <>
          <CardDivider />
          <CardContent className="pt-4 pb-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">
                  Public Key
                </p>
                <SecretField value={provider.publicKey} />
              </div>
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">
                  Secret Key
                </p>
                <SecretField value={provider.secretKey} />
              </div>
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">
                  Webhook URL
                </p>
                <div className="flex items-center gap-2 font-mono text-[12px] bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2">
                  <Webhook size={12} className="text-zinc-400 shrink-0" />
                  <span className="flex-1 truncate text-zinc-700">
                    {provider.webhookUrl}
                  </span>
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(provider.webhookUrl)
                    }
                    className="text-zinc-400 hover:text-zinc-700 transition-colors"
                  >
                    <Copy size={13} />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">
                  Webhook Secret
                </p>
                <SecretField value={provider.webhookSecret} />
              </div>
            </div>

            {/* Fees */}
            <div className="bg-zinc-50 rounded-xl p-4">
              <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-3">
                Transaction Fees
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Card", value: provider.fees.card },
                  { label: "Bank Transfer", value: provider.fees.bank },
                  { label: "USSD", value: provider.fees.ussd },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[11px] text-zinc-400">{label}</p>
                    <p className="text-[13px] font-semibold text-zinc-800">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button variant="outline" size="sm" className="rounded-xl gap-2">
                <Settings size={13} />
                Edit Configuration
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-xl gap-2 text-zinc-500"
              >
                <ExternalLink size={13} />
                Provider Dashboard
              </Button>
              {isActive && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl gap-2 text-emerald-700"
                  onClick={async () => {
                    toast.promise(new Promise((res) => setTimeout(res, 1500)), {
                      loading: "Testing connection…",
                      success: "Connection successful!",
                      error: "Connection failed.",
                    });
                  }}
                >
                  <Zap size={13} />
                  Test Connection
                </Button>
              )}
            </div>
          </CardContent>
        </>
      )}
    </Card>
  );
}

// ─── Webhook Log Row ──────────────────────────────────────────────────────────

function WebhookRow({ log }: { log: WebhookLog }) {
  const statusConf = {
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

  const Icon = statusConf.icon;

  const eventColor: Record<string, string> = {
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
            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${statusConf.bg}`}
          >
            <Icon size={12} className={statusConf.color} />
          </div>
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${eventColor[log.event] ?? "bg-zinc-100 text-zinc-600"}`}
          >
            {log.event}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <span className="text-[12px] font-medium capitalize text-zinc-700">
          {log.provider}
        </span>
      </TableCell>
      <TableCell>
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusConf.bg} ${statusConf.color}`}
        >
          <Icon size={10} />
          {statusConf.label}
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
        <span className="text-[12px] tabular-nums">{log.responseTime}ms</span>
      </TableCell>
      {log.retries > 0 && (
        <TableCell>
          <span className="text-[11px] bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded-full">
            {log.retries} retries
          </span>
        </TableCell>
      )}
      {log.retries === 0 && <TableCell muted>—</TableCell>}
      <TableCell muted>
        <span className="text-[12px]">
          {new Date(log.createdAt).toLocaleTimeString("en-NG", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </TableCell>
      <TableCell align="right">
        <button
          onClick={() => navigator.clipboard.writeText(log.payload)}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-emerald-700 transition-colors px-2 py-1 rounded-lg hover:bg-emerald-50"
        >
          <Copy size={11} />
          Payload
        </button>
      </TableCell>
    </TableRow>
  );
}

// ─── Stats Cards ──────────────────────────────────────────────────────────────

function GatewayStats({ providers }: { providers: Provider[] | null }) {
  const activeProviders = providers?.filter((p) => p.status === "active");
  const totalVolume = providers?.reduce((s, p) => s + p.totalVolume, 0);
  const totalTxns = providers?.reduce((s, p) => s + p.totalTransactions, 0);
  const avgSuccess = activeProviders?.length
    ? activeProviders?.reduce((s, p) => s + p.successRate, 0) /
      activeProviders?.length
    : 0;

  const stats = [
    {
      label: "Active Providers",
      value: `${activeProviders?.length} / ${providers?.length}`,
      icon: Globe,
      color: "emerald",
      sub: providers?.find((p) => p.isDefault)?.name + " is default",
    },
    {
      label: "Total Volume",
      value: formatNaira(totalVolume, { compact: true }),
      icon: TrendingUp,
      color: "blue",
      sub: `${totalTxns?.toLocaleString()} transactions`,
    },
    {
      label: "Avg Success Rate",
      value: `${avgSuccess?.toFixed(1)}%`,
      icon: Activity,
      color: avgSuccess >= 95 ? "emerald" : avgSuccess >= 90 ? "amber" : "rose",
      sub: "Across active providers",
    },
    {
      label: "Webhook Health",
      value: "94.2%",
      icon: Webhook,
      color: "amber",
      sub: "Delivery success rate",
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
      {stats.map(({ label, value, icon: Icon, color, sub }) => (
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

// ─── Page ─────────────────────────────────────────────────────────────────────

type TabKey = "providers" | "webhooks" | "routing";

export default function PaymentGatewayPage() {
  const [providers, setProviders] = useState<Provider[] | null>(null);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[] | null>(null);
  const [filteredLogs, setFilteredLogs] = useState<WebhookLog[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("providers");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleToggle = useCallback(
    (id: string) => {
      HTTPS.patch(`/admin/payment-gateway/providers/${id}/toggle`).then(
        ({ data: provider }) => {
          setProviders((prev) =>
            prev?.map((p) => (p.id === id ? (provider as Provider) : p)),
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
      setProviders((prev) =>
        prev.map((p) => ({ ...p, isDefault: p.id === id })),
      );
      const p = providers?.find((x) => x.id === id);
      if (p) toast.success(`${p.name} set as default provider`);
    },
    [providers],
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // await new Promise((res) => setTimeout(res, 1200));
    const [_providers, _webhookLogs] = await Promise.all([
      HTTPS.get("/admin/payment-gateway/providers").then(({ data }) => data),
      HTTPS.get("/admin/webhook-logs").then(({ data }) => data),
    ]);
    console.log({
      _providers,
      _webhookLogs,
    });
    setProviders(_providers as Provider[]);
    setWebhookLogs(_webhookLogs as WebhookLog[]);

    setIsRefreshing(false);
    toast.success("Provider status refreshed");
  };

  useLayoutEffect(() => {
    const fetchData = async () => {
      const [_providers, _webhookLogs] = await Promise.all([
        HTTPS.get("/admin/payment-gateway/providers").then(
          ({ data }) => data ?? [],
        ),
        HTTPS.get("/admin/webhook-logs").then(({ data }) => data ?? []),
      ]);
      console.log({
        _providers,
        _webhookLogs,
      });
      setProviders(_providers as Provider[]);
      setWebhookLogs(_webhookLogs as WebhookLog[]);
    };
    fetchData();
  }, []);

  const TABS: { key: TabKey; label: string }[] = [
    { key: "providers", label: "Providers" },
    { key: "webhooks", label: "Webhook Logs" },
    { key: "routing", label: "Routing Rules" },
  ];

  const degradedCount =
    providers?.filter((p) => p.status === "degraded")?.length || 0;

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
              Payment Gateway
            </h1>
            <p className="text-zinc-500 text-sm mt-0.5">
              Manage payment providers, webhooks, and transaction routing
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

        {/* Alert banner */}
        {degradedCount > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertTriangle size={16} className="text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800 font-medium flex-1">
              {degradedCount} provider{degradedCount > 1 ? "s are" : " is"}{" "}
              experiencing degraded performance
            </p>
            <Button
              size="sm"
              variant="secondary"
              className="rounded-xl text-amber-700 bg-amber-100 hover:bg-amber-200 border-amber-200"
            >
              View details
            </Button>
          </div>
        )}

        {/* Stats */}
        <GatewayStats providers={providers} />

        {/* Tabs */}
        <Card variant="default" className="overflow-hidden">
          <div className="flex border-b border-zinc-100 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-3.5 text-[13px] font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                  activeTab === tab.key
                    ? "border-emerald-600 text-emerald-700"
                    : "border-transparent text-zinc-500 hover:text-zinc-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Providers tab ─────────────────────────────────────────────── */}
          {activeTab === "providers" && (
            <CardContent className="space-y-4 pt-5">
              {providers === null ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 size={20} className="animate-spin text-zinc-400" />
                </div>
              ) : providers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <CreditCard size={24} className="text-zinc-400" />
                  <p className="text-sm text-zinc-500">No providers found.</p>
                </div>
              ) : (
                providers.map((p) => (
                  <ProviderCard
                    key={p.id}
                    provider={p}
                    onToggle={handleToggle}
                    onSetDefault={handleSetDefault}
                  />
                ))
              )}
            </CardContent>
          )}

          {/* ── Webhooks tab ──────────────────────────────────────────────── */}
          {activeTab === "webhooks" && (
            <CardContent className="pt-4 pb-0 px-0">
              <div className="px-5 pb-4">
                <Filter
                  data={webhookLogs || []}
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
                      ],
                      match: (item, v) => (item as WebhookLog).provider === v,
                    },
                  ]}
                />
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>HTTP</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Retries</TableHead>
                      <TableHead>When</TableHead>
                      <TableHead align="right">Payload</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.length === 0 ? (
                      <TableEmpty
                        colSpan={8}
                        message="No webhook logs found."
                      />
                    ) : (
                      filteredLogs.map((log) => (
                        <WebhookRow key={log.id} log={log} />
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Summary bar */}
              <div className="flex items-center gap-6 px-5 py-3 bg-zinc-50 border-t border-zinc-100">
                {[
                  {
                    label: "Delivered",
                    count: webhookLogs?.filter((l) => l.status === "delivered")
                      .length,
                    color: "text-emerald-700",
                  },
                  {
                    label: "Failed",
                    count: webhookLogs?.filter((l) => l.status === "failed")
                      .length,
                    color: "text-red-600",
                  },
                  {
                    label: "Pending",
                    count: webhookLogs?.filter((l) => l.status === "pending")
                      .length,
                    color: "text-amber-600",
                  },
                ].map(({ label, count, color }) => (
                  <span key={label} className="text-[12px] text-zinc-500">
                    {label}:{" "}
                    <span className={`font-semibold ${color}`}>{count}</span>
                  </span>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto text-[11px] rounded-xl gap-1 text-zinc-500"
                >
                  <RefreshCw size={11} />
                  Retry all failed
                </Button>
              </div>
            </CardContent>
          )}

          {/* ── Routing tab ───────────────────────────────────────────────── */}
          {activeTab === "routing" && (
            <CardContent className="pt-5 space-y-5">
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <AlertCircle
                  size={16}
                  className="text-blue-600 shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-[13px] font-semibold text-blue-900">
                    Smart Routing
                  </p>
                  <p className="text-[12px] text-blue-700 mt-0.5">
                    AjoSave automatically routes transactions to the best
                    available provider based on success rate, response time, and
                    payment method. Configure fallback rules below.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  {
                    label: "Card payments",
                    primary: "Flutterwave",
                    fallback: "Paystack",
                    condition: "If success rate < 90%",
                  },
                  {
                    label: "Bank transfers",
                    primary: "Flutterwave",
                    fallback: "Monnify",
                    condition: "If provider is down",
                  },
                  {
                    label: "USSD payments",
                    primary: "Paystack",
                    fallback: "Flutterwave",
                    condition: "If response > 3s",
                  },
                  {
                    label: "Payouts / Withdrawals",
                    primary: "Flutterwave",
                    fallback: "Paystack",
                    condition: "If failure rate > 5%",
                  },
                ].map((rule) => (
                  <div
                    key={rule.label}
                    className="flex items-center justify-between gap-4 p-4 rounded-xl border border-zinc-200 hover:border-zinc-300 transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                        <CreditCard size={14} className="text-zinc-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-zinc-900">
                          {rule.label}
                        </p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          {rule.condition}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[12px] shrink-0">
                      <span className="bg-emerald-50 text-emerald-800 font-semibold px-2.5 py-1 rounded-lg">
                        {rule.primary}
                      </span>
                      <ChevronRight size={12} className="text-zinc-300" />
                      <span className="bg-zinc-100 text-zinc-600 font-medium px-2.5 py-1 rounded-lg">
                        {rule.fallback}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-xl gap-1 text-zinc-500 shrink-0"
                    >
                      <Settings size={12} />
                      Edit
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="rounded-xl gap-2"
                >
                  <Shield size={13} />
                  Save Routing Rules
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
