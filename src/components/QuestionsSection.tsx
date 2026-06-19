'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Square, CheckSquare, Sparkles } from 'lucide-react'

const FALLBACK = [
  "What's included in your bridal package?",
  "Do you offer a trial session?",
  "What's your cancellation/rescheduling policy?",
]

function Skeleton() {
  return (
    <div className="space-y-0 divide-y divide-line">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 py-3.5 first:pt-0">
          <div className="w-5 h-5 rounded bg-line/60 animate-pulse flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2 pt-0.5">
            <div className="h-3.5 bg-line/60 rounded animate-pulse" style={{ width: `${72 + (i % 3) * 10}%` }} />
            {i % 2 === 0 && <div className="h-3.5 bg-line/40 rounded animate-pulse w-1/2" />}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function QuestionsSection({ salonId }: { salonId: string }) {
  const searchParams = useSearchParams()
  const budget = searchParams.get('budget') ?? undefined
  const area = searchParams.get('area') ?? undefined
  const style = searchParams.get('style') ?? undefined
  const customNote = searchParams.get('note') ?? undefined

  const isPersonalized = !!(budget || style || customNote)

  const [questions, setQuestions] = useState<string[]>([])
  const [checked, setChecked] = useState<boolean[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ salonId, budget, area, style, customNote }),
    })
      .then(r => r.json())
      .then(d => {
        const qs: string[] = d.questions ?? FALLBACK
        setQuestions(qs)
        setChecked(new Array(qs.length).fill(false))
      })
      .catch(() => {
        setQuestions(FALLBACK)
        setChecked(new Array(FALLBACK.length).fill(false))
      })
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salonId])

  function toggle(i: number) {
    setChecked(c => c.map((v, idx) => (idx === i ? !v : v)))
  }

  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <span className="rule-gold" aria-hidden="true" />
        <h2 className="text-xs font-semibold uppercase tracking-widest text-oxblood-700">
          Questions to Ask This Salon
        </h2>
      </div>

      <div className="bg-cream rounded-2xl border border-line shadow-soft p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="grid place-items-center w-6 h-6 rounded-lg bg-oxblood-50">
            <Sparkles className="w-3.5 h-3.5 text-oxblood-700" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <span className="text-xs font-semibold text-oxblood-700 uppercase tracking-wider">
            {isPersonalized ? 'Personalized for You' : 'AI-Suggested'}
          </span>
        </div>

        {loading ? (
          <Skeleton />
        ) : (
          <ul className="divide-y divide-line" role="list">
            {questions.map((q, i) => (
              <li key={i} className="first:pt-0 last:pb-0 py-3">
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  aria-pressed={checked[i]}
                  className={`flex items-start gap-3 w-full text-left min-h-[44px] [touch-action:manipulation] transition-colors ${
                    checked[i] ? 'text-ink-muted' : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  <span className={`mt-0.5 flex-shrink-0 transition-colors ${checked[i] ? 'text-gold-500' : 'text-oxblood-300 group-hover:text-oxblood-500'}`}>
                    {checked[i] ? (
                      <CheckSquare className="w-5 h-5" strokeWidth={2} aria-hidden="true" />
                    ) : (
                      <Square className="w-5 h-5" strokeWidth={1.5} aria-hidden="true" />
                    )}
                  </span>
                  <span className={`text-sm leading-relaxed ${checked[i] ? 'line-through decoration-ink-muted/50' : ''}`}>
                    {q}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {!loading && (
          <p className="text-xs text-ink-muted mt-5 pt-4 border-t border-line">
            {checked.some(Boolean)
              ? `${checked.filter(Boolean).length} of ${questions.length} asked`
              : 'Tap a question to mark it as asked.'}
          </p>
        )}
      </div>
    </section>
  )
}
