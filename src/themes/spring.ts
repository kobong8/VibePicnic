import { Particle } from "../particle";
import renderer from "../renderer";
import { Theme, GroundMap } from "./types";

const PETALS = ["🌸", "✿", "❀", "✾", "❁", "⚘", "·", ","];
const PETALS_ASCII = ["*", "o", "@", "+", "x", ".", ",", "'"];
const GROUND_PETALS = ["✿", "❀", "✾", "❁", "·", ","];
const GROUND_PETALS_ASCII = ["o", "@", "+", "x", ".", ","];

const COLORS = [
  renderer.fgRgb(255, 183, 197),
  renderer.fgRgb(255, 150, 170),
  renderer.fgRgb(255, 200, 210),
  renderer.fgRgb(255, 220, 230),
  renderer.fgRgb(240, 128, 160),
  renderer.fgRgb(255, 240, 245),
];

const spring: Theme = {
  name: "spring",
  label: "🌸 Spring - Cherry Blossom",
  fps: 25,

  createParticle(width: number, startY: number, ascii: boolean): Particle {
    const chars = ascii ? PETALS_ASCII : PETALS;
    const idx = Math.floor(Math.random() * chars.length);
    return new Particle(Math.random() * width, startY, {
      speedY: 0.06 + Math.random() * 0.12,
      speedX: Math.random() * 0.3 - 0.1,
      char: chars[idx],
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      amplitude: 0.5 + Math.random() * 2.0,
      bold: idx < 3,
      dim: idx >= 6,
    });
  },

  spawnRate(density: number): number {
    return Math.random() < density * 0.04 ? Math.ceil(Math.random() * 2) : 0;
  },

  groundDisplayH(landings: number): number {
    return landings > 0 ? 1 : 0;
  },

  renderGround(groundMap: GroundMap, height: number, width: number, ascii?: boolean): void {
    const palette = ascii ? GROUND_PETALS_ASCII : GROUND_PETALS;
    const topColor = renderer.fgRgb(255, 210, 220);
    const midColor = renderer.fgRgb(220, 170, 185);
    const baseColor = renderer.fgRgb(185, 140, 155);
    for (let x = 0; x < width; x++) {
      const h = groundMap[x] || 0;
      if (h > 0) {
        const gy = height - 2;
        if (gy > 0 && gy < height - 1) {
          const ch = palette[(x * 7) % palette.length];
          renderer.set(x, gy, ch, topColor);
        }
      }
    }
  },

  getTitle(): string {
    return " 🌸 Vibe Picnic - Spring ";
  },
};

export default spring;
