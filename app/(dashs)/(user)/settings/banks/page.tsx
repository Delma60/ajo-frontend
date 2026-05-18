// app/(dashs)/(user)/settings/banks/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardDivider,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HTTPS } from "@/lib/http";
import type { IBank, ICard } from "@/lib/types/bank.types";
import {
  Landmark,
  CreditCard,
  Plus,
  Trash2,
  ShieldCheck,
  Loader2,
} from "lucide-react";

export default function LinkedBanksPage() {
  const [banks, setBanks] = useState<IBank[]>([]);
  const [cards, setCards] = useState<ICard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add Bank State
  const [isAddingBank, setIsAddingBank] = useState(false);
  const [bankList, setBankList] = useState<{ code: string; name: string }[]>(
    [],
  );
  const [selectedBankCode, setSelectedBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSavedMethods();
    fetchBankList();
  }, []);

  const fetchSavedMethods = async () => {
    setIsLoading(true);
    try {
      // Adjust these endpoints to match your actual Laravel routes for fetching user banks/cards
      const [banksRes, cardsRes] = await Promise.all([
        HTTPS.get<any>("/banks"),
        HTTPS.get<any>("/cards"),
      ]);

      if (banksRes.statusCode === 200) setBanks(banksRes.data || []);
      if (cardsRes.statusCode === 200) setCards(cardsRes.data || []);
    } catch (err) {
      console.error("Failed to fetch saved methods", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBankList = async () => {
    try {
      // Calls the banks() method in PaymentController
      const res = await HTTPS.get<any>("/payments/banks");
      if (res.statusCode === 200 && res.data) {
        setBankList(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch bank list", err);
    }
  };

  const verifyAccount = async () => {
    if (!accountNumber || !selectedBankCode) return;
    if (accountNumber.length < 10) return;

    setIsVerifying(true);
    setError("");
    setAccountName("");

    try {
      // Calls verifyBankAccount() in PaymentController
      const res = await HTTPS.post<any>("/payments/verify-bank-account", {
        code: selectedBankCode,
        number: accountNumber,
      });

      if (
        res.statusCode >= 200 &&
        res.statusCode < 300 &&
        res.data?.account_name
      ) {
        setAccountName(res.data.account_name);
      } else {
        setError(res.message || "Could not verify account details.");
      }
    } catch (err) {
      setError("An error occurred during verification.");
    } finally {
      setIsVerifying(false);
    }
  };

  const saveBankAccount = async () => {
    if (!accountName) return;
    setIsSaving(true);
    setError("");

    try {
      const bankName = bankList.find((b) => b.code === selectedBankCode)?.name;

      const res = await HTTPS.post<any>("/banks", {
        bank_name: bankName,
        account_number: accountNumber,
        account_name: accountName,
        bank_code: selectedBankCode,
      });

      if (res.statusCode >= 200 && res.statusCode < 300) {
        await fetchSavedMethods();
        setIsAddingBank(false);
        setAccountNumber("");
        setAccountName("");
        setSelectedBankCode("");
      } else {
        setError(res.message || "Failed to save bank account.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteBank = async (id: string) => {
    if (!confirm("Are you sure you want to remove this bank account?")) return;
    try {
      await HTTPS.delete(`/banks/${id}`);
      setBanks(banks.filter((b) => b.id !== id));
    } catch (err) {
      console.error("Failed to delete bank", err);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1
          className="text-3xl font-bold text-zinc-900 dark:text-white"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Linked Banks & Cards
        </h1>
        <p className="text-zinc-500 mt-1">
          Manage the accounts you use for deposits and withdrawals.
        </p>
      </div>

      {/* Bank Accounts Section */}
      <Card variant="default">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Landmark size={18} className="text-zinc-400" />
              Saved Bank Accounts
            </CardTitle>
            <CardDescription>
              Accounts used for withdrawing your AjoSave funds.
            </CardDescription>
          </div>
          {!isAddingBank && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingBank(true)}
            >
              <Plus size={16} className="mr-1" /> Add Account
            </Button>
          )}
        </CardHeader>
        <CardDivider />
        <CardContent className="pt-6">
          {/* Add Bank Form Inline */}
          {isAddingBank && (
            <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 mb-6 animate-in fade-in slide-in-from-top-4">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">
                Add New Bank Account
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-zinc-900 dark:text-white">
                      Bank Name
                    </label>
                    <select
                      className="w-full h-11 px-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-zinc-900 dark:text-zinc-100"
                      value={selectedBankCode}
                      onChange={(e) => {
                        setSelectedBankCode(e.target.value);
                        setAccountName("");
                      }}
                    >
                      <option value="">Select a Bank...</option>
                      {bankList.map((b) => (
                        <option key={b.code} value={b.code}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Input
                      label="Account Number"
                      type="text"
                      placeholder="e.g. 0123456789"
                      maxLength={10}
                      value={accountNumber}
                      onChange={(e) => {
                        setAccountNumber(e.target.value);
                        setAccountName("");
                      }}
                      onBlur={verifyAccount}
                    />
                  </div>
                </div>

                {isVerifying && (
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <Loader2 size={14} className="animate-spin" /> Verifying
                    account details...
                  </div>
                )}

                {accountName && !isVerifying && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-sm font-medium flex items-center gap-2 border border-emerald-100 dark:border-emerald-800/30">
                    <ShieldCheck size={16} />
                    Verified: {accountName}
                  </div>
                )}

                {error && (
                  <p className="text-rose-500 text-sm font-medium">{error}</p>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    variant="ghost"
                    onClick={() => setIsAddingBank(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    disabled={!accountName}
                    loading={isSaving}
                    onClick={saveBankAccount}
                  >
                    Save Account
                  </Button>
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="h-24 flex items-center justify-center text-zinc-400">
              Loading accounts...
            </div>
          ) : banks.length === 0 && !isAddingBank ? (
            <div className="text-center py-8">
              <Landmark
                size={32}
                className="mx-auto text-zinc-300 dark:text-zinc-700 mb-3"
              />
              <p className="text-sm font-medium text-zinc-900 dark:text-white">
                No bank accounts linked
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Add a bank account to enable withdrawals.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {banks.map((bank) => (
                <div
                  key={bank.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-emerald-500/30 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                      <Landmark
                        size={18}
                        className="text-zinc-600 dark:text-zinc-400"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900 dark:text-white">
                        {bank.bank_name}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {bank.account_number} • {bank.account_name}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteBank(bank.id)}
                    className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debit Cards Section */}
      <Card variant="default">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard size={18} className="text-zinc-400" />
            Saved Debit Cards
          </CardTitle>
          <CardDescription>
            Cards used for automatic deposits and contributions.
          </CardDescription>
        </CardHeader>
        <CardDivider />
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="h-24 flex items-center justify-center text-zinc-400">
              Loading cards...
            </div>
          ) : cards.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard
                size={32}
                className="mx-auto text-zinc-300 dark:text-zinc-700 mb-3"
              />
              <p className="text-sm font-medium text-zinc-900 dark:text-white">
                No cards saved securely
              </p>
              <p className="text-xs text-zinc-500 mt-1 mb-4">
                Cards are automatically saved securely when you make a deposit.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => (window.location.href = "/dashboard")}
              >
                Make a Deposit
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950 relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                      {card.brand}
                    </span>
                    {card.is_default && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                        DEFAULT
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg tracking-widest text-zinc-400">
                      •••• •••• ••••
                    </span>
                    <span className="text-lg font-mono font-medium text-zinc-900 dark:text-white">
                      {card.last4}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-medium text-zinc-500">
                      Expires {card.exp_month}/{card.exp_year}
                    </span>
                    <button className="text-zinc-400 hover:text-rose-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
