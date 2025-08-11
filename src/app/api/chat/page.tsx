'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

type Msg = { role: 'user'|'assistant', content: string, created_at?: string }

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
)

export default function ChatPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)

  // quiz state
  const [hasQuiz, setHasQuiz] = useState<boolean | null>(null)
  const [loadingQuizCheck, setLoadingQuizCheck] = useState(true)

  // chat state
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: 'assistant', content: 'Welcome to KnowYourself.ai. Ask me anything. Your quiz profile helps me personalize answers.' }
  ])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, loading])

  // auth + quiz check
  useEffect(() => {
    const init = async () => {
      // ensure session
      const { data } = await supabase.auth.getSession()
      if (!data.session) await supabase.auth.signInAnonymously()
      const session = (await supabase.auth.getSession()).data.session
      const id = session?.user?.id || null
      setUserId(id)

      // check quiz only if we have a user
      if (id) {
        const { data: rows, error } = await supabase
          .from('quiz_results')
          .select('id')
          .eq('user_id', id)
          .limit(1)

        if (!error) setHasQuiz(Boolean(rows && rows.length))
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
    <div className="min-h-screen flex flex-col bg-[radial-gradient(1200px_600px_at_0%_0%,#f5f5f5_0%,#eaeaea_45%,#e5e7eb_100%)]">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-black text-white flex items-center justify-center font-bold shadow-sm">K</div>
          <div className="text-xl font-extrabold tracking-tight text-neutral-900">KnowYourself.ai</div>

          {/* always-visible escape hatch to quiz */}
          <button
            onClick={() => router.push('/quiz')}
            className="ml-auto rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold hover:bg-neutral-100 transition"
          >
            Take quiz
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 space-y-4">
        {/* Quiz CTA: only render after we finish checking; show when user has no results */}
        {!loadingQuizCheck && hasQuiz !== true && (
          <div className="rounded-2xl border border-neutral-200 bg-white/95 shadow-md p-5">
            <div className="text-base text-neutral-900 font-semibold">Take the 3-minute quiz</div>
            <div className="text-sm text-neutral-700 mt-1">
              Your profile seeds memory so answers feel tailored from message one.
            </div>
            <div className="mt-4">
              <button
                onClick={() => router.push('/quiz')}
                className="rounded-xl bg-black text-white px-5 py-2.5 text-sm font-semibold shadow-sm hover:opacity-90 active:scale-[.99] transition"
              >
                Start quiz
              </button>
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
                    ? 'bg-black text-white rounded-2xl px-4 py-3 shadow-md max-w-[80%]'
                    : 'bg-white text-neutral-900 border border-neutral-200 rounded-2xl px-4 py-3 shadow-sm max-w-[80%]'
                }
              >
                <div className="whitespace-pre-wrap leading-relaxed text-[15px]">{m.content}</div>
                <div className={'mt-1 text-[10px] ' + (m.role === 'user' ? 'text-neutral-300' : 'text-neutral-500')}>
                  {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-neutral-200 rounded-2xl px-4 py-3 shadow-sm text-neutral-700">
                typing…
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </main>

      {/* Composer */}
      <footer className="sticky bottom-0 border-t border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <div className="flex items-end gap-2">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={onKey}
              placeholder="Ask anything"
              className="flex-1 h-14 resize-none rounded-xl border border-neutral-300 bg-neutral-50 focus:bg-white outline-none p-3 text-neutral-900 placeholder-neutral-600 shadow-sm"
            />
            <button
              onClick={send}
              className="rounded-xl bg-black text-white px-5 py-3 text-sm font-semibold shadow-sm hover:opacity-90 active:scale-[.99] transition disabled:opacity-50"
              disabled={loading || !text.trim()}
            >
              Send
            </button>
          </div>
          <div className="mt-2 text-xs text-neutral-700">Your chats are saved to improve replies next time</div>
        </div>
      </footer>
    </div>
  )
}
