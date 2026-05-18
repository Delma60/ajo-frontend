"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Info,
  Wallet,
  ShieldCheck,
  Users,
  CalendarClock,
  CircleDollarSign,
  Lock,
  Globe,
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/utils";
import { HTTPS } from "@/lib/http";
import { IGroup } from "@/lib/types/group.types";
import { Auth } from "@/lib/auth";

export default function CreateGroupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userId = Auth.id();

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    contribution: "",
    max_members: "10",
    frequency: "monthly",
    payout_order: "rotational",
    is_private: false,
  });

  // Derived Calculations
  const contributionNum = Number(formData.contribution) || 0;
  const membersNum = Number(formData.max_members) || 1;
  const poolSize = contributionNum * membersNum;

  // Creation Fee: 5% of the base contribution (as fixed in the backend)
  const creationFee = contributionNum * 0.05;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // "goal" is required by the backend, usually representing the total cycle pool
      const payload = {
        ...formData,
        status: "active",
        goal: poolSize,
        contribution: contributionNum,
        max_members: membersNum,
        owner_id: userId,
      };

      const { data, ok, message } = await HTTPS.post<IGroup>(
        "/groups",
        payload,
      );
      if (!ok) {
        console.log(message);
      }
      // On success, redirect to the new group's page
      const newGroupId = data?.id;
      // if (newGroupId) {
      //   router.push(`/groups/${newGroupId}`);
      // } else {
      //   router.push("/groups");
      // }
    } catch (err: any) {
      console.error("Group creation failed:", err);
      // Catch backend wallet balance error specifically
      setError(
        err.response?.data?.message ||
          "Failed to create circle. Please ensure you have sufficient wallet balance.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-zinc-50/40 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header */}
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
            Create a New Circle
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            Set up your rules, invite trusted friends, and start saving
            together.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"
        >
          {/* Left Column: Form Fields */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Info */}
            <Card variant="default">
              <CardHeader>
                <CardTitle>Circle Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-[13px] font-semibold text-zinc-700 mb-1.5">
                    Circle Name
                  </label>
                  <input
                    required
                    minLength={8}
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Lagos Tech Bros Savings"
                    className="w-full h-10 px-3 rounded-xl border border-zinc-200 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/20"
                  />
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Must be at least 8 characters long.
                  </p>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-zinc-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="What is the goal of this circle?"
                    className="w-full p-3 rounded-xl border border-zinc-200 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/20 min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Financial Rules */}
            <Card variant="default">
              <CardHeader>
                <CardTitle>Rules & Finances</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-semibold text-zinc-700 mb-1.5">
                      Contribution Amount (₦)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">
                        ₦
                      </span>
                      <input
                        required
                        type="number"
                        name="contribution"
                        value={formData.contribution}
                        onChange={handleChange}
                        placeholder="50000"
                        min="500"
                        className="w-full h-10 pl-8 pr-3 rounded-xl border border-zinc-200 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-zinc-700 mb-1.5">
                      Frequency
                    </label>
                    <select
                      name="frequency"
                      value={formData.frequency}
                      onChange={handleChange}
                      className="w-full h-10 px-3 rounded-xl border border-zinc-200 text-sm outline-none focus:border-emerald-600 bg-white"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="bi-weekly">Bi-Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-semibold text-zinc-700 mb-1.5">
                      Max Members
                    </label>
                    <input
                      required
                      type="number"
                      name="max_members"
                      value={formData.max_members}
                      onChange={handleChange}
                      min="2"
                      max="100"
                      className="w-full h-10 px-3 rounded-xl border border-zinc-200 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-zinc-700 mb-1.5">
                      Payout Order
                    </label>
                    <select
                      name="payout_order"
                      value={formData.payout_order}
                      onChange={handleChange}
                      className="w-full h-10 px-3 rounded-xl border border-zinc-200 text-sm outline-none focus:border-emerald-600 bg-white"
                    >
                      <option value="rotational">
                        Rotational (Fixed Turns)
                      </option>
                      <option value="random">Random Draw</option>
                      <option value="bidding">Bidding (Auction)</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card variant="default">
              <CardHeader>
                <CardTitle>Privacy</CardTitle>
              </CardHeader>
              <CardContent>
                <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-colors">
                  <div className="flex items-center h-5 mt-0.5">
                    <input
                      type="checkbox"
                      name="is_private"
                      checked={formData.is_private}
                      onChange={handleChange}
                      className="w-4 h-4 rounded text-emerald-600 border-zinc-300 focus:ring-emerald-600"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-semibold text-zinc-900 flex items-center gap-2">
                      {formData.is_private ? (
                        <Lock size={14} />
                      ) : (
                        <Globe size={14} />
                      )}
                      Make this circle private
                    </p>
                    <p className="text-[13px] text-zinc-500 mt-1">
                      If private, the circle will not appear on the Discover
                      page. Users can only join via a direct invite link sent by
                      you.
                    </p>
                  </div>
                </label>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Checkout/Summary Sidebar */}
          <div className="sticky top-6 space-y-4">
            {error && (
              <div className="p-4 bg-red-50 text-red-700 text-[13px] rounded-xl border border-red-100 flex items-start gap-2">
                <Info size={16} className="shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <Card
              variant="flat"
              className="border-emerald-200 bg-emerald-50/30"
            >
              <CardHeader className="pb-3 border-b border-emerald-100">
                <CardTitle className="text-emerald-900">
                  Circle Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-zinc-600 flex items-center gap-1.5">
                    <CircleDollarSign size={14} /> Total Pool
                  </span>
                  <span className="font-bold text-zinc-900">
                    {formatNaira(poolSize)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-zinc-600 flex items-center gap-1.5">
                    <Users size={14} /> Capacity
                  </span>
                  <span className="font-semibold text-zinc-900">
                    {membersNum} members
                  </span>
                </div>

                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-zinc-600 flex items-center gap-1.5">
                    <CalendarClock size={14} /> Timeline
                  </span>
                  <span className="font-semibold text-zinc-900 capitalize">
                    {formData.frequency}
                  </span>
                </div>

                <div className="pt-4 border-t border-emerald-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-semibold text-zinc-900">
                        Creation Fee
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        5% one-time admin charge
                      </p>
                    </div>
                    <p className="text-lg font-bold text-emerald-700">
                      {formatNaira(creationFee)}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-emerald-100/50 pt-4 rounded-b-xl border-t border-emerald-100">
                <div className="w-full space-y-3">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full rounded-xl gap-2"
                    disabled={loading || contributionNum <= 0}
                  >
                    <Wallet size={16} />
                    {loading
                      ? "Processing..."
                      : `Pay ${formatNaira(creationFee)} & Create`}
                  </Button>
                  <p className="text-[11px] text-zinc-500 text-center flex items-center justify-center gap-1">
                    <ShieldCheck size={12} className="text-emerald-600" />
                    Fee will be deducted from your wallet
                  </p>
                </div>
              </CardFooter>
            </Card>

            <Card variant="flat" className="bg-zinc-50 border-0">
              <CardContent className="p-4 text-[12px] text-zinc-500 leading-relaxed">
                As the admin, your role is to ensure all members pay on time.
                You will be assigned the first turn by default in Rotational
                circles. The creation fee covers platform maintenance and
                security features.
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
}
