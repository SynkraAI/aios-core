'use client';

import { useState } from 'react';
import { RefreshCw, Pause, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { iconMap } from '@/lib/icons';
import { useAgents } from '@/hooks/use-agents';
import { useAgentStore } from '@/stores/agent-store';
import { AgentCard } from './AgentCard';
import { SectionLabel } from '@/components/ui/section-label';
import { StatusDot } from '@/components/ui/status-dot';

export function AgentMonitor() {
  const { activeAgents, idleAgents, isLoading, refresh } = useAgents();
  const { pollingInterval, setPollingInterval } = useAgentStore();
  const [autoRefresh, setAutoRefresh] = useState(true);

  const toggleAutoRefresh = () => {
    if (autoRefresh) {
      setPollingInterval(0); // Disable polling
    } else {
      setPollingInterval(5000); // Re-enable 5s polling
    }
    setAutoRefresh(!autoRefresh);
  };

  const handleManualRefresh = () => {
    refresh();
  };

  return (
    <div className="h-full flex flex-col bg-[var(--background)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-4">
          <div>
            <span className="section-label block mb-1">Monitor</span>
            <h2 className="text-sm font-light text-[var(--text-primary)]">Agent Activity</h2>
          </div>
          <div className="h-8 w-px bg-[var(--border-subtle)]" />
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-light text-[var(--text-primary)]">{activeAgents.length}</span>
            <span className="text-[11px] text-[var(--text-muted)]">/ {activeAgents.length + idleAgents.length} active</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Auto-refresh toggle */}
          <button
            onClick={toggleAutoRefresh}
            aria-label={autoRefresh ? 'Pause auto-refresh' : 'Enable auto-refresh'}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium',
              'border transition-luxury',
              autoRefresh
                ? 'bg-[var(--status-success-bg)] border-[var(--status-success-border)] text-[var(--status-success)]'
                : 'bg-[var(--border)] border-[var(--border)] text-[var(--text-tertiary)]'
            )}
          >
            {autoRefresh ? (
              <>
                <StatusDot status="success" size="sm" glow />
                Live
              </>
            ) : (
              <>
                <Pause className="h-3 w-3" />
                Paused
              </>
            )}
          </button>

          {/* Manual refresh */}
          <button
            onClick={handleManualRefresh}
            disabled={isLoading}
            aria-label="Refresh agent data"
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-[11px]',
              'border border-[var(--border)] bg-[var(--border)]',
              'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
              'hover:bg-[var(--border-medium)] transition-luxury',
              isLoading && 'opacity-50 cursor-not-allowed'
            )}
          >
            <RefreshCw className={cn('h-3 w-3', isLoading && 'animate-spin')} />
            Refresh
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-refined">
        {/* Active Agents Grid */}
        {activeAgents.length > 0 && (
          <section className="mb-8">
            <SectionLabel withLine className="mb-4">Active</SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeAgents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          </section>
        )}

        {/* No active agents message */}
        {activeAgents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <Moon className="h-8 w-8 text-[var(--text-disabled)] mb-4" />
            <p className="text-[var(--text-tertiary)] font-light mb-1">All agents standing by</p>
            <p className="text-[11px] text-[var(--text-muted)]">
              Activate via CLI: <code className="text-[var(--accent-gold)]">@agent-name</code>
            </p>
          </div>
        )}

        {/* Idle Agents Section */}
        {idleAgents.length > 0 && (
          <section>
            <SectionLabel variant="muted" withLine className="mb-4">Standby</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {idleAgents.map((agent) => (
                <div
                  key={agent.id}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2',
                    'bg-[var(--border)] border border-[var(--border)]',
                    'text-[11px] text-[var(--text-muted)]',
                    'transition-luxury hover:bg-[var(--border-medium)] hover:text-[var(--text-tertiary)]'
                  )}
                >
                  <StatusDot status="idle" size="sm" glow={false} />
                  {(() => {
                    const IconComponent = iconMap[agent.icon];
                    return IconComponent ? <IconComponent className="h-3.5 w-3.5" /> : null;
                  })()}
                  <span className="font-light">@{agent.id}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Footer with polling info */}
      <div className="px-4 py-2 border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[10px] text-[var(--text-muted)] flex items-center justify-center gap-2">
        {autoRefresh ? (
          <>
            <StatusDot status="success" size="sm" glow />
            <span>Polling every {pollingInterval / 1000}s</span>
          </>
        ) : (
          <span>Auto-refresh paused</span>
        )}
      </div>
    </div>
  );
}
