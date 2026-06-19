'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, ImageOff, Star } from 'lucide-react'
import type { Salon } from '@/lib/supabase'
import { TierBadge, StarRating } from '@/components/ui/Tier'
import { ButtonLink } from '@/components/ui/Button'

/* ── Small "Best" pill badge ── */
function BestBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold-100 text-gold-700 text-[11px] font-semibold">
      <Star className="w-2.5 h-2.5 fill-gold-500 text-gold-500" strokeWidth={0} aria-hidden="true" />
      Best
    </span>
  )
}

function LabelCell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center px-4 py-4 border-b border-r border-line bg-ivory/50">
      <span className="text-xs font-semibold uppercase tracking-widest text-ink-muted">{children}</span>
    </div>
  )
}

function ValueCell({
  children,
  last = false,
  highlight = false,
}: {
  children: React.ReactNode
  last?: boolean
  highlight?: boolean
}) {
  return (
    <div
      className={`flex flex-col gap-1.5 px-4 py-4 border-b ${last ? '' : 'border-r'} border-line ${
        highlight ? 'bg-gold-50/60' : ''
      }`}
    >
      {children}
    </div>
  )
}

function LoadingState() {
  return (
    <div className="min-h-dvh bg-ivory pt-24 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-oxblood-50 animate-pulse mx-auto mb-4" />
        <p className="text-ink-muted">Loading comparison…</p>
      </div>
    </div>
  )
}

function CompareContent() {
  const searchParams = useSearchParams()
  const idsParam = searchParams.get('ids') ?? ''
  const ids = idsParam.split(',').filter(Boolean).slice(0, 3)

  const [salons, setSalons] = useState<Salon[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ids.length) {
      setLoading(false)
      return
    }
    const supabase = createClient(
      (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/^﻿/, ''),
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').replace(/^﻿/, '')
    )
    supabase
      .from('salons')
      .select('*')
      .in('id', ids)
      .then(
        ({ data }) => {
          const map = new Map((data ?? []).map((s) => [String(s.id), s as Salon]))
          setSalons(ids.map((id) => map.get(id)).filter((s): s is Salon => !!s))
          setLoading(false)
        },
        () => setLoading(false)
      )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsParam])

  if (loading) return <LoadingState />

  const maxRating = salons.length ? Math.max(...salons.map((s) => s.rating ?? 0)) : 0
  const maxReviews = salons.length ? Math.max(...salons.map((s) => s.review_count ?? 0)) : 0
  const ratingWins = (r: number | null) =>
    r === maxRating && salons.filter((s) => s.rating === maxRating).length === 1
  const reviewWins = (r: number | null) =>
    r === maxReviews && salons.filter((s) => s.review_count === maxReviews).length === 1

  const colCount = salons.length || 1
  const minW = 120 + colCount * 210

  return (
    <div className="min-h-dvh bg-ivory pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/results"
            className="inline-flex items-center gap-1.5 min-h-[44px] text-sm font-medium text-oxblood-700 hover:gap-2.5 transition-all mb-3"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
            Back to results
          </Link>
          <p className="text-xs font-medium uppercase tracking-widest text-oxblood-700 mb-2">Side by side</p>
          <h1 className="font-playfair text-3xl sm:text-4xl font-bold text-ink">Compare Salons</h1>
        </div>

        {/* Not enough salons */}
        {salons.length < 2 && (
          <div className="bg-cream border border-line rounded-2xl p-8 text-center shadow-soft mb-8">
            <p className="font-medium text-ink mb-1">
              {salons.length === 0
                ? 'No salons selected.'
                : 'Add one more salon to compare.'}
            </p>
            <p className="text-sm text-ink-muted mb-6">
              Go to results and tap the compare toggle on 2–3 salon cards.
            </p>
            <ButtonLink href="/results" variant="primary">Browse salons</ButtonLink>
          </div>
        )}

        {/* Comparison grid */}
        {salons.length >= 1 && (
          <>
            <div className="overflow-x-auto -mx-4 sm:mx-0 pb-2">
              <div
                className="bg-cream border border-line rounded-2xl shadow-card overflow-hidden mx-4 sm:mx-0"
                style={{
                  display: 'grid',
                  gridTemplateColumns: `120px repeat(${colCount}, 1fr)`,
                  minWidth: `${minW}px`,
                }}
              >
                {/* ── Photo ── */}
                <LabelCell>Photo</LabelCell>
                {salons.map((s, i) => (
                  <ValueCell key={s.id} last={i === salons.length - 1}>
                    <div className="aspect-[4/3] rounded-xl overflow-hidden bg-rose-100">
                      {s.photos?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={s.photos[0]} alt={s.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full grid place-items-center">
                          <ImageOff className="w-8 h-8 text-rose-300" strokeWidth={1.5} aria-hidden="true" />
                        </div>
                      )}
                    </div>
                  </ValueCell>
                ))}

                {/* ── Name ── */}
                <LabelCell>Salon</LabelCell>
                {salons.map((s, i) => (
                  <ValueCell key={s.id} last={i === salons.length - 1}>
                    <span className="font-playfair font-bold text-ink text-base leading-snug">{s.name}</span>
                  </ValueCell>
                ))}

                {/* ── Area ── */}
                <LabelCell>Area</LabelCell>
                {salons.map((s, i) => (
                  <ValueCell key={s.id} last={i === salons.length - 1}>
                    <span className="text-sm text-ink-soft">{s.area ?? '—'}</span>
                  </ValueCell>
                ))}

                {/* ── Rating ── */}
                <LabelCell>Rating</LabelCell>
                {salons.map((s, i) => (
                  <ValueCell key={s.id} last={i === salons.length - 1} highlight={ratingWins(s.rating)}>
                    <StarRating rating={s.rating} reviewCount={s.review_count} />
                    {ratingWins(s.rating) && <BestBadge />}
                  </ValueCell>
                ))}

                {/* ── Reviews ── */}
                <LabelCell>Reviews</LabelCell>
                {salons.map((s, i) => (
                  <ValueCell key={s.id} last={i === salons.length - 1} highlight={reviewWins(s.review_count)}>
                    <span className="text-sm text-ink-soft tabular-nums">
                      {s.review_count != null ? `${s.review_count.toLocaleString()} reviews` : '—'}
                    </span>
                    {reviewWins(s.review_count) && <BestBadge />}
                  </ValueCell>
                ))}

                {/* ── Price Tier ── */}
                <LabelCell>Price</LabelCell>
                {salons.map((s, i) => (
                  <ValueCell key={s.id} last={i === salons.length - 1}>
                    <TierBadge tier={s.price_tier} />
                  </ValueCell>
                ))}

                {/* ── Specialities ── */}
                <LabelCell>Specialities</LabelCell>
                {salons.map((s, i) => (
                  <ValueCell key={s.id} last={i === salons.length - 1}>
                    {s.specialities?.length ? (
                      <div className="flex flex-wrap gap-1.5">
                        {s.specialities.map((sp) => (
                          <span
                            key={sp}
                            className="px-2.5 py-1 rounded-full bg-ivory border border-line text-ink-muted text-[11px]"
                          >
                            {sp}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-ink-muted">—</span>
                    )}
                  </ValueCell>
                ))}

                {/* ── CTA row (no border-b) ── */}
                <div className="px-4 py-4 border-r border-line bg-ivory/40" />
                {salons.map((s, i) => (
                  <div
                    key={s.id}
                    className={`px-4 py-4 ${i < salons.length - 1 ? 'border-r' : ''} border-line bg-ivory/40`}
                  >
                    <Link
                      href={`/salon/${s.id}`}
                      className="inline-flex items-center justify-center gap-1.5 w-full min-h-[44px] px-4 rounded-full bg-oxblood-700 text-cream text-sm font-medium hover:bg-oxblood-800 transition-colors [touch-action:manipulation]"
                    >
                      View details
                      <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {salons.length >= 2 && (
              <p className="text-xs text-center text-ink-muted mt-3 sm:hidden">
                Scroll sideways to compare all salons ›
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function ComparePage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <CompareContent />
    </Suspense>
  )
}
