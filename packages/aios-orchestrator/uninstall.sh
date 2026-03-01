#!/bin/bash
# =============================================================================
# AIOS Orchestrator — Uninstall systemd Service
#
# Stops, disables, and removes the systemd unit file and logrotate config.
#
# Usage:
#   sudo ./uninstall.sh
#
# Story: E7.1.7 (AC7)
# =============================================================================

set -euo pipefail

SYSTEMD_DIR="/etc/systemd/system"
LOGROTATE_DIR="/etc/logrotate.d"
SERVICE_NAME="aios-orchestrator"

# ---------------------------------------------------------------------------
# Pre-flight checks
# ---------------------------------------------------------------------------

if [[ $EUID -ne 0 ]]; then
  echo "[ERROR] This script must be run as root (use sudo)." >&2
  exit 1
fi

# ---------------------------------------------------------------------------
# Stop and disable service
# ---------------------------------------------------------------------------

echo "[1/4] Stopping ${SERVICE_NAME} service"
systemctl stop "${SERVICE_NAME}" 2>/dev/null || echo "  (service was not running)"

echo "[2/4] Disabling ${SERVICE_NAME} service"
systemctl disable "${SERVICE_NAME}" 2>/dev/null || echo "  (service was not enabled)"

# ---------------------------------------------------------------------------
# Remove files
# ---------------------------------------------------------------------------

echo "[3/4] Removing service file"
rm -f "${SYSTEMD_DIR}/${SERVICE_NAME}.service"

echo "[4/4] Removing logrotate config"
rm -f "${LOGROTATE_DIR}/${SERVICE_NAME}"

# ---------------------------------------------------------------------------
# Reload systemd
# ---------------------------------------------------------------------------

systemctl daemon-reload

# ---------------------------------------------------------------------------
# Done
# ---------------------------------------------------------------------------

echo ""
echo "=== Uninstall Complete ==="
echo ""
echo "The ${SERVICE_NAME} service has been stopped, disabled, and removed."
echo "Log files in .aios/logs/ have been preserved."
