import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SleepRecord, SleepValidationResult } from '../../core/models/sleep-record.model';
import { SleepDataService } from '../../core/services/sleep-data.service';
import { ArtworkService } from '../../core/services/artwork.service';
import { SleepRepositoryService } from '../../core/services/sleep-repository.service';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-sleep-entry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sleep-entry.component.html',
  styleUrls: ['./sleep-entry.component.css'],
})
export class SleepEntryComponent implements OnInit {
  private sleepDataService = inject(SleepDataService);
  private artworkService = inject(ArtworkService);
  private repository = inject(SleepRepositoryService);
  private toast = inject(ToastService);
  private router = inject(Router);

  public date = '';
  public bedtime = '23:00';
  public wakeTime = '07:15';
  public awakeMinutes: number | null = 25;
  public actualSleepMinutes: number | null = null;
  public deepSleepMinutes: number | null = 100;
  public remSleepMinutes: number | null = 110;
  public lightSleepMinutes: number | null = 260;
  public notes = 'Woke feeling rested with gentle imagery.';

  public validationResult: SleepValidationResult = {
    isValid: true,
    errors: {},
    warnings: [],
    durationExplanation: '',
    timeInBedMinutes: 0,
    effectiveSleepMinutes: 0,
  };

  public savedRecords: SleepRecord[] = [];
  public showStages = true;
  public Math = Math;

  ngOnInit(): void {
    const today = new Date();
    this.date = today.toISOString().split('T')[0];

    // If artwork service already has a record, prefill with it
    const active = this.artworkService.getCurrentSleepRecord();
    if (active) {
      this.date = active.date;
      this.bedtime = active.bedtime;
      this.wakeTime = active.wakeTime;
      this.awakeMinutes = active.awakeMinutes ?? null;
      this.actualSleepMinutes = active.actualSleepMinutes ?? null;
      this.deepSleepMinutes = active.deepSleepMinutes ?? null;
      this.remSleepMinutes = active.remSleepMinutes ?? null;
      this.lightSleepMinutes = active.lightSleepMinutes ?? null;
      this.notes = active.notes || '';
    }

    this.recalculate();
    this.loadHistory();
  }

  public recalculate(): void {
    const partial: Partial<SleepRecord> = {
      date: this.date,
      bedtime: this.bedtime,
      wakeTime: this.wakeTime,
      awakeMinutes: this.awakeMinutes ?? undefined,
      actualSleepMinutes: this.actualSleepMinutes ?? undefined,
      deepSleepMinutes: this.deepSleepMinutes ?? undefined,
      remSleepMinutes: this.remSleepMinutes ?? undefined,
      lightSleepMinutes: this.lightSleepMinutes ?? undefined,
    };

    this.validationResult = this.sleepDataService.validateSleepInput(partial);
  }

  public applyPreset(type: 'balanced' | 'night-owl' | 'early-bird' | 'restless'): void {
    const today = new Date().toISOString().split('T')[0];
    this.date = today;

    if (type === 'balanced') {
      this.bedtime = '23:00';
      this.wakeTime = '07:15';
      this.awakeMinutes = 20;
      this.actualSleepMinutes = null;
      this.deepSleepMinutes = 110;
      this.remSleepMinutes = 105;
      this.lightSleepMinutes = 260;
      this.notes = 'Deep, steady slumber with vivid dream fragments.';
    } else if (type === 'night-owl') {
      this.bedtime = '02:30';
      this.wakeTime = '10:00';
      this.awakeMinutes = 35;
      this.actualSleepMinutes = null;
      this.deepSleepMinutes = 80;
      this.remSleepMinutes = 140;
      this.lightSleepMinutes = 200;
      this.notes = 'Late night creative trance; active REM dreaming.';
    } else if (type === 'early-bird') {
      this.bedtime = '21:30';
      this.wakeTime = '05:45';
      this.awakeMinutes = 15;
      this.actualSleepMinutes = null;
      this.deepSleepMinutes = 130;
      this.remSleepMinutes = 90;
      this.lightSleepMinutes = 260;
      this.notes = 'Early dusk rest; crisp morning awakening.';
    } else if (type === 'restless') {
      this.bedtime = '00:15';
      this.wakeTime = '06:30';
      this.awakeMinutes = 75;
      this.actualSleepMinutes = null;
      this.deepSleepMinutes = 45;
      this.remSleepMinutes = 60;
      this.lightSleepMinutes = 200;
      this.notes = 'Tossing and turning with erratic thoughts.';
    }

    this.recalculate();
    this.toast.show(`Applied "${type}" sleep preset`, 'info');
  }

  public async onSubmit(): Promise<void> {
    this.recalculate();
    if (!this.validationResult.isValid) {
      this.toast.show('Please resolve validation errors before continuing.', 'warning');
      return;
    }

    const record: SleepRecord = {
      id: 'sleep_' + Date.now(),
      date: this.date,
      bedtime: this.bedtime,
      wakeTime: this.wakeTime,
      timeInBedMinutes: this.validationResult.timeInBedMinutes,
      actualSleepMinutes: this.actualSleepMinutes ?? undefined,
      awakeMinutes: this.awakeMinutes ?? undefined,
      deepSleepMinutes: this.deepSleepMinutes ?? undefined,
      remSleepMinutes: this.remSleepMinutes ?? undefined,
      lightSleepMinutes: this.lightSleepMinutes ?? undefined,
      notes: this.notes.trim() || undefined,
      createdAt: Date.now(),
    };

    // Save record to IndexedDB
    await this.repository.saveSleepRecord(record);
    // Propagate to studio
    this.artworkService.setSleepRecord(record);

    this.toast.show('Sleep record saved! Generating dream art...', 'success');
    this.router.navigate(['/studio']);
  }

  public async loadHistory(): Promise<void> {
    this.savedRecords = await this.repository.getAllSleepRecords();
  }

  public selectHistoricalRecord(rec: SleepRecord): void {
    this.date = rec.date;
    this.bedtime = rec.bedtime;
    this.wakeTime = rec.wakeTime;
    this.awakeMinutes = rec.awakeMinutes ?? null;
    this.actualSleepMinutes = rec.actualSleepMinutes ?? null;
    this.deepSleepMinutes = rec.deepSleepMinutes ?? null;
    this.remSleepMinutes = rec.remSleepMinutes ?? null;
    this.lightSleepMinutes = rec.lightSleepMinutes ?? null;
    this.notes = rec.notes || '';
    this.recalculate();

    this.artworkService.setSleepRecord(rec);
    this.toast.show(`Loaded record for ${rec.date}`, 'info');
  }

  public async deleteHistoricalRecord(rec: SleepRecord, event: Event): Promise<void> {
    event.stopPropagation();
    await this.repository.deleteSleepRecord(rec.id);
    await this.loadHistory();
    this.toast.show(`Deleted sleep record for ${rec.date}`, 'info');
  }
}
