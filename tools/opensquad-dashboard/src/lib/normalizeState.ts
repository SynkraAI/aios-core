import type { SquadState, Agent } from "@/types/state";

/**
 * Returns agents sorted by desk position (row first, then col).
 */
export function sortAgentsByDesk(agents: Agent[]): Agent[] {
  return [...agents].sort((a, b) => {
    if (a.desk.row !== b.desk.row) return a.desk.row - b.desk.row;
    return a.desk.col - b.desk.col;
  });
}

/**
 * Find agent by id.
 */
export function findAgent(state: SquadState, agentId: string): Agent | undefined {
  return state.agents.find((a) => a.id === agentId);
}

/**
 * Returns the currently working agent, if any.
 */
export function getWorkingAgent(state: SquadState): Agent | undefined {
  return state.agents.find((a) => a.status === "working");
}
