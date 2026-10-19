import { TestBed } from '@angular/core/testing';
import { SleepDataService } from './sleep-data.service';
import { SleepRecord } from '../models/sleep-record.model';

describe('SleepDataService', () => {
  let service: SleepDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SleepDataService],
    });
    service = TestBed.inject(SleepDataService);
  });

  describe('Duration calculations across midnight', () => {
    it('should calculate duration correctly when crossing midnight (23:00 to 07:00 -> 8 hours / 480 mins)', () => {
      const minutes = service.calculateTimeInBedMinutes('23:00', '07:00');
      expect(minutes).toBe(480);
    });

    it('should calculate duration correctly when crossing midnight (22:30 to 06:45 -> 495 mins)', () => {
      const minutes = service.calculateTimeInBedMinutes('22:30', '06:45');
      expect(minutes).toBe(495);
    });

    it('should calculate duration correctly for late bedtime past midnight (01:15 to 08:30 -> 435 mins)', () => {
      const minutes = service.calculateTimeInBedMinutes('01:15', '08:30');
      expect(minutes).toBe(435);
    });

    it('should calculate duration correctly for an afternoon nap on the same day (14:00 to 15:30 -> 90 mins)', () => {
      const minutes = service.calculateTimeInBedMinutes('14:00', '15:30');
      expect(minutes).toBe(90);
    });

    it('should return 0 for invalid or malformed time formats', () => {
      expect(service.calculateTimeInBedMinutes('invalid', '07:00')).toBe(0);
      expect(service.calculateTimeInBedMinutes('25:00', '07:00')).toBe(0);
      expect(service.calculateTimeInBedMinutes('', '')).toBe(0);
    });
  });

  describe('Sleep input validation', () => {
    it('should validate valid sleep inputs successfully', () => {
      const input: Partial<SleepRecord> = {
        date: '2026-10-19',
        bedtime: '23:00',
        wakeTime: '07:00',
        awakeMinutes: 20,
        deepSleepMinutes: 100,
        remSleepMinutes: 110,
        lightSleepMinutes: 250,
      };

      const result = service.validateSleepInput(input);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors).length).toBe(0);
      expect(result.timeInBedMinutes).toBe(480);
      expect(result.effectiveSleepMinutes).toBe(460);
      expect(result.durationExplanation).toContain('Time in bed: 8h');
      expect(result.durationExplanation).toContain('deducting 20m awake');
    });

    it('should flag errors when date or times are missing', () => {
      const result = service.validateSleepInput({});
      expect(result.isValid).toBe(false);
      expect(result.errors['date']).toBeDefined();
      expect(result.errors['bedtime']).toBeDefined();
      expect(result.errors['wakeTime']).toBeDefined();
    });

    it('should error when bedtime and wake-up time are identical', () => {
      const result = service.validateSleepInput({
        date: '2026-10-19',
        bedtime: '07:00',
        wakeTime: '07:00',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors['duration']).toContain('identical');
    });

    it('should reject when awake time equals or exceeds time in bed', () => {
      const result = service.validateSleepInput({
        date: '2026-10-19',
        bedtime: '23:00',
        wakeTime: '07:00', // 480 mins
        awakeMinutes: 500,
      });
      expect(result.isValid).toBe(false);
      expect(result.errors['awakeMinutes']).toContain('exceed total time in bed');
    });

    it('should reject when sum of sleep stages exceeds time in bed', () => {
      const result = service.validateSleepInput({
        date: '2026-10-19',
        bedtime: '23:00',
        wakeTime: '07:00', // 480 mins
        deepSleepMinutes: 200,
        remSleepMinutes: 200,
        lightSleepMinutes: 150, // 200 + 200 + 150 = 550 > 480
      });
      expect(result.isValid).toBe(false);
      expect(result.errors['stages']).toContain('exceeds total time in bed');
    });
  });

  describe('Sleep stage proportions', () => {
    it('should return hasStageData = false when no stages are provided and never invent numbers', () => {
      const record = service.createDefaultRecord();
      record.deepSleepMinutes = undefined;
      record.remSleepMinutes = undefined;
      record.lightSleepMinutes = undefined;

      const props = service.getStageProportions(record);
      expect(props.hasStageData).toBe(false);
      expect(props.deepRatio).toBe(0);
      expect(props.remRatio).toBe(0);
    });

    it('should calculate accurate proportions when stages are provided', () => {
      const record = service.createDefaultRecord();
      record.timeInBedMinutes = 480;
      record.deepSleepMinutes = 120; // 25%
      record.remSleepMinutes = 120;  // 25%
      record.lightSleepMinutes = 240; // 50%

      const props = service.getStageProportions(record);
      expect(props.hasStageData).toBe(true);
      expect(props.deepRatio).toBeCloseTo(0.25);
      expect(props.remRatio).toBeCloseTo(0.25);
      expect(props.lightRatio).toBeCloseTo(0.5);
    });
  });
});

