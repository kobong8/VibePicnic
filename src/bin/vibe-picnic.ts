#!/usr/bin/env node

import { run, detectSeason, themes } from "../index";

const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  console.log(`
🌸 Vibe Picnic - 터미널에 계절이 내리는 CLI 애니메이션

Usage:
  vibe-picnic [options]
  npx vibe-picnic [options]

Options:
  --season <name>     계절 선택: spring, summer, autumn, winter, moonlake, fireplace, auto (기본: auto)
  --density <n>       파티클 밀도 1-50 (기본: 15)
  --speed <n>         속도 배율 0.1-5.0 (기본: 1.0)
  --wind <n>          바람 세기 -5.0~5.0 (기본: 0.5)
  --splash            스플래시 모드 (아무 키나 누르면 종료)
  --message <text>    스플래시 화면에 표시할 커스텀 메시지
  --ascii             ASCII 문자만 사용
  --no-color          색상 비활성화
  --no-ground         바닥 쌓임 비활성화
  -h, --help          도움말

Controls (일반 모드):
  ← →               바람 방향/세기 조절
  ↑ ↓               파티클 밀도 조절
  1-6               계절 전환 (1:봄 2:여름 3:가을 4:겨울 5:달빛호수 6:벽난로)
  r                 바닥 리셋
  q / ESC           종료

Controls (스플래시 모드):
  아무 키            종료 → 터미널 시작

Seasons:
  spring  🌸 벚꽃이 흩날림
  summer  🌧️  비가 내림
  autumn  🍂 낙엽이 떨어짐
  winter  ❄️  눈이 내림
  moonlake   🌕 호숫가 달빛
  fireplace  🔥 벽난로
  auto       현재 월에 맞는 계절 자동 선택

Examples:
  vibe-picnic                            자동 계절 감지
  vibe-picnic --splash                   터미널 시작 스플래시
  vibe-picnic --splash --message "Hello" 커스텀 메시지 스플래시
  vibe-picnic --season spring            봄 벚꽃
  vibe-picnic --season winter --wind 0   고요한 겨울 눈
  vibe-picnic --density 30 --speed 2     빠르고 화려하게

Shell Setup (터미널 시작 시 자동 실행):
  # Bash (~/.bashrc)  |  Zsh (~/.zshrc)
  vibe-picnic --splash

  # PowerShell ($PROFILE)
  vibe-picnic --splash

  # Fish (~/.config/fish/config.fish)
  vibe-picnic --splash
`);
  process.exit(0);
}

function getArg(name: string, defaultVal: string): string {
  const idx = args.indexOf(name);
  if (idx === -1) return defaultVal;
  return args[idx + 1] || defaultVal;
}

function hasFlag(name: string): boolean {
  return args.includes(name);
}

const options = {
  season: getArg("--season", "auto"),
  density: parseInt(getArg("--density", "15"), 10),
  speed: parseFloat(getArg("--speed", "1.0")),
  wind: parseFloat(getArg("--wind", "0.5")),
  ascii: hasFlag("--ascii"),
  noColor: hasFlag("--no-color"),
  noGround: hasFlag("--no-ground"),
  splash: hasFlag("--splash"),
  message: getArg("--message", ""),
};

const validSeasons = ["auto", "spring", "summer", "autumn", "winter", "moonlake", "fireplace"];
if (!validSeasons.includes(options.season)) {
  console.error(`Error: Unknown season '${options.season}'. Use: ${validSeasons.join(", ")}`);
  process.exit(1);
}

if (options.splash) {
  run(options);
} else if (options.season === "auto") {
  const detected = detectSeason();
  const label = themes[detected].label;
  console.log(`${label} (auto-detected)`);
  setTimeout(() => run(options), 800);
} else {
  run(options);
}
