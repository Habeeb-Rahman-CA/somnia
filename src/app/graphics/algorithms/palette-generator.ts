/**
 * Somnia - Black & White / Monochromatic Art Palettes
 * Minimalist, photographic, and ink-wash themes stripped of neon saturation.
 */

import { ColorPalette } from '../../core/models/art-parameters.model';

export const DREAM_PALETTES: Record<string, ColorPalette> = {
  'midnight-nebula': {
    id: 'midnight-nebula',
    name: 'Nocturne Ink',
    description: 'Pure obsidian background with stark chalk, bone, and charcoal wash filaments.',
    background: '#000000',
    particleColors: [
      '#ffffff', // Pure white
      '#f5f5f5', // Chalk
      '#e5e5e5', // Silver
      '#a3a3a3', // Mid-gray
      '#737373', // Graphite
      '#525252', // Charcoal
    ],
    ambientGradients: [
      ['#1c1c1c', '#000000'],
      ['#141414', '#000000'],
    ],
    accentColor: '#ffffff',
  },

  'lucid-lavender': {
    id: 'lucid-lavender',
    name: 'Silver Gelatin',
    description: 'Darkroom emulsion tones inspired by gelatin silver prints and pale zinc.',
    background: '#060606',
    particleColors: [
      '#ffffff',
      '#f1f5f9',
      '#e2e8f0',
      '#cbd5e1',
      '#94a3b8',
      '#64748b',
    ],
    ambientGradients: [
      ['#1a1a1a', '#060606'],
      ['#121212', '#000000'],
    ],
    accentColor: '#f1f5f9',
  },

  'aurora-borealis': {
    id: 'aurora-borealis',
    name: 'Sumi-e Wash',
    description: 'Japanese ink brush aesthetic: deep voids with delicate dilute carbon lines.',
    background: '#030303',
    particleColors: [
      '#fafafa',
      '#f4f4f5',
      '#e4e4e7',
      '#d4d4d8',
      '#a1a1aa',
      '#71717a',
    ],
    ambientGradients: [
      ['#171717', '#030303'],
      ['#0f0f0f', '#000000'],
    ],
    accentColor: '#ffffff',
  },

  'deep-rem-cyan': {
    id: 'deep-rem-cyan',
    name: 'Obsidian Mist',
    description: 'High-contrast monochrome: crystalline platinum highlights across charcoal depths.',
    background: '#000000',
    particleColors: [
      '#ffffff',
      '#f8fafc',
      '#e2e8f0',
      '#94a3b8',
      '#475569',
      '#334155',
    ],
    ambientGradients: [
      ['#1e1e1e', '#000000'],
      ['#111111', '#000000'],
    ],
    accentColor: '#ffffff',
  },

  'starlight-glow': {
    id: 'starlight-glow',
    name: 'Bone & Ash',
    description: 'Subtle warm ivory, pumice, and scorched ash dust against pitch black.',
    background: '#050505',
    particleColors: [
      '#fafaf9',
      '#f5f5f4',
      '#e7e5e4',
      '#d6d3d1',
      '#a8a29e',
      '#78716c',
    ],
    ambientGradients: [
      ['#191716', '#050505'],
      ['#100f0e', '#000000'],
    ],
    accentColor: '#f5f5f4',
  },

  'twilight-velvet': {
    id: 'twilight-velvet',
    name: 'Etched Graphite',
    description: 'Architectural line etching with crisp silver-point precision and velvet black.',
    background: '#070707',
    particleColors: [
      '#ffffff',
      '#ededed',
      '#d1d1d1',
      '#9e9e9e',
      '#6b6b6b',
      '#404040',
    ],
    ambientGradients: [
      ['#1a1a1a', '#070707'],
      ['#121212', '#000000'],
    ],
    accentColor: '#ffffff',
  },
};

export class PaletteGenerator {
  public static getAllPalettes(): ColorPalette[] {
    return Object.values(DREAM_PALETTES);
  }

  public static getPaletteById(id: string): ColorPalette {
    return DREAM_PALETTES[id] || DREAM_PALETTES['midnight-nebula'];
  }

  /**
   * Converts hex string (#rrggbb) to rgba string with specified alpha.
   */
  public static hexToRgba(hex: string, alpha: number): string {
    const cleanHex = hex.replace('#', '');
    let r = 0;
    let g = 0;
    let b = 0;

    if (cleanHex.length === 3) {
      r = parseInt(cleanHex[0] + cleanHex[0], 16);
      g = parseInt(cleanHex[1] + cleanHex[1], 16);
      b = parseInt(cleanHex[2] + cleanHex[2], 16);
    } else if (cleanHex.length === 6) {
      r = parseInt(cleanHex.substring(0, 2), 16);
      g = parseInt(cleanHex.substring(2, 4), 16);
      b = parseInt(cleanHex.substring(4, 6), 16);
    }

    const clampedAlpha = Math.max(0, Math.min(1, alpha));
    return `rgba(${r}, ${g}, ${b}, ${clampedAlpha})`;
  }
}
