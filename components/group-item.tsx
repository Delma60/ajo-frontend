import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { IGroup } from "@/lib/types/group.types";
import { formatNaira, freqLabel, payoutLabel, trustColor } from "@/lib/utils";
import {
  ChevronRight,
  Globe,
  Lock,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import RequestToJoinButton from "./request-to-join-button";

export function GroupCard({ group }: { group: IGroup }) {
  const maxMembers = Number(group.max_members) || 1;
  const membersCount = Number(group.membersCount) || 0;
  const fillPct = Math.min(Math.round((membersCount / maxMembers) * 100), 100);
  const spotsLeft = maxMembers - membersCount;
  const almostFull = spotsLeft > 0 && spotsLeft <= 2;
  const trustScore = (group as any).trustScore ?? 100;
  const totalPaidOut = (group as any).totalPaidOut ?? 0;

  return (
    <Card
      variant="default"
      className="flex flex-col hover:border-emerald-300 hover:-translate-y-px transition-all duration-150"
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0 select-none">
              {(group.name || "GR").slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <CardTitle className="truncate">{group.name}</CardTitle>
                {(group as any).new && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-700 bg-violet-50 rounded-full px-2 py-0.5">
                    <Sparkles size={9} />
                    New
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Admin: {group.admin?.name || "System Admin"}
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
        <p className="text-[13px] text-zinc-500 leading-relaxed line-clamp-2 min-h-[40px]">
          {group.description || "No description provided."}
        </p>

        {/* Tags */}
        {(group as any)?.tags?.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {(group as any).tags.map((tag: string) => (
              <span
                key={tag}
                className="text-[10px] font-medium text-zinc-500 bg-zinc-100 rounded-full px-2.5 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2 text-[12px]">
          <div className="bg-zinc-50 rounded-xl px-3 py-2">
            <p className="text-zinc-400 text-[10px] uppercase tracking-wide font-medium mb-0.5">
              Contribution
            </p>
            <p className="font-bold text-zinc-900 text-[14px]">
              {formatNaira(Number(group.contribution) || 0)}
              <span className="text-zinc-400 font-normal text-[11px]">
                /{freqLabel(group.frequency).toLowerCase()}
              </span>
            </p>
          </div>
          <div className="bg-zinc-50 rounded-xl px-3 py-2">
            <p className="text-zinc-400 text-[10px] uppercase tracking-wide font-medium mb-0.5">
              Payout
            </p>
            <p className="font-semibold text-zinc-700 text-[13px] capitalize">
              {payoutLabel(group.payout_order)}
            </p>
          </div>
        </div>

        {/* Member fill bar */}
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="text-zinc-400 flex items-center gap-1">
              <Users size={10} /> {membersCount}/{maxMembers} members
            </span>
            {almostFull ? (
              <span className="text-amber-600 font-semibold">
                {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left
              </span>
            ) : spotsLeft > 0 ? (
              <span className="text-zinc-400">{spotsLeft} open</span>
            ) : (
              <span className="text-emerald-600 font-semibold">Full</span>
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
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${trustColor(trustScore)}`}
          >
            <ShieldCheck size={10} />
            {trustScore}% trust
          </span>
          <span className="text-zinc-400 flex items-center gap-1">
            <TrendingUp size={10} />
            {formatNaira(totalPaidOut)} paid out
          </span>
        </div>
      </CardContent>

      <CardFooter className="border-t border-zinc-100 pt-3">
        <RequestToJoinButton group={group}   />
        <Link href={`/groups/${group.id}`}>
          <Button variant="ghost" size="sm" className="rounded-xl gap-1">
            Details <ChevronRight size={13} />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
