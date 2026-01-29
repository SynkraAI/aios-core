import { create } from 'zustand';
import type { AgentId } from '@/types';

// ============ Terminal Types ============

export type TerminalConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface TerminalLine {
  id: string;
  content: string;
  timestamp: string;
  isInitial: boolean;
}

export interface Terminal {
  id: string;
  agentId: AgentId | 'main';
  status: TerminalConnectionStatus;
  lines: TerminalLine[];
  maxLines: number;
  error?: string;
  createdAt: string;
}

// ============ Store Interface ============

interface TerminalState {
  // State
  terminals: Record<string, Terminal>;
  activeTerminalId: string | null;

  // Actions
  createTerminal: (agentId: AgentId | 'main') => string;
  removeTerminal: (id: string) => void;
  setActiveTerminal: (id: string | null) => void;
  setTerminalStatus: (id: string, status: TerminalConnectionStatus, error?: string) => void;
  appendLine: (id: string, line: Omit<TerminalLine, 'id'>) => void;
  appendLines: (id: string, lines: Omit<TerminalLine, 'id'>[]) => void;
  clearTerminal: (id: string) => void;
  setMaxLines: (id: string, maxLines: number) => void;

  // Selectors
  getTerminalById: (id: string) => Terminal | undefined;
  getTerminalsByAgent: (agentId: AgentId | 'main') => Terminal[];
  getAllTerminals: () => Terminal[];
}

// Generate unique ID
let terminalIdCounter = 0;
function generateTerminalId(): string {
  return `terminal-${Date.now()}-${++terminalIdCounter}`;
}

function generateLineId(): string {
  return `line-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useTerminalStore = create<TerminalState>()((set, get) => ({
  terminals: {},
  activeTerminalId: null,

  createTerminal: (agentId) => {
    const id = generateTerminalId();
    const terminal: Terminal = {
      id,
      agentId,
      status: 'disconnected',
      lines: [],
      maxLines: 1000,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      terminals: { ...state.terminals, [id]: terminal },
      activeTerminalId: state.activeTerminalId || id,
    }));

    return id;
  },

  removeTerminal: (id) =>
    set((state) => {
      const { [id]: _removed, ...remaining } = state.terminals;
      const newActiveId =
        state.activeTerminalId === id
          ? Object.keys(remaining)[0] || null
          : state.activeTerminalId;

      return {
        terminals: remaining,
        activeTerminalId: newActiveId,
      };
    }),

  setActiveTerminal: (id) => set({ activeTerminalId: id }),

  setTerminalStatus: (id, status, error) =>
    set((state) => {
      const terminal = state.terminals[id];
      if (!terminal) return state;

      return {
        terminals: {
          ...state.terminals,
          [id]: {
            ...terminal,
            status,
            error: error || undefined,
          },
        },
      };
    }),

  appendLine: (id, line) =>
    set((state) => {
      const terminal = state.terminals[id];
      if (!terminal) return state;

      const newLine: TerminalLine = {
        ...line,
        id: generateLineId(),
      };

      let newLines = [...terminal.lines, newLine];

      // Trim if exceeds max
      if (newLines.length > terminal.maxLines) {
        newLines = newLines.slice(-terminal.maxLines);
      }

      return {
        terminals: {
          ...state.terminals,
          [id]: {
            ...terminal,
            lines: newLines,
          },
        },
      };
    }),

  appendLines: (id, lines) =>
    set((state) => {
      const terminal = state.terminals[id];
      if (!terminal) return state;

      const newLines: TerminalLine[] = lines.map((line) => ({
        ...line,
        id: generateLineId(),
      }));

      let allLines = [...terminal.lines, ...newLines];

      // Trim if exceeds max
      if (allLines.length > terminal.maxLines) {
        allLines = allLines.slice(-terminal.maxLines);
      }

      return {
        terminals: {
          ...state.terminals,
          [id]: {
            ...terminal,
            lines: allLines,
          },
        },
      };
    }),

  clearTerminal: (id) =>
    set((state) => {
      const terminal = state.terminals[id];
      if (!terminal) return state;

      return {
        terminals: {
          ...state.terminals,
          [id]: {
            ...terminal,
            lines: [],
          },
        },
      };
    }),

  setMaxLines: (id, maxLines) =>
    set((state) => {
      const terminal = state.terminals[id];
      if (!terminal) return state;

      let newLines = terminal.lines;
      if (newLines.length > maxLines) {
        newLines = newLines.slice(-maxLines);
      }

      return {
        terminals: {
          ...state.terminals,
          [id]: {
            ...terminal,
            maxLines,
            lines: newLines,
          },
        },
      };
    }),

  // Selectors
  getTerminalById: (id) => get().terminals[id],

  getTerminalsByAgent: (agentId) =>
    Object.values(get().terminals).filter((t) => t.agentId === agentId),

  getAllTerminals: () => Object.values(get().terminals),
}));
