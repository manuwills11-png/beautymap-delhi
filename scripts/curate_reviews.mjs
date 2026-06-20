// One-off: curate up to 6 display reviews per salon from all_reviews.csv
// Writes UPDATE SQL to scripts/_reviews_update.sql + prints a summary.
// Run: node scripts/curate_reviews.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const env = {}
for (const line of readFileSync('.env.local', 'utf8').replace(/^﻿/, '').split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m) env[m[1]] = m[2].trim()
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

// ── CSV parser (quotes, commas, newlines in fields) ──
function parseCSV(text) {
  const rows = []
  let row = [], field = '', inQuotes = false
  text = text.replace(/^﻿/, '')
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++ } else inQuotes = false }
      else field += c
    } else {
      if (c === '"') inQuotes = true
      else if (c === ',') { row.push(field); field = '' }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = '' }
      else if (c === '\r') {}
      else field += c
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row) }
  return rows
}

const rows = parseCSV(readFileSync('all_reviews.csv', 'utf8'))
const header = rows.shift().map((h) => h.trim())
const idx = Object.fromEntries(header.map((h, i) => [h, i]))

// ── group full review objects by salon ──
const groups = new Map()
for (const r of rows) {
  if (!r.length || r.every((c) => c === '')) continue
  const name = (r[idx.salon_name] ?? '').trim()
  const rating = parseFloat((r[idx.rating] ?? '').trim())
  if (!name || !Number.isFinite(rating)) continue
  const review = {
    author: (r[idx.reviewer] ?? '').trim(),
    rating,
    text: (r[idx.review_text] ?? '').trim(),
    dateRaw: (r[idx.date] ?? '').trim(),
  }
  if (!groups.has(name)) groups.set(name, [])
  groups.get(name).push(review)
}

// ── helpers ──
const firstName = (full) => {
  const t = (full || '').trim().split(/\s+/)[0] || 'Guest'
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()
}
const fmtDate = (raw) => {
  const d = new Date(raw)
  if (isNaN(d)) return raw
  return d.toLocaleString('en-US', { month: 'short', year: 'numeric' })
}
const sig = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const len = (r) => r.text.trim().length
const tokenize = (t) => new Set(sig(t).split(' ').filter((w) => w.length > 2))
// Word-set Jaccard
function jaccard(a, b) {
  const A = tokenize(a), B = tokenize(b)
  if (A.size === 0 || B.size === 0) return 0
  let inter = 0
  for (const w of A) if (B.has(w)) inter++
  return inter / new Set([...A, ...B]).size
}
// Trigram (3-word phrase) overlap coefficient — catches review-farm reused phrasing
const shingles = (t) => {
  const w = sig(t).split(' ').filter(Boolean)
  const s = new Set()
  for (let i = 0; i + 2 < w.length; i++) s.add(`${w[i]} ${w[i + 1]} ${w[i + 2]}`)
  return s
}
function shingleOverlap(a, b) {
  const A = shingles(a), B = shingles(b)
  if (A.size === 0 || B.size === 0) return 0
  let inter = 0
  for (const x of A) if (B.has(x)) inter++
  return inter / Math.min(A.size, B.size)
}
// Near-duplicate / bot-like if either signal is high
const isNearDup = (a, b) => jaccard(a, b) >= 0.4 || shingleOverlap(a, b) >= 0.22

// ── curate: up to 6, substantive, deduped, with a realistic rating mix ──
function curate(reviews) {
  // Sort longest-text-first so the most substantive review wins each cluster
  const sorted = [...reviews].sort((a, b) => len(b) - len(a))

  // Text reviews: de-duplicate by content. Text-less reviews: de-duplicate by author+date.
  const deduped = []
  const textless = []
  for (const r of sorted) {
    const s = sig(r.text)
    if (!s) {
      const key = `${r.author.toLowerCase()}|${r.dateRaw}`
      if (!textless.some((k) => `${k.author.toLowerCase()}|${k.dateRaw}` === key)) {
        textless.push({ ...r, dateObj: new Date(r.dateRaw) })
      }
      continue
    }
    const isDup = deduped.some((k) => sig(k.text) === s || isNearDup(k.text, r.text))
    if (isDup) continue
    deduped.push({ ...r, dateObj: new Date(r.dateRaw) })
  }

  // Text reviews first (more informative), text-less fill remaining slots
  const all = [...deduped, ...textless]

  // Exclude < 3★ entirely — harsh outliers don't belong on a display surface.
  const bySubstance = (a, b) => len(b) - len(a) || b.dateObj - a.dateObj
  const displayable = all.filter((r) => r.rating >= 3)
  const high = displayable.filter((r) => r.rating >= 4).sort(bySubstance)
  const realistic = displayable.filter((r) => r.rating >= 3 && r.rating < 4).sort(bySubstance)

  const picked = []
  const add = (r) => { if (picked.length < 6 && !picked.includes(r)) picked.push(r) }

  // reserve up to 2 substantive 3–4★ reviews for authenticity (if any exist)
  realistic.slice(0, 2).forEach(add)
  // fill the rest with 4–5★ reviews
  high.forEach(add)
  // top up with any remaining realistic
  realistic.slice(2).forEach(add)

  return picked
    .slice(0, 6)
    .sort((a, b) => b.dateObj - a.dateObj) // display: most recent first
    .map((r) => ({
      author: firstName(r.author),
      rating: r.rating,
      text: r.text.replace(/`+/g, "'").replace(/\s+/g, ' ').trim(),
      date: fmtDate(r.dateRaw),
    }))
}

// ── match CSV salon names to DB rows ──
const { data: dbSalons, error } = await supabase.from('salons').select('id, name')
if (error) { console.error('select failed:', error.message); process.exit(1) }
const norm = (s) =>
  s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, ' ')
    .replace(/\b(the|salon|salons|studio|makeup|makeover|makeovers|bridal|by|delhi)\b/g, ' ')
    .replace(/\s+/g, ' ').trim()
const dbByExact = new Map(dbSalons.map((s) => [s.name.trim().toLowerCase(), s]))
const dbByNorm = new Map(dbSalons.map((s) => [norm(s.name), s]))
function matchDb(name) {
  let m = dbByExact.get(name.toLowerCase()) || dbByNorm.get(norm(name))
  if (m) return m
  const n = norm(name)
  return dbSalons.find((s) => { const sn = norm(s.name); return sn && n && (sn.includes(n) || n.includes(sn)) }) || null
}

// ── build SQL + summary ──
const sqlEsc = (s) => s.replace(/'/g, "''")
const stmts = []
const summary = []
const unmatched = []
for (const [name, reviews] of groups) {
  const db = matchDb(name)
  const curated = curate(reviews)
  if (!db) { unmatched.push({ name, n: curated.length }); continue }
  const json = JSON.stringify(curated)
  stmts.push(`UPDATE salons SET reviews='${sqlEsc(json)}'::jsonb WHERE id='${db.id}';`)
  summary.push({ name: db.name, csv: name, stored: curated.length, ratings: curated.map((c) => c.rating).join('/') })
}

writeFileSync('scripts/_reviews_update.sql', stmts.join('\n') + '\n')

console.log(`\nWrote ${stmts.length} UPDATE statements to scripts/_reviews_update.sql\n`)
console.log('=== REVIEWS STORED PER SALON ===')
const pad = (s, n) => String(s).padEnd(n)
console.log(pad('SALON', 40), pad('#', 4), 'RATINGS (recent→old)')
for (const s of summary.sort((a, b) => b.stored - a.stored)) {
  console.log(pad(s.name.slice(0, 39), 40), pad(s.stored, 4), s.ratings)
}
console.log(`\n=== UNMATCHED CSV SALONS (not stored) ===`)
for (const u of unmatched) console.log(`  • "${u.name}" (${u.n} curated, no DB row)`)
