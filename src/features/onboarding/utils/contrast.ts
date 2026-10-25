/**
 * WCAG 2.1 Contrast Calculation Utilities
 * Determines whether white or dark text offers better contrast against any given hex color.
 */

function hexToRgb(hex: string): [number, number, number] {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (clean.length !== 6) {
    return [79, 70, 229]; // fallback to default indigo
  }
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return [isNaN(r) ? 79 : r, isNaN(g) ? 70 : g, isNaN(b) ? 229 : b];
}

function getChannelLuminance(channel255: number): number {
  const c = channel255 / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function getRelativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return (
    0.2126 * getChannelLuminance(r) +
    0.7152 * getChannelLuminance(g) +
    0.0722 * getChannelLuminance(b)
  );
}

export function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getRelativeLuminance(hex1);
  const l2 = getRelativeLuminance(hex2);
  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Returns either '#FFFFFF' or '#0F172A' (slate-900) to guarantee WCAG AA readability.
 */
export function getContrastingTextColor(backgroundHex: string): string {
  const whiteRatio = getContrastRatio(backgroundHex, '#FFFFFF');
  const darkRatio = getContrastRatio(backgroundHex, '#0F172A');
  return whiteRatio >= darkRatio ? '#FFFFFF' : '#0F172A';
}
