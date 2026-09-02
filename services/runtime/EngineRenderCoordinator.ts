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
    context.waterManager.renderReflection?.();
    context.waterManager.renderRefraction?.();
    context.waterManager.renderCaustics?.();
    context.waterManager.renderSurface?.();
    context.splineAnimationManager.update(delta, context.sceneSetup.scene);
    context.sceneSetup.controls.update();
    context.sceneSetup.composer.render(delta);
    context.sceneSetup.renderGizmo(delta);
  }
}
