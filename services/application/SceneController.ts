import type { DeclarativeModelPayload, SceneSpec } from '../../models/declarativeTypes';
import type { AnimatedEntity, RenderMode, ScenePayload, SceneTheme, SceneWater, VoxelData } from '../../types';
import { compileDeclarativePayload, compileSceneSpec } from '../rasterizer';
import type { SceneRuntime } from './contracts';
import type * as THREE from 'three';

export type { SceneRuntime } from './contracts';

/** Safe no-op facade until App attaches the runtime, preserving optional-engine UI behavior. */
export class SceneController {
  private runtime?: SceneRuntime;

  public constructor(runtime?: SceneRuntime) {
    this.runtime = runtime;
  }

  public attach(runtime: SceneRuntime): void {
    if (this.runtime && this.runtime !== runtime) this.runtime.cleanup();
    this.runtime = runtime;
  }
  public detach(): void { this.runtime = undefined; }
  public loadScene(payload: ScenePayload): void {
    if (this.runtime?.loadScene) this.runtime.loadScene(payload);
    else {
      this.loadModel(payload.data, payload.water);
      this.loadAnimatedEntities(payload.animatedEntities ?? []);
    }
  }
  public rebuildScene(payload: ScenePayload): void {
    if (this.runtime?.rebuildScene) this.runtime.rebuildScene(payload);
    else {
      this.rebuild(payload.data, payload.water);
      this.loadAnimatedEntities(payload.animatedEntities ?? []);
    }
  }
  public loadModel(data: VoxelData[], water?: SceneWater | null): void { water === undefined ? this.runtime?.loadModel(data) : this.runtime?.loadModel(data, water); }
  public loadDeclarativePayload(payload: DeclarativeModelPayload): void {
    const compiled = compileDeclarativePayload(payload);
    this.loadScene({ data: compiled.voxels, water: compiled.water, animatedEntities: compiled.animatedEntities });
  }
  public loadSceneSpec(spec: SceneSpec): void {
    const compiled = compileSceneSpec(spec);
    this.loadScene({ data: compiled.voxels, water: compiled.water, animatedEntities: compiled.animatedEntities });
  }
  public rebuildDeclarativePayload(payload: DeclarativeModelPayload): void {
    const compiled = compileDeclarativePayload(payload);
    this.rebuildScene({ data: compiled.voxels, water: compiled.water, animatedEntities: compiled.animatedEntities });
  }
  public rebuildSceneSpec(spec: SceneSpec): void {
    const compiled = compileSceneSpec(spec);
    this.rebuildScene({ data: compiled.voxels, water: compiled.water, animatedEntities: compiled.animatedEntities });
  }
  public rebuild(data: VoxelData[], water?: SceneWater | null): void { water === undefined ? this.runtime?.rebuild(data) : this.runtime?.rebuild(data, water); }
  public loadAnimatedEntities(entities: AnimatedEntity[]): void { this.runtime?.loadAnimatedEntities(entities); }
  public dismantle(hitPoint?: THREE.Vector3): void { hitPoint === undefined ? this.runtime?.dismantle() : this.runtime?.dismantle(hitPoint); }
  public handleResize(): void { this.runtime?.handleResize(); }
  public resetCamera(): void { this.runtime?.resetCamera(); }
  public cleanup(): void { this.runtime?.cleanup(); }
  public getJsonData(): string { return this.runtime?.getJsonData() ?? ''; }
  public getUniqueColors(): string[] { return this.runtime?.getUniqueColors() ?? []; }
  public setAutoRotate(value: boolean): void { this.runtime?.setAutoRotate(value); }
  public setFog(value: boolean): void { this.runtime?.setFog(value); }
  public setGridFloor(value: boolean): void { this.runtime?.setGridFloor(value); }
  public setGroundPlane(value: boolean): void { this.runtime?.setGroundPlane(value); }
  public setShadows(value: boolean): void { this.runtime?.setShadows(value); }
  public setWireframe(value: boolean): void { this.runtime?.setWireframe(value); }
  public setTheme(value: SceneTheme): void { this.runtime?.setTheme(value); }
  public setRenderMode(value: RenderMode): void { this.runtime?.setRenderMode(value); }
  public setMarchingSmoothness(value: number): void { this.runtime?.setMarchingSmoothness(value); }
  public setMarchingResolution(value: number): void { this.runtime?.setMarchingResolution(value); }
  public setVoxelDensity(value: number): void { this.runtime?.setVoxelDensity(value); }
  public setVoxelSpacing(value: number): void { this.runtime?.setVoxelSpacing(value); }
}

export const sceneController = new SceneController();
