// === Office Color Palette (Gather.town-inspired modern office) ===
export const COLORS = {
  // Floor (wood planks)
  woodLight: 0x9a7a56,
  woodBase: 0x876a48,
  woodDark: 0x755a3a,
  woodGap: 0x4e3a28,

  // Walls (clean cream)
  wallFace: 0xe4d8cc,
  wallTrim: 0xa89888,
  wallShadow: 0x887868,

  // Desk / Workstation (light maple)
  deskTop: 0xd4bf9c,
  deskEdge: 0xb8a480,
  deskShadow: 0x806844,
  monitorFrame: 0x2a2a32,
  monitorScreen: 0x1a2a3a,
  monitorScreenOn: 0x4a9aff,
  keyboard: 0x3a3a42,

  // Office chair (top-down)
  chairSeat: 0x3a3a4a,
  chairBase: 0x4a4a5a,

  // Furniture / Decor
  bookshelfWood: 0xc4a070,
  plantGreen: 0x5aaa5a,
  plantDark: 0x3a7a3a,
  plantPot: 0xd4a878,
  whiteboardBg: 0xf5f0ea,
  whiteboardFrame: 0x8a8a92,
  clockFace: 0xf0ebe0,
  clockFrame: 0x6a6a72,
  coffeeMachine: 0x4a4a52,

  // Characters
  skinLight: 0xf5c5a3,
  skinMedium: 0xd4a574,
  skinDark: 0x8b6340,
  hairBlack: 0x2a2018,
  hairBrown: 0x6a4a2a,
  hairBlonde: 0xd4a840,
  hairRed: 0xb04020,
  shirtBlue: 0x4a78b0,
  shirtGreen: 0x4a8a4a,
  shirtRed: 0xa84848,
  shirtWhite: 0xe0d8cc,
  shirtPurple: 0x7a58a0,
  pantsDark: 0x3a3a4a,
  shoeDark: 0x2a2018,

  // Status effects (high contrast)
  statusIdle: 0xaaaacc,
  statusWorking: 0x60b0ff,
  statusDone: 0x60f080,
  statusCheckpoint: 0xffbb22,
  bubbleBg: 0xffffff,
  bubbleBorder: 0x3a3a4a,
  particleGreen: 0x60f080,

  // Envelope
  envelopeBody: 0xf5e6c8,
  envelopeFold: 0xe0d0b0,
  envelopeSeal: 0xcc3333,
} as const;

// === Layout Constants ===
export const TILE = 32;
export const CELL_W = 4 * TILE; // 128px wide per cell (spacious)
export const CELL_H = 4 * TILE; // 128px tall per cell
export const SCENE_SCALE = 2;   // Integer scaling — crisp pixel art

// Character variants (assigned round-robin to agents)
export const CHARACTER_VARIANTS = [
  { hair: COLORS.hairBlack,  skin: COLORS.skinLight,  shirt: COLORS.shirtBlue   },
  { hair: COLORS.hairBrown,  skin: COLORS.skinMedium, shirt: COLORS.shirtGreen  },
  { hair: COLORS.hairBlonde, skin: COLORS.skinLight,  shirt: COLORS.shirtRed    },
  { hair: COLORS.hairRed,    skin: COLORS.skinDark,   shirt: COLORS.shirtWhite  },
  { hair: COLORS.hairBlack,  skin: COLORS.skinMedium, shirt: COLORS.shirtPurple },
  { hair: COLORS.hairBrown,  skin: COLORS.skinLight,  shirt: COLORS.shirtGreen  },
] as const;
