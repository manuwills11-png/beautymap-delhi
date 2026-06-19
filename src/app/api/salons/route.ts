import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { searchParams } = new URL(request.url)
  const budget = searchParams.get('budget')
  const area = searchParams.get('area')

  let query = supabase
    .from('salons')
    .select('id, name, area, rating, review_count, price_tier, address, phone, website, photos')
    .order('rating', { ascending: false })

  if (budget) query = query.eq('price_tier', budget)
  if (area) query = query.ilike('area', `%${area}%`)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}
