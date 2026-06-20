import { createClient } from '@supabase/supabase-js'
import { ArrowRight, Sparkles, MapPin, MessageCircle, Star } from 'lucide-react'
import { ButtonLink } from '@/components/ui/Button'
import { StarRating } from '@/components/ui/Tier'
import { MehendiBloom, MehendiFlourish } from '@/components/ui/Mehendi'
import Link from 'next/link'

export const revalidate = 3600

type HeroSalon = {
  id: string
  name: string
  area: string | null
  rating: number | null
  review_count: number | null
  photos: string[] | null
}

async function getFeatured(): Promise<HeroSalon[]> {
  const supabase = createClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/^﻿/, ''),
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').replace(/^﻿/, '')
  )
  const { data } = await supabase
    .from('salons')
    .select('id, name, area, rating, review_count, photos')
    .order('rating', { ascending: false })
    .limit(12)
  return ((data ?? []) as HeroSalon[]).filter((s) => s.photos?.[0])
}

const STEPS = [
  {
    Icon: MessageCircle,
    title: 'Share your vision',
    body: 'Tell us your budget, area, and the look you dream of — in your own words.',
  },
  {
    Icon: Sparkles,
    title: 'AI curates your matches',
    body: 'Our engine scores every salon against your priorities and writes you a personal note.',
  },
  {
    Icon: MapPin,
    title: 'Connect directly',
    body: 'Browse, compare, and reach out to salons over WhatsApp in a single tap.',
  },
]

export default async function Home() {
  const featured = await getFeatured()
  const heroImages = featured.slice(0, 3)
  const showcase = featured.slice(0, 6)

  return (
    <div className="bg-ivory">
      {/* ───────────── Hero ───────────── */}
      <section className="relative overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-24">
        {/* soft ambient wash */}
        <div className="pointer-events-none absolute -top-24 -right-32 w-[32rem] h-[32rem] rounded-full bg-rose-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 w-[28rem] h-[28rem] rounded-full bg-gold-200/40 blur-3xl" />
        {/* mehendi signature — radial henna mandala, top-right */}
        <MehendiBloom className="pointer-events-none absolute -top-20 -right-24 w-[30rem] h-[30rem] sm:w-[36rem] sm:h-[36rem] text-gold-500/[0.13]" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Copy — asymmetric, left-weighted */}
          <div className="lg:col-span-6">
            <div
              className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-oxblood-700 mb-6 animate-fade-up"
              style={{ animationDelay: '0ms' }}
            >
              <span className="rule-gold" aria-hidden="true" />
              Delhi&apos;s Curated Bridal Edit
            </div>

            <h1
              className="font-playfair text-[2.75rem] leading-[1.05] sm:text-6xl lg:text-[4.25rem] font-bold text-ink tracking-tight animate-fade-up"
              style={{ animationDelay: '120ms' }}
            >
              The salon that
              <br />
              understands
              <br />
              <span className="text-oxblood-700 italic">your bridal vision</span>
            </h1>

            <p
              className="mt-7 text-lg text-ink-soft leading-relaxed max-w-md animate-fade-up"
              style={{ animationDelay: '260ms' }}
            >
              A high-end edit of Delhi&apos;s finest bridal salons — matched to your budget, your
              neighbourhood, and your style by an AI that actually listens.
            </p>

            <div
              className="mt-9 flex flex-wrap items-center gap-3 animate-fade-up"
              style={{ animationDelay: '400ms' }}
            >
              <ButtonLink href="/intake" size="lg" variant="primary">
                Find your salon
                <ArrowRight className="w-5 h-5" strokeWidth={2} aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="/nearby" size="lg" variant="secondary">
                <MapPin className="w-5 h-5" strokeWidth={2} aria-hidden="true" />
                Explore nearby
              </ButtonLink>
            </div>

            {/* Stats */}
            <dl
              className="mt-12 grid grid-cols-3 gap-6 max-w-md border-t border-line pt-8 animate-fade-up"
              style={{ animationDelay: '540ms' }}
            >
              {[
                { value: '20+', label: 'Curated salons' },
                { value: '4.5', label: 'Avg. rating', star: true },
                { value: '8', label: 'Delhi areas' },
              ].map(({ value, label, star }) => (
                <div key={label}>
                  <dd className="font-playfair text-3xl font-bold text-ink flex items-center gap-1 tabular-nums">
                    {value}
                    {star && (
                      <Star className="w-5 h-5 fill-gold-500 text-gold-500" strokeWidth={1.5} aria-hidden="true" />
                    )}
                  </dd>
                  <dt className="text-sm text-ink-muted mt-1">{label}</dt>
                </div>
              ))}
            </dl>
          </div>

          {/* Editorial image collage — real salon photos */}
          <div className="lg:col-span-6 lg:pl-6">
            {heroImages.length >= 3 ? (
              <div className="grid grid-cols-5 grid-rows-6 gap-3 sm:gap-4 h-[26rem] sm:h-[32rem] animate-fade-in" style={{ animationDelay: '200ms' }}>
                <figure className="col-span-3 row-span-6 relative rounded-2xl overflow-hidden shadow-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={heroImages[0].photos![0]}
                    alt={`${heroImages[0].name}, ${heroImages[0].area ?? 'Delhi'}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <figcaption className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-ink/80 to-transparent">
                    <p className="text-cream font-medium text-sm line-clamp-1">{heroImages[0].name}</p>
                    <div className="mt-1 flex items-center gap-1 text-gold-200 text-xs">
                      <Star className="w-3.5 h-3.5 fill-gold-300 text-gold-300" strokeWidth={1.5} aria-hidden="true" />
                      <span className="tabular-nums">{heroImages[0].rating?.toFixed(1)}</span>
                      <span className="text-cream/70">· {heroImages[0].area}</span>
                    </div>
                  </figcaption>
                </figure>
                <figure className="col-span-2 row-span-3 relative rounded-2xl overflow-hidden shadow-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={heroImages[1].photos![0]}
                    alt={`${heroImages[1].name}, ${heroImages[1].area ?? 'Delhi'}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </figure>
                <figure className="col-span-2 row-span-3 relative rounded-2xl overflow-hidden shadow-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={heroImages[2].photos![0]}
                    alt={`${heroImages[2].name}, ${heroImages[2].area ?? 'Delhi'}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ivory/90 backdrop-blur text-xs font-medium text-oxblood-700 shadow-soft">
                    <Sparkles className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
                    AI curated
                  </span>
                </figure>
              </div>
            ) : (
              <div className="h-[26rem] rounded-2xl bg-rose-100" />
            )}
          </div>
        </div>
      </section>

      {/* ───────────── How it works ───────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-oxblood-700 mb-4 justify-center">
            <span className="rule-gold" aria-hidden="true" />
            How it works
            <span className="rule-gold" aria-hidden="true" />
          </div>
          <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-ink">
            Three steps to your perfect match
          </h2>
        </div>

        <ol className="grid sm:grid-cols-3 gap-6">
          {STEPS.map(({ Icon, title, body }, i) => (
            <li
              key={title}
              className="relative bg-cream rounded-2xl border border-line p-7 shadow-soft hover:shadow-card transition-shadow duration-500 animate-fade-up"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <span className="absolute top-6 right-6 font-playfair text-5xl font-bold text-gold-200 leading-none" aria-hidden="true">
                {i + 1}
              </span>
              <span className="grid place-items-center w-12 h-12 rounded-xl bg-oxblood-50 text-oxblood-700 mb-5">
                <Icon className="w-6 h-6" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <h3 className="font-playfair text-xl font-bold text-ink mb-2">{title}</h3>
              <p className="text-ink-soft leading-relaxed text-[15px]">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* mehendi flourish divider */}
      <div className="flex justify-center pb-4">
        <MehendiFlourish className="w-52 sm:w-64 text-gold-500/40" />
      </div>

      {/* ───────────── Showcase strip ───────────── */}
      {showcase.length >= 6 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
          <div className="flex items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-ink">Top-rated this season</h2>
              <p className="text-ink-soft mt-2">A glimpse of Delhi&apos;s most-loved bridal houses.</p>
            </div>
            <Link
              href="/results"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-oxblood-700 hover:gap-2.5 transition-all min-h-[44px]"
            >
              View all
              <ArrowRight className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {showcase.map((salon, i) => (
              <Link
                key={salon.id}
                href={`/salon/${salon.id}`}
                className="group relative aspect-[4/5] rounded-2xl overflow-hidden shadow-card focus-visible:ring-2 focus-visible:ring-oxblood-600 focus-visible:ring-offset-2 focus-visible:ring-offset-ivory animate-fade-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={salon.photos![0]}
                  alt={`${salon.name}, ${salon.area ?? 'Delhi'}`}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-cream font-medium text-sm line-clamp-1">{salon.name}</p>
                  <div className="mt-1.5 flex items-center gap-1.5 text-gold-200 text-xs">
                    <Star className="w-3.5 h-3.5 fill-gold-300 text-gold-300" strokeWidth={1.5} aria-hidden="true" />
                    <span className="tabular-nums">{salon.rating?.toFixed(1)}</span>
                    <span className="text-cream/70">· {salon.area}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ───────────── CTA banner ───────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-oxblood-800 px-8 py-14 sm:px-14 sm:py-16 text-center">
          <div className="pointer-events-none absolute -top-16 -right-10 w-72 h-72 rounded-full bg-oxblood-700/60 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 w-72 h-72 rounded-full bg-rose-600/30 blur-3xl" />
          <div className="relative animate-fade-up">
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-cream max-w-xl mx-auto leading-tight">
              Your wedding deserves the right hands
            </h2>
            <p className="text-rose-100 mt-4 max-w-md mx-auto">
              Tell us your vision and we&apos;ll find the salons that fit it — beautifully.
            </p>
            <div className="mt-8 flex justify-center">
              <ButtonLink href="/intake" size="lg" variant="gold">
                Start your search
                <ArrowRight className="w-5 h-5" strokeWidth={2} aria-hidden="true" />
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
