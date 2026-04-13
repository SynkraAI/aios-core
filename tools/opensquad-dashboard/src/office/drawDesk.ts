import type { Graphics as PixiGraphics } from "pixi.js";
import { COLORS } from "./palette";

// Cell is 128px wide × 128px tall.
// Y layout:
//   y+0   text area (name/status, drawn in AgentDesk)
//   y+28  desk surface starts
//   y+70  desk front edge
//   y+72  character sprite position (32×32)
//   y+128 cell bottom

export function drawDeskArea(g: PixiGraphics, x: number, y: number) {
  // Subtle ground shadow under desk + chair area
  g.roundRect(x + 12, y + 26, 104, 80, 4);
  g.fill({ color: 0x000000, alpha: 0.04 });

  // Office chair — top-down view
  const cx = x + 64;
  const cy = y + 88;

  // Chair star base (5 caster wheels)
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const wx = cx + Math.cos(angle) * 18;
    const wy = cy + Math.sin(angle) * 14;
    g.rect(wx - 1.5, wy - 1.5, 3, 3);
    g.fill({ color: COLORS.chairBase });
  }

  // Seat cushion (dark ellipse — character sprite sits on top)
  g.ellipse(cx, cy, 18, 15);
  g.fill({ color: COLORS.chairSeat });
}

export function drawWorkstationBack(g: PixiGraphics, x: number, y: number) {
  // Desk surface (light maple, top-down view)
  g.roundRect(x + 14, y + 28, 100, 42, 2);
  g.fill({ color: COLORS.deskTop });

  // Desk edge shadow (front of desk, seen from above)
  g.rect(x + 14, y + 68, 100, 2);
  g.fill({ color: COLORS.deskEdge });

  // Monitor (modern thin bezel)
  g.roundRect(x + 38, y + 32, 52, 26, 2);
  g.fill({ color: COLORS.monitorFrame });

  // Monitor screen (dark/off)
  g.roundRect(x + 40, y + 34, 48, 22, 1);
  g.fill({ color: COLORS.monitorScreen });

  // Monitor stand (thin pole)
  g.rect(x + 62, y + 58, 4, 6);
  g.fill({ color: COLORS.monitorFrame });

  // Stand base (wider)
  g.roundRect(x + 54, y + 63, 20, 3, 1);
  g.fill({ color: COLORS.monitorFrame });
}

export function drawWorkstationFront(g: PixiGraphics, x: number, y: number) {
  // Keyboard on desk surface
  g.roundRect(x + 46, y + 64, 30, 5, 1);
  g.fill({ color: COLORS.keyboard });
  // Key rows
  for (let row = 0; row < 2; row++) {
    for (let key = 0; key < 7; key++) {
      g.rect(x + 47 + key * 4, y + 65 + row * 2, 3, 1);
      g.fill({ color: 0x5a5a5a });
    }
  }

  // Mouse (right of keyboard)
  g.roundRect(x + 80, y + 64, 8, 10, 3);
  g.fill({ color: COLORS.keyboard });

  // Desk front edge (thin line — depth cue)
  g.rect(x + 14, y + 70, 100, 2);
  g.fill({ color: COLORS.deskEdge });
  g.rect(x + 14, y + 72, 100, 1);
  g.fill({ color: COLORS.deskShadow, alpha: 0.2 });
}

export function drawScreenGlow(g: PixiGraphics, x: number, y: number) {
  // Active monitor screen
  g.roundRect(x + 40, y + 34, 48, 22, 1);
  g.fill({ color: COLORS.monitorScreenOn });

  // Screen ambient glow (soft, larger)
  g.roundRect(x + 34, y + 30, 60, 30, 3);
  g.fill({ color: COLORS.monitorScreenOn, alpha: 0.06 });
}
