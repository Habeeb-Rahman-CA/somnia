/**
 * Somnia - Artwork Exporter Service
 *
 * Implements high-resolution deterministic PNG export via offscreen canvas rendering
 * and genuine vector SVG export tracing mathematical particle paths.
 */

import { Injectable } from '@angular/core';
import { GenerationConfig } from '../models/artwork.model';
import { RenderConfigurationHelper } from '../../graphics/engine/render-configuration';
import { SeededRandom } from '../../graphics/engine/seeded-random';
import { NoiseField2D } from '../../graphics/engine/noise-field';
import { FlowField } from '../../graphics/engine/flow-field';
import { ParticleSystem } from '../../graphics/engine/particle-system';
import { PaletteGenerator } from '../../graphics/algorithms/palette-generator';

@Injectable({
  providedIn: 'root',
})
export class ArtworkExporterService {
  /**
   * Renders and exports a high-resolution deterministic PNG image.
   *
   * @param config The generation configuration
   * @param targetWidth Output image pixel width (e.g. 2400 for 2K, 3840 for 4K)
   * @param targetHeight Output image pixel height (e.g. 1600 for 2K, 2160 for 4K)
   * @param filename Desired download filename
   */
  public async exportHighResPng(
    config: GenerationConfig,
    targetWidth = 2400,
    targetHeight = 1600,
    filename = 'somnia-dream-art.png',
  ): Promise<void> {
    if (typeof document === 'undefined') return;

    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = targetWidth;
    offscreenCanvas.height = targetHeight;

    // Execute deterministic fixed-step simulation
    RenderConfigurationHelper.renderDeterministicComposition(
      offscreenCanvas,
      config,
      targetWidth,
      targetHeight,
    );

    return new Promise<void>((resolve, reject) => {
      offscreenCanvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to generate PNG blob'));
          return;
        }
        this.triggerDownload(blob, filename);
        resolve();
      }, 'image/png');
    });
  }

  /**
   * Generates genuine vector SVG markup containing XML vector paths.
   */
  public exportVectorSvg(
    config: GenerationConfig,
    targetWidth = 1200,
    targetHeight = 800,
    filename = 'somnia-dream-art.svg',
  ): void {
    if (typeof document === 'undefined') return;

    const params = config.parameters;
    const rng = new SeededRandom(config.seed);
    const noise = new NoiseField2D(rng);
    const flowField = new FlowField(noise, params);

    const particleSystem = new ParticleSystem(
      params,
      flowField,
      rng,
      targetWidth,
      targetHeight,
      'respawn',
    );

    const totalSteps = Math.min(180, config.simulationSteps || 200);
    const colors = params.palette.particleColors;

    // Group path segments by color to keep SVG clean and performant
    const pathSegmentsByColor: Map<string, string[]> = new Map();
    for (const c of colors) {
      pathSegmentsByColor.set(c, []);
    }

    const dt = config.fixedTimeStep || 1 / 60;
    for (let s = 0; s < totalSteps; s++) {
      const timeSec = s * dt;
      particleSystem.step(timeSec);
      const particles = particleSystem.getParticles();

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = p.x - p.prevX;
        const dy = p.y - p.prevY;
        if (dx * dx + dy * dy > 400) continue;

        const colorHex = colors[p.colorIndex % colors.length];
        const seg = `M${p.prevX.toFixed(1)},${p.prevY.toFixed(1)}L${p.x.toFixed(1)},${p.y.toFixed(1)}`;
        pathSegmentsByColor.get(colorHex)?.push(seg);
      }
    }

    let pathsSvg = '';
    const opacity = params.lineOpacity.toFixed(3);
    for (const [color, segs] of pathSegmentsByColor.entries()) {
      if (segs.length > 0) {
        pathsSvg += `<path d="${segs.join(' ')}" stroke="${color}" stroke-opacity="${opacity}" stroke-width="1.0" fill="none" stroke-linecap="round"/>\n`;
      }
    }

    const svgContent = `<?xml version="1.0" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${targetWidth} ${targetHeight}" width="${targetWidth}" height="${targetHeight}">
  <rect width="${targetWidth}" height="${targetHeight}" fill="${params.palette.background}"/>
  ${pathsSvg}
</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    this.triggerDownload(blob, filename);
  }

  /**
   * Triggers a browser file download from a Blob.
   */
  public triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
}

