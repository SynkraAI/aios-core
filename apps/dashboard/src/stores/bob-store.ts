import { create } from 'zustand';
import { useAgentStore } from '@/stores/agent-store';
import type { AgentId } from '@/types';

// ============ Bob Status Types (based on BOB_STATUS_SCHEMA from Story 12.6) ============

export interface BobPipeline {
  stages: string[];
  current_stage: string;
  story_progress: string;
  completed_stages: string[];
}

export interface BobCurrentAgent {
  id: string;
  name: string;
  task: string;
  reason: string;
  started_at: string;
}

export interface BobTerminal {
  agent: string;
  pid: number;
  task: string;
  elapsed: string;
}

export interface BobSurfaceDecision {
  criteria: string;
  action: string;
  timestamp: string;
  resolved: boolean;
}

export interface BobError {
  phase: string;
  message: string;
  recoverable: boolean;
}

export interface BobElapsed {
  story_seconds: number;
  session_seconds: number;
}

export interface BobEducational {
  enabled: boolean;
  tradeoffs: string[];
  reasoning: string[];
}

// ============ Store State ============

interface BobState {
  // State
  active: boolean;
  pipeline: BobPipeline | null;
  currentAgent: BobCurrentAgent | null;
  terminals: BobTerminal[];
  surfaceDecisions: BobSurfaceDecision[];
  elapsed: BobElapsed;
  errors: BobError[];
  educational: BobEducational;
  lastUpdate: string;
  isInactive: boolean;

  // Actions
  updateFromStatus: (data: Record<string, unknown>) => void;
  handleBobEvent: (event: { type: string; data: unknown }) => void;
  reset: () => void;
}

// ============ Constants ============

const INACTIVE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

const DEFAULT_ELAPSED: BobElapsed = { story_seconds: 0, session_seconds: 0 };
const DEFAULT_EDUCATIONAL: BobEducational = { enabled: false, tradeoffs: [], reasoning: [] };

// ============ Helpers ============

function parsePipeline(data: unknown): BobPipeline | null {
  if (!data || typeof data !== 'object') return null;
  const p = data as Record<string, unknown>;
  return {
    stages: Array.isArray(p.stages) ? p.stages.map(String) : [],
    current_stage: String(p.current_stage || ''),
    story_progress: String(p.story_progress || ''),
    completed_stages: Array.isArray(p.completed_stages) ? p.completed_stages.map(String) : [],
  };
}

function parseCurrentAgent(data: unknown): BobCurrentAgent | null {
  if (!data || typeof data !== 'object') return null;
  const a = data as Record<string, unknown>;
  if (!a.id) return null;
  return {
    id: String(a.id),
    name: String(a.name || ''),
    task: String(a.task || ''),
    reason: String(a.reason || ''),
    started_at: String(a.started_at || ''),
  };
}

function parseTerminals(data: unknown): BobTerminal[] {
  if (!Array.isArray(data)) return [];
  return data.map((t) => {
    const item = t as Record<string, unknown>;
    return {
      agent: String(item.agent || ''),
      pid: typeof item.pid === 'number' ? item.pid : 0,
      task: String(item.task || ''),
      elapsed: String(item.elapsed || ''),
    };
  });
}

function parseSurfaceDecisions(data: unknown): BobSurfaceDecision[] {
  if (!Array.isArray(data)) return [];
  return data.map((d) => {
    const item = d as Record<string, unknown>;
    return {
      criteria: String(item.criteria || ''),
      action: String(item.action || ''),
      timestamp: String(item.timestamp || ''),
      resolved: Boolean(item.resolved),
    };
  });
}

function parseErrors(data: unknown): BobError[] {
  if (!Array.isArray(data)) return [];
  return data.map((e) => {
    const item = e as Record<string, unknown>;
    return {
      phase: String(item.phase || ''),
      message: String(item.message || ''),
      recoverable: Boolean(item.recoverable),
    };
  });
}

function parseElapsed(data: unknown): BobElapsed {
  if (!data || typeof data !== 'object') return DEFAULT_ELAPSED;
  const e = data as Record<string, unknown>;
  return {
    story_seconds: typeof e.story_seconds === 'number' ? e.story_seconds : 0,
    session_seconds: typeof e.session_seconds === 'number' ? e.session_seconds : 0,
  };
}

function parseEducational(data: unknown): BobEducational {
  if (!data || typeof data !== 'object') return DEFAULT_EDUCATIONAL;
  const e = data as Record<string, unknown>;
  return {
    enabled: Boolean(e.enabled),
    tradeoffs: Array.isArray(e.tradeoffs) ? e.tradeoffs.map(String) : [],
    reasoning: Array.isArray(e.reasoning) ? e.reasoning.map(String) : [],
  };
}

function checkInactive(lastUpdate: string): boolean {
  if (!lastUpdate) return true;
  const lastTime = new Date(lastUpdate).getTime();
  return Date.now() - lastTime > INACTIVE_THRESHOLD_MS;
}

// Sync Bob's current agent with the agent-store
function syncAgentStore(newAgent: BobCurrentAgent | null, previousAgent: BobCurrentAgent | null) {
  const agentStore = useAgentStore.getState();

  // Clear previous agent if different
  if (previousAgent && (!newAgent || previousAgent.id !== newAgent.id)) {
    const prevId = previousAgent.id as AgentId;
    if (agentStore.agents[prevId]) {
      agentStore.updateAgent(prevId, { status: 'idle', currentStoryId: undefined });
    }
  }

  // Set new agent as working
  if (newAgent) {
    const agentId = newAgent.id as AgentId;
    if (agentStore.agents[agentId]) {
      agentStore.updateAgent(agentId, {
        status: 'working',
        lastActivity: newAgent.started_at,
      });
    }
  }
}

// ============ Store ============

export const useBobStore = create<BobState>()((set, get) => ({
  active: false,
  pipeline: null,
  currentAgent: null,
  terminals: [],
  surfaceDecisions: [],
  elapsed: DEFAULT_ELAPSED,
  errors: [],
  educational: DEFAULT_EDUCATIONAL,
  lastUpdate: '',
  isInactive: true,

  updateFromStatus: (data) => {
    const previousAgent = get().currentAgent;
    const active = Boolean(
      data.active ?? (data.orchestration as Record<string, unknown> | undefined)?.active
    );
    const timestamp = String(data.timestamp || new Date().toISOString());
    const newAgent = parseCurrentAgent(data.current_agent);

    // Sync with agent-store
    syncAgentStore(newAgent, previousAgent);

    set({
      active,
      pipeline: parsePipeline(data.pipeline),
      currentAgent: newAgent,
      terminals: parseTerminals(data.active_terminals),
      surfaceDecisions: parseSurfaceDecisions(data.surface_decisions),
      elapsed: parseElapsed(data.elapsed),
      errors: parseErrors(data.errors),
      educational: parseEducational(data.educational),
      lastUpdate: timestamp,
      isInactive: active ? checkInactive(timestamp) : true,
    });
  },

  handleBobEvent: (event) => {
    const { type, data } = event;
    const eventData = (data || {}) as Record<string, unknown>;

    switch (type) {
      case 'bob:status': {
        get().updateFromStatus(eventData);
        break;
      }
      case 'BobPhaseChange': {
        set((state) => {
          if (!state.pipeline) return state;
          const stage = String(eventData.phase || eventData.stage || '');
          const completed = [...state.pipeline.completed_stages];
          if (state.pipeline.current_stage && !completed.includes(state.pipeline.current_stage)) {
            completed.push(state.pipeline.current_stage);
          }
          return {
            pipeline: { ...state.pipeline, current_stage: stage, completed_stages: completed },
            lastUpdate: new Date().toISOString(),
            isInactive: false,
          };
        });
        break;
      }
      case 'BobAgentSpawned': {
        const newAgent = parseCurrentAgent(eventData);
        const previousAgent = get().currentAgent;
        syncAgentStore(newAgent, previousAgent);
        set({
          currentAgent: newAgent,
          lastUpdate: new Date().toISOString(),
          isInactive: false,
        });
        break;
      }
      case 'BobAgentCompleted': {
        const previousAgent = get().currentAgent;
        syncAgentStore(null, previousAgent);
        set({
          currentAgent: null,
          lastUpdate: new Date().toISOString(),
          isInactive: false,
        });
        break;
      }
      case 'BobSurfaceDecision': {
        set((state) => ({
          surfaceDecisions: [
            ...state.surfaceDecisions,
            {
              criteria: String(eventData.criteria || ''),
              action: String(eventData.action || ''),
              timestamp: new Date().toISOString(),
              resolved: false,
            },
          ],
          lastUpdate: new Date().toISOString(),
          isInactive: false,
        }));
        break;
      }
      case 'BobError': {
        set((state) => ({
          errors: [
            ...state.errors,
            {
              phase: String(eventData.phase || ''),
              message: String(eventData.message || ''),
              recoverable: Boolean(eventData.recoverable),
            },
          ],
          lastUpdate: new Date().toISOString(),
          isInactive: false,
        }));
        break;
      }
    }
  },

  reset: () =>
    set({
      active: false,
      pipeline: null,
      currentAgent: null,
      terminals: [],
      surfaceDecisions: [],
      elapsed: DEFAULT_ELAPSED,
      errors: [],
      educational: DEFAULT_EDUCATIONAL,
      lastUpdate: '',
      isInactive: true,
    }),
}));

// ============ Selectors (hooks) ============

export function useBobPipeline() {
  return useBobStore((state) => state.pipeline);
}

export function useBobCurrentAgent() {
  return useBobStore((state) => state.currentAgent);
}

export function useBobTerminals() {
  return useBobStore((state) => state.terminals);
}

export function useBobSurfaceDecisions() {
  return useBobStore((state) => state.surfaceDecisions);
}

export function useBobErrors() {
  return useBobStore((state) => state.errors);
}

export function useBobActive() {
  return useBobStore((state) => state.active);
}

export function useBobInactive() {
  return useBobStore((state) => state.isInactive);
}
