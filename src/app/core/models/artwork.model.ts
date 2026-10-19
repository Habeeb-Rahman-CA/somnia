/**
 * Somnia - Artwork Data Model
 * Versioned configuration and persistence structures for reproducible generative art.
 */

import { ArtParameters } from './art-parameters.model';
import { SleepRecord } from './sleep-record.model';

export const CURRENT_GENERATOR_VERSION = '1.0.0';

export interface GenerationConfig {
  generatorVersion: string;
  seed: number;
  parameters: ArtParameters;
  /** Normalized reference dimensions for canvas simulation space */
  referenceWidth: number;
  referenceHeight: number;
  /** Fixed number of simulation steps for reproducible static exports */
  simulationSteps: number;
  /** Fixed timestep delta in seconds (e.g. 1/60) */
  fixedTimeStep: number;
}

export interface SavedArtwork {
  id: string;
  title: string;
  createdAt: number;
  generatorVersion: string;
  seed: number;
  config: GenerationConfig;
  /** Optional linked sleep record or snapshot */
  sleepRecord?: SleepRecord;
  /** Thumbnail image preview for gallery (PNG/WebP data URL or blob) */
  thumbnailDataUrl?: string;
  /** User-added reflections or tags */
  notes?: string;
}

export interface ExportOptions {
  format: 'png' | 'svg';
  width: number;
  height: number;
  simulationSteps?: number;
  transparentBackground?: boolean;
  includeWatermark?: boolean;
}

