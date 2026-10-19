import { TestBed } from '@angular/core/testing';
import { VisualMapperService } from './visual-mapper.service';
import { SleepRecord } from '../models/sleep-record.model';

describe('VisualMapperService', () => {
  let service: VisualMapperService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VisualMapperService],
    });
    service = TestBed.inject(VisualMapperService);
  });

  it('should deterministically generate identical seeds from identical input strings', () => {
    const seed1 = service.generateNumericSeed('2026-10-19_23:00_07:00_480');
    const seed2 = service.generateNumericSeed('2026-10-19_23:00_07:00_480');
    const seedDiff = service.generateNumericSeed('2026-10-20_23:00_07:00_480');

    expect(seed1).toBe(seed2);
    expect(seed1).not.toBe(seedDiff);
    expect(typeof seed1).toBe('number');
  });

  it('should map longer sleep duration to higher particle count and visual density', () => {
    const shortSleepRecord: SleepRecord = {
      id: 'short',
      date: '2026-10-19',
      bedtime: '01:00',
      wakeTime: '05:00',
      timeInBedMinutes: 240, // 4 hours
      createdAt: 1000,
    };

    const longSleepRecord: SleepRecord = {
      id: 'long',
      date: '2026-10-19',
      bedtime: '22:00',
      wakeTime: '08:00',
      timeInBedMinutes: 600, // 10 hours
      createdAt: 1000,
    };

    const shortArt = service.mapSleepToArtParameters(shortSleepRecord);
    const longArt = service.mapSleepToArtParameters(longSleepRecord);

    expect(shortArt.parameters.particleCount).toBeLessThan(longArt.parameters.particleCount);
    expect(shortArt.parameters.particleCount).toBeGreaterThanOrEqual(1000);
    expect(longArt.parameters.particleCount).toBeLessThanOrEqual(3200);
  });

  it('should select distinct color palettes according to bedtime hour', () => {
    const earlyRecord: SleepRecord = {
      id: 'early',
      date: '2026-10-19',
      bedtime: '21:00',
      wakeTime: '06:00',
      timeInBedMinutes: 540,
      createdAt: 1000,
    };

    const midnightRecord: SleepRecord = {
      id: 'midnight',
      date: '2026-10-19',
      bedtime: '23:00',
      wakeTime: '07:00',
      timeInBedMinutes: 480,
      createdAt: 1000,
    };

    const lateRecord: SleepRecord = {
      id: 'late',
      date: '2026-10-19',
      bedtime: '02:00',
      wakeTime: '10:00',
      timeInBedMinutes: 480,
      createdAt: 1000,
    };

    const earlyArt = service.mapSleepToArtParameters(earlyRecord);
    const midnightArt = service.mapSleepToArtParameters(midnightRecord);
    const lateArt = service.mapSleepToArtParameters(lateRecord);

    expect(earlyArt.parameters.palette.id).toBe('twilight-velvet');
    expect(midnightArt.parameters.palette.id).toBe('midnight-nebula');
    expect(lateArt.parameters.palette.id).toBe('deep-rem-cyan');
  });

  it('should modulate wave amplitude and curl when REM sleep is high', () => {
    const calmRecord: SleepRecord = {
      id: 'calm',
      date: '2026-10-19',
      bedtime: '23:00',
      wakeTime: '07:00',
      timeInBedMinutes: 480,
      deepSleepMinutes: 180,
      remSleepMinutes: 40,
      createdAt: 1000,
    };

    const dreamRecord: SleepRecord = {
      id: 'dream',
      date: '2026-10-19',
      bedtime: '23:00',
      wakeTime: '07:00',
      timeInBedMinutes: 480,
      deepSleepMinutes: 60,
      remSleepMinutes: 180,
      createdAt: 1000,
    };

    const calmArt = service.mapSleepToArtParameters(calmRecord);
    const dreamArt = service.mapSleepToArtParameters(dreamRecord);

    expect(dreamArt.parameters.curlStrength).toBeGreaterThan(calmArt.parameters.curlStrength);
    expect(dreamArt.parameters.waveAmplitude).toBeGreaterThan(calmArt.parameters.waveAmplitude);
  });

  it('should produce human-readable explanations for all parameters', () => {
    const record: SleepRecord = {
      id: 'rec1',
      date: '2026-10-19',
      bedtime: '23:00',
      wakeTime: '07:15',
      timeInBedMinutes: 495,
      actualSleepMinutes: 465,
      awakeMinutes: 30,
      deepSleepMinutes: 110,
      remSleepMinutes: 100,
      createdAt: 1000,
    };

    const { explanation } = service.mapSleepToArtParameters(record);
    expect(explanation.particleCount).toContain('tracer particles');
    expect(explanation.palette).toContain('palette');
    expect(explanation.directionBias).toContain('dawn');
    expect(explanation.noiseScale).toBeDefined();
    expect(explanation.flowStrength).toBeDefined();
  });
});

