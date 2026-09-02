import { AppState, MeshStats } from '../../types';
import { CONFIG } from '../../utils/voxelConstants';
import { MeshLifecycleManager } from '../meshing/MeshLifecycleManager';
import { PhysicsConfig, VoxelPhysics } from '../physics/VoxelPhysics';
import { VoxelStateManager } from '../state/VoxelStateManager';
import { RenderMode } from '../../types';

export interface SimulationContext {
  stateManager: VoxelStateManager;
  meshLifecycle: MeshLifecycleManager;
  physics: VoxelPhysics;
  renderMode: RenderMode;
  onStateChange: (state: AppState) => void;
  onStatsChange: (stats: MeshStats) => void;
  completeRebuild: () => void;
}

/** Advances physics animations and owns their state transitions. */
export class EngineSimulationController {
  public constructor(private readonly physicsConfig: PhysicsConfig = CONFIG) {}

  public update(state: AppState, context: SimulationContext): AppState {
    if (state === AppState.DISMANTLING) {
      const allSettled = context.physics.updateDismantle(context.stateManager.voxels, this.physicsConfig);
      context.meshLifecycle.drawDynamicPhysics(context.stateManager.voxels);
      if (allSettled) {
        context.onStateChange(AppState.STABLE);
        context.meshLifecycle.updateVisibility(
          context.stateManager.voxels.length, context.renderMode, AppState.STABLE, context.onStatsChange,
        );
        return AppState.STABLE;
      }
    }

    if (state === AppState.REBUILDING) {
      const allDone = context.physics.updateRebuild(
        context.stateManager.voxels, context.stateManager.rebuildTargets, this.physicsConfig,
      );
      context.meshLifecycle.drawDynamicPhysics(context.stateManager.voxels);
      if (allDone) {
        context.onStateChange(AppState.STABLE);
        context.completeRebuild();
        return AppState.STABLE;
      }
    }
    return state;
  }
}
