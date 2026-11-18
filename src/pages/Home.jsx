import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageShell, BRAND, Logo } from '../components/Layout.jsx'
import PizzaSvg, { layoutToppings } from '../components/PizzaSvg.jsx'
import DrinkIllustration from '../components/DrinkIllustration.jsx'
import Modal, { ModalHeader, ModalFooter } from '../components/Modal.jsx'
import { ArrowRight, CalendarX, Clock } from '../components/icons.jsx'
import { LoadingPage, ErrorPage } from '../components/Status.jsx'
import { useRpc } from '../lib/useRpc.js'
import { rpc } from '../lib/api.js'
import { cn } from '../lib/cn.js'
import { formatDateLong, formatEuro } from '../lib/format.js'

function NextEventCard({ event, open }) {
  return (
    <div className="card-soft relative overflow-hidden rounded-2xl border border-pomodoro/25 bg-card">
      <span className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-pomodoro/10 blur-2xl" aria-hidden="true" />
      <span className="pointer-events-none absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-basilico/10 blur-2xl" aria-hidden="true" />
      <div className="relative px-5 py-6 text-center sm:px-8 sm:py-8">
        <p className="font-script text-[1.45rem] leading-none text-basilico">bald ist es wieder so weit</p>
        <p className="eyebrow mt-3">Nächster Termin</p>
        {event ? (
          <>
            <p className="mt-2 break-words font-heading text-[clamp(1.35rem,6.4vw,2.1rem)] font-semibold uppercase leading-tight tracking-[0.05em] text-ink">
              {formatDateLong(event.date)}
            </p>
            <p className="mt-3 inline-flex flex-wrap items-center justify-center gap-1.5 text-[0.95rem] text-ink/70">
              <Clock className="h-4 w-4 text-pomodoro" strokeWidth={1.8} />
              Abholung {event.pickupStart}–{event.pickupEnd} Uhr
            </p>
            {event.title && <p className="mt-1 text-sm text-muted-foreground">{event.title}</p>}
          </>
        ) : (
          <p className="mt-2 font-heading text-[1.2rem] font-semibold uppercase leading-tight tracking-[0.06em] text-ink sm:text-[1.5rem]">
            Der nächste Termin wird bald verkündet
          </p>
        )}
        <span
          className={cn(
            'mt-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[0.64rem] uppercase tracking-[0.18em]',
            open ? 'border-basilico/40 bg-basilico/5 text-basilico' : 'border-border text-muted-foreground',
          )}
        >
          <span className={cn('h-1.5 w-1.5 rounded-full', open ? 'animate-pulse bg-basilico' : 'bg-muted-foreground')} />
          {open ? 'Bestellungen offen' : 'Bestellungen geschlossen'}
        </span>
      </div>
    </div>
  )
}

function Hero({ event, open }) {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto w-full max-w-3xl px-5 pt-8 text-center sm:pt-12">
        <div className="rise-in mx-auto w-[min(76vw,320px)] sm:w-[360px]">
          <div className="card-soft aspect-square overflow-hidden rounded-full border border-border/70 bg-card">
            <Logo alt="Logo der Hof-Pizza von Dani" />
          </div>
        </div>
        <p className="mt-6 font-script text-[2.1rem] leading-none text-pomodoro sm:text-[2.7rem]">{BRAND.claim}</p>
        <Link
          to="/bestellen"
          className="group mt-7 inline-flex w-full items-center justify-center gap-3 rounded-full bg-pomodoro px-8 py-5 font-heading text-[0.8rem] font-semibold uppercase tracking-[0.22em] text-primary-foreground shadow-lg transition hover:bg-ink sm:w-auto sm:px-14"
        >
          Jetzt bestellen
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" strokeWidth={2} />
        </Link>
        <p className="mt-3 text-[0.95rem] text-ink/65">Hier deine Wunsch-Pizza zusammenstellen.</p>
      </div>
      <div className="mx-auto w-full max-w-3xl px-5 pb-14 pt-8">
        <NextEventCard event={event} open={open} />
      </div>
    </section>
  )
}

function Intro() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-16 text-center sm:py-20">
      <p className="eyebrow">Handgemacht</p>
      <h2 className="mt-3 font-heading text-[clamp(1.5rem,5.4vw,2.3rem)] font-semibold uppercase leading-tight tracking-[0.06em] text-ink">
        Neapolitanische Pizza im Hof
      </h2>
      <p className="mx-auto mt-5 max-w-xl text-[1.02rem] leading-relaxed text-ink/75">
        Ein Holzofen, ein Hof, ein paar Freunde. Jede Woche backe ich ein paar neapolitanische Pizzen – 48 Stunden gereifter Teig,
        luftiger Rand, beste Zutaten. Keine Lieferung, keine Kette: nur Abholung, bar bezahlt, direkt am Ofen.
      </p>
    </section>
  )
}

const DIAGRAM_GLYPHS = ['mozzarella', 'salami', 'ham', 'basil', 'parmesan']
const LABELS = [
  { id: 'teig', title: 'Teig', detail: 'Hausgemacht und 48 Stunden gereift', side: 'left', row: 0.22, angle: 208, radius: 168 },
  { id: 'sauce', title: 'Tomatensauce', detail: 'San Marzano Tomaten', side: 'left', row: 0.52, angle: 178, radius: 112 },
  { id: 'parmesan', title: 'Parmesan', detail: 'Parmigiano Reggiano', side: 'left', row: 0.8, angle: 148, glyph: 'parmesan' },
  { id: 'basil', title: 'Basilikum', detail: 'Frisch und selbst angepflanzt', side: 'right', row: 0.18, angle: 332, glyph: 'basil' },
  { id: 'kaese', title: 'Käse', detail: 'Fior di Latte aus Italien', side: 'right', row: 0.47, angle: 8, glyph: 'mozzarella' },
  { id: 'fleisch', title: 'Fleisch', detail: 'Frisch vom Metzger', side: 'right', row: 0.78, angle: 42, glyph: 'salami' },
]
const MOBILE_ORDER = ['teig', 'basil', 'sauce', 'kaese', 'parmesan', 'fleisch']
const BOX = { w: 1000, h: 600 }
const PIZZA = { x: 300, y: 100, size: 400 }
const K = PIZZA.size / 400
const FROM_X = { left: 252, right: 748 }
const DIAGRAM_LABEL = 'Handgezeichnete neapolitanische Pizza mit Teig, Tomatensauce, Käse, Basilikum, Parmesan und Fleisch'

function anchorFor(label, positions) {
  if (label.radius) {
    const a = (label.angle * Math.PI) / 180
    return { x: 200 + Math.cos(a) * label.radius, y: 200 + Math.sin(a) * label.radius }
  }
  const pts = positions[label.glyph] || []
  if (pts.length === 0) return null
  const target = (label.angle * Math.PI) / 180
  let best = pts[0]
  let bestDiff = Infinity
  for (const p of pts) {
    const ang = Math.atan2(p.y - 200, p.x - 200)
    const diff = Math.abs(Math.atan2(Math.sin(ang - target), Math.cos(ang - target)))
    // bevorzugt Stücke weiter außen, damit der Pfeil nicht quer über die Pizza läuft
    const score = diff - Math.hypot(p.x - 200, p.y - 200) / 600
    if (score < bestDiff) {
      bestDiff = score
      best = p
    }
  }
  return { x: best.x, y: best.y }
}

function IngredientDiagram() {
  const items = useMemo(() => {
    const pos = layoutToppings(DIAGRAM_GLYPHS)
    return LABELS.map((l, index) => {
      const a = anchorFor(l, pos) || { x: 200, y: 200 }
      return { ...l, index, ax: PIZZA.x + a.x * K, ay: PIZZA.y + a.y * K, labelY: l.row * BOX.h, fromX: FROM_X[l.side] }
    })
  }, [])
  const f = (n) => n.toFixed(1)

  return (
    <>
      <div className="relative mx-auto hidden aspect-[1000/600] w-full max-w-5xl md:block">
        <PizzaSvg
          ingredients={DIAGRAM_GLYPHS}
          label={DIAGRAM_LABEL}
          className="absolute left-1/2 top-1/2 w-[40%] -translate-x-1/2 -translate-y-1/2"
        />
        <svg viewBox={`0 0 ${BOX.w} ${BOX.h}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
          {items.map((e) => {
            const ang = Math.atan2(e.ay - e.labelY, e.ax - e.fromX)
            const bend = (e.side === 'left' ? 1 : -1) * (10 + (e.index % 3) * 8)
            const mx = (e.fromX + e.ax) / 2
            const my = (e.labelY + e.ay) / 2 + bend
            const a1 = ang + Math.PI * 0.84
            const a2 = ang - Math.PI * 0.84
            return (
              <g key={e.id} fill="none" stroke="#B4472F" strokeLinecap="round" strokeLinejoin="round">
                <path d={`M${f(e.fromX)} ${f(e.labelY)}Q${f(mx)} ${f(my)} ${f(e.ax)} ${f(e.ay)}`} strokeWidth="1.7" opacity="0.8" />
                <path d={`M${f(e.fromX + 2)} ${f(e.labelY + 4)}Q${f(mx + 3)} ${f(my + 5)} ${f(e.ax + 1)} ${f(e.ay + 2)}`} strokeWidth="0.9" opacity="0.22" />
                <path
                  d={`M${f(e.ax + Math.cos(a1) * 10)} ${f(e.ay + Math.sin(a1) * 10)}L${f(e.ax)} ${f(e.ay)}L${f(e.ax + Math.cos(a2) * 10)} ${f(e.ay + Math.sin(a2) * 10)}`}
                  strokeWidth="1.7"
                  opacity="0.85"
                />
              </g>
            )
          })}
        </svg>
        {items.map((e) => (
          <div
            key={e.id}
            className={
              e.side === 'left'
                ? 'absolute left-0 w-[24%] -translate-y-1/2 pr-4 text-right'
                : 'absolute right-0 w-[24%] -translate-y-1/2 pl-4 text-left'
            }
            style={{ top: `${e.row * 100}%` }}
          >
            <p className="font-heading text-[0.74rem] font-semibold uppercase tracking-[0.14em] text-ink">{e.title}</p>
            <p className="mt-1 text-[0.8rem] leading-snug text-ink/65">{e.detail}</p>
          </div>
        ))}
      </div>

      <div className="md:hidden">
        <div className="relative mx-auto w-[72%] max-w-[290px]">
          <PizzaSvg ingredients={DIAGRAM_GLYPHS} label={DIAGRAM_LABEL} className="h-auto w-full" />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-5">
          {MOBILE_ORDER.map((id) => {
            const item = items.find((i) => i.id === id)
            if (!item) return null
            const right = item.side === 'right'
            return (
              <div key={id} className={cn('flex flex-col', right ? 'items-end text-right' : 'items-start')}>
                <svg viewBox="0 0 40 34" className={cn('mb-1 h-6 w-8 text-pomodoro', right && '-scale-x-100')} aria-hidden="true">
                  <path d="M9 31C17 24 13 15 21 7" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7" />
                  <path d="M15 10L21 6L25 13" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
                </svg>
                <p className="font-heading text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-ink">{item.title}</p>
                <p className="mt-1 text-[0.8rem] leading-snug text-ink/65">{item.detail}</p>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

function Ingredients() {
  return (
    <section id="zutaten" className="scroll-mt-24 border-y border-border/70 bg-secondary/40">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <div className="text-center">
          <p className="eyebrow">Unsere Zutaten</p>
          <h2 className="mt-3 font-heading text-[clamp(1.35rem,5vw,1.9rem)] font-semibold uppercase leading-tight tracking-[0.1em] text-ink">
            Unsere Zutaten und Qualität
          </h2>
          <p className="mt-3 font-script text-[1.6rem] leading-none text-pomodoro">weniger ist mehr</p>
        </div>
        <div className="mt-10">
          <IngredientDiagram />
        </div>
        <p className="mx-auto mt-8 max-w-2xl text-center text-[0.98rem] leading-relaxed text-ink/75">
          Mehr braucht eine gute Pizza nicht: ein Teig, der Zeit bekommt, Tomaten aus San Marzano, Käse, Basilikum – und Fleisch, das
          ich selbst beim Metzger hole. Alles andere wäre zu viel.
        </p>
      </div>
    </section>
  )
}

const DRINK_KINDS = ['spezi', 'cola', 'spezi_energy', 'wasser_mit', 'floetz_spezi', 'wasser_ohne']
const DRINK_LABELS = { wasser_mit: 'Wasser', wasser_ohne: 'Wasser' }

function pickDrinks(drinks) {
  const out = []
  for (const kind of DRINK_KINDS) {
    if (out.length >= 4) break
    const d = (drinks || []).find((x) => x.illustration === kind && !out.some((o) => o.id === x.id))
    if (d) out.push({ ...d, kind, label: DRINK_LABELS[kind] || d.name })
  }
  return out
}

function SquiggleArrow({ mirrored }) {
  return (
    <svg viewBox="0 0 60 44" className={cn('my-0.5 h-10 w-12 text-pomodoro', mirrored && '-scale-x-100')} aria-hidden="true">
      <path d="M31 3C23 14 37 24 28 39" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.75" />
      <path d="M21 32L28 40L35 31" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
    </svg>
  )
}

function Drinks({ drinks }) {
  const list = pickDrinks(drinks)
  if (list.length === 0) return null
  return (
    <section id="getraenke" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-16 sm:py-20">
      <div className="text-center">
        <p className="eyebrow">Getränke</p>
        <h2 className="mt-3 font-heading text-[clamp(1.35rem,5vw,1.9rem)] font-semibold uppercase leading-tight tracking-[0.1em] text-ink">
          Auch für Durst ist gesorgt
        </h2>
        <p className="mt-3 font-script text-[1.6rem] leading-none text-pomodoro">kalt gestellt</p>
      </div>
      <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4">
        {list.map((d, i) => (
          <div key={d.id} className="flex flex-col items-center text-center">
            <DrinkIllustration kind={d.kind} className="h-24 w-auto sm:h-28" />
            <SquiggleArrow mirrored={i % 2 === 1} />
            <p className="font-heading text-[0.7rem] font-semibold uppercase leading-snug tracking-[0.12em] text-ink">{d.label}</p>
          </div>
        ))}
      </div>
      <p className="mx-auto mt-10 max-w-2xl text-center text-[0.98rem] leading-relaxed text-ink/75">
        Und natürlich ist auch für die passende Erfrischung gesorgt. An alles ist gedacht!
      </p>
    </section>
  )
}

function Courtyard() {
  return (
    <section id="hof" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-20">
      <div className="grid gap-10 md:grid-cols-[0.7fr_1fr] md:items-start">
        <div className="flex items-start gap-5">
          <span className="hidden h-20 w-20 shrink-0 overflow-hidden rounded-full ring-1 ring-ink/15 sm:block">
            <Logo alt="Logo der Hof-Pizza" />
          </span>
          <div>
            <p className="eyebrow">Der Hof</p>
            <h2 className="mt-3 font-heading text-[1.35rem] font-semibold uppercase leading-snug tracking-[0.12em] text-ink sm:text-[1.7rem]">
              Kein Restaurant.
              <br />
              Nur ein Ofen.
            </h2>
          </div>
        </div>
        <div className="relative">
          <span className="absolute -left-4 -top-9 font-heading text-6xl text-pomodoro/25" aria-hidden="true">
            „
          </span>
          <p className="text-[1.02rem] leading-relaxed text-ink/80">
            Die Hof-Pizza ist eine kleine private Aktion für Freunde und Bekannte. Ich belege jede Pizza von Hand, backe sie einzeln im
            Holzofen und stelle sie warm in den Karton – erst wenn du klingelst. Deshalb gibt es nur wenige Abholzeiten pro Abend und nur
            das, was ich am Markt bekommen habe.
          </p>
          <p className="mt-4 text-[1.02rem] leading-relaxed text-ink/80">
            Bestellungen sind immer nur für den angekündigten Termin möglich. Wenn etwas nicht klappt, schreib mir einfach – ich finde
            meistens eine Lösung.
          </p>
          <div className="mt-8 flex items-end justify-between gap-4 border-t border-border/80 pt-5">
            <p className="eyebrow">Dein Gastgeber</p>
            <p className="font-script text-[2rem] leading-none text-pomodoro">Dani</p>
          </div>
        </div>
      </div>
    </section>
  )
}

const btnGhost = 'rounded-full border border-ink/25 px-5 py-2.5 text-[0.66rem] uppercase tracking-[0.18em] text-ink/70'
const btnDark = 'rounded-full bg-ink px-5 py-2.5 text-[0.66rem] uppercase tracking-[0.18em] text-paper transition hover:bg-pomodoro disabled:opacity-50'

export function CancelDialog({ open, onOpenChange, initialNumber = '' }) {
  const [step, setStep] = useState('input')
  const [number, setNumber] = useState(initialNumber)
  const [order, setOrder] = useState(null)
  const [cancelUntil, setCancelUntil] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const close = () => {
    onOpenChange(false)
    setStep('input')
    setNumber(initialNumber)
    setOrder(null)
    setCancelUntil('')
    setError('')
    setBusy(false)
  }

  return (
    <Modal open={open} onClose={close} className="max-w-md rounded-2xl">
      {step === 'input' && (
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault()
            setError('')
            setBusy(true)
            try {
              const r = await rpc('lookup_order_for_cancel', { p_order_number: number })
              setOrder(r.order)
              setCancelUntil(r.cancelUntil || '')
              setStep('confirm')
            } catch (err) {
              setError(err.message || 'Die Bestellung konnte nicht gefunden werden.')
            } finally {
              setBusy(false)
            }
          }}
        >
          <ModalHeader
            className="font-heading text-xl uppercase tracking-[0.08em]"
            title="Bestellung stornieren"
            description="Gib die Bestellnummer von deiner Bestätigung ein. Sie sieht aus wie HP-4F2A."
          />
          <label className="block">
            <span className="eyebrow">Bestellnummer</span>
            <input
              value={number}
              onChange={(e) => setNumber(e.target.value.toUpperCase())}
              placeholder="HP-4F2A"
              autoComplete="off"
              className="mt-1.5 w-full rounded-sm border border-ink/20 bg-card px-3 py-2.5 text-base uppercase tracking-[0.08em] outline-none transition focus:border-pomodoro sm:text-sm"
            />
          </label>
          {error && <p className="rounded-sm border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</p>}
          <ModalFooter className="gap-2">
            <button type="button" onClick={close} className={btnGhost}>
              Abbrechen
            </button>
            <button type="submit" disabled={busy || number.trim().length < 4} className={btnDark}>
              {busy ? 'Suche …' : 'Bestellung suchen'}
            </button>
          </ModalFooter>
        </form>
      )}

      {step === 'confirm' && order && (
        <div className="space-y-4">
          <ModalHeader
            className="font-heading text-xl uppercase tracking-[0.08em]"
            title="Passt das?"
            description="Bitte prüfe die Bestellung. Storniert wird erst, wenn du es hier bestätigst."
          />
          <dl className="space-y-2 rounded-xl border border-border/70 bg-secondary/40 px-4 py-4 text-sm">
            <Row label="Bestellnummer" value={<span className="font-heading uppercase tracking-[0.08em]">{order.orderNumber}</span>} />
            <Row label="Name" value={order.customerName} />
            <Row label="Termin" value={formatDateLong(order.eventDate)} />
            <Row label="Abholung" value={`${order.pickupLabel} Uhr · ${order.pizzaCount} Pizza${order.pizzaCount === 1 ? '' : 'en'}`} />
            <Row label="Summe" value={<span className="font-heading">{formatEuro(order.total)}</span>} />
          </dl>
          {cancelUntil && (
            <p className="text-xs text-muted-foreground">Online stornierbar bis {cancelUntil} Uhr – vor Beginn der Pizza-Session.</p>
          )}
          {error && <p className="rounded-sm border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</p>}
          <ModalFooter className="gap-2">
            <button
              type="button"
              onClick={() => {
                setError('')
                setStep('input')
              }}
              className={btnGhost}
            >
              Zurück
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                setError('')
                setBusy(true)
                try {
                  const r = await rpc('cancel_order', { p_order_number: order.orderNumber })
                  setOrder((o) => ({ ...o, ...r }))
                  setStep('done')
                } catch (err) {
                  setError(err.message || 'Die Stornierung hat nicht geklappt.')
                } finally {
                  setBusy(false)
                }
              }}
              className="rounded-full bg-destructive px-5 py-2.5 text-[0.66rem] uppercase tracking-[0.18em] text-destructive-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              {busy ? 'Wird storniert …' : 'Stornierung bestätigen'}
            </button>
          </ModalFooter>
        </div>
      )}

      {step === 'done' && order && (
        <div className="space-y-4">
          <ModalHeader
            className="font-heading text-xl uppercase tracking-[0.08em]"
            title="Storniert"
            description={
              <>
                Deine Bestellung <span className="font-heading uppercase tracking-[0.08em]">{order.orderNumber}</span> ist storniert. Deine
                Abholzeit ist damit wieder frei – schade, dass es diesmal nicht klappt.
              </>
            }
          />
          <p className="rounded-xl border border-border/70 bg-secondary/40 px-4 py-3 text-sm text-ink/75">
            Dani sieht die Stornierung in seiner Übersicht. Bis zum nächsten Pizza-Abend!
          </p>
          <ModalFooter>
            <button
              type="button"
              onClick={() => {
                close()
                if (initialNumber) window.location.reload()
              }}
              className={btnDark}
            >
              Schließen
            </button>
          </ModalFooter>
        </div>
      )}
    </Modal>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  )
}

function CancelSection() {
  const [open, setOpen] = useState(false)
  return (
    <section className="border-t border-border/70 bg-secondary/30">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-5 py-14 text-center">
        <CalendarX className="h-6 w-6 text-pomodoro/80" strokeWidth={1.6} />
        <p className="text-[0.95rem] leading-relaxed text-ink/70">
          Du kannst doch nicht kommen? Solange die Pizza-Session nicht kurz bevorsteht, kannst du deine Bestellung hier selbst stornieren.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-ink/25 px-7 py-3.5 font-heading text-[0.68rem] uppercase tracking-[0.22em] text-ink/80 transition hover:border-pomodoro hover:text-pomodoro"
        >
          Bestellung stornieren
        </button>
      </div>
      <CancelDialog open={open} onOpenChange={setOpen} />
    </section>
  )
}

export default function Home() {
  const { data, error, loading, reload } = useRpc('public_home')
  if (loading) return <LoadingPage />
  if (error) return <ErrorPage message={error} onRetry={reload} />
  return (
    <PageShell>
      <main>
        <Hero event={data.event} open={data.open} />
        <Intro />
        <Ingredients />
        <Drinks drinks={data.drinks} />
        <Courtyard />
        <CancelSection />
      </main>
    </PageShell>
  )
}
