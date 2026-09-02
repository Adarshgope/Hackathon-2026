"""
VORTEX static domain reference data.

Everything here is real-world-shaped reference data for dry-bulk chartering on
the Indian East Coast: port physical constraints, vessel class envelopes and the
principal import trade lanes feeding those ports.
"""

# ---------------------------------------------------------------------------
# East Coast Indian ports (discharge side) + notable load ports.
# draft/loa/beam are the governing berth constraints used by the feasibility
# engine. dwell is the historic average port stay in days.
# ---------------------------------------------------------------------------

PORTS = [
    {
        "code": "INVTZ", "name": "Visakhapatnam", "short": "Vizag",
        "state": "Andhra Pradesh", "lat": 17.6868, "lon": 83.2185,
        "role": "discharge", "max_draft_m": 18.1, "max_loa_m": 340.0, "max_beam_m": 55.0,
        "berths": 8, "cranes": 14, "avg_dwell_days": 3.4, "congestion_index": 0.38,
        "handling_rate_tpd": 42000, "port_charges_usd_per_t": 4.10,
        "cargoes": ["Coking Coal", "Thermal Coal", "Iron Ore", "Limestone", "Fertilizer"],
        "notes": "Deepest draft on the east coast; only port that takes fully laden Capesize.",
    },
    {
        "code": "INPRT", "name": "Paradip", "short": "Paradip",
        "state": "Odisha", "lat": 20.2648, "lon": 86.6947,
        "role": "discharge", "max_draft_m": 17.1, "max_loa_m": 330.0, "max_beam_m": 50.0,
        "berths": 7, "cranes": 11, "avg_dwell_days": 3.9, "congestion_index": 0.46,
        "handling_rate_tpd": 38000, "port_charges_usd_per_t": 3.85,
        "cargoes": ["Thermal Coal", "Coking Coal", "Iron Ore", "Fertilizer"],
        "notes": "Highest throughput major port; mechanised coal handling plant.",
    },
    {
        "code": "INHAL", "name": "Haldia", "short": "Haldia",
        "state": "West Bengal", "lat": 22.0333, "lon": 88.0833,
        "role": "discharge", "max_draft_m": 8.5, "max_loa_m": 250.0, "max_beam_m": 40.0,
        "berths": 6, "cranes": 8, "avg_dwell_days": 5.2, "congestion_index": 0.61,
        "handling_rate_tpd": 18000, "port_charges_usd_per_t": 5.20,
        "cargoes": ["Coking Coal", "Thermal Coal", "Fertilizer", "Steel"],
        "notes": "Riverine draft limit forces lightering; Supramax is the practical ceiling.",
    },
    {
        "code": "INMAA", "name": "Chennai", "short": "Chennai",
        "state": "Tamil Nadu", "lat": 13.0827, "lon": 80.2707,
        "role": "discharge", "max_draft_m": 16.5, "max_loa_m": 320.0, "max_beam_m": 48.0,
        "berths": 9, "cranes": 16, "avg_dwell_days": 3.1, "congestion_index": 0.42,
        "handling_rate_tpd": 34000, "port_charges_usd_per_t": 4.75,
        "cargoes": ["Thermal Coal", "Limestone", "Fertilizer", "Containers"],
        "notes": "Diversified cargo mix; coal berths compete with container windows.",
    },
    {
        "code": "INCCU", "name": "Kolkata", "short": "Kolkata",
        "state": "West Bengal", "lat": 22.5726, "lon": 88.3639,
        "role": "discharge", "max_draft_m": 7.6, "max_loa_m": 220.0, "max_beam_m": 32.0,
        "berths": 5, "cranes": 6, "avg_dwell_days": 6.1, "congestion_index": 0.68,
        "handling_rate_tpd": 11000, "port_charges_usd_per_t": 6.40,
        "cargoes": ["Fertilizer", "Steel", "Project Cargo"],
        "notes": "Tidal window dependent; Handysize only, longest dwell on the coast.",
    },
    {
        "code": "INKRI", "name": "Krishnapatnam", "short": "Krishnapatnam",
        "state": "Andhra Pradesh", "lat": 14.2500, "lon": 80.1167,
        "role": "discharge", "max_draft_m": 18.5, "max_loa_m": 340.0, "max_beam_m": 55.0,
        "berths": 6, "cranes": 12, "avg_dwell_days": 2.6, "congestion_index": 0.29,
        "handling_rate_tpd": 46000, "port_charges_usd_per_t": 3.60,
        "cargoes": ["Thermal Coal", "Iron Ore", "Limestone"],
        "notes": "Private port, fastest turnaround and lowest congestion on the coast.",
    },
    {
        "code": "INGGV", "name": "Gangavaram", "short": "Gangavaram",
        "state": "Andhra Pradesh", "lat": 17.6167, "lon": 83.2333,
        "role": "discharge", "max_draft_m": 19.0, "max_loa_m": 350.0, "max_beam_m": 57.0,
        "berths": 5, "cranes": 9, "avg_dwell_days": 2.8, "congestion_index": 0.31,
        "handling_rate_tpd": 44000, "port_charges_usd_per_t": 3.95,
        "cargoes": ["Coking Coal", "Iron Ore", "Thermal Coal", "Limestone"],
        "notes": "All-weather deepwater port; handles fully laden Capesize year round.",
    },
    {
        "code": "INKAK", "name": "Kakinada", "short": "Kakinada",
        "state": "Andhra Pradesh", "lat": 16.9891, "lon": 82.2475,
        "role": "discharge", "max_draft_m": 12.5, "max_loa_m": 250.0, "max_beam_m": 40.0,
        "berths": 4, "cranes": 5, "avg_dwell_days": 4.3, "congestion_index": 0.49,
        "handling_rate_tpd": 16000, "port_charges_usd_per_t": 5.05,
        "cargoes": ["Fertilizer", "Agri Bulk", "Thermal Coal"],
        "notes": "Agri-bulk and fertiliser focus; seasonal congestion around Rabi sowing.",
    },
    {
        "code": "INENR", "name": "Kamarajar (Ennore)", "short": "Ennore",
        "state": "Tamil Nadu", "lat": 13.2500, "lon": 80.3333,
        "role": "discharge", "max_draft_m": 16.0, "max_loa_m": 300.0, "max_beam_m": 47.0,
        "berths": 5, "cranes": 10, "avg_dwell_days": 3.0, "congestion_index": 0.35,
        "handling_rate_tpd": 36000, "port_charges_usd_per_t": 4.30,
        "cargoes": ["Thermal Coal", "Limestone", "LNG"],
        "notes": "Dedicated coal terminal serving Tamil Nadu power generation.",
    },
    {
        "code": "INTUT", "name": "Tuticorin (V.O. Chidambaranar)", "short": "Tuticorin",
        "state": "Tamil Nadu", "lat": 8.7642, "lon": 78.1348,
        "role": "discharge", "max_draft_m": 14.2, "max_loa_m": 285.0, "max_beam_m": 45.0,
        "berths": 6, "cranes": 9, "avg_dwell_days": 3.6, "congestion_index": 0.40,
        "handling_rate_tpd": 24000, "port_charges_usd_per_t": 4.55,
        "cargoes": ["Thermal Coal", "Fertilizer", "Agri Bulk", "Containers"],
        "notes": "Southern gateway; Panamax ceiling on the coal berths.",
    },
]

LOAD_PORTS = [
    {"code": "AUPHE", "name": "Port Hedland", "country": "Australia", "lat": -20.31, "lon": 118.58,
     "cargoes": ["Iron Ore"], "max_draft_m": 19.5},
    {"code": "AUHPT", "name": "Hay Point", "country": "Australia", "lat": -21.28, "lon": 149.30,
     "cargoes": ["Coking Coal"], "max_draft_m": 19.4},
    {"code": "AUNTL", "name": "Newcastle", "country": "Australia", "lat": -32.92, "lon": 151.78,
     "cargoes": ["Thermal Coal"], "max_draft_m": 17.0},
    {"code": "ZARIB", "name": "Richards Bay", "country": "South Africa", "lat": -28.80, "lon": 32.09,
     "cargoes": ["Thermal Coal"], "max_draft_m": 17.5},
    {"code": "IDTAB", "name": "Taboneo", "country": "Indonesia", "lat": -3.60, "lon": 114.45,
     "cargoes": ["Thermal Coal"], "max_draft_m": 15.0},
    {"code": "IDSAM", "name": "Samarinda", "country": "Indonesia", "lat": -0.50, "lon": 117.15,
     "cargoes": ["Thermal Coal"], "max_draft_m": 12.0},
    {"code": "BRTUB", "name": "Tubarao", "country": "Brazil", "lat": -20.28, "lon": -40.24,
     "cargoes": ["Iron Ore"], "max_draft_m": 20.0},
    {"code": "USHAM", "name": "Hampton Roads", "country": "USA", "lat": 36.92, "lon": -76.33,
     "cargoes": ["Coking Coal"], "max_draft_m": 15.0},
    {"code": "AEJEA", "name": "Jebel Ali", "country": "UAE", "lat": 25.01, "lon": 55.06,
     "cargoes": ["Fertilizer", "Limestone"], "max_draft_m": 17.0},
    {"code": "OMSOH", "name": "Sohar", "country": "Oman", "lat": 24.50, "lon": 56.62,
     "cargoes": ["Limestone", "Fertilizer"], "max_draft_m": 18.0},
]

# ---------------------------------------------------------------------------
# Vessel classes. dwt/draft/loa/beam are class-typical; consumption is at the
# reference (design) speed and scales with the cube of speed in the optimiser.
# ---------------------------------------------------------------------------

VESSEL_CLASSES = [
    {
        "id": "handysize", "name": "Handysize", "dwt": 32000, "draft_m": 9.8,
        "loa_m": 180.0, "beam_m": 28.0, "ref_speed_kn": 12.5,
        "ballast_cons_tpd": 17.0, "laden_cons_tpd": 20.0, "aux_cons_tpd": 2.4,
        "hire_usd_per_day": 11800, "gearless": False,
        "note": "Geared, tidal-port friendly. The only class Kolkata can take.",
    },
    {
        "id": "handymax", "name": "Handymax", "dwt": 47000, "draft_m": 11.3,
        "loa_m": 190.0, "beam_m": 32.2, "ref_speed_kn": 13.0,
        "ballast_cons_tpd": 21.0, "laden_cons_tpd": 25.0, "aux_cons_tpd": 2.8,
        "hire_usd_per_day": 13600, "gearless": False,
        "note": "Geared workhorse for fertiliser and agri-bulk parcels.",
    },
    {
        "id": "supramax", "name": "Supramax", "dwt": 58000, "draft_m": 12.8,
        "loa_m": 200.0, "beam_m": 32.3, "ref_speed_kn": 13.5,
        "ballast_cons_tpd": 24.0, "laden_cons_tpd": 28.5, "aux_cons_tpd": 3.0,
        "hire_usd_per_day": 15200, "gearless": False,
        "note": "Best fit for Haldia and Kakinada draft envelopes.",
    },
    {
        "id": "panamax", "name": "Panamax", "dwt": 76000, "draft_m": 14.0,
        "loa_m": 225.0, "beam_m": 32.3, "ref_speed_kn": 14.0,
        "ballast_cons_tpd": 29.0, "laden_cons_tpd": 34.0, "aux_cons_tpd": 3.4,
        "hire_usd_per_day": 17400, "gearless": True,
        "note": "Standard thermal coal carrier on the Indonesia-East Coast lane.",
    },
    {
        "id": "kamsarmax", "name": "Kamsarmax", "dwt": 82000, "draft_m": 14.4,
        "loa_m": 229.0, "beam_m": 32.3, "ref_speed_kn": 14.0,
        "ballast_cons_tpd": 30.0, "laden_cons_tpd": 35.5, "aux_cons_tpd": 3.5,
        "hire_usd_per_day": 18600, "gearless": True,
        "note": "Marginal scale gain over Panamax at near-identical port cost.",
    },
    {
        "id": "postpanamax", "name": "Post-Panamax", "dwt": 98000, "draft_m": 15.4,
        "loa_m": 250.0, "beam_m": 43.0, "ref_speed_kn": 14.2,
        "ballast_cons_tpd": 34.0, "laden_cons_tpd": 40.0, "aux_cons_tpd": 3.8,
        "hire_usd_per_day": 21500, "gearless": True,
        "note": "Fits Vizag, Gangavaram, Krishnapatnam and Chennai only.",
    },
    {
        "id": "capesize", "name": "Capesize", "dwt": 180000, "draft_m": 18.2,
        "loa_m": 292.0, "beam_m": 45.0, "ref_speed_kn": 14.5,
        "ballast_cons_tpd": 45.0, "laden_cons_tpd": 56.0, "aux_cons_tpd": 5.0,
        "hire_usd_per_day": 28900, "gearless": True,
        "note": "Lowest $/tonne on long haul but only three east coast ports accept her.",
    },
]

# ---------------------------------------------------------------------------
# Trade lanes. distance_nm is the routed great-circle sea distance (Suez/Cape
# routings already reflected). base_rate is the long-run mean freight in USD/t.
# ---------------------------------------------------------------------------

ROUTES = [
    {"id": "IDTAB-INVTZ", "origin": "IDTAB", "destination": "INVTZ", "distance_nm": 2480,
     "cargo": "Thermal Coal", "base_rate": 12.40, "volatility": 0.16},
    {"id": "IDTAB-INPRT", "origin": "IDTAB", "destination": "INPRT", "distance_nm": 2610,
     "cargo": "Thermal Coal", "base_rate": 13.10, "volatility": 0.17},
    {"id": "IDTAB-INENR", "origin": "IDTAB", "destination": "INENR", "distance_nm": 2290,
     "cargo": "Thermal Coal", "base_rate": 11.85, "volatility": 0.15},
    {"id": "AUNTL-INVTZ", "origin": "AUNTL", "destination": "INVTZ", "distance_nm": 5840,
     "cargo": "Thermal Coal", "base_rate": 21.60, "volatility": 0.21},
    {"id": "AUHPT-INGGV", "origin": "AUHPT", "destination": "INGGV", "distance_nm": 5320,
     "cargo": "Coking Coal", "base_rate": 19.75, "volatility": 0.22},
    {"id": "AUHPT-INPRT", "origin": "AUHPT", "destination": "INPRT", "distance_nm": 5460,
     "cargo": "Coking Coal", "base_rate": 20.40, "volatility": 0.23},
    {"id": "ZARIB-INVTZ", "origin": "ZARIB", "destination": "INVTZ", "distance_nm": 4180,
     "cargo": "Thermal Coal", "base_rate": 17.30, "volatility": 0.19},
    {"id": "ZARIB-INMAA", "origin": "ZARIB", "destination": "INMAA", "distance_nm": 3960,
     "cargo": "Thermal Coal", "base_rate": 16.55, "volatility": 0.18},
    {"id": "BRTUB-INGGV", "origin": "BRTUB", "destination": "INGGV", "distance_nm": 8420,
     "cargo": "Iron Ore", "base_rate": 26.90, "volatility": 0.27},
    {"id": "USHAM-INHAL", "origin": "USHAM", "destination": "INHAL", "distance_nm": 9150,
     "cargo": "Coking Coal", "base_rate": 34.20, "volatility": 0.29},
    {"id": "AUPHE-INKRI", "origin": "AUPHE", "destination": "INKRI", "distance_nm": 3510,
     "cargo": "Iron Ore", "base_rate": 14.80, "volatility": 0.20},
    {"id": "AEJEA-INKAK", "origin": "AEJEA", "destination": "INKAK", "distance_nm": 1980,
     "cargo": "Fertilizer", "base_rate": 15.20, "volatility": 0.14},
    {"id": "OMSOH-INTUT", "origin": "OMSOH", "destination": "INTUT", "distance_nm": 1740,
     "cargo": "Limestone", "base_rate": 13.65, "volatility": 0.13},
    {"id": "IDSAM-INCCU", "origin": "IDSAM", "destination": "INCCU", "distance_nm": 2870,
     "cargo": "Thermal Coal", "base_rate": 18.90, "volatility": 0.24},
]

# Baltic-style indices tracked on the dashboard.
INDICES = [
    {"code": "BDI", "name": "Baltic Dry Index", "base": 1685, "unit": "pts", "vol": 0.019},
    {"code": "BCI", "name": "Baltic Capesize Index", "base": 2410, "unit": "pts", "vol": 0.028},
    {"code": "BPI", "name": "Baltic Panamax Index", "base": 1520, "unit": "pts", "vol": 0.017},
    {"code": "BSI", "name": "Baltic Supramax Index", "base": 1180, "unit": "pts", "vol": 0.014},
    {"code": "BHSI", "name": "Baltic Handysize Index", "base": 690, "unit": "pts", "vol": 0.012},
    {"code": "VLSFO", "name": "VLSFO Singapore Bunker", "base": 612, "unit": "USD/mt", "vol": 0.011},
]

BUNKER_PRICE_USD_PER_T = 612.0

VESSEL_NAMES = [
    "MV Bay Horizon", "MV Coromandel Star", "MV Odisha Trader", "MV Kalinga Spirit",
    "MV Andhra Pioneer", "MV Bengal Voyager", "MV Vizag Endeavour", "MV Deccan Carrier",
    "MV Godavari Belle", "MV Mahanadi Pride", "MV Krishna Navigator", "MV Coastal Sentinel",
    "MV Sagar Vikas", "MV Konark Dawn", "MV Chilika Queen", "MV Nilgiri Ranger",
    "MV Palk Meridian", "MV Bhadrachalam", "MV Eastern Ensign", "MV Ganga Meridian",
]

PORT_BY_CODE = {p["code"]: p for p in PORTS}
LOAD_PORT_BY_CODE = {p["code"]: p for p in LOAD_PORTS}
ALL_PORTS_BY_CODE = {**LOAD_PORT_BY_CODE, **PORT_BY_CODE}
VESSEL_CLASS_BY_ID = {v["id"]: v for v in VESSEL_CLASSES}
ROUTE_BY_ID = {r["id"]: r for r in ROUTES}


def route_label(route):
    """Human readable 'Taboneo -> Visakhapatnam' for a route dict."""
    o = ALL_PORTS_BY_CODE.get(route["origin"], {}).get("name", route["origin"])
    d = ALL_PORTS_BY_CODE.get(route["destination"], {}).get("name", route["destination"])
    return f"{o} → {d}"
