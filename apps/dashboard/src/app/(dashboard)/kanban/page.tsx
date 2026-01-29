'use client';

import { useState, useCallback } from 'react';
import { KanbanBoard } from '@/components/kanban';
import { StoryDetailModal } from '@/components/stories';
import { useStories } from '@/hooks/use-stories';
import type { Story } from '@/types';

export default function KanbanPage() {
  const { isLoading, refresh } = useStories();
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleStoryClick = useCallback((story: Story) => {
    setSelectedStory(story);
    setModalOpen(true);
  }, []);

  const handleAddStory = useCallback(() => {
    // TODO: Open story creation wizard
    console.log('Add new story');
  }, []);

  return (
    <>
      <KanbanBoard
        onStoryClick={handleStoryClick}
        onAddStory={handleAddStory}
        onRefresh={refresh}
        isLoading={isLoading}
        className="h-full"
      />

      <StoryDetailModal
        story={selectedStory}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
}
