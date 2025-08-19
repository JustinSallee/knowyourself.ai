// src/app/summary/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

type Answers = Record<string, string>;

export default function SummaryPage() {
  const [answers, setAnswers] = useState<Answers>({});
  const [ai, setAi] = useState<string>("");
  const [busy, setBusy] = useState(false);

  // Collect all days (we only used day 1 in this drop)
  const allKeys = useMemo(() => {
    if (typeof window === "undefined") return [];
    return Object.keys(localStorage).filter((k) =>
      k.startsWith("trial_answers_day_")
    );
  }, []);

  useEffect(() => {
    try {
      const merged: Answers = {};
      for (const k of allKeys) {
        const raw = localStorage.getItem(k);
        if (raw) Object.assign(merged, JSON.parse(raw));
      }
      setAnswers(merged);
    } catch {}
  }, [allKeys]);

  const mcqEntries = Object.entries(answers).filter(([k]) => k.startsWith("q"));
  const frqEntries = Object.entries(answers).filter(([k]) => k.startsWith("t"));

  async function summarize() {
    setBusy(true);
    setAi("");
    const prompt = [
      "You are summarizing a short self-assessment.",
      "The user answered 30 Likert questions (q1..q30) and 4 free-response (t1..t4).",
      "Provide a crisp, motivating summary in 6-8 bullets:",
      "- The user's apparent strengths",
      "- One realistic habit to begin this week",
      "- A 30-day focus theme",
      "Answers:",
      JSON.stringify(answers, null, 2),
    ].join("\n");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt, system: "Be concise, clear, and supportive." }),
      });
      const data = await res.json().catch(() => ({}));
      setAi(data?.reply || "(no AI summary)");
    } catch {
      setAi("(error getting AI summary)");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-3xl font-bold">Your Summary</h1>

      <section className="rounded-2xl border border-white/15 bg-white/5 p-4">
        <div className="font-semibold mb-2">Multiple choice snapshot</div>
        <div className="text-white/80 text-sm">
          Answered {mcqEntries.length} of 30
        </div>
      </section>

      <section className="rounded-2xl border border-white/15 bg-white/5 p-4">
        <div className="font-semibold mb-2">Your notes</div>
        <ul className="list-disc pl-5 space-y-1">
          {frqEntries.length === 0 && (
            <li className="text-white/70">No free responses yet.</li>
          )}
          {frqEntries.map(([k, v]) => (
            <li key={k} className="text-white/90">
              <span className="opacity-70 mr-2">{k.toUpperCase()}:</span>
              {v}
            </li>
          ))}
        </ul>
      </section>

      <div className="flex gap-3">
        <button
          disabled={busy}
          onClick={summarize}
          className="rounded-2xl px-4 py-3 bg-black text-white font-semibold disabled:opacity-50"
        >
          {busy ? "Summarizing…" : "Get AI summary"}
        </button>
      </div>

      {ai && (
        <section className="rounded-2xl border border-white/15 bg-white/5 p-4 whitespace-pre-wrap">
          {ai}
        </section>
      )}
    </div>
  );
}
