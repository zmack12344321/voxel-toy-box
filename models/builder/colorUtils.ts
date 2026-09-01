/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Parses color string (e.g. '#FF5500', '0xFF5500', or number) into a numeric hex value.
 */
export function parseColor(color: string | number): number {
  if (typeof color === 'number') return color;
  if (typeof color === 'string') {
    let clean = color.trim();
    if (clean.startsWith('#')) clean = clean.substring(1);
    else if (clean.startsWith('0x') || clean.startsWith('0X')) clean = clean.substring(2);
    const parsed = parseInt(clean, 16);
    return isNaN(parsed) ? 0xcccccc : parsed;
  }
  return 0xcccccc;
}

/**
 * Adjusts the brightness of a hex color by a factor (-1.0 to 1.0).
 */
export function adjustBrightness(hex: number, factor: number): number {
  const r = Math.min(255, Math.max(0, Math.round(((hex >> 16) & 0xff) * (1 + factor))));
  const g = Math.min(255, Math.max(0, Math.round(((hex >> 8) & 0xff) * (1 + factor))));
  const b = Math.min(255, Math.max(0, Math.round((hex & 0xff) * (1 + factor))));
  return (r << 16) | (g << 8) | b;
}
