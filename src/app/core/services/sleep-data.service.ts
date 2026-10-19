/**
 * Somnia - Sleep Data Domain Service
 * Handles sleep duration calculations across midnight, strict input validation,
 * stage breakdown, and semantic explanations.
 */

import { Injectable } from '@angular/core';
import {
  SleepRecord,
  SleepValidationResult,
  SleepStageProportions,
} from '../models/sleep-record.model';

@Injectable({
  providedIn: 'root',
})
export class SleepDataService {
  /**
   * Calculates time in bed in minutes between bedtime and wake-up time.
   * Accurately handles crossing midnight.
   *
   * Example: 23:30 to 07:15 -> 465 minutes (7h 45m)
   * Example: 01:15 to 08:30 -> 435 minutes (7h 15m)
   */
  public calculateTimeInBedMinutes(bedtime: string, wakeTime: string): number {
    if (!bedtime || !wakeTime) return 0;

    const [bHour, bMin] = bedtime.split(':').map(Number);
    const [wHour, wMin] = wakeTime.split(':').map(Number);

    if (
      isNaN(bHour) ||
      isNaN(bMin) ||
      isNaN(wHour) ||
      isNaN(wMin) ||
      bHour < 0 ||
      bHour > 23 ||
      bMin < 0 ||
      bMin > 59 ||
      wHour < 0 ||
      wHour > 23 ||
      wMin < 0 ||
      wMin > 59
    ) {
      return 0;
    }

    const bedMinutesTotal = bHour * 60 + bMin;
    const wakeMinutesTotal = wHour * 60 + wMin;

    if (wakeMinutesTotal >= bedMinutesTotal) {
      // Slept and woke on the same calendar day (e.g., daytime nap or slept past 00:00)
      return wakeMinutesTotal - bedMinutesTotal;
    } else {
      // Crossed midnight (e.g., bedtime 23:00 to wake 07:00)
      const minutesToMidnight = 24 * 60 - bedMinutesTotal;
      return minutesToMidnight + wakeMinutesTotal;
    }
  }

  /**
   * Validates sleep input values and builds human-readable feedback.
   */
  public validateSleepInput(data: Partial<SleepRecord>): SleepValidationResult {
    const errors: Record<string, string> = {};
    const warnings: string[] = [];

    // Date validation
    if (!data.date) {
      errors['date'] = 'Sleep date is required.';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
      errors['date'] = 'Invalid date format (must be YYYY-MM-DD).';
    }

    // Bedtime & Wake-up time validation
    const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (!data.bedtime) {
      errors['bedtime'] = 'Bedtime is required.';
    } else if (!timeRegex.test(data.bedtime)) {
      errors['bedtime'] = 'Bedtime must be in 24h format (HH:mm).';
    }

    if (!data.wakeTime) {
      errors['wakeTime'] = 'Wake-up time is required.';
    } else if (!timeRegex.test(data.wakeTime)) {
      errors['wakeTime'] = 'Wake-up time must be in 24h format (HH:mm).';
    }

    const timeInBed =
      data.bedtime && data.wakeTime && !errors['bedtime'] && !errors['wakeTime']
        ? this.calculateTimeInBedMinutes(data.bedtime, data.wakeTime)
        : 0;

    if (data.bedtime && data.wakeTime && timeInBed === 0) {
      errors['duration'] = 'Bedtime and wake-up time cannot be identical.';
    } else if (timeInBed > 0 && timeInBed < 60) {
      warnings.push('Duration is under 1 hour; very short sleep recorded.');
    } else if (timeInBed > 18 * 60) {
      warnings.push('Duration exceeds 18 hours; please double check your entry.');
    }

    // Awake minutes validation
    let effectiveSleep = timeInBed;
    if (data.awakeMinutes !== undefined && data.awakeMinutes !== null) {
      if (data.awakeMinutes < 0) {
        errors['awakeMinutes'] = 'Awake time cannot be negative.';
      } else if (data.awakeMinutes >= timeInBed) {
        errors['awakeMinutes'] =
          'Awake time cannot equal or exceed total time in bed.';
      } else {
        effectiveSleep = timeInBed - data.awakeMinutes;
      }
    }

    // Actual sleep duration validation if manually provided
    if (
      data.actualSleepMinutes !== undefined &&
      data.actualSleepMinutes !== null
    ) {
      if (data.actualSleepMinutes <= 0) {
        errors['actualSleepMinutes'] = 'Actual sleep must be greater than zero.';
      } else if (data.actualSleepMinutes > timeInBed) {
        errors['actualSleepMinutes'] =
          'Actual sleep duration cannot exceed total time in bed.';
      } else {
        effectiveSleep = data.actualSleepMinutes;
      }
    }

    // Sleep stages validation (optional)
    const deep = data.deepSleepMinutes || 0;
    const rem = data.remSleepMinutes || 0;
    const light = data.lightSleepMinutes || 0;

    if (deep < 0) errors['deepSleepMinutes'] = 'Deep sleep cannot be negative.';
    if (rem < 0) errors['remSleepMinutes'] = 'REM sleep cannot be negative.';
    if (light < 0) errors['lightSleepMinutes'] = 'Light sleep cannot be negative.';

    const sumStages = deep + rem + light;
    if (sumStages > timeInBed) {
      errors['stages'] = `Sum of sleep stages (${sumStages}m) exceeds total time in bed (${timeInBed}m).`;
    }

    // Construct human-readable explanation
    const hours = Math.floor(timeInBed / 60);
    const mins = timeInBed % 60;
    const durationStr = `${hours}h ${mins > 0 ? `${mins}m` : ''}`.trim();

    let durationExplanation = `Time in bed: ${durationStr}`;
    if (data.actualSleepMinutes) {
      const aHours = Math.floor(data.actualSleepMinutes / 60);
      const aMins = data.actualSleepMinutes % 60;
      durationExplanation += ` (Estimated actual sleep: ${aHours}h ${aMins}m)`;
    } else if (data.awakeMinutes) {
      const eHours = Math.floor(effectiveSleep / 60);
      const eMins = effectiveSleep % 60;
      durationExplanation += ` (Effective sleep: ${eHours}h ${eMins}m after deducting ${data.awakeMinutes}m awake)`;
    } else {
      durationExplanation += ' (Assuming continuous sleep; no awake intervals specified)';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings,
      durationExplanation,
      timeInBedMinutes: timeInBed,
      effectiveSleepMinutes: effectiveSleep,
    };
  }

  /**
   * Computes normalized sleep stage proportions.
   * Never invents missing data.
   */
  public getStageProportions(record: SleepRecord): SleepStageProportions {
    const total = record.timeInBedMinutes || 1;
    const hasStageData =
      (record.deepSleepMinutes !== undefined && record.deepSleepMinutes > 0) ||
      (record.remSleepMinutes !== undefined && record.remSleepMinutes > 0) ||
      (record.lightSleepMinutes !== undefined && record.lightSleepMinutes > 0);

    if (!hasStageData) {
      return {
        deepRatio: 0,
        remRatio: 0,
        lightRatio: 0,
        awakeRatio: (record.awakeMinutes || 0) / total,
        hasStageData: false,
      };
    }

    return {
      deepRatio: (record.deepSleepMinutes || 0) / total,
      remRatio: (record.remSleepMinutes || 0) / total,
      lightRatio: (record.lightSleepMinutes || 0) / total,
      awakeRatio: (record.awakeMinutes || 0) / total,
      hasStageData: true,
    };
  }

  /**
   * Creates a default sleep record representing a healthy night's sleep.
   */
  public createDefaultRecord(): SleepRecord {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const bedtime = '23:00';
    const wakeTime = '07:15';
    const timeInBed = this.calculateTimeInBedMinutes(bedtime, wakeTime);

    return {
      id: 'default-sleep-record',
      date: dateStr,
      bedtime,
      wakeTime,
      timeInBedMinutes: timeInBed,
      actualSleepMinutes: 465,
      awakeMinutes: 30,
      deepSleepMinutes: 105,
      remSleepMinutes: 110,
      lightSleepMinutes: 250,
      notes: 'Slept soundly with serene vivid dreams.',
      createdAt: Date.now(),
    };
  }
}

