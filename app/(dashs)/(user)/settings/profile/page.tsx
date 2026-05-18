"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDivider,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "@/lib/hooks/use-form";
import { Auth } from "@/lib/auth";
import { HTTPS } from "@/lib/http";
import type { IUser } from "@/lib/types/user.types";
import { UserCircle, Mail, Phone, ShieldCheck } from "lucide-react";

type ProfileFields = {
  name: string;
  email: string;
  phone: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<IUser | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  // Initialize form
  const { register, handleSubmit, setValue, setErrors, isSubmitting } =
    useForm<ProfileFields>({
      initialValues: { name: "", email: "", phone: "" },
      rules: {
        name: { required: "Name is required." },
        email: {
          required: "Email is required.",
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Invalid email address.",
          },
        },
      },
      onSubmit: async (values) => {
        setSuccessMsg("");

        // Hit your Laravel backend to update the profile
        const res = await HTTPS.put<any>("/profile/update", values);

        if (res.statusCode >= 200 && res.statusCode < 300) {
          setSuccessMsg("Profile updated successfully.");
          // Re-fetch user to update global state/sidebar
          await Auth.fetchUser();
        } else if (res.errors) {
          // Map backend validation errors to form fields
          const backendErrors: Partial<Record<keyof ProfileFields, string>> =
            {};
          for (const [key, msgs] of Object.entries(res.errors)) {
            backendErrors[key as keyof ProfileFields] = (msgs as string[])[0];
          }
          setErrors(backendErrors);
        } else {
          setErrors({ name: res.message || "Failed to update profile." });
        }
      },
    });

  // Load user data into form on mount
  useEffect(() => {
    const currentUser = Auth.user() as unknown as IUser;
    if (currentUser) {
      setUser(currentUser);
      console.log("Current user:", currentUser);
      setValue("name", currentUser.name || "");
      setValue("email", currentUser.email || "");
      setValue("phone", (currentUser as any).phone || "");
    }
  }, []);

  if (!user) {
    return (
      <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
        <div className="h-64 w-full bg-zinc-200 dark:bg-zinc-800 rounded-2xl"></div>
      </div>
    );
  }

  // Helper to get initials
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : "U";

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1
          className="text-3xl font-bold text-zinc-900 dark:text-white"
          style={{ fontFamily: "Georgia, serif" }}
        >
          My Profile
        </h1>
        <p className="text-zinc-500 mt-1">
          Manage your personal information and preferences.
        </p>
      </div>

      {/* Main Profile Card */}
      <Card variant="default">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Update your contact details and how we reach you.
          </CardDescription>
        </CardHeader>
        <CardDivider />
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Avatar Section (Read-only representation for now) */}
            <div className="flex items-center gap-5">
              <div className="h-20 w-20 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-2xl font-bold border-4 border-white dark:border-zinc-950 shadow-sm">
                {initials}
              </div>
              <div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="rounded-lg"
                >
                  Change Photo
                </Button>
                <p className="text-xs text-zinc-500 mt-2">
                  JPG, GIF or PNG. 1MB max.
                </p>
              </div>
            </div>

            {successMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium flex items-center gap-2 border border-emerald-100">
                <ShieldCheck size={16} />
                {successMsg}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <Input
                  label="Full Name"
                  placeholder="e.g. Adaeze Okafor"
                  // icon={<UserCircle size={18} className="text-zinc-400" />}
                  {...register("name")}
                />
              </div>

              <div className="space-y-1">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  // icon={<Mail size={18} className="text-zinc-400" />}
                  {...register("email")}
                />
              </div>

              <div className="space-y-1">
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="08012345678"
                  // icon={<Phone size={18} className="text-zinc-400" />}
                  {...register("phone")}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting}
                className="rounded-xl px-8"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Account Verification Status */}
      <Card variant="tinted" className="bg-zinc-50 border-zinc-200">
        <CardContent className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-900">
              Identity Verification (KYC)
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              {(user as any).isVerified
                ? "Your account is fully verified. You have access to all features."
                : "Verify your identity to unlock withdrawals and premium circles."}
            </p>
          </div>
          <Button
            variant={(user as any).isVerified ? "outline" : "primary"}
            size="sm"
            className="rounded-lg shrink-0"
            onClick={() => (window.location.href = "/settings/kyc")}
          >
            {(user as any).isVerified ? "View Status" : "Verify Now"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
