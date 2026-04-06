#!/usr/bin/env node

import { run, detectSeason, themes } from "../index";
import { loadConfig, saveConfig, getConfigPath, getDefaults, mergeWithDefaults, Config } from "../config";

const args = process.argv.slice(2);
const VALID_SEASONS = ["auto", "spring", "summer", "autumn", "winter", "moonlake", "fireplace"];

// ── vibe-picnic config 서브커맨드 ──
if (args[0] === "config") {
  const sub = args[1];

  if (!sub || sub === "--help") {
    console.log(`
🔧 Vibe Picnic - 설정 관리

Usage:
  vibe-picnic config show              현재 설정 보기
  vibe-picnic config set <key> <value> 설정 값 변경
  vibe-picnic config reset             설정 초기화 (파일 삭제)
  vibe-picnic config path              설정 파일 경로 출력

설정 가능한 키:
  season    테마: ${VALID_SEASONS.join(", ")}
  density   파티클 밀도 (1-50)
  speed     속도 배율 (0.1-5.0)
  wind      바람 세기 (-5.0~5.0)
  ascii     ASCII 모드 (true/false)
  noColor   색상 비활성화 (true/false)
  noGround  바닥 쌓임 비활성화 (true/false)
  splash    스플래시 모드 (true/false)
  message   스플래시 메시지

Examples:
  vibe-picnic config set season fireplace   기본 테마를 벽난로로 변경
  vibe-picnic config set density 30         파티클 밀도를 30으로 변경
  vibe-picnic config set ascii true         ASCII 모드 활성화
  vibe-picnic config show                   현재 설정 확인
  vibe-picnic config reset                  설정 초기화
`);
    process.exit(0);
  }

  if (sub === "path") {
    console.log(getConfigPath());
    process.exit(0);
  }

  if (sub === "show") {
    const saved = loadConfig();
    const defaults = getDefaults();
    const merged = mergeWithDefaults(saved);
    const configPath = getConfigPath();

    console.log(`\n📂 설정 파일: ${configPath}\n`);

    const keys = Object.keys(defaults) as (keyof Config)[];
    const maxKeyLen = Math.max(...keys.map(k => k.length));

    for (const key of keys) {
      const val = merged[key];
      const isCustom = key in saved;
      const marker = isCustom ? "✏️ " : "   ";
      const padded = key.padEnd(maxKeyLen);
      console.log(`  ${marker}${padded}  ${JSON.stringify(val)}`);
    }

    console.log(`\n  ✏️  = 사용자가 설정한 값, 나머지는 기본값\n`);
    process.exit(0);
  }

  if (sub === "reset") {
    const fs = require("fs");
    const configPath = getConfigPath();
    try {
      fs.unlinkSync(configPath);
      console.log(`✅ 설정이 초기화되었습니다. (${configPath} 삭제됨)`);
    } catch {
      console.log(`ℹ️  설정 파일이 없습니다. (${configPath})`);
    }
    process.exit(0);
  }

  if (sub === "set") {
    const key = args[2];
    const value = args[3];

    if (!key || value === undefined) {
      console.error("Error: vibe-picnic config set <key> <value>");
      process.exit(1);
    }

    const defaults = getDefaults();
    if (!(key in defaults)) {
      console.error(`Error: 알 수 없는 설정 키 '${key}'`);
      console.error(`사용 가능: ${Object.keys(defaults).join(", ")}`);
      process.exit(1);
    }

    // 값 파싱 및 검증
    let parsed: string | number | boolean = value;
    const k = key as keyof Config;

    if (k === "season") {
      if (!VALID_SEASONS.includes(value)) {
        console.error(`Error: 알 수 없는 테마 '${value}'`);
        console.error(`사용 가능: ${VALID_SEASONS.join(", ")}`);
        process.exit(1);
      }
    } else if (k === "density") {
      parsed = parseInt(value, 10);
      if (isNaN(parsed as number) || (parsed as number) < 1 || (parsed as number) > 50) {
        console.error("Error: density는 1-50 사이의 숫자");
        process.exit(1);
      }
    } else if (k === "speed") {
      parsed = parseFloat(value);
      if (isNaN(parsed as number) || (parsed as number) < 0.1 || (parsed as number) > 5.0) {
        console.error("Error: speed는 0.1-5.0 사이의 숫자");
        process.exit(1);
      }
    } else if (k === "wind") {
      parsed = parseFloat(value);
      if (isNaN(parsed as number) || (parsed as number) < -5.0 || (parsed as number) > 5.0) {
        console.error("Error: wind는 -5.0~5.0 사이의 숫자");
        process.exit(1);
      }
    } else if (k === "ascii" || k === "noColor" || k === "noGround" || k === "splash") {
      if (value !== "true" && value !== "false") {
        console.error(`Error: ${key}는 true 또는 false`);
        process.exit(1);
      }
      parsed = value === "true";
    }
    // message는 문자열 그대로

    saveConfig({ [key]: parsed });
    console.log(`✅ ${key} = ${JSON.stringify(parsed)}`);
    process.exit(0);
  }

  console.error(`Error: 알 수 없는 config 명령 '${sub}'`);
  console.error("vibe-picnic config --help 로 도움말 확인");
  process.exit(1);
}

// ── help ──
if (args.includes("--help") || args.includes("-h")) {
  console.log(`
🌸 Vibe Picnic - 터미널에 계절이 내리는 CLI 애니메이션

Usage:
  vibe-picnic [options]
  vibe-picnic config [show|set|reset|path]

Options:
  --season <name>     테마 선택: ${VALID_SEASONS.join(", ")} (기본: auto)
  --density <n>       파티클 밀도 1-50 (기본: 15)
  --speed <n>         속도 배율 0.1-5.0 (기본: 1.0)
  --wind <n>          바람 세기 -5.0~5.0 (기본: 0.5)
  --splash            스플래시 모드 (아무 키나 누르면 종료)
  --message <text>    스플래시 화면에 표시할 커스텀 메시지
  --ascii             ASCII 문자만 사용
  --no-color          색상 비활성화
  --no-ground         바닥 쌓임 비활성화
  -h, --help          도움말

Config:
  vibe-picnic config show              현재 설정 보기
  vibe-picnic config set <key> <value> 설정 값 변경
  vibe-picnic config reset             설정 초기화
  vibe-picnic config path              설정 파일 경로

Controls (일반 모드):
  ← →               바람 방향/세기 조절
  ↑ ↓               파티클 밀도 조절
  1-6               테마 전환 (1:봄 2:여름 3:가을 4:겨울 5:달빛호수 6:벽난로)
  r                 바닥 리셋
  q / ESC           종료

Themes:
  spring     🌸 벚꽃이 흩날림
  summer     🌧️  비가 내림
  autumn     🍂 낙엽이 떨어짐
  winter     ❄️  눈이 내림
  moonlake   🌕 호숫가 달빛
  fireplace  🔥 벽난로
  auto       현재 월에 맞는 계절 자동 선택

Examples:
  vibe-picnic                                 자동 계절 감지
  vibe-picnic --season fireplace              벽난로
  vibe-picnic config set season moonlake      기본 테마를 달빛호수로
  vibe-picnic config show                     설정 확인
`);
  process.exit(0);
}

// ── 설정 로드 & CLI 인자 병합 ──
const saved = loadConfig();
const defaults = mergeWithDefaults(saved);

function getArg(name: string, defaultVal: string): string {
  const idx = args.indexOf(name);
  if (idx === -1) return defaultVal;
  return args[idx + 1] || defaultVal;
}

function hasFlag(name: string): boolean {
  return args.includes(name);
}

// CLI 인자가 있으면 우선, 없으면 설정 파일 값, 없으면 기본값
const options = {
  season: getArg("--season", defaults.season),
  density: args.includes("--density") ? parseInt(getArg("--density", "15"), 10) : defaults.density,
  speed: args.includes("--speed") ? parseFloat(getArg("--speed", "1.0")) : defaults.speed,
  wind: args.includes("--wind") ? parseFloat(getArg("--wind", "0.5")) : defaults.wind,
  ascii: hasFlag("--ascii") || defaults.ascii,
  noColor: hasFlag("--no-color") || defaults.noColor,
  noGround: hasFlag("--no-ground") || defaults.noGround,
  splash: hasFlag("--splash") || defaults.splash,
  message: getArg("--message", defaults.message),
};

if (!VALID_SEASONS.includes(options.season)) {
  console.error(`Error: Unknown season '${options.season}'. Use: ${VALID_SEASONS.join(", ")}`);
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
