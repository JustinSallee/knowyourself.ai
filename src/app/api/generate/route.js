// src/app/api/generate/route.js
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // Just verify env is present (but don't import SDK yet)
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY missing" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, text: "generate route basic OK" });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
