"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DAYS, pickMicroGoals, TRIAL_DAYS } from "@/lib/trialFlow";

type Entry = { day:number; mood?:number; free?:string; goals?:string[]; ts?:number };

export default function TrialDayPage({ params }: { params: { day: string } }) {
  const router = useRouter();
  const day = Math.max(1, Math.min(TRIAL_DAYS as number, Number(params.day || "1")));
  const plan = DAYS[day - 1];

  const [mood, setMood] = useState<number>(50);
  const [free, setFree] = useState<string>("");
  const [picked, setPicked] = useState<string[]>([]);

  const suggestions = useMemo(() => {
    try {
      const intake = JSON.parse(localStorage.getItem("ky_intake") || "{}")?.goal as string | undefined;
      const trial: Entry[] = JSON.parse(localStorage.getItem("ky_trial") || "[]");
      const last = trial[trial.length - 1];
      return pickMicroGoals({ intake, lastFree: last?.free, lastMood: last?.mood });
    } catch { return []; }
  }, [day]);

  useEffect(() => {
    try {
      const trial: Entry[] = JSON.parse(localStorage.getItem("ky_trial") || "[]");
      const existing = trial.find(e => e.day === day);
      if (existing) {
        setMood(existing.mood ?? 50);
        setFree(existing.free ?? "");
        setPicked(existing.goals ?? []);
      }
    } catch {}
  }, [day]);

  function toggleGoal(id: string) {
    setPicked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function save(goNext: boolean) {
    try {
      const trial: Entry[] = JSON.parse(localStorage.getItem("ky_trial") || "[]");
      const next = trial.filter(e => e.day !== day);
      next.push({ day, mood, free: free.trim(), goals: picked, ts: Date.now() });
      localStorage.setItem("ky_trial", JSON.stringify(next.sort((a,b)=>a.day-b.day)));
      if (!localStorage.getItem("ky_trial_start")) {
        localStorage.setItem("ky_trial_start", new Date().toISOString());
      }
    } catch {}

    // Always go to chat after save
    router.push("/chat");
  }

  return (
    <main className="min-h-dvh bg-gradient-to-b from-indigo-700 via-slate-900 to-rose-700 grid place-items-center">
      <div className="rounded-2xl bg-white p-8 shadow max-w-2xl w-full">
        <div className="text-sm text-gray-500">Day {day} of {TRIAL_DAYS}</div>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">{plan.aiPrompt}</h1>

        {plan.mood && (
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm text-gray-700">
              <span>How are you feeling right now?</span>
              <span className="font-mono">{mood}</span>
            </div>
            <input type="range" min={0} max={100} value={mood} onChange={(e)=>setMood(Number(e.target.value))} className="w-full" />
          </div>
        )}

        <label className="block mt-6 text-sm font-medium text-gray-900">{plan.freePrompt}</label>
        <textarea
          value={free}
          onChange={(e)=>setFree(e.target.value)}
          className="mt-2 w-full rounded-xl border border-black/10 p-4 outline-none focus:ring-2 focus:ring-black"
          rows={6}
          placeholder="Write it out. Short and honest beats long and vague."
        />

        <div className="mt-6">
          <div className="text-sm font-medium text-gray-900">Today's micro-goals</div>
          <div className="mt-3 grid gap-2">
            {suggestions.map(g => (
              <label key={g.id} className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition ${picked.includes(g.id) ? "border-gray-900 bg-gray-50" : "border-black/10 hover:bg-gray-50"}`}>
                <input
                  type="checkbox"
                  checked={picked.includes(g.id)}
                  onChange={()=>toggleGoal(g.id)}
                  className="accent-black"
                />
                <span className="text-gray-900">{g.text}</span>
              </label>
            ))}
            {!suggestions.length && (
              <div className="text-sm text-gray-500">No suggestions today — pick any 1–3 tiny actions you can win.</div>
            )}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={()=>save(true)}
            className="inline-flex items-center justify-center rounded-2xl px-6 py-3 bg-gray-900 text-white font-semibold shadow transition-all duration-150 hover:shadow-md hover:scale-[1.02] active:scale-95"
          >
            Save & Continue
          </button>
          <button
            onClick={()=>save(false)}
            className="inline-flex items-center justify-center rounded-2xl px-6 py-3 bg-white text-gray-900 border border-black/10 font-semibold shadow transition-all duration-150 hover:shadow-md hover:scale-[1.02] active:scale-95"
          >
            Save & Finish Later
          </button>
        </div>
      </div>
    </main>
  );
}
