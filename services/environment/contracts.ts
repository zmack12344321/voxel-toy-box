import type * as THREE from 'three';
import type { SceneWater } from '../../types';

export type WaterQuality = 'low' | 'high';

export interface WaterOptions {
  quality?: WaterQuality;
}

/** Rendering lifecycle exposed to the engine runtime for scene environments. */
export interface EnvironmentRenderer {
  setup(scene: THREE.Scene, water: SceneWater | null, isFogEnabled: boolean, options?: WaterOptions): void;
  update(deltaTime: number): void;
  setFog(enabled: boolean): void;
  dispose(scene: THREE.Scene): void;
}
