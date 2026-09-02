/** Shared dashboard primitives — panels, tiles, badges, chart chrome. */

import { AlertTriangle, ArrowDownRight, ArrowUpRight, Info, Minus, ShieldCheck } from "lucide-react";
import { CHART, levelTone, num } from "../../lib/format";

/* --------------------------------------------------------------- surfaces */

export function Panel({ title, subtitle, action, children, className = "", padded = true }) {
  return (
    <section
      className={`glass rounded-2xl shadow-[0_24px_60px_-32px_rgba(0,0,0,.95)] ${className}`}
    >
      {(title || action) && (
        <header className="flex items-start justify-between gap-4 border-b border-blue-500/12 px-5 py-3.5">
          <div>
            {title && (
              <h3 className="font-display text-[13.5px] font-bold tracking-wide text-white">
                {title}
              </h3>
            )}
            {subtitle && <p className="mt-0.5 text-[11.5px] text-blue-200/50">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={padded ? "p-5" : ""}>{children}</div>
    </section>
  );
}

export function Segmented({ options, value, onChange, size = "md" }) {
  const pad = size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3.5 py-1.5 text-[12px]";
  return (
    <div className="inline-flex rounded-lg border border-blue-500/20 bg-[#02060f]/70 p-0.5">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`rounded-[6px] font-semibold transition-all ${pad} ${
              active
                ? "bg-gradient-to-br from-yellow-300 to-amber-500 text-[#0a192f] shadow-[0_4px_14px_-6px_rgba(234,179,8,.9)]"
                : "text-blue-200/60 hover:text-white"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function Badge({ tone = "info", icon: Icon, children }) {
  const t = levelTone(tone);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider ${t.bg} ${t.border} ${t.text}`}
    >
      {Icon && <Icon size={11} />}
      {children}
    </span>
  );
}

/** "Live" vs "Demo" data provenance chip. */
export function SourceChip({ source }) {
  if (!source) return null;
  const live = source === "live";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[9.5px] tracking-wider ${
        live ? "bg-emerald-500/10 text-emerald-300" : "bg-amber-500/10 text-amber-300"
      }`}
      title={live ? "Served by the Flask API" : "Flask API unreachable — generated in-browser"}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-emerald-400" : "bg-amber-400"}`} />
      {live ? "LIVE" : "DEMO"}
    </span>
  );
}

export function Skeleton({ className = "h-4 w-full" }) {
  return <div className={`animate-pulse rounded bg-blue-500/10 ${className}`} />;
}

export function EmptyState({ icon: Icon = Info, title, detail }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <Icon size={22} className="text-blue-300/40" />
      <p className="text-sm font-semibold text-blue-100/70">{title}</p>
      {detail && <p className="max-w-sm text-[12px] text-blue-200/45">{detail}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ tiles */

/** Bare sparkline — decoration for a stat tile, so no axes or hover layer. */
export function Sparkline({ points = [], tone = "up", height = 34 }) {
  if (points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const step = 100 / (points.length - 1);
  const coords = points.map((p, i) => [i * step, 100 - ((p - min) / span) * 100]);
  const line = coords.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");
  const area = `${line} L100 100 L0 100 Z`;
  const stroke = tone === "down" ? "#34d399" : CHART.accent;
  const id = `spark-${tone}-${points.length}-${Math.round(points[0] * 100)}`;

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ height }} className="w-full" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.32" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={stroke} strokeWidth="2" vectorEffect="non-scaling-stroke"
            strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function StatTile({ label, value, unit, changePct, hint, sparkline, tone }) {
  const up = (changePct ?? 0) >= 0;
  const Arrow = changePct == null ? Minus : up ? ArrowUpRight : ArrowDownRight;
  // "Good" depends on the metric: dwell time falling is good, freight rising is not.
  const positive = tone === "down" ? !up : up;

  return (
    <div className="group glass relative overflow-hidden rounded-2xl p-4 transition-all hover:border-amber-400/35">
      <div className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-amber-400/5 blur-2xl transition-opacity group-hover:bg-amber-400/10" />

      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-blue-200/55">
        {label}
      </p>

      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="font-display text-[26px] font-extrabold leading-none tracking-tight text-white">
          {typeof value === "number" ? num(value, Number.isInteger(value) ? 0 : 1) : value}
        </span>
        {unit && <span className="text-[11px] font-medium text-blue-200/50">{unit}</span>}
      </div>

      <div className="mt-2 flex items-center gap-1.5">
        <span
          className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10.5px] font-bold ${
            positive ? "bg-emerald-500/12 text-emerald-300" : "bg-rose-500/12 text-rose-300"
          }`}
        >
          <Arrow size={11} />
          {changePct == null ? "—" : `${Math.abs(changePct).toFixed(1)}%`}
        </span>
        <span className="text-[10.5px] text-blue-200/40">vs prev</span>
      </div>

      {sparkline?.length > 1 && (
        <div className="mt-3 -mx-1">
          <Sparkline points={sparkline} tone={tone} />
        </div>
      )}

      {hint && <p className="mt-2 text-[11px] leading-snug text-blue-200/45">{hint}</p>}
    </div>
  );
}

/* ------------------------------------------------------------ chart chrome */

/** Recharts tooltip skinned to the panel surface. */
export function ChartTooltip({ active, payload, label, formatter, labelFormatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-lg px-3 py-2 shadow-2xl">
      {label != null && (
        <p className="mb-1.5 font-mono text-[10px] tracking-wider text-blue-200/60">
          {labelFormatter ? labelFormatter(label) : label}
        </p>
      )}
      <div className="space-y-1">
        {payload.map((row) => (
          <div key={row.dataKey ?? row.name} className="flex items-center gap-2.5">
            <span className="h-2 w-2 shrink-0 rounded-[2px]" style={{ background: row.color || row.stroke }} />
            <span className="text-[11px] text-blue-100/70">{row.name}</span>
            <span className="ml-auto font-mono text-[11.5px] font-semibold text-white">
              {formatter ? formatter(row.value, row.dataKey, row) : row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Legend row — always rendered when a chart carries two or more series. */
export function Legend({ items }) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {items.map((it) => (
        <span key={it.label} className="inline-flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-[3px]"
            style={{
              background: it.dashed ? "transparent" : it.color,
              border: it.dashed ? `2px dashed ${it.color}` : "none",
            }}
          />
          <span className="text-[11px] font-medium text-blue-100/65">{it.label}</span>
        </span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ alerts */

export function AlertRow({ level, title, detail, text }) {
  const t = levelTone(level);
  const Icon = level === "critical" ? AlertTriangle : level === "info" ? Info : ShieldCheck;
  return (
    <div className={`flex items-start gap-3 rounded-xl border ${t.border} ${t.bg} p-3`}>
      <Icon size={15} className={`mt-0.5 shrink-0 ${t.text}`} />
      <div className="min-w-0">
        {title && <p className="text-[12.5px] font-semibold text-blue-50">{title}</p>}
        <p className="text-[11.5px] leading-relaxed text-blue-100/60">{detail || text}</p>
      </div>
    </div>
  );
}
