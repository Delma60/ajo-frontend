
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { HTTPS } from "@/lib/http";
import { X, CreditCard, Smartphone, Wallet } from "lucide-react";
import { Auth } from "@/lib/auth";
import { DepositParams } from "@/lib/types/bank.types";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AMOUNTS = [2000, 5000, 10000, 20000];

export function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"card" | "ussd">("card");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const user_id = Auth.id();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setError("");
      setMethod("card");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle formatted input (e.g., 5,000)
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, "").replace(/\D/g, "");
    if (rawValue) {
      setAmount(Number(rawValue).toLocaleString("en-US"));
    } else {
      setAmount("");
    }
    if (error) setError("");
  };

  const numericAmount = Number(amount.replace(/,/g, ""));

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!numericAmount || numericAmount < 1000) {
      setError("Minimum deposit amount is ₦1,000");
      return;
    }

    if (!user_id) {
      setError("User session expired. Please log in again.");
      return;
    }

    setIsLoading(true);
    try {
      const payload: DepositParams = {
        amount: numericAmount,
        method: method,
        user_id: user_id.toString(),
        provider: "flutterwave",
      };

      const res = await HTTPS.post<any>("/payments/deposit", payload);

      if (res.statusCode >= 200 && res.statusCode < 300) {
        const url =
          res.data?.authorization_url ||
          res.data?.checkout_url ||
          res.data?.data?.link ||
          res.data?.link;

        if (url) {
          window.location.href = url;
        } else {
          setError("Payment link could not be generated. Please try again.");
        }
      } else {
        setError(res.message || "Failed to initiate deposit.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 p-4 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-md relative shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden border border-zinc-100 dark:border-zinc-800">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Wallet size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white leading-tight" style={{ fontFamily: "Georgia, serif" }}>
                Fund Wallet
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Add money to your balance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-500 transition-colors disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleDeposit} className="p-6 space-y-8">
          
          {/* Amount Section */}
          <div className="space-y-4">
            <div className="relative flex flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
              <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider">
                Enter Amount
              </span>
              <div className="flex items-center justify-center text-zinc-900 dark:text-white">
                <span className="text-3xl font-bold mr-1 text-zinc-400">₦</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={amount}
                  onChange={handleAmountChange}
                  disabled={isLoading}
                  className="bg-transparent text-5xl font-bold w-full text-center outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700 disabled:opacity-50"
                  style={{ fontFamily: "Georgia, serif", maxWidth: "200px" }}
                />
              </div>
            </div>

            {/* Quick Amounts */}
            <div className="grid grid-cols-4 gap-2">
              {PRESET_AMOUNTS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  disabled={isLoading}
                  onClick={() => {
                    setAmount(preset.toLocaleString("en-US"));
                    setError("");
                  }}
                  className="py-2 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                >
                  ₦{preset / 1000}k
                </button>
              ))}
            </div>

            {error && (
              <p className="text-rose-500 text-sm text-center font-medium bg-rose-50 dark:bg-rose-950/30 py-2 rounded-lg">
                {error}
              </p>
            )}
          </div>

          {/* Payment Method Section */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Payment Method
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setMethod("card")}
                className={`relative flex flex-col items-start p-4 rounded-2xl border-2 transition-all text-left overflow-hidden disabled:opacity-50 ${
                  method === "card"
                    ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20"
                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <CreditCard
                  size={24}
                  className={`mb-3 ${method === "card" ? "text-emerald-600" : "text-zinc-400"}`}
                />
                <span className={`text-sm font-bold ${method === "card" ? "text-emerald-800 dark:text-emerald-400" : "text-zinc-700 dark:text-zinc-300"}`}>
                  Bank Card
                </span>
                <span className="text-xs text-zinc-500 mt-0.5">Instant deposit</span>
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={() => setMethod("ussd")}
                className={`relative flex flex-col items-start p-4 rounded-2xl border-2 transition-all text-left overflow-hidden disabled:opacity-50 ${
                  method === "ussd"
                    ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20"
                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <Smartphone
                  size={24}
                  className={`mb-3 ${method === "ussd" ? "text-emerald-600" : "text-zinc-400"}`}
                />
                <span className={`text-sm font-bold ${method === "ussd" ? "text-emerald-800 dark:text-emerald-400" : "text-zinc-700 dark:text-zinc-300"}`}>
                  USSD Code
                </span>
                <span className="text-xs text-zinc-500 mt-0.5">Dial to pay</span>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isLoading || !amount}
            className="w-full rounded-2xl h-14 text-base shadow-lg shadow-emerald-600/20"
          >
            {isLoading ? (
              "Processing Payment..."
            ) : numericAmount > 0 ? (
              `Pay ₦${amount} with ${method === "card" ? "Card" : "USSD"}`
            ) : (
              "Enter amount to continue"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

