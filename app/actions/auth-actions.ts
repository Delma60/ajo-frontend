// app/actions/auth-actions.ts
"use server";

import { cookies } from "next/headers";

export async function storeTokensSecurely(token: string, refreshToken?: string, expiresInDays: number = 7) {
  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === "production";
  const maxAge = expiresInDays * 24 * 60 * 60;

  const cookieOptions = {
    httpOnly: true,
    secure: isProd, // Must be true in production (HTTPS)
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };

  cookieStore.set("auth_token", token, cookieOptions);

  if (refreshToken) {
    cookieStore.set("auth_refresh_token", refreshToken, {
      ...cookieOptions,
      maxAge: maxAge * 4, // Refresh tokens usually live longer
    });
  }
}

export async function clearTokensSecurely() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  cookieStore.delete("auth_refresh_token");
}