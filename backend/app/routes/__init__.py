"""Blueprint registry."""

from .auth_routes import auth_bp
from .market_routes import market_bp
from .ops_routes import ops_bp
from .optimize_routes import optimize_bp

BLUEPRINTS = (auth_bp, market_bp, ops_bp, optimize_bp)
