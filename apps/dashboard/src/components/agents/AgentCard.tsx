'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';
import type { Agent } from '@/types';

// Status indicator colors
const STATUS_COLORS: Record<string, string> = {
  idle: 'bg-gray-500',
  working: 'bg-green-500 animate-pulse',
  waiting: 'bg-yellow-500',
  error: 'bg-red-500',
};

// Phase labels
const PHASE_LABELS: Record<string, string> = {
  planning: 'Planning',
  coding: 'Coding',
  testing: 'Testing',
  reviewing: 'Reviewing',
  deploying: 'Deploying',
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

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative rounded-lg border bg-card p-4 transition-all',
        'hover:shadow-md cursor-pointer',
        isActive && 'border-2',
        agent.status === 'working' && 'border-green-500/50',
        agent.status === 'waiting' && 'border-yellow-500/50',
        agent.status === 'error' && 'border-red-500/50',
        !isActive && 'border-border'
      )}
      style={
        isActive
          ? { borderColor: `${agent.color}40` }
          : undefined
      }
    >
      {/* Header: Status dot + Name */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className={cn(
            'h-2.5 w-2.5 rounded-full',
            STATUS_COLORS[agent.status]
          )}
        />
        <span className="text-lg">{agent.icon}</span>
        <span className="font-semibold text-sm">@{agent.id}</span>
      </div>

      {/* Active agent details */}
      {isActive && (
        <>
          {/* Current Story */}
          {agent.currentStoryId && (
            <div className="text-xs text-muted-foreground mb-2">
              <span className="text-foreground/70">Story:</span>{' '}
              <span className="font-mono">{agent.currentStoryId}</span>
            </div>
          )}

          {/* Phase */}
          {agent.phase && (
            <div className="text-xs text-muted-foreground mb-2">
              <span className="text-foreground/70">Phase:</span>{' '}
              <span>{PHASE_LABELS[agent.phase] || agent.phase}</span>
            </div>
          )}

          {/* Progress bar */}
          {typeof agent.progress === 'number' && (
            <div className="mb-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-mono">{agent.progress}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${agent.progress}%`,
                    backgroundColor: agent.color,
                  }}
                />
              </div>
            </div>
          )}

          {/* Last activity */}
          {agent.lastActivity && (
            <div
              className={cn(
                'text-xs',
                stale ? 'text-yellow-500' : 'text-muted-foreground'
              )}
            >
              {stale && <span className="mr-1">⚠</span>}
              Last active: {getRelativeTime(agent.lastActivity)}
            </div>
          )}
        </>
      )}

      {/* Idle state */}
      {!isActive && (
        <div className="text-xs text-muted-foreground">
          {agent.name} is idle
        </div>
      )}
    </div>
  );
});
