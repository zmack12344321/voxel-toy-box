/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SimulationVoxel, VoxelData } from '../../types';

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

export function parseVoxelJson(jsonStr: string): VoxelData[] {
  const rawData: unknown = JSON.parse(jsonStr);
  if (!Array.isArray(rawData)) throw new Error('JSON must be an array');

  return rawData.map((value: unknown) => {
    const v = isRecord(value) ? value : {};
    let colorVal = v.c ?? v.color;
    let colorInt = 0xCCCCCC;

    if (typeof colorVal === 'string') {
      const colorText = colorVal.startsWith('#') ? colorVal.substring(1) : colorVal;
      colorInt = parseInt(colorText, 16);
    } else if (typeof colorVal === 'number') {
      colorInt = colorVal;
    }

    return {
      x: Number(v.x) || 0,
      y: Number(v.y) || 0,
      z: Number(v.z) || 0,
      color: isNaN(colorInt) ? 0xCCCCCC : colorInt,
    };
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
