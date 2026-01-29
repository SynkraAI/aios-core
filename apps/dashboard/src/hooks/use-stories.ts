import { useCallback, useEffect } from 'react';
import useSWR from 'swr';
import { useStoryStore } from '@/stores/story-store';
import { useSettingsStore } from '@/stores/settings-store';
import { MOCK_STORIES } from '@/lib/mock-data';
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
  /** Whether using mock data */
  useMockData: boolean;
  /** Manually trigger refresh */
  refresh: () => Promise<void>;
}

export function useStories(options: UseStoriesOptions = {}): UseStoriesReturn {
  const { refreshInterval = 0 } = options;
  const { setStories, setLoading, setError } = useStoryStore();
  const { settings } = useSettingsStore();
  const useMockData = settings.useMockData;

  // SWR for API fetch (disabled when using mock data)
  const { data, error, isLoading, mutate } = useSWR<StoriesResponse>(
    useMockData ? null : '/api/stories', // null key disables fetching
    fetcher,
    {
      refreshInterval: refreshInterval > 0 ? refreshInterval : undefined,
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  // Load mock data when enabled
  useEffect(() => {
    if (useMockData) {
      setStories(MOCK_STORIES);
      setError(null);
      setLoading(false);
    }
  }, [useMockData, setStories, setError, setLoading]);

  // Sync API data to store (when not using mock)
  useEffect(() => {
    if (useMockData) return;

    setLoading(isLoading);

    if (error) {
      setError(error.message);
    } else if (data?.stories) {
      setStories(data.stories);
      setError(null);
    }
  }, [data, error, isLoading, useMockData, setStories, setLoading, setError]);

  const refresh = useCallback(async () => {
    if (useMockData) {
      // Just re-set mock data
      setStories(MOCK_STORIES);
      return;
    }
    setLoading(true);
    try {
      await mutate();
    } finally {
      setLoading(false);
    }
  }, [mutate, setLoading, useMockData, setStories]);

  return {
    isLoading: useMockData ? false : isLoading,
    isError: useMockData ? false : (!!error || data?.source === 'error'),
    error: useMockData ? undefined : (error?.message || data?.error),
    source: useMockData ? 'mock' : data?.source,
    useMockData,
    refresh,
  };
}
