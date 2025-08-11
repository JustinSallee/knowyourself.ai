// src/lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

// Create the browser client *when called*, not at import time
export function getSupabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Avoid hard crashes during build; warn instead (client will rehydrate with real envs)
  if (!url || !anon) {
    if (typeof window !== "undefined") {
      console.warn("[KY] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
    }
    // Return a harmless placeholder to avoid throwing during bundling
    return createClient("https://placeholder.supabase.co", "public-anon-key");
  }

  return createClient(url, anon);
}
