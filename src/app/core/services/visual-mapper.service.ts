/**
 * Somnia - Visual Parameter Mapper Service
 *
 * Implements pure mapping algorithms translating SleepRecord domain objects
 * into visual generative parameters.
 *
 * Artistic Transformation Principles:
 * - Sleep Duration -> Particle Count & Visual Density:
 *   Normalized across 4h to 10h. Longer, deeper sleep yields higher particle
 *   density and finer, intricate filaments.
 * - Bedtime -> Color Palette & Ambient Atmosphere:
 *   Early nocturnal bedtimes evoke serene twilight velvet or starry gold;
 *   Midnight hours evoke deep cosmic indigo & lucid lavender;
 *   Late night hours evoke deep abyssal cyan and neon aurora currents.
 * - Wake Time -> Global Flow Direction Bias:
 *   Angle θ = (wakeHour / 24) * 2π gives a compass direction orienting the
 *   flow vector toward dawn.
 * - Optional Sleep Stages:
 *   Deep sleep increases atmospheric ribbon layer density and reduces turbulence;
 *   REM sleep amplifies curl vorticity and harmonic wave amplitude (vivid dreaming);
 *   Awake time subtly raises opacity and texture contrast.
 */

import { Injectable } from '@angular/core';
import {
  SleepRecord,
  SleepStageProportions,
} from '../models/sleep-record.model';
import {
  ArtParameters,
  ColorPalette,
  MappingExplanation,
} from '../models/art-parameters.model';
import { DREAM_PALETTES, PaletteGenerator } from '../../graphics/algorithms/palette-generator';

@Injectable({
  providedIn: 'root',
})
export class VisualMapperService {
  /**
   * Deterministic 32-bit FNV-1a hash generator from string input.
   */
  public generateNumericSeed(seedString: string): number {
    let hash = 0x811c9dc5;
    for (let i = 0; i < seedString.length; i++) {
      hash ^= seedString.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0); // Convert to unsigned 32-bit integer
  }

  /**
   * Pure mapping function: SleepRecord -> ArtParameters
   */
  public mapSleepToArtParameters(record: SleepRecord): {
    parameters: ArtParameters;
    explanation: MappingExplanation;
  } {
    const timeInBed = record.timeInBedMinutes || 480;
    const effectiveSleep =
      record.actualSleepMinutes ||
      (record.awakeMinutes !== undefined
        ? Math.max(60, timeInBed - record.awakeMinutes)
        : timeInBed);

    // 1. Particle count & density from effective sleep duration
    // Normalize duration: 4 hours (240m) = 0.0, 10 hours (600m) = 1.0
    const durationNorm = Math.max(0, Math.min(1, (effectiveSleep - 240) / 360));
    const particleCount = Math.floor(1000 + durationNorm * 2200); // 1000 to 3200

    // 2. Bedtime mapping to Color Palette
    const [bedHour, bedMin] = record.bedtime.split(':').map(Number);
    const bedDecimal = (bedHour || 23) + (bedMin || 0) / 60;
    const palette = this.selectPaletteForBedtime(bedDecimal);

    // 3. Wake-up time mapping to direction bias
    const [wakeHour, wakeMin] = record.wakeTime.split(':').map(Number);
    const wakeDecimal = (wakeHour || 7) + (wakeMin || 0) / 60;
    // Circular angle mapping: 0 to 2π
    const directionBias = ((wakeDecimal % 24) / 24) * Math.PI * 2;

    // 4. Optional Sleep Stage Proportions
    const total = timeInBed || 1;
    const hasStages =
      (record.deepSleepMinutes && record.deepSleepMinutes > 0) ||
      (record.remSleepMinutes && record.remSleepMinutes > 0);

    const deepRatio = (record.deepSleepMinutes || 0) / total;
    const remRatio = (record.remSleepMinutes || 0) / total;
    const awakeRatio = (record.awakeMinutes || 0) / total;

    // 5. Noise Scale & Flow Strength
    // Deep sleep brings calm, slower, broader waves; REM brings dynamic curling
    const noiseScale = hasStages
      ? 0.0025 + remRatio * 0.004
      : 0.0035;

    const flowStrength = hasStages
      ? Math.max(1.2, 2.8 - deepRatio * 1.5 + remRatio * 1.0)
      : 2.2;

    // 6. Wave amplitude and Curl strength
    const waveAmplitude = hasStages ? 0.2 + remRatio * 0.8 : 0.4;
    const curlStrength = hasStages ? 0.15 + remRatio * 0.6 : 0.35;

    // 7. Layer density
    const layerDensity = hasStages
      ? Math.min(6, Math.max(2, Math.round(3 + deepRatio * 6)))
      : 4;

    // 8. Line opacity & trail fade
    const lineOpacity = Math.max(
      0.04,
      Math.min(0.18, 0.07 + awakeRatio * 0.1),
    );
    const trailFadeRate = 0.03;

    // Deterministic seed derived from sleep session metadata
    const seedInput = `${record.date}_${record.bedtime}_${record.wakeTime}_${effectiveSleep}`;
    const seed = this.generateNumericSeed(seedInput);

    const parameters: ArtParameters = {
      seed,
      particleCount,
      noiseScale,
      flowStrength,
      lineOpacity,
      trailFadeRate,
      waveAmplitude,
      layerDensity,
      curlStrength,
      palette,
      quality: 'high',
      colorMode: hasStages ? 'stage-harmonic' : 'palette-gradient',
      directionBias,
    };

    const explanation: MappingExplanation = {
      particleCount: `Derived from ${Math.round(effectiveSleep / 60)}h ${effectiveSleep % 60}m sleep: maps to ${particleCount} active tracer particles.`,
      palette: `Bedtime at ${record.bedtime} selects the "${palette.name}" palette (${palette.description}).`,
      directionBias: `Wake-up at ${record.wakeTime} orients vector trajectory at ${(directionBias * (180 / Math.PI)).toFixed(1)}° towards dawn.`,
      noiseScale: hasStages
        ? `REM ratio (${Math.round(remRatio * 100)}%) shapes noise frequency to ${noiseScale.toFixed(4)}.`
        : `Default atmospheric noise scale set to ${noiseScale}.`,
      flowStrength: hasStages
        ? `Deep sleep (${Math.round(deepRatio * 100)}%) anchors fluid speed to ${flowStrength.toFixed(2)}.`
        : `Balanced fluid flow strength set to ${flowStrength}.`,
      waveAmplitude: hasStages
        ? `Dream activity (REM ${Math.round(remRatio * 100)}%) modulates wave amplitude to ${waveAmplitude.toFixed(2)}.`
        : `Standard harmonic undulation set to ${waveAmplitude}.`,
      layerDensity: hasStages
        ? `Deep sleep restorative depth layers ${layerDensity} background contour ribbons.`
        : `4 atmospheric contour ribbon strata.`,
      lineOpacity: `Line opacity set to ${lineOpacity.toFixed(2)} (influenced by ${Math.round(awakeRatio * 100)}% wakefulness).`,
      trailFadeRate: `Fade rate ${trailFadeRate} maintains luminous trails that gently disperse.`,
    };

    return { parameters, explanation };
  }

  /**
   * Selects an aesthetic dreamy palette based on bedtime hour.
   */
  private selectPaletteForBedtime(bedDecimal: number): ColorPalette {
    if (bedDecimal >= 20.0 && bedDecimal < 22.0) {
      return DREAM_PALETTES['twilight-velvet'];
    } else if (bedDecimal >= 22.0 && bedDecimal < 23.5) {
      return DREAM_PALETTES['midnight-nebula'];
    } else if (bedDecimal >= 23.5 || bedDecimal < 1.0) {
      return DREAM_PALETTES['lucid-lavender'];
    } else if (bedDecimal >= 1.0 && bedDecimal < 3.0) {
      return DREAM_PALETTES['deep-rem-cyan'];
    } else if (bedDecimal >= 3.0 && bedDecimal < 5.0) {
      return DREAM_PALETTES['aurora-borealis'];
    } else {
      return DREAM_PALETTES['starlight-glow'];
    }
  }
}

