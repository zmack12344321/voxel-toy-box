import * as THREE from 'three';
import { SceneWater, WaterTuning } from '../../types';
import type { EnvironmentRenderer } from './contracts';
import { WatergliceAdapter } from '../water/webglice/WatergliceAdapter';

/** Runtime bridge for the direct Webglice renderer port. */
export class WaterManager implements EnvironmentRenderer {
  private adapter = new WatergliceAdapter();

  setup(scene: THREE.Scene, water: SceneWater | null, isFogEnabled: boolean): void {
    this.dispose(scene);
    if (!water) return;
    const renderer = scene.userData.renderer as THREE.WebGLRenderer | undefined;
    const camera = scene.userData.camera as THREE.PerspectiveCamera | undefined;
    if (!renderer || !camera) {
      console.warn('[WaterManager] Missing renderer/camera context; water skipped.');
      return;
    }
    this.adapter.initialize(scene, renderer, camera, water);
    this.adapter.setFog(isFogEnabled);
    scene.userData.waterDiagnostics = () => this.adapter.getDiagnostics();
    scene.userData.setWaterDebugMode = (mode: number) => this.adapter.setDebugMode(mode);
    console.info('[WaterManager] initialized', this.adapter.getDiagnostics());
  }

  update(deltaTime: number): void { this.adapter.update(deltaTime); }
  renderReflection(): void { this.adapter.renderReflection(); }
  renderRefraction(): void { this.adapter.renderRefraction(); }
  renderCaustics(): void { this.adapter.renderCaustics(); }
  renderSurface(): void { this.adapter.renderSurface(); }
  getTuning(): WaterTuning | null { return this.adapter.getTuning(); }
  setTuning(values: Partial<WaterTuning>): void { this.adapter.setTuning(values); }
  resize(width: number, height: number, pixelRatio: number): void { this.adapter.resize(width, height, pixelRatio); }
  setFog(enabled: boolean): void { this.adapter.setFog(enabled); }
  dispose(scene: THREE.Scene): void {
    this.adapter.dispose();
    delete scene.userData.waterDiagnostics;
    delete scene.userData.setWaterDebugMode;
    this.adapter = new WatergliceAdapter();
  }
}
