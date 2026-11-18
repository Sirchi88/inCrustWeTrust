import { useMemo, useState } from 'react'
import { formatDateLong, formatNumber, UNIT_LABELS } from '../../lib/format.js'
import { buildShoppingList } from './reports.js'
import { Button, EventSelect, Panel, useAdmin } from './AdminUi.jsx'

async function exportPdf(list) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF()
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('Einkaufsliste', 14, 20)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`${list.event ? formatDateLong(list.event.date) : ''} · ${list.pizzaCount} Pizzen · Reserve ${list.reservePercent}%`, 14, 27)
  let y = 38
  doc.setFont('helvetica', 'bold')
  doc.text('Zutaten', 14, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  for (const it of list.items) {
    doc.text(`${it.name}`, 14, y)
    doc.text(`${formatNumber(it.amount)} ${UNIT_LABELS[it.unit] || it.unit}`, 120, y)
    y += 6
    if (y > 270) {
      doc.addPage()
      y = 20
    }
  }
  if (list.drinks.length > 0) {
    y += 4
    doc.setFont('helvetica', 'bold')
    doc.text('Getränke', 14, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    for (const d of list.drinks) {
      doc.text(`${d.quantity} × ${d.name}`, 14, y)
      y += 6
    }
  }
  doc.save(`einkaufsliste-${list.event?.date || 'termin'}.pdf`)
}

export default function Shopping() {
  const { state } = useAdmin()
  const [picked, setPicked] = useState(null)
  const [reserve, setReserve] = useState(null)
  const eventId = picked || state?.activeEventId || state?.events?.[0]?.id || null
  const reservePercent = reserve === null ? (state?.settings?.reservePercent ?? 0) : reserve
  const list = useMemo(() => (state && eventId ? buildShoppingList(state, eventId, reservePercent) : null), [state, eventId, reservePercent])
  if (!state) return null

  return (
    <div className="space-y-5">
      <div className="no-print flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Einkauf</p>
          <h1 className="mt-1 font-heading text-3xl">Was muss auf den Markt</h1>
          <p className="mt-1 text-sm text-muted-foreground">Automatisch aus allen Bestellungen berechnet – stornierte Bestellungen zählen nicht.</p>
        </div>
        <EventSelect events={state.events} value={eventId} onChange={setPicked} format={formatDateLong} />
      </div>
      <Panel className="no-print">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1">
            <div className="flex items-baseline justify-between">
              <span className="eyebrow">Reserveaufschlag</span>
              <span className="font-heading text-xl">{reservePercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="1"
              value={reservePercent}
              onChange={(e) => setReserve(Number(e.target.value))}
              className="mt-2 w-full accent-[#bc2c1a]"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => window.print()}>
              Drucken
            </Button>
            <Button onClick={() => list && exportPdf(list)} disabled={!list || list.items.length === 0}>
              PDF
            </Button>
          </div>
        </div>
      </Panel>
      {!list || list.items.length === 0 ? (
        <Panel>
          <p className="text-sm text-muted-foreground">Für diesen Termin gibt es noch keine Bestellungen.</p>
        </Panel>
      ) : (
        <div className="space-y-5">
          <Panel
            title={list.event ? formatDateLong(list.event.date) : 'Einkaufsliste'}
            description={`${list.pizzaCount} Pizzen aus ${list.orderCount} Bestellungen · inkl. ${list.reservePercent}% Reserve`}
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/80 text-left text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
                  <th className="py-2">Zutat</th>
                  <th className="py-2 text-right">Pizzen</th>
                  <th className="py-2 text-right">Menge</th>
                </tr>
              </thead>
              <tbody>
                {list.items.map((it) => (
                  <tr key={it.id} className="border-b border-border/50">
                    <td className="py-2.5">{it.name}</td>
                    <td className="py-2.5 text-right text-muted-foreground">{it.pizzas}</td>
                    <td className="py-2.5 text-right font-medium">
                      {formatNumber(it.amount)} {UNIT_LABELS[it.unit] || it.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
          {list.drinks.length > 0 && (
            <Panel title="Getränke">
              <ul className="divide-y divide-border/60">
                {list.drinks.map((d) => (
                  <li key={d.name} className="flex items-center justify-between py-2 text-sm">
                    <span>{d.name}</span>
                    <span className="font-medium">{d.quantity} ×</span>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>
      )}
    </div>
  )
}
