import { extend } from "@pixi/react";
import { Container, Graphics } from "pixi.js";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Graphics as PixiGraphics } from "pixi.js";
import { CELL_W, CELL_H, GRID_OFFSET_X, GRID_OFFSET_Y } from "./AgentDesk";
import { COLORS } from "./palette";
import type { Agent, Handoff } from "@/types/state";

extend({ Container, Graphics });

interface HandoffEnvelopeProps {
  handoff: Handoff;
  fromAgent: Agent;
  toAgent: Agent;
}

export function HandoffEnvelope({ handoff, fromAgent, toAgent }: HandoffEnvelopeProps) {
  const [pos, setPos] = useState<{ x: number; y: number; scale: number; rotation: number } | null>(null);
  const animatingRef = useRef(false);
  const lastHandoffRef = useRef<string | null>(null);

  const deskCenterX = CELL_W / 2;
  const deskCenterY = CELL_H / 2;
  const fromX = GRID_OFFSET_X + (fromAgent.desk.col - 1) * CELL_W + deskCenterX;
  const fromY = GRID_OFFSET_Y + (fromAgent.desk.row - 1) * CELL_H + deskCenterY;
  const toX = GRID_OFFSET_X + (toAgent.desk.col - 1) * CELL_W + deskCenterX;
  const toY = GRID_OFFSET_Y + (toAgent.desk.row - 1) * CELL_H + deskCenterY;

  useEffect(() => {
    const key = `${handoff.from}-${handoff.to}-${handoff.completedAt}`;
    if (lastHandoffRef.current === key || animatingRef.current) return;
    lastHandoffRef.current = key;
    animatingRef.current = true;

    const duration = 1200;
    const start = performance.now();
    let frameId: number;
    let timeoutId: ReturnType<typeof setTimeout>;

    function easeOutBounce(t: number): number {
      if (t < 1 / 2.75) return 7.5625 * t * t;
      if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
      if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    }

    function animate(now: number) {
      const rawT = Math.min((now - start) / duration, 1);
      const t = easeOutBounce(rawT);

      const arcHeight = -40;
      const linearY = fromY + (toY - fromY) * t;
      const arc = arcHeight * Math.sin(rawT * Math.PI);
      const wobble = Math.sin(rawT * Math.PI * 4) * 0.15;
      const scale = rawT < 0.1 ? rawT * 10 : 1;

      setPos({
        x: fromX + (toX - fromX) * t,
        y: linearY + arc,
        scale,
        rotation: wobble,
      });

      if (rawT < 1) {
        frameId = requestAnimationFrame(animate);
      } else {
        timeoutId = setTimeout(() => {
          animatingRef.current = false;
          setPos(null);
        }, 300);
      }
    }

    setPos({ x: fromX, y: fromY, scale: 0.5, rotation: 0 });
    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timeoutId);
    };
  }, [handoff, fromX, fromY, toX, toY]);

  const drawEnvelope = useCallback((g: PixiGraphics) => {
    g.clear();
    g.ellipse(0, 14, 14, 4);
    g.fill({ color: 0x000000, alpha: 0.2 });
    g.rect(-14, -8, 28, 18);
    g.fill({ color: COLORS.envelopeBody });
    g.stroke({ color: COLORS.envelopeFold, width: 1 });
    g.moveTo(-14, -8);
    g.lineTo(0, 2);
    g.lineTo(14, -8);
    g.fill({ color: COLORS.envelopeFold });
    g.stroke({ color: COLORS.envelopeSeal, width: 0.5 });
    g.circle(0, 0, 4);
    g.fill({ color: COLORS.envelopeSeal });
    g.circle(0, 0, 2);
    g.fill({ color: 0xff5555 });
  }, []);

  if (!pos) return null;

  return (
    <pixiContainer x={pos.x} y={pos.y} scale={pos.scale} rotation={pos.rotation}>
      <pixiGraphics draw={drawEnvelope} />
    </pixiContainer>
  );
}
