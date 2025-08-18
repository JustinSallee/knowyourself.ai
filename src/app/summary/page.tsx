"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Entry = { day:number; mood?:number; free?:string; goals?:string[]; ts?:number };
type Baseline = { clarity:number; stability:number; selfBelief:number; energy:number };

export default function SummaryPage() {
  const [intake, setIntake] = useState<{goal?:string}>({});
  const [baseline, setBaseline] = useState<Baseline|undefined>();
  const [trial, setTrial] = useState<Entry[]>([]);

  useEffect(() => {
    try {
      setIntake(JSON.parse(localStorage.getItem("ky_intake") || "{}"));
      setBaseline(JSON.parse(localStorage.getItem("ky_baseline") || "null") || undefined);
      setTrial(JSON.parse(localStorage.getItem("ky_trial") || "[]"));
    } catch {}
  }, []);

  const done = trial.length;
  const pickedGoals = trial.flatMap(e => e.goals ?? []);
  const goalCounts = pickedGoals.reduce<Record<string, number>>((m, g) => (m[g]=(m[g]||0)+1, m), {});

  return (
    <main className="min-h-dvh bg-gradient-to-b from-indigo-700 via-slate-900 to-rose-700 grid place-items-center">
      <div className="rounded-2xl bg-white p-8 shadow max-w-3xl w-full">
        <h1 className="text-3xl font-bold text-gray-900">Your 10-Day Trial Summary</h1>

        <section className="mt-6 space-y-2">
          <div className="text-sm text-gray-500">Intake</div>
          <div className="rounded-xl border border-black/10 p-4">
            <div className="text-sm text-gray-700">30-day outcome</div>
            <div className="mt-1 font-medium text-gray-900">{intake.goal || "—"}</div>
          </div>
        </section>

        <section className="mt-6 space-y-2">
          <div className="text-sm text-gray-500">Baseline</div>
          <div className="grid sm:grid-cols-4 gap-3">
            {(["clarity","stability","selfBelief","energy"] as const).map(k => (
              <div key={k} className="rounded-xl border border-black/10 p-4">
                <div className="text-xs text-gray-600 uppercase tracking-wide">{k}</div>
                <div className="text-xl font-semibold text-gray-900">{baseline?.[k] ?? "—"}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 space-y-2">
          <div className="text-sm text-gray-500">Progress</div>
          <div className="rounded-xl border border-black/10 p-4 flex items-center justify-between">
            <div className="text-gray-900">
              Completed <strong>{done}</strong>/10 days
            </div>
            <Link href={done ? `/trial/${Math.min(done+1,10)}` : "/trial/1"}
              className="inline-flex items-center justify-center rounded-2xl px-4 py-2 bg-gray-900 text-white font-semibold shadow transition-all hover:shadow-md hover:scale-[1.02] active:scale-95">
              {done >= 10 ? "Review days" : "Continue"}
            </Link>
          </div>
        </section>

        <section className="mt-6 space-y-2">
          <div className="text-sm text-gray-500">Micro-goals (frequency)</div>
          <div className="grid sm:grid-cols-2 gap-3">
            {Object.keys(goalCounts).length ? (
              Object.entries(goalCounts).map(([id, count]) => (
                <div key={id} className="rounded-xl border border-black/10 p-4 flex items-center justify-between">
                  <span className="text-gray-900">{id}</span>
                  <span className="font-mono text-gray-700">{count}</span>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">No goals captured yet.</div>
            )}
          </div>
        </section>

        <section className="mt-8">
          <div className="text-sm text-gray-500 mb-2">Entries</div>
          <div className="grid gap-3">
            {trial.sort((a,b)=>a.day-b.day).map(e => (
              <div key={e.day} className="rounded-xl border border-black/10 p-4">
                <div className="text-sm text-gray-600">Day {e.day} • Mood {e.mood ?? "—"}</div>
                <div className="mt-2 whitespace-pre-wrap text-gray-900">{e.free || "—"}</div>
                {!!(e.goals?.length) && (
                  <div className="mt-2 text-sm text-gray-700">Goals: {e.goals?.join(", ")}</div>
                )}
              </div>
            ))}
          </div>
        </section>

        <div className="mt-8">
          <Link href="/" className="inline-flex items-center justify-center rounded-2xl px-6 py-3 bg-white text-gray-900 border border-black/10 font-semibold shadow transition-all hover:shadow-md hover:scale-[1.02] active:scale-95">
            Back home
          </Link>
        </div>
      </div>
    </main>
  );
}
