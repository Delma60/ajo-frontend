"use client";
import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, Activity, Plus, ArrowUpRight } from "lucide-react";
import { formatNaira } from "@/lib/utils"; // Imported from your utils
import { HTTPS } from "@/lib/http";
import { Investment } from "@/lib/types/investment.types";
import { Auth } from "@/lib/auth";
import { IUser } from "@/lib/types/user.types";
import { Filter } from "@/components/ui/filter";
import Link from "next/link";

export default function PortfolioPage() {
  const user = Auth.user() as unknown as IUser;
  const [filtered, setFiltered] = useState<Investment[]>([]);

  const investments = useMemo(() => {
    return user?.investments || [];
  }, [user?.investments]);

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalExpected =
    investments.reduce((sum, inv) => sum + inv.expected_returns, 0) ?? 0;
  const activePlans = investments.filter(
    (inv) => inv.status === "active",
  ).length;

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-8 p-6">
      {/* Header Section mimicking greeting-section.tsx */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p
            className="text-sm font-medium text-emerald-700 mb-1 tracking-wide uppercase"
            style={{ fontFamily: "Georgia, serif", letterSpacing: "0.08em" }}
          >
            Your Investments
          </p>
          <h1
            className="text-3xl md:text-3xl font-bold text-zinc-900 tracking-tight"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Portfolio
          </h1>
          <p className="mt-1 text-zinc-500 text-sm">
            Track and manage your active investment plans and returns.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href="/investments/new">
            <Button className="gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white">
              <Plus className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Highlight Card mimicking balance-card.tsx */}
        <Card
          className="relative overflow-hidden border-0"
          style={{
            background:
              "linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%)",
          }}
        >
          {/* Decorative blobs */}
          <div
            className="pointer-events-none absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-10"
            style={{
              background:
                "radial-gradient(circle, #6ee7b7 0%, transparent 70%)",
            }}
          />
          <div
            className="pointer-events-none absolute bottom-0 left-1/3 w-32 h-32 rounded-full opacity-10"
            style={{
              background:
                "radial-gradient(circle, #a7f3d0 0%, transparent 70%)",
            }}
          />

          <CardHeader className="pb-2 relative z-10">
            <p className="text-emerald-300/70 text-xs font-semibold uppercase tracking-widest flex items-center justify-between">
              Total Invested
              <Wallet className="h-4 w-4 text-emerald-300/70" />
            </p>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="flex items-end gap-3 mb-2">
              <span
                className="text-4xl font-bold text-white"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {formatNaira(totalInvested)}
              </span>
              <span className="mb-1 text-sm text-emerald-300/60">NGN</span>
            </div>
          </CardContent>
        </Card>

        {/* Secondary Card */}
        <Card className="border border-zinc-200 shadow-sm">
          <CardHeader className="pb-2">
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest flex items-center justify-between">
              Expected Returns
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 mb-2">
              <span
                className="text-3xl font-bold text-zinc-900"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {formatNaira(totalExpected)}
              </span>
            </div>
            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" />+
              {(
                ((totalExpected - totalInvested) / totalInvested) *
                100
              ).toFixed(1) || 0}
              % overall ROI
            </p>
          </CardContent>
        </Card>

        {/* Tertiary Card */}
        <Card className="border border-zinc-200 shadow-sm">
          <CardHeader className="pb-2">
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest flex items-center justify-between">
              Active Plans
              <Activity className="h-4 w-4 text-emerald-700" />
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 mb-2">
              <span
                className="text-3xl font-bold text-zinc-900"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {activePlans}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      <Filter
        data={investments || []}
        onResult={setFiltered}
        searchFields={["status", "title"]}
        // searchPlaceholder=""
        groups={[
          {
            label: "Status",
            multi: true,
            key: "status",
            options: [
              { label: "Active", value: "active" },
              { label: "Pending", value: "pending" },
              { label: "Completed", value: "completed" },
            ],
            match: (item, selected) =>
              (selected as string[]).includes((item as Investment).status),
          },
        ]}
      />

      {/* Investments Table with Filter */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-zinc-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2
            className="text-lg font-bold text-zinc-900 tracking-tight"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Investment History
          </h2>
          <div className="w-full md:w-auto"></div>
        </div>
        <div className="overflow-x-auto p-3">
          <Table>
            <TableHeader className="bg-zinc-50/50">
              <TableRow>
                <TableHead className="w-[300px] text-xs uppercase tracking-widest text-zinc-500">
                  Plan
                </TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-zinc-500">
                  Amount
                </TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-zinc-500">
                  ROI
                </TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-zinc-500">
                  Returns
                </TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-zinc-500">
                  Status
                </TableHead>
                <TableHead className="text-right text-xs uppercase tracking-widest text-zinc-500">
                  Start Date
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center h-24 text-zinc-500"
                  >
                    No investments found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((inv) => (
                  <TableRow
                    key={inv.id}
                    className="hover:bg-zinc-50/50 transition-colors"
                  >
                    <TableCell className="font-medium text-zinc-900">
                      {inv.title}
                    </TableCell>
                    <TableCell className="text-zinc-600">
                      {formatNaira(inv.amount)}
                    </TableCell>
                    <TableCell className="text-emerald-700 font-medium">
                      {inv.roi_percentage}%
                    </TableCell>
                    <TableCell className="text-zinc-900 font-medium">
                      {formatNaira(inv.expected_returns || 0)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                          ${inv.status === "active" ? "bg-emerald-100 text-emerald-800" : ""}
                          ${inv.status === "pending" ? "bg-amber-100 text-amber-800" : ""}
                          ${inv.status === "completed" ? "bg-zinc-100 text-zinc-800" : ""}
                        `}
                      >
                        {inv.status.charAt(0).toUpperCase() +
                          inv.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-zinc-500 text-sm">
                      {new Date(String(inv?.start_date)).toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
