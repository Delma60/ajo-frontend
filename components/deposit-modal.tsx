// components/deposit-modal.tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HTTPS } from "@/lib/http";
import { X } from "lucide-react";
import { Auth } from "@/lib/auth";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const user_id = Auth.id()

  if (!isOpen) return null;

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const numAmount = Number(amount);
    if (!numAmount || numAmount < 1000) {
      setError("Minimum deposit amount is ₦1,000");
      return;
    }

    setIsLoading(true);
    try {
      // Calls your Laravel backend. 
      // Replace "/payment/deposit" with your actual endpoint if different.
      const res = await HTTPS.post<any>("/payments/deposit", {
        amount: numAmount,
        method: "paystack",
        user_id,
      });

      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Look for the payment link returned by Paystack or Flutterwave
        const url = 
          res.data?.authorization_url || 
          res.data?.checkout_url || 
          res.data?.data?.link || 
          res.data?.link;
          
        if (url) {
          window.location.href = url; // Redirect to payment gateway
        } else {
          setError("Payment URL not found in response.");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-950 rounded-2xl w-full max-w-sm p-6 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
        >
          <X size={20} />
        </button>
        
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2" style={{ fontFamily: "Georgia, serif" }}>
          Fund Wallet
        </h2>
        <p className="text-sm text-zinc-500 mb-6">
          Enter the amount you want to deposit into your AjoSave wallet.
        </p>

        <form onSubmit={handleDeposit} className="space-y-4">
          <div>
            <Input
              label="Amount (NGN)"
              type="number"
              placeholder="e.g. 5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={1000}
              autoFocus
            />
            {error && <p className="text-rose-500 text-xs mt-1.5 font-medium">{error}</p>}
          </div>

          <Button type="submit" variant="primary" className="w-full rounded-xl mt-2" loading={isLoading}>
            {isLoading ? "Processing..." : "Proceed to Pay"}
          </Button>
        </form>
      </div>
    </div>
  );
}