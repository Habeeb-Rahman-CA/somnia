import { TestBed } from '@angular/core/testing';
import { SleepRepositoryService } from './sleep-repository.service';
import { SleepRecord } from '../models/sleep-record.model';
import { SavedArtwork, CURRENT_GENERATOR_VERSION } from '../models/artwork.model';
import { RenderConfigurationHelper } from '../../graphics/engine/render-configuration';

describe('SleepRepositoryService', () => {
  let service: SleepRepositoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SleepRepositoryService],
    });
    service = TestBed.inject(SleepRepositoryService);
  });

  describe('Sleep Records Persistence', () => {
    it('should save, retrieve by ID, and list sleep records', async () => {
      const record: SleepRecord = {
        id: 'test-sleep-1',
        date: '2026-10-19',
        bedtime: '23:00',
        wakeTime: '07:00',
        timeInBedMinutes: 480,
        createdAt: 1000,
      };

      await service.saveSleepRecord(record);
      const retrieved = await service.getSleepRecord('test-sleep-1');
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe('test-sleep-1');
      expect(retrieved?.timeInBedMinutes).toBe(480);

      const all = await service.getAllSleepRecords();
      expect(all.some((r) => r.id === 'test-sleep-1')).toBe(true);
    });

    it('should delete sleep records safely', async () => {
      const record: SleepRecord = {
        id: 'test-sleep-del',
        date: '2026-10-18',
        bedtime: '22:00',
        wakeTime: '06:00',
        timeInBedMinutes: 480,
        createdAt: 900,
      };

      await service.saveSleepRecord(record);
      await service.deleteSleepRecord('test-sleep-del');
      const retrieved = await service.getSleepRecord('test-sleep-del');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('Saved Artworks Persistence', () => {
    it('should save, retrieve by ID, list, and delete artworks', async () => {
      const params = RenderConfigurationHelper.createDefaultParameters(777);
      const config = RenderConfigurationHelper.createConfig(params);

      const artwork: SavedArtwork = {
        id: 'art-1',
        title: 'Velvet Reverie',
        createdAt: 2000,
        generatorVersion: CURRENT_GENERATOR_VERSION,
        seed: 777,
        config,
      };

      await service.saveArtwork(artwork);
      const retrieved = await service.getArtwork('art-1');
      expect(retrieved).toBeDefined();
      expect(retrieved?.title).toBe('Velvet Reverie');
      expect(retrieved?.seed).toBe(777);

      const all = await service.getAllArtworks();
      expect(all.some((a) => a.id === 'art-1')).toBe(true);

      await service.deleteArtwork('art-1');
      const afterDelete = await service.getArtwork('art-1');
      expect(afterDelete).toBeUndefined();
    });
  });
});

