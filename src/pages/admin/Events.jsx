import { useState } from 'react'
import Modal, { ModalFooter, ModalHeader } from '../../components/Modal.jsx'
import { AlertTriangle } from '../../components/icons.jsx'
import { formatDateLong } from '../../lib/format.js'
import { Button, ErrorBox, Field, Panel, PageTitle, StatusBadge, Toggle, inputClass, isOpenOrder, useAdmin } from './AdminUi.jsx'

const EMPTY = {
  title: 'Pizza-Abend',
  date: '',
  pickupStart: '18:00',
  pickupEnd: '21:00',
  orderDeadline: '',
  ordersOpen: true,
  notes: '',
}

// Bestätigungsfenster zum Löschen. Bei offenen Bestellungen gibt es eine
// deutliche Warnung und eine zusätzliche Checkbox als Sicherheitsstufe.
function DeleteEventDialog({ event, orders, onClose, onDeleted }) {
  const { call } = useAdmin()
  const [confirmed, setConfirmed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  if (!event) return null

  const open = orders.filter(isOpenOrder)
  const hasOpen = open.length > 0
  const total = orders.length

  const remove = async () => {
    setBusy(true)
    setError('')
    try {
      await call('admin_delete_event', { p_event_id: event.id, p_force: hasOpen })
      onDeleted()
    } catch (e) {
      setError(e.message || 'Löschen fehlgeschlagen.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open onClose={onClose} className="max-w-lg rounded-2xl">
      <ModalHeader
        className="font-heading text-xl uppercase tracking-[0.08em]"
        title="Termin löschen?"
        description={
          <>
            <span className="font-medium text-ink">{formatDateLong(event.date)}</span>
            {event.title ? ` · ${event.title}` : ''}
          </>
        }
      />

      {hasOpen ? (
        <div className="space-y-3 rounded-xl border border-red-300 bg-red-50 px-4 py-4 text-sm text-red-800">
          <p className="flex items-start gap-2 font-medium">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            Achtung: Für diesen Termin {open.length === 1 ? 'ist noch 1 Bestellung' : `sind noch ${open.length} Bestellungen`} offen!
          </p>
          <ul className="max-h-40 space-y-1.5 overflow-y-auto pl-6">
            {open.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center gap-2">
                <span className="font-heading">{o.pickupLabel}</span>
                <span>{o.customerName}</span>
                <span className="text-red-700/70">
                  · {o.pizzaCount} Pizza{o.pizzaCount === 1 ? '' : 'en'}
                </span>
                <StatusBadge status={o.status} />
              </li>
            ))}
          </ul>
          <p className="text-red-700/90">
            Die Kunden werden <strong>nicht</strong> automatisch benachrichtigt. Gib ihnen am besten vorher Bescheid.
          </p>
          <label className="flex cursor-pointer items-start gap-2 pt-1">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-red-700"
            />
            <span>Ich weiß, dass noch Bestellungen offen sind, und möchte den Termin trotzdem löschen.</span>
          </label>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Für diesen Termin gibt es keine offenen Bestellungen.</p>
      )}

      <p className="text-xs text-muted-foreground">
        {total > 0
          ? `Der Termin und alle ${total} zugehörigen Bestellung${total === 1 ? '' : 'en'} (auch abgeholte und stornierte) werden endgültig gelöscht und verschwinden aus der Auswertung.`
          : 'Der Termin wird endgültig gelöscht.'}{' '}
        Das lässt sich nicht rückgängig machen.
      </p>

      <ErrorBox>{error}</ErrorBox>

      <ModalFooter className="gap-2">
        <Button variant="ghost" onClick={onClose}>
          Abbrechen
        </Button>
        <Button variant="dangerSolid" disabled={busy || (hasOpen && !confirmed)} onClick={remove}>
          {busy ? 'Lösche …' : hasOpen ? 'Trotzdem löschen' : 'Endgültig löschen'}
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default function Events() {
  const { state, reload, call } = useAdmin()
  const [draft, setDraft] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [toDelete, setToDelete] = useState(null)
  if (!state) return null

  const patch = (p) => setDraft((d) => ({ ...d, ...p }))
  const save = async () => {
    setError('')
    setNotice('')
    setSaving(true)
    try {
      await call('admin_save_event', { p_event: draft })
      setDraft(null)
      await reload()
    } catch (e) {
      setError(e.message || 'Speichern fehlgeschlagen.')
    } finally {
      setSaving(false)
    }
  }
  const toggleOpen = async (ev) => {
    setError('')
    try {
      await call('admin_set_event_open', { p_event_id: ev.id, p_open: ev.ordersOpen === false })
      await reload()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="space-y-6">
      <PageTitle eyebrow="Termine" title="Pizza-Abende">
        <Button onClick={() => setDraft({ ...EMPTY })}>Neuer Termin</Button>
      </PageTitle>
      <ErrorBox>{error}</ErrorBox>
      {notice && <p className="rounded-sm border border-basilico/30 bg-basilico/10 px-4 py-3 text-sm text-basilico">{notice}</p>}

      {draft && (
        <Panel title={draft.id ? 'Termin bearbeiten' : 'Neuer Termin'}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Bezeichnung">
              <input className={inputClass} value={draft.title} onChange={(e) => patch({ title: e.target.value })} />
            </Field>
            <Field label="Datum">
              <input type="date" className={inputClass} value={draft.date} onChange={(e) => patch({ date: e.target.value })} />
            </Field>
            <Field label="Abholung ab">
              <input type="time" className={inputClass} value={draft.pickupStart} onChange={(e) => patch({ pickupStart: e.target.value })} />
            </Field>
            <Field label="Abholung bis">
              <input type="time" className={inputClass} value={draft.pickupEnd} onChange={(e) => patch({ pickupEnd: e.target.value })} />
            </Field>
            <Field label="Bestellschluss" hint="Danach sind keine Bestellungen mehr möglich.">
              <input
                type="datetime-local"
                className={inputClass}
                value={draft.orderDeadline || ''}
                onChange={(e) => patch({ orderDeadline: e.target.value })}
              />
            </Field>
            <div className="flex items-end">
              <Toggle
                checked={draft.ordersOpen !== false}
                onChange={(v) => patch({ ordersOpen: v })}
                label="Bestellungen geöffnet"
                hint="Kann jederzeit umgeschaltet werden."
              />
            </div>
            <Field label="Notiz" className="sm:col-span-2">
              <textarea rows={2} className={inputClass} value={draft.notes || ''} onChange={(e) => patch({ notes: e.target.value })} />
            </Field>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button onClick={save} disabled={saving}>
              {saving ? 'Speichern …' : 'Speichern'}
            </Button>
            <Button variant="ghost" onClick={() => setDraft(null)}>
              Abbrechen
            </Button>
          </div>
        </Panel>
      )}

      <Panel title="Alle Termine" description="Vergangene Termine bleiben für die Auswertung erhalten, bis du sie löschst.">
        {state.events.length === 0 ? (
          <p className="text-sm text-muted-foreground">Noch kein Termin angelegt.</p>
        ) : (
          <ul className="divide-y divide-border/70">
            {state.events.map((ev) => {
              const open = ev.ordersOpen !== false
              const evOrders = state.orders.filter((o) => o.eventId === ev.id)
              const openCount = evOrders.filter(isOpenOrder).length
              return (
                <li key={ev.id} className="flex flex-wrap items-center gap-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-heading text-lg">{formatDateLong(ev.date)}</p>
                    <p className="text-xs text-muted-foreground">
                      {ev.title || 'Pizza-Abend'} · Abholung {ev.pickupStart}–{ev.pickupEnd} · {open ? 'geöffnet' : 'geschlossen'}
                      {evOrders.length > 0 && (
                        <>
                          {' '}
                          · {evOrders.length} Bestellung{evOrders.length === 1 ? '' : 'en'}
                          {openCount > 0 && <span className="text-pomodoro"> ({openCount} offen)</span>}
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="ghost" onClick={() => toggleOpen(ev)}>
                      {open ? 'Schließen' : 'Öffnen'}
                    </Button>
                    <Button variant="ghost" onClick={() => setDraft({ ...EMPTY, ...ev })}>
                      Bearbeiten
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => {
                        setNotice('')
                        setToDelete(ev)
                      }}
                    >
                      Löschen
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Panel>

      {toDelete && (
        <DeleteEventDialog
          event={toDelete}
          orders={state.orders.filter((o) => o.eventId === toDelete.id)}
          onClose={() => setToDelete(null)}
          onDeleted={async () => {
            setNotice(`Termin vom ${formatDateLong(toDelete.date)} wurde gelöscht.`)
            if (draft?.id === toDelete.id) setDraft(null)
            setToDelete(null)
            await reload()
          }}
        />
      )}
    </div>
  )
}
