import { create } from 'zustand';
import type { Agent, AgentId, AgentStatus, AiosStatus } from '@/types';

// ============ Listeners (outside Zustand to avoid re-renders) ============

type AgentStatusListener = (
  agentId: AgentId,
  oldStatus: AgentStatus,
  newStatus: AgentStatus
) => void;

const agentStatusListeners = new Set<AgentStatusListener>();

export function registerAgentStatusListener(listener: AgentStatusListener) {
  agentStatusListeners.add(listener);
  return () => agentStatusListeners.delete(listener);
}

function notifyAgentStatusChange(agentId: AgentId, oldStatus: AgentStatus, newStatus: AgentStatus) {
  agentStatusListeners.forEach((listener) => listener(agentId, oldStatus, newStatus));
}

// ============ Store Interface ============

interface AgentState {
  // State
  agents: Record<AgentId, Agent>;
  activeAgentId: AgentId | null;
  lastPolledAt: string | null;
  pollingInterval: number;
  isPolling: boolean;

  // Actions
  setAgents: (agents: Agent[]) => void;
  updateAgent: (id: AgentId, updates: Partial<Agent>) => void;
  setActiveAgent: (id: AgentId | null, storyId?: string) => void;
  clearActiveAgent: () => void;

  // Polling
  setPollingInterval: (ms: number) => void;
  setLastPolledAt: (timestamp: string) => void;
  setIsPolling: (isPolling: boolean) => void;

  // Realtime
  handleRealtimeUpdate: (status: AiosStatus) => void;

  // Selectors
  getActiveAgents: () => Agent[];
  getIdleAgents: () => Agent[];
  getAgentById: (id: AgentId) => Agent | undefined;
}

// Default agents configuration - using IconName, no emojis
const DEFAULT_AGENTS: Agent[] = [
  { id: 'dev', name: 'Dev', icon: 'code', color: 'var(--agent-dev)', status: 'idle' },
  { id: 'qa', name: 'QA', icon: 'test-tube', color: 'var(--agent-qa)', status: 'idle' },
  {
    id: 'architect',
    name: 'Architect',
    icon: 'building',
    color: 'var(--agent-architect)',
    status: 'idle',
  },
  { id: 'pm', name: 'PM', icon: 'bar-chart', color: 'var(--agent-pm)', status: 'idle' },
  { id: 'po', name: 'PO', icon: 'target', color: 'var(--agent-po)', status: 'idle' },
  {
    id: 'analyst',
    name: 'Analyst',
    icon: 'line-chart',
    color: 'var(--agent-analyst)',
    status: 'idle',
  },
  { id: 'devops', name: 'DevOps', icon: 'wrench', color: 'var(--agent-devops)', status: 'idle' },
];

function createAgentsMap(agents: Agent[]): Record<AgentId, Agent> {
  return agents.reduce(
    (acc, agent) => {
      acc[agent.id] = agent;
      return acc;
    },
    {} as Record<AgentId, Agent>
  );
}

export const useAgentStore = create<AgentState>()((set, get) => ({
  agents: createAgentsMap(DEFAULT_AGENTS),
  activeAgentId: null,
  lastPolledAt: null,
  pollingInterval: 5000, // 5 seconds default
  isPolling: false,

  setAgents: (agents) => {
    set({ agents: createAgentsMap(agents) });
  },

  updateAgent: (id, updates) =>
    set((state) => {
      const existing = state.agents[id];
      if (!existing) return state;

      const oldStatus = existing.status;
      const newStatus = updates.status ?? oldStatus;

      const updated: Agent = {
        ...existing,
        ...updates,
      };

      if (oldStatus !== newStatus) {
        notifyAgentStatusChange(id, oldStatus, newStatus);
      }

      return {
        agents: { ...state.agents, [id]: updated },
      };
    }),

  setActiveAgent: (id, storyId) =>
    set((state) => {
      // Clear previous active agent
      const newAgents = { ...state.agents };

      if (state.activeAgentId && state.activeAgentId !== id) {
        const prevAgent = newAgents[state.activeAgentId];
        if (prevAgent) {
          newAgents[state.activeAgentId] = {
            ...prevAgent,
            status: 'idle',
            currentStoryId: undefined,
          };
        }
      }

      // Set new active agent
      if (id && newAgents[id]) {
        newAgents[id] = {
          ...newAgents[id],
          status: 'working',
          currentStoryId: storyId,
        };
      }

      return {
        agents: newAgents,
        activeAgentId: id,
      };
    }),

  clearActiveAgent: () =>
    set((state) => {
      if (!state.activeAgentId) return state;

      const newAgents = { ...state.agents };
      const activeAgent = newAgents[state.activeAgentId];

      if (activeAgent) {
        newAgents[state.activeAgentId] = {
          ...activeAgent,
          status: 'idle',
          currentStoryId: undefined,
        };
      }

      return {
        agents: newAgents,
        activeAgentId: null,
      };
    }),

  setPollingInterval: (ms) => set({ pollingInterval: ms }),
  setLastPolledAt: (timestamp) => set({ lastPolledAt: timestamp }),
  setIsPolling: (isPolling) => set({ isPolling }),

  // Realtime update handler - called by useRealtimeStatus hook
  handleRealtimeUpdate: (status) =>
    set((state) => {
      const timestamp = new Date().toISOString();
      const newAgents = { ...state.agents };
      let newActiveAgentId = state.activeAgentId;

      // Clear previous active agent if different
      if (state.activeAgentId && (!status.activeAgent || status.activeAgent.id !== state.activeAgentId)) {
        const prevAgent = newAgents[state.activeAgentId];
        if (prevAgent) {
          const oldStatus = prevAgent.status;
          newAgents[state.activeAgentId] = {
            ...prevAgent,
            status: 'idle',
            currentStoryId: undefined,
          };
          if (oldStatus !== 'idle') {
            notifyAgentStatusChange(state.activeAgentId, oldStatus, 'idle');
          }
        }
        newActiveAgentId = null;
      }

      // Set new active agent from status
      if (status.activeAgent) {
        const agentId = status.activeAgent.id as AgentId;
        const agent = newAgents[agentId];
        if (agent) {
          const oldStatus = agent.status;
          newAgents[agentId] = {
            ...agent,
            status: 'working',
            currentStoryId: status.activeAgent.currentStory,
            lastActivity: status.activeAgent.activatedAt,
          };
          newActiveAgentId = agentId;
          if (oldStatus !== 'working') {
            notifyAgentStatusChange(agentId, oldStatus, 'working');
          }
        }
      }

      return {
        agents: newAgents,
        activeAgentId: newActiveAgentId,
        lastPolledAt: timestamp,
        isPolling: true,
      };
    }),

  // Selectors
  getActiveAgents: () => {
    const state = get();
    return Object.values(state.agents).filter((agent) => agent.status !== 'idle');
  },

  getIdleAgents: () => {
    const state = get();
    return Object.values(state.agents).filter((agent) => agent.status === 'idle');
  },

  getAgentById: (id) => get().agents[id],
}));
