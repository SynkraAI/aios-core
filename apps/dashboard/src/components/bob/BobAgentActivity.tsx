'use client';

import { memo } from 'react';
import { useBobStore } from '@/stores/bob-store';
import type { BobTerminal, BobCurrentAgent } from '@/stores/bob-store';
import { cn } from '@/lib/utils';
import { AGENT_CONFIG, type AgentId } from '@/types';
import { iconMap } from '@/lib/icons';
import { Users } from 'lucide-react';

// Agent colors for fallback
const AGENT_COLORS: Record<string, string> = {
  dev: '#22c55e',
  qa: '#eab308',
  architect: '#8b5cf6',
  pm: '#3b82f6',
  po: '#f97316',
  devops: '#ec4899',
};

function getAgentColor(agentId: string): string {
  const config = AGENT_CONFIG[agentId as AgentId];
  return config?.color || AGENT_COLORS[agentId] || 'var(--text-muted)';
}

interface AgentCardProps {
  terminal: BobTerminal;
  isCurrent: boolean;
}

function AgentActivityCard({ terminal, isCurrent }: AgentCardProps) {
  const color = getAgentColor(terminal.agent);
  const config = AGENT_CONFIG[terminal.agent as AgentId];
  const IconComponent = config ? iconMap[config.icon] : null;

  return (
    <div
      className="rounded-md border p-3"
      style={{
        borderColor: isCurrent ? color : 'var(--border-subtle)',
        backgroundColor: 'var(--bg-elevated)',
        borderLeftWidth: '3px',
        borderLeftColor: color,
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          {IconComponent && (
            <IconComponent className="h-3.5 w-3.5" style={{ color }} />
          )}
          <span className="text-xs font-medium" style={{ color }}>
            @{terminal.agent}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Status badge */}
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium',
              isCurrent && 'animate-pulse'
            )}
            style={{
              backgroundColor: isCurrent ? '#22c55e20' : '#6b728020',
              color: isCurrent ? '#22c55e' : '#6b7280',
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{
              backgroundColor: isCurrent ? '#22c55e' : '#6b7280',
            }} />
            {isCurrent ? 'working' : 'done'}
          </span>
        </div>
      </div>

      <p className="text-xs truncate mb-1" style={{ color: 'var(--text-secondary)' }}>
        {terminal.task}
      </p>

      <div className="flex items-center justify-between text-[10px]" style={{ color: 'var(--text-muted)' }}>
        <span>PID: {terminal.pid}</span>
        <span>{terminal.elapsed}</span>
      </div>
    </div>
  );
}

export const BobAgentActivity = memo(function BobAgentActivity() {
  const terminals = useBobStore((s) => s.terminals);
  const currentAgent = useBobStore((s) => s.currentAgent);
  const active = useBobStore((s) => s.active);

  if (!active) return null;

  if (terminals.length === 0 && !currentAgent) {
    return (
      <div
        className="rounded-lg border p-4"
        style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-elevated)' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Agent Activity
          </span>
        </div>
        <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>
          Nenhum agente ativo no momento
        </p>
      </div>
    );
  }

  // Build display list: combine current agent + terminals
  const displayItems = buildDisplayItems(currentAgent, terminals);

  return (
    <div
      className="rounded-lg border p-4"
      style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-elevated)' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Users className="h-4 w-4" style={{ color: 'var(--text-primary)' }} />
        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          Agent Activity
        </span>
        <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>
          {displayItems.length} active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {displayItems.map((item) => (
          <AgentActivityCard
            key={`${item.terminal.agent}-${item.terminal.pid}`}
            terminal={item.terminal}
            isCurrent={item.isCurrent}
          />
        ))}
      </div>
    </div>
  );
});

function buildDisplayItems(
  currentAgent: BobCurrentAgent | null,
  terminals: BobTerminal[]
): Array<{ terminal: BobTerminal; isCurrent: boolean }> {
  const items: Array<{ terminal: BobTerminal; isCurrent: boolean }> = [];
  const seenPids = new Set<number>();

  // Add terminals
  for (const t of terminals) {
    const isCurrent = currentAgent?.id === t.agent;
    items.push({ terminal: t, isCurrent });
    seenPids.add(t.pid);
  }

  // If current agent is not in terminals, add it
  if (currentAgent && !terminals.some((t) => t.agent === currentAgent.id)) {
    items.unshift({
      terminal: {
        agent: currentAgent.id,
        pid: 0,
        task: currentAgent.task,
        elapsed: '',
      },
      isCurrent: true,
    });
  }

  return items;
}
