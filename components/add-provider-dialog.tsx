import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  Shield,
  Webhook,
} from "lucide-react";
import React, { useState } from "react";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "./ui/dialog";
import { useForm } from "@/lib/hooks/use-form";
import { toast } from "sonner";
import { HTTPS } from "@/lib/http";
import { Button } from "./ui/button";

type ProviderSlug = "flutterwave" | "paystack" | "monnify";
type Mode = "live" | "test";

interface Provider {
  slug: ProviderSlug | "";
  mode: Mode;
  public_key: string;
  secret_key: string;
  webhook_secret: string;
  is_default: boolean;
}
interface AddProviderFormData extends Provider {}

interface ProviderTemplate {
  slug: ProviderSlug;
  name: string;
  logoColor: string;
  logoText: string;
  description: string;
  docsUrl: string;
  keyLabels: { public: string; secret: string };
}

const PROVIDER_TEMPLATES: ProviderTemplate[] = [
  {
    slug: "flutterwave",
    name: "Flutterwave",
    logoColor: "from-orange-500 to-red-500",
    logoText: "FW",
    description:
      "Most popular Nigerian payment gateway. Supports cards, bank transfers, USSD, and mobile money.",
    docsUrl: "https://developer.flutterwave.com",
    keyLabels: {
      public: "Public Key (FLWPUBK-…)",
      secret: "Secret Key (FLWSECK-…)",
    },
  },
  {
    slug: "paystack",
    name: "Paystack",
    logoColor: "from-blue-500 to-indigo-600",
    logoText: "PS",
    description:
      "Trusted by thousands of Nigerian businesses. Excellent card and bank transfer support.",
    docsUrl: "https://paystack.com/docs",
    keyLabels: {
      public: "Public Key (pk_live_… / pk_test_…)",
      secret: "Secret Key (sk_live_… / sk_test_…)",
    },
  },
  {
    slug: "monnify",
    name: "Monnify",
    logoColor: "from-emerald-500 to-teal-600",
    logoText: "MN",
    description:
      "FCMB-backed gateway specialising in bank transfers and virtual accounts for Nigerian businesses.",
    docsUrl: "https://developers.monnify.com",
    keyLabels: { public: "API Key", secret: "Contract Code" },
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function SecretInput({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <label className="block text-[13px] font-semibold text-zinc-700">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          className="w-full h-10 px-3 pr-10 rounded-xl border border-zinc-200 text-sm font-mono text-zinc-900 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/20 transition-all placeholder:font-sans placeholder:text-zinc-400"
        />
        <button
          type="button"
          onClick={() => setShow((p) => !p)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors"
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
      {hint && <p className="text-[11px] text-zinc-400">{hint}</p>}
    </div>
  );
}

function ProviderPicker({
  selected,
  onSelect,
}: {
  selected: ProviderSlug | "";
  onSelect: (slug: ProviderSlug) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-[13px] text-zinc-500 mb-4">
        Select the payment provider you want to configure. You can add multiple
        providers and switch the default at any time.
      </p>
      {PROVIDER_TEMPLATES.map((p) => (
        <button
          key={p.slug}
          type="button"
          onClick={() => onSelect(p.slug)}
          className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl border-2 transition-all text-left ${
            selected === p.slug
              ? "border-emerald-600 bg-emerald-50/40"
              : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
          }`}
        >
          {/* Logo */}
          <div
            className={`w-11 h-11 rounded-xl bg-gradient-to-br ${p.logoColor} flex items-center justify-center shrink-0`}
          >
            <span className="text-[12px] font-bold text-white tracking-wider">
              {p.logoText}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-zinc-900 mb-0.5">
              {p.name}
            </p>
            <p className="text-[12px] text-zinc-500 leading-relaxed">
              {p.description}
            </p>
          </div>

          {/* Indicator */}
          {selected === p.slug ? (
            <div className="w-6 h-6 rounded-full bg-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 size={13} className="text-white" />
            </div>
          ) : (
            <ChevronRight size={16} className="text-zinc-300 shrink-0" />
          )}
        </button>
      ))}
    </div>
  );
}

function ProviderConfig({
  form: data,
  template,
  onChange,
}: {
  form: Provider;
  template: ProviderTemplate;
  onChange: (field: keyof Provider, value: any) => void;
}) {
  return (
    <div className="space-y-5">
      {/* Provider banner */}
      <div
        className={`flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r ${template.logoColor} text-white`}
      >
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
          <span className="text-[11px] font-bold tracking-wider">
            {template.logoText}
          </span>
        </div>
        <div>
          <p className="font-semibold text-[14px]">{template.name}</p>
          <a
            href={template.docsUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-white/70 hover:text-white transition-colors underline"
          >
            View documentation →
          </a>
        </div>
      </div>

      {/* Mode selector */}
      <div>
        <label className="block text-[13px] font-semibold text-zinc-700 mb-2">
          Environment
        </label>
        <div className="flex items-center gap-2 p-1 bg-zinc-100 rounded-xl">
          {(["live", "test"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onChange("mode", m)}
              className={`flex-1 py-2 text-[13px] font-semibold rounded-lg capitalize transition-all ${
                data?.mode === m
                  ? m === "live"
                    ? "bg-emerald-800 text-white shadow-sm"
                    : "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              {m === "live" ? "🟢 Live" : "🧪 Test"}
            </button>
          ))}
        </div>
        {data?.mode === "live" && (
          <div className="mt-2 flex items-start gap-2 text-[12px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
            <AlertCircle size={13} className="shrink-0 mt-0.5" />
            Live mode processes real transactions. Ensure your keys are correct
            before saving.
          </div>
        )}
      </div>

      {/* API Keys */}
      <SecretInput
        label={template.keyLabels.public}
        value={data?.public_key}
        onChange={(v) => onChange("public_key", v)}
        placeholder="Paste your public key here…"
        hint="Found in your provider dashboard under API Keys"
      />

      <SecretInput
        label={template.keyLabels.secret}
        value={data?.secret_key}
        onChange={(v) => onChange("secret_key", v)}
        placeholder="Paste your secret key here…"
        hint="Never share your secret key publicly"
      />

      {/* Webhook */}
      <div className="space-y-1.5">
        <label className="block text-[13px] font-semibold text-zinc-700 flex items-center gap-1.5">
          <Webhook size={13} className="text-zinc-400" />
          Webhook Secret{" "}
          <span className="text-zinc-400 font-normal">(optional)</span>
        </label>
        <div className="flex items-center gap-2 mb-2 text-[12px] text-zinc-500 bg-zinc-50 border border-zinc-100 rounded-xl px-3 py-2.5">
          <Shield size={12} className="shrink-0 text-emerald-600" />
          AjoSave will auto-configure the webhook URL. Set this secret in your
          provider dashboard to verify event signatures.
        </div>
        <SecretInput
          label=""
          value={data?.webhook_secret}
          onChange={(v) => onChange("webhook_secret", v)}
          placeholder="whsec_…"
        />
      </div>

      {/* Set as default */}
      <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-colors">
        <div className="flex items-center h-5 mt-0.5">
          <input
            type="checkbox"
            checked={data?.is_default}
            onChange={(e) => onChange("is_default", e.target.checked)}
            className="w-4 h-4 rounded text-emerald-600 border-zinc-300 focus:ring-emerald-600"
          />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-zinc-900">
            Set as default provider
          </p>
          <p className="text-[12px] text-zinc-500 mt-0.5">
            All new transactions will be routed through {template.name} by
            default.
          </p>
        </div>
      </label>
    </div>
  );
}

// ─── Step 3: Review ────────────────────────────────────────────────────────────

function ReviewStep({
  form: data,
  template,
}: {
  form: AddProviderFormData;
  template: ProviderTemplate;
}) {
  const mask = (s: string) =>
    s.length > 8
      ? s.slice(0, 8) + "•".repeat(12) + s.slice(-4)
      : "•".repeat(s.length);

  const rows = [
    { label: "Provider", value: template.name },
    {
      label: "Environment",
      value: data.mode === "live" ? "🟢 Live" : "🧪 Test",
    },
    { label: template.keyLabels.public, value: mask(data?.public_key) },
    { label: template.keyLabels.secret, value: mask(data?.secret_key) },
    {
      label: "Webhook secret",
      value: data?.webhook_secret ? mask(data?.webhook_secret) : "Not set",
    },
    { label: "Default provider", value: data?.is_default ? "Yes" : "No" },
  ];

  return (
    <div className="space-y-4">
      <p className="text-[13px] text-zinc-500">
        Review your configuration before saving. Keys are encrypted at rest and
        never exposed in plaintext.
      </p>

      <div
        className={`w-full h-1.5 rounded-full bg-gradient-to-r ${template.logoColor} mb-5`}
      />

      <div className="divide-y divide-zinc-50 rounded-xl border border-zinc-100 overflow-hidden">
        {rows.map(({ label, value }) => (
          <div
            key={label}
            className="flex items-center justify-between px-4 py-3 text-[13px] bg-white"
          >
            <span className="text-zinc-500">{label}</span>
            <span className="font-mono font-medium text-zinc-900 text-[12px] max-w-[200px] truncate text-right">
              {value}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-2 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-[12px] text-emerald-800">
        <Shield size={14} className="shrink-0 mt-0.5 text-emerald-600" />
        <p>
          Keys are encrypted using AES-256 before storage. Only the last 4
          characters are ever shown after saving.
        </p>
      </div>
    </div>
  );
}

const AddProviderDialog = ({
  children,
  title = "add Provider",
}: {
  children?: React.ReactNode;
  title?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [saving, setSaving] = useState(false);
  const {
    values: data,
    reset,
    onChange,
  } = useForm({
    initialValues: {
      slug: "",
      mode: "test",
      public_key: "",
      secret_key: "",
      webhook_secret: "",
      is_default: false,
    },
  });

  const template = PROVIDER_TEMPLATES.find((p) => p?.slug === data?.slug);

  const handleClose = () => {
    setStep(1);
    reset();
    setIsOpen(false);
  };

  const canProceed = () => {
    if (step === 1) return !!data.slug;
    if (step === 2) return !!data.public_key.trim() && !!data.secret_key.trim();
    return true;
  };

  const handleSave = async () => {
    if (!data.slug || !template) return;
    setSaving(true);
    try {
      const payload = {
        name: template.name,
        slug: data.slug,
        mode: data.mode,
        public_key: data.public_key,
        secret_key: data.secret_key,
        webhook_secret: data.webhook_secret || undefined,
        is_default: data.is_default,
        status: "active",
        supported_methods:
          data.slug === "flutterwave"
            ? ["Card", "Bank Transfer", "USSD", "Mobile Money"]
            : data.slug === "paystack"
              ? ["Card", "Bank Transfer", "USSD"]
              : ["Bank Transfer", "USSD"],
        fees:
          data.slug === "flutterwave"
            ? { card: "1.4% + ₦100", bank: "₦10", ussd: "₦10" }
            : data.slug === "paystack"
              ? { card: "1.5% + ₦100", bank: "₦10", ussd: "₦10" }
              : { card: "N/A", bank: "₦20", ussd: "₦20" },
      };

      const {
        data: resData,
        ok,
        message,
      } = await HTTPS.post<Provider>(
        "/admin/payment-gateways/providers",
        payload,
      );

      if (ok && resData) {
        toast.success(`${template.name} (${resData.mode}) added successfully.`);
        // onAdded(data);
        handleClose();
      } else {
        toast.error(
          message || "Failed to save provider. Check your keys and try again.",
        );
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const STEPS = [
    { num: 1, label: "Choose provider" },
    { num: 2, label: "Configure keys" },
    { num: 3, label: "Review & save" },
  ];

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{children ?? title}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-0">
              {STEPS.map((s, i) => (
                <React.Fragment key={s.num}>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                        step > s.num
                          ? "bg-emerald-700 text-white"
                          : step === s.num
                            ? "bg-emerald-800 text-white"
                            : "bg-zinc-100 text-zinc-400"
                      }`}
                    >
                      {step > s.num ? <CheckCircle2 size={12} /> : s.num}
                    </div>
                    <span
                      className={`text-[12px] font-medium hidden sm:block ${
                        step === s.num ? "text-zinc-900" : "text-zinc-400"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-px mx-3 transition-all ${
                        step > s.num ? "bg-emerald-400" : "bg-zinc-100"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </DialogHeader>
          <DialogBody>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {step === 1 && (
                <ProviderPicker
                  selected={data?.slug || ""}
                  onSelect={(slug) => onChange("slug", slug)}
                />
              )}
              {step === 2 && template && (
                <ProviderConfig
                  form={data}
                  template={template}
                  onChange={onChange}
                />
              )}
              {step === 3 && template && (
                <ReviewStep form={data} template={template} />
              )}
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              type="button"
              onClick={() =>
                step === 1
                  ? handleClose()
                  : setStep((s) => (s - 1) as 1 | 2 | 3)
              }
            //   className="h-10 px-5 rounded-xl border border-zinc-200 text-[13px] font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"
            >
              {step === 1 ? "Cancel" : "← Back"}
            </Button>

            {step < 3 ? (
              <Button
                type="button"
                disabled={!canProceed()}
                onClick={() => setStep((s) => (s + 1) as 2 | 3)}
                className="h-10 px-6 rounded-xl bg-emerald-800 text-white text-[13px] font-semibold hover:bg-emerald-700 disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center gap-2"
              >
                Continue
                <ChevronRight size={14} />
              </Button>
            ) : (
              <Button
                type="button"
                loading={saving}
                onClick={handleSave}
                className="h-10 px-6 rounded-xl bg-emerald-800 text-white text-[13px] font-semibold hover:bg-emerald-700 disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center gap-2"
              >
                <Shield size={14} />
                Save Provider
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddProviderDialog;
