import useSWR from 'swr';
import { useEffect } from 'react';
import { useAgentStore } from '@/stores/agent-store';
import type { AiosStatus, AgentId } from '@/types';

// eslint-disable-next-line no-undef
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useAgents() {
  const {
    agents,
    activeAgentId,
    pollingInterval,
    setActiveAgent,
    clearActiveAgent,
    updateAgent,
    setLastPolledAt,
    setIsPolling,
    getActiveAgents,
    getIdleAgents,
  } = useAgentStore();

  // Poll the status endpoint
  const { data, error, isLoading, mutate } = useSWR<AiosStatus>('/api/status', fetcher, {
    refreshInterval: pollingInterval,
    revalidateOnFocus: true,
    dedupingInterval: 2000,
  });

  // Sync status data with agent store
  useEffect(() => {
    if (!data) return;

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
    isLoading,
    error,
    refresh: mutate,
  };
}
