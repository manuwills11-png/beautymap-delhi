import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import { PageTransition } from '@/components/PageTransition'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'BeautyMap — Editorial Bridal Salon Discovery in Delhi',
  description:
    'AI-curated bridal salon discovery for Delhi. Find the perfect salon matched to your budget, area, and style — sourced from real ratings and reviews.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="font-sans bg-ivory text-ink min-h-dvh">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[1000] focus:bg-oxblood-700 focus:text-cream focus:px-4 focus:py-2 focus:rounded-lg"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main">
          <PageTransition>{children}</PageTransition>
        </main>
      </body>
    </html>
  )
}
