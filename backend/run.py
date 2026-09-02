"""
VORTEX backend entry point.

    python run.py            # http://localhost:5000

macOS note: Control Center's AirPlay Receiver also listens on 5000. If the port
is busy, run on another one and point the frontend at it:

    PORT=5050 python run.py
    VITE_API_URL=http://localhost:5050 npm run dev
"""

import socket
import sys

from app import config, create_app
from app.db import db_status

app = create_app()


def _port_is_free(host, port):
    """True when nothing is already listening on the port."""
    target = "127.0.0.1" if host in ("0.0.0.0", "") else host
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(0.4)
        # A successful connect means somebody else already owns the port.
        return sock.connect_ex((target, port)) != 0


if __name__ == "__main__":
    status = db_status()
    print("=" * 68)
    print("  VORTEX API  |  SIH26006  |  East Coast Freight Intelligence")
    print("=" * 68)

    if not _port_is_free(config.HOST, config.PORT):
        print(f"  Port {config.PORT} is already in use.")
        if config.PORT == 5000 and sys.platform == "darwin":
            print("  On macOS this is usually Control Center's AirPlay Receiver.")
            print("  Either turn it off in System Settings > General > AirDrop & Handoff,")
            print("  or start on another port:")
        else:
            print("  Start on another port:")
        print("      PORT=5050 python run.py")
        print("  and point the frontend at it:")
        print("      VITE_API_URL=http://localhost:5050 npm run dev")
        print("=" * 68)
        sys.exit(1)

    print(f"  Listening on : http://localhost:{config.PORT}")
    print(f"  Storage      : {status['backend']} — {status['detail']}")
    print(f"  Health check : http://localhost:{config.PORT}/api/health")
    print("=" * 68)
    app.run(host=config.HOST, port=config.PORT, debug=config.DEBUG)
