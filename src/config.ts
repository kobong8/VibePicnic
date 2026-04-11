import * as fs from "fs";
import * as path from "path";
import * as os from "os";

export interface Config {
  season: string;
  density: number;
  speed: number;
  wind: number;
  ascii: boolean;
  noColor: boolean;
  noGround: boolean;
  splash: boolean;
  message: string;
  fireworks: boolean;
  schedule: string; // "always" | "daily" | "boot"
}

const CONFIG_PATH = path.join(os.homedir(), ".vibe-picnic.json");

const DEFAULTS: Config = {
  season: "auto",
  density: 15,
  speed: 1.0,
  wind: 0.5,
  ascii: false,
  noColor: false,
  noGround: false,
  splash: false,
  message: "",
  fireworks: false,
  schedule: "always",
};

export function loadConfig(): Partial<Config> {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      // Legacy support: map 'fireplace' to 'campfire'
      if (parsed.season === "fireplace") {
        parsed.season = "campfire";
      }
      return parsed;
    }
  } catch {
    // ignore invalid config
  }
  return {};
}

export function saveConfig(config: Partial<Config>): void {
  const existing = loadConfig();
  const merged = { ...existing, ...config };
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(merged, null, 2) + "\n", "utf-8");
}

export function getConfigPath(): string {
  return CONFIG_PATH;
}

export function getDefaults(): Config {
  return { ...DEFAULTS };
}

export function mergeWithDefaults(saved: Partial<Config>): Config {
  return { ...DEFAULTS, ...saved };
}
