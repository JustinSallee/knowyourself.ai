import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnon) return new Response('Server env not configured', { status: 500 })

  const { userId, baseline } = await req.json()
  if (!userId) return new Response('Missing userId', { status: 400 })

  const supabase = createClient(supabaseUrl, supabaseAnon)
  const { data: existing } = await supabase.from('trial_state').select('user_id').eq('user_id', userId).maybeSingle()

  if (!existing) {
    const { error } = await supabase.from('trial_state').insert({
      user_id: userId,
      baseline: baseline || null
    })
    if (error) return new Response(error.message, { status: 500 })
  }

  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } })
}
