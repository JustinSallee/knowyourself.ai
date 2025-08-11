'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
)

export default function QuizPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)

  // Day 0 “where you’re at”
  const [intro, setIntro] = useState('')

  // 5 surgical questions
  const [q1, setQ1] = useState('')
  const [q2, setQ2] = useState('')
  const [q3, setQ3] = useState('')
  const [q4, setQ4] = useState('')
  const [q5, setQ5] = useState('')

  // simple self labels (MVP)
  const [smart, setSmart] = useState(50) // 0..100 slider
  const [persona, setPersona] = useState('Analytical Builder')
  const [thinking, setThinking] = useState('Relational Lean')
  const [love, setLove] = useState('Emotional Availability')

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) await supabase.auth.signInAnonymously()
      const session = (await supabase.auth.getSession()).data.session
      setUserId(session?.user?.id ?? null)
    })()
  }, [])

  const submit = async () => {
    if (!userId) return
    setSaving(true)
    setError(null)

    // combine long-form answers into deep_dive text
    const deepDive =
`Intro:
${intro.trim()}

Q1 (most uncomfortable truth):
${q1.trim()}

Q2 (overwhelmed → what did you do):
${q2.trim()}

Q3 (mistakes vs opportunities):
${q3.trim()}

Q4 (others would say holds you back):
${q4.trim()}

Q5 (what you wish people understood):
${q5.trim()}
`.trim()

    try {
      const { error } = await supabase.from('quiz_results').insert({
        user_id: userId,
        smartness_score: smart,
        personality_type: persona,
        dominant_thinking_style: thinking,
        love_language: love,
        deep_dive: deepDive
      })
      if (error) throw error
      setOk(true)
      // send them back to chat after a beat
      setTimeout(() => router.push('/chat'), 800)
    } catch (e: any) {
      setError(e?.message || 'Could not save your quiz.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_0%_0%,#f5f5f5_0%,#eaeaea_45%,#e5e7eb_100%)]">
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-black text-white grid place-items-center font-bold shadow-sm">K</div>
          <div className="text-xl font-extrabold text-neutral-900">KnowYourself.ai</div>
          <div className="ml-auto text-xs text-neutral-600">Deep Intake</div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white/95 shadow-md p-5 space-y-5">
          <div>
            <div className="text-base font-semibold text-neutral-900 mb-1">Where are you at right now?</div>
            <div className="text-sm text-neutral-700 mb-2">
              What’s working, what’s not, what’s chewing at you, and what you think you need.
            </div>
            <textarea
              value={intro}
              onChange={e => setIntro(e.target.value)}
              className="w-full h-28 rounded-xl border border-neutral-300 bg-neutral-50 focus:bg-white outline-none p-3 text-neutral-900 placeholder-neutral-600 shadow-sm"
              placeholder="Be blunt. No fluff."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <Field
              label="What truth about yourself felt most uncomfortable in writing the above — and why?"
              value={q1}
              onChange={setQ1}
            />
            <Field
              label="Think of a time you felt overwhelmed. What exactly did you do next?"
              value={q2}
              onChange={setQ2}
            />
            <Field
              label="When deciding, do you avoid mistakes or chase opportunities? Tell a quick story."
              value={q3}
              onChange={setQ3}
            />
            <Field
              label="If a close friend called out 3 things holding you back, what would they say?"
              value={q4}
              onChange={setQ4}
            />
            <Field
              label="What do you wish people understood about you, but never seem to?"
              value={q5}
              onChange={setQ5}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm font-medium text-neutral-800 mb-1">Self-rated Smartness</div>
              <input type="range" min={0} max={100} value={smart} onChange={e => setSmart(Number(e.target.value))} className="w-full" />
              <div className="text-xs text-neutral-600 mt-1">{smart}/100</div>
            </div>

            <Picker
              label="Personality snapshot"
              value={persona}
              onChange={setPersona}
              options={[
                'Analytical Builder',
                'Relational Driver',
                'Visionary Starter',
                'Grounded Operator'
              ]}
            />

            <Picker
              label="Dominant thinking style"
              value={thinking}
              onChange={setThinking}
              options={[
                'Relational Lean',
                'Analytic Lean',
                'Creative Divergent',
                'Practical Convergent'
              ]}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Picker
              label="Love language (vibe)"
              value={love}
              onChange={setLove}
              options={[
                'Emotional Availability',
                'Words of Affirmation',
                'Quality Time',
                'Acts of Service',
                'Physical Touch'
              ]}
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}
          {ok && <div className="text-sm text-green-700">Saved. Redirecting…</div>}

          <div className="flex gap-2">
            <button
              onClick={submit}
              disabled={saving || !userId}
              className="rounded-xl bg-black text-white px-5 py-2.5 text-sm font-semibold shadow-sm hover:opacity-90 active:scale-[.99] transition disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save & continue'}
            </button>
            <a href="/chat" className="rounded-xl border border-neutral-300 px-5 py-2.5 text-sm font-semibold hover:bg-neutral-100 transition">
              Skip for now
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <div className="text-sm font-medium text-neutral-800 mb-1">{label}</div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full h-32 rounded-xl border border-neutral-300 bg-neutral-50 focus:bg-white outline-none p-3 text-neutral-900 placeholder-neutral-600 shadow-sm"
      />
    </div>
  )
}

function Picker({
  label,
  value,
  onChange,
  options
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: string[]
}) {
  return (
    <div>
      <div className="text-sm font-medium text-neutral-800 mb-1">{label}</div>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-xl border border-neutral-300 bg-neutral-50 focus:bg-white outline-none p-3 text-neutral-900 shadow-sm"
      >
        {options.map(o => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  )
}
