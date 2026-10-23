import { describe, it, expect } from 'vitest'
import { formatMW, formatShortDate, toMinutesFromMidnight } from '../utils/formatters'

describe('formatMW', () => {
  it('formats a MW value with comma separator', () => {
    expect(formatMW(4512)).toBe('4,512 MW')
  })

  it('returns dash for null', () => {
    expect(formatMW(null)).toBe('—')
  })

  it('rounds decimals', () => {
    expect(formatMW(4512.7)).toBe('4,513 MW')
  })
})

describe('toMinutesFromMidnight', () => {
  it('converts 00:00 UTC to 0 minutes', () => {
    expect(toMinutesFromMidnight('2026-01-15T00:00:00Z')).toBe(0)
  })

  it('converts 08:30 UTC to 510 minutes', () => {
    expect(toMinutesFromMidnight('2026-01-15T08:30:00Z')).toBe(510)
  })

  it('converts 23:30 UTC to 1410 minutes', () => {
    expect(toMinutesFromMidnight('2026-01-15T23:30:00Z')).toBe(1410)
  })
})
