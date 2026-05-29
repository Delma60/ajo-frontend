// lib/providers/auth.tsx
"use client";

import "../auth.bootstrap";
import { useEffect, useState } from "react";
import { Auth } from "@/lib/auth";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 1. Indicate the client has successfully hydrated the React tree
    setIsMounted(true);

    // 2. Await the Auth system's initial fetch to confirm session validity
    Auth.ready().finally(() => {
      setIsReady(true);
    });
  }, []);

  // Return nothing (or a strict monochromatic loading skeleton) while server-rendered
  // HTML is matching the client DOM to prevent hydration crashes.
  if (!isMounted) {
    return null;
  }

  // Optional: You can render a global loading spinner here while Auth.ready() resolves
  // if (!isReady) return <GlobalLoader />;

  return <>{children}</>;
}
