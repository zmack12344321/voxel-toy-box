/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { AppState, VoxelData, MeshStats, SceneTheme, RenderMode, SceneWater } from '../types';
import { CONFIG } from '../utils/voxelConstants';
import { SceneSetup } from './SceneSetup';
import { VoxelStateManager } from './state/VoxelStateManager';
import { MeshLifecycleManager } from './meshing/MeshLifecycleManager';
import { VoxelPhysics } from './physics/VoxelPhysics';
import { WaterManager } from './environment/WaterManager';
import { InputHandler } from './InputHandler';
import { SplineAnimationManager } from './camera/SplineAnimationManager';
import { getJsonData, getUniqueColors } from './VoxelUtils';

import { CameraController } from './camera/CameraController';
import { EngineRebuildController } from './state/EngineRebuildController';

export class VoxelEngine {
  private state = AppState.STABLE;

  // Managers
  private sceneSetup: SceneSetup;
  private stateManager: VoxelStateManager;
  private meshLifecycle: MeshLifecycleManager;
  private physics: VoxelPhysics;
  private waterManager: WaterManager;
  private inputHandler: InputHandler;
  private rebuildController: EngineRebuildController;
  public cameraController: CameraController;
  public splineAnimManager: SplineAnimationManager;

  // Callbacks
  private onStateChange: (state: AppState) => void;
  private onCountChange: (count: number) => void;
  private onStatsChange: (stats: MeshStats) => void;

  // Settings cache
  private renderMode: RenderMode = RenderMode.INDIVIDUAL_CUBES;
  private marchingResolution = 42;
  private marchingSmoothness = 0.35;
  private wireframe = false;
  private shadows = false;
  private voxelSpacing = 1.0;
  private pendingRebuildTarget: VoxelData[] | null = null;
  private pendingRebuildWater: SceneWater | null | undefined = undefined;

  private clock = new THREE.Clock();
  private animationId: number | null = null;
  private disposed = false;

  constructor(
    container: HTMLElement,
    onStateChange: (state: AppState) => void,
    onCountChange: (count: number) => void,
    onStatsChange: (stats: MeshStats) => void,
  ) {
    this.onStateChange = onStateChange;
    this.onCountChange = onCountChange;
    this.onStatsChange = onStatsChange;

    this.sceneSetup = new SceneSetup(container);
    this.stateManager = new VoxelStateManager();
    this.meshLifecycle = new MeshLifecycleManager();
    this.physics = new VoxelPhysics();
    this.waterManager = new WaterManager();
    this.rebuildController = new EngineRebuildController();
    this.cameraController = new CameraController(this.sceneSetup.camera, this.sceneSetup.controls);
    this.splineAnimManager = new SplineAnimationManager();
    this.inputHandler = new InputHandler(
      this.sceneSetup.renderer.domElement,
      this.sceneSetup.camera,
      () => this.state,
      this.getVisibleObjects.bind(this),
      this.dismantle.bind(this),
    );

    window.addEventListener('resize', () => this.sceneSetup.handleResize());
    this.animate();
  }

  // ── Visible objects for raycasting ──

  private getVisibleObjects(): THREE.Object3D[] {
    const objs: THREE.Object3D[] = [];
    if (this.meshLifecycle.mergedMesh && this.meshLifecycle.mergedMesh.visible) objs.push(this.meshLifecycle.mergedMesh);
    if (this.meshLifecycle.smoothMesh && this.meshLifecycle.smoothMesh.visible) objs.push(this.meshLifecycle.smoothMesh);
    if (this.meshLifecycle.segmentedMesh && this.meshLifecycle.segmentedMesh.visible) objs.push(this.meshLifecycle.segmentedMesh);
    return objs;
  }

  // ── Public API ──

  public loadInitialModel(data: VoxelData[], water?: SceneWater | null) {
    console.log(`[VoxelEngine] Loading model (${data.length} voxels)`);
    this.stateManager.currentRawVoxelData = [...data];
    const activeData = this.stateManager.getActiveVoxelData();
    const voxels = this.meshLifecycle.createAllMeshes(
      this.sceneSetup.scene, activeData,
      {
        marchingRes: this.marchingResolution,
        marchingSmooth: this.marchingSmoothness,
        wireframe: this.wireframe,
        shadows: this.shadows,
      },
      this.onStatsChange,
      this.renderMode,
      AppState.STABLE,
    );
    this.stateManager.voxels = voxels;
    this.meshLifecycle.drawSegmentedMesh(this.stateManager.voxels, this.voxelSpacing);
    this.onCountChange(this.stateManager.voxels.length);
    this.state = AppState.STABLE;
    this.onStateChange(this.state);
    this.cameraController.autofocus(this.stateManager.voxels);
    if (water !== undefined) this.waterManager.setup(this.sceneSetup.scene, water, this.sceneSetup.scene.fog !== null);
  }

  public rebuild(targetModel: VoxelData[], water?: SceneWater | null) {
    this.state = this.rebuildController.rebuild(
      this.sceneSetup, this.stateManager, this.meshLifecycle, this.physics,
      targetModel, water, this.wireframe, this.shadows, this.renderMode,
      this.onStateChange, this.onCountChange, this.onStatsChange,
      this.dismantle.bind(this), this.state
    );
  }

  private completeRebuild() {
    this.rebuildController.completeRebuild(
      this.sceneSetup, this.stateManager, this.meshLifecycle, this.waterManager,
      this.marchingResolution, this.marchingSmoothness, this.wireframe, this.shadows,
      this.renderMode, this.voxelSpacing, this.onStatsChange
    );
  }

  public dismantle(hitPoint?: THREE.Vector3) {
    if (this.state !== AppState.STABLE) return;
    console.log('[VoxelEngine] Dismantling model physics...', hitPoint ? `at (${hitPoint.x.toFixed(1)}, ${hitPoint.y.toFixed(1)}, ${hitPoint.z.toFixed(1)})` : 'global blast');
    this.state = AppState.DISMANTLING;
    this.onStateChange(this.state);
    this.physics.initDismantle(this.stateManager.voxels, this.stateManager.currentRawVoxelData, hitPoint);
    this.meshLifecycle.updateVisibility(this.stateManager.voxels.length, this.renderMode, this.state, this.onStatsChange);
  }

  public setupWater(water: SceneWater | null) {
    this.waterManager.setup(this.sceneSetup.scene, water, this.sceneSetup.scene.fog !== null);
  }

  public handleResize() { this.sceneSetup.handleResize(); }

  public cleanup() {
    console.log('[VoxelEngine] Cleaning up engine and scene resources.');
    this.disposed = true;
    if (this.animationId !== null) cancelAnimationFrame(this.animationId);
    this.inputHandler.dispose();
    this.meshLifecycle.dispose();
    this.waterManager.dispose(this.sceneSetup.scene);
    this.sceneSetup.dispose();
  }

  // ── Settings ──

  public setMarchingResolution(res: number) {
    this.marchingResolution = Math.max(8, Math.min(64, Math.round(res)));
    console.log(`[VoxelEngine] Marching Resolution set to ${this.marchingResolution}`);
    this.rebuildSmoothMesh();
  }

  public setMarchingSmoothness(s: number) {
    this.marchingSmoothness = Math.max(0, Math.min(1, s));
    console.log(`[VoxelEngine] Marching Smoothness set to ${this.marchingSmoothness}`);
    this.rebuildSmoothMesh();
  }

  public setRenderMode(mode: RenderMode) {
    console.log(`[VoxelEngine] Render mode set to ${mode}`);
    this.renderMode = mode;
    this.meshLifecycle.updateVisibility(
      this.stateManager.voxels.length, mode, this.state, this.onStatsChange
    );
  }

  private rebuildSmoothMesh() {
    const rawData = this.stateManager.getActiveVoxelData();
    this.meshLifecycle.buildSmoothMesh(
      this.sceneSetup.scene, rawData,
      this.marchingResolution, this.marchingSmoothness,
      this.wireframe, this.shadows
    );
    this.meshLifecycle.updateVisibility(
      this.stateManager.voxels.length, this.renderMode, this.state, this.onStatsChange
    );
  }

  public setVoxelDensity(density: number) {
    console.log(`[VoxelEngine] Voxel Density set to ${density}`);
    this.stateManager.setVoxelDensity(density, this.onCountChange);
  }

  // ── Delegate settings to SceneSetup & CameraController ──

  public setFog(enabled: boolean) { console.log(`[VoxelEngine] Fog set to ${enabled}`); this.sceneSetup.setFog(enabled); }
  public setGridFloor(enabled: boolean) { console.log(`[VoxelEngine] Grid floor set to ${enabled}`); this.sceneSetup.setGridFloor(enabled); }
  public setGroundPlane(enabled: boolean) { console.log(`[VoxelEngine] Ground plane set to ${enabled}`); this.sceneSetup.setGroundPlane(enabled); }
  public setShadows(enabled: boolean) { console.log(`[VoxelEngine] Shadows set to ${enabled}`); this.shadows = enabled; this.sceneSetup.setShadows(enabled); }
  public setWireframe(enabled: boolean) { console.log(`[VoxelEngine] Wireframe set to ${enabled}`); this.wireframe = enabled; this.meshLifecycle.setWireframe(enabled); }
  public setAutoRotate(enabled: boolean) { console.log(`[VoxelEngine] Auto-rotate set to ${enabled}`); this.cameraController.setAutoRotate(enabled); }
  public resetCamera() { this.cameraController.reset(); }
  public setTheme(theme: SceneTheme) { console.log(`[VoxelEngine] Theme set to ${theme}`); this.sceneSetup.setTheme(theme); }
  public setVoxelSpacing(spacing: number) {
    this.voxelSpacing = Math.max(1.0, Math.min(3.0, spacing));
    console.log(`[VoxelEngine] Voxel Spacing set to ${this.voxelSpacing}`);
    this.meshLifecycle.drawSegmentedMesh(this.stateManager.voxels, this.voxelSpacing);
  }

  public getJsonData(): string { return getJsonData(this.stateManager.voxels); }
  public getUniqueColors(): string[] { return getUniqueColors(this.stateManager.voxels); }

  // ── Animation loop ──

  private animate() {
    if (this.disposed) return;
    this.animationId = requestAnimationFrame(() => this.animate());
    const delta = this.clock.getDelta();

    this.waterManager.update(delta);
    this.splineAnimManager.update(delta, this.sceneSetup.scene);

    if (this.state === AppState.DISMANTLING) {
      const allSettled = this.physics.updateDismantle(this.stateManager.voxels, CONFIG);
      this.meshLifecycle.drawDynamicPhysics(this.stateManager.voxels);

      if (allSettled) {
        console.log('[VoxelEngine] Dismantle physics settled.');
        this.state = AppState.STABLE;
        this.onStateChange(this.state);
        this.meshLifecycle.updateVisibility(this.stateManager.voxels.length, this.renderMode, this.state, this.onStatsChange);
      }
    }

    if (this.state === AppState.REBUILDING) {
      const allDone = this.physics.updateRebuild(
        this.stateManager.voxels, this.stateManager.rebuildTargets, CONFIG
      );
      this.meshLifecycle.drawDynamicPhysics(this.stateManager.voxels);

      if (allDone) {
        console.log('[VoxelEngine] Rebuild physics animation complete.');
        this.state = AppState.STABLE;
        this.onStateChange(this.state);
        this.completeRebuild();
      }
    }

    this.sceneSetup.controls.update();
    this.sceneSetup.renderer.render(this.sceneSetup.scene, this.sceneSetup.camera);
    this.sceneSetup.renderGizmo(delta);
  }
}
