import { SeededRandom } from './seeded-random';

describe('SeededRandom (Mulberry32 PRNG)', () => {
  it('should generate reproducible sequences from identical seeds', () => {
    const seed = 123456789;
    const rng1 = new SeededRandom(seed);
    const rng2 = new SeededRandom(seed);

    for (let i = 0; i < 50; i++) {
      expect(rng1.next()).toBe(rng2.next());
    }
  });

  it('should generate divergent sequences from different seeds', () => {
    const rng1 = new SeededRandom(1111);
    const rng2 = new SeededRandom(2222);

    const values1 = [rng1.next(), rng1.next(), rng1.next()];
    const values2 = [rng2.next(), rng2.next(), rng2.next()];

    expect(values1).not.toEqual(values2);
  });

  it('should generate values strictly within [0, 1)', () => {
    const rng = new SeededRandom(42);
    for (let i = 0; i < 500; i++) {
      const v = rng.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('should generate ranges and integer ranges within specified bounds', () => {
    const rng = new SeededRandom(999);
    for (let i = 0; i < 200; i++) {
      const r = rng.range(5.5, 12.5);
      expect(r).toBeGreaterThanOrEqual(5.5);
      expect(r).toBeLessThan(12.5);

      const intVal = rng.rangeInt(10, 20);
      expect(intVal).toBeGreaterThanOrEqual(10);
      expect(intVal).toBeLessThanOrEqual(20);
      expect(Number.isInteger(intVal)).toBe(true);
    }
  });

  it('should reset properly when reseed is called', () => {
    const rng = new SeededRandom(888);
    const firstFive = [rng.next(), rng.next(), rng.next(), rng.next(), rng.next()];

    rng.reseed();
    const replayFive = [rng.next(), rng.next(), rng.next(), rng.next(), rng.next()];

    expect(replayFive).toEqual(firstFive);
  });

  it('should pick and shuffle deterministically', () => {
    const arr = ['alpha', 'beta', 'gamma', 'delta', 'epsilon'];
    const rng1 = new SeededRandom(555);
    const rng2 = new SeededRandom(555);

    expect(rng1.choice(arr)).toBe(rng2.choice(arr));
    expect(rng1.shuffle(arr)).toEqual(rng2.shuffle(arr));
  });

  it('should generate Gaussian distribution with reasonable mean and standard deviation', () => {
    const rng = new SeededRandom(777);
    const mean = 10;
    const stdDev = 2;
    let sum = 0;
    const count = 1000;

    for (let i = 0; i < count; i++) {
      sum += rng.gaussian(mean, stdDev);
    }

    const sampleMean = sum / count;
    expect(sampleMean).toBeGreaterThan(9.5);
    expect(sampleMean).toBeLessThan(10.5);
  });
});

