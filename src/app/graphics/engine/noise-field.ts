/**
 * Somnia - 2D Simplex Noise Field
 *
 * Mathematical Foundations:
 * Implements 2D Simplex Noise (Ken Perlin, 2001) seeded deterministically by SeededRandom.
 *
 * Simplex Geometry:
 * Instead of subdividing 2D space into rectangular squares (as in classic Perlin noise),
 * Simplex noise tessellates 2D space into a grid of equilateral triangles (simplices).
 * A point (x, y) is mapped into the simplex grid via coordinate skewing:
 *
 * Skew Factor:
 *   F = (sqrt(3) - 1) / 2 ≈ 0.3660254037844386
 *   s = (x + y) * F
 *   i = floor(x + s), j = floor(y + s)
 *
 * Unskew Factor:
 *   G = (3 - sqrt(3)) / 6 ≈ 0.2113248654051871
 *   t = (i + j) * G
 *   X0 = i - t, Y0 = j - t
 *   x0 = x - X0, y0 = y - Y0  (internal offset from origin of simplex)
 *
 * Kernel Contribution:
 * For each of the 3 corners of the containing simplex triangle:
 *   r^2 = 0.5 - dx^2 - dy^2
 *   If r^2 > 0:
 *     contribution = (r^2)^4 * (grad.x * dx + grad.y * dy)
 * The output is normalized to strictly fall within [-1.0, 1.0].
 *
 * Mathematical Continuity:
 * The radial kernel (0.5 - r^2)^4 yields zero contribution and zero derivative
 * at the outer radius (r = sqrt(0.5)), guaranteeing C1 continuity (continuous gradients)
 * with no sharp creases or grid-line seams.
 *
 * Influence of Noise Scale on Generative Composition:
 * - Low Scale (< 0.002): Large wavelength; creates majestic, sweeping, laminar current
 *   trajectories with minimal twists. Feels peaceful, deep, and slow.
 * - Medium Scale (0.003 - 0.007): Natural balance of fluid eddies, wandering streams,
 *   resembling atmospheric cirrus clouds or oceanic thermals.
 * - High Scale (> 0.009): Short wavelength; produces intricate, tightly coiled vortices,
 *   turbulent whorls, and high-frequency textural ribbons.
 */

import { SeededRandom } from './seeded-random';

export class NoiseField2D {
  private readonly perm: Uint8Array = new Uint8Array(512);
  private readonly permMod12: Uint8Array = new Uint8Array(512);

  // 12 gradient directions in 2D
  private static readonly GRAD3: ReadonlyArray<readonly [number, number]> = [
    [1, 1],
    [-1, 1],
    [1, -1],
    [-1, -1],
    [1, 0],
    [-1, 0],
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [0, 1],
    [0, -1],
  ];

  // Skewing and unskewing factors for 2D
  private static readonly F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
  private static readonly G2 = (3.0 - Math.sqrt(3.0)) / 6.0;

  constructor(rngOrSeed: SeededRandom | number) {
    const rng = typeof rngOrSeed === 'number' ? new SeededRandom(rngOrSeed) : rngOrSeed;
    this.initPermutation(rng);
  }

  /**
   * Initializes the permutation table deterministically from the PRNG.
   */
  private initPermutation(rng: SeededRandom): void {
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
      p[i] = i;
    }
    // Fisher-Yates shuffle with deterministic PRNG
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(rng.next() * (i + 1));
      const tmp = p[i];
      p[i] = p[j];
      p[j] = tmp;
    }
    for (let i = 0; i < 512; i++) {
      this.perm[i] = p[i & 255];
      this.permMod12[i] = this.perm[i] % 12;
    }
  }

  /**
   * Computes 2D Simplex Noise value at continuous coordinates (x, y).
   * Returns a value in [-1.0, 1.0].
   */
  public noise2D(x: number, y: number): number {
    // Skew the input space to determine which simplex cell we are in
    const s = (x + y) * NoiseField2D.F2;
    const i = Math.floor(x + s);
    const j = Math.floor(y + s);

    const t = (i + j) * NoiseField2D.G2;
    const X0 = i - t; // Unskew cell origin back to (x, y) space
    const Y0 = j - t;
    const x0 = x - X0; // Distances from cell origin
    const y0 = y - Y0;

    // Determine which simplex triangle we are in (upper or lower)
    let i1: number;
    let j1: number;
    if (x0 > y0) {
      i1 = 1;
      j1 = 0;
    } else {
      i1 = 0;
      j1 = 1;
    }

    // Offsets for middle corner
    const x1 = x0 - i1 + NoiseField2D.G2;
    const y1 = y0 - j1 + NoiseField2D.G2;
    // Offsets for last corner
    const x2 = x0 - 1.0 + 2.0 * NoiseField2D.G2;
    const y2 = y0 - 1.0 + 2.0 * NoiseField2D.G2;

    // Wrap indices to [0, 255]
    const ii = i & 255;
    const jj = j & 255;

    // Calculate contribution from three corners
    let n0 = 0.0;
    let n1 = 0.0;
    let n2 = 0.0;

    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 > 0) {
      t0 *= t0;
      const gi0 = this.permMod12[ii + this.perm[jj]];
      const grad0 = NoiseField2D.GRAD3[gi0];
      n0 = t0 * t0 * (grad0[0] * x0 + grad0[1] * y0);
    }

    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 > 0) {
      t1 *= t1;
      const gi1 = this.permMod12[ii + i1 + this.perm[jj + j1]];
      const grad1 = NoiseField2D.GRAD3[gi1];
      n1 = t1 * t1 * (grad1[0] * x1 + grad1[1] * y1);
    }

    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 > 0) {
      t2 *= t2;
      const gi2 = this.permMod12[ii + 1 + this.perm[jj + 1]];
      const grad2 = NoiseField2D.GRAD3[gi2];
      n2 = t2 * t2 * (grad2[0] * x2 + grad2[1] * y2);
    }

    // Scale result to [-1, 1] range: 70.14805770653953 is the theoretical normalizer
    return 70.0 * (n0 + n1 + n2);
  }

  /**
   * Computes Fractal Brownian Motion (fBM) multi-octave noise.
   * Superimposes multiple harmonic octaves with diminishing amplitudes (persistence)
   * and increasing spatial frequencies (lacunarity).
   *
   * @param x Coordinate X
   * @param y Coordinate Y
   * @param octaves Number of layered octaves (default: 3)
   * @param lacunarity Frequency multiplier per octave (default: 2.0)
   * @param persistence Amplitude multiplier per octave (default: 0.5)
   */
  public fbm2D(
    x: number,
    y: number,
    octaves = 3,
    lacunarity = 2.0,
    persistence = 0.5,
  ): number {
    let total = 0;
    let frequency = 1.0;
    let amplitude = 1.0;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      total += this.noise2D(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= lacunarity;
    }

    return total / maxValue;
  }
}

