// components/deposit-modal.tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HTTPS } from "@/lib/http";
import { X, CreditCard, Smartphone } from "lucide-react";
import { Auth } from "@/lib/auth";
import { DepositParams } from "@/lib/types/bank.types";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const [amount, setAmount] = useState("");
  // Adhering to DepositParams method type
  const [method, setMethod] = useState<"card" | "ussd">("card");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const user_id = Auth.id();

  if (!isOpen) return null;

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const numAmount = Number(amount);
    if (!numAmount || numAmount < 1000) {
      setError("Minimum deposit amount is ₦1,000");
      return;
    }

    if (!user_id) {
      setError("User not authenticated.");
      return;
    }

    setIsLoading(true);
    try {
      // Constructing payload matching DepositParams
      const payload: DepositParams = {
        amount: numAmount,
        method: method,
        user_id: user_id.toString(),
        

        // We can pass a provider explicitly if needed, e.g., "paystack"
        provider: "flutterwave"
      };

      const res = await HTTPS.post<any>("/payments/deposit", payload);

      if (res.statusCode >= 200 && res.statusCode < 300) {
        // If it's a redirect flow (Paystack/Flutterwave standard checkout)
        const url =
          res.data?.authorization_url ||
          res.data?.checkout_url ||
          res.data?.data?.link ||
          res.data?.link ||
          res.transaction?.data?.link;

        if (url) {
          window.location.href = url;
        } else {
          // If no URL is returned, perhaps the transaction requires OTP verification
          // or was completed instantly (unlikely for a new deposit without a saved card).
          // We'll need to handle that state here if your backend behaves differently.
          setError(
            "Payment link could not be generated. Please check console for details.",
          );
          console.log("Deposit Response Data:", res);
        }
      } else {
        console.log(res);
        setError(res.message || "Failed to initiate deposit.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setAmount("");
    setError("");
    setMethod("card");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-950 rounded-2xl w-full max-w-sm p-6 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
        >
          <X size={20} />
        </button>

        <h2
          className="text-xl font-bold text-zinc-900 dark:text-white mb-2"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Fund Wallet
        </h2>
        <p className="text-sm text-zinc-500 mb-6">
          Choose your payment method and enter the amount.
        </p>

        <form onSubmit={handleDeposit} className="space-y-6">
          {/* Method Selector */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMethod("card")}
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all h-24 ${
                  method === "card"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                    : "border-zinc-200 text-zinc-500 hover:border-emerald-200"
                }`}
              >
                <CreditCard size={24} />
                <span className="text-sm font-medium">Card</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod("ussd")}
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all h-24 ${
                  method === "ussd"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                    : "border-zinc-200 text-zinc-500 hover:border-emerald-200"
                }`}
              >
                <Smartphone size={24} />
                <span className="text-sm font-medium">USSD</span>
              </button>
            </div>
          </div>

          <div>
            <Input
              label="Amount (NGN)"
              type="number"
              placeholder="e.g. 5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={1000}
            />
            {error && (
              <p className="text-rose-500 text-xs mt-1.5 font-medium">
                {error}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full rounded-xl mt-2"
            loading={isLoading}
          >
            {isLoading
              ? "Processing..."
              : `Pay with ${method === "card" ? "Card" : "USSD"}`}
          </Button>
        </form>
      </div>
    </div>
  );
}
