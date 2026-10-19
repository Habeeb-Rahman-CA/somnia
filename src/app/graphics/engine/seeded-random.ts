/**
 * Somnia - Seeded Pseudorandom Number Generator
 *
 * Mathematical Foundation:
 * Implements the Mulberry32 algorithm, a 32-bit generator with a state of 32 bits
 * and period of 2^32 (~4.29 billion values). Mulberry32 features excellent statistical
 * randomness, passes the TestU01 BigCrush suite, and avoids common modulo biases.
 *
 * Why Seeded PRNG is Critical in Generative Art:
 * Javascript's native `Math.random()` is non-deterministic and unseeded; calling it
 * produces unpredictable results that cannot be reproduced across reloads, devices,
 * or export passes. Mulberry32 guarantees that given the exact same seed integer, the exact
 * sequence of numbers is generated every time.
 */

export class SeededRandom {
  private state: number;
  private initialSeed: number;

  constructor(seed: number) {
    this.initialSeed = seed | 0;
    this.state = this.initialSeed;
  }

  /**
   * Resets the generator to the initial seed or a new seed.
   */
  public reseed(seed?: number): void {
    if (seed !== undefined) {
      this.initialSeed = seed | 0;
      this.state = seed | 0;
    } else {
      this.state = this.initialSeed;
    }
  }

  /**
   * Returns current seed.
   */
  public getSeed(): number {
    return this.initialSeed;
  }

  /**
   * Generates a deterministic pseudorandom float in [0, 1).
   *
   * Formula:
   * State advances by the golden ratio fraction constant: 0x6D2B79F5 (1831433717).
   * Two stages of bitwise integer multiplication (Math.imul) and XOR shifts
   * avalanche bits across the full 32-bit integer before unsigned division by 2^32.
   */
  public next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Generates a floating point number in [min, max).
   */
  public range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /**
   * Generates an integer in [min, max] inclusive.
   */
  public rangeInt(min: number, max: number): number {
    const f = this.next();
    return Math.floor(min + f * (max - min + 1));
  }

  /**
   * Picks a random element from an array deterministically.
   */
  public choice<T>(array: readonly T[]): T {
    if (array.length === 0) {
      throw new Error('Cannot pick from empty array');
    }
    const index = Math.floor(this.next() * array.length);
    return array[index];
  }

  /**
   * Shuffles an array in place using the Fisher-Yates algorithm.
   */
  public shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
    return arr;
  }

  /**
   * Generates a normally distributed value with given mean and standard deviation
   * using the Box-Muller transform:
   * Z = sqrt(-2 * ln(U1)) * cos(2 * PI * U2)
   */
  public gaussian(mean = 0, stdDev = 1): number {
    let u1 = this.next();
    const u2 = this.next();
    // Avoid ln(0)
    while (u1 <= 1e-15) {
      u1 = this.next();
    }
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z0 * stdDev + mean;
  }
}
