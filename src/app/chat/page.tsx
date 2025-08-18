"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ChatPage() {
  const [hasIntake, setHasIntake] = useState<boolean>(false);

  useEffect(() => {
    try {
      const intake = JSON.parse(localStorage.getItem("ky_intake") || "{}");
      const mcq = JSON.parse(localStorage.getItem("ky_mcq") || "[]");
      const aboutOk = typeof intake?.about === "string" && intake.about.trim().length >= 10;
      const goalOk = typeof intake?.goal === "string" && intake.goal.trim().length >= 10;
      const mcqOk = Array.isArray(mcq) && mcq.length >= 10;
      setHasIntake(Boolean(aboutOk || goalOk || mcqOk));
    } catch {
      setHasIntake(false);
    }
  }, []);

  return (
    <main className="min-h-dvh bg-gradient-to-b from-indigo-700 via-slate-900 to-rose-700">
      <div className="mx-auto max-w-4xl px-4 pt-28 pb-20">
        {!hasIntake && (
          <div className="mb-4 rounded-2xl bg-white p-4 shadow">
            <div className="text-sm text-gray-900">
              You haven&apos;t completed your intake yet.
              <Link href="/onboarding" className="ml-2 underline">Finish it now</Link>
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="text-gray-900 font-semibold">Chat</div>
          <div className="mt-4 rounded-xl border border-black/10 h-[40vh] p-4 overflow-auto text-sm text-gray-700">
            {/* messages would render here */}
            <p className="opacity-70">Start typing below. Use <span className="font-semibold">Boost</span> for extra discovery prompts.</p>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() => window.location.href = "/onboarding"}
              className="inline-flex items-center justify-center rounded-2xl px-4 py-2 bg-white text-gray-900 border border-black/10 font-semibold shadow transition hover:shadow-md hover:scale-[1.02] active:scale-95"
            >
              Boost
            </button>
            <input
              placeholder="Ask anything…"
              className="flex-1 rounded-2xl border border-black/10 px-4 py-2 outline-none focus:ring-2 focus:ring-black"
            />
            <button className="inline-flex items-center justify-center rounded-2xl px-6 py-2 bg-gray-900 text-white font-semibold shadow transition hover:shadow-md hover:scale-[1.02] active:scale-95">
              Send
            </button>
          </div>

          <div className="mt-3 text-xs text-gray-500">
            Tip: The more you share, the smarter your profile & summaries get.
          </div>
        </div>
      </div>
    </main>
  );
}
