// Gezeichnete Zutaten für die Pizza-Grafik und die Zutaten-Chips.
// Jede Zutat ist um den Nullpunkt gezeichnet (ca. ±25 Einheiten) und hat
// teilweise mehrere Varianten, damit die Belegung natürlich wirkt.

export const GLYPH_LABELS = {
  sauce: 'Tomatensoße',
  mozzarella: 'Mozzarella',
  salami: 'Salami',
  ham: 'Schinken',
  tuna: 'Thunfisch',
  mushroom: 'Champignons',
  corn: 'Mais',
  olive: 'Oliven',
  onion: 'Zwiebeln',
  peperoni: 'Peperoni',
  tomato: 'Tomaten',
  egg: 'Ei',
  rucola: 'Rucola',
  basil: 'Basilikum',
  parmesan: 'Parmesan',
}

// Reihenfolge = Schichtung auf der Pizza (unten → oben)
export const GLYPH_ORDER = [
  'sauce', 'mozzarella', 'tomato', 'salami', 'ham', 'tuna', 'mushroom', 'corn',
  'onion', 'olive', 'peperoni', 'egg', 'rucola', 'basil', 'parmesan',
]

const MOZZ = [
  'M-24-4C-26-14-14-22-3-20C6-25 19-19 22-9C28-3 25 9 16 12C10 19-2 20-8 15C-18 18-27 9-24-4Z',
  'M-20-10C-14-20 2-22 10-16C20-16 26-6 22 4C24 13 12 19 3 16C-6 21-18 16-21 8C-27 3-25-5-20-10Z',
  'M-18-14C-8-22 8-20 14-12C24-10 25 2 19 8C17 17 4 20-4 15C-14 19-24 10-22 0C-25-6-22-11-18-14Z',
]
const MOZZ_SPOTS = [
  [[6, -8, 3.2, 2], [-9, 5, 2.2, 1.6], [12, 6, 1.6, 1.2]],
  [[-6, -9, 2.6, 1.8], [9, 3, 3, 2.1], [-12, 6, 1.5, 1.1]],
  [[2, -10, 2.4, 1.7], [-10, 3, 3, 2.2], [10, 7, 1.8, 1.3]],
]

function Mozzarella({ v = 0 }) {
  const d = MOZZ[v % MOZZ.length]
  return (
    <g>
      <path d={d} transform="scale(1.13)" fill="#F2E4C6" opacity="0.55" />
      <path d={d} fill="#FBF6EA" stroke="#E6D6B6" strokeWidth="0.9" />
      <path d={d} transform="translate(-2 -2) scale(0.62)" fill="#FFFFFF" opacity="0.75" />
      {MOZZ_SPOTS[v % MOZZ_SPOTS.length].map(([x, y, rx, ry], i) => (
        <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill={i === 0 ? '#D9A55E' : '#E2B676'} opacity="0.6" />
      ))}
    </g>
  )
}

const SALAMI_SPECKS = [
  [[-5, -6, 2.1], [5, -3, 1.6], [1, 5, 2.2], [-8, 3, 1.4], [8, 7, 1.3], [0, -11, 1.1], [-11, -2, 1]],
  [[4, -7, 1.9], [-6, -2, 2], [6, 4, 1.7], [-2, 8, 1.5], [10, -1, 1.1], [-9, 7, 1.2], [-3, -12, 1]],
  [[-2, -6, 1.8], [7, -6, 1.4], [-7, 4, 2.1], [4, 7, 1.6], [11, 2, 1.1], [-11, -5, 1.2], [1, 1, 1]],
]

function Salami({ v = 0 }) {
  return (
    <g>
      <ellipse rx="17.5" ry="16.6" fill="#7A2016" />
      <ellipse rx="16" ry="15.2" fill="#B83A2C" />
      <ellipse rx="12.8" ry="12" fill="#C8473A" opacity="0.9" />
      <ellipse cx="1" cy="1" rx="7" ry="6" fill="#DD6A47" opacity="0.45" />
      {SALAMI_SPECKS[v % 3].map(([x, y, r], i) => (
        <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.8} fill="#F1D6C2" opacity="0.92" />
      ))}
      <path d="M-11-8A13 13 0 0 1 4-13" stroke="#E98868" strokeWidth="1.4" fill="none" opacity="0.6" strokeLinecap="round" />
      <path d="M-15 4A16 15 0 0 0 9 14" stroke="#5E160F" strokeWidth="1.6" fill="none" opacity="0.5" strokeLinecap="round" />
    </g>
  )
}

const HAM = [
  'M-24 0C-27-9-18-17-9-15C-5-22 7-23 12-16C21-18 27-9 23-1C27 8 18 15 9 13C3 20-9 19-13 11C-21 15-28 8-24 0Z',
  'M-22-6C-19-15-6-18 2-14C10-20 22-14 22-5C27 2 20 11 12 10C6 17-6 16-10 10C-18 12-25 3-22-6Z',
]

function Ham({ v = 0 }) {
  const d = HAM[v % HAM.length]
  return (
    <g>
      <path d={d} fill="#E6958A" stroke="#C86F62" strokeWidth="1" />
      <path d="M-18-4C-12-10-3-12 4-9" stroke="#F8D9D0" strokeWidth="3.2" fill="none" strokeLinecap="round" opacity="0.9" />
      <path d="M-11 5C-4 9 5 8 12 2" stroke="#F2B8AD" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.85" />
      <path d="M8-11C13-7 15-2 13 3" stroke="#D27C70" strokeWidth="1" fill="none" opacity="0.8" />
      <path d={d} transform="scale(0.97)" fill="none" stroke="#B85A4D" strokeWidth="0.6" opacity="0.4" />
    </g>
  )
}

function Tuna({ v = 0 }) {
  const flakes = [
    ['M-18-8C-14-15-4-15-2-9C2-12 8-9 6-3C9 2 3 7-3 5C-8 9-17 6-18-1C-21-3-20-6-18-8Z', '#D9BC9F'],
    ['M4-14C9-18 18-15 19-8C23-4 20 3 14 2C11 6 5 4 4-1C0-4 0-11 4-14Z', '#CFAE90'],
    ['M-6 6C-2 2 6 3 8 8C12 10 11 17 5 17C1 20-7 18-8 13C-11 11-9 7-6 6Z', '#DCC2A6'],
  ]
  const order = v % 2 === 0 ? flakes : [...flakes].reverse()
  return (
    <g>
      {order.map(([d, fill], i) => (
        <g key={i}>
          <path d={d} fill={fill} stroke="#B08A6B" strokeWidth="0.8" />
          <path d={d} transform="scale(0.55)" fill="none" stroke="#BE9878" strokeWidth="0.7" opacity="0.7" />
        </g>
      ))}
      <path d="M-14-6L-5-3M9-11L15-6M-3 10L5 13" stroke="#A97F60" strokeWidth="0.8" opacity="0.7" strokeLinecap="round" />
      <path d="M-15-9C-11-12-6-12-4-9" stroke="#F1E2CF" strokeWidth="1.2" fill="none" opacity="0.8" strokeLinecap="round" />
    </g>
  )
}

const MUSH = 'M-20 2C-20-10-10-17 0-17C10-17 20-10 20 2C20 5 17 6 13 5C10 5 7 6 6 9L6 15C6 17 4 18 0 18C-4 18-6 17-6 15L-6 9C-7 6-10 5-13 5C-17 6-20 5-20 2Z'

function Mushroom({ v = 0 }) {
  return (
    <g transform={v % 2 ? 'scale(-1 1)' : undefined}>
      <path d={MUSH} fill="#E8D7B8" stroke="#8E6A43" strokeWidth="1.5" />
      <path d="M-16 1C-9-3 9-3 16 1" stroke="#C9AE86" strokeWidth="1.2" fill="none" />
      <path d="M-12-1L-3 4M0-2L0 5M12-1L3 4" stroke="#CDB48D" strokeWidth="0.8" fill="none" opacity="0.8" />
      <path d="M-2 7L-2 15M2 7L2 14" stroke="#D2BC97" strokeWidth="0.9" opacity="0.8" />
      <path d="M-13-10C-7-14 5-15 12-10" stroke="#F6EBD6" strokeWidth="1.8" fill="none" opacity="0.85" strokeLinecap="round" />
      <ellipse cx="9" cy="-6" rx="2.2" ry="1.4" fill="#B98F5E" opacity="0.5" />
    </g>
  )
}

const CORN = [[-8, -6, -10], [0, -9, 8], [8, -5, 20], [-4, 2, -4], [5, 3, 12], [-11, 5, 24], [1, 10, -16]]

function Corn({ v = 0 }) {
  const n = 5 + (v % 3)
  return (
    <g>
      {CORN.slice(0, n).map(([x, y, r], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${r + v * 17})`}>
          <path d="M-3.4-3.8C-1.2-5 1.2-5 3.4-3.8C4.5-1 4-.2 3 3.3C1 4.9-1 4.9-3 3.3C-4-.2-4.5-1-3.4-3.8Z" fill="#F2C12E" stroke="#C99212" strokeWidth="0.6" />
          <ellipse cx="-0.8" cy="-1.8" rx="1.6" ry="1" fill="#FCE79A" opacity="0.9" />
        </g>
      ))}
    </g>
  )
}

function Olive({ v = 0 }) {
  return (
    <g transform={v % 2 ? 'scale(1 0.88)' : undefined}>
      <circle r="9.5" fill="none" stroke="#3A2A2D" strokeWidth="6.4" />
      <circle r="6.6" fill="none" stroke="#56424A" strokeWidth="0.9" opacity="0.8" />
      <path d="M-9-5A11 11 0 0 1 2-11" stroke="#9C8A90" strokeWidth="1.5" fill="none" opacity="0.55" strokeLinecap="round" />
    </g>
  )
}

function Onion({ v = 0 }) {
  const r = v % 2 ? 12 : 14
  const span = v % 3 === 2 ? 0.95 : 0.75
  const a0 = Math.PI * (1.5 - span)
  const a1 = Math.PI * (1.5 + span)
  const p = (rad) =>
    `M${(Math.cos(a0) * rad).toFixed(1)} ${(Math.sin(a0) * rad).toFixed(1)}A${rad} ${rad} 0 ${span > 0.5 ? 1 : 0} 1 ${(Math.cos(a1) * rad).toFixed(1)} ${(Math.sin(a1) * rad).toFixed(1)}`
  return (
    <g>
      <path d={p(r)} stroke="#8E2F60" strokeWidth="3.6" fill="none" strokeLinecap="round" />
      <path d={p(r - 2.4)} stroke="#EBD4E6" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.95" />
      <path d={p(r - 5.6)} stroke="#B65C8C" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.7" />
    </g>
  )
}

function Peperoni() {
  return (
    <g>
      <path d="M-23-3C-10-11 8-10 22-3C8 3-10 8-23 3C-19 1-19-1-23-3Z" fill="#4E7A32" stroke="#365720" strokeWidth="0.9" />
      <path d="M-16-2C-6-6 6-6 16-3" stroke="#7DA95C" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M-16 2C-6 4 6 4 16 1" stroke="#3A5C23" strokeWidth="0.9" fill="none" opacity="0.8" />
    </g>
  )
}

function Tomato() {
  return (
    <g>
      <circle r="12" fill="#C93A27" stroke="#A12A18" strokeWidth="0.9" />
      <circle r="8.6" fill="#E25B43" />
      {[[-3.6, -3], [3.8, -2.6], [0, 4.2]].map(([x, y], i) => (
        <g key={i}>
          <ellipse cx={x} cy={y} rx="2.8" ry="2.2" fill="#F5A88F" />
          <circle cx={x + 0.4} cy={y} r="0.8" fill="#F1E0A0" />
        </g>
      ))}
      <path d="M-7-7A10 10 0 0 1 4-9.5" stroke="#F79680" strokeWidth="1.2" fill="none" opacity="0.8" />
    </g>
  )
}

const EGG = 'M-27-3C-29-14-17-23-5-21C4-27 18-22 22-12C30-7 29 6 21 12C17 21 4 24-5 19C-15 23-27 15-26 6C-30 3-29-1-27-3Z'

function Egg() {
  return (
    <g>
      <path d={EGG} transform="scale(1.06)" fill="#D9A35C" opacity="0.55" />
      <path d={EGG} fill="#FFFCF3" stroke="#E7D8B8" strokeWidth="0.9" />
      <path d={EGG} transform="translate(-3 -3) scale(0.7)" fill="#FFFFFF" opacity="0.7" />
      <circle cx="2" cy="-1" r="11.5" fill="#F5D7A0" opacity="0.7" />
      <circle cx="2" cy="-1" r="10" fill="#F3A425" stroke="#DB8410" strokeWidth="0.9" />
      <circle cx="3" cy="0" r="6.5" fill="#F8B637" opacity="0.8" />
      <ellipse cx="-2" cy="-5" rx="3.6" ry="2.3" fill="#FFE2A0" opacity="0.95" transform="rotate(-25 -2 -5)" />
      <circle cx="17" cy="9" r="1.4" fill="#C9944E" opacity="0.6" />
      <circle cx="-20" cy="4" r="1.1" fill="#C9944E" opacity="0.5" />
    </g>
  )
}

function Rucola({ v = 0 }) {
  return (
    <g transform={v % 2 ? 'scale(-1 1) rotate(14)' : undefined}>
      <path d="M-24 3C-21-3-15-1-12-6C-9-1-5-7-1-2C2-8 7-3 11-7C13-1 17-3 21-5C23 0 26 0 24 5C20 10 14 9 10 14C6 10 2 13-2 9C-6 13-11 10-14 13C-17 8-22 10-24 3Z" fill="#41712F" stroke="#2C4F21" strokeWidth="0.9" />
      <path d="M-18 3C-8 2 6 1 18 3" stroke="#78A75D" strokeWidth="1" fill="none" opacity="0.9" />
      <g transform="translate(4 -6) rotate(-32) scale(0.62)">
        <path d="M-24 3C-21-3-15-1-12-6C-9-1-5-7-1-2C2-8 7-3 11-7C13-1 17-3 21-5C23 0 26 0 24 5C20 10 14 9 10 14C6 10 2 13-2 9C-6 13-11 10-14 13C-17 8-22 10-24 3Z" fill="#5A8D40" stroke="#36602A" strokeWidth="1.2" />
        <path d="M-18 3C-8 2 6 1 18 3" stroke="#8DBA70" strokeWidth="1.4" fill="none" />
      </g>
    </g>
  )
}

function Basil({ v = 0 }) {
  return (
    <g transform={v % 2 ? 'scale(1 -1)' : undefined}>
      <path d="M-22 1C-15-12 6-15 22 0C6 14-14 13-22 1Z" fill="#3E7B33" stroke="#2B5A24" strokeWidth="0.9" />
      <path d="M-22 1C-14 9 4 12 22 0C6 14-14 13-22 1Z" fill="#2F6528" opacity="0.6" />
      <path d="M-20 1C-8 0 8-1 21 0" stroke="#7DB066" strokeWidth="1.1" fill="none" />
      <path d="M-10 0L-5-6M-1 0L4-7M8 0L12-5M-8 1L-4 6M1 1L5 7M9 0L13 5" stroke="#6FA25A" strokeWidth="0.7" fill="none" opacity="0.8" />
      <path d="M-14-6C-7-11 4-11 11-7" stroke="#A9D38E" strokeWidth="1.4" fill="none" opacity="0.5" strokeLinecap="round" />
    </g>
  )
}

function Parmesan({ v = 0 }) {
  return (
    <g transform={`rotate(${v * 23})`}>
      <path d="M-20 2C-10-6 8-8 20-3C12 2-4 6-20 2Z" fill="#F5EDCF" stroke="#DBC995" strokeWidth="0.9" />
      <path d="M-12 1C-4-3 6-5 14-4" stroke="#FFFDF3" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M-6 8C1 4 9 4 15 6C9 10 0 12-6 8Z" fill="#EFE4BE" stroke="#D6C38E" strokeWidth="0.8" />
    </g>
  )
}

function Sauce() {
  return (
    <g>
      <path d="M-20-4C-20-14-9-19 0-17C9-21 21-13 20-3C24 6 14 15 3 13C-6 18-19 12-19 4C-23 1-22-2-20-4Z" fill="#B53A22" stroke="#8E2A14" strokeWidth="1" />
      <path d="M-11-8C-5-12 4-12 9-8" stroke="#D96A4E" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.8" />
      <circle cx="6" cy="4" r="1.6" fill="#E8866A" opacity="0.7" />
      <circle cx="-7" cy="5" r="1.1" fill="#E8866A" opacity="0.6" />
    </g>
  )
}

const GLYPHS = {
  sauce: Sauce,
  mozzarella: Mozzarella,
  salami: Salami,
  ham: Ham,
  tuna: Tuna,
  mushroom: Mushroom,
  corn: Corn,
  olive: Olive,
  onion: Onion,
  peperoni: Peperoni,
  tomato: Tomato,
  egg: Egg,
  rucola: Rucola,
  basil: Basil,
  parmesan: Parmesan,
}

export function Glyph({ name, variant = 0 }) {
  const C = GLYPHS[name] || Mozzarella
  return <C v={variant} />
}

// Kleines Icon (z. B. in den Zutaten-Buttons)
export function GlyphIcon({ glyph, className = 'h-9 w-11', viewBox = '-30 -24 60 48' }) {
  return (
    <svg viewBox={viewBox} className={className} aria-hidden="true">
      <Glyph name={glyph} />
    </svg>
  )
}
