'use client';

import { useState } from 'react';
import { Plus, Files, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/stores/settings-store';
import { MOCK_AGENT_TERMINALS, type MockAgentTerminal } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AGENT_CONFIG } from '@/types';

const CLAUDE_ASCII = `   ████████   ████████
 ██        ██        ██
██  ████  ██  ████  ██
██  ████  ██  ████  ██
 ██        ██        ██
   ████████   ████████`;

interface TerminalCardProps {
  terminal: MockAgentTerminal;
  onClose: () => void;
}

function TerminalCard({ terminal, onClose }: TerminalCardProps) {
  const agentConfig = AGENT_CONFIG[terminal.agentId];
  const agentName = agentConfig?.name || terminal.agentId;

  return (
    <div className="flex flex-col h-full border border-border rounded-lg overflow-hidden bg-[#0d1117]">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#161b22] border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <Badge variant="outline" className="text-xs bg-[#238636]/20 text-[#3fb950] border-[#238636]">
              Claude (MU)
            </Badge>
          </div>
          <Badge className="text-xs bg-[#f78166]/20 text-[#f78166] border-0">
            Claude
          </Badge>
          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <Files className="h-3 w-3" />
            Select task...
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Terminal Content */}
      <div className="flex-1 p-4 font-mono text-xs overflow-auto">
        {/* Claude ASCII Art */}
        <div className="flex items-start gap-4 mb-4">
          <pre className="text-[#58a6ff] text-[10px] leading-tight">{CLAUDE_ASCII}</pre>
          <div className="text-[#8b949e]">
            <div>
              <span className="text-[#f0883e]">Claude Code</span>
              <span className="text-[#8b949e]"> v2.0.69</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">★</span>
              <span>{terminal.model}</span>
              <span className="text-muted-foreground">·</span>
              <span>{terminal.apiType}</span>
            </div>
            <div className="text-muted-foreground">
              {terminal.workingDirectory}
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-dashed border-[#30363d] my-3" />

        {/* Current Prompt */}
        {terminal.lastPrompt && (
          <div className="text-[#7ee787]">
            {terminal.lastPrompt}
          </div>
        )}

        {/* Help hint */}
        <div className="text-[#8b949e] mt-2">
          ? for shortcuts
        </div>
      </div>

      {/* Terminal Footer - Agent indicator */}
      <div className="px-3 py-1.5 bg-[#161b22] border-t border-border">
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: agentConfig?.color || '#888' }}
          />
          <span className="text-xs text-muted-foreground">
            @{agentName}
          </span>
          {terminal.storyId && (
            <>
              <span className="text-muted-foreground">→</span>
              <span className="text-xs text-muted-foreground">
                {terminal.storyId}
              </span>
            </>
          )}
          <span className={cn(
            'ml-auto text-xs',
            terminal.status === 'working' && 'text-green-500',
            terminal.status === 'waiting' && 'text-yellow-500',
            terminal.status === 'idle' && 'text-muted-foreground',
          )}>
            {terminal.status}
          </span>
        </div>
      </div>
    </div>
  );
}

export function TerminalOutput() {
  const { settings } = useSettingsStore();
  const [terminals, setTerminals] = useState<MockAgentTerminal[]>(
    settings.useMockData ? MOCK_AGENT_TERMINALS : []
  );

  const activeTerminals = terminals.filter(t => t.status !== 'idle');
  const totalTerminals = 12; // Max terminals capacity

  const handleCloseTerminal = (id: string) => {
    setTerminals(prev => prev.filter(t => t.id !== id));
  };

  const handleNewTerminal = () => {
    const newTerminal: MockAgentTerminal = {
      id: `term-${Date.now()}`,
      agentId: 'dev',
      model: 'Sonnet 4.5',
      apiType: 'Claude API',
      workingDirectory: '~/Code/aios-core',
      status: 'idle',
      lastPrompt: '> Ready for input...',
    };
    setTerminals(prev => [...prev, newTerminal]);
  };

  if (!settings.useMockData && terminals.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-foreground">No Active Terminals</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Enable Demo Mode in Settings to see sample terminals
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Agent Terminals</h2>
          <span className="text-sm text-muted-foreground">
            {activeTerminals.length} / {totalTerminals} terminals
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleNewTerminal}>
            <Plus className="h-4 w-4 mr-1.5" />
            New Terminal
          </Button>
          <Button variant="outline" size="sm">
            <Files className="h-4 w-4 mr-1.5" />
            Files
          </Button>
        </div>
      </div>

      {/* Terminal Grid */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-fr" style={{ minHeight: '400px' }}>
          {terminals.map(terminal => (
            <div key={terminal.id} className="min-h-[250px]">
              <TerminalCard
                terminal={terminal}
                onClose={() => handleCloseTerminal(terminal.id)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/30">
        <span className="text-xs text-muted-foreground">
          {settings.useMockData ? 'Showing mock terminals' : 'Connected to AIOS'}
        </span>
        <span className="text-xs text-muted-foreground">
          Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">?</kbd> for shortcuts
        </span>
      </div>
    </div>
  );
}
