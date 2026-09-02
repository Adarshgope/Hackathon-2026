"""Ports, live fleet telemetry, congestion and berth scheduling."""

from flask import Blueprint, jsonify, request

from ..domain import LOAD_PORTS, PORTS, VESSEL_CLASSES
from ..services import mockdata

ops_bp = Blueprint("ops", __name__, url_prefix="/api")


@ops_bp.get("/ports")
def ports():
    return jsonify({"discharge_ports": PORTS, "load_ports": LOAD_PORTS})


@ops_bp.get("/vessel-classes")
def vessel_classes():
    return jsonify({"classes": VESSEL_CLASSES})


@ops_bp.get("/vessels")
def vessels():
    count = request.args.get("count", default=14, type=int)
    fleet = mockdata.active_vessels(max(1, min(count, 30)))
    return jsonify({
        "vessels": fleet,
        "summary": {
            "total": len(fleet),
            "underway": sum(1 for v in fleet if v["status"] == "Underway"),
            "at_berth": sum(1 for v in fleet if v["status"] == "At Berth"),
            "cargo_afloat_t": sum(v["cargo_t"] for v in fleet),
        },
    })


@ops_bp.get("/congestion")
def congestion():
    return jsonify({"ports": mockdata.port_congestion()})


@ops_bp.get("/berths")
def berths():
    port = request.args.get("port", PORTS[0]["code"])
    days = request.args.get("days", default=10, type=int)
    return jsonify(mockdata.berth_schedule(port, max(3, min(days, 21))))


@ops_bp.get("/alerts")
def alerts():
    """Early risk warnings assembled from congestion and fleet delay risk."""
    out = []
    for c in mockdata.port_congestion():
        if c["congestion_level"] == "critical":
            out.append({
                "level": "critical",
                "port": c["port"],
                "title": f"Berth congestion at {c['port']}",
                "detail": f"{c['vessels_waiting']} vessels waiting, "
                          f"{c['avg_wait_days']} day average wait at "
                          f"{int(c['berth_occupancy'] * 100)}% berth occupancy.",
            })
        elif c["congestion_level"] == "elevated":
            out.append({
                "level": "warning",
                "port": c["port"],
                "title": f"Queue building at {c['port']}",
                "detail": f"Wait time up to {c['avg_wait_days']} days — "
                          f"review laycan before fixing.",
            })

    for v in mockdata.active_vessels():
        if v["delay_risk"] > 0.6 and v["status"] == "Underway":
            out.append({
                "level": "warning",
                "port": v["destination"],
                "title": f"{v['name']} at delay risk",
                "detail": f"{int(v['delay_risk'] * 100)}% probability of missing laycan at "
                          f"{v['destination']} — ETA {v['eta']}.",
            })

    order = {"critical": 0, "warning": 1, "info": 2}
    out.sort(key=lambda a: order.get(a["level"], 3))
    return jsonify({"alerts": out[:12]})
