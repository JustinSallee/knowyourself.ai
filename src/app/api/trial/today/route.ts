// src/app/api/trial/today/route.ts
export const runtime = "nodejs";

export async function GET() {
  // We keep it simple: day 1 every time; your app can expand this logic later
  const day = 1;
  return Response.json({ day });
}
