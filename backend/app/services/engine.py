"""
VORTEX decision engines.

Three real calculations sit behind the dashboard:

  1. port_feasibility  -- can this class physically berth here, and if the draft
                          bites, how much cargo must be left behind?
  2. optimize_voyage   -- speed/consumption trade-off across the feasible speed
                          band using the cube law, priced with charter hire,
                          bunkers, port charges and demurrage exposure.
  3. landed_cost       -- CIF-to-godown cost stack including holding, demurrage
                          and stockout penalties, plus the optimal order size.
"""

import math

from ..domain import (
    ALL_PORTS_BY_CODE,
    PORT_BY_CODE,
    ROUTES,
    VESSEL_CLASSES,
    VESSEL_CLASS_BY_ID,
)
from .mockdata import bunker_price, freight_forecast, freight_history, port_congestion

# Tonnes-per-centimetre immersion. TPC grows with waterplane area, i.e. with
# dwt^(2/3); the coefficient is fitted to class-typical values -- Handysize ~38,
# Panamax ~68, Capesize ~120 t/cm.
_TPC_COEFF = 3.77


def _tpc(dwt):
    """Tonnes per centimetre of immersion for a given deadweight."""
    return _TPC_COEFF * (dwt / 1000.0) ** (2.0 / 3.0)


def _distance_nm(origin, destination):
    """Routed distance from the lane table, else great-circle + 12% routing factor."""
    for r in ROUTES:
        if r["origin"] == origin and r["destination"] == destination:
            return r["distance_nm"], r["id"]

    a = ALL_PORTS_BY_CODE.get(origin)
    b = ALL_PORTS_BY_CODE.get(destination)
    if not a or not b:
        return 3000, None

    lat1, lon1, lat2, lon2 = map(math.radians, [a["lat"], a["lon"], b["lat"], b["lon"]])
    dlat, dlon = lat2 - lat1, lon2 - lon1
    h = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    gc_nm = 2 * math.asin(math.sqrt(h)) * 3440.065
    return round(gc_nm * 1.12), None


def port_feasibility(port_code, class_id):
    """
    Physical berthing check against draft / LOA / beam, with the cargo intake
    the draft limit actually permits.
    """
    port = PORT_BY_CODE.get(port_code)
    klass = VESSEL_CLASS_BY_ID.get(class_id)
    if not port or not klass:
        return None

    # Keel clearance: 10% of draft or 1.0 m, whichever is larger.
    clearance = max(1.0, klass["draft_m"] * 0.10)
    required = klass["draft_m"] + clearance

    draft_ok = required <= port["max_draft_m"]
    loa_ok = klass["loa_m"] <= port["max_loa_m"]
    beam_ok = klass["beam_m"] <= port["max_beam_m"]

    if draft_ok:
        max_cargo = int(klass["dwt"] * 0.95)
        sacrificed = 0
    else:
        shortfall_m = required - port["max_draft_m"]
        sacrificed = int(min(klass["dwt"] * 0.95, shortfall_m * 100 * _tpc(klass["dwt"])))
        max_cargo = max(0, int(klass["dwt"] * 0.95) - sacrificed)

    blockers = []
    if not draft_ok:
        blockers.append(
            f"Draft: needs {required:.1f} m incl. under-keel clearance, "
            f"berth allows {port['max_draft_m']:.1f} m")
    if not loa_ok:
        blockers.append(f"LOA: {klass['loa_m']:.0f} m exceeds {port['max_loa_m']:.0f} m")
    if not beam_ok:
        blockers.append(f"Beam: {klass['beam_m']:.1f} m exceeds {port['max_beam_m']:.1f} m")

    # A hull that will not fit the berth box carries nothing, whatever the draft
    # derating says.
    if not (loa_ok and beam_ok):
        max_cargo = 0
        sacrificed = int(klass["dwt"] * 0.95)

    feasible = loa_ok and beam_ok and max_cargo > klass["dwt"] * 0.45

    return {
        "port": port["name"],
        "port_code": port["code"],
        "vessel_class": klass["name"],
        "class_id": klass["id"],
        "feasible": feasible,
        "draft_ok": draft_ok,
        "loa_ok": loa_ok,
        "beam_ok": beam_ok,
        "required_draft_m": round(required, 2),
        "berth_draft_m": port["max_draft_m"],
        "max_cargo_t": max_cargo,
        "cargo_sacrificed_t": sacrificed,
        "utilisation_pct": round(max_cargo / klass["dwt"] * 100, 1),
        "blockers": blockers,
        "verdict": "Clear to berth fully laden" if (feasible and draft_ok)
                   else ("Berths only part-laden" if feasible else "Cannot berth"),
    }


def constraint_matrix():
    """Every east coast port x every vessel class -- the feasibility grid."""
    return {
        "ports": [{"code": p["code"], "name": p["name"], "short": p["short"],
                   "max_draft_m": p["max_draft_m"], "max_loa_m": p["max_loa_m"],
                   "max_beam_m": p["max_beam_m"]} for p in PORT_BY_CODE.values()],
        "classes": [{"id": v["id"], "name": v["name"], "dwt": v["dwt"],
                     "draft_m": v["draft_m"], "loa_m": v["loa_m"], "beam_m": v["beam_m"]}
                    for v in VESSEL_CLASSES],
        "grid": [
            {
                "port": p["code"],
                "class": v["id"],
                **{k: port_feasibility(p["code"], v["id"])[k]
                   for k in ("feasible", "draft_ok", "max_cargo_t", "utilisation_pct", "verdict")},
            }
            for p in PORT_BY_CODE.values() for v in VESSEL_CLASSES
        ],
    }


def _voyage_at_speed(klass, distance_nm, speed_kn, cargo_t, bunker, port_days,
                     freight_rate, port_charges_per_t, laytime_days, demurrage_rate):
    """Cost of one laden passage at a given service speed."""
    sea_days = distance_nm / (speed_kn * 24.0)

    # Cube law on the propulsion component; auxiliaries are speed-independent.
    prop = klass["laden_cons_tpd"] * (speed_kn / klass["ref_speed_kn"]) ** 3
    fuel_tpd = prop + klass["aux_cons_tpd"]
    fuel_t = fuel_tpd * sea_days + klass["aux_cons_tpd"] * port_days

    fuel_cost = fuel_t * bunker
    hire_cost = klass["hire_usd_per_day"] * (sea_days + port_days)
    port_cost = cargo_t * port_charges_per_t

    # Demurrage bites whenever the port stay overruns agreed laytime.
    demurrage_days = max(0.0, port_days - laytime_days)
    demurrage_cost = demurrage_days * demurrage_rate

    total = fuel_cost + hire_cost + port_cost + demurrage_cost
    freight_revenue = cargo_t * freight_rate

    return {
        "speed_kn": round(speed_kn, 1),
        "sea_days": round(sea_days, 2),
        "total_days": round(sea_days + port_days, 2),
        "fuel_tpd": round(fuel_tpd, 1),
        "fuel_t": round(fuel_t, 1),
        "fuel_cost": round(fuel_cost),
        "hire_cost": round(hire_cost),
        "port_cost": round(port_cost),
        "demurrage_cost": round(demurrage_cost),
        "total_cost": round(total),
        "cost_per_t": round(total / cargo_t, 2) if cargo_t else 0,
        "co2_t": round(fuel_t * 3.114, 1),
        "margin_vs_freight": round(freight_revenue - total),
    }


def optimize_voyage(payload):
    """
    Full voyage optimisation: feasibility, the speed/cost curve, the optimal
    service speed, and a ranked comparison of every vessel class on the lane.
    """
    origin = payload.get("origin", "IDTAB")
    destination = payload.get("destination", "INVTZ")
    class_id = payload.get("vessel_class", "panamax")
    requested_t = int(payload.get("cargo_tonnes") or 0)
    laytime_days = float(payload.get("laytime_days", 3.0))
    demurrage_rate = float(payload.get("demurrage_rate", 18500))
    bunker = float(payload.get("bunker_price") or bunker_price())

    klass = VESSEL_CLASS_BY_ID.get(class_id, VESSEL_CLASS_BY_ID["panamax"])
    port = PORT_BY_CODE.get(destination, PORT_BY_CODE["INVTZ"])
    distance_nm, route_id = _distance_nm(origin, destination)

    feas = port_feasibility(port["code"], klass["id"])
    if feas["feasible"]:
        cargo_t = min(requested_t, feas["max_cargo_t"]) if requested_t else feas["max_cargo_t"]
        cargo_t = max(cargo_t, 1000)
    else:
        # She cannot work this berth. Price the passage on her nominal intake so
        # the curve stays readable, and let `viable` drive the UI warning.
        cargo_t = int(klass["dwt"] * 0.95)

    # Port stay = discharge time + queue wait at current congestion.
    congestion = next((c for c in port_congestion() if c["code"] == port["code"]), None)
    wait_days = congestion["avg_wait_days"] if congestion else 1.5
    discharge_days = cargo_t / port["handling_rate_tpd"]
    port_days = round(discharge_days + wait_days + 0.75, 2)  # +berthing/shifting

    rate = freight_history(route_id)["series"][-1]["rate"] if route_id else 16.0

    # Speed sweep across the class's practical band.
    lo = max(8.0, klass["ref_speed_kn"] - 4.5)
    hi = klass["ref_speed_kn"] + 1.5
    curve = []
    s = lo
    while s <= hi + 1e-6:
        curve.append(_voyage_at_speed(klass, distance_nm, s, cargo_t, bunker, port_days,
                                      rate, port["port_charges_usd_per_t"],
                                      laytime_days, demurrage_rate))
        s += 0.5

    optimal = min(curve, key=lambda c: c["cost_per_t"])
    design = min(curve, key=lambda c: abs(c["speed_kn"] - klass["ref_speed_kn"]))
    saving = design["total_cost"] - optimal["total_cost"]

    # Compare every class that can actually work the port.
    alternatives = []
    for v in VESSEL_CLASSES:
        f = port_feasibility(port["code"], v["id"])
        if not f["feasible"]:
            alternatives.append({
                "class_id": v["id"], "vessel_class": v["name"], "dwt": v["dwt"],
                "feasible": False, "reason": f["blockers"][0] if f["blockers"] else "Restricted",
                "cost_per_t": None, "cargo_t": f["max_cargo_t"],
            })
            continue
        c_t = min(requested_t, f["max_cargo_t"]) if requested_t else f["max_cargo_t"]
        c_t = max(c_t, 1000)
        p_days = round(c_t / port["handling_rate_tpd"] + wait_days + 0.75, 2)
        band = [_voyage_at_speed(v, distance_nm, sp, c_t, bunker, p_days, rate,
                                 port["port_charges_usd_per_t"], laytime_days, demurrage_rate)
                for sp in [v["ref_speed_kn"] - 2, v["ref_speed_kn"] - 1, v["ref_speed_kn"]]]
        best = min(band, key=lambda c: c["cost_per_t"])
        alternatives.append({
            "class_id": v["id"], "vessel_class": v["name"], "dwt": v["dwt"],
            "feasible": True, "reason": f["verdict"],
            "cargo_t": c_t, "cost_per_t": best["cost_per_t"],
            "total_cost": best["total_cost"], "total_days": best["total_days"],
            "optimal_speed_kn": best["speed_kn"], "voyages_per_year": round(340 / best["total_days"], 1),
        })

    ranked = sorted([a for a in alternatives if a["feasible"]], key=lambda a: a["cost_per_t"])
    for i, a in enumerate(ranked):
        a["rank"] = i + 1
    best_class = ranked[0] if ranked else None

    return {
        "origin": ALL_PORTS_BY_CODE.get(origin, {}).get("name", origin),
        "origin_code": origin,
        "destination": port["name"],
        "destination_code": port["code"],
        "route_id": route_id,
        "distance_nm": distance_nm,
        "vessel_class": klass["name"],
        "class_id": klass["id"],
        "bunker_price": bunker,
        "freight_rate": rate,
        "cargo_t": cargo_t,
        "viable": feas["feasible"],
        "feasibility": feas,
        "port_stay": {
            "discharge_days": round(discharge_days, 2),
            "queue_wait_days": wait_days,
            "total_port_days": port_days,
            "handling_rate_tpd": port["handling_rate_tpd"],
            "laytime_days": laytime_days,
            "demurrage_exposure_usd": round(max(0.0, port_days - laytime_days) * demurrage_rate),
        },
        "speed_curve": curve,
        "optimal": optimal,
        "at_design_speed": design,
        "saving_usd": round(saving),
        "saving_pct": round(saving / design["total_cost"] * 100, 2) if design["total_cost"] else 0,
        "alternatives": alternatives,
        "recommended_class": best_class,
        "insight": _voyage_insight(klass, optimal, design, saving, best_class, feas),
    }


def _voyage_insight(klass, optimal, design, saving, best_class, feas):
    lines = []
    if not feas["feasible"]:
        lines.append(
            f"{klass['name']} cannot work {feas['port']}: "
            + "; ".join(feas["blockers"]) + ". Figures below are indicative only.")
    if optimal["speed_kn"] < design["speed_kn"]:
        lines.append(
            f"Slow-steam to {optimal['speed_kn']} kn (down from {design['speed_kn']} kn): "
            f"{optimal['fuel_t'] - design['fuel_t']:+.0f} t bunkers, "
            f"${saving:,.0f} saved over the voyage.")
    else:
        lines.append(
            f"Hold {optimal['speed_kn']} kn — hire and demurrage exposure outweigh the "
            f"bunker saving from slowing down.")
    if not feas["draft_ok"]:
        lines.append(
            f"Draft restriction leaves {feas['cargo_sacrificed_t']:,} t on the quay "
            f"({feas['utilisation_pct']}% deadweight utilisation).")
    if best_class is None:
        lines.append(
            "No class in the fleet clears this berth fully laden — lighten at "
            "anchorage or route the parcel through a deeper port.")
    elif not feas["feasible"]:
        lines.append(
            f"{best_class['vessel_class']} is the largest class that can berth here: "
            f"{best_class['cargo_t']:,} t at ${best_class['cost_per_t']}/t.")
    elif best_class["class_id"] != klass["id"]:
        lines.append(
            f"{best_class['vessel_class']} lands the cargo at "
            f"${best_class['cost_per_t']}/t versus ${optimal['cost_per_t']}/t on "
            f"{klass['name']} — switch class if the parcel size allows.")
    return lines


def landed_cost(payload):
    """
    Full landed-cost stack from FOB through to the godown, with the demurrage /
    holding / stockout trade-off that decides order size.
    """
    tonnes = float(payload.get("tonnes", 60000) or 60000)
    fob = float(payload.get("fob_price", 92.0) or 0)
    freight = float(payload.get("freight_rate", 13.5) or 0)
    insurance_pct = float(payload.get("insurance_pct", 0.35) or 0)
    duty_pct = float(payload.get("duty_pct", 2.5) or 0)
    port_handling = float(payload.get("port_handling", 4.1) or 0)
    inland_per_t = float(payload.get("inland_freight", 6.8) or 0)

    holding_days = float(payload.get("holding_days", 21) or 0)
    holding_rate = float(payload.get("holding_rate", 0.085) or 0)   # USD/t/day
    interest_pct = float(payload.get("interest_pct", 8.5) or 0)     # annual, on inventory

    laytime_days = float(payload.get("laytime_days", 3.0) or 0)
    actual_port_days = float(payload.get("actual_port_days", 4.6) or 0)
    demurrage_rate = float(payload.get("demurrage_rate", 18500) or 0)
    despatch_rate = demurrage_rate / 2.0

    demand_rate_tpd = float(payload.get("demand_rate_tpd", 2600) or 1)
    stockout_penalty = float(payload.get("stockout_penalty", 145) or 0)  # USD/t short
    lead_time_days = float(payload.get("lead_time_days", 24) or 0)
    opening_stock_t = float(payload.get("opening_stock_t", 68000) or 0)

    # --- Cost stack -------------------------------------------------------
    fob_cost = tonnes * fob
    ocean_freight = tonnes * freight
    cnf = fob_cost + ocean_freight
    insurance = cnf * insurance_pct / 100.0
    cif = cnf + insurance
    duty = cif * duty_pct / 100.0
    handling = tonnes * port_handling
    inland = tonnes * inland_per_t

    # Demurrage / despatch on the charter party.
    overrun = actual_port_days - laytime_days
    if overrun > 0:
        demurrage = overrun * demurrage_rate
        despatch = 0.0
    else:
        demurrage = 0.0
        despatch = -overrun * despatch_rate

    # Godown holding: storage fee plus working-capital interest on the goods.
    storage = tonnes * holding_rate * holding_days
    goods_value = cif + duty + handling + inland
    carrying = goods_value * (interest_pct / 100.0) * (holding_days / 365.0)

    # Stockout: does the cargo land before the yard runs dry?
    cover_days = opening_stock_t / demand_rate_tpd if demand_rate_tpd else 0
    gap_days = max(0.0, lead_time_days - cover_days)
    shortfall_t = gap_days * demand_rate_tpd
    stockout = shortfall_t * stockout_penalty

    total = (fob_cost + ocean_freight + insurance + duty + handling + inland
             + demurrage - despatch + storage + carrying + stockout)
    per_tonne = total / tonnes if tonnes else 0

    breakdown = [
        {"key": "fob", "label": "FOB Cargo Value", "amount": round(fob_cost), "per_t": round(fob, 2), "group": "cargo"},
        {"key": "freight", "label": "Ocean Freight", "amount": round(ocean_freight), "per_t": round(freight, 2), "group": "voyage"},
        {"key": "insurance", "label": "Marine Insurance", "amount": round(insurance), "per_t": round(insurance / tonnes, 2) if tonnes else 0, "group": "voyage"},
        {"key": "duty", "label": "Customs Duty & Cess", "amount": round(duty), "per_t": round(duty / tonnes, 2) if tonnes else 0, "group": "statutory"},
        {"key": "handling", "label": "Port Handling & Wharfage", "amount": round(handling), "per_t": round(port_handling, 2), "group": "port"},
        {"key": "demurrage", "label": "Demurrage", "amount": round(demurrage), "per_t": round(demurrage / tonnes, 2) if tonnes else 0, "group": "port"},
        {"key": "despatch", "label": "Despatch Earned", "amount": -round(despatch), "per_t": round(-despatch / tonnes, 2) if tonnes else 0, "group": "port"},
        {"key": "inland", "label": "Inland Freight to Plant", "amount": round(inland), "per_t": round(inland_per_t, 2), "group": "inland"},
        {"key": "storage", "label": "Godown / Stockyard Holding", "amount": round(storage), "per_t": round(storage / tonnes, 2) if tonnes else 0, "group": "inventory"},
        {"key": "carrying", "label": "Working Capital Interest", "amount": round(carrying), "per_t": round(carrying / tonnes, 2) if tonnes else 0, "group": "inventory"},
        {"key": "stockout", "label": "Stockout Penalty", "amount": round(stockout), "per_t": round(stockout / tonnes, 2) if tonnes else 0, "group": "risk"},
    ]

    # --- Order-size sweep: holding vs stockout vs freight scale ------------
    sweep = []
    for size in range(20000, 200001, 10000):
        # Larger parcels earn a freight scale discount but sit longer in the yard.
        scale_discount = min(0.16, math.log(size / 20000.0 + 1) * 0.07)
        eff_freight = freight * (1 - scale_discount)
        days_held = size / demand_rate_tpd / 2.0 if demand_rate_tpd else holding_days
        s_storage = size * holding_rate * days_held
        s_value = size * (fob + eff_freight) * (1 + insurance_pct / 100.0) * (1 + duty_pct / 100.0)
        s_carrying = s_value * (interest_pct / 100.0) * (days_held / 365.0)
        s_stockout = stockout * (size / tonnes) if tonnes else 0
        s_total = (size * (fob + eff_freight + port_handling + inland_per_t)
                   + s_storage + s_carrying + s_stockout + demurrage)
        sweep.append({
            "tonnes": size,
            "cost_per_t": round(s_total / size, 2),
            "freight_per_t": round(eff_freight, 2),
            "holding_per_t": round((s_storage + s_carrying) / size, 2),
            "days_held": round(days_held, 1),
        })
    optimal_size = min(sweep, key=lambda s: s["cost_per_t"])

    alerts = []
    if demurrage > 0:
        alerts.append({
            "level": "warning",
            "text": f"Port stay overruns laytime by {overrun:.1f} days — "
                    f"${demurrage:,.0f} of demurrage at ${demurrage_rate:,.0f}/day.",
        })
    if shortfall_t > 0:
        alerts.append({
            "level": "critical",
            "text": f"Stock cover is {cover_days:.1f} days against a {lead_time_days:.0f}-day "
                    f"lead time — {shortfall_t:,.0f} t short, ${stockout:,.0f} penalty exposure.",
        })
    if storage + carrying > ocean_freight * 0.5:
        alerts.append({
            "level": "warning",
            "text": "Inventory cost is over half the ocean freight — the parcel is too "
                    "large for the offtake rate.",
        })
    if optimal_size["tonnes"] != int(round(tonnes / 10000) * 10000):
        alerts.append({
            "level": "info",
            "text": f"Cost-optimal parcel is {optimal_size['tonnes']:,} t at "
                    f"${optimal_size['cost_per_t']}/t "
                    f"(${per_tonne - optimal_size['cost_per_t']:+.2f}/t versus this plan).",
        })

    return {
        "tonnes": tonnes,
        "total_cost": round(total),
        "cost_per_tonne": round(per_tonne, 2),
        "cif_per_tonne": round(cif / tonnes, 2) if tonnes else 0,
        "breakdown": breakdown,
        "groups": _group_totals(breakdown),
        "inventory": {
            "cover_days": round(cover_days, 1),
            "lead_time_days": lead_time_days,
            "shortfall_t": round(shortfall_t),
            "holding_days": holding_days,
            "demand_rate_tpd": demand_rate_tpd,
        },
        "order_sweep": sweep,
        "optimal_order": optimal_size,
        "alerts": alerts,
    }


def _group_totals(breakdown):
    groups = {}
    for row in breakdown:
        groups.setdefault(row["group"], 0)
        groups[row["group"]] += row["amount"]
    labels = {"cargo": "Cargo", "voyage": "Voyage", "statutory": "Duties",
              "port": "Port", "inland": "Inland", "inventory": "Inventory", "risk": "Risk"}
    return [{"key": k, "label": labels.get(k, k.title()), "amount": v}
            for k, v in groups.items() if v]


def market_timing(route_id, horizon=60):
    """
    Turns the forecast into a procurement calendar: which weeks to fix tonnage
    and which to sit out.
    """
    fc = freight_forecast(route_id, horizon)
    points = fc["points"]
    week_buckets = []
    for i in range(0, len(points), 7):
        chunk = points[i:i + 7]
        if not chunk:
            continue
        avg = sum(p["forecast"] for p in chunk) / len(chunk)
        week_buckets.append({
            "week": i // 7 + 1,
            "start": chunk[0]["date"],
            "end": chunk[-1]["date"],
            "avg_rate": round(avg, 2),
        })

    if not week_buckets:
        return {**fc, "weeks": []}

    cheapest = min(w["avg_rate"] for w in week_buckets)
    dearest = max(w["avg_rate"] for w in week_buckets)
    span = max(dearest - cheapest, 1e-6)
    for w in week_buckets:
        score = 1 - (w["avg_rate"] - cheapest) / span
        w["score"] = round(score, 2)
        w["action"] = "FIX" if score > 0.72 else ("WATCH" if score > 0.38 else "AVOID")

    return {**fc, "weeks": week_buckets}
