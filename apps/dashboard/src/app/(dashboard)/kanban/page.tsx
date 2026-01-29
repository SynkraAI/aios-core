'use client';

import { KanbanBoard } from '@/components/kanban';
import { useStories } from '@/hooks/use-stories';

export default function KanbanPage() {
  const { isLoading, refresh } = useStories();

  return (
    <KanbanBoard
      onRefresh={refresh}
      isLoading={isLoading}
      className="h-full"
    />
  );
}
