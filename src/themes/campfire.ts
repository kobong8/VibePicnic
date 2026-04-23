import { Particle } from "../particle";
import renderer from "../renderer";
import { Theme, GroundMap } from "./types";

// 캠프파이어 테마 (Campfire)
// Outdoor campfire with burning logs, flames, and rising embers

const EMBER_CHARS = ["✦", "✧", "·", "˚", "*", "∗", "⋆", "•"];
const EMBER_ASCII = ["*", "+", ".", "'", "o", "^", "~", "."];

function fireHash(x: number, y: number): number {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return (h ^ (h >> 16)) >>> 0;
}

const campfire: Theme = {
  name: "campfire",
  label: "🔥 Campfire",
  fps: 20,

  createParticle(width: number, _startY: number, ascii: boolean): Particle {
    const chars = ascii ? EMBER_ASCII : EMBER_CHARS;
    const fireWidth = Math.floor(width * 0.4);
    const fireLeft = Math.floor((width - fireWidth) / 2);
    
    const rand = Math.random();

    if (rand < 0.7) {
      // 불씨 (ember) - 장작 위에서 흩날리며 올라감
      const spawnX = fireLeft + Math.random() * fireWidth;
      const brightness = Math.random();

      const palette: [number, number, number][] = [
        [255, 200, 50],
        [255, 160, 30],
        [255, 120, 20],
        [255, 230, 80],
        [255, 100, 10],
      ];
      const c = palette[Math.floor(Math.random() * palette.length)];

      return new Particle(spawnX, _startY, {
        speedY: -(0.15 + Math.random() * 0.3),
        speedX: (Math.random() - 0.5) * 0.25,
        char: chars[Math.floor(Math.random() * chars.length)],
        color: renderer.fgRgb(c[0], c[1], c[2]),
        amplitude: 0.5 + Math.random() * 1.5,
        maxAge: 30 + Math.floor(Math.random() * 40),
        bold: brightness > 0.6,
        dim: false,
      });
    } else {
      // 연기 (smoke)
      const spawnX = fireLeft + fireWidth * 0.2 + Math.random() * fireWidth * 0.6;
      const smokeChars = ascii ? [".", ",", "'"] : ["░", "·", "∘", "☁"];

      return new Particle(spawnX, _startY, {
        speedY: -(0.05 + Math.random() * 0.1),
        speedX: (Math.random() - 0.5) * 0.2,
        char: smokeChars[Math.floor(Math.random() * smokeChars.length)],
        color: renderer.fgRgb(
          100 + Math.floor(Math.random() * 40), 
          90 + Math.floor(Math.random() * 30), 
          80 + Math.floor(Math.random() * 20)
        ),
        amplitude: 0.5 + Math.random() * 1.0,
        maxAge: 40 + Math.floor(Math.random() * 50),
        bold: false,
        dim: false,
      });
    }
  },

  spawnRate(density: number): number {
    return Math.random() < density * 0.05 ? Math.ceil(Math.random() * 2) : 0;
  },

  groundDisplayH(_landings: number): number {
    return 0;
  },

  renderGround(_groundMap: GroundMap, _height: number, _width: number, _ascii?: boolean): void {
    // Handled by renderBackground
  },

  renderBackground(tick: number, width: number, height: number, ascii?: boolean): void {
    const fireWidth = Math.floor(width * 0.4);
    const fireLeft = Math.floor((width - fireWidth) / 2);
    const fireRight = fireLeft + fireWidth;
    const logMidX = Math.floor(width / 2);
    const groundY = height - 2;

    // === 장작 (Logs) ===
    const logBaseY = groundY - 1;

    // ── 1. 뒤쪽 대각선 장작 (먼저 그려서 앞 장작에 가려짐) ──
    // spread=2 정수 + 3칸 폭 → 인접 행이 1칸 겹쳐 끊김 없는 연속선
    for (let i = 0; i < 10; i++) {
      const ly = logBaseY - 2 - i;
      if (ly < 0) break;
      const spread = i * 2;
      const isBurningLog = i < 3;

      // 왼쪽 \ 장작: 왼쪽 면 밝음(하이라이트) → 오른쪽 면 어둠(그림자)
      const lxL = logMidX - 2 - spread;
      const lA = isBurningLog ? renderer.fgRgb(140, 54, 14) : renderer.fgRgb(108, 56, 24);
      const lB = isBurningLog ? renderer.fgRgb(105, 40, 10) : renderer.fgRgb(84,  44, 18);
      const lC = isBurningLog ? renderer.fgRgb(68,  24,  7) : renderer.fgRgb(52,  27, 10);
      if (lxL     >= 0 && lxL     < width) renderer.set(lxL,     ly, ascii ? "\\" : "▓", lA);
      if (lxL + 1 >= 0 && lxL + 1 < width) renderer.set(lxL + 1, ly, ascii ? "\\" : "█", lB);
      if (lxL + 2 >= 0 && lxL + 2 < width) renderer.set(lxL + 2, ly, ascii ? "\\" : "▓", lC);

      // 오른쪽 / 장작: 왼쪽 면 어둠(그림자) → 오른쪽 면 밝음(하이라이트)
      const lxR = logMidX + 2 + spread;
      const rA = isBurningLog ? renderer.fgRgb(68,  24,  7) : renderer.fgRgb(52,  27, 10);
      const rB = isBurningLog ? renderer.fgRgb(105, 40, 10) : renderer.fgRgb(84,  44, 18);
      const rC = isBurningLog ? renderer.fgRgb(140, 54, 14) : renderer.fgRgb(108, 56, 24);
      if (lxR - 2 >= 0 && lxR - 2 < width) renderer.set(lxR - 2, ly, ascii ? "/" : "▓", rA);
      if (lxR - 1 >= 0 && lxR - 1 < width) renderer.set(lxR - 1, ly, ascii ? "/" : "█", rB);
      if (lxR     >= 0 && lxR     < width) renderer.set(lxR,     ly, ascii ? "/" : "▓", rC);
    }

    // ── 2. 숯불 바닥 (Ember bed) ──
    for (let x = logMidX - 10; x <= logMidX + 10; x++) {
      const glow = Math.sin(tick * 0.1 + x * 0.4) * 0.5 + 0.5;
      if (glow > 0.1) {
        const r = Math.min(255, Math.floor(185 + glow * 70));
        const g = Math.min(255, Math.floor(42 + glow * 62));
        renderer.set(x, groundY, ascii ? "~" : "▃", renderer.fgRgb(r, g, 0));
      }
    }

    // ── 3. 양 옆 뻗은 장작 (Side logs) ──
    for (const side of [-1, 1]) {
      // 안쪽 옆 장작 (앞 장작과 같은 높이, 바깥으로 뻗음)
      for (let d = 0; d < 9; d++) {
        const x = side > 0 ? logMidX + 10 + d : logMidX - 10 - d;
        if (x < 0 || x >= width) continue;
        const isTip = d >= 7;
        const grain = (x + 7) % 3;
        const bR = isTip ? 118 : (grain === 0 ? 74 : grain === 1 ? 86 : 80);
        const bG = isTip ? 60  : (grain === 0 ? 37 : grain === 1 ? 43 : 40);
        const bB = isTip ? 24  : 15;
        // 위쪽 하이라이트 (원통형 상단)
        renderer.set(x, logBaseY - 1, ascii ? (isTip ? "o" : "-") : (isTip ? (side > 0 ? "▐" : "▌") : "▀"),
          renderer.fgRgb(bR, bG, bB));
        // 아래쪽 그림자
        renderer.set(x, logBaseY, ascii ? "=" : "▄",
          renderer.fgRgb(Math.floor(bR * 0.68), Math.floor(bG * 0.68), Math.floor(bB * 0.68)));
      }
      // 바깥쪽 옆 장작 (한 단 낮아서 뒤에 있는 나무 느낌)
      for (let d = 3; d < 14; d++) {
        const x = side > 0 ? logMidX + 7 + d : logMidX - 7 - d;
        if (x < 0 || x >= width) continue;
        const isTip = d >= 12;
        const grain = (x + 2) % 3;
        const bR = isTip ? 100 : (grain === 0 ? 66 : grain === 1 ? 76 : 71);
        const bG = isTip ? 50  : (grain === 0 ? 33 : grain === 1 ? 38 : 36);
        const bB = isTip ? 18  : 13;
        renderer.set(x, logBaseY, ascii ? (isTip ? "o" : "=") : (isTip ? (side > 0 ? "▐" : "▌") : "▄"),
          renderer.fgRgb(bR, bG, bB));
      }
    }

    // ── 4. 앞쪽 가로 장작 (Front horizontal log - 마지막에 그려 앞에 표시) ──
    for (let x = logMidX - 9; x <= logMidX + 9; x++) {
      const distFromCenter = Math.abs(x - logMidX);
      const isEnd = distFromCenter >= 8;
      const isBurning = distFromCenter < 4 && Math.random() > 0.45;

      const grain = (x - logMidX + 20) % 4;
      const grainMult = grain === 0 ? 0.85 : grain === 2 ? 1.15 : 1.0;
      const baseR = isEnd ? 112 : 90;
      const baseG = isEnd ? 56  : 45;
      const baseB = isEnd ? 22  : 18;

      // 위: 원통 하이라이트
      const hiR = isBurning ? 155 : Math.min(255, Math.floor(baseR * 1.35 * grainMult));
      const hiG = isBurning ? 55  : Math.min(255, Math.floor(baseG * 1.2  * grainMult));
      const hiB = isBurning ? 12  : Math.floor(baseB * grainMult);
      renderer.set(x, logBaseY - 1, ascii ? (isEnd ? "o" : "-") : (isEnd ? "▐" : "▀"),
        renderer.fgRgb(hiR, hiG, hiB));

      // 아래: 원통 그림자
      const shR = isBurning ? 108 : Math.floor(baseR * 0.7);
      const shG = isBurning ? 40  : Math.floor(baseG * 0.7);
      const shB = isBurning ? 6   : Math.floor(baseB * 0.7);
      renderer.set(x, logBaseY, ascii ? "=" : "▄",
        renderer.fgRgb(shR, shG, shB));
    }

    // === 불꽃 (Campfire Flames) ===
    const flameBaseY = logBaseY - 1;
    const flameHeight = Math.max(6, Math.floor(height * 0.45));

    for (let fy = 0; fy < flameHeight; fy++) {
      const screenY = flameBaseY - fy;
      if (screenY < 0 || screenY >= height) continue;

      const heightRatio = fy / flameHeight;
      
      // 모닥불 형태: 아래는 넓고 위로 갈수록 좁아짐
      const baseWidth = Math.floor(width * 0.15);
      
      // 흔들림 (Sway)
      const sway = Math.sin(tick * 0.15 + fy * 0.3) * baseWidth * 0.4 * heightRatio;
      
      // 선형적으로 좁아지는 불꽃 폭
      const flameWidth = Math.floor(baseWidth * (1.0 - heightRatio));

      for (let fx = -flameWidth - 2; fx <= flameWidth + 2; fx++) {
        const screenX = Math.floor(logMidX + fx + sway);
        if (screenX < 0 || screenX >= width) continue;

        // 불꽃의 일렁임 (Turbulence)
        const wave1 = Math.sin(tick * 0.25 + fx * 0.4 - fy * 0.8) * 0.5;
        const wave2 = Math.sin(tick * 0.18 - fx * 0.5 - fy * 0.6) * 0.4;
        const turbulence = wave1 + wave2;

        const distFromCenter = Math.abs(fx) / (flameWidth + 1);
        const intensity = (1 - distFromCenter) * (1 - heightRatio * 0.9) + turbulence * 0.4;

        if (intensity > 0.15) {
          let r: number, g: number, b: number;
          let ch: string;

          if (heightRatio < 0.3 && intensity > 0.7) {
            r = 255;
            g = Math.min(255, Math.floor(220 + intensity * 35));
            b = Math.min(255, Math.floor(100 + intensity * 80));
            ch = ascii ? "#" : "█";
          } else if (heightRatio < 0.6 && intensity > 0.5) {
            r = 255;
            g = Math.min(255, Math.floor(140 + (1 - heightRatio) * 90));
            b = Math.floor(20 + turbulence * 20);
            ch = ascii ? "%" : "▓";
          } else if (intensity > 0.3) {
            r = Math.min(255, Math.floor(210 + intensity * 45));
            g = Math.min(255, Math.floor(50 + intensity * 60));
            b = Math.floor(5 + turbulence * 10);
            ch = ascii ? "*" : "▒";
          } else {
            r = Math.min(255, Math.floor(160 + intensity * 80));
            g = Math.floor(20 + intensity * 30);
            b = Math.floor(Math.max(0, turbulence * 5));
            ch = ascii ? "." : "░";
          }

          r = Math.min(255, Math.max(0, r));
          g = Math.min(255, Math.max(0, g));
          b = Math.min(255, Math.max(0, b));
          renderer.set(screenX, screenY, ch, renderer.fgRgb(r, g, b));
        }
      }
    }

    // === 배경 빛 (Glow on the ground/air) ===
    const glowChar = ascii ? "." : "·";
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const distX = Math.abs(x - logMidX);
        const distY = Math.abs(y - (logBaseY - Math.floor(flameHeight / 2)));
        const dist = Math.sqrt(distX * distX + distY * distY * 2.0); // 타원형 빛
        
        const warmth = Math.max(0, 1 - dist / (Math.max(width, height) * 0.35));

        // 이미 그려진 문자가 없는 공간에만 빛을 그린다 (간단한 판별법)
        if (warmth > 0.05 && fireHash(x, y) % 6 === 0 && y < groundY) {
          const flicker = Math.sin(tick * 0.1 + x * 0.2 + y * 0.3) * 0.15 + 0.85;
          const r = Math.min(255, Math.floor(30 + warmth * flicker * 80));
          const g = Math.min(255, Math.floor(15 + warmth * flicker * 30));
          const b = Math.floor(warmth * flicker * 5);
          
          // 기존 불꽃이나 장작 위에 그리지 않도록 대략적인 바운딩 박스 회피
          if (distX > (fireWidth * 0.4) || y < flameBaseY - flameHeight) {
            renderer.set(x, y, glowChar, renderer.fgRgb(r, g, b));
          }
        }
      }
    }
  },

  renderForeground(_tick: number, _width: number, _height: number, _ascii?: boolean): void {
    // No foreground frame needed for an open campfire
  },

  getTitle(): string {
    return " 🔥 Vibe Picnic - Campfire ";
  },
};

export default campfire;