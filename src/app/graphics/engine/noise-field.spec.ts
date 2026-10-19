import { NoiseField2D } from './noise-field';
import { SeededRandom } from './seeded-random';

describe('NoiseField2D', () => {
  it('should return continuous output bounded in [-1.0, 1.0]', () => {
    const noise = new NoiseField2D(42);
    let min = 1.0;
    let max = -1.0;

    for (let x = -50; x <= 50; x += 2.5) {
      for (let y = -50; y <= 50; y += 2.5) {
        const val = noise.noise2D(x * 0.05, y * 0.05);
        expect(val).toBeGreaterThanOrEqual(-1.05); // Minor margin for precision
        expect(val).toBeLessThanOrEqual(1.05);
        if (val < min) min = val;
        if (val > max) max = val;
      }
    }

    // Verify reasonable dynamic range
    expect(min).toBeLessThan(-0.5);
    expect(max).toBeGreaterThan(0.5);
  });

  it('should exhibit spatial continuity with small coordinate steps', () => {
    const noise = new NoiseField2D(99);
    const step = 0.005;

    for (let x = 0; x < 5; x += 0.5) {
      const v1 = noise.noise2D(x, 1.5);
      const v2 = noise.noise2D(x + step, 1.5);
      const diff = Math.abs(v1 - v2);
      // Continuous function should have small differences for small steps
      expect(diff).toBeLessThan(0.05);
    }
  });

  it('should reproduce identical values when given identical seeds', () => {
    const noise1 = new NoiseField2D(777);
    const noise2 = new NoiseField2D(777);

    for (let i = 0; i < 20; i++) {
      const x = i * 0.37;
      const y = i * 0.81;
      expect(noise1.noise2D(x, y)).toBe(noise2.noise2D(x, y));
    }
  });

  it('should compute Fractal Brownian Motion (fBM) with multi-octave boundedness', () => {
    const noise = new NoiseField2D(12345);
    for (let i = 0; i < 30; i++) {
      const val = noise.fbm2D(i * 0.1, i * 0.2, 4);
      expect(val).toBeGreaterThanOrEqual(-1.1);
      expect(val).toBeLessThanOrEqual(1.1);
    }
  });
});

