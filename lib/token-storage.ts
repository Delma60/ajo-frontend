import type { StorageDriver } from "./types/auth.types";

export interface ITokenDriver {
    get(key: string): string | null;
    set(key: string, value: string, expiryDays?: number): void;
    remove(key: string): void;
}

// ─── Server-side cookie cache ─────────────────────────────────────────────────
// On the server, Next.js cookies() is async and can't be called inside a
// synchronous getter. Instead, we let the layout/middleware seed this cache
// once per request via `seedServerCookies()`, and the driver reads from it.

const _serverCookieCache = new Map<string, string>();
// let _isSeeded = false;

/**
 * Call this once in your root server layout (or any async server component)
 * before rendering children. It seeds the in-memory cookie cache so that
 * Auth.user() works transparently on the server.
 *
 * Usage (app/layout.tsx or app/(user)/layout.tsx):
 *   import { seedServerCookies } from "@/lib/token-storage";
 *   await seedServerCookies();
 */
export async function seedServerCookies(): Promise<void> {
    // Only runs on the server; tree-shaken on the client.
    if (typeof window !== "undefined") return;
    try {
        // Dynamic import so the client bundle never includes next/headers.
        const { cookies } = await import("next/headers");
        const store = await cookies();
        _serverCookieCache.clear();
        store.getAll().forEach(({ name, value }) => {
            _serverCookieCache.set(name, value);
        });
        _isSeeded = true;
    } catch {
        // Outside a Next.js request context (e.g. during build) — silently skip.
    }
}

// ─── Cookie Driver ────────────────────────────────────────────────────────────

export class CookieDriver implements ITokenDriver {
    get(key: string): string | null {
        // Server path: read from the seeded cache.
        if (typeof window === "undefined") {
            return _serverCookieCache.get(key) ?? null;
        }
        // Client path: read from document.cookie.
        const match = document.cookie.match(
            new RegExp(`(?:^|; )${encodeURIComponent(key)}=([^;]*)`)
        );
        return match ? decodeURIComponent(match[1]) : null;
    }

    set(key: string, value: string, expiryDays = 7): void {
        if (typeof window === "undefined") {
            // Writes during SSR are intentionally ignored — the client will
            // pick up the cookie once it takes over.
            _serverCookieCache.set(key, value);
            return;
        }
        const expires = new Date(Date.now() + expiryDays * 864e5).toUTCString();
        document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
    }

    remove(key: string): void {
        if (typeof window === "undefined") {
            _serverCookieCache.delete(key);
            return;
        }
        document.cookie = `${encodeURIComponent(key)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
}

// ─── LocalStorage Driver ──────────────────────────────────────────────────────

export class LocalStorageDriver implements ITokenDriver {
    get(key: string): string | null {
        if (typeof localStorage === "undefined") return null;
        return localStorage.getItem(key);
    }
    set(key: string, value: string): void {
        if (typeof localStorage === "undefined") return;
        localStorage.setItem(key, value);
    }
    remove(key: string): void {
        if (typeof localStorage === "undefined") return;
        localStorage.removeItem(key);
    }
}

// ─── Memory Driver ────────────────────────────────────────────────────────────

export class MemoryDriver implements ITokenDriver {
    private store = new Map<string, string>();
    get(key: string): string | null {
        return this.store.get(key) ?? null;
    }
    set(key: string, value: string): void {
        this.store.set(key, value);
    }
    remove(key: string): void {
        this.store.delete(key);
    }
}

// ─── Factory ──────────────────────────────────────────────────────────────────

export function resolveDriver(name: StorageDriver): ITokenDriver {
    if (name === "localStorage") return new LocalStorageDriver();
    if (name === "memory") return new MemoryDriver();
    return new CookieDriver();
}