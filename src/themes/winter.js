"use strict";

/**
 * ❄️ 겨울 - 눈이 내리는 테마
 */

const { Particle } = require("../particle");
const renderer = require("../renderer");

const SNOW = ["❄", "❅", "❆", "✦", "✧", "·", ".", "*"];
const SNOW_ASCII = ["*", "+", ".", "o", "'", "`", ",", "~"];
const GROUND_CHARS = ["_", "▁", ".", "~", " "];

const COLORS = [
  renderer.fgRgb(255, 255, 255), // 흰색
  renderer.fgRgb(220, 230, 255), // 푸른 흰색
  renderer.fgRgb(200, 215, 240), // 연파랑
  renderer.fgRgb(240, 248, 255), // 앨리스블루
  renderer.fgRgb(176, 196, 222), // 라이트스틸블루
  renderer.fgRgb(230, 230, 250), // 라벤더
];

module.exports = {
  name: "winter",
  label: "❄️ 겨울 - 눈",
  fps: 18,

  createParticle(width, startY, ascii) {
    const chars = ascii ? SNOW_ASCII : SNOW;
    const idx = Math.floor(Math.random() * chars.length);
    return new Particle(Math.random() * width, startY, {
      speedY: 0.08 + Math.random() * 0.25,
      speedX: Math.random() * 0.2 - 0.1,
      char: chars[idx],
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      amplitude: 0.3 + Math.random() * 1.5,
      bold: idx < 3,
      dim: idx >= 6,
    });
  },

  spawnRate(density) {
    return Math.random() < density * 0.035 ? Math.ceil(Math.random() * 2) : 0;
  },

  renderGround(groundMap, height, width) {
    const color = renderer.fgRgb(220, 230, 255);
    const brightColor = renderer.fgRgb(255, 255, 255);
    for (let x = 0; x < width; x++) {
      const h = groundMap[x] || 0;
      if (h > 0) {
        const displayH = Math.min(Math.floor(h / 3), Math.floor(height / 4));
        for (let dy = 0; dy < displayH; dy++) {
          const gy = height - 2 - dy;
          if (gy > 0 && gy < height - 1) {
            const isTop = dy === displayH - 1;
            renderer.set(x, gy, isTop ? "~" : ".", isTop ? brightColor : color);
          }
        }
      }
    }
  },

  getTitle() {
    return " ❄️ BeforeSunrise - 겨울 ";
  },
};
