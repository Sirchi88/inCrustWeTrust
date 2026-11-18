import { useState } from 'react'
import { Button, Field, Panel, inputClass, useAdmin } from './AdminUi.jsx'

export default function Settings() {
  const { state, reload, call } = useAdmin()
  const [draft, setDraft] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [username, setUsername] = useState('')
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [credBusy, setCredBusy] = useState(false)
  const [credOk, setCredOk] = useState('')
  const [credErr, setCredErr] = useState('')
  const [testMsg, setTestMsg] = useState('')
  if (!state) return null
  const s = draft || state.settings
  const set = (p) => setDraft({ ...s, ...p })

  const saveSettings = async () => {
    setSaving(true)
    setSaveMsg('')
    try {
      await call('admin_save_settings', { p_settings: s })
      await reload()
      setDraft(null)
      setSaveMsg('Gespeichert.')
    } catch (e) {
      setSaveMsg(e.message || 'Speichern fehlgeschlagen.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="eyebrow">Einstellungen</p>
        <h1 className="mt-1 font-heading text-3xl">Alles verstellbar</h1>
        <p className="mt-1 text-sm text-muted-foreground">Preise, Mengen und Zeiten liegen in der Datenbank – nichts davon ist fest im Code.</p>
      </div>

      <Panel title="Bestellregeln & Einkauf">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Grundpreis pro Pizza (€)" hint="Teig und Tomatensauce – Zutaten kommen obendrauf.">
            <input type="number" min="0" max="40" step="0.1" className={inputClass} value={s.basePrice} onChange={(e) => set({ basePrice: Number(e.target.value) })} />
          </Field>
          <Field label="Reserveaufschlag Einkauf (%)">
            <input type="number" min="0" max="50" className={inputClass} value={s.reservePercent} onChange={(e) => set({ reservePercent: Number(e.target.value) })} />
          </Field>
          <Field label="Maximalbelegung (Zutaten pro Pizza)" hint="Gilt für den Pizza-Builder.">
            <input type="number" min="1" max="15" className={inputClass} value={s.maxToppings} onChange={(e) => set({ maxToppings: Number(e.target.value) })} />
          </Field>
          <Field label="Pizzen pro Bestellung">
            <select className={inputClass} value={s.maxPizzasPerOrder} onChange={(e) => set({ maxPizzasPerOrder: Number(e.target.value) })}>
              <option value={1}>1 Pizza</option>
              <option value={2}>2 Pizzen</option>
              <option value={3}>3 Pizzen</option>
            </select>
          </Field>
          <Field label="Abholslot-Takt">
            <select className={inputClass} value={s.slotMinutes} onChange={(e) => set({ slotMinutes: Number(e.target.value) })}>
              {[5, 10, 15, 20].map((m) => (
                <option key={m} value={m}>
                  {m} Minuten
                </option>
              ))}
            </select>
          </Field>
          <Field label="Online-Stornierung bis (Stunden vorher)" hint="Bis wie viele Stunden vor Abholbeginn Gäste selbst stornieren können.">
            <input type="number" min="0" max="72" className={inputClass} value={s.cancelHoursBefore} onChange={(e) => set({ cancelHoursBefore: Number(e.target.value) })} />
          </Field>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button onClick={saveSettings} disabled={saving}>
            {saving ? 'Speichern …' : 'Speichern'}
          </Button>
          {saveMsg && <span className="text-sm text-muted-foreground">{saveMsg}</span>}
        </div>
      </Panel>

      <Panel
        title="Push-Benachrichtigung bei neuer Bestellung"
        description="Kostenlos über ntfy.sh – ohne Konto. So richtest du es ein:"
      >
        <ol className="mb-4 list-decimal space-y-1 pl-5 text-sm text-ink/75">
          <li>Installiere die App „ntfy“ (iPhone / Android).</li>
          <li>Denk dir einen geheimen Themen-Namen aus, z. B. <code>hofpizza-dani-7k3x9</code> (schwer zu erraten!).</li>
          <li>Abonniere in der App genau dieses Thema und trage es hier ein.</li>
        </ol>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="ntfy-Thema" hint="Leer lassen = keine Benachrichtigungen.">
            <input className={inputClass} value={s.ntfyTopic || ''} placeholder="hofpizza-dein-geheimes-thema" onChange={(e) => set({ ntfyTopic: e.target.value })} />
          </Field>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button onClick={saveSettings} disabled={saving}>
            Speichern
          </Button>
          <Button
            variant="ghost"
            disabled={!state.settings.ntfyTopic}
            onClick={async () => {
              setTestMsg('')
              try {
                await call('admin_test_notification')
                setTestMsg('Test gesendet – kommt gleich aufs Handy.')
              } catch (e) {
                setTestMsg(e.message)
              }
            }}
          >
            Test senden
          </Button>
          {testMsg && <span className="text-sm text-muted-foreground">{testMsg}</span>}
        </div>
      </Panel>

      <Panel title="Chef-Zugang" description={`Aktueller Benutzername: ${state.settings.adminUsername}. Änderungen gelten sofort.`}>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Benutzername">
            <input className={inputClass} value={username} placeholder={state.settings.adminUsername} onChange={(e) => setUsername(e.target.value)} />
          </Field>
          <Field label="Aktuelles Passwort">
            <input type="password" className={inputClass} value={current} onChange={(e) => setCurrent(e.target.value)} />
          </Field>
          <Field label="Neues Passwort" hint="Mindestens 6 Zeichen.">
            <input type="password" className={inputClass} value={next} onChange={(e) => setNext(e.target.value)} />
          </Field>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            disabled={credBusy}
            onClick={async () => {
              setCredBusy(true)
              setCredOk('')
              setCredErr('')
              try {
                await call('admin_change_credentials', {
                  p_username: username || state.settings.adminUsername,
                  p_current: current,
                  p_new: next,
                })
                setCurrent('')
                setNext('')
                setCredOk('Zugangsdaten aktualisiert.')
                await reload()
              } catch (e) {
                setCredErr(e.message || 'Änderung fehlgeschlagen.')
              } finally {
                setCredBusy(false)
              }
            }}
          >
            {credBusy ? 'Ändern …' : 'Zugang ändern'}
          </Button>
          {credOk && <span className="text-sm text-basilico">{credOk}</span>}
          {credErr && <span className="text-sm text-red-700">{credErr}</span>}
        </div>
      </Panel>

      <Panel title="App auf dem Handy">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Du kannst Chefsache wie eine App auf den Homescreen legen: Auf dem iPhone in Safari „Teilen → Zum Home-Bildschirm“, auf Android in
          Chrome „Menü → App installieren“ (oder oben auf „App installieren“ tippen, wenn der Button erscheint).
        </p>
      </Panel>
    </div>
  )
}
