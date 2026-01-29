'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { iconMap, type IconName } from '@/lib/icons';
import { KANBAN_COLUMNS, type Story, type StoryStatus } from '@/types';
import { SortableStoryCard } from './SortableStoryCard';

// Column color styles - using CSS variables
const COLUMN_COLORS: Record<string, { border: string; text: string; bg: string }> = {
  gray: { border: 'var(--status-idle)', text: 'var(--status-idle)', bg: 'var(--status-idle-bg)' },
  blue: { border: 'var(--status-info)', text: 'var(--status-info)', bg: 'var(--status-info-bg)' },
  purple: { border: 'var(--phase-review)', text: 'var(--phase-review)', bg: 'var(--phase-review-bg)' },
  yellow: { border: 'var(--status-warning)', text: 'var(--status-warning)', bg: 'var(--status-warning-bg)' },
  cyan: { border: 'var(--phase-pr)', text: 'var(--phase-pr)', bg: 'var(--phase-pr-bg)' },
  green: { border: 'var(--status-success)', text: 'var(--status-success)', bg: 'var(--status-success-bg)' },
  red: { border: 'var(--status-error)', text: 'var(--status-error)', bg: 'var(--status-error-bg)' },
};

interface KanbanColumnProps {
  status: StoryStatus;
  stories: Story[];
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onStoryClick?: (story: Story) => void;
  onAddStory?: () => void;
}

export function KanbanColumn({
  status,
  stories,
  isCollapsed = false,
  onToggleCollapse,
  onStoryClick,
  onAddStory,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  const column = KANBAN_COLUMNS.find((c) => c.id === status);
  if (!column) return null;

  const colorStyle = COLUMN_COLORS[column.color] || COLUMN_COLORS.gray;

  return (
    <div
      className={cn(
        'flex flex-col min-w-[280px] max-w-[320px] border border-l-2 transition-luxury',
        isOver && 'border-[rgba(201,178,152,0.3)]'
      )}
      style={{
        backgroundColor: isOver ? 'var(--accent-gold-bg)' : 'var(--bg-surface)',
        borderColor: 'var(--border-subtle)',
        borderLeftColor: colorStyle.border,
      }}
    >
      {/* Column Header */}
      <div
        className="flex items-center justify-between p-3 border-b"
        style={{ borderColor: 'var(--border-subtle)', backgroundColor: colorStyle.bg }}
      >
        <div className="flex items-center gap-2">
          {/* Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className="p-0.5 transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            {isCollapsed ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>

          {/* Icon & Label */}
          {(() => {
            const IconComponent = iconMap[column.icon];
            return IconComponent ? (
              <IconComponent className="h-3.5 w-3.5" style={{ color: colorStyle.text }} />
            ) : null;
          })()}
          <span className="font-light text-sm" style={{ color: 'var(--text-secondary)' }}>{column.label}</span>

          {/* Count Badge */}
          <span
            className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-[10px] font-medium"
            style={{ backgroundColor: 'var(--border-subtle)', color: 'var(--text-tertiary)' }}
          >
            {stories.length}
          </span>
        </div>

        {/* Add Button */}
        {onAddStory && (
          <button
            onClick={onAddStory}
            className="p-1 transition-colors hover:opacity-80"
            style={{ color: 'var(--text-muted)' }}
            title={`Add new story to ${column.label}`}
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Column Content */}
      {!isCollapsed && (
        <div
          ref={setNodeRef}
          className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[200px] max-h-[calc(100vh-220px)] scrollbar-refined"
        >
          <SortableContext
            items={stories.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {stories.length > 0 ? (
              stories.map((story) => (
                <SortableStoryCard
                  key={story.id}
                  story={story}
                  onClick={() => onStoryClick?.(story)}
                />
              ))
            ) : (
              // Empty State (AC8)
              <EmptyColumnState status={status} />
            )}
          </SortableContext>
        </div>
      )}
    </div>
  );
}

// Empty state component with professional icons
function EmptyColumnState({ status }: { status: StoryStatus }) {
  const messages: Record<StoryStatus, { icon: IconName; text: string }> = {
    backlog: { icon: 'file-text', text: 'No stories in backlog' },
    in_progress: { icon: 'play', text: 'No stories in progress' },
    ai_review: { icon: 'bot', text: 'No stories for AI review' },
    human_review: { icon: 'user', text: 'No stories for review' },
    pr_created: { icon: 'git-pull-request', text: 'No PRs pending' },
    done: { icon: 'check-circle', text: 'No completed stories' },
    error: { icon: 'x-circle', text: 'No errors' },
  };

  const { icon, text } = messages[status];
  const IconComponent = iconMap[icon];

  return (
    <div className="flex flex-col items-center justify-center py-8">
      {IconComponent && <IconComponent className="h-6 w-6 mb-2" style={{ color: 'var(--border)' }} />}
      <span className="text-[11px] font-light" style={{ color: 'var(--text-muted)' }}>{text}</span>
    </div>
  );
}
