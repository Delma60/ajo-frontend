"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Auth } from "@/lib/auth";
import { useForm } from "@/lib/hooks/use-form";

type LoginFields = {
  email: string;
  password: string;
};

export default function Login() {
  const { register, handleSubmit, setErrors, isSubmitting } = useForm<LoginFields>({
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
        minLength: { value: 6, message: "Password must be at least 6 characters." },
      },
    },
    onSubmit: async (values) => {
      const success = await Auth.attempt({ email: values.email, password: values.password });
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
      <div
        className="hidden lg:flex lg:w-1/2 xl:w-[55%] flex-col justify-between p-12 xl:p-20 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #064e3b 0%, #065f46 45%, #047857 100%)" }}
      >
        <div
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #6ee7b7 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-0 right-0 w-72 h-72 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #a7f3d0 0%, transparent 70%)" }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm1 8h-2v-5l4 2.5-2 1.15V14z" fill="#34d399" />
              </svg>
            </div>
            <span className="text-white font-semibold text-xl" style={{ fontFamily: "'Georgia', serif" }}>
              AjoSave
            </span>
          </div>
        </div>

        {/* Hero */}
        <div className="relative z-10 space-y-8">
          <div className="flex gap-4 mb-10">
            {["Adaeze", "Emeka", "Fatima", "Chidi"].map((name, i) => (
              <div key={name} className="flex flex-col items-center gap-2">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-base font-bold text-white border-2 border-emerald-400/40"
                  style={{
                    background: `hsl(${160 + i * 15}, 60%, ${35 + i * 5}%)`,
                    boxShadow: i === 2 ? "0 0 0 4px rgba(52,211,153,0.3)" : "none",
                  }}
                >
                  {name[0]}
                </div>
                <span className="text-emerald-200/60 text-xs font-medium">{name}</span>
              </div>
            ))}
          </div>

          <div>
            <h1
              className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              Save together,<br />
              <span className="text-emerald-300">grow together.</span>
            </h1>
            <p className="text-emerald-100/80 text-lg leading-relaxed max-w-md">
              Join your community&apos;s rotating savings circle. Transparent, trusted, and on time — every cycle.
            </p>
          </div>

          <div className="flex gap-10 pt-6">
            {[
              { label: "Active circles", value: "2,400+" },
              { label: "Paid out", value: "₦1.2B" },
              { label: "Members", value: "18,000" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-white font-bold text-2xl">{stat.value}</div>
                <div className="text-emerald-200/60 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <blockquote className="text-emerald-100/60 text-base italic border-l-2 border-emerald-400/30 pl-5">
            &ldquo;Ajo saved me when the bank wouldn&apos;t.&rdquo; — Ngozi, Lagos
          </blockquote>
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 md:p-16 lg:p-24 bg-white dark:bg-zinc-950">
        
        {/* Mobile logo */}
        <div className="lg:hidden mb-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm1 8h-2v-5l4 2.5-2 1.15V14z" fill="white" />
            </svg>
          </div>
          <span className="font-bold text-zinc-900 dark:text-white text-xl" style={{ fontFamily: "'Georgia', serif" }}>
            AjoSave
          </span>
        </div>

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

          <button
            type="button"
            className="w-full h-12 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-base font-medium flex items-center justify-center gap-3 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

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