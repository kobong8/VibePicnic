import { Particle, ParticleSystem } from "../particle";

export interface GroundMap {
  [x: number]: number;
}

export interface Theme {
  name: string;
  label: string;
  fps: number;
  createParticle(width: number, startY: number, ascii: boolean): Particle;
  spawnRate(density: number): number;
  groundDisplayH(landings: number): number;
  renderGround(groundMap: GroundMap, height: number, width: number, ascii?: boolean): void;
  onLanded?(landed: Particle[], system: ParticleSystem, height: number): void;
  renderBackground?(tick: number, width: number, height: number, ascii?: boolean): void;
  getTitle(): string;
}
