/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { VoxelData } from '../types';

export interface GreedyMeshResult {
  geometry: THREE.BufferGeometry;
  triangleCount: number;
  unmergedTriangles: number;
  rawCulledTriangles: number;
  reductionPercentage: number;
}

export interface ExteriorGreedyQuad {
  c00: [number, number, number];
  c10: [number, number, number];
  c11: [number, number, number];
  c01: [number, number, number];
  w: number;
  h: number;
  normal: [number, number, number];
  color: number;
  isFront: boolean;
}

const CELL_UNVISITED_AIR = -1;
const CELL_EXTERIOR_AIR = -2;

/**
 * High-performance Greedy Mesher with Exterior-Only Flood Fill Culling.
 * 1. Performs a 3D flood fill from outside the bounding box to identify true exterior air.
 * 2. Culls 100% of all internal geometry:
 *    - Solid-to-solid internal boundaries are culled.
 *    - Solid-to-internal-cavity (hollow interior) boundaries are culled.
 *    - Only true exterior surface faces are generated.
 * 3. Greedily merges coplanar adjacent matching-color faces into large optimal rectangles.
 *    Dramatically slashes triangle count (often by 85-95%+) and keeps wireframe mode 100% clean.
 */
export class VoxelMesher {
  /**
   * Extracts all exterior greedy merged quads using 3D flood-fill boundary detection.
   */
  public static extractExteriorGreedyQuads(
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

    // Add 1-voxel padding on all sides for flood-fill exterior detection
    const dimX = maxX - minX + 3;
    const dimY = maxY - minY + 3;
    const dimZ = maxZ - minZ + 3;

    // Grid stores:
    // >= 0: Solid Voxel Hex Color
    // -1: Unvisited air (could be interior cavity)
    // -2: Exterior Air (connected to outside world)
    const grid = new Int32Array(dimX * dimY * dimZ).fill(CELL_UNVISITED_AIR);

    const getIdx = (x: number, y: number, z: number) => {
      return x + dimX * (y + dimY * z);
    };

    // Populate solid voxels (offset by +1 due to outer padding)
    voxels.forEach(v => {
      const gx = Math.round(v.x) - minX + 1;
      const gy = Math.round(v.y) - minY + 1;
      const gz = Math.round(v.z) - minZ + 1;
      if (gx >= 1 && gx < dimX - 1 && gy >= 1 && gy < dimY - 1 && gz >= 1 && gz < dimZ - 1) {
        grid[getIdx(gx, gy, gz)] = v.color;
      }
    });

    // 2. BFS Flood Fill from (0, 0, 0) to find all EXTERIOR_AIR
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

    // 3. Greedy Meshing: Scan each primary slice along X, Y, and Z
    for (let d = 0; d < 3; d++) {
      const u = (d + 1) % 3;
      const v = (d + 2) % 3;

      const x = [0, 0, 0];
      const q = [0, 0, 0];
      q[d] = 1;

      // Mask for current slice
      const mask = new Int32Array(dims[u] * dims[v]);

      for (x[d] = 0; x[d] < dims[d] - 1;) {
        let n = 0;

        // Generate mask for slice boundary between x[d] and x[d] + 1
        for (x[v] = 0; x[v] < dims[v]; x[v]++) {
          for (x[u] = 0; x[u] < dims[u]; x[u]++) {
            const valA = grid[getIdx(x[0], x[1], x[2])];
            const valB = grid[getIdx(x[0] + q[0], x[1] + q[1], x[2] + q[2])];

            const aIsSolid = valA >= 0;
            const bIsSolid = valB >= 0;
            const aIsExterior = valA === CELL_EXTERIOR_AIR;
            const bIsExterior = valB === CELL_EXTERIOR_AIR;

            // Only generate an exposed face where SOLID touches EXTERIOR_AIR
            if (aIsSolid && bIsExterior) {
              // Solid to exterior air: front-facing polygon
              mask[n++] = (valA + 1); // +1 so 0x000000 black is not 0
              rawCulledQuads++;
            } else if (aIsExterior && bIsSolid) {
              // Exterior air to solid: back-facing polygon
              mask[n++] = -(valB + 1);
              rawCulledQuads++;
            } else {
              // Both solid, or solid touching interior cavity -> CULL COMPLETELY!
              mask[n++] = 0;
            }
          }
        }

        x[d]++;

        // Greedily merge identical coplanar quads into maximum rectangles
        n = 0;
        for (let j = 0; j < dims[v]; j++) {
          for (let i = 0; i < dims[u];) {
            const c = mask[n];
            if (c !== 0) {
              // Calculate width of rectangle
              let w = 1;
              while (i + w < dims[u] && mask[n + w] === c) {
                w++;
              }

              // Calculate height of rectangle
              let h = 1;
              let canExpand = true;
              while (j + h < dims[v]) {
                for (let k = 0; k < w; k++) {
                  if (mask[n + k + h * dims[u]] !== c) {
                    canExpand = false;
                    break;
                  }
                }
                if (!canExpand) break;
                h++;
              }

              // Rectangle coordinates in grid space (subtract 1 padding to return to voxel model space)
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

              // World coordinate corners (subtract 1.0 to account for the +1 grid padding offset)
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
                c00,
                c10,
                c11,
                c01,
                w,
                h,
                normal: norm,
                color: colorVal,
                isFront
              });

              // Clear mask for this rectangle
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

  public static buildCulledGeometry(voxels: VoxelData[], voxelScale: number = 1.0): GreedyMeshResult {
    const unmergedTriangles = voxels.length * 12;
    if (voxels.length === 0) {
      return {
        geometry: new THREE.BufferGeometry(),
        triangleCount: 0,
        unmergedTriangles: 0,
        rawCulledTriangles: 0,
        reductionPercentage: 0
      };
    }

    const { quads, rawCulledQuads } = VoxelMesher.extractExteriorGreedyQuads(voxels, voxelScale);

    const positions: number[] = [];
    const normals: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];
    let vertexOffset = 0;

    const tempColor = new THREE.Color();

    quads.forEach(q => {
      tempColor.set(q.color);

      if (q.isFront) {
        // Front face winding (c00 -> c10 -> c11 -> c01)
        positions.push(q.c00[0], q.c00[1], q.c00[2]);
        positions.push(q.c10[0], q.c10[1], q.c10[2]);
        positions.push(q.c11[0], q.c11[1], q.c11[2]);
        positions.push(q.c01[0], q.c01[1], q.c01[2]);
      } else {
        // Back face winding
        positions.push(q.c00[0], q.c00[1], q.c00[2]);
        positions.push(q.c01[0], q.c01[1], q.c01[2]);
        positions.push(q.c11[0], q.c11[1], q.c11[2]);
        positions.push(q.c10[0], q.c10[1], q.c10[2]);
      }

      for (let k = 0; k < 4; k++) {
        normals.push(q.normal[0], q.normal[1], q.normal[2]);
        colors.push(tempColor.r, tempColor.g, tempColor.b);
      }

      indices.push(
        vertexOffset, vertexOffset + 1, vertexOffset + 2,
        vertexOffset, vertexOffset + 2, vertexOffset + 3
      );
      vertexOffset += 4;
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeBoundingSphere();
    geometry.computeBoundingBox();

    const triangleCount = indices.length / 3;
    const rawCulledTriangles = rawCulledQuads * 2;
    const reductionPercentage = unmergedTriangles > 0 
      ? Math.max(0, Math.round((1 - (triangleCount / unmergedTriangles)) * 100))
      : 0;

    return {
      geometry,
      triangleCount,
      unmergedTriangles,
      rawCulledTriangles,
      reductionPercentage
    };
  }
}
