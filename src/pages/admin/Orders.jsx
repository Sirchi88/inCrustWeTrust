import { useMemo, useState } from 'react'
import { cn } from '../../lib/cn.js'
import { formatDateLong, formatEuro } from '../../lib/format.js'
import { Button, EventSelect, Panel, PageTitle, STATUSES, STATUS_LABELS, StatusBadge, inputClass, useAdmin } from './AdminUi.jsx'

function OrderCard({ order }) {
  const { call, reload } = useAdmin()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(order.customerName)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const setStatus = async (status) => {
    setBusy(true)
    setError('')
    try {
      await call('admin_set_order_status', { p_order_id: order.id, p_status: status })
      await reload()
    } catch (e) {
      setError(e.message || 'Status konnte nicht geändert werden.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={cn('rounded-md border bg-card p-5', order.status === 'storniert' ? 'border-red-200 bg-red-50/40' : 'border-ink/12')}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-heading text-2xl">{order.pickupLabel}</span>
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{order.orderNumber}</span>
            <StatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-sm">{order.customerName}</p>
        </div>
        <div className="text-right">
          <p className="font-heading text-xl">{formatEuro(order.total)}</p>
          <p className="text-xs text-muted-foreground">
            {order.pizzaCount} Pizza{order.pizzaCount === 1 ? '' : 'en'}
          </p>
        </div>
      </div>
      <ul className="mt-3 space-y-1.5">
        {order.items.map((it) => (
          <li key={it.id} className="text-sm">
            <span className="text-ink">{it.pizzaName}</span>
            <span className="ml-2 font-script text-[1.05rem] text-pomodoro/90">{it.ingredients.join(' · ')}</span>
          </li>
        ))}
        {order.drinks.map((d) => (
          <li key={d.id} className="text-sm text-muted-foreground">
            {d.quantity} × {d.drinkName}
          </li>
        ))}
      </ul>
      {order.note && <p className="mt-2 rounded-sm bg-muted/60 px-3 py-2 text-xs text-ink/70">Hinweis: {order.note}</p>}
      {editing ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
          <div className="flex gap-2 sm:col-span-2">
            <Button
              disabled={busy}
              onClick={async () => {
                setBusy(true)
                setError('')
                try {
                  await call('admin_update_order_customer', { p_order_id: order.id, p_name: name })
                  setEditing(false)
                  await reload()
                } catch (e) {
                  setError(e.message || 'Änderung fehlgeschlagen.')
                } finally {
                  setBusy(false)
                }
              }}
            >
              Speichern
            </Button>
            <Button variant="ghost" onClick={() => setEditing(false)}>
              Abbrechen
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              disabled={busy}
              onClick={() => setStatus(s)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.14em] transition',
                order.status === s ? 'border-ink bg-ink text-paper' : 'border-ink/20 text-ink/60 hover:border-ink/50',
              )}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="ml-auto text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground underline decoration-dotted underline-offset-4"
          >
            Kundendaten ändern
          </button>
        </div>
      )}
      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
    </div>
  )
}

export default function Orders() {
  const { state } = useAdmin()
  const [picked, setPicked] = useState(null)
  const eventId = picked || state?.activeEventId || state?.events?.[0]?.id || null
  const ev = state?.events.find((e) => e.id === eventId)
  const orders = useMemo(() => (state?.orders || []).filter((o) => o.eventId === eventId), [state, eventId])
  if (!state) return null

  return (
    <div className="space-y-6">
      <PageTitle eyebrow="Bestellungen" title="Wer bekommt was" subtitle={ev ? formatDateLong(ev.date) : undefined}>
        <EventSelect events={state.events} value={eventId} onChange={setPicked} format={formatDateLong} />
      </PageTitle>
      {orders.length === 0 ? (
        <Panel>
          <p className="text-sm text-muted-foreground">Für diesen Termin gibt es noch keine Bestellungen.</p>
        </Panel>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </div>
      )}
    </div>
  )
}
