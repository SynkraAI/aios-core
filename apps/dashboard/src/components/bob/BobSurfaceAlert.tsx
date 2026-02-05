'use client';

import { memo, useEffect, useState } from 'react';
import { useBobStore } from '@/stores/bob-store';
import { cn } from '@/lib/utils';
import { AlertTriangle, Terminal } from 'lucide-react';

const NEW_THRESHOLD_MS = 10_000; // 10 seconds

export const BobSurfaceAlert = memo(function BobSurfaceAlert() {
  const surfaceDecisions = useBobStore((s) => s.surfaceDecisions);
  const active = useBobStore((s) => s.active);

  // Filter unresolved decisions
  const pending = surfaceDecisions.filter((d) => !d.resolved);

  if (!active || pending.length === 0) return null;

  return (
    <div className="space-y-2">
      {pending.map((decision, idx) => (
        <SurfaceDecisionBanner key={`${decision.criteria}-${decision.timestamp}-${idx}`} decision={decision} />
      ))}
    </div>
  );
});

interface SurfaceDecisionBannerProps {
  decision: {
    criteria: string;
    action: string;
    timestamp: string;
    resolved: boolean;
  };
}

function SurfaceDecisionBanner({ decision }: SurfaceDecisionBannerProps) {
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    const elapsed = Date.now() - new Date(decision.timestamp).getTime();
    if (elapsed < NEW_THRESHOLD_MS) {
      setIsNew(true);
      const timer = setTimeout(() => setIsNew(false), NEW_THRESHOLD_MS - elapsed);
      return () => clearTimeout(timer);
    }
  }, [decision.timestamp]);

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border p-3',
        isNew && 'animate-pulse'
      )}
      style={{
        borderColor: '#eab30860',
        backgroundColor: '#eab30810',
      }}
      role="alert"
      aria-label="Bob surface decision pending"
    >
      <AlertTriangle
        className="h-4 w-4 mt-0.5 flex-shrink-0"
        style={{ color: '#eab308' }}
      />

      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium mb-1" style={{ color: '#eab308' }}>
          Bob precisa da sua atenção no CLI
        </p>
        <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
          <span className="font-medium">Critério:</span> {decision.criteria}
        </p>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          <span className="font-medium">Ação:</span> {decision.action}
        </p>
      </div>

      <div className="flex items-center gap-1 text-[10px] flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
        <Terminal className="h-3 w-3" />
        <span>CLI</span>
      </div>
    </div>
  );
}
