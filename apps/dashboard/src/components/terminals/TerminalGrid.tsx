'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { iconMap } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { TerminalCard } from './TerminalCard';
import { useSettingsStore } from '@/stores/settings-store';
import { MOCK_TERMINAL_SESSIONS } from '@/lib/mock-data';
import type { TerminalSession } from '@/types';

interface TerminalGridProps {
  className?: string;
}

export function TerminalGrid({ className }: TerminalGridProps) {
  const { settings } = useSettingsStore();
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');

  // In a real app, this would come from a terminals store
  const terminals: TerminalSession[] = settings.useMockData ? MOCK_TERMINAL_SESSIONS : [];

  const activeCount = terminals.filter((t) => t.status === 'running').length;
  const totalCount = terminals.length;
  const maxTerminals = 12;

  const TerminalIcon = iconMap['terminal'];
  const PlusIcon = iconMap['plus'];
  const CopyIcon = iconMap['copy'];
  const GridIcon = iconMap['kanban'];
  const ListIcon = iconMap['menu'];
  const RefreshIcon = iconMap['refresh'];

  if (!settings.useMockData || terminals.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center" style={{ backgroundColor: 'var(--bg-base)' }}>
        <TerminalIcon className="h-8 w-8 mb-4" style={{ color: 'var(--border)' }} />
        <h3 className="text-sm font-light mb-1" style={{ color: 'var(--text-tertiary)' }}>No Active Terminals</h3>
        <p className="text-[11px] mb-4" style={{ color: 'var(--text-muted)' }}>
          Enable Demo Mode in Settings to see sample terminals.
        </p>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] border transition-luxury hover:opacity-80" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>
          <PlusIcon className="h-3 w-3" />
          New Terminal
        </button>
      </div>
    );
  }

  return (
    <div className={cn('h-full flex flex-col', className)} style={{ backgroundColor: 'var(--bg-base)' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] block mb-1" style={{ color: 'var(--accent-gold)' }}>Terminals</span>
            <h2 className="text-sm font-light" style={{ color: 'var(--text-primary)' }}>Agent Sessions</h2>
          </div>
          <div className="h-8 w-px" style={{ backgroundColor: 'var(--border-subtle)' }} />
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-light" style={{ color: 'var(--text-primary)' }}>{activeCount}</span>
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>/ {totalCount} active</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Layout Toggle */}
          <div className="flex items-center p-0.5 border" style={{ backgroundColor: 'var(--bg-hover)', borderColor: 'var(--border-subtle)' }}>
            <button
              onClick={() => setLayout('grid')}
              className="p-1.5 transition-luxury"
              style={{
                backgroundColor: layout === 'grid' ? 'var(--accent-gold-bg)' : 'transparent',
                color: layout === 'grid' ? 'var(--accent-gold)' : 'var(--text-muted)',
              }}
              title="Grid view"
            >
              <GridIcon className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setLayout('list')}
              className="p-1.5 transition-luxury"
              style={{
                backgroundColor: layout === 'list' ? 'var(--accent-gold-bg)' : 'transparent',
                color: layout === 'list' ? 'var(--accent-gold)' : 'var(--text-muted)',
              }}
              title="List view"
            >
              <ListIcon className="h-3.5 w-3.5" />
            </button>
          </div>

          <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] border transition-luxury hover:opacity-80" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>
            <PlusIcon className="h-3 w-3" />
            New Terminal
            <kbd className="ml-2 text-[9px] px-1 border" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>⌘T</kbd>
          </button>
        </div>
      </div>

      {/* Terminal Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div
          className={cn(
            layout === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[280px]'
              : 'flex flex-col gap-3'
          )}
        >
          {terminals.map((terminal) => (
            <TerminalCard
              key={terminal.id}
              terminal={terminal}
              className={layout === 'list' ? 'h-auto min-h-[200px]' : undefined}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-elevated)' }}>
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          {settings.useMockData ? 'Demo Mode' : 'Connected to AIOS'}
        </span>
        <div className="flex items-center gap-3 text-[10px]" style={{ color: 'var(--text-muted)' }}>
          <span className="uppercase tracking-wider">
            Capacity: {totalCount}/{maxTerminals}
          </span>
          <div className="h-1 w-24 overflow-hidden" style={{ backgroundColor: 'var(--border-subtle)' }}>
            <div
              className="h-full transition-luxury"
              style={{
                width: `${(totalCount / maxTerminals) * 100}%`,
                backgroundColor: totalCount / maxTerminals > 0.8 ? 'var(--status-warning)' : 'var(--status-success)'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
