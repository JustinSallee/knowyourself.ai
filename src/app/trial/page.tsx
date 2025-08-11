'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
)

export default function TrialPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [day, setDay] = useState<number>(1)
  const [mood, setMood] = useState<number>(3)
  const [freeText, setFreeText] = useState('')
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiAnswer, setAiAnswer] = useState('')
  const [microGoals, setMicroGoals] = useState<{ id: string; text: string; done?: boolean }[]>([])
  const [microGoalsHint, setMicroGoalsHint] = useState<string | undefined>()
  const [hasMood, setHasMood] = useState(true)

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) await supabase.auth.signInAnonymously()
      const session = (await supabase.auth.getSession()).data.session
      const uid = session?.user?.id ?? null
      setUserId(uid)

      if (uid) {
        // ensure state exists (Day 0 was done earlier in your flow; baseline optional)
        await fetch('/api/trial/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: uid })
        })

        // fetch today's plan
        const res = await fetch('/api/trial/today', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: uid })
        })
        const json = await res.json()
        setDay(json.day)
        setAiPrompt(json.aiPrompt)
        setHasMood(Boolean(json.mood))
        setMicroGoals(json.microGoals || [])
        setMicroGoalsHint(json.microGoalsHint)
      }
      setLoading(false)
    })()
  }, [])

  const submit = async () => {
    if (!userId) return
    const res = await fetch('/api/trial/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        day,
        mood: hasMood ? mood : null,
        freeText,
        aiAnswer,
        microGoals
      })
    })
    const json = await res.json()
    if (json.ok) {
      // naive UX: reload next day plan
      window.location.reload()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-[radial-gradient(1200px_600px_at_0%_0%,#f5f5f5_0%,#eaeaea_45%,#e5e7eb_100%)]">
        <div className="rounded-xl border border-neutral-200 bg-white/90 px-5 py-4 shadow">Loading…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_0%_0%,#f5f5f5_0%,#eaeaea_45%,#e5e7eb_100%)]">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-5 flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-black text-white grid place-items-center font-bold shadow-sm">K</div>
          <div className="text-xl font-extrabold text-neutral-900">KnowYourself.ai</div>
          <div className="ml-auto text-xs text-neutral-600">Day {day} of 10</div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white/95 shadow-md p-5 space-y-5">
          {hasMood && (
            <div>
              <div className="text-sm font-medium text-neutral-800 mb-1">Mood right now</div>
              <input type="range" min={1} max={5} value={mood} onChange={e => setMood(Number(e.target.value))} className="w-full" />
              <div className="text-xs text-neutral-600 mt-1">1 = awful · 5 = great</div>
            </div>
          )}

          <div>
            <div className="text-sm font-medium text-neutral-800 mb-1">What’s on your mind?</div>
            <textarea
              value={freeText}
              onChange={e => setFreeText(e.target.value)}
              placeholder="Short and real."
              className="w-full h-20 rounded-xl border border-neutral-300 bg-neutral-50 focus:bg-white outline-none p-3 text-neutral-900 placeholder-neutral-600 shadow-sm"
            />
          </div>

          <div>
            <div className="text-sm font-medium text-neutral-800 mb-1">Today’s question</div>
            <div className="text-sm text-neutral-700 mb-2">{aiPrompt}</div>
            <textarea
              value={aiAnswer}
              onChange={e => setAiAnswer(e.target.value)}
              placeholder="Give it to me straight."
              className="w-full h-28 rounded-xl border border-neutral-300 bg-neutral-50 focus:bg-white outline-none p-3 text-neutral-900 placeholder-neutral-600 shadow-sm"
            />
          </div>

          <div>
            <div className="text-sm font-medium text-neutral-800 mb-1">Micro-goals</div>
            {microGoalsHint && <div className="text-xs text-neutral-600 mb-2">{microGoalsHint}</div>}
            <div className="space-y-2">
              {microGoals.map((g, i) => (
                <label key={g.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!g.done}
                    onChange={e => {
                      const next = [...microGoals]
                      next[i] = { ...g, done: e.target.checked }
                      setMicroGoals(next)
                    }}
                  />
                  <span className="text-sm text-neutral-800">{g.text}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={submit}
              className="rounded-xl bg-black text-white px-5 py-2.5 text-sm font-semibold shadow-sm hover:opacity-90 active:scale-[.99] transition"
            >
              Save today
            </button>
            <a href="/chat" className="rounded-xl border border-neutral-300 px-5 py-2.5 text-sm font-semibold hover:bg-neutral-100 transition">
              Back to chat
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
