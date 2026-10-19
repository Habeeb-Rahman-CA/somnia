import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SleepRepositoryService } from '../../core/services/sleep-repository.service';
import { ArtworkService } from '../../core/services/artwork.service';
import { ArtworkExporterService } from '../../core/services/artwork-exporter.service';
import { SavedArtwork } from '../../core/models/artwork.model';
import { ConfirmationModalComponent } from '../../shared/components/confirmation-modal/confirmation-modal.component';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, RouterModule, ConfirmationModalComponent],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css'],
})
export class GalleryComponent implements OnInit {
  private repository = inject(SleepRepositoryService);
  private artworkService = inject(ArtworkService);
  private exporter = inject(ArtworkExporterService);
  private toast = inject(ToastService);
  private router = inject(Router);

  public artworks: SavedArtwork[] = [];
  public selectedForDeletion: SavedArtwork | null = null;
  public showDeleteModal = false;
  public Math = Math;

  ngOnInit(): void {
    this.loadArtworks();
  }

  public async loadArtworks(): Promise<void> {
    this.artworks = await this.repository.getAllArtworks();
  }

  public reproduce(artwork: SavedArtwork): void {
    this.artworkService.reproduceArtwork(artwork);
    this.toast.show(`Restored "${artwork.title}" in Studio`, 'success');
    this.router.navigate(['/studio']);
  }

  public viewDetail(artwork: SavedArtwork): void {
    this.artworkService.setActiveArtwork(artwork);
    this.router.navigate(['/artwork', artwork.id]);
  }

  public async exportDirect(artwork: SavedArtwork, event: Event): Promise<void> {
    event.stopPropagation();
    this.toast.show(`Rendering 2K export for "${artwork.title}"...`, 'info');

    const filename = `${artwork.title.toLowerCase().replace(/\s+/g, '-')}-${artwork.seed}.png`;
    try {
      await this.exporter.exportHighResPng(
        artwork.config,
        2400,
        1600,
        filename,
      );
      this.toast.show(`Export downloaded: ${filename}`, 'success');
    } catch {
      this.toast.show('Failed to export image.', 'warning');
    }
  }

  public promptDelete(artwork: SavedArtwork, event: Event): void {
    event.stopPropagation();
    this.selectedForDeletion = artwork;
    this.showDeleteModal = true;
  }

  public async confirmDelete(): Promise<void> {
    if (!this.selectedForDeletion) return;
    await this.repository.deleteArtwork(this.selectedForDeletion.id);
    this.toast.show(`Deleted "${this.selectedForDeletion.title}"`, 'info');
    this.selectedForDeletion = null;
    this.showDeleteModal = false;
    await this.loadArtworks();
  }

  public cancelDelete(): void {
    this.selectedForDeletion = null;
    this.showDeleteModal = false;
  }

  public async createSampleArtwork(): Promise<void> {
    // Convenience helper to populate a stunning initial sample
    const sampleRecord = {
      id: 'sample-sleep',
      date: '2026-10-18',
      bedtime: '23:15',
      wakeTime: '07:30',
      timeInBedMinutes: 495,
      actualSleepMinutes: 460,
      awakeMinutes: 35,
      deepSleepMinutes: 115,
      remSleepMinutes: 120,
      lightSleepMinutes: 225,
      notes: 'Luminous dreams of oceanic currents.',
      createdAt: Date.now() - 86400000,
    };

    this.artworkService.setSleepRecord(sampleRecord);
    await this.artworkService.saveCurrentArtwork(
      'Celestial Currents #1',
      undefined,
      'Sample slumber composition',
    );
    await this.loadArtworks();
    this.toast.show('Sample artwork created in gallery!', 'success');
  }
}

