"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Badge = { badge: string; status: "complete" | "incomplete"; progress: number; unlocked_at?: string | null };

const ALL_BADGES = [
  { key: "onboarding", label: "Onboarding" },
  { key: "level2",    label: "Level 2" },
  // add more later: level3, relationships, … etc
];

export default function BadgesPage() {
  const [items, setItems] = useState<Badge[]>([]);
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("user_badges")
        .select("badge, status, progress, unlocked_at")
        .eq("user_id", user.id);
      setItems((data as Badge[]) ?? []);
    })();
  }, []);

  const map = new Map(items.map(b => [b.badge, b]));
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-white">
      <h1 className="text-3xl font-bold">Badges</h1>
      <p className="mt-3 text-white/80">Earn badges by completing levels and milestones.</p>

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
        {ALL_BADGES.map(b => {
          const row = map.get(b.key);
          const complete = row?.status === "complete";
          return (
            <div
              key={b.key}
              className={`rounded-2xl p-4 border shadow-sm transition
                ${complete
                  ? "bg-indigo-600 border-indigo-300 text-white"
                  : "bg-white/5 border-white/15 text-white/60"
                }`}
            >
              <div className="text-lg font-semibold">{b.label}</div>
              {complete ? (
                <div className="text-sm opacity-90 mt-1">Completed</div>
              ) : (
                <div className="text-sm opacity-75 mt-1">Incomplete</div>
              )}
              {typeof row?.progress === "number" && (
                <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white"
                    style={{ width: `${Math.max(0, Math.min(100, row.progress))}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
