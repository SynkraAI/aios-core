#!/bin/bash
# Quest Dashboard — Server + Cloudflare Tunnel (idempotent)
# Usage: ./tunnel.sh [start|stop|status]
# Safe to call multiple times — only starts what's not already running.

ACTION="${1:-start}"
DASHBOARD_DIR="$(cd "$(dirname "$0")" && pwd)"
TUNNEL_PIDFILE="/tmp/quest-tunnel.pid"
PORT=5050
URL="https://quest.fosc.me"

is_server_up() {
  curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT" 2>/dev/null | grep -q "200"
}

is_tunnel_up() {
  [ -f "$TUNNEL_PIDFILE" ] && kill -0 "$(cat "$TUNNEL_PIDFILE")" 2>/dev/null
}

case "$ACTION" in
  start)
    # --- Server ---
    if is_server_up; then
      echo "✓ Dashboard server already running on port $PORT"
    else
      echo "▸ Starting Quest Dashboard on port $PORT..."
      cd "$DASHBOARD_DIR"
      nohup node server.js > /tmp/quest-dashboard.log 2>&1 &
      # Wait for server to be ready
      for i in 1 2 3 4 5; do
        sleep 1
        if is_server_up; then break; fi
      done
      if is_server_up; then
        echo "✓ Dashboard server started"
      else
        echo "✗ Dashboard server failed to start (check /tmp/quest-dashboard.log)"
        exit 1
      fi
    fi

    # --- Tunnel ---
    if is_tunnel_up; then
      echo "✓ Cloudflare Tunnel already running"
    else
      echo "▸ Starting Cloudflare Tunnel..."
      nohup cloudflared tunnel run quest-dashboard > /tmp/quest-tunnel.log 2>&1 &
      echo $! > "$TUNNEL_PIDFILE"
      sleep 2
      if is_tunnel_up; then
        echo "✓ Tunnel started"
      else
        echo "✗ Tunnel failed to start (check /tmp/quest-tunnel.log)"
        exit 1
      fi
    fi

    echo ""
    echo "Dashboard online: $URL"
    echo "Local: http://localhost:$PORT"
    ;;

  stop)
    # Stop tunnel
    if is_tunnel_up; then
      kill "$(cat "$TUNNEL_PIDFILE")" 2>/dev/null
      rm -f "$TUNNEL_PIDFILE"
      echo "✓ Tunnel stopped"
    else
      echo "– Tunnel not running"
    fi

    # Stop server (find by port)
    SERVER_PID=$(lsof -ti :$PORT 2>/dev/null)
    if [ -n "$SERVER_PID" ]; then
      kill $SERVER_PID 2>/dev/null
      echo "✓ Dashboard server stopped"
    else
      echo "– Server not running"
    fi
    ;;

  status)
    if is_server_up; then
      echo "✓ Dashboard: running (http://localhost:$PORT)"
    else
      echo "✗ Dashboard: stopped"
    fi
    if is_tunnel_up; then
      echo "✓ Tunnel: running ($URL)"
    else
      echo "✗ Tunnel: stopped"
    fi
    ;;

  *)
    echo "Usage: ./tunnel.sh [start|stop|status]"
    ;;
esac
