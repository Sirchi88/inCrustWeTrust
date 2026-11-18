import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { PageShell } from '../components/Layout.jsx'
import PizzaSvg from '../components/PizzaSvg.jsx'
import { LoadingPage, ErrorPage } from '../components/Status.jsx'
import { CancelDialog } from './Home.jsx'
import { useRpc } from '../lib/useRpc.js'
import { formatDateLong, formatEuro } from '../lib/format.js'

export default function Confirmation() {
  const { orderNumber } = useParams()
  const [search] = useSearchParams()
  const isNew = search.get('neu') === '1'
  const [cancelOpen, setCancelOpen] = useState(false)
  const { data, error, loading, reload } = useRpc('get_order', { p_order_number: orderNumber })

  if (loading) return <LoadingPage />
  if (error) return <ErrorPage message={error} onRetry={reload} />
  const order = data?.order

  if (!order) {
    return (
      <PageShell>
        <main className="mx-auto max-w-2xl px-5 py-24 text-center">
          <h1 className="font-heading text-3xl">Bestellung nicht gefunden</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Vielleicht ist die Bestellnummer nicht ganz vollständig. Schreib mir gern, ich schaue nach.
          </p>
          <Link to="/" className="mt-8 inline-block rounded-full bg-ink px-6 py-3 text-[0.7rem] uppercase tracking-[0.2em] text-paper">
            Zur Startseite
          </Link>
        </main>
      </PageShell>
    )
  }

  const cancelled = order.status === 'storniert'
  const cancellable = order.status === 'eingegangen'

  return (
    <PageShell>
      <main className="mx-auto max-w-3xl px-5 pb-20 pt-12">
        {isNew ? (
          <>
            <p className="eyebrow">Danke</p>
            <h1 className="mt-2 font-heading text-4xl leading-tight sm:text-5xl">Deine Pizza ist reserviert.</h1>
            <p className="mt-4 max-w-xl text-[1.02rem] leading-relaxed text-ink/75">
              {order.customerName}, wir sehen uns am {formatDateLong(order.eventDate)} um <strong>{order.pickupLabel} Uhr</strong>. Bitte
              komm pünktlich, bezahlt wird bar bei Abholung.
            </p>
          </>
        ) : (
          <>
            <p className="eyebrow">Bestellung</p>
            <h1 className="mt-2 font-heading text-4xl leading-tight sm:text-5xl">Bestellung {order.orderNumber}</h1>
            <p className="mt-4 text-[1.02rem] leading-relaxed text-ink/75">
              Abholung am {formatDateLong(order.eventDate)} um {order.pickupLabel} Uhr.
            </p>
          </>
        )}

        <div className="card-soft mt-8 grid gap-3 rounded-2xl border border-border/70 bg-card p-6 sm:grid-cols-3">
          <div>
            <p className="eyebrow">Bestellnummer</p>
            <p className="mt-1 font-heading text-xl">{order.orderNumber}</p>
          </div>
          <div>
            <p className="eyebrow">Abholung</p>
            <p className="mt-1 font-heading text-xl">{order.pickupLabel} Uhr</p>
          </div>
          <div>
            <p className="eyebrow">Gesamt</p>
            <p className="mt-1 font-heading text-xl">{formatEuro(order.total)}</p>
          </div>
        </div>

        {isNew && !cancelled && (
          <p className="mt-4 text-sm text-muted-foreground">
            Tipp: Merk dir deine Bestellnummer oder speichere diese Seite als Lesezeichen – damit findest du deine Bestellung jederzeit
            wieder.
          </p>
        )}

        {cancelled && (
          <p className="mt-6 rounded-sm border border-pomodoro/40 bg-pomodoro/5 px-4 py-3 text-sm text-pomodoro">
            Diese Bestellung wurde storniert. Der Abholtermin ist wieder freigegeben.
          </p>
        )}

        <section className="mt-10">
          <h2 className="font-heading text-2xl">Deine Pizzen</h2>
          <div className="mt-4 divide-y divide-border/70">
            {order.items.map((p, i) => (
              <div key={i} className="flex gap-4 py-5">
                <PizzaSvg ingredients={p.glyphs} className="h-24 w-24 shrink-0" shadow={false} label={p.pizzaName} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-heading text-xl">{p.pizzaName}</p>
                    <span className="text-sm">{formatEuro(p.price)}</span>
                  </div>
                  <p className="font-script text-[1.1rem] leading-snug text-pomodoro/90">{p.ingredients.join(' · ')}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {order.drinks.length > 0 && (
          <section className="mt-6">
            <h2 className="font-heading text-2xl">Getränke</h2>
            <ul className="mt-3 divide-y divide-border/60">
              {order.drinks.map((d, i) => (
                <li key={i} className="flex items-baseline justify-between py-2 text-sm">
                  <span>
                    {d.quantity} × {d.drinkName}
                  </span>
                  <span>{formatEuro(d.price)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-10 rounded-2xl border border-border/70 bg-secondary/50 p-6">
          <p className="font-heading text-lg">Bezahlung in bar bei Abholung</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {order.eventTitle} · Abholung {order.pickupStart}–{order.pickupEnd} Uhr. Zeig bei der Abholung einfach diese Seite – damit
            finden wir deine Bestellung sofort.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3">
            <Link to="/" className="inline-block text-[0.7rem] uppercase tracking-[0.24em] underline decoration-dotted underline-offset-4">
              Zurück zur Startseite
            </Link>
            {cancellable && (
              <button
                type="button"
                onClick={() => setCancelOpen(true)}
                className="text-[0.7rem] uppercase tracking-[0.24em] text-muted-foreground underline decoration-dotted underline-offset-4 hover:text-pomodoro"
              >
                Doch nicht? Bestellung stornieren
              </button>
            )}
          </div>
        </div>
      </main>
      <CancelDialog open={cancelOpen} onOpenChange={setCancelOpen} initialNumber={order.orderNumber} />
    </PageShell>
  )
}
