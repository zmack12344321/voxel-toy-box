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

export function rotatePoint(
  x: number, y: number, z: number,
  rot: [number, number, number],
  pivot: [number, number, number] = [0, 0, 0]
): [number, number, number] {
  let [dx, dy, dz] = [x - pivot[0], y - pivot[1], z - pivot[2]];
  const [rx, ry, rz] = rot.map(deg => (deg * Math.PI) / 180);

  // Rotate around X
  if (rx !== 0) {
    const cosX = Math.cos(rx), sinX = Math.sin(rx);
    const y1 = dy * cosX - dz * sinX;
    const z1 = dy * sinX + dz * cosX;
    dy = y1; dz = z1;
  }
  // Rotate around Y
  if (ry !== 0) {
    const cosY = Math.cos(ry), sinY = Math.sin(ry);
    const x1 = dx * cosY + dz * sinY;
    const z1 = -dx * sinY + dz * cosY;
    dx = x1; dz = z1;
  }
  // Rotate around Z
  if (rz !== 0) {
    const cosZ = Math.cos(rz), sinZ = Math.sin(rz);
    const x1 = dx * cosZ - dy * sinZ;
    const y1 = dx * sinZ + dy * cosZ;
    dx = x1; dy = y1;
  }

  return [dx + pivot[0], dy + pivot[1], dz + pivot[2]];
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

export function getSurfaceHeight(state: RasterizerState, x: number, z: number, searchRadius = 0): number | null {
  const rx = Math.round(x);
  const rz = Math.round(z);

  let maxY: number | null = null;

  for (const v of state.map.values()) {
    if (Math.abs(v.x - rx) <= searchRadius && Math.abs(v.z - rz) <= searchRadius) {
      if (maxY === null || v.y > maxY) {
        maxY = v.y;
      }
    }
  }

  return maxY;
}

