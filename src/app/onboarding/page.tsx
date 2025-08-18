"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AnswerMap = Record<string, string>;
type Question = {
  id: string;
  label: string;
  options: { value: string; label: string }[];
};

const questions: Question[] = [
  {
    id: "goal",
    label: "What is your main goal right now",
    options: [
      { value: "find_clarity", label: "Find clarity" },
      { value: "career_growth", label: "Career growth" },
      { value: "relationships", label: "Improve relationships" },
      { value: "health", label: "Health and fitness" }
    ]
  },
  {
    id: "style",
    label: "How do you prefer to learn",
    options: [
      { value: "visual", label: "Visual explanations" },
      { value: "hands_on", label: "Hands on practice" },
      { value: "reading", label: "Reading and notes" },
      { value: "discussion", label: "Discussion and feedback" }
    ]
  },
  {
    id: "pace",
    label: "How fast do you want to move",
    options: [
      { value: "slow", label: "Slow and steady" },
      { value: "balanced", label: "Balanced pace" },
      { value: "fast", label: "As fast as possible" }
    ]
  }
];

export default function OnboardingPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [submitting, setSubmitting] = useState(false);

  // load from localStorage (so mobile refresh does not wipe progress)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("onboarding_answers");
      if (raw) setAnswers(JSON.parse(raw) as AnswerMap);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("onboarding_answers", JSON.stringify(answers));
    } catch {}
  }, [answers]);

  const onChange = (qid: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const canSubmit = questions.every((q) => Boolean(answers[q.id]));

  const onSubmit = async () => {
  if (!canSubmit || submitting) return;
  setSubmitting(true);
  try {
    await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers })
    }).catch(() => {});
    // go to your real flow – this is where the 30 MCQs live in your app
    router.push("/trial/1");
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Onboarding</h1>
        <p className="text-base opacity-80">
          Quick setup so your results feel tailored.
        </p>
      </header>

      <section className="space-y-8">
        {questions.map((q) => (
          <div key={q.id} className="rounded-2xl border border-white/15 bg-white/5 p-5 shadow-sm">
            <h2 className="text-lg font-semibold">{q.label}</h2>
            <div className="mt-4 grid gap-3">
              {q.options.map((opt) => {
                const id = `${q.id}_${opt.value}`;
                const checked = answers[q.id] === opt.value;
                return (
                  <label
                    key={id}
                    htmlFor={id}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer ${
                      checked ? "ring-2 ring-white/60 bg-white/10" : "border-white/15 hover:bg-white/5"
                    }`}
                  >
                    <input
                      id={id}
                      type="radio"
                      name={q.id}
                      value={opt.value}
                      checked={checked}
                      onChange={(e) => onChange(q.id, e.target.value)}
                      className="h-4 w-4"
                    />
                    <span className="text-base">{opt.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <footer className="pt-2">
        <button
          onClick={onSubmit}
          disabled={!canSubmit || submitting}
          className={`w-full rounded-2xl px-4 py-3 text-white text-lg font-semibold ${
            !canSubmit || submitting
              ? "bg-white/20 cursor-not-allowed"
              : "bg-black hover:opacity-90"
          }`}
        >
          {submitting ? "Saving..." : "Start"}
        </button>

        {!canSubmit && (
          <p className="mt-2 text-center text-sm opacity-70">
            Pick an option for each question to continue
          </p>
        )}
      </footer>
    </div>
  );
}
