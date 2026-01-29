'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';
import { iconMap } from '@/lib/icons';
import { AGENT_CONFIG, type TerminalSession } from '@/types';

interface TerminalCardProps {
  terminal: TerminalSession;
  className?: string;
}

// Status styles using CSS variables
const STATUS_STYLES: Record<string, { bg: string; color: string; glow?: string }> = {
  idle: { bg: 'var(--status-idle)', color: 'var(--status-idle)', glow: undefined },
  running: { bg: 'var(--status-success)', color: 'var(--status-success)', glow: 'var(--status-success-glow)' },
  error: { bg: 'var(--status-error)', color: 'var(--status-error)', glow: 'var(--status-error-glow)' },
};

export const TerminalCard = memo(function TerminalCard({
  terminal,
  className,
}: TerminalCardProps) {
  const agentConfig = AGENT_CONFIG[terminal.agentId];
  const XIcon = iconMap['close'];
  const SettingsIcon = iconMap['settings'];
  const statusStyle = STATUS_STYLES[terminal.status] || STATUS_STYLES.idle;

  return (
    <div
      className={cn(
        'border border-l-2 overflow-hidden flex flex-col font-mono text-xs h-full',
        'transition-luxury hover:border-[rgba(255,255,255,0.08)]',
        className
      )}
      style={{
        backgroundColor: 'var(--bg-elevated)',
        borderColor: 'var(--border-subtle)',
        borderLeftColor: agentConfig?.color || 'var(--border-subtle)',
      }}
    >
      {/* Terminal Header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
      >
        <div className="flex items-center gap-2">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{
              backgroundColor: statusStyle.bg,
              boxShadow: statusStyle.glow ? `0 0 8px ${statusStyle.glow}` : undefined,
            }}
          />
          <span className="font-normal text-[11px]" style={{ color: 'var(--text-secondary)' }}>{terminal.name}</span>
          <span
            className="px-1.5 py-0.5 text-[9px] uppercase tracking-wider border"
            style={{
              color: agentConfig?.color,
              borderColor: `${agentConfig?.color}30`,
              backgroundColor: `${agentConfig?.color}10`
            }}
          >
            {terminal.agentId}
          </span>
        </div>
        <div className="flex gap-2" style={{ color: 'var(--text-muted)' }}>
          <button className="transition-colors p-1 hover:opacity-80">
            <SettingsIcon className="h-3 w-3" />
          </button>
          <button className="transition-colors p-1 hover:opacity-80">
            <XIcon className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="p-3 space-y-1 flex-1" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-tertiary)' }}>
        {/* Claude Info Header */}
        <div className="space-y-0.5 pb-2 border-b mb-2" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex gap-2 text-[10px]">
            <span style={{ color: 'var(--border)' }}>*</span>
            <span style={{ color: 'var(--border)' }}>*</span>
            <span style={{ color: 'var(--border)' }}>*</span>
            <span className="font-normal" style={{ color: 'var(--text-primary)' }}>Claude Code</span>
            <span style={{ color: 'var(--accent-gold)' }}>v2.0</span>
          </div>
          <div className="flex gap-2 text-[10px]">
            <span style={{ color: 'var(--border)' }}>*</span>
            <span style={{ color: 'var(--border)' }}>*</span>
            <span style={{ color: 'var(--border)' }}>*</span>
            <span style={{ color: 'var(--text-muted)' }}>{terminal.model} • {terminal.apiType}</span>
          </div>
          <div className="flex gap-2 text-[10px]">
            <span style={{ color: 'var(--border)' }}>*</span>
            <span style={{ color: 'var(--border)' }}>*</span>
            <span style={{ color: 'var(--border)' }}>*</span>
            <span style={{ color: 'var(--text-muted)' }}>{terminal.workingDirectory}</span>
          </div>
        </div>

        {/* Current Command / Prompt */}
        {terminal.currentCommand ? (
          <div className="text-[11px]" style={{ color: 'var(--status-success)' }}>
            <span className="mr-2" style={{ color: 'var(--text-muted)' }}>{'>'}</span>
            {terminal.currentCommand}
          </div>
        ) : (
          <div className="italic text-[10px]" style={{ color: 'var(--border)' }}>Awaiting input...</div>
        )}

        {/* Story Info */}
        {terminal.storyId && (
          <div className="text-[10px] mt-3 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
            <span className="uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Story:</span>
            <span className="ml-2" style={{ color: 'var(--text-secondary)' }}>{terminal.storyId}</span>
          </div>
        )}
      </div>

      {/* Terminal Footer - Status */}
      <div
        className="px-3 py-2 border-t flex items-center justify-between"
        style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
      >
        <div className="flex items-center gap-2">
          <span
            className="h-1 w-1 rounded-full"
            style={{
              backgroundColor: statusStyle.bg,
              boxShadow: statusStyle.glow ? `0 0 8px ${statusStyle.glow}` : undefined,
            }}
          />
          <span className="text-[10px] uppercase tracking-wider" style={{ color: statusStyle.color }}>
            {terminal.status}
          </span>
        </div>
        <div
          className="h-5 w-5 flex items-center justify-center text-[8px] font-medium border"
          style={{
            backgroundColor: `${agentConfig?.color}15`,
            borderColor: `${agentConfig?.color}30`,
            color: agentConfig?.color,
          }}
        >
          {terminal.agentId.slice(0, 2).toUpperCase()}
        </div>
      </div>
    </div>
  );
});
