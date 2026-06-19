import type { Salon } from './supabase'

type ScoredSalon = Salon & { score?: number; explanation?: string }

export type ResultsPayload = {
  results: ScoredSalon[]
  filtered: boolean
}

const KEY = 'beautymap_results_cache'
const TTL_MS = 60_000

/**
 * Hand off a freshly-computed /api/recommend payload from the matching
 * sequence to the results page, keyed by the exact query string so a stale
 * or mismatched cache is never consumed.
 */
export function saveResults(query: string, payload: ResultsPayload) {
  try {
    sessionStorage.setItem(
      KEY,
      JSON.stringify({ query, ...payload, ts: Date.now() })
    )
  } catch {
    /* sessionStorage unavailable — results page will simply re-fetch */
  }
}

/**
 * One-shot read: returns the cached payload only if it matches this query
 * and is fresh, then clears it. Direct visits to /results get null and fetch.
 */
export function loadResults(query: string): ResultsPayload | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ResultsPayload & { query: string; ts: number }
    if (parsed.query !== query || Date.now() - parsed.ts > TTL_MS) {
      sessionStorage.removeItem(KEY)
      return null
    }
    sessionStorage.removeItem(KEY)
    return { results: parsed.results, filtered: parsed.filtered }
  } catch {
    return null
  }
}
