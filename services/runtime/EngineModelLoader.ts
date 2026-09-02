import { AppState } from '../../types';
import type { SceneWater, MeshStats, VoxelData, RenderMode } from '../../types';
import type { SceneSetup } from '../SceneSetup';
import type { VoxelStateManager } from '../state/VoxelStateManager';
import type { MeshLifecycleManager } from '../meshing/MeshLifecycleManager';
import type { CameraController } from '../camera/CameraController';
import type { SplineAnimationManager } from '../camera/SplineAnimationManager';
import type { EnvironmentRenderer } from '../environment/contracts';

export interface ModelLoadContext {
  sceneSetup: SceneSetup;
  stateManager: VoxelStateManager;
  meshLifecycle: MeshLifecycleManager;
  cameraController: CameraController;
  splineAnimationManager: SplineAnimationManager;
  waterManager: EnvironmentRenderer;
  renderMode: RenderMode;
  marchingResolution: number;
  marchingSmoothness: number;
  wireframe: boolean;
  shadows: boolean;
  voxelSpacing: number;
  onStateChange: (state: AppState) => void;
  onCountChange: (count: number) => void;
  onStatsChange: (stats: MeshStats) => void;
}

/** Builds the initial mesh set and synchronizes runtime state for a loaded model. */
export class EngineModelLoader {
  public load(data: VoxelData[], water: SceneWater | null | undefined, context: ModelLoadContext): void {
    context.splineAnimationManager.clear(context.sceneSetup.scene);
    context.stateManager.currentRawVoxelData = data.map(voxel => ({ ...voxel }));
    const activeData = context.stateManager.getActiveVoxelData();
    const voxels = context.meshLifecycle.createAllMeshes(
      context.sceneSetup.scene, activeData,
      {
        marchingRes: context.marchingResolution,
        marchingSmooth: context.marchingSmoothness,
        wireframe: context.wireframe,
        shadows: context.shadows,
      },
      context.onStatsChange,
      context.renderMode,
      AppState.STABLE,
    );
    context.stateManager.voxels = voxels;
    context.meshLifecycle.drawSegmentedMesh(voxels, context.voxelSpacing);
    context.onCountChange(voxels.length);
    context.onStateChange(AppState.STABLE);
    context.cameraController.autofocus(voxels);
    // A model load replaces the active scene payload. Clear any previous water
    // when the new payload does not declare an environment surface.
    context.waterManager.setup(
      context.sceneSetup.scene,
      water ?? null,
      context.sceneSetup.scene.fog !== null,
    );
  }
}
