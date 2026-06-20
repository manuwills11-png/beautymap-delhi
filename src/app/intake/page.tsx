'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import {
  Wallet,
  Gem,
  Crown,
  Flower2,
  Sparkles,
  Layers,
  ChevronDown,
  ArrowRight,
  Check,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const AREAS = [
  'Chandni Chowk',
  'Rajouri Garden',
  'Karol Bagh',
  'Shahpur Jat',
  'Lajpat Nagar',
  'South Extension',
  'Pitam Pura',
  'Mayur Vihar',
  'Rohini',
]

const BUDGETS: { value: string; Icon: LucideIcon; label: string; desc: string }[] = [
  { value: 'budget', Icon: Wallet, label: 'Budget', desc: 'Thoughtful value' },
  { value: 'mid', Icon: Gem, label: 'Mid-Range', desc: 'Quality & balance' },
  { value: 'premium', Icon: Crown, label: 'Premium', desc: 'Luxury, top artists' },
]

const STYLES: { value: string; Icon: LucideIcon; label: string; desc: string }[] = [
  { value: 'traditional', Icon: Flower2, label: 'Traditional', desc: 'Classic & rich' },
  { value: 'modern', Icon: Sparkles, label: 'Modern', desc: 'Contemporary glam' },
  { value: 'fusion', Icon: Layers, label: 'Fusion', desc: 'Best of both' },
]

// Minimal salon shape for the live "match so far" count (no full objects fetched)
type SalonMeta = {
  id: string
  area: string | null
  price_tier: string | null
  review_count: number | null
}

// Mirrors the recommend API's tier inference so the live count feels accurate
function inferTier(reviewCount: number | null): string {
  const n = reviewCount ?? 0
  if (n > 1000) return 'premium'
  if (n >= 400) return 'mid'
  return 'budget'
}

// Typewriter placeholder examples for the vision field
const VISION_PREFIX = 'e.g. '
const VISION_PHRASES = [
  'traditional but not too heavy…',
  'my mom wants red and gold…',
  'really care about good hair styling…',
  'open to fusion looks too…',
]
const VISION_STATIC = VISION_PREFIX + VISION_PHRASES[0]
const TYPE_MS = 50 // per character while typing
const DELETE_MS = 25 // per character while deleting
const HOLD_MS = 1500 // pause once a phrase finishes
const BETWEEN_MS = 400 // pause between phrases / before first

export default function IntakePage() {
  const router = useRouter()
  const [budget, setBudget] = useState('')
  const [area, setArea] = useState('')
  const [weddingDate, setWeddingDate] = useState('')
  const [style, setStyle] = useState('')
  const [customNote, setCustomNote] = useState('')
  const [visionOpen, setVisionOpen] = useState(false)

  // Typewriter placeholder cycling — stops permanently once engaged.
  // Starts on the full first phrase so SSR/first paint match (no hydration jump).
  const [visionPlaceholder, setVisionPlaceholder] = useState(VISION_STATIC)
  const [visionEngaged, setVisionEngaged] = useState(false)

  // Live "salons match so far" count — one lightweight fetch, filtered client-side.
  const [salonsMeta, setSalonsMeta] = useState<SalonMeta[]>([])

  useEffect(() => {
    const supabase = createClient(
      (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/^﻿/, ''),
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').replace(/^﻿/, '')
    )
    supabase
      .from('salons')
      .select('id, area, price_tier, review_count')
      .then(({ data }) => {
        if (data) setSalonsMeta(data as SalonMeta[])
      })
  }, [])

  const matchCount =
    salonsMeta.length === 0
      ? null
      : salonsMeta.filter((s) => {
          if (area && !(s.area?.toLowerCase().includes(area.toLowerCase()))) return false
          if (budget && (s.price_tier ?? inferTier(s.review_count)) !== budget) return false
          return true
        }).length

  useEffect(() => {
    if (visionEngaged) {
      setVisionPlaceholder(VISION_STATIC)
      return
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisionPlaceholder(VISION_STATIC)
      return
    }

    let phraseIdx = 0
    let charIdx = 0
    let deleting = false
    let timer: ReturnType<typeof setTimeout>

    const tick = () => {
      const phrase = VISION_PHRASES[phraseIdx]
      if (!deleting) {
        charIdx++
        setVisionPlaceholder(VISION_PREFIX + phrase.slice(0, charIdx))
        if (charIdx === phrase.length) {
          deleting = true
          timer = setTimeout(tick, HOLD_MS)
          return
        }
        timer = setTimeout(tick, TYPE_MS)
      } else {
        charIdx--
        setVisionPlaceholder(VISION_PREFIX + phrase.slice(0, charIdx))
        if (charIdx === 0) {
          deleting = false
          phraseIdx = (phraseIdx + 1) % VISION_PHRASES.length
          timer = setTimeout(tick, BETWEEN_MS)
          return
        }
        timer = setTimeout(tick, DELETE_MS)
      }
    }

    timer = setTimeout(tick, BETWEEN_MS)
    return () => clearTimeout(timer)
  }, [visionEngaged])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (budget) params.set('budget', budget)
    if (area) params.set('area', area)
    if (weddingDate) params.set('date', weddingDate)
    if (style) params.set('style', style)
    if (customNote.trim()) params.set('customNote', customNote.trim())
    router.push(`/matching?${params.toString()}`)
  }

  return (
    <div className="relative overflow-hidden min-h-dvh pt-24 pb-16">
      {/* soft ambient atmosphere — sits over the site-wide mehendi texture */}
      <div className="pointer-events-none absolute -top-20 -right-24 w-[26rem] h-[26rem] rounded-full bg-rose-200/35 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-[24rem] h-[24rem] rounded-full bg-gold-200/30 blur-3xl" aria-hidden="true" />

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-oxblood-700 mb-4 justify-center">
            <span className="rule-gold" aria-hidden="true" />
            Personalise your search
            <span className="rule-gold" aria-hidden="true" />
          </div>
          <h1 className="font-playfair text-4xl sm:text-5xl font-bold text-ink tracking-tight">
            Tell us your vision
          </h1>
          <p className="text-ink-soft mt-4 max-w-md mx-auto">
            A few quick questions and our AI will curate the salons made for your big day.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-cream rounded-3xl shadow-medium border border-line p-6 sm:p-9 space-y-9"
        >
          {/* Budget */}
          <fieldset>
            <legend className="text-sm font-semibold text-ink mb-4">What&apos;s your budget?</legend>
            <div className="grid grid-cols-3 gap-3">
              {BUDGETS.map(({ value, Icon, label, desc }) => {
                const selected = budget === value
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setBudget(selected ? '' : value)}
                    className={`relative flex flex-col items-center text-center min-h-[44px] p-4 rounded-2xl border-2 transition-all duration-[250ms] active:scale-[0.97] [touch-action:manipulation] ${
                      selected
                        ? 'border-gold-400 bg-oxblood-50 shadow-medium scale-[1.02]'
                        : 'border-line bg-cream hover:border-oxblood-300 hover:shadow-soft'
                    }`}
                  >
                    {selected && (
                      <span className="absolute top-2 right-2 grid place-items-center w-5 h-5 rounded-full bg-oxblood-700 text-cream">
                        <Check className="w-3 h-3" strokeWidth={3} aria-hidden="true" />
                      </span>
                    )}
                    <Icon
                      className={`w-6 h-6 mb-2 ${selected ? 'text-oxblood-700' : 'text-ink-muted'}`}
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                    <span className={`font-semibold text-sm ${selected ? 'text-oxblood-700' : 'text-ink'}`}>
                      {label}
                    </span>
                    <span className="text-xs text-ink-muted mt-0.5">{desc}</span>
                  </button>
                )
              })}
            </div>
          </fieldset>

          {/* Area */}
          <div>
            <label htmlFor="area" className="block text-sm font-semibold text-ink mb-3">
              Preferred area <span className="text-ink-muted font-normal">(optional)</span>
            </label>
            <select
              id="area"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full min-h-[48px] px-4 rounded-xl border border-line bg-cream text-ink focus:border-oxblood-400 outline-none transition-colors"
            >
              <option value="">Any area in Delhi</option>
              {AREAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          {/* Wedding date */}
          <div>
            <label htmlFor="date" className="block text-sm font-semibold text-ink mb-3">
              Wedding date <span className="text-ink-muted font-normal">(optional)</span>
            </label>
            <input
              id="date"
              type="date"
              value={weddingDate}
              onChange={(e) => setWeddingDate(e.target.value)}
              className="w-full min-h-[48px] px-4 rounded-xl border border-line bg-cream text-ink focus:border-oxblood-400 outline-none transition-colors"
            />
          </div>

          {/* Style */}
          <fieldset>
            <legend className="text-sm font-semibold text-ink mb-4">
              Style preference <span className="text-ink-muted font-normal">(optional)</span>
            </legend>
            <div className="grid grid-cols-3 gap-3">
              {STYLES.map(({ value, Icon, label, desc }) => {
                const selected = style === value
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setStyle(selected ? '' : value)}
                    className={`flex flex-col items-center text-center gap-1.5 min-h-[44px] px-2 py-4 rounded-2xl border-2 transition-all duration-[250ms] active:scale-[0.97] [touch-action:manipulation] ${
                      selected
                        ? 'border-gold-400 bg-oxblood-50 text-oxblood-700 shadow-medium scale-[1.02]'
                        : 'border-line bg-cream text-ink hover:border-oxblood-300 hover:shadow-soft'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${selected ? 'text-oxblood-700' : 'text-ink-muted'}`}
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                    <span className="font-medium text-sm">{label}</span>
                    <span className={`text-[11px] leading-tight ${selected ? 'text-oxblood-600' : 'text-ink-muted'}`}>
                      {desc}
                    </span>
                  </button>
                )
              })}
            </div>
          </fieldset>

          {/* Vision note — feature card */}
          <div
            className={`rounded-2xl border transition-colors duration-200 overflow-hidden ${
              visionOpen ? 'border-oxblood-300 bg-oxblood-50/60' : 'border-line bg-oxblood-50/30 hover:border-oxblood-200'
            }`}
          >
            <button
              type="button"
              onClick={() => setVisionOpen((o) => !o)}
              aria-expanded={visionOpen}
              className="flex items-center gap-3 w-full px-5 py-4 text-left min-h-[44px] [touch-action:manipulation]"
            >
              <span className="grid place-items-center w-10 h-10 rounded-xl bg-oxblood-700 text-gold-300 flex-shrink-0">
                <Sparkles className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold text-ink">Tell us your vision</span>
                <span className="block text-xs text-oxblood-700 mt-0.5">
                  Our AI personalises picks to your exact words
                </span>
              </span>
              <span className="flex-shrink-0 hidden sm:inline-flex px-2.5 py-1 rounded-full bg-cream border border-line text-ink-muted text-xs font-medium">
                optional
              </span>
              <ChevronDown
                className={`flex-shrink-0 w-5 h-5 text-oxblood-500 transition-transform duration-300 ${visionOpen ? 'rotate-180' : ''}`}
                strokeWidth={2}
                aria-hidden="true"
              />
            </button>

            <div className={`grid transition-all duration-300 ease-out ${visionOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
              <div className="overflow-hidden">
                <div className="px-5 pb-5">
                  <label htmlFor="vision" className="block text-xs text-ink-muted mb-3 leading-relaxed">
                    Share anything — colour mood, must-haves, concerns, what your family wants. The more
                    you share, the more tailored your matches.
                  </label>
                  <textarea
                    id="vision"
                    rows={3}
                    value={customNote}
                    onFocus={() => setVisionEngaged(true)}
                    onChange={(e) => {
                      setVisionEngaged(true)
                      setCustomNote(e.target.value)
                    }}
                    placeholder={visionPlaceholder}
                    className="w-full px-4 py-3 rounded-xl border border-line bg-cream text-ink placeholder:text-ink-muted/70 focus:border-oxblood-400 outline-none text-sm resize-none transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Live match count — updates client-side as filters change */}
          <div className="flex items-center gap-3 rounded-2xl border border-gold-200 bg-gold-100/40 px-4 py-3">
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-gold-200/70 text-oxblood-800 flex-shrink-0">
              <Sparkles className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <p className="text-sm text-ink-soft" aria-live="polite">
              {matchCount === null ? (
                <>Curating Delhi&apos;s finest bridal salons…</>
              ) : (
                <>
                  <strong className="font-semibold text-ink tabular-nums">{matchCount}</strong>{' '}
                  {matchCount === 1 ? 'salon matches' : 'salons match'} your picks so far
                </>
              )}
            </p>
          </div>

          <Button
            type="submit"
            size="lg"
            variant="primary"
            className="w-full shadow-medium hover:shadow-strong"
          >
            Find my salons
            <ArrowRight className="w-5 h-5" strokeWidth={2} aria-hidden="true" />
          </Button>
        </form>
      </div>
    </div>
  )
}
