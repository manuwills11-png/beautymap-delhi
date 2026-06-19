import { Crown, Gem, Wallet, Star } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type Tier = 'premium' | 'mid' | 'budget' | string | null

const TIER_META: Record<string, { label: string; Icon: LucideIcon; className: string }> = {
  premium: { label: 'Premium', Icon: Crown, className: 'bg-gold-100 text-gold-600 border-gold-300' },
  mid: { label: 'Mid-Range', Icon: Gem, className: 'bg-rose-100 text-rose-600 border-rose-300' },
  budget: { label: 'Budget', Icon: Wallet, className: 'bg-oxblood-50 text-oxblood-700 border-oxblood-200' },
}

export function TierBadge({ tier, className = '' }: { tier: Tier; className?: string }) {
  const meta = tier ? TIER_META[tier] : undefined
  if (!meta) return null
  const { label, Icon } = meta
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${meta.className} ${className}`}
    >
      <Icon className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
      {label}
    </span>
  )
}

export function StarRating({
  rating,
  reviewCount,
  className = '',
}: {
  rating: number | null
  reviewCount?: number | null
  className?: string
}) {
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <Star className="w-4 h-4 fill-gold-500 text-gold-500" strokeWidth={1.5} aria-hidden="true" />
      <span className="font-semibold text-ink tabular-nums">{rating?.toFixed(1) ?? '—'}</span>
      {reviewCount != null && (
        <span className="text-ink-muted text-sm tabular-nums">
          ({reviewCount.toLocaleString('en-IN')})
        </span>
      )}
      <span className="sr-only">
        {rating?.toFixed(1)} out of 5 stars{reviewCount != null ? ` from ${reviewCount} reviews` : ''}
      </span>
    </div>
  )
}
