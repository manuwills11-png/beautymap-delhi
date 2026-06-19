'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { MapPin, Navigation, LocateFixed, MapPinned, ImageOff, ArrowRight } from 'lucide-react'
import { haversineKm } from '@/lib/distance'
import type { Salon } from '@/lib/supabase'
import { StarRating } from '@/components/ui/Tier'

type NearbyRecord = Salon & { distanceKm: number }

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

const AREA_CENTROIDS: Record<string, { lat: number; lng: number }> = {
  'Chandni Chowk': { lat: 28.6505, lng: 77.2303 },
  'Rajouri Garden': { lat: 28.646, lng: 77.1188 },
  'Karol Bagh': { lat: 28.6531, lng: 77.1905 },
  'Shahpur Jat': { lat: 28.5519, lng: 77.2174 },
  'Lajpat Nagar': { lat: 28.5672, lng: 77.2438 },
  'South Extension': { lat: 28.5677, lng: 77.2218 },
  'Pitam Pura': { lat: 28.7038, lng: 77.1315 },
  'Mayur Vihar': { lat: 28.6085, lng: 77.2963 },
  Rohini: { lat: 28.7495, lng: 77.0676 },
}

type GeoStatus = 'idle' | 'requesting' | 'granted' | 'denied'

function formatDist(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m away` : `${km.toFixed(1)} km away`
}

export default function NearbyPage() {
  const [geoStatus, setGeoStatus] = useState<GeoStatus>('idle')
  const [userLat, setUserLat] = useState<number | null>(null)
  const [userLng, setUserLng] = useState<number | null>(null)
  const [selectedArea, setSelectedArea] = useState('')
  const [allSalons, setAllSalons] = useState<Salon[]>([])
  const [nearby, setNearby] = useState<NearbyRecord[]>([])
  const [loadingSalons, setLoadingSalons] = useState(true)

  useEffect(() => {
    const supabase = createClient(
      (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/^﻿/, ''),
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').replace(/^﻿/, '')
    )
    supabase
      .from('salons')
      .select('id, name, area, address, latitude, longitude, rating, review_count, price_tier, photos, phone, website')
      .then(({ data }) => {
        setAllSalons((data ?? []) as Salon[])
        setLoadingSalons(false)
      })
  }, [])

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoStatus('denied')
      return
    }
    setGeoStatus('requesting')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude)
        setUserLng(pos.coords.longitude)
        setGeoStatus('granted')
      },
      () => setGeoStatus('denied'),
      { timeout: 10000, enableHighAccuracy: false }
    )
  }, [])

  useEffect(() => {
    let lat = userLat
    let lng = userLng
    if (lat === null && selectedArea) {
      const c = AREA_CENTROIDS[selectedArea]
      if (c) {
        lat = c.lat
        lng = c.lng
      }
    }
    if (lat === null || lng === null || !allSalons.length) {
      setNearby([])
      return
    }
    const sorted = allSalons
      .filter((s) => s.latitude != null && s.longitude != null)
      .map((s) => ({ ...s, distanceKm: haversineKm(lat!, lng!, s.latitude!, s.longitude!) }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 10)
    setNearby(sorted as NearbyRecord[])
  }, [userLat, userLng, selectedArea, allSalons])

  const effectiveLat = userLat ?? (selectedArea ? AREA_CENTROIDS[selectedArea]?.lat : null)
  const effectiveLng = userLng ?? (selectedArea ? AREA_CENTROIDS[selectedArea]?.lng : null)
  const nearest = nearby[0]
  const mapSrc =
    effectiveLat && effectiveLng && nearest
      ? `https://maps.google.com/maps?q=${nearest.latitude},${nearest.longitude}&z=13&output=embed`
      : null
  const hasLocation = effectiveLat !== null && effectiveLng !== null

  return (
    <div className="min-h-dvh bg-ivory pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-oxblood-700 mb-2">Discover</p>
          <h1 className="font-playfair text-3xl sm:text-4xl font-bold text-ink">Salons near you</h1>
          <p className="text-ink-soft mt-3">Bridal salons sorted by distance from your location.</p>
        </div>

        {/* Geolocation states */}
        {geoStatus === 'requesting' && (
          <div className="bg-cream border border-line rounded-2xl p-8 mb-8 text-center shadow-soft">
            <span className="inline-grid place-items-center w-14 h-14 rounded-2xl bg-oxblood-50 text-oxblood-700 mb-4 animate-pulse">
              <LocateFixed className="w-6 h-6" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <p className="font-medium text-ink mb-1">Allow location access</p>
            <p className="text-sm text-ink-muted">We need your location to find the nearest salons.</p>
          </div>
        )}

        {geoStatus === 'denied' && (
          <div className="bg-cream border border-line rounded-2xl p-6 mb-8 shadow-soft">
            <div className="flex items-center gap-2 mb-3">
              <MapPinned className="w-5 h-5 text-oxblood-700" strokeWidth={1.75} aria-hidden="true" />
              <p className="font-medium text-ink">Location access unavailable</p>
            </div>
            <label htmlFor="area-fallback" className="block text-sm text-ink-soft mb-3">
              Pick your area and we&apos;ll show salons near it:
            </label>
            <select
              id="area-fallback"
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full min-h-[48px] px-4 rounded-xl border border-line bg-cream text-ink focus:border-oxblood-400 outline-none transition-colors"
            >
              <option value="">Select your area…</option>
              {AREAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Map overview */}
        {mapSrc && (
          <div className="rounded-2xl overflow-hidden border border-line shadow-card mb-8">
            <div className="bg-cream px-4 py-3 border-b border-line flex items-center gap-2">
              <MapPin className="w-4 h-4 text-oxblood-700" strokeWidth={2} aria-hidden="true" />
              <span className="text-sm font-medium text-ink">Area overview</span>
              <span className="text-xs text-ink-muted ml-auto">
                {userLat ? 'Using your GPS location' : selectedArea ? `Centred on ${selectedArea}` : ''}
              </span>
            </div>
            <iframe
              src={mapSrc}
              width="100%"
              height="300"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Map of nearby salons"
            />
          </div>
        )}

        {/* Loading / waiting states */}
        {loadingSalons && <div className="text-center py-12 text-ink-muted">Loading salons…</div>}
        {!loadingSalons && !hasLocation && geoStatus !== 'requesting' && geoStatus !== 'denied' && (
          <div className="text-center py-12 text-ink-muted">Waiting for location…</div>
        )}

        {/* Results */}
        {nearby.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-ink-muted font-medium tabular-nums">{nearby.length} nearest salons</p>
            {nearby.map((salon, i) => (
              <NearbyCard
                key={salon.id}
                salon={salon}
                rank={i + 1}
                userLat={effectiveLat!}
                userLng={effectiveLng!}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function NearbyCard({
  salon,
  rank,
  userLat,
  userLng,
}: {
  salon: NearbyRecord
  rank: number
  userLat: number
  userLng: number
}) {
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${salon.latitude},${salon.longitude}`

  return (
    <article className="flex gap-4 bg-cream border border-line rounded-2xl shadow-soft hover:shadow-card hover:border-oxblood-200 transition-all duration-200 overflow-hidden p-3.5">
      <div className="flex-shrink-0 relative">
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-rose-100 grid place-items-center">
          {salon.photos?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={salon.photos[0]} alt={`${salon.name}, ${salon.area ?? 'Delhi'}`} className="w-full h-full object-cover" />
          ) : (
            <ImageOff className="w-6 h-6 text-rose-400" strokeWidth={1.5} aria-hidden="true" />
          )}
        </div>
        <span className="absolute -top-1.5 -left-1.5 grid place-items-center w-6 h-6 rounded-full bg-oxblood-700 text-cream text-xs font-bold shadow-soft tabular-nums">
          {rank}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <Link
          href={`/salon/${salon.id}`}
          className="font-medium text-ink text-sm leading-snug line-clamp-2 hover:text-oxblood-700 transition-colors"
        >
          {salon.name}
        </Link>
        <p className="text-ink-muted text-xs mt-1 inline-flex items-center gap-1">
          <MapPin className="w-3 h-3" strokeWidth={2} aria-hidden="true" />
          {salon.area ?? 'Delhi'}
        </p>
        <div className="mt-2 flex items-center gap-2.5">
          <StarRating rating={salon.rating} className="text-sm" />
          <span className="text-ink-muted">·</span>
          <span className="text-oxblood-700 text-xs font-semibold tabular-nums">{formatDist(salon.distanceKm)}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 flex-shrink-0 justify-center">
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3 rounded-xl bg-oxblood-700 text-cream text-xs font-medium hover:bg-oxblood-800 transition-colors whitespace-nowrap [touch-action:manipulation]"
        >
          <Navigation className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
          Directions
        </a>
        <Link
          href={`/salon/${salon.id}`}
          className="inline-flex items-center justify-center gap-1 min-h-[44px] px-3 rounded-xl border border-line text-oxblood-700 text-xs font-medium hover:bg-oxblood-50 transition-colors whitespace-nowrap"
        >
          Details
          <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}
