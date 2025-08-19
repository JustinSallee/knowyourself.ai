// src/app/chat/[id]/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { chatLocal, ChatMsg } from "@/lib/chat/local";

export default function ChatConversation({ params }: { params: { id: string } }) {
  const id = params.id;
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  // ensure conversation exists, load messages
  useEffect(() => {
    chatLocal.ensure(id, "New chat");
    const stored = chatLocal.readMsgs(id);
    setMsgs(stored);
  }, [id]);

  // persist changes
  useEffect(() => {
    chatLocal.writeMsgs(id, msgs);
  }, [id, msgs]);

  // autoscroll
  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    const me: ChatMsg = { role: "user", content: text, ts: Date.now() };
    setMsgs((prev) => [...prev, me]);
    setInput("");
    setBusy(true);

    // auto-title on first message
    if (msgs.length === 0) {
      const title = text.slice(0, 48).trim().replace(/\s+/g, " ");
      chatLocal.setTitle(id, title || "New chat");
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json().catch(() => ({}));
      const replyText = data?.reply || data?.text || "(no reply)";
      const bot: ChatMsg = { role: "assistant", content: replyText, ts: Date.now() };
      setMsgs((prev) => [...prev, bot]);
    } catch {
      const err: ChatMsg = { role: "assistant", content: "(error)", ts: Date.now() };
      setMsgs((prev) => [...prev, err]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col h-[70vh]">
      {/* Messages */}
      <div ref={scrollerRef} className="flex-1 overflow-auto p-4 space-y-3">
        {msgs.length === 0 && (
          <div className="text-sm text-white/70">
            New chat. Ask anything to get started.
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <div
              className={`inline-block max-w-[80%] rounded-2xl px-3 py-2 whitespace-pre-wrap break-words ${
                m.role === "user" ? "bg-white text-gray-900" : "bg-white/10 text-white"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>

      {/* Composer */}
      <form onSubmit={send} className="border-t border-white/15 p-3 flex gap-2">
        <input
          className="flex-1 rounded-xl px-3 py-2 bg-white text-gray-900 placeholder-gray-500"
          placeholder={busy ? "Thinking…" : "Type a message…"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={busy}
        />
        <button
          disabled={busy}
          className="rounded-xl px-4 py-2 bg-black text-white disabled:opacity-50"
        >
          {busy ? "…" : "Send"}
        </button>
      </form>
    </div>
  );
}
