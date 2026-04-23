import { Theme, GroundMap } from "./types";
import { Particle } from "../particle";
import renderer from "../renderer";
import { FireworkManager } from "../fireworks";

const fireworkManager = new FireworkManager();

// 반짝이는 별 파티클 클래스
class StarParticle extends Particle {
  constructor(x: number, y: number, ascii: boolean) {
    const bright = Math.random();
    super(x, y, {
      speedY: 0,
      speedX: 0,
      char: ascii
        ? (bright > 0.85 ? "*" : bright > 0.55 ? "+" : ".")
        : (bright > 0.88 ? "✦" : bright > 0.58 ? "·" : "⋅"),
      color: renderer.fgRgb(
        130 + Math.floor(bright * 80),
        140 + Math.floor(bright * 80),
        170 + Math.floor(bright * 70),
      ),
      dim: bright < 0.45,
      bold: bright > 0.82,
    });
  }

  update(tick: number, wind: number): boolean {
    if (Math.random() < 0.07) {
      this.dim = !this.dim;
    }
    if (Math.random() < 0.03) {
      this.bold = !this.bold;
    }
    return true;
  }
}

const fireworksTheme: Theme = {
  name: "fireworks",
  label: "🎆",
  fps: 30,

  createParticle(width: number, startY: number, ascii: boolean): Particle {
    return new StarParticle(
      Math.random() * width,
      Math.random() * Math.max(4, Math.floor((renderer.height || 20) * 0.42)),
      ascii
    );
  },

  spawnRate(density: number): number {
    return Math.random() < density * 0.02 ? 1 : 0;
  },

  groundDisplayH(landings: number): number {
    return 0;
  },

  renderGround(groundMap: GroundMap, height: number, width: number, ascii?: boolean): void {
  },

  renderBackground(tick: number, width: number, height: number, ascii?: boolean): void {
    const skyLimit = Math.floor(height * 0.44);

    for (let x = 0; x < width; x++) {
      for (let y = 1; y < skyLimit; y++) {
        const hash = (x * 53 + y * 97) % 251;
        if (hash === 0 || (hash < 2 && (x + y) % 7 === 0)) {
          const shimmer = Math.sin(tick * 0.04 + x * 0.3 + y * 0.6) * 0.5 + 0.5;
          const ch = ascii ? (shimmer > 0.7 ? "*" : ".") : (shimmer > 0.72 ? "✦" : "·");
          const r = Math.floor(120 + shimmer * 95);
          const g = Math.floor(130 + shimmer * 95);
          const b = Math.floor(165 + shimmer * 85);
          renderer.set(x, y, ch, renderer.fgRgb(r, g, b));
        }
      }
    }
  },

  renderForeground(tick: number, width: number, height: number, ascii?: boolean): void {
    fireworkManager.update(tick, width, height, 0);
    fireworkManager.render(false);
  },

  getTitle(): string {
    return "🎆 Vibe Picnic - Night Fireworks";
  },
};

export default fireworksTheme;
