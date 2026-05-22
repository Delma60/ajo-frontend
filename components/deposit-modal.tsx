"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, CreditCard, Building2, Phone, Wallet, ChevronRight, Check, Copy, RefreshCw, ArrowRight } from "lucide-react";
import { HTTPS } from "@/lib/http";
import { Auth } from "@/lib/auth";

// ─── Types ─────────────────────────────────────────────────────────────────────

type Method = "card" | "bank_transfer" | "ussd" | "wallet";

interface VirtualBank {
  bank_name: string;
  account_number: string;
}

const PRESET_AMOUNTS = [2000, 5000, 10000, 20000, 50000, 100000];

const METHODS: { id: Method; label: string; sub: string; icon: React.ElementType }[] = [
  { id: "card",          label: "Debit Card",       sub: "Instant · Visa / Mastercard",   icon: CreditCard  },
  { id: "bank_transfer", label: "Bank Transfer",     sub: "Dynamic virtual account",       icon: Building2   },
  { id: "ussd",          label: "USSD",              sub: "Dial on any phone",              icon: Phone       },
  { id: "wallet",        label: "From Pending",      sub: "Move pending balance",           icon: Wallet      },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(n);
}

function useCopy(text: string) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return { copied, copy };
}

// ─── Sub-screens ───────────────────────────────────────────────────────────────

function CardStep({ amount, onDone, onCancel }: { amount: number; onDone: () => void; onCancel: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const userId = Auth.id();

  const handlePay = async () => {
    setLoading(true); setError("");
    try {
      const res = await HTTPS.post<any>("/payments/deposit", {
        amount, method: "card", user_id: userId, provider: "flutterwave",
      });
      const url = res.data?.authorization_url || res.data?.data?.link || res.data?.link;
      if (url) { window.location.href = url; } else { setError("Could not generate payment link."); }
    } catch { setError("An error occurred. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-zinc-50 border border-zinc-100 p-5 space-y-3">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">You're depositing</p>
        <p className="text-3xl font-bold text-zinc-900" style={{ fontFamily: "Georgia,serif" }}>{fmt(amount)}</p>
        <p className="text-[13px] text-zinc-500">You'll be redirected to a secure Flutterwave checkout to complete payment with your debit card.</p>
      </div>
      {error && <p className="text-sm text-rose-600 bg-rose-50 rounded-xl px-3 py-2.5">{error}</p>}
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 h-11 rounded-xl border border-zinc-200 text-zinc-600 text-sm font-medium hover:bg-zinc-50 transition-colors">Back</button>
        <button onClick={handlePay} disabled={loading} className="flex-1 h-11 rounded-xl bg-emerald-800 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
          {loading ? <><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Processing…</> : <>Pay {fmt(amount)} <ArrowRight size={15} /></>}
        </button>
      </div>
    </div>
  );
}

function BankTransferStep({ amount, onCancel }: { amount: number; onCancel: () => void }) {
  const [vb, setVb] = useState<VirtualBank | null>(null);
  const [loading, setLoading] = useState(true);
  const userId = Auth.id();
  const { copied, copy } = useCopy(vb?.account_number ?? "");

  useEffect(() => {
    HTTPS.post<any>("/virtual-banks/generate", { user_id: userId, amount })
      .then(r => { if (r.data) setVb(r.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="h-32 flex items-center justify-center">
          <span className="h-6 w-6 rounded-full border-2 border-emerald-300 border-t-emerald-700 animate-spin" />
        </div>
      ) : vb ? (
        <>
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">Virtual Account</p>
              <span className="text-[10px] bg-amber-100 text-amber-700 font-semibold rounded-full px-2.5 py-0.5">One-time use</span>
            </div>
            <div>
              <p className="text-[11px] text-zinc-400 mb-1">Bank</p>
              <p className="font-semibold text-zinc-900">{vb.bank_name}</p>
            </div>
            <div>
              <p className="text-[11px] text-zinc-400 mb-1">Account Number</p>
              <div className="flex items-center gap-3">
                <p className="text-2xl font-mono font-bold text-zinc-900 tracking-widest">{vb.account_number}</p>
                <button onClick={copy} className="text-zinc-400 hover:text-emerald-700 transition-colors">
                  {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                </button>
              </div>
            </div>
            <div>
              <p className="text-[11px] text-zinc-400 mb-1">Amount</p>
              <p className="font-bold text-emerald-700 text-lg">{fmt(amount)}</p>
            </div>
          </div>
          <p className="text-[12px] text-zinc-400 text-center leading-relaxed">Transfer exactly <strong className="text-zinc-700">{fmt(amount)}</strong> to this account. Your wallet will be credited automatically.</p>
        </>
      ) : (
        <p className="text-sm text-zinc-500 text-center py-6">Could not generate account. Please try again.</p>
      )}
      <button onClick={onCancel} className="w-full h-11 rounded-xl border border-zinc-200 text-zinc-600 text-sm font-medium hover:bg-zinc-50 transition-colors">Back</button>
    </div>
  );
}

function UssdStep({ amount, onCancel }: { amount: number; onCancel: () => void }) {
  const BANKS = [
    { name: "GTBank", code: "*737*" },
    { name: "Zenith Bank", code: "*966*" },
    { name: "First Bank", code: "*894*" },
    { name: "Access Bank", code: "*901*" },
    { name: "UBA", code: "*919*" },
  ];
  const [selected, setSelected] = useState(BANKS[0]);
  const ussdCode = `${selected.code}${amount}#`;
  const { copied, copy } = useCopy(ussdCode);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2.5">Select your bank</p>
        <div className="grid grid-cols-2 gap-2">
          {BANKS.map(b => (
            <button key={b.name} onClick={() => setSelected(b)}
              className={`px-3 py-2.5 rounded-xl text-[13px] font-medium text-left transition-all border ${selected.name === b.name ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "border-zinc-200 text-zinc-600 hover:border-zinc-300"}`}>
              {b.name}
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-2xl bg-zinc-900 p-5 space-y-2">
        <p className="text-xs text-zinc-500 uppercase tracking-widest">Dial this code</p>
        <div className="flex items-center justify-between">
          <p className="text-2xl font-mono font-bold text-white tracking-widest">{ussdCode}</p>
          <button onClick={copy} className="text-zinc-400 hover:text-white transition-colors">
            {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
          </button>
        </div>
        <p className="text-[12px] text-zinc-400">on your registered {selected.name} phone number</p>
      </div>
      <p className="text-[12px] text-zinc-400 text-center">Deposit amount: <strong className="text-zinc-700">{fmt(amount)}</strong></p>
      <button onClick={onCancel} className="w-full h-11 rounded-xl border border-zinc-200 text-zinc-600 text-sm font-medium hover:bg-zinc-50 transition-colors">Back</button>
    </div>
  );
}

function WalletStep({ amount, onDone, onCancel }: { amount: number; onDone: () => void; onCancel: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const userId = Auth.id();

  const handleMove = async () => {
    setLoading(true); setError("");
    try {
      const res = await HTTPS.post<any>("/payments/deposit", {
        amount, method: "wallet", from_pending: true, user_id: userId,
      });
      if (res.ok) { onDone(); } else { setError(res.message || "Transfer failed."); }
    } catch { setError("An error occurred."); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-blue-50 border border-blue-200 p-5 space-y-2">
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest">Pending → Available</p>
        <p className="text-3xl font-bold text-zinc-900" style={{ fontFamily: "Georgia,serif" }}>{fmt(amount)}</p>
        <p className="text-[13px] text-blue-700">This will move funds from your pending balance to your available wallet immediately.</p>
      </div>
      {error && <p className="text-sm text-rose-600 bg-rose-50 rounded-xl px-3 py-2.5">{error}</p>}
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 h-11 rounded-xl border border-zinc-200 text-zinc-600 text-sm font-medium hover:bg-zinc-50 transition-colors">Back</button>
        <button onClick={handleMove} disabled={loading} className="flex-1 h-11 rounded-xl bg-blue-700 text-white text-sm font-semibold hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
          {loading ? <><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Moving…</> : "Move Funds"}
        </button>
      </div>
    </div>
  );
}

// ─── Main Modal ────────────────────────────────────────────────────────────────

export interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DepositModal({ isOpen, onClose, onSuccess }: DepositModalProps) {
  const [step, setStep] = useState<"amount" | "method" | "confirm">("amount");
  const [amountStr, setAmountStr] = useState("");
  const [method, setMethod] = useState<Method>("card");
  const [done, setDone] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const amount = Number(amountStr.replace(/,/g, ""));

  // Reset on open
  useEffect(() => {
    if (isOpen) { setStep("amount"); setAmountStr(""); setMethod("card"); setDone(false); }
  }, [isOpen]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setAmountStr(raw ? Number(raw).toLocaleString() : "");
  };

  const handleDone = () => { setDone(true); onSuccess?.(); setTimeout(onClose, 1800); };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-zinc-950/50 backdrop-blur-sm p-4"
    >
      <div className="bg-white rounded-3xl w-full max-w-[420px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div>
            <h2 className="text-xl font-bold text-zinc-900" style={{ fontFamily: "Georgia,serif" }}>
              {done ? "Success!" : step === "amount" ? "Deposit Funds" : step === "method" ? "Choose Method" : "Complete Deposit"}
            </h2>
            {!done && (
              <div className="flex items-center gap-1.5 mt-1">
                {["amount", "method", "confirm"].map((s, i) => (
                  <div key={s} className={`h-1 rounded-full transition-all duration-300 ${step === s ? "w-6 bg-emerald-700" : ["amount","method","confirm"].indexOf(step) > i ? "w-4 bg-emerald-300" : "w-4 bg-zinc-200"}`} />
                ))}
              </div>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 pb-6">
          {done ? (
            <div className="py-6 flex flex-col items-center gap-3 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <Check size={28} className="text-emerald-700" />
              </div>
              <p className="text-lg font-bold text-zinc-900">Deposit initiated!</p>
              <p className="text-sm text-zinc-500">Your wallet will be updated shortly.</p>
            </div>
          ) : step === "amount" ? (
            <div className="space-y-5">
              {/* Amount input */}
              <div className="relative flex flex-col items-center py-6 rounded-2xl bg-zinc-50 border border-zinc-100">
                <span className="text-zinc-400 text-sm font-medium mb-1">Enter amount</span>
                <div className="flex items-start">
                  <span className="text-2xl text-zinc-400 mt-1 mr-1">₦</span>
                  <input
                    autoFocus
                    type="text"
                    inputMode="numeric"
                    value={amountStr}
                    onChange={handleAmountChange}
                    placeholder="0"
                    className="bg-transparent text-5xl font-bold text-zinc-900 w-48 text-center outline-none placeholder:text-zinc-200"
                    style={{ fontFamily: "Georgia,serif" }}
                  />
                </div>
                {amount > 0 && amount < 500 && (
                  <p className="text-xs text-rose-500 mt-2">Minimum deposit is ₦500</p>
                )}
              </div>

              {/* Presets */}
              <div className="grid grid-cols-3 gap-2">
                {PRESET_AMOUNTS.map(p => (
                  <button key={p} onClick={() => setAmountStr(p.toLocaleString())}
                    className={`h-9 rounded-xl text-[13px] font-medium transition-all border ${amount === p ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"}`}>
                    {p >= 1000 ? `₦${p/1000}k` : `₦${p}`}
                  </button>
                ))}
              </div>

              <button disabled={amount < 500} onClick={() => setStep("method")}
                className="w-full h-12 rounded-xl bg-emerald-800 text-white font-semibold hover:bg-emerald-700 disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center justify-center gap-2">
                Continue <ChevronRight size={16} />
              </button>
            </div>

          ) : step === "method" ? (
            <div className="space-y-3">
              <p className="text-[13px] text-zinc-500 mb-4">Depositing <strong className="text-zinc-900">{fmt(amount)}</strong> — choose how to pay:</p>
              {METHODS.map(m => {
                const Icon = m.icon;
                return (
                  <button key={m.id} onClick={() => { setMethod(m.id); setStep("confirm"); }}
                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl border border-zinc-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all group text-left">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 group-hover:bg-emerald-100 flex items-center justify-center transition-colors shrink-0">
                      <Icon size={18} className="text-zinc-500 group-hover:text-emerald-700 transition-colors" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[14px] font-semibold text-zinc-900">{m.label}</p>
                      <p className="text-[12px] text-zinc-400">{m.sub}</p>
                    </div>
                    <ChevronRight size={15} className="text-zinc-300 group-hover:text-emerald-600 transition-colors" />
                  </button>
                );
              })}
              <button onClick={() => setStep("amount")} className="w-full h-10 text-[13px] text-zinc-400 hover:text-zinc-700 transition-colors">
                ← Change amount
              </button>
            </div>

          ) : (
            // Confirm step — render sub-screen based on method
            <>
              {method === "card"          && <CardStep         amount={amount} onDone={handleDone} onCancel={() => setStep("method")} />}
              {method === "bank_transfer" && <BankTransferStep amount={amount} onCancel={() => setStep("method")} />}
              {method === "ussd"          && <UssdStep         amount={amount} onCancel={() => setStep("method")} />}
              {method === "wallet"        && <WalletStep       amount={amount} onDone={handleDone} onCancel={() => setStep("method")} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}