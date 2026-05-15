import { NextRequest, NextResponse } from "next/server";

// ─── Constants ────────────────────────────────────────────────────────────────
// Must match the values in lib/auth.bootstrap.ts
const TOKEN_COOKIE = "auth_token";
const LOGIN_PATH   = "/login";

/**
 * Routes that are always public.
 * Unauthenticated users are freely allowed here.
 */
const PUBLIC_PATHS = [
    LOGIN_PATH,
    "/register",
    "/forgot-password",
];

/**
 * Static asset / Next.js internals — never touch these.
 */
const BYPASS_PREFIXES = [
    "/_next/",
    "/favicon",
    "/api/",       // API routes handle their own auth
];

// ─── JWT helpers (Edge-safe, no Node builtins) ────────────────────────────────

interface JwtPayload {
    exp?: number;
    iat?: number;
    sub?: string | number;
    [key: string]: unknown;
}

function decodeJwt(token: string): JwtPayload | null {
    try {
        const base64 = token.split(".")[1];
        const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
        return JSON.parse(json) as JwtPayload;
    } catch {
        return null;
    }
}

function isTokenExpired(token: string): boolean {
    const payload = decodeJwt(token);
    if (!payload?.exp) return false; // no expiry → treat as valid
    return payload.exp < Math.floor(Date.now() / 1000);
}

function isTokenValid(token: string | undefined): boolean {
    if (!token) return false;
    return !isTokenExpired(token);
}

// ─── Route classification ─────────────────────────────────────────────────────

function shouldBypass(pathname: string): boolean {
    return BYPASS_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isPublicPath(pathname: string): boolean {
    return PUBLIC_PATHS.some(
        (p) => pathname === p || pathname.startsWith(p + "/")
    );
}

// ─── Proxy (formerly middleware) ──────────────────────────────────────────────

export function proxy(request: NextRequest): NextResponse {
    const { pathname } = request.nextUrl;

    // 1. Let Next.js internals and static files pass through untouched.
    if (shouldBypass(pathname)) {
        return NextResponse.next();
    }

    const token    = request.cookies.get(TOKEN_COOKIE)?.value;
    const authed   = isTokenValid(token);
    const isPublic = isPublicPath(pathname);

    // 2. Authenticated user hitting a public-only page (e.g. /login) → redirect home.
    if (authed && isPublic) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    // 3. Unauthenticated user hitting a protected page → redirect to login.
    if (!authed && !isPublic) {
        const loginUrl = new URL(LOGIN_PATH, request.url);
        loginUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // 4. Everything else: let the request through.
    return NextResponse.next();
}

// ─── Matcher ──────────────────────────────────────────────────────────────────

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};