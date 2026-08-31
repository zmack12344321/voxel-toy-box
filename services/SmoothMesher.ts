/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { VoxelData } from '../types';
import { VoxelMesher, ExteriorGreedyQuad } from './VoxelMesher';

export class SmoothMesher {
  /**
   * Builds an organic continuous surface applied DIRECTLY to the clean merged model.
   * 1. Uses the clean exterior greedy quads (100% exterior flood-fill culling, zero interior hollow faces).
   * 2. Subdivides merged quads according to the target grid resolution.
   * 3. Welds coincident edge vertices into a watertight 2-manifold mesh.
   * 4. Applies volume-preserving Taubin smoothing to the welded surface graph:
   *    - Large merged flat regions stay perfectly flat and clean (no per-cube bumpiness).
   *    - 90° box seams and corners become smoothly beveled, filleted, and sculpted.
   *    - 0% smoothness = 100% identical to exact merged boxes.
   */
  public static buildSmoothMesh(
    voxels: VoxelData[],
    targetResolution: number = 64,
    smoothness: number = 0.35,
    materialProps?: THREE.MeshStandardMaterialParameters
  ): THREE.Mesh | null {
    if (!voxels || voxels.length === 0) return null;

    // 1. Extract clean exterior greedy quads from the merged model
    const { quads } = VoxelMesher.extractExteriorGreedyQuads(voxels, 1.0);
    if (quads.length === 0) return null;

    const isZeroSmooth = smoothness <= 0.01;

    // 2. Determine subdivision density factor from the resolution slider (16 to 300)
    // S represents subdivisions per voxel unit length
    let subDensity = 1;
    if (!isZeroSmooth) {
      if (targetResolution <= 32) {
        subDensity = 1;
      } else if (targetResolution <= 64) {
        subDensity = 2;
      } else if (targetResolution <= 120) {
        subDensity = 3;
      } else if (targetResolution <= 200) {
        subDensity = 4;
      } else {
        subDensity = 5;
      }
    }

    // 3. Build subdivided vertex grid & weld shared vertices across merged quads
    const vertexMap = new Map<string, number>();
    const positions: number[] = [];
    const origPositions: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    const getVertexIdx = (x: number, y: number, z: number, colorHex: number): number => {
      // Quantize to 0.001 to reliably weld coincident boundary vertices
      const qx = Math.round(x * 1000) / 1000;
      const qy = Math.round(y * 1000) / 1000;
      const qz = Math.round(z * 1000) / 1000;
      const key = `${qx},${qy},${qz}`;

      let idx = vertexMap.get(key);
      if (idx !== undefined) {
        return idx;
      }

      idx = positions.length / 3;
      vertexMap.set(key, idx);

      positions.push(x, y, z);
      origPositions.push(x, y, z);

      const c = new THREE.Color(colorHex);
      colors.push(c.r, c.g, c.b);

      return idx;
    };

    quads.forEach(q => {
      const nu = isZeroSmooth ? 1 : Math.max(1, Math.round(q.w * subDensity));
      const nv = isZeroSmooth ? 1 : Math.max(1, Math.round(q.h * subDensity));

      // Grid of vertex indices for this quad: (nu + 1) * (nv + 1)
      const gridIndices: number[][] = [];

      for (let j = 0; j <= nv; j++) {
        const row: number[] = [];
        const vFrac = j / nv;

        for (let i = 0; i <= nu; i++) {
          const uFrac = i / nu;

          // Bilinear interpolation on quad corners:
          // c(u, v) = (1-u)(1-v)*c00 + u(1-v)*c10 + u*v*c11 + (1-u)*v*c01
          const x = (1 - uFrac) * (1 - vFrac) * q.c00[0] +
                    uFrac * (1 - vFrac) * q.c10[0] +
                    uFrac * vFrac * q.c11[0] +
                    (1 - uFrac) * vFrac * q.c01[0];

          const y = (1 - uFrac) * (1 - vFrac) * q.c00[1] +
                    uFrac * (1 - vFrac) * q.c10[1] +
                    uFrac * vFrac * q.c11[1] +
                    (1 - uFrac) * vFrac * q.c01[1];

          const z = (1 - uFrac) * (1 - vFrac) * q.c00[2] +
                    uFrac * (1 - vFrac) * q.c10[2] +
                    uFrac * vFrac * q.c11[2] +
                    (1 - uFrac) * vFrac * q.c01[2];

          const vIdx = getVertexIdx(x, y, z, q.color);
          row.push(vIdx);
        }
        gridIndices.push(row);
      }

      // Generate quad triangles with correct face winding
      for (let j = 0; j < nv; j++) {
        for (let i = 0; i < nu; i++) {
          const v00 = gridIndices[j][i];
          const v10 = gridIndices[j][i + 1];
          const v11 = gridIndices[j + 1][i + 1];
          const v01 = gridIndices[j + 1][i];

          if (q.isFront) {
            indices.push(v00, v10, v11);
            indices.push(v00, v11, v01);
          } else {
            indices.push(v00, v11, v10);
            indices.push(v00, v01, v11);
          }
        }
      }
    });

    const totalVertices = positions.length / 3;

    // 4. If smoothness > 0, apply Taubin Volume-Preserving Laplacian Smoothing
    if (!isZeroSmooth && smoothness > 0.01) {
      // Build adjacency list for vertices
      const neighbors: Set<number>[] = new Array(totalVertices);
      for (let i = 0; i < totalVertices; i++) {
        neighbors[i] = new Set<number>();
      }

      for (let i = 0; i < indices.length; i += 3) {
        const a = indices[i];
        const b = indices[i + 1];
        const c = indices[i + 2];

        neighbors[a].add(b);
        neighbors[a].add(c);
        neighbors[b].add(a);
        neighbors[b].add(c);
        neighbors[c].add(a);
        neighbors[c].add(b);
      }

      const tempPos = new Float32Array(positions.length);
      const lambda = Math.min(0.55, 0.25 + smoothness * 0.3);
      const mu = -lambda * 1.04; // Negative inflation step prevents shrinkage
      const iterations = Math.max(3, Math.min(18, Math.round(smoothness * 15)));

      const maxDisplacement = 0.45 * Math.min(1.0, smoothness * 1.2);

      for (let it = 0; it < iterations; it++) {
        // Step 1: Shrinking pass with factor lambda
        for (let v = 0; v < totalVertices; v++) {
          const nbrs = neighbors[v];
          if (nbrs.size === 0) {
            tempPos[v * 3] = positions[v * 3];
            tempPos[v * 3 + 1] = positions[v * 3 + 1];
            tempPos[v * 3 + 2] = positions[v * 3 + 2];
            continue;
          }

          let avgX = 0, avgY = 0, avgZ = 0;
          nbrs.forEach(n => {
            avgX += positions[n * 3];
            avgY += positions[n * 3 + 1];
            avgZ += positions[n * 3 + 2];
          });
          avgX /= nbrs.size;
          avgY /= nbrs.size;
          avgZ /= nbrs.size;

          tempPos[v * 3] = positions[v * 3] + lambda * (avgX - positions[v * 3]);
          tempPos[v * 3 + 1] = positions[v * 3 + 1] + lambda * (avgY - positions[v * 3 + 1]);
          tempPos[v * 3 + 2] = positions[v * 3 + 2] + lambda * (avgZ - positions[v * 3 + 2]);
        }

        // Step 2: Inflating pass with factor mu
        for (let v = 0; v < totalVertices; v++) {
          const nbrs = neighbors[v];
          if (nbrs.size === 0) {
            positions[v * 3] = tempPos[v * 3];
            positions[v * 3 + 1] = tempPos[v * 3 + 1];
            positions[v * 3 + 2] = tempPos[v * 3 + 2];
            continue;
          }

          let avgX = 0, avgY = 0, avgZ = 0;
          nbrs.forEach(n => {
            avgX += tempPos[n * 3];
            avgY += tempPos[n * 3 + 1];
            avgZ += tempPos[n * 3 + 2];
          });
          avgX /= nbrs.size;
          avgY /= nbrs.size;
          avgZ /= nbrs.size;

          let newX = tempPos[v * 3] + mu * (avgX - tempPos[v * 3]);
          let newY = tempPos[v * 3 + 1] + mu * (avgY - tempPos[v * 3 + 1]);
          let newZ = tempPos[v * 3 + 2] + mu * (avgZ - tempPos[v * 3 + 2]);

          // Clamp displacement relative to original mesh position
          const ox = origPositions[v * 3];
          const oy = origPositions[v * 3 + 1];
          const oz = origPositions[v * 3 + 2];

          const dx = newX - ox;
          const dy = newY - oy;
          const dz = newZ - oz;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist > maxDisplacement && dist > 0.0001) {
            const scale = maxDisplacement / dist;
            newX = ox + dx * scale;
            newY = oy + dy * scale;
            newZ = oz + dz * scale;
          }

          positions[v * 3] = newX;
          positions[v * 3 + 1] = newY;
          positions[v * 3 + 2] = newZ;
        }
      }
    }

    // 5. Create BufferGeometry
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
    geometry.computeBoundingBox();

    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: isZeroSmooth ? 0.55 : 0.45,
      metalness: isZeroSmooth ? 0.1 : 0.08,
      flatShading: isZeroSmooth,
      ...materialProps
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    (mesh as any).triangleCount = indices.length / 3;

    return mesh;
  }
}
