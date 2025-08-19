// src/app/trial/[day]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type MCQ = { id: string; prompt: string; options: string[] };
type FRQ = { id: string; prompt: string };
type Answers = Record<string, string>;

export default function TrialDayPage({ params }: { params: { day: string } }) {
  const day = Number(params.day || "1");
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [mcq, setMcq] = useState<MCQ[]>([]);
  const [frq, setFrq] = useState<FRQ[]>([]);
  const [answers, setAnswers] = useState<Answers>({});
  const [saving, setSaving] = useState(false);

  const storageKey = useMemo(() => `trial_answers_day_${day}`, [day]);

  useEffect(() => {
    // load questions
    (async () => {
      try {
        const res = await fetch(`/api/trial/start?day=${day}`, { cache: "no-store" });
        const data = await res.json();
        setMcq(data.mcq || []);
        setFrq(data.frq || []);
      } catch {
        // keep empty
      } finally {
        setLoading(false);
      }
    })();
  }, [day]);

  useEffect(() => {
    // load existing answers (resume)
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setAnswers(JSON.parse(raw) as Answers);
    } catch {}
  }, [storageKey]);

  useEffect(() => {
    // persist every change
    try {
      localStorage.setItem(storageKey, JSON.stringify(answers));
    } catch {}
  }, [answers, storageKey]);

  function onMCQChange(id: string, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function onFRQChange(id: string, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  const totalRequired = mcq.length + frq.length;
  const completed = Object.keys(answers).filter(
    (k) => answers[k] !== undefined && answers[k] !== ""
  ).length;
  const canSubmit = completed >= totalRequired && totalRequired > 0;

  async function onSubmit() {
    if (!canSubmit || saving) return;
    setSaving(true);
    try {
      await fetch("/api/trial/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day, answers }),
      }).catch(() => {});
      // go to done
      router.push("/trial/done");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="text-white/80">Loading questions…</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Smartness Score — Day {day}</h1>
        <p className="text-white/80">
          30 quick picks + 4 short answers. You’ve completed {completed}/{totalRequired}.
        </p>
      </header>

      {/* MCQs */}
      <section className="space-y-6">
        {mcq.map((q, idx) => (
          <div
            key={q.id}
            className="rounded-2xl border border-white/15 bg-white/5 p-5"
          >
            <div className="font-semibold">{idx + 1}. {q.prompt}</div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {q.options.map((opt) => {
                const id = `${q.id}_${opt}`;
                const checked = answers[q.id] === opt;
                return (
                  <label
                    key={id}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer ${
                      checked ? "ring-2 ring-white/60 bg-white/10" : "border-white/15 hover:bg-white/5"
                    }`}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      value={opt}
                      checked={checked}
                      onChange={() => onMCQChange(q.id, opt)}
                      className="h-4 w-4"
                    />
                    <span>{opt}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {/* Short answers */}
      <section className="space-y-6">
        {frq.map((q, idx) => (
          <div
            key={q.id}
            className="rounded-2xl border border-white/15 bg-white/5 p-5"
          >
            <div className="font-semibold">{30 + idx + 1}. {q.prompt}</div>
            <textarea
              className="mt-3 w-full min-h-[100px] rounded-xl px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
              placeholder="Type your response…"
              value={answers[q.id] || ""}
              onChange={(e) => onFRQChange(q.id, e.target.value)}
            />
          </div>
        ))}
      </section>

      <footer className="pt-2">
        <button
          onClick={onSubmit}
          disabled={!canSubmit || saving}
          className={`w-full rounded-2xl px-4 py-3 text-white text-lg font-semibold ${
            !canSubmit || saving
              ? "bg-white/20 cursor-not-allowed"
              : "bg-black hover:opacity-90"
          }`}
        >
          {saving ? "Saving…" : "Finish"}
        </button>
        {!canSubmit && (
          <p className="mt-2 text-center text-sm opacity-70">
            Answer all questions to continue
          </p>
        )}
      </footer>
    </div>
  );
}
