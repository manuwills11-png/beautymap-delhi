'use client'

import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Sparkles } from 'lucide-react'
import { saveResults } from '@/lib/resultsCache'
import { MehendiBloom } from '@/components/ui/Mehendi'

/* ── Timing (the deliberate, theatrical pace) ── */
const STAGE1_MS = 1000 // "Analysing your vision"
const STAGE2_MIN_MS = 1500 // minimum dwell on "Matching…" before we're allowed to resolve
const STAGE3_MS = 850 // hold on "Found your matches" before the page turns
const SCAN_INTERVAL_MS = 300 // graceful scan loop while we wait for the API
const TILE_COUNT = 9
const WINNERS = 3

type Stage = 1 | 2 | 3

const STATUS: Record<Stage, string> = {
  1: 'Analysing your vision',
  2: 'Matching against 20 verified salons',
  3: 'Found your perfect matches',
}

const SUBTEXT: Record<Stage, string> = {
  1: 'Reading your budget, area, and style',
  2: 'Scoring every salon against your priorities',
  3: 'Curating your personal edit',
}

function getReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function MatchingExperience() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams.toString()

  const budget = searchParams.get('budget')
  const area = searchParams.get('area')
  const style = searchParams.get('style')
  const customNote = searchParams.get('customNote')

  const reduced = useRef(getReducedMotion()).current

  const [stage, setStage] = useState<Stage>(1)
  const [minReached, setMinReached] = useState(false)
  const [dataReady, setDataReady] = useState(false)
  const [thumbs, setThumbs] = useState<string[]>([])
  const [topPhotos, setTopPhotos] = useState<string[]>([])
  const [scan, setScan] = useState(0)

  const dataRef = useRef<{ results: unknown[]; filtered: boolean } | null>(null)
  const navigatedRef = useRef(false)

  // Stash the real payload (if any) and reveal results.
  const finish = useCallback(() => {
    if (navigatedRef.current) return
    navigatedRef.current = true
    if (dataRef.current) saveResults(query, dataRef.current as never)
    router.replace(`/results${query ? `?${query}` : ''}`)
  }, [query, router])

  // Kick off the REAL work: a fast thumbnail prefetch + the recommend call.
  useEffect(() => {
    let active = true
    const supabase = createClient(
      (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/^﻿/, ''),
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').replace(/^﻿/, '')
    )

    // Lightweight query so the scatter grid populates almost instantly.
    supabase
      .from('salons')
      .select('id, photos')
      .limit(14)
      .then(({ data }) => {
        if (!active || !data) return
        const urls = (data as { photos: string[] | null }[])
          .map((s) => s.photos?.[0])
          .filter((u): u is string => Boolean(u))
        setThumbs(urls.slice(0, TILE_COUNT))
      })

    fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ budget, area, style, customNote }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (!active) return
        if (d.error) {
          finish() // let /results surface the error after a normal fetch
          return
        }
        dataRef.current = { results: d.results ?? [], filtered: d.filtered ?? true }
        setTopPhotos(
          ((d.results ?? []) as { photos?: string[] | null }[])
            .slice(0, WINNERS)
            .map((s) => s.photos?.[0])
            .filter((u): u is string => Boolean(u))
        )
        setDataReady(true)
      })
      .catch(() => {
        if (active) finish()
      })

    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ── Full motion timeline ── */
  useEffect(() => {
    if (reduced) return
    const t1 = setTimeout(() => setStage(2), STAGE1_MS)
    const t2 = setTimeout(() => setMinReached(true), STAGE1_MS + STAGE2_MIN_MS)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [reduced])

  // Advance to the reveal only once the data is in AND we've held the moment.
  useEffect(() => {
    if (reduced) return
    if (stage === 2 && dataReady && minReached) setStage(3)
  }, [reduced, stage, dataReady, minReached])

  // Hold the reveal, then turn the page.
  useEffect(() => {
    if (reduced) return
    if (stage === 3) {
      const t = setTimeout(finish, STAGE3_MS)
      return () => clearTimeout(t)
    }
  }, [reduced, stage, finish])

  // Graceful scanning loop during stage 2 (also covers a slow API).
  useEffect(() => {
    if (reduced || stage !== 2) return
    const id = setInterval(() => setScan((s) => (s + 1) % TILE_COUNT), SCAN_INTERVAL_MS)
    return () => clearInterval(id)
  }, [reduced, stage])

  /* ── Reduced-motion timeline: brief, no shuffle, resolve as soon as ready ── */
  useEffect(() => {
    if (!reduced) return
    const t = setTimeout(() => setStage(2), 600)
    return () => clearTimeout(t)
  }, [reduced])

  useEffect(() => {
    if (!reduced) return
    if (dataReady) {
      setStage(3)
      const t = setTimeout(finish, 400)
      return () => clearTimeout(t)
    }
  }, [reduced, dataReady, finish])

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden px-6 bg-gradient-to-b from-oxblood-900 via-oxblood-800 to-ink"
      role="status"
      aria-busy="true"
    >
      {/* ambient washes — match the editorial hero */}
      <div className="pointer-events-none absolute -top-24 -right-28 w-[30rem] h-[30rem] rounded-full bg-rose-600/20 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-28 -left-24 w-[26rem] h-[26rem] rounded-full bg-gold-400/15 blur-3xl" aria-hidden="true" />
      {/* mehendi signature — centred henna mandala */}
      <MehendiBloom className="pointer-events-none absolute left-1/2 top-1/2 w-[42rem] h-[42rem] -translate-x-1/2 -translate-y-1/2 text-gold-400/[0.07]" />

      <div className="relative flex flex-col items-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-gold-300 mb-8">
          <Sparkles className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
          BeautyMap AI
        </div>

        {reduced ? (
          /* ── Simple, calm loading state ── */
          <span className="grid place-items-center w-16 h-16 rounded-2xl bg-oxblood-700/60 text-gold-300 mb-8" aria-hidden="true">
            <Sparkles className="w-7 h-7" strokeWidth={1.75} />
          </span>
        ) : (
          /* ── Theatrical thumbnail cluster ── */
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-[15rem] sm:w-[17rem] mb-9">
            {Array.from({ length: TILE_COUNT }).map((_, i) => {
              const isWinner = i < WINNERS
              const src = stage === 3 && isWinner ? topPhotos[i] ?? thumbs[i] : thumbs[i]

              // Per-stage transform/opacity (transform & opacity only — no layout shift)
              let stateClass = 'opacity-100 scale-100'
              let ring = ''
              if (stage === 2) {
                if (i === scan) {
                  stateClass = 'opacity-100 scale-[1.06]'
                  ring = 'ring-2 ring-gold-400 ring-offset-2 ring-offset-oxblood-900'
                } else {
                  stateClass = 'opacity-50 scale-[0.97]'
                }
              } else if (stage === 3) {
                if (isWinner) {
                  stateClass = 'opacity-100 scale-[1.07]'
                  ring = 'ring-2 ring-gold-400 ring-offset-2 ring-offset-oxblood-900 shadow-gold'
                } else {
                  stateClass = 'opacity-0 scale-[0.85]'
                }
              }

              return (
                <div
                  key={i}
                  className="animate-fade-up"
                  style={{ animationDelay: `${i * 55}ms` }}
                  aria-hidden="true"
                >
                  <div
                    className={`relative aspect-square rounded-xl overflow-hidden bg-oxblood-700/50 transition-all duration-500 ease-out ${stateClass} ${ring}`}
                  >
                    {src && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Status text — serif, crossfaded per stage, announced politely */}
        <div className="h-20 flex flex-col items-center text-center" aria-live="polite">
          <h1 key={`t-${stage}`} className="font-playfair text-2xl sm:text-3xl font-bold text-cream animate-fade-in">
            {STATUS[stage]}
            {stage !== 3 && <span className="text-gold-300">…</span>}
          </h1>
          <p key={`s-${stage}`} className="mt-2 text-sm text-cream/55 animate-fade-in">
            {SUBTEXT[stage]}
          </p>
        </div>

        {/* Stage progress dots */}
        <div className="flex items-center gap-2 mt-6" aria-hidden="true">
          {[1, 2, 3].map((s) => (
            <span
              key={s}
              className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
                s === stage ? 'w-6 bg-gold-400' : s < stage ? 'w-1.5 bg-gold-400/60' : 'w-1.5 bg-cream/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Subtle skip — low visual weight, always available */}
      <button
        type="button"
        onClick={finish}
        className="absolute bottom-8 inset-x-0 mx-auto w-fit min-h-[44px] px-4 text-xs text-cream/45 hover:text-cream/80 underline underline-offset-4 transition-colors [touch-action:manipulation]"
      >
        Skip to results
      </button>
    </div>
  )
}

export default function MatchingPage() {
  return (
    <Suspense fallback={<div className="fixed inset-0 z-[200] bg-oxblood-900" />}>
      <MatchingExperience />
    </Suspense>
  )
}
