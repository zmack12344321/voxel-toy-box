/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { AppState, VoxelData, MeshStats, RenderMode, SceneWater } from '../../types';
import { CONFIG } from '../../utils/voxelConstants';
import { SceneSetup } from '../SceneSetup';
import { VoxelStateManager } from '../state/VoxelStateManager';
import { MeshLifecycleManager } from '../meshing/MeshLifecycleManager';
import { VoxelPhysics } from '../physics/VoxelPhysics';

export class EngineRebuildController {
  public pendingRebuildTarget: VoxelData[] | null = null;
  public pendingRebuildWater: SceneWater | null | undefined = undefined;

  public rebuild(
    sceneSetup: SceneSetup,
    stateManager: VoxelStateManager,
    meshLifecycle: MeshLifecycleManager,
    physics: VoxelPhysics,
    targetModel: VoxelData[],
    water: SceneWater | null | undefined,
    wireframe: boolean,
    shadows: boolean,
    renderMode: RenderMode,
    onStateChange: (state: AppState) => void,
    onCountChange: (count: number) => void,
    onStatsChange: (stats: MeshStats) => void,
    dismantleFn: () => void,
    currentState: AppState
  ): AppState {
    console.log(`[VoxelEngine] Rebuilding into new shape (${targetModel.length} target voxels)`);
    if (currentState !== AppState.STABLE) {
      dismantleFn();
    }
    const nextState = AppState.REBUILDING;
    onStateChange(nextState);

    this.pendingRebuildTarget = targetModel;
    this.pendingRebuildWater = water;

    const { voxels, targets } = physics.initRebuild(
      stateManager.voxels, targetModel, CONFIG
    );
    stateManager.voxels = voxels;
    stateManager.rebuildTargets = targets;
    physics.rebuildStartTime = performance.now();
    
    meshLifecycle.ensureDynamicPhysicsCapacity(
      sceneSetup.scene, voxels.length, wireframe, shadows
    );
    meshLifecycle.drawDynamicPhysics(stateManager.voxels);
    meshLifecycle.updateVisibility(stateManager.voxels.length, renderMode, nextState, onStatsChange);
    onCountChange(stateManager.voxels.length);

    return nextState;
  }

  public completeRebuild(
    sceneSetup: SceneSetup,
    stateManager: VoxelStateManager,
    meshLifecycle: MeshLifecycleManager,
    waterManager: { setup: (scene: THREE.Scene, water: SceneWater | null, fog: boolean) => void },
    marchingResolution: number,
    marchingSmoothness: number,
    wireframe: boolean,
    shadows: boolean,
    renderMode: RenderMode,
    voxelSpacing: number,
    onStatsChange: (stats: MeshStats) => void
  ): void {
    const targetModel = this.pendingRebuildTarget;
    const water = this.pendingRebuildWater;
    if (!targetModel) return;
    this.pendingRebuildTarget = null;
    this.pendingRebuildWater = null;

    console.log('[VoxelEngine] Rebuild animation complete. Finalizing meshes.');
    meshLifecycle.clearAll(sceneSetup.scene);
    const newVoxels = meshLifecycle.createAllMeshes(
      sceneSetup.scene, targetModel,
      {
        marchingRes: marchingResolution,
        marchingSmooth: marchingSmoothness,
        wireframe,
        shadows,
      },
      onStatsChange,
      renderMode,
      AppState.STABLE,
    );
    stateManager.voxels = newVoxels;
    stateManager.currentRawVoxelData = [...targetModel];
    meshLifecycle.drawSegmentedMesh(stateManager.voxels, voxelSpacing);

    if (water !== undefined) {
      waterManager.setup(sceneSetup.scene, water, sceneSetup.scene.fog !== null);
    }
  }
}
