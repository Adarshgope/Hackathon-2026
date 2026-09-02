/** Tab 3 — historical freight trends and the AI spot-rate forecast. */

import { useState } from "react";
import {
  Area, CartesianGrid, ComposedChart, Line, ReferenceDot, ReferenceLine,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { CalendarCheck, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import {
  Badge, ChartTooltip, Legend, Panel, Segmented, Skeleton, SourceChip,
} from "./ui";
import { useApi } from "../../lib/useApi";
import { endpoints } from "../../lib/api";
import { axisProps, CHART, dayMonth, num, pct, signalTone, usd } from "../../lib/format";

const HORIZONS = [
  { label: "30 days", value: 30 },
  { label: "60 days", value: 60 },
  { label: "90 days", value: 90 },
];

const LOOKBACKS = [
  { label: "90d", value: 90 },
  { label: "180d", value: 180 },
  { label: "1y", value: 365 },
];

/** History and forecast on one axis: both are USD/tonne on the same lane. */
function RateChart({ history, forecast, bestEntry }) {
  // Stitch the two series so the line is continuous across "today".
  const rows = [
    ...history.map((p) => ({ date: p.date, actual: p.rate })),
    ...forecast.map((p) => ({
      date: p.date,
      forecast: p.forecast,
      band: [p.lower, p.upper],
    })),
  ];
  // Bridge the seam — the last actual is also the forecast's first point.
  const seam = rows.findIndex((r) => r.forecast != null);
  if (seam > 0) rows[seam - 1].forecast = rows[seam - 1].actual;

  return (
    <>
      <Legend
        items={[
          { label: "Actual spot rate", color: CHART.series[1] },
          { label: "Forecast", color: CHART.accent, dashed: true },
          { label: "95% confidence band", color: "rgba(59,130,246,.35)" },
        ]}
      />
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={rows} margin={{ top: 6, right: 12, left: 4, bottom: 4 }}>
          <defs>
            <linearGradient id="bandFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART.band} stopOpacity="0.26" />
              <stop offset="100%" stopColor={CHART.band} stopOpacity="0.06" />
            </linearGradient>
          </defs>

          <CartesianGrid stroke={CHART.grid} vertical={false} />
          <XAxis dataKey="date" {...axisProps} tickFormatter={dayMonth} minTickGap={44} />
          <YAxis
            {...axisProps} width={54} domain={["auto", "auto"]}
            tickFormatter={(v) => `$${v.toFixed(0)}`}
          />
          <Tooltip
            cursor={{ stroke: CHART.accent, strokeWidth: 1, strokeDasharray: "3 3" }}
            content={
              <ChartTooltip
                labelFormatter={dayMonth}
                formatter={(v) => (Array.isArray(v) ? `${usd(v[0], 2)} – ${usd(v[1], 2)}` : `${usd(v, 2)}/t`)}
              />
            }
          />

          <Area
            dataKey="band" name="95% confidence" stroke="none" fill="url(#bandFill)"
            connectNulls isAnimationActive={false}
          />
          <Line
            dataKey="actual" name="Actual spot rate" type="monotone"
            stroke={CHART.series[1]} strokeWidth={2} dot={false}
            activeDot={{ r: 4, fill: CHART.series[1], stroke: CHART.surface, strokeWidth: 2 }}
          />
          <Line
            dataKey="forecast" name="Forecast" type="monotone"
            stroke={CHART.accent} strokeWidth={2} strokeDasharray="5 4" dot={false}
            connectNulls
            activeDot={{ r: 4, fill: CHART.accent, stroke: CHART.surface, strokeWidth: 2 }}
          />

          {history.length > 0 && (
            <ReferenceLine
              x={history[history.length - 1].date}
              stroke="rgba(148,163,184,.45)" strokeDasharray="3 3"
              label={{ value: "TODAY", position: "insideTopRight", fill: CHART.inkMuted,
                       fontSize: 9, fontWeight: 700 }}
            />
          )}
          {bestEntry && (
            <ReferenceDot
              x={bestEntry.date} y={bestEntry.rate} r={5}
              fill="#34d399" stroke={CHART.surface} strokeWidth={2}
              label={{ value: "BEST ENTRY", position: "top", fill: "#34d399",
                       fontSize: 9, fontWeight: 700 }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </>
  );
}

/** Week-by-week procurement calendar derived from the forward curve. */
function TimingCalendar({ weeks }) {
  const tone = {
    FIX: "border-emerald-500/35 bg-emerald-500/10 text-emerald-300",
    WATCH: "border-amber-500/35 bg-amber-500/10 text-amber-300",
    AVOID: "border-rose-500/30 bg-rose-500/8 text-rose-300",
  };

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {weeks.map((w) => (
        <div key={w.week} className={`rounded-xl border p-3 ${tone[w.action]}`}>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] tracking-wider opacity-70">WEEK {w.week}</span>
            <span className="text-[10px] font-extrabold tracking-wider">{w.action}</span>
          </div>
          <p className="mt-1.5 font-display text-lg font-extrabold text-white">
            {usd(w.avg_rate, 2)}
            <span className="ml-1 text-[10px] font-medium opacity-60">/t avg</span>
          </p>
          <p className="text-[10.5px] opacity-70">
            {dayMonth(w.start)} – {dayMonth(w.end)}
          </p>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-current" style={{ width: `${w.score * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** All lanes at a glance. */
function RateMatrix({ onPick, active }) {
  const { data, loading, source } = useApi("matrix", endpoints.matrix());
  const rows = data?.rows || [];

  return (
    <Panel
      title="Trade Lane Matrix"
      subtitle="Current spot, 30-day move and model direction across every lane"
      action={<SourceChip source={source} />}
      padded={false}
    >
      {loading && !rows.length ? (
        <div className="p-5"><Skeleton className="h-52 w-full" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-blue-200/45">
                {["Lane", "Cargo", "Distance", "Spot", "30d move", "Forecast", "Signal", "Conf."].map((h) => (
                  <th key={h} className="whitespace-nowrap px-4 py-2.5 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-500/8">
              {rows.map((r) => {
                const t = signalTone(r.signal);
                const up = r.change_30d_pct >= 0;
                return (
                  <tr
                    key={r.route_id}
                    onClick={() => onPick(r.route_id)}
                    className={`cursor-pointer transition-colors hover:bg-blue-500/8 ${
                      r.route_id === active ? "bg-amber-400/8" : ""
                    }`}
                  >
                    <td className="whitespace-nowrap px-4 py-2.5 text-[12px] font-semibold text-white">
                      {r.route}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-[11.5px] text-blue-100/60">{r.cargo}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 font-mono text-[11px] text-blue-200/50">
                      {num(r.distance_nm, 0)} nm
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 font-mono text-[12px] font-semibold text-white">
                      {usd(r.rate, 2)}
                    </td>
                    <td className={`whitespace-nowrap px-4 py-2.5 font-mono text-[11.5px] font-bold ${up ? "text-rose-300" : "text-emerald-300"}`}>
                      {pct(r.change_30d_pct, 1)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 font-mono text-[11.5px] text-amber-300">
                      {usd(r.forecast_30d, 2)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${t.bg} ${t.text}`}>
                        {r.signal === "RISING" ? <TrendingUp size={10} /> : r.signal === "FALLING" ? <TrendingDown size={10} /> : null}
                        {r.signal}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 font-mono text-[11px] text-blue-200/55">
                      {Math.round(r.confidence * 100)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="border-t border-blue-500/10 px-4 py-2.5 text-[10.5px] text-blue-200/40">
            A rising spot rate raises procurement cost — rising is shown in the caution colour. Select any row to chart it.
          </p>
        </div>
      )}
    </Panel>
  );
}

export default function PredictorTab() {
  const [route, setRoute] = useState("IDTAB-INVTZ");
  const [horizon, setHorizon] = useState(60);
  const [lookback, setLookback] = useState(90);

  const { data: routeData } = useApi("routes", endpoints.routes());
  const { data: timing, source } = useApi("timing", endpoints.timing(route, horizon), {
    args: { route, horizon },
  });
  const { data: hist } = useApi("history", endpoints.history(route, lookback), {
    args: { route, days: lookback },
  });

  const history = (hist?.series || []).slice(-lookback);
  const tone = timing ? signalTone(timing.signal) : signalTone();

  return (
    <div className="space-y-5">
      {/* ------------------------------------------------ filter row */}
      <div className="flex flex-wrap items-end gap-4">
        <label className="block min-w-[260px] flex-1 sm:flex-none">
          <span className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-wider text-blue-200/55">
            Trade lane
          </span>
          <select className="field" value={route} onChange={(e) => setRoute(e.target.value)}>
            {(routeData?.routes || []).map((r) => (
              <option key={r.id} value={r.id} className="bg-[#0a192f]">
                {r.label} · {r.cargo}
              </option>
            ))}
          </select>
        </label>

        <div>
          <span className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-wider text-blue-200/55">
            History
          </span>
          <Segmented options={LOOKBACKS} value={lookback} onChange={setLookback} />
        </div>

        <div>
          <span className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-wider text-blue-200/55">
            Forecast horizon
          </span>
          <Segmented options={HORIZONS} value={horizon} onChange={setHorizon} />
        </div>

        <div className="ml-auto"><SourceChip source={source} /></div>
      </div>

      {/* ------------------------------------------------ headline */}
      <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        {timing && [
          { label: "Current spot", value: usd(timing.current_rate, 2), unit: "/tonne", accent: "text-white" },
          { label: `Forecast · ${horizon}d`, value: usd(timing.forecast_rate, 2), unit: "/tonne", accent: "text-amber-300" },
          { label: "Expected move", value: pct(timing.change_pct, 2), unit: `${timing.signal}`, accent: tone.text },
          { label: "Model confidence", value: `${Math.round(timing.confidence * 100)}%`, unit: "95% band shown", accent: "text-white" },
        ].map((c) => (
          <div key={c.label} className="glass rounded-2xl p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-blue-200/55">{c.label}</p>
            <p className={`mt-1.5 font-display text-[26px] font-extrabold leading-none ${c.accent}`}>
              {c.value}
            </p>
            <p className="mt-1.5 text-[11px] text-blue-200/45">{c.unit}</p>
          </div>
        ))}
        {!timing && Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass rounded-2xl p-4"><Skeleton className="h-16 w-full" /></div>
        ))}
      </div>

      {/* ------------------------------------------------ main chart */}
      <Panel
        title={timing ? timing.route : "Freight Rate Trend & Forecast"}
        subtitle={timing ? `${timing.cargo} · ${timing.model}` : "Loading model output…"}
        action={
          timing && (
            <Badge tone={timing.signal === "RISING" ? "critical" : timing.signal === "FALLING" ? "clear" : "warning"}>
              {timing.signal}
            </Badge>
          )
        }
      >
        {!timing ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <>
            <RateChart
              history={history}
              forecast={timing.points}
              bestEntry={timing.best_entry}
            />

            <div className="mt-4 grid gap-3 border-t border-blue-500/10 pt-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-xl border border-amber-400/25 bg-amber-400/8 p-3.5">
                <Sparkles size={15} className="mt-0.5 shrink-0 text-amber-300" />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                    Procurement call
                  </p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-blue-50">
                    {timing.recommendation}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/8 p-3.5">
                <CalendarCheck size={15} className="mt-0.5 shrink-0 text-emerald-300" />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                    Cheapest window
                  </p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-blue-50">
                    {dayMonth(timing.best_entry.date)} at {usd(timing.best_entry.rate, 2)}/t —{" "}
                    {usd(timing.current_rate - timing.best_entry.rate, 2)}/t below today.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </Panel>

      {/* ------------------------------------------------ timing calendar */}
      <Panel
        title="Market Entry Calendar"
        subtitle="Weekly averages from the forward curve, scored for fixing"
      >
        {timing?.weeks?.length ? (
          <TimingCalendar weeks={timing.weeks} />
        ) : (
          <Skeleton className="h-24 w-full" />
        )}
      </Panel>

      <RateMatrix onPick={setRoute} active={route} />
    </div>
  );
}
