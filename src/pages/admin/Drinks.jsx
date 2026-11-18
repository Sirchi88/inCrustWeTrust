import { useEffect, useRef, useState } from 'react'
import DrinkIllustration, { DRINK_ILLUSTRATIONS } from '../../components/DrinkIllustration.jsx'
import { formatEuro } from '../../lib/format.js'
import { Button, ErrorBox, Field, Panel, PageTitle, Toggle, decimalProps, inputClass, parseDecimal, useAdmin } from './AdminUi.jsx'

const EMPTY = { name: '', description: '', price: 2.5, illustration: 'cola', available: true }

export default function Drinks() {
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
    if (!price.ok) return setFormError('Der Preis muss eine Zahl sein – z. B. 2,50.')
    setSaving(true)
    try {
      await call('admin_save_drink', { p_item: { ...draft, price: price.value } })
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
      await call('admin_delete_drink', { p_id: item.id })
      await reload()
    } catch (e) {
      setError(e.message || 'Löschen fehlgeschlagen.')
    }
  }

  return (
    <div className="space-y-6">
      <PageTitle eyebrow="Getränke" title="Getränke">
        <Button onClick={() => edit({ ...EMPTY })}>Neues Getränk</Button>
      </PageTitle>
      <ErrorBox>{error}</ErrorBox>
      <div ref={formRef} className="scroll-mt-36">
        {draft && (
          <Panel title={draft.id ? 'Getränk bearbeiten' : 'Neues Getränk'}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name">
                <input className={inputClass} value={draft.name} onChange={(e) => patch({ name: e.target.value })} />
              </Field>
              <Field label="Beschreibung">
                <input className={inputClass} value={draft.description || ''} onChange={(e) => patch({ description: e.target.value })} />
              </Field>
              <Field label="Preis (€)">
                <input className={inputClass} value={draft.price ?? ''} onChange={(e) => patch({ price: e.target.value })} {...decimalProps} />
              </Field>
              <Field label="Illustration" hint="Bestimmt das Bild im Bestellformular.">
                <select className={inputClass} value={draft.illustration} onChange={(e) => patch({ illustration: e.target.value })}>
                  {DRINK_ILLUSTRATIONS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="flex items-end gap-4">
                <DrinkIllustration kind={draft.illustration} className="h-20 w-14" />
                <Toggle checked={draft.available !== false} onChange={(v) => patch({ available: v })} label="Verfügbar" />
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
      <Panel title="Alle Getränke">
        {state.drinks.length === 0 ? (
          <p className="text-sm text-muted-foreground">Noch keine Getränke angelegt.</p>
        ) : (
          <ul className="divide-y divide-border/70">
            {state.drinks.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3">
                <div className="flex min-w-[16rem] flex-1 items-center gap-3">
                  <DrinkIllustration kind={item.illustration} className="h-12 w-9" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-ink">
                      {item.name}
                      {item.available === false && <span className="ml-2 text-xs text-muted-foreground">nicht verfügbar</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.description ? `${item.description} · ` : ''}
                      {formatEuro(item.price)}
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
        )}
      </Panel>
    </div>
  )
}
