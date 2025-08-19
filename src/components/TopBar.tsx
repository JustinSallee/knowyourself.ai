"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TopBar() {
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
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

  const onSave = async (e: React.FormEvent) => {
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

  return (
    <header className="h-14 flex items-center justify-end px-4">
      <button
        onClick={() => setOpen(true)}
        className="rounded-full h-10 px-4 text-sm font-medium bg-white/10 hover:bg-white/20 border border-white/20 shadow-sm"
        aria-label="Profile"
      >
        Profile
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form onSubmit={onSave} className="bg-white rounded-lg p-4 w-80 space-y-3">
            <div className="text-base font-semibold">Your profile</div>
            <label className="block text-sm">
              Display name
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 w-full border rounded px-2 py-1"
              />
            </label>
            <label className="block text-sm">
              Avatar url
              <input
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="mt-1 w-full border rounded px-2 py-1"
                placeholder="https://..."
              />
            </label>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-3 py-1 rounded border"
              >
                Cancel
              </button>
              <button type="submit" className="px-3 py-1 rounded bg-black text-white">
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </header>
  );
}
