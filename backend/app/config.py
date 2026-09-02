"""VORTEX backend configuration."""

import os

# ---------------------------------------------------------------------------
# Paste your MongoDB Atlas connection string here (or export MONGO_URI).
# Example: "mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority"
# Left intentionally empty: with no URI the app runs on an in-memory store, so
# the whole platform is demo-ready without a database.
# ---------------------------------------------------------------------------
MONGO_URI = os.environ.get("MONGO_URI", "")

MONGO_DB_NAME = os.environ.get("MONGO_DB_NAME", "vortex")

PORT = int(os.environ.get("PORT", 5000))
HOST = os.environ.get("HOST", "0.0.0.0")
DEBUG = os.environ.get("FLASK_DEBUG", "1") == "1"

SECRET_KEY = os.environ.get("SECRET_KEY", "vortex-sih26006-dev-secret")
TOKEN_TTL_HOURS = 12

CORS_ORIGINS = os.environ.get(
    "CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173",
).split(",")
