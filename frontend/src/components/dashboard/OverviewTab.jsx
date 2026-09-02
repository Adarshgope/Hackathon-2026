/** Tab 1 — KPI grid, index board, live fleet and the risk feed. */

import { Activity, Anchor, Navigation, ShieldAlert, Ship } from "lucide-react";
import {
  AlertRow, Badge, EmptyState, Panel, Skeleton, SourceChip, Sparkline, StatTile,
} from "./ui";
import { useApi } from "../../lib/useApi";
import { endpoints } from "../../lib/api";
import { num, pct, tonnes } from "../../lib/format";

function IndexBoard() {
  const { data, loading, source } = useApi("indices", endpoints.indices(), { poll: 30000 });

  return (
    <Panel
      title="Freight Index Board"
      subtitle="Baltic benchmarks and Singapore bunkers"
      action={<SourceChip source={source} />}
      padded={false}
    >
      <div className="divide-y divide-blue-500/10">
        {loading && !data
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-5 py-3"><Skeleton className="h-9 w-full" /></div>
            ))
          : data?.indices.map((idx) => {
              const up = idx.change_pct >= 0;
              return (
                <div key={idx.code} className="flex items-center gap-4 px-5 py-2.5">
                  <div className="w-[68px] shrink-0">
                    <p className="font-mono text-[11.5px] font-bold text-white">{idx.code}</p>
                    <p className="truncate text-[9.5px] text-blue-200/40">{idx.unit}</p>
                  </div>

                  <div className="h-8 w-20 shrink-0">
                    <Sparkline points={idx.sparkline} tone={up ? "up" : "down"} height={32} />
                  </div>

                  <div className="ml-auto text-right">
                    <p className="font-mono text-[13px] font-semibold text-white">
                      {num(idx.value, idx.unit === "pts" ? 0 : 2)}
                    </p>
                    <p className={`text-[10.5px] font-bold ${up ? "text-emerald-300" : "text-rose-300"}`}>
                      {pct(idx.change_pct, 2)}
                    </p>
                  </div>
                </div>
              );
            })}
      </div>
    </Panel>
  );
}

function FleetTable() {
  const { data, loading, source } = useApi("vessels", endpoints.vessels(14), { poll: 25000 });
  const vessels = data?.vessels || [];

  return (
    <Panel
      title="Active Fleet"
      subtitle={
        data
          ? `${data.summary.underway} underway · ${data.summary.at_berth} at berth · ${tonnes(data.summary.cargo_afloat_t)} afloat`
          : "Loading telemetry…"
      }
      action={<SourceChip source={source} />}
      padded={false}
    >
      <div className="max-h-[420px] overflow-auto">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-[#0b1727]/95 backdrop-blur">
            <tr className="text-[10px] uppercase tracking-wider text-blue-200/45">
              {["Vessel", "Class", "Lane", "Speed", "ETA", "Progress"].map((h) => (
                <th key={h} className="whitespace-nowrap px-4 py-2.5 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-500/8">
            {loading && !vessels.length
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-4 py-3"><Skeleton /></td></tr>
                ))
              : vessels.map((v) => (
                  <tr key={v.id} className="transition-colors hover:bg-blue-500/5">
                    <td className="px-4 py-2.5">
                      <p className="text-[12.5px] font-semibold text-white">{v.name}</p>
                      <p className="font-mono text-[9.5px] text-blue-200/40">
                        {v.id} · IMO {v.imo}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <p className="text-[12px] text-blue-100/75">{v.vessel_class}</p>
                      <p className="text-[10px] text-blue-200/40">{tonnes(v.cargo_t)} {v.cargo}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-[11.5px] text-blue-100/65">
                      {v.origin} → {v.destination}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 font-mono text-[11.5px] text-blue-100/75">
                      {v.speed_kn} kn
                      <span className="ml-1 text-[9.5px] text-blue-200/40">{v.fuel_tpd} t/d</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <p className="font-mono text-[11px] text-blue-100/70">{v.eta_days} d</p>
                      {v.delay_risk > 0.55 && (
                        <p className="text-[9.5px] font-bold text-amber-300">
                          {Math.round(v.delay_risk * 100)}% delay risk
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-blue-500/15">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-300"
                            style={{ width: `${v.progress_pct}%` }}
                          />
                        </div>
                        <span className="font-mono text-[10px] text-blue-200/55">
                          {v.progress_pct.toFixed(0)}%
                        </span>
                      </div>
                      <span
                        className={`mt-1 inline-block text-[9.5px] font-bold ${
                          v.status === "Underway" ? "text-sky-300" : "text-emerald-300"
                        }`}
                      >
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function CongestionPanel() {
  const { data, loading, source } = useApi("congestion", endpoints.congestion(), { poll: 45000 });
  const ports = data?.ports || [];
  const worst = Math.max(1, ...ports.map((p) => p.vessels_waiting));

  return (
    <Panel
      title="East Coast Port Congestion"
      subtitle="Queue depth and berth occupancy, refreshed hourly"
      action={<SourceChip source={source} />}
    >
      {loading && !ports.length ? (
        <div className="space-y-2.5">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
        </div>
      ) : (
        <div className="space-y-2.5">
          {ports.map((p) => (
            <div key={p.code} className="flex items-center gap-3">
              <span className="w-[104px] shrink-0 truncate text-[12px] font-medium text-blue-100/80">
                {p.short}
              </span>

              {/* queue depth — one series, so the brand accent carries it */}
              <div className="relative h-[18px] flex-1 overflow-hidden rounded-md bg-blue-500/8">
                <div
                  className="h-full rounded-md"
                  style={{
                    width: `${(p.vessels_waiting / worst) * 100}%`,
                    background:
                      p.congestion_level === "critical"
                        ? "linear-gradient(90deg,#9f1239,#fb7185)"
                        : p.congestion_level === "elevated"
                        ? "linear-gradient(90deg,#b45309,#fbbf24)"
                        : "linear-gradient(90deg,#065f46,#34d399)",
                  }}
                />
                <span className="absolute inset-y-0 left-2 flex items-center font-mono text-[10px] font-bold text-white/85">
                  {p.vessels_waiting} waiting
                </span>
              </div>

              <span className="w-[62px] shrink-0 text-right font-mono text-[11px] text-blue-100/65">
                {p.avg_wait_days} d
              </span>
              <span className="w-[52px] shrink-0 text-right font-mono text-[10.5px] text-blue-200/45">
                {Math.round(p.berth_occupancy * 100)}%
              </span>
            </div>
          ))}

          <div className="flex items-center gap-4 border-t border-blue-500/10 pt-3 text-[10px] text-blue-200/45">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-emerald-400" /> Clear
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-amber-400" /> Elevated
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-rose-400" /> Critical
            </span>
            <span className="ml-auto">Columns: avg wait · berth occupancy</span>
          </div>
        </div>
      )}
    </Panel>
  );
}

function AlertsPanel() {
  const { data, loading, source } = useApi("alerts", endpoints.alerts(), { poll: 45000 });
  const alerts = data?.alerts || [];

  return (
    <Panel
      title="Early Risk Warnings"
      subtitle="Congestion and laycan exposure"
      action={
        <div className="flex items-center gap-2">
          <Badge tone={alerts.some((a) => a.level === "critical") ? "critical" : "warning"}>
            {alerts.length} open
          </Badge>
          <SourceChip source={source} />
        </div>
      }
    >
      {loading && !alerts.length ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      ) : alerts.length ? (
        <div className="max-h-[380px] space-y-2 overflow-auto pr-1">
          {alerts.map((a, i) => <AlertRow key={`${a.title}-${i}`} {...a} />)}
        </div>
      ) : (
        <EmptyState icon={ShieldAlert} title="No open warnings" detail="Every lane is inside its laycan window." />
      )}
    </Panel>
  );
}

export default function OverviewTab() {
  const { data, loading, source } = useApi("kpis", endpoints.kpis(), { poll: 30000 });
  const kpis = data?.kpis || [];

  return (
    <div className="space-y-5">
      {/* ------------------------------------------------ KPI grid */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Activity size={14} className="text-amber-400" />
          <h2 className="font-display text-[13px] font-bold uppercase tracking-[0.14em] text-blue-100/70">
            Live Indicators
          </h2>
          <SourceChip source={source} />
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {loading && !kpis.length
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass rounded-2xl p-4"><Skeleton className="h-24 w-full" /></div>
              ))
            : kpis.map((k) => <StatTile key={k.id} {...k} changePct={k.change_pct} />)}
        </div>
      </div>

      {/* ------------------------------------------------ boards */}
      <div className="grid gap-5 xl:grid-cols-3">
        <IndexBoard />
        <div className="xl:col-span-2"><CongestionPanel /></div>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2"><FleetTable /></div>
        <AlertsPanel />
      </div>

      <div className="grid gap-3.5 sm:grid-cols-3">
        {[
          { icon: Ship, label: "Vessel classes modelled", value: "7", note: "Handysize → Capesize" },
          { icon: Anchor, label: "East coast ports mapped", value: "10", note: "Draft · LOA · Beam envelopes" },
          { icon: Navigation, label: "Trade lanes tracked", value: "14", note: "Indonesia · Australia · South Africa · Brazil" },
        ].map(({ icon: Icon, label, value, note }) => (
          <div key={label} className="glass flex items-center gap-4 rounded-2xl px-5 py-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-amber-400/25 bg-amber-400/10 text-amber-300">
              <Icon size={18} />
            </span>
            <div>
              <p className="font-display text-xl font-extrabold text-white">{value}</p>
              <p className="text-[11.5px] font-medium text-blue-100/65">{label}</p>
              <p className="text-[10px] text-blue-200/40">{note}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
