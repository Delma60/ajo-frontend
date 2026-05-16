import { cookies } from "next/headers";
import { HTTPS } from "@/lib/http";
import type { AppUser } from "@/lib/app-user";
import { JwtUtils } from "@/lib/jwt-utils";

const TOKEN_COOKIE = "auth_token";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function getServerUser(): Promise<AppUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;

  if (!token || JwtUtils.isTokenExpired(token)) {
    return null;
  }

  try {
    const res = await HTTPS.withToken(token).get<AppUser>("/auth/me");
    return res.data ?? null;
  } catch {
    return null;
  }
}