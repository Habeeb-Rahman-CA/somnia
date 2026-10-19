/**
 * Somnia - Render Configuration & Deterministic Simulation
 *
 * Defines versioned generation parameters and the deterministic static simulation pipeline
 * that guarantees identical, pixel-perfect exports independent of frame rate or click timing.
 */

import { ArtParameters, ColorPalette } from '../../core/models/art-parameters.model';
import { GenerationConfig, CURRENT_GENERATOR_VERSION } from '../../core/models/artwork.model';
import { DREAM_PALETTES } from '../algorithms/palette-generator';
import { SeededRandom } from './seeded-random';
import { NoiseField2D } from './noise-field';
import { FlowField } from './flow-field';
import { ParticleSystem } from './particle-system';
import { OrganicCurves } from '../algorithms/organic-curves';
import { PaletteGenerator } from '../algorithms/palette-generator';

export class RenderConfigurationHelper {
  /**
   * Generates default baseline parameters.
   */
  public static createDefaultParameters(seed = Date.now()): ArtParameters {
    const palette = DREAM_PALETTES['midnight-nebula'];
    return {
      seed,
      particleCount: 1800,
      noiseScale: 0.0035,
      flowStrength: 2.2,
      lineOpacity: 0.08,
      trailFadeRate: 0.03,
      waveAmplitude: 0.4,
      layerDensity: 4,
      curlStrength: 0.35,
      palette,
      quality: 'high',
      colorMode: 'palette-gradient',
      directionBias: 0,
    };
  }

  /**
   * Bundles art parameters into a full versioned GenerationConfig.
   */
  public static createConfig(
    params: ArtParameters,
    width = 1200,
    height = 800,
    simulationSteps = 300,
  ): GenerationConfig {
    return {
      generatorVersion: CURRENT_GENERATOR_VERSION,
      seed: params.seed,
      parameters: { ...params },
      referenceWidth: width,
      referenceHeight: height,
      simulationSteps,
      fixedTimeStep: 1 / 60,
    };
  }

  /**
   * Executes a deterministic, fixed-step simulation on a canvas context.
   * This is used for reproducible static exports and high-resolution renders,
   * guaranteeing identical output regardless of display refresh rate or user click time.
   */
  public static renderDeterministicComposition(
    canvas: HTMLCanvasElement,
    config: GenerationConfig,
    exportWidth: number,
    exportHeight: number,
  ): void {
    canvas.width = exportWidth;
    canvas.height = exportHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const params = config.parameters;
    const rng = new SeededRandom(config.seed);
    const noise = new NoiseField2D(rng);
    const flowField = new FlowField(noise, params);

    // Initial background & celestial atmosphere
    OrganicCurves.renderAmbientAtmosphere(
      ctx,
      exportWidth,
      exportHeight,
      params.palette,
    );
    OrganicCurves.renderContourRibbons(
      ctx,
      exportWidth,
      exportHeight,
      noise,
      params.palette,
      rng,
      params.layerDensity,
    );
    OrganicCurves.renderCelestialDust(
      ctx,
      exportWidth,
      exportHeight,
      rng,
      params.palette,
      Math.floor((exportWidth * exportHeight) / 10000),
    );

    // Particle simulation with fixed steps
    const particleSystem = new ParticleSystem(
      params,
      flowField,
      rng,
      exportWidth,
      exportHeight,
      'respawn',
    );

    const totalSteps = config.simulationSteps || 320;
    const dt = config.fixedTimeStep || 1 / 60;
    const palette = params.palette;
    const colors = palette.particleColors;

    ctx.save();
    ctx.lineWidth = 1.0;
    ctx.lineCap = 'round';

    for (let s = 0; s < totalSteps; s++) {
      const timeSec = s * dt;
      particleSystem.step(timeSec);
      const particles = particleSystem.getParticles();

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        // Skip drawing if particle just respawned or wrapped
        const dx = p.x - p.prevX;
        const dy = p.y - p.prevY;
        const distSq = dx * dx + dy * dy;
        if (distSq > 500) continue; // Boundary skip

        const colorHex = colors[p.colorIndex % colors.length];
        const effectiveAlpha = params.lineOpacity * p.alphaMultiplier;
        ctx.strokeStyle = PaletteGenerator.hexToRgba(colorHex, effectiveAlpha);

        ctx.beginPath();
        ctx.moveTo(p.prevX, p.prevY);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}

