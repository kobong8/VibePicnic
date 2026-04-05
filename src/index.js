"use strict";

const renderer = require("./renderer");
const { ParticleSystem } = require("./particle");

const themes = {
  spring: require("./themes/spring"),
  summer: require("./themes/summer"),
  autumn: require("./themes/autumn"),
  winter: require("./themes/winter"),
};

/**
 * 현재 월 기반으로 계절 자동 감지
 */
function detectSeason() {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

function run(options) {
  const {
    season = "auto",
    density = 15,
    speed = 1.0,
    wind: initWind = 0.5,
    ascii = false,
    noColor = false,
    noGround = false,
  } = options;

  const themeName = season === "auto" ? detectSeason() : season;
  const theme = themes[themeName];
  if (!theme) {
    console.error(`Unknown season: ${season}. Use: spring, summer, autumn, winter`);
    process.exit(1);
  }

  const system = new ParticleSystem();
  const groundMap = {};
  let wind = initWind;
  let currentDensity = density;
  let tick = 0;
  let running = true;

  // 터미널 raw 모드 설정
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }
  process.stdin.resume();
  process.stdin.setEncoding("utf8");

  renderer.init();

  // 키 입력 처리
  process.stdin.on("data", (key) => {
    if (key === "q" || key === "Q" || key === "\x1b" || key === "\x03") {
      running = false;
      return;
    }
    // 화살표 키
    if (key === "\x1b[D") wind = Math.max(-5, wind - 0.3);       // ←
    if (key === "\x1b[C") wind = Math.min(5, wind + 0.3);        // →
    if (key === "\x1b[A") currentDensity = Math.min(50, currentDensity + 2); // ↑
    if (key === "\x1b[B") currentDensity = Math.max(1, currentDensity - 2);  // ↓
    if (key === "r" || key === "R") {
      for (const k in groundMap) delete groundMap[k];
    }
    // 계절 전환
    if (key === "1") switchTheme("spring");
    if (key === "2") switchTheme("summer");
    if (key === "3") switchTheme("autumn");
    if (key === "4") switchTheme("winter");
  });

  let activeTheme = theme;

  function switchTheme(name) {
    activeTheme = themes[name];
    system.particles = [];
    for (const k in groundMap) delete groundMap[k];
  }

  // 터미널 크기 변경 감지
  process.stdout.on("resize", () => {
    renderer.updateSize();
    for (const k in groundMap) delete groundMap[k];
  });

  // 초기 파티클 생성
  for (let i = 0; i < currentDensity; i++) {
    const p = activeTheme.createParticle(
      renderer.width,
      Math.random() * renderer.height,
      ascii
    );
    system.add(p);
  }

  function frame() {
    if (!running) {
      cleanup();
      return;
    }

    renderer.clear();

    // 새 파티클 생성
    const spawnCount = activeTheme.spawnRate(currentDensity);
    for (let i = 0; i < spawnCount; i++) {
      if (system.count() < currentDensity * 4) {
        system.add(activeTheme.createParticle(renderer.width, -1, ascii));
      }
    }

    // 파티클 업데이트
    const adjustedWind = wind * speed;
    const landed = system.update(tick, adjustedWind, renderer.width, renderer.height);

    // 착지 처리
    if (!noGround) {
      for (const p of landed) {
        const ix = Math.floor(p.x);
        if (ix >= 0 && ix < renderer.width) {
          groundMap[ix] = (groundMap[ix] || 0) + 1;
        }
      }
    }

    // 착지 이벤트 (비의 스플래시 등)
    if (activeTheme.onLanded) {
      activeTheme.onLanded(landed, system, renderer.height);
    }

    // 파티클 렌더링
    for (const p of system.particles) {
      let color = noColor ? "" : p.color;
      if (!noColor && p.bold) color = renderer.bold() + color;
      if (!noColor && p.dim) color = renderer.dim() + color;
      renderer.set(p.x, p.y, p.char, color);
    }

    // 바닥 렌더링
    if (!noGround) {
      activeTheme.renderGround(groundMap, renderer.height, renderer.width, ascii);
    }

    // UI 렌더링
    drawUI();

    renderer.flush();
    tick++;

    const interval = Math.floor(1000 / (activeTheme.fps * speed));
    setTimeout(frame, interval);
  }

  function drawUI() {
    const w = renderer.width;
    const h = renderer.height;
    const titleColor = noColor ? "" : renderer.fgRgb(200, 200, 200) + renderer.bold();
    const infoColor = noColor ? "" : renderer.dim() + renderer.fgRgb(140, 140, 140);

    // 제목
    const title = activeTheme.getTitle();
    const tx = Math.max(0, Math.floor((w - title.length) / 2));
    for (let i = 0; i < title.length && tx + i < w; i++) {
      renderer.set(tx + i, 0, title[i], titleColor);
    }

    // 하단 정보
    const info = ` ${system.count()} particles | wind:${wind >= 0 ? "+" : ""}${wind.toFixed(1)} | 1-4:season | arrows:ctrl | q:quit `;
    const ix = Math.max(0, Math.floor((w - info.length) / 2));
    for (let i = 0; i < info.length && ix + i < w; i++) {
      renderer.set(ix + i, h - 1, info[i], infoColor);
    }
  }

  function cleanup() {
    renderer.cleanup();
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
    }
    process.stdin.pause();

    const labels = { spring: "🌸", summer: "🌧️", autumn: "🍂", winter: "❄️" };
    console.log(`\n${labels[activeTheme.name] || "✨"} 안녕히 가세요! - Vibe Picnic\n`);
    process.exit(0);
  }

  // 시그널 처리
  process.on("SIGINT", () => { running = false; });
  process.on("SIGTERM", () => { running = false; });

  // 시작!
  frame();
}

module.exports = { run, detectSeason, themes };
