import { describe, expect, it } from 'vitest';
import { VoxelStateManager } from '../../services/state/VoxelStateManager';

describe('VoxelStateManager', () => {
  it('derives active voxel data from the configured density', () => {
    const manager = new VoxelStateManager();
    manager.currentRawVoxelData = Array.from({ length: 10 }, (_, x) => ({ x, y: 0, z: 0, color: 0xffffff }));

    let reportedCount = 0;
    manager.setVoxelDensity(0.5, (count) => { reportedCount = count; });

    expect(manager.getActiveVoxelData()).toHaveLength(5);
    expect(reportedCount).toBe(5);
  });

  it('clamps invalid density ranges', () => {
    const manager = new VoxelStateManager();
    manager.currentRawVoxelData = [{ x: 0, y: 0, z: 0, color: 0xffffff }];

    manager.setVoxelDensity(0, () => undefined);
    expect(manager.getActiveVoxelData()).toHaveLength(1);
    manager.setVoxelDensity(2, () => undefined);
    expect(manager.getActiveVoxelData()).toHaveLength(1);
  });
});
