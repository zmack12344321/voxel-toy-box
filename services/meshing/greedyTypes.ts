/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

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
