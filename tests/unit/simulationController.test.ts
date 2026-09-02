import { describe, expect, it, vi } from 'vitest';
import { AppState, RenderMode } from '../../types';
import { EngineSimulationController, SimulationContext } from '../../services/runtime/EngineSimulationController';

function context(overrides: Record<string, unknown> = {}) {
  const stateManager = { voxels: [], rebuildTargets: [] };
  return {
    stateManager,
    meshLifecycle: { drawDynamicPhysics: vi.fn(), updateVisibility: vi.fn() },
    physics: { updateDismantle: vi.fn(() => false), updateRebuild: vi.fn(() => false) },
    renderMode: RenderMode.INDIVIDUAL_CUBES,
    onStateChange: vi.fn(),
    onStatsChange: vi.fn(),
    completeRebuild: vi.fn(),
    ...overrides,
  } as unknown as SimulationContext;
}

describe('EngineSimulationController', () => {
  it('settles dismantling and restores stable visibility', () => {
    const ctx = context({ physics: { updateDismantle: vi.fn(() => true), updateRebuild: vi.fn() } });
    const next = new EngineSimulationController().update(AppState.DISMANTLING, ctx);
    expect(next).toBe(AppState.STABLE);
    expect(ctx.onStateChange).toHaveBeenCalledWith(AppState.STABLE);
    expect(ctx.meshLifecycle.updateVisibility).toHaveBeenCalled();
  });

  it('completes rebuilding through the supplied finalizer', () => {
    const ctx = context({ physics: { updateDismantle: vi.fn(), updateRebuild: vi.fn(() => true) } });
    const next = new EngineSimulationController().update(AppState.REBUILDING, ctx);
    expect(next).toBe(AppState.STABLE);
    expect(ctx.completeRebuild).toHaveBeenCalledOnce();
  });

  it('leaves stable state untouched', () => {
    const ctx = context();
    expect(new EngineSimulationController().update(AppState.STABLE, ctx)).toBe(AppState.STABLE);
    expect(ctx.meshLifecycle.drawDynamicPhysics).not.toHaveBeenCalled();
  });
});
