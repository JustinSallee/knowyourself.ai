import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      userId,                // optional for now
      smartPct = 0,
      seconds = 0,
      totals = {},
      loveTotals = {},
      aiText = ""
    } = body || {};

    const payload = {
      user_id: userId && userId !== "anon" ? userId : null,
      user_label: userId && userId !== "anon" ? "auth" : "anon",
      smart_pct: smartPct,
      seconds,
      traits: totals,
      love: loveTotals,
      ai_text: aiText
    };

    const { data, error } = await supabaseAdmin
      .from("quiz_runs")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("[KY] save run error:", error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
await saveRun({ userId: user?.id || "anon", smartPct, seconds, totals, loveTotals, aiText: ai });

    return NextResponse.json({ ok: true, run: data });
  } catch (e) {
    console.error("[KY] save run catch:", e);
    return NextResponse.json({ ok: false, error: "save_failed" }, { status: 500 });
  }
}
