import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Order from './pages/Order.jsx'
import Confirmation from './pages/Confirmation.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import Dashboard from './pages/admin/Dashboard.jsx'
import Orders from './pages/admin/Orders.jsx'
import Cancellations from './pages/admin/Cancellations.jsx'
import Kitchen from './pages/admin/Kitchen.jsx'
import Events from './pages/admin/Events.jsx'
import Pizzas from './pages/admin/Pizzas.jsx'
import Ingredients from './pages/admin/Ingredients.jsx'
import Drinks from './pages/admin/Drinks.jsx'
import Shopping from './pages/admin/Shopping.jsx'
import Analytics from './pages/admin/Analytics.jsx'
import Settings from './pages/admin/Settings.jsx'
import { isConfigured } from './lib/api.js'

function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 80)
      return () => clearTimeout(t)
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

function NotConfigured() {
  return (
    <div className="mx-auto max-w-xl px-5 py-24">
      <h1 className="font-heading text-3xl">Fast fertig!</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Die Website ist noch nicht mit Supabase verbunden. Lege eine Datei <code>.env</code> an (Vorlage: <code>.env.example</code>) und
        trage <code>VITE_SUPABASE_URL</code> und <code>VITE_SUPABASE_ANON_KEY</code> ein. Details stehen in der README.
      </p>
    </div>
  )
}

export default function App() {
  if (!isConfigured) return <NotConfigured />
  return (
    <>
      <ScrollManager />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/bestellen" element={<Order />} />
        <Route path="/bestaetigung/:orderNumber" element={<Confirmation />} />
        <Route path="/chefsache" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="bestellungen" element={<Orders />} />
          <Route path="stornierungen" element={<Cancellations />} />
          <Route path="kueche" element={<Kitchen />} />
          <Route path="termine" element={<Events />} />
          <Route path="pizzen" element={<Pizzas />} />
          <Route path="zutaten" element={<Ingredients />} />
          <Route path="getraenke" element={<Drinks />} />
          <Route path="einkauf" element={<Shopping />} />
          <Route path="auswertung" element={<Analytics />} />
          <Route path="einstellungen" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
