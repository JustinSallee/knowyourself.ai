// app/api/chat/route.ts
import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

// RLS-safe client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Role = 'user' | 'assistant' | 'system'

async function loadOrCreateConversation(userId: string) {
  const { data: found, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  if (found) return found

  const { data: created, error: insertErr } = await supabase
    .from('conversations')
    .insert({ user_id: userId, title: 'Chat' })
    .select()
    .single()
  if (insertErr) throw insertErr
  return created
}

async function loadRecentMessages(conversationId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('role, content, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(40)
  if (error) throw error
  return (data ?? []) as { role: Role; content: string; created_at: string }[]
}

async function loadMemory(userId: string) {
  const { data, error } = await supabase
    .from('memories')
    .select('kind, value, weight, updated_at')
    .eq('user_id', userId)
    .order('weight', { ascending: false })
    .limit(30)
  if (error) throw error
  const lines = (data ?? []).map(m => `- ${String(m.kind).toUpperCase()}: ${JSON.stringify(m.value)}`)
  return lines.join('\n')
}

async function storeMessage(conversationId: string, userId: string, role: Role, content: string) {
  const { error } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    user_id: userId,
    role,
    content
  })
  if (error) throw error
}

/** Parse "87/100" or "87" or number into 0-100 number */
function parseSmartness(input: unknown): number | null {
  if (typeof input === 'number') return Math.max(0, Math.min(100, input))
  if (typeof input === 'string') {
    const m = input.match(/(\d+(?:\.\d+)?)/)
    if (!m) return null
    const n = parseFloat(m[1])
    if (Number.isNaN(n)) return null
    return Math.max(0, Math.min(100, n))
  }
  return null
}

async function seedMemoryFromQuiz(userId: string) {
  // if any durable memories already exist, skip seeding
  const existing = await supabase
    .from('memories')
    .select('id')
    .eq('user_id', userId)
    .in('kind', ['profile', 'preference', 'summary'])
    .limit(1)
  if (existing.error) throw existing.error
  if ((existing.data ?? []).length > 0) return

  // exact column names per your sample
  const quiz = await supabase
    .from('quiz_results')
    .select('smartness_score, personality_type, dominant_thinking_style, love_language, deep_dive, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (quiz.error || !quiz.data) return

  const q = quiz.data as {
    smartness_score?: string | number
    personality_type?: string
    dominant_thinking_style?: string
    love_language?: string
    deep_dive?: string
  }

  const toUpsert: Array<{ kind: 'profile' | 'preference' | 'summary'; value: any }> = []

  const smart = parseSmartness(q.smartness_score)
  if (smart !== null) toUpsert.push({ kind: 'profile', value: { smartness_score: smart } })

  if (q.personality_type) {
    toUpsert.push({ kind: 'profile', value: { personality_type: q.personality_type } })
  }
  if (q.dominant_thinking_style) {
    toUpsert.push({ kind: 'profile', value: { thinking_style: q.dominant_thinking_style } })
  }
  if (q.love_language) {
    toUpsert.push({ kind: 'preference', value: { love_language: q.love_language } })
  }

  // compact summary for the system prompt
  const summaryBits: string[] = []
  if (smart !== null) summaryBits.push(`smartness ${smart}/100`)
  if (q.personality_type) summaryBits.push(`persona: ${q.personality_type}`)
  if (q.dominant_thinking_style) summaryBits.push(`thinking: ${q.dominant_thinking_style}`)
  if (q.love_language) summaryBits.push(`love language: ${q.love_language}`)

  // include the first ~300 chars of deep_dive as flavor context
  const deepDive = (q.deep_dive || '').trim()
  const deepDiveShort = deepDive ? deepDive.slice(0, 300) + (deepDive.length > 300 ? '…' : '') : ''
  const summaryText =
    [summaryBits.join(' | '), deepDiveShort ? `deep dive: ${deepDiveShort}` : '']
      .filter(Boolean)
      .join(' | ')

  if (summaryText) {
    toUpsert.push({ kind: 'summary', value: { text: summaryText } })
  }

  if (!toUpsert.length) return

  for (const m of toUpsert) {
    const { error } = await supabase.from('memories').upsert(
      {
        user_id: userId,
        kind: m.kind,
        value: m.value,
        weight: 1.0,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'user_id,kind,value' }
    )
    if (error) throw error
  }
}

async function updateMemories(userId: string, userText: string, assistantText: string) {
  const sys =
    'You extract durable user memories from chats. Return JSON with arrays: profile, fact, preference. Only include items that will matter later. Keep each item short.'
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0,
    messages: [
      { role: 'system', content: sys },
      { role: 'user', content: `User said: ${userText}\nAssistant said: ${assistantText}` }
    ]
  })

  const raw = res.choices?.[0]?.message?.content ?? '{}'
  let payload: any
  try {
    payload = JSON.parse(raw)
  } catch {
    return
  }

  const rows: Array<{ kind: 'profile' | 'fact' | 'preference'; value: any }> = []
  for (const k of ['profile', 'fact', 'preference'] as const) {
    for (const item of payload?.[k] ?? []) rows.push({ kind: k, value: item })
  }
  if (!rows.length) return

  for (const r of rows) {
    await supabase.from('memories').upsert(
      {
        user_id: userId,
        kind: r.kind,
        value: r.value,
        weight: 1.0,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'user_id,kind,value' }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, text } = await req.json()
    if (!userId || !text) {
      return new Response('Missing userId or text', { status: 400 })
    }

    // seed once from quiz data
    await seedMemoryFromQuiz(userId)

    const convo = await loadOrCreateConversation(userId)
    const history = await loadRecentMessages(convo.id)
    const memory = await loadMemory(userId)
// inside POST:
const systemPreamble =
`You are KnowYourself.ai, a friendly assistant that uses saved user memory to personalize help.

User memory
${memory || '(no saved memory yet)'}

Guidance
Be direct, concise, and kind. Avoid headings in short replies.`


    const messages = [
      { role: 'system' as Role, content: systemPreamble },
      ...history.map(m => ({ role: m.role as Role, content: m.content })),
      { role: 'user' as Role, content: text }
    ]

    // store the user message
    await storeMessage(convo.id, userId, 'user', text)

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      messages
    })

    const reply = completion.choices?.[0]?.message?.content || 'Sorry, I could not think of a reply.'
    await storeMessage(convo.id, userId, 'assistant', reply)

    // learn from this turn (fire-and-forget)
    updateMemories(userId, text, reply).catch(() => {})

    return new Response(JSON.stringify({ reply }), { headers: { 'Content-Type': 'application/json' } })
  } catch (err: any) {
    const msg = typeof err?.message === 'string' ? err.message : 'Server error'
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
