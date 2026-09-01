/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MirrorAxis } from '../../../models/declarativeTypes';
import { RasterizerState, setVoxel, getMirroredPositions, rotatePoint } from '../helpers';

export function rasterizeWedge(
  state: RasterizerState,
  at: [number, number, number],
  size: [number, number, number],
  direction = '+z',
  color: number,
  mirror: MirrorAxis = 'none',
  rotation?: [number, number, number]
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
        let keep = true;
        const ny = (y - minY) / Math.max(1, (maxY - minY));
        if (direction === '+z') {
          const nz = (z - minZ) / Math.max(1, (maxZ - minZ));
          keep = ny <= (1 - nz);
        } else if (direction === '-z') {
          const nz = (z - minZ) / Math.max(1, (maxZ - minZ));
          keep = ny <= nz;
        } else if (direction === '+x') {
          const nx = (x - minX) / Math.max(1, (maxX - minX));
          keep = ny <= (1 - nx);
        } else if (direction === '-x') {
          const nx = (x - minX) / Math.max(1, (maxX - minX));
          keep = ny <= nx;
        }

        if (keep) {
          const [px, py, pz] = rotation ? rotatePoint(x, y, z, rotation, at) : [x, y, z];
          const mirrored = getMirroredPositions(px, py, pz, mirror);
          for (const [mx, my, mz] of mirrored) {
            setVoxel(state, mx, my, mz, color);
          }
        }
      }
    }
  }
}
