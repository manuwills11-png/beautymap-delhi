import { describe, it, expect } from 'vitest'
import { haversineKm } from './distance'

describe('haversineKm', () => {
  it('returns 0 for identical coordinates', () => {
    expect(haversineKm(28.6139, 77.209, 28.6139, 77.209)).toBe(0)
  })

  it('calculates ~111 km per degree of latitude', () => {
    const km = haversineKm(0, 0, 1, 0)
    expect(km).toBeCloseTo(111.19, 0)
  })

  it('calculates distance between two Delhi landmarks (~5.5 km)', () => {
    // Connaught Place → India Gate
    const km = haversineKm(28.6315, 77.2167, 28.6129, 77.2295)
    expect(km).toBeGreaterThan(2)
    expect(km).toBeLessThan(5)
  })

  it('is symmetric — A→B equals B→A', () => {
    const ab = haversineKm(28.6, 77.2, 28.7, 77.3)
    const ba = haversineKm(28.7, 77.3, 28.6, 77.2)
    expect(ab).toBeCloseTo(ba, 6)
  })

  it('returns a positive number for distinct points', () => {
    expect(haversineKm(28.5, 77.1, 28.9, 77.5)).toBeGreaterThan(0)
  })
})
