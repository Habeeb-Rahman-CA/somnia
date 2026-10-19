/**
 * Somnia - Art Parameters Data Model
 * Defines the procedural generation variables derived from sleep records or user overrides.
 */

export interface ColorStop {
  offset: number; // 0 to 1
  color: string;
}

export interface ColorPalette {
  id: string;
  name: string;
  description: string;
  background: string;
  particleColors: string[];
  ambientGradients: [string, string][];
  accentColor: string;
}

export interface ArtParameters {
  /** Numeric seed used for deterministic pseudorandom generation */
  seed: number;
  /** Number of active particles traversing the flow field (e.g. 500 - 5000) */
  particleCount: number;
  /** Scale factor for the 2D Perlin/Simplex noise coordinates (e.g. 0.001 - 0.015) */
  noiseScale: number;
  /** Velocity magnitude for particles along vector lines (e.g. 0.5 - 6.0) */
  flowStrength: number;
  /** Opacity for individual particle line segments (e.g. 0.02 - 0.3) */
  lineOpacity: number;
  /** Fade rate per frame (higher value = shorter trails; e.g. 0.01 - 0.12) */
  trailFadeRate: number;
  /** Amplitude of organic wave distortions layered onto the flow field */
  waveAmplitude: number;
  /** Number of atmospheric background organic ribbon layers (e.g. 2 - 8) */
  layerDensity: number;
  /** Curl/vorticity factor imparting rotational turbulence (e.g. 0.0 - 2.0) */
  curlStrength: number;
  /** Chosen color palette */
  palette: ColorPalette;
  /** Render quality level affecting step resolution */
  quality: 'standard' | 'high' | 'ultra';
  /** How particle color varies (gradient, velocity, or sleep-stage mapped) */
  colorMode: 'palette-gradient' | 'velocity-mapped' | 'stage-harmonic';
  /** Base direction angle bias derived from wake time (radians) */
  directionBias: number;
}

/**
 * Explanation of how each parameter was derived from sleep record
 */
export interface MappingExplanation {
  particleCount: string;
  noiseScale: string;
  flowStrength: string;
  lineOpacity: string;
  trailFadeRate: string;
  waveAmplitude: string;
  layerDensity: string;
  palette: string;
  directionBias: string;
}

