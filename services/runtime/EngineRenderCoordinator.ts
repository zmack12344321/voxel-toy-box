import type * as THREE from 'three';
import type { SceneSetup } from '../SceneSetup';
import type { EnvironmentRenderer } from '../environment/contracts';
import type { SplineAnimationManager } from '../camera/SplineAnimationManager';

export interface RenderContext {
  sceneSetup: SceneSetup;
  waterManager: EnvironmentRenderer;
  splineAnimationManager: SplineAnimationManager;
}

/** Advances environment/animation visuals and submits the frame to Three.js. */
export class EngineRenderCoordinator {
  public render(delta: number, context: RenderContext): void {
    context.waterManager.update(delta);
    context.splineAnimationManager.update(delta, context.sceneSetup.scene);
    context.sceneSetup.controls.update();
    context.sceneSetup.renderer.render(context.sceneSetup.scene, context.sceneSetup.camera);
    context.sceneSetup.renderGizmo(delta);
  }
}
