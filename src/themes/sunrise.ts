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
  // progress: 0 = just appearing, 1 = fully risen
  const r = Math.floor(255);
  const g = Math.floor(60 + progress * 160);
  const b = Math.floor(0 + progress * 60);
  return [r, g, b];
}

// Sky gradient colors based on sun progress
function skyColor(progress: number, yRatio: number): [number, number, number] {
  // yRatio: 0 = top, 1 = horizon
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

function waterColor(progress: number, distFromCenter: number, tick: number, y: number): [number, number, number] {
  const wave = Math.sin(tick * 0.03 + y * 0.5) * 0.3;
  const glow = Math.max(0, 1 - distFromCenter * 0.04) * progress;

  // Base ocean: deep dark blue
  const baseR = 5 + Math.floor(glow * 200);
  const baseG = 15 + Math.floor(glow * 100 + wave * 15);
  const baseB = 40 + Math.floor(glow * 60 + wave * 10);

  return [
    Math.min(255, baseR),
    Math.min(255, baseG),
    Math.min(255, baseB),
  ];
}

let internalTick = 0;

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
    return 0; // No ground accumulation for sunrise
  },

  renderGround(_groundMap: GroundMap, _height: number, _width: number, _ascii?: boolean): void {
    // Ground rendering is handled by renderBackground
  },

  renderBackground(tick: number, width: number, height: number, ascii?: boolean): void {
    internalTick = tick;
    const horizonY = Math.floor(height * 0.45);
    const maxSunRise = Math.floor(height * 0.25);

    // Sun rises over ~600 ticks (about 30 seconds at 20fps), then stays
    const sunProgress = Math.min(1, tick / 600);
    const sunCenterX = Math.floor(width * 0.5);
    const sunY = horizonY - Math.floor(sunProgress * maxSunRise);
    const sunRadius = Math.max(3, Math.floor(Math.min(width, height) * 0.08));

    // === Draw sky ===
    for (let y = 0; y < horizonY; y++) {
      const yRatio = y / horizonY;
      for (let x = 0; x < width; x++) {
        // Check if inside sun
        const dx = x - sunCenterX;
        const dy = (y - sunY) * 2; // Stretch vertically for terminal aspect ratio
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < sunRadius) {
          // Sun body
          const [sr, sg, sb] = sunColor(sunProgress);
          const edgeFade = dist / sunRadius;
          const cr = Math.min(255, Math.floor(sr + (1 - edgeFade) * 30));
          const cg = Math.min(255, Math.floor(sg + (1 - edgeFade) * 40));
          const cb = Math.min(255, Math.floor(sb + (1 - edgeFade) * 20));
          const ch = ascii ? "O" : (dist < sunRadius * 0.5 ? "█" : (dist < sunRadius * 0.8 ? "▓" : "▒"));
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
          const rg = Math.min(255, Math.floor(wg + ri * 120));
          const rb = Math.min(255, Math.floor(wb + ri * 40));

          const waveOffset = Math.sin(tick * 0.04 + x * 0.15) * 0.5;
          if (ri > 0.4 + waveOffset * 0.2) {
            const chars = ascii ? WAVE_ASCII : WAVE_CHARS;
            const ch = ri > 0.7 ? (ascii ? "*" : "✦") : chars[Math.floor((x + tick) * 0.3) % chars.length];
            renderer.set(x, y, ch, renderer.fgRgb(rr, rg, rb));
          } else {
            const chars = ascii ? WAVE_ASCII : WAVE_CHARS;
            renderer.set(x, y, chars[(x + y + Math.floor(tick * 0.3)) % chars.length], renderer.fgRgb(wr, wg, wb));
          }
        } else {
          // Regular ocean
          const wave = Math.sin(tick * 0.03 + x * 0.12 + y * 0.2);
          if (wave > 0.6) {
            const chars = ascii ? WAVE_ASCII : WAVE_CHARS;
            renderer.set(x, y, chars[(x + y) % chars.length], renderer.fgRgb(wr, wg, wb));
          } else if (wave > 0.1) {
            renderer.set(x, y, ascii ? "~" : "∽", renderer.fgRgb(
              Math.max(0, wr - 10),
              Math.max(0, wg - 5),
              Math.max(0, wb - 5),
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

    // === New Year greeting (fades in with the sun) ===
    if (sunProgress > 0.3) {
      const alpha = Math.min(1, (sunProgress - 0.3) / 0.3);
      const greeting = "🌅 새해 복 많이 받으세요!";
      const greetingAscii = "** Happy New Year! **";
      const text = ascii ? greetingAscii : greeting;
      const textY = Math.floor(height * 0.15);
      const textX = Math.max(0, Math.floor((width - text.length) / 2));
      const r = Math.min(255, Math.floor(200 + alpha * 55));
      const g = Math.min(255, Math.floor(180 + alpha * 55));
      const b = Math.min(255, Math.floor(100 + alpha * 55));

      // Only show if sun has risen enough
      const blink = tick % 60 < 50; // Subtle blink
      if (blink) {
        for (let i = 0; i < text.length && textX + i < width; i++) {
          renderer.set(textX + i, textY, text[i], renderer.fgRgb(r, g, b));
        }
      }
    }
  },

  getTitle(): string {
    return " 🌅 Vibe Picnic - 새해 동해 일출 ";
  },
};

export default sunrise;
