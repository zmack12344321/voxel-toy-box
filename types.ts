/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import * as THREE from 'three';

export enum AppState {
  STABLE = 'STABLE',
  DISMANTLING = 'DISMANTLING',
  REBUILDING = 'REBUILDING'
}

export interface VoxelData {
  x: number;
  y: number;
  z: number;
  color: number;
}

export interface SimulationVoxel {
  id: number;
  x: number;
  y: number;
  z: number;
  color: THREE.Color;
  // Physics state
  vx: number;
  vy: number;
  vz: number;
  rx: number;
  ry: number;
  rz: number;
  rvx: number;
  rvy: number;
  rvz: number;
}

export interface RebuildTarget {
  x: number;
  y: number;
  z: number;
  delay: number;
  isRubble?: boolean;
}

export interface SavedModel {
  name: string;
  data: VoxelData[];
  water?: SceneWater | null;
  animatedEntities?: AnimatedEntity[];
  baseModel?: string;
  id?: string;
  timestamp?: number;
  prompt?: string;
  palettePreview?: string[];
  thumbnailUrl?: string;
}

export interface AnimatedEntity {
  id: string;
  waypoints: Array<[number, number, number]>;
  speed: number;
  voxels: VoxelData[];
}

/** Complete renderable scene payload exchanged across the application boundary. */
export interface ScenePayload {
  data: VoxelData[];
  water?: SceneWater | null;
  animatedEntities?: AnimatedEntity[];
}

export type SceneTheme = 'light' | 'dark' | 'studio' | 'dusk';

export enum RenderMode {
  MERGED_VOXEL = 'merged_voxel',
  SMOOTH_MARCHING = 'smooth_marching',
  INDIVIDUAL_CUBES = 'individual_cubes',
}

export interface MeshStats {
  voxelCount: number;
  triangleCount: number;
  unmergedTriangles: number;
  savingsPercentage: number;
  renderMode: RenderMode;
}

export interface SceneSettings {
  autoRotate: boolean;
  fog: boolean;
  gridFloor: boolean;
  groundPlane: boolean;
  shadows: boolean;
  wireframe: boolean;
  theme: SceneTheme;
  renderMode: RenderMode;
  marchingResolution: number;
  marchingSmoothness: number;
  voxelDensity: number;
  voxelSpacing: number;
  waterTuning: WaterTuning;
}

export interface SceneWater {
  level: number;
  extent: [number, number];
  color: number;
  opacity: number;
}

export interface WaterTuning {
  oceanLevel: number;
  bigWaveHeight: number;
  bigWaveSpeed: number;
  bigWaveSize: number;
  smallWaveHeight: number;
  smallWaveSpeed: number;
  smallWaveSize: number;
  causticsStrength: number;
}
