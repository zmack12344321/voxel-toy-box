/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SimulationVoxel, RenderMode } from '../types';
import { GreedyMeshResult } from './VoxelMesher';

export function getJsonData(voxels: SimulationVoxel[]): string {
  return JSON.stringify(
    voxels.map(v => ({
      x: Math.round(v.x),
      y: Math.round(v.y),
      z: Math.round(v.z),
      color: '#' + v.color.getHexString(),
    })),
    null,
    2
  );
}

export function getUniqueColors(voxels: SimulationVoxel[]): string[] {
  const set = new Set<string>();
  voxels.forEach(v => set.add('#' + v.color.getHexString()));
  return Array.from(set).sort();
}

export function emitStats(
  voxelCount: number,
  renderMode: RenderMode,
  culledResult: GreedyMeshResult | null,
  smoothTriangleCount: number,
  onStatsChange: (stats: any) => void
) {
  const triangleMap: Record<string, number> = {
    [RenderMode.INDIVIDUAL_CUBES]: voxelCount * 12,
    [RenderMode.MERGED_VOXEL]: culledResult?.triangleCount ?? 0,
    [RenderMode.SMOOTH_MARCHING]: smoothTriangleCount,
  };
  const unmergedMap: Record<string, number> = {
    [RenderMode.INDIVIDUAL_CUBES]: voxelCount * 12,
    [RenderMode.MERGED_VOXEL]: culledResult?.unmergedTriangles ?? voxelCount * 12,
    [RenderMode.SMOOTH_MARCHING]: smoothTriangleCount,
  };
  const tCount = triangleMap[renderMode] ?? 0;
  const uCount = unmergedMap[renderMode] ?? 0;
  onStatsChange({
    voxelCount,
    triangleCount: tCount,
    unmergedTriangles: uCount,
    savingsPercentage: Math.round((1 - tCount / (uCount || 1)) * 100),
    renderMode,
  });
}
