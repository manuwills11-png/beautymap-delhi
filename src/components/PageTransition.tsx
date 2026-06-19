'use client'

import { usePathname } from 'next/navigation'

/**
 * Wraps page content in a keyed div so React remounts it on navigation,
 * triggering animate-page-enter on every route change.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div key={pathname} className="animate-page-enter">
      {children}
    </div>
  )
}
