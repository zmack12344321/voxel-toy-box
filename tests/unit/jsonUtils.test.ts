import { describe, expect, it } from 'vitest';
import { parseVoxelJson } from '../../services/utils/jsonUtils';

describe('parseVoxelJson', () => {
  it('normalizes supported color and coordinate formats', () => {
    expect(parseVoxelJson('[{"x":"2","y":3,"z":4,"c":"#ff0000"}]')).toEqual([
      { x: 2, y: 3, z: 4, color: 0xff0000 },
    ]);
  });

  it('rejects non-array JSON payloads', () => {
    expect(() => parseVoxelJson('{"x":1}')).toThrow('JSON must be an array');
  });
});
