export interface ParticleConfig {
  speedY?: number;
  speedX?: number;
  char?: string;
  color?: string;
  amplitude?: number;
  maxAge?: number;
  bold?: boolean;
  dim?: boolean;
}

export class Particle {
  x: number;
  y: number;
  speedY: number;
  speedX: number;
  char: string;
  color: string;
  phase: number;
  amplitude: number;
  age: number;
  maxAge: number;
  bold: boolean;
  dim: boolean;

  constructor(x: number, y: number, config: ParticleConfig) {
    this.x = x;
    this.y = y;
    this.speedY = config.speedY ?? 0.3;
    this.speedX = config.speedX ?? 0;
    this.char = config.char ?? "*";
    this.color = config.color ?? "";
    this.phase = Math.random() * Math.PI * 2;
    this.amplitude = config.amplitude ?? 0;
    this.age = 0;
    this.maxAge = config.maxAge ?? Infinity;
    this.bold = config.bold ?? false;
    this.dim = config.dim ?? false;
  }

  update(tick: number, wind: number): boolean {
    this.y += this.speedY;
    this.x += this.speedX + wind * 0.2;
    if (this.amplitude > 0) {
      this.x += Math.sin(this.phase + tick * 0.04) * this.amplitude * 0.2;
    }
    this.age++;
    return this.age < this.maxAge;
  }
}

export class ParticleSystem {
  particles: Particle[] = [];

  add(p: Particle): void {
    this.particles.push(p);
  }

  update(tick: number, wind: number, width: number, height: number): Particle[] {
    const alive: Particle[] = [];
    const landed: Particle[] = [];
    for (const p of this.particles) {
      const ok = p.update(tick, wind);
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

  count(): number {
    return this.particles.length;
  }
}
