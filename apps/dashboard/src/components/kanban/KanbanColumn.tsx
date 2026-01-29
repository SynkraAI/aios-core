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

// Column color styles
const COLUMN_COLORS: Record<string, string> = {
  gray: 'border-t-gray-500',
  blue: 'border-t-blue-500',
  purple: 'border-t-purple-500',
  yellow: 'border-t-yellow-500',
  cyan: 'border-t-cyan-500',
  green: 'border-t-green-500',
  red: 'border-t-red-500',
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

  return (
    <div
      className={cn(
        'flex flex-col min-w-[280px] max-w-[320px] bg-muted/30 rounded-lg border border-border',
        'border-t-4',
        COLUMN_COLORS[column.color] || 'border-t-gray-500',
        isOver && 'ring-2 ring-primary/50'
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          {/* Collapse Toggle (AC7) */}
          <button
            onClick={onToggleCollapse}
            className="p-0.5 hover:bg-accent rounded transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {/* Icon & Label */}
          {(() => {
            const IconComponent = iconMap[column.icon];
            return IconComponent ? (
              <IconComponent className="h-4 w-4 text-muted-foreground" />
            ) : null;
          })()}
          <span className="font-medium text-sm">{column.label}</span>

          {/* Count Badge (AC3) */}
          <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-muted text-xs font-medium">
            {stories.length}
          </span>
        </div>

        {/* Add Button (only for backlog) */}
        {status === 'backlog' && onAddStory && (
          <button
            onClick={onAddStory}
            className={cn(
              'p-1 rounded hover:bg-accent transition-colors',
              'text-muted-foreground hover:text-foreground'
            )}
            title="Add new story"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Column Content */}
      {!isCollapsed && (
        <div
          ref={setNodeRef}
          className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[200px] max-h-[calc(100vh-220px)]"
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
    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
      {IconComponent && <IconComponent className="h-8 w-8 mb-2 opacity-50" />}
      <span className="text-xs">{text}</span>
    </div>
  );
}
