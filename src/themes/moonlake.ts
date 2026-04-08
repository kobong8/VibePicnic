import { Particle } from "../particle";
import renderer from "../renderer";
import { Theme, GroundMap } from "./types";

// Moonlit lake - moon reflecting on a calm lake with twinkling stars

const STAR_CHARS = ["✦", "✧", "⋆", "✶", "*", "·", "˚", "∗"];
const STAR_ASCII = ["*", "+", ".", "'", "o", "~", "^", "."];

function starHash(x: number, y: number): number {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return (h ^ (h >> 16)) >>> 0;
}

// ============================================================
// Edit this section to customize the moon's appearance!
//
// MOON_SIZE   : Moon size ratio (0.18 = 18% of screen, higher is larger)
// MOON_POS_Y  : Moon's Y-position ratio (0.18 = 18% from top, lower is higher)
// MOON_POS_X  : Moon's X-position ratio (0.5 = center)
// ASPECT_RATIO: Vertical correction ratio (2.0 = terminal default)
// MOON_WIDTH_STRETCH: Moon horizontal stretch ratio (1.0 = default, 1.5 = 1.5x wider)
//
// The moon is drawn over the particles in 'renderForeground',
// ensuring it remains visible at all times.
//
// Rendering method: Calculating circular boundaries per row
//   distFromEdge = xExtent - |col| (Positive = Inside, Negative = Outside)
//     >= 2   : Core/Inside (█, Bright Yellow)
//     >= 1   : Inner Border (▓)
//     >= 0   : Edge (▒)
//     >= -1.5: Halo (·, Subtle Glow)
// ============================================================
const MOON_SIZE = 0.18;
const MOON_POS_Y = 0.18;
const MOON_POS_X = 0.5;
const ASPECT_RATIO = 2.0;
function getMoonParams(width: number, height: number) {
  const moonCenterX = Math.floor(width * MOON_POS_X);
  const moonY = Math.floor(height * MOON_POS_Y);
  const moonRadius = Math.max(
    6,
    Math.floor(Math.min(width, height) * MOON_SIZE),
  );
  const moonHalfH = Math.ceil(moonRadius / ASPECT_RATIO);
  return { moonCenterX, moonY, moonRadius, moonHalfH };
}

function lakeColor(
  _distFromCenter: number,
  _tick: number,
  y: number,
): [number, number, number] {
  const baseR = 30 + Math.floor(Math.sin(y * 0.2) * 8);
  const baseG = 80 + Math.floor(Math.sin(y * 0.3) * 12);
  const baseB = 160 + Math.floor(Math.sin(y * 0.15) * 15);
  return [
    Math.min(255, Math.max(0, baseR)),
    Math.min(255, Math.max(0, baseG)),
    Math.min(255, Math.max(0, baseB)),
  ];
}

function drawMoon(
  width: number,
  height: number,
  horizonY: number,
  ascii?: boolean,
): void {
  const { moonCenterX, moonY, moonRadius, moonHalfH } = getMoonParams(
    width,
    height,
  );

  const maxRow = moonHalfH + 3;
  const maxCol = moonRadius + 6;

  for (let row = -maxRow; row <= maxRow; row++) {
    const screenY = moonY + row;
    if (screenY < 0 || screenY >= horizonY) continue;

    const dy = row * ASPECT_RATIO;

    for (let col = -maxCol; col <= maxCol; col++) {
      const screenX = moonCenterX + col;
      if (screenX < 0 || screenX >= width) continue;

      const dx = col;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const distFromEdge = moonRadius - dist;

      if (distFromEdge >= 1.5) {
        // 내부 (크레이터 노이즈)
        const craterNoise =
          Math.sin(screenX * 1.7 + screenY * 2.3) * 8 +
          Math.sin(screenX * 0.8 - screenY * 1.1) * 5;
        const cr = 255;
        const cg = Math.min(255, Math.max(0, 235 + Math.floor(craterNoise)));
        const cb = Math.min(255, Math.max(0, 110 + Math.floor(craterNoise)));
        renderer.set(
          screenX,
          screenY,
          ascii ? "@" : "█",
          renderer.fgRgb(cr, cg, cb),
        );
      } else if (distFromEdge >= 0.5) {
        // 테두리 안쪽
        renderer.set(
          screenX,
          screenY,
          ascii ? "#" : "▓",
          renderer.fgRgb(245, 215, 85),
        );
      } else if (distFromEdge >= -0.5) {
        // 가장자리
        renderer.set(
          screenX,
          screenY,
          ascii ? "=" : "▒",
          renderer.fgRgb(220, 190, 65),
        );
      } else if (distFromEdge >= -4.0) {
        // 후광 (점진적으로 어두워짐)
        const gi = (distFromEdge + 4.0) / 3.5;
        const intensity = gi * gi * 0.8;
        if (intensity > 0.05) {
          const r = Math.min(255, Math.floor(35 + intensity * 170));
          const g = Math.min(255, Math.floor(30 + intensity * 150));
          const b = Math.min(255, Math.floor(15 + intensity * 50));
          renderer.set(
            screenX,
            screenY,
            ascii ? "." : "·",
            renderer.fgRgb(r, g, b),
          );
        }
      }
    }
  }
}

const moonlake: Theme = {
  name: "moonlake",
  label: "🌕 호숫가 달빛",
  fps: 18,

  createParticle(width: number, startY: number, ascii: boolean): Particle {
    const chars = ascii ? STAR_ASCII : STAR_CHARS;
    const brightness = Math.random();

    const palette: [number, number, number][] = [
      [220, 230, 255],
      [200, 215, 250],
      [240, 235, 200],
      [180, 210, 250],
      [240, 220, 160],
    ];
    const c = palette[Math.floor(Math.random() * palette.length)];

    return new Particle(
      Math.random() * width,
      startY < 0 ? startY : startY * 0.5 + Math.random() * startY * 0.5,
      {
        speedY: 0.005 + Math.random() * 0.02,
        speedX: Math.random() * 0.06 - 0.03,
        char: chars[Math.floor(Math.random() * chars.length)],
        color: renderer.fgRgb(c[0], c[1], c[2]),
        amplitude: 0.1 + Math.random() * 0.3,
        maxAge: 80 + Math.floor(Math.random() * 160),
        bold: brightness > 0.8,
        dim: false,
      },
    );
  },

  spawnRate(density: number): number {
    return Math.random() < density * 0.012 ? 1 : 0;
  },

  groundDisplayH(_landings: number): number {
    return 0;
  },

  renderGround(
    _groundMap: GroundMap,
    _height: number,
    _width: number,
    _ascii?: boolean,
  ): void {
    // Handled by renderBackground
  },

  renderBackground(
    tick: number,
    width: number,
    height: number,
    ascii?: boolean,
  ): void {
    const horizonY = Math.floor(height * 0.45);
    const { moonCenterX, moonRadius, moonHalfH } = getMoonParams(width, height);

    // === 달 본체 (배경 레이어) ===
    drawMoon(width, height, horizonY, ascii);

    // === Twinkling stars ===
    for (let y = 0; y < horizonY; y++) {
      for (let x = 0; x < width; x++) {
        // 달 + 후광 영역 스킵
        const dxm = Math.abs(x - moonCenterX);
        const dym = Math.abs(y - Math.floor(height * MOON_POS_Y));
        if (dxm < moonRadius + 4 && dym < moonHalfH + 4) continue;

        const hash = starHash(x, y);
        if (hash % 100 < 3) {
          const phase = ((hash % 1000) / 1000) * Math.PI * 2;
          const twinkle = Math.sin(tick * 0.06 + phase);
          const brightness = twinkle * 0.5 + 0.5;

          if (brightness > 0.15) {
            const starType = hash % STAR_CHARS.length;
            const ch = ascii ? STAR_ASCII[starType] : STAR_CHARS[starType];

            const colorType = (hash >> 8) % 5;
            let r: number, g: number, b: number;
            if (colorType === 0) {
              r = Math.floor(200 + brightness * 55);
              g = Math.floor(205 + brightness * 50);
              b = Math.floor(220 + brightness * 35);
            } else if (colorType === 1) {
              r = Math.floor(220 + brightness * 35);
              g = Math.floor(210 + brightness * 35);
              b = Math.floor(150 + brightness * 40);
            } else if (colorType === 2) {
              r = Math.floor(170 + brightness * 50);
              g = Math.floor(195 + brightness * 50);
              b = Math.floor(230 + brightness * 25);
            } else {
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
      const shoreCh = ascii
        ? "-"
        : (x + Math.floor(Math.sin(x * 0.3) * 2)) % 3 === 0
          ? "━"
          : "─";
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

        const reflectionWidth = moonRadius * (0.8 + lakeDepth * 2.5);
        const inReflection = distFromCenter < reflectionWidth;

        if (inReflection) {
          const reflectIntensity = 1 - distFromCenter / reflectionWidth;
          const shimmer =
            Math.sin(tick * 0.03 + y * 1.0 + x * 0.2) * 0.25 + 0.75;
          const ri = reflectIntensity * shimmer;

          const rr = Math.min(255, Math.floor(wr + ri * 220));
          const rg = Math.min(255, Math.floor(wg + ri * 180));
          const rb = Math.min(255, Math.floor(wb - ri * 40));

          const waveOffset = Math.sin(tick * 0.025 + x * 0.1) * 0.3;
          if (ri > 0.35 + waveOffset * 0.15) {
            const chars = ascii ? WAVE_ASCII : WAVE_CHARS;
            const ch =
              ri > 0.7
                ? ascii
                  ? "*"
                  : "✦"
                : chars[Math.floor((x + tick * 0.2) * 0.3) % chars.length];
            renderer.set(x, y, ch, renderer.fgRgb(rr, rg, Math.max(0, rb)));
          } else {
            const chars = ascii ? WAVE_ASCII : WAVE_CHARS;
            renderer.set(
              x,
              y,
              chars[(x + y + Math.floor(tick * 0.15)) % chars.length],
              renderer.fgRgb(
                Math.min(255, wr + Math.floor(ri * 60)),
                Math.min(255, wg + Math.floor(ri * 50)),
                Math.min(255, wb - Math.floor(ri * 10)),
              ),
            );
          }
        } else {
          const wave = Math.sin(tick * 0.02 + x * 0.1 + y * 0.15);

          if (wave > 0.65) {
            const chars = ascii ? WAVE_ASCII : WAVE_CHARS;
            renderer.set(
              x,
              y,
              chars[(x + y) % chars.length],
              renderer.fgRgb(wr, wg, wb),
            );
          } else if (wave > 0.2) {
            renderer.set(
              x,
              y,
              ascii ? "~" : "∽",
              renderer.fgRgb(
                Math.max(0, wr - 5),
                Math.max(0, wg - 5),
                Math.min(255, wb + 10),
              ),
            );
          } else {
            renderer.set(
              x,
              y,
              ascii ? "-" : "~",
              renderer.fgRgb(
                Math.max(0, wr - 8),
                Math.max(0, wg - 8),
                Math.min(255, wb + 5),
              ),
            );
          }
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
        if (hash % 150 < 1) {
          const phase = ((hash % 1000) / 1000) * Math.PI * 2;
          const twinkle = Math.sin(tick * 0.04 + phase + 1.5);
          if (twinkle > 0.4) {
            const b = Math.floor(twinkle * 100 + 120);
            renderer.set(
              x,
              y,
              ascii ? "." : "·",
              renderer.fgRgb(b - 10, b, Math.min(255, b + 20)),
            );
          }
        }
      }
    }
  },

  // 파티클 위에 달을 다시 그려서 파티클이 달을 가리지 않도록 함
  renderForeground(
    _tick: number,
    width: number,
    height: number,
    ascii?: boolean,
  ): void {
    const horizonY = Math.floor(height * 0.45);
    drawMoon(width, height, horizonY, ascii);
  },

  getTitle(): string {
    return " 🌕 Vibe Picnic - 호숫가 달빛 ";
  },
};

export default moonlake;
