import { createContext, useContext } from 'react'
import { cn } from '../../lib/cn.js'

export const AdminContext = createContext(null)

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin muss innerhalb des Admin-Bereichs genutzt werden.')
  return ctx
}

export const STATUSES = ['eingegangen', 'in_bearbeitung', 'abholbereit', 'abgeholt', 'storniert']
export const STATUS_LABELS = {
  eingegangen: 'Eingegangen',
  in_bearbeitung: 'In Bearbeitung',
  abholbereit: 'Abholbereit',
  abgeholt: 'Abgeholt',
  storniert: 'Storniert',
}
const STATUS_STYLES = {
  eingegangen: 'border-blue-200 bg-blue-50 text-blue-700',
  in_bearbeitung: 'border-amber-200 bg-amber-50 text-amber-700',
  abholbereit: 'border-purple-200 bg-purple-50 text-purple-700',
  abgeholt: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  storniert: 'border-red-200 bg-red-50 text-red-700',
}

export const inputClass =
  'mt-1.5 w-full rounded-sm border border-ink/20 bg-card px-3 py-2.5 text-base outline-none transition focus:border-pomodoro sm:text-sm'
export const decimalProps = { type: 'text', inputMode: 'decimal', autoComplete: 'off' }

export function parseDecimal(value) {
  const s = String(value ?? '').replace(/[€\s]/g, '').replace(/,/g, '.')
  if (s === '') return { ok: true, value: 0 }
  const n = Number(s)
  return Number.isFinite(n) && n >= 0 ? { ok: true, value: n } : { ok: false, value: 0 }
}

const VARIANTS = {
  primary: 'bg-ink text-paper hover:bg-pomodoro',
  accent: 'bg-pomodoro text-primary-foreground hover:bg-ink',
  ghost: 'border border-ink/25 text-ink/80 hover:border-ink/60',
  danger: 'border border-red-300 text-red-700 hover:bg-red-50',
  dangerSolid: 'bg-red-700 text-white hover:bg-red-800',
}

export function Button({ variant = 'primary', className = '', type = 'button', ...rest }) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[0.68rem] uppercase tracking-[0.2em] transition disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTS[variant],
        className,
      )}
      {...rest}
    />
  )
}

export function Panel({ title, description, actions, children, className = '' }) {
  return (
    <section className={cn('rounded-md border border-ink/12 bg-card p-5 sm:p-6', className)}>
      {(title || actions) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 className="font-heading text-xl">{title}</h2>}
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  )
}

export function Field({ label, hint, children, className = '' }) {
  return (
    <label className={cn('block', className)}>
      <span className="eyebrow">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  )
}

export function Toggle({ checked, onChange, label, hint }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex items-center gap-3 text-left" aria-pressed={checked}>
      <span
        className={cn(
          'flex h-6 w-11 shrink-0 items-center rounded-full border transition',
          checked ? 'border-basilico bg-basilico' : 'border-ink/25 bg-muted',
        )}
      >
        <span className={cn('mx-0.5 h-5 w-5 rounded-full bg-white shadow transition', checked ? 'translate-x-5' : 'translate-x-0')} />
      </span>
      <span>
        <span className="block text-sm text-ink">{label}</span>
        {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
      </span>
    </button>
  )
}

export function Stat({ label, value, hint }) {
  return (
    <div className="rounded-md border border-ink/12 bg-card p-4">
      <p className="eyebrow">{label}</p>
      <p className="mt-2 font-heading text-3xl leading-none">{value}</p>
      {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function StatusBadge({ status }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-[0.6rem] uppercase tracking-[0.16em]',
        STATUS_STYLES[status] || 'border-border text-muted-foreground',
      )}
    >
      {STATUS_LABELS[status] || status}
    </span>
  )
}

export function PageTitle({ eyebrow, title, subtitle, children }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-1 font-heading text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

export function ErrorBox({ children, className = '' }) {
  if (!children) return null
  return <p className={cn('rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700', className)}>{children}</p>
}

export function EventSelect({ events, value, onChange, format }) {
  return (
    <select
      className="rounded-sm border border-ink/20 bg-card px-3 py-2.5 text-sm"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
    >
      {events.map((ev) => (
        <option key={ev.id} value={ev.id}>
          {format(ev.date)}
          {ev.title ? ` · ${ev.title}` : ''}
        </option>
      ))}
    </select>
  )
}

export const isOpenOrder = (o) => !['abgeholt', 'storniert'].includes(o.status)
