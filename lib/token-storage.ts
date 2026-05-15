import type { StorageDriver } from "./auth.types";

export interface ITokenDriver {
    get(key: string): string | null;
    set(key: string, value: string, expiryDays?: number): void;
    remove(key: string): void;
}

export class CookieDriver implements ITokenDriver {
    get(key: string): string | null {
        if (typeof document === "undefined") return null;
        const match = document.cookie.match(new RegExp(`(?:^|; )${encodeURIComponent(key)}=([^;]*)`));
        return match ? decodeURIComponent(match[1]) : null;
    }
    set(key: string, value: string, expiryDays = 7): void {
        if (typeof document === "undefined") return;
        const expires = new Date(Date.now() + expiryDays * 864e5).toUTCString();
        document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
    }
    remove(key: string): void {
        if (typeof document === "undefined") return;
        document.cookie = `${encodeURIComponent(key)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
}

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

export function resolveDriver(name: StorageDriver): ITokenDriver {
    if (name === "localStorage") return new LocalStorageDriver();
    if (name === "memory") return new MemoryDriver();
    return new CookieDriver();
}
