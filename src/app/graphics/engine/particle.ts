/**
 * Somnia - Particle Entity
 * Represents an individual tracer particle flowing through the vector field.
 */

export interface ParticleState {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  vx: number;
  vy: number;
  speed: number;
  age: number;
  maxLife: number;
  colorIndex: number;
  colorVariance: number;
  alphaMultiplier: number;
  layer: number;
}

export class Particle implements ParticleState {
  public x = 0;
  public y = 0;
  public prevX = 0;
  public prevY = 0;
  public vx = 0;
  public vy = 0;
  public speed = 1;
  public age = 0;
  public maxLife = 300;
  public colorIndex = 0;
  public colorVariance = 0;
  public alphaMultiplier = 1;
  public layer = 0;

  constructor(
    x: number,
    y: number,
    maxLife: number,
    colorIndex: number,
    colorVariance: number,
    layer = 0,
  ) {
    this.reset(x, y, maxLife, colorIndex, colorVariance, layer);
  }

  /**
   * Resets particle state with new coordinates and lifetime.
   */
  public reset(
    x: number,
    y: number,
    maxLife: number,
    colorIndex: number,
    colorVariance: number,
    layer = 0,
  ): void {
    this.x = x;
    this.y = y;
    this.prevX = x;
    this.prevY = y;
    this.vx = 0;
    this.vy = 0;
    this.speed = 1;
    this.age = 0;
    this.maxLife = maxLife;
    this.colorIndex = colorIndex;
    this.colorVariance = colorVariance;
    this.alphaMultiplier = 0.6 + Math.random() * 0.4; // Controlled variation
    this.layer = layer;
  }

  /**
   * Updates previous coordinate cache.
   */
  public markPosition(): void {
    this.prevX = this.x;
    this.prevY = this.y;
  }
}

