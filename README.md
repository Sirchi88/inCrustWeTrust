# HOF-PIZZA · In crust we trust

Neuaufbau der Base44-Seite **danis-hof-pizza.base44.app** mit eigenem Code:

- **Frontend:** React + Vite + Tailwind (Design 1:1 vom Original übernommen)
- **Datenbank & Logik:** Supabase (Postgres). Bestellungen, Abholslots, Stornierungen und der Admin-Login laufen als
  Datenbank-Funktionen – die Tabellen selbst sind für Besucher gesperrt (Row Level Security).

## Was ist neu gegenüber Base44?

- **Authentischere Pizza-Grafik:** neapolitanischer Rand mit Leopardenflecken und Blasen, zerlaufener Fior di Latte,
  natürlich verteilter Belag (statt Ringen), frische Kräuter obendrauf.
- **Neue Zutaten:** Thunfisch, Mais, Ei (als Spiegelei in der Mitte).
- **Termine löschen (Chefsache → Termine):** Sind noch offene Bestellungen vorhanden, erscheint eine Warnung mit
  Liste der Bestellungen. Erst nach bestätigtem Häkchen lässt sich der Termin löschen – die Bestellungen werden mitgelöscht.
- **Stornieren direkt auf der Bestätigungsseite** (zusätzlich zur Stornierung per Bestellnummer auf der Startseite).
  Die Frist („bis X Stunden vor Abholbeginn“) ist in den Einstellungen verstellbar.
- **Push-Benachrichtigung bei neuer Bestellung** und bei Stornierungen über [ntfy.sh](https://ntfy.sh) (kostenlos, ohne Konto).
- **App-Installation (PWA):** Chefsache lässt sich auf dem Handy wie eine App auf den Homescreen legen.
- **Beliebteste Pizzen** in der Auswertung zeigen jetzt die tatsächliche Belag-Kombination.

## Einrichtung

### 1. Supabase-Datenbank

1. Auf [supabase.com](https://supabase.com) ein (kostenloses) Projekt anlegen, Region z. B. Frankfurt.
2. Im Projekt: **SQL Editor → New query**, den Inhalt von [`supabase/schema.sql`](supabase/schema.sql) einfügen und **Run**.
3. Dann eine neue Query mit [`supabase/seed.sql`](supabase/seed.sql) ausführen (Zutaten, Getränke, Einstellungen und
   der Termin „Familienmittag“ von der alten Seite).
4. Unter **Project Settings → API** die **Project URL** und den **anon public key** kopieren.

> Beide SQL-Dateien sind wiederholbar: Bei späteren Updates einfach `schema.sql` erneut ausführen – Daten bleiben erhalten.

### 2. Website starten

```bash
cp .env.example .env      # und URL + anon key eintragen
npm install
npm run dev               # http://localhost:5173
```

### 3. Erster Login in „Chefsache“

`/chefsache` öffnen. Beim allerersten Login werden Benutzername und Passwort festgelegt, die du dort eingibst
(mind. 6 Zeichen). Ändern geht später unter **Einstellungen → Chef-Zugang**.

> Tipp: Mach den ersten Login direkt nach dem Einrichten der Datenbank, damit dir niemand zuvorkommt.

### 4. Push-Benachrichtigungen (optional)

1. App **ntfy** installieren (iOS/Android).
2. Ein schwer zu erratendes Thema abonnieren, z. B. `hofpizza-dani-7k3x9`.
3. In **Chefsache → Einstellungen** dasselbe Thema eintragen, speichern, „Test senden“.

Supabase braucht dafür die Erweiterung `pg_net` – sie wird von `schema.sql` automatisch aktiviert.

## Veröffentlichen

Die Seite ist eine statische App und läuft auf jedem Static-Hoster:

- **Vercel / Netlify:** Repository verbinden, Build-Befehl `npm run build`, Ausgabeordner `dist`,
  und die Umgebungsvariablen `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` setzen.
  `vercel.json` bzw. `public/_redirects` sorgen dafür, dass Unterseiten wie `/chefsache` direkt aufrufbar sind.

## Projektstruktur

```
supabase/schema.sql        Tabellen, Sicherheit, alle Funktionen
supabase/seed.sql          Startdaten
src/components/PizzaSvg.jsx  Pizza-Grafik (Rand, Soße, Belag-Verteilung)
src/components/glyphs.jsx    gezeichnete Zutaten
src/pages/                   Startseite, Bestellen, Bestätigung
src/pages/admin/             Chefsache (Dashboard, Küche, Termine, …)
```
