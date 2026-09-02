/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { VoxelData } from '../../types';
import { VoxelMesher } from './VoxelMesher';
import { applyTaubinSmoothing } from './taubinSmoothing';

type MeshWithTriangleCount = THREE.Mesh & { triangleCount?: number };

export class SmoothMesher {
  public static buildSmoothMesh(
    voxels: VoxelData[],
    targetResolution: number = 64,
    smoothness: number = 0.35,
    materialProps?: THREE.MeshStandardMaterialParameters
  ): THREE.Mesh | null {
    if (!voxels || voxels.length === 0) return null;

    const { quads } = VoxelMesher.extractExteriorGreedyQuads(voxels, 1.0);
    if (quads.length === 0) return null;

    const isZeroSmooth = smoothness <= 0.01;

    if (isZeroSmooth) {
      const meshResult = VoxelMesher.buildCulledGeometry(voxels, 1.0);
      const mat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        side: THREE.DoubleSide,
        metalness: 0.1,
        roughness: 0.55,
        ...materialProps
      });
      const mesh = new THREE.Mesh(meshResult.geometry, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      (mesh as MeshWithTriangleCount).triangleCount = meshResult.triangleCount;
      return mesh;
    }

    // At low resolution / low smoothing, subDensity = 1 uses exact merged quads without unnecessary subdivision.
    const subDensity = (isZeroSmooth || targetResolution <= 24) 
      ? 1 
      : Math.max(1, Math.round(1 + ((targetResolution - 24) / 40) * 3));

    const vertexMap = new Map<string, number>();
    const positions: number[] = [];
    const origPositions: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    const getVertexIdx = (x: number, y: number, z: number, colorHex: number): number => {
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

      const gridIndices: number[][] = [];

      for (let j = 0; j <= nv; j++) {
        const row: number[] = [];
        const vFrac = j / nv;

        for (let i = 0; i <= nu; i++) {
          const uFrac = i / nu;

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

    if (!isZeroSmooth && smoothness > 0.01) {
      applyTaubinSmoothing(positions, origPositions, indices, smoothness);
    }

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
    (mesh as MeshWithTriangleCount).triangleCount = indices.length / 3;

    return mesh;
  }
}
