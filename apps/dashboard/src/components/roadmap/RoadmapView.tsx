'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { iconMap } from '@/lib/icons';
import { RoadmapCard } from './RoadmapCard';
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
    { id: 'all', label: 'All' },
    { id: 'priority', label: 'Priority' },
    { id: 'impact', label: 'Impact' },
  ];

  if (!settings.useMockData || items.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center" style={{ backgroundColor: 'var(--bg-base)' }}>
        <MapIcon className="h-8 w-8 mb-4" style={{ color: 'var(--border)' }} />
        <h3 className="text-sm font-light mb-1" style={{ color: 'var(--text-tertiary)' }}>No Roadmap Items</h3>
        <p className="text-[11px] mb-4" style={{ color: 'var(--text-muted)' }}>
          Enable Demo Mode in Settings to see sample roadmap.
        </p>
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] border transition-luxury hover:opacity-80"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
        >
          <PlusIcon className="h-3 w-3" />
          Add Feature
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
            <span className="text-[10px] uppercase tracking-[0.2em] block mb-1" style={{ color: 'var(--accent-gold)' }}>Planning</span>
            <h2 className="text-sm font-light" style={{ color: 'var(--text-primary)' }}>Product Roadmap</h2>
          </div>
          <div className="h-8 w-px" style={{ backgroundColor: 'var(--border-subtle)' }} />
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-light" style={{ color: 'var(--text-primary)' }}>{items.length}</span>
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>features</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] border transition-luxury hover:opacity-80"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
          >
            <PlusIcon className="h-3 w-3" />
            Add Feature
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-elevated)' }}>
        <div className="flex items-center gap-1 p-0.5 w-fit border" style={{ backgroundColor: 'var(--bg-hover)', borderColor: 'var(--border-subtle)' }}>
          {filterButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilterMode(btn.id)}
              className="px-3 py-1.5 text-[11px] font-medium transition-luxury"
              style={{
                backgroundColor: filterMode === btn.id ? 'var(--accent-gold-bg)' : 'transparent',
                color: filterMode === btn.id ? 'var(--accent-gold)' : 'var(--text-muted)',
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-refined">
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
      <div className="flex items-center justify-between px-4 py-2 border-t" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-elevated)' }}>
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          {settings.useMockData ? 'Demo Mode' : 'Connected to AIOS'}
        </span>
        <div className="flex items-center gap-4 text-[10px]">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--priority-must)' }} />
            <span className="uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Must</span>
            <span style={{ color: 'var(--text-tertiary)' }}>{groupedItems.must_have.length}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--priority-should)' }} />
            <span className="uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Should</span>
            <span style={{ color: 'var(--text-tertiary)' }}>{groupedItems.should_have.length}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--priority-could)' }} />
            <span className="uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Could</span>
            <span style={{ color: 'var(--text-tertiary)' }}>{groupedItems.could_have.length}</span>
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

const PRIORITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  red: { bg: 'var(--priority-must-bg)', text: 'var(--priority-must)', border: 'var(--priority-must-border)' },
  yellow: { bg: 'var(--priority-should-bg)', text: 'var(--priority-should)', border: 'var(--priority-should-border)' },
  blue: { bg: 'var(--priority-could-bg)', text: 'var(--priority-could)', border: 'var(--priority-could-border)' },
  gray: { bg: 'var(--priority-wont-bg)', text: 'var(--priority-wont)', border: 'var(--priority-wont-border)' },
};

function PrioritySection({ priority, items, config }: PrioritySectionProps) {
  const colors = PRIORITY_COLORS[config.color] || PRIORITY_COLORS.gray;

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-3">
        <span
          className="text-[10px] font-medium uppercase tracking-wider px-2 py-1 border"
          style={{
            backgroundColor: colors.bg,
            color: colors.text,
            borderColor: colors.border,
          }}
        >
          {config.label}
        </span>
        <div className="flex-1 h-px" style={{ backgroundColor: colors.border }} />
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{items.length}</span>
      </div>

      {/* Cards */}
      <div className="space-y-2">
        {items.length > 0 ? (
          items.map((item) => <RoadmapCard key={item.id} item={item} />)
        ) : (
          <div
            className="h-20 border border-dashed flex items-center justify-center text-[11px] italic"
            style={{ borderColor: 'var(--border)', color: 'var(--border)' }}
          >
            No items
          </div>
        )}
      </div>
    </div>
  );
}
