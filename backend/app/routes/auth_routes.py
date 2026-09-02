"""Registration, login and session lookup."""

from flask import Blueprint, jsonify, request

from ..db import db_status
from ..services import auth

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.post("/register")
def register():
    body = request.get_json(silent=True) or {}
    email = (body.get("email") or "").strip()
    password = body.get("password") or ""
    name = (body.get("name") or "").strip()

    if not email or "@" not in email:
        return jsonify({"error": "A valid email address is required."}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters."}), 400
    if not name:
        return jsonify({"error": "Name is required."}), 400

    user, error = auth.register_user(
        email, password, name,
        company=body.get("company", ""),
        role=body.get("role", "Chartering Manager"),
    )
    if error:
        return jsonify({"error": error}), 409

    return jsonify({"user": user, "token": auth.issue_token(user["email"]),
                    "storage": db_status()["backend"]}), 201


@auth_bp.post("/login")
def login():
    body = request.get_json(silent=True) or {}
    user, error = auth.authenticate(body.get("email"), body.get("password") or "")
    if error:
        return jsonify({"error": error}), 401
    return jsonify({"user": user, "token": auth.issue_token(user["email"]),
                    "storage": db_status()["backend"]})


@auth_bp.get("/me")
def me():
    header = request.headers.get("Authorization", "")
    token = header[7:] if header.startswith("Bearer ") else header
    payload = auth.read_token(token)
    if not payload:
        return jsonify({"error": "Session expired or invalid."}), 401
    return jsonify({"email": payload["sub"], "expires_at": payload["exp"]})
