import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "anon";

    let query = supabaseAdmin.from("quiz_runs").select("*").order("created_at", { ascending: false }).limit(3);

    if (userId === "anon") {
      query = query.eq("user_label", "anon").is("user_id", null);
    } else {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;
    if (error) {
      console.error("[KY] latest runs error:", error);
      return NextResponse.json({ ok: false, runs: [], error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, runs: data || [] });
  } catch (e) {
    console.error("[KY] latest runs catch:", e);
    return NextResponse.json({ ok: false, runs: [] }, { status: 500 });
  }
}
