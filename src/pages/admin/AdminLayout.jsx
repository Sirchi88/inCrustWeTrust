import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Logo, BRAND } from '../../components/Layout.jsx'
import { House } from '../../components/icons.jsx'
import { rpc } from '../../lib/api.js'
import { cn } from '../../lib/cn.js'
import { AdminContext, Button, Field, inputClass } from './AdminUi.jsx'

const TOKEN_KEY = 'hofpizza-chef-token'
const readToken = () => {
  try {
    return window.localStorage.getItem(TOKEN_KEY) || ''
  } catch {
    return ''
  }
}
const writeToken = (t) => {
  try {
    if (t) window.localStorage.setItem(TOKEN_KEY, t)
    else window.localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* privater Modus */
  }
}

function Login({ onSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [setup, setSetup] = useState(false)

  useEffect(() => {
    rpc('admin_needs_setup').then(setSetup).catch(() => {})
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <span className="mx-auto block h-20 w-20 overflow-hidden rounded-full ring-1 ring-ink/15">
            <Logo />
          </span>
          <p className="eyebrow mt-6">Interner Bereich</p>
          <h1 className="mt-2 font-heading text-4xl">Chefsache</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {setup ? 'Ersteinrichtung: Lege jetzt deinen Benutzernamen und dein Passwort fest.' : 'Nur für die Küche. Bitte anmelden.'}
          </p>
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            setError('')
            setBusy(true)
            try {
              const r = await rpc('admin_login', { p_username: username, p_password: password })
              onSuccess(r.token)
            } catch (err) {
              setError(err.message || 'Anmeldung fehlgeschlagen.')
            } finally {
              setBusy(false)
            }
          }}
          className="mt-8 space-y-4 rounded-md border border-ink/12 bg-card p-6"
        >
          <Field label="Benutzer">
            <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" className={inputClass} required />
          </Field>
          <Field label="Passwort" hint={setup ? 'Mindestens 6 Zeichen.' : undefined}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={setup ? 'new-password' : 'current-password'}
              className={inputClass}
              required
            />
          </Field>
          {error && <p className="rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <Button type="submit" disabled={busy} className="w-full">
            {busy ? 'Prüfe …' : setup ? 'Zugang anlegen' : 'Anmelden'}
          </Button>
        </form>
        <div className="mt-6 text-center">
          <Link to="/" className="text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground hover:text-ink">
            Zurück zur Website
          </Link>
        </div>
      </div>
    </div>
  )
}

const NAV = [
  { to: '/chefsache/dashboard', label: 'Dashboard' },
  { to: '/chefsache/bestellungen', label: 'Bestellungen' },
  { to: '/chefsache/stornierungen', label: 'Stornierungen' },
  { to: '/chefsache/kueche', label: 'Küche' },
  { to: '/chefsache/termine', label: 'Termine' },
  { to: '/chefsache/pizzen', label: 'Wochenkarte' },
  { to: '/chefsache/zutaten', label: 'Zutaten' },
  { to: '/chefsache/getraenke', label: 'Getränke' },
  { to: '/chefsache/einkauf', label: 'Einkaufsliste' },
  { to: '/chefsache/auswertung', label: 'Auswertung' },
  { to: '/chefsache/einstellungen', label: 'Einstellungen' },
]

function Nav({ row }) {
  return (
    <nav className={row ? 'flex gap-1' : 'space-y-1'}>
      {NAV.map((n) => (
        <NavLink
          key={n.to}
          to={n.to}
          className={({ isActive }) =>
            cn(
              'block whitespace-nowrap rounded-sm px-3 py-2 text-[0.72rem] uppercase tracking-[0.16em] transition',
              isActive ? 'bg-ink text-paper' : 'text-ink/70 hover:bg-ink/5 hover:text-ink',
            )
          }
        >
          {n.label}
        </NavLink>
      ))}
    </nav>
  )
}

// "App installieren" – erscheint, wenn der Browser die Installation anbietet
function useInstallPrompt() {
  const [prompt, setPrompt] = useState(null)
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])
  return prompt
    ? async () => {
        prompt.prompt()
        await prompt.userChoice.catch(() => {})
        setPrompt(null)
      }
    : null
}

function Shell({ state, loading, error, reload, onLogout }) {
  const install = useInstallPrompt()
  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2.5 sm:gap-4 sm:px-4 sm:py-3">
          <Link to="/chefsache/dashboard" className="flex min-w-0 items-center gap-2 sm:gap-3">
            <span className="h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1 ring-ink/15 sm:h-9 sm:w-9">
              <Logo />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate font-heading text-[0.78rem] tracking-[0.16em] sm:text-sm sm:tracking-[0.24em]">CHEFSACHE</span>
              <span className="block truncate text-[0.65rem] text-muted-foreground">
                {state?.admin?.username ? `Angemeldet als ${state.admin.username}` : 'Interner Bereich'}
              </span>
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            {install && (
              <button
                type="button"
                onClick={install}
                className="hidden rounded-full border border-pomodoro/40 px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.14em] text-pomodoro transition hover:bg-pomodoro/5 sm:inline-flex sm:px-4 sm:py-2 sm:text-[0.66rem] sm:tracking-[0.18em]"
              >
                App installieren
              </button>
            )}
            <Link
              to="/"
              aria-label="Zur Startseite"
              title="Zur Startseite"
              className="inline-flex items-center gap-1.5 rounded-full bg-ink px-2.5 py-1.5 text-[0.62rem] uppercase tracking-[0.14em] text-paper transition hover:bg-pomodoro sm:px-4 sm:py-2 sm:text-[0.66rem] sm:tracking-[0.18em]"
            >
              <House className="h-3.5 w-3.5" strokeWidth={1.9} />
              <span className="hidden sm:inline">Zur Startseite</span>
            </Link>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-full border border-ink/20 px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.14em] text-ink/75 transition hover:border-ink/60 sm:px-4 sm:py-2 sm:text-[0.66rem] sm:tracking-[0.18em]"
            >
              Abmelden
            </button>
          </div>
        </div>
        <div className="overflow-x-auto border-t border-ink/10 px-2 py-2 lg:hidden">
          <Nav row />
        </div>
      </header>
      <div className="mx-auto flex max-w-7xl gap-6 px-3 py-5 sm:px-4 sm:py-6">
        <aside className="hidden w-52 shrink-0 lg:block">
          <div className="sticky top-28">
            <Nav />
          </div>
        </aside>
        <main className="min-w-0 flex-1">
          {error && (
            <div className="mb-4 flex items-center justify-between gap-3 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span>{error}</span>
              <button type="button" onClick={reload} className="underline decoration-dotted underline-offset-4">
                Erneut laden
              </button>
            </div>
          )}
          {state ? (
            <Outlet />
          ) : loading ? (
            <p className="py-20 text-center text-sm text-muted-foreground">Daten werden geladen …</p>
          ) : (
            <div className="rounded-md border border-ink/12 bg-card p-8 text-center">
              <p className="font-heading text-xl">Daten konnten nicht geladen werden</p>
              <button
                type="button"
                onClick={reload}
                className="mt-4 rounded-full border border-ink/25 px-5 py-2.5 text-[0.68rem] uppercase tracking-[0.18em]"
              >
                Erneut laden
              </button>
            </div>
          )}
        </main>
      </div>
      <p className="pb-8 text-center text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">{BRAND.name} · Chefsache</p>
    </div>
  )
}

export default function AdminLayout() {
  const [token, setToken] = useState(readToken)
  const [state, setState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const busy = useRef(false)

  const dropSession = useCallback(() => {
    writeToken('')
    setToken('')
    setState(null)
  }, [])

  const reload = useCallback(async () => {
    if (!token || busy.current) return
    busy.current = true
    try {
      const s = await rpc('admin_state', { p_token: token })
      setState(s)
      setError('')
    } catch (e) {
      const msg = e.message || 'Daten konnten nicht geladen werden.'
      setError(msg)
      if (msg.includes('Sitzung ist abgelaufen')) dropSession()
    } finally {
      busy.current = false
      setLoading(false)
    }
  }, [token, dropSession])

  useEffect(() => {
    reload()
  }, [reload])

  // Admin-Funktion aufrufen: Token wird automatisch mitgeschickt
  const call = useCallback(
    async (fn, args = {}) => {
      try {
        return await rpc(fn, { p_token: token, ...args })
      } catch (e) {
        if ((e.message || '').includes('Sitzung ist abgelaufen')) dropSession()
        throw e
      }
    },
    [token, dropSession],
  )

  if (!token) {
    return (
      <Login
        onSuccess={(t) => {
          writeToken(t)
          setLoading(true)
          setToken(t)
        }}
      />
    )
  }

  const logout = async () => {
    try {
      await rpc('admin_logout', { p_token: token })
    } catch {
      /* egal */
    }
    dropSession()
  }

  return (
    <AdminContext.Provider value={{ state, loading, error, reload, token, call }}>
      <Shell state={state} loading={loading} error={error} reload={reload} onLogout={logout} />
    </AdminContext.Provider>
  )
}
