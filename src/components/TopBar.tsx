"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const AVATARS = ["🦊","🐼","🐸","🐵","🐨","🐯","🦄","🐲","🐙","🐧"];

type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null; // we store the emoji here
  onboarded: boolean | null;
  quiz_completed: boolean | null;
};

export default function TopBar() {
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [open, setOpen] = useState(false);

  // local form state
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const showSummary = useMemo(
    () => !!(profile?.onboarded && profile?.quiz_completed),
    [profile]
  );

  // Load session + profile on mount
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) console.warn("getUser error", error);
      const uid = user?.id ?? null;
      setUserId(uid);
      if (!uid) {
        setProfile(null);
        return;
      }

      // ensure profile row exists, then read it
      await supabase.from("profiles").upsert({ id: uid }).throwOnError();

      const { data: p, error: selErr } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url, onboarded, quiz_completed")
        .eq("id", uid)
        .maybeSingle();

      if (cancelled) return;
      if (selErr) {
        console.warn("select profile error", selErr);
        setProfile(null);
      } else {
        setProfile(p as Profile);
        setDisplayName(p?.display_name ?? "");
        setAvatarUrl(p?.avatar_url ?? "");
      }
    };
    init();
    return () => { cancelled = true; };
  }, []);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    const patch = {
      id: userId,
      display_name: displayName.trim(),
      avatar_url: avatarUrl || null,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("profiles").upsert(patch);
    if (error) {
      alert("Could not save profile");
      return;
    }
    setProfile(p => p ? { ...p, display_name: patch.display_name, avatar_url: patch.avatar_url } as Profile : p);
    setOpen(false);
  };

  const signIn = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${location.origin}` } });
  };
  const signOut = async () => {
    await supabase.auth.signOut();
    setUserId(null);
    setProfile(null);
    setDisplayName("");
    setAvatarUrl("");
    setOpen(false);
  };

  return (
    <header className="relative h-20 flex items-center px-4">
      {/* grey strip over sidebar only */}
      <div className="absolute left-0 top-0 h-full w-64 border-r-2 border-gray-400/40 bg-gray-50/10 pointer-events-none" aria-hidden />

      {/* centered nav */}
      <nav className="relative z-10 mx-auto mt-2 flex items-center gap-4">
        {!showSummary ? (
          <>
            <Link href="/onboarding" className="rounded-md px-3 py-2 text-sm font-medium bg-white/10 hover:bg-white/20 border border-white/20 shadow-sm">Onboarding</Link>
            <Link href="/trial/1" className="rounded-md px-3 py-2 text-sm font-medium bg-white/10 hover:bg-white/20 border border-white/20 shadow-sm">Quiz</Link>
          </>
        ) : (
          <>
            <Link href="/summary" className="rounded-md px-3 py-2 text-sm font-medium bg-white/10 hover:bg-white/20 border border-white/20 shadow-sm">Summary</Link>
            <Link href="/boost" className="rounded-md px-3 py-2 text-sm font-medium bg-white/10 hover:bg-white/20 border border-white/20 shadow-sm">Boost</Link>
          </>
        )}
        <Link href="/chat" className="rounded-md px-3 py-2 text-sm font-medium bg-black text-white border border-white/20 shadow-sm">Chat</Link>
        {!userId && (
          <button onClick={signIn} className="rounded-md px-3 py-2 text-sm font-medium bg-white/10 hover:bg-white/20 border border-white/20 shadow-sm">
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
            title={profile?.display_name || "Profile"}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xl border border-white/40">
              <span className="leading-none">{(profile?.avatar_url || "🙂")}</span>
            </span>
            <span className="max-w-[10rem] truncate">
              {profile?.display_name || "Profile"}
            </span>
          </button>
        </div>
      )}

      {/* profile modal */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form onSubmit={saveProfile} className="bg-white text-gray-900 rounded-lg p-4 w-96 space-y-4 shadow-xl">
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
              <button type="button" onClick={signOut} className="px-3 py-1.5 rounded border border-gray-300 text-gray-800 hover:bg-gray-100">
                Sign out
              </button>
              <div className="flex gap-2">
                <button type="button" onClick={() => setOpen(false)} className="px-3 py-1.5 rounded border border-gray-300 text-gray-800 hover:bg-gray-100">
                  Cancel
                </button>
                <button type="submit" className="px-3 py-1.5 rounded bg-black text-white">
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
