/**
 * Somnia - Interactive Canvas 2D Renderer
 *
 * Coordinates real-time particle animation, high-DPI canvas scaling,
 * decay trails, pause/resume state, and lifecycle teardown.
 */

import { ArtParameters } from '../../core/models/art-parameters.model';
import { SeededRandom } from './seeded-random';
import { NoiseField2D } from './noise-field';
import { FlowField } from './flow-field';
import { ParticleSystem } from './particle-system';
import { PaletteGenerator } from '../algorithms/palette-generator';
import { OrganicCurves } from '../algorithms/organic-curves';

export class CanvasRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private animFrameId: number | null = null;
  private isPaused = false;
  private isDestroyed = false;

  private params: ArtParameters;
  private rng!: SeededRandom;
  private noise!: NoiseField2D;
  private flowField!: FlowField;
  private particleSystem!: ParticleSystem;

  private dpr = 1;
  private cssWidth = 800;
  private cssHeight = 600;
  private startTime = 0;
  private lastFrameTime = 0;
  private frameCount = 0;

  constructor(canvas: HTMLCanvasElement, initialParams: ArtParameters) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) {
      throw new Error('Failed to get 2D canvas context');
    }
    this.ctx = ctx;
    this.params = { ...initialParams };
    this.dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;

    this.reinitializeEngine();
  }

  /**
   * Initializes or re-seeds the math engine & particle system.
   */
  public reinitializeEngine(): void {
    this.rng = new SeededRandom(this.params.seed);
    this.noise = new NoiseField2D(this.rng);
    this.flowField = new FlowField(this.noise, this.params);

    const logicalWidth = this.cssWidth || 800;
    const logicalHeight = this.cssHeight || 600;

    this.particleSystem = new ParticleSystem(
      this.params,
      this.flowField,
      this.rng,
      logicalWidth,
      logicalHeight,
      'respawn',
    );

    this.clearAndPaintAtmosphere();
  }

  /**
   * Updates visual parameters on the fly.
   * If reseed is true or seed changed, reinitializes the whole engine.
   */
  public updateParameters(newParams: ArtParameters, reseed = false): void {
    const seedChanged = newParams.seed !== this.params.seed;
    this.params = { ...newParams };

    if (reseed || seedChanged) {
      this.reinitializeEngine();
    } else {
      // Retain active particles but update flow field references
      this.flowField = new FlowField(this.noise, this.params);
    }
  }

  /**
   * Handles canvas resizing with devicePixelRatio compensation.
   */
  public resize(cssWidth: number, cssHeight: number): void {
    if (cssWidth <= 0 || cssHeight <= 0) return;

    this.cssWidth = cssWidth;
    this.cssHeight = cssHeight;
    this.dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;

    this.canvas.width = Math.floor(cssWidth * this.dpr);
    this.canvas.height = Math.floor(cssHeight * this.dpr);

    // Apply DPR scale to context
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.dpr, this.dpr);

    if (this.particleSystem) {
      this.particleSystem.resize(cssWidth, cssHeight);
    }

    this.clearAndPaintAtmosphere();
  }

  /**
   * Fills base background and renders initial atmospheric layers.
   */
  public clearAndPaintAtmosphere(): void {
    if (!this.ctx) return;
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.dpr, this.dpr);

    OrganicCurves.renderAmbientAtmosphere(
      this.ctx,
      this.cssWidth,
      this.cssHeight,
      this.params.palette,
    );
    OrganicCurves.renderContourRibbons(
      this.ctx,
      this.cssWidth,
      this.cssHeight,
      this.noise,
      this.params.palette,
      this.rng,
      this.params.layerDensity,
    );
    OrganicCurves.renderCelestialDust(
      this.ctx,
      this.cssWidth,
      this.cssHeight,
      this.rng,
      this.params.palette,
      Math.floor((this.cssWidth * this.cssHeight) / 12000),
    );

    this.ctx.restore();
  }

  /**
   * Starts the animation loop.
   */
  public start(): void {
    if (this.isDestroyed) return;
    this.isPaused = false;
    this.startTime = performance.now();
    this.lastFrameTime = this.startTime;

    if (this.animFrameId === null) {
      this.animFrameId = requestAnimationFrame(this.renderLoop);
    }
  }

  /**
   * Pauses the animation loop.
   */
  public pause(): void {
    this.isPaused = true;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  /**
   * Resumes animation loop if paused.
   */
  public resume(): void {
    if (!this.isPaused || this.isDestroyed) return;
    this.start();
  }

  /**
   * Toggles pause/resume state.
   */
  public togglePause(): boolean {
    if (this.isPaused) {
      this.resume();
    } else {
      this.pause();
    }
    return this.isPaused;
  }

  public getIsPaused(): boolean {
    return this.isPaused;
  }

  /**
   * Destroys renderer and cancels animation loops.
   */
  public destroy(): void {
    this.isDestroyed = true;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  /**
   * The primary render step executed on requestAnimationFrame.
   */
  private renderLoop = (currentTime: number): void => {
    if (this.isDestroyed || this.isPaused) {
      this.animFrameId = null;
      return;
    }

    const elapsedSec = (currentTime - this.startTime) * 0.001;
    this.stepAndDraw(elapsedSec);

    this.frameCount++;
    this.animFrameId = requestAnimationFrame(this.renderLoop);
  };

  /**
   * Single frame step: fade trail + step particles + draw segments.
   */
  public stepAndDraw(timeSec: number): void {
    const ctx = this.ctx;
    const palette = this.params.palette;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(this.dpr, this.dpr);

    // Ethereal decay trail: draw faint semi-transparent background rect
    // This allows old particle trails to slowly dissolve like waking from a dream
    ctx.fillStyle = PaletteGenerator.hexToRgba(
      palette.background,
      this.params.trailFadeRate,
    );
    ctx.fillRect(0, 0, this.cssWidth, this.cssHeight);

    // Advance particle simulation
    this.particleSystem.step(timeSec);
    const particles = this.particleSystem.getParticles();
    const colors = palette.particleColors;

    ctx.lineWidth = 1.0;
    ctx.lineCap = 'round';

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Prevent drawing large streaks if particle just respawned or wrapped
      const dx = p.x - p.prevX;
      const dy = p.y - p.prevY;
      if (dx * dx + dy * dy > 400) continue;

      const colorHex = colors[p.colorIndex % colors.length];
      const effectiveAlpha = this.params.lineOpacity * p.alphaMultiplier;
      ctx.strokeStyle = PaletteGenerator.hexToRgba(colorHex, effectiveAlpha);

      ctx.beginPath();
      ctx.moveTo(p.prevX, p.prevY);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Generates a lightweight PNG data URL preview of current canvas state.
   */
  public captureDataUrl(format = 'image/png', quality = 0.85): string {
    return this.canvas.toDataURL(format, quality);
  }
}

