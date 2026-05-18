"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  SidebarProvider,
  Sidebar,
  SidebarLayout,
  SidebarContent,
  SidebarHeader,
  SidebarScrollArea,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarSeparator,
  SidebarTrigger,
  SidebarRailToggle,
  SidebarUser,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  HomeIcon,
  UsersIcon,
  CompassIcon,
  WalletIcon,
  BellIcon,
  SettingsIcon,
  LogOutIcon,
  ChevronRightIcon,
  Ticket,
  TrendingUpIcon,
  UserCircleIcon,
  LifeBuoyIcon,
} from "lucide-react";
import { Auth } from "@/lib/auth";
import type { IUser } from "@/lib/types/user.types";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface NavChild {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  matchPrefix?: boolean;
  children?: NavChild[];
}

// ─── Nav config ────────────────────────────────────────────────────────────────

const MAIN_NAV: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <HomeIcon size={18} />,
  },
  {
    label: "Circles",
    href: "/groups",
    icon: <UsersIcon size={18} />,
    matchPrefix: true,
    children: [
      { label: "My Circles", href: "/groups" },
      { label: "Discover", href: "/groups/discover" },
      { label: "Create Circle", href: "/groups/create" },
    ],
  },
  {
    label: 'Transaction',
    href: '/transactions',
    icon: <Ticket size={18} />,
    matchPrefix: true,
    children: [
      { label: "History", href: "/transactions/history" },
    ]
  },
  {
      label: "Investments",
      href: "/investments",
      icon: <TrendingUpIcon size={18} />,
      matchPrefix: true,
      children: [
        { label: "Explore", href: "/investments" },
        { label: "My Portfolio", href: "/investments/portfolio" },
      ],
    },
];

const SETTINGS_NAV: NavItem[] = [
  {
    label: "Profile & KYC",
    href: "/settings/profile",
    icon: <UserCircleIcon size={18} />,
    matchPrefix: true,
    children: [
      { label: "My Profile", href: "/settings/profile" },
      { label: "Identity Verification", href: "/settings/kyc" },
      { label: "Security", href: "/settings/security" },
    ],
  },
  {
    label: "Settings",
    href: "/settings",
    icon: <SettingsIcon size={18} />,
    matchPrefix: true,
    children: [
      { label: "Notifications", href: "/settings/notifications" },
      { label: "Linked Banks", href: "/settings/banks" },
    ],
  },
  {
    label: "Help & Support",
    href: "/support",
    icon: <LifeBuoyIcon size={18} />,
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function isItemActive(item: NavItem, pathname: string): boolean {
  if (item.matchPrefix) {
    return pathname === item.href || pathname.startsWith(item.href + "/");
  }
  return pathname === item.href;
}

function isChildActive(children: NavChild[], pathname: string): boolean {
  return children.some((c) => pathname === c.href);
}

// ─── Child link ────────────────────────────────────────────────────────────────

function SidebarChildItem({ child }: { child: NavChild }) {
  const pathname = usePathname();
  const active = pathname === child.href;

  return (
    <Link
      href={child.href}
      className={[
        "flex items-center gap-2 rounded-lg px-3 py-2 text-[12.5px] font-medium transition-colors duration-150",
        active
          ? "text-emerald-300 bg-white/[.08]"
          : "text-emerald-100/40 hover:text-emerald-100/80 hover:bg-white/[.05]",
      ].join(" ")}
    >
      <span
        className={[
          "w-1 h-1 rounded-full shrink-0 transition-colors",
          active ? "bg-emerald-400" : "bg-emerald-100/20",
        ].join(" ")}
      />
      {child.label}
    </Link>
  );
}

// ─── Nav item (with optional children) ────────────────────────────────────────

function SidebarNavItem({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const { isRail } = useSidebar();

  const hasChildren = !!item.children?.length;
  const parentActive = isItemActive(item, pathname);
  const anyChildActive = hasChildren && isChildActive(item.children!, pathname);
  const shouldDefaultOpen = parentActive || anyChildActive;

  const [open, setOpen] = useState(shouldDefaultOpen);

  // Keep open when navigating into a child route
  useEffect(() => {
    if (shouldDefaultOpen) setOpen(true);
  }, [shouldDefaultOpen]);

  const rowActive = parentActive || anyChildActive;

  // ── Rail mode: just an icon link, no children ──────────────────────────────
  if (isRail) {
    return (
      <div className="relative px-2">
        <Link href={item.href} className="block">
          <div
            className={[
              "group relative flex w-10 mx-auto items-center justify-center rounded-xl py-2.5 transition-all duration-150",
              rowActive
                ? "bg-white/[.10] text-emerald-50"
                : "text-emerald-300/50 hover:text-emerald-300/80 hover:bg-white/[.07]",
            ].join(" ")}
          >
            {rowActive && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-emerald-400" />
            )}
            <span className="flex items-center justify-center w-[18px] text-[18px]">
              {item.icon}
            </span>
          </div>
        </Link>
      </div>
    );
  }

  // ── No children: plain link ────────────────────────────────────────────────
  if (!hasChildren) {
    return (
      <div className="relative px-2">
        <Link href={item.href} className="block">
          <div
            className={[
              "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5",
              "text-[13.5px] font-medium leading-none tracking-[-0.01em]",
              "transition-all duration-150 ease-out select-none",
              rowActive
                ? "bg-white/[.10] text-emerald-50 shadow-[inset_0_1px_0_rgba(255,255,255,.08),inset_0_0_0_1px_rgba(255,255,255,.06)]"
                : "text-emerald-100/70 hover:text-emerald-50 hover:bg-white/[.07]",
            ].join(" ")}
          >
            {rowActive && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-emerald-400" />
            )}
            <span
              className={[
                "shrink-0 flex items-center justify-center w-[18px] text-[18px] transition-colors duration-150",
                rowActive
                  ? "text-emerald-400"
                  : "text-emerald-300/50 group-hover:text-emerald-300/80",
              ].join(" ")}
            >
              {item.icon}
            </span>
            <span className="flex-1 truncate text-left">{item.label}</span>
            {item.badge !== undefined && (
              <span
                className={[
                  "ml-auto shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold leading-none tabular-nums",
                  rowActive
                    ? "bg-emerald-400/20 text-emerald-300"
                    : "bg-white/[.08] text-emerald-200/50",
                ].join(" ")}
              >
                {item.badge}
              </span>
            )}
          </div>
        </Link>
      </div>
    );
  }

  // ── Has children: collapsible ──────────────────────────────────────────────
  return (
    <div className="px-2">
      {/* Parent trigger — clicking toggles expand, does NOT navigate */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={[
          "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5",
          "text-[13.5px] font-medium leading-none tracking-[-0.01em]",
          "transition-all duration-150 ease-out select-none",
          rowActive
            ? "bg-white/[.10] text-emerald-50 shadow-[inset_0_1px_0_rgba(255,255,255,.08),inset_0_0_0_1px_rgba(255,255,255,.06)]"
            : "text-emerald-100/70 hover:text-emerald-50 hover:bg-white/[.07]",
        ].join(" ")}
      >
        {rowActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-emerald-400" />
        )}
        <span
          className={[
            "shrink-0 flex items-center justify-center w-[18px] text-[18px] transition-colors duration-150",
            rowActive
              ? "text-emerald-400"
              : "text-emerald-300/50 group-hover:text-emerald-300/80",
          ].join(" ")}
        >
          {item.icon}
        </span>
        <span className="flex-1 truncate text-left">{item.label}</span>
        {item.badge !== undefined && (
          <span className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold leading-none tabular-nums bg-white/[.08] text-emerald-200/50">
            {item.badge}
          </span>
        )}
        <ChevronRightIcon
          size={13}
          className={[
            "shrink-0 text-emerald-300/40 transition-transform duration-200",
            open ? "rotate-90" : "",
          ].join(" ")}
        />
      </button>

      {/* Children — smooth height animation */}
      <div
        className="overflow-hidden transition-all duration-200 ease-in-out"
        style={{
          maxHeight: open ? `${item.children!.length * 44}px` : "0px",
          opacity: open ? 1 : 0,
        }}
      >
        <div className="ml-[22px] mt-1 mb-1 pl-3 border-l border-white/[.07] flex flex-col gap-0.5">
          {item.children!.map((child) => (
            <SidebarChildItem key={child.href} child={child} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Logout ────────────────────────────────────────────────────────────────────

function LogoutItem() {
  const { isRail } = useSidebar();
  return (
    <div className="relative px-2">
      <button
        type="button"
        onClick={() => (window.location.href = "/login")}
        className="group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium leading-none tracking-[-0.01em] transition-all duration-150 text-red-400/60 hover:text-red-300 hover:bg-white/[.07] select-none"
      >
        <span className="shrink-0 flex items-center justify-center w-[18px]">
          <LogOutIcon size={18} />
        </span>
        {!isRail && <span className="flex-1 truncate text-left">Log out</span>}
      </button>
    </div>
  );
}

// ─── Layout ────────────────────────────────────────────────────────────────────

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<IUser | null>(null);
  useEffect(() => {
    setUser(Auth.user() as unknown as IUser);
  }, []);
  // Compute initials from user name
  function getInitials(name: string | undefined) {
    if (!name) return "";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || "";
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  return (
    <SidebarProvider defaultOpen persist>
      <SidebarLayout>
        <Sidebar>
          <SidebarHeader>
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600/30 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm1 8h-2v-5l4 2.5-2 1.15V14z"
                    fill="#34d399"
                  />
                </svg>
              </div>
              <span
                style={{ fontFamily: "Georgia,serif" }}
                className="text-white font-semibold text-lg"
              >
                AjoSave
              </span>
            </Link>
            <SidebarRailToggle className="ml-auto" />
          </SidebarHeader>

          <SidebarScrollArea>
            <SidebarGroup>
              <SidebarGroupLabel>Main</SidebarGroupLabel>
              <SidebarGroupContent>
                {MAIN_NAV.map((item) => (
                  <SidebarNavItem key={item.href} item={item} />
                ))}
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator />

            <SidebarGroup>
              <SidebarGroupLabel>Account</SidebarGroupLabel>
              <SidebarGroupContent>
                {SETTINGS_NAV.map((item) => (
                  <SidebarNavItem key={item.href} item={item} />
                ))}
                <LogoutItem />
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarScrollArea>

          <SidebarFooter>
            <SidebarUser
              name={user?.name || ""}
              email={user?.email || ""}
              initials={getInitials(user?.name)}
            />
          </SidebarFooter>
        </Sidebar>

        <SidebarContent>
          <header className="flex h-16 items-center gap-3 px-6 md:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <SidebarTrigger variant="mobile" />
            <span
              style={{ fontFamily: "Georgia,serif" }}
              className="font-semibold text-zinc-900 dark:text-white"
            >
              AjoSave
            </span>
          </header>
          <div className="flex-1">{children}</div>
        </SidebarContent>
      </SidebarLayout>
    </SidebarProvider>
  );
}
