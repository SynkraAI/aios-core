'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';
import { iconMap } from '@/lib/icons';
import { StatusDot } from '@/components/ui/status-badge';
import { AGENT_CONFIG, type TerminalSession } from '@/types';

interface TerminalCardProps {
  terminal: TerminalSession;
  className?: string;
}

export const TerminalCard = memo(function TerminalCard({
  terminal,
  className,
}: TerminalCardProps) {
  const agentConfig = AGENT_CONFIG[terminal.agentId];
  const XIcon = iconMap['close'];
  const SettingsIcon = iconMap['settings'];

  return (
    <div
      className={cn(
        'bg-[#09090b] border border-zinc-800 rounded-lg overflow-hidden flex flex-col font-mono text-xs h-full',
        'hover:border-zinc-700 transition-colors',
        className
      )}
    >
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <StatusDot status={terminal.status} size="md" />
          <span className="text-zinc-300 font-bold">{terminal.name}</span>
          <span className="text-zinc-600 px-1 border border-zinc-700 rounded bg-zinc-950 text-[9px] uppercase">
            {terminal.agentId}
          </span>
        </div>
        <div className="flex gap-2 text-zinc-500">
          <button className="hover:text-zinc-300 transition-colors">
            <SettingsIcon className="h-3 w-3" />
          </button>
          <button className="hover:text-zinc-300 transition-colors">
            <XIcon className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="p-3 text-zinc-400 space-y-1 flex-1 bg-black/50">
        {/* Claude Info Header */}
        <div className="space-y-0.5 pb-2 border-b border-zinc-800/50 mb-2">
          <div className="flex gap-2">
            <span className="text-zinc-600">*</span>
            <span className="text-zinc-600">*</span>
            <span className="text-zinc-600">*</span>
            <span className="text-white font-bold">Claude Code v2.0.69</span>
          </div>
          <div className="flex gap-2">
            <span className="text-zinc-600">*</span>
            <span className="text-zinc-600">*</span>
            <span className="text-zinc-600">*</span>
            <span>{terminal.model} • {terminal.apiType}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-zinc-600">*</span>
            <span className="text-zinc-600">*</span>
            <span className="text-zinc-600">*</span>
            <span className="text-zinc-500">{terminal.workingDirectory}</span>
          </div>
        </div>

        {/* Current Command / Prompt */}
        {terminal.currentCommand ? (
          <div className="text-green-400">
            <span className="text-zinc-500 mr-2">{'>'}</span>
            Try "{terminal.currentCommand}"
          </div>
        ) : (
          <div className="text-zinc-600 italic">Waiting for input...</div>
        )}

        {/* Story Info */}
        {terminal.storyId && (
          <div className="text-zinc-600 text-[10px] mt-2">
            Working on: <span className="text-zinc-400">{terminal.storyId}</span>
          </div>
        )}

        {/* Help hint */}
        <div className="text-zinc-600 mt-2">? for shortcuts</div>
      </div>

      {/* Terminal Footer - Status */}
      <div className="px-3 py-1.5 bg-zinc-900/50 border-t border-zinc-800 flex items-center justify-between">
        <span
          className={cn(
            'text-[10px] font-medium',
            terminal.status === 'running' && 'text-yellow-400',
            terminal.status === 'idle' && 'text-zinc-500',
            terminal.status === 'error' && 'text-red-400'
          )}
        >
          {terminal.status === 'running' && '● Running'}
          {terminal.status === 'idle' && '○ Idle'}
          {terminal.status === 'error' && '✕ Error'}
        </span>
        <div
          className="h-4 w-4 rounded flex items-center justify-center text-[8px] font-bold border"
          style={{
            backgroundColor: `color-mix(in srgb, ${agentConfig.color} 20%, transparent)`,
            borderColor: `color-mix(in srgb, ${agentConfig.color} 50%, transparent)`,
            color: agentConfig.color,
          }}
        >
          {terminal.agentId.slice(0, 2).toUpperCase()}
        </div>
      </div>
    </div>
  );
});
