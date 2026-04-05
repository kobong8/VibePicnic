import { Particle } from "../particle";
import renderer from "../renderer";
import { Theme, GroundMap } from "./types";

// 가을 은행나무 테마
// Autumn ginkgo tree with leaves falling one by one

const GINKGO_LEAVES = ["🍂", "🌿", "✦", "❦", "♠", "⍟", "✿", "❧"];
const GINKGO_ASCII = ["V", "Y", "v", "y", "W", "*", "o", "w"];

// Ginkgo yellows and golds
const LEAF_COLORS = [
  [255, 215, 0],   // gold
  [255, 200, 0],   // bright yellow
  [238, 190, 20],  // golden yellow
  [218, 165, 32],  // goldenrod
  [255, 223, 50],  // light gold
  [200, 170, 30],  // darker gold
  [255, 230, 80],  // pale yellow
  [180, 150, 20],  // olive gold
] as const;

// Tree trunk ASCII art (relative coordinates)
// The tree is drawn relative to center of the screen
const TRUNK_PATTERN = [
  // [relX, relY, char, charAscii]
  // Main trunk (bottom to middle)
  { dx: 0, dy: 0, ch: "┃", ascii: "|" },
  { dx: 0, dy: -1, ch: "┃", ascii: "|" },
  { dx: 0, dy: -2, ch: "┃", ascii: "|" },
  { dx: 0, dy: -3, ch: "┃", ascii: "|" },
  { dx: 0, dy: -4, ch: "┃", ascii: "|" },
  { dx: 0, dy: -5, ch: "╿", ascii: "|" },
  { dx: -1, dy: -3, ch: "╱", ascii: "/" },
  { dx: 1, dy: -3, ch: "╲", ascii: "\\" },
  { dx: -1, dy: -4, ch: "╱", ascii: "/" },
  { dx: 1, dy: -4, ch: "╲", ascii: "\\" },
];

// Canopy positions where leaves can exist (relative to tree center top)
function generateCanopyPositions(canopyRadius: number): { dx: number; dy: number }[] {
  const positions: { dx: number; dy: number }[] = [];
  for (let dy = -canopyRadius; dy <= 0; dy++) {
    // Elliptical shape: wider at middle, narrow at top and bottom
    const normalizedY = (dy + canopyRadius) / canopyRadius; // 0 at top, 1 at bottom
    const widthAtY = Math.floor(canopyRadius * Math.sin(normalizedY * Math.PI) * 1.8);
    for (let dx = -widthAtY; dx <= widthAtY; dx++) {
      // Add some organic randomness to shape
      const dist = Math.sqrt(dx * dx + (dy * 1.5) ** 2);
      if (dist < canopyRadius * 1.6) {
        positions.push({ dx, dy });
      }
    }
  }
  return positions;
}

// Track which canopy leaves have fallen
let canopyLeaves: Map<string, { colorIdx: number; charIdx: number; fallen: boolean }> = new Map();
let initialized = false;
let lastWidth = 0;
let lastHeight = 0;
let fallTimer = 0;

function initCanopy(width: number, height: number): void {
  canopyLeaves.clear();
  const canopyRadius = Math.max(5, Math.floor(Math.min(width * 0.2, height * 0.25)));
  const positions = generateCanopyPositions(canopyRadius);

  for (const pos of positions) {
    const key = `${pos.dx},${pos.dy}`;
    canopyLeaves.set(key, {
      colorIdx: Math.floor(Math.random() * LEAF_COLORS.length),
      charIdx: Math.floor(Math.random() * GINKGO_LEAVES.length),
      fallen: false,
    });
  }

  initialized = true;
  lastWidth = width;
  lastHeight = height;
  fallTimer = 0;
}

const ginkgo: Theme = {
  name: "ginkgo",
  label: "🌳 가을 은행나무",
  fps: 15,

  createParticle(width: number, startY: number, ascii: boolean): Particle {
    // Most particles spawn from the canopy area
    const centerX = Math.floor(width * 0.5);
    const canopyRadius = Math.max(5, Math.floor(Math.min(width * 0.2, 30)));

    // Find a canopy leaf to drop
    let spawnX = centerX + (Math.random() - 0.5) * canopyRadius * 2;
    let spawnY = startY;

    // Try to find an unfallen leaf to drop
    const entries = Array.from(canopyLeaves.entries()).filter(([_, v]) => !v.fallen);
    if (entries.length > 0 && Math.random() < 0.3) {
      const [key, leaf] = entries[Math.floor(Math.random() * entries.length)];
      leaf.fallen = true;

      const treeBaseY = Math.floor((lastHeight || 24) * 0.75);
      const canopyTopY = treeBaseY - Math.floor((lastHeight || 24) * 0.45);
      const [dxStr, dyStr] = key.split(",");
      spawnX = centerX + parseInt(dxStr);
      spawnY = canopyTopY + parseInt(dyStr);
    }

    const chars = ascii ? GINKGO_ASCII : GINKGO_LEAVES;
    const colorArr = LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)];

    return new Particle(spawnX, spawnY, {
      speedY: 0.08 + Math.random() * 0.15,
      speedX: (Math.random() - 0.4) * 0.3,
      char: chars[Math.floor(Math.random() * chars.length)],
      color: renderer.fgRgb(colorArr[0], colorArr[1], colorArr[2]),
      amplitude: 1.5 + Math.random() * 3.0,
      bold: Math.random() > 0.6,
      dim: false,
    });
  },

  spawnRate(density: number): number {
    // Very slow spawn rate - leaves fall one at a time
    return Math.random() < density * 0.015 ? 1 : 0;
  },

  groundDisplayH(landings: number): number {
    return Math.min(landings, 4);
  },

  renderGround(groundMap: GroundMap, height: number, width: number, ascii?: boolean): void {
    const leafChars = ascii ? GINKGO_ASCII : GINKGO_LEAVES;
    const topColors = [
      renderer.fgRgb(255, 215, 0),
      renderer.fgRgb(255, 200, 0),
      renderer.fgRgb(238, 190, 20),
    ];
    const baseColors = [
      renderer.fgRgb(180, 150, 20),
      renderer.fgRgb(160, 130, 15),
      renderer.fgRgb(140, 110, 10),
    ];
    for (let x = 0; x < width; x++) {
      const h = groundMap[x] || 0;
      if (h > 0) {
        const displayH = Math.min(h, 4);
        for (let dy = 0; dy < displayH; dy++) {
          const gy = height - 2 - dy;
          if (gy > 0 && gy < height - 1) {
            const ch = leafChars[(x * 7 + dy * 3) % leafChars.length];
            const palette = dy === displayH - 1 ? topColors : baseColors;
            const color = palette[(x * 5 + dy * 3) % palette.length];
            renderer.set(x, gy, ch, color);
          }
        }
      }
    }
  },

  renderBackground(tick: number, width: number, height: number, ascii?: boolean): void {
    if (!initialized || width !== lastWidth || height !== lastHeight) {
      initCanopy(width, height);
    }

    fallTimer = tick;

    const centerX = Math.floor(width * 0.5);
    const treeBaseY = Math.floor(height * 0.75);
    const canopyRadius = Math.max(5, Math.floor(Math.min(width * 0.2, height * 0.25)));
    const canopyTopY = treeBaseY - Math.floor(height * 0.45);
    const trunkColor = renderer.fgRgb(101, 67, 33);
    const darkTrunkColor = renderer.fgRgb(72, 48, 24);

    // === Draw trunk ===
    const trunkHeight = Math.floor(height * 0.3);
    for (let dy = 0; dy < trunkHeight; dy++) {
      const ty = treeBaseY + dy;
      if (ty < height - 1) {
        // Trunk gets slightly wider at the base
        const trunkWidth = dy > trunkHeight * 0.7 ? 2 : (dy > trunkHeight * 0.4 ? 1 : 0);
        for (let dx = -trunkWidth; dx <= trunkWidth; dx++) {
          const tx = centerX + dx;
          if (tx >= 0 && tx < width) {
            const ch = ascii ? "|" : (dx === 0 ? "┃" : "│");
            renderer.set(tx, ty, ch, dx === 0 ? trunkColor : darkTrunkColor);
          }
        }
      }
    }

    // === Draw branches ===
    const branchY = treeBaseY;
    // Left branches
    for (let i = 1; i <= Math.min(canopyRadius * 0.6, 8); i++) {
      const bx = centerX - i;
      const by = branchY - Math.floor(i * 0.4);
      if (bx >= 0 && by >= 0 && by < height) {
        renderer.set(bx, by, ascii ? "/" : "╱", trunkColor);
      }
    }
    // Right branches
    for (let i = 1; i <= Math.min(canopyRadius * 0.6, 8); i++) {
      const bx = centerX + i;
      const by = branchY - Math.floor(i * 0.4);
      if (bx < width && by >= 0 && by < height) {
        renderer.set(bx, by, ascii ? "\\" : "╲", trunkColor);
      }
    }

    // === Draw canopy (remaining leaves) ===
    const leafChars = ascii ? GINKGO_ASCII : GINKGO_LEAVES;
    // Gradually shed leaves over time
    const totalLeaves = canopyLeaves.size;
    const maxFallByTick = Math.floor(tick * 0.05); // Slow shedding

    let fallCount = 0;
    for (const [_, leaf] of canopyLeaves) {
      if (!leaf.fallen) fallCount++;
    }

    // Randomly mark some leaves as fallen based on time
    if (tick > 30 && tick % 20 === 0) {
      const entries = Array.from(canopyLeaves.entries()).filter(([_, v]) => !v.fallen);
      if (entries.length > totalLeaves * 0.15) { // Keep at least 15% of leaves
        const numToDrop = Math.min(3, entries.length);
        for (let i = 0; i < numToDrop; i++) {
          const idx = Math.floor(Math.random() * entries.length);
          entries[idx][1].fallen = true;
          entries.splice(idx, 1);
        }
      }
    }

    // Render remaining canopy leaves
    for (const [key, leaf] of canopyLeaves) {
      if (leaf.fallen) continue;

      const [dxStr, dyStr] = key.split(",");
      const lx = centerX + parseInt(dxStr);
      const ly = canopyTopY + parseInt(dyStr);

      if (lx >= 0 && lx < width && ly >= 0 && ly < height) {
        const color = LEAF_COLORS[leaf.colorIdx];
        // Gentle color pulsing for a living tree feel
        const pulse = Math.sin(tick * 0.02 + parseInt(dxStr) * 0.3 + parseInt(dyStr) * 0.2) * 15;
        const r = Math.min(255, Math.max(0, color[0] + Math.floor(pulse)));
        const g = Math.min(255, Math.max(0, color[1] + Math.floor(pulse)));
        const b = Math.min(255, Math.max(0, color[2]));

        const ch = leafChars[leaf.charIdx];
        renderer.set(lx, ly, ch, renderer.fgRgb(r, g, b));
      }
    }

    // === Sky background hints ===
    // Light blue autumn sky visible through gaps in canopy
    if (!ascii) {
      for (let y = 0; y < canopyTopY; y++) {
        for (let x = 0; x < width; x++) {
          if (Math.random() < 0.002) {
            // Occasional cloud wisps
            renderer.set(x, y, "·", renderer.fgRgb(180, 200, 220));
          }
        }
      }
    }

    // === Ground: path / grass beneath the tree ===
    for (let x = 0; x < width; x++) {
      const gy = height - 2;
      if (gy > 0) {
        const distFromTree = Math.abs(x - centerX);
        if (distFromTree < canopyRadius * 1.5) {
          // Path area under tree
          if (Math.random() < 0.3) {
            const ch = ascii ? "," : "·";
            renderer.set(x, gy, ch, renderer.fgRgb(140, 120, 80));
          }
        }
      }
    }
  },

  getTitle(): string {
    return " 🌳 Vibe Picnic - 가을 은행나무 ";
  },
};

export default ginkgo;
