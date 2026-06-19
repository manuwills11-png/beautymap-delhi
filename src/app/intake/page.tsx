'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
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
  { value: 'premium', Icon: Crown, label: 'Premium', desc: 'Luxury experience' },
]

const STYLES: { value: string; Icon: LucideIcon; label: string }[] = [
  { value: 'traditional', Icon: Flower2, label: 'Traditional' },
  { value: 'modern', Icon: Sparkles, label: 'Modern' },
  { value: 'fusion', Icon: Layers, label: 'Fusion' },
]

export default function IntakePage() {
  const router = useRouter()
  const [budget, setBudget] = useState('')
  const [area, setArea] = useState('')
  const [weddingDate, setWeddingDate] = useState('')
  const [style, setStyle] = useState('')
  const [customNote, setCustomNote] = useState('')
  const [visionOpen, setVisionOpen] = useState(false)

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
    <div className="min-h-dvh pt-24 pb-16 bg-ivory">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
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
          className="bg-cream rounded-3xl shadow-card border border-line p-6 sm:p-9 space-y-9"
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
                        ? 'border-oxblood-600 bg-oxblood-50 shadow-soft scale-[1.02]'
                        : 'border-line bg-cream hover:border-oxblood-300'
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
              {STYLES.map(({ value, Icon, label }) => {
                const selected = style === value
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setStyle(selected ? '' : value)}
                    className={`flex flex-col items-center gap-2 min-h-[44px] py-4 rounded-2xl border-2 transition-all duration-[250ms] active:scale-[0.97] [touch-action:manipulation] ${
                      selected
                        ? 'border-oxblood-600 bg-oxblood-50 text-oxblood-700 shadow-soft scale-[1.02]'
                        : 'border-line bg-cream text-ink hover:border-oxblood-300'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${selected ? 'text-oxblood-700' : 'text-ink-muted'}`}
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                    <span className="font-medium text-sm">{label}</span>
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
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="e.g. I want something traditional but not too heavy, my mom wants red and gold, and good hair styling matters most to me…"
                    className="w-full px-4 py-3 rounded-xl border border-line bg-cream text-ink placeholder:text-ink-muted/70 focus:border-oxblood-400 outline-none text-sm resize-none transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          <Button type="submit" size="lg" variant="primary" className="w-full">
            Find my salons
            <ArrowRight className="w-5 h-5" strokeWidth={2} aria-hidden="true" />
          </Button>
        </form>
      </div>
    </div>
  )
}
