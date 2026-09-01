/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VoxelData } from '../../types';
import { adjustBrightness } from './colorUtils';

/**
 * Removes all interior voxels that are completely occluded by 6 solid neighbors.
 */
export function cullInternalVoxels(voxelMap: Map<string, VoxelData>): Map<string, VoxelData> {
  const coords = new Set<string>(voxelMap.keys());
  const culledMap = new Map<string, VoxelData>();

  voxelMap.forEach((voxel, key) => {
    const { x, y, z } = voxel;

    const hasTop    = coords.has(`${x},${y + 1},${z}`);
    const hasBottom = coords.has(`${x},${y - 1},${z}`);
    const hasNorth  = coords.has(`${x},${y},${z + 1}`);
    const hasSouth  = coords.has(`${x},${y},${z - 1}`);
    const hasEast   = coords.has(`${x + 1},${y},${z}`);
    const hasWest   = coords.has(`${x - 1},${y},${z}`);

    const isCompletelyOccluded = 
      hasTop && hasBottom && 
      hasNorth && hasSouth && 
      hasEast && hasWest;

    if (!isCompletelyOccluded) {
      culledMap.set(key, voxel);
    }
  });

  return culledMap;
}

/**
 * Applies an ambient occlusion and directional top-light pass to enhance 3D depth.
 */
export function applyLightingShading(voxelMap: Map<string, VoxelData>): Map<string, VoxelData> {
  const coords = new Set<string>(voxelMap.keys());
  const newMap = new Map<string, VoxelData>();

  voxelMap.forEach((voxel, key) => {
    const { x, y, z, color } = voxel;
    
    const hasTop = coords.has(`${x},${y + 1},${z}`);
    const hasBottom = coords.has(`${x},${y - 1},${z}`);
    let neighbors = 0;

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dz = -1; dz <= 1; dz++) {
          if (dx === 0 && dy === 0 && dz === 0) continue;
          if (coords.has(`${x + dx},${y + dy},${z + dz}`)) neighbors++;
        }
      }
    }

    let brightness = 0;
    if (!hasTop) {
      brightness += 0.08;
    }
    if (!hasBottom && y <= 2) {
      brightness -= 0.12;
    }
    if (neighbors > 20) {
      brightness -= 0.15;
    }

    const shadedColor = brightness !== 0 ? adjustBrightness(color, brightness) : color;
    newMap.set(key, { x, y, z, color: shadedColor });
  });

  return newMap;
}
