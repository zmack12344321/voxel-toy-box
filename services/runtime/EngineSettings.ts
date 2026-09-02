import { RenderMode } from '../../types';

/** Mutable render-quality settings owned by the runtime, not application stores. */
export class EngineSettings {
  private _renderMode: RenderMode = RenderMode.INDIVIDUAL_CUBES;
  private _marchingResolution = 42;
  private _marchingSmoothness = 0.3;
  private _wireframe = false;
  private _shadows = false;
  private _voxelSpacing = 1;

  public get renderMode(): RenderMode { return this._renderMode; }
  public get marchingResolution(): number { return this._marchingResolution; }
  public get marchingSmoothness(): number { return this._marchingSmoothness; }
  public get wireframe(): boolean { return this._wireframe; }
  public get shadows(): boolean { return this._shadows; }
  public get voxelSpacing(): number { return this._voxelSpacing; }

  public setRenderMode(value: RenderMode): RenderMode {
    return this._renderMode = value;
  }

  public setWireframe(value: boolean): boolean {
    return this._wireframe = value;
  }

  public setShadows(value: boolean): boolean {
    return this._shadows = value;
  }

  public setMarchingResolution(value: number): number {
    const next = Number.isFinite(value) ? value : this.marchingResolution;
    return this._marchingResolution = Math.max(8, Math.min(64, Math.round(next)));
  }

  public setMarchingSmoothness(value: number): number {
    const next = Number.isFinite(value) ? value : this.marchingSmoothness;
    return this._marchingSmoothness = Math.max(0, Math.min(1, next));
  }

  public setVoxelSpacing(value: number): number {
    const next = Number.isFinite(value) ? value : this.voxelSpacing;
    return this._voxelSpacing = Math.max(1, Math.min(3, next));
  }
}
