// src/app/auth/reset/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const supabase = supabaseServer();
    await supabase.auth.signOut(); // clears sb* cookies
  } catch {}
  const url = new URL(req.url);
  return NextResponse.redirect(new URL("/", url).toString());
}
