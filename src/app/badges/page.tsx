"use client";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { BADGE_DEFS } from "@/lib/badges";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Row = { badge: string; status: "complete" | "incomplete"; progress: number; unlocked_at: string | null };

export default function BadgesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("user_badges")
        .select("badge, status, progress, unlocked_at")
        .eq("user_id", user.id);

      setRows((data as Row[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const byKey = useMemo(() => new Map(rows.map(r => [r.badge, r])), [rows]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 text-white">
      <h1 className="text-3xl font-bold">Badges</h1>
      <p className="mt-3 text-white/80">Earn badges as you progress through levels.</p>

      {loading ? (
        <div className="mt-8 text-white/70">Loading…</div>
      ) : (
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {BADGE_DEFS.map(def => {
            const row = byKey.get(def.key);
            const complete = row?.status === "complete" || (row?.progress ?? 0) >= 100;
            const progress = Math.max(0, Math.min(100, row?.progress ?? 0));
            return (
              <div
                key={def.key}
                className={`rounded-2xl p-4 border shadow-sm transition
                  ${complete
                    ? "bg-gradient-to-br from-indigo-600 to-fuchsia-600 border-indigo-300 text-white"
                    : "bg-white/5 border-white/15 text-white/60"
                  }`}
                title={def.label}
              >
                <div className="text-2xl">{def.icon}</div>
                <div className="mt-1 text-base font-semibold">{def.label}</div>
                <div className="mt-1 text-xs opacity-80">
                  {complete ? "Completed" : `${progress}%`}
                </div>
                {!complete && (
                  <div className="mt-3 h-2 bg-white/15 rounded-full overflow-hidden">
                    <div className="h-full bg-white" style={{ width: `${progress}%` }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
