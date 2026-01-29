'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';
import { iconMap, AlertTriangle } from '@/lib/icons';
import { StatusDot, type StatusType as DotStatusType } from '@/components/ui/status-dot';
import { ProgressBar } from '@/components/ui/progress-bar';
import type { Agent } from '@/types';

// Phase labels with colors using CSS variables
const PHASE_CONFIG: Record<string, { label: string; color: string }> = {
  planning: { label: 'Planning', color: 'var(--phase-planning)' },
  coding: { label: 'Coding', color: 'var(--phase-coding)' },
  testing: { label: 'Testing', color: 'var(--phase-testing)' },
  reviewing: { label: 'Reviewing', color: 'var(--phase-reviewing)' },
  deploying: { label: 'Deploying', color: 'var(--phase-deploying)' },
};

// Map agent status to StatusDot type
const STATUS_TO_DOT: Record<string, DotStatusType> = {
  idle: 'idle',
  working: 'working',
  waiting: 'waiting',
  error: 'error',
};

interface AgentCardProps {
  agent: Agent;
  onClick?: () => void;
}

function getRelativeTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

function isStale(timestamp: string): boolean {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  return minutes > 5;
}

export const AgentCard = memo(function AgentCard({
  agent,
  onClick,
}: AgentCardProps) {
  const isActive = agent.status !== 'idle';
  const stale = agent.lastActivity && isStale(agent.lastActivity);
  const phaseConfig = agent.phase ? PHASE_CONFIG[agent.phase] : null;
  const dotStatus = STATUS_TO_DOT[agent.status] || 'idle';

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative p-4',
        'bg-[var(--card)] border border-[var(--border)] border-l-2',
        'transition-luxury hover-lift',
        'hover:bg-[var(--card-hover)] hover:border-[var(--border-medium)]',
        'cursor-pointer'
      )}
      style={{ borderLeftColor: isActive ? agent.color : 'var(--border)' }}
    >
      {/* Header: Status dot + Icon + Name */}
      <div className="flex items-center gap-3 mb-4">
        <StatusDot status={dotStatus} size="lg" glow={isActive} />
        <div className="flex items-center gap-2 flex-1">
          {(() => {
            const IconComponent = iconMap[agent.icon];
            return IconComponent ? (
              <IconComponent
                className="h-4 w-4 transition-colors"
                style={{ color: isActive ? agent.color : 'var(--text-muted)' }}
              />
            ) : null;
          })()}
          <span className={cn(
            "font-light text-sm transition-colors",
            isActive ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)]"
          )}>
            @{agent.id}
          </span>
        </div>

        {/* Status badge */}
        <span
          className="text-[9px] uppercase tracking-wider font-medium px-2 py-0.5 border"
          style={{
            backgroundColor: isActive ? `${agent.color}15` : 'var(--border)',
            borderColor: isActive ? `${agent.color}30` : 'var(--border)',
            color: isActive ? agent.color : 'var(--text-muted)',
          }}
        >
          {agent.status}
        </span>
      </div>

      {/* Active agent details */}
      {isActive && (
        <div className="space-y-3">
          {/* Current Story */}
          {agent.currentStoryId && (
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Story</span>
              <span className="text-[11px] font-mono text-[var(--text-secondary)]">{agent.currentStoryId}</span>
            </div>
          )}

          {/* Phase */}
          {phaseConfig && (
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Phase</span>
              <span
                className="text-[11px] font-medium"
                style={{ color: phaseConfig.color }}
              >
                {phaseConfig.label}
              </span>
            </div>
          )}

          {/* Progress bar */}
          {typeof agent.progress === 'number' && (
            <div className="pt-2 border-t border-[var(--border-subtle)]">
              <div className="flex items-center justify-between text-[10px] mb-2">
                <span className="uppercase tracking-wider text-[var(--text-muted)]">Progress</span>
                <span className="font-mono text-[var(--text-secondary)]">{agent.progress}%</span>
              </div>
              <ProgressBar
                progress={agent.progress}
                color={agent.color}
                glow
              />
            </div>
          )}

          {/* Last activity */}
          {agent.lastActivity && (
            <div
              className={cn(
                'flex items-center gap-1.5 pt-2 border-t border-[var(--border-subtle)]',
                'text-[10px]',
                stale ? 'text-[var(--status-warning)]' : 'text-[var(--text-muted)]'
              )}
            >
              {stale && <AlertTriangle className="h-3 w-3" />}
              <span className="uppercase tracking-wider">Last active:</span>
              <span className="text-[var(--text-tertiary)]">{getRelativeTime(agent.lastActivity)}</span>
            </div>
          )}
        </div>
      )}

      {/* Idle state */}
      {!isActive && (
        <div className="text-[11px] text-[var(--text-muted)] font-light">
          {agent.name} is standing by
        </div>
      )}
    </div>
  );
});
