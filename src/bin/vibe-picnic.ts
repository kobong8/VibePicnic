#!/usr/bin/env node

import { run, detectSeason, pickRandomTheme, themes } from "../index";
import { loadConfig, saveConfig, getConfigPath, getDefaults, mergeWithDefaults, Config } from "../config";
import { shouldRunSplash, recordSplashRun } from "../schedule";

const args = process.argv.slice(2);
const VALID_THEMES = ["auto", "random", "spring", "summer", "autumn", "winter", "moonlake", "campfire", "fireworks"];
const { version } = require("../../package.json");

if (args.includes("--version") || args.includes("-v")) {
  console.log(`vibe-picnic ${version}`);
  process.exit(0);
}

// Detect language early — default English, --lang ko switches to Korean
const langIdx = args.indexOf("--lang");
const lang = langIdx !== -1 && args[langIdx + 1] === "ko" ? "ko" : "en";

const T = {
  en: {
    configHelp: `
🔧 Vibe Picnic - Config management

Usage:
  vibe-picnic config show              Show current settings
  vibe-picnic config set <key> <value> Change a setting
  vibe-picnic config reset             Reset settings (delete file)
  vibe-picnic config path              Show config file path

Available keys:
  theme     Theme: ${VALID_THEMES.join(", ")}
  density   Particle density (1-50)
  speed     Speed multiplier (0.1-5.0)
  wind      Wind strength (-5.0~5.0)
  ascii     ASCII mode (true/false)
  noColor   Disable colors (true/false)
  noGround  Disable ground accumulation (true/false)
  splash    Splash mode (true/false)
  fireworks Fireworks effect (true/false)
  message   Splash message

Examples:
  vibe-picnic config set theme campfire     Set default theme to campfire
  vibe-picnic config set theme random       Pick a random theme each run
  vibe-picnic config set density 30         Set particle density to 30
  vibe-picnic config set ascii true         Enable ASCII mode
  vibe-picnic config show                   Show current settings
  vibe-picnic config reset                  Reset settings
`,
    configPath: (p: string) => `\n📂 Config file: ${p}\n`,
    configCustomMarker: "  ✏️  = user-defined value, others are defaults\n",
    configReset: (p: string) => `✅ Settings reset. (${p} deleted)`,
    configNoFile: (p: string) => `ℹ️  No config file found. (${p})`,
    configSaved: (k: string, v: string) => `✅ ${k} = ${v}`,
    errUnknownConfig: (sub: string) => `Error: Unknown config command '${sub}'`,
    errUnknownConfigHint: "Run vibe-picnic config --help for usage",
    errSetUsage: "Error: vibe-picnic config set <key> <value>",
    errUnknownKey: (k: string, keys: string) => `Error: Unknown key '${k}'\nAvailable: ${keys}`,
    errScheduleReadonly: "Error: 'schedule' cannot be changed here. (coming soon)",
    errUnknownTheme: (v: string) => `Error: Unknown theme '${v}'\nAvailable: ${VALID_THEMES.join(", ")}`,
    errDensity: "Error: density must be a number between 1 and 50",
    errSpeed: "Error: speed must be a number between 0.1 and 5.0",
    errWind: "Error: wind must be a number between -5.0 and 5.0",
    errBool: (k: string) => `Error: ${k} must be true or false`,
    mainHelp: `
🔥 Vibe Picnic - A CLI animation tool that brings developer vibes to your terminal

Usage:
  vibe-picnic [options]
  vibe-picnic config [show|set|reset|path]

Options:
  --theme <name>      Theme: ${VALID_THEMES.join(", ")} (default: auto)
  --density <n>       Particle density 1-50 (default: 15)
  --speed <n>         Speed multiplier 0.1-5.0 (default: 1.0)
  --wind <n>          Wind strength -5.0~5.0 (default: 0.5)
  --splash            Splash mode (press any key to exit)
  --message <text>    Custom message shown in splash screen
  --ascii             ASCII characters only
  --no-color          Disable colors
  --no-ground         Disable ground accumulation
  --fireworks         Enable fireworks effect
  --lang <en|ko>      Language for help text (default: en)
  -v, --version       Show version
  -h, --help          Show this help

Note: --season is accepted as a legacy alias of --theme.

Config:
  vibe-picnic config show              Show current settings
  vibe-picnic config set <key> <value> Change a setting
  vibe-picnic config reset             Reset settings
  vibe-picnic config path              Show config file path

Controls (normal mode):
  ← →               Adjust wind direction/strength
  ↑ ↓               Adjust particle density
  1-7               Switch theme (1:spring 2:summer 3:autumn 4:winter 5:moonlake 6:campfire 7:fireworks)
  i                 Toggle settings panel (↑↓/kj move, ←→/hl change, s save, q close)
  r                 Reset ground
  q / ESC           Quit

Themes:
  spring     🌸 Cherry blossoms falling
  summer     🌧️  Rain falling
  autumn     🍂 Autumn leaves falling
  winter     ❄️  Snow falling
  moonlake   🌕 Moonlit lakeside
  campfire   🔥 Campfire
  fireworks  🎆 Fireworks festival
  auto       Auto-detect season from current month
  random     Random theme each run (also selectable inside the settings panel)

Examples:
  vibe-picnic                                     Auto-detect season
  vibe-picnic --theme campfire                    Campfire mode
  vibe-picnic --theme random                      Random theme on launch
  vibe-picnic config set theme moonlake           Set default theme to moonlake
  vibe-picnic config show                         Show settings
  vibe-picnic --lang ko --help                    Show help in Korean
`,
    errUnknownThemeMain: (v: string) => `Error: Unknown theme '${v}'. Use: ${VALID_THEMES.join(", ")}`,
  },
  ko: {
    configHelp: `
🔧 Vibe Picnic - 설정 관리

Usage:
  vibe-picnic config show              현재 설정 보기
  vibe-picnic config set <key> <value> 설정 값 변경
  vibe-picnic config reset             설정 초기화 (파일 삭제)
  vibe-picnic config path              설정 파일 경로 출력

설정 가능한 키:
  theme     테마: ${VALID_THEMES.join(", ")}
  density   파티클 밀도 (1-50)
  speed     속도 배율 (0.1-5.0)
  wind      바람 세기 (-5.0~5.0)
  ascii     ASCII 모드 (true/false)
  noColor   색상 비활성화 (true/false)
  noGround  바닥 쌓임 비활성화 (true/false)
  splash    스플래시 모드 (true/false)
  fireworks 폭죽 효과 (true/false)
  message   스플래시 메시지

Examples:
  vibe-picnic config set theme campfire     기본 테마를 모닥불로 변경
  vibe-picnic config set theme random       실행할 때마다 랜덤 테마로 시작
  vibe-picnic config set density 30         파티클 밀도를 30으로 변경
  vibe-picnic config set ascii true         ASCII 모드 활성화
  vibe-picnic config show                   현재 설정 확인
  vibe-picnic config reset                  설정 초기화
`,
    configPath: (p: string) => `\n📂 설정 파일: ${p}\n`,
    configCustomMarker: "  ✏️  = 사용자가 설정한 값, 나머지는 기본값\n",
    configReset: (p: string) => `✅ 설정이 초기화되었습니다. (${p} 삭제됨)`,
    configNoFile: (p: string) => `ℹ️  설정 파일이 없습니다. (${p})`,
    configSaved: (k: string, v: string) => `✅ ${k} = ${v}`,
    errUnknownConfig: (sub: string) => `Error: 알 수 없는 config 명령 '${sub}'`,
    errUnknownConfigHint: "vibe-picnic config --help 로 도움말 확인",
    errSetUsage: "Error: vibe-picnic config set <key> <value>",
    errUnknownKey: (k: string, keys: string) => `Error: 알 수 없는 설정 키 '${k}'\n사용 가능: ${keys}`,
    errScheduleReadonly: "Error: schedule 설정은 현재 변경할 수 없습니다. (추후 지원 예정)",
    errUnknownTheme: (v: string) => `Error: 알 수 없는 테마 '${v}'\n사용 가능: ${VALID_THEMES.join(", ")}`,
    errDensity: "Error: density는 1-50 사이의 숫자",
    errSpeed: "Error: speed는 0.1-5.0 사이의 숫자",
    errWind: "Error: wind는 -5.0~5.0 사이의 숫자",
    errBool: (k: string) => `Error: ${k}는 true 또는 false`,
    mainHelp: `
🔥 Vibe Picnic - 터미널에 개발자 감성을 담은 CLI 애니메이션 도구

Usage:
  vibe-picnic [options]
  vibe-picnic config [show|set|reset|path]

Options:
  --theme <name>      테마 선택: ${VALID_THEMES.join(", ")} (기본: auto)
  --density <n>       파티클 밀도 1-50 (기본: 15)
  --speed <n>         속도 배율 0.1-5.0 (기본: 1.0)
  --wind <n>          바람 세기 -5.0~5.0 (기본: 0.5)
  --splash            스플래시 모드 (아무 키나 누르면 종료)
  --message <text>    스플래시 화면에 표시할 커스텀 메시지
  --ascii             ASCII 문자만 사용
  --no-color          색상 비활성화
  --no-ground         바닥 쌓임 비활성화
  --fireworks         폭죽 효과 활성화
  --lang <en|ko>      도움말 언어 선택 (기본: en)
  -v, --version       버전 정보 출력
  -h, --help          도움말

참고: --season 은 --theme 의 레거시 별칭으로 계속 동작합니다.

Config:
  vibe-picnic config show              현재 설정 보기
  vibe-picnic config set <key> <value> 설정 값 변경
  vibe-picnic config reset             설정 초기화
  vibe-picnic config path              설정 파일 경로

Controls (일반 모드):
  ← →               바람 방향/세기 조절
  ↑ ↓               파티클 밀도 조절
  1-7               테마 전환 (1:봄 2:여름 3:가을 4:겨울 5:달빛호수 6:모닥불 7:폭죽)
  i                 설정 패널 토글 (↑↓/kj 이동, ←→/hl 값 변경, s 저장, q 닫기)
  r                 바닥 리셋
  q / ESC           종료

Themes:
  spring     🌸 벚꽃이 흩날림
  summer     🌧️  비가 내림
  autumn     🍂 낙엽이 떨어짐
  winter     ❄️  눈이 내림
  moonlake   🌕 호숫가 달빛
  campfire   🔥 모닥불
  fireworks  🎆 폭죽 축제
  auto       현재 월에 맞는 계절 자동 선택
  random     실행할 때마다 랜덤 테마 선택 (설정 패널에서도 선택 가능)

Examples:
  vibe-picnic                                     자동 계절 감지
  vibe-picnic --theme campfire                    모닥불
  vibe-picnic --theme random                      실행 시 랜덤 테마
  vibe-picnic config set theme moonlake           기본 테마를 달빛호수로
  vibe-picnic config show                         설정 확인
  vibe-picnic --lang en --help                    영어 도움말 보기
`,
    errUnknownThemeMain: (v: string) => `Error: 알 수 없는 테마 '${v}'. 사용 가능: ${VALID_THEMES.join(", ")}`,
  },
} as const;

const t = T[lang];

// ── vibe-picnic config 서브커맨드 ──
if (args[0] === "config") {
  const sub = args[1];

  if (!sub || sub === "--help") {
    console.log(t.configHelp);
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

    console.log(t.configPath(configPath));

    const keys = Object.keys(defaults) as (keyof Config)[];
    const maxKeyLen = Math.max(...keys.map(k => k.length));

    for (const key of keys) {
      const val = merged[key];
      const isCustom = key in saved;
      const marker = isCustom ? "✏️ " : "   ";
      const padded = key.padEnd(maxKeyLen);
      console.log(`  ${marker}${padded}  ${JSON.stringify(val)}`);
    }

    console.log("\n" + t.configCustomMarker);
    process.exit(0);
  }

  if (sub === "reset") {
    const fs = require("fs");
    const configPath = getConfigPath();
    try {
      fs.unlinkSync(configPath);
      console.log(t.configReset(configPath));
    } catch {
      console.log(t.configNoFile(configPath));
    }
    process.exit(0);
  }

  if (sub === "set") {
    const key = args[2];
    const value = args[3];

    if (!key || value === undefined) {
      console.error(t.errSetUsage);
      process.exit(1);
    }

    const defaults = getDefaults();
    if (!(key in defaults)) {
      console.error(t.errUnknownKey(key, Object.keys(defaults).join(", ")));
      process.exit(1);
    }

    let parsed: string | number | boolean = value;
    const k = key as keyof Config;

    if (k === "schedule") {
      console.error(t.errScheduleReadonly);
      process.exit(1);
    } else if (k === "theme") {
      if (!VALID_THEMES.includes(value)) {
        console.error(t.errUnknownTheme(value));
        process.exit(1);
      }
    } else if (k === "density") {
      parsed = parseInt(value, 10);
      if (isNaN(parsed as number) || (parsed as number) < 1 || (parsed as number) > 50) {
        console.error(t.errDensity);
        process.exit(1);
      }
    } else if (k === "speed") {
      parsed = parseFloat(value);
      if (isNaN(parsed as number) || (parsed as number) < 0.1 || (parsed as number) > 5.0) {
        console.error(t.errSpeed);
        process.exit(1);
      }
    } else if (k === "wind") {
      parsed = parseFloat(value);
      if (isNaN(parsed as number) || (parsed as number) < -5.0 || (parsed as number) > 5.0) {
        console.error(t.errWind);
        process.exit(1);
      }
    } else if (k === "ascii" || k === "noColor" || k === "noGround" || k === "splash" || k === "fireworks") {
      if (value !== "true" && value !== "false") {
        console.error(t.errBool(key));
        process.exit(1);
      }
      parsed = value === "true";
    }

    saveConfig({ [key]: parsed });
    console.log(t.configSaved(key, JSON.stringify(parsed)));
    process.exit(0);
  }

  console.error(t.errUnknownConfig(sub));
  console.error(t.errUnknownConfigHint);
  process.exit(1);
}

// ── help ──
if (args.includes("--help") || args.includes("-h")) {
  console.log(t.mainHelp);
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

// --theme is canonical; --season is accepted as a legacy alias
const themeFlag = args.includes("--theme")
  ? getArg("--theme", defaults.theme)
  : args.includes("--season")
    ? getArg("--season", defaults.theme)
    : defaults.theme;

const options = {
  theme: themeFlag,
  density: args.includes("--density") ? parseInt(getArg("--density", "15"), 10) : defaults.density,
  speed: args.includes("--speed") ? parseFloat(getArg("--speed", "1.0")) : defaults.speed,
  wind: args.includes("--wind") ? parseFloat(getArg("--wind", "0.5")) : defaults.wind,
  ascii: hasFlag("--ascii") || defaults.ascii,
  noColor: hasFlag("--no-color") || defaults.noColor,
  noGround: hasFlag("--no-ground") || defaults.noGround,
  splash: hasFlag("--splash") || defaults.splash,
  message: getArg("--message", defaults.message),
  fireworks: hasFlag("--fireworks") || defaults.fireworks,
  schedule: "always",
};

if (!VALID_THEMES.includes(options.theme)) {
  console.error(t.errUnknownThemeMain(options.theme));
  process.exit(1);
}

if (options.splash) {
  if (!shouldRunSplash(options.schedule)) {
    process.exit(0);
  }
  recordSplashRun();
  run(options);
} else if (options.theme === "auto") {
  const detected = detectSeason();
  const label = themes[detected].label;
  console.log(`${label} (auto-detected)`);
  setTimeout(() => run(options), 800);
} else if (options.theme === "random") {
  console.log("🎲 Random theme...");
  setTimeout(() => run(options), 800);
} else {
  run(options);
}
