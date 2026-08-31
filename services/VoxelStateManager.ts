/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SimulationVoxel, VoxelData } from '../types';
import { RebuildTarget } from '../types';

export class VoxelStateManager {
  voxels: SimulationVoxel[] = [];
  currentRawVoxelData: VoxelData[] = [];
  rebuildTargets: RebuildTarget[] = [];
  private voxelDensity: number = 1;

  /**
   * Downsample voxel data based on density setting (keep every Nth voxel).
   */
  getActiveVoxelData(): VoxelData[] {
    if (this.voxelDensity >= 1) return [...this.currentRawVoxelData];
    return this.currentRawVoxelData.filter(
      (_, i) => i % Math.max(1, Math.round(1 / this.voxelDensity)) === 0
    );
  }

  setVoxelDensity(density: number, onCountChange: (n: number) => void): void {
    this.voxelDensity = Math.max(0.01, Math.min(1, density));
    if (this.currentRawVoxelData.length > 0) {
      const activeData = this.getActiveVoxelData();
      onCountChange(activeData.length);
    }
  }
}
