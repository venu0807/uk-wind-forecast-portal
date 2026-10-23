export function formatMW(val) {
  if (val == null) return '—'
  return `${Math.round(val).toLocaleString('en-GB')} MW`
}

export function formatDateTime(isoStr) {
  if (!isoStr) return '—'
  const d = new Date(isoStr)
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    timeZoneName: 'short',
  })
}

export function formatShortDate(isoStr) {
  if (!isoStr) return '—'
  const d = new Date(isoStr)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', timeZone: 'UTC' })
}

/** Convert ISO startTime to minutes-from-midnight (UTC) for chart X axis */
export function toMinutesFromMidnight(isoStr) {
  const d = new Date(isoStr)
  return d.getUTCHours() * 60 + d.getUTCMinutes()
}
