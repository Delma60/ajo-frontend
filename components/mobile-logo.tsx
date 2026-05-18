// components/mobile-logo.tsx
import React from "react";

export function MobileLogo() {
  return (
    <div className="lg:hidden mb-10 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm1 8h-2v-5l4 2.5-2 1.15V14z"
            fill="white"
          />
        </svg>
      </div>
      <span
        className="font-bold text-zinc-900 dark:text-white text-xl"
        style={{ fontFamily: "'Georgia', serif" }}
      >
        AjoSave
      </span>
    </div>
  );
}