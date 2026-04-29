import renderer from "./renderer";
import { ParticleSystem } from "./particle";
import { Theme, GroundMap } from "./themes/types";
import { FireworkManager } from "./fireworks";
import { saveConfig, getDefaults } from "./config";
import spring from "./themes/spring";
import summer from "./themes/summer";
import autumn from "./themes/autumn";
import winter from "./themes/winter";
import moonlake from "./themes/moonlake";
import campfire from "./themes/campfire";
import fireworksTheme from "./themes/fireworks";

export const themes: Record<string, Theme> = {
  spring,
  summer,
  autumn,
  winter,
  moonlake,
  campfire,
  fireworks: fireworksTheme,
};

export interface RunOptions {
  theme?: string;
  density?: number;
  speed?: number;
  wind?: number;
  ascii?: boolean;
  noColor?: boolean;
  noGround?: boolean;
  splash?: boolean;
  message?: string;
  fireworks?: boolean;
}

export function detectSeason(): string {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

export function pickRandomTheme(): string {
  const names = Object.keys(themes);
  return names[Math.floor(Math.random() * names.length)];
}

export function run(options: RunOptions): void {
  const {
    theme: themeOpt = "auto",
    density = 15,
    wind: initWind = 0.5,
    noColor = false,
    splash = false,
    message = "",
  } = options;
  let speed = options.speed ?? 1.0;
  let ascii = options.ascii ?? false;
  let noGround = options.noGround ?? false;
  let selectedTheme = themeOpt;

  const themeName =
    themeOpt === "auto"
      ? detectSeason()
      : themeOpt === "random"
        ? pickRandomTheme()
        : themeOpt;
  const theme = themes[themeName];
  if (!theme) {
    console.error(
      `Unknown theme: ${themeOpt}. Use: spring, summer, autumn, winter, moonlake, campfire, fireworks, auto, random`,
    );
    process.exit(1);
  }

  const system = new ParticleSystem();
  const groundMap: GroundMap = {};
  let wind = initWind;
  let currentDensity = density;
  let tick = 0;
  let physicsAccum = 0;
  let running = true;
  const startTime = Date.now();

  const panelItems = ["theme", "density", "wind", "speed", "ascii", "ground"] as const;
  type PanelItem = (typeof panelItems)[number];
  const themeOrder = ["spring", "summer", "autumn", "winter", "moonlake", "campfire", "fireworks", "random"];
  let panelOpen = false;
  let panelCursor = 0;

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

    if (panelOpen) {
      if (key === "\x03") {
        running = false;
        return;
      }
      if (key === "i" || key === "I" || key === "q" || key === "Q" || key === "\x1b") {
        panelOpen = false;
        return;
      }
      if (key === "s" || key === "S") {
        saveConfig({
          theme: selectedTheme === "random" ? "random" : activeTheme.name,
          density: currentDensity,
          wind: Math.round(wind * 10) / 10,
          speed: Math.round(speed * 10) / 10,
          ascii,
          noGround,
        });
        panelOpen = false;
        return;
      }
      if (key === "r" || key === "R") {
        const defaults = getDefaults();
        currentDensity = defaults.density;
        wind = defaults.wind;
        speed = defaults.speed;
        ascii = defaults.ascii;
        noGround = defaults.noGround;
        return;
      }
      if (key === "\x1b[A") panelCursor = (panelCursor - 1 + panelItems.length) % panelItems.length;
      if (key === "\x1b[B") panelCursor = (panelCursor + 1) % panelItems.length;
      if (key === "\x1b[D") adjustPanelItem(panelItems[panelCursor], -1);
      if (key === "\x1b[C") adjustPanelItem(panelItems[panelCursor], +1);
      return;
    }

    if (key === "q" || key === "Q" || key === "\x1b" || key === "\x03") {
      running = false;
      return;
    }
    if (key === "i" || key === "I") {
      panelOpen = true;
      panelCursor = 0;
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
    if (key === "6") switchTheme("campfire");
    if (key === "7") switchTheme("fireworks");
  });

  function adjustPanelItem(item: PanelItem, delta: number): void {
    if (item === "theme") {
      const currentValue = selectedTheme === "random" ? "random" : activeTheme.name;
      const startIdx = themeOrder.indexOf(currentValue);
      const idx = startIdx === -1 ? 0 : startIdx;
      const next = (idx + delta + themeOrder.length) % themeOrder.length;
      const nextValue = themeOrder[next];
      if (nextValue === "random") {
        selectedTheme = "random";
        switchTheme(pickRandomTheme());
      } else {
        selectedTheme = nextValue;
        switchTheme(nextValue);
      }
    } else if (item === "density") {
      currentDensity = Math.max(1, Math.min(50, currentDensity + delta));
    } else if (item === "wind") {
      wind = Math.max(-5, Math.min(5, wind + delta * 0.3));
    } else if (item === "speed") {
      speed = Math.max(0.1, Math.min(5, speed + delta * 0.1));
    } else if (item === "ascii") {
      ascii = !ascii;
    } else if (item === "ground") {
      noGround = !noGround;
    }
  }

  function getPanelValue(item: PanelItem): string {
    if (item === "theme") return selectedTheme === "random" ? "random" : activeTheme.name;
    if (item === "density") return String(currentDensity);
    if (item === "wind") return (wind >= 0 ? "+" : "") + wind.toFixed(1);
    if (item === "speed") return speed.toFixed(1);
    if (item === "ascii") return ascii ? "on" : "off";
    if (item === "ground") return noGround ? "off" : "on";
    return "";
  }

  let activeTheme = theme;

  function switchTheme(name: string): void {
    activeTheme = themes[name];
    system.particles = [];
    for (const k in groundMap) delete groundMap[k];
    for (let i = 0; i < currentDensity; i++) {
      const p = activeTheme.createParticle(
        renderer.width,
        Math.random() * renderer.height,
        ascii,
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
      ascii,
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
      activeTheme.renderBackground(
        tick,
        renderer.width,
        renderer.height,
        ascii,
      );
    }

    // Render at theme.fps; scale physics by `speed` so UI (settings panel)
    // stays responsive regardless of the animation speed setting.
    physicsAccum += speed;
    const maxStepsPerFrame = 8;
    let steps = 0;
    const getGroundY = noGround
      ? undefined
      : (x: number): number => {
          const dh = activeTheme.groundDisplayH(groundMap[x] || 0);
          return dh > 0 ? renderer.height - 1 - dh : renderer.height - 1;
        };
    while (physicsAccum >= 1 && steps < maxStepsPerFrame) {
      physicsAccum -= 1;
      steps++;

      const spawnCount = activeTheme.spawnRate(currentDensity);
      for (let i = 0; i < spawnCount; i++) {
        if (system.count() < currentDensity * 4) {
          system.add(activeTheme.createParticle(renderer.width, -1, ascii));
        }
      }

      const landed = system.update(
        tick,
        wind,
        renderer.width,
        renderer.height,
        getGroundY,
      );

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

      tick++;
    }
    if (physicsAccum > maxStepsPerFrame) physicsAccum = 0;

    for (const p of system.particles) {
      let color = noColor ? "" : p.color;
      if (!noColor && p.bold) color = renderer.bold() + color;
      if (!noColor && p.dim) color = renderer.dim() + color;
      renderer.set(p.x, p.y, p.char, color);
    }

    if (!noGround) {
      activeTheme.renderGround(
        groundMap,
        renderer.height,
        renderer.width,
        ascii,
      );
    }

    if (activeTheme.renderForeground) {
      activeTheme.renderForeground(
        tick,
        renderer.width,
        renderer.height,
        ascii,
      );
    }

    if (splash) {
      drawSplashUI();
    } else {
      drawUI();
      if (panelOpen) drawSettingsPanel();
    }

    renderer.flush();

    const interval = Math.floor(1000 / activeTheme.fps);
    setTimeout(frame, interval);
  }

  function drawSplashUI(): void {
    const w = renderer.width;
    const h = renderer.height;

    const icons: Record<string, string> = {
      spring: "🌸",
      summer: "🌧️",
      autumn: "🍂",
      winter: "❄️",
      moonlake: "🌕",
      campfire: "🔥",
      fireworks: "🎆",
    };
    const icon = icons[activeTheme.name] || "✨";

    const logoLine = `${icon}  V I B E   P I C N I C  ${icon}`;
    const logoY = Math.floor(h * 0.3);
    const logoColor = noColor
      ? ""
      : renderer.bold() + renderer.fgRgb(255, 255, 255);

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

    const prompt = "Press any key to continue...";
    const px = Math.max(0, w - prompt.length - 2);
    const py = h - 1;

    // Clear the line for the prompt to prevent background artifacts
    for (let i = 0; i < prompt.length && px + i < w; i++) {
      renderer.set(px + i, py, " ", "");
    }

    const blink = Math.floor(tick / 15) % 2 === 0;
    if (blink) {
      const promptColor = noColor
        ? ""
        : renderer.bold() + renderer.fgRgb(220, 220, 240);
      for (let i = 0; i < prompt.length && px + i < w; i++) {
        renderer.set(px + i, py, prompt[i], promptColor);
      }
    }

    // fotter 미사용
    // const footer = "vibe-picnic";
    // const fx = Math.max(0, Math.floor((w - footer.length) / 2));
    // const footerColor = noColor ? "" : renderer.dim() + renderer.fgRgb(100, 100, 120);
    // for (let i = 0; i < footer.length && fx + i < w; i++) {
    //   renderer.set(fx + i, h - 1, footer[i], footerColor);
    // }
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
      moonlake: "🌕 Full Moon, Full Heart",
      campfire: "🔥 Cozy moments by the fire",
      fireworks: "🎆 Fireworks Night",
    };

    return `${timeGreet}  -  ${seasonGreet[seasonName] || ""}`;
  }

  function drawUI(): void {
    if (panelOpen) return;

    const w = renderer.width;
    const h = renderer.height;
    const elapsed = Date.now() - startTime;
    const fadeStart = 5000;
    const fadeEnd = 10000;

    if (elapsed >= fadeEnd) return;

    let alpha = 1;
    if (elapsed >= fadeStart) {
      alpha = 1 - (elapsed - fadeStart) / (fadeEnd - fadeStart);
      const blinkOn = Math.floor(elapsed / 400) % 2 === 0;
      if (!blinkOn) return;
    }

    const brightness = Math.round(140 * alpha);
    const hintColor = noColor ? "" : renderer.fgRgb(brightness, brightness, brightness);

    const hint = " i:settings  q:quit ";
    const hx = Math.max(0, w - hint.length - 1);
    for (let i = 0; i < hint.length && hx + i < w; i++) {
      renderer.set(hx + i, h - 1, hint[i], hintColor);
    }
  }

  function drawSettingsPanel(): void {
    const w = renderer.width;
    const h = renderer.height;
    const panelWidth = 26;
    const panelHeight = 12;
    if (w < panelWidth + 2 || h < panelHeight + 2) return;

    const x0 = Math.max(0, w - panelWidth - 2);
    const y0 = 1;

    const fg = noColor ? "" : renderer.fgRgb(220, 220, 220);
    const dim = noColor ? "" : renderer.dim() + renderer.fgRgb(160, 160, 160);
    const cursorColor = noColor ? "" : renderer.bold() + renderer.fgRgb(255, 220, 100);

    function drawLine(yi: number, text: string, color: string): void {
      const padded = text.length >= panelWidth ? text.slice(0, panelWidth) : text + " ".repeat(panelWidth - text.length);
      for (let i = 0; i < panelWidth; i++) {
        renderer.set(x0 + i, yi, padded[i] || " ", color);
      }
    }

    const titlePrefix = "─ Settings ";
    drawLine(y0, titlePrefix + "─".repeat(Math.max(0, panelWidth - titlePrefix.length)), dim);

    const labels: Record<PanelItem, string> = {
      theme: "Theme:",
      density: "Density:",
      wind: "Wind:",
      speed: "Speed:",
      ascii: "ASCII:",
      ground: "Ground:",
    };

    for (let i = 0; i < panelItems.length; i++) {
      const item = panelItems[i];
      const isCursor = i === panelCursor;
      const cursorChar = isCursor ? "▶" : " ";
      const text = ` ${cursorChar} ${labels[item].padEnd(10)}${getPanelValue(item)}`;
      drawLine(y0 + 1 + i, text, isCursor ? cursorColor : fg);
    }

    drawLine(y0 + 1 + panelItems.length, "", fg);
    drawLine(y0 + 2 + panelItems.length, `   Particles: ${system.count()}`, dim);
    drawLine(y0 + 3 + panelItems.length, " ↑↓ move  ←→ change", dim);
    drawLine(y0 + 4 + panelItems.length, " s save  r reset  q close", dim);
    drawLine(y0 + 5 + panelItems.length, "─".repeat(panelWidth), dim);
  }

  function cleanup(): void {
    renderer.cleanup();
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
    }
    process.stdin.pause();

    if (!splash) {
      const labels: Record<string, string> = {
        spring: "🌸",
        summer: "🌧️",
        autumn: "🍂",
        winter: "❄️",
        moonlake: "🌕",
        campfire: "🔥",
        fireworks: "🎆",
      };
      console.log(
        `\n${labels[activeTheme.name] || "✨"} Goodbye! - Vibe Picnic\n`,
      );
    }
    process.exit(0);
  }

  process.on("SIGINT", () => {
    running = false;
  });
  process.on("SIGTERM", () => {
    running = false;
  });

  frame();
}
