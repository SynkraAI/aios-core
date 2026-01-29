import useSWR from 'swr';
import type { AiosStatus } from '@/types';

// Extended response type that includes optional error field
interface AiosStatusResponse extends AiosStatus {
  error?: string;
}

const fetcher = async (url: string): Promise<AiosStatusResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP error ${res.status}`);
  }
  return res.json();
};

interface UseAiosStatusOptions {
  /** Polling interval in ms (default: 5000) */
  interval?: number;
  /** Pause polling (useful for inactive tabs) */
  paused?: boolean;
}

interface UseAiosStatusReturn {
  /** Current AIOS status */
  status: AiosStatus | undefined;
  /** True during initial load */
  isLoading: boolean;
  /** True if fetch failed */
  isError: boolean;
  /** True if CLI is running and connected */
  isConnected: boolean;
  /** Error message from API (e.g., corrupted file) */
  statusError: string | undefined;
  /** Manually trigger refresh */
  mutate: () => void;
}

/**
 * Hook to poll AIOS status file
 * Auto-pauses when tab is not visible
 */
export function useAiosStatus(
  options: UseAiosStatusOptions = {}
): UseAiosStatusReturn {
  const { interval = 5000, paused = false } = options;

  const { data, error, isLoading, mutate } = useSWR<AiosStatusResponse>(
    paused ? null : '/api/status',
    fetcher,
    {
      refreshInterval: interval,
      revalidateOnFocus: true,
      // Pause polling when window is not visible
      refreshWhenHidden: false,
      // Don't retry on error to avoid hammering the API
      errorRetryCount: 3,
      errorRetryInterval: 5000,
    }
  );

  return {
    status: data,
    isLoading,
    isError: !!error,
    isConnected: !error && !!data?.connected,
    statusError: data?.error,
    mutate,
  };
}
