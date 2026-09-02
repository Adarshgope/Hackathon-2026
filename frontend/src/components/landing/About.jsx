/** Stage 4 — the two-column About block, revealed on scroll. */

import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  AlarmClock, ArrowRight, Clock4, Gauge, Ruler, Ship, Star, TrendingUp,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import PortVisual from "./PortVisual";

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  { icon: Clock4, title: "Optimal Market Entry Timing", note: "Fix when the curve bottoms" },
  { icon: Ship, title: "Vessel Type Optimization", note: "Handysize through Capesize" },
  { icon: Ruler, title: "East Coast Port Constraint Mapping", note: "Draft · LOA · Beam" },
  { icon: TrendingUp, title: "Predictive Freight Rate Forecasting", note: "30 / 60-day spot outlook" },
  { icon: Gauge, title: "Idle Time & Deadheading Minimization", note: "Speed vs. bunker trade-off" },
  { icon: AlarmClock, title: "Early Risk & Port Congestion Warnings", note: "Laycan exposure alerts" },
];

const AVATARS = [
  { initials: "RK", tone: "from-amber-300 to-amber-600" },
  { initials: "SM", tone: "from-sky-300 to-blue-600" },
  { initials: "AV", tone: "from-emerald-300 to-teal-600" },
  { initials: "PN", tone: "from-rose-300 to-rose-600" },
];

export default function About() {
  const root = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const reveal = (target, vars = {}) =>
        gsap.from(target, {
          scrollTrigger: { trigger: target, start: "top 85%", once: true },
          y: 42, autoAlpha: 0, duration: 0.9, ease: "power3.out", ...vars,
        });

      reveal("[data-reveal='visual']", { x: -36, y: 0 });
      reveal("[data-reveal='badge']", { y: 26, delay: 0.25, duration: 0.7 });
      reveal("[data-reveal='copy'] > *", { stagger: 0.09 });
      reveal("[data-reveal='feature']", { stagger: 0.07, y: 26, duration: 0.7 });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="about"
      ref={root}
      className="relative overflow-hidden bg-[#05101f] py-24 sm:py-32"
    >
      {/* ambient field */}
      <div className="grid-lines pointer-events-none absolute inset-0 opacity-30" />
      <div className="pointer-events-none absolute -left-40 top-20 h-[420px] w-[420px] rounded-full bg-blue-600/12 blur-[130px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-[380px] w-[380px] rounded-full bg-amber-500/12 blur-[130px]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
        {/* ------------------------------- left: visual -------------------- */}
        <div data-reveal="visual" className="relative">
          <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 shadow-[0_40px_90px_-30px_rgba(0,0,0,.9)]">
            <PortVisual className="h-[380px] w-full sm:h-[520px]" />

            {/* glass tag, top-left */}
            <div className="glass absolute left-5 top-5 rounded-xl px-3.5 py-2">
              <p className="font-mono text-[9px] tracking-[0.2em] text-amber-300">LIVE BERTH</p>
              <p className="mt-0.5 text-xs font-semibold text-white">Visakhapatnam · EQ-4</p>
            </div>

            <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10" />
          </div>

          {/* floating trust card, bottom corner */}
          <div
            data-reveal="badge"
            className="glass-gold absolute -bottom-8 left-4 right-4 rounded-2xl p-4 shadow-[0_30px_60px_-25px_rgba(0,0,0,.95)] sm:-bottom-10 sm:left-8 sm:right-auto sm:w-[356px] sm:p-5"
          >
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2.5">
                {AVATARS.map((a) => (
                  <span
                    key={a.initials}
                    className={`grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br ${a.tone} text-[10px] font-bold text-slate-900 ring-2 ring-[#0b1a30]`}
                  >
                    {a.initials}
                  </span>
                ))}
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#13294d] text-[9px] font-bold text-amber-300 ring-2 ring-[#0b1a30]">
                  +40
                </span>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-1 text-[11px] font-bold text-white">5.0</span>
                </div>
                <span className="text-[10px] text-blue-200/60">128 verified reviews</span>
              </div>
            </div>

            <p className="mt-3 border-t border-amber-400/20 pt-3 text-[12.5px] font-semibold leading-snug text-blue-50">
              Trusted by Top Supply Chain &amp; Procurement Teams
            </p>
          </div>
        </div>

        {/* ------------------------------- right: content ------------------ */}
        <div data-reveal="copy" className="mt-14 lg:mt-0">
          <span className="kicker">About the Platform</span>

          <h2 className="mt-3.5 text-balance font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-[42px]">
            Predictive Freight Analytics for{" "}
            <span className="gradient-text">Optimized Chartering</span>
          </h2>

          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-blue-100/70">
            We transform bulk cargo procurement from a reactive daily market approach
            into a proactive, data-driven strategy. By forecasting freight rate
            volatility, modeling global trade lane dynamics, and calculating
            port-specific constraints, the platform enables optimal timing and vessel
            selection for East Coast Indian ports.
          </p>

          <div className="mt-8 grid gap-x-6 gap-y-4 sm:grid-cols-2">
            {FEATURES.map(({ icon: Icon, title, note }) => (
              <div key={title} data-reveal="feature" className="group flex items-start gap-3">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-amber-400/25 bg-amber-400/10 text-amber-300 transition-colors group-hover:border-amber-400/60 group-hover:bg-amber-400/20">
                  <Icon size={15} strokeWidth={2.2} />
                </span>
                <span className="flex flex-col">
                  <span className="text-[13.5px] font-semibold leading-snug text-blue-50">
                    {title}
                  </span>
                  <span className="text-[11.5px] text-blue-200/50">{note}</span>
                </span>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link to="/register" className="btn-gold">
              Get Started <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="btn-ghost">
              View the live dashboard
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
