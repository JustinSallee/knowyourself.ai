// src/app/reset/page.tsx
"use client";

import { useEffect } from "react";

export default function ResetPage() {
  useEffect(() => {
    // 1) Clear local app data
    try {
      const keys = Object.keys(localStorage);
      keys
        .filter(
          (k) =>
            k.startsWith("chat_") ||
            k.startsWith("trial_answers_day_") ||
            k === "onboarding_answers"
        )
        .forEach((k) => localStorage.removeItem(k));
    } catch {}

    // 2) Hit server route to clear Supabase cookies, then hard reload home
    fetch("/auth/reset", { cache: "no-store" })
      .catch(() => {})
      .finally(() => {
        window.location.replace("/?reset=1");
      });
  }, []);

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-white">
      <h1 className="text-2xl font-bold">Resetting…</h1>
      <p className="mt-2 opacity-80">Clearing cached session and data.</p>
    </div>
  );
}
