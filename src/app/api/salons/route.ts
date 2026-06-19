import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/^﻿/, '')
    const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').replace(/^﻿/, '')

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Missing env vars', url: !!supabaseUrl, key: !!supabaseKey },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

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
    if (error) return NextResponse.json({ error: error.message, code: error.code }, { status: 500 })

    return NextResponse.json(data)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
