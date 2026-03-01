#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME="aios-telegram-bridge"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PACKAGE_DIR="$(dirname "$SCRIPT_DIR")"
SERVICE_FILE="$PACKAGE_DIR/config/$SERVICE_NAME.service"
SYSTEMD_DIR="/etc/systemd/system"

case "${1:-install}" in
  install)
    echo "Installing $SERVICE_NAME service..."

    # Check .env exists
    if [ ! -f "$PACKAGE_DIR/.env" ]; then
      echo "ERROR: .env file not found. Copy .env.example to .env and fill in tokens."
      exit 1
    fi

    # Install dependencies
    echo "Installing npm dependencies..."
    cd "$PACKAGE_DIR" && npm install --omit=dev

    # Copy service file
    sudo cp "$SERVICE_FILE" "$SYSTEMD_DIR/$SERVICE_NAME.service"
    sudo systemctl daemon-reload
    sudo systemctl enable "$SERVICE_NAME"
    sudo systemctl start "$SERVICE_NAME"

    echo "$SERVICE_NAME installed and started."
    echo "Check status: sudo systemctl status $SERVICE_NAME"
    echo "View logs: sudo journalctl -u $SERVICE_NAME -f"
    ;;

  uninstall)
    echo "Uninstalling $SERVICE_NAME service..."
    sudo systemctl stop "$SERVICE_NAME" 2>/dev/null || true
    sudo systemctl disable "$SERVICE_NAME" 2>/dev/null || true
    sudo rm -f "$SYSTEMD_DIR/$SERVICE_NAME.service"
    sudo systemctl daemon-reload
    echo "$SERVICE_NAME uninstalled."
    ;;

  restart)
    sudo systemctl restart "$SERVICE_NAME"
    echo "$SERVICE_NAME restarted."
    ;;

  *)
    echo "Usage: $0 {install|uninstall|restart}"
    exit 1
    ;;
esac
