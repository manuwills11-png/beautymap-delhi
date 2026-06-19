'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MapPin, Sparkles } from 'lucide-react'

const NAV_LINKS = [
  { href: '/nearby', label: 'Nearby', Icon: MapPin },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-ivory/85 backdrop-blur-md border-b border-line">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Wordmark */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 rounded-lg -ml-1 pl-1 pr-2 py-1"
          aria-label="BeautyMap home"
        >
          <span className="grid place-items-center w-9 h-9 rounded-lg bg-oxblood-700 text-gold-300 shadow-soft transition-colors group-hover:bg-oxblood-800">
            <Sparkles className="w-[18px] h-[18px]" strokeWidth={2} aria-hidden="true" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-playfair text-xl font-bold text-ink tracking-tight">BeautyMap</span>
            <span className="text-[10px] uppercase tracking-widest text-ink-muted mt-0.5">Delhi Bridal</span>
          </span>
        </Link>

        {/* Right nav */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {pathname !== '/' && (
            <Link
              href="/"
              className="hidden sm:inline-flex items-center min-h-[44px] px-3 text-sm text-ink-soft hover:text-oxblood-700 rounded-lg transition-colors"
            >
              Home
            </Link>
          )}

          {NAV_LINKS.map(({ href, label, Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-oxblood-50 text-oxblood-700'
                    : 'text-ink-soft hover:text-oxblood-700 hover:bg-oxblood-50/60'
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
                {label}
              </Link>
            )
          })}

          <Link
            href="/intake"
            className="inline-flex items-center min-h-[44px] px-5 rounded-full bg-oxblood-700 text-cream text-sm font-medium hover:bg-oxblood-800 shadow-soft transition-colors [touch-action:manipulation]"
          >
            Find Salons
          </Link>
        </div>
      </nav>
    </header>
  )
}
