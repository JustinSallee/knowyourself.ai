import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs"; // safer for server env vars on Vercel

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

function profileToBullets(profile = {}) {
  const {
    smartPct,
    seconds,
    totals = {},
    loveTotals = {},
    thinkingType,
    loveLabel,
  } = profile;

  const traitPairs = Object.entries(totals)
    .filter(([k]) => k !== "smart")
    .sort((a, b) => (b[1] || 0) - (a[1] || 0))
    .slice(0, 3)
    .map(([k]) => k)
    .join(", ");

  return [
    smartPct != null ? `Smartness Score: ${clamp(smartPct, 0, 100)}` : null,
    seconds != null ? `Pace (seconds): ${Math.max(0, seconds)}` : null,
    thinkingType ? `Thinking Type: ${thinkingType}` : null,
    loveLabel ? `Dominant Love Language: ${loveLabel}` : null,
    traitPairs ? `Top traits: ${traitPairs}` : null,
  ]
    .filter(Boolean)
    .join("\n- ");
}

export async function POST(req) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY on server." },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { mode = "results" } = body;

    // --------- RESULTS MODE (after quiz) ----------
    if (mode === "results") {
      const { totals = {}, loveTotals = {}, seconds = 0, smartPct = 0 } = body;
      const thinkingType = body.thinkingType || ""; // optional from client
      const loveLabel = body.loveLabel || ""; // optional from client

      const profileBullets = profileToBullets({
        smartPct,
        seconds,
        totals,
        loveTotals,
        thinkingType,
        loveLabel,
      });

      const system =
        "You are the writing brain for a personality+performance app. Write in a sharp, grounded, motivating tone. Avoid horoscope fluff and fortune telling. Be concrete, specific, and kind.";

      const userPrompt = `
Create a personalized 2–3 paragraph analysis (no headings, no bullet points) of this user based on quiz signals.
Be specific but not judgy. Focus on strengths, operating style, and one practical growth nudge.

Profile snapshot:
- ${profileBullets || "No profile provided"}

Rules:
- No medical/clinical claims.
- Avoid therapy jargon.
- Use second person ("you").
- Keep it ~150–220 words total.
`;

      const resp = await client.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.7,
        max_tokens: 450,
        messages: [
          { role: "system", content: system },
          { role: "user", content: userPrompt },
        ],
      });

      const text =
        resp.choices?.[0]?.message?.content?.trim() ||
        "We couldn’t generate a write-up right now.";
      return NextResponse.json({ text });
    }

    // --------- CHAT MODE (freeform chat) ----------
    if (mode === "chat") {
      const { messages = [], profile = {}, userId = "anon" } = body;

      const profileBullets = profileToBullets(profile);
      const system = `
You are KnowYourself.ai — a helpful, direct assistant that adapts to the user's style.
You know a lightweight profile about the user (from a short quiz). Use it to tailor tone, examples, and suggestions,
but don't overfit. If the user asks about the app, explain succinctly. If asked for advice, provide 1–3 concrete steps.
Stay positive, realistic, and action-oriented. No medical/clinical claims.

User profile:
${profileBullets || "(empty)"}
`;

      // Keep last ~12 turns, sanitize roles
      const convo = [
        { role: "system", content: system },
        ...messages
          .slice(-12)
          .map((m) => ({
            role: m.role === "user" ? "user" : "assistant",
            content: String(m.content || "").slice(0, 4000),
          })),
      ];

      const resp = await client.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.6,
        max_tokens: 600,
        messages: convo,
        user: userId, // rate-limit bucketing
      });

      const text =
        resp.choices?.[0]?.message?.content?.trim() ||
        "Sorry, I couldn’t think of a good answer right now.";
      return NextResponse.json({ text });
    }

    // --------- Unknown mode ----------
    return NextResponse.json({ error: "Unknown mode." }, { status: 400 });
  } catch (err) {
    console.error("generate route error:", err);
    return NextResponse.json(
      { error: "Server error in /api/generate" },
      { status: 500 }
    );
  }
}