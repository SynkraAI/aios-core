import { Application, extend } from "@pixi/react";
import { Container, Graphics } from "pixi.js";
import { useCallback, useMemo } from "react";
import { useSquadStore } from "@/store/useSquadStore";
import { AgentDesk, CELL_W, CELL_H, GRID_OFFSET_X, GRID_OFFSET_Y } from "./AgentDesk";
import { HandoffEnvelope } from "./HandoffEnvelope";
import { sortAgentsByDesk, findAgent } from "@/lib/normalizeState";
import { drawFloor } from "./drawRoom";
import { drawBookshelf, drawPlant, drawClock, drawWhiteboard, drawCoffeeMachine, drawFilingCabinet } from "./drawFurniture";
import { TILE, COLORS } from "./palette";
import type { Graphics as PixiGraphics } from "pixi.js";

extend({ Container, Graphics });

const MIN_STAGE_W = 400;
const MIN_STAGE_H = 320;

export function OfficeScene() {
  const state = useSquadStore((s) =>
    s.selectedSquad ? s.activeStates.get(s.selectedSquad) : undefined
  );
  const squadInfo = useSquadStore((s) =>
    s.selectedSquad ? s.squads.get(s.selectedSquad) : undefined
  );

  const agents = useMemo(
    () => (state?.agents ? sortAgentsByDesk(state.agents) : []),
    [state]
  );

  const maxCol = agents.length > 0 ? Math.max(...agents.map(a => a.desk.col)) : 1;
  const maxRow = agents.length > 0 ? Math.max(...agents.map(a => a.desk.row)) : 1;

  const wallTop = TILE * 2;
  const marginX = Math.round(TILE * 1.5);
  const marginY = TILE * 1;
  const floorW = marginX * 2 + maxCol * CELL_W;
  const floorH = marginY * 2 + maxRow * CELL_H;
  const floorX = GRID_OFFSET_X - marginX;
  const floorY = GRID_OFFSET_Y - marginY;
  const stageW = Math.max(floorX + floorW + marginX, MIN_STAGE_W);
  const stageH = Math.max(floorY + floorH + marginY, MIN_STAGE_H);

  const drawBackground = useCallback(
    (g: PixiGraphics) => {
      g.clear();

      // Dark void surround (Gather.town style)
      g.rect(0, 0, stageW, stageH);
      g.fill({ color: 0x101018 });

      // Floor (wood planks)
      drawFloor(g, floorW, floorH, floorX, floorY);

      // Top wall — clean cream
      g.rect(floorX - 1, 0, floorW + 2, wallTop);
      g.fill({ color: COLORS.wallFace });
      // Baseboard (dark strip at bottom of wall)
      g.rect(floorX - 1, wallTop - 3, floorW + 2, 3);
      g.fill({ color: COLORS.wallShadow });
      // Shadow cast on floor from wall
      g.rect(floorX, wallTop, floorW, 3);
      g.fill({ color: 0x000000, alpha: 0.06 });

      // Room borders (thin dark lines around floor perimeter)
      g.rect(floorX - 1, wallTop, 1, floorH);
      g.fill({ color: COLORS.wallShadow });
      g.rect(floorX + floorW, wallTop, 1, floorH);
      g.fill({ color: COLORS.wallShadow });
      g.rect(floorX - 1, wallTop + floorH, floorW + 2, 1);
      g.fill({ color: COLORS.wallShadow });

      // Wall-mounted furniture
      const wallItemY = 4;
      drawBookshelf(g, floorX + 10, wallItemY);
      if (floorW > 300) {
        drawBookshelf(g, floorX + floorW - 74, wallItemY);
      }
      drawWhiteboard(g, floorX + floorW / 2 - 24, wallItemY);
      drawClock(g, floorX + floorW / 2 + 28, wallItemY + 6);

      // Floor furniture
      drawPlant(g, floorX + 4, floorY + 8);
      drawPlant(g, floorX + floorW - 36, floorY + 8);
      drawPlant(g, floorX + 4, floorY + floorH - 36);
      drawFilingCabinet(g, floorX + floorW - 36, floorY + floorH - 52);

      if (floorH > 200) {
        drawCoffeeMachine(g, floorX + floorW - 36, floorY + floorH / 2 - 16);
      }
    },
    [stageW, stageH, floorW, floorH, floorX, floorY, wallTop]
  );

  if (!state) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-secondary)",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {squadInfo ? (
          <>
            <span style={{ fontSize: 40 }}>{squadInfo.icon}</span>
            <span style={{ fontSize: 16 }}>{squadInfo.name}</span>
            <span style={{ fontSize: 12 }}>{squadInfo.description}</span>
            <span style={{ fontSize: 11, marginTop: 8 }}>Not running</span>
          </>
        ) : (
          <span>Select a squad to monitor</span>
        )}
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Application width={stageW} height={stageH} backgroundColor={0x101018}>
        <pixiContainer>
          <pixiGraphics draw={drawBackground} />
          {agents.map((agent, i) => (
            <AgentDesk key={agent.id} agent={agent} agentIndex={i} />
          ))}
          {state.handoff &&
            (() => {
              const from = findAgent(state, state.handoff!.from);
              const to = findAgent(state, state.handoff!.to);
              if (!from || !to) return null;
              return (
                <HandoffEnvelope
                  handoff={state.handoff!}
                  fromAgent={from}
                  toAgent={to}
                />
              );
            })()}
        </pixiContainer>
      </Application>
    </div>
  );
}
