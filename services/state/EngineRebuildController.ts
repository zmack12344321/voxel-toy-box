/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppState, VoxelData, MeshStats, RenderMode, SceneWater } from '../../types';
import { SceneSetup } from '../SceneSetup';
import { VoxelStateManager } from '../state/VoxelStateManager';
import { MeshLifecycleManager } from '../meshing/MeshLifecycleManager';
import { VoxelPhysics } from '../physics/VoxelPhysics';
import type { EnvironmentRenderer } from '../environment/contracts';
import type { PhysicsConfig } from '../physics/VoxelPhysics';

export class EngineRebuildController {
  public constructor(private readonly physicsConfig: PhysicsConfig) {}

  public pendingRebuildTarget: VoxelData[] | null = null;
  public pendingRebuildWater: SceneWater | null = null;

  /** Invalidates an in-flight rebuild before a replacement scene is loaded. */
  public cancelPending(): void {
    this.pendingRebuildTarget = null;
    this.pendingRebuildWater = null;
  }

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

    const targetSnapshot = targetModel.map(voxel => ({ ...voxel }));
    this.pendingRebuildTarget = targetSnapshot;
    this.pendingRebuildWater = water ? {
      ...water,
      extent: [...water.extent] as [number, number],
    } : null;

    const { voxels, targets } = physics.initRebuild(
      stateManager.voxels, targetSnapshot, this.physicsConfig
    );
    stateManager.voxels = voxels;
    stateManager.rebuildTargets = targets;
    
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
    waterManager: EnvironmentRenderer,
    marchingResolution: number,
    marchingSmoothness: number,
    wireframe: boolean,
    shadows: boolean,
    renderMode: RenderMode,
    voxelSpacing: number,
    onStatsChange: (stats: MeshStats) => void,
    onCountChange: (count: number) => void,
  ): void {
    const targetModel = this.pendingRebuildTarget;
    const water = this.pendingRebuildWater;
    if (!targetModel) return;
    this.pendingRebuildTarget = null;
    this.pendingRebuildWater = null;

    console.log('[VoxelEngine] Rebuild animation complete. Finalizing meshes.');
    meshLifecycle.clearAll(sceneSetup.scene);
    stateManager.currentRawVoxelData = [...targetModel];
    const newVoxels = meshLifecycle.createAllMeshes(
      sceneSetup.scene, stateManager.getActiveVoxelData(),
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
    meshLifecycle.drawSegmentedMesh(stateManager.voxels, voxelSpacing);
    onCountChange(newVoxels.length);

    waterManager.setup(sceneSetup.scene, water, sceneSetup.scene.fog !== null);
  }
}
