/** Tab 2 — vessel & route optimisation: constraints, speed/fuel, berth windows. */

import { useMemo, useState } from "react";
import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ReferenceLine,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Anchor, Fuel, Gauge, Ruler, Ship, TriangleAlert } from "lucide-react";
import {
  AlertRow, Badge, ChartTooltip, Legend, Panel, Segmented, Skeleton, SourceChip,
} from "./ui";
import { useApi, useCompute } from "../../lib/useApi";
import { endpoints } from "../../lib/api";
import { axisProps, CHART, num, tonnes, usd, usdCompact } from "../../lib/format";

const COST_SERIES = [
  { key: "fuel_cost", label: "Bunkers", color: CHART.series[0] },
  { key: "hire_cost", label: "Charter hire", color: CHART.series[1] },
  { key: "port_cost", label: "Port charges", color: CHART.series[2] },
  { key: "demurrage_cost", label: "Demurrage", color: CHART.series[3] },
];

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-[10.5px] font-semibold uppercase tracking-wider text-blue-200/55">
          {label}
        </span>
        {hint && <span className="font-mono text-[10px] text-blue-200/35">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

/** Draft / LOA / beam envelope for the selected pairing. */
function FeasibilityCard({ feasibility, viable }) {
  if (!feasibility) return null;
  const f = feasibility;
  const checks = [
    { label: "Draft", ok: f.draft_ok, detail: `${f.required_draft_m} m required · ${f.berth_draft_m} m available` },
    { label: "LOA", ok: f.loa_ok, detail: "Length overall vs. berth length" },
    { label: "Beam", ok: f.beam_ok, detail: "Breadth vs. berth box" },
  ];

  return (
    <Panel
      title="Port Constraint Check"
      subtitle={`${f.vessel_class} at ${f.port}`}
      action={<Badge tone={viable ? (f.draft_ok ? "clear" : "warning") : "critical"}>{f.verdict}</Badge>}
    >
      <div className="space-y-2.5">
        {checks.map((c) => (
          <div key={c.label} className="flex items-center gap-3">
            <span
              className={`grid h-6 w-6 shrink-0 place-items-center rounded-md text-[10px] font-bold ${
                c.ok ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"
              }`}
            >
              {c.ok ? "✓" : "✕"}
            </span>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-blue-50">{c.label}</p>
              <p className="truncate text-[10.5px] text-blue-200/45">{c.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {/* deadweight utilisation */}
      <div className="mt-4 border-t border-blue-500/10 pt-3.5">
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-200/55">
            Deadweight utilisation
          </span>
          <span className="font-mono text-[13px] font-bold text-white">{f.utilisation_pct}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-blue-500/12">
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.max(f.utilisation_pct, 1)}%`,
              background: f.draft_ok
                ? "linear-gradient(90deg,#065f46,#34d399)"
                : "linear-gradient(90deg,#b45309,#fbbf24)",
            }}
          />
        </div>
        <p className="mt-2 text-[11px] text-blue-200/50">
          Intake {tonnes(f.max_cargo_t)}
          {f.cargo_sacrificed_t > 0 && (
            <span className="text-amber-300"> · {tonnes(f.cargo_sacrificed_t)} left on the quay</span>
          )}
        </p>
      </div>

      {f.blockers.length > 0 && (
        <div className="mt-3 space-y-2">
          {f.blockers.map((b) => (
            <AlertRow key={b} level={viable ? "warning" : "critical"} text={b} />
          ))}
        </div>
      )}
    </Panel>
  );
}

/** Forward berth windows for the discharge port. */
function BerthSchedule({ portCode }) {
  const [days, setDays] = useState(10);
  const { data, source } = useApi("berths", endpoints.berths(portCode, days), {
    args: { port: portCode, days },
  });

  const windowH = days * 24;

  return (
    <Panel
      title="Berth Availability"
      subtitle={data ? `${data.port} · window from ${data.window_start}` : "Loading…"}
      action={
        <div className="flex items-center gap-2">
          <Segmented
            size="sm"
            value={days}
            onChange={setDays}
            options={[{ label: "7d", value: 7 }, { label: "10d", value: 10 }, { label: "14d", value: 14 }]}
          />
          <SourceChip source={source} />
        </div>
      }
    >
      {!data ? (
        <div className="space-y-2.5">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-7 w-full" />)}
        </div>
      ) : (
        <>
          {/* day ruler */}
          <div className="mb-2 flex pl-[86px]">
            {Array.from({ length: days }).map((_, d) => (
              <span
                key={d}
                className="flex-1 border-l border-blue-500/12 pl-1 font-mono text-[9px] text-blue-200/35"
              >
                D{d + 1}
              </span>
            ))}
          </div>

          <div className="space-y-1.5">
            {data.berths.map((b) => (
              <div key={b.berth} className="flex items-center gap-2">
                <div className="w-[78px] shrink-0">
                  <p className="font-mono text-[11px] font-bold text-blue-50">{b.berth}</p>
                  <p className="text-[9px] text-blue-200/40">{b.max_draft_m} m · {b.crane_count} cr</p>
                </div>

                <div className="relative h-7 flex-1 overflow-hidden rounded-md bg-[#02060f]/60">
                  {Array.from({ length: days }).map((_, d) => (
                    <span
                      key={d}
                      className="absolute inset-y-0 w-px bg-blue-500/12"
                      style={{ left: `${((d + 1) / days) * 100}%` }}
                    />
                  ))}

                  {b.slots.map((s) => {
                    const left = (s.start_offset_h / windowH) * 100;
                    const width = (s.duration_h / windowH) * 100;
                    if (left > 100) return null;
                    return (
                      <div
                        key={`${b.berth}-${s.start}`}
                        title={`${s.vessel} · ${s.vessel_class} · ${tonnes(s.parcel_t)} ${s.cargo}\n${s.start} → ${s.end} (${s.status})`}
                        className="absolute inset-y-[3px] flex items-center overflow-hidden rounded-[4px] px-1.5"
                        style={{
                          left: `${left}%`,
                          width: `${Math.min(width, 100 - left)}%`,
                          background:
                            s.status === "confirmed"
                              ? "linear-gradient(135deg,#1d4ed8,#3b82f6)"
                              : "repeating-linear-gradient(45deg,#334155,#334155 5px,#1e293b 5px,#1e293b 10px)",
                          border: "1px solid rgba(255,255,255,.1)",
                        }}
                      >
                        <span className="truncate text-[9.5px] font-semibold text-white/90">
                          {s.vessel.replace("MV ", "")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-blue-500/10 pt-3 text-[10px] text-blue-200/45">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-4 rounded-[2px] bg-gradient-to-br from-blue-700 to-blue-500" /> Confirmed fixture
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="h-2.5 w-4 rounded-[2px]"
                style={{ background: "repeating-linear-gradient(45deg,#334155,#334155 4px,#1e293b 4px,#1e293b 8px)" }}
              />
              Provisional
            </span>
            <span className="ml-auto">Hover a block for the fixture detail</span>
          </div>
        </>
      )}
    </Panel>
  );
}

export default function OptimizerTab() {
  const { data: portData } = useApi("ports", endpoints.ports());
  const { data: classData } = useApi("vesselClasses", endpoints.vesselClasses());

  const [origin, setOrigin] = useState("IDTAB");
  const [destination, setDestination] = useState("INVTZ");
  const [vesselClass, setVesselClass] = useState("panamax");
  const [cargo, setCargo] = useState("");
  const [laytime, setLaytime] = useState(3);
  const [demurrage, setDemurrage] = useState(18500);

  const body = useMemo(
    () => ({
      origin,
      destination,
      vessel_class: vesselClass,
      cargo_tonnes: cargo ? Number(cargo) : 0,
      laytime_days: Number(laytime),
      demurrage_rate: Number(demurrage),
    }),
    [origin, destination, vesselClass, cargo, laytime, demurrage]
  );

  const { data, source } = useCompute("voyage", endpoints.voyage(), body);

  const curve = data?.speed_curve || [];
  const optimalSpeed = data?.optimal?.speed_kn;
  const feasibleAlts = (data?.alternatives || []).filter((a) => a.feasible);

  return (
    <div className="space-y-5">
      {/* ------------------------------------------------ controls */}
      <Panel
        title="Voyage Parameters"
        subtitle="Pick the lane and the tonnage; the engine prices the passage"
        action={<SourceChip source={source} />}
      >
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          <Field label="Load port">
            <select className="field" value={origin} onChange={(e) => setOrigin(e.target.value)}>
              {(portData?.load_ports || []).map((p) => (
                <option key={p.code} value={p.code} className="bg-[#0a192f]">
                  {p.name} · {p.country}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Discharge port">
            <select className="field" value={destination} onChange={(e) => setDestination(e.target.value)}>
              {(portData?.discharge_ports || []).map((p) => (
                <option key={p.code} value={p.code} className="bg-[#0a192f]">
                  {p.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Vessel class">
            <select className="field" value={vesselClass} onChange={(e) => setVesselClass(e.target.value)}>
              {(classData?.classes || []).map((c) => (
                <option key={c.id} value={c.id} className="bg-[#0a192f]">
                  {c.name} · {(c.dwt / 1000).toFixed(0)}k dwt
                </option>
              ))}
            </select>
          </Field>

          <Field label="Cargo" hint="tonnes">
            <input
              type="number" className="field" value={cargo} min={0} step={1000}
              onChange={(e) => setCargo(e.target.value)} placeholder="Max intake"
            />
          </Field>

          <Field label="Laytime" hint="days">
            <input type="number" className="field" value={laytime} min={0} step={0.5}
                   onChange={(e) => setLaytime(e.target.value)} />
          </Field>

          <Field label="Demurrage" hint="USD/day">
            <input type="number" className="field" value={demurrage} min={0} step={500}
                   onChange={(e) => setDemurrage(e.target.value)} />
          </Field>
        </div>

        {data && (
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-blue-500/10 pt-3.5 text-[11.5px]">
            {[
              ["Distance", `${num(data.distance_nm, 0)} nm`],
              ["Cargo intake", tonnes(data.cargo_t)],
              ["Port stay", `${data.port_stay.total_port_days} d`],
              ["Queue wait", `${data.port_stay.queue_wait_days} d`],
              ["Bunkers", `${usd(data.bunker_price, 2)}/mt`],
              ["Freight", `${usd(data.freight_rate, 2)}/t`],
            ].map(([k, v]) => (
              <span key={k} className="flex items-center gap-1.5">
                <span className="text-blue-200/45">{k}</span>
                <span className="font-mono font-semibold text-white">{v}</span>
              </span>
            ))}
          </div>
        )}
      </Panel>

      {data && !data.viable && (
        <AlertRow
          level="critical"
          title={`${data.vessel_class} cannot work ${data.destination}`}
          detail={`${data.feasibility.blockers.join(" · ")}. The figures below are indicative only — see the ranked alternatives.`}
        />
      )}

      {/* ------------------------------------------------ optimiser results */}
      <div className="grid gap-5 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-2">
          <Panel
            title="Speed vs. Fuel Optimizer"
            subtitle="Voyage cost by service speed — bunkers fall with the cube of speed, hire rises with time"
            action={
              data && (
                <Badge tone="clear">
                  Optimum {optimalSpeed} kn · saves {usdCompact(data.saving_usd)}
                </Badge>
              )
            }
          >
            {!data ? (
              <Skeleton className="h-[290px] w-full" />
            ) : (
              <>
                <Legend items={COST_SERIES.map((s) => ({ label: s.label, color: s.color }))} />
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={curve} margin={{ top: 4, right: 8, left: 4, bottom: 4 }} barCategoryGap="22%">
                    <CartesianGrid stroke={CHART.grid} vertical={false} />
                    <XAxis
                      dataKey="speed_kn" {...axisProps}
                      tickFormatter={(v) => `${v}`}
                      label={{ value: "Service speed (knots)", position: "insideBottom", offset: -2,
                               fill: CHART.inkMuted, fontSize: 10.5 }}
                    />
                    <YAxis {...axisProps} tickFormatter={(v) => usdCompact(v)} width={54} />
                    <Tooltip
                      cursor={{ fill: "rgba(59,130,246,.07)" }}
                      content={
                        <ChartTooltip
                          labelFormatter={(v) => `${v} knots`}
                          formatter={(value) => usd(value)}
                        />
                      }
                    />
                    {COST_SERIES.map((s, i) => (
                      <Bar
                        key={s.key} dataKey={s.key} name={s.label} stackId="cost"
                        fill={s.color} stroke={CHART.surface} strokeWidth={2}
                        radius={i === COST_SERIES.length - 1 ? [4, 4, 0, 0] : 0}
                      />
                    ))}
                    {optimalSpeed != null && (
                      <ReferenceLine
                        x={optimalSpeed} stroke={CHART.accent} strokeWidth={2} strokeDasharray="4 4"
                        label={{ value: "OPTIMUM", position: "top", fill: CHART.accent,
                                 fontSize: 9.5, fontWeight: 700 }}
                      />
                    )}
                  </BarChart>
                </ResponsiveContainer>

                {/* consumption curve — separate chart, never a second y-axis */}
                <div className="mt-5 border-t border-blue-500/10 pt-4">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-blue-200/55">
                    Daily bunker consumption
                  </p>
                  <ResponsiveContainer width="100%" height={110}>
                    <LineChart data={curve} margin={{ top: 4, right: 8, left: 4, bottom: 0 }}>
                      <CartesianGrid stroke={CHART.grid} vertical={false} />
                      <XAxis dataKey="speed_kn" {...axisProps} />
                      <YAxis {...axisProps} width={54} tickFormatter={(v) => `${v} t`} />
                      <Tooltip
                        content={
                          <ChartTooltip
                            labelFormatter={(v) => `${v} knots`}
                            formatter={(value) => `${num(value, 1)} t/day`}
                          />
                        }
                      />
                      <Line
                        type="monotone" dataKey="fuel_tpd" name="Consumption"
                        stroke={CHART.accent} strokeWidth={2} dot={false}
                        activeDot={{ r: 4, fill: CHART.accent, stroke: CHART.surface, strokeWidth: 2 }}
                      />
                      {optimalSpeed != null && (
                        <ReferenceLine x={optimalSpeed} stroke={CHART.accent} strokeDasharray="4 4" />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </Panel>

          <Panel
            title="Vessel Class Comparison"
            subtitle="Landed voyage cost per tonne on this lane — infeasible classes are marked"
          >
            {!data ? (
              <Skeleton className="h-[220px] w-full" />
            ) : feasibleAlts.length ? (
              <>
                <ResponsiveContainer width="100%" height={210}>
                  <BarChart
                    data={feasibleAlts} layout="vertical"
                    margin={{ top: 2, right: 52, left: 4, bottom: 2 }}
                  >
                    <CartesianGrid stroke={CHART.grid} horizontal={false} />
                    <XAxis type="number" {...axisProps} tickFormatter={(v) => `$${v}`} />
                    <YAxis
                      type="category" dataKey="vessel_class" {...axisProps} width={92}
                      tick={{ fill: CHART.ink, fontSize: 11 }}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(59,130,246,.07)" }}
                      content={
                        <ChartTooltip
                          formatter={(v, _k, row) =>
                            `${usd(v, 2)}/t · ${tonnes(row.payload.cargo_t)} · ${row.payload.total_days} d`
                          }
                        />
                      }
                    />
                    <Bar dataKey="cost_per_t" name="Cost per tonne" radius={[0, 4, 4, 0]} barSize={17}>
                      {feasibleAlts.map((a) => (
                        <Cell
                          key={a.class_id}
                          fill={a.class_id === data.class_id ? CHART.accent : "#1e4b8f"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                <div className="mt-2 flex items-center gap-4 text-[10px] text-blue-200/45">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-[2px]" style={{ background: CHART.accent }} /> Selected class
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-[2px] bg-[#1e4b8f]" /> Alternative
                  </span>
                </div>

                {data.alternatives.some((a) => !a.feasible) && (
                  <div className="mt-3 border-t border-blue-500/10 pt-3">
                    <p className="mb-2 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-rose-300/80">
                      <TriangleAlert size={11} /> Cannot berth at {data.destination}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {data.alternatives.filter((a) => !a.feasible).map((a) => (
                        <span
                          key={a.class_id}
                          title={a.reason}
                          className="rounded-md border border-rose-500/25 bg-rose-500/8 px-2 py-1 text-[10.5px] text-rose-200/80"
                        >
                          {a.vessel_class}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <AlertRow
                level="critical"
                title="No feasible vessel class"
                detail={`Nothing in the fleet clears ${data?.destination}'s berth envelope. Lighten at anchorage or route through a deeper port.`}
              />
            )}
          </Panel>
        </div>

        {/* ------------------------------------------------ side column */}
        <div className="space-y-5">
          {data && (
            <Panel title="Recommendation" subtitle="Engine output for this fixture">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Gauge, label: "Optimal speed", value: `${data.optimal.speed_kn} kn` },
                  { icon: Fuel, label: "Bunkers burnt", value: `${num(data.optimal.fuel_t, 0)} t` },
                  { icon: Ship, label: "Voyage time", value: `${data.optimal.total_days} d` },
                  { icon: Anchor, label: "Cost per tonne", value: `${usd(data.optimal.cost_per_t, 2)}` },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="rounded-xl border border-blue-500/15 bg-[#02060f]/50 p-3">
                    <Icon size={14} className="text-amber-400" />
                    <p className="mt-1.5 font-display text-[17px] font-extrabold text-white">{value}</p>
                    <p className="text-[10.5px] text-blue-200/50">{label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-xl border border-amber-400/25 bg-amber-400/8 p-3.5">
                <p className="text-[10.5px] font-bold uppercase tracking-wider text-amber-300">
                  Saving vs. design speed
                </p>
                <p className="mt-1 font-display text-2xl font-extrabold text-white">
                  {usd(data.saving_usd)}
                  <span className="ml-2 text-[12px] font-semibold text-amber-300">
                    {data.saving_pct}%
                  </span>
                </p>
                <p className="mt-1 text-[11px] text-blue-100/60">
                  Against {data.at_design_speed.speed_kn} kn design speed · {data.optimal.co2_t} t CO₂ on passage
                </p>
              </div>

              <ul className="mt-4 space-y-2.5">
                {data.insight.map((line) => (
                  <li key={line} className="flex gap-2.5 text-[11.5px] leading-relaxed text-blue-100/70">
                    <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                    {line}
                  </li>
                ))}
              </ul>

              {data.port_stay.demurrage_exposure_usd > 0 && (
                <div className="mt-4">
                  <AlertRow
                    level="warning"
                    title="Demurrage exposure"
                    detail={`Port stay of ${data.port_stay.total_port_days} days against ${data.port_stay.laytime_days} days laytime — ${usd(data.port_stay.demurrage_exposure_usd)} at risk.`}
                  />
                </div>
              )}
            </Panel>
          )}

          <FeasibilityCard feasibility={data?.feasibility} viable={data?.viable} />
        </div>
      </div>

      <BerthSchedule portCode={destination} />

      <ConstraintMatrix />
    </div>
  );
}

/** The full port x class feasibility grid. */
function ConstraintMatrix() {
  const { data, source } = useApi("constraints", endpoints.constraints());

  const lookup = useMemo(() => {
    const map = {};
    (data?.grid || []).forEach((g) => { map[`${g.port}|${g.class}`] = g; });
    return map;
  }, [data]);

  return (
    <Panel
      title="East Coast Port Constraint Map"
      subtitle="Draft, LOA and beam envelope for every port and vessel class"
      action={
        <div className="flex items-center gap-2">
          <Ruler size={13} className="text-amber-400" />
          <SourceChip source={source} />
        </div>
      }
      padded={false}
    >
      {!data ? (
        <div className="p-5"><Skeleton className="h-52 w-full" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-blue-200/45">
                <th className="sticky left-0 z-10 bg-[#0b1727] px-4 py-2.5 font-semibold">Port</th>
                <th className="px-3 py-2.5 font-semibold">Envelope</th>
                {data.classes.map((c) => (
                  <th key={c.id} className="whitespace-nowrap px-3 py-2.5 text-center font-semibold">
                    {c.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-500/8">
              {data.ports.map((p) => (
                <tr key={p.code} className="hover:bg-blue-500/5">
                  <td className="sticky left-0 z-10 bg-[#0b1727] px-4 py-2 text-[12px] font-semibold text-white">
                    {p.short}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-[10px] text-blue-200/45">
                    {p.max_draft_m}m · {p.max_loa_m}m · {p.max_beam_m}m
                  </td>
                  {data.classes.map((c) => {
                    const cell = lookup[`${p.code}|${c.id}`];
                    if (!cell) return <td key={c.id} />;
                    const full = cell.feasible && cell.draft_ok;
                    return (
                      <td key={c.id} className="px-3 py-2 text-center">
                        <span
                          title={`${cell.verdict} · ${tonnes(cell.max_cargo_t)} (${cell.utilisation_pct}%)`}
                          className={`inline-flex h-[26px] w-full min-w-[52px] items-center justify-center rounded-md font-mono text-[10px] font-bold ${
                            full
                              ? "bg-emerald-500/15 text-emerald-300"
                              : cell.feasible
                              ? "bg-amber-500/15 text-amber-300"
                              : "bg-rose-500/10 text-rose-300/70"
                          }`}
                        >
                          {cell.feasible ? `${cell.utilisation_pct}%` : "✕"}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex flex-wrap items-center gap-4 border-t border-blue-500/10 px-4 py-3 text-[10px] text-blue-200/45">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-400/70" /> Fully laden
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-amber-400/70" /> Part-laden (draft restricted)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-rose-400/70" /> Cannot berth
            </span>
            <span className="ml-auto">Cell shows deadweight utilisation · envelope is draft · LOA · beam</span>
          </div>
        </div>
      )}
    </Panel>
  );
}
