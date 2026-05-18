// components/auth-branding.tsx
import React from "react";

interface AuthBrandingProps {
  title: React.ReactNode;
  description: string;
  quote: React.ReactNode;
}

export function AuthBranding({ title, description, quote }: AuthBrandingProps) {
  return (
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
            {title}
          </h1>
          <p className="text-emerald-100/80 text-lg leading-relaxed max-w-md">
            {description}
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
          {quote}
        </blockquote>
      </div>
    </div>
  );
}