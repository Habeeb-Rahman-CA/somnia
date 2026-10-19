/**
 * Somnia - Particle System Simulation Engine
 *
 * Manages bounded particle arrays, deterministic lifecycle recycling,
 * and flow field trajectory integration.
 */

import { Particle } from './particle';
import { FlowField } from './flow-field';
import { SeededRandom } from './seeded-random';
import { ArtParameters } from '../../core/models/art-parameters.model';

export type BoundaryMode = 'respawn' | 'wrap';

export class ParticleSystem {
  private readonly particles: Particle[] = [];
  private readonly rng: SeededRandom;
  private readonly flowField: FlowField;
  private readonly params: ArtParameters;
  private width: number;
  private height: number;
  private boundaryMode: BoundaryMode = 'respawn';
  private totalStepsSimulated = 0;

  constructor(
    params: ArtParameters,
    flowField: FlowField,
    rng: SeededRandom,
    width: number,
    height: number,
    boundaryMode: BoundaryMode = 'respawn',
  ) {
    this.params = params;
    this.flowField = flowField;
    this.rng = rng;
    this.width = width;
    this.height = height;
    this.boundaryMode = boundaryMode;

    this.initializePool();
  }

  /**
   * Pre-allocates fixed particle pool to prevent memory churn and GC spikes.
   */
  private initializePool(): void {
    this.particles.length = 0;
    const count = this.params.particleCount;
    const paletteSize = Math.max(1, this.params.palette.particleColors.length);

    for (let i = 0; i < count; i++) {
      const x = this.rng.range(0, this.width);
      const y = this.rng.range(0, this.height);
      const maxLife = this.rng.rangeInt(150, 450);
      const colorIndex = i % paletteSize;
      const variance = this.rng.range(-0.15, 0.15);
      const layer = i % Math.max(1, this.params.layerDensity);

      const particle = new Particle(x, y, maxLife, colorIndex, variance, layer);
      // Give them varied initial ages so they don't all respawn simultaneously
      particle.age = this.rng.rangeInt(0, maxLife);
      particle.alphaMultiplier = this.rng.range(0.4, 1.0);
      this.particles.push(particle);
    }
  }

  /**
   * Resizes the simulation boundaries.
   */
  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  /**
   * Returns read-only array of active particles for rendering.
   */
  public getParticles(): readonly Particle[] {
    return this.particles;
  }

  /**
   * Advances the simulation by one discrete timestep.
   *
   * @param timeSec Current simulation time for subtle flow evolution
   */
  public step(timeSec = 0): void {
    const paletteSize = Math.max(1, this.params.palette.particleColors.length);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Cache previous position for line segment drawing
      p.markPosition();

      // Query vector field
      const vec = this.flowField.evaluate(p.x, p.y, timeSec);
      p.vx = vec.vx;
      p.vy = vec.vy;
      p.speed = vec.speed;

      // Integrate position using Euler step
      p.x += p.vx;
      p.y += p.vy;
      p.age++;

      // Check boundary conditions or lifetime expiry
      const isOutOfBounds =
        p.x < 0 || p.x > this.width || p.y < 0 || p.y > this.height;
      const isExpired = p.age >= p.maxLife;

      if (isExpired || (this.boundaryMode === 'respawn' && isOutOfBounds)) {
        this.respawnParticle(p, paletteSize);
      } else if (this.boundaryMode === 'wrap' && isOutOfBounds) {
        this.wrapParticle(p);
      }
    }

    this.totalStepsSimulated++;
  }

  /**
   * Respawns particle at a new random coordinate with refreshed lifetime.
   */
  private respawnParticle(p: Particle, paletteSize: number): void {
    p.reset(
      this.rng.range(0, this.width),
      this.rng.range(0, this.height),
      this.rng.rangeInt(150, 450),
      Math.floor(this.rng.next() * paletteSize),
      this.rng.range(-0.15, 0.15),
      Math.floor(this.rng.next() * Math.max(1, this.params.layerDensity)),
    );
    p.alphaMultiplier = this.rng.range(0.4, 1.0);
  }

  /**
   * Wraps particle across screen edges while resetting prev position to avoid streak artifacts.
   */
  private wrapParticle(p: Particle): void {
    if (p.x < 0) p.x += this.width;
    else if (p.x > this.width) p.x -= this.width;

    if (p.y < 0) p.y += this.height;
    else if (p.y > this.height) p.y -= this.height;

    // Reset previous position to current to prevent drawing a screen-crossing line
    p.prevX = p.x;
    p.prevY = p.y;
  }

  public getStepsSimulated(): number {
    return this.totalStepsSimulated;
  }
}

