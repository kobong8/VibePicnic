import { Particle } from "../particle";
import renderer from "../renderer";
import { Theme, GroundMap } from "./types";

// 별이 빛나는 밤 테마 (Starry Night)
// No moon, twinkling stars, and occasional shooting stars (meteors)

const STAR_CHARS = ["✦", "✧", "⋆", "✶", "*", "·", "˚", "∗"];
const STAR_ASCII = ["*", "+", ".", "'", "o", "~", "^", "."];

function starHash(x: number, y: number): number {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return (h ^ (h >> 16)) >>> 0;
}

const starrynight: Theme = {
  name: "starrynight",
  label: "✨ 별이 빛나는 밤",
  fps: 20,

  createParticle(width: number, _startY: number, ascii: boolean): Particle {
    // shooting stars (meteors)
    const isMeteor = Math.random() > 0.3;
    
    if (isMeteor) {
      // Meteors move fast and diagonally
      const speedX = (Math.random() > 0.5 ? 1 : -1) * (1.2 + Math.random() * 2.0);
      return new Particle(Math.random() * width, Math.random() * 10, {
        speedY: 0.8 + Math.random() * 1.2,
        speedX: speedX,
        char: ascii ? "\\" : "☄",
        color: renderer.fgRgb(255, 255, 200),
        amplitude: 0,
        maxAge: 15 + Math.floor(Math.random() * 15),
        bold: true,
      });
    } else {
      // Rare "stardust" falling slowly
      return new Particle(Math.random() * width, -2, {
        speedY: 0.1 + Math.random() * 0.2,
        speedX: Math.random() * 0.1 - 0.05,
        char: ascii ? "." : "·",
        color: renderer.fgRgb(200, 200, 255),
        amplitude: 0.2,
        maxAge: 200,
        dim: true,
      });
    }
  },

  spawnRate(density: number): number {
    // Meteors should be rare
    return Math.random() < density * 0.005 ? 1 : 0;
  },

  groundDisplayH(_landings: number): number {
    return 0;
  },

  renderGround(_groundMap: GroundMap, _height: number, _width: number, _ascii?: boolean): void {
    // Dark horizon or nothing
  },

  renderBackground(tick: number, width: number, height: number, ascii?: boolean): void {
    const horizonY = Math.floor(height * 0.8);

    // === Twinkling starfield ===
    for (let y = 0; y < horizonY; y++) {
      for (let x = 0; x < width; x++) {
        const hash = starHash(x, y);
        // Density of stars in the sky
        if ((hash % 150) < 4) {
          const phase = (hash % 1000) / 1000 * Math.PI * 2;
          const twinkle = Math.sin(tick * 0.1 + phase);
          const brightness = twinkle * 0.5 + 0.5;

          if (brightness > 0.2) {
            const starType = hash % STAR_CHARS.length;
            const ch = ascii ? STAR_ASCII[starType] : STAR_CHARS[starType];

            // Subtle color variations (cool whites, blues, slight yellows)
            const colorType = (hash >> 8) % 4;
            let r: number, g: number, b: number;
            if (colorType === 0) { // Blueish
              r = Math.floor(180 + brightness * 50);
              g = Math.floor(190 + brightness * 60);
              b = Math.floor(230 + brightness * 25);
            } else if (colorType === 1) { // Yellowish
              r = Math.floor(230 + brightness * 25);
              g = Math.floor(220 + brightness * 35);
              b = Math.floor(180 + brightness * 40);
            } else { // Neutral White
              r = Math.floor(210 + brightness * 45);
              g = Math.floor(210 + brightness * 45);
              b = Math.floor(215 + brightness * 40);
            }

            const isBold = brightness > 0.8;
            let color = renderer.fgRgb(r, g, b);
            if (isBold) color = renderer.bold() + color;
            renderer.set(x, y, ch, color);
          }
        }
      }
    }

    // === Simple Silhouette Ground (Distant Mountains) ===
    for (let x = 0; x < width; x++) {
      const mountainHeight = Math.floor(
        Math.sin(x * 0.05) * 3 + 
        Math.sin(x * 0.12) * 1.5 + 
        Math.sin(x * 0.02) * 5
      );
      const groundY = horizonY - mountainHeight;
      
      for (let y = groundY; y < height; y++) {
        if (y >= 0 && y < height) {
          // Dark silhouette
          renderer.set(x, y, ascii ? "#" : "█", renderer.fgRgb(10, 10, 20));
        }
      }
    }
  },

  getTitle(): string {
    return " ✨ Vibe Picnic - 별이 빛나는 밤 ";
  },
};

export default starrynight;
