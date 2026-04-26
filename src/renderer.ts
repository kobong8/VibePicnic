const ESC = "\x1b[";

function isWideChar(ch: string): boolean {
  if (!ch) return false;
  const cp = ch.codePointAt(0);
  if (cp === undefined) return false;
  return (
    (cp >= 0x1100 && cp <= 0x115f) ||
    (cp >= 0x2e80 && cp <= 0x303e) ||
    (cp >= 0x3041 && cp <= 0x9fff) ||
    (cp >= 0xac00 && cp <= 0xd7a3) ||
    (cp >= 0xf900 && cp <= 0xfaff) ||
    (cp >= 0xfe30 && cp <= 0xfe4f) ||
    (cp >= 0xff00 && cp <= 0xff60) ||
    (cp >= 0x1f000 && cp <= 0x1faff)
  );
}

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
    let out = "";
    for (let y = 0; y < this.height; y++) {
      out += `${ESC}${y + 1};1H`;
      let prevColor: string | null = null;
      let x = 0;
      while (x < this.width) {
        const ch = this.buffer[y][x];
        const color = this.colorBuffer[y][x];
        const wide = isWideChar(ch);
        if (color !== prevColor) {
          out += color || `${ESC}0m`;
          prevColor = color;
        }
        if (wide && x + 1 >= this.width) {
          out += " ";
          x += 1;
        } else {
          out += ch;
          x += wide ? 2 : 1;
        }
      }
      out += `${ESC}0m`;
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
