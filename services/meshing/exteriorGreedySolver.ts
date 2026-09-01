/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VoxelData } from '../../types';
import { ExteriorGreedyQuad } from './greedyTypes';

const CELL_UNVISITED_AIR = -1;
const CELL_EXTERIOR_AIR = -2;

export function extractExteriorGreedyQuads(
  voxels: VoxelData[],
  voxelScale: number = 1.0
): { quads: ExteriorGreedyQuad[]; rawCulledQuads: number } {
  if (voxels.length === 0) {
    return { quads: [], rawCulledQuads: 0 };
  }

  // 1. Calculate bounding box
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

  voxels.forEach(v => {
    const x = Math.round(v.x);
    const y = Math.round(v.y);
    const z = Math.round(v.z);
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  });

  const dimX = maxX - minX + 3;
  const dimY = maxY - minY + 3;
  const dimZ = maxZ - minZ + 3;

  const grid = new Int32Array(dimX * dimY * dimZ).fill(CELL_UNVISITED_AIR);

  const getIdx = (x: number, y: number, z: number) => {
    return x + dimX * (y + dimY * z);
  };

  voxels.forEach(v => {
    const gx = Math.round(v.x) - minX + 1;
    const gy = Math.round(v.y) - minY + 1;
    const gz = Math.round(v.z) - minZ + 1;
    if (gx >= 1 && gx < dimX - 1 && gy >= 1 && gy < dimY - 1 && gz >= 1 && gz < dimZ - 1) {
      grid[getIdx(gx, gy, gz)] = v.color;
    }
  });

  const queue = new Int32Array(dimX * dimY * dimZ * 3);
  let qHead = 0;
  let qTail = 0;

  const startIdx = getIdx(0, 0, 0);
  grid[startIdx] = CELL_EXTERIOR_AIR;
  queue[qTail++] = 0;
  queue[qTail++] = 0;
  queue[qTail++] = 0;

  const neighbors = [
    [1, 0, 0], [-1, 0, 0],
    [0, 1, 0], [0, -1, 0],
    [0, 0, 1], [0, 0, -1]
  ];

  while (qHead < qTail) {
    const cx = queue[qHead++];
    const cy = queue[qHead++];
    const cz = queue[qHead++];

    for (let n = 0; n < 6; n++) {
      const nx = cx + neighbors[n][0];
      const ny = cy + neighbors[n][1];
      const nz = cz + neighbors[n][2];

      if (nx >= 0 && nx < dimX && ny >= 0 && ny < dimY && nz >= 0 && nz < dimZ) {
        const idx = getIdx(nx, ny, nz);
        if (grid[idx] === CELL_UNVISITED_AIR) {
          grid[idx] = CELL_EXTERIOR_AIR;
          queue[qTail++] = nx;
          queue[qTail++] = ny;
          queue[qTail++] = nz;
        }
      }
    }
  }

  const quads: ExteriorGreedyQuad[] = [];
  let rawCulledQuads = 0;

  const dims = [dimX, dimY, dimZ];
  const x = [0, 0, 0];
  const q = [0, 0, 0];
  const mask = new Int32Array(Math.max(dimX, dimY, dimZ) * Math.max(dimX, dimY, dimZ));

  for (let d = 0; d < 3; d++) {
    const u = (d + 1) % 3;
    const v = (d + 2) % 3;

    x[0] = 0; x[1] = 0; x[2] = 0;
    q[0] = 0; q[1] = 0; q[2] = 0;
    q[d] = 1;

    for (x[d] = -1; x[d] < dims[d]; ) {
      let n = 0;
      for (x[v] = 0; x[v] < dims[v]; ++x[v]) {
        for (x[u] = 0; x[u] < dims[u]; ++x[u]) {
          const inBounds1 = x[d] >= 0;
          const inBounds2 = x[d] + 1 < dims[d];

          const c1 = inBounds1 ? grid[getIdx(x[0], x[1], x[2])] : CELL_EXTERIOR_AIR;
          const c2 = inBounds2 ? grid[getIdx(x[0] + q[0], x[1] + q[1], x[2] + q[2])] : CELL_EXTERIOR_AIR;

          const isSolid1 = c1 >= 0;
          const isSolid2 = c2 >= 0;

          if (isSolid1 && c2 === CELL_EXTERIOR_AIR) {
            mask[n++] = c1 + 1;
          } else if (isSolid2 && c1 === CELL_EXTERIOR_AIR) {
            mask[n++] = -(c2 + 1);
          } else {
            mask[n++] = 0;
          }
        }
      }

      x[d]++;

      n = 0;
      for (let j = 0; j < dims[v]; ++j) {
        for (let i = 0; i < dims[u]; ) {
          const c = mask[n];
          if (c !== 0) {
            rawCulledQuads++;

            let w = 1;
            while (i + w < dims[u] && mask[n + w] === c) {
              w++;
            }

            let h = 1;
            let canExtend = true;
            while (j + h < dims[v]) {
              for (let k = 0; k < w; ++k) {
                if (mask[n + k + h * dims[u]] !== c) {
                  canExtend = false;
                  break;
                }
              }
              if (!canExtend) break;
              h++;
            }

            x[u] = i;
            x[v] = j;

            const du = [0, 0, 0];
            const dv = [0, 0, 0];
            du[u] = w;
            dv[v] = h;

            const colorVal = Math.abs(c) - 1;
            const isFront = c > 0;
            const norm: [number, number, number] = [0, 0, 0];
            norm[d] = isFront ? 1 : -1;

            const p0 = [
              (minX + (x[0] - 1) - 0.5) * voxelScale,
              (minY + (x[1] - 1) - 0.5) * voxelScale,
              (minZ + (x[2] - 1) - 0.5) * voxelScale
            ];

            const c00: [number, number, number] = [p0[0], p0[1], p0[2]];
            const c10: [number, number, number] = [(p0[0] + du[0] * voxelScale), (p0[1] + du[1] * voxelScale), (p0[2] + du[2] * voxelScale)];
            const c11: [number, number, number] = [(p0[0] + (du[0] + dv[0]) * voxelScale), (p0[1] + (du[1] + dv[1]) * voxelScale), (p0[2] + (du[2] + dv[2]) * voxelScale)];
            const c01: [number, number, number] = [(p0[0] + dv[0] * voxelScale), (p0[1] + dv[1] * voxelScale), (p0[2] + dv[2] * voxelScale)];

            quads.push({
              c00, c10, c11, c01,
              w, h,
              normal: norm,
              color: colorVal,
              isFront
            });

            for (let l = 0; l < h; l++) {
              for (let k = 0; k < w; k++) {
                mask[n + k + l * dims[u]] = 0;
              }
            }

            i += w;
            n += w;
          } else {
            i++;
            n++;
          }
        }
      }
    }
  }

  return { quads, rawCulledQuads };
}
