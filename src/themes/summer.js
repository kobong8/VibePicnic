"use strict";

/**
 * 🌧️ 여름 - 비가 내리는 테마
 */

const { Particle } = require("../particle");
const renderer = require("../renderer");

const RAIN_CHARS = ["|", "│", "┃", "¦", ":", "!"];
const RAIN_ASCII = ["|", "!", ":", ";", "'", "."];
const SPLASH_CHARS = ["·", ".", "'", "`", ","];

const COLORS = [
  renderer.fgRgb(100, 149, 237), // 코발트블루
  renderer.fgRgb(135, 170, 222), // 연파랑
  renderer.fgRgb(70, 130, 210),  // 블루
  renderer.fgRgb(160, 190, 230), // 밝은 파랑
  renderer.fgRgb(80, 120, 180),  // 진한 파랑
];

const SPLASH_COLOR = renderer.fgRgb(150, 200, 255);

module.exports = {
  name: "summer",
  label: "🌧️ 여름 - 비",
  fps: 30,

  createParticle(width, startY, ascii) {
    const chars = ascii ? RAIN_ASCII : RAIN_CHARS;
    const isSplash = startY > 0;
    if (isSplash) {
      return new Particle(Math.random() * width, startY, {
        speedY: -0.1,
        speedX: (Math.random() - 0.5) * 0.8,
        char: SPLASH_CHARS[Math.floor(Math.random() * SPLASH_CHARS.length)],
        color: SPLASH_COLOR,
        amplitude: 0,
        maxAge: 4 + Math.floor(Math.random() * 4),
        dim: true,
      });
    }
    return new Particle(Math.random() * width, startY, {
      speedY: 0.6 + Math.random() * 0.8,
      speedX: 0.1 + Math.random() * 0.15,
      char: chars[Math.floor(Math.random() * chars.length)],
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      amplitude: 0,
      bold: Math.random() < 0.3,
      dim: Math.random() < 0.3,
    });
  },

  spawnRate(density) {
    return Math.random() < density * 0.06 ? Math.ceil(Math.random() * 3) : 0;
  },

  renderGround(groundMap, height, width) {
    // 비는 바닥에 물웅덩이 효과
    const color = renderer.fgRgb(60, 100, 160);
    const gy = height - 2;
    if (gy <= 0) return;
    for (let x = 0; x < width; x++) {
      const h = groundMap[x] || 0;
      if (h > 2) {
        const ch = Math.random() < 0.5 ? "~" : "≈";
        renderer.set(x, gy, ch, color);
      }
    }
  },

  onLanded(landed, system, height) {
    // 비가 바닥에 닿으면 스플래시 파티클 생성
    for (const p of landed) {
      if (Math.random() < 0.3) {
        const splash = this.createParticle(0, height - 2, false);
        splash.x = p.x + (Math.random() - 0.5) * 2;
        system.add(splash);
      }
    }
  },

  getTitle() {
    return " 🌧️ Vibe Picnic - 여름 ";
  },
};
