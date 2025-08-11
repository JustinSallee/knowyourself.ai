// src/app/chat/page.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

type Msg = { role: 'user'|'assistant', content: string, created_at?: string }

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
)

function hasCompleteQuizRow(row: any | null): boolean {
  if (!row) return false
  const { smartness_score, personality_type, dominant_thinking_style, love_language, deep_dive } = row
  const hasScore = smartness_score !== null && smartness_score !== undefined && String(smartness_score).trim() !== ''
  const hasAll =
    !!(personality_type && String(personality_type).trim()) &&
    !!(dominant_thinking_style && String(dominant_thinking_style).trim()) &&
    !!(love_language && String(love_language).trim()) &&
    !!(deep_dive && String(deep_dive).trim())
  return hasScore && hasAll
}

export default function ChatPage() {
  const router = useRouter()

  // state
  const [userId, setUserId] = useState<string | null>(null)
  const [hasQuiz, setHasQuiz] = useState<boolean | null>(null)
  const [loadingQuizCheck, setLoadingQuizCheck] = useState(true)
  const [forceQuiz, setForceQuiz] = useState(false)

  const [msgs, setMsgs] = useState<Msg[]>([
    { role: 'assistant', content: 'Welcome to KnowYourself.ai. Ask me anything. Your quiz profile helps me personalize answers.' }
  ])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  // scroll to bottom on updates
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, loading])

  // URL flags: /chat?quiz=1 to force-show CTA
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setForceQuiz(new URLSearchParams(window.location.search).has('quiz'))
    }
  }, [])

  // auth + quiz check
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) await supabase.auth.signInAnonymously()
      const session = (await supabase.auth.getSession()).data.session
      const id = session?.user?.id || null
      setUserId(id)

      if (id) {
        const { data: rows, error } = await supabase
          .from('quiz_results')
          .select('smartness_score, personality_type, dominant_thinking_style, love_language, deep_dive, created_at')
          .eq('user_id', id)
          .order('created_at', { ascending: false })
          .limit(1)

        const latest = rows?.[0] ?? null
        const complete = !error && hasCompleteQuizRow(latest)
        // Debug in console (helpful on prod):
        console.log('quiz check', { id, complete, latest, error })
        setHasQuiz(complete)
      } else {
        setHasQuiz(false)
      }

      setLoadingQuizCheck(false)
    }
    init()
  }, [])

  const send = async () => {
    if (!text.trim() || !userId) return
    const userText = text.trim()
    setText('')
    setMsgs(prev => [...prev, { role: 'user', content: userText }])
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, text: userText })
      })
      const json = await res.json()
      setMsgs(prev => [...prev, { role: 'assistant', content: json.reply ?? 'Error talking to the server.' }])
    } catch {
      setMsgs(prev => [...prev, { role: 'assistant', content: 'Error talking to the server.' }])
    } finally {
      setLoading(false)
    }
  }

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-teal-50 via-emerald-100 to-teal-200">
      {/* Top glow / depth */}
      <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(40%_30%_at_50%_0%,black,transparent)] bg-[radial-gradient(80%_50%_at_50%_-10%,rgba(20,184,166,.25),transparent_60%)]" />

      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-teal-200/60 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-sm shadow-teal-600/20">K</div>
          <div className="text-xl font-extrabold tracking-tight text-teal-950">KnowYourself.ai</div>

          {/* always-visible link to quiz */}
          <button
            onClick={() => router.push('/quiz')}
            className="ml-auto rounded-lg border border-teal-300/80 bg-white/70 px-3 py-1.5 text-xs font-semibold text-teal-900 hover:bg-teal-50 hover:border-teal-400 transition shadow-sm"
          >
            Take quiz
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 space-y-4">
        {/* Quiz CTA */}
        {!loadingQuizCheck && (forceQuiz || hasQuiz !== true) && (
          <div className="relative overflow-hidden rounded-2xl border border-emerald-300/60 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
            <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-emerald-200/60 blur-3xl" />
            <div className="p-5 relative">
              <div className="text-base text-emerald-950 font-semibold">Take the 3-minute intake</div>
              <div className="text-sm text-emerald-900/80 mt-1">
                Your profile seeds memory so answers feel tailored from message one.
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => router.push('/quiz')}
                  className="rounded-xl bg-teal-600 text-white px-5 py-2.5 text-sm font-semibold shadow-sm hover:bg-teal-700 active:scale-[.99] transition focus:outline-none focus:ring-2 focus:ring-teal-400"
                >
                  Start quiz
                </button>
                <button
                  onClick={() => setHasQuiz(true)}
                  className="rounded-xl border border-emerald-300/80 bg-white/70 px-5 py-2.5 text-sm font-semibold text-emerald-900 hover:bg-emerald-50 transition"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="space-y-3">
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={
                  m.role === 'user'
                    ? 'bg-teal-700 text-white rounded-2xl px-4 py-3 shadow-md max-w-[80%] transition hover:shadow-lg'
                    : 'bg-white/90 text-slate-900 border border-teal-200/70 rounded-2xl px-4 py-3 shadow-sm max-w-[80%] transition hover:shadow-md'
                }
              >
                <div className="whitespace-pre-wrap leading-relaxed text-[15px]">{m.content}</div>
                <div
                  className={
                    'mt-1 text-[10px] ' + (m.role === 'user' ? 'text-teal-100/80' : 'text-slate-500')
                  }
                >
                  {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/90 border border-teal-200/70 rounded-2xl px-4 py-3 shadow-sm text-slate-700">
                typing…
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </main>

      {/* Composer */}
      <footer className="sticky bottom-0 border-t border-teal-200/60 bg-white/85 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <div className="flex items-end gap-2">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={onKey}
              placeholder="Ask anything"
              className="flex-1 h-14 resize-none rounded-xl border border-teal-300/80 bg-teal-50/60 focus:bg-white outline-none p-3 text-slate-900 placeholder-teal-800/70 shadow-sm transition focus:ring-2 focus:ring-teal-400"
            />
            <button
              onClick={send}
              className="rounded-xl bg-teal-600 text-white px-5 py-3 text-sm font-semibold shadow-sm hover:bg-teal-700 active:scale-[.99] transition disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-teal-400"
              disabled={loading || !text.trim()}
            >
              Send
            </button>
          </div>
          <div className="mt-2 text-xs text-teal-900/80">
            Your chats are saved to improve replies next time
          </div>
        </div>
      </footer>
    </div>
  )
}
