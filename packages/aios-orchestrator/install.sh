#!/bin/bash
# =============================================================================
# AIOS Orchestrator — Install systemd Service
#
# Copies the systemd unit file, logrotate config, and enables the service.
#
# Usage:
#   sudo ./install.sh
#
# Story: E7.1.7 (AC7)
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SYSTEMD_DIR="/etc/systemd/system"
LOGROTATE_DIR="/etc/logrotate.d"

SERVICE_FILE="${SCRIPT_DIR}/systemd/aios-orchestrator.service"
LOGROTATE_FILE="${SCRIPT_DIR}/systemd/aios-orchestrator.logrotate"

# ---------------------------------------------------------------------------
# Pre-flight checks
# ---------------------------------------------------------------------------

if [[ $EUID -ne 0 ]]; then
  echo "[ERROR] This script must be run as root (use sudo)." >&2
  exit 1
fi

if [[ ! -f "$SERVICE_FILE" ]]; then
  echo "[ERROR] Service file not found: ${SERVICE_FILE}" >&2
  exit 1
fi

# ---------------------------------------------------------------------------
# Install systemd service
# ---------------------------------------------------------------------------

echo "[1/4] Copying service file to ${SYSTEMD_DIR}/"
cp "$SERVICE_FILE" "${SYSTEMD_DIR}/aios-orchestrator.service"

echo "[2/4] Running systemctl daemon-reload"
systemctl daemon-reload

echo "[3/4] Enabling aios-orchestrator service"
systemctl enable aios-orchestrator

# ---------------------------------------------------------------------------
# Install logrotate config
# ---------------------------------------------------------------------------

if [[ -f "$LOGROTATE_FILE" ]]; then
  echo "[4/4] Installing logrotate config to ${LOGROTATE_DIR}/"
  cp "$LOGROTATE_FILE" "${LOGROTATE_DIR}/aios-orchestrator"
else
  echo "[4/4] Logrotate config not found — skipping"
fi

# ---------------------------------------------------------------------------
# Done
# ---------------------------------------------------------------------------

echo ""
echo "=== Installation Complete ==="
echo ""
echo "The service is installed and enabled (will start on boot)."
echo ""
echo "To start the service now:"
echo "  sudo systemctl start aios-orchestrator"
echo ""
echo "To check status:"
echo "  sudo systemctl status aios-orchestrator"
echo ""
echo "To view logs:"
echo "  journalctl -u aios-orchestrator -f"
echo ""
echo "To run a specific story via systemd instantiated service:"
echo "  sudo systemctl start aios-orchestrator@docs-stories-active-7.1.7.story"
echo ""
echo "NOTE: Ensure /home/ubuntu/aios-core/.env contains ANTHROPIC_API_KEY"
echo "      before starting the service."
