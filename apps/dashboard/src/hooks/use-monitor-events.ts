/**
 * AIOS Monitor WebSocket Hook
 *
 * Connects to the monitor-server via WebSocket for real-time events.
 */

import { useEffect, useRef, useCallback } from 'react';
import { useMonitorStore, type MonitorEvent, type CurrentCommand, type ActiveAgent } from '@/stores/monitor-store';

const MONITOR_WS_URL = process.env.NEXT_PUBLIC_MONITOR_WS_URL || 'ws://localhost:4001/stream';
const RECONNECT_INTERVAL = 3000;
const MAX_RECONNECT_ATTEMPTS = 10;

interface WebSocketMessage {
  type: 'event' | 'init';
  event?: MonitorEvent;
  events?: MonitorEvent[];
}

export function useMonitorEvents() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    connected,
    connecting,
    error,
    events,
    currentCommand,
    activeAgent,
    setConnected,
    setConnecting,
    setError,
    addEvent,
    setEvents,
    setCurrentCommand,
    setActiveAgent,
  } = useMonitorStore();

  const connectRef = useRef<() => void>();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnecting(true);
    setError(null);

    try {
      const ws = new WebSocket(MONITOR_WS_URL);

      ws.onopen = () => {
        console.log('[Monitor] WebSocket connected');
        setConnected(true);
        setConnecting(false);
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          // Ignore pong responses (plain text, not JSON)
          if (event.data === 'pong') {
            return;
          }

          const message: WebSocketMessage = JSON.parse(event.data);

          if (message.type === 'init' && message.events) {
            // Initial load of recent events
            setEvents(message.events);
            // Process any high-level events in initial load
            processHighLevelEvents(message.events);
          } else if (message.type === 'event' && message.event) {
            // New event received
            addEvent(message.event);
            // Process high-level event
            processHighLevelEvent(message.event);
          }
        } catch (err) {
          console.error('[Monitor] Failed to parse message:', err);
        }
      };

      // Process high-level events (agent activation, commands)
      function processHighLevelEvent(evt: MonitorEvent) {
        const data = evt.data || {};
        const store = useMonitorStore.getState();

        switch (evt.type) {
          case 'AgentActivated': {
            const agent: ActiveAgent = {
              id: (data.agentId as string) || 'unknown',
              name: (data.agentName as string) || 'Unknown Agent',
              persona: data.persona as string | undefined,
              activatedAt: evt.timestamp,
            };
            store.setActiveAgent(agent);
            break;
          }

          case 'AgentDeactivated': {
            store.setActiveAgent(null);
            break;
          }

          case 'CommandStart': {
            const command: CurrentCommand = {
              name: (data.command as string) || 'unknown',
              startedAt: evt.timestamp,
              status: 'running',
              agentId: data.agentId as string | undefined,
            };
            store.setCurrentCommand(command);
            break;
          }

          case 'CommandComplete': {
            const currentCmd = store.currentCommand;
            if (currentCmd) {
              store.setCurrentCommand({ ...currentCmd, status: 'complete' });
            }
            // Auto-clear after 3 seconds
            setTimeout(() => {
              const cmd = useMonitorStore.getState().currentCommand;
              if (cmd?.status === 'complete') {
                useMonitorStore.getState().setCurrentCommand(null);
              }
            }, 3000);
            break;
          }

          case 'CommandError': {
            const currentCmd = store.currentCommand;
            if (currentCmd) {
              store.setCurrentCommand({ ...currentCmd, status: 'error' });
            }
            // Auto-clear after 5 seconds for errors
            setTimeout(() => {
              const cmd = useMonitorStore.getState().currentCommand;
              if (cmd?.status === 'error') {
                useMonitorStore.getState().setCurrentCommand(null);
              }
            }, 5000);
            break;
          }
        }
      }

      // Process multiple high-level events (for initial load)
      function processHighLevelEvents(evts: MonitorEvent[]) {
        // Sort by timestamp ascending to process in order
        const sorted = [...evts].sort((a, b) => a.timestamp - b.timestamp);

        // Find the most recent agent activation (if any active)
        const agentEvents = sorted.filter((e) =>
          e.type === 'AgentActivated' || e.type === 'AgentDeactivated'
        );
        if (agentEvents.length > 0) {
          const lastAgentEvent = agentEvents[agentEvents.length - 1];
          if (lastAgentEvent.type === 'AgentActivated') {
            processHighLevelEvent(lastAgentEvent);
          }
        }

        // Find the most recent command (if still running)
        const commandEvents = sorted.filter((e) =>
          e.type === 'CommandStart' || e.type === 'CommandComplete' || e.type === 'CommandError'
        );
        if (commandEvents.length > 0) {
          const lastCommandEvent = commandEvents[commandEvents.length - 1];
          if (lastCommandEvent.type === 'CommandStart') {
            processHighLevelEvent(lastCommandEvent);
          }
        }
      }

      ws.onerror = (event) => {
        console.error('[Monitor] WebSocket error:', event);
        setError('Connection error');
      };

      ws.onclose = (event) => {
        console.log('[Monitor] WebSocket closed:', event.code, event.reason);
        setConnected(false);
        setConnecting(false);
        wsRef.current = null;

        // Attempt to reconnect
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current++;
          console.log(
            `[Monitor] Reconnecting in ${RECONNECT_INTERVAL}ms (attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})`
          );
          reconnectTimeoutRef.current = setTimeout(() => {
            connectRef.current?.();
          }, RECONNECT_INTERVAL);
        } else {
          setError('Connection lost. Max reconnect attempts reached.');
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('[Monitor] Failed to create WebSocket:', err);
      setConnecting(false);
      setError('Failed to connect');
    }
  }, [setConnected, setConnecting, setError, addEvent, setEvents, setCurrentCommand, setActiveAgent]);

  // Keep connectRef in sync
  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setConnected(false);
    setConnecting(false);
    reconnectAttemptsRef.current = MAX_RECONNECT_ATTEMPTS; // Prevent auto-reconnect
  }, [setConnected, setConnecting]);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect, disconnect]);

  // Auto-connect on mount
  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  // Ping/pong to keep connection alive
  useEffect(() => {
    if (!connected) return;

    const pingInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send('ping');
      }
    }, 30000);

    return () => clearInterval(pingInterval);
  }, [connected]);

  return {
    connected,
    connecting,
    error,
    events,
    currentCommand,
    activeAgent,
    connect,
    disconnect,
    reconnect,
  };
}
