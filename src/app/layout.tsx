import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'BeautyMap – Find Your Bridal Salon in Delhi',
  description:
    'AI-powered bridal salon finder for Delhi. Discover the best salons matched to your budget, area, and style.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={playfair.variable}>
      <body className={`${inter.className} bg-white`}>
        <Navbar />
        {children}
      </body>
    </html>
  )
}
