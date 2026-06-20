'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import type { ReviewItem } from '@/lib/supabase'

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const full = rating >= i + 1
        const half = !full && rating >= i + 0.5
        return (
          <Star
            key={i}
            className={[
              'w-3.5 h-3.5',
              full ? 'fill-gold-500 text-gold-500' : half ? 'fill-gold-300 text-gold-400' : 'fill-transparent text-line',
            ].join(' ')}
            strokeWidth={1.5}
            aria-hidden="true"
          />
        )
      })}
    </div>
  )
}

const INITIAL = 3

export default function ReviewsSection({ reviews }: { reviews: ReviewItem[] }) {
  const [expanded, setExpanded] = useState(false)

  if (!reviews || reviews.length === 0) return null

  const shown = expanded ? reviews : reviews.slice(0, INITIAL)
  const surplus = reviews.length - INITIAL

  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <span className="rule-gold" aria-hidden="true" />
        <h2 className="text-xs font-semibold uppercase tracking-widest text-oxblood-700">Reviews</h2>
      </div>

      <div className="space-y-3">
        {shown.map((r, i) => (
          <article
            key={i}
            className="rounded-2xl bg-cream border border-line shadow-soft p-5 transition-shadow hover:shadow-card"
          >
            <div className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-full bg-oxblood-50 border border-oxblood-100 flex items-center justify-center flex-shrink-0 font-playfair font-bold text-oxblood-600 text-sm select-none"
                aria-hidden="true"
              >
                {r.author.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                  <span className="font-semibold text-ink text-sm">{r.author}</span>
                  <span className="text-ink-muted text-xs flex-shrink-0">{r.date}</span>
                </div>
                <StarRow rating={r.rating} />
                <p className="mt-2 text-ink-soft text-sm leading-relaxed">{r.text}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      {surplus > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-4 w-full min-h-[44px] rounded-full border border-line bg-cream text-ink-soft text-sm font-medium hover:border-oxblood-300 hover:text-oxblood-700 hover:bg-oxblood-50 transition-colors [touch-action:manipulation]"
        >
          {expanded ? 'Show fewer reviews' : `Show ${surplus} more review${surplus === 1 ? '' : 's'}`}
        </button>
      )}
    </section>
  )
}
