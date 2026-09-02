/**
 * Bulk-cargo terminal at golden hour, drawn inline.
 *
 * A vector illustration rather than a stock photo so the page ships with no
 * external requests and stays crisp at any size — same corner radius and shadow
 * treatment a photograph would get.
 */
export default function PortVisual({ className = "" }) {
  return (
    <svg viewBox="0 0 800 620" className={className} preserveAspectRatio="xMidYMid slice" role="img"
         aria-label="Bulk cargo terminal with gantry cranes, stockpiles and a laden bulk carrier at berth">
      <defs>
        <linearGradient id="pv-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0b2545" />
          <stop offset="42%" stopColor="#1e3a6b" />
          <stop offset="72%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="pv-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0e2c52" />
          <stop offset="100%" stopColor="#06172c" />
        </linearGradient>
        <linearGradient id="pv-hull" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e3a6b" />
          <stop offset="100%" stopColor="#08172e" />
        </linearGradient>
        <linearGradient id="pv-pile" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3f2d1a" />
          <stop offset="100%" stopColor="#1c1509" />
        </linearGradient>
        <radialGradient id="pv-sun" cx="0.5" cy="0.5">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="45%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
        <filter id="pv-blur"><feGaussianBlur stdDeviation="7" /></filter>
      </defs>

      <rect width="800" height="620" fill="url(#pv-sky)" />
      <circle cx="612" cy="352" r="130" fill="url(#pv-sun)" opacity="0.85" />
      <circle cx="612" cy="352" r="42" fill="#fffbeb" opacity="0.95" />

      {/* far shoreline + city haze */}
      <rect x="0" y="330" width="800" height="42" fill="#0a1f3c" opacity="0.75" />
      {[30, 70, 118, 160, 210, 262, 700, 742].map((x, i) => (
        <rect key={x} x={x} y={330 - (i % 3) * 14 - 12} width="22" height={40 + (i % 3) * 14}
              fill="#0a1f3c" opacity="0.9" />
      ))}

      {/* gantry cranes */}
      {[{ x: 90, s: 1 }, { x: 268, s: 0.92 }, { x: 430, s: 0.84 }].map(({ x, s }, i) => (
        <g key={x} transform={`translate(${x} ${372}) scale(${s})`} opacity={0.95 - i * 0.08}>
          <rect x="-4" y="-190" width="8" height="190" fill="#0c1e38" />
          <rect x="86" y="-190" width="8" height="190" fill="#0c1e38" />
          <rect x="-30" y="-198" width="180" height="9" fill="#13294d" />
          <rect x="-30" y="-198" width="180" height="3" fill="#eab308" opacity="0.55" />
          <rect x="10" y="-232" width="70" height="36" fill="#13294d" />
          <line x1="46" y1="-196" x2="46" y2="-150" stroke="#94a3b8" strokeWidth="1.6" />
          <rect x="30" y="-152" width="34" height="20" rx="2" fill="#eab308" />
          <rect x="-14" y="-6" width="24" height="10" rx="2" fill="#0a1930" />
          <rect x="80" y="-6" width="24" height="10" rx="2" fill="#0a1930" />
        </g>
      ))}

      {/* stockpiles on the quay */}
      <path d="M470 372 L534 300 L598 372 Z" fill="url(#pv-pile)" />
      <path d="M584 372 L644 316 L704 372 Z" fill="url(#pv-pile)" opacity="0.9" />
      <path d="M676 372 L724 330 L772 372 Z" fill="url(#pv-pile)" opacity="0.8" />
      <path d="M534 300 L598 372 L566 372 Z" fill="#000" opacity="0.28" />

      {/* conveyor gallery */}
      <g opacity="0.9">
        <rect x="440" y="286" width="330" height="9" fill="#13294d" />
        <rect x="440" y="286" width="330" height="2.5" fill="#eab308" opacity="0.5" />
        {[470, 540, 610, 680, 748].map((x) => (
          <rect key={x} x={x} y="295" width="5" height="34" fill="#0c1e38" />
        ))}
      </g>

      {/* quay line */}
      <rect x="0" y="372" width="800" height="18" fill="#132a4d" />
      <rect x="0" y="372" width="800" height="3" fill="#eab308" opacity="0.45" />

      {/* laden bulk carrier at berth */}
      <g transform="translate(60 392)">
        <path d="M0 0 L520 0 L556 22 L520 74 Q506 84 470 84 L44 84 Q10 84 2 56 Z" fill="url(#pv-hull)" />
        <rect x="-2" y="-9" width="528" height="11" rx="2" fill="#334155" />
        <rect x="0" y="-4" width="524" height="2.5" fill="#eab308" opacity="0.85" />
        <path d="M4 56 Q12 84 44 84 L470 84 Q506 84 520 74 L522 66 Q506 74 470 74 L46 74 Q16 74 8 52 Z"
              fill="#b91c1c" opacity="0.8" />
        {/* accommodation aft */}
        <rect x="18" y="-64" width="82" height="56" rx="2" fill="#cbd5e1" />
        {[0, 1, 2].map((r) => (
          <g key={r}>
            {[0, 1, 2, 3].map((c) => (
              <rect key={c} x={26 + c * 18} y={-56 + r * 15} width="12" height="7" fill="#0f2a4d" />
            ))}
          </g>
        ))}
        <rect x="48" y="-88" width="22" height="26" fill="#0f172a" />
        <rect x="48" y="-82" width="22" height="7" fill="#eab308" />
        {/* hatch covers + deck cranes */}
        {[130, 224, 318, 412].map((x) => (
          <g key={x}>
            <rect x={x} y="-20" width="76" height="20" rx="2" fill="#1e3a6b" />
            <rect x={x} y="-20" width="76" height="4" fill="#3b5f9e" opacity="0.7" />
          </g>
        ))}
        {[196, 384].map((x) => (
          <g key={x}>
            <rect x={x} y="-58" width="10" height="40" fill="#eab308" />
            <line x1={x + 5} y1="-56" x2={x + 62} y2="-84" stroke="#eab308" strokeWidth="5" />
          </g>
        ))}
      </g>

      {/* water + reflections */}
      <rect x="0" y="476" width="800" height="144" fill="url(#pv-water)" />
      <g opacity="0.5" filter="url(#pv-blur)">
        <rect x="60" y="476" width="556" height="60" fill="#0b2545" />
        <rect x="560" y="476" width="120" height="120" fill="#f59e0b" opacity="0.35" />
      </g>
      {[492, 512, 534, 558, 584].map((y, i) => (
        <path key={y} d={`M0 ${y} C 160 ${y - 6}, 320 ${y + 7}, 480 ${y} S 720 ${y - 6}, 800 ${y}`}
              stroke="#eab308" strokeOpacity={0.24 - i * 0.03} strokeWidth={2 - i * 0.2} fill="none" />
      ))}

      {/* tug in the foreground */}
      <g transform="translate(628 520)">
        <path d="M0 0 L84 0 L96 8 L84 26 L10 26 Q0 26 0 14 Z" fill="#0b2545" />
        <rect x="22" y="-18" width="30" height="20" rx="2" fill="#e2e8f0" opacity="0.9" />
        <rect x="56" y="-10" width="10" height="12" fill="#eab308" />
      </g>

      {/* warm atmospheric wash */}
      <rect width="800" height="620" fill="url(#pv-sun)" opacity="0.06" />
      <rect width="800" height="620" fill="#020617" opacity="0.14" />
    </svg>
  );
}
