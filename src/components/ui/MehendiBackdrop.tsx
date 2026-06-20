/**
 * MehendiBackdrop — the all-over henna texture behind every page.
 *
 * A single fixed, full-viewport SVG that tiles a small mehendi *booti*
 * (central paisley + leaf pair + a dot lattice) as a seamless repeat, in
 * champagne gold at low opacity over the ivory base. Reads as fine premium
 * textile/stationery texture without competing with content: it sits at
 * -z-10 behind everything, and opaque content surfaces (cream cards, the
 * salon hero image, the matching overlay) cover it locally for legibility.
 *
 * Purely decorative: aria-hidden, pointer-events-none.
 */
const TILE = 104

export function MehendiBackdrop() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 text-gold-600"
      style={{ opacity: 0.13 }}
      aria-hidden="true"
    >
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="mehendi-booti"
            width={TILE}
            height={TILE}
            patternUnits="userSpaceOnUse"
          >
            <g
              fill="none"
              stroke="currentColor"
              strokeWidth={1}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* central paisley + inner curl */}
              <path d="M52 40 C43 31 44 18 52 11 C60 18 61 31 52 40 Z" />
              <path d="M52 34 C47 29 48 21 52 17" />
              {/* symmetric leaf pair */}
              <path d="M38 66 C33 61 36 53 43 56 C42 62 41 64 38 66 Z" />
              <path d="M66 66 C71 61 68 53 61 56 C62 62 63 64 66 66 Z" />
            </g>
            <g fill="currentColor" stroke="none">
              {/* diamond of dots around the booti centre */}
              <circle cx="52" cy="52" r="1.7" />
              <circle cx="52" cy="74" r="1.5" />
              <circle cx="33" cy="52" r="1.2" />
              <circle cx="71" cy="52" r="1.2" />
              {/* corner + edge dots → a secondary lattice once tiled */}
              <circle cx="0" cy="0" r="2.2" />
              <circle cx="52" cy="0" r="1.2" />
              <circle cx="0" cy="52" r="1.2" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mehendi-booti)" />
      </svg>
    </div>
  )
}
