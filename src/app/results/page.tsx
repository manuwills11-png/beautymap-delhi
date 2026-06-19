import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import type { Salon } from '@/lib/supabase'

async function getSalons(budget?: string, area?: string): Promise<Salon[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  let query = supabase
    .from('salons')
    .select('id, name, area, rating, review_count, price_tier, address, phone, website, photos')
    .order('rating', { ascending: false })

  if (budget) query = query.eq('price_tier', budget)
  if (area) query = query.ilike('area', `%${area}%`)

  const { data, error } = await query
  if (error) {
    console.error('Supabase error:', error)
    return []
  }
  return (data ?? []) as Salon[]
}

const TIER_BADGE: Record<string, string> = {
  premium: 'bg-amber-100 text-amber-700',
  mid: 'bg-purple-100 text-purple-700',
  budget: 'bg-green-100 text-green-700',
}

const TIER_LABEL: Record<string, string> = {
  premium: '👑 Premium',
  mid: '💎 Mid-Range',
  budget: '💰 Budget',
}

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: { budget?: string; area?: string; date?: string; style?: string }
}) {
  const salons = await getSalons(searchParams.budget, searchParams.area)

  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-playfair text-3xl font-bold text-gray-900 mb-2">
              {salons.length} Salon{salons.length !== 1 ? 's' : ''} Found
            </h1>
            <div className="flex flex-wrap gap-2">
              {searchParams.budget && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  {TIER_LABEL[searchParams.budget] ?? searchParams.budget}
                </span>
              )}
              {searchParams.area && (
                <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-medium">
                  📍 {searchParams.area}
                </span>
              )}
              {searchParams.date && (
                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                  📅 {searchParams.date}
                </span>
              )}
            </div>
          </div>
          <Link href="/intake" className="text-sm text-purple-600 hover:underline whitespace-nowrap mt-1">
            ← Change filters
          </Link>
        </div>

        {salons.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="font-playfair text-2xl font-bold text-gray-800 mb-2">
              No Salons Found
            </h2>
            <p className="text-gray-500 mb-8">Try adjusting your filters</p>
            <Link
              href="/intake"
              className="px-6 py-3 bg-purple-600 text-white rounded-full text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              Try Again
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {salons.map((salon) => (
              <SalonCard key={salon.id} salon={salon} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SalonCard({ salon }: { salon: Salon }) {
  const tierBadge = TIER_BADGE[salon.price_tier ?? ''] ?? 'bg-gray-100 text-gray-600'
  const tierLabel = TIER_LABEL[salon.price_tier ?? ''] ?? salon.price_tier ?? ''

  return (
    <article className="bg-white border border-purple-100 rounded-2xl shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-200 overflow-hidden flex flex-col">
      {/* Photo / placeholder */}
      <div className="h-44 bg-gradient-to-br from-purple-100 via-pink-50 to-amber-50 flex items-center justify-center relative overflow-hidden">
        {salon.photos?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={salon.photos[0]}
            alt={salon.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-5xl opacity-50">💒</span>
        )}
        <div className="absolute top-3 right-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${tierBadge}`}>
            {tierLabel}
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h2 className="font-semibold text-gray-900 text-sm leading-snug mb-1 line-clamp-2">
          {salon.name}
        </h2>
        <p className="text-purple-600 text-xs font-medium mb-3">
          📍 {salon.area ?? 'Delhi'}
        </p>

        <div className="flex items-center gap-1.5 mb-4">
          <span className="text-amber-400 text-sm">⭐</span>
          <span className="text-sm font-bold text-gray-800">
            {salon.rating?.toFixed(1) ?? '—'}
          </span>
          <span className="text-gray-400 text-xs">
            ({salon.review_count?.toLocaleString() ?? 0} reviews)
          </span>
        </div>

        <div className="mt-auto">
          <Link
            href={`/salon/${salon.id}`}
            className="block w-full text-center py-2.5 border-2 border-purple-200 text-purple-600 rounded-xl text-sm font-semibold hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all duration-150"
          >
            View Details →
          </Link>
        </div>
      </div>
    </article>
  )
}
