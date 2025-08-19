"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Msg = { role: "user" | "assistant" | "system"; content: string; created_at?: string };

export default function ChatPage({ params }: { params: { id: string } }) {
  const chatId = params.id;
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // auth + initial load
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // not signed in → send them to sign in if that’s your flow, or continue anonymous if you want
        // router.push("/signin");
        setUserId(null);
        return;
      }
      setUserId(user.id);

      // ensure chat row exists for this id
      await supabase.from("chats").upsert({
        id: chatId,
        user_id: user.id,
        title: null, // will set after first user message
      });

      // load messages
      const { data } = await supabase
        .from("chat_messages")
        .select("role, content, created_at")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });
      setMessages((data as Msg[]) ?? []);
    })();
  }, [chatId, router]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const titleFrom = (text: string) =>
    text.trim().slice(0, 60).replace(/\s+/g, " ");

  const canSend = useMemo(
    () => !!input.trim() && !!userId && !sending,
    [input, userId, sending]
  );

  const send = async () => {
    if (!canSend) return;
    const userText = input.trim();
    setInput("");

    // optimistic render
    const nextMsgs = [...messages, { role: "user", content: userText } as Msg];
    setMessages(nextMsgs);

    try {
      // 1) ensure chat has a title after first user msg
      if (!messages.length) {
        await supabase
          .from("chats")
          .update({ title: titleFrom(userText) })
          .eq("id", chatId)
          .eq("user_id", userId!);
      }

      // 2) persist user message
      await supabase.from("chat_messages").insert({
        chat_id: chatId,
        user_id: userId!,
        role: "user",
        content: userText,
      });

      setSending(true);

      // 3) ask your /api/chat
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMsgs.map(m => ({ role: m.role, content: m.content })),
          temperature: 0.4,
        }),
      });

      const data = await res.json();
      const assistant = (data?.reply ?? "").toString();

      // 4) show + persist assistant message
      const doneMsgs = [...nextMsgs, { role: "assistant", content: assistant } as Msg];
      setMessages(doneMsgs);

      await supabase.from("chat_messages").insert({
        chat_id: chatId,
        user_id: userId!,
        role: "assistant",
        content: assistant,
      });
    } catch (e) {
      setMessages(m => [...m, { role: "assistant", content: "Sorry—failed to save or generate a reply." }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-[calc(100dvh-5rem)] max-h-[calc(100dvh-5rem)] flex flex-col">
      {/* messages */}
      <div ref={listRef} className="flex-1 overflow-auto px-4 py-4 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[75%] rounded-2xl px-4 py-2 whitespace-pre-wrap ${
              m.role === "user"
                ? "ml-auto bg-white/90 text-gray-900"
                : "mr-auto bg-white/10 text-white border border-white/15"
            }`}
          >
            {m.content}
          </div>
        ))}
        {!messages.length && (
          <div className="text-white/60 text-sm">Start the conversation…</div>
        )}
      </div>

      {/* input */}
      <div className="border-t border-white/15 bg-black/10 backdrop-blur px-3 py-3">
        <div className="mx-auto max-w-3xl flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => (e.key === "Enter" && !e.shiftKey ? (e.preventDefault(), send()) : null)}
            placeholder="Type your message…"
            className="flex-1 rounded-xl bg-white/90 text-gray-900 px-3 py-2 outline-none"
          />
          <button
            onClick={send}
            disabled={!canSend}
            className={`rounded-xl px-4 py-2 font-medium ${canSend ? "bg-black text-white" : "bg-white/30 text-white/60 cursor-not-allowed"}`}
          >
            {sending ? "…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
