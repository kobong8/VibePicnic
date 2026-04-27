import { Particle, ParticleSystem } from "./particle";
import renderer from "./renderer";

export enum FireworkType {
  Chrysanthemum,
  Ring,
  Willow,
}

export class FireworkParticle extends Particle {
  gravity: number;
  drag: number;

  constructor(x: number, y: number, config: any) {
    super(x, y, config);
    this.gravity = config.gravity ?? 0.08;
    this.drag = config.drag ?? 0.96;
  }

  update(tick: number, wind: number): boolean {
    this.speedX *= this.drag;
    this.speedY *= this.drag;
    this.speedY += this.gravity;
    this.x += this.speedX + wind * 0.1;
    this.y += this.speedY;
    this.age++;
    return this.age < this.maxAge;
  }
}

export class Firework {
  x: number;
  y: number;
  targetY: number;
  speedY: number;
  palette: string[]; // 다채로운 색상을 담을 팔레트
  type: FireworkType;
  exploded: boolean = false;
  char: string;

  constructor(width: number, height: number) {
    this.x = Math.random() * width;
    this.y = height;
    this.targetY = Math.random() * (height * 0.35) + height * 0.12;
    const riseNeeded = height - this.targetY;
    const minSpeed = Math.sqrt(2 * 0.015 * riseNeeded) + 0.1;
    this.speedY = -(minSpeed + Math.random() * 0.25);
    this.type = Math.floor(Math.random() * 3) as FireworkType;
    this.char = asciiRocketChar();
    
    const allColors = [
      renderer.fgRgb(255, 214, 120),
      renderer.fgRgb(255, 190, 96),
      renderer.fgRgb(255, 236, 214),
      renderer.fgRgb(255, 120, 92),
      renderer.fgRgb(196, 220, 255),
      renderer.fgRgb(255, 166, 128),
    ];

    // 이번 폭죽에서 사용할 3가지 색상 무작위 선택
    this.palette = [];
    const colorCount = 3;
    for (let i = 0; i < colorCount; i++) {
      this.palette.push(allColors[Math.floor(Math.random() * allColors.length)]);
    }
  }

  private getRandomColor(): string {
    return this.palette[Math.floor(Math.random() * this.palette.length)];
  }

  update(system: ParticleSystem): boolean {
    if (this.exploded) return false;

    this.speedY += 0.015;
    this.y += this.speedY;
    this.emitTrail(system);
    if (this.y <= this.targetY || this.speedY >= 0) {
      this.explode(system);
      this.exploded = true;
      return false;
    }
    return true;
  }

  explode(system: ParticleSystem): void {
    const particleCount = 58 + Math.floor(Math.random() * 28);
    const chars = ["*", "•", "·"];
    const char = chars[Math.floor(Math.random() * chars.length)];

    switch (this.type) {
      case FireworkType.Chrysanthemum:
        this.createChrysanthemum(system, particleCount, char);
        this.createRainCurtain(system, Math.floor(particleCount * 0.4));
        break;
      case FireworkType.Ring:
        this.createRing(system, particleCount, char);
        this.createRainCurtain(system, Math.floor(particleCount * 0.32));
        break;
      case FireworkType.Willow:
        this.createWillow(system, particleCount, char);
        this.createRainCurtain(system, Math.floor(particleCount * 0.55));
        break;
    }
  }

  private emitTrail(system: ParticleSystem): void {
    if (Math.random() < 0.35) {
      system.add(new FireworkParticle(this.x, this.y + 0.4, {
        speedX: (Math.random() - 0.5) * 0.08,
        speedY: 0.08 + Math.random() * 0.06,
        color: renderer.fgRgb(255, 190, 110),
        char: ".",
        maxAge: 10 + Math.floor(Math.random() * 6),
        gravity: 0.01,
        drag: 0.9,
        dim: true,
      }));
    }
  }

  private createChrysanthemum(system: ParticleSystem, count: number, char: string): void {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.06;
      const speed = 0.82 + Math.random() * 0.32;
      system.add(new FireworkParticle(this.x, this.y, {
        speedX: Math.cos(angle) * speed * 1.8,
        speedY: Math.sin(angle) * speed,
        color: this.getRandomColor(),
        char,
        maxAge: 28 + Math.random() * 10,
        gravity: 0.045,
        drag: 0.97,
      }));
    }
  }

  private createRing(system: ParticleSystem, count: number, char: string): void {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = 1.0 + Math.random() * 0.14;
      system.add(new FireworkParticle(this.x, this.y, {
        speedX: Math.cos(angle) * speed * 1.95,
        speedY: Math.sin(angle) * speed * 0.88,
        color: this.palette[i % this.palette.length],
        char,
        maxAge: 24 + Math.random() * 8,
        gravity: 0.05,
        drag: 0.968,
      }));
    }
  }

  private createWillow(system: ParticleSystem, count: number, char: string): void {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.12;
      const speed = 0.62 + Math.random() * 0.24;
      system.add(new FireworkParticle(this.x, this.y, {
        speedX: Math.cos(angle) * speed * 1.45,
        speedY: Math.sin(angle) * speed * 0.75 - 0.2,
        color: this.getRandomColor(),
        char,
        maxAge: 38 + Math.random() * 16,
        gravity: 0.08,
        drag: 0.975,
        dim: Math.random() < 0.35,
      }));

      if (Math.random() < 0.28) {
        system.add(new FireworkParticle(this.x, this.y, {
          speedX: Math.cos(angle) * speed * 0.9,
          speedY: Math.sin(angle) * speed * 0.55,
          color: renderer.fgRgb(255, 228, 178),
          char: "·",
          maxAge: 18 + Math.random() * 10,
          gravity: 0.06,
          drag: 0.96,
          dim: true,
        }));
      }
    }
  }

  private createRainCurtain(system: ParticleSystem, count: number): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const burstSpeed = 0.35 + Math.random() * 0.28;
      const drift = Math.cos(angle) * burstSpeed * 1.2;
      const lift = Math.sin(angle) * burstSpeed * 0.45 - 0.02;

      system.add(new FireworkParticle(this.x, this.y, {
        speedX: drift,
        speedY: lift,
        color: this.palette[i % this.palette.length],
        char: Math.random() < 0.65 ? "·" : ".",
        maxAge: 26 + Math.random() * 18,
        gravity: 0.11,
        drag: 0.955,
        dim: Math.random() < 0.55,
      }));
    }
  }
}

export class FireworkManager {
  fireworks: Firework[] = [];
  fireworkParticles: ParticleSystem = new ParticleSystem();
  nextSpawn: number = 0;

  update(tick: number, width: number, height: number, wind: number): void {
    if (tick >= this.nextSpawn) {
      this.fireworks.push(new Firework(width, height));
      this.nextSpawn = tick + 31 + Math.random() * 57;
    }

    this.fireworks = this.fireworks.filter(f => f.update(this.fireworkParticles));
    this.fireworkParticles.update(tick, wind, width, height);
  }

  render(noColor: boolean): void {
    for (const f of this.fireworks) {
      renderer.set(f.x, f.y, f.char, noColor ? "" : f.palette[0] + renderer.bold());
    }
    for (const p of this.fireworkParticles.particles) {
      let color = noColor ? "" : p.color;
      if (!noColor && p.bold) color = renderer.bold() + color;
      if (!noColor && p.dim) color = renderer.dim() + color;
      renderer.set(p.x, p.y, p.char, color);
    }
  }
}

function asciiRocketChar(): string {
  return Math.random() < 0.5 ? "|" : "!";
}
