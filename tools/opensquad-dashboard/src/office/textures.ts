import { Texture, CanvasSource } from "pixi.js";
import { COLORS } from "./palette";

type CharacterColors = {
  hair: number;
  skin: number;
  shirt: number;
};

function hexToRgb(hex: number): [number, number, number] {
  return [(hex >> 16) & 0xff, (hex >> 8) & 0xff, hex & 0xff];
}

function createCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  return [canvas, ctx];
}

// 1 pixel per logical pixel — SCENE_SCALE=2 handles display scaling
function px(ctx: CanvasRenderingContext2D, x: number, y: number, color: number) {
  const [r, g, b] = hexToRgb(color);
  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fillRect(x, y, 1, 1);
}

function drawCharacterIdle(ctx: CanvasRenderingContext2D, c: CharacterColors) {
  // Hair
  px(ctx, 12, 2, c.hair); px(ctx, 13, 2, c.hair); px(ctx, 14, 2, c.hair);
  px(ctx, 15, 2, c.hair); px(ctx, 16, 2, c.hair); px(ctx, 17, 2, c.hair);
  px(ctx, 11, 3, c.hair); px(ctx, 12, 3, c.hair); px(ctx, 13, 3, c.hair);
  px(ctx, 14, 3, c.hair); px(ctx, 15, 3, c.hair); px(ctx, 16, 3, c.hair);
  px(ctx, 17, 3, c.hair); px(ctx, 18, 3, c.hair); px(ctx, 19, 3, c.hair);
  px(ctx, 11, 4, c.hair); px(ctx, 19, 4, c.hair); // sideburns

  // Face
  px(ctx, 12, 4, c.skin); px(ctx, 13, 4, c.skin); px(ctx, 14, 4, c.skin);
  px(ctx, 15, 4, c.skin); px(ctx, 16, 4, c.skin); px(ctx, 17, 4, c.skin);
  px(ctx, 18, 4, c.skin);
  for (let i = 11; i <= 19; i++) px(ctx, i, 5, c.skin);
  for (let i = 11; i <= 19; i++) px(ctx, i, 6, c.skin);
  for (let i = 11; i <= 19; i++) px(ctx, i, 7, c.skin);
  for (let i = 12; i <= 18; i++) px(ctx, i, 8, c.skin);
  for (let i = 13; i <= 17; i++) px(ctx, i, 9, c.skin);
  for (let i = 13; i <= 17; i++) px(ctx, i, 10, c.skin);

  // Eyes
  px(ctx, 13, 6, 0x2a2018); px(ctx, 17, 6, 0x2a2018);

  // Mouth (idle — neutral line)
  px(ctx, 14, 9, 0x2a2018); px(ctx, 15, 9, 0x2a2018); px(ctx, 16, 9, 0x2a2018);

  // Neck
  px(ctx, 14, 11, c.skin); px(ctx, 15, 11, c.skin);
  px(ctx, 16, 11, c.skin); px(ctx, 17, 11, c.skin);

  // Shirt body
  for (let i = 10; i <= 21; i++) px(ctx, i, 12, c.shirt); // shoulders
  for (let y = 13; y <= 19; y++) {
    for (let i = 11; i <= 20; i++) px(ctx, i, y, c.shirt);
  }

  // Arms at sides
  px(ctx, 8, 12, c.skin); px(ctx, 9, 12, c.shirt); px(ctx, 10, 12, c.shirt);
  px(ctx, 8, 13, c.skin); px(ctx, 9, 13, c.skin);
  px(ctx, 8, 14, c.skin); px(ctx, 9, 14, c.skin);
  px(ctx, 8, 15, c.skin); px(ctx, 9, 15, c.skin);
  px(ctx, 8, 16, c.skin); px(ctx, 9, 16, c.skin);
  px(ctx, 8, 17, c.skin); px(ctx, 9, 17, c.skin);
  px(ctx, 8, 18, c.skin);
  px(ctx, 21, 12, c.shirt); px(ctx, 22, 12, c.shirt); px(ctx, 23, 12, c.skin);
  px(ctx, 22, 13, c.skin); px(ctx, 23, 13, c.skin);
  px(ctx, 22, 14, c.skin); px(ctx, 23, 14, c.skin);
  px(ctx, 22, 15, c.skin); px(ctx, 23, 15, c.skin);
  px(ctx, 22, 16, c.skin); px(ctx, 23, 16, c.skin);
  px(ctx, 22, 17, c.skin); px(ctx, 23, 17, c.skin);
  px(ctx, 23, 18, c.skin);

  // Belt
  for (let i = 11; i <= 20; i++) px(ctx, i, 20, COLORS.pantsDark);

  // Legs (pants)
  for (let y = 21; y <= 26; y++) {
    px(ctx, 11, y, COLORS.pantsDark); px(ctx, 12, y, COLORS.pantsDark);
    px(ctx, 13, y, COLORS.pantsDark); px(ctx, 14, y, COLORS.pantsDark);
    // gap between legs
    px(ctx, 17, y, COLORS.pantsDark); px(ctx, 18, y, COLORS.pantsDark);
    px(ctx, 19, y, COLORS.pantsDark); px(ctx, 20, y, COLORS.pantsDark);
  }

  // Shoes
  for (let i = 10; i <= 14; i++) px(ctx, i, 27, COLORS.shoeDark);
  for (let i = 10; i <= 14; i++) px(ctx, i, 28, COLORS.shoeDark);
  for (let i = 10; i <= 14; i++) px(ctx, i, 29, COLORS.shoeDark);
  for (let i = 17; i <= 21; i++) px(ctx, i, 27, COLORS.shoeDark);
  for (let i = 17; i <= 21; i++) px(ctx, i, 28, COLORS.shoeDark);
  for (let i = 17; i <= 21; i++) px(ctx, i, 29, COLORS.shoeDark);
}

function drawCharacterWorking(ctx: CanvasRenderingContext2D, c: CharacterColors, frame: 0 | 1) {
  // Same head/hair as idle
  px(ctx, 12, 2, c.hair); px(ctx, 13, 2, c.hair); px(ctx, 14, 2, c.hair);
  px(ctx, 15, 2, c.hair); px(ctx, 16, 2, c.hair); px(ctx, 17, 2, c.hair);
  px(ctx, 11, 3, c.hair); px(ctx, 12, 3, c.hair); px(ctx, 13, 3, c.hair);
  px(ctx, 14, 3, c.hair); px(ctx, 15, 3, c.hair); px(ctx, 16, 3, c.hair);
  px(ctx, 17, 3, c.hair); px(ctx, 18, 3, c.hair); px(ctx, 19, 3, c.hair);
  px(ctx, 11, 4, c.hair); px(ctx, 19, 4, c.hair);

  for (let i = 12; i <= 18; i++) px(ctx, i, 4, c.skin);
  for (let i = 11; i <= 19; i++) px(ctx, i, 5, c.skin);
  for (let i = 11; i <= 19; i++) px(ctx, i, 6, c.skin);
  for (let i = 11; i <= 19; i++) px(ctx, i, 7, c.skin);
  for (let i = 12; i <= 18; i++) px(ctx, i, 8, c.skin);
  for (let i = 13; i <= 17; i++) px(ctx, i, 9, c.skin);
  for (let i = 13; i <= 17; i++) px(ctx, i, 10, c.skin);
  px(ctx, 13, 6, 0x2a2018); px(ctx, 17, 6, 0x2a2018);
  // Eyes slightly down (focused)
  px(ctx, 13, 7, 0x2a2018); px(ctx, 17, 7, 0x2a2018);
  px(ctx, 14, 9, 0x2a2018); px(ctx, 15, 9, 0x2a2018); px(ctx, 16, 9, 0x2a2018);

  px(ctx, 14, 11, c.skin); px(ctx, 15, 11, c.skin);
  px(ctx, 16, 11, c.skin); px(ctx, 17, 11, c.skin);

  for (let i = 10; i <= 21; i++) px(ctx, i, 12, c.shirt);
  for (let y = 13; y <= 19; y++) {
    for (let i = 11; i <= 20; i++) px(ctx, i, y, c.shirt);
  }
  for (let i = 11; i <= 20; i++) px(ctx, i, 20, COLORS.pantsDark);
  for (let y = 21; y <= 26; y++) {
    px(ctx, 11, y, COLORS.pantsDark); px(ctx, 12, y, COLORS.pantsDark);
    px(ctx, 13, y, COLORS.pantsDark); px(ctx, 14, y, COLORS.pantsDark);
    px(ctx, 17, y, COLORS.pantsDark); px(ctx, 18, y, COLORS.pantsDark);
    px(ctx, 19, y, COLORS.pantsDark); px(ctx, 20, y, COLORS.pantsDark);
  }
  for (let i = 10; i <= 14; i++) { px(ctx, i, 27, COLORS.shoeDark); px(ctx, i, 28, COLORS.shoeDark); px(ctx, i, 29, COLORS.shoeDark); }
  for (let i = 17; i <= 21; i++) { px(ctx, i, 27, COLORS.shoeDark); px(ctx, i, 28, COLORS.shoeDark); px(ctx, i, 29, COLORS.shoeDark); }

  // Arms forward (typing) — alternate frames
  if (frame === 0) {
    // Arms reaching forward and down
    for (let y = 12; y <= 16; y++) { px(ctx, 8, y, c.skin); px(ctx, 9, y, c.skin); }
    px(ctx, 9, 17, c.skin); px(ctx, 10, 17, c.skin); px(ctx, 11, 17, c.skin);
    for (let y = 12; y <= 16; y++) { px(ctx, 22, y, c.skin); px(ctx, 23, y, c.skin); }
    px(ctx, 20, 17, c.skin); px(ctx, 21, 17, c.skin); px(ctx, 22, 17, c.skin);
  } else {
    // Arms slightly raised (keystroke)
    for (let y = 12; y <= 15; y++) { px(ctx, 8, y, c.skin); px(ctx, 9, y, c.skin); }
    px(ctx, 9, 16, c.skin); px(ctx, 10, 16, c.skin); px(ctx, 11, 18, c.skin);
    for (let y = 12; y <= 15; y++) { px(ctx, 22, y, c.skin); px(ctx, 23, y, c.skin); }
    px(ctx, 20, 16, c.skin); px(ctx, 21, 16, c.skin); px(ctx, 22, 18, c.skin);
  }
}

function drawCharacterDone(ctx: CanvasRenderingContext2D, c: CharacterColors) {
  // Head + face
  px(ctx, 12, 2, c.hair); px(ctx, 13, 2, c.hair); px(ctx, 14, 2, c.hair);
  px(ctx, 15, 2, c.hair); px(ctx, 16, 2, c.hair); px(ctx, 17, 2, c.hair);
  px(ctx, 11, 3, c.hair); px(ctx, 12, 3, c.hair); px(ctx, 13, 3, c.hair);
  px(ctx, 14, 3, c.hair); px(ctx, 15, 3, c.hair); px(ctx, 16, 3, c.hair);
  px(ctx, 17, 3, c.hair); px(ctx, 18, 3, c.hair); px(ctx, 19, 3, c.hair);
  px(ctx, 11, 4, c.hair); px(ctx, 19, 4, c.hair);

  for (let i = 12; i <= 18; i++) px(ctx, i, 4, c.skin);
  for (let i = 11; i <= 19; i++) px(ctx, i, 5, c.skin);
  for (let i = 11; i <= 19; i++) px(ctx, i, 6, c.skin);
  for (let i = 11; i <= 19; i++) px(ctx, i, 7, c.skin);
  for (let i = 12; i <= 18; i++) px(ctx, i, 8, c.skin);
  for (let i = 13; i <= 17; i++) px(ctx, i, 9, c.skin);
  for (let i = 13; i <= 17; i++) px(ctx, i, 10, c.skin);
  px(ctx, 13, 6, 0x2a2018); px(ctx, 17, 6, 0x2a2018);
  // Smile
  px(ctx, 13, 9, 0x2a2018); px(ctx, 17, 9, 0x2a2018);
  px(ctx, 14, 10, 0x2a2018); px(ctx, 15, 10, 0x2a2018); px(ctx, 16, 10, 0x2a2018);

  px(ctx, 14, 11, c.skin); px(ctx, 15, 11, c.skin);
  px(ctx, 16, 11, c.skin); px(ctx, 17, 11, c.skin);

  for (let i = 10; i <= 21; i++) px(ctx, i, 12, c.shirt);
  for (let y = 13; y <= 19; y++) {
    for (let i = 11; i <= 20; i++) px(ctx, i, y, c.shirt);
  }
  for (let i = 11; i <= 20; i++) px(ctx, i, 20, COLORS.pantsDark);
  for (let y = 21; y <= 26; y++) {
    px(ctx, 11, y, COLORS.pantsDark); px(ctx, 12, y, COLORS.pantsDark);
    px(ctx, 13, y, COLORS.pantsDark); px(ctx, 14, y, COLORS.pantsDark);
    px(ctx, 17, y, COLORS.pantsDark); px(ctx, 18, y, COLORS.pantsDark);
    px(ctx, 19, y, COLORS.pantsDark); px(ctx, 20, y, COLORS.pantsDark);
  }
  for (let i = 10; i <= 14; i++) { px(ctx, i, 27, COLORS.shoeDark); px(ctx, i, 28, COLORS.shoeDark); px(ctx, i, 29, COLORS.shoeDark); }
  for (let i = 17; i <= 21; i++) { px(ctx, i, 27, COLORS.shoeDark); px(ctx, i, 28, COLORS.shoeDark); px(ctx, i, 29, COLORS.shoeDark); }

  // Arms raised (celebration)
  px(ctx, 7, 8, c.skin); px(ctx, 6, 7, c.skin); px(ctx, 5, 6, c.skin);
  px(ctx, 8, 10, c.skin); px(ctx, 9, 11, c.skin); px(ctx, 9, 12, c.shirt);
  px(ctx, 24, 8, c.skin); px(ctx, 25, 7, c.skin); px(ctx, 26, 6, c.skin);
  px(ctx, 23, 10, c.skin); px(ctx, 22, 11, c.skin); px(ctx, 22, 12, c.shirt);
}

export interface CharacterTextures {
  idle: Texture;
  working: [Texture, Texture];
  done: Texture;
  checkpoint: Texture;
}

export function generateCharacterTextures(colors: CharacterColors): CharacterTextures {
  const size = 32;

  function makeFrame(drawFn: (ctx: CanvasRenderingContext2D) => void): Texture {
    const [canvas, ctx] = createCanvas(size, size);
    drawFn(ctx);
    return new Texture({ source: new CanvasSource({ resource: canvas, scaleMode: "nearest" }) });
  }

  return {
    idle: makeFrame((ctx) => drawCharacterIdle(ctx, colors)),
    working: [
      makeFrame((ctx) => drawCharacterWorking(ctx, colors, 0)),
      makeFrame((ctx) => drawCharacterWorking(ctx, colors, 1)),
    ],
    done: makeFrame((ctx) => drawCharacterDone(ctx, colors)),
    checkpoint: makeFrame((ctx) => drawCharacterIdle(ctx, colors)),
  };
}

const textureCache = new Map<number, CharacterTextures>();

export function getCharacterTextures(variantIndex: number, colors: CharacterColors): CharacterTextures {
  if (!textureCache.has(variantIndex)) {
    textureCache.set(variantIndex, generateCharacterTextures(colors));
  }
  return textureCache.get(variantIndex)!;
}
