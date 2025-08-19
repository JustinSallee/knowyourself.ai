"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Chat = { id: string; title: string | null; updated_at: string };

export default function Sidebar() {
  const [userId, setUserId] = useState<string | null>(null);
  const [items, setItems] = useState<Chat[]>([]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
      if (!user) return;

      const { data } = await supabase
        .from("chats")
        .select("id, title, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(50);

      setItems((data as Chat[]) ?? []);
    })();
  }, []);

  if (!userId) {
    return (
      <aside className="hidden md:flex md:w-64 shrink-0 border-r border-white/15 p-3 text-white/70">
        <div className="text-sm">Sign in to view chat history</div>
      </aside>
    );
  }

  return (
    <aside className="hidden md:flex md:w-64 shrink-0 border-r border-white/15 flex-col">
      <div className="h-12 flex items-center gap-2 px-3 border-b border-white/10">
        <span className="text-lg">🕒</span>
        <span className="font-medium">History</span>
      </div>
      <div className="flex-1 overflow-auto px-2 py-2 space-y-1">
        {items.map((c) => (
          <Link
            key={c.id}
            href={`/chat/${c.id}`}
            className="block rounded-lg px-3 py-2 text-sm text-white/90 hover:bg-white/10"
            title={c.title ?? c.id}
          >
            {c.title ?? c.id.slice(0, 12)}
          </Link>
        ))}
        {!items.length && (
          <div className="px-3 py-2 text-sm text-white/50">No conversations yet.</div>
        )}
      </div>
    </aside>
  );
}
