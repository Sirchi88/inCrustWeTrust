import { useMemo, useState } from 'react'
import { formatDateLong, formatDateShort, formatEuro, formatNumber, UNIT_LABELS } from '../../lib/format.js'
import { buildReports } from './reports.js'
import { Panel, PageTitle, Stat, useAdmin } from './AdminUi.jsx'

export default function Analytics() {
  const { state } = useAdmin()
  const [picked, setPicked] = useState(null)
  const reports = useMemo(() => (state ? buildReports(state) : []), [state])
  if (!state) return null
  const id = picked || state.activeEventId || reports[0]?.eventId || null
  const r = reports.find((x) => x.eventId === id) || null

  return (
    <div className="space-y-5">
      <PageTitle eyebrow="Auswertung" title="Zahlen & Historie" subtitle="Stornierte Bestellungen zählen nicht als Verkauf.">
        <select className="rounded-sm border border-ink/20 bg-card px-3 py-2.5 text-sm" value={id || ''} onChange={(e) => setPicked(e.target.value)}>
          {reports.map((x) => (
            <option key={x.eventId} value={x.eventId}>
              {formatDateLong(x.date)}
            </option>
          ))}
        </select>
      </PageTitle>
      {r && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Umsatz" value={formatEuro(r.revenue)} hint={`${r.cancelledCount} storniert`} />
            <Stat label="Pizzen verkauft" value={r.pizzaCount} />
            <Stat label="Bestellungen" value={r.orderCount} />
            <Stat label="Getränke" value={r.drinkQuantity} hint={formatEuro(r.drinkRevenue)} />
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <Panel title="Beliebteste Pizzen">
              {r.popularPizzas.length === 0 ? (
                <p className="text-sm text-muted-foreground">Noch keine Verkäufe.</p>
              ) : (
                <ul className="divide-y divide-border/60">
                  {r.popularPizzas.map((p) => (
                    <li key={p.name} className="flex items-center justify-between gap-3 py-2 text-sm">
                      <span>{p.name}</span>
                      <span className="shrink-0 font-medium">{p.count} ×</span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
            <Panel title="Verbrauchte Zutaten">
              {r.ingredientUsage.length === 0 ? (
                <p className="text-sm text-muted-foreground">Noch keine Verkäufe.</p>
              ) : (
                <ul className="divide-y divide-border/60">
                  {r.ingredientUsage.map((u) => (
                    <li key={u.id} className="flex items-center justify-between py-2 text-sm">
                      <span>{u.name}</span>
                      <span className="font-medium">
                        {formatNumber(u.amount)} {UNIT_LABELS[u.unit] || u.unit}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>
          <Panel title="Getränkeverkäufe">
            {r.drinkSales.length === 0 ? (
              <p className="text-sm text-muted-foreground">Keine Getränke verkauft.</p>
            ) : (
              <ul className="divide-y divide-border/60">
                {r.drinkSales.map((d) => (
                  <li key={d.name} className="flex items-center justify-between py-2 text-sm">
                    <span>{d.name}</span>
                    <span className="text-muted-foreground">
                      {d.quantity} × · {formatEuro(d.revenue)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </>
      )}
      <Panel title="Alle Veranstaltungen">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-border/80 text-left text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
                <th className="py-2">Datum</th>
                <th className="py-2 text-right">Bestellungen</th>
                <th className="py-2 text-right">Pizzen</th>
                <th className="py-2 text-right">Getränke</th>
                <th className="py-2 text-right">Umsatz</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((x) => (
                <tr key={x.eventId} className="border-b border-border/50">
                  <td className="py-2.5">{formatDateShort(x.date)}</td>
                  <td className="py-2.5 text-right">{x.orderCount}</td>
                  <td className="py-2.5 text-right">{x.pizzaCount}</td>
                  <td className="py-2.5 text-right">{x.drinkQuantity}</td>
                  <td className="py-2.5 text-right font-medium">{formatEuro(x.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}
