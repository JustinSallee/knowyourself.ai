"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Simple “Boost” loop that keeps asking short, insightful questions.
 * It uses your existing /api/chat route, so Groq/OpenAI fallback still works.
 * No DB writes yet—just a clean, infinite Q&A flow.
 */

type Msg = { role: "system" | "user" | "assistant"; content: string };

const SYS_PROMPT =
  "You are a concise, thoughtful coach. Ask ONE short, high-signal self-reflection question at a time. " +
  "No preamble. No follow-ups in the same message. Avoid yes/no. Keep it 1–2 sentences.";

export default function BoostPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "system", content: SYS_PROMPT },
  ]);
  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // Ask the very first question on mount
  useEffect(() => {
    void askNext("Start");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, question]);

  async function askNext(userInput: string) {
    setLoading(true);
    try {
      const nextMsgs: Msg[] = [...messages, { role: "user", content: userInput }];
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMsgs }),
      });
      const data = await res.json();
      const q = (data?.reply || "").toString().trim();

      setMessages((prev) => [...prev, { role: "user", content: userInput }, { role: "assistant", content: q }]);
      setQuestion(q);
      setAnswer("");
    } catch {
      setQuestion("I hit a snag generating the next question. Try again?");
    } finally {
      setLoading(false);
    }
  }

  async function submitAnswer() {
    if (!answer.trim() || loading) return;
    await askNext(answer.trim());
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-white">
      <h1 className="text-3xl font-bold">Boost</h1>
      <p className="mt-3 text-white/80">
        Ongoing quick prompts to deepen your profile. Answer one, get another—endless loop.
      </p>

      <div ref={listRef} className="mt-6 max-h-[60vh] overflow-auto space-y-4 pr-1">
        {messages
          .filter(m => m.role !== "system")
          .map((m, i) => (
            <div
              key={i}
              className={`max-w-[80%] rounded-2xl px-4 py-2 whitespace-pre-wrap ${
                m.role === "user" ? "ml-auto bg-white/90 text-gray-900" : "mr-auto bg-white/10 border border-white/15"
              }`}
            >
              {m.content}
            </div>
          ))}
      </div>

      <div className="mt-6">
        <div className="text-lg font-semibold mb-2">{loading && !question ? "…" : question || "Loading…"}</div>
        <div className="flex gap-2">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void submitAnswer();
              }
            }}
            placeholder="Type your answer…"
            className="flex-1 rounded-xl bg-white/90 text-gray-900 px-3 py-2 outline-none min-h-[56px]"
          />
          <button
            onClick={submitAnswer}
            disabled={loading || !answer.trim()}
            className={`rounded-xl px-4 py-2 font-medium ${loading || !answer.trim() ? "bg-white/30 text-white/60 cursor-not-allowed" : "bg-black text-white"}`}
          >
            {loading ? "…" : "Send"}
          </button>
        </div>
      </div>
    </main>
  );
}
