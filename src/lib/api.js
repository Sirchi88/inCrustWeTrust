// Verbindung zu Supabase: alle Daten laufen über Datenbank-Funktionen (RPC).
const URL = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '')
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const isConfigured = Boolean(URL && KEY)

export async function rpc(fn, args = {}) {
  if (!isConfigured) {
    throw new Error('Supabase ist noch nicht verbunden (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY fehlen).')
  }
  let res
  try {
    res = await fetch(`${URL}/rest/v1/rpc/${fn}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: KEY,
        Authorization: `Bearer ${KEY}`,
      },
      body: JSON.stringify(args),
    })
  } catch {
    throw new Error('Keine Verbindung zum Server. Bitte prüfe deine Internetverbindung.')
  }
  const text = await res.text()
  const data = text ? JSON.parse(text) : null
  if (!res.ok) {
    throw new Error(data?.message || 'Unbekannter Fehler.')
  }
  return data
}
