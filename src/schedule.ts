import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { execSync } from "child_process";

const SCHEDULE_PATH = path.join(os.homedir(), ".vibe-picnic-schedule.json");

interface ScheduleData {
  lastRun: number; // Unix timestamp in ms
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

/**
 * schedule 값에 따라 스플래시를 실행해야 하는지 판단합니다.
 * - "always": 항상 실행 (기본값)
 * - "daily": 하루에 한 번만 실행
 * - "boot": 컴퓨터 부팅 후 한 번만 실행
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
    const bootTime = getBootTime();
    if (bootTime <= 0) {
      return true;
    }
    return data.lastRun < bootTime;
  }

  return true;
}

/**
 * 스플래시 실행 시각을 기록합니다.
 */
export function recordSplashRun(): void {
  saveScheduleData({ lastRun: Date.now() });
}
