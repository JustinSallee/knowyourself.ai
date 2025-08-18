"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function SiteHeader() {
  const sb = supabaseBrowser();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    sb.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => {
      setEmail(s?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, [sb]);

  return (
    <header className="fixed top-0 inset-x-0 z-40">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {email ? (
            <Link
              href="/profile"
              className="inline-flex items-center rounded-full bg-white/90 text-gray-900 px-4 py-2 text-sm font-semibold shadow hover:bg-white transition"
              title={email}
            >
              Profile
            </Link>
          ) : (
            <Link
              href="/signin?next=/onboarding"
              className="inline-flex items-center rounded-full border border-white/50 text-white px-4 py-2 text-sm font-semibold hover:bg-white/10 transition"
            >
              Sign in
            </Link>
          )}
        </div>

        <nav className="flex items-center gap-2">
          <Link
            href="/chat"
            className="inline-flex items-center rounded-full border border-white/30 text-white/90 px-3 py-1.5 text-sm hover:bg-white/10 transition"
          >
            Chat
          </Link>
          <Link
            href="/trial/done"
            className="inline-flex items-center rounded-full border border-white/30 text-white/90 px-3 py-1.5 text-sm hover:bg-white/10 transition"
          >
            Summary
          </Link>
        </nav>
      </div>
    </header>
  );
}
