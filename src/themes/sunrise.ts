import { Particle } from "../particle";
import renderer from "../renderer";
import { Theme, GroundMap } from "./types";

// 새해 동해 일출 테마
// New Year sunrise at Korea's East Sea (Donghae)

const SPARKLE_CHARS = ["✦", "✧", "·", "˚", "*", ".", "∗", "⋆"];
const SPARKLE_ASCII = ["*", ".", "+", "'", "o", "~", "^", "."];
const SEAGULL_CHARS = ["~", "ˆ", "·"];

// Sun colors (from deep red to bright gold as it rises)
function sunColor(progress: number): [number, number, number] {
  const r = 255;
  const g = Math.floor(60 + progress * 160);
  const b = Math.floor(0 + progress * 60);
  return [r, g, b];
}

// Sky gradient colors based on sun progress
function skyColor(progress: number, yRatio: number): [number, number, number] {
  if (progress < 0.1) {
    // Pre-dawn: dark blue to dark purple
    const r = Math.floor(10 + yRatio * 30);
    const g = Math.floor(5 + yRatio * 15);
    const b = Math.floor(30 + yRatio * 40);
    return [r, g, b];
  }
  // Dawn: gradient from deep blue (top) to warm orange/pink (horizon)
  const topR = Math.floor(20 + progress * 40);
  const topG = Math.floor(10 + progress * 30);
  const topB = Math.floor(60 + progress * 40);

  const botR = Math.floor(180 + progress * 75);
  const botG = Math.floor(80 + progress * 100);
  const botB = Math.floor(40 + progress * 60);

  return [
    Math.min(255, Math.floor(topR + (botR - topR) * yRatio)),
    Math.min(255, Math.floor(topG + (botG - topG) * yRatio)),
    Math.min(255, Math.floor(topB + (botB - topB) * yRatio)),
  ];
}

function waterColor(progress: number, distFromCenter: number, _tick: number, y: number): [number, number, number] {
  const glow = Math.max(0, 1 - distFromCenter * 0.04) * progress;

  // Base ocean: deep vivid blue
  const baseR = 5 + Math.floor(glow * 180);
  const baseG = 30 + Math.floor(glow * 60 + Math.sin(y * 0.3) * 10);
  const baseB = 90 + Math.floor(glow * 30 + Math.sin(y * 0.3) * 15);

  return [
    Math.min(255, baseR),
    Math.min(255, baseG),
    Math.min(255, baseB),
  ];
}

const sunrise: Theme = {
  name: "sunrise",
  label: "🌅 새해 일출 - 동해",
  fps: 20,

  createParticle(width: number, startY: number, ascii: boolean): Particle {
    const rand = Math.random();

    if (rand < 0.15) {
      // Seagull
      return new Particle(Math.random() * width, Math.random() * (startY < 0 ? 5 : startY * 0.4), {
        speedY: -0.01 + Math.random() * 0.02,
        speedX: 0.15 + Math.random() * 0.3,
        char: ascii ? "~" : SEAGULL_CHARS[Math.floor(Math.random() * SEAGULL_CHARS.length)],
        color: renderer.fgRgb(80, 80, 100),
        amplitude: 0.3 + Math.random() * 0.5,
        maxAge: 300 + Math.floor(Math.random() * 200),
        bold: false,
        dim: true,
      });
    }

    // Water sparkle particle
    const chars = ascii ? SPARKLE_ASCII : SPARKLE_CHARS;
    const brightness = Math.random();
    const r = Math.floor(200 + brightness * 55);
    const g = Math.floor(150 + brightness * 80);
    const b = Math.floor(50 + brightness * 80);

    return new Particle(Math.random() * width, startY < 0 ? startY : startY * 0.5 + Math.random() * startY * 0.5, {
      speedY: 0.01 + Math.random() * 0.03,
      speedX: Math.random() * 0.1 - 0.05,
      char: chars[Math.floor(Math.random() * chars.length)],
      color: renderer.fgRgb(r, g, b),
      amplitude: 0.2 + Math.random() * 0.5,
      maxAge: 60 + Math.floor(Math.random() * 120),
      bold: brightness > 0.7,
      dim: brightness < 0.3,
    });
  },

  spawnRate(density: number): number {
    return Math.random() < density * 0.02 ? 1 : 0;
  },

  groundDisplayH(_landings: number): number {
    return 0;
  },

  renderGround(_groundMap: GroundMap, _height: number, _width: number, _ascii?: boolean): void {
    // Ground rendering is handled by renderBackground
  },

  renderBackground(tick: number, width: number, height: number, ascii?: boolean): void {
    const horizonY = Math.floor(height * 0.45);
    const maxSunRise = Math.floor(height * 0.25);

    // Sun rises over ~600 ticks (~30 seconds at 20fps), then stays
    const sunProgress = Math.min(1, tick / 600);
    const sunCenterX = Math.floor(width * 0.5);
    const sunY = horizonY - Math.floor(sunProgress * maxSunRise);
    const sunRadius = Math.max(3, Math.floor(Math.min(width, height) * 0.08));

    // Terminal characters are roughly 2x taller than wide, so we need
    // an aspect ratio correction to make the sun appear circular.
    const aspectRatio = 2.0;

    // === Draw sky ===
    for (let y = 0; y < horizonY; y++) {
      const yRatio = y / horizonY;
      for (let x = 0; x < width; x++) {
        const dx = x - sunCenterX;
        const dy = (y - sunY) * aspectRatio;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < sunRadius) {
          // Sun body - concentric rings for round shape
          const [sr, sg, sb] = sunColor(sunProgress);
          const normDist = dist / sunRadius;

          let ch: string;
          let cr: number, cg: number, cb: number;

          if (normDist < 0.35) {
            // Inner core: brightest
            ch = ascii ? "@" : "█";
            cr = Math.min(255, sr + 30);
            cg = Math.min(255, sg + 40);
            cb = Math.min(255, sb + 30);
          } else if (normDist < 0.6) {
            // Middle ring
            ch = ascii ? "#" : "▓";
            cr = sr;
            cg = sg;
            cb = sb;
          } else if (normDist < 0.8) {
            // Outer ring
            ch = ascii ? "=" : "▒";
            cr = Math.max(0, sr - 20);
            cg = Math.max(0, sg - 10);
            cb = sb;
          } else {
            // Edge - softest
            ch = ascii ? "-" : "░";
            cr = Math.max(0, sr - 40);
            cg = Math.max(0, sg - 20);
            cb = sb;
          }

          renderer.set(x, y, ch, renderer.fgRgb(cr, cg, cb));
        } else if (dist < sunRadius * 2.5 && sunProgress > 0.05) {
          // Sun glow / light rays
          const glowIntensity = Math.max(0, 1 - (dist - sunRadius) / (sunRadius * 1.5));
          const rayAngle = Math.atan2(y - sunY, x - sunCenterX);
          const rayPulse = Math.sin(rayAngle * 8 + tick * 0.02) * 0.3 + 0.7;
          const intensity = glowIntensity * rayPulse * sunProgress;

          const [skR, skG, skB] = skyColor(sunProgress, yRatio);
          const [snR, snG, snB] = sunColor(sunProgress);
          const r = Math.min(255, Math.floor(skR + (snR - skR) * intensity * 0.6));
          const g = Math.min(255, Math.floor(skG + (snG - skG) * intensity * 0.5));
          const b = Math.min(255, Math.floor(skB + (snB - skB) * intensity * 0.3));

          const ch = intensity > 0.5 ? (ascii ? "." : "·") : " ";
          if (ch !== " ") {
            renderer.set(x, y, ch, renderer.fgRgb(r, g, b));
          }
        }
      }
    }

    // === Horizon line ===
    for (let x = 0; x < width; x++) {
      const distFromSun = Math.abs(x - sunCenterX);
      const glow = Math.max(0, 1 - distFromSun / (width * 0.4)) * sunProgress;
      const r = Math.min(255, Math.floor(80 + glow * 175));
      const g = Math.min(255, Math.floor(40 + glow * 120));
      const b = Math.min(255, Math.floor(30 + glow * 60));
      const ch = ascii ? "-" : "─";
      renderer.set(x, horizonY, ch, renderer.fgRgb(r, g, b));
    }

    // === Draw ocean ===
    const WAVE_CHARS = ["~", "≈", "∽", "∼", "〜"];
    const WAVE_ASCII = ["~", "~", "-", "~", "-"];

    for (let y = horizonY + 1; y < height - 1; y++) {
      const oceanDepth = (y - horizonY) / (height - 1 - horizonY);
      for (let x = 0; x < width; x++) {
        const distFromCenter = Math.abs(x - sunCenterX);
        const [wr, wg, wb] = waterColor(sunProgress, distFromCenter, tick, y);

        // Reflection path: vertical strip below sun
        const reflectionWidth = sunRadius * (1 + oceanDepth * 3);
        const inReflection = distFromCenter < reflectionWidth;

        if (inReflection && sunProgress > 0.05) {
          const reflectIntensity = (1 - distFromCenter / reflectionWidth) * sunProgress;
          const shimmer = Math.sin(tick * 0.05 + y * 0.8 + x * 0.3) * 0.3 + 0.7;
          const ri = reflectIntensity * shimmer;

          const rr = Math.min(255, Math.floor(wr + ri * 200));
          const rg = Math.min(255, Math.floor(wg + ri * 100));
          const rb = Math.min(255, Math.floor(wb + ri * 30));

          const waveOffset = Math.sin(tick * 0.04 + x * 0.15) * 0.5;
          if (ri > 0.4 + waveOffset * 0.2) {
            const chars = ascii ? WAVE_ASCII : WAVE_CHARS;
            const ch = ri > 0.7 ? (ascii ? "*" : "✦") : chars[Math.floor((x + tick) * 0.3) % chars.length];
            renderer.set(x, y, ch, renderer.fgRgb(rr, rg, rb));
          } else {
            const chars = ascii ? WAVE_ASCII : WAVE_CHARS;
            renderer.set(x, y, chars[(x + y + Math.floor(tick * 0.3)) % chars.length],
              renderer.fgRgb(wr, wg, wb));
          }
        } else {
          // Regular ocean - bluer tones
          const wave = Math.sin(tick * 0.03 + x * 0.12 + y * 0.2);
          // Deeper blue base for non-reflection areas
          const deepR = Math.max(0, wr - 5);
          const deepG = Math.min(255, wg + 10);
          const deepB = Math.min(255, wb + 30);

          if (wave > 0.6) {
            const chars = ascii ? WAVE_ASCII : WAVE_CHARS;
            renderer.set(x, y, chars[(x + y) % chars.length],
              renderer.fgRgb(deepR, deepG, deepB));
          } else if (wave > 0.1) {
            renderer.set(x, y, ascii ? "~" : "∽",
              renderer.fgRgb(
                Math.max(0, deepR - 5),
                Math.max(0, deepG - 5),
                Math.min(255, deepB + 10),
              ));
          } else {
            // Fill even calm areas with dim wave chars for a fuller ocean
            renderer.set(x, y, ascii ? "-" : "~",
              renderer.fgRgb(
                Math.max(0, deepR - 10),
                Math.max(0, deepG - 10),
                Math.min(255, deepB + 5),
              ));
          }
        }
      }
    }

    // === Rocky shore silhouette at bottom ===
    for (let x = 0; x < width; x++) {
      const rockHeight = Math.floor(
        1 + Math.abs(Math.sin(x * 0.15) * 2 + Math.sin(x * 0.07) * 1.5)
      );
      for (let dy = 0; dy < rockHeight && dy < 3; dy++) {
        const ry = height - 2 - dy;
        if (ry > horizonY) {
          const ch = ascii ? "#" : (dy === rockHeight - 1 ? "▄" : "█");
          renderer.set(x, ry, ch, renderer.fgRgb(20, 15, 10));
        }
      }
    }
  },

  getTitle(): string {
    return " 🌅 Vibe Picnic - 새해 동해 일출 ";
  },
};

export default sunrise;
