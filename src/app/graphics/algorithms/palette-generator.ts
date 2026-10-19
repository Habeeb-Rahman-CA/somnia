/**
 * Somnia - Dream Art Color Palettes
 * Curated color themes inspired by nocturnal sleep states and dreaming consciousness.
 */

import { ColorPalette } from '../../core/models/art-parameters.model';

export const DREAM_PALETTES: Record<string, ColorPalette> = {
  'midnight-nebula': {
    id: 'midnight-nebula',
    name: 'Midnight Nebula',
    description: 'Deep midnight navy with cosmic indigo, soft lavender, and pale cyan filaments.',
    background: '#070a14',
    particleColors: [
      '#6366f1', // Indigo
      '#818cf8', // Periwinkle
      '#a5b4fc', // Soft Lavender
      '#67e8f9', // Pale Cyan
      '#2dd4bf', // Luminous Teal
      '#c084fc', // Lilac
    ],
    ambientGradients: [
      ['#0f172a', '#020617'],
      ['#1e1b4b', '#090d1f'],
    ],
    accentColor: '#38bdf8',
  },

  'lucid-lavender': {
    id: 'lucid-lavender',
    name: 'Lucid Lavender',
    description: 'Twilight plum background with ethereal lilac, radiant violet, and soft rose trails.',
    background: '#0d0b1a',
    particleColors: [
      '#a78bfa', // Lavender
      '#c084fc', // Violet
      '#e879f9', // Orchid
      '#f472b6', // Soft Rose
      '#818cf8', // Indigo
      '#ddd6fe', // Pale Lilac
    ],
    ambientGradients: [
      ['#2e1065', '#0f0728'],
      ['#3b0764', '#0d0b1a'],
    ],
    accentColor: '#c084fc',
  },

  'aurora-borealis': {
    id: 'aurora-borealis',
    name: 'Aurora Borealis',
    description: 'Deep polar slate with emerald curtains, arctic teal ribbons, and pale mint currents.',
    background: '#051016',
    particleColors: [
      '#34d399', // Emerald
      '#10b981', // Boreal Green
      '#2dd4bf', // Teal
      '#06b6d4', // Arctic Blue
      '#67e8f9', // Pale Cyan
      '#a7f3d0', // Mint Glow
    ],
    ambientGradients: [
      ['#064e3b', '#03191e'],
      ['#042f2e', '#051016'],
    ],
    accentColor: '#2dd4bf',
  },

  'deep-rem-cyan': {
    id: 'deep-rem-cyan',
    name: 'Deep REM Cyan',
    description: 'Abyssal deep navy with bioluminescent cyan, electric cerulean, and phosphorescent mist.',
    background: '#040d1a',
    particleColors: [
      '#0284c7', // Cerulean
      '#0ea5e9', // Sky
      '#38bdf8', // Light Azure
      '#7dd3fc', // Ice Blue
      '#22d3ee', // Electric Cyan
      '#a5f3fc', // Pale Glaze
    ],
    ambientGradients: [
      ['#075985', '#02182b'],
      ['#0c4a6e', '#040d1a'],
    ],
    accentColor: '#00f2fe',
  },

  'starlight-glow': {
    id: 'starlight-glow',
    name: 'Starlight Glow',
    description: 'Velvety obsidian with champagne starlight, warm pale amber, and celestial ivory dust.',
    background: '#08080f',
    particleColors: [
      '#fde047', // Champagne
      '#facc15', // Gold
      '#fbbf24', // Warm Amber
      '#e0e7ff', // Pale Celestial
      '#fed7aa', // Peach Stardust
      '#fef08a', // Soft Light
    ],
    ambientGradients: [
      ['#271c10', '#0a0a14'],
      ['#1c1917', '#08080f'],
    ],
    accentColor: '#fde047',
  },

  'twilight-velvet': {
    id: 'twilight-velvet',
    name: 'Twilight Velvet',
    description: 'Dusk charcoal with muted heather, smokey indigo, and dusty moonlight highlights.',
    background: '#0a0b12',
    particleColors: [
      '#94a3b8', // Slate
      '#a5b4fc', // Periwinkle
      '#c4b5fd', // Heather
      '#cbd5e1', // Moonlight
      '#64748b', // Dusky Blue
      '#e2e8f0', // Pearl
    ],
    ambientGradients: [
      ['#1e293b', '#080b14'],
      ['#111827', '#0a0b12'],
    ],
    accentColor: '#c4b5fd',
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

