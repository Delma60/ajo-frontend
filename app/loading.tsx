import React from "react";

export default function Loading() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-[9999]">
      <div className="flex flex-col items-center gap-6 animate-in fade-in duration-500">
        {/* Branded Logo Animation */}
        <div className="relative">
          {/* Pulsing Outer Ring */}
          <div className="absolute inset-0 rounded-2xl bg-emerald-100 animate-ping opacity-20" />

          {/* Main Logo Box */}
          <div className="relative w-16 h-16 rounded-2xl bg-emerald-800 flex items-center justify-center shadow-lg shadow-emerald-900/10">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              className="text-white"
            >
              <path
                d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm1 8h-2v-5l4 2.5-2 1.15V14z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>

        {/* Brand Identity */}
        <div className="text-center space-y-2">
          <h2
            className="text-2xl font-bold text-zinc-900 tracking-tight"
            style={{ fontFamily: "Georgia, serif" }}
          >
            AjoSave
          </h2>
          <div className="flex items-center justify-center gap-2">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce" />
            </div>
          </div>
        </div>
      </div>

      {/* Background Decorative Elements */}
      <div className="absolute top-0 inset-x-0 h-40 bg-[radial-gradient(ellipse_50%_100%_at_50%_-20%,rgba(5,150,105,0.05),transparent)] pointer-events-none" />
    </div>
  );
}
