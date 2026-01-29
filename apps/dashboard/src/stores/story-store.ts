import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Story, StoryStatus, StoryType } from '@/types';

// ============ Listeners (outside Zustand to avoid re-renders) ============

type StatusChangeListener = (
  storyId: string,
  oldStatus: StoryStatus,
  newStatus: StoryStatus
) => void;

const storyStatusChangeListeners = new Set<StatusChangeListener>();

export function registerStoryStatusListener(listener: StatusChangeListener) {
  storyStatusChangeListeners.add(listener);
  return () => storyStatusChangeListeners.delete(listener);
}

function notifyStatusChange(storyId: string, oldStatus: StoryStatus, newStatus: StoryStatus) {
  storyStatusChangeListeners.forEach((listener) => listener(storyId, oldStatus, newStatus));
}

// ============ Race Condition Protection ============

const operationsInProgress = new Set<string>();

// ============ Store Interface ============

interface StoryState {
  // State
  stories: Record<string, Story>;
  storyOrder: Record<StoryStatus, string[]>;
  isLoading: boolean;
  error: string | null;

  // CRUD Actions
  setStories: (stories: Story[]) => void;
  addStory: (story: Story) => void;
  updateStory: (id: string, updates: Partial<Story>) => void;
  deleteStory: (id: string) => void;

  // Status Actions
  moveStory: (storyId: string, newStatus: StoryStatus, newIndex?: number) => Promise<void>;
  reorderInColumn: (status: StoryStatus, fromIndex: number, toIndex: number) => void;

  // Loading State
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Selectors (computed)
  getStoriesByStatus: (status: StoryStatus, typeFilter?: StoryType) => Story[];
  getStoryById: (id: string) => Story | undefined;
  getEpics: () => Story[];
  getStoriesOnly: () => Story[];
}

// Default order for each column
const DEFAULT_ORDER: Record<StoryStatus, string[]> = {
  backlog: [],
  in_progress: [],
  ai_review: [],
  human_review: [],
  pr_created: [],
  done: [],
  error: [],
};

export const useStoryStore = create<StoryState>()(
  persist(
    (set, get) => ({
      stories: {},
      storyOrder: { ...DEFAULT_ORDER },
      isLoading: false,
      error: null,

      setStories: (stories) => {
        const storiesMap: Record<string, Story> = {};
        const newOrder: Record<StoryStatus, string[]> = { ...DEFAULT_ORDER };

        stories.forEach((story) => {
          storiesMap[story.id] = story;
          // Add to order if not already present
          if (!newOrder[story.status].includes(story.id)) {
            newOrder[story.status].push(story.id);
          }
        });

        set({ stories: storiesMap, storyOrder: newOrder });
      },

      addStory: (story) =>
        set((state) => {
          const newStories = { ...state.stories, [story.id]: story };
          const newOrder = { ...state.storyOrder };

          // Add to beginning of column
          if (!newOrder[story.status].includes(story.id)) {
            newOrder[story.status] = [story.id, ...newOrder[story.status]];
          }

          return { stories: newStories, storyOrder: newOrder };
        }),

      updateStory: (id, updates) =>
        set((state) => {
          const existing = state.stories[id];
          if (!existing) return state;

          const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };

          // Handle status change
          if (updates.status && updates.status !== existing.status) {
            const newOrder = { ...state.storyOrder };

            // Remove from old column
            newOrder[existing.status] = newOrder[existing.status].filter((sid) => sid !== id);

            // Add to new column
            if (!newOrder[updates.status].includes(id)) {
              newOrder[updates.status] = [id, ...newOrder[updates.status]];
            }

            notifyStatusChange(id, existing.status, updates.status);

            return {
              stories: { ...state.stories, [id]: updated },
              storyOrder: newOrder,
            };
          }

          return { stories: { ...state.stories, [id]: updated } };
        }),

      deleteStory: (id) =>
        set((state) => {
          const story = state.stories[id];
          if (!story) return state;

          const { [id]: _removed, ...remainingStories } = state.stories;
          const newOrder = { ...state.storyOrder };
          newOrder[story.status] = newOrder[story.status].filter((sid) => sid !== id);

          return { stories: remainingStories, storyOrder: newOrder };
        }),

      moveStory: async (storyId, newStatus, newIndex) => {
        // Race condition protection
        if (operationsInProgress.has(storyId)) return;
        operationsInProgress.add(storyId);

        try {
          const state = get();
          const story = state.stories[storyId];
          if (!story) return;

          const oldStatus = story.status;
          if (oldStatus === newStatus && newIndex === undefined) return;

          set((state) => {
            const newOrder = { ...state.storyOrder };

            // Remove from old position
            newOrder[oldStatus] = newOrder[oldStatus].filter((id) => id !== storyId);

            // Add to new position
            if (newIndex !== undefined) {
              newOrder[newStatus].splice(newIndex, 0, storyId);
            } else {
              newOrder[newStatus] = [storyId, ...newOrder[newStatus]];
            }

            const updatedStory = {
              ...story,
              status: newStatus,
              updatedAt: new Date().toISOString(),
            };

            return {
              stories: { ...state.stories, [storyId]: updatedStory },
              storyOrder: newOrder,
            };
          });

          if (oldStatus !== newStatus) {
            notifyStatusChange(storyId, oldStatus, newStatus);
          }
        } finally {
          operationsInProgress.delete(storyId);
        }
      },

      reorderInColumn: (status, fromIndex, toIndex) =>
        set((state) => {
          const newOrder = { ...state.storyOrder };
          const columnOrder = [...newOrder[status]];

          const [removed] = columnOrder.splice(fromIndex, 1);
          columnOrder.splice(toIndex, 0, removed);

          newOrder[status] = columnOrder;
          return { storyOrder: newOrder };
        }),

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      // Selectors
      getStoriesByStatus: (status, typeFilter) => {
        const state = get();
        return state.storyOrder[status]
          .map((id) => state.stories[id])
          .filter((s): s is Story => s !== undefined)
          .filter((s) => !typeFilter || s.type === typeFilter);
      },

      getStoryById: (id) => get().stories[id],

      getEpics: () => {
        const state = get();
        return Object.values(state.stories).filter((s) => s.type === 'epic');
      },

      getStoriesOnly: () => {
        const state = get();
        return Object.values(state.stories).filter((s) => s.type === 'story' || !s.type);
      },
    }),
    {
      name: 'aios-stories',
      partialize: (state) => ({
        storyOrder: state.storyOrder,
      }),
    }
  )
);
