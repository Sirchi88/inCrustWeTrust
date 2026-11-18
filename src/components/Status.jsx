import { PageShell } from './Layout.jsx'

export function LoadingPage() {
  return (
    <PageShell>
      <main className="mx-auto max-w-3xl px-5 py-24 text-center text-sm text-muted-foreground">Wird geladen …</main>
    </PageShell>
  )
}

export function ErrorPage({ message, onRetry }) {
  return (
    <PageShell>
      <main className="mx-auto max-w-3xl px-5 py-24 text-center">
        <h1 className="font-heading text-3xl">Da ist etwas schiefgelaufen</h1>
        <p className="mt-3 text-sm text-muted-foreground">{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-8 inline-block rounded-full bg-ink px-6 py-3 text-[0.7rem] uppercase tracking-[0.22em] text-paper"
          >
            Erneut versuchen
          </button>
        )}
      </main>
    </PageShell>
  )
}
