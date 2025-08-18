"use client";

import { createSupabaseClient } from "@/lib/supabase/client";

export default function SignInButton({ next = "/quiz" }: { next?: string }) {
  const supabase = createSupabaseClient();

  const onClick = async () => {
    const origin = window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`
      }
    });
  };

  return (
    <button
      onClick={onClick}
      className="px-3 py-2 rounded-xl bg-black text-white hover:opacity-90"
    >
      Sign in
    </button>
  );
}
