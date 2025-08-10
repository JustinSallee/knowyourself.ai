// src/lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

// Create the Supabase client using your public keys
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,     // From your Supabase Project Settings
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // From your Supabase Project Settings
);
