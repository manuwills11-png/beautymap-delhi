'use client'

import Link from 'next/link'
import { ArrowRight, X, LayoutGrid } from 'lucide-react'
import type { Salon } from '@/lib/supabase'

const MAX = 3
const SESSION_KEY = 'beautymap_compare_salons'

interface Props {
  selectedIds: string[]
  selectedSalons?: Salon[]
  onClear: () => void
}

export function saveCompareSalons(salons: Salon[]) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(salons))
  } catch {}
}

export function loadCompareSalons(): Salon[] | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    sessionStorage.removeItem(SESSION_KEY)
    return JSON.parse(raw) as Salon[]
  } catch {
    return null
  }
}

export default function CompareBar({ selectedIds, selectedSalons, onClear }: Props) {
  const n = selectedIds.length

  function handleNavigate() {
    if (selectedSalons?.length) saveCompareSalons(selectedSalons as Salon[])
  }

  return (
    <div
      className={`fixed bottom-0 inset-x-0 z-50 transition-transform duration-300 ease-out ${
        n > 0 ? 'translate-y-0' : 'translate-y-full'
      }`}
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="px-4 pb-4">
        {/* Inner card animates scale + opacity on entrance for eye-catch */}
        <div
          className={`max-w-lg mx-auto flex items-center gap-3 bg-oxblood-800 text-cream rounded-2xl px-5 py-3.5 transition-all duration-[250ms] ease-out shadow-strong ${
            n > 0 ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          <span className="grid place-items-center w-8 h-8 rounded-lg bg-oxblood-600 flex-shrink-0">
            <LayoutGrid className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-tight">
              {n === 1 ? '1 salon' : `${n} salons`} selected
            </p>
            {n === MAX ? (
              <p className="text-[11px] text-rose-200/80 mt-0.5 leading-tight">
                Max reached — up to {MAX} salons
              </p>
            ) : (
              <p className="text-[11px] text-cream/50 mt-0.5 leading-tight">
                {MAX - n} more slot{MAX - n > 1 ? 's' : ''} available
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClear}
            className="grid place-items-center w-8 h-8 rounded-lg text-cream/50 hover:text-cream hover:bg-oxblood-700 transition-colors flex-shrink-0"
            aria-label="Clear selection"
          >
            <X className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
          </button>
          <Link
            href={n > 0 ? `/compare?ids=${selectedIds.join(',')}` : '#'}
            onClick={handleNavigate}
            className="inline-flex items-center gap-1.5 min-h-[40px] px-4 rounded-xl bg-gold-500 text-ink text-sm font-bold hover:bg-gold-400 active:scale-95 transition-all whitespace-nowrap flex-shrink-0 [touch-action:manipulation]"
          >
            Compare {n > 1 ? `(${n})` : ''}
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  )
}
