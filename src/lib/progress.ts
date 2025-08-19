"use client";
import { createClient } from "@supabase/supabase-js";

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

export async function markOnboardingDone() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  // mark onboarding badge complete
  await upsertBadge("onboarding", { complete: true });

  // ensure level2 badge starts at 0
  await upsertBadge("level2", { progress: 0 });

  // also reflect in profiles (so TopBar swaps)
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

  // Optional: give level2 a tiny nudge for now (we'll define real steps later)
  await upsertBadge("level2", { progress: 10 });
}
