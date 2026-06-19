'use client'

import { useEffect, useRef, useState } from 'react'

// Ease-out quint — graceful arrival, editorial pacing
const CURVE = 'cubic-bezier(0.22, 1, 0.36, 1)'

interface RevealProps {
  children: React.ReactNode
  /** Stagger offset in ms */
  delay?: number
  /** Animation duration in ms — default 520 for editorial pace */
  duration?: number
  className?: string
}

/**
 * Scroll-triggered fade-up reveal. Elements arrive gently as they enter the
 * viewport. Respects prefers-reduced-motion (instantly visible if set).
 * SSR-safe: server renders content fully visible; JS hydration then manages
 * the reveal animation for below-fold elements.
 */
export function Reveal({ children, delay = 0, duration = 520, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  // 'idle' = server / pre-hydration (no animation styles — content visible)
  // 'hidden' = ready to animate in (opacity 0, drifted down)
  // 'shown' = fully visible after intersection fires
  const [phase, setPhase] = useState<'idle' | 'hidden' | 'shown'>('idle')

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Skip animation entirely for users who prefer reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPhase('shown')
      return
    }

    // Briefly hide element, then observe for scroll entrance
    setPhase('hidden')

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPhase('shown')
          io.unobserve(el)
        }
      },
      // Slight rootMargin so elements start animating just before they arrive
      { threshold: 0.07, rootMargin: '0px 0px -32px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={
        phase === 'idle'
          ? undefined // Server render: no inline styles, content fully visible
          : {
              opacity: phase === 'hidden' ? 0 : 1,
              transform: phase === 'hidden' ? 'translateY(18px)' : 'none',
              // Only apply transition when going hidden → shown (not on initial hide)
              transition:
                phase === 'shown'
                  ? `opacity ${duration}ms ${CURVE} ${delay}ms, transform ${duration}ms ${CURVE} ${delay}ms`
                  : undefined,
            }
      }
    >
      {children}
    </div>
  )
}
