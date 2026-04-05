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

// ============================================================
// 달 모양을 수정하려면 이 영역을 편집하세요!
// To customize the moon shape, edit this section!
//
// moonRadius : 달 크기 (클수록 큼)
// moonY      : 달의 Y 위치 (작을수록 위쪽)
// moonCenterX: 달의 X 위치 (width * 0.5 = 가운데)
// aspectRatio: 세로 보정 비율 (2.0 = 터미널 기본)
//
// 동심원 링 (normDist 기준):
//   0.00 ~ 0.30 : 중심부 (가장 밝음, █)
//   0.30 ~ 0.55 : 중간부 (▓)
//   0.55 ~ 0.75 : 외곽부 (▒)
//   0.75 ~ 0.90 : 가장자리 (░)
//   0.90 ~ 1.00 : 테두리 (░, 어두움)
//
// 각 구간의 cr, cg, cb 값이 색상입니다 (R, G, B).
// ============================================================

function lakeColor(_distFromCenter: number, _tick: number, y: number): [number, number, number] {
  // Base lake: blue / sky-blue tone
  const baseR = 30 + Math.floor(Math.sin(y * 0.2) * 8);
  const baseG = 80 + Math.floor(Math.sin(y * 0.3) * 12);
  const baseB = 160 + Math.floor(Math.sin(y * 0.15) * 15);

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
    const chars = ascii ? STAR_ASCII : STAR_CHARS;
    const brightness = Math.random();

    const palette: [number, number, number][] = [
      [220, 230, 255],  // bright white
      [200, 215, 250],  // pale blue
      [240, 235, 200],  // warm white
      [180, 210, 250],  // light blue
      [240, 220, 160],  // pale gold
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
      dim: false,
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

    // ── 달 위치/크기 설정 ──
    const moonCenterX = Math.floor(width * 0.5);
    const moonY = Math.floor(height * 0.18);
    const moonRadius = Math.max(5, Math.floor(Math.min(width, height) * 0.12));
    const aspectRatio = 2.0;

    // === Night sky background (dark blue, not black) ===
    for (let y = 0; y < horizonY; y++) {
      const yRatio = y / horizonY;
      for (let x = 0; x < width; x++) {
        const dx = x - moonCenterX;
        const dy = (y - moonY) * aspectRatio;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < moonRadius) {
          // === 달 본체 (Moon body) ===
          const normDist = dist / moonRadius;

          let ch: string;
          let cr: number, cg: number, cb: number;

          // Crater texture for surface detail
          const craterNoise = Math.sin(x * 1.7 + y * 2.3) * 0.12 +
                              Math.sin(x * 0.8 - y * 1.1) * 0.08;

          if (normDist < 0.30) {
            // 중심부: 밝은 노란색
            ch = ascii ? "@" : "█";
            cr = 255;
            cg = 240 + Math.floor(craterNoise * 15);
            cb = 120 + Math.floor(craterNoise * 20);
          } else if (normDist < 0.55) {
            ch = ascii ? "#" : "▓";
            cr = 250;
            cg = 225 + Math.floor(craterNoise * 15);
            cb = 100 + Math.floor(craterNoise * 20);
          } else if (normDist < 0.75) {
            ch = ascii ? "=" : "▒";
            cr = 240;
            cg = 205 + Math.floor(craterNoise * 20);
            cb = 80 + Math.floor(craterNoise * 20);
          } else if (normDist < 0.90) {
            ch = ascii ? "-" : "░";
            cr = 220;
            cg = 185 + Math.floor(craterNoise * 20);
            cb = 65 + Math.floor(craterNoise * 15);
          } else {
            // 테두리: 약간 어두운 노란색
            ch = ascii ? "." : "░";
            cr = 190;
            cg = 160;
            cb = 55;
          }

          cr = Math.min(255, Math.max(0, cr));
          cg = Math.min(255, Math.max(0, cg));
          cb = Math.min(255, Math.max(0, cb));
          renderer.set(x, y, ch, renderer.fgRgb(cr, cg, cb));

        } else if (dist < moonRadius * 2.0) {
          // 달 주변 후광 (Moon glow) - warm yellow halo
          const glowIntensity = Math.max(0, 1 - (dist - moonRadius) / moonRadius);
          const gi = glowIntensity * 0.6;

          if (gi > 0.1) {
            const r = Math.min(255, Math.floor(40 + gi * 180));
            const g = Math.min(255, Math.floor(35 + gi * 160));
            const b = Math.min(255, Math.floor(20 + gi * 60));
            const ch = gi > 0.25 ? (ascii ? "." : "·") : " ";
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
        const dx = x - moonCenterX;
        const dy = (y - moonY) * aspectRatio;
        const distToMoon = Math.sqrt(dx * dx + dy * dy);
        if (distToMoon < moonRadius * 2.0) continue;

        const hash = starHash(x, y);
        if ((hash % 100) < 3) {  // ~3% density for more visible stars
          const phase = (hash % 1000) / 1000 * Math.PI * 2;
          const twinkle = Math.sin(tick * 0.06 + phase);
          const brightness = twinkle * 0.5 + 0.5;

          if (brightness > 0.15) {
            const starType = hash % STAR_CHARS.length;
            const ch = ascii ? STAR_ASCII[starType] : STAR_CHARS[starType];

            const colorType = (hash >> 8) % 5;
            let r: number, g: number, b: number;
            if (colorType === 0) {
              // Bright white
              r = Math.floor(200 + brightness * 55);
              g = Math.floor(205 + brightness * 50);
              b = Math.floor(220 + brightness * 35);
            } else if (colorType === 1) {
              // Warm yellow
              r = Math.floor(220 + brightness * 35);
              g = Math.floor(210 + brightness * 35);
              b = Math.floor(150 + brightness * 40);
            } else if (colorType === 2) {
              // Light blue
              r = Math.floor(170 + brightness * 50);
              g = Math.floor(195 + brightness * 50);
              b = Math.floor(230 + brightness * 25);
            } else {
              // Standard bright white
              r = Math.floor(195 + brightness * 60);
              g = Math.floor(195 + brightness * 60);
              b = Math.floor(200 + brightness * 55);
            }

            const isBold = brightness > 0.75;
            let color = renderer.fgRgb(r, g, b);
            if (isBold) color = renderer.bold() + color;
            renderer.set(x, y, ch, color);
          }
        }
      }
    }

    // === Horizon line (shoreline) ===
    for (let x = 0; x < width; x++) {
      const distFromMoon = Math.abs(x - moonCenterX);
      const glow = Math.max(0, 1 - distFromMoon / (width * 0.35));
      const r = Math.min(255, Math.floor(50 + glow * 120));
      const g = Math.min(255, Math.floor(60 + glow * 110));
      const b = Math.min(255, Math.floor(70 + glow * 80));
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

        // Moon reflection
        const reflectionWidth = moonRadius * (0.8 + lakeDepth * 2.5);
        const inReflection = distFromCenter < reflectionWidth;

        if (inReflection) {
          const reflectIntensity = (1 - distFromCenter / reflectionWidth);
          const shimmer = Math.sin(tick * 0.03 + y * 1.0 + x * 0.2) * 0.25 + 0.75;
          const ri = reflectIntensity * shimmer;

          // Moon reflection: warm yellow on blue water
          const rr = Math.min(255, Math.floor(wr + ri * 220));
          const rg = Math.min(255, Math.floor(wg + ri * 180));
          const rb = Math.min(255, Math.floor(wb - ri * 40));

          const waveOffset = Math.sin(tick * 0.025 + x * 0.1) * 0.3;
          if (ri > 0.35 + waveOffset * 0.15) {
            const chars = ascii ? WAVE_ASCII : WAVE_CHARS;
            const ch = ri > 0.7 ? (ascii ? "*" : "✦") : chars[Math.floor((x + tick * 0.2) * 0.3) % chars.length];
            renderer.set(x, y, ch, renderer.fgRgb(rr, rg, Math.max(0, rb)));
          } else {
            const chars = ascii ? WAVE_ASCII : WAVE_CHARS;
            renderer.set(x, y, chars[(x + y + Math.floor(tick * 0.15)) % chars.length],
              renderer.fgRgb(
                Math.min(255, wr + Math.floor(ri * 60)),
                Math.min(255, wg + Math.floor(ri * 50)),
                Math.min(255, wb - Math.floor(ri * 10)),
              ));
          }
        } else {
          // Regular lake - blue / sky-blue water
          const wave = Math.sin(tick * 0.02 + x * 0.1 + y * 0.15);

          if (wave > 0.65) {
            const chars = ascii ? WAVE_ASCII : WAVE_CHARS;
            renderer.set(x, y, chars[(x + y) % chars.length],
              renderer.fgRgb(wr, wg, wb));
          } else if (wave > 0.2) {
            renderer.set(x, y, ascii ? "~" : "∽",
              renderer.fgRgb(
                Math.max(0, wr - 5),
                Math.max(0, wg - 5),
                Math.min(255, wb + 10),
              ));
          } else {
            renderer.set(x, y, ascii ? "-" : "~",
              renderer.fgRgb(
                Math.max(0, wr - 8),
                Math.max(0, wg - 8),
                Math.min(255, wb + 5),
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
          const highlight = dy === treeHeight - 1 ? 25 : 5;
          renderer.set(x, ty, ch, renderer.fgRgb(15 + highlight, 25 + highlight, 15 + highlight));
        }
      }
    }

    // === Star reflections on lake ===
    for (let y = horizonY + 2; y < height - 2; y++) {
      for (let x = 0; x < width; x++) {
        const distFromCenter = Math.abs(x - moonCenterX);
        const lakeDepth = (y - horizonY) / (height - 1 - horizonY);
        const reflectionWidth = moonRadius * (0.8 + lakeDepth * 2.5);
        if (distFromCenter < reflectionWidth) continue;

        const hash = starHash(x, horizonY * 2 - y);
        if ((hash % 150) < 1) {
          const phase = (hash % 1000) / 1000 * Math.PI * 2;
          const twinkle = Math.sin(tick * 0.04 + phase + 1.5);
          if (twinkle > 0.4) {
            const b = Math.floor(twinkle * 100 + 120);
            renderer.set(x, y, ascii ? "." : "·", renderer.fgRgb(b - 10, b, Math.min(255, b + 20)));
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
