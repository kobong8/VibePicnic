import { Particle } from "../particle";
import renderer from "../renderer";
import { Theme, GroundMap } from "./types";

const PETALS = ["🌸", "✿", "❀", "✾", "❁", "⚘", "·", ","];
const PETALS_ASCII = ["*", "o", "@", "+", "x", ".", ",", "'"];
const GROUND_CHARS = [".", ",", "~", "_", "'"];

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
  label: "🌸 봄 - 벚꽃",
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

  renderGround(groundMap: GroundMap, height: number, width: number): void {
    const color = renderer.fgRgb(200, 160, 170);
    for (let x = 0; x < width; x++) {
      const h = groundMap[x] || 0;
      if (h > 0) {
        const displayH = Math.min(Math.floor(h / 4), Math.floor(height / 5));
        for (let dy = 0; dy < displayH; dy++) {
          const gy = height - 2 - dy;
          if (gy > 0 && gy < height - 1) {
            const ch = dy === displayH - 1 ? GROUND_CHARS[Math.floor(Math.random() * GROUND_CHARS.length)] : ".";
            renderer.set(x, gy, ch, color);
          }
        }
      }
    }
  },

  getTitle(): string {
    return " 🌸 Vibe Picnic - 봄 ";
  },
};

export default spring;
