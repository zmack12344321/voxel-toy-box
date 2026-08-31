/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { AppState, VoxelData, MeshStats, SceneTheme, RenderMode, SceneWater } from '../types';
import { CONFIG } from '../utils/voxelConstants';
import { SceneSetup } from './SceneSetup';
import { VoxelStateManager } from './VoxelStateManager';
import { MeshLifecycleManager } from './MeshLifecycleManager';
import { VoxelPhysics } from './VoxelPhysics';
import { WaterManager } from './WaterManager';
import { InputHandler } from './InputHandler';
import { getJsonData, getUniqueColors } from './VoxelUtils';

export class VoxelEngine {
  private state = AppState.STABLE;

  // Managers
  private sceneSetup: SceneSetup;
  private stateManager: VoxelStateManager;
  private meshLifecycle: MeshLifecycleManager;
  private physics: VoxelPhysics;
  private waterManager: WaterManager;
  private inputHandler: InputHandler;

  // Callbacks
  private onStateChange: (state: AppState) => void;
  private onCountChange: (count: number) => void;
  private onStatsChange: (stats: MeshStats) => void;

  // Settings cache
  private renderMode: RenderMode = RenderMode.INDIVIDUAL_CUBES;
  private marchingResolution = 42;
  private marchingSmoothness = 0.35;
  private wireframe = false;
  private shadows = true;
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
    this.onCountChange(this.stateManager.voxels.length);
    this.state = AppState.STABLE;
    this.onStateChange(this.state);
    this.autofocusCamera();
    if (water !== undefined) this.waterManager.setup(this.sceneSetup.scene, water, this.sceneSetup.scene.fog !== null);
  }

  private autofocusCamera() {
    const voxels = this.stateManager.voxels;
    if (voxels.length === 0) return;

    let minY = Infinity, maxY = -Infinity;
    let maxRadiusSq = 0;

    voxels.forEach(v => {
      minY = Math.min(minY, v.y);
      maxY = Math.max(maxY, v.y);
      const rSq = v.x * v.x + v.z * v.z;
      maxRadiusSq = Math.max(maxRadiusSq, rSq);
    });

    const midY = (minY + maxY) / 2;
    const radius = Math.sqrt(maxRadiusSq);
    const height = maxY - minY;

    this.sceneSetup.controls.target.set(0, Math.max(2, midY), 0);
    const distance = Math.max(40, Math.max(radius * 2.2, height * 1.8) + 15);
    const angle = Math.PI / 5;
    this.sceneSetup.camera.position.set(
      Math.sin(angle) * distance * 0.8,
      midY + distance * 0.45,
      Math.cos(angle) * distance * 0.8
    );
    this.sceneSetup.controls.update();
  }

  public rebuild(targetModel: VoxelData[], water?: SceneWater | null) {
    console.log(`[VoxelEngine] Rebuilding into new shape (${targetModel.length} target voxels)`);
    if (this.state !== AppState.STABLE) {
      this.dismantle();
    }
    this.state = AppState.REBUILDING;
    this.onStateChange(this.state);

    // Store target data for when rebuild completes
    this.pendingRebuildTarget = targetModel;
    this.pendingRebuildWater = water;

    const { voxels, targets } = this.physics.initRebuild(
      this.stateManager.voxels, targetModel, CONFIG
    );
    this.stateManager.voxels = voxels;
    this.stateManager.rebuildTargets = targets;
    this.physics.rebuildStartTime = performance.now();
    
    // Ensure InstancedMesh capacity buffer is allocated to render all target voxels
    this.meshLifecycle.ensureDynamicPhysicsCapacity(
      this.sceneSetup.scene, voxels.length, this.wireframe, this.shadows
    );
    this.meshLifecycle.drawDynamicPhysics(this.stateManager.voxels);
    this.meshLifecycle.updateVisibility(this.stateManager.voxels.length, this.renderMode, this.state, this.onStatsChange);

    this.onCountChange(this.stateManager.voxels.length);
  }

  private completeRebuild() {
    const targetModel = this.pendingRebuildTarget;
    const water = this.pendingRebuildWater;
    if (!targetModel) return;
    this.pendingRebuildTarget = null;
    this.pendingRebuildWater = null;

    console.log('[VoxelEngine] Rebuild animation complete. Finalizing meshes.');
    // Now that morph animation is done, replace meshes with final target state
    this.meshLifecycle.clearAll(this.sceneSetup.scene);
    const newVoxels = this.meshLifecycle.createAllMeshes(
      this.sceneSetup.scene, targetModel,
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
    this.stateManager.voxels = newVoxels;
    this.stateManager.currentRawVoxelData = [...targetModel];

    if (water !== undefined) {
      this.waterManager.setup(this.sceneSetup.scene, water, this.sceneSetup.scene.fog !== null);
    }
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

  // ── Delegate settings to SceneSetup ──

  public setFog(enabled: boolean) { console.log(`[VoxelEngine] Fog set to ${enabled}`); this.sceneSetup.setFog(enabled); }
  public setGridFloor(enabled: boolean) { console.log(`[VoxelEngine] Grid floor set to ${enabled}`); this.sceneSetup.setGridFloor(enabled); }
  public setGroundPlane(enabled: boolean) { console.log(`[VoxelEngine] Ground plane set to ${enabled}`); this.sceneSetup.setGroundPlane(enabled); }
  public setShadows(enabled: boolean) { console.log(`[VoxelEngine] Shadows set to ${enabled}`); this.shadows = enabled; this.sceneSetup.setShadows(enabled); }
  public setWireframe(enabled: boolean) { console.log(`[VoxelEngine] Wireframe set to ${enabled}`); this.wireframe = enabled; this.meshLifecycle.setWireframe(enabled); }
  public setAutoRotate(enabled: boolean) { console.log(`[VoxelEngine] Auto-rotate set to ${enabled}`); this.sceneSetup.setAutoRotate(enabled); }

  public setCameraDistance(distance: number) {
    this.sceneSetup.camera.position.setLength(distance);
  }

  public setCameraAngle(phi: number, theta: number) {
    const r = this.sceneSetup.camera.position.length();
    this.sceneSetup.camera.position.set(
      r * Math.sin(theta) * Math.cos(phi),
      r * Math.sin(theta) * Math.sin(phi),
      r * Math.cos(theta)
    );
  }

  public resetCamera() {
    console.log('[VoxelEngine] Resetting camera view.');
    this.sceneSetup.camera.position.set(32, 28, 55);
    this.sceneSetup.controls.target.set(0, 8, 0);
    this.sceneSetup.controls.update();
  }

  public setTheme(theme: SceneTheme) { console.log(`[VoxelEngine] Theme set to ${theme}`); this.sceneSetup.setTheme(theme); }

  public getJsonData(): string { return getJsonData(this.stateManager.voxels); }
  public getUniqueColors(): string[] { return getUniqueColors(this.stateManager.voxels); }

  // ── Animation loop ──

  private animate() {
    if (this.disposed) return;
    this.animationId = requestAnimationFrame(() => this.animate());
    const delta = this.clock.getDelta();

    this.waterManager.update(delta);

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
