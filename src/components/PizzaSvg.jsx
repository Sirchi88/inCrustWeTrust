import { useId, useMemo } from 'react'
import { Glyph, GLYPH_ORDER } from './glyphs.jsx'

// ---------------------------------------------------------------------------
// Neapolitanische Pizza als SVG.
// Rand (Cornicione) mit Leopardenflecken, unregelmäßige Tomatensoße,
// zerlaufener Fior di Latte und natürlich verteilter Belag.
// Jede Zutat hat ihren eigenen Zufalls-Seed: Beim An-/Abwählen anderer
// Zutaten springen die vorhandenen Stücke deshalb nicht herum.
// ---------------------------------------------------------------------------

const C = 200

const CRUST =
  'M200 24C262 21 315 54 342 107C369 160 362 224 330 272C298 319 244 352 190 356C132 360 78 336 52 288C26 240 30 174 58 124C86 74 138 29 200 24Z'
const RIM =
  'M200 40C255 38 302 68 326 114C350 160 345 219 316 262C287 304 240 334 192 337C140 341 94 318 70 275C46 232 49 175 75 131C101 87 146 42 200 40Z'
const SAUCE =
  'M200 58C250 56 290 82 309 121C329 161 324 210 300 246C276 282 236 307 194 309C150 312 110 293 90 257C70 221 74 171 96 134C118 97 154 60 200 58Z'

// Wie viele Stücke, wie groß, wie weit auseinander
const LAYOUT = {
  mozzarella: { count: 7, minDist: 58, scale: 1.25, maxR: 100, variants: 3 },
  tomato: { count: 7, minDist: 42, scale: 0.98, maxR: 112, variants: 1 },
  salami: { count: 8, minDist: 48, scale: 1.12, maxR: 110, variants: 3 },
  ham: { count: 6, minDist: 50, scale: 1.05, maxR: 106, variants: 2 },
  tuna: { count: 6, minDist: 46, scale: 0.98, maxR: 108, variants: 2 },
  mushroom: { count: 8, minDist: 42, scale: 0.9, maxR: 112, variants: 2 },
  corn: { count: 8, minDist: 38, scale: 1.08, maxR: 114, variants: 3 },
  onion: { count: 9, minDist: 34, scale: 0.98, maxR: 114, variants: 3 },
  olive: { count: 9, minDist: 32, scale: 0.82, maxR: 116, variants: 2 },
  peperoni: { count: 6, minDist: 40, scale: 0.85, maxR: 108, variants: 1 },
  egg: { count: 1, center: true, scale: 1.35, variants: 1 },
  rucola: { count: 8, minDist: 42, scale: 1.08, maxR: 100, variants: 2 },
  basil: { count: 5, minDist: 54, scale: 1.0, maxR: 96, variants: 2 },
  parmesan: { count: 9, minDist: 32, scale: 0.78, maxR: 108, variants: 4 },
  sauce: { count: 0 },
}

function rng(seed) {
  let t = seed % 2147483647
  if (t <= 0) t += 2147483646
  return () => {
    t = (t * 16807) % 2147483647
    return t / 2147483647
  }
}

function hash(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

const cache = new Map()

function placeGlyph(glyph) {
  if (cache.has(glyph)) return cache.get(glyph)
  const cfg = LAYOUT[glyph] || { count: 6, minDist: 40, scale: 0.9, maxR: 110, variants: 1 }
  const r = rng(hash(glyph) + 7)
  const pts = []
  if (cfg.center) {
    pts.push({ x: C + (r() - 0.5) * 16, y: C + (r() - 0.5) * 16, rot: (r() - 0.5) * 60, scale: cfg.scale, variant: 0 })
  } else {
    let minDist = cfg.minDist
    let attempts = 0
    while (pts.length < cfg.count && attempts < 3000) {
      attempts++
      if (attempts % 400 === 0) minDist *= 0.88
      const a = r() * Math.PI * 2
      const d = Math.sqrt(r()) * cfg.maxR
      const x = C + Math.cos(a) * d
      const y = C + Math.sin(a) * d
      if (pts.every((p) => (p.x - x) ** 2 + (p.y - y) ** 2 >= minDist ** 2)) {
        pts.push({
          x,
          y,
          rot: r() * 360,
          scale: cfg.scale * (0.86 + r() * 0.28),
          variant: Math.floor(r() * (cfg.variants || 1)),
        })
      }
    }
  }
  cache.set(glyph, pts)
  return pts
}

// Liefert die Positionen pro Zutat (wird auch von der Startseite genutzt,
// um die Beschriftungspfeile auf echte Stücke zeigen zu lassen).
export function layoutToppings(ingredients = []) {
  const out = {}
  for (const g of ingredients) out[g] = placeGlyph(g)
  return out
}

// Rand-Details: Leopardenflecken (verkohlte Bläschen) und Mehlstaub
const LEOPARD = (() => {
  const r = rng(424242)
  const spots = []
  const clusters = 11
  for (let c = 0; c < clusters; c++) {
    const ca = (c / clusters) * Math.PI * 2 + r() * 0.4
    const n = 2 + Math.floor(r() * 5)
    for (let i = 0; i < n; i++) {
      const a = ca + (r() - 0.5) * 0.28
      const d = 142 + r() * 14
      const size = 1.4 + r() * (i === 0 ? 5 : 3)
      spots.push({
        x: C + Math.cos(a) * d,
        y: C + Math.sin(a) * d * 0.98 + 2,
        rx: size,
        ry: size * (0.6 + r() * 0.3),
        rot: r() * 180,
        o: 0.45 + r() * 0.45,
      })
    }
  }
  return spots
})()

const BLISTERS = (() => {
  const r = rng(9007)
  return Array.from({ length: 13 }, (_, i) => {
    const a = (i / 13) * Math.PI * 2 + r() * 0.3
    const d = 146 + r() * 12
    return { x: C + Math.cos(a) * d, y: C + Math.sin(a) * d + 2, r: 4 + r() * 4.5, rot: r() * 180 }
  })
})()

const FLOUR = (() => {
  const r = rng(77)
  return Array.from({ length: 26 }, () => {
    const a = r() * Math.PI * 2
    const d = 150 + r() * 12
    return { x: C + Math.cos(a) * d, y: C + Math.sin(a) * d + 2, r: 0.6 + r() * 1.2 }
  })
})()

const SAUCE_BLOTCHES = [
  [168, 150, 34, 20, -18, '#A82A16'],
  [240, 214, 36, 22, 12, '#9A2511'],
  [182, 252, 28, 18, -8, '#A82A16'],
  [242, 142, 22, 14, 24, '#C2472F'],
  [140, 210, 18, 12, 40, '#C2472F'],
]

const OIL = [
  [214, 120, 4, 2.4],
  [150, 178, 3, 1.8],
  [262, 250, 3.4, 2],
  [196, 286, 2.6, 1.6],
  [276, 176, 2.4, 1.4],
]

export default function PizzaSvg({
  ingredients = [],
  className = '',
  label = 'Neapolitanische Pizza mit Zutaten',
  shadow = true,
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const ordered = useMemo(() => {
    const known = GLYPH_ORDER.filter((g) => ingredients.includes(g))
    const unknown = ingredients.filter((g) => !GLYPH_ORDER.includes(g))
    return [...new Set([...known, ...unknown])]
  }, [ingredients])
  const positions = layoutToppings(ordered)

  return (
    <svg viewBox="0 0 400 400" role="img" aria-label={label} className={className}>
      <defs>
        <radialGradient id={`crust-${uid}`} cx="46%" cy="42%" r="60%">
          <stop offset="0%" stopColor="#F3D9AE" />
          <stop offset="72%" stopColor="#ECCB93" />
          <stop offset="88%" stopColor="#DDAA68" />
          <stop offset="100%" stopColor="#B97A3C" />
        </radialGradient>
        <radialGradient id={`sauce-${uid}`} cx="42%" cy="38%" r="70%">
          <stop offset="0%" stopColor="#C9512F" />
          <stop offset="65%" stopColor="#B53C22" />
          <stop offset="100%" stopColor="#952A14" />
        </radialGradient>
        <filter id={`wobble-${uid}`} x="-12%" y="-12%" width="124%" height="124%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id={`ragged-${uid}`} x="-12%" y="-12%" width="124%" height="124%">
          <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="9" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id={`top-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="1.6" stdDeviation="1.4" floodColor="#3D1D0B" floodOpacity="0.32" />
        </filter>
        <filter id={`soft-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
        <filter id={`blur2-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
        <filter id={`char-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="0.7" />
        </filter>
      </defs>

      {shadow && (
        <ellipse cx="204" cy="218" rx="168" ry="164" fill="#6E5233" opacity="0.18" filter={`url(#soft-${uid})`} />
      )}

      {/* Teig & Rand */}
      <g filter={`url(#wobble-${uid})`}>
        <path d={CRUST} fill={`url(#crust-${uid})`} stroke="#A86E35" strokeWidth="2" strokeOpacity="0.45" />
        <path d={RIM} fill="none" stroke="#F8E4BE" strokeWidth="12" opacity="0.55" filter={`url(#blur2-${uid})`} />
        <path d={RIM} fill="none" stroke="#C88A4B" strokeWidth="5" opacity="0.28" transform="translate(0 6)" filter={`url(#blur2-${uid})`} />
      </g>

      {/* Blasen im Rand */}
      <g>
        {BLISTERS.map((b, i) => (
          <g key={`bl-${i}`} transform={`rotate(${b.rot} ${b.x} ${b.y})`}>
            <ellipse cx={b.x} cy={b.y} rx={b.r} ry={b.r * 0.78} fill="#F6DFB4" opacity="0.7" />
            <ellipse cx={b.x + b.r * 0.15} cy={b.y - b.r * 0.1} rx={b.r * 0.55} ry={b.r * 0.42} fill="#4A2A14" opacity="0.55" filter={`url(#char-${uid})`} />
          </g>
        ))}
      </g>

      {/* Leopardenflecken */}
      <g filter={`url(#char-${uid})`}>
        {LEOPARD.map((s, i) => (
          <ellipse
            key={`lp-${i}`}
            cx={s.x}
            cy={s.y}
            rx={s.rx}
            ry={s.ry}
            fill="#2E1A0E"
            opacity={s.o}
            transform={`rotate(${s.rot} ${s.x} ${s.y})`}
          />
        ))}
      </g>

      {/* Mehlstaub */}
      <g fill="#FFF8EA" opacity="0.55">
        {FLOUR.map((f, i) => (
          <circle key={`fl-${i}`} cx={f.x} cy={f.y} r={f.r} />
        ))}
      </g>

      {/* Tomatensoße */}
      <g filter={`url(#ragged-${uid})`}>
          <path d={SAUCE} fill="#8E2A14" opacity="0.35" transform="translate(200 200) scale(1.035) translate(-200 -200)" />
          <path d={SAUCE} fill={`url(#sauce-${uid})`} />
      </g>
      <g opacity="0.38">
        {SAUCE_BLOTCHES.map(([cx, cy, rx, ry, rot, fill], i) => (
          <ellipse key={`sb-${i}`} cx={cx} cy={cy} rx={rx} ry={ry} fill={fill} transform={`rotate(${rot} ${cx} ${cy})`} />
        ))}
      </g>
      <g fill="#F3A07C" opacity="0.45">
        {OIL.map(([cx, cy, rx, ry], i) => (
          <ellipse key={`oil-${i}`} cx={cx} cy={cy} rx={rx} ry={ry} />
        ))}
      </g>

      {/* Belag */}
      <g filter={`url(#top-${uid})`}>
        {ordered.map((g) =>
          (positions[g] || []).map((p, n) => (
            <g
              key={`${g}-${n}`}
              transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.rot.toFixed(0)}) scale(${p.scale.toFixed(2)})`}
            >
              <g className="glyph-anim" style={{ animationDelay: `${n * 45}ms` }}>
                <Glyph name={g} variant={p.variant} />
              </g>
            </g>
          )),
        )}
      </g>
    </svg>
  )
}
