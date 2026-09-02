/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SimulationVoxel, VoxelData, RebuildTarget } from '../../types';

export class VoxelStateManager {
  voxels: SimulationVoxel[] = [];
  private rawVoxelData: VoxelData[] = [];
  rebuildTargets: RebuildTarget[] = [];
  private voxelDensity: number = 1;

  /** Canonical source data is never exposed by reference. */
  get currentRawVoxelData(): VoxelData[] {
    return this.rawVoxelData.map(voxel => ({ ...voxel }));
  }

  set currentRawVoxelData(data: VoxelData[]) {
    this.rawVoxelData = data.map(voxel => ({ ...voxel }));
  }

  /**
   * Downsample voxel data based on density setting (keep every Nth voxel).
   */
  getActiveVoxelData(): VoxelData[] {
    if (this.voxelDensity >= 1) return this.currentRawVoxelData;
    return this.rawVoxelData.filter(
      (_, i) => i % Math.max(1, Math.round(1 / this.voxelDensity)) === 0
    ).map(voxel => ({ ...voxel }));
  }

  setVoxelDensity(density: number, onCountChange?: (n: number) => void): void {
    this.voxelDensity = Math.max(0.01, Math.min(1, density));
    if (this.rawVoxelData.length > 0) {
      const activeData = this.getActiveVoxelData();
      onCountChange?.(activeData.length);
    }
  }
}
