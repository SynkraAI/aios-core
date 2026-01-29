'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Grid2X2, Rows3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTerminalStore } from '@/stores/terminal-store';
import { useSettingsStore } from '@/stores/settings-store';
import { TerminalStream, TerminalOutput } from '@/components/terminals';
import { Button } from '@/components/ui/button';
import { AGENT_CONFIG, type AgentId } from '@/types';

type ViewMode = 'grid' | 'single';

const AVAILABLE_AGENTS: (AgentId | 'main')[] = ['main', 'dev', 'qa', 'architect', 'pm', 'devops'];

export default function TerminalsPage() {
  const { settings } = useSettingsStore();
  const {
    terminals,
    activeTerminalId,
    createTerminal,
    removeTerminal,
    setActiveTerminal,
    getAllTerminals,
  } = useTerminalStore();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const isInitializedRef = useRef(false);

  // Initialize with default terminal on first render
  useEffect(() => {
    if (!isInitializedRef.current && !settings.useMockData) {
      const allTerminals = getAllTerminals();
      if (allTerminals.length === 0) {
        createTerminal('main');
      }
      isInitializedRef.current = true;
    }
  }, [settings.useMockData, getAllTerminals, createTerminal]);

  // Handle new terminal
  const handleNewTerminal = useCallback((agentId: AgentId | 'main' = 'main') => {
    const id = createTerminal(agentId);
    setActiveTerminal(id);
  }, [createTerminal, setActiveTerminal]);

  // Handle close terminal
  const handleCloseTerminal = useCallback((id: string) => {
    removeTerminal(id);
  }, [removeTerminal]);

  // If using mock data, show the old TerminalOutput
  if (settings.useMockData) {
    return (
      <div className="h-full flex flex-col p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold">Agent Terminals</h1>
            <p className="text-sm text-muted-foreground">
              View agent execution logs and output
            </p>
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <TerminalOutput />
        </div>
      </div>
    );
  }

  const allTerminals = Object.values(terminals);
  const activeTerminal = activeTerminalId ? terminals[activeTerminalId] : null;

  return (
    <div className="h-full flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold">Agent Terminals</h1>
          <p className="text-sm text-muted-foreground">
            Real-time log streaming from AIOS agents
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center border border-border rounded-md">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'px-2 py-1.5 rounded-l-md transition-colors',
                viewMode === 'grid' ? 'bg-accent' : 'hover:bg-muted'
              )}
              title="Grid View"
            >
              <Grid2X2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('single')}
              className={cn(
                'px-2 py-1.5 rounded-r-md transition-colors',
                viewMode === 'single' ? 'bg-accent' : 'hover:bg-muted'
              )}
              title="Single View"
            >
              <Rows3 className="h-4 w-4" />
            </button>
          </div>

          {/* New Terminal Dropdown */}
          <div className="relative group">
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1.5" />
              New Terminal
            </Button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-10">
              <div className="bg-popover border border-border rounded-md shadow-lg py-1 min-w-[150px]">
                {AVAILABLE_AGENTS.map((agentId) => (
                  <button
                    key={agentId}
                    onClick={() => handleNewTerminal(agentId)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center gap-2"
                  >
                    {agentId === 'main' ? (
                      <>
                        <span className="h-2 w-2 rounded-full bg-gray-500" />
                        Main Logs
                      </>
                    ) : (
                      <>
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: AGENT_CONFIG[agentId].color }}
                        />
                        {AGENT_CONFIG[agentId].name}
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {allTerminals.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-medium">No Active Terminals</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Click &quot;New Terminal&quot; to start streaming agent logs
            </p>
            <Button
              className="mt-4"
              onClick={() => handleNewTerminal('main')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Terminal
            </Button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="flex-1 overflow-auto">
          <div
            className={cn(
              'grid gap-4 h-full',
              allTerminals.length === 1 && 'grid-cols-1',
              allTerminals.length === 2 && 'grid-cols-2',
              allTerminals.length >= 3 && 'grid-cols-2 xl:grid-cols-3'
            )}
            style={{ minHeight: '400px' }}
          >
            {allTerminals.map((terminal) => (
              <div key={terminal.id} className="min-h-[300px]">
                <TerminalStream
                  terminalId={terminal.id}
                  onClose={() => handleCloseTerminal(terminal.id)}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Terminal tabs */}
          <div className="flex items-center gap-1 border-b border-border pb-2 mb-2 overflow-x-auto">
            {allTerminals.map((terminal) => {
              const agentConfig = terminal.agentId !== 'main'
                ? AGENT_CONFIG[terminal.agentId as AgentId]
                : null;
              return (
                <button
                  key={terminal.id}
                  onClick={() => setActiveTerminal(terminal.id)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm whitespace-nowrap',
                    terminal.id === activeTerminalId
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-muted'
                  )}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: agentConfig?.color || '#888' }}
                  />
                  {agentConfig?.name || 'Main'} Logs
                </button>
              );
            })}
          </div>

          {/* Active terminal */}
          <div className="flex-1 min-h-0">
            {activeTerminal ? (
              <TerminalStream
                terminalId={activeTerminal.id}
                onClose={() => handleCloseTerminal(activeTerminal.id)}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Select a terminal
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer info */}
      <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
        <p>
          <strong>Note:</strong> Terminals stream logs from <code>.aios/logs/</code>.
          Make sure AIOS CLI is writing to agent-specific log files.
        </p>
      </div>
    </div>
  );
}
