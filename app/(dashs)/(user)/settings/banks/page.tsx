// app/(dashs)/(user)/settings/banks/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  X,
  AlertCircle,
} from "lucide-react";
import { Auth } from "@/lib/auth";
import { IUser } from "@/lib/types/user.types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BankListItem {
  code: string;
  name: string;
}

// ─── Add Bank Form ────────────────────────────────────────────────────────────

function AddBankForm({
  bankList,
  onSaved,
  onCancel,
}: {
  bankList: BankListItem[];
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [selectedBankCode, setSelectedBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // Auto-verify when account number reaches 10 digits and a bank is selected
  const verifyAccount = useCallback(async () => {
    if (!accountNumber || !selectedBankCode) return;
    if (accountNumber.length < 10) return;

    setIsVerifying(true);
    setError("");
    setAccountName("");

    try {
      // FIX: correct endpoint is /payments/bank/look-up (not /payments/verify-bank-account)
      const res = await HTTPS.post<any>("/payments/bank/look-up", {
        code: selectedBankCode, // FIX: backend BankController expects 'code', not 'bank_code'
        number: accountNumber, // FIX: backend expects 'number', matches WithdrawRequest
      });

      const data = res?.data;
      if (res.statusCode >= 200 && res.statusCode < 300 && data?.account_name) {
        setAccountName(data.account_name);
      } else {
        setError(
          res.message ||
            data?.message ||
            "Could not verify account. Please check your details.",
        );
      }
    } catch {
      setError("An error occurred during verification. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  }, [accountNumber, selectedBankCode]);

  // Trigger verification when number hits 10 digits
  useEffect(() => {
    if (accountNumber.length === 10 && selectedBankCode) {
      verifyAccount();
    } else {
      // Clear verified name when user changes the number
      if (accountName) setAccountName("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountNumber, selectedBankCode]);

  const handleSave = async () => {
    if (!accountName) return;
    if (!selectedBankCode) {
      setError("Please select a bank.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const selectedBank = bankList.find((b) => b.code === selectedBankCode);

      // FIX: send 'code' not 'bank_code' — matches BankController@store validation rules:
      // 'code' => 'required|string'
      // 'bank_name' => 'required|string'
      // 'account_number' => 'required|string'
      // 'account_name' => 'required|string'
      const res = await HTTPS.post<any>("/banks", {
        bank_name: selectedBank?.name ?? "",
        account_number: accountNumber,
        account_name: accountName,
        code: selectedBankCode, // FIX: was 'bank_code', backend expects 'code'
        user_id: undefined, // added by auth middleware on backend
      });

      if (res.statusCode >= 200 && res.statusCode < 300) {
        onSaved();
      } else {
        // Surface any field-level errors from Laravel validation
        const errMsg =
          res.errors?.code?.[0] ||
          res.errors?.bank_name?.[0] ||
          res.errors?.account_number?.[0] ||
          res.errors?.account_name?.[0] ||
          res.message ||
          "Failed to save bank account.";
        setError(errMsg);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const canSave = !!accountName && !isVerifying && !isSaving;

  return (
    <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 mb-6 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
          Add New Bank Account
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-zinc-400 hover:text-zinc-700 transition-colors p-1 rounded-lg hover:bg-zinc-100"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Bank selector */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-900 dark:text-white">
              Bank Name
            </label>
            <select
              className="w-full h-11 px-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-zinc-900 dark:text-zinc-100 disabled:opacity-50"
              value={selectedBankCode}
              onChange={(e) => {
                setSelectedBankCode(e.target.value);
                setAccountName("");
                setError("");
              }}
              disabled={bankList.length === 0}
            >
              <option value="">
                {bankList.length === 0 ? "Loading banks…" : "Select a bank…"}
              </option>
              {bankList.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Account number */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-900 dark:text-white">
              Account Number
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                placeholder="10-digit account number"
                maxLength={10}
                value={accountNumber}
                onChange={(e) => {
                  // Only allow digits
                  const digits = e.target.value.replace(/\D/g, "");
                  setAccountNumber(digits);
                  setError("");
                }}
                className="w-full h-11 px-3 pr-10 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-zinc-900 dark:text-zinc-100 font-mono tracking-wider"
              />
              {isVerifying && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 size={15} className="animate-spin text-zinc-400" />
                </div>
              )}
              {accountName && !isVerifying && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <ShieldCheck size={15} className="text-emerald-500" />
                </div>
              )}
            </div>
            <p className="text-[11px] text-zinc-400">
              {accountNumber.length}/10 digits
              {accountNumber.length === 10 && !selectedBankCode && (
                <span className="text-amber-500 ml-1">
                  — select a bank first
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Verification result */}
        {isVerifying && (
          <div className="flex items-center gap-2 text-sm text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-3 py-2.5 rounded-lg">
            <Loader2 size={14} className="animate-spin shrink-0" />
            Verifying account with your bank…
          </div>
        )}

        {accountName && !isVerifying && (
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg px-3 py-2.5 border border-emerald-100 dark:border-emerald-800/30">
            <ShieldCheck size={16} className="shrink-0" />
            <div>
              <span className="text-sm font-semibold">Account verified</span>
              <span className="text-sm ml-2 text-emerald-600 dark:text-emerald-400">
                {accountName}
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg px-3 py-2.5 border border-red-100 dark:border-red-800/30">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={!canSave}
            loading={isSaving}
            onClick={handleSave}
            className="rounded-xl px-5"
          >
            Save Account
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Bank Card ────────────────────────────────────────────────────────────────

function BankAccountCard({
  bank,
  onDelete,
}: {
  bank: IBank;
  onDelete: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Remove ${bank.bank_name} (${bank.account_number})?`)) return;
    setDeleting(true);
    onDelete(bank.id);
  };

  // Show first letter of bank name as avatar
  const initial = (bank.bank_name || "B")[0].toUpperCase();

  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-emerald-300/60 dark:hover:border-emerald-700/40 transition-colors group">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 font-bold text-emerald-700 dark:text-emerald-400 text-sm">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">
            {bank.bank_name}
          </p>
          <p className="text-xs text-zinc-500 mt-0.5 font-mono tracking-wide">
            {bank.account_number}
          </p>
          <p className="text-xs text-zinc-400 mt-0.5 truncate">
            {bank.account_name}
          </p>
        </div>
      </div>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100 shrink-0 disabled:opacity-50"
        aria-label="Remove bank account"
      >
        {deleting ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <Trash2 size={15} />
        )}
      </button>
    </div>
  );
}

// ─── Debit Card display ───────────────────────────────────────────────────────

function DebitCardItem({ card }: { card: ICard }) {
  return (
    <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950 relative overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
          {card.brand}
        </span>
        {card.is_default && (
          <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">
            DEFAULT
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg tracking-widest text-zinc-300 dark:text-zinc-600">
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
        <button className="text-zinc-300 hover:text-red-500 transition-colors">
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LinkedBanksPage() {
  const user = Auth.user() as unknown as IUser;
  const [banks, setBanks] = useState<IBank[]>(user?.banks ?? []);
  const [cards, setCards] = useState<ICard[]>(user?.cards ?? []);
  const [bankList, setBankList] = useState<BankListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingBank, setIsAddingBank] = useState(false);
  const [bankListError, setBankListError] = useState(false);

  // Load saved methods and available bank list in parallel
  const fetchSavedMethods = useCallback(async () => {
    try {
      const [banksRes, cardsRes] = await Promise.all([
        HTTPS.get<IBank[]>("/banks"),
        HTTPS.get<ICard[]>("/cards"),
      ]);
      if (banksRes.statusCode === 200) setBanks(banksRes.data ?? []);
      if (cardsRes.statusCode === 200) setCards(cardsRes.data ?? []);
    } catch {
      // Non-fatal: show empty state
    }
  }, []);

  const fetchBankList = useCallback(async () => {
    try {
      // FIX: correct route is /payments/banks-list (not /payments/banks)
      // See api.php: Route::get('/payments/banks-list', [PaymentController::class, 'banks'])
      const res = await HTTPS.get<any>("/payments/banks-list");

      // Flutterwave returns: { status: 'success', data: [...] }
      // Our PaymentBase wraps it: res.data → raw → data
      const list: BankListItem[] =
        res?.data?.data ?? // nested: res.data = { data: [...] }
        res?.data ?? // flat array
        [];

      if (Array.isArray(list) && list.length > 0) {
        setBankList(list);
      } else {
        setBankListError(true);
      }
    } catch {
      setBankListError(true);
    }
  }, []);

  useEffect(() => {
    fetchBankList().finally(() =>
      setIsLoading(false),
    );
  }, [ fetchBankList]);

  const handleBankSaved = async () => {
    setIsAddingBank(false);
    await fetchSavedMethods();
  };

  const handleDeleteBank = async (id: string) => {
    try {
      await HTTPS.delete(`/banks/${id}`);
      setBanks((prev) => prev.filter((b) => b.id !== id));
    } catch {
      // Could surface a toast here
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

      {/* ── Bank Accounts ─────────────────────────────────────────────── */}
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
              className="gap-1.5 rounded-xl"
            >
              <Plus size={15} />
              Add Account
            </Button>
          )}
        </CardHeader>
        <CardDivider />
        <CardContent className="pt-6">
          {/* Inline add form */}
          {isAddingBank && (
            <AddBankForm
              bankList={bankList}
              onSaved={handleBankSaved}
              onCancel={() => setIsAddingBank(false)}
            />
          )}

          {/* Bank list error */}
          {bankListError && isAddingBank && (
            <div className="flex items-center gap-2 text-amber-600 text-xs mb-4 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
              <AlertCircle size={13} />
              Could not load the bank list. Please refresh and try again.
            </div>
          )}

          {/* Loading */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-[72px] rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse"
                />
              ))}
            </div>
          ) : banks.length === 0 && !isAddingBank ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3">
                <Landmark
                  size={22}
                  className="text-zinc-300 dark:text-zinc-600"
                />
              </div>
              <p className="text-sm font-medium text-zinc-900 dark:text-white">
                No bank accounts linked yet
              </p>
              <p className="text-xs text-zinc-500 mt-1 mb-4">
                Add a bank account to enable withdrawals.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddingBank(true)}
                className="gap-1.5 rounded-xl"
              >
                <Plus size={14} />
                Add your first account
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {banks.map((bank) => (
                <BankAccountCard
                  key={bank.id}
                  bank={bank}
                  onDelete={handleDeleteBank}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Debit Cards ───────────────────────────────────────────────── */}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-36 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse"
                />
              ))}
            </div>
          ) : cards.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3">
                <CreditCard
                  size={22}
                  className="text-zinc-300 dark:text-zinc-600"
                />
              </div>
              <p className="text-sm font-medium text-zinc-900 dark:text-white">
                No cards saved yet
              </p>
              <p className="text-xs text-zinc-500 mt-1 mb-4">
                Cards are saved automatically when you make a deposit.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => (window.location.href = "/dashboard")}
                className="rounded-xl"
              >
                Make a Deposit
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cards.map((card) => (
                <DebitCardItem key={card.id} card={card} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
