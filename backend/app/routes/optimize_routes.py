"""Voyage optimisation, port constraint checks and landed cost."""

from flask import Blueprint, jsonify, request

from ..services import engine

optimize_bp = Blueprint("optimize", __name__, url_prefix="/api")


@optimize_bp.post("/optimize/voyage")
def voyage():
    return jsonify(engine.optimize_voyage(request.get_json(silent=True) or {}))


@optimize_bp.get("/optimize/feasibility")
def feasibility():
    port = request.args.get("port", "INVTZ")
    klass = request.args.get("vessel_class", "panamax")
    result = engine.port_feasibility(port, klass)
    if not result:
        return jsonify({"error": "Unknown port or vessel class."}), 404
    return jsonify(result)


@optimize_bp.get("/optimize/constraints")
def constraints():
    return jsonify(engine.constraint_matrix())


@optimize_bp.post("/cost/landed")
def landed():
    return jsonify(engine.landed_cost(request.get_json(silent=True) or {}))
