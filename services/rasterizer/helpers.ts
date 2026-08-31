/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Shared utilities for voxel rasterization.
 */

import { VoxelData } from '../../types';
import { parseColor } from '../../models/builder';
import { MirrorAxis } from '../../models/declarativeTypes';

export interface RasterizerState {
  map: Map<string, VoxelData>;
  palette: Map<string, number>;
}

export function resolveColor(state: RasterizerState, colorNameOrHex: string | number | undefined): number {
  if (typeof colorNameOrHex === 'number') return colorNameOrHex;
  if (!colorNameOrHex) return 0xcccccc;
  const clean = colorNameOrHex.trim().toLowerCase();
  if (state.palette.has(clean)) {
    return state.palette.get(clean)!;
  }
  return parseColor(colorNameOrHex);
}

export function setVoxel(state: RasterizerState, x: number, y: number, z: number, color: number): void {
  const rx = Math.round(x);
  const ry = Math.round(y);
  const rz = Math.round(z);
  state.map.set(`${rx},${ry},${rz}`, { x: rx, y: ry, z: rz, color });
}

export function deleteVoxel(state: RasterizerState, x: number, y: number, z: number): void {
  const rx = Math.round(x);
  const ry = Math.round(y);
  const rz = Math.round(z);
  state.map.delete(`${rx},${ry},${rz}`);
}

export function getMirroredPositions(x: number, y: number, z: number, mirror: MirrorAxis = 'none'): Array<[number, number, number]> {
  const pts: Array<[number, number, number]> = [[x, y, z]];
  if (mirror === 'x' || mirror === 'xz') {
    if (Math.abs(x) > 0.001) pts.push([-x, y, z]);
  }
  if (mirror === 'z' || mirror === 'xz') {
    if (Math.abs(z) > 0.001) pts.push([x, y, -z]);
  }
  if (mirror === 'xz') {
    if (Math.abs(x) > 0.001 && Math.abs(z) > 0.001) pts.push([-x, y, -z]);
  }
  return pts;
}
