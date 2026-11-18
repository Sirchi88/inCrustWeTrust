import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageShell } from '../components/Layout.jsx'
import PizzaSvg from '../components/PizzaSvg.jsx'
import DrinkIllustration from '../components/DrinkIllustration.jsx'
import { GlyphIcon } from '../components/glyphs.jsx'
import { Check, Clock, Lock } from '../components/icons.jsx'
import { LoadingPage, ErrorPage } from '../components/Status.jsx'
import { useRpc } from '../lib/useRpc.js'
import { rpc } from '../lib/api.js'
import { cn } from '../lib/cn.js'
import { formatDateLong, formatEuro } from '../lib/format.js'

const round = (n) => Math.round((Number(n) + 2 ** -52) * 100) / 100
const toppingsPrice = (toppings, ids) =>
  round((toppings || []).filter((t) => ids.includes(t.id)).reduce((s, t) => s + (Number(t.price) || 0), 0))
const pizzaPrice = (base, toppings, ids) => round((Number(base) || 0) + toppingsPrice(toppings, ids))

function OpenBadge({ open, className = '' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.62rem] uppercase tracking-[0.22em]',
        open ? 'border-basilico/35 bg-basilico/10 text-basilico' : 'border-pomodoro/35 bg-pomodoro/10 text-pomodoro',
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', open ? 'animate-pulse bg-basilico' : 'bg-pomodoro')} />
      {open ? 'Bestellungen geöffnet' : 'Bestellungen geschlossen'}
    </span>
  )
}

function PizzaBuilder({ index, sauce, toppings, selectedIds, onChange, basePrice, maxToppings, canRemove, onRemove }) {
  const price = pizzaPrice(basePrice, toppings, selectedIds)
  const glyphs = (sauce ? [sauce.glyph] : []).concat(toppings.filter((t) => selectedIds.includes(t.id)).map((t) => t.glyph))
  const full = selectedIds.length >= maxToppings
  const toggle = (id) => {
    if (selectedIds.includes(id)) return onChange(selectedIds.filter((x) => x !== id))
    if (!full) onChange([...selectedIds, id])
  }

  return (
    <div className="card-soft rounded-2xl border border-border/70 bg-card p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow">Pizza {String(index + 1).padStart(2, '0')}</p>
          <h3 className="mt-1 font-heading text-xl leading-tight sm:text-2xl">Deine eigene Pizza</h3>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-heading text-xl leading-none">{formatEuro(price)}</p>
          {canRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="mt-2 text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground underline decoration-dotted underline-offset-4 hover:text-pomodoro"
            >
              Entfernen
            </button>
          )}
        </div>
      </div>
      <div className="mx-auto mt-2 w-full max-w-[300px]">
        <PizzaSvg ingredients={glyphs} label={`Pizza ${index + 1} mit ${selectedIds.length} gewählten Zutaten`} className="h-auto w-full" />
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/70 px-3 py-1.5 text-[0.72rem] text-ink/70">
          <Lock className="h-3 w-3" strokeWidth={2} />
          Teig
        </span>
        {sauce && (
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/70 py-1 pl-2 pr-3 text-[0.72rem] text-ink/70">
            <GlyphIcon glyph={sauce.glyph} className="h-5 w-6" />
            {sauce.name}
          </span>
        )}
        <span className="text-[0.62rem] uppercase tracking-[0.12em] text-muted-foreground">inklusive · {formatEuro(basePrice)}</span>
      </div>
      <p className="mt-5 text-[0.66rem] uppercase tracking-[0.16em] text-muted-foreground">
        Zutaten dazuwählen ({selectedIds.length} von {maxToppings})
      </p>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {toppings.map((t) => {
          const on = selectedIds.includes(t.id)
          const disabled = !on && full
          return (
            <button
              key={t.id}
              type="button"
              aria-pressed={on}
              disabled={disabled}
              onClick={() => toggle(t.id)}
              className={cn(
                'flex items-center gap-1.5 rounded-xl border px-2 py-2 text-left transition',
                on ? 'border-pomodoro bg-pomodoro/10 text-ink' : 'border-border/80 bg-card text-ink/80 hover:border-ink/30',
                disabled && 'opacity-45',
              )}
            >
              <GlyphIcon glyph={t.glyph} className="h-9 w-11 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[0.8rem] font-medium leading-tight">{t.name}</span>
                <span className="block text-[0.6rem] uppercase tracking-[0.1em] text-muted-foreground">
                  {t.price > 0 ? `+ ${formatEuro(t.price)}` : 'inklusive'}
                </span>
              </span>
              <span
                className={cn(
                  'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
                  on ? 'border-pomodoro bg-pomodoro text-primary-foreground' : 'border-ink/25',
                )}
              >
                {on && <Check className="h-3 w-3" strokeWidth={3} />}
              </span>
            </button>
          )
        })}
        {toppings.length === 0 && <p className="col-span-full text-sm text-muted-foreground">Zurzeit sind keine Zutaten freigegeben.</p>}
      </div>
      {full && <p className="mt-2 text-xs text-pomodoro">Maximalbelegung erreicht – erst eine Zutat abwählen.</p>}
      <p aria-live="polite" className="sr-only">
        {selectedIds.length} von {maxToppings} Zutaten gewählt
      </p>
    </div>
  )
}

function DrinkPicker({ drinks, value, onChange }) {
  if (drinks.length === 0) return <p className="text-sm text-muted-foreground">Zurzeit sind keine Getränke freigegeben.</p>
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {drinks.map((d) => {
        const on = value === d.id
        return (
          <button
            key={d.id}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? null : d.id)}
            className={cn(
              'relative flex flex-col items-center rounded-2xl border p-3 text-center transition',
              on ? 'border-pomodoro bg-pomodoro/10 shadow-sm' : 'border-border/80 bg-card hover:border-ink/30',
            )}
          >
            <span
              className={cn(
                'absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full border transition',
                on ? 'border-pomodoro bg-pomodoro text-primary-foreground' : 'border-ink/20',
              )}
            >
              {on && <Check className="h-3 w-3" strokeWidth={3} />}
            </span>
            <DrinkIllustration kind={d.illustration} className="h-24 w-full" />
            <span className="mt-1 block text-[0.82rem] font-medium leading-tight text-ink">{d.name}</span>
            {d.price > 0 && (
              <span className="mt-0.5 block text-[0.68rem] uppercase tracking-[0.1em] text-muted-foreground">{formatEuro(d.price)}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

function SlotPicker({ slots, value, onChange, loading, onRefresh }) {
  return (
    <div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {slots.map((s) => {
          const on = s.time === value
          return (
            <button
              key={s.time}
              type="button"
              disabled={s.taken}
              onClick={() => onChange(s.time)}
              className={cn(
                'flex h-12 items-center justify-center rounded-sm border text-sm transition',
                s.taken
                  ? 'cursor-not-allowed border-border bg-muted/60 text-muted-foreground/60 line-through'
                  : on
                    ? 'border-pomodoro bg-pomodoro text-primary-foreground'
                    : 'border-ink/20 text-ink hover:border-ink/60',
              )}
            >
              {s.label}
            </button>
          )
        })}
        {slots.length === 0 && <p className="col-span-full text-sm text-muted-foreground">Für diesen Termin sind keine Zeiten hinterlegt.</p>}
      </div>
      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
        <button type="button" onClick={onRefresh} disabled={loading} className="underline decoration-dotted underline-offset-4 hover:text-ink">
          {loading ? 'Prüfe Zeiten …' : 'Verfügbarkeit aktualisieren'}
        </button>
        <span>Durchgestrichene Zeiten sind vergeben.</span>
      </div>
    </div>
  )
}

function Summary({ name, event, pickupLabel, pizzas, drinks, total }) {
  return (
    <div className="card-soft rounded-2xl border border-border/70 bg-card p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/70 pb-4">
        <div>
          <p className="eyebrow">Übersicht</p>
          <h3 className="mt-1 font-heading text-2xl">{name || 'Dein Name'}</h3>
          <p className="text-sm text-muted-foreground">Abholung im Hof</p>
        </div>
        <div className="text-right">
          <p className="eyebrow">Abholung</p>
          <p className="mt-1 font-heading text-2xl">{pickupLabel ? `${pickupLabel} Uhr` : '–'}</p>
          {event && <p className="text-xs text-muted-foreground">{event.date?.split('-').reverse().join('.')}</p>}
        </div>
      </div>
      <div className="divide-y divide-border/60">
        {pizzas.map((p, i) => (
          <div key={i} className="flex gap-4 py-4">
            <PizzaSvg ingredients={p.glyphs} className="h-20 w-20 shrink-0" shadow={false} label={p.pizzaName} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-heading text-lg leading-tight">{p.pizzaName}</p>
                <span className="shrink-0 text-sm">{formatEuro(p.price)}</span>
              </div>
              <p className="font-script text-[1.05rem] leading-snug text-pomodoro/90">{p.ingredients.join(' · ')}</p>
            </div>
          </div>
        ))}
      </div>
      {drinks.length > 0 && (
        <div className="border-t border-border/70 py-3">
          {drinks.map((d, i) => (
            <div key={i} className="flex items-baseline justify-between gap-3 py-1 text-sm">
              <span>
                {d.quantity} × {d.name}
              </span>
              <span>{formatEuro(d.price)}</span>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-baseline justify-between border-t border-ink/20 pt-4">
        <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Gesamt</span>
        <span className="font-heading text-3xl">{formatEuro(total)}</span>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        Bezahlung in bar bei Abholung. Deine Abholzeit wird mit dem Absenden für dich reserviert.
      </p>
    </div>
  )
}

function EventCard({ event, maxPizzas }) {
  return (
    <div className="card-soft relative mt-6 overflow-hidden rounded-2xl border border-pomodoro/25 bg-card">
      <span className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-pomodoro/10 blur-2xl" aria-hidden="true" />
      <span className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-basilico/10 blur-2xl" aria-hidden="true" />
      <div className="relative px-5 py-6 sm:px-7 sm:py-7">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
          <div className="min-w-0">
            <p className="eyebrow">Dein Termin</p>
            <p className="mt-2 break-words font-heading text-[clamp(1.3rem,5.2vw,1.85rem)] font-semibold uppercase leading-tight tracking-[0.04em] text-ink">
              {formatDateLong(event.date)}
            </p>
            <p className="mt-3 inline-flex items-center gap-2 text-[0.95rem] text-ink/70">
              <Clock className="h-4 w-4 text-pomodoro" strokeWidth={1.8} />
              Abholung {event.pickupStart}–{event.pickupEnd} Uhr
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="eyebrow">Abholung ab</p>
            <p className="font-heading text-4xl leading-none text-pomodoro">{event.pickupStart}</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-1 border-t border-border/70 pt-3 text-xs text-muted-foreground">
          {event.title && <span>{event.title}</span>}
          <span>maximal {maxPizzas} Pizzen</span>
          <span>Barzahlung bei Abholung</span>
        </div>
      </div>
    </div>
  )
}

function Step({ step, title, hint }) {
  return (
    <div className="mb-4 flex items-baseline gap-4">
      <span className="font-heading text-sm text-pomodoro">{step}</span>
      <div>
        <h2 className="font-heading text-2xl leading-tight">{title}</h2>
        {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
      </div>
    </div>
  )
}

function OrderForm({ data }) {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [pizzas, setPizzas] = useState([{ ingredientIds: [] }])
  const [drinkId, setDrinkId] = useState(null)
  const [slots, setSlots] = useState(data.slots)
  const [pickup, setPickup] = useState('')
  const [sending, setSending] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const { settings, sauce, toppings, event } = data
  const maxPizzas = settings.maxPizzasPerOrder
  const maxToppings = settings.maxToppings
  const basePrice = settings.basePrice

  const pizzaSummaries = pizzas.map((p) => {
    const chosen = toppings.filter((t) => p.ingredientIds.includes(t.id))
    const all = sauce ? [sauce, ...chosen] : chosen
    return {
      pizzaName: 'Eigene Pizza',
      ingredients: all.map((x) => x.name),
      glyphs: all.map((x) => x.glyph),
      price: pizzaPrice(basePrice, toppings, p.ingredientIds),
    }
  })
  const drink = data.drinks.find((d) => d.id === drinkId) || null
  const drinkLines = drink && drink.illustration !== 'kein_durst' ? [{ ...drink, quantity: 1, price: drink.price }] : []
  const total =
    Math.round((pizzaSummaries.reduce((s, p) => s + p.price, 0) + drinkLines.reduce((s, d) => s + Number(d.price), 0)) * 100) / 100
  const pickupLabel = pickup ? pickup.slice(11, 16) : ''

  const updatePizza = (i, patch) => setPizzas((list) => list.map((p, j) => (j === i ? { ...p, ...patch } : p)))

  const refreshSlots = async () => {
    setRefreshing(true)
    try {
      const r = await rpc('public_slots', { p_event_id: event.id })
      setSlots(r.slots)
      setPickup((cur) => (r.slots.some((s) => s.time === cur && !s.taken) ? cur : ''))
    } catch {
      setError('Die Abholzeiten konnten nicht geladen werden.')
    } finally {
      setRefreshing(false)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (name.trim().length < 2) return setError('Bitte gib deinen Namen an.')
    if (pizzas.length === 0) return setError('Bitte stelle mindestens eine Pizza zusammen.')
    if (!pickup) return setError('Bitte wähle eine Abholzeit.')
    setSending(true)
    try {
      const r = await rpc('place_order', {
        payload: {
          name: name.trim(),
          eventId: event.id,
          pickupTime: pickup,
          pizzas: pizzas.map((p) => ({ ingredientIds: p.ingredientIds })),
          drinks: drinkLines.map((d) => ({ drinkId: d.id, quantity: 1 })),
        },
      })
      navigate(`/bestaetigung/${r.orderNumber}?neu=1`)
    } catch (err) {
      setError(err.message || 'Die Bestellung konnte nicht abgeschickt werden.')
      await refreshSlots()
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={submit} className="mt-10 space-y-14">
      <section>
        <Step step="01" title="Wie heißt du?" hint="Kein Konto, keine E-Mail – nur ein Name für die Abholung." />
        <label className="block">
          <span className="eyebrow">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            className="mt-2 w-full rounded-sm border border-ink/20 bg-card px-4 py-3 text-base outline-none focus:border-pomodoro"
            placeholder="Vor- und Nachname"
          />
        </label>
      </section>

      <section>
        <Step
          step="02"
          title="Pizza zusammenstellen"
          hint={`Teig und Tomatensauce sind immer dabei. Tippe Zutaten an oder ab – die Pizza ändert sich sofort. Maximal ${maxToppings} Zutaten.`}
        />
        <div className="space-y-5">
          {pizzas.map((p, i) => (
            <PizzaBuilder
              key={i}
              index={i}
              sauce={sauce}
              toppings={toppings}
              selectedIds={p.ingredientIds}
              onChange={(ids) => updatePizza(i, { ingredientIds: ids })}
              basePrice={basePrice}
              maxToppings={maxToppings}
              canRemove={pizzas.length > 1}
              onRemove={() => setPizzas((list) => list.filter((_, j) => j !== i))}
            />
          ))}
        </div>
        {pizzas.length < maxPizzas && (
          <button
            type="button"
            onClick={() => setPizzas((list) => (list.length >= maxPizzas ? list : [...list, { ingredientIds: [] }]))}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-dashed border-ink/30 px-5 py-3 text-[0.7rem] uppercase tracking-[0.2em] text-ink/70 transition hover:border-pomodoro hover:text-pomodoro"
          >
            + Zweite Pizza hinzufügen
          </button>
        )}
      </section>

      <section>
        <Step step="03" title="Ein Getränk dazu?" hint="Eine Auswahl – oder einfach „Nein danke“." />
        <DrinkPicker drinks={data.drinks} value={drinkId} onChange={setDrinkId} />
      </section>

      <section>
        <Step
          step="04"
          title="Abholzeit wählen"
          hint={`Jede Bestellung blockiert ${settings.slotMinutes} Minuten – unabhängig von der Anzahl der Pizzen.`}
        />
        <SlotPicker slots={slots} value={pickup} onChange={setPickup} loading={refreshing} onRefresh={refreshSlots} />
      </section>

      <section>
        <Step step="05" title="Alles richtig?" hint="Prüfe deine Bestellung und schicke sie ab." />
        <Summary name={name} event={event} pickupLabel={pickupLabel} pizzas={pizzaSummaries} drinks={drinkLines} total={total} />
        {error && <p className="mt-4 rounded-sm border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">Mit dem Absenden ist deine Abholzeit verbindlich reserviert.</p>
          <button
            type="submit"
            disabled={sending}
            className="inline-flex items-center justify-center rounded-full bg-pomodoro px-8 py-4 text-[0.72rem] uppercase tracking-[0.24em] text-primary-foreground transition hover:bg-ink disabled:opacity-60"
          >
            {sending ? 'Wird gesendet …' : 'Bestellung abschicken'}
          </button>
        </div>
      </section>
    </form>
  )
}

export default function Order() {
  const { data, error, loading, reload } = useRpc('public_order_form')
  if (loading) return <LoadingPage />
  if (error) return <ErrorPage message={error} onRetry={reload} />

  if (!data.event) {
    return (
      <PageShell>
        <main className="mx-auto max-w-3xl px-5 py-24 text-center">
          <h1 className="font-heading text-3xl">Noch kein Termin angekündigt</h1>
          <p className="mt-3 text-muted-foreground">Sobald der nächste Pizza-Abend feststeht, erscheint er hier.</p>
          <Link to="/" className="mt-8 inline-block rounded-full bg-ink px-6 py-3 text-[0.7rem] uppercase tracking-[0.22em] text-paper">
            Zur Startseite
          </Link>
        </main>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <main className="mx-auto max-w-3xl px-5 pb-24 pt-10 sm:pt-14">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="eyebrow">Bestellung</p>
            <h1 className="mt-2 font-heading text-[clamp(2rem,8vw,3rem)] leading-tight">Wer hat Bock auf Pizza?</h1>
          </div>
          <OpenBadge open={data.open} />
        </div>
        <p className="mt-3 max-w-2xl text-[0.82rem] leading-relaxed text-muted-foreground">
          Bitte bestelle nur, wenn du es wirklich ernst meinst. Jede Pizza wird frisch für dich vorbereitet – danke für deine ehrliche
          Bestellung!
        </p>
        <EventCard event={data.event} maxPizzas={data.settings.maxPizzasPerOrder} />
        {data.open ? (
          <OrderForm data={data} />
        ) : (
          <div className="mt-10 rounded-md border border-pomodoro/30 bg-pomodoro/5 p-8">
            <h2 className="font-heading text-2xl text-pomodoro">Bestellungen sind geschlossen</h2>
            <p className="mt-2 max-w-lg text-sm text-ink/70">
              Für diesen Termin ist der Bestellschluss vorbei. Schau gern wieder vorbei, wenn der nächste Pizza-Abend angekündigt ist.
            </p>
            <Link to="/" className="mt-6 inline-block rounded-full border border-ink/25 px-6 py-3 text-[0.7rem] uppercase tracking-[0.2em]">
              Zur Startseite
            </Link>
          </div>
        )}
      </main>
    </PageShell>
  )
}
