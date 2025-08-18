"use client";
import { createSupabaseClient } from "@/lib/supabase/client";

export default function SignInButton(
  { next = "/onboarding", className = "", size = "sm" as "sm" | "md" }
) {
  const supabase = createSupabaseClient();

  async function onClick() {
    const origin = window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` }
    });
  }

  const sizeClasses = size === "sm"
    ? "px-2.5 py-1.5 text-sm rounded-xl"
    : "px-3 py-2 text-base rounded-2xl";

  return (
    <button
      onClick={onClick}
      className={`${sizeClasses} bg-white text-gray-900 font-semibold shadow hover:opacity-90 ${className}`}
    >
      Sign in with Google
    </button>
  );
}
