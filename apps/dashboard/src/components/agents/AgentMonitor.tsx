'use client';

import { useState } from 'react';
import { RefreshCw, Pause, Play, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { iconMap } from '@/lib/icons';
import { useAgents } from '@/hooks/use-agents';
import { useAgentStore } from '@/stores/agent-store';
import { AgentCard } from './AgentCard';
import { Button } from '@/components/ui/button';

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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Agent Monitor</h2>
          <span className="text-sm text-muted-foreground">
            ({activeAgents.length}/{activeAgents.length + idleAgents.length} active)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Auto-refresh toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleAutoRefresh}
            className={cn(
              'text-xs',
              autoRefresh && 'text-green-500'
            )}
          >
            {autoRefresh ? (
              <>
                <Pause className="h-3.5 w-3.5 mr-1" />
                Auto
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 mr-1" />
                Paused
              </>
            )}
          </Button>

          {/* Manual refresh */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={cn(
                'h-4 w-4 mr-1.5',
                isLoading && 'animate-spin'
              )}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Active Agents Grid */}
        {activeAgents.length > 0 && (
          <section className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Active Agents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeAgents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          </section>
        )}

        {/* No active agents message */}
        {activeAgents.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Moon className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>No agents currently active</p>
            <p className="text-xs mt-1">
              Agents will appear here when activated via CLI
            </p>
          </div>
        )}

        {/* Idle Agents Section */}
        {idleAgents.length > 0 && (
          <section>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <span className="flex-1 h-px bg-border" />
              <span>Idle Agents</span>
              <span className="flex-1 h-px bg-border" />
            </h3>
            <div className="flex flex-wrap gap-3">
              {idleAgents.map((agent) => (
                <div
                  key={agent.id}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full',
                    'bg-muted/50 text-muted-foreground text-sm'
                  )}
                >
                  <span className="h-2 w-2 rounded-full bg-gray-500" />
                  {(() => {
                    const IconComponent = iconMap[agent.icon];
                    return IconComponent ? <IconComponent className="h-4 w-4" /> : null;
                  })()}
                  <span>@{agent.id}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Footer with polling info */}
      <div className="p-2 border-t border-border text-xs text-muted-foreground text-center">
        {autoRefresh ? (
          <span>Auto-refresh every {pollingInterval / 1000}s</span>
        ) : (
          <span>Auto-refresh paused</span>
        )}
      </div>
    </div>
  );
}
