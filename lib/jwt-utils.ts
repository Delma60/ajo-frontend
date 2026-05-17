import type { JwtPayload } from "./types/auth.types";

export class JwtUtils {
    static decodeJwt(token: string): JwtPayload | null {
        try {
            const payload = token.split(".")[1];
            const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
            return JSON.parse(decoded) as JwtPayload;
        } catch {
            return null;
        }
    }

    static tokenExpiresIn(token: string): number {
        const payload = JwtUtils.decodeJwt(token);
        if (!payload?.exp) return Infinity;
        return payload.exp - Math.floor(Date.now() / 1000);
    }

    static isTokenExpired(token: string): boolean {
        return JwtUtils.tokenExpiresIn(token) <= 0;
    }
}
