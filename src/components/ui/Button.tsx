import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'gold'
type Size = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 font-medium rounded-full transition-all duration-200 ' +
  'focus-visible:ring-2 focus-visible:ring-oxblood-600 focus-visible:ring-offset-2 focus-visible:ring-offset-ivory ' +
  'disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] [touch-action:manipulation] select-none'

const variants: Record<Variant, string> = {
  primary: 'bg-oxblood-700 text-cream hover:bg-oxblood-800 shadow-card hover:shadow-card-hover',
  secondary: 'bg-cream text-oxblood-700 border border-line hover:border-oxblood-300 hover:bg-oxblood-50',
  ghost: 'text-oxblood-700 hover:bg-oxblood-50',
  gold: 'bg-gold-500 text-ink hover:bg-gold-400 shadow-gold',
}

// All sizes meet the 44px min touch target
const sizes: Record<Size, string> = {
  sm: 'min-h-[44px] px-4 text-sm',
  md: 'min-h-[48px] px-6 text-[15px]',
  lg: 'min-h-[56px] px-8 text-base',
}

interface CommonProps {
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: CommonProps & ComponentProps<'button'>) {
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  )
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  href,
  ...props
}: CommonProps & ComponentProps<typeof Link>) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </Link>
  )
}
