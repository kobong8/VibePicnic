import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { execSync } from "child_process";

const SCHEDULE_PATH = path.join(os.homedir(), ".vibe-picnic-schedule.json");

interface ScheduleData {
  lastRun: number; // Unix timestamp in ms
  lastBootSignature?: string; // 부팅 세션 식별자 (boot 스케줄에서 사용)
}

function parseWmicBootTime(raw: string): number {
  const match = raw.match(/LastBootUpTime=(\d{14})(?:\.(\d{6}))?([+-]\d{3})?/);
  if (!match) return 0;

  const [, base, micros = "0", offsetMinutesRaw] = match;
  const year = parseInt(base.slice(0, 4), 10);
  const month = parseInt(base.slice(4, 6), 10) - 1;
  const day = parseInt(base.slice(6, 8), 10);
  const hour = parseInt(base.slice(8, 10), 10);
  const minute = parseInt(base.slice(10, 12), 10);
  const second = parseInt(base.slice(12, 14), 10);
  const millisecond = Math.floor(parseInt(micros, 10) / 1000);
  const utcGuess = Date.UTC(year, month, day, hour, minute, second, millisecond);

  if (!offsetMinutesRaw) {
    return new Date(year, month, day, hour, minute, second, millisecond).getTime();
  }

  const offsetMinutes = parseInt(offsetMinutesRaw, 10);
  return utcGuess - offsetMinutes * 60 * 1000;
}

function loadScheduleData(): ScheduleData {
  try {
    if (fs.existsSync(SCHEDULE_PATH)) {
      const raw = fs.readFileSync(SCHEDULE_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return { lastRun: 0 };
}

function saveScheduleData(data: ScheduleData): void {
  try {
    fs.writeFileSync(SCHEDULE_PATH, JSON.stringify(data, null, 2) + "\n", "utf-8");
  } catch {
    // ignore write errors
  }
}

function getBootTime(): number {
  try {
    if (process.platform === "linux") {
      const uptime = parseFloat(fs.readFileSync("/proc/uptime", "utf-8").split(" ")[0]);
      return Date.now() - uptime * 1000;
    } else if (process.platform === "darwin") {
      const output = execSync("sysctl -n kern.boottime", { encoding: "utf-8" });
      // Output format: { sec = 1234567890, usec = 123456 }
      const match = output.match(/sec\s*=\s*(\d+)/);
      if (match) {
        return parseInt(match[1], 10) * 1000;
      }
    } else if (process.platform === "win32") {
      try {
        const output = execSync("wmic os get LastBootUpTime /value", {
          encoding: "utf-8",
          stdio: ["ignore", "pipe", "ignore"],
          windowsHide: true,
        });
        const bootTime = parseWmicBootTime(output);
        if (bootTime > 0) {
          return bootTime;
        }
      } catch {
        // WMIC is deprecated and missing on some Windows installs.
      }

      const output = execSync(
        'powershell -NoProfile -Command "(Get-CimInstance Win32_OperatingSystem).LastBootUpTime.ToUniversalTime().ToString(\'o\')"',
        {
          encoding: "utf-8",
          stdio: ["ignore", "pipe", "ignore"],
          windowsHide: true,
        }
      ).trim();
      let bootTime = Date.parse(output);
      if (!Number.isNaN(bootTime)) {
        return bootTime;
      }

      const legacyOutput = execSync(
        'powershell -NoProfile -Command "(Get-WmiObject Win32_OperatingSystem).LastBootUpTime.ToUniversalTime().ToString(\'o\')"',
        {
          encoding: "utf-8",
          stdio: ["ignore", "pipe", "ignore"],
          windowsHide: true,
        }
      ).trim();
      bootTime = Date.parse(legacyOutput);
      if (!Number.isNaN(bootTime)) {
        return bootTime;
      }
    }
  } catch {
    // ignore
  }
  return 0;
}

function tryExec(command: string): string | null {
  try {
    const output = execSync(command, {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
      windowsHide: true,
    }).trim();
    return output || null;
  } catch {
    return null;
  }
}

let cachedBootSignature: string | null | undefined;

/**
 * 현재 전원 사이클을 고유하게 식별하는 문자열을 반환합니다.
 *
 * Windows 10/11에서 기본 활성화된 Fast Startup은 종료 시 커널을 최대 절전으로
 * 저장하기 때문에, 종료 후 다시 켜도 `LastBootUpTime` 등 커널 기준의 부팅 시각이
 * 갱신되지 않는 경우가 있습니다. 이때문에 시각 비교 대신 전원 인가 시 매번
 * 새로 생기는 식별자로 세션을 비교합니다.
 */
function getBootSignature(): string | null {
  if (cachedBootSignature !== undefined) return cachedBootSignature;
  cachedBootSignature = computeBootSignature();
  return cachedBootSignature;
}

function computeBootSignature(): string | null {
  if (process.platform === "linux") {
    try {
      const bootId = fs
        .readFileSync("/proc/sys/kernel/random/boot_id", "utf-8")
        .trim();
      if (bootId) return `linux:${bootId}`;
    } catch {
      // fall through
    }
  } else if (process.platform === "darwin") {
    const uuid = tryExec("sysctl -n kern.bootsessionuuid");
    if (uuid) return `darwin:${uuid}`;
  } else if (process.platform === "win32") {
    // Fast Startup으로 복귀할 때에도 기록되는 Kernel-Boot 이벤트 27을 기준으로
    // 전원 사이클을 구분합니다.
    const kernelBootPs =
      "$e = Get-WinEvent -LogName 'Microsoft-Windows-Kernel-Boot/Operational' " +
      "-FilterXPath '*[System[EventID=27]]' -MaxEvents 1 " +
      "-ErrorAction SilentlyContinue; " +
      "if ($e) { $e.TimeCreated.ToUniversalTime().ToString('o') }";
    const kernelBoot = tryExec(
      `powershell -NoProfile -Command "${kernelBootPs}"`,
    );
    if (kernelBoot) return `win32-kernelboot:${kernelBoot}`;

    // Kernel-Boot 로그가 비어 있거나 접근이 막혀 있으면 Event Log 서비스 시작
    // 이벤트(6005)를 fallback으로 사용합니다.
    const eventLogPs =
      "$e = Get-WinEvent -LogName 'System' " +
      "-FilterXPath '*[System[EventID=6005]]' -MaxEvents 1 " +
      "-ErrorAction SilentlyContinue; " +
      "if ($e) { $e.TimeCreated.ToUniversalTime().ToString('o') }";
    const eventLog = tryExec(
      `powershell -NoProfile -Command "${eventLogPs}"`,
    );
    if (eventLog) return `win32-eventlog:${eventLog}`;
  }

  // 플랫폼 특화 식별자를 얻지 못하면 부팅 시각으로 대체합니다.
  const bootTime = getBootTime();
  if (bootTime > 0) return `boottime:${bootTime}`;
  return null;
}

/**
 * schedule 값에 따라 스플래시를 실행해야 하는지 판단합니다.
 * - "always": 항상 실행 (기본값)
 * - "daily": 하루에 한 번만 실행
 * - "boot": 컴퓨터 전원 사이클(종료 후 재부팅 또는 재시작)마다 한 번만 실행
 */
export function shouldRunSplash(schedule: string): boolean {
  if (schedule === "always") return true;

  const data = loadScheduleData();
  const now = Date.now();

  if (schedule === "daily") {
    const lastDate = new Date(data.lastRun).toDateString();
    const today = new Date(now).toDateString();
    return lastDate !== today;
  }

  if (schedule === "boot") {
    const bootSignature = getBootSignature();
    if (bootSignature) {
      return data.lastBootSignature !== bootSignature;
    }
    // 부팅 세션을 식별할 수 없으면 부팅 시각으로 비교합니다.
    const bootTime = getBootTime();
    if (bootTime <= 0) return true;
    return data.lastRun < bootTime;
  }

  return true;
}

/**
 * 스플래시 실행 시각과 현재 부팅 세션을 기록합니다.
 */
export function recordSplashRun(): void {
  const bootSignature = getBootSignature();
  const previous = loadScheduleData();
  saveScheduleData({
    lastRun: Date.now(),
    lastBootSignature: bootSignature ?? previous.lastBootSignature,
  });
}
