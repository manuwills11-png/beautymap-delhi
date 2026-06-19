import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export type Salon = {
  id: string
  name: string
  area: string | null
  address: string
  latitude: number
  longitude: number
  phone: string | null
  website: string | null
  rating: number | null
  review_count: number | null
  price_tier: 'budget' | 'mid' | 'premium' | null
  specialities: string[] | null
  photos: string[] | null
  description: string | null
  bridal_packages: Record<string, unknown> | null
  created_at: string
}
