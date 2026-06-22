// One-off: recalculate salon ratings + review_count from all_reviews.csv
// Usage: node scripts/recalc_ratings.mjs [--write]
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const WRITE = process.argv.includes('--write')
const SQL = process.argv.includes('--sql')

// ── load .env.local (strip BOM, ignore comments) ──
const env = {}
for (const line of readFileSync('.env.local', 'utf8').replace(/^﻿/, '').split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m) env[m[1]] = m[2].trim()
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

// ── minimal RFC-4180 CSV parser (handles quotes, commas, newlines in fields) ──
function parseCSV(text) {
  const rows = []
  let row = [], field = '', inQuotes = false
  text = text.replace(/^﻿/, '')
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ }
        else inQuotes = false
      } else field += c
    } else {
      if (c === '"') inQuotes = true
      else if (c === ',') { row.push(field); field = '' }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = '' }
      else if (c === '\r') { /* skip */ }
      else field += c
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row) }
  return rows
}

const rows = parseCSV(readFileSync('all_reviews.csv', 'utf8'))
const header = rows.shift().map((h) => h.trim())
const idx = Object.fromEntries(header.map((h, i) => [h, i]))

// ── group by salon_name ──
const groups = new Map()
let skipped = 0
for (const r of rows) {
  if (!r.length || r.every((c) => c === '')) continue
  const name = (r[idx.salon_name] ?? '').trim()
  const ratingRaw = (r[idx.rating] ?? '').trim()
  const rating = parseFloat(ratingRaw)
  if (!name || !Number.isFinite(rating)) { skipped++; continue }
  if (!groups.has(name)) groups.set(name, { sum: 0, count: 0 })
  const g = groups.get(name)
  g.sum += rating
  g.count++
}

const csvSalons = [...groups.entries()].map(([name, g]) => ({
  name,
  avg: Math.round((g.sum / g.count) * 10) / 10,
  count: g.count,
}))

// ── fetch existing salons ──
const { data: dbSalons, error } = await supabase.from('salons').select('id, name, rating, review_count')
if (error) { console.error('Supabase select failed:', error.message); process.exit(1) }

// ── matching: exact, then normalized ──
const norm = (s) =>
  s.toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\b(the|salon|salons|studio|makeup|makeover|makeovers|bridal|by|delhi)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const dbByExact = new Map(dbSalons.map((s) => [s.name.trim().toLowerCase(), s]))
const dbByNorm = new Map(dbSalons.map((s) => [norm(s.name), s]))

const updates = []
const unmatched = []
for (const cs of csvSalons) {
  let match = dbByExact.get(cs.name.toLowerCase()) || dbByNorm.get(norm(cs.name)) || null
  if (!match) {
    // last resort: substring containment on normalized names
    const n = norm(cs.name)
    match = dbSalons.find((s) => {
      const sn = norm(s.name)
      return sn && n && (sn.includes(n) || n.includes(sn))
    }) || null
  }
  if (match) updates.push({ csv: cs, db: match })
  else unmatched.push(cs)
}

// ── apply (or dry-run) ──
if (WRITE) {
  for (const u of updates) {
    const { error: upErr } = await supabase
      .from('salons')
      .update({ rating: u.csv.avg, review_count: u.csv.count })
      .eq('id', u.db.id)
    u.writeError = upErr ? upErr.message : null
  }
}

// ── SQL emit mode (for authorized execution via MCP) ──
if (SQL) {
  for (const u of updates) {
    console.log(
      `UPDATE salons SET rating=${u.csv.avg}, review_count=${u.csv.count} WHERE id='${u.db.id}'; -- ${u.db.name.replace(/\n/g, ' ')}`
    )
  }
  process.exit(0)
}

// ── summary ──
console.log(`\nParsed ${rows.length} CSV rows · ${csvSalons.length} distinct salons · ${skipped} rows skipped (blank/invalid rating)\n`)
console.log(WRITE ? '=== UPDATES APPLIED ===' : '=== DRY RUN (no writes) — pass --write to apply ===')
const pad = (s, n) => String(s).padEnd(n)
console.log(pad('SALON', 34), pad('OLD', 6), pad('NEW', 6), pad('REVIEWS', 8), 'STATUS')
for (const u of updates) {
  console.log(
    pad(u.db.name.slice(0, 33), 34),
    pad(u.db.rating ?? '—', 6),
    pad(u.csv.avg, 6),
    pad(u.csv.count, 8),
    WRITE ? (u.writeError ? `FAIL: ${u.writeError}` : 'updated') : 'planned',
    u.db.name.trim().toLowerCase() !== u.csv.name.toLowerCase() ? `(fuzzy← "${u.csv.name}")` : ''
  )
}

console.log(`\n=== UNMATCHED CSV SALONS (${unmatched.length}) — no Supabase row ===`)
if (unmatched.length === 0) console.log('(none — all CSV salons matched)')
for (const u of unmatched) console.log(`  • "${u.name}"  (avg ${u.avg}, ${u.count} reviews)`)

// list DB salons that got no CSV data, for completeness
const matchedIds = new Set(updates.map((u) => u.db.id))
const dbNoCsv = dbSalons.filter((s) => !matchedIds.has(s.id))
console.log(`\n=== DB SALONS WITH NO CSV REVIEWS (${dbNoCsv.length}) — left unchanged ===`)
for (const s of dbNoCsv) console.log(`  • "${s.name}" (rating ${s.rating ?? '—'}, ${s.review_count ?? '—'} reviews)`)
