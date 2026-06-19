'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl">🌸</span>
          <span className="font-playfair text-xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
            BeautyMap
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {pathname !== '/' && (
            <Link href="/" className="text-gray-500 text-sm hover:text-purple-600 transition-colors">
              Home
            </Link>
          )}
          <Link
            href="/intake"
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-sm font-medium rounded-full hover:opacity-90 transition-opacity shadow-sm"
          >
            Find Salons
          </Link>
        </div>
      </div>
    </nav>
  )
}
