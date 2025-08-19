// src/app/trial/done/page.tsx
"use client";

import Link from "next/link";

export default function TrialDonePage() {
  return (
    <div className="mx-auto max-w-2xl p-6 space-y-6">
      <h1 className="text-3xl font-bold">Nice work 🎉</h1>
      <p className="text-white/80">
        Your answers are saved locally. View your personalized summary next.
      </p>

      <div className="flex gap-3">
        <Link
          href="/summary"
          className="rounded-2xl px-4 py-3 bg-black text-white font-semibold"
        >
          View Summary
        </Link>
        <Link
          href="/chat"
          className="rounded-2xl px-4 py-3 bg-white text-gray-900 font-semibold"
        >
          Chat about it
        </Link>
      </div>
    </div>
  );
}
