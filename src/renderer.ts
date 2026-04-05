const ESC = "\x1b[";

export interface Renderer {
  width: number;
  height: number;
  buffer: string[][];
  colorBuffer: string[][];
  init(): void;
  updateSize(): void;
  clear(): void;
  set(x: number, y: number, char: string, color?: string): void;
  flush(): void;
  cleanup(): void;
  fg(n: number): string;
  bold(): string;
  dim(): string;
  fgRgb(r: number, g: number, b: number): string;
}

const renderer: Renderer = {
  width: 0,
  height: 0,
  buffer: [],
  colorBuffer: [],

  init() {
    this.updateSize();
    process.stdout.write(`${ESC}?25l`);
    process.stdout.write(`${ESC}?1049h`);
    process.stdout.write(`${ESC}2J`);
  },

  updateSize() {
    this.width = process.stdout.columns || 80;
    this.height = process.stdout.rows || 24;
    this.buffer = Array.from({ length: this.height }, () => Array(this.width).fill(" "));
    this.colorBuffer = Array.from({ length: this.height }, () => Array(this.width).fill(""));
  },

  clear() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.buffer[y][x] = " ";
        this.colorBuffer[y][x] = "";
      }
    }
  },

  set(x: number, y: number, char: string, color?: string) {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    if (ix >= 0 && ix < this.width && iy >= 0 && iy < this.height) {
      this.buffer[iy][ix] = char;
      this.colorBuffer[iy][ix] = color || "";
    }
  },

  flush() {
    let out = `${ESC}H`;
    for (let y = 0; y < this.height; y++) {
      let line = "";
      let prevColor: string | null = null;
      for (let x = 0; x < this.width; x++) {
        const color = this.colorBuffer[y][x];
        if (color !== prevColor) {
          line += color || `${ESC}0m`;
          prevColor = color;
        }
        line += this.buffer[y][x];
      }
      line += `${ESC}0m`;
      out += line;
      if (y < this.height - 1) out += "\n";
    }
    process.stdout.write(out);
  },

  cleanup() {
    process.stdout.write(`${ESC}?1049l`);
    process.stdout.write(`${ESC}?25h`);
    process.stdout.write(`${ESC}0m`);
  },

  fg(n: number): string {
    return `${ESC}38;5;${n}m`;
  },

  bold(): string {
    return `${ESC}1m`;
  },

  dim(): string {
    return `${ESC}2m`;
  },

  fgRgb(r: number, g: number, b: number): string {
    return `${ESC}38;2;${r};${g};${b}m`;
  },
};

export default renderer;
