'use client';

import { memo } from 'react';
import { useBobStore } from '@/stores/bob-store';
import { cn } from '@/lib/utils';
import { Bot, Clock } from 'lucide-react';
import { AGENT_CONFIG, type AgentId } from '@/types';
import { iconMap } from '@/lib/icons';

function formatElapsed(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) return `${mins}m${secs > 0 ? `${secs}s` : ''}`;
  const hours = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return `${hours}h${remainMins > 0 ? `${remainMins}m` : ''}`;
}

// Stage display labels
const STAGE_LABELS: Record<string, string> = {
  validation: 'PRD',
  development: 'Dev',
  self_healing: 'QA',
  quality_gate: 'Review',
  push: 'Push',
  checkpoint: 'Done',
};

function getStageLabel(stage: string): string {
  return STAGE_LABELS[stage] || stage;
}

export const BobPipelinePanel = memo(function BobPipelinePanel() {
  const pipeline = useBobStore((s) => s.pipeline);
  const currentAgent = useBobStore((s) => s.currentAgent);
  const terminals = useBobStore((s) => s.terminals);
  const elapsed = useBobStore((s) => s.elapsed);
  const active = useBobStore((s) => s.active);

  if (!active || !pipeline) return null;

  const completedSet = new Set(pipeline.completed_stages);

  return (
    <div
      className="rounded-lg border p-4"
      style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-elevated)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4" style={{ color: 'var(--agent-pm)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Bob Orchestration
          </span>
        </div>
        <div className="flex items-center gap-3">
          {pipeline.story_progress && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{
              backgroundColor: 'var(--accent-gold-bg)',
              color: 'var(--accent-gold)',
            }}>
              Story {pipeline.story_progress}
            </span>
          )}
          <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
            <Clock className="h-3 w-3" />
            {formatElapsed(elapsed.session_seconds)}
          </div>
        </div>
      </div>

      {/* Pipeline stages */}
      <div className={cn(
        'flex items-center gap-1 mb-3',
        'max-md:flex-col max-md:items-stretch'
      )}>
        {pipeline.stages.map((stage, idx) => {
          const isCompleted = completedSet.has(stage);
          const isActive = pipeline.current_stage === stage;
          const isPending = !isCompleted && !isActive;

          return (
            <div key={stage} className={cn(
              'flex items-center gap-1',
              'max-md:flex-row'
            )}>
              {/* Stage pill */}
              <div
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                  isActive && 'animate-pulse'
                )}
                style={{
                  backgroundColor: isCompleted
                    ? 'var(--status-success)' + '20'
                    : isActive
                      ? 'var(--agent-pm)' + '20'
                      : 'var(--bg-hover)',
                  color: isCompleted
                    ? 'var(--status-success)'
                    : isActive
                      ? 'var(--agent-pm)'
                      : 'var(--text-muted)',
                  borderWidth: '1px',
                  borderColor: isActive ? 'var(--agent-pm)' : 'transparent',
                }}
              >
                <span className="text-[10px]">
                  {isCompleted ? '\u2713' : isActive ? '\u25CF' : '\u25CB'}
                </span>
                {getStageLabel(stage)}
              </div>

              {/* Connector */}
              {idx < pipeline.stages.length - 1 && (
                <span
                  className="text-[10px] max-md:hidden"
                  style={{ color: isPending ? 'var(--text-muted)' : 'var(--text-tertiary)' }}
                >
                  →
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Current agent info */}
      {currentAgent && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-md text-xs"
          style={{ backgroundColor: 'var(--bg-hover)' }}
        >
          {(() => {
            const agentConfig = AGENT_CONFIG[currentAgent.id as AgentId];
            const IconComponent = agentConfig ? iconMap[agentConfig.icon] : null;
            return IconComponent ? (
              <IconComponent className="h-3.5 w-3.5" style={{ color: agentConfig?.color }} />
            ) : null;
          })()}
          <span style={{ color: 'var(--text-secondary)' }}>
            @{currentAgent.id} ({currentAgent.name})
          </span>
          <span style={{ color: 'var(--text-muted)' }}>—</span>
          <span style={{ color: 'var(--text-primary)' }} className="truncate flex-1">
            {currentAgent.task}
          </span>
        </div>
      )}

      {/* Terminal count + timers */}
      <div className="flex items-center justify-between mt-2 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
        <span>
          Terminals: {terminals.length} active
          {terminals.length > 0 && (
            <span className="ml-1">
              ({terminals.map((t) => `@${t.agent} pid:${t.pid}`).join(', ')})
            </span>
          )}
        </span>
        <div className="flex items-center gap-3">
          <span>Story: {formatElapsed(elapsed.story_seconds)}</span>
          <span>Session: {formatElapsed(elapsed.session_seconds)}</span>
        </div>
      </div>
    </div>
  );
});
