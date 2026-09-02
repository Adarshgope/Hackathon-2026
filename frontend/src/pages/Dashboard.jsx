/** The post-login application shell. */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calculator, Container, Gauge, LayoutDashboard, LogOut, Menu, Route as RouteIcon,
  TrendingUp, X,
} from "lucide-react";
import OverviewTab from "../components/dashboard/OverviewTab";
import OptimizerTab from "../components/dashboard/OptimizerTab";
import PredictorTab from "../components/dashboard/PredictorTab";
import CostTab from "../components/dashboard/CostTab";
import { useAuth } from "../lib/authContext";
import { useHealth } from "../lib/useApi";
import { API_BASE } from "../lib/api";

const TABS = [
  { id: "overview", label: "KPI Overview", icon: LayoutDashboard, Component: OverviewTab,
    blurb: "Live indices, fleet telemetry and risk" },
  { id: "optimizer", label: "Route Optimization", icon: RouteIcon, Component: OptimizerTab,
    blurb: "Vessel selection, speed/fuel and berth windows" },
  { id: "predictor", label: "Freight Predictor", icon: TrendingUp, Component: PredictorTab,
    blurb: "Historical trends and 30/60-day forecasts" },
  { id: "cost", label: "Landed Cost", icon: Calculator, Component: CostTab,
    blurb: "Freight, duty, holding, demurrage, stockout" },
];

export default function Dashboard() {
  const [tab, setTab] = useState("overview");
  const [navOpen, setNavOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const health = useHealth();

  const active = TABS.find((t) => t.id === tab) ?? TABS[0];
  const Active = active.Component;

  const logout = () => {
    signOut();
    navigate("/", { replace: true });
  };

  const initials = (user?.name || "Demo Desk")
    .split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* ---------------------------------------------------------- top bar */}
      <header className="sticky top-0 z-40 border-b border-blue-500/15 bg-[#050d19]/90 backdrop-blur-xl">
        <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-yellow-300 via-amber-400 to-amber-600">
              <Container size={18} className="text-[#0a192f]" strokeWidth={2.4} />
            </span>
            <span className="hidden flex-col leading-none sm:flex">
              <span className="font-display text-base font-extrabold tracking-[0.16em] text-white">
                VORTEX
              </span>
              <span className="mt-0.5 font-mono text-[8px] tracking-[0.2em] text-blue-300/55">
                SIH26006 · EAST COAST
              </span>
            </span>
          </Link>

          {/* desktop tabs */}
          <nav className="ml-4 hidden items-center gap-1 lg:flex">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-[12.5px] font-semibold transition-all ${
                  id === tab
                    ? "bg-amber-400/12 text-amber-300 ring-1 ring-amber-400/30"
                    : "text-blue-200/60 hover:bg-blue-500/8 hover:text-white"
                }`}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            {/* backend liveness */}
            <span
              title={health.detail || `${API_BASE}`}
              className={`hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider sm:inline-flex ${
                health.online === null
                  ? "bg-slate-500/12 text-slate-300"
                  : health.online
                  ? "bg-emerald-500/12 text-emerald-300"
                  : "bg-amber-500/12 text-amber-300"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  health.online === null ? "bg-slate-400" : health.online ? "bg-emerald-400" : "bg-amber-400"
                }`}
              />
              {health.online === null ? "CHECKING" : health.online ? "API LIVE" : "DEMO MODE"}
            </span>

            <div className="hidden items-center gap-2.5 sm:flex">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-[11px] font-bold text-white">
                {initials}
              </span>
              <span className="hidden flex-col leading-tight md:flex">
                <span className="text-[12.5px] font-semibold text-white">{user?.name || "Demo Charterer"}</span>
                <span className="text-[10px] text-blue-200/50">{user?.role || "Chartering Manager"}</span>
              </span>
            </div>

            <button
              onClick={logout}
              className="grid h-9 w-9 place-items-center rounded-lg border border-blue-500/25 text-blue-200/70 transition-colors hover:border-rose-400/50 hover:text-rose-300"
              title="Sign out"
            >
              <LogOut size={15} />
            </button>

            <button
              onClick={() => setNavOpen((v) => !v)}
              className="grid h-9 w-9 place-items-center rounded-lg border border-blue-500/25 text-blue-100 lg:hidden"
              aria-label="Toggle sections"
            >
              {navOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>

        {/* mobile tab sheet */}
        {navOpen && (
          <div className="border-t border-blue-500/15 px-4 py-3 lg:hidden">
            <div className="grid gap-2 sm:grid-cols-2">
              {TABS.map(({ id, label, icon: Icon, blurb }) => (
                <button
                  key={id}
                  onClick={() => { setTab(id); setNavOpen(false); }}
                  className={`flex items-start gap-2.5 rounded-xl border p-3 text-left transition-colors ${
                    id === tab
                      ? "border-amber-400/40 bg-amber-400/10"
                      : "border-blue-500/20 hover:border-blue-400/40"
                  }`}
                >
                  <Icon size={16} className={id === tab ? "text-amber-300" : "text-blue-300/70"} />
                  <span>
                    <span className="block text-[12.5px] font-semibold text-white">{label}</span>
                    <span className="block text-[10.5px] text-blue-200/50">{blurb}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* ---------------------------------------------------------- content */}
      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-[22px] font-extrabold tracking-tight text-white">
              {active.label}
            </h1>
            <p className="mt-0.5 text-[12.5px] text-blue-200/55">{active.blurb}</p>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-blue-200/45">
            <Gauge size={13} className="text-amber-400" />
            <span>
              {health.online === false
                ? "Flask API offline — figures generated in-browser"
                : "Connected to the VORTEX Flask API"}
            </span>
          </div>
        </div>

        <Active />
      </main>

      <footer className="border-t border-blue-500/12 px-6 py-5">
        <p className="text-center text-[11px] text-blue-200/35">
          VORTEX · Vessel Optimization &amp; Rate Tracking for East-coast eXports/imports ·
          Smart India Hackathon 2026 prototype
        </p>
      </footer>
    </div>
  );
}
