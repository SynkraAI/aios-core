'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { iconMap } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { RoadmapCard } from './RoadmapCard';
import { PriorityTag } from '@/components/ui/tag';
import { useSettingsStore } from '@/stores/settings-store';
import { MOCK_ROADMAP_ITEMS } from '@/lib/mock-data';
import { ROADMAP_PRIORITY_CONFIG, type RoadmapItem, type RoadmapPriority } from '@/types';

type FilterMode = 'all' | 'priority' | 'impact';

interface RoadmapViewProps {
  className?: string;
}

export function RoadmapView({ className }: RoadmapViewProps) {
  const { settings } = useSettingsStore();
  const [filterMode, setFilterMode] = useState<FilterMode>('all');

  // In a real app, this would come from a roadmap store
  const items: RoadmapItem[] = settings.useMockData ? MOCK_ROADMAP_ITEMS : [];

  const MapIcon = iconMap['map'];
  const PlusIcon = iconMap['plus'];
  const RefreshIcon = iconMap['refresh'];

  // Group items by priority
  const groupedItems = useMemo(() => {
    const groups: Record<RoadmapPriority, RoadmapItem[]> = {
      must_have: [],
      should_have: [],
      could_have: [],
      wont_have: [],
    };

    items.forEach((item) => {
      groups[item.priority].push(item);
    });

    return groups;
  }, [items]);

  // Filter buttons
  const filterButtons: { id: FilterMode; label: string }[] = [
    { id: 'all', label: 'All Features' },
    { id: 'priority', label: 'By Priority' },
    { id: 'impact', label: 'By Impact' },
  ];

  if (!settings.useMockData || items.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <MapIcon className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Roadmap Items</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Enable Demo Mode in Settings to see sample roadmap.
        </p>
        <Button variant="outline" size="sm">
          <PlusIcon className="h-4 w-4 mr-1.5" />
          Add Feature
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
            <MapIcon className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Roadmap</h2>
          </div>
          <span className="text-sm text-muted-foreground">{items.length} features</span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <PlusIcon className="h-4 w-4 mr-1.5" />
            Add Feature
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-1 bg-background p-1 rounded-lg w-fit border border-border">
          {filterButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilterMode(btn.id)}
              className={cn(
                'px-3 py-1.5 rounded text-xs font-medium transition-colors',
                filterMode === btn.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
          {/* Must Have */}
          <PrioritySection
            priority="must_have"
            items={groupedItems.must_have}
            config={ROADMAP_PRIORITY_CONFIG.must_have}
          />

          {/* Should Have */}
          <PrioritySection
            priority="should_have"
            items={groupedItems.should_have}
            config={ROADMAP_PRIORITY_CONFIG.should_have}
          />

          {/* Could Have */}
          <PrioritySection
            priority="could_have"
            items={groupedItems.could_have}
            config={ROADMAP_PRIORITY_CONFIG.could_have}
          />

          {/* Won't Have */}
          <PrioritySection
            priority="wont_have"
            items={groupedItems.wont_have}
            config={ROADMAP_PRIORITY_CONFIG.wont_have}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/30">
        <span className="text-xs text-muted-foreground">
          {settings.useMockData ? 'Showing demo roadmap' : 'Connected to AIOS'}
        </span>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            Must: {groupedItems.must_have.length}
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-yellow-500" />
            Should: {groupedItems.should_have.length}
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            Could: {groupedItems.could_have.length}
          </span>
        </div>
      </div>
    </div>
  );
}

// Priority Section Component
interface PrioritySectionProps {
  priority: RoadmapPriority;
  items: RoadmapItem[];
  config: { label: string; color: string };
}

function PrioritySection({ priority, items, config }: PrioritySectionProps) {
  const colorStyles: Record<string, string> = {
    red: 'text-red-400 bg-red-900/10 border-red-900/30',
    yellow: 'text-yellow-400 bg-yellow-900/10 border-yellow-900/30',
    blue: 'text-blue-400 bg-blue-900/10 border-blue-900/30',
    gray: 'text-zinc-500 bg-zinc-900 border-zinc-800',
  };

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-2">
        <span
          className={cn(
            'text-xs font-bold px-2 py-0.5 rounded border',
            colorStyles[config.color]
          )}
        >
          {config.label}
        </span>
        <span className="text-zinc-600 text-xs">{items.length} features</span>
      </div>

      {/* Cards */}
      {items.length > 0 ? (
        items.map((item) => <RoadmapCard key={item.id} item={item} />)
      ) : (
        <div className="h-24 border border-dashed border-zinc-800 rounded-lg flex items-center justify-center text-zinc-700 text-xs italic">
          Empty list
        </div>
      )}
    </div>
  );
}
