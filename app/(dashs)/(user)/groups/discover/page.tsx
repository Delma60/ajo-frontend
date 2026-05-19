"use client";

import { useState, useMemo, useEffect } from "react";

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
import { Frequency, IGroup, PayoutOrder } from "@/lib/types/group.types";
import { HTTPS } from "@/lib/http";
import { formatNaira, freqLabel } from "@/lib/utils";
import { GroupCardSkeleton } from "@/components/group-skeleton";
import { GroupCard } from "@/components/group-item";
import {
  Filter as FilterComponent,
  FilterValues,
} from "@/components/ui/filter";

// ─── Filter bar ───────────────────────────────────────────────────────────────

const FREQUENCIES: (Frequency | "all")[] = [
  "all",
  "daily",
  "bi-weekly",
  "monthly",
  "weekly",
];
const SORT_OPTIONS = [
  "Featured",
  "Newest",
  "Spots left",
  "Contribution ↑",
  "Contribution ↓",
] as const;

type FreqFilter = (typeof FREQUENCIES)[number];
type SortOption = (typeof SORT_OPTIONS)[number];

function FeaturedCard({ group }: { group: IGroup }) {
  const spotsLeft = Number(group.max_members) - Number(group.membersCount);
  const trustScore = (group as any).trustScore ?? 100;
  const totalPaidOut = (group as any).totalPaidOut ?? 0;

  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-emerald-200 p-6 flex flex-col gap-4"
      style={{
        background:
          "linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-10"
        style={{
          background: "radial-gradient(circle, #6ee7b7 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/4 w-24 h-24 rounded-full opacity-10"
        style={{
          background: "radial-gradient(circle, #a7f3d0 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-widest text-emerald-300/80">
              <Star size={11} className="fill-emerald-300 text-emerald-300" />
              Featured
            </span>
          </div>
          <h3
            className="text-xl font-bold text-white leading-tight"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {group.name}
          </h3>
          <p className="text-emerald-100/70 text-[13px] mt-1 max-w-sm leading-relaxed">
            {(group.description || "No description provided.").slice(0, 110)}…
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-emerald-300/60 text-[11px] uppercase tracking-wide font-medium">
            Contribution
          </p>
          <p className="text-2xl font-bold text-white">
            {formatNaira(Number(group.contribution) || 0)}
          </p>
          <p className="text-emerald-300/60 text-[12px]">
            /{freqLabel(group.frequency).toLowerCase()}
          </p>
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 text-[12px] text-emerald-200/70">
          <Users size={12} />
          {group.membersCount}/{group.max_members} members
        </div>
        <div className="flex items-center gap-1.5 text-[12px] text-emerald-200/70">
          <ShieldCheck size={12} />
          {trustScore}% trust
        </div>
        <div className="flex items-center gap-1.5 text-[12px] text-emerald-200/70">
          <TrendingUp size={12} />
          {formatNaira(totalPaidOut)} paid out
        </div>
        {spotsLeft > 0 && spotsLeft <= 3 && (
          <span className="text-[11px] font-semibold text-amber-300 bg-amber-400/10 rounded-full px-2.5 py-0.5">
            {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left!
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

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ query }: { query: string }) {
  return (
    <div className="col-span-full py-16 flex flex-col items-center text-center">
      <div className="h-14 w-14 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
        <Search size={24} className="text-zinc-400" />
      </div>
      <p className="text-zinc-700 font-medium">
        No circles found for &ldquo;{query || "search term"}&rdquo;
      </p>
      <p className="text-zinc-400 text-sm mt-1">
        Try different keywords or clear your filters.
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DiscoverPage() {
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  // const [freqFilter, setFreqFilter] = useState<FreqFilter>("all");
  const [filterValue, setFilterValue] = useState<FilterValues>({
    sort: "newest",
    freq: "all",
  });
  // const [sort, setSort] = useState<SortOption>("Newest");
  const [groups, setGroups] = useState<IGroup[]>([]);

  // Using custom any type fallback due to features missing from actual db model
  const featuredGroups = groups.filter((g) => (g as any).featured);

  const filtered = useMemo(() => {
    if (!Array.isArray(groups) || groups.length === 0) return [];
    if (
      search === "" &&
      filterValue.freq === "all" &&
      filterValue.sort === "newest"
    )
      return groups;

    let list = groups.filter((g) => {
      const matchFreq =
        filterValue.freq === "all" ||
        freqLabel(g.frequency).toLowerCase() === filterValue.freq;
      const matchSearch =
        (g.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (g.description || "").toLowerCase().includes(search.toLowerCase());

      return matchSearch && matchFreq;
    });

    switch (filterValue.sort) {
      case "newest":
        list = [...list].sort(
          (a, b) =>
            new Date(b.created_at || 0).getTime() -
            new Date(a.created_at || 0).getTime(),
        );
        break;
      case "Spots left":
        list = [...list].sort((a, b) => {
          const aSpots =
            Number(a.max_members || 0) - Number(a.membersCount || 0);
          const bSpots =
            Number(b.max_members || 0) - Number(b.membersCount || 0);
          return aSpots - bSpots; // ASC
        });
        break;
      case "Contribution ↑":
        list = [...list].sort(
          (a, b) => Number(a.contribution || 0) - Number(b.contribution || 0),
        );
        break;
      case "Contribution ↓":
        list = [...list].sort(
          (a, b) => Number(b.contribution || 0) - Number(a.contribution || 0),
        );
        break;
      default: // Featured first
        list = [...list].sort((a, b) => {
          const aFeatured = (a as any).featured ? 1 : 0;
          const bFeatured = (b as any).featured ? 1 : 0;
          return bFeatured - aFeatured;
        });
    }

    return list;
  }, [search, filterValue, groups]);

  useEffect(() => {
    function fetchGroup() {
      HTTPS.get("/groups")
        .then((res) => {
          // Fix Laravel API resource wrapping (extract array safely)
          const fetchedData = res.data || [];
          setGroups(Array.isArray(fetchedData) ? fetchedData : []);
        })
        .catch((err) => console.error("Failed to fetch groups", err))
        .finally(() => setIsLoading(false));
    }
    fetchGroup();
  }, []);

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
              {groups.length} circles available
            </span>
          </div>
        </div>

        {/* Featured section */}
        {featuredGroups.length > 0 && !search && filterValue.freq === "all" && (
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
        <FilterComponent
          groups={[
            {
              key: "freq",
              label: "Frequency",
              options: [
                { value: "all", label: "All" },
                { value: "daily", label: "Daily" },
                { value: "weekly", label: "Weekly" },
                { value: "bi-weekly", label: "Bi-weekly" },
                { value: "monthly", label: "Monthly" },
              ],
            },
            {
              key: "sort",
              label: "Sort by",
              options: [
                { value: "newest", label: "Newest" },
                { value: "contribution_asc", label: "Contribution ↑" },
                { value: "spots", label: "Spots left" },
              ],
            },
          ]}
          quickGroup="freq"
          values={filterValue}
          onChange={setFilterValue}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search circles by name…"
        />

        {/* Cards grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <GroupCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.length === 0 ? (
              <EmptyState query={search} />
            ) : (
              filtered.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))
            )}
          </div>
        )}

        {/* CTA footer */}
        <div className="rounded-2xl border border-dashed border-zinc-300 p-6 text-center space-y-2">
          <p className="text-zinc-700 font-medium text-sm">
            Don&apos;t see what you&apos;re looking for?
          </p>
          <p className="text-zinc-400 text-[13px]">
            Start your own circle and invite people you trust.
          </p>
          <Link href="/groups/create">
            <Button
              variant="outline"
              size="sm"
              className="mt-3 rounded-xl gap-2"
            >
              <Users size={14} />
              Create a Circle
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
