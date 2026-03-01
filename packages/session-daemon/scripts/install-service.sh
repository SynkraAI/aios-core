#!/bin/bash
set -euo pipefail

# AIOS Session Daemon — systemd service installer
# Usage: sudo bash scripts/install-service.sh [install|uninstall|status]

SERVICE_NAME="aios-session-daemon"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
SOURCE_FILE="$(dirname "$0")/../config/${SERVICE_NAME}.service"
AIOS_DIR="/home/ubuntu/aios-core"

case "${1:-install}" in
  install)
    echo "Installing ${SERVICE_NAME}..."

    # Ensure .aios directories exist
    mkdir -p "${AIOS_DIR}/.aios/inbox/pending"
    mkdir -p "${AIOS_DIR}/.aios/inbox/in_progress"
    mkdir -p "${AIOS_DIR}/.aios/inbox/processed"
    mkdir -p "${AIOS_DIR}/.aios/inbox/failed"
    mkdir -p "${AIOS_DIR}/.aios/outbox/pending"
    mkdir -p "${AIOS_DIR}/.aios/outbox/sent"
    mkdir -p "${AIOS_DIR}/.aios/outbox/failed"
    mkdir -p "${AIOS_DIR}/.aios/daemon"
    mkdir -p "${AIOS_DIR}/.aios/logs"

    # Set ownership
    chown -R ubuntu:ubuntu "${AIOS_DIR}/.aios"

    # Dependencies are installed via root monorepo npm install
    echo "Verifying dependencies..."
    if [ ! -d "${AIOS_DIR}/node_modules/@anthropic-ai/claude-agent-sdk" ]; then
      echo "WARNING: @anthropic-ai/claude-agent-sdk not found. Run 'npm install' from ${AIOS_DIR}."
    fi

    # Copy service file
    cp "${SOURCE_FILE}" "${SERVICE_FILE}"
    echo "Service file installed: ${SERVICE_FILE}"

    # Reload systemd
    systemctl daemon-reload

    echo ""
    echo "Service installed. Commands:"
    echo "  systemctl start ${SERVICE_NAME}     # Start daemon"
    echo "  systemctl enable ${SERVICE_NAME}    # Enable on boot"
    echo "  systemctl status ${SERVICE_NAME}    # Check status"
    echo "  journalctl -u ${SERVICE_NAME} -f    # Follow logs"
    ;;

  uninstall)
    echo "Uninstalling ${SERVICE_NAME}..."
    systemctl stop "${SERVICE_NAME}" 2>/dev/null || true
    systemctl disable "${SERVICE_NAME}" 2>/dev/null || true
    rm -f "${SERVICE_FILE}"
    systemctl daemon-reload
    echo "Service uninstalled."
    ;;

  status)
    if systemctl is-active --quiet "${SERVICE_NAME}"; then
      systemctl status "${SERVICE_NAME}" --no-pager
    else
      echo "Service is not running."
      if [ -f "${AIOS_DIR}/.aios/daemon/health.json" ]; then
        echo ""
        echo "Last health state:"
        cat "${AIOS_DIR}/.aios/daemon/health.json"
      fi
    fi
    ;;

  *)
    echo "Usage: $0 [install|uninstall|status]"
    exit 1
    ;;
esac
