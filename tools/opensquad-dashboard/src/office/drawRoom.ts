import type { Graphics as PixiGraphics } from "pixi.js";
import { COLORS, TILE } from "./palette";

export function drawFloor(g: PixiGraphics, w: number, h: number, offsetX: number, offsetY: number) {
  // Base wood fill
  g.rect(offsetX, offsetY, w, h);
  g.fill({ color: COLORS.woodBase });

  const plankH = 12;
  const plankW = 64;
  const shades = [COLORS.woodLight, COLORS.woodBase, COLORS.woodDark];

  for (let row = 0; row <= Math.ceil(h / plankH); row++) {
    const py = offsetY + row * plankH;
    if (py >= offsetY + h) break;

    const rowH = Math.min(plankH - 1, offsetY + h - py);
    if (rowH <= 0) continue;

    const shade = shades[row % 3];
    const jOffset = (row % 2) * (plankW / 2);

    // Plank row fill
    g.rect(offsetX, py, w, rowH);
    g.fill({ color: shade });

    // Horizontal gap between plank rows
    if (row > 0) {
      g.rect(offsetX, py, w, 1);
      g.fill({ color: COLORS.woodGap, alpha: 0.35 });
    }

    // Vertical joints (staggered)
    for (let jx = jOffset; jx < w; jx += plankW) {
      if (jx > 0) {
        g.rect(offsetX + jx, py, 1, rowH);
        g.fill({ color: COLORS.woodGap, alpha: 0.25 });
      }
    }
  }

  // Subtle tile grid overlay (Gather.town style)
  for (let row = 1; row < Math.ceil(h / TILE); row++) {
    g.rect(offsetX, offsetY + row * TILE, w, 1);
    g.fill({ color: COLORS.woodGap, alpha: 0.08 });
  }
  for (let col = 1; col < Math.ceil(w / TILE); col++) {
    g.rect(offsetX + col * TILE, offsetY, 1, h);
    g.fill({ color: COLORS.woodGap, alpha: 0.08 });
  }
}
