'use client'

import Link from 'next/link'
import { ArrowRight, X, LayoutGrid } from 'lucide-react'

const MAX = 3

interface Props {
  selectedIds: string[]
  onClear: () => void
}

export default function CompareBar({ selectedIds, onClear }: Props) {
  const n = selectedIds.length

  return (
    <div
      className={`fixed bottom-0 inset-x-0 z-50 transition-transform duration-300 ease-out ${
        n > 0 ? 'translate-y-0' : 'translate-y-full'
      }`}
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="px-4 pb-4">
        <div className="max-w-lg mx-auto flex items-center gap-3 bg-ink/95 backdrop-blur-sm text-cream rounded-2xl px-5 py-3.5 shadow-[0_8px_32px_rgba(34,22,25,0.45)]">
          <span className="grid place-items-center w-8 h-8 rounded-lg bg-oxblood-700 flex-shrink-0">
            <LayoutGrid className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-tight">
              {n === 1 ? '1 salon' : `${n} salons`} selected
            </p>
            {n === MAX && (
              <p className="text-[11px] text-gold-300 mt-0.5 leading-tight">
                Maximum — up to {MAX} salons
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClear}
            className="grid place-items-center w-8 h-8 rounded-lg text-cream/60 hover:text-cream hover:bg-cream/10 transition-colors flex-shrink-0"
            aria-label="Clear selection"
          >
            <X className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
          </button>
          <Link
            href={n > 0 ? `/compare?ids=${selectedIds.join(',')}` : '#'}
            className="inline-flex items-center gap-1.5 min-h-[40px] px-4 rounded-xl bg-gold-500 text-ink text-sm font-semibold hover:bg-gold-400 transition-colors whitespace-nowrap flex-shrink-0 [touch-action:manipulation]"
          >
            Compare {n > 1 ? `(${n})` : ''}
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  )
}
