import { ParticleSystem } from './particle-system';
import { FlowField } from './flow-field';
import { NoiseField2D } from './noise-field';
import { SeededRandom } from './seeded-random';
import { RenderConfigurationHelper } from './render-configuration';

describe('ParticleSystem', () => {
  const width = 800;
  const height = 600;

  it('should initialize a bounded particle pool matching requested particle count', () => {
    const params = RenderConfigurationHelper.createDefaultParameters(12345);
    params.particleCount = 500;
    const rng = new SeededRandom(params.seed);
    const noise = new NoiseField2D(rng);
    const flowField = new FlowField(noise, params);

    const system = new ParticleSystem(params, flowField, rng, width, height, 'respawn');
    const particles = system.getParticles();

    expect(particles.length).toBe(500);
    for (const p of particles) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(width);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(height);
    }
  });

  it('should update particle positions along flow field vectors without growing memory', () => {
    const params = RenderConfigurationHelper.createDefaultParameters(42);
    params.particleCount = 50;
    const rng = new SeededRandom(params.seed);
    const noise = new NoiseField2D(rng);
    const flowField = new FlowField(noise, params);

    const system = new ParticleSystem(params, flowField, rng, width, height, 'respawn');
    const p0 = system.getParticles()[0];
    const initialX = p0.x;
    const initialY = p0.y;

    system.step(0.1);
    expect(system.getStepsSimulated()).toBe(1);
    expect(p0.prevX).toBe(initialX);
    expect(p0.prevY).toBe(initialY);

    // After movement, positions should have evolved
    expect(p0.x).not.toBe(initialX);
    expect(system.getParticles().length).toBe(50); // Bound preserved
  });

  it('should recycle out-of-bounds particles within boundary limits in respawn mode', () => {
    const params = RenderConfigurationHelper.createDefaultParameters(999);
    params.particleCount = 10;
    const rng = new SeededRandom(params.seed);
    const noise = new NoiseField2D(rng);
    const flowField = new FlowField(noise, params);

    const system = new ParticleSystem(params, flowField, rng, width, height, 'respawn');
    const p = system.getParticles()[0];

    // Force particle outside screen bounds
    p.x = 9999;
    p.y = 9999;

    system.step(0.2);

    // Particle should have been respawned within boundary
    expect(p.x).toBeGreaterThanOrEqual(0);
    expect(p.x).toBeLessThanOrEqual(width);
    expect(p.y).toBeGreaterThanOrEqual(0);
    expect(p.y).toBeLessThanOrEqual(height);
    expect(p.age).toBe(0);
  });

  it('should wrap particles across edges in wrap mode while resetting prev coordinates', () => {
    const params = RenderConfigurationHelper.createDefaultParameters(888);
    params.particleCount = 5;
    const rng = new SeededRandom(params.seed);
    const noise = new NoiseField2D(rng);
    const flowField = new FlowField(noise, params);

    const system = new ParticleSystem(params, flowField, rng, width, height, 'wrap');
    const p = system.getParticles()[0];

    // Force particle past right edge
    p.x = width + 50;
    p.y = 300;

    system.step(0.1);

    expect(p.x).toBeLessThan(width);
    // Discontinuity guard: prevX must equal x so no screen-crossing line is drawn
    expect(p.prevX).toBe(p.x);
  });
});

