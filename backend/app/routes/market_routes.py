"""Freight indices, rate history and the forecasting endpoints."""

from flask import Blueprint, jsonify, request

from ..domain import ROUTES, route_label
from ..services import engine, mockdata

market_bp = Blueprint("market", __name__, url_prefix="/api")


@market_bp.get("/indices")
def indices():
    return jsonify({"indices": mockdata.indices_snapshot(),
                    "bunker_usd_per_t": mockdata.bunker_price()})


@market_bp.get("/kpis")
def kpis():
    return jsonify({"kpis": mockdata.kpi_snapshot()})


@market_bp.get("/routes")
def routes():
    return jsonify({"routes": [
        {**r, "label": route_label(r)} for r in ROUTES
    ]})


@market_bp.get("/freight/history")
def history():
    route_id = request.args.get("route", ROUTES[0]["id"])
    days = request.args.get("days", default=365, type=int)
    return jsonify(mockdata.freight_history(route_id, max(30, min(days, 365))))


@market_bp.get("/freight/forecast")
def forecast():
    route_id = request.args.get("route", ROUTES[0]["id"])
    horizon = request.args.get("horizon", default=30, type=int)
    return jsonify(mockdata.freight_forecast(route_id, horizon))


@market_bp.get("/freight/matrix")
def matrix():
    return jsonify({"rows": mockdata.rate_matrix()})


@market_bp.get("/freight/timing")
def timing():
    route_id = request.args.get("route", ROUTES[0]["id"])
    horizon = request.args.get("horizon", default=60, type=int)
    return jsonify(engine.market_timing(route_id, horizon))
