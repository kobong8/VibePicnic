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

    // === 바닥 (Ground / Dirt) ===
    for (let x = 0; x < width; x++) {
      const distFromCenter = Math.abs(x - logMidX);
      const glow = Math.max(0, 1 - distFromCenter / (width * 0.4));
      
      const r = Math.min(255, Math.floor(50 + glow * 80));
      const g = Math.min(255, Math.floor(40 + glow * 40));
      const b = Math.floor(30 + glow * 10);
      
      if (x % 3 === 0) {
        renderer.set(x, groundY, ascii ? "-" : "▱", renderer.fgRgb(r, g, b));
      } else if (x % 7 === 0) {
        renderer.set(x, groundY, ascii ? "_" : "▰", renderer.fgRgb(r - 10, g - 10, b));
      } else {
        renderer.set(x, groundY, ascii ? "." : "·", renderer.fgRgb(r, g, b));
      }
    }

    // === 장작 (Logs - 삼각뿔/피라미드 형태로 세워진 모닥불) ===
    const logHeight = 5;
    const logBaseY = groundY - 1;

    // 뒷쪽 장작
    for (let i = 0; i < logHeight; i++) {
      const ly = logBaseY - i;
      const spread = (logHeight - i) * 1.5;
      
      // 왼쪽으로 기댄 장작
      const lx1 = Math.floor(logMidX - spread);
      const bark1 = (i + tick) % 4 === 0;
      renderer.set(lx1, ly, ascii ? "\\" : "▨", bark1 ? renderer.fgRgb(60, 30, 15) : renderer.fgRgb(40, 20, 10));
      renderer.set(lx1 + 1, ly, ascii ? "\\" : "▧", renderer.fgRgb(50, 25, 12));

      // 오른쪽으로 기댄 장작
      const lx2 = Math.floor(logMidX + spread);
      const bark2 = (i + tick + 2) % 4 === 0;
      renderer.set(lx2, ly, ascii ? "/" : "▧", bark2 ? renderer.fgRgb(65, 32, 16) : renderer.fgRgb(45, 22, 10));
      renderer.set(lx2 - 1, ly, ascii ? "/" : "▨", renderer.fgRgb(55, 28, 14));
    }

    // 숯불 (Glowing Embers at the base)
    for (let x = logMidX - 8; x <= logMidX + 8; x++) {
      const glow = Math.sin(tick * 0.1 + x * 0.4) * 0.5 + 0.5;
      if (glow > 0.2) {
        const r = Math.min(255, Math.floor(180 + glow * 75));
        const g = Math.min(255, Math.floor(40 + glow * 80));
        const b = Math.floor(glow * 15);
        renderer.set(x, logBaseY, ascii ? "~" : "▅", renderer.fgRgb(r, g, b));
      }
    }

    // 앞쪽 가로 장작
    for (let x = logMidX - 6; x <= logMidX + 6; x++) {
      const bark = (x + tick) % 3 === 0;
      renderer.set(x, logBaseY, ascii ? "=" : "▤", bark ? renderer.fgRgb(70, 35, 18) : renderer.fgRgb(45, 22, 12));
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