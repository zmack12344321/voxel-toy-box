import { describe, expect, it } from 'vitest';
import { adjustBrightness, parseColor } from '../../models/builder/colorUtils';

describe('color utilities', () => {
  it.each([
    ['#FF5500', 0xff5500], ['0x12abef', 0x12abef], ['  #010203 ', 0x010203],
  ])('parses %s', (input, expected) => expect(parseColor(input)).toBe(expected));
  it('preserves numbers and defaults malformed strings', () => {
    expect(parseColor(0x123456)).toBe(0x123456);
    expect(parseColor('not-a-color')).toBe(0xcccccc);
  });
  it('adjusts and clamps channels', () => {
    expect(adjustBrightness(0x102030, 0.5)).toBe(0x183048);
    expect(adjustBrightness(0xf01008, 1)).toBe(0xff2010);
    expect(adjustBrightness(0x102030, -1)).toBe(0);
  });
});
