'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { AiosStatus } from '@/types';

// Event types from SSE
type SSEEventType = 'status:update' | 'connection:status' | 'heartbeat' | 'error';

interface SSEEvent {
  type: SSEEventType;
  data: unknown;
  timestamp: string;
}

interface UseRealtimeStatusOptions {
  /** Enable/disable realtime updates (default: true) */
  enabled?: boolean;
  /** Fallback polling interval in ms when SSE fails (default: 5000) */
  fallbackInterval?: number;
  /** Max reconnection attempts before falling back to polling (default: 3) */
  maxReconnectAttempts?: number;
  /** Callback when status updates */
  onStatusUpdate?: (status: AiosStatus) => void;
  /** Callback when connection status changes */
  onConnectionChange?: (connected: boolean) => void;
}

interface UseRealtimeStatusReturn {
  /** Current AIOS status */
  status: AiosStatus | null;
  /** True if SSE connection is active */
  isConnected: boolean;
  /** True if using SSE (vs polling fallback) */
  isRealtime: boolean;
  /** Last update timestamp */
  lastUpdate: string | null;
  /** Reconnect manually */
  reconnect: () => void;
}

export function useRealtimeStatus(
  options: UseRealtimeStatusOptions = {}
): UseRealtimeStatusReturn {
  const {
    enabled = true,
    fallbackInterval = 5000,
    maxReconnectAttempts = 3,
    onStatusUpdate,
    onConnectionChange,
  } = options;

  const [status, setStatus] = useState<AiosStatus | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isRealtime, setIsRealtime] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fallbackIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const connectRef = useRef<(() => void) | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (fallbackIntervalRef.current) {
      clearInterval(fallbackIntervalRef.current);
      fallbackIntervalRef.current = null;
    }
  }, []);

  // Polling fallback
  const startPolling = useCallback(() => {
    if (fallbackIntervalRef.current) return;

    const poll = async () => {
      try {
        const res = await fetch('/api/status');
        if (res.ok) {
          const data = await res.json();
          setStatus(data);
          setLastUpdate(new Date().toISOString());
          onStatusUpdate?.(data);
        }
      } catch {
        // Polling failed, will retry
      }
    };

    // Initial poll
    poll();

    // Setup interval
    fallbackIntervalRef.current = setInterval(poll, fallbackInterval);
    setIsRealtime(false);
  }, [fallbackInterval, onStatusUpdate]);

  // Connect to SSE
  const connect = useCallback(() => {
    if (!enabled) return;

    cleanup();

    try {
      const eventSource = new EventSource('/api/events');
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsConnected(true);
        setIsRealtime(true);
        reconnectAttemptsRef.current = 0;
        onConnectionChange?.(true);

        // Stop polling fallback if running
        if (fallbackIntervalRef.current) {
          clearInterval(fallbackIntervalRef.current);
          fallbackIntervalRef.current = null;
        }
      };

      eventSource.onerror = () => {
        setIsConnected(false);
        onConnectionChange?.(false);

        // Close current connection
        eventSource.close();
        eventSourceRef.current = null;

        // Attempt reconnection with exponential backoff
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
          reconnectAttemptsRef.current++;

          reconnectTimeoutRef.current = setTimeout(() => {
            connectRef.current?.();
          }, delay);
        } else {
          // Fall back to polling
          startPolling();
        }
      };

      // Handle status updates
      eventSource.addEventListener('status:update', (event: MessageEvent) => {
        try {
          const parsed: SSEEvent = JSON.parse(event.data);
          setStatus(parsed.data as AiosStatus);
          setLastUpdate(parsed.timestamp);
          onStatusUpdate?.(parsed.data as AiosStatus);
        } catch {
          // Failed to parse event
        }
      });

      // Handle connection status
      eventSource.addEventListener('connection:status', (event: MessageEvent) => {
        try {
          const parsed: SSEEvent = JSON.parse(event.data);
          const connected = (parsed.data as { connected: boolean }).connected;
          setIsConnected(connected);
          onConnectionChange?.(connected);
        } catch {
          // Failed to parse event
        }
      });

      // Handle heartbeat
      eventSource.addEventListener('heartbeat', () => {
        // Heartbeat received, connection is alive
      });

      // Handle errors
      eventSource.addEventListener('error', (event: MessageEvent) => {
        try {
          const parsed: SSEEvent = JSON.parse(event.data);
          console.warn('[SSE] Server error:', parsed.data);
        } catch {
          // Failed to parse error
        }
      });
    } catch {
      // SSE not supported, fall back to polling
      startPolling();
    }
  }, [enabled, cleanup, maxReconnectAttempts, onConnectionChange, onStatusUpdate, startPolling]);

  // Manual reconnect
  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    connectRef.current?.();
  }, []);

  // Store connect in ref and connect on mount
  useEffect(() => {
    connectRef.current = connect;

    if (enabled) {
      // Use queueMicrotask to avoid synchronous setState within effect
      queueMicrotask(() => {
        connect();
      });
    }

    return cleanup;
  }, [enabled, connect, cleanup]);

  return {
    status,
    isConnected,
    isRealtime,
    lastUpdate,
    reconnect,
  };
}
