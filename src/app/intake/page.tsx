'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

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

const BUDGETS = [
  { value: 'budget', emoji: '💰', label: 'Budget', desc: 'Affordable options' },
  { value: 'mid', emoji: '💎', label: 'Mid-Range', desc: 'Quality & value' },
  { value: 'premium', emoji: '👑', label: 'Premium', desc: 'Luxury experience' },
]

const STYLES = [
  { value: 'traditional', label: '🪷 Traditional' },
  { value: 'modern', label: '✨ Modern' },
  { value: 'fusion', label: '🌸 Fusion' },
]

export default function IntakePage() {
  const router = useRouter()
  const [budget, setBudget] = useState('')
  const [area, setArea] = useState('')
  const [weddingDate, setWeddingDate] = useState('')
  const [style, setStyle] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (budget) params.set('budget', budget)
    if (area) params.set('area', area)
    if (weddingDate) params.set('date', weddingDate)
    if (style) params.set('style', style)
    router.push(`/results?${params.toString()}`)
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">
        <div className="text-center mb-10">
          <p className="text-purple-500 text-xs font-semibold tracking-widest uppercase mb-3">
            Personalise Your Search
          </p>
          <h1 className="font-playfair text-4xl font-bold text-gray-900 mb-3">
            Tell Us Your Vision
          </h1>
          <p className="text-gray-500">
            Answer a few quick questions and we&apos;ll find your perfect match.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-sm border border-purple-100 p-8 space-y-8"
        >
          {/* Budget */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-4">
              What&apos;s your budget?
            </label>
            <div className="grid grid-cols-3 gap-3">
              {BUDGETS.map(({ value, emoji, label, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setBudget(budget === value ? '' : value)}
                  className={`flex flex-col items-center p-4 rounded-2xl border-2 text-sm font-medium transition-all ${
                    budget === value
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 text-gray-600 hover:border-purple-300'
                  }`}
                >
                  <span className="text-2xl mb-1">{emoji}</span>
                  <span className="font-semibold">{label}</span>
                  <span className="text-xs text-gray-400 mt-0.5 font-normal">{desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Area */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Preferred area{' '}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-700 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none bg-white"
            >
              <option value="">Any area in Delhi</option>
              {AREAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          {/* Wedding Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Wedding date{' '}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="date"
              value={weddingDate}
              onChange={(e) => setWeddingDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-700 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none"
            />
          </div>

          {/* Style */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-4">
              Style preference{' '}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {STYLES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStyle(style === value ? '' : value)}
                  className={`py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    style === value
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 text-gray-600 hover:border-purple-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold rounded-2xl text-lg hover:opacity-90 hover:shadow-lg hover:shadow-purple-200 transition-all duration-200"
          >
            Find My Salons →
          </button>
        </form>
      </div>
    </div>
  )
}
