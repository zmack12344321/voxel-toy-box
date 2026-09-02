import type * as THREE from 'three';
import type { AnimatedEntity, RenderMode, ScenePayload, SceneTheme, SceneWater, VoxelData } from '../../types';

/** Runtime operations exposed to the application layer. */
export interface SceneRuntime {
  loadModel(data: VoxelData[], water?: SceneWater | null): void;
  rebuild(data: VoxelData[], water?: SceneWater | null): void;
  loadScene?(payload: ScenePayload): void;
  rebuildScene?(payload: ScenePayload): void;
  loadAnimatedEntities(entities: AnimatedEntity[]): void;
  dismantle(hitPoint?: THREE.Vector3): void;
  handleResize(): void;
  resetCamera(): void;
  cleanup(): void;
  getJsonData(): string;
  getUniqueColors(): string[];
  setAutoRotate(value: boolean): void;
  setFog(value: boolean): void;
  setGridFloor(value: boolean): void;
  setGroundPlane(value: boolean): void;
  setShadows(value: boolean): void;
  setWireframe(value: boolean): void;
  setTheme(value: SceneTheme): void;
  setRenderMode(value: RenderMode): void;
  setMarchingSmoothness(value: number): void;
  setMarchingResolution(value: number): void;
  setVoxelDensity(value: number): void;
  setVoxelSpacing(value: number): void;
}
