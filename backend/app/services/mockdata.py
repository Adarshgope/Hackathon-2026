"""
Deterministic-but-alive mock data generators for VORTEX.

Every generator is seeded off a stable key so the same route always produces the
same history across reloads (charts stay coherent during a demo), while anything
time-dependent -- vessel positions, live index ticks -- advances with the clock.
"""

import hashlib
import math
import random
from datetime import datetime, timedelta, timezone

from ..domain import (
    ALL_PORTS_BY_CODE,
    BUNKER_PRICE_USD_PER_T,
    INDICES,
    PORTS,
    ROUTES,
    VESSEL_CLASSES,
    VESSEL_CLASS_BY_ID,
    VESSEL_NAMES,
    route_label,
)

HISTORY_DAYS = 365


def _rng(*key):
    """A random.Random seeded reproducibly from any set of key parts."""
    digest = hashlib.sha256("::".join(str(k) for k in key).encode()).hexdigest()
    return random.Random(int(digest[:16], 16))


def _today():
    return datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)


def _seasonality(day_of_year, amplitude):
    """
    Dry bulk into India has two seasonal humps: pre-monsoon coal stocking
    (Mar-May) and the post-monsoon restock (Sep-Nov). Modelled as two cosines.
    """
    pre_monsoon = math.cos((day_of_year - 105) / 365.0 * 2 * math.pi)
    post_monsoon = math.cos((day_of_year - 288) / 365.0 * 2 * math.pi)
    return amplitude * (0.62 * pre_monsoon + 0.38 * post_monsoon)


# ---------------------------------------------------------------------------
# Freight rate history + forecast
# ---------------------------------------------------------------------------

def freight_history(route_id, days=HISTORY_DAYS):
    """
    Ornstein-Uhlenbeck style mean-reverting freight series with seasonality,
    occasional congestion spikes and a slow structural drift.
    """
    route = next((r for r in ROUTES if r["id"] == route_id), ROUTES[0])
    rng = _rng("history", route["id"])
    base = route["base_rate"]
    vol = route["volatility"]

    start = _today() - timedelta(days=days - 1)
    level = base * (1 + rng.uniform(-0.08, 0.08))
    series = []
    spike_decay = 0.0

    for i in range(days):
        date = start + timedelta(days=i)
        doy = date.timetuple().tm_yday

        # Mean reversion toward the seasonally adjusted anchor.
        anchor = base * (1 + _seasonality(doy, 0.11))
        level += 0.085 * (anchor - level) + rng.gauss(0, base * vol * 0.055)

        # Congestion / weather shocks decay over roughly a fortnight.
        if rng.random() < 0.012:
            spike_decay = base * rng.uniform(0.06, 0.20)
        level += spike_decay
        spike_decay *= 0.82
        if spike_decay < base * 0.002:
            spike_decay = 0.0

        level = max(level, base * 0.55)
        volume = int(rng.gauss(11, 3.2) * 1000 + 4000)

        series.append({
            "date": date.strftime("%Y-%m-%d"),
            "rate": round(level, 2),
            "volume_t": max(volume, 2000),
        })

    return {
        "route_id": route["id"],
        "route": route_label(route),
        "cargo": route["cargo"],
        "distance_nm": route["distance_nm"],
        "unit": "USD/tonne",
        "series": series,
    }


def freight_forecast(route_id, horizon=30):
    """
    Forward curve produced from the tail of the history: trend + seasonal carry,
    with a widening confidence cone (sigma grows with sqrt(t), as it should).
    """
    horizon = max(7, min(int(horizon), 90))
    hist = freight_history(route_id)
    route = next((r for r in ROUTES if r["id"] == route_id), ROUTES[0])
    rng = _rng("forecast", route["id"], horizon)

    tail = [p["rate"] for p in hist["series"][-45:]]
    last = tail[-1]
    short_ma = sum(tail[-10:]) / 10.0
    long_ma = sum(tail) / len(tail)
    momentum = (short_ma - long_ma) / max(long_ma, 1e-6)

    base = route["base_rate"]
    vol = route["volatility"]
    sigma_daily = base * vol * 0.055

    start = _today()
    level = last
    points = []
    for i in range(1, horizon + 1):
        date = start + timedelta(days=i)
        doy = date.timetuple().tm_yday
        anchor = base * (1 + _seasonality(doy, 0.11))

        # Momentum fades over ~3 weeks, then mean reversion dominates.
        decay = math.exp(-i / 21.0)
        level += 0.075 * (anchor - level) + momentum * base * 0.011 * decay
        level += rng.gauss(0, sigma_daily * 0.35)
        level = max(level, base * 0.55)

        sigma = sigma_daily * math.sqrt(i) * 1.9
        points.append({
            "date": date.strftime("%Y-%m-%d"),
            "forecast": round(level, 2),
            "lower": round(max(level - 1.96 * sigma, base * 0.4), 2),
            "upper": round(level + 1.96 * sigma, 2),
        })

    horizon_rate = points[-1]["forecast"]
    change_pct = (horizon_rate - last) / last * 100.0

    if change_pct > 4:
        signal, action = "RISING", "Fix tonnage now — lock forward cover before the run-up."
    elif change_pct < -4:
        signal, action = "FALLING", "Hold and buy spot — the curve rewards waiting."
    else:
        signal, action = "STABLE", "Range-bound — split the requirement across the window."

    # Best entry = cheapest forecast day inside the horizon.
    best = min(points, key=lambda p: p["forecast"])

    return {
        "route_id": route["id"],
        "route": route_label(route),
        "cargo": route["cargo"],
        "horizon_days": horizon,
        "unit": "USD/tonne",
        "current_rate": round(last, 2),
        "forecast_rate": round(horizon_rate, 2),
        "change_pct": round(change_pct, 2),
        "signal": signal,
        "recommendation": action,
        "confidence": round(max(0.58, 0.93 - horizon / 260.0 - vol * 0.7), 2),
        "model": "VORTEX-TFT v2.1 (temporal fusion, 36-month training window)",
        "best_entry": {"date": best["date"], "rate": best["forecast"]},
        "history": hist["series"][-90:],
        "points": points,
    }


# ---------------------------------------------------------------------------
# Indices
# ---------------------------------------------------------------------------

def indices_snapshot():
    """Live-ticking index board. The intraday component moves with the clock."""
    now = datetime.now(timezone.utc)
    minute_bucket = int(now.timestamp() // 300)  # refresh every 5 minutes
    out = []

    for idx in INDICES:
        rng = _rng("index", idx["code"], now.strftime("%Y-%m-%d"))
        drift = rng.uniform(-1, 1) * idx["vol"]
        value = idx["base"] * (1 + drift)

        tick_rng = _rng("tick", idx["code"], minute_bucket)
        value *= 1 + tick_rng.uniform(-0.004, 0.004)

        prev = idx["base"] * (1 + _rng("index", idx["code"],
                                       (now - timedelta(days=1)).strftime("%Y-%m-%d")
                                       ).uniform(-1, 1) * idx["vol"])
        change = value - prev

        spark = []
        for d in range(29, -1, -1):
            day = (now - timedelta(days=d)).strftime("%Y-%m-%d")
            v = idx["base"] * (1 + _rng("index", idx["code"], day).uniform(-1, 1) * idx["vol"])
            spark.append(round(v, 2))

        out.append({
            "code": idx["code"],
            "name": idx["name"],
            "unit": idx["unit"],
            "value": round(value, 2),
            "change": round(change, 2),
            "change_pct": round(change / prev * 100.0, 2),
            "sparkline": spark,
        })

    return out


# ---------------------------------------------------------------------------
# Vessel telemetry
# ---------------------------------------------------------------------------

def _interpolate(a, b, t):
    """Great-circle-ish interpolation, good enough for a position readout."""
    return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)


def _bearing(a, b):
    lat1, lon1, lat2, lon2 = map(math.radians, [a[0], a[1], b[0], b[1]])
    dlon = lon2 - lon1
    y = math.sin(dlon) * math.cos(lat2)
    x = math.cos(lat1) * math.sin(lat2) - math.sin(lat1) * math.cos(lat2) * math.cos(dlon)
    return (math.degrees(math.atan2(y, x)) + 360) % 360


def active_vessels(count=14):
    """
    A live fleet. Each vessel owns a fixed route and speed; its progress along
    the leg is driven by wall-clock time so positions genuinely advance.
    """
    now = datetime.now(timezone.utc)
    fleet = []

    for i in range(count):
        rng = _rng("vessel", i)
        route = ROUTES[i % len(ROUTES)]
        klass = VESSEL_CLASSES[rng.randrange(len(VESSEL_CLASSES))]

        origin = ALL_PORTS_BY_CODE[route["origin"]]
        dest = ALL_PORTS_BY_CODE[route["destination"]]
        speed = round(klass["ref_speed_kn"] + rng.uniform(-1.8, 1.2), 1)
        leg_hours = route["distance_nm"] / speed

        # Voyage clock: each vessel started at a stable offset in the past and
        # loops the leg, so the fleet is always spread across its passage.
        offset_h = rng.uniform(0, leg_hours)
        elapsed_h = (now.timestamp() / 3600.0 + offset_h) % (leg_hours * 1.35)

        if elapsed_h >= leg_hours:
            status = "At Berth"
            progress = 1.0
            eta = now + timedelta(hours=rng.uniform(4, 40))
        else:
            progress = elapsed_h / leg_hours
            status = "Underway"
            eta = now + timedelta(hours=leg_hours - elapsed_h)

        a = (origin["lat"], origin["lon"])
        b = (dest["lat"], dest["lon"])
        lat, lon = _interpolate(a, b, progress)
        # Nudge off the straight line so tracks do not look like rulers.
        lat += math.sin(progress * math.pi) * rng.uniform(-2.4, 2.4)

        cargo_t = int(klass["dwt"] * rng.uniform(0.88, 0.97) / 1000) * 1000
        laden_cons = klass["laden_cons_tpd"] * (speed / klass["ref_speed_kn"]) ** 3

        fleet.append({
            "id": f"VTX-{4100 + i}",
            "imo": f"9{rng.randrange(100000, 999999)}",
            "name": VESSEL_NAMES[i % len(VESSEL_NAMES)],
            "vessel_class": klass["name"],
            "class_id": klass["id"],
            "dwt": klass["dwt"],
            "cargo": route["cargo"],
            "cargo_t": cargo_t,
            "origin": origin["name"],
            "origin_code": route["origin"],
            "destination": dest["name"],
            "destination_code": route["destination"],
            "route_id": route["id"],
            "status": status,
            "progress_pct": round(progress * 100, 1),
            "lat": round(lat, 4),
            "lon": round(lon, 4),
            "course_deg": round(_bearing(a, b), 1),
            "speed_kn": speed,
            "draft_m": round(klass["draft_m"] * rng.uniform(0.93, 1.0), 1),
            "fuel_tpd": round(laden_cons + klass["aux_cons_tpd"], 1),
            "eta": eta.strftime("%Y-%m-%d %H:%M UTC"),
            "eta_days": round(max((eta - now).total_seconds() / 86400.0, 0), 1),
            "charter_rate_usd_day": klass["hire_usd_per_day"] + int(rng.uniform(-1400, 1900)),
            "delay_risk": round(min(0.95, dest.get("congestion_index", 0.4) * rng.uniform(0.7, 1.5)), 2),
        })

    return fleet


# ---------------------------------------------------------------------------
# Port congestion, berth schedules, KPIs
# ---------------------------------------------------------------------------

def port_congestion():
    """Current queue depth and waiting time per east coast port."""
    now = datetime.now(timezone.utc)
    out = []
    for p in PORTS:
        rng = _rng("congestion", p["code"], now.strftime("%Y-%m-%d-%H"))
        queue = max(0, int(p["congestion_index"] * 18 + rng.gauss(0, 2.4)))
        wait = round(max(0.2, p["congestion_index"] * 6.5 + rng.gauss(0, 0.8)), 1)
        occupancy = min(0.99, p["congestion_index"] * 0.8 + rng.uniform(0.28, 0.46))

        if wait > 3.5:
            level = "critical"
        elif wait > 2.0:
            level = "elevated"
        else:
            level = "clear"

        out.append({
            "code": p["code"],
            "port": p["name"],
            "short": p["short"],
            "state": p["state"],
            "lat": p["lat"],
            "lon": p["lon"],
            "vessels_waiting": queue,
            "avg_wait_days": wait,
            "avg_dwell_days": round(p["avg_dwell_days"] + rng.uniform(-0.4, 0.6), 1),
            "berth_occupancy": round(occupancy, 2),
            "berths": p["berths"],
            "handling_rate_tpd": p["handling_rate_tpd"],
            "congestion_level": level,
        })
    return out


def berth_schedule(port_code, days=10):
    """
    Forward berth window plan for a port. Each berth is a row; slots are
    allocated sequentially with realistic gaps so windows can be read off.
    """
    port = next((p for p in PORTS if p["code"] == port_code), PORTS[0])
    rng = _rng("berths", port["code"], _today().strftime("%Y-%m-%d"))
    start = _today()
    rows = []

    for b in range(port["berths"]):
        cursor = start + timedelta(hours=rng.uniform(0, 26))
        slots = []
        while cursor < start + timedelta(days=days):
            klass = VESSEL_CLASSES[rng.randrange(len(VESSEL_CLASSES))]
            if klass["draft_m"] > port["max_draft_m"] or klass["loa_m"] > port["max_loa_m"]:
                klass = VESSEL_CLASSES[0]
            parcel = int(klass["dwt"] * rng.uniform(0.8, 0.96))
            hours = parcel / port["handling_rate_tpd"] * 24 + rng.uniform(6, 14)
            end = cursor + timedelta(hours=hours)
            slots.append({
                "vessel": VESSEL_NAMES[rng.randrange(len(VESSEL_NAMES))],
                "vessel_class": klass["name"],
                "cargo": port["cargoes"][rng.randrange(len(port["cargoes"]))],
                "parcel_t": parcel,
                "start": cursor.strftime("%Y-%m-%d %H:%M"),
                "end": end.strftime("%Y-%m-%d %H:%M"),
                "start_offset_h": round((cursor - start).total_seconds() / 3600.0, 1),
                "duration_h": round(hours, 1),
                "status": "confirmed" if rng.random() > 0.28 else "provisional",
            })
            cursor = end + timedelta(hours=rng.uniform(3, 20))

        # First free window on this berth = end of the last slot.
        free_from = slots[-1]["end"] if slots else start.strftime("%Y-%m-%d %H:%M")
        rows.append({
            "berth": f"{port['short'][:3].upper()}-{b + 1}",
            "max_draft_m": round(port["max_draft_m"] - rng.uniform(0, 1.4), 1),
            "crane_count": max(1, port["cranes"] // port["berths"] + (1 if b == 0 else 0)),
            "slots": slots,
            "next_free": free_from,
        })

    return {
        "port": port["name"],
        "code": port["code"],
        "window_days": days,
        "window_start": start.strftime("%Y-%m-%d"),
        "handling_rate_tpd": port["handling_rate_tpd"],
        "constraints": {
            "max_draft_m": port["max_draft_m"],
            "max_loa_m": port["max_loa_m"],
            "max_beam_m": port["max_beam_m"],
        },
        "berths": rows,
    }


def kpi_snapshot():
    """Top-of-dashboard KPI tiles with 14-day sparkline context."""
    now = datetime.now(timezone.utc)
    fleet = active_vessels()
    congestion = port_congestion()
    idx = {i["code"]: i for i in indices_snapshot()}

    underway = [v for v in fleet if v["status"] == "Underway"]
    avg_dwell = sum(c["avg_dwell_days"] for c in congestion) / len(congestion)
    waiting = sum(c["vessels_waiting"] for c in congestion)
    tonnage = sum(v["cargo_t"] for v in fleet)

    rng = _rng("kpi", now.strftime("%Y-%m-%d-%H"))
    landed_delta = round(rng.uniform(-6.4, 4.1), 2)

    def spark(key, base, vol):
        return [round(base * (1 + _rng(key, (now - timedelta(days=d)).strftime("%Y-%m-%d")
                                       ).uniform(-vol, vol)), 2) for d in range(13, -1, -1)]

    bdi = idx["BDI"]
    return [
        {
            "id": "bdi",
            "label": "Baltic Dry Index",
            "value": bdi["value"],
            "unit": "pts",
            "change_pct": bdi["change_pct"],
            "hint": "Composite dry bulk freight benchmark",
            "sparkline": bdi["sparkline"][-14:],
            "tone": "up" if bdi["change_pct"] >= 0 else "down",
        },
        {
            "id": "vessels",
            "label": "Active Vessels in Transit",
            "value": len(underway),
            "unit": f"of {len(fleet)} chartered",
            "change_pct": round(rng.uniform(-8, 12), 1),
            "hint": f"{tonnage:,} t of cargo on the water",
            "sparkline": spark("vessels", len(underway), 0.18),
            "tone": "up",
        },
        {
            "id": "dwell",
            "label": "Avg Port Dwell Time",
            "value": round(avg_dwell, 1),
            "unit": "days",
            "change_pct": round(rng.uniform(-9, 7), 1),
            "hint": f"{waiting} vessels currently in the queue",
            "sparkline": spark("dwell", avg_dwell, 0.12),
            "tone": "down" if avg_dwell < 4 else "up",
        },
        {
            "id": "landed",
            "label": "Landed Cost Delta",
            "value": landed_delta,
            "unit": "% vs 90-day mean",
            "change_pct": landed_delta,
            "hint": "Blended CIF cost across all active lanes",
            "sparkline": spark("landed", 100 + landed_delta, 0.03),
            "tone": "down" if landed_delta < 0 else "up",
        },
        {
            "id": "bunker",
            "label": "VLSFO Bunker (Singapore)",
            "value": idx["VLSFO"]["value"],
            "unit": "USD/mt",
            "change_pct": idx["VLSFO"]["change_pct"],
            "hint": "Drives the speed/consumption trade-off",
            "sparkline": idx["VLSFO"]["sparkline"][-14:],
            "tone": "up" if idx["VLSFO"]["change_pct"] >= 0 else "down",
        },
        {
            "id": "idle",
            "label": "Fleet Idle Time",
            "value": round(rng.uniform(4.2, 9.6), 1),
            "unit": "% of charter days",
            "change_pct": round(rng.uniform(-14, 6), 1),
            "hint": "Waiting-for-berth plus ballast deadheading",
            "sparkline": spark("idle", 7.0, 0.16),
            "tone": "down",
        },
    ]


def rate_matrix():
    """Every lane with its current rate, 30-day move and forecast direction."""
    rows = []
    for r in ROUTES:
        hist = freight_history(r["id"])["series"]
        now_rate = hist[-1]["rate"]
        month_ago = hist[-31]["rate"]
        fc = freight_forecast(r["id"], 30)
        rows.append({
            "route_id": r["id"],
            "route": route_label(r),
            "origin": r["origin"],
            "destination": r["destination"],
            "cargo": r["cargo"],
            "distance_nm": r["distance_nm"],
            "rate": now_rate,
            "change_30d_pct": round((now_rate - month_ago) / month_ago * 100, 2),
            "forecast_30d": fc["forecast_rate"],
            "signal": fc["signal"],
            "confidence": fc["confidence"],
        })
    return rows


def bunker_price():
    return round(BUNKER_PRICE_USD_PER_T * (1 + _rng(
        "bunker", _today().strftime("%Y-%m-%d")).uniform(-0.05, 0.05)), 2)
