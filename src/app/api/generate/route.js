// src/app/api/generate/route.js
import OpenAI from "openai";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

function summarizeHistory(runs = []) {
  if (!runs.length) return "No prior history.";

  // newest first (query already ordered newest → oldest)
  const byTime = runs.slice(0, 3);

  const smart = byTime.map(r => r.smart_pct ?? 0);
  const secs = byTime.map(r => r.seconds ?? 0);

  const smartChange = smart.length >= 2 ? smart[0] - smart[smart.length - 1] : 0;
  const paceChange = secs.length >= 2 ? secs[0] - secs[secs.length - 1] : 0;

  // very light top-trait / love-key extraction
  const topTrait = (traits) => {
    const t = { ...(traits || {}) };
    delete t.smart;
    let bestK = null, bestV = -Infinity;
    for (const k of Object.keys(t)) {
      if (typeof t[k] === "number" && t[k] > bestV) { bestV = t[k]; bestK = k; }
    }
    return bestK || "mixed";
  };
  const topLove = (love) => {
    const l = { ...(love || {}) };
    let bestK = null, bestV = -Infinity;
    for (const k of Object.keys(l)) {
      if (typeof l[k] === "number" && l[k] > bestV) { bestV = l[k]; bestK = k; }
    }
    return bestK || "mixed";
  };

  const traitHeads = byTime.map(r => topTrait(r.traits));
  const loveHeads  = byTime.map(r => topLove(r.love));

  const traitShift = traitHeads[0] && traitHeads[traitHeads.length - 1] && (traitHeads[0] !== traitHeads[traitHeads.length - 1])
    ? `Top trait shifted from ${traitHeads[traitHeads.length - 1]} → ${traitHeads[0]}`
    : `Top trait stable around ${traitHeads[0] || "mixed"}`;

  const loveShift = loveHeads[0] && loveHeads[loveHeads.length - 1] && (loveHeads[0] !== loveHeads[loveHeads.length - 1])
    ? `Love-signal shifted from ${loveHeads[loveHeads.length - 1]} → ${loveHeads[0]}`
    : `Love-signal stable around ${loveHeads[0] || "mixed"}`;

  const smartTrend = smartChange > 3 ? "rising"
                    : smartChange < -3 ? "falling"
                    : "steady";
  const paceTrend  = paceChange < -20 ? "speeding up"
                    : paceChange > 20 ? "slowing down"
                    : "steady pace";

  return [
    `History (latest first): smart=[${smart.join(", ")}], seconds=[${secs.join(", ")}].`,
    `Smartness trend: ${smartTrend} (${smartChange >= 0 ? "+" : ""}${smartChange}). Pace trend: ${paceTrend} (${paceChange >= 0 ? "+" : ""}${paceChange}s).`,
    `${traitShift}. ${loveShift}.`
  ].join(" ");
}

export async function POST(req) {
  try {
    const body = await req.json();

    const totals = body.totals || {};
    const loveTotals = body.loveTotals || {};
    const seconds = body.seconds ?? 0;
    const smartPct = body.smartPct ?? 0;
    const userId = body.userId || "anon";

    // get latest 3 runs for this user
    let query = supabaseAdmin.from("quiz_runs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(3);

    if (userId === "anon") {
      query = query.eq("user_label", "anon").is("user_id", null);
    } else {
      query = query.eq("user_id", userId);
    }

    const { data: runs, error } = await query;
    if (error) {
      console.error("[KY] fetch history error:", error);
    }

    const historySummary = summarizeHistory(runs || []);

    const system = `
You are the voice of KnowYourself.ai.
Write 2–3 short paragraphs (5–8 sentences total), confident and specific-sounding.
Blend cognitive, behavioral, and relational observations. Reflect trends from "History" subtly (no numbers).
Avoid therapy/medical language, diagnoses, or astrology. No bullets, no headers, no emojis.
`.trim();

    const userText = `
Current signals:
- traitTotals: ${JSON.stringify(totals)}
- loveTotals: ${JSON.stringify(loveTotals)}
- smartPct: ${smartPct}
- totalSeconds: ${seconds}

History summary:
${historySummary}

Write a tailored narrative profile. Do not reveal numbers or raw mechanics; imply patterns and trend direction only.
`.trim();

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const resp = await client.responses.create({
      model,
      input: [
        { role: "system", content: system },
        { role: "user", content: userText }
      ],
      temperature: 0.8,
      max_output_tokens: 500
    });

    const text = resp.output_text || (resp.output?.[0]?.content?.[0]?.text ?? "");
    return NextResponse.json({ text: (text || "").trim() });
  } catch (e) {
    console.error("[KY] /api/generate error:", e);
    return NextResponse.json({ error: "Failed to generate results" }, { status: 500 });
  }
}
