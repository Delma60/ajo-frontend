"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardBadge,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Search,
  Lock,
  Globe,
  TrendingUp,
  Zap,
  Star,
  ArrowLeft,
  Filter,
  ChevronRight,
  Clock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface IDiscoverGroup {
  id: string;
  name: string;
  description: string;
  contribution: number;
  membersCount: number;
  max_members: number;
  frequency: "daily" | "weekly" | "bi-weekly" | "monthly";
  payout_order: "rotational" | "random" | "bidding";
  isPrivate: boolean;
  tags: string[];
  featured?: boolean;
  new?: boolean;
  trustScore: number; // 0-100
  spotsLeft: number;
  adminName: string;
  totalPaidOut: number;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const DISCOVER_GROUPS: IDiscoverGroup[] = [
  {
    id: "d1",
    name: "Lagos Tech Professionals",
    description:
      "A tight-knit savings circle for tech workers in Lagos. Monthly contributions with rotational payouts. Members include engineers, designers, and PMs from top companies.",
    contribution: 50000,
    membersCount: 7,
    max_members: 10,
    frequency: "monthly",
    payout_order: "rotational",
    isPrivate: false,
    tags: ["Tech", "Lagos", "Professional"],
    featured: true,
    trustScore: 98,
    spotsLeft: 3,
    adminName: "Emeka Obi",
    totalPaidOut: 3500000,
  },
  {
    id: "d2",
    name: "Abuja Market Women",
    description:
      "Empowering women traders in Abuja's main market to save collectively and support each other's businesses. Weekly contributions, random payout order.",
    contribution: 5000,
    membersCount: 18,
    max_members: 20,
    frequency: "weekly",
    payout_order: "random",
    isPrivate: false,
    tags: ["Women", "Business", "Abuja"],
    new: true,
    trustScore: 87,
    spotsLeft: 2,
    adminName: "Mama Chidinma",
    totalPaidOut: 800000,
  },
  {
    id: "d3",
    name: "Graduate Savers Club",
    description:
      "Fresh graduates building their financial foundation together. Low contribution, high solidarity. Bi-weekly savings designed for early-career professionals.",
    contribution: 10000,
    membersCount: 9,
    max_members: 15,
    frequency: "bi-weekly",
    payout_order: "rotational",
    isPrivate: false,
    tags: ["Graduates", "Beginners", "Youth"],
    trustScore: 91,
    spotsLeft: 6,
    adminName: "Tunde Bakare",
    totalPaidOut: 1200000,
  },
  {
    id: "d4",
    name: "Port Harcourt Oil Workers",
    description:
      "High-contribution circle for oil industry workers. Monthly payouts with verified member identity. Strict admission — all members must provide proof of employment.",
    contribution: 200000,
    membersCount: 5,
    max_members: 8,
    frequency: "monthly",
    payout_order: "bidding",
    isPrivate: false,
    tags: ["Oil & Gas", "Port Harcourt", "High Value"],
    featured: true,
    trustScore: 99,
    spotsLeft: 3,
    adminName: "Engr. Segun Ade",
    totalPaidOut: 12000000,
  },
  {
    id: "d5",
    name: "Kano Textile Merchants",
    description:
      "Northern Nigeria's premier trading savings circle. Weekly contributions help members stock up for major market seasons.",
    contribution: 25000,
    membersCount: 12,
    max_members: 20,
    frequency: "weekly",
    payout_order: "rotational",
    isPrivate: false,
    tags: ["Trade", "Kano", "Textiles"],
    trustScore: 94,
    spotsLeft: 8,
    adminName: "Alhaji Musa",
    totalPaidOut: 6400000,
  },
  {
    id: "d6",
    name: "Healthcare Workers Ibadan",
    description:
      "Nurses, doctors, and hospital staff in Ibadan pooling resources for personal and professional goals. Monthly cycle with verified healthcare workers only.",
    contribution: 30000,
    membersCount: 11,
    max_members: 12,
    frequency: "monthly",
    payout_order: "rotational",
    isPrivate: false,
    tags: ["Healthcare", "Ibadan", "Professional"],
    new: true,
    trustScore: 96,
    spotsLeft: 1,
    adminName: "Dr. Aisha Bello",
    totalPaidOut: 990000,
  },
  {
    id: "d7",
    name: "Social Media Creators NG",
    description:
      "Content creators building passive income together. Weekly micro-savings that add up. Open to influencers, bloggers, and digital marketers across Nigeria.",
    contribution: 8000,
    membersCount: 14,
    max_members: 20,
    frequency: "weekly",
    payout_order: "random",
    isPrivate: false,
    tags: ["Creators", "Digital", "Nationwide"],
    trustScore: 82,
    spotsLeft: 6,
    adminName: "Blessing Nkem",
    totalPaidOut: 560000,
  },
  {
    id: "d8",
    name: "Real Estate Investors Circle",
    description:
      "Serious investors pooling capital for property down-payments. High monthly contributions. Background check required. Payouts disbursed on a bidding basis.",
    contribution: 500000,
    membersCount: 4,
    max_members: 6,
    frequency: "monthly",
    payout_order: "bidding",
    isPrivate: false,
    tags: ["Real Estate", "Investment", "High Value"],
    featured: true,
    trustScore: 100,
    spotsLeft: 2,
    adminName: "Mr. Rotimi Adeyemo",
    totalPaidOut: 24000000,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatNaira(amount: number) {
  if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `₦${(amount / 1_000).toFixed(0)}k`;
  return `₦${amount.toLocaleString()}`;
}

function frequencyLabel(f: IDiscoverGroup["frequency"]) {
  return {
    daily: "Daily",
    weekly: "Weekly",
    "bi-weekly": "Bi-weekly",
    monthly: "Monthly",
  }[f];
}

function payoutLabel(p: IDiscoverGroup["payout_order"]) {
  return { rotational: "Rotational", random: "Random draw", bidding: "Bid-based" }[p];
}

function trustColor(score: number) {
  if (score >= 95) return "text-emerald-700 bg-emerald-50";
  if (score >= 85) return "text-blue-700 bg-blue-50";
  return "text-amber-700 bg-amber-50";
}

// ─── Filter bar ───────────────────────────────────────────────────────────────

const FREQUENCIES = ["All", "Weekly", "Bi-weekly", "Monthly"] as const;
const SORT_OPTIONS = ["Featured", "Newest", "Spots left", "Contribution ↑", "Contribution ↓"] as const;

type FreqFilter = (typeof FREQUENCIES)[number];
type SortOption = (typeof SORT_OPTIONS)[number];

// ─── Featured Hero Card ───────────────────────────────────────────────────────

function FeaturedCard({ group }: { group: IDiscoverGroup }) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-emerald-200 p-6 flex flex-col gap-4"
      style={{
        background: "linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%)",
      }}
    >
      {/* bg blobs */}
      <div
        className="pointer-events-none absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #6ee7b7 0%, transparent 70%)" }}
      />
      <div className="pointer-events-none absolute bottom-0 left-1/4 w-24 h-24 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #a7f3d0 0%, transparent 70%)" }}
      />

      <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-widest text-emerald-300/80">
              <Star size={11} className="fill-emerald-300 text-emerald-300" />
              Featured
            </span>
          </div>
          <h3 className="text-xl font-bold text-white leading-tight" style={{ fontFamily: "Georgia, serif" }}>
            {group.name}
          </h3>
          <p className="text-emerald-100/70 text-[13px] mt-1 max-w-sm leading-relaxed">
            {group.description.slice(0, 110)}…
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-emerald-300/60 text-[11px] uppercase tracking-wide font-medium">Contribution</p>
          <p className="text-2xl font-bold text-white">{formatNaira(group.contribution)}</p>
          <p className="text-emerald-300/60 text-[12px]">/{frequencyLabel(group.frequency).toLowerCase()}</p>
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 text-[12px] text-emerald-200/70">
          <Users size={12} />
          {group.membersCount}/{group.max_members} members
        </div>
        <div className="flex items-center gap-1.5 text-[12px] text-emerald-200/70">
          <ShieldCheck size={12} />
          {group.trustScore}% trust
        </div>
        <div className="flex items-center gap-1.5 text-[12px] text-emerald-200/70">
          <TrendingUp size={12} />
          {formatNaira(group.totalPaidOut)} paid out
        </div>
        {group.spotsLeft <= 3 && (
          <span className="text-[11px] font-semibold text-amber-300 bg-amber-400/10 rounded-full px-2.5 py-0.5">
            {group.spotsLeft} spot{group.spotsLeft !== 1 ? "s" : ""} left!
          </span>
        )}
      </div>

      <div className="relative z-10 flex gap-2 pt-1">
        <Button
          size="sm"
          className="rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 border-0 font-semibold"
        >
          Request to Join
        </Button>
        <Button
          size="sm"
          className="rounded-xl bg-white/10 text-white hover:bg-white/20 border-0"
        >
          View Details
        </Button>
      </div>
    </div>
  );
}

// ─── Group Card ───────────────────────────────────────────────────────────────

function GroupCard({ group }: { group: IDiscoverGroup }) {
  const fillPct = Math.round((group.membersCount / group.max_members) * 100);
  const almostFull = group.spotsLeft <= 2;

  return (
    <Card
      variant="default"
      className="flex flex-col hover:border-emerald-300 hover:-translate-y-px transition-all duration-150"
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0 select-none">
              {group.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <CardTitle className="truncate">{group.name}</CardTitle>
                {group.new && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-700 bg-violet-50 rounded-full px-2 py-0.5">
                    <Sparkles size={9} />
                    New
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Admin: {group.adminName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {group.isPrivate ? (
              <Lock size={13} className="text-zinc-400" />
            ) : (
              <Globe size={13} className="text-zinc-400" />
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-3">
        <p className="text-[13px] text-zinc-500 leading-relaxed line-clamp-2">
          {group.description}
        </p>

        {/* Tags */}
        <div className="flex gap-1.5 flex-wrap">
          {group.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-medium text-zinc-500 bg-zinc-100 rounded-full px-2.5 py-0.5"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2 text-[12px]">
          <div className="bg-zinc-50 rounded-xl px-3 py-2">
            <p className="text-zinc-400 text-[10px] uppercase tracking-wide font-medium mb-0.5">Contribution</p>
            <p className="font-bold text-zinc-900 text-[14px]">
              {formatNaira(group.contribution)}
              <span className="text-zinc-400 font-normal text-[11px]">/{frequencyLabel(group.frequency).toLowerCase()}</span>
            </p>
          </div>
          <div className="bg-zinc-50 rounded-xl px-3 py-2">
            <p className="text-zinc-400 text-[10px] uppercase tracking-wide font-medium mb-0.5">Payout</p>
            <p className="font-semibold text-zinc-700 text-[13px]">{payoutLabel(group.payout_order)}</p>
          </div>
        </div>

        {/* Member fill bar */}
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="text-zinc-400 flex items-center gap-1">
              <Users size={10} /> {group.membersCount}/{group.max_members} members
            </span>
            {almostFull ? (
              <span className="text-amber-600 font-semibold">{group.spotsLeft} spot{group.spotsLeft !== 1 ? "s" : ""} left</span>
            ) : (
              <span className="text-zinc-400">{group.spotsLeft} open</span>
            )}
          </div>
          <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                fillPct >= 90 ? "bg-amber-500" : "bg-emerald-600"
              }`}
              style={{ width: `${fillPct}%` }}
            />
          </div>
        </div>

        {/* Trust score + total paid */}
        <div className="flex items-center gap-3 text-[11px]">
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${trustColor(group.trustScore)}`}>
            <ShieldCheck size={10} />
            {group.trustScore}% trust
          </span>
          <span className="text-zinc-400 flex items-center gap-1">
            <TrendingUp size={10} />
            {formatNaira(group.totalPaidOut)} paid out
          </span>
        </div>
      </CardContent>

      <CardFooter className="border-t border-zinc-100 pt-3">
        <Button variant="primary" size="sm" className="rounded-xl flex-1">
          Request to Join
        </Button>
        <Button variant="ghost" size="sm" className="rounded-xl gap-1">
          Details <ChevronRight size={13} />
        </Button>
      </CardFooter>
    </Card>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ query }: { query: string }) {
  return (
    <div className="col-span-full py-16 flex flex-col items-center text-center">
      <div className="h-14 w-14 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
        <Search size={24} className="text-zinc-400" />
      </div>
      <p className="text-zinc-700 font-medium">No circles found for &ldquo;{query}&rdquo;</p>
      <p className="text-zinc-400 text-sm mt-1">Try different keywords or clear your filters.</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DiscoverPage() {
  const [search, setSearch] = useState("");
  const [freqFilter, setFreqFilter] = useState<FreqFilter>("All");
  const [sort, setSort] = useState<SortOption>("Featured");
  const [showFilters, setShowFilters] = useState(false);

  const featuredGroups = DISCOVER_GROUPS.filter((g) => g.featured);

  const filtered = useMemo(() => {
    let list = DISCOVER_GROUPS.filter((g) => {
      const matchSearch =
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        g.description.toLowerCase().includes(search.toLowerCase()) ||
        g.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

      const matchFreq =
        freqFilter === "All" ||
        frequencyLabel(g.frequency) === freqFilter;

      return matchSearch && matchFreq;
    });

    switch (sort) {
      case "Newest":
        list = list.filter((g) => g.new).concat(list.filter((g) => !g.new));
        break;
      case "Spots left":
        list = [...list].sort((a, b) => a.spotsLeft - b.spotsLeft);
        break;
      case "Contribution ↑":
        list = [...list].sort((a, b) => a.contribution - b.contribution);
        break;
      case "Contribution ↓":
        list = [...list].sort((a, b) => b.contribution - a.contribution);
        break;
      default: // Featured first
        list = list.filter((g) => g.featured).concat(list.filter((g) => !g.featured));
    }

    return list;
  }, [search, freqFilter, sort]);

  return (
    <div className="min-h-full bg-zinc-50/40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <Link
              href="/groups"
              className="inline-flex items-center gap-1.5 text-[13px] text-zinc-400 hover:text-zinc-700 transition-colors mb-3"
            >
              <ArrowLeft size={13} />
              Back to My Circles
            </Link>
            <h1
              className="text-2xl font-bold text-zinc-900 tracking-tight"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Discover Circles
            </h1>
            <p className="text-zinc-500 text-sm mt-0.5">
              Find and join trusted savings groups across Nigeria
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[12px] text-zinc-400 bg-zinc-100 rounded-full px-3 py-1.5 font-medium">
              {DISCOVER_GROUPS.length} circles available
            </span>
          </div>
        </div>

        {/* Featured section */}
        {featuredGroups.length > 0 && !search && freqFilter === "All" && (
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-emerald-700" />
              <h2 className="text-[13px] font-semibold text-zinc-700 uppercase tracking-wide">
                Featured Circles
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featuredGroups.slice(0, 2).map((g) => (
                <FeaturedCard key={g.id} group={g} />
              ))}
            </div>
          </section>
        )}

        {/* Search + Filters */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search circles by name, tag, or description…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-8 pr-4 rounded-xl border-[1.5px] border-zinc-200 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-emerald-700 focus:shadow-[0_0_0_3px_rgba(26,107,82,.10)] transition-all"
              />
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters((p) => !p)}
              className={`h-10 px-4 rounded-xl border-[1.5px] text-sm font-medium flex items-center gap-2 transition-all ${
                showFilters
                  ? "border-emerald-700 text-emerald-700 bg-emerald-50"
                  : "border-zinc-200 text-zinc-600 bg-white hover:border-zinc-300"
              }`}
            >
              <Filter size={14} />
              Filters
            </button>
          </div>

          {/* Expanded filters */}
          {showFilters && (
            <div className="flex flex-wrap gap-4 p-4 bg-white rounded-2xl border border-zinc-200">
              {/* Frequency */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400 mb-2">Frequency</p>
                <div className="flex items-center gap-1 bg-zinc-100 rounded-xl p-1">
                  {FREQUENCIES.map((f) => (
                    <button
                      key={f}
                      onClick={() => setFreqFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-medium capitalize transition-all ${
                        freqFilter === f
                          ? "bg-white shadow-sm text-zinc-900"
                          : "text-zinc-500 hover:text-zinc-700"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400 mb-2">Sort by</p>
                <div className="flex items-center gap-1 bg-zinc-100 rounded-xl p-1 flex-wrap">
                  {SORT_OPTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSort(s)}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                        sort === s
                          ? "bg-white shadow-sm text-zinc-900"
                          : "text-zinc-500 hover:text-zinc-700"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quick freq pills (when filters collapsed) */}
          {!showFilters && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {FREQUENCIES.map((f) => (
                <button
                  key={f}
                  onClick={() => setFreqFilter(f)}
                  className={`text-[12px] font-medium px-3 py-1.5 rounded-full transition-all ${
                    freqFilter === f
                      ? "bg-emerald-800 text-white"
                      : "bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300"
                  }`}
                >
                  {f}
                </button>
              ))}
              <span className="mx-1 w-px h-4 bg-zinc-200" />
              <div className="flex items-center gap-1 bg-zinc-100 rounded-full px-3 py-1.5">
                <Clock size={11} className="text-zinc-400" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                  className="text-[12px] font-medium text-zinc-600 bg-transparent outline-none cursor-pointer"
                >
                  {SORT_OPTIONS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between">
          <p className="text-[13px] text-zinc-500">
            Showing <span className="font-semibold text-zinc-900">{filtered.length}</span> circle{filtered.length !== 1 ? "s" : ""}
            {search && <> for &ldquo;<span className="font-medium text-emerald-700">{search}</span>&rdquo;</>}
          </p>
          {(search || freqFilter !== "All") && (
            <button
              onClick={() => { setSearch(""); setFreqFilter("All"); }}
              className="text-[12px] text-zinc-400 hover:text-zinc-700 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <EmptyState query={search} />
          ) : (
            filtered.map((group) => <GroupCard key={group.id} group={group} />)
          )}
        </div>

        {/* CTA footer */}
        <div className="rounded-2xl border border-dashed border-zinc-300 p-6 text-center space-y-2">
          <p className="text-zinc-700 font-medium text-sm">Don&apos;t see what you&apos;re looking for?</p>
          <p className="text-zinc-400 text-[13px]">
            Start your own circle and invite people you trust.
          </p>
          <Button variant="outline" size="sm" className="mt-3 rounded-xl gap-2">
            <Users size={14} />
            Create a Circle
          </Button>
        </div>

      </div>
    </div>
  );
}