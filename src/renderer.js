"use strict";

/**
 * 터미널 렌더링 엔진
 * 외부 의존성 없이 ANSI escape code로 직접 렌더링
 */

const ESC = "\x1b[";

const renderer = {
  width: 0,
  height: 0,
  buffer: null,
  colorBuffer: null,

  init() {
    this.updateSize();
    process.stdout.write(`${ESC}?25l`);   // 커서 숨김
    process.stdout.write(`${ESC}?1049h`); // 대체 화면 버퍼
    process.stdout.write(`${ESC}2J`);     // 화면 클리어
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

  set(x, y, char, color) {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    if (ix >= 0 && ix < this.width && iy >= 0 && iy < this.height) {
      this.buffer[iy][ix] = char;
      this.colorBuffer[iy][ix] = color || "";
    }
  },

  flush() {
    let out = `${ESC}H`; // 커서를 홈으로
    for (let y = 0; y < this.height; y++) {
      let line = "";
      let prevColor = null;
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
    process.stdout.write(`${ESC}?1049l`); // 메인 화면 복원
    process.stdout.write(`${ESC}?25h`);   // 커서 복원
    process.stdout.write(`${ESC}0m`);     // 색상 리셋
  },

  // ANSI 256 color
  fg(n) {
    return `${ESC}38;5;${n}m`;
  },

  bold() {
    return `${ESC}1m`;
  },

  dim() {
    return `${ESC}2m`;
  },

  fgRgb(r, g, b) {
    return `${ESC}38;2;${r};${g};${b}m`;
  },
};

module.exports = renderer;
