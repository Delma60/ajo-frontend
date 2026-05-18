// app/(dashs)/(user)/settings/notifications/page.tsx
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
import { Button } from "@/components/ui/button";
import { HTTPS } from "@/lib/http";
import { Bell, Mail, Smartphone, MessageSquare, ShieldCheck } from "lucide-react";

// --- Inline Toggle Component ---
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
        checked ? "bg-emerald-500" : "bg-zinc-200 dark:bg-zinc-700"
      }`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function NotificationsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Preference State
  const [prefs, setPrefs] = useState({
    email_payouts: true,
    email_invites: true,
    email_marketing: false,
    push_activity: true,
    push_reminders: true,
    sms_security: true,
  });

  // Simulate fetching existing preferences
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        // Replace with your actual endpoint if you have a dedicated preferences route
        // const res = await HTTPS.get<any>("/user/preferences");
        // if (res.data) setPrefs(res.data.notifications);
        
        // Simulating network delay
        setTimeout(() => setIsLoading(false), 600);
      } catch (err) {
        console.error("Failed to load preferences", err);
        setIsLoading(false);
      }
    };
    fetchPreferences();
  }, []);

  const handleToggle = (key: keyof typeof prefs) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
    setSuccessMsg(""); // Clear success message on change so they know they need to save
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSuccessMsg("");

    try {
      // Adjust endpoint to match your Laravel backend structure
      const res = await HTTPS.put<any>("/user/profile", {
        // Sending as a meta object or whatever your backend expects
        meta: { notifications: prefs } 
      });

      if (res.statusCode >= 200 && res.statusCode < 300) {
        setSuccessMsg("Notification preferences updated.");
      } else {
        alert(res.message || "Failed to update preferences.");
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
        <div className="h-64 w-full bg-zinc-200 dark:bg-zinc-800 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white" style={{ fontFamily: "Georgia, serif" }}>
            Notifications
          </h1>
          <p className="text-zinc-500 mt-1">
            Choose what you want to be notified about and how we should reach you.
          </p>
        </div>
        <Button onClick={handleSave} variant="primary" loading={isSaving} className="rounded-xl px-6">
          Save Preferences
        </Button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium flex items-center gap-2 border border-emerald-100">
          <ShieldCheck size={16} />
          {successMsg}
        </div>
      )}

      {/* Email Notifications */}
      <Card variant="default">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail size={18} className="text-zinc-400" />
            Email Notifications
          </CardTitle>
          <CardDescription>Updates sent directly to your registered email address.</CardDescription>
        </CardHeader>
        <CardDivider />
        <CardContent className="p-0">
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            <div className="flex items-center justify-between p-5 sm:px-6">
              <div className="pr-4">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Contributions & Payouts</p>
                <p className="text-xs text-zinc-500 mt-0.5">Receive receipts for deposits and alerts when your payout is ready.</p>
              </div>
              <Toggle checked={prefs.email_payouts} onChange={() => handleToggle("email_payouts")} />
            </div>

            <div className="flex items-center justify-between p-5 sm:px-6">
              <div className="pr-4">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Circle Invites</p>
                <p className="text-xs text-zinc-500 mt-0.5">Get notified when someone invites you to join a new savings circle.</p>
              </div>
              <Toggle checked={prefs.email_invites} onChange={() => handleToggle("email_invites")} />
            </div>

            <div className="flex items-center justify-between p-5 sm:px-6">
              <div className="pr-4">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">News & Marketing</p>
                <p className="text-xs text-zinc-500 mt-0.5">Receive tips, newsletters, and promotional offers from AjoSave.</p>
              </div>
              <Toggle checked={prefs.email_marketing} onChange={() => handleToggle("email_marketing")} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card variant="default">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell size={18} className="text-zinc-400" />
            Push Notifications
          </CardTitle>
          <CardDescription>Alerts delivered to your device via the AjoSave app or browser.</CardDescription>
        </CardHeader>
        <CardDivider />
        <CardContent className="p-0">
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            <div className="flex items-center justify-between p-5 sm:px-6">
              <div className="pr-4">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Activity Alerts</p>
                <p className="text-xs text-zinc-500 mt-0.5">Real-time alerts for circle messages, member joins, and system updates.</p>
              </div>
              <Toggle checked={prefs.push_activity} onChange={() => handleToggle("push_activity")} />
            </div>

            <div className="flex items-center justify-between p-5 sm:px-6">
              <div className="pr-4">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Payment Reminders</p>
                <p className="text-xs text-zinc-500 mt-0.5">Helpful nudges 24 hours before your circle contribution is due.</p>
              </div>
              <Toggle checked={prefs.push_reminders} onChange={() => handleToggle("push_reminders")} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SMS Notifications */}
      <Card variant="default">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare size={18} className="text-zinc-400" />
            SMS Notifications
          </CardTitle>
          <CardDescription>Critical alerts sent via text message to your phone number.</CardDescription>
        </CardHeader>
        <CardDivider />
        <CardContent className="p-0">
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            <div className="flex items-center justify-between p-5 sm:px-6 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-b-xl">
              <div className="pr-4 flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Security & OTP</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    We always send an SMS for login codes, password resets, and critical account security events. 
                    <span className="block mt-1 font-medium text-emerald-700 dark:text-emerald-400">This cannot be disabled.</span>
                  </p>
                </div>
              </div>
              {/* Disabled switch to indicate it's required */}
              <button
                type="button"
                disabled
                className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent bg-emerald-500/50 cursor-not-allowed"
              >
                <span className="inline-block h-5 w-5 transform rounded-full bg-white shadow translate-x-5" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}