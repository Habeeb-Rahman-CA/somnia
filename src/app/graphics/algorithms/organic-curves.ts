/**
 * Somnia - Organic Curves & Atmospheric Layers
 * Generates restrained, mathematical background curves, ambient gradients,
 * and contour ribbons sampled from the noise field.
 */

import { NoiseField2D } from '../engine/noise-field';
import { SeededRandom } from '../engine/seeded-random';
import { ColorPalette } from '../../core/models/art-parameters.model';
import { PaletteGenerator } from './palette-generator';

export interface CurvePoint {
  x: number;
  y: number;
}

export class OrganicCurves {
  /**
   * Renders the deep atmospheric gradient background.
   */
  public static renderAmbientAtmosphere(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    palette: ColorPalette,
  ): void {
    // Fill base background
    ctx.fillStyle = palette.background;
    ctx.fillRect(0, 0, width, height);

    // Subtle radial nebula glow centered on canvas
    const cx = width * 0.5;
    const cy = height * 0.45;
    const maxRadius = Math.max(width, height) * 0.75;

    const radialGradient = ctx.createRadialGradient(
      cx,
      cy,
      width * 0.05,
      cx,
      cy,
      maxRadius,
    );

    const gradStops = palette.ambientGradients[0] || [
      '#1e1b4b',
      palette.background,
    ];
    radialGradient.addColorStop(0, PaletteGenerator.hexToRgba(gradStops[0], 0.25));
    radialGradient.addColorStop(0.5, PaletteGenerator.hexToRgba(gradStops[1], 0.12));
    radialGradient.addColorStop(1, PaletteGenerator.hexToRgba(palette.background, 0.0));

    ctx.save();
    ctx.fillStyle = radialGradient;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  /**
   * Generates low-opacity flowing contour ribbons across the canvas
   * using smooth cubic Bézier curves guided by the noise field.
   */
  public static renderContourRibbons(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    noise: NoiseField2D,
    palette: ColorPalette,
    rng: SeededRandom,
    layerCount: number,
  ): void {
    const layers = Math.min(6, Math.max(2, layerCount));
    const stepCount = 40;
    const stepX = width / stepCount;

    ctx.save();
    ctx.lineWidth = 1.0;

    for (let layer = 0; layer < layers; layer++) {
      const baseY = (height / (layers + 1)) * (layer + 1);
      const color =
        palette.particleColors[layer % palette.particleColors.length];
      ctx.strokeStyle = PaletteGenerator.hexToRgba(color, 0.05);

      ctx.beginPath();
      let first = true;

      for (let s = 0; s <= stepCount; s++) {
        const x = s * stepX;
        // Sample noise field at ribbon elevation
        const n = noise.noise2D(x * 0.002, (baseY + layer * 50) * 0.002);
        const y = baseY + n * (height * 0.12);

        if (first) {
          ctx.moveTo(x, y);
          first = false;
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Renders subtle, delicate celestial pinpoint dust to convey a starry night sky.
   */
  public static renderCelestialDust(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    rng: SeededRandom,
    palette: ColorPalette,
    count = 120,
  ): void {
    ctx.save();

    for (let i = 0; i < count; i++) {
      const x = rng.range(0, width);
      const y = rng.range(0, height);
      const radius = rng.range(0.4, 1.2);
      const alpha = rng.range(0.08, 0.35);
      const color = rng.choice(palette.particleColors);

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = PaletteGenerator.hexToRgba(color, alpha);
      ctx.fill();
    }

    ctx.restore();
  }
}

