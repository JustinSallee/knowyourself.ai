"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function TopNav() {
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
    <header className="fixed inset-x-0 top-0 z-50">
      <nav className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between text-white">
        {/* LEFT: email (pill) + Profile button */}
        <div className="flex items-center gap-2">
          {email ? (
            <>
              <span className="hidden sm:inline rounded-full bg-white/10 px-3 py-1.5 text-sm select-none">
                {email}
              </span>
              <Link
                href="/profile"
                className="inline-flex items-center justify-center rounded-2xl px-3 py-1.5 bg-white text-gray-900 text-sm font-semibold shadow transition hover:scale-[1.03] active:scale-95"
              >
                Profile
              </Link>
            </>
          ) : (
            <span className="text-sm/6 opacity-80"> </span>
          )}
        </div>

        {/* RIGHT: actions */}
        <div className="flex items-center gap-2">
          {email ? (
            <>
              <Link
                href="/chat"
                className="inline-flex items-center justify-center rounded-2xl px-3 py-1.5 bg-white text-gray-900 text-sm font-semibold shadow transition hover:scale-[1.03] active:scale-95"
              >
                Chat
              </Link>
              <Link
                href="/trial/1"
                className="inline-flex items-center justify-center rounded-2xl px-3 py-1.5 bg-white/0 ring-1 ring-white/30 text-white text-sm font-semibold shadow transition hover:bg-white/10"
              >
                Trial
              </Link>
              <button
                onClick={() =>
                  sb.auth.signOut().then(() => (window.location.href = "/"))
                }
                className="inline-flex items-center justify-center rounded-2xl px-3 py-1.5 bg-white/0 ring-1 ring-white/30 text-white text-sm font-semibold transition hover:bg-white/10"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/signin?next=/onboarding"
              className="inline-flex items-center justify-center rounded-2xl px-3 py-1.5 bg-white text-gray-900 text-sm font-semibold shadow transition hover:scale-[1.03] active:scale-95"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
