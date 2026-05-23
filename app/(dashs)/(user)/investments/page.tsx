"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  TrendingUp,
  Clock,
  ShieldAlert,
  Building,
  Leaf,
  Zap,
  Filter,
  Icon,
} from "lucide-react";
import { formatNaira } from "@/lib/utils";
import { Investment } from "@/lib/types/investment.types";
import { HTTPS } from "@/lib/http";
import {
  Filter as FilterComponent,
  FilterValues,
} from "@/components/ui/filter";

// --- Mock Data ---
const categories = [
  "All",
  "Real Estate",
  "Agriculture",
  "Technology",
  "Fixed Income",
];

export default function ExploreInvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[] | null>([]);
  const [filtered, setFiltered] = useState<Investment[] | null>([]);

  const featuredInvestment = investments?.filter((inv) => inv.is_featured)[0];

  useEffect(() => {
    async function loadInvestments() {
      let { data, ok } = await HTTPS.get<Investment[]>("/investments");

      if (ok) {
        setInvestments(data);
      }
    }
    loadInvestments();
  }, []);

  console.log(filtered)

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-8 p-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p
            className="text-sm font-medium text-emerald-700 mb-1 tracking-wide uppercase"
            style={{ fontFamily: "Georgia, serif", letterSpacing: "0.08em" }}
          >
            Opportunities
          </p>
          <h1
            className="text-3xl md:text-4xl font-bold text-zinc-900 tracking-tight"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Discover Plans <span className="text-emerald-700">🔍</span>
          </h1>
          <p className="mt-1 text-zinc-500 text-sm">
            Browse and invest in vetted opportunities tailored to your financial
            goals.
          </p>
        </div>
      </div>

      {/* Featured Investment Card */}
      {featuredInvestment && (
        <Card
          className="relative overflow-hidden border-0 shadow-md"
          style={{
            background:
              "linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%)",
          }}
        >
          {/* Decorative blobs */}
          <div
            className="pointer-events-none absolute -top-10 -right-10 w-64 h-64 rounded-full opacity-10"
            style={{
              background:
                "radial-gradient(circle, #6ee7b7 0%, transparent 70%)",
            }}
          />
          <div
            className="pointer-events-none absolute bottom-0 left-1/4 w-48 h-48 rounded-full opacity-10"
            style={{
              background:
                "radial-gradient(circle, #a7f3d0 0%, transparent 70%)",
            }}
          />

          <CardContent className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="text-white space-y-4 max-w-xl">
              <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-400/20 text-emerald-100 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm border border-emerald-400/20">
                Featured Opportunity
              </div>
              <h2
                className="text-2xl md:text-3xl font-bold"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {featuredInvestment?.title}
              </h2>
              <div className="flex flex-wrap gap-4 text-emerald-100/80 text-sm">
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />{" "}
                  {featuredInvestment?.roi_percentage}% ROI
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" /> {featuredInvestment?.duration}{" "}
                  Months
                </span>
                <span className="flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4" /> {featuredInvestment?.risk}{" "}
                  Risk
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-emerald-900/50 rounded-full h-2 mt-4">
                <div
                  className="bg-emerald-400 h-2 rounded-full"
                  style={{ width: `${featuredInvestment?.progress_percent}%` }}
                ></div>
              </div>
              <p className="text-xs text-emerald-200 mt-1">
                {featuredInvestment?.progress_percent}% Funded •{" "}
                {featuredInvestment?.investors?.length} Investors joined
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl text-center min-w-[200px]">
              <p className="text-emerald-100 text-xs mb-1 uppercase tracking-wider">
                Minimum Investment
              </p>
              <p
                className="text-2xl font-bold text-white mb-4"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {formatNaira(featuredInvestment?.minimum_investment)}
              </p>
              <Button className="w-full bg-white text-emerald-900 hover:bg-emerald-50 font-semibold">
                Invest Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <FilterComponent
        data={investments || []}
        onResult={setFiltered}
        groups={[
          {
            key: "category",
            label: "Category",
            options: [
              { value: "all", label: "All" },
              { value: "Real Estate", label: "Real Estate" },
              { value: "Agriculture", label: "Agriculture" },
              { value: "Technology", label: "Technology" },
              { value: "Fixed Income", label: "Fixed Income" },
            ],
            match: (item, v) => (v === "all" ? true : (item as Investment).category === v),
          },
          {
            key: "duration",
            label: "Duration",
            options: [
              { value: "all", label: "All" },
              { value: "3", label: "3 Months" },
              { value: "6", label: "6 Months" },
              { value: "12", label: "12 Months" },
                { value: "24", label: "24 Months" },

            ],
            match: (item, v) => (v === "all" ? true : (item as Investment).duration.toString() === v),
          },
          {
            key: 'risk',
            label: 'Risk Level',
            options: [
              { value: 'all', label: 'All' },
              { value: 'Very Low', label: 'Very Low' },
              { value: 'Low', label: 'Low' },
              { value: 'medium', label: 'Moderate' },
              { value: 'High', label: 'High' },
              { value: 'Very High', label: 'Very High' },
            ],
            match: (item, v) => (v === 'all' ? true : (item as Investment).risk.toLowerCase() === v?.toLowerCase()),
          }
          
        ]}
        quickGroup="freq"
        searchFields={["name", "description", "category", "title"]}
        searchPlaceholder="Search circles by name…"
      />

      {/* Investment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered?.map((inv) => {
          // const Icon = inv.icon;
          return (
            <Card
              key={inv.id}
              className="border border-zinc-200 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-700">
                    {/* <Icon name="bell" className="w-5 h-5" iconNode={[]} /> */}
                  </div>
                  <span
                    className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold rounded-full border
                    ${inv.risk === "low" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : ""}
                    ${inv.risk === "medium" ? "bg-amber-50 text-amber-700 border-amber-200" : ""}
                    ${inv.risk === "high" ? "bg-red-50 text-red-700 border-red-200" : ""}
                  `}
                  >
                    {inv.risk} Risk
                  </span>
                </div>
                <h3
                  className="font-bold text-zinc-900 text-lg leading-tight"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {inv.title}
                </h3>
                <p className="text-sm text-zinc-500">{inv.category}</p>
              </CardHeader>

              <CardContent className="py-0 flex-grow">
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-zinc-100">
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Expected ROI</p>
                    <p className="text-lg font-bold text-emerald-700">
                      {inv.roi_percentage}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Duration</p>
                    <p className="text-lg font-bold text-zinc-900">
                      {inv.duration} months
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-zinc-500">
                      Min. {formatNaira(inv.min_investment)}
                    </span>
                    <span className="font-medium text-zinc-900">
                      {inv.progress_percent}% Funded
                    </span>
                  </div>
                  <div className="w-full bg-zinc-100 rounded-full h-1.5">
                    <div
                      className="bg-emerald-600 h-1.5 rounded-full"
                      style={{ width: `${inv.progress_percent}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-6 pb-5">
                <Button className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl">
                  View Details
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {filtered?.length === 0 && (
        <div className="text-center py-12 px-4 border border-dashed border-zinc-200 rounded-xl bg-zinc-50">
          <p className="text-zinc-500 font-medium">
            No opportunities found in this category.
          </p>
          
        </div>
      )}
    </div>
  );
}
