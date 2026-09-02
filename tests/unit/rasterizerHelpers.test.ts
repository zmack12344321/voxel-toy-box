import { describe, expect, it } from 'vitest';
import { deleteVoxel, getMirroredPositions, getSurfaceHeight, resolveColor, rotatePoint, setVoxel } from '../../services/rasterizer/helpers';

const state = () => ({ map: new Map(), palette: new Map([['grass', 0x228833]]) });
describe('rasterizer helpers', () => {
  it('resolves palette and colors', () => {
    const s = state();
    expect(resolveColor(s, 'GRASS')).toBe(0x228833);
    expect(resolveColor(s, '#ff0000')).toBe(0xff0000);
    expect(resolveColor(s, undefined)).toBe(0xcccccc);
  });
  it('rounds voxel coordinates and deletes them', () => {
    const s = state(); setVoxel(s, 1.6, 2.4, -0.5, 7);
    const voxel = s.map.get('2,2,0');
    expect(s.map.has('2,2,0')).toBe(true);
    expect(voxel?.x).toBe(2); expect(voxel?.y).toBe(2); expect(voxel?.color).toBe(7);
    deleteVoxel(s, 2, 2, 0); expect(s.map.size).toBe(0);
  });
  it('rotates, mirrors, and finds surfaces', () => {
    expect(rotatePoint(1, 0, 0, [0, 90, 0]).map(Math.round)).toEqual([0, 0, -1]);
    expect(getMirroredPositions(1, 2, 3, 'xz')).toHaveLength(4);
    const s = state(); setVoxel(s, 0, 4, 0, 1); setVoxel(s, 1, 7, 0, 1);
    expect(getSurfaceHeight(s, 0, 0)).toBe(4); expect(getSurfaceHeight(s, 1, 0, 1)).toBe(7);
  });
});
