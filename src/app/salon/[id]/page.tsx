import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import type { Salon } from '@/lib/supabase'

async function getSalon(id: string): Promise<Salon | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data, error } = await supabase
    .from('salons')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data as Salon
}

const TIER_LABEL: Record<string, string> = {
  premium: '👑 Premium',
  mid: '💎 Mid-Range',
  budget: '💰 Budget',
}

const TIER_STYLE: Record<string, string> = {
  premium: 'bg-amber-100 text-amber-700 border-amber-200',
  mid: 'bg-purple-100 text-purple-700 border-purple-200',
  budget: 'bg-green-100 text-green-700 border-green-200',
}

export default async function SalonDetailPage({ params }: { params: { id: string } }) {
  const salon = await getSalon(params.id)
  if (!salon) notFound()

  const mapsEmbedUrl = `https://maps.google.com/maps?q=${salon.latitude},${salon.longitude}&z=16&output=embed`
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(salon.address)}`
  const tierStyle = TIER_STYLE[salon.price_tier ?? ''] ?? 'bg-gray-100 text-gray-600 border-gray-200'

  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <Link
          href="/results"
          className="inline-flex items-center gap-1 text-purple-600 text-sm font-medium hover:underline mb-8"
        >
          ← Back to Results
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-playfair text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-3">
            {salon.name}
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-amber-400 text-lg">⭐</span>
              <span className="text-lg font-bold text-gray-800">
                {salon.rating?.toFixed(1) ?? '—'}
              </span>
              <span className="text-gray-500 text-sm">
                ({salon.review_count?.toLocaleString()} reviews)
              </span>
            </div>
            {salon.price_tier && (
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${tierStyle}`}>
                {TIER_LABEL[salon.price_tier] ?? salon.price_tier}
              </span>
            )}
            {salon.area && (
              <span className="text-gray-500 text-sm">📍 {salon.area}</span>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="rounded-2xl overflow-hidden border border-purple-100 mb-8 shadow-sm">
          <iframe
            src={mapsEmbedUrl}
            width="100%"
            height="380"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Map – ${salon.name}`}
          />
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Contact */}
          <div className="bg-purple-50 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-gray-800 text-lg">Contact & Location</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              <span className="font-medium">📍</span> {salon.address}
            </p>
            {salon.phone && (
              <a
                href={`tel:${salon.phone}`}
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-purple-600 transition-colors"
              >
                <span>📞</span>
                <span>{salon.phone}</span>
              </a>
            )}
            {salon.website && (
              <a
                href={salon.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-purple-600 hover:underline break-all"
              >
                <span>🌐</span>
                <span>{salon.website.replace(/^https?:\/\//, '')}</span>
              </a>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold rounded-2xl hover:opacity-90 hover:shadow-lg transition-all"
            >
              🗺️ Get Directions
            </a>
            {salon.phone && (
              <a
                href={`tel:${salon.phone}`}
                className="flex items-center justify-center gap-2 py-4 border-2 border-purple-300 text-purple-700 font-semibold rounded-2xl hover:bg-purple-50 transition-colors"
              >
                📞 Call Salon
              </a>
            )}
            {salon.website && (
              <a
                href={salon.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-4 border-2 border-gray-200 text-gray-600 font-semibold rounded-2xl hover:bg-gray-50 transition-colors"
              >
                🌐 Visit Website
              </a>
            )}
          </div>
        </div>

        {/* Photos */}
        {salon.photos && salon.photos.length > 0 && (
          <div className="mb-8">
            <h2 className="font-playfair text-xl font-bold text-gray-900 mb-4">Photos</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {salon.photos.map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={url}
                  alt={`${salon.name} – photo ${i + 1}`}
                  className="w-full h-40 object-cover rounded-xl border border-purple-100"
                />
              ))}
            </div>
          </div>
        )}

        {/* Specialities */}
        {salon.specialities && salon.specialities.length > 0 && (
          <div>
            <h2 className="font-playfair text-xl font-bold text-gray-900 mb-4">Specialities</h2>
            <div className="flex flex-wrap gap-2">
              {salon.specialities.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1.5 bg-pink-50 text-pink-700 border border-pink-200 rounded-full text-sm"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
