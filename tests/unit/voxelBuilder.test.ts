import { describe, expect, it } from 'vitest';
import { compileDetailedPayload, VoxelBuilder } from '../../models/builder';

describe('VoxelBuilder', () => {
  it('rounds coordinates and overwrites duplicate cells', () => {
    const voxels = new VoxelBuilder().set(0.6, 1.4, -0.6, '#ff0000').set(1, 1, -1, '#00ff00').build();
    expect(voxels).toEqual([{ x: 1, y: 1, z: -1, color: 0x00ff00 }]);
  });
  it('builds inclusive boxes and symmetric geometry', () => {
    expect(new VoxelBuilder().box(0, 0, 0, 1, 1, 1, 1).build()).toHaveLength(8);
    expect(new VoxelBuilder().setSymmetricX(2, 0, 0, 1).build()).toHaveLength(2);
  });

  it('compiles all legacy primitive collections', () => {
    const voxels = compileDetailedPayload({
      cylinders: [{ cx: 0, y1: 0, y2: 1, cz: 0, radius: 1, color: '#ff0000' }],
      spheres: [{ cx: 4, cy: 0, cz: 0, radius: 1, color: '#00ff00' }],
      voxels: [{ x: 8, y: 0, z: 0, color: '#0000ff' }],
    });

    expect(voxels.some((voxel) => voxel.x === 8)).toBe(true);
    expect(voxels.some((voxel) => voxel.x === 4)).toBe(true);
    expect(voxels.some((voxel) => voxel.x === 0)).toBe(true);
  });
});
