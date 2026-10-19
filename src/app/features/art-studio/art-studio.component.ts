import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  HostListener,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ArtworkService } from '../../core/services/artwork.service';
import { ArtworkExporterService } from '../../core/services/artwork-exporter.service';
import { CanvasRenderer } from '../../graphics/engine/canvas-renderer';
import { ArtParameters, ColorPalette } from '../../core/models/art-parameters.model';
import { DREAM_PALETTES, PaletteGenerator } from '../../graphics/algorithms/palette-generator';
import { ToastService } from '../../shared/components/toast/toast.service';
import { RenderConfigurationHelper } from '../../graphics/engine/render-configuration';

@Component({
  selector: 'app-art-studio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './art-studio.component.html',
  styleUrls: ['./art-studio.component.css'],
})
export class ArtStudioComponent implements OnInit, OnDestroy {
  @ViewChild('artCanvas', { static: true })
  private canvasRef!: ElementRef<HTMLCanvasElement>;

  public artworkService = inject(ArtworkService);
  private exporter = inject(ArtworkExporterService);
  private toast = inject(ToastService);

  private renderer: CanvasRenderer | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private sub: Subscription = new Subscription();

  public params!: ArtParameters;
  public palettes: ColorPalette[] = PaletteGenerator.getAllPalettes();
  public selectedPaletteId = 'midnight-nebula';

  public isPaused = false;
  public showControlsDrawer = false;
  public showExportModal = false;
  public showSaveModal = false;
  public showMappingExplainer = false;

  // Save Modal
  public artworkTitle = '';
  public artworkNotes = '';

  // Export options
  public exportResolution: '2k' | '4k' | 'custom' = '2k';
  public exportFormat: 'png' | 'svg' = 'png';
  public isExporting = false;
  public Math = Math;

  ngOnInit(): void {
    this.params = { ...this.artworkService.getCurrentParameters() };
    this.selectedPaletteId = this.params.palette.id;
    this.artworkTitle = `Dream Composition #${this.params.seed.toString(16).toUpperCase()}`;

    // Initialize renderer
    const canvas = this.canvasRef.nativeElement;
    this.renderer = new CanvasRenderer(canvas, this.params);
    this.renderer.start();

    // Setup responsive observer
    this.setupResizeObserver();

    // Listen to parameter changes from service (e.g. if loaded from gallery or sleep entry)
    this.sub.add(
      this.artworkService.currentParameters$.subscribe((newParams) => {
        this.params = { ...newParams };
        this.selectedPaletteId = newParams.palette.id;
        this.artworkTitle = `Dream Composition #${newParams.seed.toString(16).toUpperCase()}`;
        if (this.renderer) {
          this.renderer.updateParameters(newParams, false);
        }
      }),
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.renderer) {
      this.renderer.destroy();
      this.renderer = null;
    }
  }

  private setupResizeObserver(): void {
    if (typeof ResizeObserver === 'undefined') return;
    const canvas = this.canvasRef.nativeElement;
    const parent = canvas.parentElement;
    if (!parent) return;

    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0 && this.renderer) {
          this.renderer.resize(width, height);
        }
      }
    });

    this.resizeObserver.observe(parent);
  }

  @HostListener('window:keydown', ['$event'])
  public handleKeydown(event: KeyboardEvent): void {
    // Avoid shortcuts if user is typing in inputs or textareas
    const active = document.activeElement;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
      return;
    }

    if (event.code === 'Space') {
      event.preventDefault();
      this.togglePause();
    } else if (event.key === 'r' || event.key === 'R') {
      event.preventDefault();
      this.regenerateSeed();
    }
  }

  public togglePause(): void {
    if (!this.renderer) return;
    this.isPaused = this.renderer.togglePause();
    this.toast.show(this.isPaused ? 'Animation Paused' : 'Animation Resumed', 'info', 1500);
  }

  public regenerateSeed(): void {
    const newSeed = Math.floor(Math.random() * 2147483647);
    this.params.seed = newSeed;
    this.artworkService.updateParameters({ seed: newSeed });
    if (this.renderer) {
      this.renderer.updateParameters(this.params, true);
    }
    this.artworkTitle = `Dream Composition #${newSeed.toString(16).toUpperCase()}`;
    this.toast.show(`Generated new seed: ${newSeed}`, 'info');
  }

  public onParameterChange(): void {
    this.artworkService.updateParameters(this.params);
    if (this.renderer) {
      this.renderer.updateParameters(this.params, false);
    }
  }

  public onPaletteSelect(paletteId: string): void {
    const pal = DREAM_PALETTES[paletteId];
    if (pal) {
      this.selectedPaletteId = paletteId;
      this.params.palette = pal;
      this.onParameterChange();
      if (this.renderer) {
        this.renderer.clearAndPaintAtmosphere();
      }
      this.toast.show(`Selected "${pal.name}" palette`, 'info');
    }
  }

  public resetToSleepDefaults(): void {
    this.artworkService.resetToSleepDefaults();
    this.params = { ...this.artworkService.getCurrentParameters() };
    this.selectedPaletteId = this.params.palette.id;
    if (this.renderer) {
      this.renderer.updateParameters(this.params, true);
    }
    this.toast.show('Reset parameters to sleep record defaults', 'info');
  }

  public openSaveModal(): void {
    this.showSaveModal = true;
  }

  public async confirmSaveArtwork(): Promise<void> {
    if (!this.renderer) return;
    const thumbnail = this.renderer.captureDataUrl('image/png', 0.85);

    try {
      const saved = await this.artworkService.saveCurrentArtwork(
        this.artworkTitle,
        thumbnail,
        this.artworkNotes,
      );
      this.showSaveModal = false;
      this.toast.show(`"${saved.title}" saved to personal gallery!`, 'success');
    } catch {
      this.toast.show('Failed to save artwork to local storage.', 'warning');
    }
  }

  public openExportModal(): void {
    this.showExportModal = true;
  }

  public async executeExport(): Promise<void> {
    this.isExporting = true;
    this.toast.show('Rendering deterministic high-resolution export...', 'info');

    const config = RenderConfigurationHelper.createConfig(this.params, 1200, 800, 320);

    let width = 2400;
    let height = 1600;
    if (this.exportResolution === '4k') {
      width = 3840;
      height = 2160;
    }

    const safeTitle = this.artworkTitle
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');
    const filename = `${safeTitle}-${this.params.seed}.${this.exportFormat}`;

    try {
      if (this.exportFormat === 'png') {
        await this.exporter.exportHighResPng(config, width, height, filename);
      } else {
        this.exporter.exportVectorSvg(config, 1200, 800, filename);
      }
      this.toast.show(`Export downloaded: ${filename}`, 'success');
      this.showExportModal = false;
    } catch (err) {
      console.error(err);
      this.toast.show('Export failed. Please try again.', 'warning');
    } finally {
      this.isExporting = false;
    }
  }
}
