'use client';

import { memo, useEffect, useRef } from 'react';
import { useBobStore } from '@/stores/bob-store';
import { BobPipelinePanel } from '@/components/bob/BobPipelinePanel';
import { BobAgentActivity } from '@/components/bob/BobAgentActivity';
import { BobSurfaceAlert } from '@/components/bob/BobSurfaceAlert';
import { cn } from '@/lib/utils';
import { Bot, AlertCircle, XCircle } from 'lucide-react';
import type { BobError } from '@/stores/bob-store';

// Polling interval for bob status
const POLL_INTERVAL = 2000;

export const BobOrchestrationView = memo(function BobOrchestrationView() {
  const active = useBobStore((s) => s.active);
  const isInactive = useBobStore((s) => s.isInactive);
  const errors = useBobStore((s) => s.errors);
  const updateFromStatus = useBobStore((s) => s.updateFromStatus);
  const handleBobEvent = useBobStore((s) => s.handleBobEvent);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Polling for bob status
  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch('/api/bob/status');
        if (res.ok) {
          const data = await res.json();
          updateFromStatus(data);
        }
      } catch {
        // Silently handle fetch errors
      }
    }

    // Initial fetch
    fetchStatus();

    // Start polling
    pollRef.current = setInterval(fetchStatus, POLL_INTERVAL);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, [updateFromStatus]);

  // SSE for real-time events
  useEffect(() => {
    const eventSource = new EventSource('/api/bob/events');
    eventSourceRef.current = eventSource;

    eventSource.addEventListener('bob:status', (e) => {
      try {
        const parsed = JSON.parse(e.data);
        handleBobEvent({ type: 'bob:status', data: parsed.data || parsed });
      } catch { /* ignore parse errors */ }
    });

    // Listen for Bob-specific WebSocket-style events
    for (const eventType of ['BobPhaseChange', 'BobAgentSpawned', 'BobAgentCompleted', 'BobSurfaceDecision', 'BobError']) {
      eventSource.addEventListener(eventType, (e) => {
        try {
          const parsed = JSON.parse(e.data);
          handleBobEvent({ type: eventType, data: parsed.data || parsed });
        } catch { /* ignore parse errors */ }
      });
    }

    eventSource.onerror = () => {
      // SSE will auto-reconnect
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [handleBobEvent]);

  // Inactive state — show last known state with badge
  if (active && isInactive) {
    return (
      <div className="h-full overflow-y-auto p-4 space-y-4" style={{ opacity: 0.6 }}>
        <div className="flex items-center gap-2 mb-2">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{ backgroundColor: '#6b728020', color: '#6b7280' }}
          >
            inactive
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Ultimo update há mais de 5 minutos
          </span>
        </div>
        <BobPipelinePanel />
        <BobAgentActivity />
        {errors.length > 0 && <ErrorList errors={errors} />}
      </div>
    );
  }

  // Bob not active — placeholder
  if (!active) {
    return <BobInactivePlaceholder />;
  }

  // Active view
  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <BobPipelinePanel />
      <BobAgentActivity />
      <BobSurfaceAlert />
      {errors.length > 0 && <ErrorList errors={errors} />}
    </div>
  );
});

function BobInactivePlaceholder() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center max-w-sm">
        <Bot className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
        <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
          Bob não está ativo
        </p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Inicie Bob no CLI para ver o progresso aqui.
        </p>
      </div>
    </div>
  );
}

function ErrorList({ errors }: { errors: BobError[] }) {
  return (
    <div
      className="rounded-lg border p-4"
      style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-elevated)' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="h-4 w-4" style={{ color: 'var(--status-error)' }} />
        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          Errors ({errors.length})
        </span>
      </div>

      <div className="space-y-2">
        {errors.map((error, idx) => (
          <div
            key={`${error.phase}-${idx}`}
            className="flex items-start gap-2 text-xs rounded-md p-2"
            style={{ backgroundColor: error.recoverable ? '#eab30810' : '#ef444410' }}
          >
            <XCircle
              className="h-3.5 w-3.5 mt-0.5 flex-shrink-0"
              style={{ color: error.recoverable ? '#eab308' : '#ef4444' }}
            />
            <div>
              <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>
                [{error.phase}]
              </span>{' '}
              <span style={{ color: 'var(--text-secondary)' }}>{error.message}</span>
              {error.recoverable && (
                <span className="ml-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  (recoverable)
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
