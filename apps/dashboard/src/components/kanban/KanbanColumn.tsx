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

// Column color styles - refined with left accent
const COLUMN_COLORS: Record<string, { border: string; text: string; bg: string }> = {
  gray: { border: 'border-l-[#6B6B5F]', text: 'text-[#6B6B5F]', bg: 'bg-[rgba(107,107,95,0.05)]' },
  blue: { border: 'border-l-[#60A5FA]', text: 'text-[#60A5FA]', bg: 'bg-[rgba(96,165,250,0.05)]' },
  purple: { border: 'border-l-[#A78BFA]', text: 'text-[#A78BFA]', bg: 'bg-[rgba(167,139,250,0.05)]' },
  yellow: { border: 'border-l-[#FBBF24]', text: 'text-[#FBBF24]', bg: 'bg-[rgba(251,191,36,0.05)]' },
  cyan: { border: 'border-l-[#22D3EE]', text: 'text-[#22D3EE]', bg: 'bg-[rgba(34,211,238,0.05)]' },
  green: { border: 'border-l-[#4ADE80]', text: 'text-[#4ADE80]', bg: 'bg-[rgba(74,222,128,0.05)]' },
  red: { border: 'border-l-[#F87171]', text: 'text-[#F87171]', bg: 'bg-[rgba(248,113,113,0.05)]' },
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
        'flex flex-col min-w-[280px] max-w-[320px] bg-[#0a0a0a]',
        'border border-[rgba(255,255,255,0.04)] border-l-2',
        colorStyle.border,
        'transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
        isOver && 'border-[rgba(201,178,152,0.3)] bg-[rgba(201,178,152,0.02)]'
      )}
    >
      {/* Column Header */}
      <div className={cn(
        "flex items-center justify-between p-3 border-b border-[rgba(255,255,255,0.04)]",
        colorStyle.bg
      )}>
        <div className="flex items-center gap-2">
          {/* Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className="p-0.5 hover:bg-[rgba(255,255,255,0.05)] transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="h-3.5 w-3.5 text-[#4A4A42]" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-[#4A4A42]" />
            )}
          </button>

          {/* Icon & Label */}
          {(() => {
            const IconComponent = iconMap[column.icon];
            return IconComponent ? (
              <IconComponent className={cn("h-3.5 w-3.5", colorStyle.text)} />
            ) : null;
          })()}
          <span className="font-light text-sm text-[#A8A89C]">{column.label}</span>

          {/* Count Badge */}
          <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 bg-[rgba(255,255,255,0.04)] text-[10px] font-medium text-[#6B6B5F]">
            {stories.length}
          </span>
        </div>

        {/* Add Button */}
        {onAddStory && (
          <button
            onClick={onAddStory}
            className={cn(
              'p-1 hover:bg-[rgba(255,255,255,0.05)] transition-colors',
              'text-[#4A4A42] hover:text-[#A8A89C]'
            )}
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
      {IconComponent && <IconComponent className="h-6 w-6 mb-2 text-[#2A2A2A]" />}
      <span className="text-[11px] text-[#4A4A42] font-light">{text}</span>
    </div>
  );
}
