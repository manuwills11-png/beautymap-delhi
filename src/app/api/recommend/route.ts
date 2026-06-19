import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Groq from 'groq-sdk'
import type { Salon } from '@/lib/supabase'

type ScoredSalon = Salon & { score: number; explanation?: string }

function inferPriceTier(reviewCount: number): 'budget' | 'mid' | 'premium' {
  if (reviewCount > 1000) return 'premium'
  if (reviewCount >= 400) return 'mid'
  return 'budget'
}

function styleScore(categories: string, style: string): number {
  const c = categories.toLowerCase()
  if (style === 'traditional') return (c.includes('saree') || c.includes('traditional') || c.includes('embroidery')) ? 1 : 0
  if (style === 'modern') return (c.includes('boutique') || c.includes('fashion designer') || c.includes('western')) ? 1 : 0
  if (style === 'fusion') return (c.includes('boutique') || c.includes('designer')) ? 1 : 0
  return 0
}

function tagScore(salon: Salon & { shop_categories: string | null }, tags: string[]): number {
  if (!tags.length) return 0
  const haystack = [
    salon.shop_categories ?? '',
    (salon.specialities ?? []).join(' '),
    salon.name,
  ].join(' ').toLowerCase()
  return tags.filter((t) => haystack.includes(t)).length
}

function scoreSalon(
  salon: Salon & { shop_categories: string | null },
  budget: string | null,
  area: string | null,
  style: string | null,
  tags: string[] = []
): number {
  let score = 0
  if (area) {
    const a = area.toLowerCase()
    if (salon.area?.toLowerCase().includes(a) || salon.address?.toLowerCase().includes(a)) score += 3
  }
  if ((salon.rating ?? 0) >= 4.5) score += 2
  if ((salon.review_count ?? 0) > 500) score += 1
  const tier = salon.price_tier ?? inferPriceTier(salon.review_count ?? 0)
  if (budget && tier === budget) score += 2
  if (style && salon.shop_categories) score += styleScore(salon.shop_categories, style)
  score += tagScore(salon, tags)
  return score
}

async function extractTags(groq: Groq, customNote: string): Promise<string[]> {
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: `Extract 3-5 short priority keywords/tags from this bride's description of what she wants, focused on style, priorities, and concerns. Return ONLY a comma-separated list, no explanation. Text: '${customNote}'`,
        },
      ],
      max_tokens: 50,
      temperature: 0.3,
    })
    const raw = completion.choices[0]?.message?.content?.trim() ?? ''
    return raw.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
  } catch {
    return []
  }
}

async function generateExplanation(
  groq: Groq,
  salon: Salon & { shop_categories: string | null },
  budget: string | null,
  area: string | null,
  style: string | null,
  customNote: string | null
): Promise<string> {
  const fallback = `A great ${budget ?? 'quality'}-friendly option in ${salon.area ?? 'Delhi'} with a ${salon.rating}-star rating from ${salon.review_count ?? 0} happy brides.`
  try {
    const customPart = customNote
      ? ` Additionally, the bride specifically said: '${customNote}'. Reference this directly in your explanation where relevant, in her own spirit.`
      : ''
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: `Write a brief, warm 1-2 sentence explanation for why this salon matches a bride looking for ${budget ?? 'quality'} budget options${area ? ` in ${area}` : ''}${style ? `, ${style} style` : ''}. Salon: ${salon.name}, located in ${salon.area ?? 'Delhi'}, rated ${salon.rating} stars from ${salon.review_count} reviews, known for: ${salon.shop_categories ?? 'bridal services'}.${customPart} No markdown, no preamble, just the explanation.`,
        },
      ],
      max_tokens: 120,
      temperature: 0.7,
    })
    return completion.choices[0]?.message?.content?.trim() ?? fallback
  } catch {
    return fallback
  }
}

function hasFilters(budget: string | null, area: string | null, style: string | null, customNote: string | null): boolean {
  return !!(
    budget?.trim() ||
    (area?.trim() && area.trim().toLowerCase() !== 'any') ||
    style?.trim() ||
    customNote?.trim()
  )
}

export async function POST(request: NextRequest) {
  try {
    const { budget, area, style, customNote } = await request.json()

    const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/^﻿/, '')
    const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').replace(/^﻿/, '')
    const groqKey = (process.env.GROQ_API_KEY ?? '').replace(/^﻿/, '')

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Missing Supabase config' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const { data, error } = await supabase
      .from('salons')
      .select('id, name, area, address, rating, review_count, price_tier, phone, website, photos, shop_categories, specialities')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const salons = (data ?? []) as (Salon & { shop_categories: string | null })[]

    const filtered = hasFilters(budget, area, style, customNote)

    // No filters — skip scoring, return all sorted by rating, no AI calls
    if (!filtered) {
      const all = [...salons].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      return NextResponse.json({ results: all, filtered: false })
    }

    // Filters present — score all, sort, generate explanations for top 3
    let tags: string[] = []
    if (groqKey && customNote?.trim()) {
      const groq = new Groq({ apiKey: groqKey, timeout: 5000 })
      tags = await extractTags(groq, customNote.trim())
    }

    const scored: ScoredSalon[] = salons
      .map((s) => ({ ...s, score: scoreSalon(s, budget, area, style, tags) }))
      .sort((a, b) => b.score - a.score || (b.rating ?? 0) - (a.rating ?? 0))

    if (groqKey) {
      const groq = new Groq({ apiKey: groqKey, timeout: 5000 })
      for (let i = 0; i < Math.min(3, scored.length); i++) {
        scored[i].explanation = await generateExplanation(
          groq,
          scored[i] as Salon & { shop_categories: string | null },
          budget,
          area,
          style,
          customNote ?? null
        )
        if (i < 2) await new Promise((r) => setTimeout(r, 200))
      }
    }

    return NextResponse.json({ results: scored, filtered: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
