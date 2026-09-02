import { describe, expect, it, vi } from 'vitest';
import { SceneController } from '../../services/application/SceneController';
import type { SceneRuntime } from '../../services/application/contracts';
import type { DeclarativeModelPayload } from '../../models/declarativeTypes';
import type { VoxelData } from '../../types';

const voxels: VoxelData[] = [{ x: 1, y: 2, z: 3, color: 0xffffff }];
const payload = { commands: [] } as DeclarativeModelPayload;

function runtimeMock(): SceneRuntime & Record<string, ReturnType<typeof vi.fn>> {
  return {
    loadModel: vi.fn(),
    rebuild: vi.fn(),
    loadAnimatedEntities: vi.fn(),
    dismantle: vi.fn(),
    handleResize: vi.fn(),
    resetCamera: vi.fn(),
    cleanup: vi.fn(),
    getJsonData: vi.fn(() => '[{}]'),
    getUniqueColors: vi.fn(() => ['#fff']),
    setAutoRotate: vi.fn(), setFog: vi.fn(), setGridFloor: vi.fn(), setGroundPlane: vi.fn(), setShadows: vi.fn(), setWireframe: vi.fn(), setTheme: vi.fn(), setRenderMode: vi.fn(), setMarchingSmoothness: vi.fn(), setMarchingResolution: vi.fn(), setVoxelDensity: vi.fn(), setVoxelSpacing: vi.fn(),
  };
}

describe('SceneController', () => {
  it('is safe to use before a runtime is attached', () => {
    const controller = new SceneController();

    expect(() => controller.loadModel(voxels)).not.toThrow();
    expect(() => controller.loadDeclarativePayload(payload)).not.toThrow();
    expect(() => controller.rebuild(voxels)).not.toThrow();
    expect(() => controller.loadAnimatedEntities([])).not.toThrow();
    expect(() => controller.dismantle()).not.toThrow();
    expect(() => controller.handleResize()).not.toThrow();
    expect(() => controller.resetCamera()).not.toThrow();
    expect(() => controller.cleanup()).not.toThrow();
  });

  it('delegates supported operations to the attached runtime', () => {
    const runtime = runtimeMock();
    const controller = new SceneController();
    controller.attach(runtime);

    controller.loadModel(voxels);
    controller.loadDeclarativePayload(payload);
    controller.rebuildDeclarativePayload(payload);
    controller.rebuild(voxels, null);
    controller.loadAnimatedEntities([]);
    controller.dismantle();
    controller.handleResize();
    controller.resetCamera();
    controller.cleanup();

    expect(runtime.loadModel).toHaveBeenCalledWith(voxels);
    expect(runtime.loadModel).toHaveBeenCalledWith([], null);
    expect(runtime.loadAnimatedEntities).toHaveBeenCalledWith([]);
    expect(runtime.rebuild).toHaveBeenCalledWith(voxels, null);
    expect(runtime.rebuild).toHaveBeenCalledWith([], null);
    expect(runtime.loadAnimatedEntities).toHaveBeenCalledWith([]);
    expect(runtime.dismantle).toHaveBeenCalledWith();
    expect(runtime.handleResize).toHaveBeenCalledWith();
    expect(runtime.resetCamera).toHaveBeenCalledWith();
    expect(runtime.cleanup).toHaveBeenCalledWith();
  });

  it('compiles declarative payloads before calling the runtime', () => {
    const runtime = runtimeMock();
    const controller = new SceneController(runtime);
    controller.loadDeclarativePayload({
      commands: [{ op: 'box', at: [0, 0, 0], size: [1, 1, 1], color: '#ff0000' }],
    });
    const loaded = (runtime.loadModel as ReturnType<typeof vi.fn>).mock.calls[0][0] as VoxelData[];
    expect(loaded.length).toBeGreaterThan(0);
    expect(loaded.every(voxel => voxel.color === 0xff0000)).toBe(true);
    expect(runtime.loadAnimatedEntities).toHaveBeenCalledWith([]);
  });

  it('compiles canonical scene specs before calling the runtime', () => {
    const runtime = runtimeMock();
    const controller = new SceneController(runtime);
    controller.loadSceneSpec({
      model: {
        commands: [{ op: 'box', at: [0, 0, 0], size: [1, 1, 1], color: '#ff0000' }],
      },
    });
    const loaded = (runtime.loadModel as ReturnType<typeof vi.fn>).mock.calls[0][0] as VoxelData[];
    expect(loaded.length).toBeGreaterThan(0);
    expect(runtime.loadAnimatedEntities).toHaveBeenCalledWith([]);
  });

  it('detaches the runtime and becomes safe again', () => {
    const runtime = runtimeMock();
    const controller = new SceneController(runtime);

    controller.detach();
    controller.loadModel(voxels);

    expect(runtime.loadModel).not.toHaveBeenCalled();
  });

  it('cleans up a previous runtime when replaced', () => {
    const first = runtimeMock();
    const second = runtimeMock();
    const controller = new SceneController(first);
    controller.attach(second);
    expect(first.cleanup).toHaveBeenCalledOnce();
    expect(second.cleanup).not.toHaveBeenCalled();
  });

  it('returns safe query results and delegates them', () => {
    const empty = new SceneController();
    expect(empty.getJsonData()).toBe('');
    expect(empty.getUniqueColors()).toEqual([]);
    const runtime = runtimeMock();
    const controller = new SceneController(runtime);
    expect(controller.getJsonData()).toBe('[{}]');
    expect(controller.getUniqueColors()).toEqual(['#fff']);
  });

  it('forwards setting changes and preserves explicit water arguments', () => {
    const runtime = runtimeMock();
    const controller = new SceneController(runtime);
    controller.setFog(true);
    controller.loadModel(voxels, undefined);
    controller.loadModel(voxels, null);
    expect(runtime.setFog).toHaveBeenCalledWith(true);
    expect(runtime.loadModel).toHaveBeenNthCalledWith(1, voxels);
    expect(runtime.loadModel).toHaveBeenNthCalledWith(2, voxels, null);
  });
});
