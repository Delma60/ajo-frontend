// app/(dashs)/(user)/settings/kyc/page.tsx
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
import { Auth } from "@/lib/auth";
import { HTTPS } from "@/lib/http";
import { useForm } from "@/lib/hooks/use-form";
import type { IUser } from "@/lib/types/user.types";
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  UploadCloud,
  FileText,
} from "lucide-react";

type KYCFields = {
  bvn: string;
  id_type: string;
  id_number: string;
};

export default function KYCPage() {
  const [user, setUser] = useState<IUser | null>(null);
  const [kycStatus, setKycStatus] = useState<
    "unverified" | "pending" | "verified"
  >("unverified");
  const [successMsg, setSuccessMsg] = useState("");

  const { register, handleSubmit, setErrors, isSubmitting } =
    useForm<KYCFields>({
      initialValues: { bvn: "", id_type: "nin", id_number: "" },
      rules: {
        bvn: {
          required: "BVN is required.",
          minLength: { value: 11, message: "BVN must be exactly 11 digits." },
          maxLength: { value: 11, message: "BVN must be exactly 11 digits." },
        },
        id_number: { required: "ID Number is required." },
      },
      onSubmit: async (values) => {
        setSuccessMsg("");

        // Call your backend KYC endpoint
        const res = await HTTPS.post<any>("/user/kyc", values);

        if (res.statusCode >= 200 && res.statusCode < 300) {
          setSuccessMsg("Verification details submitted successfully.");
          setKycStatus("pending");
          await Auth.fetchUser();
        } else if (res.errors) {
          const backendErrors: Partial<Record<keyof KYCFields, string>> = {};
          for (const [key, msgs] of Object.entries(res.errors)) {
            backendErrors[key as keyof KYCFields] = (msgs as string[])[0];
          }
          setErrors(backendErrors);
        } else {
          setErrors({
            bvn: res.message || "Submission failed. Please try again.",
          });
        }
      },
    });

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = Auth.user() as unknown as IUser;
      if (currentUser) {
        setUser(currentUser);
        // Assuming your backend sends something like isVerified or kyc_status
        const isVerified = (currentUser as any).isVerified;
        const status = (currentUser as any).kyc_status; // e.g., 'pending'

        if (isVerified) setKycStatus("verified");
        else if (status === "pending") setKycStatus("pending");
        else setKycStatus("unverified");
      }
    };
    loadUser();
  }, []);

  if (!user) {
    return (
      <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
        <div className="h-32 w-full bg-zinc-200 dark:bg-zinc-800 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1
          className="text-3xl font-bold text-zinc-900 dark:text-white"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Identity Verification
        </h1>
        <p className="text-zinc-500 mt-1">
          Secure your account and unlock higher transaction limits.
        </p>
      </div>

      {/* Status Banner */}
      {kycStatus === "verified" && (
        <Card variant="tinted" className="bg-emerald-50 border-emerald-200">
          <CardContent className="py-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-emerald-900">
                Account Fully Verified
              </h3>
              <p className="text-sm text-emerald-700 mt-1">
                Your identity has been verified. You now have full access to
                withdrawals and premium savings circles.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {kycStatus === "pending" && (
        <Card variant="tinted" className="bg-amber-50 border-amber-200">
          <CardContent className="py-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-amber-900">
                Verification Pending
              </h3>
              <p className="text-sm text-amber-700 mt-1">
                We are currently reviewing your documents. This usually takes
                between 1-24 hours. We will notify you once completed.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {kycStatus === "unverified" && (
        <Card variant="tinted" className="bg-rose-50 border-rose-200">
          <CardContent className="py-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-rose-900">
                Action Required
              </h3>
              <p className="text-sm text-rose-700 mt-1">
                Please complete your KYC verification below to secure your
                account and remove withdrawal limits.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verification Form */}
      {kycStatus === "unverified" && (
        <>
          <Card variant="default">
            <CardHeader>
              <CardTitle>Provide Verification Details</CardTitle>
              <CardDescription>
                Your data is encrypted and stored securely in accordance with
                NDPR guidelines.
              </CardDescription>
            </CardHeader>
            <CardDivider />
            <CardContent className="pt-6">
              {successMsg && (
                <div className="mb-6 p-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium flex items-center gap-2 border border-emerald-100">
                  <ShieldCheck size={16} />
                  {successMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1">
                  <Input
                    label="Bank Verification Number (BVN)"
                    type="text"
                    placeholder="11-digit BVN"
                    maxLength={11}
                    {...register("bvn")}
                  />
                  <p className="text-[11px] text-zinc-500">
                    Dial *565*0# on your registered mobile number to get your
                    BVN.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-zinc-900 dark:text-white">
                      ID Type
                    </label>
                    <select
                      className="w-full h-11 px-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-zinc-900 dark:text-zinc-100"
                      {...register("id_type")}
                    >
                      <option value="nin">National ID (NIN)</option>
                      <option value="passport">International Passport</option>
                      <option value="drivers_license">
                        Driver&apos;s License
                      </option>
                      <option value="voters_card">Voter&apos;s Card</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Input
                      label="ID Number"
                      type="text"
                      placeholder="Enter ID number"
                      {...register("id_number")}
                    />
                  </div>
                </div>

                {/* File Upload Area (UI Only) */}
                <div className="pt-4">
                  <label className="text-sm font-medium text-zinc-900 dark:text-white mb-2 block">
                    Upload ID Document
                  </label>
                  <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer group">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <UploadCloud size={24} />
                    </div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      SVG, PNG, JPG or PDF (max. 5MB)
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={isSubmitting}
                    className="rounded-xl px-8"
                  >
                    Submit Documents
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Privacy Note */}
          <div className="flex items-start gap-3 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl">
            <FileText className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Why do we need this?
              </p>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                As a financial service provider, we are required by the Central
                Bank of Nigeria (CBN) to verify the identity of our users. This
                helps prevent fraud, money laundering, and keeps the AjoSave
                community safe for everyone.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
