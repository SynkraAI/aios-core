import { create } from "zustand";
import type { SquadInfo, SquadState } from "@/types/state";

interface SquadStore {
  // State
  squads: Map<string, SquadInfo>;
  activeStates: Map<string, SquadState>;
  selectedSquad: string | null;
  isConnected: boolean;

  // Actions
  selectSquad: (name: string | null) => void;
  setConnected: (connected: boolean) => void;
  setSnapshot: (squads: SquadInfo[], activeStates: Record<string, SquadState>) => void;
  setSquadActive: (squad: string, state: SquadState) => void;
  updateSquadState: (squad: string, state: SquadState) => void;
  setSquadInactive: (squad: string) => void;
}

export const useSquadStore = create<SquadStore>((set) => ({
  squads: new Map(),
  activeStates: new Map(),
  selectedSquad: null,
  isConnected: false,

  selectSquad: (name) => set({ selectedSquad: name }),

  setConnected: (connected) => set({ isConnected: connected }),

  setSnapshot: (squads, activeStates) =>
    set({
      squads: new Map(squads.map((s) => [s.code, s])),
      activeStates: new Map(Object.entries(activeStates)),
    }),

  setSquadActive: (squad, state) =>
    set((prev) => ({
      activeStates: new Map(prev.activeStates).set(squad, state),
    })),

  updateSquadState: (squad, state) =>
    set((prev) => ({
      activeStates: new Map(prev.activeStates).set(squad, state),
    })),

  setSquadInactive: (squad) =>
    set((prev) => {
      const next = new Map(prev.activeStates);
      next.delete(squad);
      return {
        activeStates: next,
        // Reset selection if the inactive squad was selected
        selectedSquad: prev.selectedSquad === squad ? null : prev.selectedSquad,
      };
    }),
}));
