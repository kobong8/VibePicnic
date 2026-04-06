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
// moonRadius : 달 크기 (클수록 큼, 기본: 화면의 12%)
// moonY      : 달의 Y 위치 (작을수록 위쪽)
// moonCenterX: 달의 X 위치 (width * 0.5 = 가운데)
// aspectRatio: 세로 보정 비율 (2.0 = 터미널 기본)
//
// 달 렌더링 방식: 행별 원 경계 계산
//   각 행(row)에서 원의 가로 범위(xExtent)를 수학적으로 계산
//   distFromEdge = xExtent - |col| (양수=내부, 음수=외부)
//     >= 2  : 내부 (█, 밝은 노란색 R:255 G:235 B:110)
//     >= 1  : 테두리 안쪽 (▓, R:245 G:215 B:85)
//     >= 0  : 가장자리 (▒, R:220 G:190 B:65)
//     >= -1.5: 후광 (·, 은은한 노란 glow)
//
// 색상을 바꾸려면 renderer.fgRgb(R, G, B) 값을 수정하세요.
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

    // === 달 본체 - 행별 정확한 원 경계 계산 방식 ===
    // 터미널 문자는 세로가 가로의 ~2배이므로, 세로 반경은 절반
    const moonHalfH = Math.ceil(moonRadius / aspectRatio);

    for (let row = -moonHalfH - 1; row <= moonHalfH + 1; row++) {
      const screenY = moonY + row;
      if (screenY < 0 || screenY >= horizonY) continue;

      // 이 행에서 원의 정확한 가로 범위 계산
      const dyNorm = (row * aspectRatio) / moonRadius; // -1 ~ 1
      if (Math.abs(dyNorm) > 1) continue;
      const xExtent = Math.sqrt(1 - dyNorm * dyNorm) * moonRadius;

      for (let col = Math.floor(-xExtent - 2); col <= Math.ceil(xExtent + 2); col++) {
        const screenX = moonCenterX + col;
        if (screenX < 0 || screenX >= width) continue;

        const distFromEdge = xExtent - Math.abs(col); // 양수=안쪽, 음수=바깥

        if (distFromEdge >= 2) {
          // 내부: 전부 █ (꽉 찬 노란 원)
          const craterNoise = Math.sin(screenX * 1.7 + screenY * 2.3) * 8 +
                              Math.sin(screenX * 0.8 - screenY * 1.1) * 5;
          const cr = 255;
          const cg = Math.min(255, Math.max(0, 235 + Math.floor(craterNoise)));
          const cb = Math.min(255, Math.max(0, 110 + Math.floor(craterNoise)));
          const ch = ascii ? "@" : "█";
          renderer.set(screenX, screenY, ch, renderer.fgRgb(cr, cg, cb));

        } else if (distFromEdge >= 1) {
          // 테두리 안쪽 1px: ▓
          const ch = ascii ? "#" : "▓";
          renderer.set(screenX, screenY, ch, renderer.fgRgb(245, 215, 85));

        } else if (distFromEdge >= 0) {
          // 테두리 가장자리: ▒
          const ch = ascii ? "=" : "▒";
          renderer.set(screenX, screenY, ch, renderer.fgRgb(220, 190, 65));

        } else if (distFromEdge >= -1.5) {
          // 후광 (바로 바깥): 부드러운 glow
          const gi = (distFromEdge + 1.5) / 1.5; // 1 at edge, 0 at -1.5
          const r = Math.min(255, Math.floor(40 + gi * 160));
          const g = Math.min(255, Math.floor(35 + gi * 140));
          const b = Math.min(255, Math.floor(15 + gi * 50));
          renderer.set(screenX, screenY, ascii ? "." : "·", renderer.fgRgb(r, g, b));
        }
      }
    }

    // === 달 위아래 후광 (상하 glow) ===
    for (let row = -moonHalfH - 3; row <= moonHalfH + 3; row++) {
      const screenY = moonY + row;
      if (screenY < 0 || screenY >= horizonY) continue;

      const dyNorm = (row * aspectRatio) / moonRadius;
      const absDy = Math.abs(dyNorm);
      if (absDy <= 1) continue; // 달 본체 영역은 스킵
      if (absDy > 1.6) continue;

      const gi = (1.6 - absDy) / 0.6; // 1 near moon, 0 at edge
      const glowWidth = Math.floor(moonRadius * gi * 0.6);

      for (let col = -glowWidth; col <= glowWidth; col++) {
        const screenX = moonCenterX + col;
        if (screenX < 0 || screenX >= width) continue;
        const xi = 1 - Math.abs(col) / (glowWidth + 1);
        const intensity = gi * xi * 0.5;
        if (intensity > 0.08) {
          const r = Math.min(255, Math.floor(35 + intensity * 170));
          const g = Math.min(255, Math.floor(30 + intensity * 150));
          const b = Math.min(255, Math.floor(15 + intensity * 50));
          renderer.set(screenX, screenY, ascii ? "." : "·", renderer.fgRgb(r, g, b));
        }
      }
    }

    // === Twinkling stars ===
    for (let y = 0; y < horizonY; y++) {
      for (let x = 0; x < width; x++) {
        // 달 + 후광 영역 스킵
        const dxm = Math.abs(x - moonCenterX);
        const dym = Math.abs(y - moonY);
        if (dxm < moonRadius + 4 && dym < moonHalfH + 4) continue;

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
