import { useCallback, useEffect } from 'react';
import useSWR from 'swr';
import { useStoryStore } from '@/stores/story-store';
import type { Story } from '@/types';

interface StoriesResponse {
  stories: Story[];
  source: 'filesystem' | 'mock' | 'empty' | 'error';
  count?: number;
  message?: string;
  error?: string;
}

const fetcher = async (url: string): Promise<StoriesResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP error ${res.status}`);
  }
  return res.json();
};

interface UseStoriesOptions {
  /** Auto-refresh interval in ms (0 to disable) */
  refreshInterval?: number;
}

interface UseStoriesReturn {
  /** True during initial load */
  isLoading: boolean;
  /** True if fetch failed */
  isError: boolean;
  /** Error message if any */
  error: string | undefined;
  /** Data source (filesystem, mock, empty, error) */
  source: string | undefined;
  /** Manually trigger refresh */
  refresh: () => Promise<void>;
}

export function useStories(options: UseStoriesOptions = {}): UseStoriesReturn {
  const { refreshInterval = 0 } = options;
  const { setStories, setLoading, setError } = useStoryStore();

  const { data, error, isLoading, mutate } = useSWR<StoriesResponse>(
    '/api/stories',
    fetcher,
    {
      refreshInterval: refreshInterval > 0 ? refreshInterval : undefined,
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  // Sync data to store
  useEffect(() => {
    setLoading(isLoading);

    if (error) {
      setError(error.message);
    } else if (data?.stories) {
      setStories(data.stories);
      setError(null);
    }
  }, [data, error, isLoading, setStories, setLoading, setError]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      await mutate();
    } finally {
      setLoading(false);
    }
  }, [mutate, setLoading]);

  return {
    isLoading,
    isError: !!error || data?.source === 'error',
    error: error?.message || data?.error,
    source: data?.source,
    refresh,
  };
}
