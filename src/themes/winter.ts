import { Particle } from "../particle";
import renderer from "../renderer";
import { Theme, GroundMap } from "./types";

const SNOW = ["❄", "❅", "❆", "✦", "✧", "·", ".", "*"];
const SNOW_ASCII = ["*", "+", ".", "o", "'", "`", ",", "~"];

const COLORS = [
  renderer.fgRgb(255, 255, 255),
  renderer.fgRgb(220, 230, 255),
  renderer.fgRgb(200, 215, 240),
  renderer.fgRgb(240, 248, 255),
  renderer.fgRgb(176, 196, 222),
  renderer.fgRgb(230, 230, 250),
];

const winter: Theme = {
  name: "winter",
  label: "❄️ 겨울 - 눈",
  fps: 18,

  createParticle(width: number, startY: number, ascii: boolean): Particle {
    const chars = ascii ? SNOW_ASCII : SNOW;
    const idx = Math.floor(Math.random() * chars.length);
    return new Particle(Math.random() * width, startY, {
      speedY: 0.08 + Math.random() * 0.25,
      speedX: Math.random() * 0.2 - 0.1,
      char: chars[idx],
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      amplitude: 0.3 + Math.random() * 1.5,
      bold: idx < 3,
      dim: idx >= 6,
    });
  },

  spawnRate(density: number): number {
    return Math.random() < density * 0.035 ? Math.ceil(Math.random() * 2) : 0;
  },

  renderGround(groundMap: GroundMap, height: number, width: number): void {
    const color = renderer.fgRgb(200, 215, 240);
    const brightColor = renderer.fgRgb(255, 255, 255);
    const midColor = renderer.fgRgb(230, 240, 255);
    for (let x = 0; x < width; x++) {
      const h = groundMap[x] || 0;
      if (h > 0) {
        const displayH = Math.min(Math.floor(h / 2), Math.floor(height / 4));
        for (let dy = 0; dy < displayH; dy++) {
          const gy = height - 2 - dy;
          if (gy > 0 && gy < height - 1) {
            const isTop = dy === displayH - 1;
            const ch = isTop ? "~" : (dy < 2 ? ":" : ".");
            const c = isTop ? brightColor : (dy === 0 ? midColor : color);
            renderer.set(x, gy, ch, c);
          }
        }
      }
    }
  },

  getTitle(): string {
    return " ❄️ Vibe Picnic - 겨울 ";
  },
};

export default winter;
