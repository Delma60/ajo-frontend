// app/(dashs)/(user)/settings/security/page.tsx
"use client";

import React, { useState } from "react";
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
import { HTTPS } from "@/lib/http";
import { useForm } from "@/lib/hooks/use-form";
import { ShieldCheck, Key, Smartphone, AlertCircle } from "lucide-react";

type PasswordFields = {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
};

export default function SecurityPage() {
  const [successMsg, setSuccessMsg] = useState("");

  const { register, handleSubmit, setErrors, setValue, isSubmitting } = useForm<PasswordFields>({
    initialValues: {
      current_password: "",
      new_password: "",
      new_password_confirmation: "",
    },
    rules: {
      current_password: {
        required: "Current password is required.",
      },
      new_password: {
        required: "New password is required.",
        minLength: { value: 8, message: "Password must be at least 8 characters." },
      },
      new_password_confirmation: {
        required: "Please confirm your new password.",
      },
    },
    onSubmit: async (values) => {
      setSuccessMsg("");

      // Validate matching passwords locally before sending
      if (values.new_password !== values.new_password_confirmation) {
        setErrors({ new_password_confirmation: "Passwords do not match." });
        return;
      }

      // Hit your Laravel backend to update the password
      // Adjust the endpoint "/user/password" to match your actual API route
      const res = await HTTPS.put<any>("/user/password", values);

      if (res.statusCode >= 200 && res.statusCode < 300) {
        setSuccessMsg("Password updated successfully.");
        // Clear the form fields after success
        setValue("current_password", "");
        setValue("new_password", "");
        setValue("new_password_confirmation", "");
      } else if (res.errors) {
        // Map backend validation errors
        const backendErrors: Partial<Record<keyof PasswordFields, string>> = {};
        for (const [key, msgs] of Object.entries(res.errors)) {
          backendErrors[key as keyof PasswordFields] = (msgs as string[])[0];
        }
        setErrors(backendErrors);
      } else {
        setErrors({ current_password: res.message || "Failed to update password." });
      }
    },
  });

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white" style={{ fontFamily: "Georgia, serif" }}>
          Security
        </h1>
        <p className="text-zinc-500 mt-1">
          Manage your password and secure your account.
        </p>
      </div>

      {/* Change Password Card */}
      <Card variant="default">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key size={18} className="text-zinc-400" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your password regularly to keep your account secure.
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
            <div className="space-y-1 max-w-md">
              <Input
                label="Current Password"
                type="password"
                placeholder="Enter current password"
                {...register("current_password")}
              />
            </div>

            <div className="space-y-1 max-w-md">
              <Input
                label="New Password"
                type="password"
                placeholder="Enter new password (min. 8 characters)"
                {...register("new_password")}
              />
            </div>

            <div className="space-y-1 max-w-md">
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Re-enter new password"
                {...register("new_password_confirmation")}
              />
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
              <Button type="submit" variant="primary" loading={isSubmitting} className="rounded-xl px-8">
                Update Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication (Placeholder) */}
      <Card variant="default">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone size={18} className="text-zinc-400" />
            Two-Factor Authentication (2FA)
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account by requiring more than just a password to log in.
          </CardDescription>
        </CardHeader>
        <CardDivider />
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50">
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Authenticator App
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Use an app like Google Authenticator or Authy to generate verification codes.
              </p>
            </div>
            <Button variant="outline" className="rounded-lg shrink-0" onClick={() => alert("2FA setup coming soon!")}>
              Enable
            </Button>
          </div>
          
          <div className="mt-4 flex items-start gap-2 text-xs text-zinc-500">
            <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
            <p>
              Enabling 2FA will require you to enter a 6-digit code every time you log in or make a withdrawal.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}