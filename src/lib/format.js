const DAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']

function parse(value) {
  if (!value) return null
  const [y, m, d] = String(value).slice(0, 10).split('-').map(Number)
  return !y || !m || !d ? null : { y, m, d }
}

// "Sonntag, 22. November 2026"
export function formatDateLong(value) {
  const p = parse(value)
  return p ? `${DAYS[new Date(Date.UTC(p.y, p.m - 1, p.d)).getUTCDay()]}, ${p.d}. ${MONTHS[p.m - 1]} ${p.y}` : '–'
}

// "22.11.2026"
export function formatDateShort(value) {
  const p = parse(value)
  return p ? `${String(p.d).padStart(2, '0')}.${String(p.m).padStart(2, '0')}.${p.y}` : '–'
}

// "22.11.2026 um 11:30"
export function formatDateTime(value) {
  if (!value) return ''
  const date = String(value).slice(0, 10)
  const time = String(value).length > 10 ? String(value).slice(11, 16) : ''
  return `${formatDateShort(date)}${time ? ` um ${time}` : ''}`
}

export function formatEuro(value) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(value) || 0)
}

export function formatNumber(value) {
  return new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 }).format(Number(value) || 0)
}

// Zeitstempel (UTC) in deutscher Ortszeit
export function formatTimestamp(value) {
  if (!value) return '–'
  const d = new Date(value)
  return Number.isNaN(d.getTime())
    ? '–'
    : d.toLocaleString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Berlin',
      })
}

export const UNIT_LABELS = { g: 'g', kg: 'kg', ml: 'ml', l: 'l', stueck: 'Stück' }
