import { Particle } from "../particle";
import renderer from "../renderer";
import { Theme, GroundMap } from "./types";

const LEAVES = ["🍂", "🍁", "🍃", "🌿", "✦", "❧", "♣", "⍟"];
const LEAVES_ASCII = ["&", "%", "@", "#", "W", "M", "V", "Y"];
const GROUND_CHARS = ["_", "~", ",", ".", "="];

const COLORS = [
  renderer.fgRgb(210, 105, 30),
  renderer.fgRgb(255, 140, 0),
  renderer.fgRgb(178, 34, 34),
  renderer.fgRgb(218, 165, 32),
  renderer.fgRgb(160, 82, 45),
  renderer.fgRgb(205, 133, 63),
  renderer.fgRgb(255, 69, 0),
  renderer.fgRgb(139, 90, 43),
];

const autumn: Theme = {
  name: "autumn",
  label: "🍂 가을 - 낙엽",
  fps: 20,

  createParticle(width: number, startY: number, ascii: boolean): Particle {
    const chars = ascii ? LEAVES_ASCII : LEAVES;
    const idx = Math.floor(Math.random() * chars.length);
    return new Particle(Math.random() * width, startY, {
      speedY: 0.1 + Math.random() * 0.3,
      speedX: Math.random() * 0.4 - 0.1,
      char: chars[idx],
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      amplitude: 1.0 + Math.random() * 3.0,
      bold: idx < 3,
      dim: false,
    });
  },

  spawnRate(density: number): number {
    return Math.random() < density * 0.03 ? Math.ceil(Math.random() * 2) : 0;
  },

  renderGround(groundMap: GroundMap, height: number, width: number): void {
    const colors = [
      renderer.fgRgb(160, 82, 45),
      renderer.fgRgb(139, 90, 43),
      renderer.fgRgb(210, 105, 30),
    ];
    for (let x = 0; x < width; x++) {
      const h = groundMap[x] || 0;
      if (h > 0) {
        const displayH = Math.min(Math.floor(h / 3), Math.floor(height / 5));
        for (let dy = 0; dy < displayH; dy++) {
          const gy = height - 2 - dy;
          if (gy > 0 && gy < height - 1) {
            const ch = GROUND_CHARS[Math.floor(Math.random() * GROUND_CHARS.length)];
            const color = colors[Math.floor(Math.random() * colors.length)];
            renderer.set(x, gy, ch, color);
          }
        }
      }
    }
  },

  getTitle(): string {
    return " 🍂 Vibe Picnic - 가을 ";
  },
};

export default autumn;
