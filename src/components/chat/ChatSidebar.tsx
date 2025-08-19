// src/components/chat/ChatSidebar.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { chatLocal } from "@/lib/chat/local";

type Conv = { id: string; title: string; updatedAt: number };

export default function ChatSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const activeId = useMemo(() => {
    const m = pathname?.match(/\/chat\/([^/]+)/);
    return m?.[1] || null;
  }, [pathname]);

  const [convs, setConvs] = useState<Conv[]>([]);

  function refresh() {
    setConvs(chatLocal.list());
  }

  useEffect(() => {
    refresh();
    const unsub = chatLocal.subscribe(refresh);
    return () => { unsub(); }; // return void, not boolean
  }, []);

  function newChat() {
    const id =
      (globalThis.crypto && "randomUUID" in globalThis.crypto
        ? globalThis.crypto.randomUUID()
        : Math.random().toString(36).slice(2));
    chatLocal.ensure(id, "New chat");
    router.push(`/chat/${id}`);
  }

  function del(id: string) {
    chatLocal.remove(id);
    if (id === activeId) {
      const next = chatLocal.list()[0]?.id || null;
      router.push(next ? `/chat/${next}` : "/chat");
    } else {
      refresh();
    }
  }

  return (
    <aside className="rounded-2xl border border-white/15 bg-white/5 p-3 h-fit md:h-[70vh] md:overflow-auto">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="font-semibold">Conversations</div>
        <button
          onClick={newChat}
          className="px-2.5 py-1.5 text-sm rounded-xl bg-black text-white hover:opacity-90"
        >
          New
        </button>
      </div>

      {convs.length === 0 ? (
        <div className="text-sm text-white/70">No chats yet.</div>
      ) : (
        <ul className="space-y-1">
          {convs.map((c) => {
            const active = c.id === activeId;
            return (
              <li key={c.id} className="group flex items-center">
                <Link
                  href={`/chat/${c.id}`}
                  className={`flex-1 truncate rounded-lg px-2 py-1.5 text-sm ${
                    active ? "bg-white/15" : "hover:bg-white/10"
                  }`}
                >
                  {c.title || "Untitled"}
                </Link>
                <button
                  onClick={() => del(c.id)}
                  className="ml-1 hidden group-hover:inline-block text-white/70 hover:text-white"
                  title="Delete"
                >
                  ×
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
