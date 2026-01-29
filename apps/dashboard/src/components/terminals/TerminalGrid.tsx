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
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <TerminalIcon className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Active Terminals</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Enable Demo Mode in Settings to see sample terminals.
        </p>
        <Button variant="outline" size="sm">
          <PlusIcon className="h-4 w-4 mr-1.5" />
          New Terminal
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('h-full flex flex-col', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <TerminalIcon className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Agent Terminals</h2>
          </div>
          <span className="text-sm text-muted-foreground">
            {activeCount} active / {totalCount} total
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Layout Toggle */}
          <div className="flex items-center bg-muted rounded-md p-0.5">
            <button
              onClick={() => setLayout('grid')}
              className={cn(
                'p-1.5 rounded transition-colors',
                layout === 'grid'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              title="Grid view"
            >
              <GridIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setLayout('list')}
              className={cn(
                'p-1.5 rounded transition-colors',
                layout === 'list'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              title="List view"
            >
              <ListIcon className="h-4 w-4" />
            </button>
          </div>

          <Button variant="outline" size="sm">
            <CopyIcon className="h-4 w-4 mr-1.5" />
            Files
          </Button>

          <Button variant="outline" size="sm">
            <PlusIcon className="h-4 w-4 mr-1.5" />
            New Terminal
            <kbd className="ml-2 text-[10px] bg-muted px-1 rounded text-muted-foreground">
              ⌘T
            </kbd>
          </Button>
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
      <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/30">
        <span className="text-xs text-muted-foreground">
          {settings.useMockData ? 'Showing demo terminals' : 'Connected to AIOS'}
        </span>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>
            Capacity: {totalCount}/{maxTerminals}
          </span>
          <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all',
                totalCount / maxTerminals > 0.8 ? 'bg-yellow-500' : 'bg-green-500'
              )}
              style={{ width: `${(totalCount / maxTerminals) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
