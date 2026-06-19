/**
 * Normalise a raw Indian phone number (including Excel scientific notation
 * like "9.1991E+11") to a pure-digit wa.me-compatible string "91XXXXXXXXXX",
 * or null if the input can't be resolved to a valid number.
 */
export function cleanIndianPhone(raw: string | null | undefined): string | null {
  if (!raw) return null

  let digits: string

  if (/[eE]/.test(raw)) {
    // Excel scientific notation: parse as float and round to integer
    const n = Math.round(parseFloat(raw))
    if (Number.isNaN(n) || n <= 0) return null
    digits = n.toString()
  } else {
    digits = raw.replace(/\D/g, '')
  }

  if (digits.length === 12 && digits.startsWith('91')) return digits
  if (digits.length === 10) return '91' + digits
  return null
}
