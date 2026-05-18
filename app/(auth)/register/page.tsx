// app/(auth)/register/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Auth } from "@/lib/auth";
import { HTTPS } from "@/lib/http";
import { useForm } from "@/lib/hooks/use-form";
import { AuthBranding } from "@/components/auth-branding";
import { GoogleAuthButton } from "@/components/google-auth-button";
import { MobileLogo } from "@/components/mobile-logo";

type RegisterFields = {
  name: string;
  email: string;
  password: string;
  phone: string;
};

export default function Register() {
  const { register, handleSubmit, setErrors, isSubmitting } =
    useForm<RegisterFields>({
      initialValues: { name: "", email: "", password: "", phone: "" },
      rules: {
        name: {
          required: "Full name is required.",
        },
        email: {
          required: "Email is required.",
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Please enter a valid email address.",
          },
        },
        phone: {
          required: "Phone number is required.",
          pattern: {
            value: /^\+?[0-9]{10,15}$/,
            message: "Please enter a valid phone number.",
          },
        },
        password: {
          required: "Password is required.",
          minLength: {
            value: 8,
            message: "Password must be at least 8 characters.",
          },
        },
      },
      onSubmit: async (values) => {
        const res = await HTTPS.post("/auth/register", {
          name: values.name,
          email: values.email,
          phone: values.phone,
          password: values.password,
          password_confirmation: values.password,
        });

        if (res.errors) {
          const backendErrors: Partial<Record<keyof RegisterFields, string>> =
            {};
          for (const [key, msgs] of Object.entries(res.errors)) {
            backendErrors[key as keyof RegisterFields] = msgs[0] as string;
          }
          setErrors(backendErrors);
          return;
        }

        if (res.statusCode >= 200 && res.statusCode < 300) {
          const success = await Auth.attempt({
            email: values.email,
            password: values.password,
          });
          if (success) {
            window.location.href = "/";
          } else {
            window.location.href = "/login?registered=true";
          }
        } else {
          setErrors({
            email: " ",
            password: res.message || "Registration failed. Please try again.",
          });
        }
      },
    });

  const nameField = register("name");
  const emailField = register("email");
  const passwordField = register("password");

  return (
    <div className="min-h-screen flex w-full">
      {/* ── Left panel: branding ── */}
      <AuthBranding
        title={
          <>
            Start saving,
            <br />
            <span className="text-emerald-300">reach your goals.</span>
          </>
        }
        description="Create an account in seconds to join trusted rotational savings circles with your friends and community."
        quote={
          <>
            &ldquo;I used my Ajo payout to start my business. Highly
            recommended!&rdquo; — Chinedu, Abuja
          </>
        }
      />

      {/* ── Right panel: form ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 md:p-16 lg:p-24 bg-white dark:bg-zinc-950 overflow-y-auto">
        {/* Mobile logo */}
        <MobileLogo />

        <div className="w-full max-w-[420px] py-8">
          <div className="mb-10">
            <h2
              className="text-3xl font-bold text-zinc-900 dark:text-white mb-3"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              Create an account
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-base">
              Join your community and start saving today.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <Input
              label="Full name"
              type="text"
              placeholder="e.g. Adaeze Okafor"
              autoComplete="name"
              {...nameField}
            />

            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...emailField}
            />

            <Input
              label="Phone Number"
              type="tel"
              placeholder="080123456789"
              autoComplete="phone"
              {...register("phone")}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Create a strong password"
              autoComplete="new-password"
              {...passwordField}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full rounded-xl mt-4"
              loading={isSubmitting}
            >
              {isSubmitting ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <div className="relative my-8 flex items-center">
            <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
            <span className="mx-4 text-sm text-zinc-400">or sign up with</span>
            <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
          </div>

          <GoogleAuthButton text="Sign up with Google" />

          <p className="mt-8 text-center text-base text-zinc-500 dark:text-zinc-400">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-emerald-700 font-medium hover:text-emerald-600 hover:underline transition-colors"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
