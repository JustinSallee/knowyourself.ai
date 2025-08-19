"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function Sidebar() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("id,title,created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      if (!error) setItems(data || []);
    };
    load();
  }, []);

  return (
    <aside className="w-64 shrink-0 border-r p-3 overflow-auto">
      <div className="text-sm font-semibold mb-2">History</div>
      <div className="space-y-1">
        {items.map(c => (
          <Link key={c.id} href={`/chat/${c.id}`} className="block rounded p-2 hover:bg-gray-100">
            {c.title || "Untitled chat"}
          </Link>
        ))}
      </div>
    </aside>
  );
}
