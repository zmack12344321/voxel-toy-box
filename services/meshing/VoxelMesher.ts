/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { VoxelData } from '../../types';
import { GreedyMeshResult, ExteriorGreedyQuad } from './greedyTypes';
import { extractExteriorGreedyQuads } from './exteriorGreedySolver';

export type { GreedyMeshResult, ExteriorGreedyQuad };

export class VoxelMesher {
  public static extractExteriorGreedyQuads(
    voxels: VoxelData[],
    voxelScale: number = 1.0
  ): { quads: ExteriorGreedyQuad[]; rawCulledQuads: number } {
    return extractExteriorGreedyQuads(voxels, voxelScale);
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

    const { quads, rawCulledQuads } = extractExteriorGreedyQuads(voxels, voxelScale);

    const positions: number[] = [];
    const normals: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];
    let vertexOffset = 0;

    const tempColor = new THREE.Color();

    quads.forEach(q => {
      tempColor.set(q.color);

      if (q.isFront) {
        positions.push(q.c00[0], q.c00[1], q.c00[2]);
        positions.push(q.c10[0], q.c10[1], q.c10[2]);
        positions.push(q.c11[0], q.c11[1], q.c11[2]);
        positions.push(q.c01[0], q.c01[1], q.c01[2]);
      } else {
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
