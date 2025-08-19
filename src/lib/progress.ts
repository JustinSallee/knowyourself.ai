"use client";
import { createClient } from "@supabase/supabase-js";
import { LEVEL_KEYS } from "./badges";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function upsertBadge(badge: string, fields: { progress?: number; complete?: boolean }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const patch: any = {
    user_id: user.id,
    badge,
    updated_at: new Date().toISOString(),
  };

  if (typeof fields.progress === "number") {
    patch.progress = Math.max(0, Math.min(100, Math.floor(fields.progress)));
  }
  if (fields.complete) {
    patch.status = "complete";
    patch.progress = 100;
    patch.unlocked_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("user_badges")
    .upsert(patch, { onConflict: "user_id,badge" });

  if (error) throw error;
}

/** Ensure level1..level20 rows exist at 0%. */
async function seedLevelsIfMissing() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data, error } = await supabase
    .from("user_badges")
    .select("badge")
    .eq("user_id", user.id)
    .in("badge", LEVEL_KEYS);

  if (error) throw error;

  const existing = new Set((data || []).map((r: any) => r.badge as string));
  const toInsert = LEVEL_KEYS.filter(k => !existing.has(k)).map(k => ({
    user_id: user.id,
    badge: k,
    status: "incomplete",
    progress: 0,
    updated_at: new Date().toISOString(),
  }));

  if (toInsert.length) {
    const { error: insErr } = await supabase.from("user_badges").insert(toInsert);
    if (insErr) throw insErr;
  }
}

export async function markOnboardingDone() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  // Complete the onboarding badge
  await upsertBadge("onboarding", { complete: true });

  // Seed all levels 1..20 at 0%
  await seedLevelsIfMissing();

  // Ensure profile flag (TopBar visibility)
  await supabase
    .from("profiles")
    .update({ onboarded: true, updated_at: new Date().toISOString() })
    .eq("id", user.id);
}

export async function markQuizDone() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  await supabase
    .from("profiles")
    .update({ quiz_completed: true, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  // Optional tiny nudge on level1 for now (we’ll define real steps later)
  await upsertBadge("level1", { progress: 10 });
}
