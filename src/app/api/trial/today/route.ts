import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DAYS, pickMicroGoals } from '@/lib/trialFlow'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnon) return new Response('Server env not configured', { status: 500 })

  const { userId } = await req.json()
  if (!userId) return new Response('Missing userId', { status: 400 })

  const supabase = createClient(supabaseUrl, supabaseAnon)
  const { data: state } = await supabase.from('trial_state').select('*').eq('user_id', userId).maybeSingle()

  const dayNum = Math.min(Math.max(state?.current_day ?? 1, 1), 10)
  const plan = DAYS.find(d => d.day === dayNum)!

  // pull last free text to tailor micro-goals
  const { data: last } = await supabase
    .from('trial_journal')
    .select('free_text,mood')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)

  const micro = state?.micro_goals ?? pickMicroGoals({
    lastFree: last?.[0]?.free_text,
    lastMood: last?.[0]?.mood
  })

  return new Response(
    JSON.stringify({
      day: dayNum,
      freePrompt: plan.freePrompt,
      aiPrompt: plan.aiPrompt,
      mood: plan.mood,
      microGoalsHint: plan.microGoalsHint,
      microGoals: micro
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )
}
