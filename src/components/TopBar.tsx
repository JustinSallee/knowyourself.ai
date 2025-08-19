"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function TopBar() {
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
      if (user?.id) {
        const { data } = await supabase.from("profiles").select("display_name,avatar_url").eq("id", user.id).maybeSingle();
        if (data) {
          setDisplayName(data.display_name || "");
          setAvatarUrl(data.avatar_url || "");
        } else {
          // ensure profile row exists
          await supabase.from("profiles").upsert({ id: user.id });
        }
      }
    };
    init();
  }, []);

  const [open, setOpen] = useState(false);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    await supabase.from("profiles").upsert({ id: userId, display_name: displayName, avatar_url: avatarUrl, updated_at: new Date().toISOString() });
    setOpen(false);
  };

  return (
    <header className="h-12 border-b flex items-center px-3">
      <button
        onClick={() => setOpen(true)}
        className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center"
        aria-label="Profile"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="avatar" src={avatarUrl} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs font-semibold">{displayName ? displayName[0]?.toUpperCase() : "P"}</span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form onSubmit={onSave} className="bg-white rounded-lg p-4 w-80 space-y-3">
            <div className="text-base font-semibold">Your profile</div>
            <label className="block text-sm">
              Display name
              <input value={displayName} onChange={e => setDisplayName(e.target.value)} className="mt-1 w-full border rounded px-2 py-1" />
            </label>
            <label className="block text-sm">
              Avatar url
              <input value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} className="mt-1 w-full border rounded px-2 py-1" placeholder="https://..." />
            </label>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setOpen(false)} className="px-3 py-1 rounded border">Cancel</button>
              <button type="submit" className="px-3 py-1 rounded bg-black text-white">Save</button>
            </div>
          </form>
        </div>
      )}
    </header>
  );
}
