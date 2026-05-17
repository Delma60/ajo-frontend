"use client";

import { useState } from "react";
import {
  Users,
  Lock,
  Globe,
  ArrowLeft,
  ChevronRight,
  Info,
  Repeat2,
  Shuffle,
  Gavel,
  Calendar,
  DollarSign,
  UserPlus,
  Settings,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────

type Frequency = "daily" | "weekly" | "bi-weekly" | "monthly";
type PayoutOrder = "rotational" | "random" | "bidding";
type Step = 1 | 2 | 3 | 4;

interface FormData {
  name: string;
  description: string;
  isPrivate: boolean;
  contribution: string;
  frequency: Frequency;
  max_members: string;
  payout_order: PayoutOrder;
  start_date: string;
  creation_fee: string;
  rules: string[];
  imageUrl: string;
}

// ─── Step config ───────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Basics", icon: Sparkles },
  { id: 2, label: "Savings", icon: DollarSign },
  { id: 3, label: "Members", icon: Users },
  { id: 4, label: "Rules", icon: Settings },
];

// ─── Helper components ──────────────────────────────────────────────────────

function OptionCard({
  selected,
  onClick,
  icon,
  label,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col gap-2 rounded-2xl border-2 p-4 text-left transition-all duration-150 cursor-pointer",
        selected
          ? "border-emerald-700 bg-emerald-50 shadow-[0_0_0_3px_rgba(4,120,87,.08)]"
          : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50",
      )}
    >
      {selected && (
        <CheckCircle2
          size={16}
          className="absolute top-3 right-3 text-emerald-700"
        />
      )}
      <span
        className={cn(
          "inline-flex items-center justify-center w-9 h-9 rounded-xl",
          selected
            ? "bg-emerald-100 text-emerald-700"
            : "bg-zinc-100 text-zinc-500",
        )}
      >
        {icon}
      </span>
      <p
        className={cn(
          "text-[13px] font-semibold",
          selected ? "text-emerald-900" : "text-zinc-800",
        )}
      >
        {label}
      </p>
      <p className="text-[11px] text-zinc-500 leading-relaxed">{description}</p>
    </button>
  );
}

function SectionTitle({
  children,
  sub,
}: {
  children: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="mb-5">
      <h2
        className="text-[18px] font-bold text-zinc-900"
        style={{ fontFamily: "Georgia, serif" }}
      >
        {children}
      </h2>
      {sub && <p className="text-[13px] text-zinc-500 mt-0.5">{sub}</p>}
    </div>
  );
}

function FieldLabel({
  label,
  required,
  hint,
}: {
  label: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-1.5">
      <label className="text-[13px] font-medium text-zinc-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {hint && (
        <span className="text-[11px] text-zinc-400 flex items-center gap-1">
          <Info size={11} />
          {hint}
        </span>
      )}
    </div>
  );
}

// ─── Step components ────────────────────────────────────────────────────────

function Step1Basics({
  data,
  onChange,
}: {
  data: FormData;
  onChange: (k: keyof FormData, v: unknown) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionTitle sub="Give your circle a name and identity.">
        Circle basics
      </SectionTitle>

      {/* Cover / avatar placeholder */}
      <div className="relative w-full h-32 rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-600 flex flex-col items-center justify-center gap-2 cursor-pointer group border-2 border-dashed border-emerald-400/40 hover:border-emerald-400/70 transition-all">
        <ImageIcon
          size={24}
          className="text-emerald-300/60 group-hover:text-emerald-300 transition-colors"
        />
        <span className="text-[12px] text-emerald-300/60 group-hover:text-emerald-200 transition-colors font-medium">
          Upload cover image (optional)
        </span>
      </div>

      {/* Name */}
      <div>
        <FieldLabel label="Circle name" required />
        <Input
          placeholder="e.g. Lagos Tech Professionals"
          value={data.name}
          onChange={(e) => onChange("name", e.target.value)}
        />
      </div>

      {/* Description */}
      <div>
        <FieldLabel label="Description" hint="Max 200 chars" />
        <textarea
          placeholder="Briefly describe the purpose of this circle and who it's for…"
          value={data.description}
          onChange={(e) => onChange("description", e.target.value)}
          maxLength={200}
          rows={3}
          className="w-full px-3 py-2.5 rounded-xl border-[1.5px] border-zinc-200 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 leading-relaxed outline-none resize-none transition-[border-color,box-shadow] hover:border-emerald-200 focus:border-emerald-700 focus:shadow-[0_0_0_3px_rgba(26,107,82,.10)]"
        />
        <p className="text-[11px] text-zinc-400 mt-1 text-right">
          {data.description.length}/200
        </p>
      </div>

      {/* Privacy */}
      <div>
        <FieldLabel label="Visibility" required />
        <div className="grid grid-cols-2 gap-3">
          <OptionCard
            selected={!data.isPrivate}
            onClick={() => onChange("isPrivate", false)}
            icon={<Globe size={18} />}
            label="Public"
            description="Anyone on AjoSave can discover and request to join."
          />
          <OptionCard
            selected={data.isPrivate}
            onClick={() => onChange("isPrivate", true)}
            icon={<Lock size={18} />}
            label="Private"
            description="Only people with your invite code can request to join."
          />
        </div>
      </div>
    </div>
  );
}

function Step2Savings({
  data,
  onChange,
}: {
  data: FormData;
  onChange: (k: keyof FormData, v: unknown) => void;
}) {
  const frequencies: { value: Frequency; label: string; sub: string }[] = [
    { value: "daily", label: "Daily", sub: "Every day" },
    { value: "weekly", label: "Weekly", sub: "Once a week" },
    { value: "bi-weekly", label: "Bi-weekly", sub: "Every 2 weeks" },
    { value: "monthly", label: "Monthly", sub: "Once a month" },
  ];

  const payoutMethods: {
    value: PayoutOrder;
    icon: React.ReactNode;
    label: string;
    description: string;
  }[] = [
    {
      value: "rotational",
      icon: <Repeat2 size={18} />,
      label: "Rotational",
      description: "Members receive payouts in a fixed, pre-determined order.",
    },
    {
      value: "random",
      icon: <Shuffle size={18} />,
      label: "Random draw",
      description: "Each cycle, the next recipient is chosen by random draw.",
    },
    {
      value: "bidding",
      icon: <Gavel size={18} />,
      label: "Bid-based",
      description: "Members bid for early slots. Winning bids add to the pool.",
    },
  ];

  return (
    <div className="space-y-6">
      <SectionTitle sub="Define how much members contribute and when.">
        Savings settings
      </SectionTitle>

      {/* Contribution amount */}
      <div>
        <FieldLabel label="Contribution amount" required hint="Per cycle" />
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-semibold text-sm pointer-events-none">
            ₦
          </span>
          <input
            type="number"
            placeholder="e.g. 50000"
            value={data.contribution}
            onChange={(e) => onChange("contribution", e.target.value)}
            className="w-full h-10 pl-7 pr-4 rounded-xl border-[1.5px] border-zinc-200 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-[border-color,box-shadow] hover:border-emerald-200 focus:border-emerald-700 focus:shadow-[0_0_0_3px_rgba(26,107,82,.10)]"
          />
        </div>
      </div>

      {/* Frequency */}
      <div>
        <FieldLabel label="Contribution frequency" required />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {frequencies.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => onChange("frequency", f.value)}
              className={cn(
                "flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 text-center transition-all cursor-pointer",
                data.frequency === f.value
                  ? "border-emerald-700 bg-emerald-50 text-emerald-900"
                  : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300",
              )}
            >
              <span className="text-[13px] font-semibold">{f.label}</span>
              <span className="text-[10px] text-zinc-400">{f.sub}</span>
              {data.frequency === f.value && (
                <CheckCircle2 size={12} className="text-emerald-700 mt-0.5" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Payout order */}
      <div>
        <FieldLabel label="Payout method" required />
        <div className="grid grid-cols-1 gap-3">
          {payoutMethods.map((p) => (
            <OptionCard
              key={p.value}
              selected={data.payout_order === p.value}
              onClick={() => onChange("payout_order", p.value)}
              icon={p.icon}
              label={p.label}
              description={p.description}
            />
          ))}
        </div>
      </div>

      {/* Start date */}
      <div>
        <FieldLabel label="Start date" required />
        <input
          type="date"
          value={data.start_date}
          onChange={(e) => onChange("start_date", e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          className="w-full h-10 px-3 rounded-xl border-[1.5px] border-zinc-200 bg-white text-sm text-zinc-900 outline-none transition-[border-color,box-shadow] hover:border-emerald-200 focus:border-emerald-700 focus:shadow-[0_0_0_3px_rgba(26,107,82,.10)]"
        />
      </div>
    </div>
  );
}

function Step3Members({
  data,
  onChange,
}: {
  data: FormData;
  onChange: (k: keyof FormData, v: unknown) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionTitle sub="Configure membership limits and fees.">
        Member settings
      </SectionTitle>

      {/* Max members */}
      <div>
        <FieldLabel
          label="Maximum members"
          required
          hint="Including you as admin"
        />
        <div className="space-y-2">
          <input
            type="number"
            placeholder="e.g. 10"
            min={2}
            max={50}
            value={data.max_members}
            onChange={(e) => onChange("max_members", e.target.value)}
            className="w-full h-10 px-3 rounded-xl border-[1.5px] border-zinc-200 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-[border-color,box-shadow] hover:border-emerald-200 focus:border-emerald-700 focus:shadow-[0_0_0_3px_rgba(26,107,82,.10)]"
          />
          {/* Quick picks */}
          <div className="flex gap-2 flex-wrap">
            {[5, 8, 10, 12, 15, 20].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onChange("max_members", String(n))}
                className={cn(
                  "text-[12px] font-medium px-3 py-1.5 rounded-full border transition-all cursor-pointer",
                  data.max_members === String(n)
                    ? "border-emerald-700 bg-emerald-50 text-emerald-800"
                    : "border-zinc-200 text-zinc-500 hover:border-zinc-300",
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Creation fee */}
      <div>
        <FieldLabel
          label="One-time creation fee"
          hint="Charged to admin — optional"
        />
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-semibold text-sm pointer-events-none">
            ₦
          </span>
          <input
            type="number"
            placeholder="0 (no fee)"
            value={data.creation_fee}
            onChange={(e) => onChange("creation_fee", e.target.value)}
            className="w-full h-10 pl-7 pr-4 rounded-xl border-[1.5px] border-zinc-200 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-[border-color,box-shadow] hover:border-emerald-200 focus:border-emerald-700 focus:shadow-[0_0_0_3px_rgba(26,107,82,.10)]"
          />
        </div>
        <p className="text-[11px] text-zinc-400 mt-1.5 flex items-start gap-1.5">
          <Info size={11} className="mt-0.5 shrink-0" />
          This is a one-time fee paid by the admin to activate the circle on the
          platform.
        </p>
      </div>

      {/* Preview card */}
      {data.max_members && data.contribution && data.frequency && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-700/60 mb-3">
            Cycle preview
          </p>
          {[
            {
              label: "Members",
              value: `Up to ${data.max_members} people`,
            },
            {
              label: "Per cycle total",
              value: `₦${(
                Number(data.contribution) * Number(data.max_members)
              ).toLocaleString()}`,
            },
            {
              label: "Each member contributes",
              value: `₦${Number(data.contribution).toLocaleString()} / ${data.frequency}`,
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between text-[13px]"
            >
              <span className="text-zinc-500">{label}</span>
              <span className="font-semibold text-emerald-900">{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Step4Rules({
  data,
  onChange,
}: {
  data: FormData;
  onChange: (k: keyof FormData, v: unknown) => void;
}) {
  const [newRule, setNewRule] = useState("");

  function addRule() {
    const trimmed = newRule.trim();
    if (!trimmed) return;
    onChange("rules", [...data.rules, trimmed]);
    setNewRule("");
  }

  function removeRule(idx: number) {
    onChange(
      "rules",
      data.rules.filter((_, i) => i !== idx),
    );
  }

  const suggestions = [
    "Contributions must be made before the 5th of every month.",
    "Missed payments attract a 10% penalty.",
    "Payout recipients must confirm receipt within 48 hours.",
    "Members must give 2 weeks' notice before exiting.",
    "New members must be verified by the admin.",
    "Disputes are resolved by a majority vote of active members.",
  ];

  return (
    <div className="space-y-6">
      <SectionTitle sub="Set clear expectations for all members.">
        Circle rules
      </SectionTitle>

      {/* Add rule input */}
      <div>
        <FieldLabel label="Add a rule" />
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type a rule and press Add…"
            value={newRule}
            onChange={(e) => setNewRule(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addRule()}
            className="flex-1 h-10 px-3 rounded-xl border-[1.5px] border-zinc-200 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-[border-color,box-shadow] hover:border-emerald-200 focus:border-emerald-700 focus:shadow-[0_0_0_3px_rgba(26,107,82,.10)]"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addRule}
            className="rounded-xl shrink-0"
          >
            Add
          </Button>
        </div>
      </div>

      {/* Suggestions */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-2">
          Common rules
        </p>
        <div className="flex flex-wrap gap-2">
          {suggestions
            .filter((s) => !data.rules.includes(s))
            .map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onChange("rules", [...data.rules, s])}
                className="text-[11px] text-zinc-600 bg-zinc-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-transparent rounded-full px-3 py-1.5 transition-all text-left cursor-pointer"
              >
                + {s}
              </button>
            ))}
        </div>
      </div>

      {/* Rules list */}
      {data.rules.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
            Your rules ({data.rules.length})
          </p>
          {data.rules.map((rule, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 bg-white border border-zinc-200 rounded-xl group"
            >
              <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <p className="text-[13px] text-zinc-700 leading-relaxed flex-1">
                {rule}
              </p>
              <button
                type="button"
                onClick={() => removeRule(i)}
                className="text-zinc-300 hover:text-red-400 transition-colors shrink-0 mt-0.5 opacity-0 group-hover:opacity-100"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {data.rules.length === 0 && (
        <div className="rounded-2xl border border-dashed border-zinc-200 py-8 text-center">
          <p className="text-[13px] text-zinc-400">
            No rules added yet. Rules help keep members accountable.
          </p>
        </div>
      )}

      {/* Final note */}
      <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
        <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
        <p className="text-[12px] text-amber-800 leading-relaxed">
          Rules will be shown to all members before they join. Make sure they're
          clear and enforceable.
        </p>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function CreateGroupPage() {
  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [data, setData] = useState<FormData>({
    name: "",
    description: "",
    isPrivate: false,
    contribution: "",
    frequency: "monthly",
    max_members: "",
    payout_order: "rotational",
    start_date: "",
    creation_fee: "",
    rules: [],
    imageUrl: "",
  });

  function onChange(key: keyof FormData, value: unknown) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function canProceed(): boolean {
    if (step === 1) return data.name.trim().length >= 3;
    if (step === 2)
      return (
        !!data.contribution &&
        Number(data.contribution) > 0 &&
        !!data.start_date
      );
    if (step === 3) return !!data.max_members && Number(data.max_members) >= 2;
    return true;
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((res) => setTimeout(res, 1500));
    setIsSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-full bg-zinc-50/40 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} className="text-emerald-600" />
          </div>
          <div>
            <h2
              className="text-2xl font-bold text-zinc-900 mb-2"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Circle created! 🎉
            </h2>
            <p className="text-zinc-500 text-sm">
              <span className="font-semibold text-zinc-800">"{data.name}"</span>{" "}
              is live. Share your invite code with trusted members.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 space-y-3 text-left">
            {[
              {
                label: "Contribution",
                value: `₦${Number(data.contribution).toLocaleString()} / ${data.frequency}`,
              },
              { label: "Max members", value: `${data.max_members} people` },
              { label: "Payout method", value: data.payout_order },
              {
                label: "Visibility",
                value: data.isPrivate ? "Private" : "Public",
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex items-center justify-between text-[13px]"
              >
                <span className="text-zinc-400">{label}</span>
                <span className="font-semibold text-zinc-800 capitalize">
                  {value}
                </span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 flex-col sm:flex-row">
            <Button
              variant="primary"
              size="md"
              className="flex-1 rounded-xl gap-2"
            >
              <UserPlus size={16} />
              Invite members
            </Button>
            <Link href="/groups" className="flex-1">
              <Button variant="outline" size="md" className="w-full rounded-xl">
                View my circles
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-zinc-50/40">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <div>
          <Link
            href="/groups"
            className="inline-flex items-center gap-1.5 text-[13px] text-zinc-400 hover:text-zinc-700 transition-colors mb-3"
          >
            <ArrowLeft size={13} />
            Back to My Circles
          </Link>
          <h1
            className="text-2xl font-bold text-zinc-900"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Create a new circle
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            Start a rotating savings group and invite people you trust.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = s.id === step;
            const isDone = s.id < step;
            return (
              <div key={s.id} className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all",
                      isDone
                        ? "bg-emerald-700 text-white"
                        : isActive
                          ? "bg-emerald-800 text-white ring-4 ring-emerald-200"
                          : "bg-zinc-200 text-zinc-400",
                    )}
                  >
                    {isDone ? <CheckCircle2 size={14} /> : <Icon size={13} />}
                  </div>
                  <span
                    className={cn(
                      "text-[12px] font-semibold truncate hidden sm:block",
                      isActive
                        ? "text-emerald-800"
                        : isDone
                          ? "text-zinc-600"
                          : "text-zinc-400",
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 rounded-full mx-1",
                      isDone ? "bg-emerald-600" : "bg-zinc-200",
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-[0_1px_2px_rgba(0,0,0,.04)]">
          {step === 1 && <Step1Basics data={data} onChange={onChange} />}
          {step === 2 && <Step2Savings data={data} onChange={onChange} />}
          {step === 3 && <Step3Members data={data} onChange={onChange} />}
          {step === 4 && <Step4Rules data={data} onChange={onChange} />}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <Button
            type="button"
            variant="ghost"
            size="md"
            className="rounded-xl"
            onClick={() => setStep((s) => Math.max(1, s - 1) as Step)}
            disabled={step === 1}
          >
            <ArrowLeft size={16} className="mr-1" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            {/* Step dots (mobile) */}
            <div className="flex gap-1 sm:hidden">
              {STEPS.map((s) => (
                <div
                  key={s.id}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all",
                    s.id === step
                      ? "bg-emerald-700 w-4"
                      : s.id < step
                        ? "bg-emerald-400"
                        : "bg-zinc-300",
                  )}
                />
              ))}
            </div>

            {step < 4 ? (
              <Button
                type="button"
                variant="primary"
                size="md"
                className="rounded-xl gap-2"
                onClick={() => setStep((s) => Math.min(4, s + 1) as Step)}
                disabled={!canProceed()}
              >
                Continue
                <ChevronRight size={16} />
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="md"
                className="rounded-xl gap-2"
                loading={isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? "Creating circle…" : "Create circle"}
                {!isSubmitting && <CheckCircle2 size={16} />}
              </Button>
            )}
          </div>
        </div>

        {/* Step hint */}
        <p className="text-center text-[12px] text-zinc-400">
          Step {step} of {STEPS.length} ·{" "}
          {step === 4
            ? "Rules are optional but recommended"
            : step === 1
              ? "Name and privacy are required"
              : step === 2
                ? "Contribution amount and start date are required"
                : "At least 2 members required"}
        </p>
      </div>
    </div>
  );
}
