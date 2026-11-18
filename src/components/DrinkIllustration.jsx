const GLASS = '#F2ECE0'
const LINE = '#C2B8A2'

function Bottle({ liquid, cap, bubbles = false, art }) {
  return (
    <g>
      <rect x="52" y="6" width="16" height="12" rx="3" fill={cap} />
      <path d="M55 18h10v4c0 5 13 11 13 26v92c0 6-4 10-10 10H52c-6 0-10-4-10-10V48c0-15 13-21 13-26Z" fill={GLASS} stroke={LINE} strokeWidth="1.6" />
      <path d="M42 84h36v56c0 6-4 10-10 10H52c-6 0-10-4-10-10Z" fill={liquid} />
      {bubbles && (
        <g fill="#FFFFFF" opacity="0.75">
          <circle cx="51" cy="98" r="2.2" />
          <circle cx="66" cy="94" r="1.7" />
          <circle cx="59" cy="110" r="2.6" />
          <circle cx="69" cy="122" r="2" />
          <circle cx="50" cy="130" r="1.6" />
        </g>
      )}
      <rect x="41" y="88" width="38" height="44" rx="3" fill="#FFFCF4" stroke={LINE} strokeWidth="1" />
      {art}
      <path d="M48 46c-3 8-4 18-3 30" stroke="#FFFFFF" strokeWidth="2.2" fill="none" opacity="0.5" strokeLinecap="round" />
    </g>
  )
}

function Can() {
  return (
    <g>
      <rect x="40" y="26" width="40" height="118" rx="7" fill="#DCD7CB" stroke={LINE} strokeWidth="1.6" />
      <rect x="40" y="34" width="40" height="9" fill="#B9B3A6" />
      <ellipse cx="60" cy="28" rx="20" ry="6" fill="#EFEBE1" stroke={LINE} strokeWidth="1.2" />
      <rect x="40" y="58" width="40" height="62" fill="#F08A2B" />
      <path d="M63 66 50 94h8l-3 20 15-30h-8l3-18Z" fill="#FFF7E8" stroke="#D96F16" strokeWidth="1" />
      <rect x="40" y="120" width="40" height="5" fill="#DCD7CB" />
      <path d="M46 46v96" stroke="#FFFFFF" strokeWidth="2" opacity="0.45" strokeLinecap="round" />
    </g>
  )
}

function EmptyGlass() {
  return (
    <g>
      <path d="M42 46h36l-5 84c-.4 7-6 12-13 12s-12.6-5-13-12Z" fill={GLASS} stroke={LINE} strokeWidth="1.8" />
      <path d="M46 76h28l-3.4 54c-.3 5-4 8-10.6 8s-10.3-3-10.6-8Z" fill="#E7EFF4" opacity="0.85" />
      <path d="M34 122 88 42" stroke="#B4472F" strokeWidth="4.5" strokeLinecap="round" />
    </g>
  )
}

const ART = {
  cola: (
    <g>
      <rect x="41" y="94" width="38" height="13" fill="#8E2318" />
      <path d="M47 116h26" stroke="#B4472F" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M50 123h20" stroke="#D9A05B" strokeWidth="1.6" strokeLinecap="round" />
    </g>
  ),
  spezi: (
    <g>
      <circle cx="60" cy="104" r="13" fill="#F5C518" />
      <path d="M42 118a18 18 0 0 1 36 0Z" fill="#E8562A" />
      <path d="M46.5 118a13.5 13.5 0 0 1 27 0Z" fill="#E8327A" />
      <path d="M51 118a9 9 0 0 1 18 0Z" fill="#7C4CA0" />
    </g>
  ),
  floetz_spezi: (
    <g>
      <rect x="41" y="88" width="38" height="44" fill="#1F5B3A" />
      <rect x="41" y="100" width="38" height="6" fill="#D8B45C" />
      <path d="M60 112v16M55 117l5-5 5 5M55 124l5-5 5 5" stroke="#EBD9A3" strokeWidth="1.7" fill="none" strokeLinecap="round" />
    </g>
  ),
  wasser_mit: (
    <g>
      <rect x="41" y="88" width="38" height="44" fill="#2F6FA8" />
      <path d="M41 104c6-5 12 5 19 0s13 5 19 0v8H41Z" fill="#EAF4FA" opacity="0.92" />
      <circle cx="52" cy="121" r="2" fill="#EAF4FA" />
      <circle cx="61" cy="125" r="1.6" fill="#EAF4FA" />
      <circle cx="70" cy="119" r="2.2" fill="#EAF4FA" />
    </g>
  ),
  wasser_ohne: (
    <g>
      <rect x="41" y="88" width="38" height="44" fill="#4C8FB8" />
      <path d="M47 108h26" stroke="#EAF4FA" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M50 120h20" stroke="#CFE6F2" strokeWidth="1.8" strokeLinecap="round" />
    </g>
  ),
}

export const DRINK_ILLUSTRATIONS = [
  { value: 'cola', label: 'Cola-Flasche' },
  { value: 'spezi', label: 'Spezi-Flasche (bunt)' },
  { value: 'floetz_spezi', label: 'Spezi-Flasche (grün)' },
  { value: 'spezi_energy', label: 'Energy-Dose' },
  { value: 'wasser_mit', label: 'Wasser mit Kohlensäure' },
  { value: 'wasser_ohne', label: 'Wasser ohne Kohlensäure' },
  { value: 'kein_durst', label: 'Kein Getränk (Nein danke)' },
]

export default function DrinkIllustration({ kind = 'cola', className = '' }) {
  let inner
  if (kind === 'spezi_energy') inner = <Can />
  else if (kind === 'kein_durst') inner = <EmptyGlass />
  else if (kind === 'floetz_spezi') inner = <Bottle liquid="#E3B45C" cap="#1F5B3A" art={ART.floetz_spezi} />
  else if (kind === 'wasser_mit') inner = <Bottle liquid="#DCEAF2" cap="#2F6FA8" bubbles art={ART.wasser_mit} />
  else if (kind === 'wasser_ohne') inner = <Bottle liquid="#E6F0F7" cap="#8FB6CE" art={ART.wasser_ohne} />
  else if (kind === 'spezi') inner = <Bottle liquid="#E9A445" cap="#3A342D" art={ART.spezi} />
  else inner = <Bottle liquid="#6B3418" cap="#8E2318" art={ART.cola} />
  return (
    <svg viewBox="0 0 120 160" aria-hidden="true" className={className}>
      {inner}
    </svg>
  )
}
