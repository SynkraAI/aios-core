'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Plus, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStoryStore } from '@/stores/story-store';
import { KANBAN_COLUMNS, type Story, type StoryStatus } from '@/types';
import { StoryCard, StoryCreateModal, StoryEditModal } from '@/components/stories';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  onStoryClick?: (story: Story) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function KanbanBoard({
  onStoryClick,
  onRefresh,
  isLoading = false,
  className,
}: KanbanBoardProps) {
  const { getStoriesByStatus, moveStory, reorderInColumn, getStoryById, addStory, updateStory, deleteStory } =
    useStoryStore();

  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [collapsedColumns, setCollapsedColumns] = useState<Set<StoryStatus>>(
    new Set()
  );

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createModalStatus, setCreateModalStatus] = useState<StoryStatus>('backlog');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Toggle column collapse
  const toggleColumnCollapse = useCallback((status: StoryStatus) => {
    setCollapsedColumns((prev) => {
      const next = new Set(prev);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      return next;
    });
  }, []);

  // Open create modal with optional default status
  const handleOpenCreateModal = useCallback((status: StoryStatus = 'backlog') => {
    setCreateModalStatus(status);
    setShowCreateModal(true);
  }, []);

  // Handle story created
  const handleStoryCreated = useCallback((story: Story) => {
    addStory(story);
    onRefresh?.();
  }, [addStory, onRefresh]);

  // Open edit modal
  const handleOpenEditModal = useCallback((story: Story) => {
    setEditingStory(story);
    setShowEditModal(true);
  }, []);

  // Handle story updated
  const handleStoryUpdated = useCallback((story: Story) => {
    updateStory(story.id, story);
    onRefresh?.();
  }, [updateStory, onRefresh]);

  // Handle story deleted
  const handleStoryDeleted = useCallback((storyId: string) => {
    deleteStory(storyId);
    onRefresh?.();
  }, [deleteStory, onRefresh]);

  // Handle story click - opens edit modal or calls onStoryClick
  const handleStoryClick = useCallback((story: Story) => {
    if (onStoryClick) {
      onStoryClick(story);
    } else {
      handleOpenEditModal(story);
    }
  }, [onStoryClick, handleOpenEditModal]);

  // Drag handlers
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const story = getStoryById(active.id as string);
      if (story) {
        setActiveStory(story);
      }
    },
    [getStoryById]
  );

  const handleDragOver = useCallback((_event: DragOverEvent) => {
    // Visual feedback is handled by the column's isOver state
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveStory(null);

      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;
      const activeStory = getStoryById(activeId);

      if (!activeStory) return;

      // Determine target status
      let targetStatus: StoryStatus;
      let targetIndex: number | undefined;

      // Check if dropped on a column
      if (KANBAN_COLUMNS.some((col) => col.id === overId)) {
        targetStatus = overId as StoryStatus;
        targetIndex = 0; // Add to top of column
      } else {
        // Dropped on another story
        const overStory = getStoryById(overId);
        if (!overStory) return;

        targetStatus = overStory.status;
        const targetStories = getStoriesByStatus(targetStatus, 'story');
        targetIndex = targetStories.findIndex((s) => s.id === overId);
      }

      // Same column reorder
      if (activeStory.status === targetStatus) {
        const stories = getStoriesByStatus(targetStatus, 'story');
        const oldIndex = stories.findIndex((s) => s.id === activeId);
        if (oldIndex !== -1 && targetIndex !== undefined && oldIndex !== targetIndex) {
          reorderInColumn(targetStatus, oldIndex, targetIndex);
        }
      } else {
        // Move to different column
        await moveStory(activeId, targetStatus, targetIndex);
      }
    },
    [getStoryById, getStoriesByStatus, moveStory, reorderInColumn]
  );

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-lg font-semibold">Story Board</h2>

        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm',
                'bg-muted hover:bg-accent transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <RefreshCw
                className={cn('h-4 w-4', isLoading && 'animate-spin')}
              />
              <span>Refresh</span>
            </button>
          )}

          {/* Add Story Button */}
          <button
            onClick={() => handleOpenCreateModal('backlog')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm',
              'bg-primary text-primary-foreground hover:bg-primary/90 transition-colors'
            )}
          >
            <Plus className="h-4 w-4" />
            <span>New Story</span>
          </button>
        </div>
      </div>

      {/* Screen reader instructions for keyboard navigation */}
      <div id="dnd-instructions" className="sr-only">
        Press Space or Enter to pick up a story. Use arrow keys to move between columns. Press Space or Enter again to drop.
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full min-w-max">
            {KANBAN_COLUMNS.map((column) => (
              <KanbanColumn
                key={column.id}
                status={column.id}
                stories={getStoriesByStatus(column.id, 'story')}
                isCollapsed={collapsedColumns.has(column.id)}
                onToggleCollapse={() => toggleColumnCollapse(column.id)}
                onStoryClick={handleStoryClick}
                onAddStory={() => handleOpenCreateModal(column.id)}
              />
            ))}
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeStory && (
              <div className="opacity-90 rotate-3 scale-105">
                <StoryCard story={activeStory} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Create Story Modal */}
      <StoryCreateModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCreated={handleStoryCreated}
        defaultStatus={createModalStatus}
      />

      {/* Edit Story Modal */}
      <StoryEditModal
        story={editingStory}
        open={showEditModal}
        onOpenChange={setShowEditModal}
        onUpdated={handleStoryUpdated}
        onDeleted={handleStoryDeleted}
      />
    </div>
  );
}
