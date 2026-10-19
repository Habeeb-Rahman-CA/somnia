/**
 * Somnia - Flow Field Engine
 *
 * Mathematical Foundations:
 * A flow field (or vector field) assigns a 2D velocity vector V(x, y) = [vx, vy]
 * to every coordinate (x, y) in continuous 2D space.
 *
 * Vector Derivation:
 * 1. Coordinates are scaled into the noise frequency domain:
 *      nx = x * scale
 *      ny = y * scale
 * 2. Continuous noise value n in [-1, 1] is extracted from NoiseField2D.
 * 3. Local flow angle θ is mapped across full circular rotation [0, 2π]:
 *      θ = (n * π) + directionBias + waveModulation
 *    Where directionBias shifts global flow drift (derived from wake time),
 *    and waveModulation adds harmonic undulations:
 *      waveModulation = sin(y * 0.005 + timeOffset) * waveAmplitude
 * 4. Velocity vector components are extracted via unit circle trigonometric projections:
 *      vx = cos(θ) * flowStrength
 *      vy = sin(θ) * flowStrength
 *
 * Curl Noise (Incompressible Fluid Flow):
 * To prevent all particles from collapsing into singular sinks or clumping together,
 * a curl noise term is applied. For a 2D scalar potential function ψ(x, y), its curl is:
 *      V_curl = (∂ψ/∂y, -∂ψ/∂x)
 * Because div(curl(ψ)) = 0, this yields divergence-free particle paths that swirl
 * gracefully without crowding into empty dead zones.
 */

import { NoiseField2D } from './noise-field';
import { ArtParameters } from '../../core/models/art-parameters.model';

export interface FlowVector {
  vx: number;
  vy: number;
  angle: number;
  speed: number;
}

export class FlowField {
  private readonly noise: NoiseField2D;
  private readonly params: ArtParameters;
  private readonly eps = 1.0; // Finite difference step for curl calculation

  constructor(noise: NoiseField2D, params: ArtParameters) {
    this.noise = noise;
    this.params = params;
  }

  /**
   * Evaluates the vector at world coordinate (x, y).
   *
   * @param x Horizontal coordinate
   * @param y Vertical coordinate
   * @param timeOffset Slow time evolution offset for gentle dynamic breathing
   */
  public evaluate(x: number, y: number, timeOffset = 0): FlowVector {
    const scale = this.params.noiseScale;
    const flowStrength = this.params.flowStrength;

    // Base continuous noise angle
    const n = this.noise.noise2D(x * scale, y * scale + timeOffset * 0.05);
    let angle = n * Math.PI * 2.0;

    // Directional bias derived from bedtime & wake time
    if (this.params.directionBias) {
      angle += this.params.directionBias;
    }

    // Harmonic wave modulation (dream wave undulation)
    if (this.params.waveAmplitude > 0) {
      const wave = Math.sin(y * scale * 2.0 + timeOffset * 0.5) * this.params.waveAmplitude;
      angle += wave;
    }

    // Curl noise component if enabled
    if (this.params.curlStrength > 0) {
      // Finite difference approximation for ∂n/∂x and ∂n/∂y
      const nRight = this.noise.noise2D((x + this.eps) * scale, y * scale);
      const nLeft = this.noise.noise2D((x - this.eps) * scale, y * scale);
      const nDown = this.noise.noise2D(x * scale, (y + this.eps) * scale);
      const nUp = this.noise.noise2D(x * scale, (y - this.eps) * scale);

      const dndx = (nRight - nLeft) / (2.0 * this.eps);
      const dndy = (nDown - nUp) / (2.0 * this.eps);

      // In 2D, curl of scalar potential ψ is (∂ψ/∂y, -∂ψ/∂x)
      const curlVx = dndy * 50.0 * this.params.curlStrength;
      const curlVy = -dndx * 50.0 * this.params.curlStrength;

      const baseVx = Math.cos(angle);
      const baseVy = Math.sin(angle);

      const blendedVx = baseVx + curlVx;
      const blendedVy = baseVy + curlVy;

      const blendedAngle = Math.atan2(blendedVy, blendedVx);
      return {
        vx: blendedVx * flowStrength,
        vy: blendedVy * flowStrength,
        angle: blendedAngle,
        speed: flowStrength,
      };
    }

    return {
      vx: Math.cos(angle) * flowStrength,
      vy: Math.sin(angle) * flowStrength,
      angle,
      speed: flowStrength,
    };
  }
}

