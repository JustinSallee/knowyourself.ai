"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Conversation = { id: string; title: string | null; created_at: string };

export default function Sidebar() {
  const [items, setItems] = useState<
    Array<Conversation & { keywords?: string }>
  >([]);

  useEffect(() => {
    const load = async () => {
      const { data: convos, error } = await supabase
        .from("conversations")
        .select("id,title,created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error || !convos) return;

      // Try to derive a few keywords from each convo’s latest user message
      const withKeywords = await Promise.all(
        convos.map(async (c) => {
          let kw = deriveKeywordsFromTitle(c.title || "");
          // try to pull the latest user message for better keywords
          const { data: msgs } = await supabase
            .from("messages")
            .select("content,role")
            .eq("conversation_id", c.id)
            .order("created_at", { ascending: false })
            .limit(1);
          if (msgs && msgs[0]?.content) {
            kw = extractKeywords(msgs[0].content);
          }
          return { ...c, keywords: kw };
        })
      );

      setItems(withKeywords);
    };
    load();
  }, []);

  return (
    <aside className="w-64 shrink-0 border-r-2 border-gray-400/40 bg-gray-50/10 backdrop-blur p-0 overflow-auto">
      {/* slim top bar inside the sidebar */}
      <div className="h-10 flex items-center gap-2 px-3 text-white/90 text-base border-b border-gray-400/40">
        {/* clock icon */}
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="h-4 w-4 text-white/80"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <span className="font-semibold tracking-wide">History</span>
      </div>

      {/* items */}
      <div className="p-3 space-y-1">
        {items.map((c) => (
          <Link
            key={c.id}
            href={`/chat/${c.id}`}
            className="block rounded-lg p-2 hover:bg-white/10 transition"
          >
            <div className="text-[15px] font-medium text-white">
              {c.title || "Untitled chat"}
            </div>
            {c.keywords ? (
              <div className="text-xs text-white/60 line-clamp-1">
                {c.keywords}
              </div>
            ) : null}
          </Link>
        ))}
        {items.length === 0 && (
          <div className="p-2 text-sm text-white/70">No history yet</div>
        )}
      </div>
    </aside>
  );
}

// helpers
function extractKeywords(text: string, take: number = 6): string {
  const stop = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "to",
    "of",
    "in",
    "on",
    "for",
    "with",
    "about",
    "this",
    "that",
    "is",
    "it",
    "as",
    "are",
    "was",
    "were",
    "be",
    "by",
    "at",
    "from",
    "you",
    "your",
    "i",
    "me",
    "my",
  ]);
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !stop.has(w) && !/^\d+$/.test(w));
  const uniq: string[] = [];
  for (const w of words) {
    if (!uniq.includes(w)) uniq.push(w);
    if (uniq.length >= take) break;
  }
  return uniq.join(" • ");
}

function deriveKeywordsFromTitle(title: string): string {
  if (!title) return "";
  return extractKeywords(title, 4);
}
