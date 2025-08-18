// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// ---- simple tone + style helpers (inline to keep one file) ----
type Tone = { politeness: number; frustration: number; energy: number };

function analyzeTone(input: string): Tone {
  const txt = (input || "").toLowerCase();
  const please = (txt.match(/\bplease\b/g) || []).length;
  const thanks = (txt.match(/\bthanks|\bthank you\b/g) || []).length;
  const swears = (txt.match(/\b(fuck|shit|damn|wtf|hell)\b/g) || []).length;
  const excls  = (txt.match(/!/g) || []).length;
  const politeness  = Math.min(1, (please + thanks) / 2);
  const frustration = Math.min(1, (swears + (excls > 2 ? 1 : 0)) / 3);
  const energy      = Math.min(1, excls / 3);
  return { politeness, frustration, energy };
}

function clamp(n: number, lo = 0, hi = 1) { return Math.max(lo, Math.min(hi, n)); }

function styleFromTone(t: Tone) {
  const warmth      = clamp(0.4 + t.politeness * 0.4 - t.frustration * 0.2);
  const directness  = clamp(0.5 + t.frustration * 0.3);
  const playfulness = clamp(0.2 + t.energy * 0.5);
  const temperature = clamp(0.6 + t.energy * 0.2 - t.frustration * 0.1, 0.2, 1);

  const persona = [
    "You are KnowYourself.ai, a concise, practical coach.",
    `Warmth:${warmth.toFixed(2)} Directness:${directness.toFixed(2)} Playfulness:${playfulness.toFixed(2)}.`,
    "Acknowledge frustration briefly if high; stay calm and concrete.",
    "Mirror the user's energy slightly, never mock.",
    "Always give 1–3 specific next steps. Keep replies under 200 words unless asked."
  ].join(" ");

  return { temperature, persona };
}

// ---- types & parsing ----
type Role = "system" | "user" | "assistant";
type ChatMessage = { role: Role; content: string };

export const runtime = "edge"; // fast & cheap

const MODEL = "gpt-4o-mini"; // change if you prefer another model

export async function POST(req: NextRequest) {
  try {
    const json = await req.json().catch(() => ({}));

    const messages = (json?.messages ?? []) as ChatMessage[];
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages[] required" }, { status: 400 });
    }

    const profile = json?.profile; // optional, any shape
    const lastUser = [...messages].reverse().find(m => m.role === "user")?.content ?? "";

    const tone = analyzeTone(lastUser);
    const style = styleFromTone(tone);

    const system = [
      style.persona,
      profile ? `User profile (use to tailor, do not parrot): ${safeString(profile, 1200)}` : "",
    ].filter(Boolean).join("\n");

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: MODEL,
      temperature: style.temperature,
      max_tokens: 400,
      messages: [
        { role: "system", content: system },
        // filter out any incoming system messages to avoid double-systems
        ...messages.filter(m => m.role !== "system"),
      ],
    });

    const text = completion.choices?.[0]?.message?.content ?? "Sorry, I blanked.";
    return NextResponse.json({ text, tone }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}

function safeString(v: any, max = 1000) {
  try {
    const s = typeof v === "string" ? v : JSON.stringify(v);
    return s.length > max ? s.slice(0, max) + "…" : s;
  } catch { return ""; }
}
