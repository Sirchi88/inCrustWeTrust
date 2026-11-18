// Auswertungen und Einkaufsliste werden direkt aus den Bestellungen berechnet.
const r2 = (n) => Math.round(n * 100) / 100

function pizzaLabel(item) {
  const names = (item.ingredients || []).slice(1)
  return names.length ? names.join(' · ') : 'Nur Tomatensoße'
}

export function buildReport(state, eventId) {
  const event = state.events.find((e) => e.id === eventId)
  if (!event) return null
  const orders = state.orders.filter((o) => o.eventId === eventId)
  const sold = orders.filter((o) => o.status !== 'storniert')
  const sauce = state.ingredients.find((i) => i.isSauce)
  const ingById = Object.fromEntries(state.ingredients.map((i) => [i.id, i]))

  const popular = new Map()
  const usage = new Map()
  const drinks = new Map()
  let pizzaCount = 0
  let drinkQuantity = 0
  let drinkRevenue = 0

  const use = (ing, pizzas = 1) => {
    if (!ing) return
    const cur = usage.get(ing.id) || { id: ing.id, name: ing.name, unit: ing.unit, amount: 0, pizzas: 0 }
    cur.amount += Number(ing.amountPerPizza) || 0
    cur.pizzas += pizzas
    usage.set(ing.id, cur)
  }

  for (const o of sold) {
    for (const item of o.items) {
      pizzaCount++
      const label = pizzaLabel(item)
      popular.set(label, (popular.get(label) || 0) + 1)
      use(sauce)
      for (const id of item.ingredientIds || []) use(ingById[id])
    }
    for (const d of o.drinks) {
      const cur = drinks.get(d.drinkName) || { name: d.drinkName, quantity: 0, revenue: 0 }
      cur.quantity += d.quantity
      cur.revenue += Number(d.price)
      drinks.set(d.drinkName, cur)
      drinkQuantity += d.quantity
      drinkRevenue += Number(d.price)
    }
  }

  return {
    eventId,
    date: event.date,
    event,
    orderCount: sold.length,
    cancelledCount: orders.length - sold.length,
    pizzaCount,
    revenue: r2(sold.reduce((s, o) => s + Number(o.total), 0)),
    drinkQuantity,
    drinkRevenue: r2(drinkRevenue),
    popularPizzas: [...popular.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
    ingredientUsage: [...usage.values()].sort((a, b) => b.pizzas - a.pizzas),
    drinkSales: [...drinks.values()].sort((a, b) => b.quantity - a.quantity),
  }
}

export function buildReports(state) {
  return state.events.map((e) => buildReport(state, e.id))
}

function roundUp(amount, unit) {
  if (unit === 'stueck') return Math.ceil(amount)
  if (unit === 'g' || unit === 'ml') return Math.ceil(amount / 10) * 10
  return Math.ceil(amount * 10) / 10
}

export function buildShoppingList(state, eventId, reservePercent) {
  const report = buildReport(state, eventId)
  if (!report) return null
  const factor = 1 + (Number(reservePercent) || 0) / 100
  return {
    event: report.event,
    pizzaCount: report.pizzaCount,
    orderCount: report.orderCount,
    reservePercent,
    items: report.ingredientUsage.map((u) => ({ ...u, amount: roundUp(u.amount * factor, u.unit) })),
    drinks: report.drinkSales.map((d) => ({ name: d.name, quantity: d.quantity })),
  }
}
