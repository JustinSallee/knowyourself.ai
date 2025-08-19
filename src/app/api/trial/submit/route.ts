// src/app/api/trial/submit/route.ts
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    // No DB here: just acknowledge. Frontend stores answers in localStorage.
    // If you add Supabase later, insert here and return an id.
    return Response.json({ ok: true, received: body ?? null });
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
}
