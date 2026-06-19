import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import {
  ArrowLeft,
  MapPin,
  Phone,
  Globe,
  Navigation,
  ImageOff,
} from 'lucide-react'
import type { Salon } from '@/lib/supabase'
import { TierBadge, StarRating } from '@/components/ui/Tier'
import AvailabilityForm from '@/components/AvailabilityForm'
import { cleanIndianPhone } from '@/lib/phone'
import QuestionsSection from '@/components/QuestionsSection'

async function getSalon(id: string): Promise<Salon | null> {
  const supabase = createClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/^﻿/, ''),
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').replace(/^﻿/, '')
  )
  const { data, error } = await supabase.from('salons').select('*').eq('id', id).single()
  if (error || !data) return null
  return data as Salon
}

export default async function SalonDetailPage({ params }: { params: { id: string } }) {
  const salon = await getSalon(params.id)
  if (!salon) notFound()

  const mapsEmbedUrl = `https://maps.google.com/maps?q=${salon.latitude},${salon.longitude}&z=16&output=embed`
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(salon.address)}`
  const hero = salon.photos?.[0]
  const gallery = (salon.photos ?? []).slice(1, 5)
  const waPhone = cleanIndianPhone(salon.phone)
  const waMessage = `Hi! I found you on BeautyMap and I'm interested in your bridal services. Could you share more details?`
  const waUrl = waPhone ? `https://wa.me/${waPhone}?text=${encodeURIComponent(waMessage)}` : null

  return (
    <div className="min-h-dvh bg-ivory pb-20">
      {/* ── Magazine hero ── */}
      <header className="relative h-[58vh] min-h-[26rem] w-full overflow-hidden">
        {hero ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={hero} alt={`${salon.name}, ${salon.area ?? 'Delhi'}`} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-rose-100">
            <ImageOff className="w-12 h-12 text-rose-400" strokeWidth={1.5} aria-hidden="true" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/30 to-ink/30" />

        {/* Back link */}
        <div className="absolute top-20 inset-x-0">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <Link
              href="/results"
              className="inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-full bg-ivory/90 backdrop-blur text-ink text-sm font-medium hover:bg-ivory transition-colors shadow-soft"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
              Back to results
            </Link>
          </div>
        </div>

        {/* Title block */}
        <div className="absolute inset-x-0 bottom-0">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-8 sm:pb-10">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <TierBadge tier={salon.price_tier} className="bg-ivory/95 backdrop-blur" />
              {salon.area && (
                <span className="inline-flex items-center gap-1.5 text-cream/90 text-sm">
                  <MapPin className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
                  {salon.area}
                </span>
              )}
            </div>
            <h1 className="font-playfair text-3xl sm:text-5xl font-bold text-cream leading-[1.08] max-w-3xl">
              {salon.name}
            </h1>
            <div className="mt-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ivory/95 backdrop-blur shadow-soft">
                <StarRating rating={salon.rating} reviewCount={salon.review_count} />
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-10 grid lg:grid-cols-3 gap-8 lg:gap-10">
        {/* Left column — editorial content */}
        <div className="lg:col-span-2 space-y-10">
          {salon.description && (
            <section>
              <SectionLabel>About</SectionLabel>
              <p className="text-ink-soft leading-relaxed text-[17px] max-w-prose">{salon.description}</p>
            </section>
          )}

          {salon.specialities && salon.specialities.length > 0 && (
            <section>
              <SectionLabel>Specialities</SectionLabel>
              <div className="flex flex-wrap gap-2">
                {salon.specialities.map((s) => (
                  <span
                    key={s}
                    className="px-3.5 py-1.5 rounded-full bg-cream border border-line text-ink-soft text-sm"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </section>
          )}

          {gallery.length > 0 && (
            <section>
              <SectionLabel>Gallery</SectionLabel>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {gallery.map((url, i) => (
                  <figure key={i} className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-soft">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`${salon.name} — photo ${i + 2}`} className="absolute inset-0 w-full h-full object-cover" />
                  </figure>
                ))}
              </div>
            </section>
          )}

          {/* Map */}
          <section>
            <SectionLabel>Location</SectionLabel>
            <div className="rounded-2xl overflow-hidden border border-line shadow-soft">
              <iframe
                src={mapsEmbedUrl}
                width="100%"
                height="340"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Map showing the location of ${salon.name}`}
              />
            </div>
            <p className="text-ink-muted text-sm mt-3 leading-relaxed">{salon.address}</p>
          </section>

          {/* AI-generated questions checklist */}
          <Suspense
            fallback={
              <div className="rounded-2xl bg-cream border border-line shadow-soft p-6 space-y-3">
                <div className="h-3 w-48 bg-line/60 rounded animate-pulse" />
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-5 h-5 rounded bg-line/50 animate-pulse flex-shrink-0 mt-0.5" />
                    <div className="h-4 bg-line/40 rounded animate-pulse flex-1" />
                  </div>
                ))}
              </div>
            }
          >
            <QuestionsSection salonId={String(salon.id)} />
          </Suspense>
        </div>

        {/* Right column — sticky action panel */}
        <aside className="lg:col-span-1">
          <div className="lg:sticky lg:top-24 space-y-4">
            <div className="bg-cream rounded-2xl border border-line shadow-card p-6 space-y-3">
              <h2 className="font-playfair text-lg font-bold text-ink mb-1">Get in touch</h2>

              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full min-h-[48px] rounded-full bg-oxblood-700 text-cream font-medium hover:bg-oxblood-800 shadow-soft transition-colors [touch-action:manipulation]"
              >
                <Navigation className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
                Get directions
              </a>

              {waPhone && (
                <a
                  href={waUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full min-h-[48px] rounded-full bg-[#25D366] text-white font-medium hover:opacity-90 transition-opacity shadow-soft [touch-action:manipulation]"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  Contact on WhatsApp
                </a>
              )}

              {waPhone && (
                <a
                  href={`tel:+${waPhone}`}
                  className="flex items-center justify-center gap-2 w-full min-h-[48px] rounded-full border border-line bg-cream text-oxblood-700 font-medium hover:border-oxblood-300 hover:bg-oxblood-50 transition-colors [touch-action:manipulation]"
                >
                  <Phone className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
                  Call salon
                </a>
              )}

              {salon.website && (
                <a
                  href={salon.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full min-h-[48px] rounded-full border border-line bg-cream text-ink-soft font-medium hover:border-oxblood-300 hover:text-oxblood-700 transition-colors [touch-action:manipulation]"
                >
                  <Globe className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
                  Visit website
                </a>
              )}
            </div>

            <AvailabilityForm salonName={salon.name} phone={salon.phone} />
          </div>
        </aside>
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="rule-gold" aria-hidden="true" />
      <h2 className="text-xs font-semibold uppercase tracking-widest text-oxblood-700">{children}</h2>
    </div>
  )
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}
