import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Frequency, PayoutOrder, TrustColors } from "./types/group.types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export function formatNaira(n: number): string {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}k`;
  return `₦${n.toLocaleString()}`;
}

export function freqLabel(f: Frequency): string {
  const map: Record<Frequency, string> = {
    daily: "Daily",
    weekly: "Weekly",
    "bi-weekly": "Bi-weekly",
    monthly: "Monthly",
  };
  return map[f];
}

export function payoutLabel(p: PayoutOrder): string {
  const map: Record<PayoutOrder, string> = {
    rotational: "Rotational",
    random: "Random draw",
    bidding: "Bid-based",
  };
  return map[p];
}

export function daysUntil(dateStr: string): string {
  const diff = new Date(dateStr).getTime() - Date.now();
  const days = Math.ceil(diff / 86_400_000);
  if (days < 0) return "Overdue";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `${days} days`;
}

export function trustColor(score: number): TrustColors {
  if (score >= 95) return { bg: "bg-emerald-50", text: "text-emerald-700", bar: "bg-emerald-500" };
  if (score >= 85) return { bg: "bg-blue-50",    text: "text-blue-700",    bar: "bg-blue-500"    };
  return               { bg: "bg-amber-50",      text: "text-amber-700",   bar: "bg-amber-500"   };
}

export function formatDate(
  dateStr: string,
  opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" },
): string {
  return new Date(dateStr).toLocaleDateString("en-NG", opts);
}