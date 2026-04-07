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
  label: "🔥 모닥불",
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

    // 숯불 (Glowing embers at the very base)
    for (let x = logMidX - 8; x <= logMidX + 8; x++) {
      const glow = Math.sin(tick * 0.1 + x * 0.4) * 0.5 + 0.5;
      if (glow > 0.15) {
        const r = Math.min(255, Math.floor(185 + glow * 70));
        const g = Math.min(255, Math.floor(45 + glow * 65));
        renderer.set(x, groundY, ascii ? "~" : "▃", renderer.fgRgb(r, g, 0));
      }
    }

    // 앞쪽 가로 장작 (Front horizontal log - cylindrical shape)
    for (let x = logMidX - 9; x <= logMidX + 9; x++) {
      const distFromCenter = Math.abs(x - logMidX);
      const isEnd = distFromCenter >= 8;
      const isBurning = distFromCenter < 4 && Math.random() > 0.45;

      // Wood grain: subtle color variation along the length
      const grainIdx = (x - logMidX + 20) % 4;
      const grainMult = grainIdx === 0 ? 0.85 : grainIdx === 2 ? 1.15 : 1.0;

      const baseR = isEnd ? 110 : 88;
      const baseG = isEnd ? 55 : 44;
      const baseB = isEnd ? 22 : 18;

      // Top row: cylinder highlight (rounded top catches light)
      const hiR = isBurning ? 155 : Math.min(255, Math.floor(baseR * 1.35 * grainMult));
      const hiG = isBurning ? 55  : Math.min(255, Math.floor(baseG * 1.2  * grainMult));
      const hiB = isBurning ? 12  : Math.floor(baseB * grainMult);
      // End caps show the rounded log end cross-section
      renderer.set(x, logBaseY - 1, ascii ? (isEnd ? "o" : "-") : (isEnd ? "▐" : "▀"),
        renderer.fgRgb(hiR, hiG, hiB));

      // Bottom row: shadow under cylinder (contact with ground)
      const shR = isBurning ? 105 : Math.floor(baseR * 0.7);
      const shG = isBurning ? 38  : Math.floor(baseG * 0.7);
      const shB = isBurning ? 6   : Math.floor(baseB * 0.7);
      renderer.set(x, logBaseY, ascii ? "=" : "▄",
        renderer.fgRgb(shR, shG, shB));
    }

    // 뒷쪽 대각선 장작 (Back crossed logs - teepee V-shape)
    // Each log is 2 chars wide with highlight/shadow to suggest a cylinder
    const numLogSegs = 8;
    for (let i = 0; i < numLogSegs; i++) {
      const ly = logBaseY - 2 - i;
      if (ly < 0) break;
      const spread = i * 2.1;
      const isBurningLog = i < 3;

      // Left log going \ (lighter on left face = highlight, darker on right = shadow)
      const lxL = Math.floor(logMidX - 2 - spread);
      const lHi = isBurningLog ? renderer.fgRgb(130, 48, 12) : renderer.fgRgb(102, 52, 22);
      const lSh = isBurningLog ? renderer.fgRgb(75,  28,  8) : renderer.fgRgb(58,  30, 12);
      if (lxL     >= 0 && lxL     < width) renderer.set(lxL,     ly, ascii ? "\\" : "▓", lHi);
      if (lxL + 1 >= 0 && lxL + 1 < width) renderer.set(lxL + 1, ly, ascii ? "\\" : "█", lSh);

      // Right log going / (darker on left face = shadow, lighter on right = highlight)
      const lxR = Math.floor(logMidX + 2 + spread);
      const rHi = isBurningLog ? renderer.fgRgb(130, 48, 12) : renderer.fgRgb(102, 52, 22);
      const rSh = isBurningLog ? renderer.fgRgb(75,  28,  8) : renderer.fgRgb(58,  30, 12);
      if (lxR - 1 >= 0 && lxR - 1 < width) renderer.set(lxR - 1, ly, ascii ? "/" : "█", rSh);
      if (lxR     >= 0 && lxR     < width) renderer.set(lxR,     ly, ascii ? "/" : "▓", rHi);
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
    return " 🔥 Vibe Picnic - 모닥불 ";
  },
};

export default campfire;