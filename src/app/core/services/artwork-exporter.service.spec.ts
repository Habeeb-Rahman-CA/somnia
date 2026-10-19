import { TestBed } from '@angular/core/testing';
import { ArtworkExporterService } from './artwork-exporter.service';
import { RenderConfigurationHelper } from '../../graphics/engine/render-configuration';

describe('ArtworkExporterService', () => {
  let service: ArtworkExporterService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ArtworkExporterService],
    });
    service = TestBed.inject(ArtworkExporterService);
  });

  it('should support triggering download for genuine SVG vector paths', () => {
    const triggerSpy = vi.spyOn(service, 'triggerDownload').mockImplementation(() => {});

    const params = RenderConfigurationHelper.createDefaultParameters(42);
    params.particleCount = 50; // Low count for quick test
    const config = RenderConfigurationHelper.createConfig(params, 800, 600, 10);

    service.exportVectorSvg(config, 800, 600, 'test-art.svg');

    expect(triggerSpy).toHaveBeenCalledTimes(1);
    const blobArg = triggerSpy.mock.calls[0][0] as Blob;
    expect(blobArg.type).toContain('image/svg+xml');
  });

  it('should trigger high-resolution PNG export using deterministic simulation', async () => {
    const triggerSpy = vi.spyOn(service, 'triggerDownload').mockImplementation(() => {});

    // In jsdom environment, HTMLCanvasElement.prototype.toBlob is a no-op stub that does not call callback
    const origToBlob = HTMLCanvasElement.prototype.toBlob;
    HTMLCanvasElement.prototype.toBlob = function (callback: BlobCallback, type?: string) {
      const dummyBlob = new Blob(['mock-png'], { type: type || 'image/png' });
      callback(dummyBlob);
    };

    const params = RenderConfigurationHelper.createDefaultParameters(88);
    params.particleCount = 20;
    const config = RenderConfigurationHelper.createConfig(params, 400, 300, 5);

    try {
      await service.exportHighResPng(config, 400, 300, 'test-highres.png');
      expect(triggerSpy).toHaveBeenCalled();
    } finally {
      HTMLCanvasElement.prototype.toBlob = origToBlob;
    }
  });
});
