"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { markQuizDone } from "@/lib/progress";

export default function TrialDonePage() {
  const [saved, setSaved] = useState<"saving" | "saved" | "error">("saving");

  useEffect(() => {
    let mounted = true;
    markQuizDone()
      .then(() => mounted && setSaved("saved"))
      .catch(() => mounted && setSaved("error"));
    return () => { mounted = false; };
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-white">
      <h1 className="text-3xl font-bold">Great job!</h1>
      <p className="mt-3 text-white/80">
        {saved === "saving" && "Saving your progress…"}
        {saved === "saved"  && "Your initial quiz is complete."}
        {saved === "error"  && "We couldn't save your progress. Try refreshing, or check your connection."}
      </p>

      <div className="mt-6 flex gap-3">
        <Link href="/summary" className="rounded-md px-4 py-2 bg-white/10 border border-white/20 hover:bg-white/20">
          Go to Summary
        </Link>
        <Link href="/boost" className="rounded-md px-4 py-2 bg-white/10 border border-white/20 hover:bg-white/20">
          Boost
        </Link>
        <Link href="/chat" className="rounded-md px-4 py-2 bg-black text-white">
          Chat
        </Link>
      </div>
    </main>
  );
}
