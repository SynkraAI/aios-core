import { useSquadStore } from "@/store/useSquadStore";
import { SquadCard } from "./SquadCard";

export function SquadSelector() {
  const squads = useSquadStore((s) => s.squads);
  const activeStates = useSquadStore((s) => s.activeStates);
  const selectedSquad = useSquadStore((s) => s.selectedSquad);
  const selectSquad = useSquadStore((s) => s.selectSquad);

  // Sort: active squads first, then alphabetical
  const squadList = Array.from(squads.values()).sort((a, b) => {
    const aActive = activeStates.has(a.code) ? 0 : 1;
    const bActive = activeStates.has(b.code) ? 0 : 1;
    if (aActive !== bActive) return aActive - bActive;
    return a.name.localeCompare(b.name);
  });

  return (
    <aside
      style={{
        width: 240,
        minWidth: 240,
        height: "100%",
        background: "var(--bg-sidebar)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "16px 12px 8px",
          fontSize: 11,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: 1,
          color: "var(--text-secondary)",
        }}
      >
        Squads
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {squadList.length === 0 && (
          <div style={{ padding: "16px 12px", color: "var(--text-secondary)", fontSize: 12 }}>
            No squads found
          </div>
        )}
        {squadList.map((squad) => (
          <SquadCard
            key={squad.code}
            squad={squad}
            state={activeStates.get(squad.code)}
            isSelected={selectedSquad === squad.code}
            onSelect={() => selectSquad(squad.code)}
          />
        ))}
      </div>
    </aside>
  );
}
