/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MirrorAxis } from '../../../models/declarativeTypes';
import { RasterizerState, setVoxel, getMirroredPositions, rotatePoint } from '../helpers';

export function rasterizeBox(
  state: RasterizerState,
  at: [number, number, number],
  size: [number, number, number],
  color: number,
  hollow = false,
  wallThickness = 1,
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
        if (hollow) {
          const isBorder =
            x < minX + wallThickness || x > maxX - wallThickness ||
            y < minY + wallThickness || y > maxY - wallThickness ||
            z < minZ + wallThickness || z > maxZ - wallThickness;
          if (!isBorder) continue;
        }
        const [px, py, pz] = rotation ? rotatePoint(x, y, z, rotation, at) : [x, y, z];
        const mirrored = getMirroredPositions(px, py, pz, mirror);
        for (const [mx, my, mz] of mirrored) {
          setVoxel(state, mx, my, mz, color);
        }
      }
    }
  }
}
