import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'  // important: not edge

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE
  if (!url || !key) return new Response('ok')  // no-op if not configured
  const supabase = createClient(url, key)
  // TODO: your real summarize job here later
  return new Response('ok')
}
