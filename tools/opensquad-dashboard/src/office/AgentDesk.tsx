import { useCallback, useEffect, useRef, useState } from "react";
import { extend } from "@pixi/react";
import { Container, Graphics, Text, Sprite } from "pixi.js";
import type { Agent } from "@/types/state";
import type { Graphics as PixiGraphics, TextStyleOptions, Texture } from "pixi.js";
import { COLORS, CELL_W, CELL_H, TILE, CHARACTER_VARIANTS } from "./palette";
import { drawDeskArea, drawWorkstationBack, drawWorkstationFront, drawScreenGlow } from "./drawDesk";
import { getCharacterTextures } from "./textures";

extend({ Container, Graphics, Text, Sprite });

export { CELL_W, CELL_H };

export const GRID_OFFSET_X = TILE * 3;
export const GRID_OFFSET_Y = TILE * 3;

interface AgentDeskProps {
  agent: Agent;
  agentIndex: number;
}

export function AgentDesk({ agent, agentIndex }: AgentDeskProps) {
  const x = GRID_OFFSET_X + (agent.desk.col - 1) * CELL_W;
  const y = GRID_OFFSET_Y + (agent.desk.row - 1) * CELL_H;

  const [frame, setFrame] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (agent.status !== "working") {
      setFrame(0);
      return;
    }
    const interval = setInterval(() => {
      frameRef.current = (frameRef.current + 1) % 2;
      setFrame(frameRef.current);
    }, 250);
    return () => clearInterval(interval);
  }, [agent.status]);

  const variant = CHARACTER_VARIANTS[agentIndex % CHARACTER_VARIANTS.length];
  const textures = getCharacterTextures(agentIndex, variant);

  let currentTexture: Texture;
  switch (agent.status) {
    case "working":
    case "delivering":
      currentTexture = textures.working[frame % 2];
      break;
    case "done":
      currentTexture = textures.done;
      break;
    default:
      currentTexture = textures.idle;
  }

  const drawStationBack = useCallback(
    (g: PixiGraphics) => {
      g.clear();
      drawDeskArea(g, 0, 0);
      drawWorkstationBack(g, 0, 0);
      if (agent.status === "working" || agent.status === "delivering") {
        drawScreenGlow(g, 0, 0);
      }
    },
    [agent.status]
  );

  const drawStationFront = useCallback(
    (g: PixiGraphics) => {
      g.clear();
      drawWorkstationFront(g, 0, 0);
    },
    []
  );

  const drawBubble = useCallback(
    (g: PixiGraphics) => {
      g.clear();
      if (agent.status === "checkpoint") {
        g.roundRect(0, 0, 18, 18, 4);
        g.fill({ color: COLORS.bubbleBg });
        g.stroke({ color: COLORS.bubbleBorder, width: 1 });
        g.moveTo(6, 18);
        g.lineTo(9, 22);
        g.lineTo(12, 18);
        g.fill({ color: COLORS.bubbleBg });
      } else if (agent.status === "done") {
        for (let i = 0; i < 5; i++) {
          const px = 4 + (i * 7);
          const py = 4 + ((i % 3) * 4);
          g.circle(px, py, 2);
          g.fill({ color: COLORS.particleGreen, alpha: 0.7 });
        }
      }
    },
    [agent.status]
  );

  const nameStyle: TextStyleOptions = {
    fontSize: 12,
    fill: 0xffffff,
    fontFamily: "'Courier New', monospace",
    fontWeight: "bold",
    dropShadow: {
      alpha: 0.8,
      blur: 2,
      color: 0x000000,
      distance: 1,
    },
  };

  const statusStyle: TextStyleOptions = {
    fontSize: 10,
    fill: agent.status === "working" ? COLORS.statusWorking
      : agent.status === "done" ? COLORS.statusDone
      : agent.status === "checkpoint" ? COLORS.statusCheckpoint
      : COLORS.statusIdle,
    fontFamily: "'Courier New', monospace",
    fontWeight: "bold",
    dropShadow: {
      alpha: 0.6,
      blur: 1,
      color: 0x000000,
      distance: 1,
    },
  };

  return (
    <pixiContainer x={x} y={y}>
      {/* Layer 1: chair + monitor (behind character) */}
      <pixiGraphics draw={drawStationBack} />

      {/* Layer 2: character sprite — centered in 128px cell: (128-32)/2=48 */}
      <pixiSprite
        texture={currentTexture}
        x={48}
        y={72}
        width={32}
        height={32}
      />

      {/* Layer 3: desk surface + keyboard (in front of character) */}
      <pixiGraphics draw={drawStationFront} />

      {/* Layer 4: status bubbles and labels (always on top) */}
      {(agent.status === "checkpoint" || agent.status === "done") && (
        <pixiGraphics draw={drawBubble} x={100} y={2} />
      )}
      {agent.status === "checkpoint" && (
        <pixiText
          text="?"
          style={{ fontSize: 12, fill: COLORS.statusCheckpoint, fontWeight: "bold" } as TextStyleOptions}
          x={104}
          y={2}
        />
      )}
      <pixiText text={agent.name} style={nameStyle} x={4} y={2} />
      <pixiText text={agent.status} style={statusStyle} x={4} y={14} />
    </pixiContainer>
  );
}
