import { Particle } from "../particle";
import renderer from "../renderer";
import { Theme, GroundMap } from "./types";

// 벽난로 테마
// Fireplace with burning logs, flames, and rising embers

const EMBER_CHARS = ["✦", "✧", "·", "˚", "*", "∗", "⋆", "•"];
const EMBER_ASCII = ["*", "+", ".", "'", "o", "^", "~", "."];

// ============================================================
// 벽난로 설정
// FIREPLACE_WIDTH_RATIO : 벽난로 가로 크기 비율 (0.5 = 화면의 50%)
// FIREPLACE_HEIGHT_RATIO: 벽난로 세로 크기 비율 (0.7 = 화면의 70%)
// ============================================================
const FIREPLACE_WIDTH_RATIO = 0.5;
const FIREPLACE_HEIGHT_RATIO = 0.7;

function fireHash(x: number, y: number): number {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return (h ^ (h >> 16)) >>> 0;
}

const fireplace: Theme = {
  name: "fireplace",
  label: "🔥 벽난로",
  fps: 20,

  createParticle(width: number, _startY: number, ascii: boolean): Particle {
    const chars = ascii ? EMBER_ASCII : EMBER_CHARS;

    // 벽난로 영역 계산
    const fpW = Math.floor(width * FIREPLACE_WIDTH_RATIO);
    const fpLeft = Math.floor((width - fpW) / 2);
    const innerLeft = fpLeft + 3;
    const innerRight = fpLeft + fpW - 3;
    const innerWidth = innerRight - innerLeft;

    const rand = Math.random();

    if (rand < 0.6) {
      // 불씨 (ember) - 장작 위에서 올라감
      const spawnX = innerLeft + Math.random() * innerWidth;
      const brightness = Math.random();

      // 불씨 색상: 밝은 주황~노랑
      const palette: [number, number, number][] = [
        [255, 200, 50],   // bright yellow
        [255, 160, 30],   // orange
        [255, 120, 20],   // deep orange
        [255, 230, 80],   // pale yellow
        [255, 100, 10],   // red-orange
      ];
      const c = palette[Math.floor(Math.random() * palette.length)];

      return new Particle(spawnX, _startY, {
        speedY: -(0.1 + Math.random() * 0.25),  // 위로 올라감
        speedX: (Math.random() - 0.5) * 0.15,
        char: chars[Math.floor(Math.random() * chars.length)],
        color: renderer.fgRgb(c[0], c[1], c[2]),
        amplitude: 0.3 + Math.random() * 0.8,
        maxAge: 40 + Math.floor(Math.random() * 80),
        bold: brightness > 0.6,
        dim: false,
      });
    } else {
      // 연기 (smoke) - 더 위에서 천천히 올라감
      const spawnX = innerLeft + innerWidth * 0.3 + Math.random() * innerWidth * 0.4;
      const smokeChars = ascii ? [".", ",", "'"] : ["░", "·", "∘"];

      return new Particle(spawnX, _startY, {
        speedY: -(0.03 + Math.random() * 0.06),
        speedX: (Math.random() - 0.5) * 0.1,
        char: smokeChars[Math.floor(Math.random() * smokeChars.length)],
        color: renderer.fgRgb(100 + Math.floor(Math.random() * 40), 90 + Math.floor(Math.random() * 30), 80 + Math.floor(Math.random() * 20)),
        amplitude: 0.2 + Math.random() * 0.5,
        maxAge: 60 + Math.floor(Math.random() * 100),
        bold: false,
        dim: false,
      });
    }
  },

  spawnRate(density: number): number {
    return Math.random() < density * 0.04 ? Math.ceil(Math.random() * 2) : 0;
  },

  groundDisplayH(_landings: number): number {
    return 0;
  },

  renderGround(_groundMap: GroundMap, _height: number, _width: number, _ascii?: boolean): void {
    // Handled by renderBackground
  },

  renderBackground(tick: number, width: number, height: number, ascii?: boolean): void {
    const fpW = Math.floor(width * FIREPLACE_WIDTH_RATIO);
    const fpH = Math.floor(height * FIREPLACE_HEIGHT_RATIO);
    const fpLeft = Math.floor((width - fpW) / 2);
    const fpTop = Math.floor((height - fpH) / 2) - 1;
    const fpBottom = fpTop + fpH;
    const fpRight = fpLeft + fpW;

    const innerLeft = fpLeft + 3;
    const innerRight = fpRight - 3;
    const innerTop = fpTop + 2;
    const innerBottom = fpBottom - 1;
    const innerWidth = innerRight - innerLeft;
    const innerHeight = innerBottom - innerTop;

    // === 벽돌 벽난로 프레임 ===
    const brickColor = renderer.fgRgb(140, 70, 40);
    const brickDark = renderer.fgRgb(100, 50, 28);
    const brickLight = renderer.fgRgb(170, 90, 55);
    const stoneColor = renderer.fgRgb(120, 115, 105);
    const stoneDark = renderer.fgRgb(85, 80, 72);

    // 상단 선반 (mantel)
    for (let x = fpLeft - 1; x <= fpRight + 1; x++) {
      if (x >= 0 && x < width && fpTop - 1 >= 0) {
        renderer.set(x, fpTop - 1, ascii ? "=" : "▀",
          (x === fpLeft - 1 || x === fpRight + 1) ? stoneDark : stoneColor);
      }
      if (x >= 0 && x < width && fpTop >= 0) {
        renderer.set(x, fpTop, ascii ? "=" : "█",
          ((x + fpTop) % 2 === 0) ? stoneColor : stoneDark);
      }
    }

    // 좌우 벽돌 벽
    for (let y = fpTop + 1; y < fpBottom; y++) {
      if (y < 0 || y >= height) continue;

      // 왼쪽 벽
      for (let dx = 0; dx < 3; dx++) {
        const x = fpLeft + dx;
        if (x >= 0 && x < width) {
          const brickRow = (y + dx) % 3;
          const c = brickRow === 0 ? brickDark : (brickRow === 1 ? brickColor : brickLight);
          renderer.set(x, y, ascii ? "#" : "▓", c);
        }
      }

      // 오른쪽 벽
      for (let dx = 0; dx < 3; dx++) {
        const x = fpRight - 1 - dx;
        if (x >= 0 && x < width) {
          const brickRow = (y + dx) % 3;
          const c = brickRow === 0 ? brickDark : (brickRow === 1 ? brickColor : brickLight);
          renderer.set(x, y, ascii ? "#" : "▓", c);
        }
      }
    }

    // 하단 바닥
    for (let x = fpLeft; x < fpRight; x++) {
      if (x >= 0 && x < width && fpBottom < height) {
        renderer.set(x, fpBottom, ascii ? "=" : "▄",
          ((x + fpBottom) % 2 === 0) ? stoneDark : stoneColor);
      }
    }

    // === 벽난로 내부 어두운 배경 ===
    for (let y = innerTop; y < innerBottom; y++) {
      for (let x = innerLeft; x < innerRight; x++) {
        if (x >= 0 && x < width && y >= 0 && y < height) {
          renderer.set(x, y, " ", renderer.fgRgb(15, 10, 8));
        }
      }
    }

    // === 장작 (Logs) ===
    const logY = innerBottom - 2;
    const logMidX = Math.floor((innerLeft + innerRight) / 2);

    // 장작 1: 왼쪽 아래에서 오른쪽 위로 사선
    for (let i = 0; i < Math.min(innerWidth - 4, 18); i++) {
      const lx = innerLeft + 2 + i;
      const ly = logY + 1 - Math.floor(i * 0.3);
      if (lx < innerRight - 1 && ly >= innerTop && ly < innerBottom && ly < height) {
        const bark = (i + tick) % 5 === 0;
        renderer.set(lx, ly, ascii ? "=" : (bark ? "▓" : "█"),
          bark ? renderer.fgRgb(80, 45, 20) : renderer.fgRgb(60, 30, 12));
      }
    }

    // 장작 2: 오른쪽 아래에서 왼쪽 위로 사선 (교차)
    for (let i = 0; i < Math.min(innerWidth - 4, 18); i++) {
      const lx = innerRight - 3 - i;
      const ly = logY + 1 - Math.floor(i * 0.3);
      if (lx > innerLeft + 1 && ly >= innerTop && ly < innerBottom && ly < height) {
        const bark = (i + tick + 2) % 5 === 0;
        renderer.set(lx, ly, ascii ? "=" : (bark ? "▓" : "█"),
          bark ? renderer.fgRgb(90, 50, 22) : renderer.fgRgb(65, 35, 15));
      }
    }

    // 장작 3: 가로 (아래쪽)
    if (logY + 1 < innerBottom && logY + 1 < height) {
      for (let i = -5; i <= 5; i++) {
        const lx = logMidX + i;
        if (lx >= innerLeft + 1 && lx < innerRight - 1) {
          const bark = (Math.abs(i) + tick) % 4 === 0;
          renderer.set(lx, logY + 1, ascii ? "-" : (bark ? "▓" : "█"),
            bark ? renderer.fgRgb(85, 48, 22) : renderer.fgRgb(55, 28, 10));
        }
      }
    }

    // === 숯불 / 불씨 (Glowing embers at log base) ===
    for (let x = innerLeft + 2; x < innerRight - 2; x++) {
      const ey = logY + 1;
      if (ey >= innerTop && ey < innerBottom && ey < height) {
        const glow = Math.sin(tick * 0.08 + x * 0.5) * 0.5 + 0.5;
        if (glow > 0.3) {
          const r = Math.min(255, Math.floor(180 + glow * 75));
          const g = Math.min(255, Math.floor(40 + glow * 80));
          const b = Math.floor(glow * 15);
          renderer.set(x, ey, ascii ? "~" : "▁",
            renderer.fgRgb(r, g, b));
        }
      }
    }

    // === 불꽃 (Animated flames) ===
    const flameBaseY = logY;
    const flameHeight = Math.max(4, Math.floor(innerHeight * 0.55));
    const flameCenterX = logMidX;

    for (let fy = 0; fy < flameHeight; fy++) {
      const screenY = flameBaseY - fy;
      if (screenY < innerTop || screenY >= innerBottom || screenY >= height) continue;

      // 불꽃 너비: 아래쪽이 넓고 위로 갈수록 좁아짐
      const heightRatio = fy / flameHeight; // 0=바닥, 1=꼭대기
      const flameWidth = Math.floor((1 - heightRatio * heightRatio) * (innerWidth * 0.35));

      for (let fx = -flameWidth; fx <= flameWidth; fx++) {
        const screenX = flameCenterX + fx;
        if (screenX < innerLeft + 1 || screenX >= innerRight - 1) continue;

        // 불꽃 흔들림
        const wave1 = Math.sin(tick * 0.12 + fx * 0.3 + fy * 0.5) * 0.4;
        const wave2 = Math.sin(tick * 0.08 - fx * 0.2 + fy * 0.8) * 0.3;
        const turbulence = wave1 + wave2;

        const distFromCenter = Math.abs(fx) / (flameWidth + 1);
        const intensity = (1 - distFromCenter) * (1 - heightRatio * 0.7) + turbulence * 0.3;

        if (intensity > 0.2) {
          let r: number, g: number, b: number;
          let ch: string;

          if (heightRatio < 0.2 && intensity > 0.6) {
            // 불꽃 바닥: 밝은 흰-노랑 (가장 뜨거운 부분)
            r = 255;
            g = Math.min(255, Math.floor(230 + intensity * 25));
            b = Math.min(255, Math.floor(150 + intensity * 60));
            ch = ascii ? "#" : "█";
          } else if (heightRatio < 0.45 && intensity > 0.45) {
            // 중간: 밝은 노랑~주황
            r = 255;
            g = Math.min(255, Math.floor(160 + (1 - heightRatio) * 80));
            b = Math.floor(20 + turbulence * 20);
            ch = ascii ? "%" : "▓";
          } else if (intensity > 0.35) {
            // 위쪽: 주황~빨강
            r = Math.min(255, Math.floor(200 + intensity * 55));
            g = Math.min(255, Math.floor(60 + intensity * 60));
            b = Math.floor(5 + turbulence * 10);
            ch = ascii ? "*" : "▒";
          } else {
            // 가장자리: 어두운 빨강
            r = Math.min(255, Math.floor(150 + intensity * 80));
            g = Math.floor(30 + intensity * 30);
            b = Math.floor(turbulence * 8);
            ch = ascii ? "." : "░";
          }

          r = Math.min(255, Math.max(0, r));
          g = Math.min(255, Math.max(0, g));
          b = Math.min(255, Math.max(0, b));
          renderer.set(screenX, screenY, ch, renderer.fgRgb(r, g, b));
        }
      }
    }

    // === 벽난로 내벽에 비친 불빛 ===
    for (let y = innerTop; y < innerBottom; y++) {
      if (y >= height) continue;
      const distFromFlame = Math.abs(y - flameBaseY);
      const glow = Math.max(0, 1 - distFromFlame / (innerHeight * 0.8));

      // 왼쪽 내벽
      if (innerLeft - 1 >= fpLeft + 3) {
        const r = Math.min(255, Math.floor(30 + glow * 80));
        const g = Math.min(255, Math.floor(10 + glow * 25));
        const b = Math.floor(glow * 5);
        renderer.set(innerLeft, y, ascii ? "|" : "▐", renderer.fgRgb(r, g, b));
      }
      // 오른쪽 내벽
      if (innerRight < fpRight - 3) {
        const r = Math.min(255, Math.floor(30 + glow * 80));
        const g = Math.min(255, Math.floor(10 + glow * 25));
        const b = Math.floor(glow * 5);
        renderer.set(innerRight - 1, y, ascii ? "|" : "▌", renderer.fgRgb(r, g, b));
      }
    }

    // === 주변 벽 (어두운 배경) ===
    const wallColor = renderer.fgRgb(25, 22, 20);
    const wallChar = ascii ? "." : "·";
    for (let y = 0; y < height - 1; y++) {
      for (let x = 0; x < width; x++) {
        // 벽난로 영역 바깥
        if (x < fpLeft - 1 || x > fpRight + 1 || y < fpTop - 1 || y > fpBottom) {
          // 불빛이 주변 벽에 은은하게 비침
          const distX = Math.min(Math.abs(x - fpLeft), Math.abs(x - fpRight));
          const distY = Math.min(Math.abs(y - fpTop), Math.abs(y - fpBottom));
          const dist = Math.sqrt(distX * distX + distY * distY);
          const warmth = Math.max(0, 1 - dist / (Math.max(width, height) * 0.4));

          if (warmth > 0.05 && fireHash(x, y) % 8 === 0) {
            const flicker = Math.sin(tick * 0.06 + x * 0.2 + y * 0.3) * 0.15 + 0.85;
            const r = Math.min(255, Math.floor(20 + warmth * flicker * 60));
            const g = Math.min(255, Math.floor(15 + warmth * flicker * 20));
            const b = Math.floor(warmth * flicker * 5);
            renderer.set(x, y, wallChar, renderer.fgRgb(r, g, b));
          }
        }
      }
    }
  },

  getTitle(): string {
    return " 🔥 Vibe Picnic - 벽난로 ";
  },
};

export default fireplace;
