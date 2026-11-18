import { useState } from 'react'
import { cn } from '../../lib/cn.js'
import { formatEuro } from '../../lib/format.js'
import { Button, ErrorBox, Field, Panel, PageTitle, Toggle, inputClass, useAdmin } from './AdminUi.jsx'

const EMPTY = {
  name: '',
  description: '',
  basePrice: 10,
  defaultIngredients: [],
  optionalIngredients: [],
  onMenu: true,
  isActive: true,
  sortOrder: 0,
}

function Chips({ ingredients, selected, onToggle }) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {ingredients.map((i) => {
        const on = selected.includes(i.id)
        return (
          <button
            key={i.id}
            type="button"
            onClick={() => onToggle(i.id)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs transition',
              on ? 'border-pomodoro bg-pomodoro/10 text-pomodoro' : 'border-ink/20 text-ink/60 hover:border-ink/50',
            )}
          >
            {i.name}
            {i.price > 0 && <span className="ml-1 text-[0.65rem] opacity-70">+{formatEuro(i.price)}</span>}
          </button>
        )
      })}
    </div>
  )
}

export default function Pizzas() {
  const { state, reload, call } = useAdmin()
  const [draft, setDraft] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  if (!state) return null

  const patch = (p) => setDraft((d) => ({ ...d, ...p }))
  const toggleIn = (key, id) => {
    const list = draft[key] || []
    patch({ [key]: list.includes(id) ? list.filter((x) => x !== id) : [...list, id] })
  }
  const save = async () => {
    setError('')
    setSaving(true)
    try {
      await call('admin_save_pizza', { p_item: draft })
      setDraft(null)
      await reload()
    } catch (e) {
      setError(e.message || 'Speichern fehlgeschlagen.')
    } finally {
      setSaving(false)
    }
  }
  const remove = async (p) => {
    if (!window.confirm(`"${p.name}" wirklich löschen?`)) return
    try {
      await call('admin_delete_pizza', { p_id: p.id })
      await reload()
    } catch (e) {
      setError(e.message || 'Löschen fehlgeschlagen.')
    }
  }

  return (
    <div className="space-y-6">
      <PageTitle
        eyebrow="Wochenkarte"
        title="Pizzen"
        subtitle="Angelegte Pizzen bleiben gespeichert und lassen sich jede Woche neu auf die Karte setzen."
      >
        <Button onClick={() => setDraft({ ...EMPTY })}>Neue Pizza</Button>
      </PageTitle>
      <ErrorBox>{error}</ErrorBox>
      {draft && (
        <Panel title={draft.id ? 'Pizza bearbeiten' : 'Neue Pizza'}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name">
              <input className={inputClass} value={draft.name} onChange={(e) => patch({ name: e.target.value })} />
            </Field>
            <Field label="Grundpreis (€)">
              <input
                type="number"
                step="0.50"
                min="0"
                className={inputClass}
                value={draft.basePrice}
                onChange={(e) => patch({ basePrice: Number(e.target.value) })}
              />
            </Field>
            <Field label="Beschreibung" className="sm:col-span-2">
              <textarea rows={2} className={inputClass} value={draft.description || ''} onChange={(e) => patch({ description: e.target.value })} />
            </Field>
            <Field label="Reihenfolge">
              <input
                type="number"
                className={inputClass}
                value={draft.sortOrder || 0}
                onChange={(e) => patch({ sortOrder: Number(e.target.value) })}
              />
            </Field>
            <div className="flex flex-col justify-end gap-3">
              <Toggle checked={draft.onMenu !== false} onChange={(v) => patch({ onMenu: v })} label="Auf der Wochenkarte" />
              <Toggle checked={draft.isActive !== false} onChange={(v) => patch({ isActive: v })} label="Aktiv" />
            </div>
          </div>
          <div className="mt-5 space-y-4">
            <div>
              <p className="eyebrow">Standardzutaten</p>
              <Chips ingredients={state.ingredients} selected={draft.defaultIngredients || []} onToggle={(id) => toggleIn('defaultIngredients', id)} />
            </div>
            <div>
              <p className="eyebrow">Optionale Zutaten (gegen Aufpreis)</p>
              <Chips ingredients={state.ingredients} selected={draft.optionalIngredients || []} onToggle={(id) => toggleIn('optionalIngredients', id)} />
            </div>
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
      <Panel title="Alle Pizzen">
        <ul className="divide-y divide-border/70">
          {state.pizzas.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="font-heading text-lg">
                  {p.name} <span className="text-sm text-muted-foreground">{formatEuro(p.basePrice)}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {(p.onMenu === false ? 'nicht auf der Karte' : 'auf der Karte') + (p.isActive === false ? ' · inaktiv' : '')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setDraft({ ...EMPTY, ...p })}>
                  Bearbeiten
                </Button>
                <Button variant="danger" onClick={() => remove(p)}>
                  Löschen
                </Button>
              </div>
            </li>
          ))}
          {state.pizzas.length === 0 && <li className="py-3 text-sm text-muted-foreground">Noch keine Pizza angelegt.</li>}
        </ul>
      </Panel>
    </div>
  )
}
