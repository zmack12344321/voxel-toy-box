/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RenderMode, MeshStats } from '../../types';
import { GreedyMeshResult } from '../meshing/VoxelMesher';

export function emitStats(
  voxelCount: number,
  renderMode: RenderMode,
  culledResult: GreedyMeshResult | null,
  smoothTriangleCount: number,
  onStatsChange: (stats: MeshStats) => void
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
