"""Dashboard HTTP server for batch transcription monitoring.

Serves the dashboard HTML and status JSON on a local port.
Runs as a daemon thread that dies with the main process.
"""

from __future__ import annotations

import shutil
import socket
import threading
from functools import partial
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

ASSETS_DIR = Path(__file__).parent / "assets"


class _NoCacheHandler(SimpleHTTPRequestHandler):
    """HTTP handler that disables caching for JSON files."""

    def end_headers(self) -> None:
        if self.path.endswith(".json"):
            self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
            self.send_header("Pragma", "no-cache")
            self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, format: str, *args: object) -> None:
        # Suppress access log noise in batch mode
        pass


class DashboardServer:
    """HTTP server that serves the batch dashboard."""

    def __init__(self, serve_dir: Path, port: int = 8765) -> None:
        self.serve_dir = Path(serve_dir)
        self.port = port
        self._server: HTTPServer | None = None
        self._thread: threading.Thread | None = None

    def start(self) -> int:
        """Start the dashboard server.

        Returns:
            The actual port used (may differ from requested if port was busy).
        """
        self._copy_dashboard()

        # Find available port
        self.port = self._find_available_port(self.port)

        handler = partial(_NoCacheHandler, directory=str(self.serve_dir))
        self._server = HTTPServer(("0.0.0.0", self.port), handler)

        self._thread = threading.Thread(
            target=self._server.serve_forever,
            daemon=True,
            name="vt-dashboard",
        )
        self._thread.start()

        return self.port

    def stop(self) -> None:
        """Stop the server."""
        if self._server:
            self._server.shutdown()
            self._server = None

    def _copy_dashboard(self) -> None:
        """Copy dashboard.html to the serve directory."""
        src = ASSETS_DIR / "dashboard.html"
        dst = self.serve_dir / "dashboard.html"
        if src.exists():
            shutil.copy2(src, dst)

    @staticmethod
    def _find_available_port(start_port: int, max_tries: int = 10) -> int:
        """Find an available port starting from start_port."""
        for offset in range(max_tries):
            port = start_port + offset
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
                try:
                    sock.bind(("0.0.0.0", port))
                    return port
                except OSError:
                    continue
        raise RuntimeError(
            f"No available port found in range {start_port}-{start_port + max_tries - 1}"
        )
