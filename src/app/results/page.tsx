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
  Plus,
  Check,
  LayoutGrid,
} from 'lucide-react'
import type { Salon } from '@/lib/supabase'
import { TierBadge, StarRating } from '@/components/ui/Tier'
import { ButtonLink } from '@/components/ui/Button'
import CompareBar from '@/components/CompareBar'
import { loadResults } from '@/lib/resultsCache'
import { MehendiFlourish } from '@/components/ui/Mehendi'

type ScoredSalon = Salon & { score: number; explanation?: string }

const TIER_LABEL: Record<string, string> = {
  premium: 'Premium',
  mid: 'Mid-Range',
  budget: 'Budget',
}

function LoadingState() {
  return (
    <div className="min-h-dvh pt-24 flex items-center justify-center">
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
function FeaturedCard({
  salon,
  rank,
  salonHref,
  compareIds,
  onToggleCompare,
}: {
  salon: ScoredSalon
  rank: number
  salonHref: string
  compareIds: string[]
  onToggleCompare: (id: string) => void
}) {
  const id = String(salon.id)
  const isSelected = compareIds.includes(id)
  const isDisabled = compareIds.length >= 3 && !isSelected

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
        {/* Image-area navigation link — behind interactive badges */}
        <Link href={salonHref} className="absolute inset-0 z-[1]" aria-hidden="true" tabIndex={-1} />
        <span className="absolute top-4 left-4 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-oxblood-700 text-cream text-xs font-medium shadow-soft pointer-events-none">
          <Sparkles className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
          AI Pick · #{rank}
        </span>
        <div className="absolute top-4 right-4 z-10 pointer-events-none">
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

        <div className="mt-auto pt-5 flex gap-2">
          <button
            type="button"
            onClick={() => { if (!isDisabled) onToggleCompare(id) }}
            disabled={isDisabled}
            aria-pressed={isSelected}
            aria-label={isSelected ? `Remove ${salon.name} from comparison` : `Add ${salon.name} to comparison`}
            className={`inline-flex items-center gap-1.5 min-h-[40px] px-3 rounded-full border text-xs font-medium transition-all active:scale-95 [touch-action:manipulation] ${
              isSelected
                ? 'border-oxblood-500 bg-oxblood-50 text-oxblood-700'
                : isDisabled
                ? 'border-line text-ink-muted/40 cursor-not-allowed'
                : 'border-oxblood-200 text-oxblood-600 hover:border-oxblood-400 hover:bg-oxblood-50'
            }`}
          >
            {isSelected ? (
              <Check className="w-3.5 h-3.5" strokeWidth={3} aria-hidden="true" />
            ) : (
              <Plus className="w-3.5 h-3.5" strokeWidth={2.5} aria-hidden="true" />
            )}
            {isSelected ? 'Added' : 'Compare'}
          </button>
          <ButtonLink href={salonHref} variant="secondary" size="sm" className="flex-1">
            View details
            <ArrowRight className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
          </ButtonLink>
        </div>
      </div>
    </article>
  )
}

/* Compact card — standard results */
function StandardCard({
  salon,
  rank,
  salonHref,
  compareIds,
  onToggleCompare,
}: {
  salon: ScoredSalon
  rank: number
  salonHref: string
  compareIds: string[]
  onToggleCompare: (id: string) => void
}) {
  const id = String(salon.id)
  const isSelected = compareIds.includes(id)
  const isDisabled = compareIds.length >= 3 && !isSelected

  return (
    <article
      className="group relative flex flex-col bg-cream rounded-2xl border border-line overflow-hidden shadow-soft hover:shadow-card hover:border-oxblood-200 transition-all duration-300 animate-fade-up"
      style={{ animationDelay: `${rank * 40}ms` }}
    >
      {/* Ghost link for full-card navigation — sits below interactive elements */}
      <Link
        href={salonHref}
        className="absolute inset-0 z-[1] rounded-2xl focus-visible:ring-2 focus-visible:ring-oxblood-600 focus-visible:ring-inset"
        aria-label={`View ${salon.name} details`}
      />

      <div className="relative aspect-[4/3] overflow-hidden">
        <Photo
          salon={salon}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Compare toggle — top-right, 44px tap target, Plus/Check */}
        <button
          type="button"
          onClick={() => { if (!isDisabled) onToggleCompare(id) }}
          disabled={isDisabled}
          aria-pressed={isSelected}
          aria-label={isSelected ? `Remove ${salon.name} from comparison` : `Add ${salon.name} to comparison`}
          className={`absolute top-2 right-2 z-10 grid place-items-center w-11 h-11 rounded-2xl shadow-soft active:scale-90 transition-all duration-150 [touch-action:manipulation] ${
            isSelected
              ? 'bg-oxblood-700 text-cream'
              : isDisabled
              ? 'bg-cream/70 text-ink-muted/30 cursor-not-allowed border border-white/30'
              : 'bg-cream/90 text-oxblood-600 border border-white/50 hover:bg-cream hover:text-oxblood-700'
          }`}
        >
          {isSelected ? (
            <Check className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
          ) : (
            <Plus className="w-5 h-5" strokeWidth={2} aria-hidden="true" />
          )}
        </button>
        <div className="absolute bottom-2 left-2 z-10">
          <TierBadge tier={salon.price_tier} className="bg-ivory/90 backdrop-blur" />
        </div>
      </div>
      <div className="relative z-0 flex flex-col flex-1 p-4 pointer-events-none">
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
    </article>
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
  const [compareIds, setCompareIds] = useState<string[]>([])

  function toggleCompare(id: string) {
    setCompareIds(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : prev.length < 3 ? [...prev, id] : prev
    )
  }

  useEffect(() => {
    setLoading(true)
    setShowAll(false)

    // Fast path: consume the payload computed during the /matching sequence
    // so we don't re-run the API. Direct visits fall through to a fetch.
    const cached = loadResults(searchParams.toString())
    if (cached) {
      setResults(cached.results as ScoredSalon[])
      setIsFiltered(cached.filtered)
      setLoading(false)
      return
    }

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
  }, [budget, area, style, customNote, searchParams])

  if (loading) return <LoadingState />

  if (error) {
    return (
      <div className="min-h-dvh pt-24 flex items-center justify-center">
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
    <div className={`min-h-dvh pt-24 ${compareIds.length > 0 ? 'pb-32' : 'pb-20'}`}>
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

        {/* Compare feature banner — permanent, non-dismissible */}
        {results.length > 0 && (
          <div className="flex items-center gap-3 bg-oxblood-50/60 border border-oxblood-100 rounded-2xl px-5 py-3.5 mb-7">
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-oxblood-100 flex-shrink-0">
              <Plus className="w-4 h-4 text-oxblood-700" strokeWidth={2.5} aria-hidden="true" />
            </span>
            <p className="text-sm text-ink-soft">
              <strong className="font-semibold text-ink">Compare salons side by side</strong>
              {' — tap the '}
              <strong className="font-semibold text-oxblood-700">+</strong>
              {' on any card to add it, then compare up to 3.'}
            </p>
          </div>
        )}

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
                    <FeaturedCard key={salon.id} salon={salon} rank={i + 1} salonHref={buildSalonHref(salon.id)} compareIds={compareIds} onToggleCompare={toggleCompare} />
                  ))}
                </div>
              </section>
            )}

            {/* Standard results */}
            {standard.length > 0 && (
              <section>
                {isFiltered && featured.length > 0 && (
                  <div className="flex justify-center mb-8">
                    <MehendiFlourish className="w-48 sm:w-56 text-gold-500/40" />
                  </div>
                )}
                {isFiltered && (
                  <h2 className="font-playfair text-lg font-semibold text-ink-soft mb-5">More options</h2>
                )}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                  {standard.map((salon, i) => (
                    <StandardCard key={salon.id} salon={salon} rank={i} salonHref={buildSalonHref(salon.id)} compareIds={compareIds} onToggleCompare={toggleCompare} />
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

      <CompareBar
        selectedIds={compareIds}
        selectedSalons={results.filter(s => compareIds.includes(String(s.id)))}
        onClear={() => setCompareIds([])}
      />
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
