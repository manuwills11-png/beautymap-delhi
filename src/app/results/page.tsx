'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  SearchX,
  AlertTriangle,
  ImageOff,
  MapPin,
  Quote,
} from 'lucide-react'
import type { Salon } from '@/lib/supabase'
import { TierBadge, StarRating } from '@/components/ui/Tier'
import { ButtonLink } from '@/components/ui/Button'

type ScoredSalon = Salon & { score: number; explanation?: string }

const TIER_LABEL: Record<string, string> = {
  premium: 'Premium',
  mid: 'Mid-Range',
  budget: 'Budget',
}

function LoadingState() {
  return (
    <div className="min-h-dvh bg-ivory pt-24 flex items-center justify-center">
      <div className="text-center px-6">
        <span className="inline-grid place-items-center w-16 h-16 rounded-2xl bg-oxblood-50 text-oxblood-700 mb-5 animate-fade-in">
          <Sparkles className="w-7 h-7 animate-pulse" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <p className="font-playfair text-2xl font-bold text-ink mb-2">Curating your matches…</p>
        <p className="text-ink-muted text-sm">Our AI is scoring every salon for you</p>
      </div>
    </div>
  )
}

function Photo({ salon, className }: { salon: ScoredSalon; className?: string }) {
  if (salon.photos?.[0]) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={salon.photos[0]}
        alt={`${salon.name}, ${salon.area ?? 'Delhi'}`}
        className={className}
      />
    )
  }
  return (
    <div className={`grid place-items-center bg-rose-100 ${className}`}>
      <ImageOff className="w-8 h-8 text-rose-400" strokeWidth={1.5} aria-hidden="true" />
    </div>
  )
}

/* Large featured card — for AI top picks */
function FeaturedCard({ salon, rank, salonHref }: { salon: ScoredSalon; rank: number; salonHref: string }) {
  return (
    <article
      className="group relative flex flex-col bg-cream rounded-3xl border border-line overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-up"
      style={{ animationDelay: `${rank * 60}ms` }}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Photo
          salon={salon}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/30 to-transparent" />
        <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-oxblood-700 text-cream text-xs font-medium shadow-soft">
          <Sparkles className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
          AI Pick · #{rank}
        </span>
        <div className="absolute top-4 right-4">
          <TierBadge tier={salon.price_tier} className="bg-ivory/90 backdrop-blur" />
        </div>
      </div>

      <div className="flex flex-col flex-1 p-6">
        <h3 className="font-playfair text-xl font-bold text-ink leading-snug line-clamp-2">{salon.name}</h3>
        <div className="mt-2 flex items-center gap-3 text-sm">
          <StarRating rating={salon.rating} reviewCount={salon.review_count} />
          <span className="inline-flex items-center gap-1 text-ink-muted">
            <MapPin className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
            {salon.area ?? 'Delhi'}
          </span>
        </div>

        {salon.explanation && (
          <div className="mt-4 relative rounded-2xl bg-oxblood-50/70 border border-oxblood-100 p-4">
            <Quote className="absolute -top-2 -left-1 w-5 h-5 text-gold-400 fill-gold-200" aria-hidden="true" />
            <p className="text-[13px] leading-relaxed text-ink-soft pl-2">{salon.explanation}</p>
          </div>
        )}

        <div className="mt-auto pt-5">
          <ButtonLink href={salonHref} variant="secondary" size="sm" className="w-full">
            View details
            <ArrowRight className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
          </ButtonLink>
        </div>
      </div>
    </article>
  )
}

/* Compact card — standard results */
function StandardCard({ salon, rank, salonHref }: { salon: ScoredSalon; rank: number; salonHref: string }) {
  return (
    <Link
      href={salonHref}
      className="group flex flex-col bg-cream rounded-2xl border border-line overflow-hidden shadow-soft hover:shadow-card hover:border-oxblood-200 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-oxblood-600 focus-visible:ring-offset-2 focus-visible:ring-offset-ivory animate-fade-up"
      style={{ animationDelay: `${rank * 40}ms` }}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Photo
          salon={salon}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-3 right-3">
          <TierBadge tier={salon.price_tier} className="bg-ivory/90 backdrop-blur" />
        </div>
      </div>
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-medium text-ink text-sm leading-snug line-clamp-2 group-hover:text-oxblood-700 transition-colors">
          {salon.name}
        </h3>
        <p className="text-ink-muted text-xs mt-1 inline-flex items-center gap-1">
          <MapPin className="w-3 h-3" strokeWidth={2} aria-hidden="true" />
          {salon.area ?? 'Delhi'}
        </p>
        <div className="mt-3 pt-3 border-t border-line">
          <StarRating rating={salon.rating} reviewCount={salon.review_count} className="text-sm" />
        </div>
      </div>
    </Link>
  )
}

function ResultsContent() {
  const searchParams = useSearchParams()
  const budget = searchParams.get('budget')
  const area = searchParams.get('area')
  const style = searchParams.get('style')
  const date = searchParams.get('date')
  const customNote = searchParams.get('customNote')

  const [results, setResults] = useState<ScoredSalon[]>([])
  const [isFiltered, setIsFiltered] = useState(true)
  const [showAll, setShowAll] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setShowAll(false)
    fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ budget, area, style, customNote }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error)
        else {
          setResults(d.results ?? [])
          setIsFiltered(d.filtered ?? true)
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [budget, area, style, customNote])

  if (loading) return <LoadingState />

  if (error) {
    return (
      <div className="min-h-dvh bg-ivory pt-24 flex items-center justify-center">
        <div className="text-center px-6">
          <span className="inline-grid place-items-center w-16 h-16 rounded-2xl bg-oxblood-50 text-oxblood-700 mb-5">
            <AlertTriangle className="w-7 h-7" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <p className="font-playfair text-2xl font-bold text-ink mb-2">Something went wrong</p>
          <p className="text-ink-muted text-sm mb-7">We couldn&apos;t load your matches. Please try again.</p>
          <ButtonLink href="/intake" variant="primary">Back to search</ButtonLink>
        </div>
      </div>
    )
  }

  const INITIAL_SHOW = 8
  const visible = showAll ? results : results.slice(0, INITIAL_SHOW)
  const featured = isFiltered ? visible.slice(0, 3) : []
  const standard = isFiltered ? visible.slice(3) : visible
  const hasMore = !showAll && results.length > INITIAL_SHOW

  function buildSalonHref(salonId: string | number): string {
    const p = new URLSearchParams()
    if (budget) p.set('budget', budget)
    if (area) p.set('area', area)
    if (style) p.set('style', style)
    if (customNote) p.set('note', customNote)
    const qs = p.toString()
    return `/salon/${salonId}${qs ? '?' + qs : ''}`
  }

  const activeFilters = [
    budget && TIER_LABEL[budget],
    area,
    date,
    style && style.charAt(0).toUpperCase() + style.slice(1),
  ].filter(Boolean) as string[]

  return (
    <div className="min-h-dvh bg-ivory pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-oxblood-700 mb-2">
              {isFiltered ? 'Your curated edit' : 'The full directory'}
            </p>
            <h1 className="font-playfair text-3xl sm:text-4xl font-bold text-ink tabular-nums">
              {results.length} {results.length === 1 ? 'salon' : 'salons'}
            </h1>
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {activeFilters.map((f) => (
                  <span
                    key={f}
                    className="px-3 py-1 rounded-full bg-cream border border-line text-ink-soft text-xs font-medium"
                  >
                    {f}
                  </span>
                ))}
              </div>
            )}
          </div>
          <Link
            href="/intake"
            className="inline-flex items-center gap-1.5 min-h-[44px] text-sm font-medium text-oxblood-700 hover:gap-2.5 transition-all"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
            Change filters
          </Link>
        </div>

        {/* Nudge banner */}
        {!isFiltered && (
          <div className="flex items-start gap-3 bg-oxblood-50/70 border border-oxblood-100 rounded-2xl px-5 py-4 mb-8">
            <Sparkles className="w-5 h-5 text-oxblood-700 flex-shrink-0 mt-0.5" strokeWidth={1.75} aria-hidden="true" />
            <p className="text-sm text-ink-soft">
              Showing every verified salon in Delhi.{' '}
              <Link href="/intake" className="text-oxblood-700 font-medium underline underline-offset-2">
                Tell us your preferences
              </Link>{' '}
              for personalised AI matches.
            </p>
          </div>
        )}

        {results.length === 0 ? (
          <div className="text-center py-24">
            <span className="inline-grid place-items-center w-16 h-16 rounded-2xl bg-oxblood-50 text-oxblood-700 mb-5">
              <SearchX className="w-7 h-7" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <h2 className="font-playfair text-2xl font-bold text-ink mb-2">No salons found</h2>
            <p className="text-ink-muted mb-7">Try adjusting your filters to see more options.</p>
            <ButtonLink href="/intake" variant="primary">Try again</ButtonLink>
          </div>
        ) : (
          <>
            {/* Featured AI picks — larger bento cards */}
            {featured.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center gap-2 mb-5">
                  <Sparkles className="w-5 h-5 text-oxblood-700" strokeWidth={1.75} aria-hidden="true" />
                  <h2 className="font-playfair text-xl font-bold text-ink">AI Top Picks for You</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
                  {featured.map((salon, i) => (
                    <FeaturedCard key={salon.id} salon={salon} rank={i + 1} salonHref={buildSalonHref(salon.id)} />
                  ))}
                </div>
              </section>
            )}

            {/* Standard results */}
            {standard.length > 0 && (
              <section>
                {isFiltered && (
                  <h2 className="font-playfair text-lg font-semibold text-ink-soft mb-5">More options</h2>
                )}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                  {standard.map((salon, i) => (
                    <StandardCard key={salon.id} salon={salon} rank={i} salonHref={buildSalonHref(salon.id)} />
                  ))}
                </div>
              </section>
            )}

            {hasMore && (
              <div className="text-center mt-12">
                <button
                  onClick={() => setShowAll(true)}
                  className="inline-flex items-center gap-2 min-h-[48px] px-7 rounded-full border border-line bg-cream text-oxblood-700 font-medium hover:border-oxblood-300 hover:bg-oxblood-50 transition-all shadow-soft [touch-action:manipulation]"
                >
                  Show {results.length - INITIAL_SHOW} more
                  <ArrowRight className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ResultsContent />
    </Suspense>
  )
}
