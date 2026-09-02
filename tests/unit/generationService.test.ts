import { describe, expect, it, vi } from 'vitest';
import { GenerationService } from '../../services/application/GenerationService';
import type { AnimatedEntity, VoxelData } from '../../types';

const voxels: VoxelData[] = [{ x: 0, y: 0, z: 0, color: 0xffffff }];

describe('GenerationService', () => {
  it('passes prompt context to the generator and loads created models', async () => {
    const generator = vi.fn().mockResolvedValue({ name: 'Tree', data: voxels, water: null });
    const target = { getUniqueColors: () => ['#123'], loadModel: vi.fn(), rebuild: vi.fn(), loadAnimatedEntities: vi.fn() };
    const service = new GenerationService(generator, target);

    const result = await service.generateAndApply({ prompt: 'tree', mode: 'create', detailLevel: 'detailed', currentVoxelCount: 12 });

    expect(generator).toHaveBeenCalledWith({ prompt: 'tree', mode: 'create', detailLevel: 'detailed', availableColors: ['#123'], currentVolumeEstimate: 12 });
    expect(target.loadModel).toHaveBeenCalledWith(voxels, null);
    expect(target.rebuild).not.toHaveBeenCalled();
    expect(result.name).toBe('Tree');
  });

  it('rebuilds morph results and loads animated entities', async () => {
    const entities: AnimatedEntity[] = [{
      id: 'bird',
      speed: 0.1,
      waypoints: [[0, 0, 0], [1, 1, 1]],
      voxels,
    }];
    const generator = vi.fn().mockResolvedValue({ name: 'Bird', data: voxels, water: { level: 2 }, animatedEntities: entities });
    const target = { getUniqueColors: () => [], loadModel: vi.fn(), rebuild: vi.fn(), loadAnimatedEntities: vi.fn() };
    const service = new GenerationService(generator, target);

    await service.generateAndApply({ prompt: 'bird', mode: 'morph', currentVoxelCount: 0 });

    expect(generator).toHaveBeenCalledWith(expect.objectContaining({ currentVolumeEstimate: 800, availableColors: [] }));
    expect(target.rebuild).toHaveBeenCalledWith(voxels, { level: 2 });
    expect(target.loadAnimatedEntities).toHaveBeenCalledWith(entities);
  });

  it('uses atomic scene application when the target supports it', async () => {
    const generator = vi.fn().mockResolvedValue({ name: 'Lake', data: voxels, water: null });
    const target = {
      getUniqueColors: () => [],
      loadModel: vi.fn(),
      rebuild: vi.fn(),
      loadAnimatedEntities: vi.fn(),
      loadScene: vi.fn(),
      rebuildScene: vi.fn(),
    };
    const service = new GenerationService(generator, target);

    await service.generateAndApply({ prompt: 'lake', mode: 'create', currentVoxelCount: 1 });

    expect(target.loadScene).toHaveBeenCalledWith({ data: voxels, water: null, animatedEntities: undefined });
    expect(target.loadModel).not.toHaveBeenCalled();
    expect(target.loadAnimatedEntities).not.toHaveBeenCalled();
  });
});
