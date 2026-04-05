#!/usr/bin/env node
"use strict";

const { run, detectSeason, themes } = require("../src/index");

const args = process.argv.slice(2);

// --help
if (args.includes("--help") || args.includes("-h")) {
  console.log(`
🌸 BeforeSunrise - 터미널에 계절이 내리는 CLI 애니메이션

Usage:
  beforesunrise [options]
  npx beforesunrise [options]

Options:
  --season <name>   계절 선택: spring, summer, autumn, winter, auto (기본: auto)
  --density <n>     파티클 밀도 1-50 (기본: 15)
  --speed <n>       속도 배율 0.1-5.0 (기본: 1.0)
  --wind <n>        바람 세기 -5.0~5.0 (기본: 0.5)
  --ascii           ASCII 문자만 사용
  --no-color        색상 비활성화
  --no-ground       바닥 쌓임 비활성화
  -h, --help        도움말

Controls:
  ← →               바람 방향/세기 조절
  ↑ ↓               파티클 밀도 조절
  1-4               계절 전환 (1:봄 2:여름 3:가을 4:겨울)
  r                 바닥 리셋
  q / ESC           종료

Seasons:
  spring  🌸 벚꽃이 흩날림
  summer  🌧️  비가 내림
  autumn  🍂 낙엽이 떨어짐
  winter  ❄️  눈이 내림
  auto    현재 월에 맞는 계절 자동 선택

Examples:
  beforesunrise                          자동 계절 감지
  beforesunrise --season spring          봄 벚꽃
  beforesunrise --season winter --wind 0 고요한 겨울 눈
  beforesunrise --density 30 --speed 2   빠르고 화려하게
  beforesunrise --ascii --no-color       최소 환경용
`);
  process.exit(0);
}

// 인자 파싱
function getArg(name, defaultVal) {
  const idx = args.indexOf(name);
  if (idx === -1) return defaultVal;
  return args[idx + 1] || defaultVal;
}

function hasFlag(name) {
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
};

// 유효성 검사
const validSeasons = ["auto", "spring", "summer", "autumn", "winter"];
if (!validSeasons.includes(options.season)) {
  console.error(`Error: Unknown season '${options.season}'. Use: ${validSeasons.join(", ")}`);
  process.exit(1);
}

// 자동 계절 알림
if (options.season === "auto") {
  const detected = detectSeason();
  const label = themes[detected].label;
  console.log(`${label} (auto-detected)`);
  // 잠깐 보여주고 시작
  setTimeout(() => run(options), 800);
} else {
  run(options);
}
