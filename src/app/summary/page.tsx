"use client";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import CircleProgress from "@/components/CircleProgress";
import { BADGE_DEFS, LEVEL_KEYS } from "@/lib/badges";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Row = { badge: string; status: "complete" | "incomplete"; progress: number };

export default function SummaryPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const prof = await supabase
        .from("profiles")
        .select("onboarded, quiz_completed")
        .eq("id", user.id)
        .maybeSingle();
      setOnboarded(!!prof.data?.onboarded);

      const { data } = await supabase
        .from("user_badges")
        .select("badge, status, progress")
        .eq("user_id", user.id);
      setRows((data as Row[]) ?? []);
    })();
  }, []);

  const byKey = useMemo(() => new Map(rows.map(r => [r.badge, r])), [rows]);

  // Determine which ring to show:
  // If onboarding incomplete -> show onboarding progress.
  // Else show first incomplete level's progress (level1..level20).
  // If all 20 complete -> show 100% and "All 20 Complete".
  let ringPercent = 0;
  let ringLabel = "Onboarding";
  if (!onboarded) {
    const ob = byKey.get("onboarding");
    ringPercent = Math.max(0, Math.min(100, ob?.progress ?? 0));
    ringLabel = "Onboarding";
  } else {
    const firstIncomplete = LEVEL_KEYS.find(k => (byKey.get(k)?.progress ?? 0) < 100);
    if (firstIncomplete) {
      const r = byKey.get(firstIncomplete);
      ringPercent = Math.max(0, Math.min(100, r?.progress ?? 0));
      const def = BADGE_DEFS.find(d => d.key === firstIncomplete)!;
      ringLabel = def ? def.label : "Level";
    } else {
      ringPercent = 100;
      ringLabel = "All 20 Complete";
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-white">
      <h1 className="text-3xl font-bold">Your Summary</h1>
      <p className="mt-3 text-white/80">Snapshot of your progress and insights.</p>

      <div className="mt-8 flex items-center gap-6">
        <CircleProgress percent={ringPercent} label={ringLabel} sublabel="Progress" />
        <div className="space-y-2">
          <div className="text-lg font-semibold">Levels</div>
          <div className="text-white/80 text-sm">
            {!onboarded
              ? "Complete Onboarding to unlock Level 1."
              : ringLabel === "All 20 Complete"
              ? "You’ve completed all 20 levels. Beast mode."
              : `Currently working on: ${ringLabel}`}
          </div>
        </div>
      </div>

      {/* TODO: below this, render your real insights */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold">Insights</h2>
        <p className="mt-2 text-white/80">Your Smartness Score, traits, love languages, and more will appear here.</p>
      </section>
    </main>
  );
}
