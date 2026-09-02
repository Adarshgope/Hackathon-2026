/** Tab 4 — landed cost & stockyard trade-off calculator. */

import { useMemo, useState } from "react";
import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ReferenceLine,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Calculator, PackageCheck, RotateCcw, Warehouse } from "lucide-react";
import {
  AlertRow, Badge, ChartTooltip, Legend, Panel, Skeleton, SourceChip,
} from "./ui";
import { useCompute } from "../../lib/useApi";
import { endpoints } from "../../lib/api";
import { axisProps, CHART, num, tonnes, usd, usdCompact } from "../../lib/format";

const DEFAULTS = {
  tonnes: 60000,
  fob_price: 92,
  freight_rate: 13.5,
  insurance_pct: 0.35,
  duty_pct: 2.5,
  port_handling: 4.1,
  inland_freight: 6.8,
  holding_days: 21,
  holding_rate: 0.085,
  interest_pct: 8.5,
  laytime_days: 3,
  actual_port_days: 4.6,
  demurrage_rate: 18500,
  demand_rate_tpd: 2600,
  stockout_penalty: 145,
  lead_time_days: 24,
  opening_stock_t: 68000,
};

const GROUPS = [
  {
    heading: "Cargo & Voyage",
    fields: [
      { key: "tonnes", label: "Parcel size", unit: "t", step: 1000 },
      { key: "fob_price", label: "FOB price", unit: "USD/t", step: 1 },
      { key: "freight_rate", label: "Ocean freight", unit: "USD/t", step: 0.25 },
      { key: "insurance_pct", label: "Marine insurance", unit: "% of C&F", step: 0.05 },
    ],
  },
  {
    heading: "Statutory & Port",
    fields: [
      { key: "duty_pct", label: "Customs duty", unit: "% of CIF", step: 0.25 },
      { key: "port_handling", label: "Port handling", unit: "USD/t", step: 0.1 },
      { key: "laytime_days", label: "Laytime allowed", unit: "days", step: 0.5 },
      { key: "actual_port_days", label: "Actual port stay", unit: "days", step: 0.1 },
      { key: "demurrage_rate", label: "Demurrage rate", unit: "USD/day", step: 500 },
      { key: "inland_freight", label: "Inland freight", unit: "USD/t", step: 0.2 },
    ],
  },
  {
    heading: "Stockyard & Risk",
    fields: [
      { key: "holding_days", label: "Godown holding", unit: "days", step: 1 },
      { key: "holding_rate", label: "Storage rate", unit: "USD/t/day", step: 0.005 },
      { key: "interest_pct", label: "Cost of capital", unit: "% p.a.", step: 0.25 },
      { key: "opening_stock_t", label: "Opening stock", unit: "t", step: 1000 },
      { key: "demand_rate_tpd", label: "Plant offtake", unit: "t/day", step: 100 },
      { key: "lead_time_days", label: "Replenishment lead time", unit: "days", step: 1 },
      { key: "stockout_penalty", label: "Stockout penalty", unit: "USD/t short", step: 5 },
    ],
  },
];

const SWEEP_SERIES = [
  { key: "cost_per_t", label: "Total landed cost", color: CHART.series[0] },
  { key: "freight_per_t", label: "Ocean freight", color: CHART.series[1] },
  { key: "holding_per_t", label: "Inventory carrying", color: CHART.series[2] },
];

export default function CostTab() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const { data, source } = useCompute("landed", endpoints.landed(), inputs);

  const set = (key) => (e) => {
    const raw = e.target.value;
    setInputs((s) => ({ ...s, [key]: raw === "" ? "" : Number(raw) }));
  };

  const breakdown = useMemo(
    () => (data?.breakdown || []).filter((r) => r.amount !== 0),
    [data]
  );
  const maxAmount = Math.max(1, ...breakdown.map((r) => Math.abs(r.amount)));

  return (
    <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
      {/* ------------------------------------------------ inputs */}
      <Panel
        title="Cost Model Inputs"
        subtitle="Every field recomputes the stack"
        action={
          <button
            onClick={() => setInputs(DEFAULTS)}
            className="inline-flex items-center gap-1.5 rounded-md border border-blue-500/25 px-2 py-1 text-[10.5px] font-semibold text-blue-200/70 transition-colors hover:border-amber-400/50 hover:text-amber-300"
          >
            <RotateCcw size={11} /> Reset
          </button>
        }
      >
        <div className="max-h-[720px] space-y-5 overflow-y-auto pr-1">
          {GROUPS.map((g) => (
            <div key={g.heading}>
              <p className="mb-2.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-amber-300/85">
                {g.heading}
              </p>
              <div className="space-y-2.5">
                {g.fields.map((f) => (
                  <label key={f.key} className="flex items-center gap-3">
                    <span className="flex-1 text-[11.5px] text-blue-100/70">{f.label}</span>
                    <span className="flex items-center gap-1.5">
                      <input
                        type="number"
                        className="field !w-[92px] !py-1.5 text-right font-mono !text-[12px]"
                        value={inputs[f.key]}
                        step={f.step}
                        min={0}
                        onChange={set(f.key)}
                      />
                      <span className="w-[62px] shrink-0 font-mono text-[9.5px] text-blue-200/40">
                        {f.unit}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* ------------------------------------------------ results */}
      <div className="space-y-5">
        {/* headline */}
        <div className="grid gap-3.5 sm:grid-cols-4">
          {data ? (
            [
              { label: "Landed cost / tonne", value: usd(data.cost_per_tonne, 2), accent: "text-amber-300" },
              { label: "Total consignment", value: usdCompact(data.total_cost), accent: "text-white" },
              { label: "CIF / tonne", value: usd(data.cif_per_tonne, 2), accent: "text-white" },
              { label: "Stock cover", value: `${data.inventory.cover_days} d`, accent: data.inventory.shortfall_t > 0 ? "text-rose-300" : "text-emerald-300" },
            ].map((c) => (
              <div key={c.label} className="glass rounded-2xl p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-blue-200/55">
                  {c.label}
                </p>
                <p className={`mt-1.5 font-display text-[25px] font-extrabold leading-none ${c.accent}`}>
                  {c.value}
                </p>
              </div>
            ))
          ) : (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass rounded-2xl p-4"><Skeleton className="h-14 w-full" /></div>
            ))
          )}
        </div>

        {data?.alerts?.length > 0 && (
          <div className="space-y-2">
            {data.alerts.map((a, i) => <AlertRow key={i} level={a.level} text={a.text} />)}
          </div>
        )}

        {/* cost stack — magnitude by category, so one hue */}
        <Panel
          title="Landed Cost Stack"
          subtitle="FOB through to the godown, per consignment"
          action={
            <div className="flex items-center gap-2">
              <Calculator size={13} className="text-amber-400" />
              <SourceChip source={source} />
            </div>
          }
        >
          {!data ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <div className="space-y-1.5">
              {breakdown.map((row) => {
                const negative = row.amount < 0;
                return (
                  <div key={row.key} className="flex items-center gap-3">
                    <span className="w-[168px] shrink-0 truncate text-[11.5px] text-blue-100/70">
                      {row.label}
                    </span>

                    <div className="relative h-[22px] flex-1 overflow-hidden rounded-md bg-blue-500/8">
                      <div
                        className="h-full rounded-md"
                        style={{
                          width: `${(Math.abs(row.amount) / maxAmount) * 100}%`,
                          background: negative
                            ? "linear-gradient(90deg,#065f46,#34d399)"
                            : row.key === "stockout" || row.key === "demurrage"
                            ? "linear-gradient(90deg,#9f1239,#fb7185)"
                            : "linear-gradient(90deg,#a16207,#eab308)",
                        }}
                      />
                    </div>

                    <span className="w-[92px] shrink-0 text-right font-mono text-[11.5px] font-semibold text-white">
                      {usdCompact(row.amount)}
                    </span>
                    <span className="w-[72px] shrink-0 text-right font-mono text-[10.5px] text-blue-200/45">
                      {usd(row.per_t, 2)}/t
                    </span>
                  </div>
                );
              })}

              <div className="flex items-center gap-3 border-t border-blue-500/12 pt-2.5">
                <span className="w-[168px] shrink-0 text-[12px] font-bold text-white">Total landed</span>
                <span className="flex-1" />
                <span className="w-[92px] shrink-0 text-right font-mono text-[12.5px] font-extrabold text-amber-300">
                  {usdCompact(data.total_cost)}
                </span>
                <span className="w-[72px] shrink-0 text-right font-mono text-[11px] font-bold text-amber-300">
                  {usd(data.cost_per_tonne, 2)}/t
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2 text-[10px] text-blue-200/45">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-gradient-to-r from-yellow-700 to-yellow-500" /> Cost component
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-gradient-to-r from-rose-800 to-rose-400" /> Penalty exposure
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-gradient-to-r from-emerald-800 to-emerald-400" /> Credit earned
                </span>
                <span className="ml-auto">Columns: consignment total · per tonne</span>
              </div>
            </div>
          )}
        </Panel>

        {/* group totals — single series magnitude */}
        <div className="grid gap-5 lg:grid-cols-2">
          <Panel title="Cost by Category" subtitle="Where the money actually goes">
            {!data ? (
              <Skeleton className="h-[220px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={218}>
                <BarChart data={data.groups} margin={{ top: 4, right: 12, left: 4, bottom: 4 }}>
                  <CartesianGrid stroke={CHART.grid} vertical={false} />
                  <XAxis dataKey="label" {...axisProps} interval={0} />
                  <YAxis {...axisProps} width={52} tickFormatter={usdCompact} />
                  <Tooltip
                    cursor={{ fill: "rgba(59,130,246,.07)" }}
                    content={<ChartTooltip formatter={(v) => usd(v)} />}
                  />
                  <Bar dataKey="amount" name="Cost" radius={[4, 4, 0, 0]} barSize={30}>
                    {data.groups.map((g) => (
                      <Cell key={g.key} fill={g.key === "risk" ? "#f43f5e" : CHART.accent} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Panel>

          <Panel
            title="Inventory Position"
            subtitle="Cover against replenishment lead time"
          >
            {!data ? (
              <Skeleton className="h-[220px] w-full" />
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl border border-blue-500/15 bg-[#02060f]/50 p-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-200/55">
                      Days of cover
                    </span>
                    <span className="font-mono text-[13px] font-bold text-white">
                      {data.inventory.cover_days} / {data.inventory.lead_time_days} d
                    </span>
                  </div>

                  <div className="relative mt-3 h-3 overflow-hidden rounded-full bg-blue-500/12">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (data.inventory.cover_days / Math.max(data.inventory.lead_time_days, 1)) * 100)}%`,
                        background: data.inventory.shortfall_t > 0
                          ? "linear-gradient(90deg,#9f1239,#fb7185)"
                          : "linear-gradient(90deg,#065f46,#34d399)",
                      }}
                    />
                    <span className="absolute inset-y-0 right-0 w-px bg-white/50" />
                  </div>

                  <p className="mt-2.5 text-[11.5px] leading-relaxed text-blue-100/60">
                    {data.inventory.shortfall_t > 0 ? (
                      <>
                        Yard runs dry {num(data.inventory.lead_time_days - data.inventory.cover_days, 1)} days
                        before the next parcel lands — {tonnes(data.inventory.shortfall_t)} short.
                      </>
                    ) : (
                      <>
                        Cover clears the lead time by{" "}
                        {num(data.inventory.cover_days - data.inventory.lead_time_days, 1)} days. No stockout exposure.
                      </>
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Warehouse, label: "Holding period", value: `${data.inventory.holding_days} d` },
                    { icon: PackageCheck, label: "Plant offtake", value: `${num(data.inventory.demand_rate_tpd, 0)} t/d` },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="rounded-xl border border-blue-500/15 bg-[#02060f]/50 p-3">
                      <Icon size={14} className="text-amber-400" />
                      <p className="mt-1.5 font-display text-[17px] font-extrabold text-white">{value}</p>
                      <p className="text-[10.5px] text-blue-200/50">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Panel>
        </div>

        {/* order size sweep */}
        <Panel
          title="Optimal Parcel Size"
          subtitle="Freight scale economies against inventory carrying cost"
          action={
            data && (
              <Badge tone="clear">
                Optimum {tonnes(data.optimal_order.tonnes)} · {usd(data.optimal_order.cost_per_t, 2)}/t
              </Badge>
            )
          }
        >
          {!data ? (
            <Skeleton className="h-[260px] w-full" />
          ) : (
            <>
              <Legend items={SWEEP_SERIES.map((s) => ({ label: s.label, color: s.color }))} />
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={data.order_sweep} margin={{ top: 6, right: 14, left: 4, bottom: 4 }}>
                  <CartesianGrid stroke={CHART.grid} vertical={false} />
                  <XAxis
                    dataKey="tonnes" {...axisProps}
                    tickFormatter={(v) => `${v / 1000}k`}
                    label={{ value: "Parcel size (tonnes)", position: "insideBottom", offset: -2,
                             fill: CHART.inkMuted, fontSize: 10.5 }}
                  />
                  <YAxis {...axisProps} width={54} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    cursor={{ stroke: CHART.accent, strokeWidth: 1, strokeDasharray: "3 3" }}
                    content={
                      <ChartTooltip
                        labelFormatter={(v) => `${num(v, 0)} tonnes`}
                        formatter={(v) => `${usd(v, 2)}/t`}
                      />
                    }
                  />
                  {SWEEP_SERIES.map((s) => (
                    <Line
                      key={s.key} dataKey={s.key} name={s.label} type="monotone"
                      stroke={s.color} strokeWidth={2} dot={false}
                      activeDot={{ r: 4, fill: s.color, stroke: CHART.surface, strokeWidth: 2 }}
                    />
                  ))}
                  <ReferenceLine
                    x={data.optimal_order.tonnes} stroke={CHART.accent}
                    strokeWidth={2} strokeDasharray="4 4"
                    label={{ value: "OPTIMUM", position: "top", fill: CHART.accent,
                             fontSize: 9.5, fontWeight: 700 }}
                  />
                  <ReferenceLine
                    x={inputs.tonnes} stroke="rgba(148,163,184,.5)" strokeDasharray="2 3"
                    label={{ value: "CURRENT", position: "insideTopLeft", fill: CHART.inkMuted,
                             fontSize: 9, fontWeight: 700 }}
                  />
                </LineChart>
              </ResponsiveContainer>

              <p className="mt-3 border-t border-blue-500/10 pt-3 text-[11.5px] leading-relaxed text-blue-100/60">
                Larger parcels earn a freight scale discount but sit longer in the yard. The curve
                bottoms at {tonnes(data.optimal_order.tonnes)} —{" "}
                {data.optimal_order.tonnes === inputs.tonnes
                  ? "the current plan is already optimal."
                  : `${usd(Math.abs(data.cost_per_tonne - data.optimal_order.cost_per_t), 2)}/t away from the current ${tonnes(inputs.tonnes)} plan.`}
              </p>
            </>
          )}
        </Panel>
      </div>
    </div>
  );
}
