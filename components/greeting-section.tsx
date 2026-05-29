import { ArrowUpRight, Plus, Users } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
// import loading from "@/app/loading";

export function GreetingSection({ name = 'Friend', loading = false }: { name: string; loading?: boolean }) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = name?.split(" ")[0] ?? "there";

    if (loading) return <GreetingSectionSkeleton />;
  
  return name === null ? (
    <GreetingSectionSkeleton />
  ) : (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <p
          className="text-sm font-medium text-emerald-700 mb-1 tracking-wide uppercase"
          style={{ fontFamily: "Georgia, serif", letterSpacing: "0.08em" }}
        >
          {greeting}
        </p>
        <h1
          className="text-3xl md:text-4xl font-bold text-zinc-900 tracking-tight"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {firstName} <span className="text-emerald-700">👋</span>{" "}
          {String(name)}
        </h1>
        <p className="mt-1 text-zinc-500 text-sm">
          Here&apos;s what&apos;s happening with your savings today.
        </p>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button size="md" variant="primary" className="gap-2 rounded-xl">
          <Plus className="w-4 h-4" />
          Deposit
        </Button>
        <Button size="md" variant="outline" className="gap-2 rounded-xl">
          <ArrowUpRight className="w-4 h-4" />
          Withdraw
        </Button>
        <Link href="/groups">
          <Button size="md" variant="ghost" className="gap-2 rounded-xl">
            <Users className="w-4 h-4" />
            Join Group
          </Button>
        </Link>
      </div>
    </div>
  );
}

export function GreetingSectionSkeleton() {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-pulse">
      <div className="space-y-2.5">
        {/* Greeting Eyebrow Placeholder */}
        <div className="h-4 w-28 bg-emerald-100/60 rounded-md" />

        {/* Name Heading Placeholder */}
        <div className="h-9 md:h-10 w-48 bg-zinc-200 rounded-lg" />

        {/* Description Placeholder */}
        <div className="h-4 w-60 bg-zinc-100 rounded-md" />
      </div>

      <div className="flex gap-2 flex-wrap">
        {/* Buttons Placeholders */}
        <div className="h-10 w-28 bg-zinc-200 rounded-xl" />
        <div className="h-10 w-28 bg-zinc-200 rounded-xl" />
        <div className="h-10 w-32 bg-zinc-200 rounded-xl" />
      </div>
    </div>
  );
}
