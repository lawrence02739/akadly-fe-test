import type { BrandFont } from '../types/onboarding.types';

export interface FontOption {
  key: BrandFont;
  label: string;
  category: string;
  previewSample: string;
  fontFamilyCss: string;
}

export const FONT_OPTIONS: FontOption[] = [
  {
    key: 'SANS_SERIF',
    label: 'Sans Serif (Inter)',
    category: 'Clean & Modern',
    previewSample: 'The quick brown fox jumps over the lazy dog',
    fontFamilyCss:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  {
    key: 'SERIF',
    label: 'Serif (Playfair & Merriweather)',
    category: 'Editorial & Academic',
    previewSample: 'The quick brown fox jumps over the lazy dog',
    fontFamilyCss:
      '"Playfair Display", "Merriweather", Georgia, Cambria, serif',
  },
  {
    key: 'ROUNDED',
    label: 'Rounded (Plus Jakarta Sans)',
    category: 'Friendly & Approachable',
    previewSample: 'The quick brown fox jumps over the lazy dog',
    fontFamilyCss:
      '"Plus Jakarta Sans", Quicksand, system-ui, sans-serif',
  },
  {
    key: 'MONOSPACE',
    label: 'Monospace (Space Grotesk)',
    category: 'Technical & Developer',
    previewSample: 'The quick brown fox jumps over the lazy dog',
    fontFamilyCss:
      '"Space Grotesk", "JetBrains Mono", Consolas, monospace',
  },
];

export function getFontFamilyCss(font: BrandFont): string {
  const match = FONT_OPTIONS.find((f) => f.key === font);
  return match ? match.fontFamilyCss : FONT_OPTIONS[0].fontFamilyCss;
}
