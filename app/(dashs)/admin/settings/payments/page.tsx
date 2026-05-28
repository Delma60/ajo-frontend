"use client";

import React, { useLayoutEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardDivider,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Settings,
  Percent,
  Calendar,
  CreditCard,
  Shield,
  AlertTriangle,
  ChevronDown,
  Save,
  RefreshCw,
  Info,
  ToggleLeft,
  ToggleRight,
  Wallet,
  Building2,
  Smartphone,
  Banknote,
  Clock,
  TrendingUp,
  ArrowUpRight,
  CircleDollarSign,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { HTTPS } from "@/lib/http";
import {
  FeeConfig,
  ISettings,
  LimitConfig,
  MethodConfig,
  PayoutConfig,
  PenaltyConfig,
  ProviderConfig,
} from "@/lib/types/settings.types";

// ─── Types ─────────────────────────────────────────────────────────────────────

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(n);
}

// ─── Section Header ────────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
  description,
  color = "emerald",
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  color?: "emerald" | "amber" | "blue" | "rose" | "violet";
}) {
  const colorMap = {
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
    rose: "bg-rose-50 text-rose-700",
    violet: "bg-violet-50 text-violet-700",
  };

  return (
    <div className="flex items-start gap-4">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorMap[color]}`}
      >
        <Icon size={18} />
      </div>
      <div>
        <h3 className="text-[15px] font-semibold text-zinc-900">{title}</h3>
        <p className="text-[12.5px] text-zinc-500 mt-0.5 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

// ─── Number Input ──────────────────────────────────────────────────────────────

function NumberInput({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  prefix,
  suffix,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-zinc-700 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-[13px] text-zinc-400 font-medium select-none">
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`w-full h-10 rounded-xl border border-zinc-200 text-[13px] font-medium text-zinc-900 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/20 transition-all bg-white ${prefix ? "pl-8 pr-3" : suffix ? "pl-3 pr-10" : "px-3"}`}
        />
        {suffix && (
          <span className="absolute right-3 text-[13px] text-zinc-400 font-medium select-none">
            {suffix}
          </span>
        )}
      </div>
      {hint && <p className="text-[11px] text-zinc-400 mt-1">{hint}</p>}
    </div>
  );
}

// ─── Toggle Row ────────────────────────────────────────────────────────────────

function ToggleRow({
  label,
  description,
  value,
  onChange,
  danger,
}: {
  label: string;
  description?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-zinc-50 last:border-0">
      <div>
        <p
          className={`text-[13px] font-semibold ${danger ? "text-rose-700" : "text-zinc-800"}`}
        >
          {label}
        </p>
        {description && (
          <p className="text-[11.5px] text-zinc-400 mt-0.5">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className="shrink-0 transition-colors"
        aria-label={label}
      >
        {value ? (
          <ToggleRight
            size={30}
            className={danger ? "text-rose-600" : "text-emerald-600"}
          />
        ) : (
          <ToggleLeft size={30} className="text-zinc-300" />
        )}
      </button>
    </div>
  );
}

// ─── Method Toggle Card ────────────────────────────────────────────────────────

function MethodCard({
  icon: Icon,
  label,
  description,
  enabled,
  onToggle,
  color,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  color: string;
}) {
  return (
    <div
      className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer ${
        enabled
          ? "border-emerald-600 bg-emerald-50/40"
          : "border-zinc-200 bg-white hover:border-zinc-300"
      }`}
      onClick={onToggle}
    >
      {enabled && (
        <div className="absolute top-3 right-3">
          <CheckCircle2 size={16} className="text-emerald-600" />
        </div>
      )}
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}
      >
        <Icon size={16} />
      </div>
      <p className="text-[13px] font-semibold text-zinc-900">{label}</p>
      <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

// ─── Provider Badge ────────────────────────────────────────────────────────────

function ProviderBadge({
  name,
  selected,
  onClick,
}: {
  name: string;
  selected: boolean;
  onClick: () => void;
}) {
  const colors: Record<string, string> = {
    flutterwave: "from-orange-500 to-red-500",
    paystack: "from-blue-500 to-indigo-500",
    monnify: "from-emerald-500 to-teal-500",
    none: "from-zinc-400 to-zinc-500",
  };
  const initials: Record<string, string> = {
    flutterwave: "FW",
    paystack: "PS",
    monnify: "MN",
    none: "—",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all w-full ${
        selected
          ? "border-emerald-600 bg-emerald-50/40"
          : "border-zinc-200 hover:border-zinc-300 bg-white"
      }`}
    >
      <div
        className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colors[name]} flex items-center justify-center text-[10px] font-bold text-white shrink-0`}
      >
        {initials[name]}
      </div>
      <span className="text-[13px] font-semibold text-zinc-800 capitalize">
        {name}
      </span>
      {selected && (
        <CheckCircle2 size={14} className="text-emerald-600 ml-auto" />
      )}
    </button>
  );
}

// ─── Unsaved Banner ────────────────────────────────────────────────────────────

function UnsavedBanner({
  onSave,
  onDiscard,
  saving,
}: {
  onSave: () => void;
  onDiscard: () => void;
  saving: boolean;
}) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-zinc-900 text-white px-6 py-3.5 rounded-2xl shadow-xl">
      <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
      <p className="text-[13px] font-medium">You have unsaved changes</p>
      <div className="flex items-center gap-2 ml-2">
        <button
          onClick={onDiscard}
          className="text-[12px] text-zinc-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10"
        >
          Discard
        </button>
        <Button
          variant="primary"
          size="sm"
          className="rounded-xl gap-1.5 bg-emerald-600 hover:bg-emerald-500 border-0"
          loading={saving}
          onClick={onSave}
        >
          <Save size={12} />
          Save changes
        </Button>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

const SECTIONS = [
  { key: "fees", label: "Platform Fees", icon: Percent },
  { key: "payouts", label: "Payout Schedule", icon: Calendar },
  { key: "limits", label: "Contribution Limits", icon: CircleDollarSign },
  { key: "penalties", label: "Penalty Rules", icon: Shield },
  { key: "methods", label: "Payment Methods", icon: CreditCard },
  { key: "provider", label: "Provider Routing", icon: Settings },
] as const;

type SectionKey = (typeof SECTIONS)[number]["key"];

export default function AdminPaymentSettingsPage() {
  const [activeSection, setActiveSection] = useState<SectionKey>("fees");
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ── State ──────────────────────────────────────────────────────────────────

  const [fees, setFees] = useState<FeeConfig | null>(null);

  const [payouts, setPayouts] = useState<PayoutConfig | null>(null);

  const [limits, setLimits] = useState<LimitConfig | null>(null);

  const [penalties, setPenalties] = useState<PenaltyConfig | null>(null);

  const [methods, setMethods] = useState<MethodConfig | null>(null);

  const [provider, setProvider] = useState<ProviderConfig | null>(null);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const markDirty = () => setIsDirty(true);

  const updateFees = (patch: Partial<FeeConfig>) => {
    setFees((prev) => ({ ...prev, ...patch }));
    markDirty();
  };
  const updatePayouts = (patch: Partial<PayoutConfig>) => {
    setPayouts((prev) => ({ ...prev, ...patch }));
    markDirty();
  };
  const updateLimits = (patch: Partial<LimitConfig>) => {
    setLimits((prev) => ({ ...prev, ...patch }));
    markDirty();
  };
  const updatePenalties = (patch: Partial<PenaltyConfig>) => {
    setPenalties((prev) => ({ ...prev, ...patch }));
    markDirty();
  };
  const updateMethods = (patch: Partial<MethodConfig>) => {
    setMethods((prev) => ({ ...prev, ...patch }));
    markDirty();
  };
  const updateProvider = (patch: Partial<ProviderConfig>) => {
    setProvider((prev) => ({ ...prev, ...patch }));
    markDirty();
  };

  const handleSave = async () => {
      setIsSaving(true);
    try {
        await HTTPS.post("/settings")
    } catch (error) {
        
    }
    // Simulate API call
    // await new Promise((r) => setTimeout(r, 1200));

    setIsSaving(false);
    setIsDirty(false);
    toast.success("Payment settings saved successfully.");
  };

  const handleDiscard = () => {
    setIsDirty(false);
    toast.info("Changes discarded.");
  };

  //   reset default
  const handleReset = async () => {
    setIsRefreshing(true);
    try {
      await fetchPaymentSettings();
      toast.info("Settings refreshed from server.");
    } catch (error) {
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchPaymentSettings = async () => {
    try {
      const { data } = await HTTPS.get<ISettings>("/admin/settings/app");
      setFees(data?.fees || null);
      setPayouts(data?.payout || null);
      setLimits(data?.limits || null);
      setPenalties(data?.penalties || null);
      setMethods(data?.payment_methods || null);
      setProvider(data?.provider || null);
      console.log(data)
    } catch (e) {}
  };

  useLayoutEffect(() => {
    fetchPaymentSettings();
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-full bg-zinc-50/40 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1
              className="text-2xl font-bold text-zinc-900 tracking-tight"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Payment Settings
            </h1>
            <p className="text-zinc-500 text-sm mt-0.5">
              Configure platform fees, limits, payout rules, and routing
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="gap-1.5 rounded-xl"
            onClick={handleReset}
          >
            <RefreshCw size={14} />
            Reset to defaults
          </Button>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-3 px-4 py-3.5 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[12.5px] text-amber-800 leading-relaxed">
            Changes to these settings affect all active groups and future
            transactions immediately. Review carefully before saving.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 items-start">
          {/* Sidebar nav */}
          <Card variant="default" className="sticky top-6 overflow-hidden">
            <CardContent className="p-2">
              {SECTIONS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveSection(key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                    activeSection === key
                      ? "bg-emerald-50 text-emerald-800"
                      : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50"
                  }`}
                >
                  <Icon
                    size={15}
                    className={
                      activeSection === key
                        ? "text-emerald-600"
                        : "text-zinc-400"
                    }
                  />
                  {label}
                  {activeSection === key && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  )}
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Main panel */}
          <div className="space-y-5">
            {/* ── Platform Fees ──────────────────────────────────────────── */}
            {activeSection === "fees" && (
              <>
                <Card variant="default">
                  <CardHeader>
                    <SectionHeader
                      icon={Percent}
                      title="Platform Fees"
                      description="Configure how the platform earns revenue from transactions. Fees are applied automatically."
                      color="emerald"
                    />
                  </CardHeader>
                  <CardDivider />
                  <CardContent className="space-y-5 pt-5">
                    {/* Fee preview */}
                    <div className="grid grid-cols-3 gap-3 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                      {[
                        {
                          label: "Creation fee",
                          value: `${fees?.creation_fee_pct}%`,
                        },
                        {
                          label: "Withdrawal fee",
                          value: `${fees?.withdrawal_fee_pct}%`,
                        },
                        {
                          label: "Referral reward",
                          value: fmt(fees?.referral_reward || 0),
                        },
                      ].map(({ label, value }) => (
                        <div key={label} className="text-center">
                          <p
                            className="text-[18px] font-bold text-emerald-700"
                            style={{ fontFamily: "Georgia, serif" }}
                          >
                            {value}
                          </p>
                          <p className="text-[10px] text-zinc-400 uppercase tracking-wide font-medium mt-0.5">
                            {label}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <NumberInput
                        label="Circle creation fee (%)"
                        value={fees?.creation_fee_pct || 0}
                        onChange={(v) => updateFees({ creation_fee_pct: v })}
                        min={0}
                        max={20}
                        step={0.5}
                        suffix="%"
                        hint="Charged once when a circle is created (% of first contribution)"
                      />
                      <NumberInput
                        label="Contribution fee (%)"
                        value={fees?.contribution_fee_pct || 0}
                        onChange={(v) =>
                          updateFees({ contribution_fee_pct: v })
                        }
                        min={0}
                        max={10}
                        step={0.1}
                        suffix="%"
                        hint="Applied to each member contribution. Set 0 for free."
                      />
                      <NumberInput
                        label="Withdrawal fee (%)"
                        value={fees?.withdrawal_fee_pct || 0}
                        onChange={(v) => updateFees({ withdrawal_fee_pct: v })}
                        min={0}
                        max={10}
                        step={0.1}
                        suffix="%"
                        hint="Percentage fee on withdrawal amount"
                      />
                      <NumberInput
                        label="Withdrawal flat fee (₦)"
                        value={fees?.withdrawal_fee_flat || 0}
                        onChange={(v) => updateFees({ withdrawal_fee_flat: v })}
                        min={0}
                        prefix="₦"
                        hint="Fixed fee added to every withdrawal"
                      />
                      <NumberInput
                        label="Withdrawal fee cap (₦)"
                        value={fees?.withdrawal_fee_cap || 0}
                        onChange={(v) => updateFees({ withdrawal_fee_cap: v })}
                        min={0}
                        prefix="₦"
                        hint="Maximum fee charged per withdrawal"
                      />
                      <NumberInput
                        label="Top-up fee (%)"
                        value={fees?.topup_fee_pct || 0}
                        onChange={(v) => updateFees({ topup_fee_pct: v })}
                        min={0}
                        max={5}
                        step={0.1}
                        suffix="%"
                        hint="Fee applied to wallet top-ups. Set 0 for free."
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card variant="default">
                  <CardHeader>
                    <SectionHeader
                      icon={TrendingUp}
                      title="Referral Programme"
                      description="Reward users who bring new members to the platform."
                      color="blue"
                    />
                  </CardHeader>
                  <CardDivider />
                  <CardContent className="pt-5">
                    <NumberInput
                      label="Referral reward amount (₦)"
                      value={fees?.referral_reward || 0}
                      onChange={(v) => updateFees({ referral_reward: v })}
                      min={0}
                      prefix="₦"
                      hint="Amount credited to referrer when referred user hits the spending threshold"
                    />
                  </CardContent>
                </Card>
              </>
            )}

            {/* ── Payout Schedule ────────────────────────────────────────── */}
            {activeSection === "payouts" && (
              <Card variant="default">
                <CardHeader>
                  <SectionHeader
                    icon={Calendar}
                    title="Payout Schedule & Processing"
                    description="Control when and how cycle payouts are triggered and processed."
                    color="blue"
                  />
                </CardHeader>
                <CardDivider />
                <CardContent className="space-y-5 pt-5">
                  {/* Payout timing */}
                  <div>
                    <p className="text-[12px] font-semibold text-zinc-500 uppercase tracking-wide mb-3">
                      Payout Timing
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {(["same_day", "next_day", "scheduled"] as const).map(
                        (opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => updatePayouts({ payout_day: opt })}
                            className={`p-3 rounded-xl border-2 text-left transition-all ${
                              payouts?.payout_day === opt
                                ? "border-emerald-600 bg-emerald-50/40"
                                : "border-zinc-200 hover:border-zinc-300"
                            }`}
                          >
                            <p className="text-[13px] font-semibold text-zinc-900 capitalize">
                              {opt.replace("_", " ")}
                            </p>
                            <p className="text-[11px] text-zinc-400 mt-0.5">
                              {opt === "same_day" &&
                                "Pay out on the cycle date"}
                              {opt === "next_day" &&
                                "Pay out the following day"}
                              {opt === "scheduled" &&
                                "Custom processing window"}
                            </p>
                          </button>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <NumberInput
                      label="Processing window (hours)"
                      value={payouts?.processing_window_hours || 0}
                      onChange={(v) =>
                        updatePayouts({ processing_window_hours: v })
                      }
                      min={1}
                      max={72}
                      suffix="hrs"
                      hint="Max time allowed for payout to complete"
                    />
                    <NumberInput
                      label="Cycle grace period (hours)"
                      value={payouts?.cycle_grace_period_hours || 0}
                      onChange={(v) =>
                        updatePayouts({ cycle_grace_period_hours: v })
                      }
                      min={0}
                      max={168}
                      suffix="hrs"
                      hint="Extra time before a cycle is marked overdue"
                    />
                    <NumberInput
                      label="Max payout per cycle (₦)"
                      value={payouts?.max_payout_per_cycle || 0}
                      onChange={(v) =>
                        updatePayouts({ max_payout_per_cycle: v })
                      }
                      min={0}
                      prefix="₦"
                      hint="Safety cap on single cycle payout. 0 = unlimited."
                    />
                    <NumberInput
                      label="Min pool before payout (₦)"
                      value={payouts?.min_pool_before_payout || 0}
                      onChange={(v) =>
                        updatePayouts({ min_pool_before_payout: v })
                      }
                      min={0}
                      prefix="₦"
                      hint="Payout only triggers after pool reaches this amount"
                    />
                  </div>

                  <div className="border border-zinc-100 rounded-2xl divide-y divide-zinc-50 overflow-hidden">
                    <div className="px-4">
                      <ToggleRow
                        label="Auto-trigger cycle payouts"
                        description="Automatically process payouts when a cycle completes, without manual admin action"
                        value={payouts?.auto_trigger || false}
                        onChange={(v) => updatePayouts({ auto_trigger: v })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── Contribution Limits ─────────────────────────────────────── */}
            {activeSection === "limits" && (
              <Card variant="default">
                <CardHeader>
                  <SectionHeader
                    icon={CircleDollarSign}
                    title="Contribution & Withdrawal Limits"
                    description="Set floor and ceiling values to protect users and manage platform risk."
                    color="amber"
                  />
                </CardHeader>
                <CardDivider />
                <CardContent className="space-y-6 pt-5">
                  <div>
                    <p className="text-[12px] font-semibold text-zinc-400 uppercase tracking-wide mb-3">
                      Contributions
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <NumberInput
                        label="Minimum contribution (₦)"
                        value={limits?.min_contribution || 0}
                        onChange={(v) => updateLimits({ min_contribution: v })}
                        min={0}
                        prefix="₦"
                        hint="Smallest allowed contribution per cycle"
                      />
                      <NumberInput
                        label="Maximum contribution (₦)"
                        value={limits?.max_contribution || 0}
                        onChange={(v) => updateLimits({ max_contribution: v })}
                        min={0}
                        prefix="₦"
                        hint="Largest allowed contribution per cycle"
                      />
                    </div>
                  </div>

                  <div>
                    <p className="text-[12px] font-semibold text-zinc-400 uppercase tracking-wide mb-3">
                      Withdrawals
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <NumberInput
                        label="Minimum withdrawal (₦)"
                        value={limits?.min_withdrawal || 0}
                        onChange={(v) => updateLimits({ min_withdrawal: v })}
                        min={0}
                        prefix="₦"
                        hint="Smallest withdrawal amount allowed"
                      />
                      <NumberInput
                        label="Max withdrawal per day (₦)"
                        value={limits?.max_withdrawal_daily || 0}
                        onChange={(v) =>
                          updateLimits({ max_withdrawal_daily: v })
                        }
                        min={0}
                        prefix="₦"
                        hint="Rolling 24-hour cap per user"
                      />
                    </div>
                  </div>

                  <div>
                    <p className="text-[12px] font-semibold text-zinc-400 uppercase tracking-wide mb-3">
                      Group Size & Cycles
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <NumberInput
                        label="Min group size"
                        value={limits?.min_group_size || 0}
                        onChange={(v) => updateLimits({ min_group_size: v })}
                        min={2}
                        max={10}
                        suffix="members"
                      />
                      <NumberInput
                        label="Max group size"
                        value={limits?.max_group_size || 0}
                        onChange={(v) => updateLimits({ max_group_size: v })}
                        min={2}
                        max={500}
                        suffix="members"
                      />
                      <NumberInput
                        label="Max cycles per group"
                        value={limits?.max_cycles_per_group || 0}
                        onChange={(v) =>
                          updateLimits({ max_cycles_per_group: v })
                        }
                        min={1}
                        suffix="cycles"
                        hint="Maximum before group auto-closes"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── Penalty Rules ───────────────────────────────────────────── */}
            {activeSection === "penalties" && (
              <Card variant="default">
                <CardHeader>
                  <SectionHeader
                    icon={Shield}
                    title="Penalty & Defaulter Rules"
                    description="Define consequences for late or missed contributions to keep circles fair."
                    color="rose"
                  />
                </CardHeader>
                <CardDivider />
                <CardContent className="space-y-5 pt-5">
                  {/* Preview */}
                  <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                    <Info size={14} className="text-rose-600 shrink-0 mt-0.5" />
                    <p className="text-[12px] text-rose-700 leading-relaxed">
                      A member contributing ₦50,000 late will be charged{" "}
                      <strong>
                        ₦
                        {(
                          (50000 * (penalties?.late_payment_fee_pct || 0)) /
                          100
                        ).toLocaleString()}
                      </strong>{" "}
                      after <strong>{penalties?.grace_period_hours}h</strong>{" "}
                      grace period. After{" "}
                      <strong>{penalties?.max_defaults_before_removal}</strong>{" "}
                      defaults, they
                      {penalties?.auto_remove_on_default
                        ? " will be removed automatically"
                        : " will be reviewed by admin"}
                      .
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <NumberInput
                      label="Late payment penalty (%)"
                      value={penalties?.late_payment_fee_pct || 0}
                      onChange={(v) =>
                        updatePenalties({ late_payment_fee_pct: v })
                      }
                      min={0}
                      max={50}
                      step={0.5}
                      suffix="%"
                      hint="% of contribution amount charged as penalty"
                    />
                    <NumberInput
                      label="Grace period (hours)"
                      value={penalties?.grace_period_hours || 0}
                      onChange={(v) =>
                        updatePenalties({ grace_period_hours: v })
                      }
                      min={0}
                      max={168}
                      suffix="hrs"
                      hint="Window after due date before penalty kicks in"
                    />
                    <NumberInput
                      label="Penalty applies after (hours)"
                      value={penalties?.penalty_applies_after_hours || 0}
                      onChange={(v) =>
                        updatePenalties({ penalty_applies_after_hours: v })
                      }
                      min={0}
                      suffix="hrs"
                      hint="Total hours past due before penalty is applied"
                    />
                    <NumberInput
                      label="Max defaults before action"
                      value={penalties?.max_defaults_before_removal || 0}
                      onChange={(v) =>
                        updatePenalties({ max_defaults_before_removal: v })
                      }
                      min={1}
                      max={10}
                      suffix="defaults"
                      hint="Consecutive defaults before auto or manual action"
                    />
                  </div>

                  <div className="border border-zinc-100 rounded-2xl divide-y divide-zinc-50 overflow-hidden px-4">
                    <ToggleRow
                      label="Freeze account on default"
                      description="Prevent withdrawals and new circle joins when a member defaults"
                      value={penalties?.freeze_on_default || false}
                      onChange={(v) =>
                        updatePenalties({ freeze_on_default: v })
                      }
                    />
                    <ToggleRow
                      label="Auto-remove on max defaults"
                      description="Automatically remove member from circle when default limit is hit"
                      value={penalties?.auto_remove_on_default || false}
                      onChange={(v) =>
                        updatePenalties({ auto_remove_on_default: v })
                      }
                      danger
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── Payment Methods ─────────────────────────────────────────── */}
            {activeSection === "methods" && (
              <Card variant="default">
                <CardHeader>
                  <SectionHeader
                    icon={CreditCard}
                    title="Supported Payment Methods"
                    description="Choose which payment methods are available to users across the platform."
                    color="violet"
                  />
                </CardHeader>
                <CardDivider />
                <CardContent className="pt-5 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <MethodCard
                      icon={CreditCard}
                      label="Debit Card"
                      description="Visa, Mastercard & Verve. Instant processing."
                      enabled={methods?.card || false}
                      onToggle={() => updateMethods({ card: !methods?.card })}
                      color="bg-violet-50 text-violet-700"
                    />
                    <MethodCard
                      icon={Building2}
                      label="Bank Transfer"
                      description="Virtual account. Auto-credited on receipt."
                      enabled={methods?.bank_transfer || false}
                      onToggle={() =>
                        updateMethods({
                          bank_transfer: !methods?.bank_transfer,
                        })
                      }
                      color="bg-emerald-50 text-emerald-700"
                    />
                    <MethodCard
                      icon={Smartphone}
                      label="USSD"
                      description="Dial codes from any registered phone line."
                      enabled={methods?.ussd || false}
                      onToggle={() => updateMethods({ ussd: !methods?.ussd })}
                      color="bg-amber-50 text-amber-700"
                    />
                    <MethodCard
                      icon={Wallet}
                      label="Wallet Balance"
                      description="Pay contributions from available wallet."
                      enabled={methods?.wallet || false}
                      onToggle={() =>
                        updateMethods({ wallet: !methods?.wallet })
                      }
                      color="bg-blue-50 text-blue-700"
                    />
                    <MethodCard
                      icon={Banknote}
                      label="Mobile Money"
                      description="Opay, PalmPay and other mobile wallets."
                      enabled={methods?.mobile_money || false}
                      onToggle={() =>
                        updateMethods({ mobile_money: !methods?.mobile_money })
                      }
                      color="bg-zinc-100 text-zinc-600"
                    />
                  </div>

                  <div className="flex items-center gap-2 px-3 py-2.5 bg-zinc-50 rounded-xl border border-zinc-100">
                    <Lock size={13} className="text-zinc-400" />
                    <p className="text-[11.5px] text-zinc-500">
                      At least one method must remain active. Disabling a method
                      only affects new transactions — existing pending ones are
                      unaffected.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── Provider Routing ────────────────────────────────────────── */}
            {activeSection === "provider" && (
              <>
                <Card variant="default">
                  <CardHeader>
                    <SectionHeader
                      icon={Settings}
                      title="Default Payment Provider"
                      description="Select the primary provider for processing all transactions on the platform."
                      color="emerald"
                    />
                  </CardHeader>
                  <CardDivider />
                  <CardContent className="pt-5 space-y-3">
                    {(["flutterwave", "paystack", "monnify"] as const).map(
                      (p) => (
                        <ProviderBadge
                          key={p}
                          name={p}
                          selected={provider?.default_provider === p}
                          onClick={() =>
                            updateProvider({ default_provider: p })
                          }
                        />
                      ),
                    )}
                  </CardContent>
                </Card>

                <Card variant="default">
                  <CardHeader>
                    <SectionHeader
                      icon={ArrowUpRight}
                      title="Fallback & Auto-Failover"
                      description="Automatically switch to a backup provider when the primary experiences issues."
                      color="amber"
                    />
                  </CardHeader>
                  <CardDivider />
                  <CardContent className="pt-5 space-y-5">
                    <div className="border border-zinc-100 rounded-2xl px-4 divide-y divide-zinc-50">
                      <ToggleRow
                        label="Enable auto-failover"
                        description="Automatically route to fallback provider when success rate drops below threshold"
                        value={provider?.auto_failover || false}
                        onChange={(v) => updateProvider({ auto_failover: v })}
                      />
                    </div>

                    {provider?.auto_failover && (
                      <>
                        <div>
                          <p className="text-[12px] font-semibold text-zinc-500 uppercase tracking-wide mb-3">
                            Fallback Provider
                          </p>
                          <div className="space-y-2">
                            {(
                              [
                                "flutterwave",
                                "paystack",
                                "monnify",
                                "none",
                              ] as const
                            )
                              .filter((p) => p !== provider?.default_provider)
                              .map((p) => (
                                <ProviderBadge
                                  key={p}
                                  name={p}
                                  selected={provider?.fallback_provider === p}
                                  onClick={() =>
                                    updateProvider({ fallback_provider: p })
                                  }
                                />
                              ))}
                          </div>
                        </div>

                        <NumberInput
                          label="Failover threshold (%)"
                          value={provider?.failover_threshold_pct}
                          onChange={(v) =>
                            updateProvider({ failover_threshold_pct: v })
                          }
                          min={50}
                          max={100}
                          step={1}
                          suffix="%"
                          hint="Switch to fallback when primary success rate drops below this value"
                        />
                      </>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Unsaved changes banner */}
      {isDirty && (
        <UnsavedBanner
          onSave={handleSave}
          onDiscard={handleDiscard}
          saving={isSaving}
        />
      )}
    </div>
  );
}
