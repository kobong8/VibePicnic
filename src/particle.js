"use strict";

/**
 * 파티클 시스템 - 모든 계절 테마의 기반
 */

class Particle {
  constructor(x, y, config) {
    this.x = x;
    this.y = y;
    this.speedY = config.speedY || 0.3;
    this.speedX = config.speedX || 0;
    this.char = config.char || "*";
    this.color = config.color || "";
    this.phase = Math.random() * Math.PI * 2;
    this.amplitude = config.amplitude || 0;
    this.age = 0;
    this.maxAge = config.maxAge || Infinity;
    this.bold = config.bold || false;
    this.dim = config.dim || false;
  }

  update(tick, wind) {
    this.y += this.speedY;
    this.x += this.speedX + wind * 0.2;
    if (this.amplitude > 0) {
      this.x += Math.sin(this.phase + tick * 0.04) * this.amplitude * 0.2;
    }
    this.age++;
    return this.age < this.maxAge;
  }
}

class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  add(p) {
    this.particles.push(p);
  }

  update(tick, wind, width, height) {
    const alive = [];
    const landed = [];
    for (const p of this.particles) {
      const ok = p.update(tick, wind);
      // 좌우 래핑
      if (p.x < 0) p.x += width;
      if (p.x >= width) p.x -= width;

      if (ok && p.y < height - 1 && p.y >= 0) {
        alive.push(p);
      } else if (p.y >= height - 1) {
        landed.push(p);
      }
    }
    this.particles = alive;
    return landed;
  }

  count() {
    return this.particles.length;
  }
}

module.exports = { Particle, ParticleSystem };
