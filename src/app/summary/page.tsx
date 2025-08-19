"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import CircleProgress from "@/components/CircleProgress";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Badge = { badge: string; status: "complete" | "incomplete"; progress: number };

export default function SummaryPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const prof = await supabase.from("profiles")
        .select("onboarded, quiz_completed").eq("id", user.id).maybeSingle();

      setOnboarded(!!prof.data?.onboarded);

      const { data } = await supabase
        .from("user_badges")
        .select("badge, status, progress")
        .eq("user_id", user.id);

      setBadges((data as Badge[]) ?? []);
    })();
  }, []);

  const onboarding = badges.find(b => b.badge === "onboarding");
  const level2 = badges.find(b => b.badge === "level2");

  const ringPercent = onboarding?.status === "complete"
    ? (level2?.progress ?? 0)                      // Level 2 after onboarding
    : (onboarding?.progress ?? 0);                 // Show onboarding progress if we later track it

  const ringLabel = onboarding?.status === "complete" ? "Level 2" : "Level 1";

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-white">
      <h1 className="text-3xl font-bold">Your Summary</h1>
      <p className="mt-3 text-white/80">
        Big-picture snapshot of your traits and progress.
      </p>

      <div className="mt-8 flex items-center gap-6">
        <CircleProgress percent={ringPercent} label={ringLabel} sublabel="Progress" />
        <div className="space-y-2">
          <div className="text-lg font-semibold">Levels</div>
          <div className="text-white/80 text-sm">
            {onboarded
              ? "Level 1 complete (Onboarding). Level 2 is now active."
              : "Complete Level 1 (Onboarding) to unlock badges."}
          </div>
        </div>
      </div>

      {/* TODO: render your real insights/score here */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold">Insights</h2>
        <p className="mt-2 text-white/80">Your Smartness Score, traits, love languages, and more will appear here.</p>
      </section>
    </main>
  );
}
