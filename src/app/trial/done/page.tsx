"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { TRIAL_DAYS } from "@/lib/trialFlow";

type Entry = { day:number; mood?:number; free?:string; goals?:string[]; ts?:number; };

export default function TrialDonePage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [baseline, setBaseline] = useState<any>();

  useEffect(() => {
    try { setEntries(JSON.parse(localStorage.getItem("ky_trial") || "[]")); } catch {}
    try { setBaseline(JSON.parse(localStorage.getItem("ky_baseline") || "{}")); } catch {}
  }, []);

  const done = entries.length;
  const latest = useMemo(() => entries.sort((a,b)=>b.day-a.day)[0], [entries]);

  return (
    <main className="min-h-dvh bg-gradient-to-b from-indigo-700 via-slate-900 to-rose-700 grid place-items-center">
      <div className="rounded-2xl bg-white p-8 shadow max-w-3xl w-full">
        <div className="flex items-baseline justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Your 30-day progress</h1>
          <div className="text-sm text-gray-600">Days completed: <span className="font-semibold">{done}</span> / {TRIAL_DAYS}</div>
        </div>

        {baseline && (
          <section className="mt-6">
            <h2 className="text-sm font-medium text-gray-900">Baseline snapshot</h2>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(baseline).map(([k, v]) => (
                <div key={k} className="rounded-xl border border-black/10 p-3">
                  <div className="flex items-center justify-between text-sm text-gray-700">
                    <span className="capitalize">{k.replace(/_/g," ")}</span>
                    <span className="font-mono">{v as number}</span>
                  </div>
                  <div className="mt-2 h-2 rounded bg-gray-100">
                    <div className="h-2 rounded bg-gray-900" style={{width: `${Math.min(100, Math.max(0, Number(v)))}%`}} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-8">
          <h2 className="text-sm font-medium text-gray-900">Recent entries</h2>
          <div className="mt-3 grid gap-3">
            {entries.sort((a,b)=>b.day-a.day).slice(0,8).map(e => (
              <div key={e.day} className="rounded-xl border border-black/10 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-gray-900 font-semibold">Day {e.day}</div>
                  {typeof e.mood === "number" && <div className="text-xs px-2 py-1 rounded-full bg-gray-900 text-white">Mood {e.mood}</div>}
                </div>
                {e.free && <p className="mt-2 text-sm text-gray-700 line-clamp-3">{e.free}</p>}
                {e.goals?.length ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {e.goals.map(g => <span key={g} className="text-xs px-2 py-1 rounded-full bg-gray-100 border border-black/10">{g}</span>)}
                  </div>
                ) : null}
              </div>
            ))}
            {!entries.length && <div className="text-sm text-gray-500">No entries yet.</div>}
          </div>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/chat" className="inline-flex items-center justify-center rounded-2xl px-6 py-3 bg-gray-900 text-white font-semibold">Go to Chat</Link>
          <Link href={`/trial/${Math.max(1, Math.min(30, entries.sort((a,b)=>b.day-a.day)[0]?.day || 1))}`} className="inline-flex items-center justify-center rounded-2xl px-6 py-3 bg-white text-gray-900 border border-black/10 font-semibold">Back to today</Link>
          <Link href="/onboarding" className="inline-flex items-center justify-center rounded-2xl px-6 py-3 bg-white text-gray-900 border border-black/10 font-semibold">Edit intake</Link>
        </div>
      </div>
    </main>
  );
}
