/**
 * Somnia - Sleep Record Data Models
 * Represents validated sleep data used as input for generative art mapping.
 */

export interface SleepRecord {
  /** Unique identifier for the sleep record */
  id: string;
  /** Date of sleep in YYYY-MM-DD format (representing the evening sleep started) */
  date: string;
  /** Bedtime in 24-hour HH:mm format */
  bedtime: string;
  /** Wake-up time in 24-hour HH:mm format */
  wakeTime: string;
  /** Total calculated time spent in bed, in minutes (handles crossing midnight) */
  timeInBedMinutes: number;
  /**
   * Actual estimated sleep time in minutes, if specified.
   * If omitted, derived from timeInBedMinutes minus awakeMinutes.
   */
  actualSleepMinutes?: number;
  /** Estimated time awake during the sleep interval, in minutes */
  awakeMinutes?: number;
  /** Optional Deep Sleep stage duration in minutes */
  deepSleepMinutes?: number;
  /** Optional REM Sleep stage duration in minutes */
  remSleepMinutes?: number;
  /** Optional Light Sleep stage duration in minutes */
  lightSleepMinutes?: number;
  /** User-provided reflective sleep notes or dream diary */
  notes?: string;
  /** Timestamp when the record was entered */
  createdAt: number;
}

export interface SleepValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: string[];
  /** Clear human-readable explanation of how duration was calculated */
  durationExplanation: string;
  /** Total calculated time in bed in minutes */
  timeInBedMinutes: number;
  /** Effective sleep minutes (accounting for awake time if provided) */
  effectiveSleepMinutes: number;
}

export interface SleepStageProportions {
  deepRatio: number;
  remRatio: number;
  lightRatio: number;
  awakeRatio: number;
  hasStageData: boolean;
}

