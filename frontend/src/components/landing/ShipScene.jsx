/**
 * The vessel, her deck cargo and the suspended container.
 *
 * Laid out in the fixed coordinate space from `lib/scene.js` and scaled to the
 * viewport by ScrollStage. Animated parts carry a `data-el` tag; ScrollTrigger
 * addresses them through GSAP's scoped selectors rather than refs.
 */

import { SCENE } from "../../lib/scene";

const DECK_LABELS = ["RELIABLE", "ACCURATE", "TRUSTED"];

/* ------------------------------------------------------------------ pieces */

/** One athwartships container — we see its narrow door end, so the word reads. */
function DeckContainer({ label, index }) {
  const { box } = SCENE;
  return (
    <div
      className="absolute overflow-hidden rounded-[3px]"
      style={{
        left: SCENE.boxLeft + index * (box.w + box.gap),
        top: SCENE.boxTop,
        width: box.w,
        height: box.h,
        background: "linear-gradient(160deg,#fde047 0%,#eab308 42%,#ca8a04 100%)",
        boxShadow:
          "inset 0 2px 0 rgba(255,255,255,.55), inset 0 -6px 12px rgba(120,53,15,.45), 0 10px 24px -8px rgba(0,0,0,.7)",
      }}
    >
      {/* corrugated door skin */}
      <div className="corrugated absolute inset-0 opacity-45" />

      {/* door frame + locking bars */}
      <div className="absolute inset-[7px] rounded-[2px] border border-amber-900/45" />
      <div className="absolute inset-y-[7px] left-1/2 w-px -translate-x-1/2 bg-amber-900/45" />
      {[26, 46, 104, 124].map((x) => (
        <div
          key={x}
          className="absolute top-[10px] bottom-[10px] w-[3px] rounded-full bg-amber-950/50"
          style={{ left: x }}
        />
      ))}

      {/* stencilled word */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="font-display text-[15px] font-extrabold tracking-[0.14em] text-amber-950"
          style={{ textShadow: "0 1px 0 rgba(255,255,255,.4)" }}
        >
          {label}
        </span>
      </div>

      {/* CSC plate */}
      <div className="absolute bottom-[9px] left-1/2 -translate-x-1/2 rounded-[1px] bg-amber-950/70 px-1.5 py-[1px]">
        <span className="font-mono text-[6px] tracking-widest text-amber-100/90">VTX 22G1</span>
      </div>
    </div>
  );
}

/** The hull, accommodation block and funnel. Mirrored for the outbound leg. */
function Hull() {
  const { hullW: W, hullH: H } = SCENE;
  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      className="absolute"
      style={{ left: SCENE.hullLeft, top: SCENE.deckY, overflow: "visible" }}
    >
      <defs>
        <linearGradient id="hullGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e3a6b" />
          <stop offset="38%" stopColor="#132a52" />
          <stop offset="100%" stopColor="#07162c" />
        </linearGradient>
        <linearGradient id="deckGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="50%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id="bootTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#7f1d1d" />
        </linearGradient>
      </defs>

      {/* hull plate — raked bow to starboard (right) */}
      <path
        d={`M 8 0 L ${W - 16} 0 L ${W} 30 L ${W - 44} ${H - 16}
            Q ${W - 56} ${H} ${W - 82} ${H} L 54 ${H}
            Q 20 ${H} 12 ${H - 30} Z`}
        fill="url(#hullGrad)"
      />
      {/* boot-topping stripe at the waterline */}
      <path
        d={`M 14 ${H - 30} Q 22 ${H} 54 ${H} L ${W - 82} ${H}
            Q ${W - 56} ${H} ${W - 44} ${H - 16} L ${W - 48} ${H - 26}
            Q ${W - 58} ${H - 10} ${W - 84} ${H - 10} L 56 ${H - 10}
            Q 26 ${H - 10} 18 ${H - 30} Z`}
        fill="url(#bootTop)"
        opacity="0.85"
      />
      {/* deck edge */}
      <rect x="6" y="-6" width={W - 6} height="9" rx="2" fill="url(#deckGrad)" />
      {/* plating seams */}
      {[26, 52, 78].map((y) => (
        <line key={y} x1="18" y1={y} x2={W - 40} y2={y} stroke="#0b1f3d" strokeWidth="1" opacity="0.65" />
      ))}
      {/* gold sheer line — the brand accent on the hull */}
      <line x1="14" y1="12" x2={W - 26} y2="12" stroke="#eab308" strokeWidth="2.5" opacity="0.9" />
      {/* draft marks + name */}
      <text x="86" y={H - 44} fill="#e2e8f0" fontSize="11" fontFamily="monospace" opacity="0.55">
        VORTEX LINES
      </text>
      <text x={W - 150} y={H - 46} fill="#94a3b8" fontSize="9" fontFamily="monospace" opacity="0.6">
        IMO 9784512
      </text>
    </svg>
  );
}

function Superstructure() {
  const deck = SCENE.deckY;
  const x = SCENE.hullLeft + 26;
  return (
    <div className="absolute" style={{ left: x, top: deck - 92, width: 112, height: 92 }}>
      {/* accommodation block */}
      <div
        className="absolute bottom-0 left-0 w-full rounded-t-[3px]"
        style={{
          height: 66,
          background: "linear-gradient(150deg,#e2e8f0 0%,#cbd5e1 45%,#94a3b8 100%)",
          boxShadow: "inset 0 -8px 14px rgba(15,23,42,.35), 0 8px 20px -8px rgba(0,0,0,.6)",
        }}
      >
        {[0, 1, 2].map((row) => (
          <div key={row} className="absolute left-[7px] right-[7px] flex gap-[4px]" style={{ top: 9 + row * 16 }}>
            {[0, 1, 2, 3, 4].map((c) => (
              <span key={c} className="h-[7px] flex-1 rounded-[1px] bg-sky-950/70" />
            ))}
          </div>
        ))}
        {/* bridge wing */}
        <div className="absolute -left-[9px] top-[6px] h-[9px] w-[9px] bg-slate-300/90" />
        <div className="absolute -right-[9px] top-[6px] h-[9px] w-[9px] bg-slate-300/90" />
      </div>

      {/* funnel with the gold band */}
      <div
        className="absolute bottom-[64px] left-1/2 -translate-x-1/2 rounded-t-[2px]"
        style={{
          width: 30,
          height: 30,
          background: "linear-gradient(180deg,#1e293b,#0f172a)",
          boxShadow: "inset -3px 0 5px rgba(0,0,0,.5)",
        }}
      >
        <div className="absolute inset-x-0 top-[7px] h-[9px] bg-gradient-to-r from-amber-400 to-yellow-500" />
      </div>

      {/* mast + navigation light */}
      <div className="absolute bottom-[92px] left-[14px] h-[22px] w-[2px] bg-slate-400/80" />
      <div className="absolute bottom-[112px] left-[11px] h-[7px] w-[7px] rounded-full bg-amber-300 shadow-[0_0_12px_4px_rgba(251,191,36,.65)]" />
    </div>
  );
}

/* ------------------------------------------------------------------- export */

export default function ShipScene() {
  const { topBox } = SCENE;

  return (
    <>
      {/* ---------------- the lifting chains --------------------------------
          Anchored to the top of the frame; they pay out as the rig descends. */}
      <div className="absolute inset-0">
        {[SCENE.boxLeft + 95, SCENE.boxLeft + topBox.w - 95 - 13].map((x) => (
          <div
            key={x}
            data-el="chain"
            className="chain absolute top-0 w-[13px] rounded-b-[2px]"
            style={{ left: x, height: SCENE.hangY }}
          />
        ))}
      </div>

      {/* ---------------- suspended rig: the VORTEX container ---------------- */}
      <div data-el="rig" className="absolute inset-0" style={{ willChange: "transform" }}>
        {/* shackles where the chains meet the container */}
        {[SCENE.boxLeft + 88, SCENE.boxLeft + topBox.w - 114].map((x) => (
          <div
            key={x}
            data-el="shackle"
            className="absolute h-[16px] w-[26px] rounded-[3px] border-2 border-slate-400/80 bg-slate-600/70"
            style={{ left: x, top: SCENE.hangY - 8 }}
          />
        ))}

        {/* the hero container */}
        <div
          data-el="topbox"
          className="absolute overflow-hidden rounded-[4px]"
          style={{
            left: SCENE.boxLeft,
            top: SCENE.hangY,
            width: topBox.w,
            height: topBox.h,
            background: "linear-gradient(155deg,#fde047 0%,#eab308 46%,#d97706 100%)",
            boxShadow:
              "inset 0 3px 0 rgba(255,255,255,.6), inset 0 -10px 20px rgba(120,53,15,.4), 0 26px 60px -18px rgba(234,179,8,.55)",
          }}
        >
          <div className="corrugated absolute inset-0 opacity-35" />
          <div className="absolute inset-[9px] rounded-[3px] border border-amber-900/35" />

          {/* specular sweep across the steel */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="animate-sheen absolute -inset-y-4 w-[22%] bg-gradient-to-r from-transparent via-white/55 to-transparent" />
          </div>

          <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
            <h1
              className="font-display text-[52px] font-extrabold leading-none tracking-[0.14em] text-[#0a192f]"
              style={{ textShadow: "0 2px 0 rgba(255,255,255,.35)" }}
            >
              VORTEX
            </h1>
            <p className="mt-2 max-w-[400px] font-sans text-[10.5px] font-semibold uppercase leading-[1.5] tracking-[0.09em] text-amber-950/85">
              Vessel Optimization &amp; Rate Tracking for East-coast eXports/imports
            </p>
          </div>

          {/* corner castings */}
          {[
            ["left-0 top-0", "rounded-br-[4px]"],
            ["right-0 top-0", "rounded-bl-[4px]"],
            ["left-0 bottom-0", "rounded-tr-[4px]"],
            ["right-0 bottom-0", "rounded-tl-[4px]"],
          ].map(([pos, r]) => (
            <span key={pos} className={`absolute ${pos} ${r} h-[13px] w-[17px] bg-amber-950/55`} />
          ))}
        </div>
      </div>

      {/* ---------------- the vessel ---------------------------------------- */}
      <div data-el="ship" className="absolute inset-0" style={{ willChange: "transform" }}>
        {/* hull group is mirrored on the outbound leg so the bow leads */}
        <div data-el="hull" className="absolute inset-0" style={{ transformOrigin: "700px 600px" }}>
          <Hull />
          <Superstructure />
        </div>

        {/* three-abreast deck cargo */}
        <div data-el="deckboxes" className="absolute inset-0">
          {DECK_LABELS.map((label, i) => (
            <DeckContainer key={label} label={label} index={i} />
          ))}

          {/* twist-lock indicators light up when the top box seats */}
          <div data-el="locks" className="absolute opacity-0" style={{ left: SCENE.boxLeft, top: SCENE.boxTop - 6, width: topBox.w }}>
            {[10, topBox.w / 2 - 5, topBox.w - 20].map((x) => (
              <span
                key={x}
                className="absolute h-[9px] w-[9px] rounded-full bg-emerald-400"
                style={{ left: x, boxShadow: "0 0 12px 3px rgba(52,211,153,.75)" }}
              />
            ))}
          </div>
        </div>

        {/* impact flash + dust on touchdown */}
        <div
          data-el="impact"
          className="pointer-events-none absolute opacity-0"
          style={{ left: SCENE.boxLeft - 60, top: SCENE.boxTop - 40, width: topBox.w + 120, height: 90 }}
        >
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(253,224,71,.85),rgba(234,179,8,.25)_45%,transparent_70%)] blur-[6px]" />
          {[8, 26, 52, 78, 92].map((x, i) => (
            <span
              key={x}
              className="absolute bottom-[18px] h-[6px] w-[6px] rounded-full bg-amber-200/70 blur-[1px]"
              style={{ left: `${x}%`, transform: `translateY(${i % 2 ? -6 : 4}px)` }}
            />
          ))}
        </div>

        {/* water reflection beneath the hull */}
        <div
          className="pointer-events-none absolute opacity-45 blur-[7px]"
          style={{
            left: SCENE.hullLeft + 30,
            top: SCENE.waterline + 4,
            width: SCENE.hullW - 70,
            height: 54,
            background:
              "linear-gradient(180deg, rgba(234,179,8,.42), rgba(59,130,246,.22) 45%, transparent 90%)",
            transform: "scaleY(-1)",
          }}
        />
      </div>
    </>
  );
}
