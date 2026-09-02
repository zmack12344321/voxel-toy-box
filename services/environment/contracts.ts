import type * as THREE from 'three';
import type { SceneWater, WaterTuning } from '../../types';

/** Rendering lifecycle exposed to the engine runtime for scene environments. */
export interface EnvironmentRenderer {
  setup(scene: THREE.Scene, water: SceneWater | null, isFogEnabled: boolean): void;
  update(deltaTime: number): void;
  renderReflection?(): void;
  renderRefraction?(): void;
  renderCaustics?(): void;
  renderSurface?(): void;
  getTuning?(): WaterTuning | null;
  setTuning?(values: Partial<WaterTuning>): void;
  resize?(width: number, height: number, pixelRatio: number): void;
  setFog(enabled: boolean): void;
  dispose(scene: THREE.Scene): void;
}
