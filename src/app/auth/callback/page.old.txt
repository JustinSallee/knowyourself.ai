"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

/**
 * Exchanges the OAuth code/hash for a Supabase session, then redirects.
 * Supports ?next=/somewhere (defaults to /).
 */
export default function AuthCallback() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";

  useEffect(() => {
    const run = async () => {
      try {
        const sb = supabaseBrowser();
        await sb.auth.exchangeCodeForSession(window.location.href);
        router.replace(next);
      } catch (e) {
        console.error("[auth/callback] exchange failed", e);
        router.replace("/signin?error=oauth");
      }
    };
    run();
  }, [router, next]);

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-xl font-semibold">Finishing sign-in…</h1>
      <p className="mt-2 text-sm text-gray-600">One moment…</p>
    </main>
  );
}
