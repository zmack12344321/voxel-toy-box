/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * CSG (Constructive Solid Geometry) carving operations.
 */

import { MirrorAxis } from '../../models/declarativeTypes';
import { RasterizerState, deleteVoxel, getMirroredPositions } from './helpers';

export function carveBox(
  state: RasterizerState,
  at: [number, number, number],
  size: [number, number, number],
  mirror: MirrorAxis = 'none'
): void {
  const [cx, cy, cz] = at;
  const [sx, sy, sz] = size;
  const hx = Math.max(0.5, sx / 2);
  const hy = Math.max(0.5, sy / 2);
  const hz = Math.max(0.5, sz / 2);

  const minX = Math.round(cx - hx);
  const maxX = Math.round(cx + hx);
  const minY = Math.round(cy - hy);
  const maxY = Math.round(cy + hy);
  const minZ = Math.round(cz - hz);
  const maxZ = Math.round(cz + hz);

  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      for (let z = minZ; z <= maxZ; z++) {
        const mirrored = getMirroredPositions(x, y, z, mirror);
        for (const [mx, my, mz] of mirrored) {
          deleteVoxel(state, mx, my, mz);
        }
      }
    }
  }
}

export function carveSphere(
  state: RasterizerState,
  at: [number, number, number],
  radius: number,
  mirror: MirrorAxis = 'none'
): void {
  const [cx, cy, cz] = at;
  const r = Math.max(0.5, radius);
  const minX = Math.round(cx - r);
  const maxX = Math.round(cx + r);
  const minY = Math.round(cy - r);
  const maxY = Math.round(cy + r);
  const minZ = Math.round(cz - r);
  const maxZ = Math.round(cz + r);
  const rSq = r * r;

  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      for (let z = minZ; z <= maxZ; z++) {
        const dSq = (x - cx) * (x - cx) + (y - cy) * (y - cy) + (z - cz) * (z - cz);
        if (dSq <= rSq) {
          const mirrored = getMirroredPositions(x, y, z, mirror);
          for (const [mx, my, mz] of mirrored) {
            deleteVoxel(state, mx, my, mz);
          }
        }
      }
    }
  }
}
