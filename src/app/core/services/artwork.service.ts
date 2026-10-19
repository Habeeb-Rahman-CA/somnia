/**
 * Somnia - Artwork State Management Service
 * Coordinates sleep record inputs, active generative art parameters, manual adjustments,
 * and reproduction workflows.
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SleepRecord } from '../models/sleep-record.model';
import {
  ArtParameters,
  MappingExplanation,
} from '../models/art-parameters.model';
import {
  SavedArtwork,
  GenerationConfig,
  CURRENT_GENERATOR_VERSION,
} from '../models/artwork.model';
import { SleepDataService } from './sleep-data.service';
import { VisualMapperService } from './visual-mapper.service';
import { SleepRepositoryService } from './sleep-repository.service';
import { RenderConfigurationHelper } from '../../graphics/engine/render-configuration';

@Injectable({
  providedIn: 'root',
})
export class ArtworkService {
  private currentSleepRecordSubject = new BehaviorSubject<SleepRecord | null>(null);
  public currentSleepRecord$: Observable<SleepRecord | null> =
    this.currentSleepRecordSubject.asObservable();

  private currentParametersSubject = new BehaviorSubject<ArtParameters>(
    RenderConfigurationHelper.createDefaultParameters(),
  );
  public currentParameters$: Observable<ArtParameters> =
    this.currentParametersSubject.asObservable();

  private currentExplanationSubject = new BehaviorSubject<MappingExplanation | null>(null);
  public currentExplanation$: Observable<MappingExplanation | null> =
    this.currentExplanationSubject.asObservable();

  private activeArtworkSubject = new BehaviorSubject<SavedArtwork | null>(null);
  public activeArtwork$: Observable<SavedArtwork | null> =
    this.activeArtworkSubject.asObservable();

  constructor(
    private sleepDataService: SleepDataService,
    private visualMapperService: VisualMapperService,
    private repository: SleepRepositoryService,
  ) {
    // Initialize with healthy default sleep record
    const defaultRecord = this.sleepDataService.createDefaultRecord();
    this.setSleepRecord(defaultRecord);
  }

  /**
   * Sets sleep record and generates derived art parameters.
   */
  public setSleepRecord(record: SleepRecord): void {
    this.currentSleepRecordSubject.next(record);
    const { parameters, explanation } =
      this.visualMapperService.mapSleepToArtParameters(record);
    this.currentParametersSubject.next(parameters);
    this.currentExplanationSubject.next(explanation);
  }

  /**
   * Returns current active parameters synchronously.
   */
  public getCurrentParameters(): ArtParameters {
    return this.currentParametersSubject.value;
  }

  /**
   * Returns current sleep record synchronously.
   */
  public getCurrentSleepRecord(): SleepRecord | null {
    return this.currentSleepRecordSubject.value;
  }

  /**
   * Allows user to manually customize artistic parameters without mutating original sleep data.
   */
  public updateParameters(partial: Partial<ArtParameters>): void {
    const current = this.currentParametersSubject.value;
    const updated = { ...current, ...partial };
    this.currentParametersSubject.next(updated);
  }

  /**
   * Generates a new pseudorandom seed.
   */
  public reseed(newSeed?: number): number {
    const seed = newSeed !== undefined ? newSeed : Math.floor(Math.random() * 2147483647);
    this.updateParameters({ seed });
    return seed;
  }

  /**
   * Resets artistic parameters back to default sleep mappings.
   */
  public resetToSleepDefaults(): void {
    const record = this.currentSleepRecordSubject.value;
    if (record) {
      const { parameters, explanation } =
        this.visualMapperService.mapSleepToArtParameters(record);
      this.currentParametersSubject.next(parameters);
      this.currentExplanationSubject.next(explanation);
    } else {
      this.currentParametersSubject.next(
        RenderConfigurationHelper.createDefaultParameters(),
      );
    }
  }

  /**
   * Saves current composition configuration to IndexedDB.
   */
  public async saveCurrentArtwork(
    title: string,
    thumbnailDataUrl?: string,
    notes?: string,
  ): Promise<SavedArtwork> {
    const params = this.getCurrentParameters();
    const sleepRecord = this.getCurrentSleepRecord() || undefined;

    const config: GenerationConfig = {
      generatorVersion: CURRENT_GENERATOR_VERSION,
      seed: params.seed,
      parameters: { ...params },
      referenceWidth: 1200,
      referenceHeight: 800,
      simulationSteps: 300,
      fixedTimeStep: 1 / 60,
    };

    const savedArtwork: SavedArtwork = {
      id: 'art_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      title: title.trim() || `Dream Composition #${params.seed.toString(16).toUpperCase()}`,
      createdAt: Date.now(),
      generatorVersion: CURRENT_GENERATOR_VERSION,
      seed: params.seed,
      config,
      sleepRecord,
      thumbnailDataUrl,
      notes,
    };

    await this.repository.saveArtwork(savedArtwork);
    return savedArtwork;
  }

  /**
   * Loads an existing artwork, restoring its exact seed, configuration, and sleep context.
   */
  public reproduceArtwork(artwork: SavedArtwork): void {
    this.activeArtworkSubject.next(artwork);
    if (artwork.sleepRecord) {
      this.currentSleepRecordSubject.next(artwork.sleepRecord);
      const { explanation } = this.visualMapperService.mapSleepToArtParameters(
        artwork.sleepRecord,
      );
      this.currentExplanationSubject.next(explanation);
    }
    this.currentParametersSubject.next({ ...artwork.config.parameters });
  }

  public setActiveArtwork(artwork: SavedArtwork | null): void {
    this.activeArtworkSubject.next(artwork);
  }
}

