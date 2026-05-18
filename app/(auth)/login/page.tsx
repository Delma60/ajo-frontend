// app/(auth)/login/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Auth } from "@/lib/auth";
import { useForm } from "@/lib/hooks/use-form";
import { AuthBranding } from "@/components/auth-branding";
import { GoogleAuthButton } from "@/components/google-auth-button";
import { MobileLogo } from "@/components/mobile-logo";

type LoginFields = {
  email: string;
  password: string;
};

export default function Login() {
  const { register, handleSubmit, setErrors, isSubmitting } =
    useForm<LoginFields>({
      initialValues: { email: "", password: "" },
      rules: {
        email: {
          required: "Email is required.",
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Please enter a valid email address.",
          },
        },
        password: {
          required: "Password is required.",
          minLength: {
            value: 6,
            message: "Password must be at least 6 characters.",
          },
        },
      },
      onSubmit: async (values) => {
        const success = await Auth.attempt({
          email: values.email,
          password: values.password,
        });
        if (!success) {
          setErrors({
            email: " ",
            password: "Invalid email or password. Please try again.",
          });
        }
      },
    });

  const emailField = register("email");
  const passwordField = register("password");

  return (
    <div className="min-h-screen flex w-full">
      {/* ── Left panel: branding ── */}
      <AuthBranding
        title={
          <>
            Save together,
            <br />
            <span className="text-emerald-300">grow together.</span>
          </>
        }
        description="Join your community's rotating savings circle. Transparent, trusted, and on time — every cycle."
        quote={
          <>
            &ldquo;Ajo saved me when the bank wouldn&apos;t.&rdquo; — Ngozi,
            Lagos
          </>
        }
      />

      {/* ── Right panel: form ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 md:p-16 lg:p-24 bg-white dark:bg-zinc-950">
        {/* Mobile logo */}
       <MobileLogo />

        <div className="w-full max-w-[420px]">
          <div className="mb-10">
            <h2
              className="text-3xl font-bold text-zinc-900 dark:text-white mb-3"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              Welcome back
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-base">
              Sign in to manage your circles and contributions.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...emailField}
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-zinc-900 dark:text-white">
                  Password
                </label>
                <a
                  href="/forgot-password"
                  className="text-sm text-emerald-700 hover:text-emerald-600 hover:underline transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                {...passwordField}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full rounded-xl mt-4"
              loading={isSubmitting}
            >
              {isSubmitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <div className="relative my-8 flex items-center">
            <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
            <span className="mx-4 text-sm text-zinc-400">or continue with</span>
            <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
          </div>

          <GoogleAuthButton text="Continue with Google" />

          <p className="mt-8 text-center text-base text-zinc-500 dark:text-zinc-400">
            Don&apos;t have an account?{" "}
            <a
              href="/register"
              className="text-emerald-700 font-medium hover:text-emerald-600 hover:underline transition-colors"
            >
              Create one
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
