import { TestBed } from '@angular/core/testing';
import { SleepDataService } from '../core/services/sleep-data.service';
import { VisualMapperService } from '../core/services/visual-mapper.service';
import { ArtworkService } from '../core/services/artwork.service';
import { SleepRepositoryService } from '../core/services/sleep-repository.service';
import { ArtworkExporterService } from '../core/services/artwork-exporter.service';
import { SleepRecord } from '../core/models/sleep-record.model';

describe('Main User Journey Integration Flow', () => {
  let sleepDataService: SleepDataService;
  let visualMapperService: VisualMapperService;
  let artworkService: ArtworkService;
  let repository: SleepRepositoryService;
  let exporter: ArtworkExporterService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SleepDataService,
        VisualMapperService,
        ArtworkService,
        SleepRepositoryService,
        ArtworkExporterService,
      ],
    });

    sleepDataService = TestBed.inject(SleepDataService);
    visualMapperService = TestBed.inject(VisualMapperService);
    artworkService = TestBed.inject(ArtworkService);
    repository = TestBed.inject(SleepRepositoryService);
    exporter = TestBed.inject(ArtworkExporterService);
  });

  it('executes full end-to-end workflow: entry -> generation -> override -> save -> reload -> reproduce -> export', async () => {
    // 1. Enter and validate sleep data across midnight
    const sleepInput: Partial<SleepRecord> = {
      date: '2026-10-19',
      bedtime: '23:30',
      wakeTime: '07:15',
      awakeMinutes: 20,
      deepSleepMinutes: 110,
      remSleepMinutes: 115,
      lightSleepMinutes: 220,
      notes: 'Luminous dream of oceanic waves',
    };

    const validation = sleepDataService.validateSleepInput(sleepInput);
    expect(validation.isValid).toBe(true);
    expect(validation.timeInBedMinutes).toBe(465); // 7h 45m
    expect(validation.effectiveSleepMinutes).toBe(445); // 465 - 20

    const record: SleepRecord = {
      id: 'sleep-flow-1',
      date: sleepInput.date!,
      bedtime: sleepInput.bedtime!,
      wakeTime: sleepInput.wakeTime!,
      timeInBedMinutes: validation.timeInBedMinutes,
      awakeMinutes: sleepInput.awakeMinutes,
      deepSleepMinutes: sleepInput.deepSleepMinutes,
      remSleepMinutes: sleepInput.remSleepMinutes,
      lightSleepMinutes: sleepInput.lightSleepMinutes,
      notes: sleepInput.notes,
      createdAt: Date.now(),
    };

    await repository.saveSleepRecord(record);

    // 2. Generate artwork from sleep data
    artworkService.setSleepRecord(record);
    const initialParams = artworkService.getCurrentParameters();
    expect(initialParams.seed).toBeDefined();
    expect(initialParams.particleCount).toBeGreaterThan(1000);
    expect(initialParams.palette).toBeDefined();

    // 3. Change a visual parameter manually (override without altering original sleep record)
    artworkService.updateParameters({
      particleCount: 2500,
      flowStrength: 3.8,
    });
    const modifiedParams = artworkService.getCurrentParameters();
    expect(modifiedParams.particleCount).toBe(2500);
    expect(modifiedParams.flowStrength).toBe(3.8);

    // Verify original sleep record remains intact
    const originalRecord = artworkService.getCurrentSleepRecord();
    expect(originalRecord?.timeInBedMinutes).toBe(465);

    // 4. Save the artwork to repository
    const savedArtwork = await artworkService.saveCurrentArtwork(
      'Cerulean Reverie Integration Test',
      'data:image/png;base64,mock',
      'Saved from user flow test',
    );
    expect(savedArtwork.id).toBeDefined();
    expect(savedArtwork.config.parameters.particleCount).toBe(2500);

    // 5. Simulate application reload / retrieving from database
    const fetchedArtwork = await repository.getArtwork(savedArtwork.id);
    expect(fetchedArtwork).toBeDefined();
    expect(fetchedArtwork?.title).toBe('Cerulean Reverie Integration Test');
    expect(fetchedArtwork?.seed).toBe(savedArtwork.seed);

    // 6 & 7. Reopen saved artwork and reproduce original configuration
    artworkService.reproduceArtwork(fetchedArtwork!);
    const restoredParams = artworkService.getCurrentParameters();
    expect(restoredParams.seed).toBe(savedArtwork.seed);
    expect(restoredParams.particleCount).toBe(2500);
    expect(restoredParams.flowStrength).toBe(3.8);

    // 8. Export image using reproducible configuration
    const triggerSpy = vi.spyOn(exporter, 'triggerDownload').mockImplementation(() => {});
    exporter.exportVectorSvg(
      fetchedArtwork!.config,
      1200,
      800,
      'test-integration-export.svg',
    );
    expect(triggerSpy).toHaveBeenCalledTimes(1);
    const downloadedBlob = triggerSpy.mock.calls[0][0] as Blob;
    expect(downloadedBlob.type).toContain('image/svg+xml');
  });
});

