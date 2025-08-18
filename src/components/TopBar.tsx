"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function TopBar() {
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
    <header className="w-full">
      <nav className="mx-auto max-w-5xl px-4 pt-4 flex items-center justify-between">
        {/* LEFT: email or sign-in */}
        <div className="min-h-[36px] flex items-center">
          {email ? (
            <Link
              href="/account"
              className="text-sm rounded-lg px-3 py-1.5 border border-white/15 hover:bg-white/10 text-white/90"
            >
              {email}
            </Link>
          ) : (
            <Link
              href="/signin"
              className="text-sm rounded-lg px-3 py-1.5 border border-white/15 hover:bg-white/10 text-white/90"
            >
              Sign in
            </Link>
          )}
        </div>

        {/* CENTER: brand (non-clickable) */}
        <div aria-hidden className="text-white/80 font-semibold tracking-wide text-sm">
          knowyourself.ai
        </div>

        {/* RIGHT: quick links */}
        <div className="flex gap-2">
          <Link
            href="/chat"
            className="text-sm rounded-lg px-3 py-1.5 border border-white/15 hover:bg-white/10 text-white/90"
          >
            Chat
          </Link>
          <Link
            href="/trial/1"
            className="text-sm rounded-lg px-3 py-1.5 border border-white/15 hover:bg-white/10 text-white/90"
          >
            Trial
          </Link>
        </div>
      </nav>
    </header>
  );
}
