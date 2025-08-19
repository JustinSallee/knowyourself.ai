"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const AVATARS = ["🦊","🐼","🐸","🐵","🐨","🐯","🦄","🐲","🐙","🐧"];

export default function TopBar() {
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>(""); // stores emoji
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
      if (user?.id) {
        const { data } = await supabase
          .from("profiles")
          .select("display_name,avatar_url")
          .eq("id", user.id)
          .maybeSingle();
        if (data) {
          setDisplayName(data.display_name || "");
          setAvatarUrl(data.avatar_url || "");
        } else {
          await supabase.from("profiles").upsert({ id: user.id });
        }
      }
    };
    init();
  }, []);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    await supabase.from("profiles").upsert({
      id: userId,
      display_name: displayName,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    });
    setOpen(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserId(null);
    setOpen(false);
  };

  return (
    <header className="relative h-20 flex items-center px-4">
      {/* grey strip over sidebar only */}
      <div
        className="absolute left-0 top-0 h-full w-64 border-r-2 border-gray-400/40 bg-gray-50/10 pointer-events-none"
        aria-hidden
      />

      {/* centered nav */}
      <nav className="relative z-10 mx-auto mt-2 flex items-center gap-4">
        <Link
          href="/onboarding"
          className="rounded-md px-3 py-2 text-sm font-medium bg-white/10 hover:bg-white/20 border border-white/20 shadow-sm"
        >
          Onboarding
        </Link>
        <Link
          href="/quiz"
          className="rounded-md px-3 py-2 text-sm font-medium bg-white/10 hover:bg-white/20 border border-white/20 shadow-sm"
        >
          Quiz
        </Link>
        {!userId && (
          <button
            onClick={async () => {
              await supabase.auth.signInWithOAuth({ provider: "google" });
            }}
            className="rounded-md px-3 py-2 text-sm font-medium bg-white/10 hover:bg-white/20 border border-white/20 shadow-sm"
          >
            Sign in with Google
          </button>
        )}
      </nav>

      {/* avatar + name button, only when signed in */}
      {userId && (
        <div className="relative z-10 ml-auto pr-2 mt-2">
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 rounded-full h-10 pl-2 pr-3 text-sm font-medium bg-white/10 hover:bg-white/20 border border-white/20 shadow-sm"
            aria-label="Open profile"
            title={displayName || "Profile"}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xl border border-white/40">
              <span className="leading-none">{avatarUrl || "🙂"}</span>
            </span>
            <span className="max-w-[10rem] truncate">
              {displayName || "Profile"}
            </span>
          </button>
        </div>
      )}

      {/* profile modal */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form
            onSubmit={saveProfile}
            className="bg-white text-gray-900 rounded-lg p-4 w-96 space-y-4 shadow-xl"
          >
            <div className="text-base font-semibold">Your profile</div>

            <label className="block text-sm">
              Display name
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 w-full border rounded px-2 py-1"
              />
            </label>

            <div className="text-sm">
              <div className="mb-1">Choose avatar</div>
              <div className="grid grid-cols-5 gap-2">
                {AVATARS.map((a) => {
                  const selected = avatarUrl === a;
                  return (
                    <button
                      type="button"
                      key={a}
                      onClick={() => setAvatarUrl(a)}
                      className={`h-10 w-10 rounded-full flex items-center justify-center border
                      ${selected ? "border-indigo-600 ring-2 ring-indigo-400" : "border-gray-300"}
                      bg-gray-50 hover:bg-gray-100`}
                      title={a}
                    >
                      <span className="text-xl">{a}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2 justify-between pt-2">
              <button
                type="button"
                onClick={signOut}
                className="px-3 py-1.5 rounded border border-gray-300 text-gray-800 hover:bg-gray-100"
              >
                Sign out
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-3 py-1.5 rounded border border-gray-300 text-gray-800 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded bg-black text-white"
                >
                  Save
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </header>
  );
}
