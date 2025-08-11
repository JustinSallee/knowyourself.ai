// src/app/api/runs/latest/route.js
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Just verify server env is wired
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    return NextResponse.json({ ok: true, env: { serviceKey: hasServiceKey } });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
