import { Auth, Role } from "./auth";
import type { AppUser } from "./app-user";

Auth.extend<AppUser>("web", {
    driver: "cookie",
    endpoints: {
        login: "/auth/login",
        logout: "/auth/logout",
        user: "/auth/me",
        refresh: "/auth/refresh",
    },
    tokenKey: "auth_token",
    refreshTokenKey: "auth_refresh",
    tokenType: "Bearer",
    autoRefresh: true,
    refreshThresholdSeconds: 120,
    roleFactory: (user) => new Role(user.roles, user.permissions),
    events: {
        onLogin: (user) => {
            console.log(`[Auth] Logged in as ${user.email}`);
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
