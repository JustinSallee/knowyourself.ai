export const runtime = 'nodejs'

export async function GET() {
  const flags = {
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE: !!process.env.SUPABASE_SERVICE_ROLE,
    OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
  }
  return new Response(JSON.stringify(flags), {
    headers: { 'Content-Type': 'application/json' }
  })
}
