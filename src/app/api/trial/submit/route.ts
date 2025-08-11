import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnon) return new Response('Server env not configured', { status: 500 })

  const { userId, day, mood, freeText, aiAnswer, microGoals } = await req.json()
  if (!userId || !day) return new Response('Missing fields', { status: 400 })

  const supabase = createClient(supabaseUrl, supabaseAnon)

  const { error: insErr } = await supabase.from('trial_journal').insert({
    user_id: userId,
    day,
    mood: mood ?? null,
    free_text: freeText ?? null,
    ai_answer: aiAnswer ?? null
  })
  if (insErr) return new Response(insErr.message, { status: 500 })

  // advance the day (cap at 10)
  const nextDay = Math.min(10, (day as number) + 1)
  const { error: upErr } = await supabase
    .from('trial_state')
    .upsert({ user_id: userId, current_day: nextDay, micro_goals: microGoals ?? null })
  if (upErr) return new Response(upErr.message, { status: 500 })

  return new Response(JSON.stringify({ ok: true, nextDay }), { headers: { 'Content-Type': 'application/json' } })
}
