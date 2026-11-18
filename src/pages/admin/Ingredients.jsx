import { useEffect, useRef, useState } from 'react'
import { GLYPH_LABELS, GlyphIcon } from '../../components/glyphs.jsx'
import { formatEuro, formatNumber } from '../../lib/format.js'
import { Button, ErrorBox, Field, Panel, PageTitle, Toggle, decimalProps, inputClass, parseDecimal, useAdmin } from './AdminUi.jsx'

const EMPTY = { name: '', description: '', glyph: 'mozzarella', price: 0, unit: 'g', amountPerPizza: 50, isActive: true, isSauce: false }
const UNITS = [
  { value: 'g', label: 'Gramm' },
  { value: 'kg', label: 'Kilogramm' },
  { value: 'ml', label: 'Milliliter' },
  { value: 'l', label: 'Liter' },
  { value: 'stueck', label: 'Stück' },
]

export default function Ingredients() {
  const { state, reload, call } = useAdmin()
  const [draft, setDraft] = useState(null)
  const [scrollTick, setScrollTick] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const formRef = useRef(null)

  useEffect(() => {
    if (scrollTick > 0) formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [scrollTick])
  if (!state) return null

  const patch = (p) => setDraft((d) => ({ ...d, ...p }))
  const edit = (item) => {
    setDraft(item)
    setFormError('')
    setScrollTick((n) => n + 1)
  }
  const save = async () => {
    setError('')
    setFormError('')
    const price = parseDecimal(draft.price)
    if (!price.ok) return setFormError('Der Aufpreis muss eine Zahl sein – z. B. 1,50.')
    const amount = parseDecimal(draft.amountPerPizza)
    if (!amount.ok) return setFormError('Die Menge pro Pizza muss eine Zahl sein – z. B. 50.')
    setSaving(true)
    try {
      await call('admin_save_ingredient', { p_item: { ...draft, price: price.value, amountPerPizza: amount.value } })
      setDraft(null)
      await reload()
    } catch (e) {
      setFormError(e.message || 'Speichern fehlgeschlagen.')
    } finally {
      setSaving(false)
    }
  }
  const remove = async (item) => {
    if (!window.confirm(`"${item.name}" wirklich löschen?`)) return
    try {
      await call('admin_delete_ingredient', { p_id: item.id })
      await reload()
    } catch (e) {
      setError(e.message || 'Löschen fehlgeschlagen.')
    }
  }

  return (
    <div className="space-y-6">
      <PageTitle eyebrow="Zutaten" title="Belag & Verbrauch" subtitle="Menge pro Pizza ist die Grundlage für die automatische Einkaufsliste.">
        <Button onClick={() => edit({ ...EMPTY })}>Neue Zutat</Button>
      </PageTitle>
      <ErrorBox>{error}</ErrorBox>
      <div ref={formRef} className="scroll-mt-36">
        {draft && (
          <Panel title={draft.id ? 'Zutat bearbeiten' : 'Neue Zutat'}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name">
                <input className={inputClass} value={draft.name} onChange={(e) => patch({ name: e.target.value })} />
              </Field>
              <Field label="Beschreibung">
                <input className={inputClass} value={draft.description || ''} onChange={(e) => patch({ description: e.target.value })} />
              </Field>
              <Field label="Aufpreis (€)">
                <input className={inputClass} value={draft.price ?? ''} onChange={(e) => patch({ price: e.target.value })} {...decimalProps} />
              </Field>
              <Field label="Menge pro Pizza">
                <div className="mt-1.5 flex gap-2">
                  <input
                    className="w-full rounded-sm border border-ink/20 bg-card px-3 py-2.5 text-base outline-none focus:border-pomodoro sm:text-sm"
                    value={draft.amountPerPizza ?? ''}
                    onChange={(e) => patch({ amountPerPizza: e.target.value })}
                    {...decimalProps}
                  />
                  <select
                    className="rounded-sm border border-ink/20 bg-card px-2 py-2.5 text-base outline-none focus:border-pomodoro sm:text-sm"
                    value={draft.unit}
                    onChange={(e) => patch({ unit: e.target.value })}
                  >
                    {UNITS.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </div>
              </Field>
              <Field label="Grafik">
                <select className={inputClass} value={draft.glyph} onChange={(e) => patch({ glyph: e.target.value })}>
                  {Object.entries(GLYPH_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="flex flex-wrap items-end gap-4">
                <GlyphIcon glyph={draft.glyph} className="h-12 w-12" viewBox="-30 -30 60 60" />
                <Toggle checked={draft.isActive !== false} onChange={(v) => patch({ isActive: v })} label="Aktiv" />
                <Toggle
                  checked={!!draft.isSauce}
                  onChange={(v) => patch({ isSauce: v })}
                  label="Ist die Soße"
                  hint="Immer inklusive, nicht abwählbar."
                />
              </div>
            </div>
            <ErrorBox className="mt-4 px-3 py-2">{formError}</ErrorBox>
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
      </div>
      <Panel title="Alle Zutaten">
        <ul className="divide-y divide-border/70">
          {state.ingredients.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3">
              <div className="flex min-w-[16rem] flex-1 items-center gap-3">
                <GlyphIcon glyph={item.glyph} className="h-9 w-9" viewBox="-30 -30 60 60" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-ink">
                    {item.name}
                    {item.isSauce && <span className="ml-2 text-xs text-pomodoro">Soße</span>}
                    {item.isActive === false && <span className="ml-2 text-xs text-muted-foreground">inaktiv</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(item.amountPerPizza)} {item.unit === 'stueck' ? 'Stück' : item.unit} pro Pizza ·{' '}
                    {item.price > 0 ? `+${formatEuro(item.price)}` : 'ohne Aufpreis'}
                  </p>
                </div>
              </div>
              <div className="ml-auto flex gap-2">
                <Button variant="ghost" onClick={() => edit({ ...EMPTY, ...item })}>
                  Bearbeiten
                </Button>
                <Button variant="danger" onClick={() => remove(item)}>
                  Löschen
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}
