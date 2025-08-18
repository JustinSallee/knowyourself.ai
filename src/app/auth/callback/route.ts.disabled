import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/chat";

  if (code) {
    try {
      await supabase.auth.exchangeCodeForSession(code);
    } catch {
      // Ignore repeated opens/expired links
    }
  }
  return NextResponse.redirect(new URL(next, req.url));
}
