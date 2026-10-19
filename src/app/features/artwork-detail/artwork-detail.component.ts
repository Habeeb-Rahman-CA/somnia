import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { SleepRepositoryService } from '../../core/services/sleep-repository.service';
import { ArtworkService } from '../../core/services/artwork.service';
import { ArtworkExporterService } from '../../core/services/artwork-exporter.service';
import { SavedArtwork } from '../../core/models/artwork.model';
import { RenderConfigurationHelper } from '../../graphics/engine/render-configuration';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-artwork-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './artwork-detail.component.html',
  styleUrls: ['./artwork-detail.component.css'],
})
export class ArtworkDetailComponent implements OnInit {
  @ViewChild('detailCanvas', { static: false })
  private canvasRef!: ElementRef<HTMLCanvasElement>;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private repository = inject(SleepRepositoryService);
  private artworkService = inject(ArtworkService);
  private exporter = inject(ArtworkExporterService);
  private toast = inject(ToastService);

  public artwork: SavedArtwork | null = null;
  public isLoading = true;
  public Math = Math;

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.artwork = (await this.repository.getArtwork(id)) || null;
    }

    this.isLoading = false;

    if (this.artwork) {
      setTimeout(() => this.renderArtworkOnCanvas(), 50);
    }
  }

  private renderArtworkOnCanvas(): void {
    if (!this.artwork || !this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    RenderConfigurationHelper.renderDeterministicComposition(
      canvas,
      this.artwork.config,
      1200,
      800,
    );
  }

  public reproduceInStudio(): void {
    if (!this.artwork) return;
    this.artworkService.reproduceArtwork(this.artwork);
    this.toast.show(`Loaded "${this.artwork.title}" into Studio`, 'success');
    this.router.navigate(['/studio']);
  }

  public copySeed(): void {
    if (!this.artwork) return;
    const hex = '0x' + this.artwork.seed.toString(16).toUpperCase();
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(hex);
      this.toast.show(`Copied seed ${hex} to clipboard`, 'info');
    }
  }

  public async exportPng(): Promise<void> {
    if (!this.artwork) return;
    this.toast.show('Rendering high-resolution 2K PNG export...', 'info');
    const filename = `${this.artwork.title.toLowerCase().replace(/\s+/g, '-')}-${this.artwork.seed}.png`;
    try {
      await this.exporter.exportHighResPng(this.artwork.config, 2400, 1600, filename);
      this.toast.show(`Export downloaded: ${filename}`, 'success');
    } catch {
      this.toast.show('Failed to export image.', 'warning');
    }
  }

  public exportSvg(): void {
    if (!this.artwork) return;
    const filename = `${this.artwork.title.toLowerCase().replace(/\s+/g, '-')}-${this.artwork.seed}.svg`;
    this.exporter.exportVectorSvg(this.artwork.config, 1200, 800, filename);
    this.toast.show(`Vector SVG downloaded: ${filename}`, 'success');
  }
}

