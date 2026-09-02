/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { AppState, AnimatedEntity, ScenePayload, VoxelData, MeshStats, SceneTheme, RenderMode, SceneWater } from '../types';
import { SceneSetup } from './SceneSetup';
import { VoxelStateManager } from './state/VoxelStateManager';
import { MeshLifecycleManager } from './meshing/MeshLifecycleManager';
import { VoxelPhysics } from './physics/VoxelPhysics';
import { WaterManager } from './environment/WaterManager';
import { SplineAnimationManager } from './camera/SplineAnimationManager';
import { getJsonData, getUniqueColors } from './VoxelUtils';

import { CameraController } from './camera/CameraController';
import { EngineRebuildController } from './state/EngineRebuildController';
import { EngineFrameLoop } from './runtime/EngineFrameLoop';
import { EngineSimulationController } from './runtime/EngineSimulationController';
import { EngineRenderCoordinator } from './runtime/EngineRenderCoordinator';
import { AnimatedEntityRenderer } from './runtime/AnimatedEntityRenderer';
import { EngineModelLoader } from './runtime/EngineModelLoader';
import { EngineSettings } from './runtime/EngineSettings';
import type { SceneRuntime } from './application/contracts';
import { CONFIG } from '../utils/voxelConstants';

export class VoxelEngine implements SceneRuntime {
  private state = AppState.STABLE;

  // Managers
  private sceneSetup: SceneSetup;
  private stateManager: VoxelStateManager;
  private meshLifecycle: MeshLifecycleManager;
  private physics: VoxelPhysics;
  private waterManager: WaterManager;
  private rebuildController: EngineRebuildController;
  public cameraController: CameraController;
  public splineAnimManager: SplineAnimationManager;

  // Callbacks
  private onStateChange: (state: AppState) => void;
  private onCountChange: (count: number) => void;
  private onStatsChange: (stats: MeshStats) => void;

  // Settings cache
  private readonly settings = new EngineSettings();
  private readonly frameLoop = new EngineFrameLoop();
  private readonly simulationController = new EngineSimulationController(CONFIG);
  private readonly renderCoordinator = new EngineRenderCoordinator();
  private readonly animatedEntityRenderer = new AnimatedEntityRenderer();
  private readonly modelLoader = new EngineModelLoader();
  private readonly handleWindowResize = () => this.sceneSetup.handleResize();
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
    this.rebuildController = new EngineRebuildController(CONFIG);
    this.cameraController = new CameraController(this.sceneSetup.camera, this.sceneSetup.controls);
    this.splineAnimManager = new SplineAnimationManager();
    window.addEventListener('resize', this.handleWindowResize);
    this.frameLoop.start({ update: this.updateFrame.bind(this) });
  }

  // ── Public API ──

  public loadModel(data: VoxelData[], water?: SceneWater | null) {
    console.log(`[VoxelEngine] Loading model (${data.length} voxels)`);
    this.rebuildController.cancelPending();
    this.stateManager.rebuildTargets = [];
    this.modelLoader.load(data, water, {
      sceneSetup: this.sceneSetup,
      stateManager: this.stateManager,
      meshLifecycle: this.meshLifecycle,
      cameraController: this.cameraController,
      splineAnimationManager: this.splineAnimManager,
      waterManager: this.waterManager,
      renderMode: this.settings.renderMode,
      marchingResolution: this.settings.marchingResolution,
      marchingSmoothness: this.settings.marchingSmoothness,
      wireframe: this.settings.wireframe,
      shadows: this.settings.shadows,
      voxelSpacing: this.settings.voxelSpacing,
      onStateChange: this.onStateChange,
      onCountChange: this.onCountChange,
      onStatsChange: this.onStatsChange,
    });
    this.state = AppState.STABLE;
  }

  public loadScene(payload: ScenePayload) {
    this.loadModel(payload.data, payload.water);
    this.loadAnimatedEntities(payload.animatedEntities ?? []);
  }

  public loadAnimatedEntities(entities: AnimatedEntity[]) {
    this.animatedEntityRenderer.load(entities, this.sceneSetup.scene, this.splineAnimManager);
  }

  public rebuild(targetModel: VoxelData[], water?: SceneWater | null) {
    this.animatedEntityRenderer.clear(this.sceneSetup.scene, this.splineAnimManager);
    this.state = this.rebuildController.rebuild(
      this.sceneSetup, this.stateManager, this.meshLifecycle, this.physics,
      targetModel, water, this.settings.wireframe, this.settings.shadows, this.settings.renderMode,
      this.onStateChange, this.onCountChange, this.onStatsChange,
      this.dismantle.bind(this), this.state
    );
  }

  public rebuildScene(payload: ScenePayload) {
    this.rebuild(payload.data, payload.water);
    this.loadAnimatedEntities(payload.animatedEntities ?? []);
  }

  private completeRebuild() {
    this.rebuildController.completeRebuild(
      this.sceneSetup, this.stateManager, this.meshLifecycle, this.waterManager,
      this.settings.marchingResolution, this.settings.marchingSmoothness, this.settings.wireframe, this.settings.shadows,
      this.settings.renderMode, this.settings.voxelSpacing,
      this.onStatsChange, this.onCountChange
    );
  }

  public dismantle(hitPoint?: THREE.Vector3) {
    if (this.state !== AppState.STABLE) return;
    console.log('[VoxelEngine] Dismantling model physics...', hitPoint ? `at (${hitPoint.x.toFixed(1)}, ${hitPoint.y.toFixed(1)}, ${hitPoint.z.toFixed(1)})` : 'global blast');
    this.state = AppState.DISMANTLING;
    this.onStateChange(this.state);
    this.physics.initDismantle(this.stateManager.voxels, hitPoint);
    this.meshLifecycle.updateVisibility(this.stateManager.voxels.length, this.settings.renderMode, this.state, this.onStatsChange);
  }

  public handleResize() { this.sceneSetup.handleResize(); }

  public cleanup() {
    if (this.disposed) return;
    console.log('[VoxelEngine] Cleaning up engine and scene resources.');
    this.disposed = true;
    this.frameLoop.stop();
    window.removeEventListener('resize', this.handleWindowResize);
    this.splineAnimManager.clear(this.sceneSetup.scene);
    this.meshLifecycle.dispose();
    this.waterManager.dispose(this.sceneSetup.scene);
    this.sceneSetup.dispose();
  }

  // ── Settings ──

  public setMarchingResolution(res: number) {
    this.settings.setMarchingResolution(res);
    console.log(`[VoxelEngine] Marching Resolution set to ${this.settings.marchingResolution}`);
    this.rebuildSmoothMesh();
  }

  public setMarchingSmoothness(s: number) {
    this.settings.setMarchingSmoothness(s);
    console.log(`[VoxelEngine] Marching Smoothness set to ${this.settings.marchingSmoothness}`);
    this.rebuildSmoothMesh();
  }

  public setRenderMode(mode: RenderMode) {
    console.log(`[VoxelEngine] Render mode set to ${mode}`);
    this.settings.setRenderMode(mode);
    if (mode === RenderMode.SMOOTH_MARCHING && !this.meshLifecycle.smoothMesh) {
      this.rebuildSmoothMesh();
    }
    this.meshLifecycle.updateVisibility(
      this.stateManager.voxels.length, mode, this.state, this.onStatsChange
    );
  }

  private rebuildSmoothMesh() {
    const rawData = this.stateManager.getActiveVoxelData();
    this.meshLifecycle.buildSmoothMesh(
      this.sceneSetup.scene, rawData,
      this.settings.marchingResolution, this.settings.marchingSmoothness,
      this.settings.wireframe, this.settings.shadows
    );
    this.meshLifecycle.updateVisibility(
      this.stateManager.voxels.length, this.settings.renderMode, this.state, this.onStatsChange
    );
  }

  public setVoxelDensity(density: number) {
    console.log(`[VoxelEngine] Voxel Density set to ${density}`);
    this.stateManager.setVoxelDensity(density);
    if (this.state === AppState.STABLE) this.refreshStableMeshes();
  }

  private refreshStableMeshes() {
    const activeData = this.stateManager.getActiveVoxelData();
    const voxels = this.meshLifecycle.createAllMeshes(
      this.sceneSetup.scene,
      activeData,
      {
        marchingRes: this.settings.marchingResolution,
        marchingSmooth: this.settings.marchingSmoothness,
        wireframe: this.settings.wireframe,
        shadows: this.settings.shadows,
      },
      this.onStatsChange,
      this.settings.renderMode,
      AppState.STABLE,
    );
    this.stateManager.voxels = voxels;
    this.meshLifecycle.drawSegmentedMesh(voxels, this.settings.voxelSpacing);
    this.onCountChange(voxels.length);
  }

  // ── Delegate settings to SceneSetup & CameraController ──

  public setFog(enabled: boolean) {
    console.log(`[VoxelEngine] Fog set to ${enabled}`);
    this.sceneSetup.setFog(enabled);
    this.waterManager.setFog(enabled);
  }
  public setGridFloor(enabled: boolean) { console.log(`[VoxelEngine] Grid floor set to ${enabled}`); this.sceneSetup.setGridFloor(enabled); }
  public setGroundPlane(enabled: boolean) { console.log(`[VoxelEngine] Ground plane set to ${enabled}`); this.sceneSetup.setGroundPlane(enabled); }
  public setShadows(enabled: boolean) { console.log(`[VoxelEngine] Shadows set to ${enabled}`); this.settings.setShadows(enabled); this.sceneSetup.setShadows(enabled); }
  public setWireframe(enabled: boolean) { console.log(`[VoxelEngine] Wireframe set to ${enabled}`); this.settings.setWireframe(enabled); this.meshLifecycle.setWireframe(enabled); }
  public setAutoRotate(enabled: boolean) { console.log(`[VoxelEngine] Auto-rotate set to ${enabled}`); this.cameraController.setAutoRotate(enabled); }
  public resetCamera() { this.cameraController.reset(); }
  public setTheme(theme: SceneTheme) { console.log(`[VoxelEngine] Theme set to ${theme}`); this.sceneSetup.setTheme(theme); }
  public setVoxelSpacing(spacing: number) {
    this.settings.setVoxelSpacing(spacing);
    console.log(`[VoxelEngine] Voxel Spacing set to ${this.settings.voxelSpacing}`);
    this.meshLifecycle.drawSegmentedMesh(this.stateManager.voxels, this.settings.voxelSpacing);
  }

  public getJsonData(): string { return getJsonData(this.stateManager.voxels); }
  public getUniqueColors(): string[] { return getUniqueColors(this.stateManager.voxels); }

  // ── Animation loop ──

  private updateFrame(delta: number) {
    if (this.disposed) return;

    this.state = this.simulationController.update(this.state, {
      stateManager: this.stateManager,
      meshLifecycle: this.meshLifecycle,
      physics: this.physics,
      renderMode: this.settings.renderMode,
      onStateChange: this.onStateChange,
      onStatsChange: this.onStatsChange,
      completeRebuild: this.completeRebuild.bind(this),
    });

    this.renderCoordinator.render(delta, {
      sceneSetup: this.sceneSetup,
      waterManager: this.waterManager,
      splineAnimationManager: this.splineAnimManager,
    });
  }
}
