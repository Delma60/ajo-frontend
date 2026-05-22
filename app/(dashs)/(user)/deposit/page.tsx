"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Building2,
  Phone,
  Wallet,
  ArrowLeft,
  Check,
  Copy,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { HTTPS } from "@/lib/http";
import { Auth } from "@/lib/auth";
import Link from "next/link";

// ─── Types & constants ─────────────────────────────────────────────────────────

type Method = "card" | "bank_transfer" | "ussd" | "wallet";
const PRESET_AMOUNTS = [2000, 5000, 10000, 20000, 50000, 100000];
const BANKS = [
  { name: "GTBank", code: "*737*" },
  { name: "Zenith", code: "*966*" },
  { name: "First Bank", code: "*894*" },
  { name: "Access", code: "*901*" },
  { name: "UBA", code: "*919*" },
  { name: "Opay", code: "*955*" },
];

const METHODS: {
  id: Method;
  label: string;
  sub: string;
  icon: React.ElementType;
  color: string;
}[] = [
  {
    id: "card",
    label: "Debit Card",
    sub: "Instant · Visa & Mastercard",
    icon: CreditCard,
    color: "text-violet-700 bg-violet-50",
  },
  {
    id: "bank_transfer",
    label: "Bank Transfer",
    sub: "Virtual account · Auto-credited",
    icon: Building2,
    color: "text-emerald-700 bg-emerald-50",
  },
  {
    id: "ussd",
    label: "USSD",
    sub: "Dial from any phone",
    icon: Phone,
    color: "text-amber-700 bg-amber-50",
  },
  {
    id: "wallet",
    label: "Pending Balance",
    sub: "Move to available wallet",
    icon: Wallet,
    color: "text-blue-700 bg-blue-50",
  },
];

function fmt(n: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(n);
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

// ─── Left panel: method selector + amount ─────────────────────────────────────

function LeftPanel({
  amount,
  setAmount,
  method,
  setMethod,
}: {
  amount: number;
  setAmount: (n: number) => void;
  method: Method;
  setMethod: (m: Method) => void;
}) {
  const [str, setStr] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setStr(raw ? Number(raw).toLocaleString() : "");
    setAmount(raw ? Number(raw) : 0);
  };

  return (
    <div className="space-y-8">
      {/* Amount */}
      <div>
        <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-3">
          Amount
        </p>
        <div className="relative flex flex-col items-center py-8 rounded-3xl bg-zinc-50 border-2 border-zinc-100 focus-within:border-emerald-500 focus-within:bg-emerald-50/20 transition-all">
          <span className="text-zinc-400 text-sm mb-2">
            Enter deposit amount
          </span>
          <div className="flex items-start">
            <span className="text-2xl text-zinc-400 mr-1 mt-1">₦</span>
            <input
              type="text"
              inputMode="numeric"
              value={str}
              onChange={handleChange}
              placeholder="0"
              className="bg-transparent text-6xl font-bold text-zinc-900 w-56 text-center outline-none placeholder:text-zinc-200"
              style={{ fontFamily: "Georgia,serif" }}
            />
          </div>
          {amount > 0 && amount < 500 && (
            <p className="text-xs text-rose-500 mt-2">Minimum is ₦500</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 mt-3">
          {PRESET_AMOUNTS.map((p) => (
            <button
              key={p}
              onClick={() => {
                setStr(p.toLocaleString());
                setAmount(p);
              }}
              className={`h-10 rounded-xl text-[13px] font-medium border transition-all ${amount === p ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50"}`}
            >
              {p >= 1000 ? `₦${p / 1000}k` : `₦${p}`}
            </button>
          ))}
        </div>
      </div>

      {/* Method */}
      <div>
        <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-3">
          Payment method
        </p>
        <div className="space-y-2">
          {METHODS.map((m) => {
            const Icon = m.icon;
            const active = method === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl border-2 transition-all text-left ${active ? "border-emerald-600 bg-emerald-50/60" : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"}`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${m.color}`}
                >
                  <Icon size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-zinc-900 leading-none mb-0.5">
                    {m.label}
                  </p>
                  <p className="text-[11px] text-zinc-400">{m.sub}</p>
                </div>
                {active && (
                  <div className="w-5 h-5 rounded-full bg-emerald-700 flex items-center justify-center shrink-0">
                    <Check size={11} className="text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Right panel: method-specific action ──────────────────────────────────────

function CardPanel({ amount }: { amount: number }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const userId = Auth.id();

  const handlePay = async () => {
    if (amount < 500) return;
    setLoading(true);
    setError("");
    try {
      const res = await HTTPS.post<any>("/payments/deposit", {
        amount,
        method: "card",
        user_id: userId,
        provider: "flutterwave",
      });
      const url =
        res.data?.authorization_url || res.data?.data?.link || res.data?.link;
      if (url) {
        window.location.href = url;
      } else {
        setError("Could not generate payment link.");
      }
    } catch {
      setError("An error occurred. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-100 p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
            <CreditCard size={18} className="text-violet-700" />
          </div>
          <div>
            <p className="font-semibold text-zinc-900 text-[14px]">
              Pay with debit card
            </p>
            <p className="text-[12px] text-zinc-400">Visa, Mastercard, Verve</p>
          </div>
        </div>
        <p className="text-[13px] text-zinc-500 leading-relaxed">
          You'll be redirected to a secure Flutterwave checkout page. The
          deposit will reflect instantly after payment.
        </p>
        <div className="flex items-center gap-2 text-[12px] text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          256-bit SSL encrypted
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-2"></span>
          Powered by Flutterwave
        </div>
      </div>

      {error && (
        <p className="text-sm text-rose-600 bg-rose-50 rounded-xl px-3 py-2.5 border border-rose-100">
          {error}
        </p>
      )}

      <div className="rounded-2xl bg-zinc-50 border border-zinc-100 p-4 flex items-center justify-between">
        <span className="text-[13px] text-zinc-500">Deposit amount</span>
        <span
          className="font-bold text-zinc-900"
          style={{ fontFamily: "Georgia,serif" }}
        >
          {amount > 0 ? fmt(amount) : "—"}
        </span>
      </div>

      <button
        onClick={handlePay}
        disabled={loading || amount < 500}
        className="w-full h-13 py-3.5 rounded-2xl bg-emerald-800 text-white font-semibold text-[15px] hover:bg-emerald-700 disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Processing…
          </>
        ) : (
          <>
            Pay {amount >= 500 ? fmt(amount) : "now"} <ArrowRight size={16} />
          </>
        )}
      </button>
    </div>
  );
}

function BankTransferPanel({ amount }: { amount: number }) {
  const [vb, setVb] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const userId = Auth.id();
  const { copied, copy } = useCopy(vb?.account_number ?? "");

  const generate = async () => {
    setLoading(true);
    try {
      const r = await HTTPS.post<any>("/virtual-banks/generate", {
        user_id: userId,
        amount,
      });
      if (r.data) setVb(r.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {!vb ? (
        <>
          <div className="rounded-2xl border border-zinc-100 p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Building2 size={18} className="text-emerald-700" />
              </div>
              <div>
                <p className="font-semibold text-zinc-900 text-[14px]">
                  Bank Transfer
                </p>
                <p className="text-[12px] text-zinc-400">
                  Dynamic virtual account
                </p>
              </div>
            </div>
            <p className="text-[13px] text-zinc-500 leading-relaxed">
              A unique account number will be generated. Transfer the exact
              amount to credit your wallet automatically.
            </p>
          </div>
          <div className="rounded-2xl bg-zinc-50 border border-zinc-100 p-4 flex items-center justify-between">
            <span className="text-[13px] text-zinc-500">
              Amount to transfer
            </span>
            <span className="font-bold text-zinc-900">
              {amount >= 500 ? fmt(amount) : "—"}
            </span>
          </div>
          <button
            onClick={generate}
            disabled={loading || amount < 500}
            className="w-full h-13 py-3.5 rounded-2xl bg-emerald-800 text-white font-semibold text-[15px] hover:bg-emerald-700 disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Generating…
              </>
            ) : (
              "Generate Account Number"
            )}
          </button>
        </>
      ) : (
        <>
          <div className="rounded-2xl bg-emerald-900 p-6 space-y-5 text-white">
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-emerald-400 uppercase tracking-widest font-semibold">
                Virtual Account
              </p>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 font-semibold rounded-full px-2.5 py-0.5">
                One-time
              </span>
            </div>
            <div>
              <p className="text-[11px] text-emerald-400 mb-1">Bank</p>
              <p className="font-semibold text-white text-lg">{vb.bank_name}</p>
            </div>
            <div>
              <p className="text-[11px] text-emerald-400 mb-2">
                Account Number
              </p>
              <div className="flex items-center gap-4">
                <p className="text-3xl font-mono font-bold tracking-[0.2em]">
                  {vb.account_number}
                </p>
                <button
                  onClick={copy}
                  className="text-emerald-400 hover:text-white transition-colors"
                >
                  {copied ? (
                    <Check size={18} className="text-emerald-300" />
                  ) : (
                    <Copy size={18} />
                  )}
                </button>
              </div>
            </div>
            <div className="pt-2 border-t border-emerald-800">
              <p className="text-[11px] text-emerald-400 mb-1">
                Transfer exactly
              </p>
              <p className="text-xl font-bold text-emerald-300">
                {fmt(amount)}
              </p>
            </div>
          </div>
          <p className="text-[12px] text-zinc-400 text-center leading-relaxed">
            Your wallet will be credited within seconds of receiving the
            transfer. Account expires after one use.
          </p>
        </>
      )}
    </div>
  );
}

function UssdPanel({ amount }: { amount: number }) {
  const [selectedBank, setSelectedBank] = useState(BANKS[0]);
  const code = `${selectedBank.code}${amount > 0 ? amount : ""}#`;
  const { copied, copy } = useCopy(code);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2.5">
          Your bank
        </p>
        <div className="grid grid-cols-3 gap-2">
          {BANKS.map((b) => (
            <button
              key={b.name}
              onClick={() => setSelectedBank(b)}
              className={`py-2.5 px-3 rounded-xl text-[12px] font-medium border transition-all ${selectedBank.name === b.name ? "border-amber-500 bg-amber-50 text-amber-800" : "border-zinc-200 text-zinc-600 hover:border-zinc-300"}`}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-zinc-950 p-6 space-y-3">
        <p className="text-[11px] text-zinc-500 uppercase tracking-widest">
          Dial this code
        </p>
        <div className="flex items-center justify-between">
          <p className="text-3xl font-mono font-bold text-white tracking-widest">
            {code}
          </p>
          <button
            onClick={copy}
            className="text-zinc-500 hover:text-white transition-colors p-2 rounded-lg hover:bg-zinc-800"
          >
            {copied ? (
              <Check size={18} className="text-emerald-400" />
            ) : (
              <Copy size={18} />
            )}
          </button>
        </div>
        <p className="text-[12px] text-zinc-500">
          on your <span className="text-zinc-300">{selectedBank.name}</span>{" "}
          registered line
        </p>
      </div>

      <div className="rounded-2xl bg-zinc-50 border border-zinc-100 p-4 flex items-center justify-between">
        <span className="text-[13px] text-zinc-500">Amount</span>
        <span className="font-bold text-zinc-900">
          {amount >= 500 ? fmt(amount) : "—"}
        </span>
      </div>

      {amount < 500 && (
        <p className="text-[12px] text-amber-600 text-center">
          Enter an amount above ₦500 to get your USSD code.
        </p>
      )}
    </div>
  );
}

function WalletPanel({ amount }: { amount: number }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const userId = Auth.id();

  const handleMove = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await HTTPS.post<any>("/payments/deposit", {
        amount,
        method: "wallet",
        from_pending: true,
        user_id: userId,
      });
      if (res.ok) {
        setDone(true);
      } else {
        setError(res.message || "Transfer failed.");
      }
    } catch {
      setError("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (done)
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
          <Check size={28} className="text-blue-700" />
        </div>
        <p className="text-lg font-bold text-zinc-900">Transferred!</p>
        <p className="text-sm text-zinc-500 text-center">
          {fmt(amount)} moved to your available wallet.
        </p>
        <Link
          href="/dashboard"
          className="text-sm text-emerald-700 font-medium hover:underline"
        >
          Back to dashboard
        </Link>
      </div>
    );

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-blue-50 border border-blue-200 p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Wallet size={18} className="text-blue-700" />
          </div>
          <div>
            <p className="font-semibold text-zinc-900 text-[14px]">
              Move pending balance
            </p>
            <p className="text-[12px] text-zinc-400">
              Instant internal transfer
            </p>
          </div>
        </div>
        <p className="text-[13px] text-zinc-600 leading-relaxed">
          This moves funds from your pending balance to your available wallet.
          No external payment needed.
        </p>
      </div>

      {error && (
        <p className="text-sm text-rose-600 bg-rose-50 rounded-xl px-3 py-2.5 border border-rose-100">
          {error}
        </p>
      )}

      <div className="rounded-2xl bg-zinc-50 border border-zinc-100 p-4 flex items-center justify-between">
        <span className="text-[13px] text-zinc-500">Moving</span>
        <span className="font-bold text-zinc-900">
          {amount >= 500 ? fmt(amount) : "—"}
        </span>
      </div>

      <button
        onClick={handleMove}
        disabled={loading || amount < 500}
        className="w-full py-3.5 rounded-2xl bg-blue-700 text-white font-semibold text-[15px] hover:bg-blue-600 disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Moving…
          </>
        ) : (
          "Move to Available Wallet"
        )}
      </button>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function DepositPage() {
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState<Method>("card");

  return (
    <div className="min-h-full bg-zinc-50/40 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-[13px] text-zinc-400 hover:text-zinc-700 transition-colors mb-4"
          >
            <ArrowLeft size={13} />
            Back to dashboard
          </Link>
          <h1
            className="text-3xl font-bold text-zinc-900 tracking-tight"
            style={{ fontFamily: "Georgia,serif" }}
          >
            Deposit Funds
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Add money to your AjoSave wallet.
          </p>
        </div>

        {/* Split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left */}
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm">
            <LeftPanel
              amount={amount}
              setAmount={setAmount}
              method={method}
              setMethod={setMethod}
            />
          </div>

          {/* Right */}
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm sticky top-6">
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-5">
              {METHODS.find((m) => m.id === method)?.label}
            </p>
            {method === "card" && <CardPanel amount={amount} />}
            {method === "bank_transfer" && (
              <BankTransferPanel amount={amount} />
            )}
            {method === "ussd" && <UssdPanel amount={amount} />}
            {method === "wallet" && <WalletPanel amount={amount} />}
          </div>
        </div>
      </div>
    </div>
  );
}
