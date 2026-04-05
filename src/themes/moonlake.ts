import { Particle } from "../particle";
import renderer from "../renderer";
import { Theme, GroundMap } from "./types";

// 호숫가 달빛 테마
// Moonlit lake - moon reflecting on a calm lake with twinkling stars

const STAR_CHARS = ["✦", "✧", "⋆", "✶", "*", "·", "˚", "∗"];
const STAR_ASCII = ["*", "+", ".", "'", "o", "~", "^", "."];

// Precomputed star field (seeded by position for consistency across frames)
function starHash(x: number, y: number): number {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return (h ^ (h >> 16)) >>> 0;
}

function lakeColor(distFromCenter: number, _tick: number, y: number): [number, number, number] {
  // Base lake: deep dark blue-indigo
  const baseR = 5 + Math.floor(Math.sin(y * 0.2) * 3);
  const baseG = 12 + Math.floor(Math.sin(y * 0.3) * 5);
  const baseB = 35 + Math.floor(Math.sin(y * 0.15) * 8);

  return [
    Math.min(255, Math.max(0, baseR)),
    Math.min(255, Math.max(0, baseG)),
    Math.min(255, Math.max(0, baseB)),
  ];
}

const moonlake: Theme = {
  name: "moonlake",
  label: "🌕 호숫가 달빛",
  fps: 18,

  createParticle(width: number, startY: number, ascii: boolean): Particle {
    // Firefly / glowing particle near the lake surface
    const chars = ascii ? STAR_ASCII : STAR_CHARS;
    const brightness = Math.random();

    // Pale moonlit sparkle colors
    const palette: [number, number, number][] = [
      [200, 210, 240],  // cool white
      [180, 190, 220],  // pale blue
      [220, 220, 200],  // warm white
      [160, 180, 210],  // steel blue
      [210, 200, 180],  // pale gold
    ];
    const c = palette[Math.floor(Math.random() * palette.length)];

    return new Particle(Math.random() * width, startY < 0 ? startY : startY * 0.5 + Math.random() * startY * 0.5, {
      speedY: 0.005 + Math.random() * 0.02,
      speedX: Math.random() * 0.06 - 0.03,
      char: chars[Math.floor(Math.random() * chars.length)],
      color: renderer.fgRgb(c[0], c[1], c[2]),
      amplitude: 0.1 + Math.random() * 0.3,
      maxAge: 80 + Math.floor(Math.random() * 160),
      bold: brightness > 0.8,
      dim: brightness < 0.4,
    });
  },

  spawnRate(density: number): number {
    return Math.random() < density * 0.012 ? 1 : 0;
  },

  groundDisplayH(_landings: number): number {
    return 0;
  },

  renderGround(_groundMap: GroundMap, _height: number, _width: number, _ascii?: boolean): void {
    // Handled by renderBackground
  },

  renderBackground(tick: number, width: number, height: number, ascii?: boolean): void {
    const horizonY = Math.floor(height * 0.45);

    const moonCenterX = Math.floor(width * 0.5);
    const moonY = Math.floor(height * 0.18);
    // Large moon: ~12% of the smaller screen dimension
    const moonRadius = Math.max(5, Math.floor(Math.min(width, height) * 0.12));

    const aspectRatio = 2.0;

    // === Draw night sky ===
    for (let y = 0; y < horizonY; y++) {
      const yRatio = y / horizonY;
      for (let x = 0; x < width; x++) {
        const dx = x - moonCenterX;
        const dy = (y - moonY) * aspectRatio;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < moonRadius) {
          // === Moon body - large circular moon ===
          const normDist = dist / moonRadius;

          let ch: string;
          let cr: number, cg: number, cb: number;

          // Moon surface: pale silver-white with subtle craters
          const craterNoise = Math.sin(x * 1.7 + y * 2.3) * 0.15 +
                              Math.sin(x * 0.8 - y * 1.1) * 0.1;

          if (normDist < 0.3) {
            // Inner core: brightest silver
            ch = ascii ? "@" : "█";
            cr = 240 + Math.floor(craterNoise * 15);
            cg = 238 + Math.floor(craterNoise * 12);
            cb = 225 + Math.floor(craterNoise * 15);
          } else if (normDist < 0.55) {
            ch = ascii ? "#" : "▓";
            cr = 220 + Math.floor(craterNoise * 20);
            cg = 218 + Math.floor(craterNoise * 15);
            cb = 205 + Math.floor(craterNoise * 20);
          } else if (normDist < 0.75) {
            ch = ascii ? "=" : "▒";
            cr = 195 + Math.floor(craterNoise * 25);
            cg = 193 + Math.floor(craterNoise * 20);
            cb = 180 + Math.floor(craterNoise * 25);
          } else if (normDist < 0.9) {
            ch = ascii ? "-" : "░";
            cr = 165 + Math.floor(craterNoise * 25);
            cg = 163 + Math.floor(craterNoise * 20);
            cb = 155 + Math.floor(craterNoise * 20);
          } else {
            // Very edge - thin soft border
            ch = ascii ? "." : "░";
            cr = 130;
            cg = 128;
            cb = 125;
          }

          cr = Math.min(255, Math.max(0, cr));
          cg = Math.min(255, Math.max(0, cg));
          cb = Math.min(255, Math.max(0, cb));
          renderer.set(x, y, ch, renderer.fgRgb(cr, cg, cb));

        } else if (dist < moonRadius * 1.8) {
          // Moon glow - soft halo
          const glowIntensity = Math.max(0, 1 - (dist - moonRadius) / (moonRadius * 0.8));
          const gi = glowIntensity * 0.5;

          if (gi > 0.15) {
            const r = Math.min(255, Math.floor(20 + gi * 120));
            const g = Math.min(255, Math.floor(20 + gi * 115));
            const b = Math.min(255, Math.floor(40 + gi * 100));
            const ch = gi > 0.3 ? (ascii ? "." : "·") : " ";
            if (ch !== " ") {
              renderer.set(x, y, ch, renderer.fgRgb(r, g, b));
            }
          }
        }
      }
    }

    // === Twinkling stars ===
    for (let y = 0; y < horizonY; y++) {
      for (let x = 0; x < width; x++) {
        // Skip if already drawn (moon area)
        const dx = x - moonCenterX;
        const dy = (y - moonY) * aspectRatio;
        const distToMoon = Math.sqrt(dx * dx + dy * dy);
        if (distToMoon < moonRadius * 1.8) continue;

        const hash = starHash(x, y);
        // ~2% of sky cells are stars
        if ((hash % 100) < 2) {
          // Twinkle: use hash + tick to create per-star phase
          const phase = (hash % 1000) / 1000 * Math.PI * 2;
          const twinkle = Math.sin(tick * 0.06 + phase);
          // Star is visible when twinkle > threshold (creates on/off blinking)
          const brightness = twinkle * 0.5 + 0.5; // 0~1

          if (brightness > 0.2) {
            const starType = hash % STAR_CHARS.length;
            const ch = ascii ? STAR_ASCII[starType] : STAR_CHARS[starType];

            // Star color variations
            const colorType = (hash >> 8) % 5;
            let r: number, g: number, b: number;
            if (colorType === 0) {
              // Cool white
              r = Math.floor(180 + brightness * 75);
              g = Math.floor(185 + brightness * 70);
              b = Math.floor(200 + brightness * 55);
            } else if (colorType === 1) {
              // Warm yellow
              r = Math.floor(200 + brightness * 55);
              g = Math.floor(190 + brightness * 55);
              b = Math.floor(140 + brightness * 50);
            } else if (colorType === 2) {
              // Pale blue
              r = Math.floor(150 + brightness * 60);
              g = Math.floor(170 + brightness * 60);
              b = Math.floor(210 + brightness * 45);
            } else {
              // Standard white
              r = Math.floor(170 + brightness * 85);
              g = Math.floor(170 + brightness * 85);
              b = Math.floor(175 + brightness * 80);
            }

            const isBold = brightness > 0.8;
            const isDim = brightness < 0.4;
            let color = renderer.fgRgb(r, g, b);
            if (isBold) color = renderer.bold() + color;
            if (isDim) color = renderer.dim() + color;
            renderer.set(x, y, ch, color);
          }
        }
      }
    }

    // === Horizon line (shoreline) ===
    for (let x = 0; x < width; x++) {
      const distFromMoon = Math.abs(x - moonCenterX);
      const glow = Math.max(0, 1 - distFromMoon / (width * 0.35));
      const r = Math.min(255, Math.floor(15 + glow * 60));
      const g = Math.min(255, Math.floor(20 + glow * 55));
      const b = Math.min(255, Math.floor(30 + glow * 50));
      // Organic shoreline with subtle variation
      const shoreCh = ascii ? "-" : ((x + Math.floor(Math.sin(x * 0.3) * 2)) % 3 === 0 ? "━" : "─");
      renderer.set(x, horizonY, shoreCh, renderer.fgRgb(r, g, b));
    }

    // === Draw lake ===
    const WAVE_CHARS = ["~", "≈", "∽", "∼", "〜"];
    const WAVE_ASCII = ["~", "~", "-", "~", "-"];

    for (let y = horizonY + 1; y < height - 1; y++) {
      const lakeDepth = (y - horizonY) / (height - 1 - horizonY);
      for (let x = 0; x < width; x++) {
        const distFromCenter = Math.abs(x - moonCenterX);
        const [wr, wg, wb] = lakeColor(distFromCenter, tick, y);

        // Moon reflection: elongated vertical strip on water
        const reflectionWidth = moonRadius * (0.8 + lakeDepth * 2.5);
        const inReflection = distFromCenter < reflectionWidth;

        if (inReflection) {
          const reflectIntensity = (1 - distFromCenter / reflectionWidth);
          // Gentle shimmer for calm lake surface
          const shimmer = Math.sin(tick * 0.03 + y * 1.0 + x * 0.2) * 0.25 + 0.75;
          const ri = reflectIntensity * shimmer;

          // Moon reflection: silver-white on dark water
          const rr = Math.min(255, Math.floor(wr + ri * 180));
          const rg = Math.min(255, Math.floor(wg + ri * 175));
          const rb = Math.min(255, Math.floor(wb + ri * 160));

          const waveOffset = Math.sin(tick * 0.025 + x * 0.1) * 0.3;
          if (ri > 0.35 + waveOffset * 0.15) {
            const chars = ascii ? WAVE_ASCII : WAVE_CHARS;
            const ch = ri > 0.7 ? (ascii ? "*" : "✦") : chars[Math.floor((x + tick * 0.2) * 0.3) % chars.length];
            renderer.set(x, y, ch, renderer.fgRgb(rr, rg, rb));
          } else {
            const chars = ascii ? WAVE_ASCII : WAVE_CHARS;
            renderer.set(x, y, chars[(x + y + Math.floor(tick * 0.15)) % chars.length],
              renderer.fgRgb(
                Math.min(255, wr + Math.floor(ri * 40)),
                Math.min(255, wg + Math.floor(ri * 38)),
                Math.min(255, wb + Math.floor(ri * 35)),
              ));
          }
        } else {
          // Regular lake - dark calm water
          const wave = Math.sin(tick * 0.02 + x * 0.1 + y * 0.15);
          const darkR = Math.max(0, wr - 2);
          const darkG = Math.max(0, wg);
          const darkB = Math.min(255, wb + 15);

          if (wave > 0.65) {
            const chars = ascii ? WAVE_ASCII : WAVE_CHARS;
            renderer.set(x, y, chars[(x + y) % chars.length],
              renderer.fgRgb(darkR, darkG, darkB));
          } else if (wave > 0.2) {
            renderer.set(x, y, ascii ? "~" : "∽",
              renderer.fgRgb(
                Math.max(0, darkR - 3),
                Math.max(0, darkG - 2),
                Math.min(255, darkB + 5),
              ));
          } else {
            renderer.set(x, y, ascii ? "-" : "~",
              renderer.fgRgb(
                Math.max(0, darkR - 5),
                Math.max(0, darkG - 4),
                Math.min(255, darkB + 3),
              ));
          }
        }
      }
    }

    // === Distant treeline silhouette along shore ===
    for (let x = 0; x < width; x++) {
      const treeHeight = Math.floor(
        1 + Math.abs(Math.sin(x * 0.08) * 2.5 + Math.sin(x * 0.2) * 1.2 + Math.sin(x * 0.03) * 1.8)
      );
      for (let dy = 0; dy < treeHeight && dy < 4; dy++) {
        const ty = horizonY - 1 - dy;
        if (ty >= 0) {
          const ch = ascii ? "^" : (dy === treeHeight - 1 ? "▲" : "█");
          // Very dark silhouette with faint moonlight highlight on top
          const highlight = dy === treeHeight - 1 ? 15 : 0;
          renderer.set(x, ty, ch, renderer.fgRgb(8 + highlight, 12 + highlight, 8 + highlight));
        }
      }
    }

    // === Star reflections on lake (occasional glints) ===
    for (let y = horizonY + 2; y < height - 2; y++) {
      for (let x = 0; x < width; x++) {
        // Skip reflection zone (already has moon reflection)
        const distFromCenter = Math.abs(x - moonCenterX);
        const lakeDepth = (y - horizonY) / (height - 1 - horizonY);
        const reflectionWidth = moonRadius * (0.8 + lakeDepth * 2.5);
        if (distFromCenter < reflectionWidth) continue;

        const hash = starHash(x, horizonY * 2 - y); // Mirror the sky star positions
        if ((hash % 200) < 1) {
          const phase = (hash % 1000) / 1000 * Math.PI * 2;
          const twinkle = Math.sin(tick * 0.04 + phase + 1.5); // Offset phase from sky stars
          if (twinkle > 0.5) {
            const b = Math.floor(twinkle * 80 + 80);
            renderer.set(x, y, ascii ? "." : "·", renderer.fgRgb(b - 20, b - 15, b));
          }
        }
      }
    }
  },

  getTitle(): string {
    return " 🌕 Vibe Picnic - 호숫가 달빛 ";
  },
};

export default moonlake;
