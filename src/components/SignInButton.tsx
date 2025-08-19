// src/components/SignInButton.tsx
"use client";
import React from "react";
import { createSupabaseClient } from "@/lib/supabase/client";

type Props = {
  next?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export default function SignInButton({
  next = "/onboarding",
  size = "sm",
  className = "",
}: Props) {
  const supabase = createSupabaseClient();

  const sizeClasses =
    size === "lg"
      ? "px-5 py-3 text-base rounded-2xl"
      : size === "md"
      ? "px-3.5 py-2 text-sm rounded-xl"
      : "px-2.5 py-1.5 text-sm rounded-xl"; // "sm"

  async function onClick() {
    const origin = window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  }

  return (
    <button
      onClick={onClick}
      className={`${sizeClasses} bg-white text-gray-900 font-semibold shadow hover:opacity-90 ${className}`}
    >
      Sign in with Google
    </button>
  );
}
