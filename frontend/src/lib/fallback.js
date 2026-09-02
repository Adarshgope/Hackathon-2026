/**
 * Offline mirror of the Flask generators.
 *
 * If the backend is down, `fetchOrFallback` serves these instead so a demo never
 * shows an empty chart. The formulas track the Python engine (mean-reverting
 * freight series, cube-law fuel curve, landed-cost stack) closely enough that
 * the numbers stay believable — the UI badges the source as "Demo data".
 */

/* ---------------------------------------------------------------- reference */

export const PORTS = [
  { code: "INVTZ", name: "Visakhapatnam", short: "Vizag", state: "Andhra Pradesh", lat: 17.6868, lon: 83.2185, max_draft_m: 18.1, max_loa_m: 340, max_beam_m: 55, berths: 8, cranes: 14, avg_dwell_days: 3.4, congestion_index: 0.38, handling_rate_tpd: 42000, port_charges_usd_per_t: 4.1, cargoes: ["Coking Coal", "Thermal Coal", "Iron Ore"] },
  { code: "INPRT", name: "Paradip", short: "Paradip", state: "Odisha", lat: 20.2648, lon: 86.6947, max_draft_m: 17.1, max_loa_m: 330, max_beam_m: 50, berths: 7, cranes: 11, avg_dwell_days: 3.9, congestion_index: 0.46, handling_rate_tpd: 38000, port_charges_usd_per_t: 3.85, cargoes: ["Thermal Coal", "Iron Ore"] },
  { code: "INHAL", name: "Haldia", short: "Haldia", state: "West Bengal", lat: 22.0333, lon: 88.0833, max_draft_m: 8.5, max_loa_m: 250, max_beam_m: 40, berths: 6, cranes: 8, avg_dwell_days: 5.2, congestion_index: 0.61, handling_rate_tpd: 18000, port_charges_usd_per_t: 5.2, cargoes: ["Coking Coal", "Fertilizer"] },
  { code: "INMAA", name: "Chennai", short: "Chennai", state: "Tamil Nadu", lat: 13.0827, lon: 80.2707, max_draft_m: 16.5, max_loa_m: 320, max_beam_m: 48, berths: 9, cranes: 16, avg_dwell_days: 3.1, congestion_index: 0.42, handling_rate_tpd: 34000, port_charges_usd_per_t: 4.75, cargoes: ["Thermal Coal", "Limestone"] },
  { code: "INCCU", name: "Kolkata", short: "Kolkata", state: "West Bengal", lat: 22.5726, lon: 88.3639, max_draft_m: 7.6, max_loa_m: 220, max_beam_m: 32, berths: 5, cranes: 6, avg_dwell_days: 6.1, congestion_index: 0.68, handling_rate_tpd: 11000, port_charges_usd_per_t: 6.4, cargoes: ["Fertilizer", "Steel"] },
  { code: "INKRI", name: "Krishnapatnam", short: "Krishnapatnam", state: "Andhra Pradesh", lat: 14.25, lon: 80.1167, max_draft_m: 18.5, max_loa_m: 340, max_beam_m: 55, berths: 6, cranes: 12, avg_dwell_days: 2.6, congestion_index: 0.29, handling_rate_tpd: 46000, port_charges_usd_per_t: 3.6, cargoes: ["Thermal Coal", "Iron Ore"] },
  { code: "INGGV", name: "Gangavaram", short: "Gangavaram", state: "Andhra Pradesh", lat: 17.6167, lon: 83.2333, max_draft_m: 19, max_loa_m: 350, max_beam_m: 57, berths: 5, cranes: 9, avg_dwell_days: 2.8, congestion_index: 0.31, handling_rate_tpd: 44000, port_charges_usd_per_t: 3.95, cargoes: ["Coking Coal", "Iron Ore"] },
  { code: "INKAK", name: "Kakinada", short: "Kakinada", state: "Andhra Pradesh", lat: 16.9891, lon: 82.2475, max_draft_m: 12.5, max_loa_m: 250, max_beam_m: 40, berths: 4, cranes: 5, avg_dwell_days: 4.3, congestion_index: 0.49, handling_rate_tpd: 16000, port_charges_usd_per_t: 5.05, cargoes: ["Fertilizer", "Agri Bulk"] },
  { code: "INENR", name: "Kamarajar (Ennore)", short: "Ennore", state: "Tamil Nadu", lat: 13.25, lon: 80.3333, max_draft_m: 16, max_loa_m: 300, max_beam_m: 47, berths: 5, cranes: 10, avg_dwell_days: 3.0, congestion_index: 0.35, handling_rate_tpd: 36000, port_charges_usd_per_t: 4.3, cargoes: ["Thermal Coal", "Limestone"] },
  { code: "INTUT", name: "Tuticorin (V.O. Chidambaranar)", short: "Tuticorin", state: "Tamil Nadu", lat: 8.7642, lon: 78.1348, max_draft_m: 14.2, max_loa_m: 285, max_beam_m: 45, berths: 6, cranes: 9, avg_dwell_days: 3.6, congestion_index: 0.4, handling_rate_tpd: 24000, port_charges_usd_per_t: 4.55, cargoes: ["Thermal Coal", "Agri Bulk"] },
];

export const LOAD_PORTS = [
  { code: "AUPHE", name: "Port Hedland", country: "Australia", lat: -20.31, lon: 118.58 },
  { code: "AUHPT", name: "Hay Point", country: "Australia", lat: -21.28, lon: 149.3 },
  { code: "AUNTL", name: "Newcastle", country: "Australia", lat: -32.92, lon: 151.78 },
  { code: "ZARIB", name: "Richards Bay", country: "South Africa", lat: -28.8, lon: 32.09 },
  { code: "IDTAB", name: "Taboneo", country: "Indonesia", lat: -3.6, lon: 114.45 },
  { code: "IDSAM", name: "Samarinda", country: "Indonesia", lat: -0.5, lon: 117.15 },
  { code: "BRTUB", name: "Tubarao", country: "Brazil", lat: -20.28, lon: -40.24 },
  { code: "USHAM", name: "Hampton Roads", country: "USA", lat: 36.92, lon: -76.33 },
  { code: "AEJEA", name: "Jebel Ali", country: "UAE", lat: 25.01, lon: 55.06 },
  { code: "OMSOH", name: "Sohar", country: "Oman", lat: 24.5, lon: 56.62 },
];

export const VESSEL_CLASSES = [
  { id: "handysize", name: "Handysize", dwt: 32000, draft_m: 9.8, loa_m: 180, beam_m: 28, ref_speed_kn: 12.5, laden_cons_tpd: 20, aux_cons_tpd: 2.4, hire_usd_per_day: 11800, note: "Geared, tidal-port friendly. The only class Kolkata can take." },
  { id: "handymax", name: "Handymax", dwt: 47000, draft_m: 11.3, loa_m: 190, beam_m: 32.2, ref_speed_kn: 13, laden_cons_tpd: 25, aux_cons_tpd: 2.8, hire_usd_per_day: 13600, note: "Geared workhorse for fertiliser and agri-bulk parcels." },
  { id: "supramax", name: "Supramax", dwt: 58000, draft_m: 12.8, loa_m: 200, beam_m: 32.3, ref_speed_kn: 13.5, laden_cons_tpd: 28.5, aux_cons_tpd: 3, hire_usd_per_day: 15200, note: "Best fit for Haldia and Kakinada draft envelopes." },
  { id: "panamax", name: "Panamax", dwt: 76000, draft_m: 14, loa_m: 225, beam_m: 32.3, ref_speed_kn: 14, laden_cons_tpd: 34, aux_cons_tpd: 3.4, hire_usd_per_day: 17400, note: "Standard thermal coal carrier on the Indonesia–East Coast lane." },
  { id: "kamsarmax", name: "Kamsarmax", dwt: 82000, draft_m: 14.4, loa_m: 229, beam_m: 32.3, ref_speed_kn: 14, laden_cons_tpd: 35.5, aux_cons_tpd: 3.5, hire_usd_per_day: 18600, note: "Marginal scale gain over Panamax at near-identical port cost." },
  { id: "postpanamax", name: "Post-Panamax", dwt: 98000, draft_m: 15.4, loa_m: 250, beam_m: 43, ref_speed_kn: 14.2, laden_cons_tpd: 40, aux_cons_tpd: 3.8, hire_usd_per_day: 21500, note: "Fits Vizag, Gangavaram, Krishnapatnam and Chennai only." },
  { id: "capesize", name: "Capesize", dwt: 180000, draft_m: 18.2, loa_m: 292, beam_m: 45, ref_speed_kn: 14.5, laden_cons_tpd: 56, aux_cons_tpd: 5, hire_usd_per_day: 28900, note: "Lowest $/tonne on long haul but only three east coast ports accept her." },
];

export const ROUTES = [
  { id: "IDTAB-INVTZ", origin: "IDTAB", destination: "INVTZ", distance_nm: 2480, cargo: "Thermal Coal", base_rate: 12.4, volatility: 0.16 },
  { id: "IDTAB-INPRT", origin: "IDTAB", destination: "INPRT", distance_nm: 2610, cargo: "Thermal Coal", base_rate: 13.1, volatility: 0.17 },
  { id: "IDTAB-INENR", origin: "IDTAB", destination: "INENR", distance_nm: 2290, cargo: "Thermal Coal", base_rate: 11.85, volatility: 0.15 },
  { id: "AUNTL-INVTZ", origin: "AUNTL", destination: "INVTZ", distance_nm: 5840, cargo: "Thermal Coal", base_rate: 21.6, volatility: 0.21 },
  { id: "AUHPT-INGGV", origin: "AUHPT", destination: "INGGV", distance_nm: 5320, cargo: "Coking Coal", base_rate: 19.75, volatility: 0.22 },
  { id: "AUHPT-INPRT", origin: "AUHPT", destination: "INPRT", distance_nm: 5460, cargo: "Coking Coal", base_rate: 20.4, volatility: 0.23 },
  { id: "ZARIB-INVTZ", origin: "ZARIB", destination: "INVTZ", distance_nm: 4180, cargo: "Thermal Coal", base_rate: 17.3, volatility: 0.19 },
  { id: "ZARIB-INMAA", origin: "ZARIB", destination: "INMAA", distance_nm: 3960, cargo: "Thermal Coal", base_rate: 16.55, volatility: 0.18 },
  { id: "BRTUB-INGGV", origin: "BRTUB", destination: "INGGV", distance_nm: 8420, cargo: "Iron Ore", base_rate: 26.9, volatility: 0.27 },
  { id: "USHAM-INHAL", origin: "USHAM", destination: "INHAL", distance_nm: 9150, cargo: "Coking Coal", base_rate: 34.2, volatility: 0.29 },
  { id: "AUPHE-INKRI", origin: "AUPHE", destination: "INKRI", distance_nm: 3510, cargo: "Iron Ore", base_rate: 14.8, volatility: 0.2 },
  { id: "AEJEA-INKAK", origin: "AEJEA", destination: "INKAK", distance_nm: 1980, cargo: "Fertilizer", base_rate: 15.2, volatility: 0.14 },
  { id: "OMSOH-INTUT", origin: "OMSOH", destination: "INTUT", distance_nm: 1740, cargo: "Limestone", base_rate: 13.65, volatility: 0.13 },
  { id: "IDSAM-INCCU", origin: "IDSAM", destination: "INCCU", distance_nm: 2870, cargo: "Thermal Coal", base_rate: 18.9, volatility: 0.24 },
];

const INDEX_DEFS = [
  { code: "BDI", name: "Baltic Dry Index", base: 1685, unit: "pts", vol: 0.019 },
  { code: "BCI", name: "Baltic Capesize Index", base: 2410, unit: "pts", vol: 0.028 },
  { code: "BPI", name: "Baltic Panamax Index", base: 1520, unit: "pts", vol: 0.017 },
  { code: "BSI", name: "Baltic Supramax Index", base: 1180, unit: "pts", vol: 0.014 },
  { code: "BHSI", name: "Baltic Handysize Index", base: 690, unit: "pts", vol: 0.012 },
  { code: "VLSFO", name: "VLSFO Singapore Bunker", base: 612, unit: "USD/mt", vol: 0.011 },
];

const VESSEL_NAMES = ["MV Bay Horizon", "MV Coromandel Star", "MV Odisha Trader", "MV Kalinga Spirit", "MV Andhra Pioneer", "MV Bengal Voyager", "MV Vizag Endeavour", "MV Deccan Carrier", "MV Godavari Belle", "MV Mahanadi Pride", "MV Krishna Navigator", "MV Coastal Sentinel", "MV Sagar Vikas", "MV Konark Dawn"];

const ALL_PORTS = Object.fromEntries([...PORTS, ...LOAD_PORTS].map((p) => [p.code, p]));
const CLASS_BY_ID = Object.fromEntries(VESSEL_CLASSES.map((v) => [v.id, v]));
const BUNKER = 612;

export const routeLabel = (r) =>
  `${ALL_PORTS[r.origin]?.name || r.origin} → ${ALL_PORTS[r.destination]?.name || r.destination}`;

/* ------------------------------------------------------------ deterministic */

/** mulberry32 seeded from a string — same key, same series, every reload. */
function rng(...parts) {
  const key = parts.join("::");
  let h = 1779033703 ^ key.length;
  for (let i = 0; i < key.length; i++) {
    h = Math.imul(h ^ key.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const uniform = (r, lo, hi) => lo + r() * (hi - lo);
const gauss = (r, mu = 0, sigma = 1) => {
  const u = Math.max(r(), 1e-9);
  return mu + sigma * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r());
};

const isoDay = (d) => d.toISOString().slice(0, 10);
const today = () => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
};
const addDays = (d, n) => new Date(d.getTime() + n * 86400000);
const dayOfYear = (d) =>
  Math.floor((d - Date.UTC(d.getUTCFullYear(), 0, 0)) / 86400000);

const seasonality = (doy, amp) =>
  amp * (0.62 * Math.cos(((doy - 105) / 365) * 2 * Math.PI) +
         0.38 * Math.cos(((doy - 288) / 365) * 2 * Math.PI));

/* ------------------------------------------------------------- freight rates */

export function freightHistory(routeId, days = 365) {
  const route = ROUTES.find((r) => r.id === routeId) || ROUTES[0];
  const r = rng("history", route.id);
  const { base_rate: base, volatility: vol } = route;
  const start = addDays(today(), -(days - 1));

  let level = base * (1 + uniform(r, -0.08, 0.08));
  let spike = 0;
  const series = [];

  for (let i = 0; i < days; i++) {
    const date = addDays(start, i);
    const anchor = base * (1 + seasonality(dayOfYear(date), 0.11));
    level += 0.085 * (anchor - level) + gauss(r, 0, base * vol * 0.055);
    if (r() < 0.012) spike = base * uniform(r, 0.06, 0.2);
    level += spike;
    spike = spike * 0.82 < base * 0.002 ? 0 : spike * 0.82;
    level = Math.max(level, base * 0.55);
    series.push({
      date: isoDay(date),
      rate: +level.toFixed(2),
      volume_t: Math.max(2000, Math.round(gauss(r, 11, 3.2) * 1000 + 4000)),
    });
  }

  return {
    route_id: route.id, route: routeLabel(route), cargo: route.cargo,
    distance_nm: route.distance_nm, unit: "USD/tonne", series,
  };
}

export function freightForecast(routeId, horizon = 30) {
  horizon = Math.max(7, Math.min(horizon, 90));
  const route = ROUTES.find((x) => x.id === routeId) || ROUTES[0];
  const hist = freightHistory(route.id);
  const r = rng("forecast", route.id, horizon);

  const tail = hist.series.slice(-45).map((p) => p.rate);
  const last = tail[tail.length - 1];
  const shortMA = tail.slice(-10).reduce((a, b) => a + b, 0) / 10;
  const longMA = tail.reduce((a, b) => a + b, 0) / tail.length;
  const momentum = (shortMA - longMA) / longMA;

  const { base_rate: base, volatility: vol } = route;
  const sigmaDaily = base * vol * 0.055;
  const start = today();
  let level = last;
  const points = [];

  for (let i = 1; i <= horizon; i++) {
    const date = addDays(start, i);
    const anchor = base * (1 + seasonality(dayOfYear(date), 0.11));
    const decay = Math.exp(-i / 21);
    level += 0.075 * (anchor - level) + momentum * base * 0.011 * decay + gauss(r, 0, sigmaDaily * 0.35);
    level = Math.max(level, base * 0.55);
    const sigma = sigmaDaily * Math.sqrt(i) * 1.9;
    points.push({
      date: isoDay(date),
      forecast: +level.toFixed(2),
      lower: +Math.max(level - 1.96 * sigma, base * 0.4).toFixed(2),
      upper: +(level + 1.96 * sigma).toFixed(2),
    });
  }

  const horizonRate = points[points.length - 1].forecast;
  const changePct = ((horizonRate - last) / last) * 100;
  const [signal, recommendation] =
    changePct > 4
      ? ["RISING", "Fix tonnage now — lock forward cover before the run-up."]
      : changePct < -4
      ? ["FALLING", "Hold and buy spot — the curve rewards waiting."]
      : ["STABLE", "Range-bound — split the requirement across the window."];
  const best = points.reduce((a, b) => (b.forecast < a.forecast ? b : a));

  return {
    route_id: route.id, route: routeLabel(route), cargo: route.cargo,
    horizon_days: horizon, unit: "USD/tonne",
    current_rate: +last.toFixed(2), forecast_rate: horizonRate,
    change_pct: +changePct.toFixed(2), signal, recommendation,
    confidence: +Math.max(0.58, 0.93 - horizon / 260 - vol * 0.7).toFixed(2),
    model: "VORTEX-TFT v2.1 (temporal fusion, 36-month training window)",
    best_entry: { date: best.date, rate: best.forecast },
    history: hist.series.slice(-90),
    points,
  };
}

export function marketTiming(routeId, horizon = 60) {
  const fc = freightForecast(routeId, horizon);
  const weeks = [];
  for (let i = 0; i < fc.points.length; i += 7) {
    const chunk = fc.points.slice(i, i + 7);
    if (!chunk.length) continue;
    weeks.push({
      week: i / 7 + 1,
      start: chunk[0].date,
      end: chunk[chunk.length - 1].date,
      avg_rate: +(chunk.reduce((a, b) => a + b.forecast, 0) / chunk.length).toFixed(2),
    });
  }
  const cheapest = Math.min(...weeks.map((w) => w.avg_rate));
  const dearest = Math.max(...weeks.map((w) => w.avg_rate));
  const span = Math.max(dearest - cheapest, 1e-6);
  weeks.forEach((w) => {
    w.score = +(1 - (w.avg_rate - cheapest) / span).toFixed(2);
    w.action = w.score > 0.72 ? "FIX" : w.score > 0.38 ? "WATCH" : "AVOID";
  });
  return { ...fc, weeks };
}

export function indicesSnapshot() {
  const now = new Date();
  const bucket = Math.floor(now.getTime() / 300000);
  return INDEX_DEFS.map((idx) => {
    const dayVal = (d) =>
      idx.base * (1 + uniform(rng("index", idx.code, isoDay(addDays(now, -d))), -1, 1) * idx.vol);
    let value = dayVal(0) * (1 + uniform(rng("tick", idx.code, bucket), -0.004, 0.004));
    const prev = dayVal(1);
    return {
      code: idx.code, name: idx.name, unit: idx.unit,
      value: +value.toFixed(2),
      change: +(value - prev).toFixed(2),
      change_pct: +(((value - prev) / prev) * 100).toFixed(2),
      sparkline: Array.from({ length: 30 }, (_, i) => +dayVal(29 - i).toFixed(2)),
    };
  });
}

export function rateMatrix() {
  return ROUTES.map((r) => {
    const hist = freightHistory(r.id).series;
    const rate = hist[hist.length - 1].rate;
    const monthAgo = hist[hist.length - 31].rate;
    const fc = freightForecast(r.id, 30);
    return {
      route_id: r.id, route: routeLabel(r), origin: r.origin, destination: r.destination,
      cargo: r.cargo, distance_nm: r.distance_nm, rate,
      change_30d_pct: +(((rate - monthAgo) / monthAgo) * 100).toFixed(2),
      forecast_30d: fc.forecast_rate, signal: fc.signal, confidence: fc.confidence,
    };
  });
}

/* -------------------------------------------------------------- fleet + port */

export function portCongestion() {
  const hourKey = new Date().toISOString().slice(0, 13);
  return PORTS.map((p) => {
    const r = rng("congestion", p.code, hourKey);
    const waiting = Math.max(0, Math.round(p.congestion_index * 18 + gauss(r, 0, 2.4)));
    const wait = +Math.max(0.2, p.congestion_index * 6.5 + gauss(r, 0, 0.8)).toFixed(1);
    return {
      code: p.code, port: p.name, short: p.short, state: p.state, lat: p.lat, lon: p.lon,
      vessels_waiting: waiting, avg_wait_days: wait,
      avg_dwell_days: +(p.avg_dwell_days + uniform(r, -0.4, 0.6)).toFixed(1),
      berth_occupancy: +Math.min(0.99, p.congestion_index * 0.8 + uniform(r, 0.28, 0.46)).toFixed(2),
      berths: p.berths, handling_rate_tpd: p.handling_rate_tpd,
      congestion_level: wait > 3.5 ? "critical" : wait > 2 ? "elevated" : "clear",
    };
  });
}

export function activeVessels(count = 14) {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const r = rng("vessel", i);
    const route = ROUTES[i % ROUTES.length];
    const klass = VESSEL_CLASSES[Math.floor(r() * VESSEL_CLASSES.length)];
    const origin = ALL_PORTS[route.origin];
    const dest = ALL_PORTS[route.destination];
    const speed = +(klass.ref_speed_kn + uniform(r, -1.8, 1.2)).toFixed(1);
    const legH = route.distance_nm / speed;
    const elapsed = ((now / 3600000 + uniform(r, 0, legH)) % (legH * 1.35));
    const underway = elapsed < legH;
    const progress = underway ? elapsed / legH : 1;
    const etaH = underway ? legH - elapsed : uniform(r, 4, 40);

    return {
      id: `VTX-${4100 + i}`,
      imo: `9${Math.floor(uniform(r, 100000, 999999))}`,
      name: VESSEL_NAMES[i % VESSEL_NAMES.length],
      vessel_class: klass.name, class_id: klass.id, dwt: klass.dwt,
      cargo: route.cargo,
      cargo_t: Math.round((klass.dwt * uniform(r, 0.88, 0.97)) / 1000) * 1000,
      origin: origin.name, origin_code: route.origin,
      destination: dest.name, destination_code: route.destination,
      route_id: route.id,
      status: underway ? "Underway" : "At Berth",
      progress_pct: +(progress * 100).toFixed(1),
      lat: +(origin.lat + (dest.lat - origin.lat) * progress +
             Math.sin(progress * Math.PI) * uniform(r, -2.4, 2.4)).toFixed(4),
      lon: +(origin.lon + (dest.lon - origin.lon) * progress).toFixed(4),
      speed_kn: speed,
      draft_m: +(klass.draft_m * uniform(r, 0.93, 1)).toFixed(1),
      fuel_tpd: +(klass.laden_cons_tpd * (speed / klass.ref_speed_kn) ** 3 + klass.aux_cons_tpd).toFixed(1),
      eta: new Date(now + etaH * 3600000).toISOString().slice(0, 16).replace("T", " ") + " UTC",
      eta_days: +(etaH / 24).toFixed(1),
      charter_rate_usd_day: klass.hire_usd_per_day + Math.round(uniform(r, -1400, 1900)),
      delay_risk: +Math.min(0.95, (dest.congestion_index ?? 0.4) * uniform(r, 0.7, 1.5)).toFixed(2),
    };
  });
}

export function berthSchedule(portCode, days = 10) {
  const port = PORTS.find((p) => p.code === portCode) || PORTS[0];
  const r = rng("berths", port.code, isoDay(today()));
  const start = today();
  const fmt = (d) => d.toISOString().slice(0, 16).replace("T", " ");

  const berths = Array.from({ length: port.berths }, (_, b) => {
    let cursor = new Date(start.getTime() + uniform(r, 0, 26) * 3600000);
    const slots = [];
    while (cursor < addDays(start, days)) {
      let klass = VESSEL_CLASSES[Math.floor(r() * VESSEL_CLASSES.length)];
      if (klass.draft_m > port.max_draft_m || klass.loa_m > port.max_loa_m) klass = VESSEL_CLASSES[0];
      const parcel = Math.round(klass.dwt * uniform(r, 0.8, 0.96));
      const hours = (parcel / port.handling_rate_tpd) * 24 + uniform(r, 6, 14);
      const end = new Date(cursor.getTime() + hours * 3600000);
      slots.push({
        vessel: VESSEL_NAMES[Math.floor(r() * VESSEL_NAMES.length)],
        vessel_class: klass.name,
        cargo: port.cargoes[Math.floor(r() * port.cargoes.length)],
        parcel_t: parcel, start: fmt(cursor), end: fmt(end),
        start_offset_h: +((cursor - start) / 3600000).toFixed(1),
        duration_h: +hours.toFixed(1),
        status: r() > 0.28 ? "confirmed" : "provisional",
      });
      cursor = new Date(end.getTime() + uniform(r, 3, 20) * 3600000);
    }
    return {
      berth: `${port.short.slice(0, 3).toUpperCase()}-${b + 1}`,
      max_draft_m: +(port.max_draft_m - uniform(r, 0, 1.4)).toFixed(1),
      crane_count: Math.max(1, Math.floor(port.cranes / port.berths) + (b === 0 ? 1 : 0)),
      slots,
      next_free: slots.length ? slots[slots.length - 1].end : fmt(start),
    };
  });

  return {
    port: port.name, code: port.code, window_days: days, window_start: isoDay(start),
    handling_rate_tpd: port.handling_rate_tpd,
    constraints: { max_draft_m: port.max_draft_m, max_loa_m: port.max_loa_m, max_beam_m: port.max_beam_m },
    berths,
  };
}

export function kpiSnapshot() {
  const fleet = activeVessels();
  const congestion = portCongestion();
  const idx = Object.fromEntries(indicesSnapshot().map((i) => [i.code, i]));
  const r = rng("kpi", new Date().toISOString().slice(0, 13));

  const underway = fleet.filter((v) => v.status === "Underway").length;
  const dwell = congestion.reduce((a, c) => a + c.avg_dwell_days, 0) / congestion.length;
  const waiting = congestion.reduce((a, c) => a + c.vessels_waiting, 0);
  const tonnage = fleet.reduce((a, v) => a + v.cargo_t, 0);
  const landed = +uniform(r, -6.4, 4.1).toFixed(2);
  const spark = (key, base, vol) =>
    Array.from({ length: 14 }, (_, i) =>
      +(base * (1 + uniform(rng(key, isoDay(addDays(new Date(), i - 13))), -vol, vol))).toFixed(2));

  return [
    { id: "bdi", label: "Baltic Dry Index", value: idx.BDI.value, unit: "pts", change_pct: idx.BDI.change_pct, hint: "Composite dry bulk freight benchmark", sparkline: idx.BDI.sparkline.slice(-14), tone: idx.BDI.change_pct >= 0 ? "up" : "down" },
    { id: "vessels", label: "Active Vessels in Transit", value: underway, unit: `of ${fleet.length} chartered`, change_pct: +uniform(r, -8, 12).toFixed(1), hint: `${tonnage.toLocaleString()} t of cargo on the water`, sparkline: spark("vessels", underway, 0.18), tone: "up" },
    { id: "dwell", label: "Avg Port Dwell Time", value: +dwell.toFixed(1), unit: "days", change_pct: +uniform(r, -9, 7).toFixed(1), hint: `${waiting} vessels currently in the queue`, sparkline: spark("dwell", dwell, 0.12), tone: dwell < 4 ? "down" : "up" },
    { id: "landed", label: "Landed Cost Delta", value: landed, unit: "% vs 90-day mean", change_pct: landed, hint: "Blended CIF cost across all active lanes", sparkline: spark("landed", 100 + landed, 0.03), tone: landed < 0 ? "down" : "up" },
    { id: "bunker", label: "VLSFO Bunker (Singapore)", value: idx.VLSFO.value, unit: "USD/mt", change_pct: idx.VLSFO.change_pct, hint: "Drives the speed/consumption trade-off", sparkline: idx.VLSFO.sparkline.slice(-14), tone: idx.VLSFO.change_pct >= 0 ? "up" : "down" },
    { id: "idle", label: "Fleet Idle Time", value: +uniform(r, 4.2, 9.6).toFixed(1), unit: "% of charter days", change_pct: +uniform(r, -14, 6).toFixed(1), hint: "Waiting-for-berth plus ballast deadheading", sparkline: spark("idle", 7, 0.16), tone: "down" },
  ];
}

export function alertFeed() {
  const out = [];
  portCongestion().forEach((c) => {
    if (c.congestion_level === "critical")
      out.push({ level: "critical", port: c.port, title: `Berth congestion at ${c.port}`,
        detail: `${c.vessels_waiting} vessels waiting, ${c.avg_wait_days} day average wait at ${Math.round(c.berth_occupancy * 100)}% berth occupancy.` });
    else if (c.congestion_level === "elevated")
      out.push({ level: "warning", port: c.port, title: `Queue building at ${c.port}`,
        detail: `Wait time up to ${c.avg_wait_days} days — review laycan before fixing.` });
  });
  activeVessels().forEach((v) => {
    if (v.delay_risk > 0.6 && v.status === "Underway")
      out.push({ level: "warning", port: v.destination, title: `${v.name} at delay risk`,
        detail: `${Math.round(v.delay_risk * 100)}% probability of missing laycan at ${v.destination} — ETA ${v.eta}.` });
  });
  const order = { critical: 0, warning: 1, info: 2 };
  return out.sort((a, b) => order[a.level] - order[b.level]).slice(0, 12);
}

/* ------------------------------------------------------------------ engines */

const tpc = (dwt) => 3.77 * (dwt / 1000) ** (2 / 3);

export function portFeasibility(portCode, classId) {
  const port = PORTS.find((p) => p.code === portCode);
  const klass = CLASS_BY_ID[classId];
  if (!port || !klass) return null;

  const clearance = Math.max(1, klass.draft_m * 0.1);
  const required = klass.draft_m + clearance;
  const draftOk = required <= port.max_draft_m;
  const loaOk = klass.loa_m <= port.max_loa_m;
  const beamOk = klass.beam_m <= port.max_beam_m;

  let maxCargo, sacrificed;
  if (draftOk) {
    maxCargo = Math.round(klass.dwt * 0.95);
    sacrificed = 0;
  } else {
    sacrificed = Math.round(Math.min(klass.dwt * 0.95, (required - port.max_draft_m) * 100 * tpc(klass.dwt)));
    maxCargo = Math.max(0, Math.round(klass.dwt * 0.95) - sacrificed);
  }
  if (!(loaOk && beamOk)) {
    maxCargo = 0;
    sacrificed = Math.round(klass.dwt * 0.95);
  }

  const blockers = [];
  if (!draftOk) blockers.push(`Draft: needs ${required.toFixed(1)} m incl. under-keel clearance, berth allows ${port.max_draft_m.toFixed(1)} m`);
  if (!loaOk) blockers.push(`LOA: ${klass.loa_m} m exceeds ${port.max_loa_m} m`);
  if (!beamOk) blockers.push(`Beam: ${klass.beam_m} m exceeds ${port.max_beam_m} m`);

  const feasible = loaOk && beamOk && maxCargo > klass.dwt * 0.45;
  return {
    port: port.name, port_code: port.code, vessel_class: klass.name, class_id: klass.id,
    feasible, draft_ok: draftOk, loa_ok: loaOk, beam_ok: beamOk,
    required_draft_m: +required.toFixed(2), berth_draft_m: port.max_draft_m,
    max_cargo_t: maxCargo, cargo_sacrificed_t: sacrificed,
    utilisation_pct: +((maxCargo / klass.dwt) * 100).toFixed(1),
    blockers,
    verdict: feasible && draftOk ? "Clear to berth fully laden" : feasible ? "Berths only part-laden" : "Cannot berth",
  };
}

export function constraintMatrix() {
  const grid = [];
  PORTS.forEach((p) =>
    VESSEL_CLASSES.forEach((v) => {
      const f = portFeasibility(p.code, v.id);
      grid.push({ port: p.code, class: v.id, feasible: f.feasible, draft_ok: f.draft_ok,
        max_cargo_t: f.max_cargo_t, utilisation_pct: f.utilisation_pct, verdict: f.verdict });
    }));
  return {
    ports: PORTS.map(({ code, name, short, max_draft_m, max_loa_m, max_beam_m }) =>
      ({ code, name, short, max_draft_m, max_loa_m, max_beam_m })),
    classes: VESSEL_CLASSES.map(({ id, name, dwt, draft_m, loa_m, beam_m }) =>
      ({ id, name, dwt, draft_m, loa_m, beam_m })),
    grid,
  };
}

function voyageAtSpeed(klass, distance, speed, cargo, bunker, portDays, rate, charges, laytime, demRate) {
  const seaDays = distance / (speed * 24);
  const fuelTpd = klass.laden_cons_tpd * (speed / klass.ref_speed_kn) ** 3 + klass.aux_cons_tpd;
  const fuelT = fuelTpd * seaDays + klass.aux_cons_tpd * portDays;
  const fuelCost = fuelT * bunker;
  const hire = klass.hire_usd_per_day * (seaDays + portDays);
  const portCost = cargo * charges;
  const demDays = Math.max(0, portDays - laytime);
  const demurrage = demDays * demRate;
  const total = fuelCost + hire + portCost + demurrage;
  return {
    speed_kn: +speed.toFixed(1), sea_days: +seaDays.toFixed(2),
    total_days: +(seaDays + portDays).toFixed(2), fuel_tpd: +fuelTpd.toFixed(1),
    fuel_t: +fuelT.toFixed(1), fuel_cost: Math.round(fuelCost), hire_cost: Math.round(hire),
    port_cost: Math.round(portCost), demurrage_cost: Math.round(demurrage),
    total_cost: Math.round(total), cost_per_t: cargo ? +(total / cargo).toFixed(2) : 0,
    co2_t: +(fuelT * 3.114).toFixed(1),
    margin_vs_freight: Math.round(cargo * rate - total),
  };
}

export function optimizeVoyage(payload = {}) {
  const originCode = payload.origin || "IDTAB";
  const destCode = payload.destination || "INVTZ";
  const klass = CLASS_BY_ID[payload.vessel_class] || CLASS_BY_ID.panamax;
  const port = PORTS.find((p) => p.code === destCode) || PORTS[0];
  const laytime = +(payload.laytime_days ?? 3);
  const demRate = +(payload.demurrage_rate ?? 18500);
  const bunker = +(payload.bunker_price || BUNKER);

  const lane = ROUTES.find((r) => r.origin === originCode && r.destination === destCode);
  let distance = lane?.distance_nm;
  if (!distance) {
    const a = ALL_PORTS[originCode], b = ALL_PORTS[destCode];
    const rad = (x) => (x * Math.PI) / 180;
    const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 +
      Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lon - a.lon) / 2) ** 2;
    distance = Math.round(2 * Math.asin(Math.sqrt(h)) * 3440.065 * 1.12);
  }

  const feas = portFeasibility(port.code, klass.id);
  const requested = Number(payload.cargo_tonnes) || 0;
  const cargo = feas.feasible
    ? Math.max(1000, requested ? Math.min(requested, feas.max_cargo_t) : feas.max_cargo_t)
    : Math.round(klass.dwt * 0.95);

  const cong = portCongestion().find((c) => c.code === port.code);
  const waitDays = cong ? cong.avg_wait_days : 1.5;
  const dischargeDays = cargo / port.handling_rate_tpd;
  const portDays = +(dischargeDays + waitDays + 0.75).toFixed(2);
  const rate = lane ? freightHistory(lane.id).series.slice(-1)[0].rate : 16;

  const lo = Math.max(8, klass.ref_speed_kn - 4.5);
  const hi = klass.ref_speed_kn + 1.5;
  const curve = [];
  for (let s = lo; s <= hi + 1e-6; s += 0.5)
    curve.push(voyageAtSpeed(klass, distance, s, cargo, bunker, portDays, rate, port.port_charges_usd_per_t, laytime, demRate));

  const optimal = curve.reduce((a, b) => (b.cost_per_t < a.cost_per_t ? b : a));
  const design = curve.reduce((a, b) =>
    Math.abs(b.speed_kn - klass.ref_speed_kn) < Math.abs(a.speed_kn - klass.ref_speed_kn) ? b : a);
  const saving = design.total_cost - optimal.total_cost;

  const alternatives = VESSEL_CLASSES.map((v) => {
    const f = portFeasibility(port.code, v.id);
    if (!f.feasible)
      return { class_id: v.id, vessel_class: v.name, dwt: v.dwt, feasible: false,
        reason: f.blockers[0] || "Restricted", cost_per_t: null, cargo_t: f.max_cargo_t };
    const cT = Math.max(1000, requested ? Math.min(requested, f.max_cargo_t) : f.max_cargo_t);
    const pD = +(cT / port.handling_rate_tpd + waitDays + 0.75).toFixed(2);
    const best = [v.ref_speed_kn - 2, v.ref_speed_kn - 1, v.ref_speed_kn]
      .map((sp) => voyageAtSpeed(v, distance, sp, cT, bunker, pD, rate, port.port_charges_usd_per_t, laytime, demRate))
      .reduce((a, b) => (b.cost_per_t < a.cost_per_t ? b : a));
    return { class_id: v.id, vessel_class: v.name, dwt: v.dwt, feasible: true, reason: f.verdict,
      cargo_t: cT, cost_per_t: best.cost_per_t, total_cost: best.total_cost,
      total_days: best.total_days, optimal_speed_kn: best.speed_kn,
      voyages_per_year: +(340 / best.total_days).toFixed(1) };
  });

  const ranked = alternatives.filter((a) => a.feasible).sort((a, b) => a.cost_per_t - b.cost_per_t);
  ranked.forEach((a, i) => { a.rank = i + 1; });
  const bestClass = ranked[0] || null;

  const insight = [];
  if (!feas.feasible)
    insight.push(`${klass.name} cannot work ${port.name}: ${feas.blockers.join("; ")}. Figures below are indicative only.`);
  insight.push(optimal.speed_kn < design.speed_kn
    ? `Slow-steam to ${optimal.speed_kn} kn (down from ${design.speed_kn} kn): ${(optimal.fuel_t - design.fuel_t).toFixed(0)} t bunkers, $${saving.toLocaleString()} saved over the voyage.`
    : `Hold ${optimal.speed_kn} kn — hire and demurrage exposure outweigh the bunker saving from slowing down.`);
  if (!feas.draft_ok)
    insight.push(`Draft restriction leaves ${feas.cargo_sacrificed_t.toLocaleString()} t on the quay (${feas.utilisation_pct}% deadweight utilisation).`);
  if (!bestClass)
    insight.push("No class in the fleet clears this berth fully laden — lighten at anchorage or route the parcel through a deeper port.");
  else if (!feas.feasible)
    insight.push(`${bestClass.vessel_class} is the largest class that can berth here: ${bestClass.cargo_t.toLocaleString()} t at $${bestClass.cost_per_t}/t.`);
  else if (bestClass.class_id !== klass.id)
    insight.push(`${bestClass.vessel_class} lands the cargo at $${bestClass.cost_per_t}/t versus $${optimal.cost_per_t}/t on ${klass.name} — switch class if the parcel size allows.`);

  return {
    origin: ALL_PORTS[originCode]?.name || originCode, origin_code: originCode,
    destination: port.name, destination_code: port.code, route_id: lane?.id || null,
    distance_nm: distance, vessel_class: klass.name, class_id: klass.id,
    bunker_price: bunker, freight_rate: rate, cargo_t: cargo,
    viable: feas.feasible, feasibility: feas,
    port_stay: {
      discharge_days: +dischargeDays.toFixed(2), queue_wait_days: waitDays,
      total_port_days: portDays, handling_rate_tpd: port.handling_rate_tpd,
      laytime_days: laytime,
      demurrage_exposure_usd: Math.round(Math.max(0, portDays - laytime) * demRate),
    },
    speed_curve: curve, optimal, at_design_speed: design,
    saving_usd: Math.round(saving),
    saving_pct: design.total_cost ? +((saving / design.total_cost) * 100).toFixed(2) : 0,
    alternatives, recommended_class: bestClass, insight,
  };
}

export function landedCost(p = {}) {
  const n = (v, d) => (v === undefined || v === null || v === "" ? d : Number(v));
  const tonnesQ = n(p.tonnes, 60000);
  const fob = n(p.fob_price, 92);
  const freight = n(p.freight_rate, 13.5);
  const insurancePct = n(p.insurance_pct, 0.35);
  const dutyPct = n(p.duty_pct, 2.5);
  const handlingRate = n(p.port_handling, 4.1);
  const inlandRate = n(p.inland_freight, 6.8);
  const holdingDays = n(p.holding_days, 21);
  const holdingRate = n(p.holding_rate, 0.085);
  const interestPct = n(p.interest_pct, 8.5);
  const laytime = n(p.laytime_days, 3);
  const actualPortDays = n(p.actual_port_days, 4.6);
  const demRate = n(p.demurrage_rate, 18500);
  const demandTpd = n(p.demand_rate_tpd, 2600) || 1;
  const stockoutPenalty = n(p.stockout_penalty, 145);
  const leadTime = n(p.lead_time_days, 24);
  const openingStock = n(p.opening_stock_t, 68000);

  const fobCost = tonnesQ * fob;
  const oceanFreight = tonnesQ * freight;
  const cnf = fobCost + oceanFreight;
  const insurance = (cnf * insurancePct) / 100;
  const cif = cnf + insurance;
  const duty = (cif * dutyPct) / 100;
  const handling = tonnesQ * handlingRate;
  const inland = tonnesQ * inlandRate;

  const overrun = actualPortDays - laytime;
  const demurrage = overrun > 0 ? overrun * demRate : 0;
  const despatch = overrun > 0 ? 0 : -overrun * (demRate / 2);

  const storage = tonnesQ * holdingRate * holdingDays;
  const goodsValue = cif + duty + handling + inland;
  const carrying = goodsValue * (interestPct / 100) * (holdingDays / 365);

  const coverDays = openingStock / demandTpd;
  const gapDays = Math.max(0, leadTime - coverDays);
  const shortfall = gapDays * demandTpd;
  const stockout = shortfall * stockoutPenalty;

  const total = fobCost + oceanFreight + insurance + duty + handling + inland +
    demurrage - despatch + storage + carrying + stockout;
  const perT = tonnesQ ? total / tonnesQ : 0;
  const per = (v) => (tonnesQ ? +(v / tonnesQ).toFixed(2) : 0);

  const breakdown = [
    { key: "fob", label: "FOB Cargo Value", amount: Math.round(fobCost), per_t: +fob.toFixed(2), group: "cargo" },
    { key: "freight", label: "Ocean Freight", amount: Math.round(oceanFreight), per_t: +freight.toFixed(2), group: "voyage" },
    { key: "insurance", label: "Marine Insurance", amount: Math.round(insurance), per_t: per(insurance), group: "voyage" },
    { key: "duty", label: "Customs Duty & Cess", amount: Math.round(duty), per_t: per(duty), group: "statutory" },
    { key: "handling", label: "Port Handling & Wharfage", amount: Math.round(handling), per_t: +handlingRate.toFixed(2), group: "port" },
    { key: "demurrage", label: "Demurrage", amount: Math.round(demurrage), per_t: per(demurrage), group: "port" },
    { key: "despatch", label: "Despatch Earned", amount: -Math.round(despatch), per_t: per(-despatch), group: "port" },
    { key: "inland", label: "Inland Freight to Plant", amount: Math.round(inland), per_t: +inlandRate.toFixed(2), group: "inland" },
    { key: "storage", label: "Godown / Stockyard Holding", amount: Math.round(storage), per_t: per(storage), group: "inventory" },
    { key: "carrying", label: "Working Capital Interest", amount: Math.round(carrying), per_t: per(carrying), group: "inventory" },
    { key: "stockout", label: "Stockout Penalty", amount: Math.round(stockout), per_t: per(stockout), group: "risk" },
  ];

  const labels = { cargo: "Cargo", voyage: "Voyage", statutory: "Duties", port: "Port",
    inland: "Inland", inventory: "Inventory", risk: "Risk" };
  const groups = Object.entries(
    breakdown.reduce((acc, r) => ({ ...acc, [r.group]: (acc[r.group] || 0) + r.amount }), {})
  ).filter(([, v]) => v).map(([k, v]) => ({ key: k, label: labels[k] || k, amount: v }));

  const sweep = [];
  for (let size = 20000; size <= 200000; size += 10000) {
    const discount = Math.min(0.16, Math.log(size / 20000 + 1) * 0.07);
    const effFreight = freight * (1 - discount);
    const daysHeld = size / demandTpd / 2;
    const sStorage = size * holdingRate * daysHeld;
    const sValue = size * (fob + effFreight) * (1 + insurancePct / 100) * (1 + dutyPct / 100);
    const sCarrying = sValue * (interestPct / 100) * (daysHeld / 365);
    const sStockout = tonnesQ ? stockout * (size / tonnesQ) : 0;
    const sTotal = size * (fob + effFreight + handlingRate + inlandRate) + sStorage + sCarrying + sStockout + demurrage;
    sweep.push({ tonnes: size, cost_per_t: +(sTotal / size).toFixed(2),
      freight_per_t: +effFreight.toFixed(2),
      holding_per_t: +((sStorage + sCarrying) / size).toFixed(2),
      days_held: +daysHeld.toFixed(1) });
  }
  const optimalOrder = sweep.reduce((a, b) => (b.cost_per_t < a.cost_per_t ? b : a));

  const alerts = [];
  if (demurrage > 0)
    alerts.push({ level: "warning", text: `Port stay overruns laytime by ${overrun.toFixed(1)} days — $${Math.round(demurrage).toLocaleString()} of demurrage at $${demRate.toLocaleString()}/day.` });
  if (shortfall > 0)
    alerts.push({ level: "critical", text: `Stock cover is ${coverDays.toFixed(1)} days against a ${leadTime} day lead time — ${Math.round(shortfall).toLocaleString()} t short, $${Math.round(stockout).toLocaleString()} penalty exposure.` });
  if (storage + carrying > oceanFreight * 0.5)
    alerts.push({ level: "warning", text: "Inventory cost is over half the ocean freight — the parcel is too large for the offtake rate." });
  if (optimalOrder.tonnes !== Math.round(tonnesQ / 10000) * 10000)
    alerts.push({ level: "info", text: `Cost-optimal parcel is ${optimalOrder.tonnes.toLocaleString()} t at $${optimalOrder.cost_per_t}/t (${(perT - optimalOrder.cost_per_t >= 0 ? "+" : "")}${(perT - optimalOrder.cost_per_t).toFixed(2)}/t versus this plan).` });

  return {
    tonnes: tonnesQ, total_cost: Math.round(total), cost_per_tonne: +perT.toFixed(2),
    cif_per_tonne: tonnesQ ? +(cif / tonnesQ).toFixed(2) : 0,
    breakdown, groups,
    inventory: { cover_days: +coverDays.toFixed(1), lead_time_days: leadTime,
      shortfall_t: Math.round(shortfall), holding_days: holdingDays, demand_rate_tpd: demandTpd },
    order_sweep: sweep, optimal_order: optimalOrder, alerts,
  };
}

/* ------------------------------------------------------------------ dispatch */

const GENERATORS = {
  kpis: () => ({ kpis: kpiSnapshot() }),
  indices: () => ({ indices: indicesSnapshot(), bunker_usd_per_t: BUNKER }),
  routes: () => ({ routes: ROUTES.map((r) => ({ ...r, label: routeLabel(r) })) }),
  ports: () => ({ discharge_ports: PORTS, load_ports: LOAD_PORTS }),
  vesselClasses: () => ({ classes: VESSEL_CLASSES }),
  vessels: () => {
    const vessels = activeVessels();
    return { vessels, summary: {
      total: vessels.length,
      underway: vessels.filter((v) => v.status === "Underway").length,
      at_berth: vessels.filter((v) => v.status === "At Berth").length,
      cargo_afloat_t: vessels.reduce((a, v) => a + v.cargo_t, 0) } };
  },
  congestion: () => ({ ports: portCongestion() }),
  alerts: () => ({ alerts: alertFeed() }),
  berths: (arg) => berthSchedule(arg?.port || PORTS[0].code, arg?.days || 10),
  history: (arg) => freightHistory(arg?.route || ROUTES[0].id, arg?.days || 365),
  forecast: (arg) => freightForecast(arg?.route || ROUTES[0].id, arg?.horizon || 30),
  matrix: () => ({ rows: rateMatrix() }),
  timing: (arg) => marketTiming(arg?.route || ROUTES[0].id, arg?.horizon || 60),
  constraints: () => constraintMatrix(),
  voyage: (body) => optimizeVoyage(body),
  landed: (body) => landedCost(body),
};

/** Look up an offline generator by key. Returns null when there is no mirror. */
export function fallbackFor(key, arg) {
  const gen = GENERATORS[key];
  if (!gen) return null;
  try {
    return gen(arg);
  } catch {
    return null;
  }
}
