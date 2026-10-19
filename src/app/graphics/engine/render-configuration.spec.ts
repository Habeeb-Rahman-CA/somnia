import { RenderConfigurationHelper } from './render-configuration';
import { CURRENT_GENERATOR_VERSION } from '../../core/models/artwork.model';

describe('RenderConfiguration & Deterministic Simulation', () => {
  it('should create default parameters with valid defaults', () => {
    const params = RenderConfigurationHelper.createDefaultParameters(1234);
    expect(params.seed).toBe(1234);
    expect(params.particleCount).toBeGreaterThan(0);
    expect(params.noiseScale).toBeGreaterThan(0);
    expect(params.palette).toBeDefined();
    expect(params.palette.particleColors.length).toBeGreaterThan(0);
  });

  it('should create versioned GenerationConfig', () => {
    const params = RenderConfigurationHelper.createDefaultParameters(5678);
    const config = RenderConfigurationHelper.createConfig(params, 1200, 800, 200);

    expect(config.generatorVersion).toBe(CURRENT_GENERATOR_VERSION);
    expect(config.seed).toBe(5678);
    expect(config.referenceWidth).toBe(1200);
    expect(config.referenceHeight).toBe(800);
    expect(config.simulationSteps).toBe(200);
    expect(config.fixedTimeStep).toBeCloseTo(1 / 60);
  });

  it('should execute deterministic simulation on a canvas without errors', () => {
    const canvas = document.createElement('canvas');
    const params = RenderConfigurationHelper.createDefaultParameters(999);
    params.particleCount = 50; // Low count for quick unit test
    const config = RenderConfigurationHelper.createConfig(params, 400, 300, 10);

    expect(() => {
      RenderConfigurationHelper.renderDeterministicComposition(canvas, config, 400, 300);
    }).not.toThrow();

    expect(canvas.width).toBe(400);
    expect(canvas.height).toBe(300);
  });
});

