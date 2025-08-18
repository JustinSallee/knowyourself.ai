"use client";
import { createSupabaseClient } from "@/lib/supabase/client";

export default function SignInButton({ next = "/onboarding" }: { next?: string }) {
  const supabase = createSupabaseClient();

  async function onClick() {
    const origin = window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` }
    });
  }

  return (
    <button
      onClick={onClick}
      className="px-3 py-2 rounded-2xl bg-white text-gray-900 font-semibold shadow hover:opacity-90"
    >
      Sign in with Google
    </button>
  );
}
