import { useEffect } from 'react'
import { cn } from '../../lib/cn.js'
import { formatDateLong } from '../../lib/format.js'
import { Button, useAdmin } from './AdminUi.jsx'

const FLOW = ['eingegangen', 'in_bearbeitung', 'abholbereit', 'abgeholt']
const NEXT_LABEL = { eingegangen: 'In Bearbeitung', in_bearbeitung: 'Abholbereit', abholbereit: 'Abgeholt' }

export default function Kitchen() {
  const { state, reload, call } = useAdmin()

  useEffect(() => {
    const t = setInterval(() => {
      if (document.visibilityState !== 'hidden') reload()
    }, 30000)
    return () => clearInterval(t)
  }, [reload])

  if (!state) return null
  const ev = state.events.find((e) => e.id === state.activeEventId) || state.events[0]
  const orders = state.orders.filter((o) => o.eventId === ev?.id && !['abgeholt', 'storniert'].includes(o.status))

  const advance = async (o) => {
    const next = FLOW[Math.min(FLOW.indexOf(o.status) + 1, FLOW.length - 1)]
    if (next === o.status) return
    await call('admin_set_order_status', { p_order_id: o.id, p_status: next })
    await reload()
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Küche</p>
          <h1 className="mt-1 font-heading text-3xl">{ev ? formatDateLong(ev.date) : 'Kein Termin'}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Nach Abholzeit sortiert · aktualisiert sich alle 30 Sekunden</p>
        </div>
        <Button variant="ghost" onClick={reload}>
          Jetzt aktualisieren
        </Button>
      </div>
      {orders.length === 0 ? (
        <div className="rounded-md border border-ink/12 bg-card p-10 text-center">
          <p className="font-heading text-xl">Noch keine offenen Bestellungen</p>
          <p className="mt-1 text-sm text-muted-foreground">Sobald jemand bestellt, erscheint es hier.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {orders.map((o, i) => {
            const first = i === 0
            return (
              <article
                key={o.id}
                className={cn('flex flex-col rounded-md border bg-card p-5', first ? 'border-pomodoro ring-2 ring-pomodoro/25' : 'border-ink/12')}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className={cn('font-heading leading-none', first ? 'text-5xl text-pomodoro' : 'text-4xl')}>{o.pickupLabel}</p>
                    <p className="mt-2 text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
                      {first ? 'Nächste Abholung' : o.orderNumber}
                    </p>
                  </div>
                  <span className="rounded-full bg-ink px-3 py-1 text-[0.6rem] uppercase tracking-[0.16em] text-paper">
                    {o.status === 'eingegangen' ? 'Neu' : o.status === 'in_bearbeitung' ? 'Im Ofen' : 'Fertig'}
                  </span>
                </div>
                <p className="mt-3 font-heading text-2xl">{o.customerName}</p>
                <div className="mt-3 space-y-2">
                  {o.items.map((it) => (
                    <div key={it.id}>
                      <p className="text-sm font-medium text-ink">{it.pizzaName}</p>
                      <p className="font-script text-[1.05rem] leading-snug text-pomodoro/90">{it.ingredients.join(' · ')}</p>
                    </div>
                  ))}
                  {o.drinks.length > 0 && (
                    <p className="text-sm text-muted-foreground">{o.drinks.map((d) => `${d.quantity}× ${d.drinkName}`).join(', ')}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => advance(o)}
                  className="mt-4 w-full rounded-full bg-ink px-4 py-3 text-[0.68rem] uppercase tracking-[0.2em] text-paper transition hover:bg-pomodoro disabled:opacity-40"
                >
                  {NEXT_LABEL[o.status] || 'Abschließen'}
                </button>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
