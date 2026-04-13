import type { Graphics as PixiGraphics } from "pixi.js";
import { COLORS, TILE } from "./palette";

export function drawBookshelf(g: PixiGraphics, x: number, y: number) {
  const w = TILE * 2;
  const h = TILE * 1.5;

  g.rect(x, y, w, h);
  g.fill({ color: COLORS.bookshelfWood });
  g.stroke({ color: COLORS.deskShadow, width: 1 });

  for (let row = 0; row < 3; row++) {
    const sy = y + 4 + row * (h / 3);
    g.rect(x + 2, sy + (h / 3) - 3, w - 4, 2);
    g.fill({ color: COLORS.deskShadow });
    const bookColors = [0xcc4444, 0x4466aa, 0x44aa44, 0xaaaa44, 0x8844aa, 0xaa6644];
    for (let b = 0; b < 5; b++) {
      const bx = x + 4 + b * 11;
      const bw = 8 + (b % 2) * 2;
      const bh = (h / 3) - 6;
      g.rect(bx, sy, bw, bh);
      g.fill({ color: bookColors[(row * 5 + b) % bookColors.length] });
    }
  }
}

export function drawPlant(g: PixiGraphics, x: number, y: number) {
  // Modern rounded planter
  g.roundRect(x + 6, y + 18, 20, 14, 3);
  g.fill({ color: COLORS.plantPot });
  // Planter rim
  g.roundRect(x + 4, y + 16, 24, 4, 2);
  g.fill({ color: COLORS.plantPot });

  // Lush leaves (overlapping circles)
  const leaves: [number, number, number, number][] = [
    [16, 10, 8, COLORS.plantGreen],
    [10, 6, 6, COLORS.plantGreen],
    [22, 6, 6, COLORS.plantGreen],
    [13, 2, 5, COLORS.plantDark],
    [19, 3, 5, COLORS.plantDark],
    [16, 0, 4, COLORS.plantGreen],
  ];
  for (const [lx, ly, r, color] of leaves) {
    g.circle(x + lx, y + ly, r);
    g.fill({ color });
  }
}

export function drawClock(g: PixiGraphics, x: number, y: number) {
  // Modern wall clock
  g.circle(x + 12, y + 12, 11);
  g.fill({ color: COLORS.clockFrame });
  g.circle(x + 12, y + 12, 9);
  g.fill({ color: COLORS.clockFace });

  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const mx = x + 12 + Math.cos(angle) * 7;
    const my = y + 12 + Math.sin(angle) * 7;
    g.circle(mx, my, 1);
    g.fill({ color: COLORS.clockFrame });
  }

  g.moveTo(x + 12, y + 12);
  g.lineTo(x + 12, y + 6);
  g.stroke({ color: COLORS.clockFrame, width: 1.5 });
  g.moveTo(x + 12, y + 12);
  g.lineTo(x + 17, y + 12);
  g.stroke({ color: COLORS.clockFrame, width: 1 });
}

export function drawWhiteboard(g: PixiGraphics, x: number, y: number) {
  // Aluminum frame
  g.roundRect(x, y, 48, 30, 1);
  g.fill({ color: COLORS.whiteboardFrame });

  // White surface
  g.rect(x + 2, y + 2, 44, 26);
  g.fill({ color: COLORS.whiteboardBg });

  // Marker doodles (colorful notes)
  g.moveTo(x + 6, y + 8);
  g.lineTo(x + 20, y + 14);
  g.stroke({ color: 0x4a78b0, width: 1 });

  g.moveTo(x + 10, y + 18);
  g.lineTo(x + 30, y + 10);
  g.stroke({ color: 0xa84848, width: 1 });

  g.moveTo(x + 24, y + 18);
  g.lineTo(x + 40, y + 22);
  g.stroke({ color: 0x4a8a4a, width: 1 });

  // Marker tray at bottom
  g.rect(x + 4, y + 27, 40, 2);
  g.fill({ color: COLORS.whiteboardFrame });
}

export function drawCoffeeMachine(g: PixiGraphics, x: number, y: number) {
  g.roundRect(x + 6, y + 4, 20, 24, 2);
  g.fill({ color: COLORS.coffeeMachine });
  g.stroke({ color: 0x2a2a2a, width: 1 });
  g.rect(x + 8, y + 6, 16, 8);
  g.fill({ color: 0x3a3a3a });
  g.circle(x + 12, y + 10, 2);
  g.fill({ color: 0x44ff44 });
  g.rect(x + 10, y + 18, 12, 8);
  g.fill({ color: 0x2a2a2a });
  g.rect(x + 12, y + 20, 8, 6);
  g.fill({ color: 0xeeeeee });
}

export function drawFilingCabinet(g: PixiGraphics, x: number, y: number) {
  const w = TILE;
  const h = TILE * 1.5;

  g.roundRect(x, y, w, h, 2);
  g.fill({ color: 0x6a6a7a });
  g.stroke({ color: 0x4a4a5a, width: 1 });

  for (let d = 0; d < 3; d++) {
    const dy = y + 4 + d * 14;
    g.roundRect(x + 3, dy, w - 6, 12, 1);
    g.fill({ color: 0x5a5a6a });
    g.roundRect(x + 12, dy + 4, 8, 3, 1);
    g.fill({ color: 0x8a8a9a });
  }
}
