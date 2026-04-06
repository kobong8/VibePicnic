import renderer from "./renderer";
import { ParticleSystem } from "./particle";
import { Theme, GroundMap } from "./themes/types";
import spring from "./themes/spring";
import summer from "./themes/summer";
import autumn from "./themes/autumn";
import winter from "./themes/winter";
import moonlake from "./themes/moonlake";

export const themes: Record<string, Theme> = { spring, summer, autumn, winter, moonlake };

export interface RunOptions {
  season?: string;
  density?: number;
  speed?: number;
  wind?: number;
  ascii?: boolean;
  noColor?: boolean;
  noGround?: boolean;
  splash?: boolean;
  message?: string;
}

export function detectSeason(): string {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

export function run(options: RunOptions): void {
  const {
    season = "auto",
    density = 15,
    speed = 1.0,
    wind: initWind = 0.5,
    ascii = false,
    noColor = false,
    noGround = false,
    splash = false,
    message = "",
  } = options;

  const themeName = season === "auto" ? detectSeason() : season;
  const theme = themes[themeName];
  if (!theme) {
    console.error(`Unknown season: ${season}. Use: spring, summer, autumn, winter`);
    process.exit(1);
  }

  const system = new ParticleSystem();
  const groundMap: GroundMap = {};
  let wind = initWind;
  let currentDensity = density;
  let tick = 0;
  let running = true;

  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }
  process.stdin.resume();
  process.stdin.setEncoding("utf8");

  renderer.init();

  process.stdin.on("data", (key: string) => {
    if (splash) {
      running = false;
      return;
    }

    if (key === "q" || key === "Q" || key === "\x1b" || key === "\x03") {
      running = false;
      return;
    }
    if (key === "\x1b[D") wind = Math.max(-5, wind - 0.3);
    if (key === "\x1b[C") wind = Math.min(5, wind + 0.3);
    if (key === "\x1b[A") currentDensity = Math.min(50, currentDensity + 2);
    if (key === "\x1b[B") currentDensity = Math.max(1, currentDensity - 2);
    if (key === "r" || key === "R") {
      for (const k in groundMap) delete groundMap[k];
    }
    if (key === "1") switchTheme("spring");
    if (key === "2") switchTheme("summer");
    if (key === "3") switchTheme("autumn");
    if (key === "4") switchTheme("winter");
    if (key === "5") switchTheme("moonlake");
  });

  let activeTheme = theme;

  function switchTheme(name: string): void {
    activeTheme = themes[name];
    system.particles = [];
    for (const k in groundMap) delete groundMap[k];
    for (let i = 0; i < currentDensity; i++) {
      const p = activeTheme.createParticle(
        renderer.width,
        Math.random() * renderer.height,
        ascii
      );
      system.add(p);
    }
  }

  process.stdout.on("resize", () => {
    renderer.updateSize();
    for (const k in groundMap) delete groundMap[k];
  });

  for (let i = 0; i < currentDensity; i++) {
    const p = activeTheme.createParticle(
      renderer.width,
      Math.random() * renderer.height,
      ascii
    );
    system.add(p);
  }

  function frame(): void {
    if (!running) {
      cleanup();
      return;
    }

    renderer.clear();

    if (activeTheme.renderBackground) {
      activeTheme.renderBackground(tick, renderer.width, renderer.height, ascii);
    }

    const spawnCount = activeTheme.spawnRate(currentDensity);
    for (let i = 0; i < spawnCount; i++) {
      if (system.count() < currentDensity * 4) {
        system.add(activeTheme.createParticle(renderer.width, -1, ascii));
      }
    }

    const adjustedWind = wind * speed;
    const getGroundY = noGround
      ? undefined
      : (x: number): number => {
          const dh = activeTheme.groundDisplayH(groundMap[x] || 0);
          return dh > 0 ? renderer.height - 1 - dh : renderer.height - 1;
        };
    const landed = system.update(tick, adjustedWind, renderer.width, renderer.height, getGroundY);

    if (!noGround) {
      for (const p of landed) {
        const ix = Math.floor(p.x);
        if (ix >= 0 && ix < renderer.width) {
          groundMap[ix] = (groundMap[ix] || 0) + 1;
        }
      }
    }

    if (activeTheme.onLanded) {
      activeTheme.onLanded(landed, system, renderer.height);
    }

    for (const p of system.particles) {
      let color = noColor ? "" : p.color;
      if (!noColor && p.bold) color = renderer.bold() + color;
      if (!noColor && p.dim) color = renderer.dim() + color;
      renderer.set(p.x, p.y, p.char, color);
    }

    if (!noGround) {
      activeTheme.renderGround(groundMap, renderer.height, renderer.width, ascii);
    }

    if (activeTheme.renderForeground) {
      activeTheme.renderForeground(tick, renderer.width, renderer.height, ascii);
    }

    if (splash) {
      drawSplashUI();
    } else {
      drawUI();
    }

    renderer.flush();
    tick++;

    const interval = Math.floor(1000 / (activeTheme.fps * speed));
    setTimeout(frame, interval);
  }

  function drawSplashUI(): void {
    const w = renderer.width;
    const h = renderer.height;

    const icons: Record<string, string> = {
      spring: "🌸", summer: "🌧️", autumn: "🍂", winter: "❄️", moonlake: "🌕",
    };
    const icon = icons[activeTheme.name] || "✨";

    const logoLine = `${icon}  V I B E   P I C N I C  ${icon}`;
    const logoY = Math.floor(h * 0.3);
    const logoColor = noColor ? "" : renderer.bold() + renderer.fgRgb(255, 255, 255);

    const lx = Math.max(0, Math.floor((w - logoLine.length) / 2));
    for (let i = 0; i < logoLine.length && lx + i < w; i++) {
      renderer.set(lx + i, logoY, logoLine[i], logoColor);
    }

    const greeting = message || getGreeting(activeTheme.name);
    if (greeting) {
      const gy = logoY + 2;
      const greetColor = noColor ? "" : renderer.fgRgb(200, 200, 220);
      const gx = Math.max(0, Math.floor((w - greeting.length) / 2));
      for (let i = 0; i < greeting.length && gx + i < w; i++) {
        renderer.set(gx + i, gy, greeting[i], greetColor);
      }
    }

    const blink = Math.floor(tick / 15) % 2 === 0;
    if (blink) {
      const prompt = "Press any key to continue...";
      const px = Math.max(0, Math.floor((w - prompt.length) / 2));
      const py = Math.floor(h * 0.65);
      const promptColor = noColor ? "" : renderer.bold() + renderer.fgRgb(220, 220, 240);
      for (let i = 0; i < prompt.length && px + i < w; i++) {
        renderer.set(px + i, py, prompt[i], promptColor);
      }
    }

    const footer = "vibe-picnic";
    const fx = Math.max(0, Math.floor((w - footer.length) / 2));
    const footerColor = noColor ? "" : renderer.dim() + renderer.fgRgb(100, 100, 120);
    for (let i = 0; i < footer.length && fx + i < w; i++) {
      renderer.set(fx + i, h - 1, footer[i], footerColor);
    }
  }

  function getGreeting(seasonName: string): string {
    const hour = new Date().getHours();
    let timeGreet: string;
    if (hour >= 5 && hour < 12) timeGreet = "Good Morning";
    else if (hour >= 12 && hour < 18) timeGreet = "Good Afternoon";
    else timeGreet = "Good Evening";

    const seasonGreet: Record<string, string> = {
      spring: "🌸 Spring has come",
      summer: "🌧️ Summer rain",
      autumn: "🍂 Autumn breeze",
      winter: "❄️ Winter wonderland",
      moonlake: "🌕 호숫가 달빛",
    };

    return `${timeGreet}  -  ${seasonGreet[seasonName] || ""}`;
  }

  function drawUI(): void {
    const w = renderer.width;
    const h = renderer.height;
    const titleColor = noColor ? "" : renderer.fgRgb(200, 200, 200) + renderer.bold();
    const infoColor = noColor ? "" : renderer.dim() + renderer.fgRgb(140, 140, 140);

    const title = activeTheme.getTitle();
    const tx = Math.max(0, Math.floor((w - title.length) / 2));
    for (let i = 0; i < title.length && tx + i < w; i++) {
      renderer.set(tx + i, 0, title[i], titleColor);
    }

    const info = ` ${system.count()} particles | wind:${wind >= 0 ? "+" : ""}${wind.toFixed(1)} | 1-5:season | arrows:ctrl | q:quit `;
    const ix = Math.max(0, Math.floor((w - info.length) / 2));
    for (let i = 0; i < info.length && ix + i < w; i++) {
      renderer.set(ix + i, h - 1, info[i], infoColor);
    }
  }

  function cleanup(): void {
    renderer.cleanup();
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
    }
    process.stdin.pause();

    if (!splash) {
      const labels: Record<string, string> = {
        spring: "🌸", summer: "🌧️", autumn: "🍂", winter: "❄️", moonlake: "🌕",
      };
      console.log(`\n${labels[activeTheme.name] || "✨"} 안녕히 가세요! - Vibe Picnic\n`);
    }
    process.exit(0);
  }

  process.on("SIGINT", () => { running = false; });
  process.on("SIGTERM", () => { running = false; });

  frame();
}
