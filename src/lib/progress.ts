"use client";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function markOnboardingDone() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const { error } = await supabase
    .from("profiles")
    .update({ onboarded: true, updated_at: new Date().toISOString() })
    .eq("id", user.id);
  if (error) throw error;
}

export async function markQuizDone() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const { error } = await supabase
    .from("profiles")
    .update({ quiz_completed: true, updated_at: new Date().toISOString() })
    .eq("id", user.id);
  if (error) throw error;
}
