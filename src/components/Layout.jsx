import { Link } from 'react-router-dom'
import { ArrowRight } from './icons.jsx'

export const BRAND = { name: 'HOF-PIZZA', claim: 'In crust we trust', by: 'by Dani', cta: 'Bestellen' }
export const LOGO = '/logo.jpg'

export function Logo({ className = '', alt = 'HOF-PIZZA Logo' }) {
  return <img src={LOGO} alt={alt} className={`h-full w-full object-cover ${className}`} />
}

const NAV = [
  { href: '/#zutaten', label: 'Zutaten' },
  { href: '/#hof', label: 'Der Hof' },
]

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 lg:py-5">
        <Link to="/" className="flex items-center gap-3.5">
          <span className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-ink/15 bg-card sm:h-12 sm:w-12">
            <Logo />
          </span>
          <span className="leading-none">
            <span className="block font-heading text-[0.92rem] font-semibold uppercase tracking-[0.3em] text-ink">In Crust</span>
            <span className="mt-1 block font-script text-[1.3rem] leading-none text-pomodoro">we trust</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-7 lg:flex">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="font-heading text-[0.64rem] uppercase tracking-[0.24em] text-ink/60 transition hover:text-pomodoro">
              {n.label}
            </a>
          ))}
        </nav>
        <Link
          to="/bestellen"
          className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 font-heading text-[0.64rem] uppercase tracking-[0.24em] text-paper transition hover:bg-pomodoro"
        >
          {BRAND.cta}
          <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" strokeWidth={1.8} />
        </Link>
      </div>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-border/80 bg-background">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-3.5">
              <span className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-ink/15 bg-card">
                <Logo alt="Logo der Hof-Pizzeria" />
              </span>
              <div className="leading-none">
                <p className="font-heading text-[0.8rem] font-semibold uppercase tracking-[0.28em] text-ink">Hof-Pizzeria</p>
                <p className="mt-1.5 font-script text-xl leading-none text-pomodoro">by Dani</p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-ink/70">
              Privater Pizza-Abend für Freunde und Bekannte. Kein Lieferservice – Abholung im Hof, Barzahlung vor Ort.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-3">
              <Link to="/bestellen" className="font-heading text-[0.62rem] uppercase tracking-[0.26em] text-ink transition hover:text-pomodoro">
                Zur Bestellung
              </Link>
              <Link to="/chefsache" className="font-heading text-[0.62rem] uppercase tracking-[0.26em] text-ink/45 transition hover:text-ink">
                Chefsache
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:gap-14">
            <div className="space-y-2">
              <span className="eyebrow">Abholung</span>
              <p className="text-sm text-ink/70">Im Hof – Adresse auf Nachfrage</p>
              <p className="text-sm text-ink/70">Barzahlung bei Abholung</p>
            </div>
            <div className="space-y-2">
              <span className="eyebrow">Kontakt</span>
              <p className="text-sm text-ink/70">Dani · Hof-Pizza</p>
              <p className="text-sm text-ink/70">Antwort meist am selben Tag</p>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-6 font-heading text-[0.6rem] uppercase tracking-[0.2em] text-ink/40">
          © {new Date().getFullYear()} HOF-PIZZA · Nur Abholung, keine Lieferung
        </div>
      </div>
    </footer>
  )
}

export function PageShell({ children }) {
  return (
    <div className="min-h-screen">
      <Header />
      {children}
      <Footer />
    </div>
  )
}
