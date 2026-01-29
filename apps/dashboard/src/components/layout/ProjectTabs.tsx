'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X, Plus } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { cn } from '@/lib/utils';
import type { Project } from '@/types';

interface ProjectTabsProps {
  projects: Project[];
  activeProjectId: string | null;
  onProjectSelect: (id: string) => void;
  onProjectClose: (id: string) => void;
  onProjectAdd: () => void;
  onReorder: (projects: Project[]) => void;
  onCloseOthers?: (keepId: string) => void;
  onCloseAll?: () => void;
  className?: string;
}

export function ProjectTabs({
  projects,
  activeProjectId,
  onProjectSelect,
  onProjectClose,
  onProjectAdd,
  onReorder,
  onCloseOthers,
  onCloseAll,
  className,
}: ProjectTabsProps) {
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = projects.findIndex((p) => p.id === active.id);
      const newIndex = projects.findIndex((p) => p.id === over.id);
      const newProjects = arrayMove(projects, oldIndex, newIndex);
      onReorder(newProjects);
    }
  };

  return (
    <div
      className={cn(
        'flex h-10 items-center gap-1 border-b border-border bg-background px-2',
        className
      )}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={projects.map((p) => p.id)}
          strategy={horizontalListSortingStrategy}
        >
          {projects.map((project) => (
            <SortableTab
              key={project.id}
              project={project}
              isActive={project.id === activeProjectId}
              onSelect={() => onProjectSelect(project.id)}
              onClose={() => onProjectClose(project.id)}
              onCloseOthers={onCloseOthers ? () => onCloseOthers(project.id) : undefined}
              onCloseAll={onCloseAll}
              canClose={projects.length > 1}
              isOnlyTab={projects.length === 1}
            />
          ))}
        </SortableContext>
      </DndContext>

      {/* Add Project Button */}
      <button
        onClick={onProjectAdd}
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-md',
          'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
          'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
        )}
        title="Add project"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

interface SortableTabProps {
  project: Project;
  isActive: boolean;
  onSelect: () => void;
  onClose: () => void;
  onCloseOthers?: () => void;
  onCloseAll?: () => void;
  canClose: boolean;
  isOnlyTab: boolean;
}

function SortableTab({
  project,
  isActive,
  onSelect,
  onClose,
  onCloseOthers,
  onCloseAll,
  canClose,
  isOnlyTab,
}: SortableTabProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const tabContent = (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative flex h-8 items-center gap-2 rounded-md px-3 text-sm',
        'transition-colors cursor-pointer select-none',
        isActive
          ? 'bg-accent text-accent-foreground'
          : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
        isDragging && 'opacity-50'
      )}
      onClick={onSelect}
      {...attributes}
      {...listeners}
    >
      <span className="truncate max-w-[120px]">{project.name}</span>

      {/* Close Button */}
      {canClose && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className={cn(
            'flex h-4 w-4 items-center justify-center rounded-sm',
            'opacity-0 group-hover:opacity-100',
            'hover:bg-background/50',
            'transition-opacity'
          )}
        >
          <X className="h-3 w-3" />
        </button>
      )}

      {/* Active indicator */}
      {isActive && (
        <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-t-full" />
      )}
    </div>
  );

  // If no context menu handlers, just return the tab
  if (!onCloseOthers && !onCloseAll) {
    return tabContent;
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {tabContent}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          disabled={!canClose}
        >
          Close
        </ContextMenuItem>
        {onCloseOthers && (
          <ContextMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onCloseOthers();
            }}
            disabled={isOnlyTab}
          >
            Close Others
          </ContextMenuItem>
        )}
        {onCloseAll && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onCloseAll();
              }}
              disabled={isOnlyTab}
            >
              Close All
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
