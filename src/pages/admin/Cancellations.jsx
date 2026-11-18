import { formatDateLong, formatEuro, formatTimestamp } from '../../lib/format.js'
import { Panel, StatusBadge, useAdmin } from './AdminUi.jsx'

const VIA = { kunde: 'vom Kunden', admin: 'im Chefsache-Bereich' }

function Row({ label, children, className = '' }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border/60 pb-1.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={className}>{children}</dd>
    </div>
  )
}

export default function Cancellations() {
  const { state } = useAdmin()
  if (!state) return null
  const list = state.orders
    .filter((o) => o.status === 'storniert')
    .sort((a, b) => String(b.canceledAt || b.updated_date).localeCompare(String(a.canceledAt || a.updated_date)))

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Stornierungen</p>
        <h1 className="mt-1 font-heading text-3xl">Was abgesagt wurde</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {list.length === 0
            ? 'Noch keine Stornierungen.'
            : `${list.length} stornierte Bestellung${list.length === 1 ? '' : 'en'} – die Originalbestellungen bleiben in der Historie erhalten.`}
        </p>
      </div>
      {list.length === 0 ? (
        <Panel>
          <p className="text-sm text-muted-foreground">Sobald jemand eine Bestellung storniert, erscheint sie hier mit Datum und Uhrzeit.</p>
        </Panel>
      ) : (
        <div className="space-y-3">
          {list.map((o) => (
            <div key={o.id} className="rounded-md border border-red-200 bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-heading text-lg uppercase tracking-[0.08em]">{o.orderNumber}</span>
                    <StatusBadge status={o.status} />
                  </div>
                  <p className="mt-1 text-sm">{o.customerName}</p>
                </div>
                <p className="font-heading text-lg text-muted-foreground line-through">{formatEuro(o.total)}</p>
              </div>
              <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                <Row label="Bestellt am">{formatTimestamp(o.created_date)}</Row>
                <Row label="Storniert am" className="text-right">
                  {formatTimestamp(o.canceledAt)}
                  {o.canceledVia ? ` (${VIA[o.canceledVia] || o.canceledVia})` : ''}
                </Row>
                <Row label="Pizza-Session" className="text-right">
                  {formatDateLong(o.eventDate)}
                </Row>
                <Row label="Abholzeit">{o.pickupLabel} Uhr</Row>
              </dl>
              <ul className="mt-3 space-y-1">
                {o.items.map((it) => (
                  <li key={it.id} className="text-sm text-muted-foreground">
                    <span className="text-ink">{it.pizzaName}</span>
                    <span className="ml-2 font-script text-[1.05rem] text-pomodoro/90">{it.ingredients.join(' · ')}</span>
                  </li>
                ))}
                {o.drinks.map((d) => (
                  <li key={d.id} className="text-sm text-muted-foreground">
                    {d.quantity} × {d.drinkName}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
