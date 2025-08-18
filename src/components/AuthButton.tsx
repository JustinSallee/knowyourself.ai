'use client';

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";

export default function AuthButton() {
  const supabase = createSupabaseClient();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setEmail(s?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  if (!email) {
    return (
      <a href="/login" className="text-sm rounded-lg px-3 py-1.5 border border-white/15 hover:bg-white/10">
        Sign in
      </a>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm opacity-80">{email}</span>
      <button
        onClick={() => supabase.auth.signOut().then(() => (window.location.href = "/"))}
        className="text-sm rounded-lg px-3 py-1.5 border border-white/15 hover:bg-white/10"
      >
        Sign out
      </button>
    </div>
  );
}
