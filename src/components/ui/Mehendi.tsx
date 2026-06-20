/**
 * Mehendi — BeautyMap's recurring visual signature.
 *
 * Hand-crafted henna-style linework (paisley curls, radiating petals, dotted
 * trails) drawn as fine strokes in `currentColor`, so callers set the tint and
 * opacity via Tailwind text utilities (e.g. `text-gold-500/15`). All motifs are
 * purely decorative: aria-hidden, focusable={false}, no DOM text.
 *
 * Three members of one family:
 *   • MehendiBloom    — large radial mandala, for hero/header backgrounds
 *   • MehendiFlourish — small bilateral spray, for centered section dividers
 *   • MehendiCorner   — L-shaped vine, for corner accents
 */

type SvgProps = {
  className?: string
  strokeWidth?: number
}

const baseProps = (strokeWidth: number) => ({
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
  role: 'presentation',
})

const dot = { fill: 'currentColor', stroke: 'none' }

/* ──────────────────────────────────────────────────────────
   MehendiBloom — radial mandala (8-fold symmetry)
   One spoke (paisley + petal + dot fan) rotated eight times
   around the centre, wrapped in two dotted henna rings.
   ────────────────────────────────────────────────────────── */
export function MehendiBloom({ className, strokeWidth = 1.25 }: SvgProps) {
  const spoke = (
    <g>
      {/* inner petal rising from the core */}
      <path d="M160 132 C152 118 152 100 160 88 C168 100 168 118 160 132 Z" />
      {/* outer paisley */}
      <path d="M160 80 C148 66 151 44 160 34 C169 44 172 66 160 80 Z" />
      {/* paisley inner curl */}
      <path d="M160 72 C155 64 156 53 160 47" />
      {/* dots */}
      <circle cx="160" cy="84" r="1.6" {...dot} />
      <circle cx="160" cy="54" r="2" {...dot} />
      <circle cx="150" cy="61" r="1.3" {...dot} />
      <circle cx="170" cy="61" r="1.3" {...dot} />
      <circle cx="160" cy="28" r="2.2" {...dot} />
      <circle cx="151" cy="33" r="1.2" {...dot} />
      <circle cx="169" cy="33" r="1.2" {...dot} />
    </g>
  )

  return (
    <svg viewBox="0 0 320 320" className={className} {...baseProps(strokeWidth)}>
      {/* dotted outer rings */}
      <circle cx="160" cy="160" r="150" strokeDasharray="1 9" />
      <circle cx="160" cy="160" r="128" strokeDasharray="1 7" />
      {/* core */}
      <circle cx="160" cy="160" r="30" />
      <circle cx="160" cy="160" r="18" />
      <circle cx="160" cy="160" r="4" {...dot} />
      {/* eight rotated spokes form the petals + paisley ring */}
      {Array.from({ length: 8 }).map((_, i) => (
        <g key={i} transform={`rotate(${i * 45} 160 160)`}>
          {spoke}
        </g>
      ))}
    </svg>
  )
}

/* ──────────────────────────────────────────────────────────
   MehendiFlourish — bilateral divider spray
   A central lotus bud with two symmetric vines, each ending in
   a curled paisley with leaf + dot trail. The right half is
   drawn once and mirrored to guarantee symmetry.
   ────────────────────────────────────────────────────────── */
export function MehendiFlourish({ className, strokeWidth = 1.25 }: SvgProps) {
  const half = (
    <g>
      {/* vine stem */}
      <path d="M150 24 C164 24 170 16 186 18 C198 19 204 26 212 25" />
      {/* leaf on the stem */}
      <path d="M170 16 C167 10 173 7 178 11 C175 16 171 17 170 16 Z" />
      {/* stem dots */}
      <circle cx="156" cy="23.5" r="1.3" {...dot} />
      <circle cx="162" cy="22" r="1.1" {...dot} />
      {/* terminal paisley + inner curl */}
      <path d="M212 25 C207 13 220 6 230 14 C238 20 234 34 222 31 C215 29 213 26 214 23" />
      <path d="M218 24 C218 20 222 18 225 21" />
      <circle cx="224" cy="18" r="1.5" {...dot} />
      {/* tip dot fan */}
      <circle cx="236" cy="11" r="1" {...dot} />
      <circle cx="241" cy="15" r="1" {...dot} />
      <circle cx="239" cy="20" r="1" {...dot} />
    </g>
  )

  return (
    <svg viewBox="0 0 280 48" className={className} {...baseProps(strokeWidth)}>
      {/* central lotus bud on the axis of symmetry */}
      <path d="M140 13 C135 19 135 29 140 35 C145 29 145 19 140 13 Z" />
      <circle cx="140" cy="24" r="2" {...dot} />
      <circle cx="140" cy="9" r="1.4" {...dot} />
      <circle cx="140" cy="39" r="1.4" {...dot} />
      {/* right half + mirrored left half */}
      {half}
      <g transform="matrix(-1 0 0 1 280 0)">{half}</g>
    </svg>
  )
}

/* ──────────────────────────────────────────────────────────
   MehendiCorner — L-shaped corner vine
   Two vines spring from the corner (top + side), each with a
   leaf, dot trail and a curled terminal paisley.
   ────────────────────────────────────────────────────────── */
export function MehendiCorner({ className, strokeWidth = 1.25 }: SvgProps) {
  return (
    <svg viewBox="0 0 180 180" className={className} {...baseProps(strokeWidth)}>
      {/* corner anchor */}
      <circle cx="14" cy="14" r="2.4" {...dot} />

      {/* top vine */}
      <path d="M14 14 C56 16 92 30 120 58" />
      <path d="M70 21 C68 13 78 11 82 18 C77 23 72 24 70 21 Z" />
      <circle cx="46" cy="17" r="1.4" {...dot} />
      <circle cx="58" cy="19" r="1.2" {...dot} />
      {/* top terminal paisley */}
      <path d="M120 58 C134 50 147 60 142 74 C139 84 127 84 122 76" />
      <circle cx="132" cy="66" r="1.5" {...dot} />

      {/* side vine (mirror of the top across the diagonal) */}
      <path d="M14 14 C16 56 30 92 58 120" />
      <path d="M21 70 C13 68 11 78 18 82 C23 77 24 72 21 70 Z" />
      <circle cx="17" cy="46" r="1.4" {...dot} />
      <circle cx="19" cy="58" r="1.2" {...dot} />
      {/* side terminal paisley */}
      <path d="M58 120 C50 134 60 147 74 142 C84 139 84 127 76 122" />
      <circle cx="66" cy="132" r="1.5" {...dot} />

      {/* small diagonal accent dots toward the inner field */}
      <circle cx="92" cy="92" r="1.6" {...dot} />
      <circle cx="104" cy="104" r="1.2" {...dot} />
    </svg>
  )
}
