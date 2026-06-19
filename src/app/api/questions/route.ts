import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Groq from 'groq-sdk'

const FALLBACK = [
  "What's included in your bridal package?",
  "Do you offer a trial session?",
  "What's your cancellation/rescheduling policy?",
]

function parseQuestions(text: string): string[] {
  return text
    .split('\n')
    .map(l => l.replace(/^\d+[\.\)]\s*/, '').trim())
    .filter(l => l.length > 10)
    .slice(0, 5)
}

export async function POST(req: NextRequest) {
  const { salonId, budget, area, style, customNote } = await req.json()
  if (!salonId) return NextResponse.json({ error: 'salonId required' }, { status: 400 })

  const supabase = createClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/^﻿/, ''),
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').replace(/^﻿/, '')
  )

  const { data: salon } = await supabase
    .from('salons')
    .select('id, name, specialities, shop_categories, rating, review_count, suggested_questions')
    .eq('id', salonId)
    .single()

  if (!salon) return NextResponse.json({ questions: FALLBACK, personalized: false })

  const isPersonalized = !!(budget || style || customNote)

  // Return cached result for generic (no-preferences) requests
  if (!isPersonalized && Array.isArray(salon.suggested_questions) && salon.suggested_questions.length >= 3) {
    return NextResponse.json({ questions: salon.suggested_questions, personalized: false })
  }

  try {
    const groq = new Groq({ apiKey: (process.env.GROQ_API_KEY ?? '').replace(/^﻿/, '') })

    const categories = [
      ...(salon.specialities ?? []),
      ...(salon.shop_categories ? [salon.shop_categories] : []),
    ].filter(Boolean).join(', ') || 'general bridal services'

    const prompt = `You are helping a first-time bride prepare to talk to a bridal salon. Generate exactly 5 specific, practical questions she should ask this salon, based on what they specialize in AND her personal preferences (if given).

Salon: ${salon.name}
Specialities/Categories: ${categories}
Rating: ${salon.rating} stars (${salon.review_count} reviews)
Bride's preferences: Budget: ${budget || 'not specified'}, Style: ${style || 'not specified'}
${customNote ? `Her own words: "${customNote}"` : ''}

Make questions specific to BOTH the salon's specialities AND her stated preferences where given. Don't just restate her preferences as questions — use them to sharpen relevance. Return ONLY a numbered list of 5 questions, no preamble.`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 400,
      temperature: 0.5,
    })

    const text = completion.choices[0]?.message?.content ?? ''
    const questions = parseQuestions(text)

    if (questions.length < 3) {
      return NextResponse.json({ questions: FALLBACK, personalized: false })
    }

    // Cache the generic version for future requests (best-effort, ignore write errors)
    if (!isPersonalized) {
      supabase
        .from('salons')
        .update({ suggested_questions: questions })
        .eq('id', salonId)
        .then(() => {}, () => {})
    }

    return NextResponse.json({ questions, personalized: isPersonalized })
  } catch {
    return NextResponse.json({ questions: FALLBACK, personalized: false })
  }
}
