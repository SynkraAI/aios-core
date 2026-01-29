import useSWR from 'swr';
import { useEffect } from 'react';
import { useAgentStore } from '@/stores/agent-store';
import { useSettingsStore } from '@/stores/settings-store';
import { MOCK_AGENTS } from '@/lib/mock-data';
import type { AiosStatus, AgentId } from '@/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useAgents() {
  const {
    agents,
    activeAgentId,
    pollingInterval,
    setAgents,
    setActiveAgent,
    clearActiveAgent,
    updateAgent,
    setLastPolledAt,
    setIsPolling,
    getActiveAgents,
    getIdleAgents,
  } = useAgentStore();

  const { settings } = useSettingsStore();
  const useMockData = settings.useMockData;

  // Poll the status endpoint (disabled when using mock data)
  const { data, error, isLoading, mutate } = useSWR<AiosStatus>(
    useMockData ? null : '/api/status',
    fetcher,
    {
      refreshInterval: pollingInterval,
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    }
  );

  // Load mock agents when enabled
  useEffect(() => {
    if (useMockData) {
      setAgents(MOCK_AGENTS);
      setLastPolledAt(new Date().toISOString());
      setIsPolling(false);
    }
  }, [useMockData, setAgents, setLastPolledAt, setIsPolling]);

  // Sync status data with agent store (when not using mock)
  useEffect(() => {
    if (useMockData || !data) return;

    setLastPolledAt(new Date().toISOString());
    setIsPolling(true);

    // Update active agent from status
    if (data.activeAgent) {
      const agentId = data.activeAgent.id as AgentId;
      setActiveAgent(agentId, data.activeAgent.currentStory);

      // Update last activity
      updateAgent(agentId, {
        lastActivity: data.activeAgent.activatedAt,
      });
    } else if (activeAgentId) {
      clearActiveAgent();
    }

    return () => {
      setIsPolling(false);
    };
  }, [
    data,
    activeAgentId,
    useMockData,
    setActiveAgent,
    clearActiveAgent,
    updateAgent,
    setLastPolledAt,
    setIsPolling,
  ]);

  return {
    agents: Object.values(agents),
    activeAgents: getActiveAgents(),
    idleAgents: getIdleAgents(),
    activeAgentId,
    status: data,
    isLoading: useMockData ? false : isLoading,
    error: useMockData ? null : error,
    useMockData,
    refresh: mutate,
  };
}
