import { Link } from 'react-router-dom'
import { formatDateLong, formatDateTime, formatEuro } from '../../lib/format.js'
import { buildReport } from './reports.js'
import { Button, Panel, PageTitle, Stat, StatusBadge, isOpenOrder, useAdmin } from './AdminUi.jsx'

export default function Dashboard() {
  const { state, reload, call } = useAdmin()
  if (!state) return null
  const ev = state.events.find((e) => e.id === state.activeEventId) || state.events[0] || null
  const report = ev ? buildReport(state, ev.id) : null
  const open = ev ? ev.ordersOpen !== false : false
  const upcoming = state.orders.filter((o) => o.eventId === ev?.id && isOpenOrder(o)).slice(0, 6)

  return (
    <div className="space-y-6">
      <PageTitle eyebrow="Chefsache" title="Das läuft heute">
        <div className="flex gap-2">
          <Link to="/chefsache/kueche">
            <Button variant="ghost">Küchenansicht</Button>
          </Link>
          <Link to="/chefsache/bestellungen">
            <Button>Bestellungen</Button>
          </Link>
        </div>
      </PageTitle>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Bestellungen" value={report?.orderCount ?? 0} hint={`${report?.cancelledCount ?? 0} storniert`} />
        <Stat label="Pizzen" value={report?.pizzaCount ?? 0} hint="alle Bestellungen zusammen" />
        <Stat label="Umsatz" value={formatEuro(report?.revenue ?? 0)} hint="ohne stornierte Bestellungen" />
        <Stat label="Getränke" value={report?.drinkQuantity ?? 0} hint={`${formatEuro(report?.drinkRevenue ?? 0)} Umsatz`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <Panel
          title="Nächster Termin"
          actions={
            ev && (
              <Button
                variant={open ? 'danger' : 'primary'}
                onClick={async () => {
                  await call('admin_set_event_open', { p_event_id: ev.id, p_open: !open })
                  await reload()
                }}
              >
                {open ? 'Bestellungen schließen' : 'Bestellungen öffnen'}
              </Button>
            )
          }
        >
          {ev ? (
            <div className="space-y-2 text-sm">
              <p className="font-heading text-xl">{formatDateLong(ev.date)}</p>
              <p className="text-muted-foreground">
                Abholung {ev.pickupStart}–{ev.pickupEnd} Uhr · Bestellschluss {formatDateTime(ev.orderDeadline) || '–'}
              </p>
              <p className="pt-1">
                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.62rem] uppercase tracking-[0.2em] ${
                    open ? 'border-basilico/35 bg-basilico/10 text-basilico' : 'border-pomodoro/35 bg-pomodoro/10 text-pomodoro'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${open ? 'bg-basilico' : 'bg-pomodoro'}`} />
                  {open ? 'Bestellungen geöffnet' : 'Bestellungen geschlossen'}
                </span>
              </p>
              {ev.notes && <p className="pt-2 text-muted-foreground">{ev.notes}</p>}
              <Link
                to="/chefsache/termine"
                className="inline-block pt-3 text-[0.68rem] uppercase tracking-[0.2em] underline decoration-dotted underline-offset-4"
              >
                Termin bearbeiten
              </Link>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Noch kein Termin angelegt.</p>
          )}
        </Panel>

        <Panel title="Nächste Abholungen" description="Chronologisch nach Abholzeit.">
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">Noch keine offenen Bestellungen.</p>
          ) : (
            <ul className="divide-y divide-border/70">
              {upcoming.map((o) => (
                <li key={o.id} className="flex items-center gap-4 py-3">
                  <span className="font-heading text-xl">{o.pickupLabel}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{o.customerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {o.pizzaCount} Pizza{o.pizzaCount === 1 ? '' : 'en'} · {formatEuro(o.total)}
                    </p>
                  </div>
                  <StatusBadge status={o.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {report && report.popularPizzas.length > 0 && (
        <Panel title="Beliebteste Pizzen" description={`Für ${formatDateLong(report.date)}`}>
          <ul className="divide-y divide-border/70">
            {report.popularPizzas.map((p) => (
              <li key={p.name} className="flex items-center justify-between py-2.5 text-sm">
                <span>{p.name}</span>
                <span className="text-muted-foreground">{p.count} ×</span>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  )
}
