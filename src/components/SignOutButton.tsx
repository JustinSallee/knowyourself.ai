"use client";

import { createSupabaseClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const supabase = createSupabaseClient();
  return (
    <button
      onClick={async () => {
        await supabase.auth.signOut();
        location.reload();
      }}
      className="px-3 py-2 rounded-xl border"
    >
      Sign out
    </button>
  );
}
