import { Auth, Role } from "./auth";
import type { AppUser } from "./app-user";
import { redirect } from "next/navigation";

Auth.extend<AppUser>("web", {
    driver: "cookie",
    
    endpoints: {
        login: "/auth/token-login",
        logout: "/auth/logout",
        user: "/auth/me",
        refresh: "/auth/refresh",
    },
    tokenKey: "auth_token",
    refreshTokenKey: "auth_refresh",
    tokenType: "Bearer",
    autoRefresh: true,
    refreshThresholdSeconds: 1200,
    roleFactory: (user) => new Role(user.roles, user.permissions),
    events: {
        onLogin: (user) => {
            console.log(`[Auth] Logged in as ${user.email}`);
            window.location.href = "/dashboard";
        },
        onLogout: () => {
            console.log("[Auth] Logged out");
            // router.push("/login");
        },
        onTokenRefreshed: (token) => {
            console.log("[Auth] Token refreshed", token.slice(0, 10) + "…");
        },
        onError: (err) => {
            console.error("[Auth] Error", err);
        },
    },
});
