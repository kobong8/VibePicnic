import { Particle, ParticleSystem } from "../particle";
import renderer from "../renderer";
import { Theme, GroundMap } from "./types";

const RAIN_CHARS = ["|", "│", "┃", "¦", ":", "!"];
const RAIN_ASCII = ["|", "!", ":", ";", "'", "."];
const SPLASH_CHARS = ["·", ".", "'", "`", ","];

const COLORS = [
  renderer.fgRgb(100, 149, 237),
  renderer.fgRgb(135, 170, 222),
  renderer.fgRgb(70, 130, 210),
  renderer.fgRgb(160, 190, 230),
  renderer.fgRgb(80, 120, 180),
];

const SPLASH_COLOR = renderer.fgRgb(150, 200, 255);

const summer: Theme = {
  name: "summer",
  label: "🌧️ Summer - Rain",
  fps: 30,

  createParticle(width: number, startY: number, ascii: boolean): Particle {
    const chars = ascii ? RAIN_ASCII : RAIN_CHARS;
    const isSplash = startY > 0;
    if (isSplash) {
      return new Particle(Math.random() * width, startY, {
        speedY: -0.1,
        speedX: (Math.random() - 0.5) * 0.8,
        char: SPLASH_CHARS[Math.floor(Math.random() * SPLASH_CHARS.length)],
        color: SPLASH_COLOR,
        amplitude: 0,
        maxAge: 4 + Math.floor(Math.random() * 4),
        dim: true,
      });
    }
    return new Particle(Math.random() * width, startY, {
      speedY: 0.6 + Math.random() * 0.8,
      speedX: 0.1 + Math.random() * 0.15,
      char: chars[Math.floor(Math.random() * chars.length)],
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      amplitude: 0,
      bold: Math.random() < 0.3,
      dim: Math.random() < 0.3,
    });
  },

  spawnRate(density: number): number {
    return Math.random() < density * 0.06 ? Math.ceil(Math.random() * 3) : 0;
  },

  groundDisplayH(landings: number): number {
    return landings > 2 ? 1 : 0;
  },

  renderGround(groundMap: GroundMap, height: number, width: number): void {
    const color = renderer.fgRgb(60, 100, 160);
    const gy = height - 2;
    if (gy <= 0) return;
    for (let x = 0; x < width; x++) {
      const h = groundMap[x] || 0;
      if (h > 2) {
        const ch = Math.random() < 0.5 ? "~" : "≈";
        renderer.set(x, gy, ch, color);
      }
    }
  },

  onLanded(landed: Particle[], system: ParticleSystem, height: number): void {
    for (const p of landed) {
      if (Math.random() < 0.3) {
        const splash = this.createParticle(0, height - 2, false);
        splash.x = p.x + (Math.random() - 0.5) * 2;
        system.add(splash);
      }
    }
  },

  getTitle(): string {
    return " 🌧️ Vibe Picnic - Summer ";
  },
};

export default summer;
